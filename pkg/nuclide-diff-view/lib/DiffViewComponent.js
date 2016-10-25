'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _MultiRootChangedFilesView;

function _load_MultiRootChangedFilesView() {
  return _MultiRootChangedFilesView = require('../../nuclide-ui/MultiRootChangedFilesView');
}

var _atom = require('atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _reactForAtom = require('react-for-atom');

var _DiffViewEditorPane;

function _load_DiffViewEditorPane() {
  return _DiffViewEditorPane = _interopRequireDefault(require('./DiffViewEditorPane'));
}

var _SyncScroll;

function _load_SyncScroll() {
  return _SyncScroll = _interopRequireDefault(require('./SyncScroll'));
}

var _DiffTimelineView;

function _load_DiffTimelineView() {
  return _DiffTimelineView = _interopRequireDefault(require('./DiffTimelineView'));
}

var _DiffViewToolbar;

function _load_DiffViewToolbar() {
  return _DiffViewToolbar = _interopRequireDefault(require('./DiffViewToolbar'));
}

var _DiffNavigationBar;

function _load_DiffNavigationBar() {
  return _DiffNavigationBar = _interopRequireDefault(require('./DiffNavigationBar'));
}

var _DiffCommitView;

function _load_DiffCommitView() {
  return _DiffCommitView = _interopRequireDefault(require('./DiffCommitView'));
}

var _DiffPublishView;

function _load_DiffPublishView() {
  return _DiffPublishView = _interopRequireDefault(require('./DiffPublishView'));
}

var _diffUtils;

function _load_diffUtils() {
  return _diffUtils = require('./diff-utils');
}

var _createPaneContainer;

function _load_createPaneContainer() {
  return _createPaneContainer = _interopRequireDefault(require('../../commons-atom/create-pane-container'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../commons-atom/text-editor');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-hg-git-bridge/lib/utils');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('../../nuclide-ui/LoadingSpinner');
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initialEditorState() {
  return {
    revisionTitle: '',
    text: '',
    offsets: new Map(),
    highlightedLines: {
      added: [],
      removed: []
    },
    inlineElements: []
  };
}

let CachedPublishComponent;
function getPublishComponent() {
  if (CachedPublishComponent == null) {
    // Try requiring private module
    try {
      // $FlowFB
      var _require = require('./fb/DiffViewPublishForm');

      const DiffViewPublishForm = _require.DiffViewPublishForm;

      CachedPublishComponent = DiffViewPublishForm;
    } catch (ex) {
      CachedPublishComponent = (_DiffPublishView || _load_DiffPublishView()).default;
    }
  }
  return CachedPublishComponent;
}

let CachedDiffComponent;
function getDiffComponent() {
  if (CachedDiffComponent == null) {
    // Try requiring private module
    try {
      // $FlowFB
      var _require2 = require('./fb/DiffViewCreateForm');

      const DiffViewCreateForm = _require2.DiffViewCreateForm;

      CachedDiffComponent = DiffViewCreateForm;
    } catch (ex) {
      CachedDiffComponent = (_DiffCommitView || _load_DiffCommitView()).default;
    }
  }

  return CachedDiffComponent;
}

function getInitialState() {
  return {
    diffSections: [],
    filePath: '',
    isLoadingFileDiff: false,
    mode: (_constants || _load_constants()).DiffMode.BROWSE_MODE,
    newEditorState: initialEditorState(),
    oldEditorState: initialEditorState(),
    selectedDiffSectionIndex: -1
  };
}

const EMPTY_FUNCTION = () => {};
const SCROLL_FIRST_CHANGE_DELAY_MS = 100;
const DEBOUNCE_STATE_UPDATES_MS = 50;

let DiffViewComponent = class DiffViewComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = getInitialState();
    this._updateLineDiffState = this._updateLineDiffState.bind(this);
    this._onTimelineChangeRevision = this._onTimelineChangeRevision.bind(this);
    this._handleNavigateToDiffSection = this._handleNavigateToDiffSection.bind(this);
    this._onDidUpdateTextEditorElement = this._onDidUpdateTextEditorElement.bind(this);
    this._onChangeMode = this._onChangeMode.bind(this);
    this._onSwitchToEditor = this._onSwitchToEditor.bind(this);
    this._onDidChangeScrollTop = this._onDidChangeScrollTop.bind(this);
    this._pixelRangeForDiffSection = this._pixelRangeForDiffSection.bind(this);
    this._readonlyBuffer = new _atom.TextBuffer();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  componentDidMount() {
    var _props = this.props;
    const diffModel = _props.diffModel;
    const tryTriggerNux = _props.tryTriggerNux;

    this._subscriptions.add(_rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(diffModel.onDidUpdateState.bind(diffModel)), (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.onDidChangeActivePaneItem.bind(atom.workspace))).filter(() => {
      const activeItem = atom.workspace.getActivePaneItem();
      return activeItem != null && activeItem.tagName === 'NUCLIDE-DIFF-VIEW';
    }).debounceTime(DEBOUNCE_STATE_UPDATES_MS).subscribe(() => {
      this._updateLineDiffState(diffModel.getState());
      this.forceUpdate();
    }));

    this._paneContainer = (0, (_createPaneContainer || _load_createPaneContainer()).default)();
    // The changed files status tree takes 1/5 of the width and lives on the right most,
    // while being vertically splt with the revision timeline stack pane.
    const topPane = this._newEditorPane = this._paneContainer.getActivePane();
    this._bottomRightPane = topPane.splitDown({
      flexScale: 0.3
    });
    this._treePane = this._bottomRightPane.splitLeft({
      flexScale: 0.35
    });
    this._navigationPane = topPane.splitRight({
      flexScale: 0.045
    });
    this._oldEditorPane = topPane.splitLeft({
      flexScale: 1
    });

    this._renderDiffView();

    this._subscriptions.add(this._destroyPaneDisposable(this._oldEditorPane), this._destroyPaneDisposable(this._newEditorPane), this._destroyPaneDisposable(this._navigationPane), this._destroyPaneDisposable(this._treePane), this._destroyPaneDisposable(this._bottomRightPane));

    _reactForAtom.ReactDOM.findDOMNode(this.refs.paneContainer).appendChild(atom.views.getView(this._paneContainer));

    this._updateLineDiffState(diffModel.getState());

    tryTriggerNux();
  }

  _setupSyncScroll() {
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
    this._syncScroll = new (_SyncScroll || _load_SyncScroll()).default(oldTextEditorElement, newTextEditorElement);
    this._subscriptions.add(this._syncScroll);
  }

  _scrollToFirstHighlightedLine() {
    const filePath = this.state.filePath;
    // Schedule scroll to first line after all lines have been rendered.

    const scrollTimeout = setTimeout(() => {
      this._subscriptions.remove(clearScrollTimeoutSubscription);
      const diffSections = this.state.diffSections;

      if (this.state.filePath !== filePath || diffSections.length === 0) {
        return;
      }

      var _diffSections$ = diffSections[0];
      const status = _diffSections$.status;
      const lineNumber = _diffSections$.lineNumber;

      this._handleNavigateToDiffSection(status, lineNumber);
    }, SCROLL_FIRST_CHANGE_DELAY_MS);
    const clearScrollTimeoutSubscription = new _atom.Disposable(() => {
      clearTimeout(scrollTimeout);
    });
    this._subscriptions.add(clearScrollTimeoutSubscription);
  }

  _onChangeMode(mode) {
    this.props.diffModel.setViewMode(mode);
  }

  _renderDiffView() {
    this._renderTree();
    this._renderEditors();
    this._renderNavigation();
    this._renderBottomRightPane();
  }

  _renderBottomRightPane() {
    var _props$diffModel$getS = this.props.diffModel.getState();

    const viewMode = _props$diffModel$getS.viewMode;

    switch (viewMode) {
      case (_constants || _load_constants()).DiffMode.BROWSE_MODE:
        this._renderTimelineView();
        this._publishComponent = null;
        break;
      case (_constants || _load_constants()).DiffMode.COMMIT_MODE:
        this._renderCommitView();
        this._timelineComponent = null;
        this._publishComponent = null;
        break;
      case (_constants || _load_constants()).DiffMode.PUBLISH_MODE:
        this._renderPublishView();
        this._timelineComponent = null;
        break;
      default:
        throw new Error(`Invalid Diff Mode: ${ viewMode }`);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this._renderDiffView();
    if (this.state.filePath !== prevState.filePath) {
      this._scrollToFirstHighlightedLine();
      this.props.diffModel.emitActiveBufferChangeModified();
    }
  }

  _renderCommitView() {
    var _props$diffModel$getS2 = this.props.diffModel.getState();

    const commitMessage = _props$diffModel$getS2.commitMessage;
    const commitMode = _props$diffModel$getS2.commitMode;
    const commitModeState = _props$diffModel$getS2.commitModeState;
    const shouldRebaseOnAmend = _props$diffModel$getS2.shouldRebaseOnAmend;


    const DiffComponent = getDiffComponent();
    _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(DiffComponent, {
      commitMessage: commitMessage,
      commitMode: commitMode,
      commitModeState: commitModeState,
      shouldRebaseOnAmend: shouldRebaseOnAmend
      // `diffModel` is acting as the action creator for commit view and needs to be passed so
      // methods can be called on it.
      , diffModel: this.props.diffModel
    }), this._getPaneElement(this._bottomRightPane));
  }

  _renderPublishView() {
    const diffModel = this.props.diffModel;

    var _diffModel$getState = diffModel.getState();

    const publishMode = _diffModel$getState.publishMode;
    const publishModeState = _diffModel$getState.publishModeState;
    const publishMessage = _diffModel$getState.publishMessage;
    const headCommitMessage = _diffModel$getState.headCommitMessage;

    const PublishComponent = getPublishComponent();
    const component = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(PublishComponent, {
      publishModeState: publishModeState,
      message: publishMessage,
      publishMode: publishMode,
      headCommitMessage: headCommitMessage,
      diffModel: diffModel
    }), this._getPaneElement(this._bottomRightPane));
    this._publishComponent = component;
  }

  _renderTree() {
    const diffModel = this.props.diffModel;

    var _diffModel$getState2 = diffModel.getState();

    const activeRepository = _diffModel$getState2.activeRepository;
    const filePath = _diffModel$getState2.filePath;
    const isLoadingSelectedFiles = _diffModel$getState2.isLoadingSelectedFiles;
    const selectedFileChanges = _diffModel$getState2.selectedFileChanges;

    const rootPaths = activeRepository != null ? [activeRepository.getWorkingDirectory()] : [];

    let spinnerElement = null;
    if (isLoadingSelectedFiles) {
      spinnerElement = _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-view-loading inline-block' },
        _reactForAtom.React.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, {
          className: 'inline-block',
          size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.EXTRA_SMALL
        }),
        _reactForAtom.React.createElement(
          'div',
          { className: 'inline-block' },
          'Refreshing Selected Files \u2026'
        )
      );
    }

    this._treeComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-diff-view-tree padded' },
      spinnerElement,
      _reactForAtom.React.createElement((_MultiRootChangedFilesView || _load_MultiRootChangedFilesView()).MultiRootChangedFilesView, {
        commandPrefix: 'nuclide-diff-view',
        fileChanges: (0, (_utils || _load_utils()).getMultiRootFileChanges)(selectedFileChanges, rootPaths),
        selectedFile: filePath,
        onFileChosen: diffModel.diffFile.bind(diffModel)
      })
    ), this._getPaneElement(this._treePane));
  }

  _renderEditors() {
    var _state = this.state;
    const filePath = _state.filePath;
    const isLoadingFileDiff = _state.isLoadingFileDiff;
    const oldState = _state.oldEditorState;
    const newState = _state.newEditorState;

    const oldEditorComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_DiffViewEditorPane || _load_DiffViewEditorPane()).default, {
      headerTitle: oldState.revisionTitle,
      textBuffer: this._readonlyBuffer,
      filePath: filePath,
      isLoading: isLoadingFileDiff,
      offsets: oldState.offsets,
      highlightedLines: oldState.highlightedLines,
      textContent: oldState.text,
      inlineElements: oldState.inlineElements,
      readOnly: true,
      onDidChangeScrollTop: this._onDidChangeScrollTop,
      onDidUpdateTextEditorElement: EMPTY_FUNCTION
    }), this._getPaneElement(this._oldEditorPane));

    if (!(oldEditorComponent instanceof (_DiffViewEditorPane || _load_DiffViewEditorPane()).default)) {
      throw new Error('Invariant violation: "oldEditorComponent instanceof DiffViewEditorPane"');
    }

    this._oldEditorComponent = oldEditorComponent;
    const textBuffer = (0, (_textEditor || _load_textEditor()).bufferForUri)(filePath);
    const newEditorComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_DiffViewEditorPane || _load_DiffViewEditorPane()).default, {
      headerTitle: newState.revisionTitle,
      textBuffer: textBuffer,
      filePath: filePath,
      isLoading: isLoadingFileDiff,
      offsets: newState.offsets,
      highlightedLines: newState.highlightedLines,
      inlineElements: newState.inlineElements,
      onDidUpdateTextEditorElement: this._onDidUpdateTextEditorElement,
      readOnly: false
    }), this._getPaneElement(this._newEditorPane));

    if (!(newEditorComponent instanceof (_DiffViewEditorPane || _load_DiffViewEditorPane()).default)) {
      throw new Error('Invariant violation: "newEditorComponent instanceof DiffViewEditorPane"');
    }

    this._newEditorComponent = newEditorComponent;
  }

  _onDidUpdateTextEditorElement() {
    this._setupSyncScroll();
  }

  _renderTimelineView() {
    const component = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_DiffTimelineView || _load_DiffTimelineView()).default, {
      diffModel: this.props.diffModel,
      onSelectionChange: this._onTimelineChangeRevision
    }), this._getPaneElement(this._bottomRightPane));

    if (!(component instanceof (_DiffTimelineView || _load_DiffTimelineView()).default)) {
      throw new Error('Invariant violation: "component instanceof DiffTimelineView"');
    }

    this._timelineComponent = component;
  }

  _renderNavigation() {
    const diffSections = this.state.diffSections;

    const navigationPaneElement = this._getPaneElement(this._navigationPane);
    const oldEditorElement = this._oldEditorComponent.getEditorDomElement();
    const newEditorElement = this._newEditorComponent.getEditorDomElement();
    const diffViewHeight = Math.max(oldEditorElement.getScrollHeight(), newEditorElement.getScrollHeight(), 1);
    const component = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_DiffNavigationBar || _load_DiffNavigationBar()).default, {
      diffSections: diffSections,
      navigationScale: navigationPaneElement.clientHeight / diffViewHeight,
      editorLineHeight: oldEditorElement.getModel().getLineHeightInPixels(),
      pixelRangeForDiffSection: this._pixelRangeForDiffSection,
      onNavigateToDiffSection: this._handleNavigateToDiffSection
    }), navigationPaneElement);

    if (!(component instanceof (_DiffNavigationBar || _load_DiffNavigationBar()).default)) {
      throw new Error('Invariant violation: "component instanceof DiffNavigationBar"');
    }

    this._navigationComponent = component;
  }

  _handleNavigateToDiffSection(diffSectionStatus, scrollToLineNumber) {
    const textEditorElement = this._diffSectionStatusToEditorElement(diffSectionStatus);
    const textEditor = textEditorElement.getModel();
    const pixelPositionTop = textEditorElement.pixelPositionForBufferPosition([scrollToLineNumber, 0]).top;
    // Manually calculate the scroll location, instead of using
    // `textEditor.scrollToBufferPosition([lineNumber, 0], {center: true})`
    // because that API to wouldn't center the line if it was in the visible screen range.
    const scrollTop = pixelPositionTop + textEditor.getLineHeightInPixels() / 2 - textEditorElement.clientHeight / 2;
    textEditorElement.setScrollTop(scrollTop);
  }

  _pixelRangeForDiffSection(diffSection) {
    const status = diffSection.status;
    const lineNumber = diffSection.lineNumber;
    const lineCount = diffSection.lineCount;

    const textEditorElement = this._diffSectionStatusToEditorElement(status);
    const lineHeight = textEditorElement.getModel().getLineHeightInPixels();
    return {
      top: textEditorElement.pixelPositionForBufferPosition([lineNumber, 0]).top,
      bottom: textEditorElement.pixelPositionForBufferPosition([lineNumber + lineCount - 1, 0]).top + lineHeight
    };
  }

  _diffSectionStatusToEditorElement(diffSectionStatus) {
    switch (diffSectionStatus) {
      case (_constants || _load_constants()).DiffSectionStatus.ADDED:
      case (_constants || _load_constants()).DiffSectionStatus.CHANGED:
        return this._newEditorComponent.getEditorDomElement();
      case (_constants || _load_constants()).DiffSectionStatus.REMOVED:
        return this._oldEditorComponent.getEditorDomElement();
      default:
        throw new Error('Invalid diff section status');
    }
  }

  _getPaneElement(pane) {
    return atom.views.getView(pane).querySelector('.item-views');
  }

  _destroyPaneDisposable(pane) {
    return new _atom.Disposable(() => {
      _reactForAtom.ReactDOM.unmountComponentAtNode(_reactForAtom.ReactDOM.findDOMNode(this._getPaneElement(pane)));
      pane.destroy();
    });
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }

  render() {
    var _state2 = this.state;
    const diffSections = _state2.diffSections;
    const filePath = _state2.filePath;
    const newEditorState = _state2.newEditorState;
    const oldEditorState = _state2.oldEditorState;
    const selectedDiffSectionIndex = _state2.selectedDiffSectionIndex;

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-diff-view-container' },
      _reactForAtom.React.createElement((_DiffViewToolbar || _load_DiffViewToolbar()).default, {
        diffSections: diffSections,
        filePath: filePath,
        selectedDiffSectionIndex: selectedDiffSectionIndex,
        newRevisionTitle: newEditorState.revisionTitle,
        oldRevisionTitle: oldEditorState.revisionTitle,
        onSwitchMode: this._onChangeMode,
        onSwitchToEditor: this._onSwitchToEditor,
        onNavigateToDiffSection: this._handleNavigateToDiffSection
      }),
      _reactForAtom.React.createElement('div', { className: 'nuclide-diff-view-component', ref: 'paneContainer' })
    );
  }

  _onSwitchToEditor() {
    const diffViewNode = _reactForAtom.ReactDOM.findDOMNode(this);

    if (!diffViewNode) {
      throw new Error('Diff View DOM needs to be attached to switch to editor mode');
    }

    atom.commands.dispatch(diffViewNode, 'nuclide-diff-view:switch-to-editor');
  }

  _onTimelineChangeRevision(revision) {
    this.props.diffModel.setCompareRevision(revision);
  }

  _onDidChangeScrollTop() {
    const editorElements = [this._oldEditorComponent.getEditorDomElement(), this._newEditorComponent.getEditorDomElement()];

    const elementsScrollCenter = editorElements.map(editorElement => {
      const scrollTop = editorElement.getScrollTop();
      return scrollTop + editorElement.clientHeight / 2;
    });

    let selectedDiffSectionIndex = -1;

    const diffSections = this.state.diffSections;
    // TODO(most): Pre-compute the positions of the diff sections.
    // Q: when to invalidate (line edits, UI elements & diff reloads, ..etc.)

    for (let sectionIndex = 0; sectionIndex < diffSections.length; sectionIndex++) {
      var _diffSections$section = diffSections[sectionIndex];
      const status = _diffSections$section.status;
      const lineNumber = _diffSections$section.lineNumber;

      const textEditorElement = this._diffSectionStatusToEditorElement(status);
      const sectionPixelTop = textEditorElement.pixelPositionForBufferPosition([lineNumber, 0]).top;

      const sectionEditorIndex = editorElements.indexOf(textEditorElement);
      const sectionEditorScrollCenter = elementsScrollCenter[sectionEditorIndex];

      if (sectionEditorScrollCenter >= sectionPixelTop) {
        selectedDiffSectionIndex = sectionIndex;
      }
    }

    this.setState({ selectedDiffSectionIndex: selectedDiffSectionIndex });
  }

  /**
   * Updates the line diff state on active file state change.
   */
  _updateLineDiffState(fileState) {
    const filePath = fileState.filePath;
    const isLoadingFileDiff = fileState.isLoadingFileDiff;
    const oldContents = fileState.oldContents;
    const newContents = fileState.newContents;
    const inlineComponents = fileState.inlineComponents;
    const fromRevisionTitle = fileState.fromRevisionTitle;
    const toRevisionTitle = fileState.toRevisionTitle;


    const oldEditorElements = inlineComponents.filter(component => !component.inNewEditor);
    const newEditorElements = inlineComponents.filter(component => component.inNewEditor);

    var _computeDiff = (0, (_diffUtils || _load_diffUtils()).computeDiff)(oldContents, newContents);

    const addedLines = _computeDiff.addedLines;
    const removedLines = _computeDiff.removedLines;
    const oldLineOffsets = _computeDiff.oldLineOffsets;
    const newLineOffsets = _computeDiff.newLineOffsets;


    const oldEditorState = {
      revisionTitle: fromRevisionTitle,
      text: oldContents,
      offsets: oldLineOffsets,
      highlightedLines: {
        added: [],
        removed: removedLines
      },
      inlineElements: oldEditorElements
    };
    const newEditorState = {
      revisionTitle: toRevisionTitle,
      text: newContents,
      offsets: newLineOffsets,
      highlightedLines: {
        added: addedLines,
        removed: []
      },
      inlineElements: newEditorElements
    };

    const diffSections = (0, (_diffUtils || _load_diffUtils()).computeDiffSections)(addedLines, removedLines, oldLineOffsets, newLineOffsets);

    this.setState({
      diffSections: diffSections,
      filePath: filePath,
      isLoadingFileDiff: isLoadingFileDiff,
      newEditorState: newEditorState,
      oldEditorState: oldEditorState
    });
  }
};
exports.default = DiffViewComponent;
module.exports = exports['default'];