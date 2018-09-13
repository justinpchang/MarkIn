import React, { Component } from 'react';
import { EditorState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import { stateToMarkdown } from 'draft-js-export-markdown';
import createMarkdownPlugin from 'draft-js-markdown-plugin';

const { ipcRenderer } = window.require('electron');

export default class MyEditor extends Component {
  constructor(props) {
    super(props);
     
    this.state = {
      editorState: EditorState.createEmpty(),
      plugins: [createMarkdownPlugin()],
      saved: false
    };
     
    this.onChange = (editorState) => {
      if (editorState.getCurrentContent() !== this.state.editorState.getCurrentContent()) {
        this.setState({
          saved: false
        });
        ipcRenderer.send('documentHasBeenChanged', {});
      }
      this.setState({
        editorState
      });
    }

    this.setWindowTitle = this.setWindowTitle.bind(this);

    ipcRenderer.on('save', (event, data) => {
      ipcRenderer.send('save', { 
        msg: stateToMarkdown(this.state.editorState.getCurrentContent()),
        as: data.as
      });
    });

    ipcRenderer.on('saved', (event, data) => {
      this.setState({ saved: true });
    });
  }

  setWindowTitle(title) {
    ipcRenderer.send('title', { msg: title });
  }

  render() {
    return (
      <Editor editorState={this.state.editorState} onChange={this.onChange} plugins={this.state.plugins} />
    );
  }
}
