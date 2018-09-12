import React, { Component } from 'react';
import Frame from './components/Frame/Frame.jsx';
import './App.css';

const frameStyle = {
  width: '99vw',
  height: '99vh',
  border: 'none',
  padding: '0px',
  margin: '0px'
}

class App extends Component {
  render() {
    return (
      <div>
        <Frame style={frameStyle} head={
          <style>{'[contenteditable]:focus { outline: none; }'}</style>
        }>
          <h1>This is some text</h1>
          <p>This is some small text</p>
          <p></p>
        </Frame>
      </div>
    );
  }
}

export default App;
