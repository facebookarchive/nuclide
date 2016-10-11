Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _nuclideUiMultiRootChangedFilesView;

function _load_nuclideUiMultiRootChangedFilesView() {
  return _nuclideUiMultiRootChangedFilesView = require('../../nuclide-ui/MultiRootChangedFilesView');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

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

var _commonsAtomCreatePaneContainer;

function _load_commonsAtomCreatePaneContainer() {
  return _commonsAtomCreatePaneContainer = _interopRequireDefault(require('../../commons-atom/create-pane-container'));
}

var _commonsAtomTextEditor;

function _load_commonsAtomTextEditor() {
  return _commonsAtomTextEditor = require('../../commons-atom/text-editor');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _nuclideHgGitBridgeLibUtils;

function _load_nuclideHgGitBridgeLibUtils() {
  return _nuclideHgGitBridgeLibUtils = require('../../nuclide-hg-git-bridge/lib/utils');
}

var _nuclideUiLoadingSpinner;

function _load_nuclideUiLoadingSpinner() {
  return _nuclideUiLoadingSpinner = require('../../nuclide-ui/LoadingSpinner');
}

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

var CachedPublishComponent = undefined;
function getPublishComponent() {
  if (CachedPublishComponent == null) {
    // Try requiring private module
    try {
      // $FlowFB

      var _require = require('./fb/DiffViewPublishForm');

      var DiffViewPublishForm = _require.DiffViewPublishForm;

      CachedPublishComponent = DiffViewPublishForm;
    } catch (ex) {
      CachedPublishComponent = (_DiffPublishView || _load_DiffPublishView()).default;
    }
  }
  return CachedPublishComponent;
}

var CachedDiffComponent = undefined;
function getDiffComponent() {
  if (CachedDiffComponent == null) {
    // Try requiring private module
    try {
      // $FlowFB

      var _require2 = require('./fb/DiffViewCreateForm');

      var DiffViewCreateForm = _require2.DiffViewCreateForm;

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
    middleScrollOffsetLineNumber: 0,
    mode: (_constants || _load_constants()).DiffMode.BROWSE_MODE,
    newEditorState: initialEditorState(),
    offsetLineCount: 0,
    oldEditorState: initialEditorState(),
    toolbarVisible: true
  };
}

var EMPTY_FUNCTION = function EMPTY_FUNCTION() {};
var SCROLL_FIRST_CHANGE_DELAY_MS = 100;

var DiffViewComponent = (function (_React$Component) {
  _inherits(DiffViewComponent, _React$Component);

  function DiffViewComponent(props) {
    _classCallCheck(this, DiffViewComponent);

    _get(Object.getPrototypeOf(DiffViewComponent.prototype), 'constructor', this).call(this, props);
    this.state = getInitialState();
    this._onModelStateChange = this._onModelStateChange.bind(this);
    this._updateLineDiffState = this._updateLineDiffState.bind(this);
    this._onTimelineChangeRevision = this._onTimelineChangeRevision.bind(this);
    this._handleNavigateToDiffSection = this._handleNavigateToDiffSection.bind(this);
    this._onDidUpdateTextEditorElement = this._onDidUpdateTextEditorElement.bind(this);
    this._onChangeMode = this._onChangeMode.bind(this);
    this._onSwitchToEditor = this._onSwitchToEditor.bind(this);
    this._onDidChangeScrollTop = this._onDidChangeScrollTop.bind(this);
    this._readonlyBuffer = new (_atom || _load_atom()).TextBuffer();
    this._subscriptions = new (_atom || _load_atom()).CompositeDisposable();
  }

  _createClass(DiffViewComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var _props = this.props;
      var diffModel = _props.diffModel;
      var tryTriggerNux = _props.tryTriggerNux;

      this._subscriptions.add(diffModel.onDidUpdateState(function () {
        _this._updateLineDiffState(diffModel.getState());
        _this._renderTree();
      }));
      this._subscriptions.add(diffModel.onDidUpdateState(this._onModelStateChange));
      this._subscriptions.add(atom.workspace.onDidChangeActivePaneItem(function (activeItem) {
        if (activeItem != null && activeItem.tagName === 'NUCLIDE-DIFF-VIEW') {
          // Re-render on activation.
          _this._updateLineDiffState(diffModel.getState());
        }
      }));

      this._paneContainer = (0, (_commonsAtomCreatePaneContainer || _load_commonsAtomCreatePaneContainer()).default)();
      // The changed files status tree takes 1/5 of the width and lives on the right most,
      // while being vertically splt with the revision timeline stack pane.
      var topPane = this._newEditorPane = this._paneContainer.getActivePane();
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

      (_reactForAtom || _load_reactForAtom()).ReactDOM.findDOMNode(this.refs.paneContainer).appendChild(atom.views.getView(this._paneContainer));

      this._updateLineDiffState(diffModel.getState());

      tryTriggerNux();
    }
  }, {
    key: '_onModelStateChange',
    value: function _onModelStateChange() {
      this.setState({});
    }
  }, {
    key: '_setupSyncScroll',
    value: function _setupSyncScroll() {
      if (this._oldEditorComponent == null || this._newEditorComponent == null) {
        return;
      }
      var oldTextEditorElement = this._oldEditorComponent.getEditorDomElement();
      var newTextEditorElement = this._newEditorComponent.getEditorDomElement();
      var syncScroll = this._syncScroll;
      if (syncScroll != null) {
        syncScroll.dispose();
        this._subscriptions.remove(syncScroll);
      }
      this._syncScroll = new (_SyncScroll || _load_SyncScroll()).default(oldTextEditorElement, newTextEditorElement);
      this._subscriptions.add(this._syncScroll);
    }
  }, {
    key: '_scrollToFirstHighlightedLine',
    value: function _scrollToFirstHighlightedLine() {
      var _this2 = this;

      var filePath = this.state.filePath;

      // Schedule scroll to first line after all lines have been rendered.
      var scrollTimeout = setTimeout(function () {
        _this2._subscriptions.remove(clearScrollTimeoutSubscription);
        var diffSections = _this2.state.diffSections;

        if (_this2.state.filePath !== filePath || diffSections.length === 0) {
          return;
        }

        var _diffSections$0 = diffSections[0];
        var status = _diffSections$0.status;
        var lineNumber = _diffSections$0.lineNumber;

        _this2._handleNavigateToDiffSection(status, lineNumber);
      }, SCROLL_FIRST_CHANGE_DELAY_MS);
      var clearScrollTimeoutSubscription = new (_atom || _load_atom()).Disposable(function () {
        clearTimeout(scrollTimeout);
      });
      this._subscriptions.add(clearScrollTimeoutSubscription);
    }
  }, {
    key: '_onChangeMode',
    value: function _onChangeMode(mode) {
      this.props.diffModel.setViewMode(mode);
    }
  }, {
    key: '_renderDiffView',
    value: function _renderDiffView() {
      this._renderTree();
      this._renderEditors();
      this._renderNavigation();
      this._renderBottomRightPane();
    }
  }, {
    key: '_renderBottomRightPane',
    value: function _renderBottomRightPane() {
      var _props$diffModel$getState = this.props.diffModel.getState();

      var viewMode = _props$diffModel$getState.viewMode;

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
          throw new Error('Invalid Diff Mode: ' + viewMode);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      this._renderDiffView();
      if (this.state.filePath !== prevState.filePath) {
        this._scrollToFirstHighlightedLine();
        this.props.diffModel.emitActiveBufferChangeModified();
      }
    }
  }, {
    key: '_renderCommitView',
    value: function _renderCommitView() {
      var _props$diffModel$getState2 = this.props.diffModel.getState();

      var commitMessage = _props$diffModel$getState2.commitMessage;
      var commitMode = _props$diffModel$getState2.commitMode;
      var commitModeState = _props$diffModel$getState2.commitModeState;
      var shouldRebaseOnAmend = _props$diffModel$getState2.shouldRebaseOnAmend;

      var DiffComponent = getDiffComponent();
      (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement(DiffComponent, {
        commitMessage: commitMessage,
        commitMode: commitMode,
        commitModeState: commitModeState,
        shouldRebaseOnAmend: shouldRebaseOnAmend,
        // `diffModel` is acting as the action creator for commit view and needs to be passed so
        // methods can be called on it.
        diffModel: this.props.diffModel
      }), this._getPaneElement(this._bottomRightPane));
    }
  }, {
    key: '_renderPublishView',
    value: function _renderPublishView() {
      var diffModel = this.props.diffModel;

      var _diffModel$getState = diffModel.getState();

      var publishMode = _diffModel$getState.publishMode;
      var publishModeState = _diffModel$getState.publishModeState;
      var publishMessage = _diffModel$getState.publishMessage;
      var headCommitMessage = _diffModel$getState.headCommitMessage;

      var PublishComponent = getPublishComponent();
      var component = (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement(PublishComponent, {
        publishModeState: publishModeState,
        message: publishMessage,
        publishMode: publishMode,
        headCommitMessage: headCommitMessage,
        diffModel: diffModel
      }), this._getPaneElement(this._bottomRightPane));
      this._publishComponent = component;
    }
  }, {
    key: '_renderTree',
    value: function _renderTree() {
      var diffModel = this.props.diffModel;

      var _diffModel$getState2 = diffModel.getState();

      var activeRepository = _diffModel$getState2.activeRepository;
      var filePath = _diffModel$getState2.filePath;
      var isLoadingSelectedFiles = _diffModel$getState2.isLoadingSelectedFiles;
      var selectedFileChanges = _diffModel$getState2.selectedFileChanges;

      var rootPaths = activeRepository != null ? [activeRepository.getProjectDirectory()] : [];

      var spinnerElement = null;
      if (isLoadingSelectedFiles) {
        spinnerElement = (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-diff-view-loading inline-block' },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiLoadingSpinner || _load_nuclideUiLoadingSpinner()).LoadingSpinner, {
            className: 'inline-block',
            size: (_nuclideUiLoadingSpinner || _load_nuclideUiLoadingSpinner()).LoadingSpinnerSizes.EXTRA_SMALL
          }),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { className: 'inline-block' },
            'Refreshing Selected Files …'
          )
        );
      }

      this._treeComponent = (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-diff-view-tree padded' },
        spinnerElement,
        (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiMultiRootChangedFilesView || _load_nuclideUiMultiRootChangedFilesView()).MultiRootChangedFilesView, {
          commandPrefix: 'nuclide-diff-view',
          fileChanges: (0, (_nuclideHgGitBridgeLibUtils || _load_nuclideHgGitBridgeLibUtils()).getMultiRootFileChanges)(selectedFileChanges, rootPaths),
          selectedFile: filePath,
          onFileChosen: diffModel.diffFile.bind(diffModel)
        })
      ), this._getPaneElement(this._treePane));
    }
  }, {
    key: '_renderEditors',
    value: function _renderEditors() {
      var _state = this.state;
      var filePath = _state.filePath;
      var oldState = _state.oldEditorState;
      var newState = _state.newEditorState;

      var oldEditorComponent = (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement((_DiffViewEditorPane || _load_DiffViewEditorPane()).default, {
        headerTitle: oldState.revisionTitle,
        textBuffer: this._readonlyBuffer,
        filePath: filePath,
        offsets: oldState.offsets,
        highlightedLines: oldState.highlightedLines,
        textContent: oldState.text,
        inlineElements: oldState.inlineElements,
        readOnly: true,
        onDidChangeScrollTop: this._onDidChangeScrollTop,
        onDidUpdateTextEditorElement: EMPTY_FUNCTION
      }), this._getPaneElement(this._oldEditorPane));
      (0, (_assert || _load_assert()).default)(oldEditorComponent instanceof (_DiffViewEditorPane || _load_DiffViewEditorPane()).default);
      this._oldEditorComponent = oldEditorComponent;
      var textBuffer = (0, (_commonsAtomTextEditor || _load_commonsAtomTextEditor()).bufferForUri)(filePath);
      var newEditorComponent = (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement((_DiffViewEditorPane || _load_DiffViewEditorPane()).default, {
        headerTitle: newState.revisionTitle,
        textBuffer: textBuffer,
        filePath: filePath,
        offsets: newState.offsets,
        highlightedLines: newState.highlightedLines,
        inlineElements: newState.inlineElements,
        onDidUpdateTextEditorElement: this._onDidUpdateTextEditorElement,
        readOnly: false
      }), this._getPaneElement(this._newEditorPane));
      (0, (_assert || _load_assert()).default)(newEditorComponent instanceof (_DiffViewEditorPane || _load_DiffViewEditorPane()).default);
      this._newEditorComponent = newEditorComponent;
    }
  }, {
    key: '_onDidUpdateTextEditorElement',
    value: function _onDidUpdateTextEditorElement() {
      this._setupSyncScroll();
    }
  }, {
    key: '_renderTimelineView',
    value: function _renderTimelineView() {
      var component = (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement((_DiffTimelineView || _load_DiffTimelineView()).default, {
        diffModel: this.props.diffModel,
        onSelectionChange: this._onTimelineChangeRevision
      }), this._getPaneElement(this._bottomRightPane));
      (0, (_assert || _load_assert()).default)(component instanceof (_DiffTimelineView || _load_DiffTimelineView()).default);
      this._timelineComponent = component;
    }
  }, {
    key: '_renderNavigation',
    value: function _renderNavigation() {
      var _state2 = this.state;
      var diffSections = _state2.diffSections;
      var offsetLineCount = _state2.offsetLineCount;

      var navigationPaneElement = this._getPaneElement(this._navigationPane);
      var component = (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement((_DiffNavigationBar || _load_DiffNavigationBar()).default, {
        elementHeight: navigationPaneElement.clientHeight,
        diffSections: diffSections,
        offsetLineCount: offsetLineCount,
        onNavigateToDiffSection: this._handleNavigateToDiffSection
      }), navigationPaneElement);
      (0, (_assert || _load_assert()).default)(component instanceof (_DiffNavigationBar || _load_DiffNavigationBar()).default);
      this._navigationComponent = component;
    }
  }, {
    key: '_handleNavigateToDiffSection',
    value: function _handleNavigateToDiffSection(diffSectionStatus, scrollToLineNumber) {
      var textEditorElement = this._diffSectionStatusToEditorElement(diffSectionStatus);
      var textEditor = textEditorElement.getModel();
      var pixelPositionTop = textEditorElement.pixelPositionForBufferPosition([scrollToLineNumber, 0]).top;
      // Manually calculate the scroll location, instead of using
      // `textEditor.scrollToBufferPosition([lineNumber, 0], {center: true})`
      // because that API to wouldn't center the line if it was in the visible screen range.
      var scrollTop = pixelPositionTop + textEditor.getLineHeightInPixels() / 2 - textEditorElement.clientHeight / 2;
      textEditorElement.setScrollTop(scrollTop);
    }
  }, {
    key: '_diffSectionStatusToEditorElement',
    value: function _diffSectionStatusToEditorElement(diffSectionStatus) {
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
  }, {
    key: '_getPaneElement',
    value: function _getPaneElement(pane) {
      return atom.views.getView(pane).querySelector('.item-views');
    }
  }, {
    key: '_destroyPaneDisposable',
    value: function _destroyPaneDisposable(pane) {
      var _this3 = this;

      return new (_atom || _load_atom()).Disposable(function () {
        (_reactForAtom || _load_reactForAtom()).ReactDOM.unmountComponentAtNode((_reactForAtom || _load_reactForAtom()).ReactDOM.findDOMNode(_this3._getPaneElement(pane)));
        pane.destroy();
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      var _state3 = this.state;
      var diffSections = _state3.diffSections;
      var filePath = _state3.filePath;
      var middleScrollOffsetLineNumber = _state3.middleScrollOffsetLineNumber;
      var newEditorState = _state3.newEditorState;
      var oldEditorState = _state3.oldEditorState;

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-diff-view-container' },
        (_reactForAtom || _load_reactForAtom()).React.createElement((_DiffViewToolbar || _load_DiffViewToolbar()).default, {
          diffSections: diffSections,
          filePath: filePath,
          middleScrollOffsetLineNumber: middleScrollOffsetLineNumber,
          newRevisionTitle: newEditorState.revisionTitle,
          oldRevisionTitle: oldEditorState.revisionTitle,
          onSwitchMode: this._onChangeMode,
          onSwitchToEditor: this._onSwitchToEditor,
          onNavigateToDiffSection: this._handleNavigateToDiffSection
        }),
        (_reactForAtom || _load_reactForAtom()).React.createElement('div', { className: 'nuclide-diff-view-component', ref: 'paneContainer' })
      );
    }
  }, {
    key: '_onSwitchToEditor',
    value: function _onSwitchToEditor() {
      var diffViewNode = (_reactForAtom || _load_reactForAtom()).ReactDOM.findDOMNode(this);
      (0, (_assert || _load_assert()).default)(diffViewNode, 'Diff View DOM needs to be attached to switch to editor mode');
      atom.commands.dispatch(diffViewNode, 'nuclide-diff-view:switch-to-editor');
    }
  }, {
    key: '_onTimelineChangeRevision',
    value: function _onTimelineChangeRevision(revision) {
      this.props.diffModel.setCompareRevision(revision);
    }
  }, {
    key: '_onDidChangeScrollTop',
    value: function _onDidChangeScrollTop() {
      var textEditorElement = this._oldEditorComponent.getEditorDomElement();
      var textEditor = textEditorElement.getModel();
      var linePixels = textEditor.getLineHeightInPixels();
      var middleVerticalScroll = Math.floor(textEditorElement.getScrollTop() + textEditorElement.clientHeight / 2 - linePixels / 2);
      var middleScrollOffsetLineNumber = middleVerticalScroll / linePixels;
      this.setState({ middleScrollOffsetLineNumber: middleScrollOffsetLineNumber });
    }

    /**
     * Updates the line diff state on active file state change.
     */
  }, {
    key: '_updateLineDiffState',
    value: function _updateLineDiffState(fileState) {
      var filePath = fileState.filePath;
      var oldContents = fileState.oldContents;
      var newContents = fileState.newContents;
      var inlineComponents = fileState.inlineComponents;
      var fromRevisionTitle = fileState.fromRevisionTitle;
      var toRevisionTitle = fileState.toRevisionTitle;

      var _ref = (0, (_diffUtils || _load_diffUtils()).computeDiff)(oldContents, newContents);

      var addedLines = _ref.addedLines;
      var removedLines = _ref.removedLines;
      var oldLineOffsets = _ref.oldLineOffsets;
      var newLineOffsets = _ref.newLineOffsets;

      var oldEditorState = {
        revisionTitle: fromRevisionTitle,
        text: oldContents,
        offsets: oldLineOffsets,
        highlightedLines: {
          added: [],
          removed: removedLines
        },
        inlineElements: inlineComponents || []
      };
      var newEditorState = {
        revisionTitle: toRevisionTitle,
        text: newContents,
        offsets: newLineOffsets,
        highlightedLines: {
          added: addedLines,
          removed: []
        },
        inlineElements: []
      };

      var diffSections = (0, (_diffUtils || _load_diffUtils()).computeDiffSections)(addedLines, removedLines, oldLineOffsets, newLineOffsets);

      var offsetLineCount = (0, (_diffUtils || _load_diffUtils()).getOffsetLineCount)(oldContents, oldLineOffsets, newContents, newLineOffsets);

      this.setState({
        diffSections: diffSections,
        filePath: filePath,
        offsetLineCount: offsetLineCount,
        newEditorState: newEditorState,
        oldEditorState: oldEditorState
      });
    }
  }]);

  return DiffViewComponent;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = DiffViewComponent;
module.exports = exports.default;

// A bound function that when invoked will try to trigger the Diff View NUX

// The offset of the scroll line number, being:
// `offsetOf(lineNumer(scrollTop + scrollHeight /2))`
// That helps derive which diff section are we on, next and previous sections.