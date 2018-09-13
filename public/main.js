'use strict';

const { electron, app, BrowserWindow, dialog, Menu, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const fs = require('fs');
//const { App } = require('../src/App.js');

let mainWindow;
let documentTitle;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    icon: path.join(__dirname, 'icon.png'),
    title: '(unsaved) Untitled.md',
    darkTheme: true
  });
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);

  app.setAboutPanelOptions({
    applicationName: "MarkIn",
    applicationVersion: "0.0.1"
  });

  mainWindow.on('closed', () => mainWindow = null);

  const template = [
    {

      label: 'Menu',
      submenu: [
        // Preferences, etc.
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click() {
            alert('New file created');
          }
        },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click() {
            openFileHandler();
          }
        },
        {role: 'separator'},
        {
          label: 'Save File',
          accelerator: 'CmdOrCtrl+S',
          click() {
            mainWindow.webContents.send('save', { as: false });
          }
        },
        {
          label: 'Save File As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click() {
            mainWindow.webContents.send('save', { as: true });
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'pasteandmatchstyle'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click () { require('electron').shell.openExternal('https://electronjs.org') }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (documentTitle && documentTitle.split(' ')[0] === '(saved)') {
      app.quit();
    } else {
      promptSaveBeforeClosing();
    }
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('save', (event, data) => {
  saveFile(data);
});

ipcMain.on('documentHasBeenChanged', (event, data) => {
  if(documentTitle) setTitle(`(unsaved) ${documentTitle.replace('(saved) ', '').replace('(unsaved) ', '')}`);
});

function saveFile(data) {
  if (documentTitle && !data.as) {
    const filename = documentTitle.replace('(saved) ', '').replace('(unsaved) ', '');
    setTitle(`(saved) ${filename}`);
    fs.writeFileSync(filename, data.msg);
    mainWindow.webContents.send('saved', {});
  } else {
    dialog.showSaveDialog(mainWindow, {
      properties: ['openFile'],
      title: documentTitle || 'Untitled',
      filters: [{
        name: 'Markdown',
        extensions: [
          'md'
        ]
      }]
    }, (filename) => {
      setTitle(`(saved) ${filename}`);
      fs.writeFileSync(filename, data.msg);
      mainWindow.webContents.send('saved', {});
    });
  }
}

function openFileHandler() {
  /*
   * If current document is saved, open new file.
   * If current document is unsaved, prompt for save.
   */
  const file = openFile();
  if (documentTitle && documentTitle.split(' ')[0] === '(saved)') {
    loadNewFile(file);
  } else {
    promptSaveBeforeOpening(file);
  }
}

function promptSaveBeforeOpening(file) {
  dialog.showMessageBox(mainWindow, {
    message: `${(documentTitle ? documentTitle.split('/')[documentTitle.split('/').length-1] : 'Untitled.md')} has changes, do you want to save them?`,
    detail: 'Your changes will be lost if you close this item without saving.',
    buttons: [
      'Save',
      'Cancel',
      'Don\'t Save'
    ]
  }, (response) => {
    switch (response) {
      case 0:
        mainWindow.webContents.send('save', { as: !documentTitle });
        loadNewFile(file);
        break;
      case 2:
        loadNewFile(file);
        break;
    }
    return;
  });
}

function promptSaveBeforeClosing() {
  dialog.showMessageBox(mainWindow, {
    message: `${(documentTitle ? documentTitle.split('/')[documentTitle.split('/').length-1] : 'Untitled.md')} has changes, do you want to save them?`,
    detail: 'Your changes will be lost if you close this item without saving.',
    buttons: [
      'Save',
      'Cancel',
      'Don\'t Save'
    ]
  }, (response) => {
    switch (response) {
      case 0:
        mainWindow.webContents.send('save', { as: !documentTitle });
        app.quit();
        break;
      case 2:
        app.quit();
        break;
    }
    return;
  });
}

function loadNewFile(file) {
  setTitle(`(saved) ${file[0]}`);
  mainWindow.webContents.send('load', { data: file[1] });
}

function openFile() {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{
      name: 'Markdown',
      extensions: [
        'md',
        'markdown',
        'txt'
      ]
    }]
  });
  if (!files) return;
  const file = files[0];
  const fileContent = fs.readFileSync(file).toString();
  return [file, fileContent];
}

function setTitle(title) {
  documentTitle = title;
  mainWindow.setTitle(documentTitle);
}
