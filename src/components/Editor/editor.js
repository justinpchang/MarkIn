import React, { Component } from 'react';
import { convertFromRaw, EditorState, ContentState, SelectionState, Modifier, ContentBlock, CharacterMetadata, genKey, DefaultDraftBlockRenderMap } from 'draft-js';
import { List, Map, Repeat } from 'immutable';
import Editor from 'draft-js-plugins-editor';
import { stateToMarkdown } from 'draft-js-export-markdown';
import { stateFromMarkdown } from 'draft-js-import-markdown';
import createMarkdownPlugin from 'draft-js-markdown-plugin';
import { mdToDraftjs } from 'draftjs-md-converter';
const { MarkdownBlock } = require('./MarkdownBlock.js');

const { ipcRenderer } = window.require('electron');

export default class MdEditor extends Component {
  constructor(props) {
    super(props);
     
    this.state = {
      editorState: EditorState.createEmpty(),
      markdown: [],
      lastBlockIndex: 0,
      //plugins: [createMarkdownPlugin()],
      saved: false
    };

    this.setDomEditorRef = ref => this.domEditor = ref;

    // Create render map
    this.RenderMap = new Map({
      MarkdownBlock: {
        element: 'div'
      }
    }).merge(DefaultDraftBlockRenderMap);
    this.extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(this.RenderMap);

    // Helper function to modify markdown state array
    this.editMarkdown = (lineNumber, content) => {
      const { markdown } = this.state;
      if (lineNumber >= markdown.length) {
        markdown.push(content);
      } else {
        markdown[lineNumber] = content;
      }
      this.setState({
        markdown
      });
    }

    // Helper function for retrieving markdown
    this.markdown = (index) => {
      if (index >= this.state.markdown.length) {
        return '';
      }
      return this.state.markdown[index];
    }
     
    this.onChange = (editorState) => {
      // Check if document needs to update save status
      if (editorState.getCurrentContent() !== this.state.editorState.getCurrentContent()) {
        this.setState({
          saved: false
        });
        ipcRenderer.send('documentHasBeenChanged', {});
      }

      // Get markdown text of current line
      const currentBlockKey = editorState.getSelection().getStartKey();
      const currentBlockIndex = editorState.getCurrentContent().getBlockMap()
        .keySeq().findIndex(k => k === currentBlockKey);
      let blocksArray = editorState.getCurrentContent().getBlocksAsArray();
      const markdownText = (currentBlockIndex !== this.state.lastBlockIndex) ? this.markdown(currentBlockIndex) : blocksArray[currentBlockIndex].getText();
      this.editMarkdown(currentBlockIndex, markdownText);
      console.log(this.state.markdown.join('\n'));
      console.log('md:', JSON.stringify(markdownText));

      // Get current cursor position on line
      const cursorText = blocksArray[currentBlockIndex].getText()
      const cursorStartOffset = editorState.getSelection().getStartOffset();
      const cursorEndOffset = editorState.getSelection().getEndOffset();

      // Create new content block
      const newContentBlock = new ContentBlock({
        key: genKey(),
        type: 'MarkdownBlock',
        characterList: new List(Repeat(CharacterMetadata.create(), markdownText.length)),
        text: markdownText
      });
      
      // Add new content block to blocks array
      blocksArray[currentBlockIndex] = newContentBlock;

      // Render all other blocks correctly
      const newBlocksArray = blocksArray.map((block, index) => {
        if (index === currentBlockIndex) {
          return newContentBlock;
        } else {
          return convertFromRaw(mdToDraftjs(this.markdown(index))).getBlocksAsArray()[0];
        }
      });

      // Create new contentState
      const newContentState = ContentState.createFromBlockArray(newBlocksArray);

      // Create new editor state
      let newEditorState = EditorState.createWithContent(newContentState);

      // Create new selection
      const oldSelectionState = editorState.getSelection();
      const newSelectionState = SelectionState.createEmpty(newContentBlock.getKey()).merge({
        focusOffset: oldSelectionState.focusOffset,
        anchorOffset: oldSelectionState.anchorOffset
      });

      newEditorState = EditorState.forceSelection(newEditorState, newSelectionState);

      // Update editor state
      this.setState({
        editorState: newEditorState,
        lastBlockIndex: currentBlockIndex
      });
    }

    ipcRenderer.on('save', (event, data) => {
      ipcRenderer.send('save', { 
        msg: stateToMarkdown(this.state.editorState.getCurrentContent()),
        as: data.as
      });
    });

    ipcRenderer.on('saved', (event, data) => {
      this.setState({ saved: true });
    });

    ipcRenderer.on('load', (event, data) => {
      this.setState({
        editorState: EditorState.createWithContent(stateFromMarkdown(data.data)),
        saved: true
      });
    });
  }

  blockRendererFn(contentBlock) {
    const type = contentBlock.getType();
    if (type === 'MarkdownBlock') {
      return {
        component: MarkdownBlock,
        props: {}
      }
    }
  }

  componentDidMount(){
    this.domEditor.focus()
  }

  render() {
    const { editorState } = this.state;

    return (
      <div className="md-editor">
        <Editor 
          placeholder="Hello world!"
          editorState={this.state.editorState}
          onChange={this.onChange}
          plugins={this.state.plugins}
          ref={this.setDomEditorRef}
          //blockRenderMap={this.extendedBlockRenderMap}
          //blockRenderer={this.blockRendererFn}
        />
      </div>
    );
  }
}
