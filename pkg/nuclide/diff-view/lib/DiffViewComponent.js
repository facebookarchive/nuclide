'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileChangeState, InlineComponent, OffsetMap} from './types';
import type DiffViewModel from './DiffViewModel';
import type {RevisionInfo} from '../../hg-repository-base/lib/hg-constants';

import invariant from 'assert';
import {CompositeDisposable} from 'atom';
import React from 'react-for-atom';
import DiffViewEditorPane from './DiffViewEditorPane';
import DiffViewTree from './DiffViewTree';
import SyncScroll from './SyncScroll';
import DiffTimelineView from './DiffTimelineView';
import DiffNavigationBar from './DiffNavigationBar';
import {object} from '../../commons';
import {createPaneContainer} from '../../atom-helpers';

type Props = {
  diffModel: DiffViewModel;
};

type EditorState = {
  text: string;
  offsets: OffsetMap;
  highlightedLines: {
    added: Array<number>;
    removed: Array<number>;
  };
  inlineElements: Array<InlineComponent>;
}

type State = {
  filePath: string,
  oldEditorState: EditorState;
  newEditorState: EditorState;
};

/* eslint-disable react/prop-types */
class DiffViewComponent extends React.Component {
  props: Props;
  state: State;

  _subscriptions: ?CompositeDisposable;
  _oldEditorPane: ?atom$Pane;
  _oldEditorComponent: ?DiffViewEditorPane;
  _newEditorPane: ?atom$Pane;
  _newEditorComponent: ?DiffViewEditorPane;
  _timelinePane: ?atom$Pane;
  _timelineComponent: ?DiffTimelineView;
  _treePane: ?atom$Pane;
  _treeComponent: ?ReactComponent;
  _navigationPane: ?atom$Pane;
  _navigationComponent: ?DiffNavigationBar;

  _boundHandleNewOffsets: Function;
  _boundUpdateLineDiffState: Function;
  _boundOnNavigationClick: Function;

  constructor(props: Props) {
    super(props);
    const oldEditorState = {
      text: '',
      offsets: new Map(),
      highlightedLines: {
        added: [],
        removed: [],
      },
      inlineElements: [],
    };
    const newEditorState = {
      text: '',
      offsets: new Map(),
      highlightedLines: {
        added: [],
        removed: [],
      },
      inlineElements: [],
    };
    this.state = {
      filePath: '',
      oldEditorState,
      newEditorState,
    };
    this._boundHandleNewOffsets = this._handleNewOffsets.bind(this);
    this._boundUpdateLineDiffState = this._updateLineDiffState.bind(this);
    this._boundOnChangeNewTextEditor = this._onChangeNewTextEditor.bind(this);
    this._boundOnTimelineChangeRevision = this._onTimelineChangeRevision.bind(this);
    this._boundOnNavigationClick = this._onNavigationClick.bind(this);
  }

  componentDidMount(): void {
    const diffModel = this.props.diffModel;
    const subscriptions = this._subscriptions = new CompositeDisposable();
    subscriptions.add(diffModel.onActiveFileUpdates(this._boundUpdateLineDiffState));

    this._paneContainer = createPaneContainer();
    // The changed files status tree takes 1/5 of the width and lives on the right most,
    // while being vertically splt with the revision timeline stack pane.
    const treePane = this._treePane = this._paneContainer.getActivePane();
    this._oldEditorPane = treePane.splitLeft({
      copyActiveItem: false,
      flexScale: 2,
    });
    this._newEditorPane = treePane.splitLeft({
      copyActiveItem: false,
      flexScale: 2,
    });
    this._navigationPane = treePane.splitLeft({
      // The navigation pane sits between the tree and the editors.
      flexScale: 0.08,
    });
    this._timelinePane = treePane.splitDown({
      copyActiveItem: false,
      flexScale: 1,
    });

    this._renderDiffView();

    React.findDOMNode(this.refs['paneContainer']).appendChild(
      atom.views.getView(this._paneContainer),
    );

    invariant(this._oldEditorComponent);
    const oldTextEditorElement = this._oldEditorComponent.getEditorDomElement();
    invariant(this._newEditorComponent);
    const newTextEditorElement = this._newEditorComponent.getEditorDomElement();

    subscriptions.add(new SyncScroll(
        oldTextEditorElement,
        newTextEditorElement,
      )
    );

    this._updateLineDiffState(diffModel.getActiveFileState());
  }

  _renderDiffView(): void {
    this._renderTree();
    this._renderEditors();
    this._renderNavigation();
    this._renderTimeline();
  }

  componentDidUpdate(): void {
    this._renderDiffView();
  }

  _renderTree(): void {
    invariant(this._treePane);
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
    const {filePath, oldEditorState: oldState, newEditorState: newState} = this.state;
    invariant(this._oldEditorPane);
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
    invariant(this._newEditorPane);
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

  _renderTimeline(): void {
    invariant(this._timelinePane);
    this._timelineComponent = React.render(
      <DiffTimelineView
        diffModel={this.props.diffModel}
        onSelectionChange={this._boundOnTimelineChangeRevision}/>,
      this._getPaneElement(this._timelinePane),
    );
  }

  _renderNavigation(): void {
    invariant(this._navigationPane);
    const {oldEditorState, newEditorState} = this.state;
    const {offsets: oldOffsets, highlightedLines: oldLines, text: oldContents} = oldEditorState;
    const {offsets: newOffsets, highlightedLines: newLines, text: newContents} = newEditorState;
    const navigationPaneElement = this._getPaneElement(this._navigationPane);
    this._navigationComponent = React.render(
      <DiffNavigationBar
        elementHeight={navigationPaneElement.clientHeight}
        addedLines={newLines.added}
        newOffsets={newOffsets}
        newContents={newContents}
        removedLines={oldLines.removed}
        oldOffsets={oldOffsets}
        oldContents={oldContents}
        onClick={this._boundOnNavigationClick}/>,
        navigationPaneElement,
    );
  }

  _onNavigationClick(lineNumber: number, isAddedLine: boolean): void {
    const textEditorComponent = isAddedLine ? this._newEditorComponent : this._oldEditorComponent;
    invariant(textEditorComponent, 'Diff View Navigation Error: Non valid text editor component');
    const textEditor = textEditorComponent.getEditorModel();
    textEditor.scrollToBufferPosition([lineNumber, 0]);
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
    if (this._timelinePane) {
      React.unmountComponentAtNode(this._getPaneElement(this._timelinePane));
      this._timelinePane = null;
      this._timelineComponent = null;
    }
  }

  render(): ReactElement {
    return (
      <div className="nuclide-diff-view-component" ref="paneContainer" />
    );
  }

  _handleNewOffsets(offsetsFromComponents: Map): void {
    const oldLineOffsets = new Map(this.state.oldEditorState.offsets);
    const newLineOffsets = new Map(this.state.newEditorState.offsets);
    offsetsFromComponents.forEach((offsetAmount, row) => {
      newLineOffsets.set(row, (newLineOffsets.get(row) || 0) + offsetAmount);
      oldLineOffsets.set(row, (oldLineOffsets.get(row) || 0) + offsetAmount);
    });
    const oldEditorState = object.assign({}, this.state.oldEditorState, {offsets: oldLineOffsets});
    const newEditorState = object.assign({}, this.state.newEditorState, {offsets: newLineOffsets});
    this.setState({
      filePath: this.state.filePath,
      oldEditorState,
      newEditorState,
    });
  }

  _onChangeNewTextEditor(newContents: string): void {
    this.props.diffModel.setNewContents(newContents);
  }

  _onTimelineChangeRevision(revision: RevisionInfo): void {
    this.props.diffModel.setRevision(revision);
  }

  /**
   * Updates the line diff state on active file state change.
   */
  _updateLineDiffState(fileState: FileChangeState): void {
    const {oldContents, newContents, filePath, inlineComponents} = fileState;

    const {computeDiff} = require('./diff-utils');
    const {addedLines, removedLines, oldLineOffsets, newLineOffsets} =
      computeDiff(oldContents, newContents);

    const oldEditorState = {
      text: oldContents,
      offsets: oldLineOffsets,
      highlightedLines: {
        added: [],
        removed: removedLines,
      },
      inlineElements: inlineComponents || [],
    };
    const newEditorState = {
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

module.exports = DiffViewComponent;
