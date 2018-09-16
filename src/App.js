import React, { Component } from 'react';
import MdEditor from './components/Editor/editor.js';
import './App.css';
import 'draft-js/dist/Draft.css';

class App extends Component {
  render() {
    return (
      <div id="container">
        <MdEditor />
      </div>
    );
  }
}

export default App;
