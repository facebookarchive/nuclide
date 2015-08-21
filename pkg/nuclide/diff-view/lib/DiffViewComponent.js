'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable} = require('atom');
var React = require('react-for-atom');
var {PropTypes} = React;
var DiffViewEditorPane = require('./DiffViewEditorPane');
var DiffViewController = require('./DiffViewController');

var DiffViewComponent = React.createClass({
  propTypes: {
    filePath: PropTypes.string.isRequired,
    uiProviders: PropTypes.arrayOf(PropTypes.object).isRequired,
  },

  _subscriptions: (null: ?CompositeDisposable),

  getInitialState(): Object {
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
    return {
      oldEditorState,
      newEditorState,
    };
  },

  componentDidMount(): void {
    this._updateEditorPane();
  },

  componentWillUnmount(): void {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
  },

  render(): ReactElement {
    var oldState = this.state.oldEditorState;
    var newState = this.state.newEditorState;
    return (
      <div className="diff-view-component">
        <div className="split-pane">
          <div className="title">
            <p>Original</p>
          </div>
          <DiffViewEditorPane
            ref="old-editor"
            filePath={this.props.filePath}
            offsets={oldState.offsets}
            highlightedLines={oldState.highlightedLines}
            textContent={oldState.text}
            inlineElements={oldState.inlineElements}
            handleNewOffsets={this._handleNewOffsets}
          />
        </div>
        <div className="split-pane">
          <div className="title">
            <p>Changed</p>
          </div>
          <DiffViewEditorPane
            ref="new-editor"
            filePath={this.props.filePath}
            offsets={newState.offsets}
            highlightedLines={newState.highlightedLines}
            textContent={newState.text}
            inlineElements={newState.inlineElements}
            handleNewOffsets={this._handleNewOffsets}
          />
        </div>
      </div>
    );
  },

  _handleNewOffsets(offsetsFromComponents: Map): void {
    var oldLineOffsets = {...this.state.oldEditorState.offsets};
    var newLineOffsets = {...this.state.newEditorState.offsets};
    offsetsFromComponents.forEach((offsetAmount, row) => {
      newLineOffsets[row] = (newLineOffsets[row] || 0) + offsetAmount;
      oldLineOffsets[row] = (oldLineOffsets[row] || 0) + offsetAmount;
    });
    var oldEditorState = {...this.state.oldEditorState, offsets: oldLineOffsets};
    var newEditorState = {...this.state.newEditorState, offsets: newLineOffsets};
    this.setState({
      oldEditorState,
      newEditorState,
    });
  },

  async _updateEditorPane(): Promise {
    this._subscriptions = new CompositeDisposable();

    var contents = await DiffViewController.fetchHgDiff(this.props.filePath);
    if (!this.isMounted()) {
      return;
    }

    var {addedLines, removedLines, oldLineOffsets, newLineOffsets} =
      DiffViewController.computeDiff(contents.oldText, contents.newText);
    var oldEditorState = {
      text: contents.oldText,
      offsets: oldLineOffsets,
      highlightedLines: {
        added: [],
        removed: removedLines,
      },
      inlineElements: this.state.oldEditorState.inlineElements,
    };
    var newEditorState = {
      text: contents.newText,
      offsets: newLineOffsets,
      highlightedLines: {
        added: addedLines,
        removed: [],
      },
      inlineElements: this.state.newEditorState.inlineElements,
    };

    this.setState({
      oldEditorState,
      newEditorState,
    });

    var SyncScroll = require('./SyncScroll');
    this._subscriptions.add(new SyncScroll(
        this.refs['old-editor'].getEditorModel(),
        this.refs['new-editor'].getEditorModel()
      )
    );

    var uiComponents = await DiffViewController.fetchInlineComponents(this.props.uiProviders, this.props.filePath);
    if (!this.isMounted()) {
      return;
    }

    var oldEditorStateUpdated = {...this.state.oldEditorState, inlineElements: uiComponents};
    this.setState({
      oldEditorState: oldEditorStateUpdated,
      newEditorState,
    });
  },


});

module.exports = DiffViewComponent;
