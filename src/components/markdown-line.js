import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';

class MarkdownLine extends Component {
  constructor(props) {
    super(props);

    this.clickHandler = this.clickHandler.bind(this);
  }

  clickHandler(e) {
    alert('no handler set');
  }

  render() {
    return (
      <div onClick={this.props.onClick || this.clickHandler}>
        <ReactMarkdown className={this.props.className} source={this.props.source} />
      </div>
    );
  }
}

export default MarkdownLine;
