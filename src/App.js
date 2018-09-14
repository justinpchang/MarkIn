import React, { Component } from 'react';
import MyEditor from './components/editor.js';
import './App.css';
import 'draft-js/dist/Draft.css';

class App extends Component {
  render() {
    return (
      <div>
        <MyEditor />
      </div>
    );
  }
}

export default App;
