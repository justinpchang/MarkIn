import React, { Component } from 'react';
import { EditorState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createMarkdownPlugin from 'draft-js-markdown-plugin';

export default class MyEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      plugins: [createMarkdownPlugin()]
    };
    this.onChange = (editorState) => this.setState({editorState});
  }

  render() {
    return (
      <Editor editorState={this.state.editorState} onChange={this.onChange} plugins={this.state.plugins} />
    );
  }
}
