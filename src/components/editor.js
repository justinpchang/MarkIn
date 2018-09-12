import React, { Component } from 'react';
import CodeMirror from '@skidding/react-codemirror';

require('codemirror/lib/codemirror.css');
require('codemirror/mode/markdown/markdown');
require('codemirror/theme/monokai.css');
require('codemirror/keymap/vim.js');

class Editor extends Component {
  constructor(props) {
    super(props);

    this.updateCode = this.updateCode.bind(this);
  }

  updateCode(e) {
    this.props.onChange(e);
  }

  render() {
    var options = {
      mode: 'markdown',
      theme: 'monokai'
    }
    return (
      <CodeMirror
        value={this.props.value}
        options={options}
        height="100%"
        onChange = {this.updateCode}
      />
    );
  }
}

export default Editor;
