import React, { Component } from 'react';
import Editor from './components/editor.js';
import MarkdownLine from './components/markdown-line.js';
import * as removeMd from 'remove-markdown';
import './App.css';

class App extends Component {
  constructor(props) {
    super();

    this.state = {
      selectedLine: null,
      markdown: [
        "# <span>This is some big text</span>",
        "..and this is some little text"
      ],
      cursor: [0, 0]
    };

    this.onMarkdownChange = this.onMarkdownChange.bind(this);
  }

  selectLine(e, number) {
    this.setState({
      selectedLine: number
    });
  }

  onMarkdownChange(number, md) {
    this.setState({
      markdown: this.state.markdown.map((line, lineNumber) => {
        return (lineNumber === number)
          ? md
          : line;
      })
    });
  }

  handleKeyPress(e) {
    console.log('key press: ', e.key);
  }

  render() {
    const renderedMarkdown = this.state.markdown.map((line, lineNumber) => {
      if (lineNumber === this.state.selectedLine) {
        return (
          <Editor 
            key={lineNumber} 
            value={line}
            onChange={md => this.onMarkdownChange(lineNumber, md)}
          />
        );
      } else {
        return (
          <MarkdownLine
            key={lineNumber}
            source={line}
            onClick={e => this.selectLine(e, lineNumber)}

          />
        );
      }
    });

    return (
      <div className="App" onKeyPress={this.handleKeyPress}>
        <div className="editor-pane">
          {renderedMarkdown}
        </div>
      </div>
    );
  }
}

export default App;
