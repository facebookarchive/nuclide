var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _DiffViewEditorPane2;

function _DiffViewEditorPane() {
  return _DiffViewEditorPane2 = _interopRequireDefault(require('./DiffViewEditorPane'));
}

var _DiffViewTree2;

function _DiffViewTree() {
  return _DiffViewTree2 = _interopRequireDefault(require('./DiffViewTree'));
}

var _SyncScroll2;

function _SyncScroll() {
  return _SyncScroll2 = _interopRequireDefault(require('./SyncScroll'));
}

var _DiffTimelineView2;

function _DiffTimelineView() {
  return _DiffTimelineView2 = _interopRequireDefault(require('./DiffTimelineView'));
}

var _DiffViewToolbar2;

function _DiffViewToolbar() {
  return _DiffViewToolbar2 = _interopRequireDefault(require('./DiffViewToolbar'));
}

var _DiffNavigationBar2;

function _DiffNavigationBar() {
  return _DiffNavigationBar2 = _interopRequireDefault(require('./DiffNavigationBar'));
}

var _DiffCommitView2;

function _DiffCommitView() {
  return _DiffCommitView2 = _interopRequireDefault(require('./DiffCommitView'));
}

var _DiffPublishView2;

function _DiffPublishView() {
  return _DiffPublishView2 = _interopRequireDefault(require('./DiffPublishView'));
}

var _diffUtils2;

function _diffUtils() {
  return _diffUtils2 = require('./diff-utils');
}

var _commonsAtomCreatePaneContainer2;

function _commonsAtomCreatePaneContainer() {
  return _commonsAtomCreatePaneContainer2 = _interopRequireDefault(require('../../commons-atom/create-pane-container'));
}

var _commonsAtomTextEditor2;

function _commonsAtomTextEditor() {
  return _commonsAtomTextEditor2 = require('../../commons-atom/text-editor');
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
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

var EMPTY_FUNCTION = function EMPTY_FUNCTION() {};
var SCROLL_FIRST_CHANGE_DELAY_MS = 100;

var DiffViewComponent = (function (_React$Component) {
  _inherits(DiffViewComponent, _React$Component);

  function DiffViewComponent(props) {
    _classCallCheck(this, DiffViewComponent);

    _get(Object.getPrototypeOf(DiffViewComponent.prototype), 'constructor', this).call(this, props);
    this.state = {
      mode: (_constants2 || _constants()).DiffMode.BROWSE_MODE,
      filePath: '',
      toolbarVisible: true,
      oldEditorState: initialEditorState(),
      newEditorState: initialEditorState()
    };
    this._onModelStateChange = this._onModelStateChange.bind(this);
    this._updateLineDiffState = this._updateLineDiffState.bind(this);
    this._onChangeNewTextEditor = this._onChangeNewTextEditor.bind(this);
    this._onTimelineChangeRevision = this._onTimelineChangeRevision.bind(this);
    this._onNavigationClick = this._onNavigationClick.bind(this);
    this._onDidUpdateTextEditorElement = this._onDidUpdateTextEditorElement.bind(this);
    this._onChangeMode = this._onChangeMode.bind(this);
    this._onSwitchToEditor = this._onSwitchToEditor.bind(this);
    this._readonlyBuffer = new (_atom2 || _atom()).TextBuffer();
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
  }

  _createClass(DiffViewComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var diffModel = this.props.diffModel;

      this._subscriptions.add(diffModel.onActiveFileUpdates(function (activeFileState) {
        _this._updateLineDiffState(activeFileState);
        // The diff tree needs to update the active diffed file.
        // TODO(most): merge ActiveFileState into DiffModel's State.
        _this._renderTree();
      }));
      this._subscriptions.add(diffModel.onDidUpdateState(this._onModelStateChange));
      this._subscriptions.add(atom.workspace.onDidChangeActivePaneItem(function (activeItem) {
        if (activeItem != null && activeItem.tagName === 'NUCLIDE-DIFF-VIEW') {
          // Re-render on activation.
          _this._updateLineDiffState(diffModel.getActiveFileState());
        }
      }));

      this._paneContainer = (0, (_commonsAtomCreatePaneContainer2 || _commonsAtomCreatePaneContainer()).default)();
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

      (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.paneContainer).appendChild(atom.views.getView(this._paneContainer));

      this._updateLineDiffState(diffModel.getActiveFileState());
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
      this._syncScroll = new (_SyncScroll2 || _SyncScroll()).default(oldTextEditorElement, newTextEditorElement);
      this._subscriptions.add(this._syncScroll);
    }
  }, {
    key: '_scrollToFirstHighlightedLine',
    value: function _scrollToFirstHighlightedLine() {
      var _this2 = this;

      // Schedule scroll to first line after all lines have been rendered.
      var _state = this.state;
      var oldEditorState = _state.oldEditorState;
      var newEditorState = _state.newEditorState;
      var filePath = _state.filePath;

      var removedLines = oldEditorState.highlightedLines.removed;
      var addedLines = newEditorState.highlightedLines.added;
      if (addedLines.length === 0 && removedLines.length === 0) {
        return;
      }
      var firstRemovedLine = (0, (_diffUtils2 || _diffUtils()).getOffsetLineNumber)(removedLines[0] || 0, oldEditorState.offsets);
      var firstAddedLine = (0, (_diffUtils2 || _diffUtils()).getOffsetLineNumber)(addedLines[0] || 0, newEditorState.offsets);
      var scrollTimeout = setTimeout(function () {
        _this2._subscriptions.remove(clearScrollTimeoutSubscription);
        if (_this2.state.filePath !== filePath) {
          return;
        }
        if (addedLines.length === 0 || removedLines.length > 0 && firstRemovedLine < firstAddedLine) {
          _this2._oldEditorComponent.scrollToScreenLine(firstRemovedLine);
        } else {
          _this2._newEditorComponent.scrollToScreenLine(firstAddedLine);
        }
      }, SCROLL_FIRST_CHANGE_DELAY_MS);
      var clearScrollTimeoutSubscription = new (_atom2 || _atom()).Disposable(function () {
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
        case (_constants2 || _constants()).DiffMode.BROWSE_MODE:
          this._renderTimelineView();
          this._commitComponent = null;
          this._publishComponent = null;
          break;
        case (_constants2 || _constants()).DiffMode.COMMIT_MODE:
          this._renderCommitView();
          this._timelineComponent = null;
          this._publishComponent = null;
          break;
        case (_constants2 || _constants()).DiffMode.PUBLISH_MODE:
          this._renderPublishView();
          this._commitComponent = null;
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

      var component = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_DiffCommitView2 || _DiffCommitView()).default, {
        commitMessage: commitMessage,
        commitMode: commitMode,
        commitModeState: commitModeState,
        // `diffModel` is acting as the action creator for commit view and needs to be passed so
        // methods can be called on it.
        diffModel: this.props.diffModel
      }), this._getPaneElement(this._bottomRightPane));
      (0, (_assert2 || _assert()).default)(component instanceof (_DiffCommitView2 || _DiffCommitView()).default);
      this._commitComponent = component;
    }
  }, {
    key: '_renderPublishView',
    value: function _renderPublishView() {
      var diffModel = this.props.diffModel;

      var _diffModel$getState = diffModel.getState();

      var publishMode = _diffModel$getState.publishMode;
      var publishModeState = _diffModel$getState.publishModeState;
      var publishMessage = _diffModel$getState.publishMessage;
      var headRevision = _diffModel$getState.headRevision;

      var component = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_DiffPublishView2 || _DiffPublishView()).default, {
        publishModeState: publishModeState,
        message: publishMessage,
        publishMode: publishMode,
        headRevision: headRevision,
        diffModel: diffModel
      }), this._getPaneElement(this._bottomRightPane));
      (0, (_assert2 || _assert()).default)(component instanceof (_DiffPublishView2 || _DiffPublishView()).default);
      this._publishComponent = component;
    }
  }, {
    key: '_renderTree',
    value: function _renderTree() {
      var diffModel = this.props.diffModel;

      var _diffModel$getState2 = diffModel.getState();

      var selectedFileChanges = _diffModel$getState2.selectedFileChanges;
      var showNonHgRepos = _diffModel$getState2.showNonHgRepos;

      var _diffModel$getActiveFileState = diffModel.getActiveFileState();

      var filePath = _diffModel$getActiveFileState.filePath;

      this._treeComponent = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-diff-view-tree padded' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_DiffViewTree2 || _DiffViewTree()).default, {
          activeFilePath: filePath,
          fileChanges: selectedFileChanges,
          showNonHgRepos: showNonHgRepos,
          diffModel: diffModel
        })
      ), this._getPaneElement(this._treePane));
    }
  }, {
    key: '_renderEditors',
    value: function _renderEditors() {
      var _state2 = this.state;
      var filePath = _state2.filePath;
      var oldState = _state2.oldEditorState;
      var newState = _state2.newEditorState;

      var oldEditorComponent = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_DiffViewEditorPane2 || _DiffViewEditorPane()).default, {
        headerTitle: oldState.revisionTitle,
        textBuffer: this._readonlyBuffer,
        filePath: filePath,
        offsets: oldState.offsets,
        highlightedLines: oldState.highlightedLines,
        textContent: oldState.text,
        inlineElements: oldState.inlineElements,
        readOnly: true,
        onChange: EMPTY_FUNCTION,
        onDidUpdateTextEditorElement: EMPTY_FUNCTION
      }), this._getPaneElement(this._oldEditorPane));
      (0, (_assert2 || _assert()).default)(oldEditorComponent instanceof (_DiffViewEditorPane2 || _DiffViewEditorPane()).default);
      this._oldEditorComponent = oldEditorComponent;
      var textBuffer = (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).bufferForUri)(filePath);
      var newEditorComponent = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_DiffViewEditorPane2 || _DiffViewEditorPane()).default, {
        headerTitle: newState.revisionTitle,
        textBuffer: textBuffer,
        filePath: filePath,
        offsets: newState.offsets,
        highlightedLines: newState.highlightedLines,
        inlineElements: newState.inlineElements,
        onDidUpdateTextEditorElement: this._onDidUpdateTextEditorElement,
        readOnly: false,
        onChange: this._onChangeNewTextEditor
      }), this._getPaneElement(this._newEditorPane));
      (0, (_assert2 || _assert()).default)(newEditorComponent instanceof (_DiffViewEditorPane2 || _DiffViewEditorPane()).default);
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
      var component = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_DiffTimelineView2 || _DiffTimelineView()).default, {
        diffModel: this.props.diffModel,
        onSelectionChange: this._onTimelineChangeRevision
      }), this._getPaneElement(this._bottomRightPane));
      (0, (_assert2 || _assert()).default)(component instanceof (_DiffTimelineView2 || _DiffTimelineView()).default);
      this._timelineComponent = component;
    }
  }, {
    key: '_renderNavigation',
    value: function _renderNavigation() {
      var _state3 = this.state;
      var oldEditorState = _state3.oldEditorState;
      var newEditorState = _state3.newEditorState;
      var oldOffsets = oldEditorState.offsets;
      var oldLines = oldEditorState.highlightedLines;
      var oldContents = oldEditorState.text;
      var newOffsets = newEditorState.offsets;
      var newLines = newEditorState.highlightedLines;
      var newContents = newEditorState.text;

      var navigationPaneElement = this._getPaneElement(this._navigationPane);
      var component = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_DiffNavigationBar2 || _DiffNavigationBar()).default, {
        elementHeight: navigationPaneElement.clientHeight,
        addedLines: newLines.added,
        newOffsets: newOffsets,
        newContents: newContents,
        removedLines: oldLines.removed,
        oldOffsets: oldOffsets,
        oldContents: oldContents,
        onClick: this._onNavigationClick
      }), navigationPaneElement);
      (0, (_assert2 || _assert()).default)(component instanceof (_DiffNavigationBar2 || _DiffNavigationBar()).default);
      this._navigationComponent = component;
    }
  }, {
    key: '_onNavigationClick',
    value: function _onNavigationClick(lineNumber, isAddedLine) {
      var textEditorComponent = isAddedLine ? this._newEditorComponent : this._oldEditorComponent;
      (0, (_assert2 || _assert()).default)(textEditorComponent, 'Diff View Navigation Error: Non valid text editor component');
      var textEditor = textEditorComponent.getEditorModel();
      textEditor.scrollToBufferPosition([lineNumber, 0]);
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

      return new (_atom2 || _atom()).Disposable(function () {
        (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode((_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(_this3._getPaneElement(pane)));
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
      var toolbarComponent = null;
      if (this.state.toolbarVisible) {
        var _state4 = this.state;
        var _oldEditorState = _state4.oldEditorState;
        var _newEditorState = _state4.newEditorState;

        toolbarComponent = (_reactForAtom2 || _reactForAtom()).React.createElement((_DiffViewToolbar2 || _DiffViewToolbar()).default, {
          filePath: this.state.filePath,
          newRevisionTitle: _newEditorState.revisionTitle,
          oldRevisionTitle: _oldEditorState.revisionTitle,
          onSwitchMode: this._onChangeMode,
          onSwitchToEditor: this._onSwitchToEditor
        });
      }
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-diff-view-container' },
        toolbarComponent,
        (_reactForAtom2 || _reactForAtom()).React.createElement('div', { className: 'nuclide-diff-view-component', ref: 'paneContainer' })
      );
    }
  }, {
    key: '_onSwitchToEditor',
    value: function _onSwitchToEditor() {
      var diffViewNode = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this);
      (0, (_assert2 || _assert()).default)(diffViewNode, 'Diff View DOM needs to be attached to switch to editor mode');
      atom.commands.dispatch(diffViewNode, 'nuclide-diff-view:switch-to-editor');
    }
  }, {
    key: '_onChangeNewTextEditor',
    value: function _onChangeNewTextEditor(newContents) {
      this.props.diffModel.setNewContents(newContents);
    }
  }, {
    key: '_onTimelineChangeRevision',
    value: function _onTimelineChangeRevision(revision) {
      this.props.diffModel.setRevision(revision);
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

      var _ref = (0, (_diffUtils2 || _diffUtils()).computeDiff)(oldContents, newContents);

      var addedLines = _ref.addedLines;
      var removedLines = _ref.removedLines;
      var oldLineOffsets = _ref.oldLineOffsets;
      var newLineOffsets = _ref.newLineOffsets;

      // TODO(most): Sync the used comment vertical space on both editors.
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
      this.setState({
        filePath: filePath,
        oldEditorState: oldEditorState,
        newEditorState: newEditorState
      });
    }
  }]);

  return DiffViewComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = DiffViewComponent;