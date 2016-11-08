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
exports.renderPublishView = renderPublishView;
exports.renderCommitView = renderCommitView;
exports.renderTimelineView = renderTimelineView;
exports.renderFileChanges = renderFileChanges;
exports.centerScrollToBufferLine = centerScrollToBufferLine;
exports.pixelRangeForNavigationSection = pixelRangeForNavigationSection;
exports.navigationSectionStatusToEditorElement = navigationSectionStatusToEditorElement;
exports.getCenterScrollSelectedNavigationIndex = getCenterScrollSelectedNavigationIndex;

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
  return _DiffNavigationBar = require('./DiffNavigationBar');
}

var _DiffCommitView;

function _load_DiffCommitView() {
  return _DiffCommitView = _interopRequireDefault(require('./DiffCommitView'));
}

var _DiffPublishView;

function _load_DiffPublishView() {
  return _DiffPublishView = _interopRequireDefault(require('./DiffPublishView'));
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

var _utils2;

function _load_utils2() {
  return _utils2 = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

let CachedCommitComponent;
function getCommitComponent() {
  if (CachedCommitComponent == null) {
    // Try requiring private module
    try {
      // $FlowFB
      var _require2 = require('./fb/DiffViewCreateForm');

      const DiffViewCreateForm = _require2.DiffViewCreateForm;

      CachedCommitComponent = DiffViewCreateForm;
    } catch (ex) {
      CachedCommitComponent = (_DiffCommitView || _load_DiffCommitView()).default;
    }
  }

  return CachedCommitComponent;
}

function renderPublishView(diffModel) {
  var _diffModel$getState = diffModel.getState(),
      _diffModel$getState$p = _diffModel$getState.publish;

  const message = _diffModel$getState$p.message,
        mode = _diffModel$getState$p.mode,
        state = _diffModel$getState$p.state,
        headRevision = _diffModel$getState.activeRepositoryState.headRevision;

  const PublishComponent = getPublishComponent();
  return _reactForAtom.React.createElement(PublishComponent, {
    publishModeState: state,
    message: message,
    publishMode: mode,
    headCommitMessage: headRevision == null ? '' : headRevision.description,
    diffModel: diffModel
  });
}

function renderCommitView(diffModel) {
  var _diffModel$getState2 = diffModel.getState(),
      _diffModel$getState2$ = _diffModel$getState2.commit;

  const message = _diffModel$getState2$.message,
        mode = _diffModel$getState2$.mode,
        state = _diffModel$getState2$.state,
        shouldRebaseOnAmend = _diffModel$getState2.shouldRebaseOnAmend;


  const CommitComponent = getCommitComponent();
  return _reactForAtom.React.createElement(CommitComponent, {
    commitMessage: message,
    commitMode: mode,
    commitModeState: state,
    shouldRebaseOnAmend: shouldRebaseOnAmend
    // `diffModel` is acting as the action creator for commit view and needs to be passed so
    // methods can be called on it.
    , diffModel: diffModel
  });
}

function renderTimelineView(diffModel) {
  const onSelectionChange = revision => diffModel.setCompareRevision(revision);
  return _reactForAtom.React.createElement((_DiffTimelineView || _load_DiffTimelineView()).default, {
    diffModel: diffModel,
    onSelectionChange: onSelectionChange
  });
}

function renderFileChanges(diffModel) {
  var _diffModel$getState3 = diffModel.getState();

  const activeRepository = _diffModel$getState3.activeRepository;
  var _diffModel$getState3$ = _diffModel$getState3.activeRepositoryState;
  const isLoadingSelectedFiles = _diffModel$getState3$.isLoadingSelectedFiles,
        selectedFiles = _diffModel$getState3$.selectedFiles,
        fileDiff = _diffModel$getState3.fileDiff;

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

  const emptyMessage = !isLoadingSelectedFiles && selectedFiles.size === 0 ? 'No file changes selected' : null;

  // Open the view, if not previously open as well as issue a diff command.
  // TODO(most): Switch to an action after migration complete to the new split UI.
  const diffFilePath = filePath => {
    atom.workspace.open((0, (_utils2 || _load_utils2()).formatDiffViewUrl)({ file: filePath }));
  };

  return _reactForAtom.React.createElement(
    'div',
    { className: 'nuclide-diff-view-tree' },
    spinnerElement,
    _reactForAtom.React.createElement((_MultiRootChangedFilesView || _load_MultiRootChangedFilesView()).MultiRootChangedFilesView, {
      commandPrefix: 'nuclide-diff-view',
      fileChanges: (0, (_utils || _load_utils()).getMultiRootFileChanges)(selectedFiles, rootPaths),
      selectedFile: fileDiff.filePath,
      onFileChosen: diffFilePath
    }),
    emptyMessage
  );
}

function centerScrollToBufferLine(textEditorElement, bufferLineNumber) {
  const textEditor = textEditorElement.getModel();
  const pixelPositionTop = textEditorElement.pixelPositionForBufferPosition([bufferLineNumber, 0]).top;
  // Manually calculate the scroll location, instead of using
  // `textEditor.scrollToBufferPosition([lineNumber, 0], {center: true})`
  // because that API to wouldn't center the line if it was in the visible screen range.
  const scrollTop = pixelPositionTop + textEditor.getLineHeightInPixels() / 2 - textEditorElement.clientHeight / 2;
  textEditorElement.setScrollTop(Math.max(scrollTop, 1));
}

function pixelRangeForNavigationSection(oldEditorElement, newEditorElement, navigationSection) {
  const status = navigationSection.status,
        lineNumber = navigationSection.lineNumber,
        lineCount = navigationSection.lineCount;

  const textEditorElement = navigationSectionStatusToEditorElement(oldEditorElement, newEditorElement, status);
  const lineHeight = textEditorElement.getModel().getLineHeightInPixels();
  return {
    top: textEditorElement.pixelPositionForBufferPosition([lineNumber, 0]).top,
    bottom: textEditorElement.pixelPositionForBufferPosition([lineNumber + lineCount - 1, 0]).top + lineHeight
  };
}

function navigationSectionStatusToEditorElement(oldEditorElement, newEditorElement, navigationSectionStatus) {
  switch (navigationSectionStatus) {
    case (_constants || _load_constants()).NavigationSectionStatus.ADDED:
    case (_constants || _load_constants()).NavigationSectionStatus.CHANGED:
    case (_constants || _load_constants()).NavigationSectionStatus.NEW_ELEMENT:
      return newEditorElement;
    case (_constants || _load_constants()).NavigationSectionStatus.REMOVED:
    case (_constants || _load_constants()).NavigationSectionStatus.OLD_ELEMENT:
      return oldEditorElement;
    default:
      throw new Error('Invalid diff section status');
  }
}

function getCenterScrollSelectedNavigationIndex(editorElements, navigationSections) {
  const elementsScrollCenter = editorElements.map(editorElement => {
    const scrollTop = editorElement.getScrollTop();
    return scrollTop + editorElement.clientHeight / 2;
  });

  let selectedSectionIndex = -1;

  // TODO(most): Pre-compute the positions of the diff sections.
  // Q: when to invalidate (line edits, UI elements & diff reloads, ..etc.)
  for (let sectionIndex = 0; sectionIndex < navigationSections.length; sectionIndex++) {
    var _navigationSections$s = navigationSections[sectionIndex];
    const status = _navigationSections$s.status,
          lineNumber = _navigationSections$s.lineNumber;

    const textEditorElement = navigationSectionStatusToEditorElement(editorElements[0], editorElements[1], status);
    const sectionPixelTop = textEditorElement.pixelPositionForBufferPosition([lineNumber, 0]).top;

    const sectionEditorIndex = editorElements.indexOf(textEditorElement);
    const sectionEditorScrollCenter = elementsScrollCenter[sectionEditorIndex];

    if (sectionEditorScrollCenter >= sectionPixelTop) {
      selectedSectionIndex = sectionIndex;
    }
  }

  return selectedSectionIndex;
}

const EMPTY_FUNCTION = () => {};
const SCROLL_FIRST_CHANGE_DELAY_MS = 100;
const DEBOUNCE_STATE_UPDATES_MS = 50;

let DiffViewComponent = class DiffViewComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleNavigateToNavigationSection = this._handleNavigateToNavigationSection.bind(this);
    this._onDidUpdateTextEditorElement = this._onDidUpdateTextEditorElement.bind(this);
    this._onSwitchToEditor = this._onSwitchToEditor.bind(this);
    this._onDidChangeScrollTop = this._onDidChangeScrollTop.bind(this);
    this._pixelRangeForNavigationSection = this._pixelRangeForNavigationSection.bind(this);
    this._readonlyBuffer = new _atom.TextBuffer();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  componentDidMount() {
    var _props = this.props;
    const diffModel = _props.diffModel,
          tryTriggerNux = _props.tryTriggerNux;

    const stateUpdates = (0, (_event || _load_event()).observableFromSubscribeFunction)(diffModel.onDidUpdateState.bind(diffModel)).map(() => diffModel.getState());
    this._subscriptions.add(_rxjsBundlesRxMinJs.Observable.merge(stateUpdates, (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.onDidChangeActivePaneItem.bind(atom.workspace))).filter(() => {
      const activeItem = atom.workspace.getActivePaneItem();
      return activeItem != null && activeItem.tagName === 'NUCLIDE-DIFF-VIEW';
    }).debounceTime(DEBOUNCE_STATE_UPDATES_MS).subscribe(() => {
      this.forceUpdate();
    }),

    // Scroll to the first navigation section when diffing a file.
    stateUpdates.map((_ref) => {
      let fileDiff = _ref.fileDiff;
      return fileDiff.filePath;
    }).distinctUntilChanged().switchMap(filePath => {
      // Clear prior subscriptions on file switch.
      if (!filePath) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      return _rxjsBundlesRxMinJs.Observable.concat(
      // Wait for the diff text to load.
      stateUpdates.filter((_ref2) => {
        let fileDiff = _ref2.fileDiff;
        return fileDiff.oldEditorState.text.length > 0;
      }).first().ignoreElements(),
      // Wait for the diff editor to render the UI state.
      _rxjsBundlesRxMinJs.Observable.interval(SCROLL_FIRST_CHANGE_DELAY_MS).first());
    }).subscribe(() => this._scrollToFirstHighlightedLine()));

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
    var _props$diffModel$getS = this.props.diffModel.getState();

    const navigationSections = _props$diffModel$getS.fileDiff.navigationSections;

    if (navigationSections.length === 0) {
      return;
    }

    var _navigationSections$ = navigationSections[0];
    const status = _navigationSections$.status,
          lineNumber = _navigationSections$.lineNumber;

    this._handleNavigateToNavigationSection(status, lineNumber);
  }

  _renderDiffView() {
    this._renderTree();
    this._renderEditors();
    this._renderNavigation();
    this._renderBottomRightPane();
  }

  _renderBottomRightPane() {
    var _props$diffModel$getS2 = this.props.diffModel.getState();

    const viewMode = _props$diffModel$getS2.viewMode;

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

  componentDidUpdate(prevProps) {
    this._renderDiffView();
    this.props.diffModel.emitActiveBufferChangeModified();
  }

  _renderCommitView() {
    _reactForAtom.ReactDOM.render(renderCommitView(this.props.diffModel), this._getPaneElement(this._bottomRightPane));
  }

  _renderPublishView() {
    this._publishComponent = _reactForAtom.ReactDOM.render(renderPublishView(this.props.diffModel), this._getPaneElement(this._bottomRightPane));
  }

  _renderTree() {
    this._treeComponent = _reactForAtom.ReactDOM.render(renderFileChanges(this.props.diffModel), this._getPaneElement(this._treePane));
  }

  _renderEditors() {
    var _props$diffModel$getS3 = this.props.diffModel.getState();

    const fileDiff = _props$diffModel$getS3.fileDiff,
          isLoadingFileDiff = _props$diffModel$getS3.isLoadingFileDiff;
    const filePath = fileDiff.filePath,
          lineMapping = fileDiff.lineMapping,
          newState = fileDiff.newEditorState,
          oldState = fileDiff.oldEditorState;

    const oldEditorComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_DiffViewEditorPane || _load_DiffViewEditorPane()).default, {
      headerTitle: oldState.revisionTitle,
      textBuffer: this._readonlyBuffer,
      filePath: filePath,
      isLoading: isLoadingFileDiff,
      offsets: oldState.offsets,
      lineMapper: lineMapping.newToOld,
      highlightedLines: oldState.highlightedLines,
      textContent: oldState.text,
      inlineElements: oldState.inlineElements,
      inlineOffsetElements: oldState.inlineOffsetElements,
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
      lineMapper: lineMapping.oldToNew,
      highlightedLines: newState.highlightedLines,
      inlineElements: newState.inlineElements,
      inlineOffsetElements: newState.inlineOffsetElements,
      onDidUpdateTextEditorElement: this._onDidUpdateTextEditorElement,
      readOnly: false
    }), this._getPaneElement(this._newEditorPane));

    if (!(newEditorComponent instanceof (_DiffViewEditorPane || _load_DiffViewEditorPane()).default)) {
      throw new Error('Invariant violation: "newEditorComponent instanceof DiffViewEditorPane"');
    }

    this._newEditorComponent = newEditorComponent;
  }

  _onDidUpdateTextEditorElement() {
    this.props.actionCreators.updateDiffEditors({
      newDiffEditor: this._newEditorComponent.getDiffEditor(),
      oldDiffEditor: this._oldEditorComponent.getDiffEditor()
    });
    this._setupSyncScroll();
  }

  _renderTimelineView() {
    this._timelineComponent = _reactForAtom.ReactDOM.render(renderTimelineView(this.props.diffModel), this._getPaneElement(this._bottomRightPane));
  }

  _renderNavigation() {
    var _props$diffModel$getS4 = this.props.diffModel.getState();

    const navigationSections = _props$diffModel$getS4.fileDiff.navigationSections;

    const navigationPaneElement = this._getPaneElement(this._navigationPane);
    const oldEditorElement = this._oldEditorComponent.getEditorDomElement();
    const newEditorElement = this._newEditorComponent.getEditorDomElement();
    const diffViewHeight = Math.max(oldEditorElement.getScrollHeight(), newEditorElement.getScrollHeight(), 1);
    const component = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_DiffNavigationBar || _load_DiffNavigationBar()).DiffNavigationBar, {
      navigationSections: navigationSections,
      navigationScale: navigationPaneElement.clientHeight / diffViewHeight,
      editorLineHeight: oldEditorElement.getModel().getLineHeightInPixels(),
      pixelRangeForNavigationSection: this._pixelRangeForNavigationSection,
      onNavigateToNavigationSection: this._handleNavigateToNavigationSection
    }), navigationPaneElement);

    if (!(component instanceof (_DiffNavigationBar || _load_DiffNavigationBar()).DiffNavigationBar)) {
      throw new Error('Invariant violation: "component instanceof DiffNavigationBar"');
    }

    this._navigationComponent = component;
  }

  _handleNavigateToNavigationSection(navigationSectionStatus, scrollToLineNumber) {
    const textEditorElement = this._navigationSectionStatusToEditorElement(navigationSectionStatus);
    centerScrollToBufferLine(textEditorElement, scrollToLineNumber);
  }

  _pixelRangeForNavigationSection(navigationSection) {
    return pixelRangeForNavigationSection(this._oldEditorComponent.getEditorDomElement(), this._newEditorComponent.getEditorDomElement(), navigationSection);
  }

  _navigationSectionStatusToEditorElement(navigationSectionStatus) {
    return navigationSectionStatusToEditorElement(this._oldEditorComponent.getEditorDomElement(), this._newEditorComponent.getEditorDomElement(), navigationSectionStatus);
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
    var _props$diffModel$getS5 = this.props.diffModel.getState().fileDiff;
    const activeSectionIndex = _props$diffModel$getS5.activeSectionIndex,
          filePath = _props$diffModel$getS5.filePath,
          newEditorState = _props$diffModel$getS5.newEditorState,
          oldEditorState = _props$diffModel$getS5.oldEditorState,
          navigationSections = _props$diffModel$getS5.navigationSections;


    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-diff-view-container' },
      _reactForAtom.React.createElement((_DiffViewToolbar || _load_DiffViewToolbar()).default, {
        navigationSections: navigationSections,
        filePath: filePath,
        selectedNavigationSectionIndex: activeSectionIndex,
        newRevisionTitle: newEditorState.revisionTitle,
        oldRevisionTitle: oldEditorState.revisionTitle,
        onSwitchToEditor: this._onSwitchToEditor,
        onNavigateToNavigationSection: this._handleNavigateToNavigationSection
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

  _onDidChangeScrollTop() {
    const editorElements = [this._oldEditorComponent.getEditorDomElement(), this._newEditorComponent.getEditorDomElement()];

    var _props$diffModel$getS6 = this.props.diffModel.getState(),
        _props$diffModel$getS7 = _props$diffModel$getS6.fileDiff;

    const navigationSections = _props$diffModel$getS7.navigationSections,
          activeSectionIndex = _props$diffModel$getS7.activeSectionIndex;

    const selectedNavigationSectionIndex = getCenterScrollSelectedNavigationIndex(editorElements, navigationSections);

    if (activeSectionIndex !== selectedNavigationSectionIndex) {
      this.props.actionCreators.updateActiveNavigationSection(selectedNavigationSectionIndex);
    }
  }
};
exports.default = DiffViewComponent;