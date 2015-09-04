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
var DiffViewTree = require('./DiffViewTree');
var {assign} = require('nuclide-commons').object;
var {createPaneContainer} = require('nuclide-atom-helpers');

class DiffViewComponent extends React.Component {
  _subscriptions: ?CompositeDisposable;
  _oldEditorPane: ?atom$Pane;
  _oldEditorComponent: ?ReactComponent;
  _newEditorPane: ?atom$Pane;
  _newEditorComponent: ?ReactComponent;
  _treePane: ?atom$Pane;
  _treeComponent: ?ReactComponent;

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

    this._paneContainer = createPaneContainer();
    // The diff status tree takes 1/5 of the width and lives on the right most.
    this._treePane = this._paneContainer.getActivePane();
    this._oldEditorPane = this._treePane.splitLeft({
      // Prevent Atom from cloning children on splitting; this panel wants an empty container.
      copyActiveItem: false,
      // The old contents left editor pane takes 2/5 the width.
      flexScale: 2,
    });
    this._newEditorPane = this._treePane.splitLeft({
      // Prevent Atom from cloning children on splitting; this panel wants an empty container.
      copyActiveItem: false,
      // The new contents right editor pane takes 2/5 the width.
      flexScale: 2,
    });

    this._renderTree();
    this._renderEditors();

    React.findDOMNode(this.refs['paneContainer']).appendChild(
      atom.views.getView(this._paneContainer)
    );

    var oldTextEditor = this._oldEditorComponent.getEditorModel();
    var newTextEditor = this._newEditorComponent.getEditorModel();

    var SyncScroll = require('./SyncScroll');
    subscriptions.add(new SyncScroll(
        oldTextEditor,
        newTextEditor,
      )
    );

    this._updateLineDiffState(diffModel.getActiveFileState());
  }

  componentDidUpdate(): void {
    this._renderTree();
    this._renderEditors();
  }

  _renderTree(): void {
    this._treeComponent = React.render(
      (
        <div className={"nuclide-diff-view-tree"}>
          <DiffViewTree diffModel={this.props.diffModel} />
        </div>
      ),
      this._getPaneElement(this._treePane),
    );
  }

  _renderEditors(): void {
    var {filePath, oldEditorState: oldState, newEditorState: newState} = this.state;
    this._oldEditorComponent = React.render(
        <DiffViewEditorPane
          filePath={filePath}
          offsets={oldState.offsets}
          highlightedLines={oldState.highlightedLines}
          initialTextContent={oldState.text}
          inlineElements={oldState.inlineElements}
          handleNewOffsets={this._boundHandleNewOffsets}
          readOnly={true}/>,
        this._getPaneElement(this._oldEditorPane),
    );
    this._newEditorComponent = React.render(
        <DiffViewEditorPane
          filePath={filePath}
          offsets={newState.offsets}
          highlightedLines={newState.highlightedLines}
          initialTextContent={newState.text}
          inlineElements={newState.inlineElements}
          handleNewOffsets={this._boundHandleNewOffsets}
          readOnly={false}
          onChange={this._boundOnChangeNewTextEditor}/>,
        this._getPaneElement(this._newEditorPane),
    );
  }

  _getPaneElement(pane: atom$Pane): HTMLElement {
    return atom.views.getView(pane).querySelector('.item-views');
  }

  componentWillUnmount(): void {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
    if (this._oldEditorPane) {
      React.unmountComponentAtNode(this._getPaneElement(this._oldEditorPane));
      this._oldEditorPane = null;
      this._oldEditorComponent = null;
    }
    if (this._newEditorPane) {
      React.unmountComponentAtNode(this._getPaneElement(this._newEditorPane));
      this._newEditorPane = null;
      this._newEditorComponent = null;
    }
    if (this._treePane) {
      React.unmountComponentAtNode(this._getPaneElement(this._treePane));
      this._treePane = null;
      this._treeComponent = null;
    }
  }

  render(): ReactElement {
    return (
      <div className="nuclide-diff-view-component" ref="paneContainer" />
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
