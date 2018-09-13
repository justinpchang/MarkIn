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
    title: '(unsaved) MarkIn',
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
            openFile();
          }
        },
        {role: 'separator'},
        {
          label: 'Save File',
          accelerator: 'CmdOrCtrl+S',
          click() {
            mainWindow.webContents.send('save', {});
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
    app.quit();
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
  if (documentTitle) {
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
  console.log(fileContent);
}

function setTitle(title) {
  documentTitle = title;
  mainWindow.setTitle(documentTitle);
}
