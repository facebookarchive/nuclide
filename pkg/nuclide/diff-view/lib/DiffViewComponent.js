'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileChangeState, InlineComponent, OffsetMap, DiffModeType} from './types';
import type DiffViewModel from './DiffViewModel';
import type {RevisionInfo} from '../../hg-repository-base/lib/hg-constants';
import type {NuclideUri} from '../../remote-uri';

import invariant from 'assert';
import {CompositeDisposable, Disposable, TextBuffer} from 'atom';
import {
  React,
  ReactDOM,
} from 'react-for-atom';
import DiffViewEditorPane from './DiffViewEditorPane';
import DiffViewTree from './DiffViewTree';
import SyncScroll from './SyncScroll';
import DiffTimelineView from './DiffTimelineView';
import DiffViewToolbar from './DiffViewToolbar';
import DiffNavigationBar from './DiffNavigationBar';
import DiffCommitView from './DiffCommitView';
import DiffPublishView from './DiffPublishView';
import {createPaneContainer} from '../../atom-helpers';
import {bufferForUri} from '../../atom-helpers';
import {DiffMode} from './constants';
import featureConfig from '../../feature-config';

type Props = {
  diffModel: DiffViewModel;
};

type EditorState = {
  revisionTitle: string;
  text: string;
  savedContents?: string;
  offsets: OffsetMap;
  highlightedLines: {
    added: Array<number>;
    removed: Array<number>;
  };
  inlineElements: Array<InlineComponent>;
}

type State = {
  filePath: NuclideUri;
  oldEditorState: EditorState;
  newEditorState: EditorState;
  toolbarVisible: boolean;
};

function initialEditorState(): EditorState {
  return {
    revisionTitle: '',
    text: '',
    offsets: new Map(),
    highlightedLines: {
      added: [],
      removed: [],
    },
    inlineElements: [],
  };
}

const EMPTY_FUNCTION = () => {};
const TOOLBAR_VISIBLE_SETTING = 'nuclide-diff-view.toolbarVisible';

/* eslint-disable react/prop-types */
class DiffViewComponent extends React.Component {
  props: Props;
  state: State;

  _subscriptions: CompositeDisposable;
  _syncScroll: SyncScroll;
  _oldEditorPane: atom$Pane;
  _oldEditorComponent: DiffViewEditorPane;
  _paneContainer: Object;
  _newEditorPane: atom$Pane;
  _newEditorComponent: DiffViewEditorPane;
  _bottomRightPane: atom$Pane;
  _timelineComponent: ?DiffTimelineView;
  _treePane: atom$Pane;
  _treeComponent: ReactComponent;
  _navigationPane: atom$Pane;
  _navigationComponent: DiffNavigationBar;
  _commitComponent: ?DiffCommitView;
  _publishComponent: ?DiffPublishView;
  _readonlyBuffer: atom$TextBuffer;

  constructor(props: Props) {
    super(props);
    const toolbarVisible = ((featureConfig.get(TOOLBAR_VISIBLE_SETTING): any): boolean);
    this.state = {
      mode: DiffMode.BROWSE_MODE,
      filePath: '',
      toolbarVisible,
      oldEditorState: initialEditorState(),
      newEditorState: initialEditorState(),
    };
    (this: any)._onModelStateChange = this._onModelStateChange.bind(this);
    (this: any)._handleNewOffsets = this._handleNewOffsets.bind(this);
    (this: any)._updateLineDiffState = this._updateLineDiffState.bind(this);
    (this: any)._onChangeNewTextEditor = this._onChangeNewTextEditor.bind(this);
    (this: any)._onTimelineChangeRevision = this._onTimelineChangeRevision.bind(this);
    (this: any)._onNavigationClick = this._onNavigationClick.bind(this);
    (this: any)._onDidUpdateTextEditorElement = this._onDidUpdateTextEditorElement.bind(this);
    (this: any)._onChangeMode = this._onChangeMode.bind(this);
    (this: any)._onSwitchToEditor = this._onSwitchToEditor.bind(this);
    this._readonlyBuffer = new TextBuffer();
    this._subscriptions = new CompositeDisposable();
  }

  componentWillMount(): void {
    this._subscriptions.add(featureConfig.observe(TOOLBAR_VISIBLE_SETTING, toolbarVisible => {
      this.setState({toolbarVisible});
    }));
  }

  componentDidMount(): void {
    const {diffModel} = this.props;
    this._subscriptions.add(diffModel.onActiveFileUpdates(this._updateLineDiffState));
    this._subscriptions.add(diffModel.onDidUpdateState(this._onModelStateChange));

    this._paneContainer = createPaneContainer();
    // The changed files status tree takes 1/5 of the width and lives on the right most,
    // while being vertically splt with the revision timeline stack pane.
    const topPane = this._newEditorPane = this._paneContainer.getActivePane();
    this._bottomRightPane = topPane.splitDown({
      flexScale: 0.3,
    });
    this._treePane = this._bottomRightPane.splitLeft({
      flexScale: 0.35,
    });
    this._navigationPane = topPane.splitRight({
      flexScale: 0.045,
    });
    this._oldEditorPane = topPane.splitLeft({
      flexScale: 1,
    });

    this._renderDiffView();

    this._subscriptions.add(
      this._destroyPaneDisposable(this._oldEditorPane, true),
      this._destroyPaneDisposable(this._newEditorPane, true),
      this._destroyPaneDisposable(this._navigationPane, true),
      this._destroyPaneDisposable(this._treePane, true),
      this._destroyPaneDisposable(this._bottomRightPane),
    );

    ReactDOM.findDOMNode(this.refs['paneContainer']).appendChild(
      atom.views.getView(this._paneContainer),
    );

    this._updateLineDiffState(diffModel.getActiveFileState());
  }

  _onModelStateChange(): void {
    this.setState({});
  }

  _setupSyncScroll(): void {
    if (this._oldEditorComponent == null || this._newEditorComponent == null) {
      return;
    }
    const oldTextEditorElement = this._oldEditorComponent.getEditorDomElement();
    const newTextEditorElement = this._newEditorComponent.getEditorDomElement();
    const syncScroll = this._syncScroll;
    if (syncScroll != null) {
      syncScroll.dispose();
      this._subscriptions.remove(syncScroll);
    }
    this._syncScroll = new SyncScroll(
      oldTextEditorElement,
      newTextEditorElement,
    );
    this._subscriptions.add(this._syncScroll);
  }

  _onChangeMode(mode: DiffModeType): void {
    this.props.diffModel.setViewMode(mode);
  }

  _renderDiffView(): void {
    this._renderTree();
    this._renderEditors();
    this._renderNavigation();
    this._renderBottomRightPane();
  }

  _renderBottomRightPane(): void {
    const {viewMode} = this.props.diffModel.getState();
    switch (viewMode) {
      case DiffMode.BROWSE_MODE:
        this._renderTimelineView();
        this._commitComponent = null;
        this._publishComponent = null;
        break;
      case DiffMode.COMMIT_MODE:
        this._renderCommitView();
        this._timelineComponent = null;
        this._publishComponent = null;
        break;
      case DiffMode.PUBLISH_MODE:
        this._renderPublishView();
        this._commitComponent = null;
        this._timelineComponent = null;
        break;
      default:
        throw new Error(`Invalid Diff Mode: ${viewMode}`);
    }
  }

  componentDidUpdate(): void {
    this._renderDiffView();
  }

  _renderCommitView(): void {
    const {
      commitMessage,
      commitMode,
      commitModeState,
    } = this.props.diffModel.getState();
    this._commitComponent = ReactDOM.render(
      <DiffCommitView
        commitMessage={commitMessage}
        commitMode={commitMode}
        commitModeState={commitModeState}
        // `diffModel` is acting as the action creator for commit view and needs to be passed so
        // methods can be called on it.
        diffModel={this.props.diffModel}
      />,
      this._getPaneElement(this._bottomRightPane),
    );
  }

  _renderPublishView(): void {
    const {diffModel} = this.props;
    const {
      publishMode,
      publishModeState,
      publishMessage,
      headRevision,
    } = diffModel.getState();
    this._publishComponent = ReactDOM.render(
      <DiffPublishView
        publishModeState={publishModeState}
        message={publishMessage}
        publishMode={publishMode}
        headRevision={headRevision}
        diffModel={diffModel}
      />,
      this._getPaneElement(this._bottomRightPane),
    );
  }

  _renderTree(): void {
    this._treeComponent = ReactDOM.render(
      (
        <div className="nuclide-diff-view-tree">
          <DiffViewTree diffModel={this.props.diffModel} />
        </div>
      ),
      this._getPaneElement(this._treePane),
    );
  }

  _renderEditors(): void {
    const {filePath, oldEditorState: oldState, newEditorState: newState} = this.state;
    this._oldEditorComponent = ReactDOM.render(
        <DiffViewEditorPane
          headerTitle={oldState.revisionTitle}
          textBuffer={this._readonlyBuffer}
          filePath={filePath}
          offsets={oldState.offsets}
          highlightedLines={oldState.highlightedLines}
          savedContents={oldState.text}
          initialTextContent={oldState.text}
          inlineElements={oldState.inlineElements}
          handleNewOffsets={this._handleNewOffsets}
          readOnly={true}
          onChange={EMPTY_FUNCTION}
          onDidUpdateTextEditorElement={EMPTY_FUNCTION}
        />,
        this._getPaneElement(this._oldEditorPane),
    );
    const textBuffer = bufferForUri(filePath);
    this._newEditorComponent = ReactDOM.render(
        <DiffViewEditorPane
          headerTitle={newState.revisionTitle}
          textBuffer={textBuffer}
          filePath={filePath}
          offsets={newState.offsets}
          highlightedLines={newState.highlightedLines}
          initialTextContent={newState.text}
          savedContents={newState.savedContents}
          inlineElements={newState.inlineElements}
          handleNewOffsets={this._handleNewOffsets}
          onDidUpdateTextEditorElement={this._onDidUpdateTextEditorElement}
          readOnly={false}
          onChange={this._onChangeNewTextEditor}
        />,
        this._getPaneElement(this._newEditorPane),
    );
  }

  _onDidUpdateTextEditorElement(): void {
    this._setupSyncScroll();
  }

  _renderTimelineView(): void {
    this._timelineComponent = ReactDOM.render(
      <DiffTimelineView
        diffModel={this.props.diffModel}
        onSelectionChange={this._onTimelineChangeRevision}
      />,
      this._getPaneElement(this._bottomRightPane),
    );
  }

  _renderNavigation(): void {
    const {oldEditorState, newEditorState} = this.state;
    const {offsets: oldOffsets, highlightedLines: oldLines, text: oldContents} = oldEditorState;
    const {offsets: newOffsets, highlightedLines: newLines, text: newContents} = newEditorState;
    const navigationPaneElement = this._getPaneElement(this._navigationPane);
    this._navigationComponent = ReactDOM.render(
      <DiffNavigationBar
        elementHeight={navigationPaneElement.clientHeight}
        addedLines={newLines.added}
        newOffsets={newOffsets}
        newContents={newContents}
        removedLines={oldLines.removed}
        oldOffsets={oldOffsets}
        oldContents={oldContents}
        onClick={this._onNavigationClick}
      />,
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

  _destroyPaneDisposable(pane: atom$Pane): IDisposable {
    return new Disposable(() => {
      pane.destroy();
    });
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
  }

  render(): ReactElement {
    let toolbarComponent = null;
    if (this.state.toolbarVisible) {
      const {viewMode} = this.props.diffModel.getState();
      toolbarComponent = (
        <DiffViewToolbar
          filePath={this.state.filePath}
          diffMode={viewMode}
          onSwitchMode={this._onChangeMode}
          onSwitchToEditor={this._onSwitchToEditor}
        />
      );
    }
    return (
      <div className="nuclide-diff-view-container">
        {toolbarComponent}
        <div className="nuclide-diff-view-component" ref="paneContainer" />
      </div>
    );
  }

  _onSwitchToEditor(): void {
    const diffViewNode = ReactDOM.findDOMNode(this);
    invariant(diffViewNode, 'Diff View DOM needs to be attached to switch to editor mode');
    atom.commands.dispatch(diffViewNode, 'nuclide-diff-view:switch-to-editor');
  }

  _handleNewOffsets(offsetsFromComponents: Map): void {
    const oldLineOffsets = new Map(this.state.oldEditorState.offsets);
    const newLineOffsets = new Map(this.state.newEditorState.offsets);
    offsetsFromComponents.forEach((offsetAmount, row) => {
      newLineOffsets.set(row, (newLineOffsets.get(row) || 0) + offsetAmount);
      oldLineOffsets.set(row, (oldLineOffsets.get(row) || 0) + offsetAmount);
    });
    this.setState({
      oldEditorState: {...this.state.oldEditorState, offsets: oldLineOffsets},
      newEditorState: {...this.state.newEditorState, offsets: newLineOffsets},
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
    const {
      filePath,
      oldContents,
      newContents,
      savedContents,
      inlineComponents,
      fromRevisionTitle,
      toRevisionTitle,
    } = fileState;

    const {computeDiff} = require('./diff-utils');
    const {addedLines, removedLines, oldLineOffsets, newLineOffsets} =
      computeDiff(oldContents, newContents);

    const oldEditorState = {
      revisionTitle: fromRevisionTitle,
      text: oldContents,
      offsets: oldLineOffsets,
      highlightedLines: {
        added: [],
        removed: removedLines,
      },
      inlineElements: inlineComponents || [],
    };
    const newEditorState = {
      revisionTitle: toRevisionTitle,
      text: newContents,
      savedContents,
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
