var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
    this._handleNewOffsets = this._handleNewOffsets.bind(this);
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
        handleNewOffsets: this._handleNewOffsets,
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
        handleNewOffsets: this._handleNewOffsets,
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
    key: '_handleNewOffsets',
    value: function _handleNewOffsets(offsetsFromComponents) {
      var oldLineOffsets = new Map(this.state.oldEditorState.offsets);
      var newLineOffsets = new Map(this.state.newEditorState.offsets);
      offsetsFromComponents.forEach(function (offsetAmount, row) {
        newLineOffsets.set(row, (newLineOffsets.get(row) || 0) + offsetAmount);
        oldLineOffsets.set(row, (oldLineOffsets.get(row) || 0) + offsetAmount);
      });
      this.setState({
        oldEditorState: _extends({}, this.state.oldEditorState, { offsets: oldLineOffsets }),
        newEditorState: _extends({}, this.state.newEditorState, { offsets: newLineOffsets })
      });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWdCc0IsUUFBUTs7OztvQkFDNEIsTUFBTTs7NEJBSXpELGdCQUFnQjs7a0NBQ1Esc0JBQXNCOzs7OzRCQUM1QixnQkFBZ0I7Ozs7MEJBQ2xCLGNBQWM7Ozs7Z0NBQ1Isb0JBQW9COzs7OytCQUNyQixtQkFBbUI7Ozs7aUNBQ2pCLHFCQUFxQjs7Ozs4QkFDeEIsa0JBQWtCOzs7OytCQUNqQixtQkFBbUI7Ozs7eUJBQ0EsY0FBYzs7a0NBQzNCLDRCQUE0Qjs7eUJBS3ZELGFBQWE7O29DQUNNLDhCQUE4Qjs7OztBQXlCeEQsU0FBUyxrQkFBa0IsR0FBZ0I7QUFDekMsU0FBTztBQUNMLGlCQUFhLEVBQUUsRUFBRTtBQUNqQixRQUFJLEVBQUUsRUFBRTtBQUNSLFdBQU8sRUFBRSxJQUFJLEdBQUcsRUFBRTtBQUNsQixvQkFBZ0IsRUFBRTtBQUNoQixXQUFLLEVBQUUsRUFBRTtBQUNULGFBQU8sRUFBRSxFQUFFO0tBQ1o7QUFDRCxrQkFBYyxFQUFFLEVBQUU7R0FDbkIsQ0FBQztDQUNIOztBQUVELElBQU0sY0FBYyxHQUFHLFNBQWpCLGNBQWMsR0FBUyxFQUFFLENBQUM7O0lBRTFCLGlCQUFpQjtZQUFqQixpQkFBaUI7O0FBcUJWLFdBckJQLGlCQUFpQixDQXFCVCxLQUFZLEVBQUU7MEJBckJ0QixpQkFBaUI7O0FBc0JuQiwrQkF0QkUsaUJBQWlCLDZDQXNCYixLQUFLLEVBQUU7QUFDYixRQUFNLGNBQWMsR0FBSyxrQ0FBYyxHQUFHLG9DQUF5QixBQUFnQixDQUFDO0FBQ3BGLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxVQUFJLEVBQUUsb0JBQVMsV0FBVztBQUMxQixjQUFRLEVBQUUsRUFBRTtBQUNaLG9CQUFjLEVBQWQsY0FBYztBQUNkLG9CQUFjLEVBQUUsa0JBQWtCLEVBQUU7QUFDcEMsb0JBQWMsRUFBRSxrQkFBa0IsRUFBRTtLQUNy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dkIsd0JBQWdCLEVBQUU7QUFDaEIsZUFBSyxFQUFFLEVBQUU7QUFDVCxpQkFBTyxFQUFFLFlBQVk7U0FDdEI7QUFDRCxzQkFBYyxFQUFFLGdCQUFnQixJQUFJLEVBQUU7T0FDdkMsQ0FBQztBQUNGLFVBQU0sY0FBYyxHQUFHO0FBQ3JCLHFCQUFhLEVBQUUsZUFBZTtBQUM5QixZQUFJLEVBQUUsV0FBVztBQUNqQixxQkFBYSxFQUFiLGFBQWE7QUFDYixlQUFPLEVBQUUsY0FBYztBQUN2Qix3QkFBZ0IsRUFBRTtBQUNoQixlQUFLLEVBQUUsVUFBVTtBQUNqQixpQkFBTyxFQUFFLEVBQUU7U0FDWjtBQUNELHNCQUFjLEVBQUUsRUFBRTtPQUNuQixDQUFDO0FBQ0YsVUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGdCQUFRLEVBQVIsUUFBUTtBQUNSLHNCQUFjLEVBQWQsY0FBYztBQUNkLHNCQUFjLEVBQWQsY0FBYztPQUNmLENBQUMsQ0FBQztLQUNKOzs7U0FqYkcsaUJBQWlCO0dBQVMsb0JBQU0sU0FBUzs7QUFvYi9DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMiLCJmaWxlIjoiRGlmZlZpZXdDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RmlsZUNoYW5nZVN0YXRlLCBJbmxpbmVDb21wb25lbnQsIE9mZnNldE1hcCwgRGlmZk1vZGVUeXBlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWwgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSwgVGV4dEJ1ZmZlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBEaWZmVmlld0VkaXRvclBhbmUgZnJvbSAnLi9EaWZmVmlld0VkaXRvclBhbmUnO1xuaW1wb3J0IERpZmZWaWV3VHJlZSBmcm9tICcuL0RpZmZWaWV3VHJlZSc7XG5pbXBvcnQgU3luY1Njcm9sbCBmcm9tICcuL1N5bmNTY3JvbGwnO1xuaW1wb3J0IERpZmZUaW1lbGluZVZpZXcgZnJvbSAnLi9EaWZmVGltZWxpbmVWaWV3JztcbmltcG9ydCBEaWZmVmlld1Rvb2xiYXIgZnJvbSAnLi9EaWZmVmlld1Rvb2xiYXInO1xuaW1wb3J0IERpZmZOYXZpZ2F0aW9uQmFyIGZyb20gJy4vRGlmZk5hdmlnYXRpb25CYXInO1xuaW1wb3J0IERpZmZDb21taXRWaWV3IGZyb20gJy4vRGlmZkNvbW1pdFZpZXcnO1xuaW1wb3J0IERpZmZQdWJsaXNoVmlldyBmcm9tICcuL0RpZmZQdWJsaXNoVmlldyc7XG5pbXBvcnQge2NvbXB1dGVEaWZmLCBnZXRPZmZzZXRMaW5lTnVtYmVyfSBmcm9tICcuL2RpZmYtdXRpbHMnO1xuaW1wb3J0IHtjcmVhdGVQYW5lQ29udGFpbmVyfSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQge2J1ZmZlckZvclVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtcbiAgRGlmZk1vZGUsXG4gIFRPT0xCQVJfVklTSUJMRV9TRVRUSU5HLFxufSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9udWNsaWRlLWZlYXR1cmUtY29uZmlnJztcblxudHlwZSBQcm9wcyA9IHtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxudHlwZSBFZGl0b3JTdGF0ZSA9IHtcbiAgcmV2aXNpb25UaXRsZTogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHNhdmVkQ29udGVudHM/OiBzdHJpbmc7XG4gIG9mZnNldHM6IE9mZnNldE1hcDtcbiAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgIGFkZGVkOiBBcnJheTxudW1iZXI+O1xuICAgIHJlbW92ZWQ6IEFycmF5PG51bWJlcj47XG4gIH07XG4gIGlubGluZUVsZW1lbnRzOiBBcnJheTxJbmxpbmVDb21wb25lbnQ+O1xufVxuXG50eXBlIFN0YXRlID0ge1xuICBmaWxlUGF0aDogTnVjbGlkZVVyaTtcbiAgb2xkRWRpdG9yU3RhdGU6IEVkaXRvclN0YXRlO1xuICBuZXdFZGl0b3JTdGF0ZTogRWRpdG9yU3RhdGU7XG4gIHRvb2xiYXJWaXNpYmxlOiBib29sZWFuO1xufTtcblxuZnVuY3Rpb24gaW5pdGlhbEVkaXRvclN0YXRlKCk6IEVkaXRvclN0YXRlIHtcbiAgcmV0dXJuIHtcbiAgICByZXZpc2lvblRpdGxlOiAnJyxcbiAgICB0ZXh0OiAnJyxcbiAgICBvZmZzZXRzOiBuZXcgTWFwKCksXG4gICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgYWRkZWQ6IFtdLFxuICAgICAgcmVtb3ZlZDogW10sXG4gICAgfSxcbiAgICBpbmxpbmVFbGVtZW50czogW10sXG4gIH07XG59XG5cbmNvbnN0IEVNUFRZX0ZVTkNUSU9OID0gKCkgPT4ge307XG5cbmNsYXNzIERpZmZWaWV3Q29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9zeW5jU2Nyb2xsOiBTeW5jU2Nyb2xsO1xuICBfb2xkRWRpdG9yUGFuZTogYXRvbSRQYW5lO1xuICBfb2xkRWRpdG9yQ29tcG9uZW50OiBEaWZmVmlld0VkaXRvclBhbmU7XG4gIF9wYW5lQ29udGFpbmVyOiBPYmplY3Q7XG4gIF9uZXdFZGl0b3JQYW5lOiBhdG9tJFBhbmU7XG4gIF9uZXdFZGl0b3JDb21wb25lbnQ6IERpZmZWaWV3RWRpdG9yUGFuZTtcbiAgX2JvdHRvbVJpZ2h0UGFuZTogYXRvbSRQYW5lO1xuICBfdGltZWxpbmVDb21wb25lbnQ6ID9EaWZmVGltZWxpbmVWaWV3O1xuICBfdHJlZVBhbmU6IGF0b20kUGFuZTtcbiAgX3RyZWVDb21wb25lbnQ6IFJlYWN0Q29tcG9uZW50O1xuICBfbmF2aWdhdGlvblBhbmU6IGF0b20kUGFuZTtcbiAgX25hdmlnYXRpb25Db21wb25lbnQ6IERpZmZOYXZpZ2F0aW9uQmFyO1xuICBfY29tbWl0Q29tcG9uZW50OiA/RGlmZkNvbW1pdFZpZXc7XG4gIF9wdWJsaXNoQ29tcG9uZW50OiA/RGlmZlB1Ymxpc2hWaWV3O1xuICBfcmVhZG9ubHlCdWZmZXI6IGF0b20kVGV4dEJ1ZmZlcjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgY29uc3QgdG9vbGJhclZpc2libGUgPSAoKGZlYXR1cmVDb25maWcuZ2V0KFRPT0xCQVJfVklTSUJMRV9TRVRUSU5HKTogYW55KTogYm9vbGVhbik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG1vZGU6IERpZmZNb2RlLkJST1dTRV9NT0RFLFxuICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgdG9vbGJhclZpc2libGUsXG4gICAgICBvbGRFZGl0b3JTdGF0ZTogaW5pdGlhbEVkaXRvclN0YXRlKCksXG4gICAgICBuZXdFZGl0b3JTdGF0ZTogaW5pdGlhbEVkaXRvclN0YXRlKCksXG4gICAgfTtcbiAgICAodGhpczogYW55KS5fb25Nb2RlbFN0YXRlQ2hhbmdlID0gdGhpcy5fb25Nb2RlbFN0YXRlQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZU5ld09mZnNldHMgPSB0aGlzLl9oYW5kbGVOZXdPZmZzZXRzLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3VwZGF0ZUxpbmVEaWZmU3RhdGUgPSB0aGlzLl91cGRhdGVMaW5lRGlmZlN0YXRlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2hhbmdlTmV3VGV4dEVkaXRvciA9IHRoaXMuX29uQ2hhbmdlTmV3VGV4dEVkaXRvci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24gPSB0aGlzLl9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25OYXZpZ2F0aW9uQ2xpY2sgPSB0aGlzLl9vbk5hdmlnYXRpb25DbGljay5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5fb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNoYW5nZU1vZGUgPSB0aGlzLl9vbkNoYW5nZU1vZGUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25Td2l0Y2hUb0VkaXRvciA9IHRoaXMuX29uU3dpdGNoVG9FZGl0b3IuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZWFkb25seUJ1ZmZlciA9IG5ldyBUZXh0QnVmZmVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZmVhdHVyZUNvbmZpZy5vYnNlcnZlKFRPT0xCQVJfVklTSUJMRV9TRVRUSU5HLCB0b29sYmFyVmlzaWJsZSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt0b29sYmFyVmlzaWJsZX0pO1xuICAgIH0pKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChkaWZmTW9kZWwub25BY3RpdmVGaWxlVXBkYXRlcyh0aGlzLl91cGRhdGVMaW5lRGlmZlN0YXRlKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZGlmZk1vZGVsLm9uRGlkVXBkYXRlU3RhdGUodGhpcy5fb25Nb2RlbFN0YXRlQ2hhbmdlKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbShhY3RpdmVJdGVtID0+IHtcbiAgICAgIGlmIChhY3RpdmVJdGVtICE9IG51bGwgJiYgKGFjdGl2ZUl0ZW06IGFueSkudGFnTmFtZSA9PT0gJ05VQ0xJREUtRElGRi1WSUVXJykge1xuICAgICAgICAvLyBSZS1yZW5kZXIgb24gYWN0aXZhdGlvbi5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7fSk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgdGhpcy5fcGFuZUNvbnRhaW5lciA9IGNyZWF0ZVBhbmVDb250YWluZXIoKTtcbiAgICAvLyBUaGUgY2hhbmdlZCBmaWxlcyBzdGF0dXMgdHJlZSB0YWtlcyAxLzUgb2YgdGhlIHdpZHRoIGFuZCBsaXZlcyBvbiB0aGUgcmlnaHQgbW9zdCxcbiAgICAvLyB3aGlsZSBiZWluZyB2ZXJ0aWNhbGx5IHNwbHQgd2l0aCB0aGUgcmV2aXNpb24gdGltZWxpbmUgc3RhY2sgcGFuZS5cbiAgICBjb25zdCB0b3BQYW5lID0gdGhpcy5fbmV3RWRpdG9yUGFuZSA9IHRoaXMuX3BhbmVDb250YWluZXIuZ2V0QWN0aXZlUGFuZSgpO1xuICAgIHRoaXMuX2JvdHRvbVJpZ2h0UGFuZSA9IHRvcFBhbmUuc3BsaXREb3duKHtcbiAgICAgIGZsZXhTY2FsZTogMC4zLFxuICAgIH0pO1xuICAgIHRoaXMuX3RyZWVQYW5lID0gdGhpcy5fYm90dG9tUmlnaHRQYW5lLnNwbGl0TGVmdCh7XG4gICAgICBmbGV4U2NhbGU6IDAuMzUsXG4gICAgfSk7XG4gICAgdGhpcy5fbmF2aWdhdGlvblBhbmUgPSB0b3BQYW5lLnNwbGl0UmlnaHQoe1xuICAgICAgZmxleFNjYWxlOiAwLjA0NSxcbiAgICB9KTtcbiAgICB0aGlzLl9vbGRFZGl0b3JQYW5lID0gdG9wUGFuZS5zcGxpdExlZnQoe1xuICAgICAgZmxleFNjYWxlOiAxLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fcmVuZGVyRGlmZlZpZXcoKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgdGhpcy5fZGVzdHJveVBhbmVEaXNwb3NhYmxlKHRoaXMuX29sZEVkaXRvclBhbmUsIHRydWUpLFxuICAgICAgdGhpcy5fZGVzdHJveVBhbmVEaXNwb3NhYmxlKHRoaXMuX25ld0VkaXRvclBhbmUsIHRydWUpLFxuICAgICAgdGhpcy5fZGVzdHJveVBhbmVEaXNwb3NhYmxlKHRoaXMuX25hdmlnYXRpb25QYW5lLCB0cnVlKSxcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl90cmVlUGFuZSwgdHJ1ZSksXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fYm90dG9tUmlnaHRQYW5lKSxcbiAgICApO1xuXG4gICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydwYW5lQ29udGFpbmVyJ10pLmFwcGVuZENoaWxkKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX3BhbmVDb250YWluZXIpLFxuICAgICk7XG5cbiAgICB0aGlzLl91cGRhdGVMaW5lRGlmZlN0YXRlKGRpZmZNb2RlbC5nZXRBY3RpdmVGaWxlU3RhdGUoKSk7XG4gIH1cblxuICBfb25Nb2RlbFN0YXRlQ2hhbmdlKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe30pO1xuICB9XG5cbiAgX3NldHVwU3luY1Njcm9sbCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50ID09IG51bGwgfHwgdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgb2xkVGV4dEVkaXRvckVsZW1lbnQgPSB0aGlzLl9vbGRFZGl0b3JDb21wb25lbnQuZ2V0RWRpdG9yRG9tRWxlbWVudCgpO1xuICAgIGNvbnN0IG5ld1RleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50LmdldEVkaXRvckRvbUVsZW1lbnQoKTtcbiAgICBjb25zdCBzeW5jU2Nyb2xsID0gdGhpcy5fc3luY1Njcm9sbDtcbiAgICBpZiAoc3luY1Njcm9sbCAhPSBudWxsKSB7XG4gICAgICBzeW5jU2Nyb2xsLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKHN5bmNTY3JvbGwpO1xuICAgIH1cbiAgICB0aGlzLl9zeW5jU2Nyb2xsID0gbmV3IFN5bmNTY3JvbGwoXG4gICAgICBvbGRUZXh0RWRpdG9yRWxlbWVudCxcbiAgICAgIG5ld1RleHRFZGl0b3JFbGVtZW50LFxuICAgICk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fc3luY1Njcm9sbCk7XG4gIH1cblxuICBfc2Nyb2xsVG9GaXJzdEhpZ2hsaWdodGVkTGluZSgpOiB2b2lkIHtcbiAgICAvLyBTY2hlZHVsZSBzY3JvbGwgdG8gZmlyc3QgbGluZSBhZnRlciBhbGwgbGluZXMgaGF2ZSBiZWVuIHJlbmRlcmVkLlxuICAgIGNvbnN0IHtvbGRFZGl0b3JTdGF0ZSwgbmV3RWRpdG9yU3RhdGV9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCByZW1vdmVkTGluZXMgPSBvbGRFZGl0b3JTdGF0ZS5oaWdobGlnaHRlZExpbmVzLnJlbW92ZWQ7XG4gICAgY29uc3QgYWRkZWRMaW5lcyA9IG5ld0VkaXRvclN0YXRlLmhpZ2hsaWdodGVkTGluZXMuYWRkZWQ7XG4gICAgaWYgKGFkZGVkTGluZXMubGVuZ3RoID09PSAwICYmIHJlbW92ZWRMaW5lcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZmlyc3RSZW1vdmVkTGluZSA9IGdldE9mZnNldExpbmVOdW1iZXIoXG4gICAgICByZW1vdmVkTGluZXNbMF0gfHwgMCxcbiAgICAgIG9sZEVkaXRvclN0YXRlLm9mZnNldHMsXG4gICAgKTtcbiAgICBjb25zdCBmaXJzdEFkZGVkTGluZSA9IGdldE9mZnNldExpbmVOdW1iZXIoXG4gICAgICBhZGRlZExpbmVzWzBdIHx8IDAsXG4gICAgICBuZXdFZGl0b3JTdGF0ZS5vZmZzZXRzLFxuICAgICk7XG4gICAgc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgYWRkZWRMaW5lcy5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgKHJlbW92ZWRMaW5lcy5sZW5ndGggPiAwICYmIGZpcnN0UmVtb3ZlZExpbmUgPCBmaXJzdEFkZGVkTGluZSlcbiAgICAgICkge1xuICAgICAgICB0aGlzLl9vbGRFZGl0b3JDb21wb25lbnQuc2Nyb2xsVG9TY3JlZW5MaW5lKGZpcnN0UmVtb3ZlZExpbmUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50LnNjcm9sbFRvU2NyZWVuTGluZShmaXJzdEFkZGVkTGluZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfb25DaGFuZ2VNb2RlKG1vZGU6IERpZmZNb2RlVHlwZSk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldFZpZXdNb2RlKG1vZGUpO1xuICB9XG5cbiAgX3JlbmRlckRpZmZWaWV3KCk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlclRyZWUoKTtcbiAgICB0aGlzLl9yZW5kZXJFZGl0b3JzKCk7XG4gICAgdGhpcy5fcmVuZGVyTmF2aWdhdGlvbigpO1xuICAgIHRoaXMuX3JlbmRlckJvdHRvbVJpZ2h0UGFuZSgpO1xuICB9XG5cbiAgX3JlbmRlckJvdHRvbVJpZ2h0UGFuZSgpOiB2b2lkIHtcbiAgICBjb25zdCB7dmlld01vZGV9ID0gdGhpcy5wcm9wcy5kaWZmTW9kZWwuZ2V0U3RhdGUoKTtcbiAgICBzd2l0Y2ggKHZpZXdNb2RlKSB7XG4gICAgICBjYXNlIERpZmZNb2RlLkJST1dTRV9NT0RFOlxuICAgICAgICB0aGlzLl9yZW5kZXJUaW1lbGluZVZpZXcoKTtcbiAgICAgICAgdGhpcy5fY29tbWl0Q29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcHVibGlzaENvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaWZmTW9kZS5DT01NSVRfTU9ERTpcbiAgICAgICAgdGhpcy5fcmVuZGVyQ29tbWl0VmlldygpO1xuICAgICAgICB0aGlzLl90aW1lbGluZUNvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuX3B1Ymxpc2hDb21wb25lbnQgPSBudWxsO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRGlmZk1vZGUuUFVCTElTSF9NT0RFOlxuICAgICAgICB0aGlzLl9yZW5kZXJQdWJsaXNoVmlldygpO1xuICAgICAgICB0aGlzLl9jb21taXRDb21wb25lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLl90aW1lbGluZUNvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIERpZmYgTW9kZTogJHt2aWV3TW9kZX1gKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBQcm9wcywgcHJldlN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlckRpZmZWaWV3KCk7XG4gICAgaWYgKHRoaXMuc3RhdGUuZmlsZVBhdGggIT09IHByZXZTdGF0ZS5maWxlUGF0aCkge1xuICAgICAgdGhpcy5fc2Nyb2xsVG9GaXJzdEhpZ2hsaWdodGVkTGluZSgpO1xuICAgICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuZW1pdEFjdGl2ZUJ1ZmZlckNoYW5nZU1vZGlmaWVkKCk7XG4gICAgfVxuICB9XG5cbiAgX3JlbmRlckNvbW1pdFZpZXcoKTogdm9pZCB7XG4gICAgY29uc3Qge1xuICAgICAgY29tbWl0TWVzc2FnZSxcbiAgICAgIGNvbW1pdE1vZGUsXG4gICAgICBjb21taXRNb2RlU3RhdGUsXG4gICAgfSA9IHRoaXMucHJvcHMuZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgdGhpcy5fY29tbWl0Q29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERpZmZDb21taXRWaWV3XG4gICAgICAgIGNvbW1pdE1lc3NhZ2U9e2NvbW1pdE1lc3NhZ2V9XG4gICAgICAgIGNvbW1pdE1vZGU9e2NvbW1pdE1vZGV9XG4gICAgICAgIGNvbW1pdE1vZGVTdGF0ZT17Y29tbWl0TW9kZVN0YXRlfVxuICAgICAgICAvLyBgZGlmZk1vZGVsYCBpcyBhY3RpbmcgYXMgdGhlIGFjdGlvbiBjcmVhdG9yIGZvciBjb21taXQgdmlldyBhbmQgbmVlZHMgdG8gYmUgcGFzc2VkIHNvXG4gICAgICAgIC8vIG1ldGhvZHMgY2FuIGJlIGNhbGxlZCBvbiBpdC5cbiAgICAgICAgZGlmZk1vZGVsPXt0aGlzLnByb3BzLmRpZmZNb2RlbH1cbiAgICAgIC8+LFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fYm90dG9tUmlnaHRQYW5lKSxcbiAgICApO1xuICB9XG5cbiAgX3JlbmRlclB1Ymxpc2hWaWV3KCk6IHZvaWQge1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICBwdWJsaXNoTW9kZSxcbiAgICAgIHB1Ymxpc2hNb2RlU3RhdGUsXG4gICAgICBwdWJsaXNoTWVzc2FnZSxcbiAgICAgIGhlYWRSZXZpc2lvbixcbiAgICB9ID0gZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgdGhpcy5fcHVibGlzaENvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxEaWZmUHVibGlzaFZpZXdcbiAgICAgICAgcHVibGlzaE1vZGVTdGF0ZT17cHVibGlzaE1vZGVTdGF0ZX1cbiAgICAgICAgbWVzc2FnZT17cHVibGlzaE1lc3NhZ2V9XG4gICAgICAgIHB1Ymxpc2hNb2RlPXtwdWJsaXNoTW9kZX1cbiAgICAgICAgaGVhZFJldmlzaW9uPXtoZWFkUmV2aXNpb259XG4gICAgICAgIGRpZmZNb2RlbD17ZGlmZk1vZGVsfVxuICAgICAgLz4sXG4gICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9ib3R0b21SaWdodFBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyVHJlZSgpOiB2b2lkIHtcbiAgICBjb25zdCB7ZGlmZk1vZGVsfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3NlbGVjdGVkRmlsZUNoYW5nZXMsIHNob3dOb25IZ1JlcG9zfSA9IGRpZmZNb2RlbC5nZXRTdGF0ZSgpO1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSBkaWZmTW9kZWwuZ2V0QWN0aXZlRmlsZVN0YXRlKCk7XG4gICAgdGhpcy5fdHJlZUNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10cmVlIHBhZGRlZFwiPlxuICAgICAgICAgIDxEaWZmVmlld1RyZWVcbiAgICAgICAgICAgIGFjdGl2ZUZpbGVQYXRoPXtmaWxlUGF0aH1cbiAgICAgICAgICAgIGZpbGVDaGFuZ2VzPXtzZWxlY3RlZEZpbGVDaGFuZ2VzfVxuICAgICAgICAgICAgc2hvd05vbkhnUmVwb3M9e3Nob3dOb25IZ1JlcG9zfVxuICAgICAgICAgICAgZGlmZk1vZGVsPXtkaWZmTW9kZWx9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApLFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fdHJlZVBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyRWRpdG9ycygpOiB2b2lkIHtcbiAgICBjb25zdCB7ZmlsZVBhdGgsIG9sZEVkaXRvclN0YXRlOiBvbGRTdGF0ZSwgbmV3RWRpdG9yU3RhdGU6IG5ld1N0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgICA8RGlmZlZpZXdFZGl0b3JQYW5lXG4gICAgICAgICAgaGVhZGVyVGl0bGU9e29sZFN0YXRlLnJldmlzaW9uVGl0bGV9XG4gICAgICAgICAgdGV4dEJ1ZmZlcj17dGhpcy5fcmVhZG9ubHlCdWZmZXJ9XG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e29sZFN0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17b2xkU3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBzYXZlZENvbnRlbnRzPXtvbGRTdGF0ZS50ZXh0fVxuICAgICAgICAgIGluaXRpYWxUZXh0Q29udGVudD17b2xkU3RhdGUudGV4dH1cbiAgICAgICAgICBpbmxpbmVFbGVtZW50cz17b2xkU3RhdGUuaW5saW5lRWxlbWVudHN9XG4gICAgICAgICAgaGFuZGxlTmV3T2Zmc2V0cz17dGhpcy5faGFuZGxlTmV3T2Zmc2V0c31cbiAgICAgICAgICByZWFkT25seT17dHJ1ZX1cbiAgICAgICAgICBvbkNoYW5nZT17RU1QVFlfRlVOQ1RJT059XG4gICAgICAgICAgb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudD17RU1QVFlfRlVOQ1RJT059XG4gICAgICAgIC8+LFxuICAgICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9vbGRFZGl0b3JQYW5lKSxcbiAgICApO1xuICAgIGNvbnN0IHRleHRCdWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgICAgPERpZmZWaWV3RWRpdG9yUGFuZVxuICAgICAgICAgIGhlYWRlclRpdGxlPXtuZXdTdGF0ZS5yZXZpc2lvblRpdGxlfVxuICAgICAgICAgIHRleHRCdWZmZXI9e3RleHRCdWZmZXJ9XG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e25ld1N0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17bmV3U3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBpbml0aWFsVGV4dENvbnRlbnQ9e25ld1N0YXRlLnRleHR9XG4gICAgICAgICAgc2F2ZWRDb250ZW50cz17bmV3U3RhdGUuc2F2ZWRDb250ZW50c31cbiAgICAgICAgICBpbmxpbmVFbGVtZW50cz17bmV3U3RhdGUuaW5saW5lRWxlbWVudHN9XG4gICAgICAgICAgaGFuZGxlTmV3T2Zmc2V0cz17dGhpcy5faGFuZGxlTmV3T2Zmc2V0c31cbiAgICAgICAgICBvbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50PXt0aGlzLl9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50fVxuICAgICAgICAgIHJlYWRPbmx5PXtmYWxzZX1cbiAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2VOZXdUZXh0RWRpdG9yfVxuICAgICAgICAvPixcbiAgICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fbmV3RWRpdG9yUGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3NldHVwU3luY1Njcm9sbCgpO1xuICB9XG5cbiAgX3JlbmRlclRpbWVsaW5lVmlldygpOiB2b2lkIHtcbiAgICB0aGlzLl90aW1lbGluZUNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxEaWZmVGltZWxpbmVWaWV3XG4gICAgICAgIGRpZmZNb2RlbD17dGhpcy5wcm9wcy5kaWZmTW9kZWx9XG4gICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlPXt0aGlzLl9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb259XG4gICAgICAvPixcbiAgICAgIHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX2JvdHRvbVJpZ2h0UGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJOYXZpZ2F0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IHtvbGRFZGl0b3JTdGF0ZSwgbmV3RWRpdG9yU3RhdGV9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7b2Zmc2V0czogb2xkT2Zmc2V0cywgaGlnaGxpZ2h0ZWRMaW5lczogb2xkTGluZXMsIHRleHQ6IG9sZENvbnRlbnRzfSA9IG9sZEVkaXRvclN0YXRlO1xuICAgIGNvbnN0IHtvZmZzZXRzOiBuZXdPZmZzZXRzLCBoaWdobGlnaHRlZExpbmVzOiBuZXdMaW5lcywgdGV4dDogbmV3Q29udGVudHN9ID0gbmV3RWRpdG9yU3RhdGU7XG4gICAgY29uc3QgbmF2aWdhdGlvblBhbmVFbGVtZW50ID0gdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fbmF2aWdhdGlvblBhbmUpO1xuICAgIHRoaXMuX25hdmlnYXRpb25Db21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RGlmZk5hdmlnYXRpb25CYXJcbiAgICAgICAgZWxlbWVudEhlaWdodD17bmF2aWdhdGlvblBhbmVFbGVtZW50LmNsaWVudEhlaWdodH1cbiAgICAgICAgYWRkZWRMaW5lcz17bmV3TGluZXMuYWRkZWR9XG4gICAgICAgIG5ld09mZnNldHM9e25ld09mZnNldHN9XG4gICAgICAgIG5ld0NvbnRlbnRzPXtuZXdDb250ZW50c31cbiAgICAgICAgcmVtb3ZlZExpbmVzPXtvbGRMaW5lcy5yZW1vdmVkfVxuICAgICAgICBvbGRPZmZzZXRzPXtvbGRPZmZzZXRzfVxuICAgICAgICBvbGRDb250ZW50cz17b2xkQ29udGVudHN9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uTmF2aWdhdGlvbkNsaWNrfVxuICAgICAgLz4sXG4gICAgICBuYXZpZ2F0aW9uUGFuZUVsZW1lbnQsXG4gICAgKTtcbiAgfVxuXG4gIF9vbk5hdmlnYXRpb25DbGljayhsaW5lTnVtYmVyOiBudW1iZXIsIGlzQWRkZWRMaW5lOiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgdGV4dEVkaXRvckNvbXBvbmVudCA9IGlzQWRkZWRMaW5lID8gdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50IDogdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50O1xuICAgIGludmFyaWFudCh0ZXh0RWRpdG9yQ29tcG9uZW50LCAnRGlmZiBWaWV3IE5hdmlnYXRpb24gRXJyb3I6IE5vbiB2YWxpZCB0ZXh0IGVkaXRvciBjb21wb25lbnQnKTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGV4dEVkaXRvckNvbXBvbmVudC5nZXRFZGl0b3JNb2RlbCgpO1xuICAgIHRleHRFZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbbGluZU51bWJlciwgMF0pO1xuICB9XG5cbiAgX2dldFBhbmVFbGVtZW50KHBhbmU6IGF0b20kUGFuZSk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gYXRvbS52aWV3cy5nZXRWaWV3KHBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJyk7XG4gIH1cblxuICBfZGVzdHJveVBhbmVEaXNwb3NhYmxlKHBhbmU6IGF0b20kUGFuZSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgcGFuZS5kZXN0cm95KCk7XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGxldCB0b29sYmFyQ29tcG9uZW50ID0gbnVsbDtcbiAgICBpZiAodGhpcy5zdGF0ZS50b29sYmFyVmlzaWJsZSkge1xuICAgICAgY29uc3Qge3ZpZXdNb2RlfSA9IHRoaXMucHJvcHMuZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgICBjb25zdCB7b2xkRWRpdG9yU3RhdGUsIG5ld0VkaXRvclN0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgICB0b29sYmFyQ29tcG9uZW50ID0gKFxuICAgICAgICA8RGlmZlZpZXdUb29sYmFyXG4gICAgICAgICAgZmlsZVBhdGg9e3RoaXMuc3RhdGUuZmlsZVBhdGh9XG4gICAgICAgICAgZGlmZk1vZGU9e3ZpZXdNb2RlfVxuICAgICAgICAgIG5ld1JldmlzaW9uVGl0bGU9e25ld0VkaXRvclN0YXRlLnJldmlzaW9uVGl0bGV9XG4gICAgICAgICAgb2xkUmV2aXNpb25UaXRsZT17b2xkRWRpdG9yU3RhdGUucmV2aXNpb25UaXRsZX1cbiAgICAgICAgICBvblN3aXRjaE1vZGU9e3RoaXMuX29uQ2hhbmdlTW9kZX1cbiAgICAgICAgICBvblN3aXRjaFRvRWRpdG9yPXt0aGlzLl9vblN3aXRjaFRvRWRpdG9yfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctY29udGFpbmVyXCI+XG4gICAgICAgIHt0b29sYmFyQ29tcG9uZW50fVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LWNvbXBvbmVudFwiIHJlZj1cInBhbmVDb250YWluZXJcIiAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vblN3aXRjaFRvRWRpdG9yKCk6IHZvaWQge1xuICAgIGNvbnN0IGRpZmZWaWV3Tm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGludmFyaWFudChkaWZmVmlld05vZGUsICdEaWZmIFZpZXcgRE9NIG5lZWRzIHRvIGJlIGF0dGFjaGVkIHRvIHN3aXRjaCB0byBlZGl0b3IgbW9kZScpO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZGlmZlZpZXdOb2RlLCAnbnVjbGlkZS1kaWZmLXZpZXc6c3dpdGNoLXRvLWVkaXRvcicpO1xuICB9XG5cbiAgX2hhbmRsZU5ld09mZnNldHMob2Zmc2V0c0Zyb21Db21wb25lbnRzOiBNYXApOiB2b2lkIHtcbiAgICBjb25zdCBvbGRMaW5lT2Zmc2V0cyA9IG5ldyBNYXAodGhpcy5zdGF0ZS5vbGRFZGl0b3JTdGF0ZS5vZmZzZXRzKTtcbiAgICBjb25zdCBuZXdMaW5lT2Zmc2V0cyA9IG5ldyBNYXAodGhpcy5zdGF0ZS5uZXdFZGl0b3JTdGF0ZS5vZmZzZXRzKTtcbiAgICBvZmZzZXRzRnJvbUNvbXBvbmVudHMuZm9yRWFjaCgob2Zmc2V0QW1vdW50LCByb3cpID0+IHtcbiAgICAgIG5ld0xpbmVPZmZzZXRzLnNldChyb3csIChuZXdMaW5lT2Zmc2V0cy5nZXQocm93KSB8fCAwKSArIG9mZnNldEFtb3VudCk7XG4gICAgICBvbGRMaW5lT2Zmc2V0cy5zZXQocm93LCAob2xkTGluZU9mZnNldHMuZ2V0KHJvdykgfHwgMCkgKyBvZmZzZXRBbW91bnQpO1xuICAgIH0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb2xkRWRpdG9yU3RhdGU6IHsuLi50aGlzLnN0YXRlLm9sZEVkaXRvclN0YXRlLCBvZmZzZXRzOiBvbGRMaW5lT2Zmc2V0c30sXG4gICAgICBuZXdFZGl0b3JTdGF0ZTogey4uLnRoaXMuc3RhdGUubmV3RWRpdG9yU3RhdGUsIG9mZnNldHM6IG5ld0xpbmVPZmZzZXRzfSxcbiAgICB9KTtcbiAgfVxuXG4gIF9vbkNoYW5nZU5ld1RleHRFZGl0b3IobmV3Q29udGVudHM6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldE5ld0NvbnRlbnRzKG5ld0NvbnRlbnRzKTtcbiAgfVxuXG4gIF9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24ocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldFJldmlzaW9uKHJldmlzaW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBsaW5lIGRpZmYgc3RhdGUgb24gYWN0aXZlIGZpbGUgc3RhdGUgY2hhbmdlLlxuICAgKi9cbiAgX3VwZGF0ZUxpbmVEaWZmU3RhdGUoZmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpOiB2b2lkIHtcbiAgICBjb25zdCB7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZENvbnRlbnRzLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzLFxuICAgICAgaW5saW5lQ29tcG9uZW50cyxcbiAgICAgIGZyb21SZXZpc2lvblRpdGxlLFxuICAgICAgdG9SZXZpc2lvblRpdGxlLFxuICAgIH0gPSBmaWxlU3RhdGU7XG5cbiAgICBjb25zdCB7YWRkZWRMaW5lcywgcmVtb3ZlZExpbmVzLCBvbGRMaW5lT2Zmc2V0cywgbmV3TGluZU9mZnNldHN9ID1cbiAgICAgIGNvbXB1dGVEaWZmKG9sZENvbnRlbnRzLCBuZXdDb250ZW50cyk7XG5cbiAgICBjb25zdCBvbGRFZGl0b3JTdGF0ZSA9IHtcbiAgICAgIHJldmlzaW9uVGl0bGU6IGZyb21SZXZpc2lvblRpdGxlLFxuICAgICAgdGV4dDogb2xkQ29udGVudHMsXG4gICAgICBvZmZzZXRzOiBvbGRMaW5lT2Zmc2V0cyxcbiAgICAgIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICAgICAgYWRkZWQ6IFtdLFxuICAgICAgICByZW1vdmVkOiByZW1vdmVkTGluZXMsXG4gICAgICB9LFxuICAgICAgaW5saW5lRWxlbWVudHM6IGlubGluZUNvbXBvbmVudHMgfHwgW10sXG4gICAgfTtcbiAgICBjb25zdCBuZXdFZGl0b3JTdGF0ZSA9IHtcbiAgICAgIHJldmlzaW9uVGl0bGU6IHRvUmV2aXNpb25UaXRsZSxcbiAgICAgIHRleHQ6IG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICAgIG9mZnNldHM6IG5ld0xpbmVPZmZzZXRzLFxuICAgICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgICBhZGRlZDogYWRkZWRMaW5lcyxcbiAgICAgICAgcmVtb3ZlZDogW10sXG4gICAgICB9LFxuICAgICAgaW5saW5lRWxlbWVudHM6IFtdLFxuICAgIH07XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZEVkaXRvclN0YXRlLFxuICAgICAgbmV3RWRpdG9yU3RhdGUsXG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld0NvbXBvbmVudDtcbiJdfQ==