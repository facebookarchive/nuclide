'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileChangeState} from './types';

var {CompositeDisposable} = require('atom');
var React = require('react-for-atom');
var {PropTypes} = React;
var DiffViewEditorPane = require('./DiffViewEditorPane');
var {assign} = require('nuclide-commons').object;

class DiffViewComponent extends React.Component {
  _subscriptions: ?CompositeDisposable;

  _boundHandleNewOffsets: Function;
  _boundUpdateLineDiffState: Function;

  constructor(props: Object) {
    super(props);
    var oldEditorState = {
      text: '',
      offsets: {},
      highlightedLines: {
        added: [],
        removed: [],
      },
      inlineElements: [],
    };
    var newEditorState = {
      text: '',
      offsets: {},
      highlightedLines: {
        added: [],
        removed: [],
      },
      inlineElements: [],
    };
    this.state = {
      filePath: props.initialFilePath,
      oldEditorState,
      newEditorState,
    };
    this._boundHandleNewOffsets = this._handleNewOffsets.bind(this);
    this._boundUpdateLineDiffState = this._updateLineDiffState.bind(this);
    this._boundOnChangeNewTextEditor = this._onChangeNewTextEditor.bind(this);
  }

  componentDidMount(): void {
    var diffModel = this.props.diffModel;
    var subscriptions = this._subscriptions = new CompositeDisposable();
    subscriptions.add(diffModel.onActiveFileUpdates(this._boundUpdateLineDiffState));
    var oldTextEditor = this.refs['old-editor'].getEditorModel();
    var newTextEditor = this.refs['new-editor'].getEditorModel();

    var SyncScroll = require('./SyncScroll');
    subscriptions.add(new SyncScroll(
        oldTextEditor,
        newTextEditor,
      )
    );

    this._updateLineDiffState(diffModel.getActiveFileState());
  }

  componentWillUnmount(): void {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
  }

  render(): ReactElement {
    var {filePath, oldEditorState: oldState, newEditorState: newState} = this.state;
    return (
      <div className="diff-view-component">
        <div className="split-pane">
          <div className="title">
            <p>Original</p>
          </div>
          <DiffViewEditorPane
            ref="old-editor"
            filePath={filePath}
            offsets={oldState.offsets}
            highlightedLines={oldState.highlightedLines}
            initialTextContent={oldState.text}
            inlineElements={oldState.inlineElements}
            handleNewOffsets={this._boundHandleNewOffsets}
            readOnly={true}
          />
        </div>
        <div className="split-pane">
          <div className="title">
            <p>Changed</p>
          </div>
          <DiffViewEditorPane
            ref="new-editor"
            filePath={filePath}
            offsets={newState.offsets}
            highlightedLines={newState.highlightedLines}
            initialTextContent={newState.text}
            inlineElements={newState.inlineElements}
            handleNewOffsets={this._boundHandleNewOffsets}
            readOnly={false}
            onChange={this._boundOnChangeNewTextEditor}
          />
        </div>
      </div>
    );
  }

  _handleNewOffsets(offsetsFromComponents: Map): void {
    var oldLineOffsets = assign({}, this.state.oldEditorState.offsets);
    var newLineOffsets = assign({}, this.state.newEditorState.offsets);
    offsetsFromComponents.forEach((offsetAmount, row) => {
      newLineOffsets[row] = (newLineOffsets[row] || 0) + offsetAmount;
      oldLineOffsets[row] = (oldLineOffsets[row] || 0) + offsetAmount;
    });
    var oldEditorState = assign({}, this.state.oldEditorState, {offsets: oldLineOffsets});
    var newEditorState = assign({}, this.state.newEditorState, {offsets: newLineOffsets});
    this.setState({
      filePath: this.state.filePath,
      oldEditorState,
      newEditorState,
    });
  }

  _onChangeNewTextEditor(newContents: string): void {
    this.props.diffModel.setNewContents(newContents);
  }

  /**
   * Updates the line diff state on active file state change.
   */
  _updateLineDiffState(fileState: FileChangeState): void {
    var {oldContents, newContents, filePath, inlineComponents} = fileState;

    var {computeDiff} = require('./diff-utils');
    var {addedLines, removedLines, oldLineOffsets, newLineOffsets} =
      computeDiff(oldContents, newContents);

    var oldEditorState = {
      text: oldContents,
      offsets: oldLineOffsets,
      highlightedLines: {
        added: [],
        removed: removedLines,
      },
      inlineElements: inlineComponents || [],
    };
    var newEditorState = {
      text: newContents,
      offsets: newLineOffsets,
      highlightedLines: {
        added: addedLines,
        removed: [],
      },
      inlineElements: [],
    };
    this.setState({
      filePath,
      oldEditorState,
      newEditorState,
    });
  }
}

DiffViewComponent.propTypes = {
  diffModel: PropTypes.object.isRequired,
  initialFilePath: PropTypes.string,
};

module.exports = DiffViewComponent;
