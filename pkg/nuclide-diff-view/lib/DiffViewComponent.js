var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _DiffViewEditorPane = require('./DiffViewEditorPane');

var _DiffViewEditorPane2 = _interopRequireDefault(_DiffViewEditorPane);

var _DiffViewTree = require('./DiffViewTree');

var _DiffViewTree2 = _interopRequireDefault(_DiffViewTree);

var _SyncScroll = require('./SyncScroll');

var _SyncScroll2 = _interopRequireDefault(_SyncScroll);

var _DiffTimelineView = require('./DiffTimelineView');

var _DiffTimelineView2 = _interopRequireDefault(_DiffTimelineView);

var _DiffViewToolbar = require('./DiffViewToolbar');

var _DiffViewToolbar2 = _interopRequireDefault(_DiffViewToolbar);

var _DiffNavigationBar = require('./DiffNavigationBar');

var _DiffNavigationBar2 = _interopRequireDefault(_DiffNavigationBar);

var _DiffCommitView = require('./DiffCommitView');

var _DiffCommitView2 = _interopRequireDefault(_DiffCommitView);

var _DiffPublishView = require('./DiffPublishView');

var _DiffPublishView2 = _interopRequireDefault(_DiffPublishView);

var _diffUtils = require('./diff-utils');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _constants = require('./constants');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

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

var DiffViewComponent = (function (_React$Component) {
  _inherits(DiffViewComponent, _React$Component);

  function DiffViewComponent(props) {
    _classCallCheck(this, DiffViewComponent);

    _get(Object.getPrototypeOf(DiffViewComponent.prototype), 'constructor', this).call(this, props);
    var toolbarVisible = _nuclideFeatureConfig2['default'].get(_constants.TOOLBAR_VISIBLE_SETTING);
    this.state = {
      mode: _constants.DiffMode.BROWSE_MODE,
      filePath: '',
      toolbarVisible: toolbarVisible,
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
    this._readonlyBuffer = new _atom.TextBuffer();
    this._subscriptions = new _atom.CompositeDisposable();
  }

  _createClass(DiffViewComponent, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this = this;

      this._subscriptions.add(_nuclideFeatureConfig2['default'].observe(_constants.TOOLBAR_VISIBLE_SETTING, function (toolbarVisible) {
        _this.setState({ toolbarVisible: toolbarVisible });
      }));
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      var diffModel = this.props.diffModel;

      this._subscriptions.add(diffModel.onActiveFileUpdates(this._updateLineDiffState));
      this._subscriptions.add(diffModel.onDidUpdateState(this._onModelStateChange));
      this._subscriptions.add(atom.workspace.onDidChangeActivePaneItem(function (activeItem) {
        if (activeItem != null && activeItem.tagName === 'NUCLIDE-DIFF-VIEW') {
          // Re-render on activation.
          _this2.setState({});
        }
      }));

      this._paneContainer = (0, _nuclideAtomHelpers.createPaneContainer)();
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

      this._subscriptions.add(this._destroyPaneDisposable(this._oldEditorPane, true), this._destroyPaneDisposable(this._newEditorPane, true), this._destroyPaneDisposable(this._navigationPane, true), this._destroyPaneDisposable(this._treePane, true), this._destroyPaneDisposable(this._bottomRightPane));

      _reactForAtom.ReactDOM.findDOMNode(this.refs['paneContainer']).appendChild(atom.views.getView(this._paneContainer));

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
      this._syncScroll = new _SyncScroll2['default'](oldTextEditorElement, newTextEditorElement);
      this._subscriptions.add(this._syncScroll);
    }
  }, {
    key: '_scrollToFirstHighlightedLine',
    value: function _scrollToFirstHighlightedLine() {
      var _this3 = this;

      // Schedule scroll to first line after all lines have been rendered.
      var _state = this.state;
      var oldEditorState = _state.oldEditorState;
      var newEditorState = _state.newEditorState;

      var removedLines = oldEditorState.highlightedLines.removed;
      var addedLines = newEditorState.highlightedLines.added;
      if (addedLines.length === 0 && removedLines.length === 0) {
        return;
      }
      var firstRemovedLine = (0, _diffUtils.getOffsetLineNumber)(removedLines[0] || 0, oldEditorState.offsets);
      var firstAddedLine = (0, _diffUtils.getOffsetLineNumber)(addedLines[0] || 0, newEditorState.offsets);
      setImmediate(function () {
        if (addedLines.length === 0 || removedLines.length > 0 && firstRemovedLine < firstAddedLine) {
          _this3._oldEditorComponent.scrollToScreenLine(firstRemovedLine);
        } else {
          _this3._newEditorComponent.scrollToScreenLine(firstAddedLine);
        }
      });
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
        case _constants.DiffMode.BROWSE_MODE:
          this._renderTimelineView();
          this._commitComponent = null;
          this._publishComponent = null;
          break;
        case _constants.DiffMode.COMMIT_MODE:
          this._renderCommitView();
          this._timelineComponent = null;
          this._publishComponent = null;
          break;
        case _constants.DiffMode.PUBLISH_MODE:
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

      this._commitComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_DiffCommitView2['default'], {
        commitMessage: commitMessage,
        commitMode: commitMode,
        commitModeState: commitModeState,
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
      var headRevision = _diffModel$getState.headRevision;

      this._publishComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_DiffPublishView2['default'], {
        publishModeState: publishModeState,
        message: publishMessage,
        publishMode: publishMode,
        headRevision: headRevision,
        diffModel: diffModel
      }), this._getPaneElement(this._bottomRightPane));
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

      this._treeComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-view-tree padded' },
        _reactForAtom.React.createElement(_DiffViewTree2['default'], {
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

      this._oldEditorComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_DiffViewEditorPane2['default'], {
        headerTitle: oldState.revisionTitle,
        textBuffer: this._readonlyBuffer,
        filePath: filePath,
        offsets: oldState.offsets,
        highlightedLines: oldState.highlightedLines,
        savedContents: oldState.text,
        initialTextContent: oldState.text,
        inlineElements: oldState.inlineElements,
        readOnly: true,
        onChange: EMPTY_FUNCTION,
        onDidUpdateTextEditorElement: EMPTY_FUNCTION
      }), this._getPaneElement(this._oldEditorPane));
      var textBuffer = (0, _nuclideAtomHelpers.bufferForUri)(filePath);
      this._newEditorComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_DiffViewEditorPane2['default'], {
        headerTitle: newState.revisionTitle,
        textBuffer: textBuffer,
        filePath: filePath,
        offsets: newState.offsets,
        highlightedLines: newState.highlightedLines,
        initialTextContent: newState.text,
        savedContents: newState.savedContents,
        inlineElements: newState.inlineElements,
        onDidUpdateTextEditorElement: this._onDidUpdateTextEditorElement,
        readOnly: false,
        onChange: this._onChangeNewTextEditor
      }), this._getPaneElement(this._newEditorPane));
    }
  }, {
    key: '_onDidUpdateTextEditorElement',
    value: function _onDidUpdateTextEditorElement() {
      this._setupSyncScroll();
    }
  }, {
    key: '_renderTimelineView',
    value: function _renderTimelineView() {
      this._timelineComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_DiffTimelineView2['default'], {
        diffModel: this.props.diffModel,
        onSelectionChange: this._onTimelineChangeRevision
      }), this._getPaneElement(this._bottomRightPane));
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
      this._navigationComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_DiffNavigationBar2['default'], {
        elementHeight: navigationPaneElement.clientHeight,
        addedLines: newLines.added,
        newOffsets: newOffsets,
        newContents: newContents,
        removedLines: oldLines.removed,
        oldOffsets: oldOffsets,
        oldContents: oldContents,
        onClick: this._onNavigationClick
      }), navigationPaneElement);
    }
  }, {
    key: '_onNavigationClick',
    value: function _onNavigationClick(lineNumber, isAddedLine) {
      var textEditorComponent = isAddedLine ? this._newEditorComponent : this._oldEditorComponent;
      (0, _assert2['default'])(textEditorComponent, 'Diff View Navigation Error: Non valid text editor component');
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
      return new _atom.Disposable(function () {
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
        var _props$diffModel$getState3 = this.props.diffModel.getState();

        var viewMode = _props$diffModel$getState3.viewMode;
        var _state4 = this.state;
        var _oldEditorState = _state4.oldEditorState;
        var _newEditorState = _state4.newEditorState;

        toolbarComponent = _reactForAtom.React.createElement(_DiffViewToolbar2['default'], {
          filePath: this.state.filePath,
          diffMode: viewMode,
          newRevisionTitle: _newEditorState.revisionTitle,
          oldRevisionTitle: _oldEditorState.revisionTitle,
          onSwitchMode: this._onChangeMode,
          onSwitchToEditor: this._onSwitchToEditor
        });
      }
      return _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-view-container' },
        toolbarComponent,
        _reactForAtom.React.createElement('div', { className: 'nuclide-diff-view-component', ref: 'paneContainer' })
      );
    }
  }, {
    key: '_onSwitchToEditor',
    value: function _onSwitchToEditor() {
      var diffViewNode = _reactForAtom.ReactDOM.findDOMNode(this);
      (0, _assert2['default'])(diffViewNode, 'Diff View DOM needs to be attached to switch to editor mode');
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
      var savedContents = fileState.savedContents;
      var inlineComponents = fileState.inlineComponents;
      var fromRevisionTitle = fileState.fromRevisionTitle;
      var toRevisionTitle = fileState.toRevisionTitle;

      var _computeDiff = (0, _diffUtils.computeDiff)(oldContents, newContents);

      var addedLines = _computeDiff.addedLines;
      var removedLines = _computeDiff.removedLines;
      var oldLineOffsets = _computeDiff.oldLineOffsets;
      var newLineOffsets = _computeDiff.newLineOffsets;

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
        savedContents: savedContents,
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
})(_reactForAtom.React.Component);

module.exports = DiffViewComponent;
//# sourceMappingURL=data:application/json;base64,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QUkvRCxVQUFNLGNBQWMsR0FBRztBQUNyQixxQkFBYSxFQUFFLGlCQUFpQjtBQUNoQyxZQUFJLEVBQUUsV0FBVztBQUNqQixlQUFPLEVBQUUsY0FBYztBQUN2Qix3QkFBZ0IsRUFBRTtBQUNoQixlQUFLLEVBQUUsRUFBRTtBQUNULGlCQUFPLEVBQUUsWUFBWTtTQUN0QjtBQUNELHNCQUFjLEVBQUUsZ0JBQWdCLElBQUksRUFBRTtPQUN2QyxDQUFDO0FBQ0YsVUFBTSxjQUFjLEdBQUc7QUFDckIscUJBQWEsRUFBRSxlQUFlO0FBQzlCLFlBQUksRUFBRSxXQUFXO0FBQ2pCLHFCQUFhLEVBQWIsYUFBYTtBQUNiLGVBQU8sRUFBRSxjQUFjO0FBQ3ZCLHdCQUFnQixFQUFFO0FBQ2hCLGVBQUssRUFBRSxVQUFVO0FBQ2pCLGlCQUFPLEVBQUUsRUFBRTtTQUNaO0FBQ0Qsc0JBQWMsRUFBRSxFQUFFO09BQ25CLENBQUM7QUFDRixVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osZ0JBQVEsRUFBUixRQUFRO0FBQ1Isc0JBQWMsRUFBZCxjQUFjO0FBQ2Qsc0JBQWMsRUFBZCxjQUFjO09BQ2YsQ0FBQyxDQUFDO0tBQ0o7OztTQWxhRyxpQkFBaUI7R0FBUyxvQkFBTSxTQUFTOztBQXFhL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJEaWZmVmlld0NvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtGaWxlQ2hhbmdlU3RhdGUsIE9mZnNldE1hcCwgRGlmZk1vZGVUeXBlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtcbiAgVUlFbGVtZW50LFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpZmYtdWktcHJvdmlkZXItaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUsIFRleHRCdWZmZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgRGlmZlZpZXdFZGl0b3JQYW5lIGZyb20gJy4vRGlmZlZpZXdFZGl0b3JQYW5lJztcbmltcG9ydCBEaWZmVmlld1RyZWUgZnJvbSAnLi9EaWZmVmlld1RyZWUnO1xuaW1wb3J0IFN5bmNTY3JvbGwgZnJvbSAnLi9TeW5jU2Nyb2xsJztcbmltcG9ydCBEaWZmVGltZWxpbmVWaWV3IGZyb20gJy4vRGlmZlRpbWVsaW5lVmlldyc7XG5pbXBvcnQgRGlmZlZpZXdUb29sYmFyIGZyb20gJy4vRGlmZlZpZXdUb29sYmFyJztcbmltcG9ydCBEaWZmTmF2aWdhdGlvbkJhciBmcm9tICcuL0RpZmZOYXZpZ2F0aW9uQmFyJztcbmltcG9ydCBEaWZmQ29tbWl0VmlldyBmcm9tICcuL0RpZmZDb21taXRWaWV3JztcbmltcG9ydCBEaWZmUHVibGlzaFZpZXcgZnJvbSAnLi9EaWZmUHVibGlzaFZpZXcnO1xuaW1wb3J0IHtjb21wdXRlRGlmZiwgZ2V0T2Zmc2V0TGluZU51bWJlcn0gZnJvbSAnLi9kaWZmLXV0aWxzJztcbmltcG9ydCB7Y3JlYXRlUGFuZUNvbnRhaW5lcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtidWZmZXJGb3JVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7XG4gIERpZmZNb2RlLFxuICBUT09MQkFSX1ZJU0lCTEVfU0VUVElORyxcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGRpZmZNb2RlbDogRGlmZlZpZXdNb2RlbDtcbn07XG5cbnR5cGUgRWRpdG9yU3RhdGUgPSB7XG4gIHJldmlzaW9uVGl0bGU6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBzYXZlZENvbnRlbnRzPzogc3RyaW5nO1xuICBvZmZzZXRzOiBPZmZzZXRNYXA7XG4gIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICBhZGRlZDogQXJyYXk8bnVtYmVyPjtcbiAgICByZW1vdmVkOiBBcnJheTxudW1iZXI+O1xuICB9O1xuICBpbmxpbmVFbGVtZW50czogQXJyYXk8VUlFbGVtZW50Pjtcbn07XG5cbnR5cGUgU3RhdGUgPSB7XG4gIGZpbGVQYXRoOiBOdWNsaWRlVXJpO1xuICBvbGRFZGl0b3JTdGF0ZTogRWRpdG9yU3RhdGU7XG4gIG5ld0VkaXRvclN0YXRlOiBFZGl0b3JTdGF0ZTtcbiAgdG9vbGJhclZpc2libGU6IGJvb2xlYW47XG59O1xuXG5mdW5jdGlvbiBpbml0aWFsRWRpdG9yU3RhdGUoKTogRWRpdG9yU3RhdGUge1xuICByZXR1cm4ge1xuICAgIHJldmlzaW9uVGl0bGU6ICcnLFxuICAgIHRleHQ6ICcnLFxuICAgIG9mZnNldHM6IG5ldyBNYXAoKSxcbiAgICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgICBhZGRlZDogW10sXG4gICAgICByZW1vdmVkOiBbXSxcbiAgICB9LFxuICAgIGlubGluZUVsZW1lbnRzOiBbXSxcbiAgfTtcbn1cblxuY29uc3QgRU1QVFlfRlVOQ1RJT04gPSAoKSA9PiB7fTtcblxuY2xhc3MgRGlmZlZpZXdDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3N5bmNTY3JvbGw6IFN5bmNTY3JvbGw7XG4gIF9vbGRFZGl0b3JQYW5lOiBhdG9tJFBhbmU7XG4gIF9vbGRFZGl0b3JDb21wb25lbnQ6IERpZmZWaWV3RWRpdG9yUGFuZTtcbiAgX3BhbmVDb250YWluZXI6IE9iamVjdDtcbiAgX25ld0VkaXRvclBhbmU6IGF0b20kUGFuZTtcbiAgX25ld0VkaXRvckNvbXBvbmVudDogRGlmZlZpZXdFZGl0b3JQYW5lO1xuICBfYm90dG9tUmlnaHRQYW5lOiBhdG9tJFBhbmU7XG4gIF90aW1lbGluZUNvbXBvbmVudDogP0RpZmZUaW1lbGluZVZpZXc7XG4gIF90cmVlUGFuZTogYXRvbSRQYW5lO1xuICBfdHJlZUNvbXBvbmVudDogUmVhY3QuQ29tcG9uZW50O1xuICBfbmF2aWdhdGlvblBhbmU6IGF0b20kUGFuZTtcbiAgX25hdmlnYXRpb25Db21wb25lbnQ6IERpZmZOYXZpZ2F0aW9uQmFyO1xuICBfY29tbWl0Q29tcG9uZW50OiA/RGlmZkNvbW1pdFZpZXc7XG4gIF9wdWJsaXNoQ29tcG9uZW50OiA/RGlmZlB1Ymxpc2hWaWV3O1xuICBfcmVhZG9ubHlCdWZmZXI6IGF0b20kVGV4dEJ1ZmZlcjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgY29uc3QgdG9vbGJhclZpc2libGUgPSAoKGZlYXR1cmVDb25maWcuZ2V0KFRPT0xCQVJfVklTSUJMRV9TRVRUSU5HKTogYW55KTogYm9vbGVhbik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG1vZGU6IERpZmZNb2RlLkJST1dTRV9NT0RFLFxuICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgdG9vbGJhclZpc2libGUsXG4gICAgICBvbGRFZGl0b3JTdGF0ZTogaW5pdGlhbEVkaXRvclN0YXRlKCksXG4gICAgICBuZXdFZGl0b3JTdGF0ZTogaW5pdGlhbEVkaXRvclN0YXRlKCksXG4gICAgfTtcbiAgICAodGhpczogYW55KS5fb25Nb2RlbFN0YXRlQ2hhbmdlID0gdGhpcy5fb25Nb2RlbFN0YXRlQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3VwZGF0ZUxpbmVEaWZmU3RhdGUgPSB0aGlzLl91cGRhdGVMaW5lRGlmZlN0YXRlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2hhbmdlTmV3VGV4dEVkaXRvciA9IHRoaXMuX29uQ2hhbmdlTmV3VGV4dEVkaXRvci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24gPSB0aGlzLl9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25OYXZpZ2F0aW9uQ2xpY2sgPSB0aGlzLl9vbk5hdmlnYXRpb25DbGljay5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5fb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNoYW5nZU1vZGUgPSB0aGlzLl9vbkNoYW5nZU1vZGUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25Td2l0Y2hUb0VkaXRvciA9IHRoaXMuX29uU3dpdGNoVG9FZGl0b3IuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZWFkb25seUJ1ZmZlciA9IG5ldyBUZXh0QnVmZmVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZmVhdHVyZUNvbmZpZy5vYnNlcnZlKFRPT0xCQVJfVklTSUJMRV9TRVRUSU5HLCB0b29sYmFyVmlzaWJsZSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt0b29sYmFyVmlzaWJsZX0pO1xuICAgIH0pKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChkaWZmTW9kZWwub25BY3RpdmVGaWxlVXBkYXRlcyh0aGlzLl91cGRhdGVMaW5lRGlmZlN0YXRlKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZGlmZk1vZGVsLm9uRGlkVXBkYXRlU3RhdGUodGhpcy5fb25Nb2RlbFN0YXRlQ2hhbmdlKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbShhY3RpdmVJdGVtID0+IHtcbiAgICAgIGlmIChhY3RpdmVJdGVtICE9IG51bGwgJiYgKGFjdGl2ZUl0ZW06IGFueSkudGFnTmFtZSA9PT0gJ05VQ0xJREUtRElGRi1WSUVXJykge1xuICAgICAgICAvLyBSZS1yZW5kZXIgb24gYWN0aXZhdGlvbi5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7fSk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdGhpcy5fcGFuZUNvbnRhaW5lciA9IGNyZWF0ZVBhbmVDb250YWluZXIoKTtcbiAgICAvLyBUaGUgY2hhbmdlZCBmaWxlcyBzdGF0dXMgdHJlZSB0YWtlcyAxLzUgb2YgdGhlIHdpZHRoIGFuZCBsaXZlcyBvbiB0aGUgcmlnaHQgbW9zdCxcbiAgICAvLyB3aGlsZSBiZWluZyB2ZXJ0aWNhbGx5IHNwbHQgd2l0aCB0aGUgcmV2aXNpb24gdGltZWxpbmUgc3RhY2sgcGFuZS5cbiAgICBjb25zdCB0b3BQYW5lID0gdGhpcy5fbmV3RWRpdG9yUGFuZSA9IHRoaXMuX3BhbmVDb250YWluZXIuZ2V0QWN0aXZlUGFuZSgpO1xuICAgIHRoaXMuX2JvdHRvbVJpZ2h0UGFuZSA9IHRvcFBhbmUuc3BsaXREb3duKHtcbiAgICAgIGZsZXhTY2FsZTogMC4zLFxuICAgIH0pO1xuICAgIHRoaXMuX3RyZWVQYW5lID0gdGhpcy5fYm90dG9tUmlnaHRQYW5lLnNwbGl0TGVmdCh7XG4gICAgICBmbGV4U2NhbGU6IDAuMzUsXG4gICAgfSk7XG4gICAgdGhpcy5fbmF2aWdhdGlvblBhbmUgPSB0b3BQYW5lLnNwbGl0UmlnaHQoe1xuICAgICAgZmxleFNjYWxlOiAwLjA0NSxcbiAgICB9KTtcbiAgICB0aGlzLl9vbGRFZGl0b3JQYW5lID0gdG9wUGFuZS5zcGxpdExlZnQoe1xuICAgICAgZmxleFNjYWxlOiAxLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fcmVuZGVyRGlmZlZpZXcoKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgdGhpcy5fZGVzdHJveVBhbmVEaXNwb3NhYmxlKHRoaXMuX29sZEVkaXRvclBhbmUsIHRydWUpLFxuICAgICAgdGhpcy5fZGVzdHJveVBhbmVEaXNwb3NhYmxlKHRoaXMuX25ld0VkaXRvclBhbmUsIHRydWUpLFxuICAgICAgdGhpcy5fZGVzdHJveVBhbmVEaXNwb3NhYmxlKHRoaXMuX25hdmlnYXRpb25QYW5lLCB0cnVlKSxcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl90cmVlUGFuZSwgdHJ1ZSksXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fYm90dG9tUmlnaHRQYW5lKSxcbiAgICApO1xuXG4gICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydwYW5lQ29udGFpbmVyJ10pLmFwcGVuZENoaWxkKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX3BhbmVDb250YWluZXIpLFxuICAgICk7XG5cbiAgICB0aGlzLl91cGRhdGVMaW5lRGlmZlN0YXRlKGRpZmZNb2RlbC5nZXRBY3RpdmVGaWxlU3RhdGUoKSk7XG4gIH1cblxuICBfb25Nb2RlbFN0YXRlQ2hhbmdlKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe30pO1xuICB9XG5cbiAgX3NldHVwU3luY1Njcm9sbCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50ID09IG51bGwgfHwgdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgb2xkVGV4dEVkaXRvckVsZW1lbnQgPSB0aGlzLl9vbGRFZGl0b3JDb21wb25lbnQuZ2V0RWRpdG9yRG9tRWxlbWVudCgpO1xuICAgIGNvbnN0IG5ld1RleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50LmdldEVkaXRvckRvbUVsZW1lbnQoKTtcbiAgICBjb25zdCBzeW5jU2Nyb2xsID0gdGhpcy5fc3luY1Njcm9sbDtcbiAgICBpZiAoc3luY1Njcm9sbCAhPSBudWxsKSB7XG4gICAgICBzeW5jU2Nyb2xsLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKHN5bmNTY3JvbGwpO1xuICAgIH1cbiAgICB0aGlzLl9zeW5jU2Nyb2xsID0gbmV3IFN5bmNTY3JvbGwoXG4gICAgICBvbGRUZXh0RWRpdG9yRWxlbWVudCxcbiAgICAgIG5ld1RleHRFZGl0b3JFbGVtZW50LFxuICAgICk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fc3luY1Njcm9sbCk7XG4gIH1cblxuICBfc2Nyb2xsVG9GaXJzdEhpZ2hsaWdodGVkTGluZSgpOiB2b2lkIHtcbiAgICAvLyBTY2hlZHVsZSBzY3JvbGwgdG8gZmlyc3QgbGluZSBhZnRlciBhbGwgbGluZXMgaGF2ZSBiZWVuIHJlbmRlcmVkLlxuICAgIGNvbnN0IHtvbGRFZGl0b3JTdGF0ZSwgbmV3RWRpdG9yU3RhdGV9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCByZW1vdmVkTGluZXMgPSBvbGRFZGl0b3JTdGF0ZS5oaWdobGlnaHRlZExpbmVzLnJlbW92ZWQ7XG4gICAgY29uc3QgYWRkZWRMaW5lcyA9IG5ld0VkaXRvclN0YXRlLmhpZ2hsaWdodGVkTGluZXMuYWRkZWQ7XG4gICAgaWYgKGFkZGVkTGluZXMubGVuZ3RoID09PSAwICYmIHJlbW92ZWRMaW5lcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmlyc3RSZW1vdmVkTGluZSA9IGdldE9mZnNldExpbmVOdW1iZXIoXG4gICAgICByZW1vdmVkTGluZXNbMF0gfHwgMCxcbiAgICAgIG9sZEVkaXRvclN0YXRlLm9mZnNldHMsXG4gICAgKTtcbiAgICBjb25zdCBmaXJzdEFkZGVkTGluZSA9IGdldE9mZnNldExpbmVOdW1iZXIoXG4gICAgICBhZGRlZExpbmVzWzBdIHx8IDAsXG4gICAgICBuZXdFZGl0b3JTdGF0ZS5vZmZzZXRzLFxuICAgICk7XG4gICAgc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgYWRkZWRMaW5lcy5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgKHJlbW92ZWRMaW5lcy5sZW5ndGggPiAwICYmIGZpcnN0UmVtb3ZlZExpbmUgPCBmaXJzdEFkZGVkTGluZSlcbiAgICAgICkge1xuICAgICAgICB0aGlzLl9vbGRFZGl0b3JDb21wb25lbnQuc2Nyb2xsVG9TY3JlZW5MaW5lKGZpcnN0UmVtb3ZlZExpbmUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50LnNjcm9sbFRvU2NyZWVuTGluZShmaXJzdEFkZGVkTGluZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfb25DaGFuZ2VNb2RlKG1vZGU6IERpZmZNb2RlVHlwZSk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldFZpZXdNb2RlKG1vZGUpO1xuICB9XG5cbiAgX3JlbmRlckRpZmZWaWV3KCk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlclRyZWUoKTtcbiAgICB0aGlzLl9yZW5kZXJFZGl0b3JzKCk7XG4gICAgdGhpcy5fcmVuZGVyTmF2aWdhdGlvbigpO1xuICAgIHRoaXMuX3JlbmRlckJvdHRvbVJpZ2h0UGFuZSgpO1xuICB9XG5cbiAgX3JlbmRlckJvdHRvbVJpZ2h0UGFuZSgpOiB2b2lkIHtcbiAgICBjb25zdCB7dmlld01vZGV9ID0gdGhpcy5wcm9wcy5kaWZmTW9kZWwuZ2V0U3RhdGUoKTtcbiAgICBzd2l0Y2ggKHZpZXdNb2RlKSB7XG4gICAgICBjYXNlIERpZmZNb2RlLkJST1dTRV9NT0RFOlxuICAgICAgICB0aGlzLl9yZW5kZXJUaW1lbGluZVZpZXcoKTtcbiAgICAgICAgdGhpcy5fY29tbWl0Q29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcHVibGlzaENvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaWZmTW9kZS5DT01NSVRfTU9ERTpcbiAgICAgICAgdGhpcy5fcmVuZGVyQ29tbWl0VmlldygpO1xuICAgICAgICB0aGlzLl90aW1lbGluZUNvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuX3B1Ymxpc2hDb21wb25lbnQgPSBudWxsO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRGlmZk1vZGUuUFVCTElTSF9NT0RFOlxuICAgICAgICB0aGlzLl9yZW5kZXJQdWJsaXNoVmlldygpO1xuICAgICAgICB0aGlzLl9jb21taXRDb21wb25lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLl90aW1lbGluZUNvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIERpZmYgTW9kZTogJHt2aWV3TW9kZX1gKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBQcm9wcywgcHJldlN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlckRpZmZWaWV3KCk7XG4gICAgaWYgKHRoaXMuc3RhdGUuZmlsZVBhdGggIT09IHByZXZTdGF0ZS5maWxlUGF0aCkge1xuICAgICAgdGhpcy5fc2Nyb2xsVG9GaXJzdEhpZ2hsaWdodGVkTGluZSgpO1xuICAgICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuZW1pdEFjdGl2ZUJ1ZmZlckNoYW5nZU1vZGlmaWVkKCk7XG4gICAgfVxuICB9XG5cbiAgX3JlbmRlckNvbW1pdFZpZXcoKTogdm9pZCB7XG4gICAgY29uc3Qge1xuICAgICAgY29tbWl0TWVzc2FnZSxcbiAgICAgIGNvbW1pdE1vZGUsXG4gICAgICBjb21taXRNb2RlU3RhdGUsXG4gICAgfSA9IHRoaXMucHJvcHMuZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgdGhpcy5fY29tbWl0Q29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERpZmZDb21taXRWaWV3XG4gICAgICAgIGNvbW1pdE1lc3NhZ2U9e2NvbW1pdE1lc3NhZ2V9XG4gICAgICAgIGNvbW1pdE1vZGU9e2NvbW1pdE1vZGV9XG4gICAgICAgIGNvbW1pdE1vZGVTdGF0ZT17Y29tbWl0TW9kZVN0YXRlfVxuICAgICAgICAvLyBgZGlmZk1vZGVsYCBpcyBhY3RpbmcgYXMgdGhlIGFjdGlvbiBjcmVhdG9yIGZvciBjb21taXQgdmlldyBhbmQgbmVlZHMgdG8gYmUgcGFzc2VkIHNvXG4gICAgICAgIC8vIG1ldGhvZHMgY2FuIGJlIGNhbGxlZCBvbiBpdC5cbiAgICAgICAgZGlmZk1vZGVsPXt0aGlzLnByb3BzLmRpZmZNb2RlbH1cbiAgICAgIC8+LFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fYm90dG9tUmlnaHRQYW5lKSxcbiAgICApO1xuICB9XG5cbiAgX3JlbmRlclB1Ymxpc2hWaWV3KCk6IHZvaWQge1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICBwdWJsaXNoTW9kZSxcbiAgICAgIHB1Ymxpc2hNb2RlU3RhdGUsXG4gICAgICBwdWJsaXNoTWVzc2FnZSxcbiAgICAgIGhlYWRSZXZpc2lvbixcbiAgICB9ID0gZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgdGhpcy5fcHVibGlzaENvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxEaWZmUHVibGlzaFZpZXdcbiAgICAgICAgcHVibGlzaE1vZGVTdGF0ZT17cHVibGlzaE1vZGVTdGF0ZX1cbiAgICAgICAgbWVzc2FnZT17cHVibGlzaE1lc3NhZ2V9XG4gICAgICAgIHB1Ymxpc2hNb2RlPXtwdWJsaXNoTW9kZX1cbiAgICAgICAgaGVhZFJldmlzaW9uPXtoZWFkUmV2aXNpb259XG4gICAgICAgIGRpZmZNb2RlbD17ZGlmZk1vZGVsfVxuICAgICAgLz4sXG4gICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9ib3R0b21SaWdodFBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyVHJlZSgpOiB2b2lkIHtcbiAgICBjb25zdCB7ZGlmZk1vZGVsfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3NlbGVjdGVkRmlsZUNoYW5nZXMsIHNob3dOb25IZ1JlcG9zfSA9IGRpZmZNb2RlbC5nZXRTdGF0ZSgpO1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSBkaWZmTW9kZWwuZ2V0QWN0aXZlRmlsZVN0YXRlKCk7XG4gICAgdGhpcy5fdHJlZUNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10cmVlIHBhZGRlZFwiPlxuICAgICAgICAgIDxEaWZmVmlld1RyZWVcbiAgICAgICAgICAgIGFjdGl2ZUZpbGVQYXRoPXtmaWxlUGF0aH1cbiAgICAgICAgICAgIGZpbGVDaGFuZ2VzPXtzZWxlY3RlZEZpbGVDaGFuZ2VzfVxuICAgICAgICAgICAgc2hvd05vbkhnUmVwb3M9e3Nob3dOb25IZ1JlcG9zfVxuICAgICAgICAgICAgZGlmZk1vZGVsPXtkaWZmTW9kZWx9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApLFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fdHJlZVBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyRWRpdG9ycygpOiB2b2lkIHtcbiAgICBjb25zdCB7ZmlsZVBhdGgsIG9sZEVkaXRvclN0YXRlOiBvbGRTdGF0ZSwgbmV3RWRpdG9yU3RhdGU6IG5ld1N0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgICA8RGlmZlZpZXdFZGl0b3JQYW5lXG4gICAgICAgICAgaGVhZGVyVGl0bGU9e29sZFN0YXRlLnJldmlzaW9uVGl0bGV9XG4gICAgICAgICAgdGV4dEJ1ZmZlcj17dGhpcy5fcmVhZG9ubHlCdWZmZXJ9XG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e29sZFN0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17b2xkU3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBzYXZlZENvbnRlbnRzPXtvbGRTdGF0ZS50ZXh0fVxuICAgICAgICAgIGluaXRpYWxUZXh0Q29udGVudD17b2xkU3RhdGUudGV4dH1cbiAgICAgICAgICBpbmxpbmVFbGVtZW50cz17b2xkU3RhdGUuaW5saW5lRWxlbWVudHN9XG4gICAgICAgICAgcmVhZE9ubHk9e3RydWV9XG4gICAgICAgICAgb25DaGFuZ2U9e0VNUFRZX0ZVTkNUSU9OfVxuICAgICAgICAgIG9uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQ9e0VNUFRZX0ZVTkNUSU9OfVxuICAgICAgICAvPixcbiAgICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fb2xkRWRpdG9yUGFuZSksXG4gICAgKTtcbiAgICBjb25zdCB0ZXh0QnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICB0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICAgIDxEaWZmVmlld0VkaXRvclBhbmVcbiAgICAgICAgICBoZWFkZXJUaXRsZT17bmV3U3RhdGUucmV2aXNpb25UaXRsZX1cbiAgICAgICAgICB0ZXh0QnVmZmVyPXt0ZXh0QnVmZmVyfVxuICAgICAgICAgIGZpbGVQYXRoPXtmaWxlUGF0aH1cbiAgICAgICAgICBvZmZzZXRzPXtuZXdTdGF0ZS5vZmZzZXRzfVxuICAgICAgICAgIGhpZ2hsaWdodGVkTGluZXM9e25ld1N0YXRlLmhpZ2hsaWdodGVkTGluZXN9XG4gICAgICAgICAgaW5pdGlhbFRleHRDb250ZW50PXtuZXdTdGF0ZS50ZXh0fVxuICAgICAgICAgIHNhdmVkQ29udGVudHM9e25ld1N0YXRlLnNhdmVkQ29udGVudHN9XG4gICAgICAgICAgaW5saW5lRWxlbWVudHM9e25ld1N0YXRlLmlubGluZUVsZW1lbnRzfVxuICAgICAgICAgIG9uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQ9e3RoaXMuX29uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnR9XG4gICAgICAgICAgcmVhZE9ubHk9e2ZhbHNlfVxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkNoYW5nZU5ld1RleHRFZGl0b3J9XG4gICAgICAgIC8+LFxuICAgICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9uZXdFZGl0b3JQYW5lKSxcbiAgICApO1xuICB9XG5cbiAgX29uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0dXBTeW5jU2Nyb2xsKCk7XG4gIH1cblxuICBfcmVuZGVyVGltZWxpbmVWaWV3KCk6IHZvaWQge1xuICAgIHRoaXMuX3RpbWVsaW5lQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERpZmZUaW1lbGluZVZpZXdcbiAgICAgICAgZGlmZk1vZGVsPXt0aGlzLnByb3BzLmRpZmZNb2RlbH1cbiAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2U9e3RoaXMuX29uVGltZWxpbmVDaGFuZ2VSZXZpc2lvbn1cbiAgICAgIC8+LFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fYm90dG9tUmlnaHRQYW5lKSxcbiAgICApO1xuICB9XG5cbiAgX3JlbmRlck5hdmlnYXRpb24oKTogdm9pZCB7XG4gICAgY29uc3Qge29sZEVkaXRvclN0YXRlLCBuZXdFZGl0b3JTdGF0ZX0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHtvZmZzZXRzOiBvbGRPZmZzZXRzLCBoaWdobGlnaHRlZExpbmVzOiBvbGRMaW5lcywgdGV4dDogb2xkQ29udGVudHN9ID0gb2xkRWRpdG9yU3RhdGU7XG4gICAgY29uc3Qge29mZnNldHM6IG5ld09mZnNldHMsIGhpZ2hsaWdodGVkTGluZXM6IG5ld0xpbmVzLCB0ZXh0OiBuZXdDb250ZW50c30gPSBuZXdFZGl0b3JTdGF0ZTtcbiAgICBjb25zdCBuYXZpZ2F0aW9uUGFuZUVsZW1lbnQgPSB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9uYXZpZ2F0aW9uUGFuZSk7XG4gICAgdGhpcy5fbmF2aWdhdGlvbkNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxEaWZmTmF2aWdhdGlvbkJhclxuICAgICAgICBlbGVtZW50SGVpZ2h0PXtuYXZpZ2F0aW9uUGFuZUVsZW1lbnQuY2xpZW50SGVpZ2h0fVxuICAgICAgICBhZGRlZExpbmVzPXtuZXdMaW5lcy5hZGRlZH1cbiAgICAgICAgbmV3T2Zmc2V0cz17bmV3T2Zmc2V0c31cbiAgICAgICAgbmV3Q29udGVudHM9e25ld0NvbnRlbnRzfVxuICAgICAgICByZW1vdmVkTGluZXM9e29sZExpbmVzLnJlbW92ZWR9XG4gICAgICAgIG9sZE9mZnNldHM9e29sZE9mZnNldHN9XG4gICAgICAgIG9sZENvbnRlbnRzPXtvbGRDb250ZW50c31cbiAgICAgICAgb25DbGljaz17dGhpcy5fb25OYXZpZ2F0aW9uQ2xpY2t9XG4gICAgICAvPixcbiAgICAgIG5hdmlnYXRpb25QYW5lRWxlbWVudCxcbiAgICApO1xuICB9XG5cbiAgX29uTmF2aWdhdGlvbkNsaWNrKGxpbmVOdW1iZXI6IG51bWJlciwgaXNBZGRlZExpbmU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBjb25zdCB0ZXh0RWRpdG9yQ29tcG9uZW50ID0gaXNBZGRlZExpbmUgPyB0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQgOiB0aGlzLl9vbGRFZGl0b3JDb21wb25lbnQ7XG4gICAgaW52YXJpYW50KHRleHRFZGl0b3JDb21wb25lbnQsICdEaWZmIFZpZXcgTmF2aWdhdGlvbiBFcnJvcjogTm9uIHZhbGlkIHRleHQgZWRpdG9yIGNvbXBvbmVudCcpO1xuICAgIGNvbnN0IHRleHRFZGl0b3IgPSB0ZXh0RWRpdG9yQ29tcG9uZW50LmdldEVkaXRvck1vZGVsKCk7XG4gICAgdGV4dEVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKFtsaW5lTnVtYmVyLCAwXSk7XG4gIH1cblxuICBfZ2V0UGFuZUVsZW1lbnQocGFuZTogYXRvbSRQYW5lKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiBhdG9tLnZpZXdzLmdldFZpZXcocGFuZSkucXVlcnlTZWxlY3RvcignLml0ZW0tdmlld3MnKTtcbiAgfVxuXG4gIF9kZXN0cm95UGFuZURpc3Bvc2FibGUocGFuZTogYXRvbSRQYW5lKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBwYW5lLmRlc3Ryb3koKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGxldCB0b29sYmFyQ29tcG9uZW50ID0gbnVsbDtcbiAgICBpZiAodGhpcy5zdGF0ZS50b29sYmFyVmlzaWJsZSkge1xuICAgICAgY29uc3Qge3ZpZXdNb2RlfSA9IHRoaXMucHJvcHMuZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgICBjb25zdCB7b2xkRWRpdG9yU3RhdGUsIG5ld0VkaXRvclN0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgICB0b29sYmFyQ29tcG9uZW50ID0gKFxuICAgICAgICA8RGlmZlZpZXdUb29sYmFyXG4gICAgICAgICAgZmlsZVBhdGg9e3RoaXMuc3RhdGUuZmlsZVBhdGh9XG4gICAgICAgICAgZGlmZk1vZGU9e3ZpZXdNb2RlfVxuICAgICAgICAgIG5ld1JldmlzaW9uVGl0bGU9e25ld0VkaXRvclN0YXRlLnJldmlzaW9uVGl0bGV9XG4gICAgICAgICAgb2xkUmV2aXNpb25UaXRsZT17b2xkRWRpdG9yU3RhdGUucmV2aXNpb25UaXRsZX1cbiAgICAgICAgICBvblN3aXRjaE1vZGU9e3RoaXMuX29uQ2hhbmdlTW9kZX1cbiAgICAgICAgICBvblN3aXRjaFRvRWRpdG9yPXt0aGlzLl9vblN3aXRjaFRvRWRpdG9yfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctY29udGFpbmVyXCI+XG4gICAgICAgIHt0b29sYmFyQ29tcG9uZW50fVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LWNvbXBvbmVudFwiIHJlZj1cInBhbmVDb250YWluZXJcIiAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vblN3aXRjaFRvRWRpdG9yKCk6IHZvaWQge1xuICAgIGNvbnN0IGRpZmZWaWV3Tm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGludmFyaWFudChkaWZmVmlld05vZGUsICdEaWZmIFZpZXcgRE9NIG5lZWRzIHRvIGJlIGF0dGFjaGVkIHRvIHN3aXRjaCB0byBlZGl0b3IgbW9kZScpO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZGlmZlZpZXdOb2RlLCAnbnVjbGlkZS1kaWZmLXZpZXc6c3dpdGNoLXRvLWVkaXRvcicpO1xuICB9XG5cbiAgX29uQ2hhbmdlTmV3VGV4dEVkaXRvcihuZXdDb250ZW50czogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuc2V0TmV3Q29udGVudHMobmV3Q29udGVudHMpO1xuICB9XG5cbiAgX29uVGltZWxpbmVDaGFuZ2VSZXZpc2lvbihyZXZpc2lvbjogUmV2aXNpb25JbmZvKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuc2V0UmV2aXNpb24ocmV2aXNpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGxpbmUgZGlmZiBzdGF0ZSBvbiBhY3RpdmUgZmlsZSBzdGF0ZSBjaGFuZ2UuXG4gICAqL1xuICBfdXBkYXRlTGluZURpZmZTdGF0ZShmaWxlU3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZSk6IHZvaWQge1xuICAgIGNvbnN0IHtcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgb2xkQ29udGVudHMsXG4gICAgICBuZXdDb250ZW50cyxcbiAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgICBpbmxpbmVDb21wb25lbnRzLFxuICAgICAgZnJvbVJldmlzaW9uVGl0bGUsXG4gICAgICB0b1JldmlzaW9uVGl0bGUsXG4gICAgfSA9IGZpbGVTdGF0ZTtcblxuICAgIGNvbnN0IHthZGRlZExpbmVzLCByZW1vdmVkTGluZXMsIG9sZExpbmVPZmZzZXRzLCBuZXdMaW5lT2Zmc2V0c30gPVxuICAgICAgY29tcHV0ZURpZmYob2xkQ29udGVudHMsIG5ld0NvbnRlbnRzKTtcblxuICAgIC8vIFRPRE8obW9zdCk6IFN5bmMgdGhlIHVzZWQgY29tbWVudCB2ZXJ0aWNhbCBzcGFjZSBvbiBib3RoIGVkaXRvcnMuXG4gICAgY29uc3Qgb2xkRWRpdG9yU3RhdGUgPSB7XG4gICAgICByZXZpc2lvblRpdGxlOiBmcm9tUmV2aXNpb25UaXRsZSxcbiAgICAgIHRleHQ6IG9sZENvbnRlbnRzLFxuICAgICAgb2Zmc2V0czogb2xkTGluZU9mZnNldHMsXG4gICAgICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgICAgIGFkZGVkOiBbXSxcbiAgICAgICAgcmVtb3ZlZDogcmVtb3ZlZExpbmVzLFxuICAgICAgfSxcbiAgICAgIGlubGluZUVsZW1lbnRzOiBpbmxpbmVDb21wb25lbnRzIHx8IFtdLFxuICAgIH07XG4gICAgY29uc3QgbmV3RWRpdG9yU3RhdGUgPSB7XG4gICAgICByZXZpc2lvblRpdGxlOiB0b1JldmlzaW9uVGl0bGUsXG4gICAgICB0ZXh0OiBuZXdDb250ZW50cyxcbiAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgICBvZmZzZXRzOiBuZXdMaW5lT2Zmc2V0cyxcbiAgICAgIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICAgICAgYWRkZWQ6IGFkZGVkTGluZXMsXG4gICAgICAgIHJlbW92ZWQ6IFtdLFxuICAgICAgfSxcbiAgICAgIGlubGluZUVsZW1lbnRzOiBbXSxcbiAgICB9O1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZVBhdGgsXG4gICAgICBvbGRFZGl0b3JTdGF0ZSxcbiAgICAgIG5ld0VkaXRvclN0YXRlLFxuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlZpZXdDb21wb25lbnQ7XG4iXX0=