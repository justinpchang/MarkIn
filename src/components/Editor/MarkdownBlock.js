import React, { Component } from 'react';
import { EditorBlock } from 'draft-js';

class MarkdownBlock extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="md-block">
        <EditorBlock />
      </div>
    );
  }
}

export default MarkdownBlock;
