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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFtQnNCLFFBQVE7Ozs7b0JBQzRCLE1BQU07OzRCQUl6RCxnQkFBZ0I7O2tDQUNRLHNCQUFzQjs7Ozs0QkFDNUIsZ0JBQWdCOzs7OzBCQUNsQixjQUFjOzs7O2dDQUNSLG9CQUFvQjs7OzsrQkFDckIsbUJBQW1COzs7O2lDQUNqQixxQkFBcUI7Ozs7OEJBQ3hCLGtCQUFrQjs7OzsrQkFDakIsbUJBQW1COzs7O3lCQUNBLGNBQWM7O2tDQUMzQiw0QkFBNEI7O3lCQUt2RCxhQUFhOztvQ0FDTSw4QkFBOEI7Ozs7QUF5QnhELFNBQVMsa0JBQWtCLEdBQWdCO0FBQ3pDLFNBQU87QUFDTCxpQkFBYSxFQUFFLEVBQUU7QUFDakIsUUFBSSxFQUFFLEVBQUU7QUFDUixXQUFPLEVBQUUsSUFBSSxHQUFHLEVBQUU7QUFDbEIsb0JBQWdCLEVBQUU7QUFDaEIsV0FBSyxFQUFFLEVBQUU7QUFDVCxhQUFPLEVBQUUsRUFBRTtLQUNaO0FBQ0Qsa0JBQWMsRUFBRSxFQUFFO0dBQ25CLENBQUM7Q0FDSDs7QUFFRCxJQUFNLGNBQWMsR0FBRyxTQUFqQixjQUFjLEdBQVMsRUFBRSxDQUFDOztJQUUxQixpQkFBaUI7WUFBakIsaUJBQWlCOztBQXFCVixXQXJCUCxpQkFBaUIsQ0FxQlQsS0FBWSxFQUFFOzBCQXJCdEIsaUJBQWlCOztBQXNCbkIsK0JBdEJFLGlCQUFpQiw2Q0FzQmIsS0FBSyxFQUFFO0FBQ2IsUUFBTSxjQUFjLEdBQUssa0NBQWMsR0FBRyxvQ0FBeUIsQUFBZ0IsQ0FBQztBQUNwRixRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsVUFBSSxFQUFFLG9CQUFTLFdBQVc7QUFDMUIsY0FBUSxFQUFFLEVBQUU7QUFDWixvQkFBYyxFQUFkLGNBQWM7QUFDZCxvQkFBYyxFQUFFLGtCQUFrQixFQUFFO0FBQ3BDLG9CQUFjLEVBQUUsa0JBQWtCLEVBQUU7S0FDckMsQ0FBQztBQUNGLEFBQUMsUUFBSSxDQUFPLG1CQUFtQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEUsQUFBQyxRQUFJLENBQU8sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4RSxBQUFDLFFBQUksQ0FBTyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVFLEFBQUMsUUFBSSxDQUFPLHlCQUF5QixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEYsQUFBQyxRQUFJLENBQU8sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwRSxBQUFDLFFBQUksQ0FBTyw2QkFBNkIsR0FBRyxJQUFJLENBQUMsNkJBQTZCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFGLEFBQUMsUUFBSSxDQUFPLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxRCxBQUFDLFFBQUksQ0FBTyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xFLFFBQUksQ0FBQyxlQUFlLEdBQUcsc0JBQWdCLENBQUM7QUFDeEMsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztHQUNqRDs7ZUF6Q0csaUJBQWlCOztXQTJDSCw4QkFBUzs7O0FBQ3pCLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLGtDQUFjLE9BQU8scUNBQTBCLFVBQUEsY0FBYyxFQUFJO0FBQ3ZGLGNBQUssUUFBUSxDQUFDLEVBQUMsY0FBYyxFQUFkLGNBQWMsRUFBQyxDQUFDLENBQUM7T0FDakMsQ0FBQyxDQUFDLENBQUM7S0FDTDs7O1dBRWdCLDZCQUFTOzs7VUFDakIsU0FBUyxHQUFJLElBQUksQ0FBQyxLQUFLLENBQXZCLFNBQVM7O0FBQ2hCLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO0FBQ2xGLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0FBQzlFLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsVUFBQSxVQUFVLEVBQUk7QUFDN0UsWUFBSSxVQUFVLElBQUksSUFBSSxJQUFJLEFBQUMsVUFBVSxDQUFPLE9BQU8sS0FBSyxtQkFBbUIsRUFBRTs7QUFFM0UsaUJBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ25CO09BQ0YsQ0FBQyxDQUFDLENBQUM7O0FBRUosVUFBSSxDQUFDLGNBQWMsR0FBRyw4Q0FBcUIsQ0FBQzs7O0FBRzVDLFVBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUMxRSxVQUFJLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUN4QyxpQkFBUyxFQUFFLEdBQUc7T0FDZixDQUFDLENBQUM7QUFDSCxVQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUM7QUFDL0MsaUJBQVMsRUFBRSxJQUFJO09BQ2hCLENBQUMsQ0FBQztBQUNILFVBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztBQUN4QyxpQkFBUyxFQUFFLEtBQUs7T0FDakIsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQ3RDLGlCQUFTLEVBQUUsQ0FBQztPQUNiLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7O0FBRXZCLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUNyQixJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsRUFDdEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEVBQ3RELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxFQUN2RCxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFDakQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUNuRCxDQUFDOztBQUVGLDZCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUMxRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQ3hDLENBQUM7O0FBRUYsVUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7S0FDM0Q7OztXQUVrQiwrQkFBUztBQUMxQixVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ25COzs7V0FFZSw0QkFBUztBQUN2QixVQUFJLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLG1CQUFtQixJQUFJLElBQUksRUFBRTtBQUN4RSxlQUFPO09BQ1I7QUFDRCxVQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzVFLFVBQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDNUUsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNwQyxVQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsa0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixZQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUN4QztBQUNELFVBQUksQ0FBQyxXQUFXLEdBQUcsNEJBQ2pCLG9CQUFvQixFQUNwQixvQkFBb0IsQ0FDckIsQ0FBQztBQUNGLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMzQzs7O1dBRTRCLHlDQUFTOzs7O21CQUVLLElBQUksQ0FBQyxLQUFLO1VBQTVDLGNBQWMsVUFBZCxjQUFjO1VBQUUsY0FBYyxVQUFkLGNBQWM7O0FBQ3JDLFVBQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7QUFDN0QsVUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztBQUN6RCxVQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3hELGVBQU87T0FDUjtBQUNELFVBQU0sZ0JBQWdCLEdBQUcsb0NBQ3ZCLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ3BCLGNBQWMsQ0FBQyxPQUFPLENBQ3ZCLENBQUM7QUFDRixVQUFNLGNBQWMsR0FBRyxvQ0FDckIsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDbEIsY0FBYyxDQUFDLE9BQU8sQ0FDdkIsQ0FBQztBQUNGLGtCQUFZLENBQUMsWUFBTTtBQUNqQixZQUNFLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUN0QixZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxnQkFBZ0IsR0FBRyxjQUFjLEFBQUMsRUFDOUQ7QUFDQSxpQkFBSyxtQkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1NBQy9ELE1BQU07QUFDTCxpQkFBSyxtQkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUM3RDtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFWSx1QkFBQyxJQUFrQixFQUFRO0FBQ3RDLFVBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN4Qzs7O1dBRWMsMkJBQVM7QUFDdEIsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25CLFVBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN0QixVQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUN6QixVQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztLQUMvQjs7O1dBRXFCLGtDQUFTO3NDQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTs7VUFBM0MsUUFBUSw2QkFBUixRQUFROztBQUNmLGNBQVEsUUFBUTtBQUNkLGFBQUssb0JBQVMsV0FBVztBQUN2QixjQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUMzQixjQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLGNBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7QUFDOUIsZ0JBQU07QUFBQSxBQUNSLGFBQUssb0JBQVMsV0FBVztBQUN2QixjQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUN6QixjQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0FBQy9CLGNBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7QUFDOUIsZ0JBQU07QUFBQSxBQUNSLGFBQUssb0JBQVMsWUFBWTtBQUN4QixjQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUMxQixjQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLGNBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7QUFDL0IsZ0JBQU07QUFBQSxBQUNSO0FBQ0UsZ0JBQU0sSUFBSSxLQUFLLHlCQUF1QixRQUFRLENBQUcsQ0FBQztBQUFBLE9BQ3JEO0tBQ0Y7OztXQUVpQiw0QkFBQyxTQUFnQixFQUFFLFNBQWdCLEVBQVE7QUFDM0QsVUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3ZCLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLFFBQVEsRUFBRTtBQUM5QyxZQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztBQUNyQyxZQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyw4QkFBOEIsRUFBRSxDQUFDO09BQ3ZEO0tBQ0Y7OztXQUVnQiw2QkFBUzt1Q0FLcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFOztVQUhqQyxhQUFhLDhCQUFiLGFBQWE7VUFDYixVQUFVLDhCQUFWLFVBQVU7VUFDVixlQUFlLDhCQUFmLGVBQWU7O0FBRWpCLFVBQUksQ0FBQyxnQkFBZ0IsR0FBRyx1QkFBUyxNQUFNLENBQ3JDO0FBQ0UscUJBQWEsRUFBRSxhQUFhLEFBQUM7QUFDN0Isa0JBQVUsRUFBRSxVQUFVLEFBQUM7QUFDdkIsdUJBQWUsRUFBRSxlQUFlLEFBQUM7OztBQUdqQyxpQkFBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxBQUFDO1FBQ2hDLEVBQ0YsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FDNUMsQ0FBQztLQUNIOzs7V0FFaUIsOEJBQVM7VUFDbEIsU0FBUyxHQUFJLElBQUksQ0FBQyxLQUFLLENBQXZCLFNBQVM7O2dDQU1aLFNBQVMsQ0FBQyxRQUFRLEVBQUU7O1VBSnRCLFdBQVcsdUJBQVgsV0FBVztVQUNYLGdCQUFnQix1QkFBaEIsZ0JBQWdCO1VBQ2hCLGNBQWMsdUJBQWQsY0FBYztVQUNkLFlBQVksdUJBQVosWUFBWTs7QUFFZCxVQUFJLENBQUMsaUJBQWlCLEdBQUcsdUJBQVMsTUFBTSxDQUN0QztBQUNFLHdCQUFnQixFQUFFLGdCQUFnQixBQUFDO0FBQ25DLGVBQU8sRUFBRSxjQUFjLEFBQUM7QUFDeEIsbUJBQVcsRUFBRSxXQUFXLEFBQUM7QUFDekIsb0JBQVksRUFBRSxZQUFZLEFBQUM7QUFDM0IsaUJBQVMsRUFBRSxTQUFTLEFBQUM7UUFDckIsRUFDRixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUM1QyxDQUFDO0tBQ0g7OztXQUVVLHVCQUFTO1VBQ1gsU0FBUyxHQUFJLElBQUksQ0FBQyxLQUFLLENBQXZCLFNBQVM7O2lDQUM4QixTQUFTLENBQUMsUUFBUSxFQUFFOztVQUEzRCxtQkFBbUIsd0JBQW5CLG1CQUFtQjtVQUFFLGNBQWMsd0JBQWQsY0FBYzs7MENBQ3ZCLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRTs7VUFBMUMsUUFBUSxpQ0FBUixRQUFROztBQUNmLFVBQUksQ0FBQyxjQUFjLEdBQUcsdUJBQVMsTUFBTSxDQUVqQzs7VUFBSyxTQUFTLEVBQUMsK0JBQStCO1FBQzVDO0FBQ0Usd0JBQWMsRUFBRSxRQUFRLEFBQUM7QUFDekIscUJBQVcsRUFBRSxtQkFBbUIsQUFBQztBQUNqQyx3QkFBYyxFQUFFLGNBQWMsQUFBQztBQUMvQixtQkFBUyxFQUFFLFNBQVMsQUFBQztVQUNyQjtPQUNFLEVBRVIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQ3JDLENBQUM7S0FDSDs7O1dBRWEsMEJBQVM7b0JBQ2tELElBQUksQ0FBQyxLQUFLO1VBQTFFLFFBQVEsV0FBUixRQUFRO1VBQWtCLFFBQVEsV0FBeEIsY0FBYztVQUE0QixRQUFRLFdBQXhCLGNBQWM7O0FBQ3pELFVBQUksQ0FBQyxtQkFBbUIsR0FBRyx1QkFBUyxNQUFNLENBQ3RDO0FBQ0UsbUJBQVcsRUFBRSxRQUFRLENBQUMsYUFBYSxBQUFDO0FBQ3BDLGtCQUFVLEVBQUUsSUFBSSxDQUFDLGVBQWUsQUFBQztBQUNqQyxnQkFBUSxFQUFFLFFBQVEsQUFBQztBQUNuQixlQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU8sQUFBQztBQUMxQix3QkFBZ0IsRUFBRSxRQUFRLENBQUMsZ0JBQWdCLEFBQUM7QUFDNUMscUJBQWEsRUFBRSxRQUFRLENBQUMsSUFBSSxBQUFDO0FBQzdCLDBCQUFrQixFQUFFLFFBQVEsQ0FBQyxJQUFJLEFBQUM7QUFDbEMsc0JBQWMsRUFBRSxRQUFRLENBQUMsY0FBYyxBQUFDO0FBQ3hDLGdCQUFRLEVBQUUsSUFBSSxBQUFDO0FBQ2YsZ0JBQVEsRUFBRSxjQUFjLEFBQUM7QUFDekIsb0NBQTRCLEVBQUUsY0FBYyxBQUFDO1FBQzdDLEVBQ0YsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQzVDLENBQUM7QUFDRixVQUFNLFVBQVUsR0FBRyxzQ0FBYSxRQUFRLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsbUJBQW1CLEdBQUcsdUJBQVMsTUFBTSxDQUN0QztBQUNFLG1CQUFXLEVBQUUsUUFBUSxDQUFDLGFBQWEsQUFBQztBQUNwQyxrQkFBVSxFQUFFLFVBQVUsQUFBQztBQUN2QixnQkFBUSxFQUFFLFFBQVEsQUFBQztBQUNuQixlQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU8sQUFBQztBQUMxQix3QkFBZ0IsRUFBRSxRQUFRLENBQUMsZ0JBQWdCLEFBQUM7QUFDNUMsMEJBQWtCLEVBQUUsUUFBUSxDQUFDLElBQUksQUFBQztBQUNsQyxxQkFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhLEFBQUM7QUFDdEMsc0JBQWMsRUFBRSxRQUFRLENBQUMsY0FBYyxBQUFDO0FBQ3hDLG9DQUE0QixFQUFFLElBQUksQ0FBQyw2QkFBNkIsQUFBQztBQUNqRSxnQkFBUSxFQUFFLEtBQUssQUFBQztBQUNoQixnQkFBUSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQUFBQztRQUN0QyxFQUNGLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUM1QyxDQUFDO0tBQ0g7OztXQUU0Qix5Q0FBUztBQUNwQyxVQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUN6Qjs7O1dBRWtCLCtCQUFTO0FBQzFCLFVBQUksQ0FBQyxrQkFBa0IsR0FBRyx1QkFBUyxNQUFNLENBQ3ZDO0FBQ0UsaUJBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQUFBQztBQUNoQyx5QkFBaUIsRUFBRSxJQUFJLENBQUMseUJBQXlCLEFBQUM7UUFDbEQsRUFDRixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUM1QyxDQUFDO0tBQ0g7OztXQUVnQiw2QkFBUztvQkFDaUIsSUFBSSxDQUFDLEtBQUs7VUFBNUMsY0FBYyxXQUFkLGNBQWM7VUFBRSxjQUFjLFdBQWQsY0FBYztVQUNyQixVQUFVLEdBQW1ELGNBQWMsQ0FBcEYsT0FBTztVQUFnQyxRQUFRLEdBQXVCLGNBQWMsQ0FBL0QsZ0JBQWdCO1VBQWtCLFdBQVcsR0FBSSxjQUFjLENBQW5DLElBQUk7VUFDNUMsVUFBVSxHQUFtRCxjQUFjLENBQXBGLE9BQU87VUFBZ0MsUUFBUSxHQUF1QixjQUFjLENBQS9ELGdCQUFnQjtVQUFrQixXQUFXLEdBQUksY0FBYyxDQUFuQyxJQUFJOztBQUM1RCxVQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3pFLFVBQUksQ0FBQyxvQkFBb0IsR0FBRyx1QkFBUyxNQUFNLENBQ3pDO0FBQ0UscUJBQWEsRUFBRSxxQkFBcUIsQ0FBQyxZQUFZLEFBQUM7QUFDbEQsa0JBQVUsRUFBRSxRQUFRLENBQUMsS0FBSyxBQUFDO0FBQzNCLGtCQUFVLEVBQUUsVUFBVSxBQUFDO0FBQ3ZCLG1CQUFXLEVBQUUsV0FBVyxBQUFDO0FBQ3pCLG9CQUFZLEVBQUUsUUFBUSxDQUFDLE9BQU8sQUFBQztBQUMvQixrQkFBVSxFQUFFLFVBQVUsQUFBQztBQUN2QixtQkFBVyxFQUFFLFdBQVcsQUFBQztBQUN6QixlQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixBQUFDO1FBQ2pDLEVBQ0YscUJBQXFCLENBQ3RCLENBQUM7S0FDSDs7O1dBRWlCLDRCQUFDLFVBQWtCLEVBQUUsV0FBb0IsRUFBUTtBQUNqRSxVQUFNLG1CQUFtQixHQUFHLFdBQVcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDO0FBQzlGLCtCQUFVLG1CQUFtQixFQUFFLDZEQUE2RCxDQUFDLENBQUM7QUFDOUYsVUFBTSxVQUFVLEdBQUcsbUJBQW1CLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDeEQsZ0JBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3BEOzs7V0FFYyx5QkFBQyxJQUFlLEVBQWU7QUFDNUMsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDOUQ7OztXQUVxQixnQ0FBQyxJQUFlLEVBQWU7QUFDbkQsYUFBTyxxQkFBZSxZQUFNO0FBQzFCLFlBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNoQixDQUFDLENBQUM7S0FDSjs7O1dBRW1CLGdDQUFTO0FBQzNCLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7OztXQUVLLGtCQUFpQjtBQUNyQixVQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM1QixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFO3lDQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTs7WUFBM0MsUUFBUSw4QkFBUixRQUFRO3NCQUMwQixJQUFJLENBQUMsS0FBSztZQUE1QyxlQUFjLFdBQWQsY0FBYztZQUFFLGVBQWMsV0FBZCxjQUFjOztBQUNyQyx3QkFBZ0IsR0FDZDtBQUNFLGtCQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEFBQUM7QUFDOUIsa0JBQVEsRUFBRSxRQUFRLEFBQUM7QUFDbkIsMEJBQWdCLEVBQUUsZUFBYyxDQUFDLGFBQWEsQUFBQztBQUMvQywwQkFBZ0IsRUFBRSxlQUFjLENBQUMsYUFBYSxBQUFDO0FBQy9DLHNCQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsQUFBQztBQUNqQywwQkFBZ0IsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEFBQUM7VUFDekMsQUFDSCxDQUFDO09BQ0g7QUFDRCxhQUNFOztVQUFLLFNBQVMsRUFBQyw2QkFBNkI7UUFDekMsZ0JBQWdCO1FBQ2pCLDJDQUFLLFNBQVMsRUFBQyw2QkFBNkIsRUFBQyxHQUFHLEVBQUMsZUFBZSxHQUFHO09BQy9ELENBQ047S0FDSDs7O1dBRWdCLDZCQUFTO0FBQ3hCLFVBQU0sWUFBWSxHQUFHLHVCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRCwrQkFBVSxZQUFZLEVBQUUsNkRBQTZELENBQUMsQ0FBQztBQUN2RixVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsb0NBQW9DLENBQUMsQ0FBQztLQUM1RTs7O1dBRXFCLGdDQUFDLFdBQW1CLEVBQVE7QUFDaEQsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ2xEOzs7V0FFd0IsbUNBQUMsUUFBc0IsRUFBUTtBQUN0RCxVQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDNUM7Ozs7Ozs7V0FLbUIsOEJBQUMsU0FBMEIsRUFBUTtVQUVuRCxRQUFRLEdBT04sU0FBUyxDQVBYLFFBQVE7VUFDUixXQUFXLEdBTVQsU0FBUyxDQU5YLFdBQVc7VUFDWCxXQUFXLEdBS1QsU0FBUyxDQUxYLFdBQVc7VUFDWCxhQUFhLEdBSVgsU0FBUyxDQUpYLGFBQWE7VUFDYixnQkFBZ0IsR0FHZCxTQUFTLENBSFgsZ0JBQWdCO1VBQ2hCLGlCQUFpQixHQUVmLFNBQVMsQ0FGWCxpQkFBaUI7VUFDakIsZUFBZSxHQUNiLFNBQVMsQ0FEWCxlQUFlOzt5QkFJZiw0QkFBWSxXQUFXLEVBQUUsV0FBVyxDQUFDOztVQURoQyxVQUFVLGdCQUFWLFVBQVU7VUFBRSxZQUFZLGdCQUFaLFlBQVk7VUFBRSxjQUFjLGdCQUFkLGNBQWM7VUFBRSxjQUFjLGdCQUFkLGNBQWM7OztBQUkvRCxVQUFNLGNBQWMsR0FBRztBQUNyQixxQkFBYSxFQUFFLGlCQUFpQjtBQUNoQyxZQUFJLEVBQUUsV0FBVztBQUNqQixlQUFPLEVBQUUsY0FBYztBQUN2Qix3QkFBZ0IsRUFBRTtBQUNoQixlQUFLLEVBQUUsRUFBRTtBQUNULGlCQUFPLEVBQUUsWUFBWTtTQUN0QjtBQUNELHNCQUFjLEVBQUUsZ0JBQWdCLElBQUksRUFBRTtPQUN2QyxDQUFDO0FBQ0YsVUFBTSxjQUFjLEdBQUc7QUFDckIscUJBQWEsRUFBRSxlQUFlO0FBQzlCLFlBQUksRUFBRSxXQUFXO0FBQ2pCLHFCQUFhLEVBQWIsYUFBYTtBQUNiLGVBQU8sRUFBRSxjQUFjO0FBQ3ZCLHdCQUFnQixFQUFFO0FBQ2hCLGVBQUssRUFBRSxVQUFVO0FBQ2pCLGlCQUFPLEVBQUUsRUFBRTtTQUNaO0FBQ0Qsc0JBQWMsRUFBRSxFQUFFO09BQ25CLENBQUM7QUFDRixVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osZ0JBQVEsRUFBUixRQUFRO0FBQ1Isc0JBQWMsRUFBZCxjQUFjO0FBQ2Qsc0JBQWMsRUFBZCxjQUFjO09BQ2YsQ0FBQyxDQUFDO0tBQ0o7OztTQWxhRyxpQkFBaUI7R0FBUyxvQkFBTSxTQUFTOztBQXFhL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJEaWZmVmlld0NvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtGaWxlQ2hhbmdlU3RhdGUsIE9mZnNldE1hcCwgRGlmZk1vZGVUeXBlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtcbiAgVUlFbGVtZW50LFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpZmYtdWktcHJvdmlkZXItaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUsIFRleHRCdWZmZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgRGlmZlZpZXdFZGl0b3JQYW5lIGZyb20gJy4vRGlmZlZpZXdFZGl0b3JQYW5lJztcbmltcG9ydCBEaWZmVmlld1RyZWUgZnJvbSAnLi9EaWZmVmlld1RyZWUnO1xuaW1wb3J0IFN5bmNTY3JvbGwgZnJvbSAnLi9TeW5jU2Nyb2xsJztcbmltcG9ydCBEaWZmVGltZWxpbmVWaWV3IGZyb20gJy4vRGlmZlRpbWVsaW5lVmlldyc7XG5pbXBvcnQgRGlmZlZpZXdUb29sYmFyIGZyb20gJy4vRGlmZlZpZXdUb29sYmFyJztcbmltcG9ydCBEaWZmTmF2aWdhdGlvbkJhciBmcm9tICcuL0RpZmZOYXZpZ2F0aW9uQmFyJztcbmltcG9ydCBEaWZmQ29tbWl0VmlldyBmcm9tICcuL0RpZmZDb21taXRWaWV3JztcbmltcG9ydCBEaWZmUHVibGlzaFZpZXcgZnJvbSAnLi9EaWZmUHVibGlzaFZpZXcnO1xuaW1wb3J0IHtjb21wdXRlRGlmZiwgZ2V0T2Zmc2V0TGluZU51bWJlcn0gZnJvbSAnLi9kaWZmLXV0aWxzJztcbmltcG9ydCB7Y3JlYXRlUGFuZUNvbnRhaW5lcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtidWZmZXJGb3JVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7XG4gIERpZmZNb2RlLFxuICBUT09MQkFSX1ZJU0lCTEVfU0VUVElORyxcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGRpZmZNb2RlbDogRGlmZlZpZXdNb2RlbDtcbn07XG5cbnR5cGUgRWRpdG9yU3RhdGUgPSB7XG4gIHJldmlzaW9uVGl0bGU6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBzYXZlZENvbnRlbnRzPzogc3RyaW5nO1xuICBvZmZzZXRzOiBPZmZzZXRNYXA7XG4gIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICBhZGRlZDogQXJyYXk8bnVtYmVyPjtcbiAgICByZW1vdmVkOiBBcnJheTxudW1iZXI+O1xuICB9O1xuICBpbmxpbmVFbGVtZW50czogQXJyYXk8VUlFbGVtZW50Pjtcbn07XG5cbnR5cGUgU3RhdGUgPSB7XG4gIGZpbGVQYXRoOiBOdWNsaWRlVXJpO1xuICBvbGRFZGl0b3JTdGF0ZTogRWRpdG9yU3RhdGU7XG4gIG5ld0VkaXRvclN0YXRlOiBFZGl0b3JTdGF0ZTtcbiAgdG9vbGJhclZpc2libGU6IGJvb2xlYW47XG59O1xuXG5mdW5jdGlvbiBpbml0aWFsRWRpdG9yU3RhdGUoKTogRWRpdG9yU3RhdGUge1xuICByZXR1cm4ge1xuICAgIHJldmlzaW9uVGl0bGU6ICcnLFxuICAgIHRleHQ6ICcnLFxuICAgIG9mZnNldHM6IG5ldyBNYXAoKSxcbiAgICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgICBhZGRlZDogW10sXG4gICAgICByZW1vdmVkOiBbXSxcbiAgICB9LFxuICAgIGlubGluZUVsZW1lbnRzOiBbXSxcbiAgfTtcbn1cblxuY29uc3QgRU1QVFlfRlVOQ1RJT04gPSAoKSA9PiB7fTtcblxuY2xhc3MgRGlmZlZpZXdDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3N5bmNTY3JvbGw6IFN5bmNTY3JvbGw7XG4gIF9vbGRFZGl0b3JQYW5lOiBhdG9tJFBhbmU7XG4gIF9vbGRFZGl0b3JDb21wb25lbnQ6IERpZmZWaWV3RWRpdG9yUGFuZTtcbiAgX3BhbmVDb250YWluZXI6IE9iamVjdDtcbiAgX25ld0VkaXRvclBhbmU6IGF0b20kUGFuZTtcbiAgX25ld0VkaXRvckNvbXBvbmVudDogRGlmZlZpZXdFZGl0b3JQYW5lO1xuICBfYm90dG9tUmlnaHRQYW5lOiBhdG9tJFBhbmU7XG4gIF90aW1lbGluZUNvbXBvbmVudDogP0RpZmZUaW1lbGluZVZpZXc7XG4gIF90cmVlUGFuZTogYXRvbSRQYW5lO1xuICBfdHJlZUNvbXBvbmVudDogUmVhY3RDb21wb25lbnQ7XG4gIF9uYXZpZ2F0aW9uUGFuZTogYXRvbSRQYW5lO1xuICBfbmF2aWdhdGlvbkNvbXBvbmVudDogRGlmZk5hdmlnYXRpb25CYXI7XG4gIF9jb21taXRDb21wb25lbnQ6ID9EaWZmQ29tbWl0VmlldztcbiAgX3B1Ymxpc2hDb21wb25lbnQ6ID9EaWZmUHVibGlzaFZpZXc7XG4gIF9yZWFkb25seUJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICBjb25zdCB0b29sYmFyVmlzaWJsZSA9ICgoZmVhdHVyZUNvbmZpZy5nZXQoVE9PTEJBUl9WSVNJQkxFX1NFVFRJTkcpOiBhbnkpOiBib29sZWFuKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbW9kZTogRGlmZk1vZGUuQlJPV1NFX01PREUsXG4gICAgICBmaWxlUGF0aDogJycsXG4gICAgICB0b29sYmFyVmlzaWJsZSxcbiAgICAgIG9sZEVkaXRvclN0YXRlOiBpbml0aWFsRWRpdG9yU3RhdGUoKSxcbiAgICAgIG5ld0VkaXRvclN0YXRlOiBpbml0aWFsRWRpdG9yU3RhdGUoKSxcbiAgICB9O1xuICAgICh0aGlzOiBhbnkpLl9vbk1vZGVsU3RhdGVDaGFuZ2UgPSB0aGlzLl9vbk1vZGVsU3RhdGVDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdXBkYXRlTGluZURpZmZTdGF0ZSA9IHRoaXMuX3VwZGF0ZUxpbmVEaWZmU3RhdGUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25DaGFuZ2VOZXdUZXh0RWRpdG9yID0gdGhpcy5fb25DaGFuZ2VOZXdUZXh0RWRpdG9yLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uVGltZWxpbmVDaGFuZ2VSZXZpc2lvbiA9IHRoaXMuX29uVGltZWxpbmVDaGFuZ2VSZXZpc2lvbi5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbk5hdmlnYXRpb25DbGljayA9IHRoaXMuX29uTmF2aWdhdGlvbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQgPSB0aGlzLl9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50LmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2hhbmdlTW9kZSA9IHRoaXMuX29uQ2hhbmdlTW9kZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vblN3aXRjaFRvRWRpdG9yID0gdGhpcy5fb25Td2l0Y2hUb0VkaXRvci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3JlYWRvbmx5QnVmZmVyID0gbmV3IFRleHRCdWZmZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChmZWF0dXJlQ29uZmlnLm9ic2VydmUoVE9PTEJBUl9WSVNJQkxFX1NFVFRJTkcsIHRvb2xiYXJWaXNpYmxlID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3Rvb2xiYXJWaXNpYmxlfSk7XG4gICAgfSkpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSB0aGlzLnByb3BzO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGRpZmZNb2RlbC5vbkFjdGl2ZUZpbGVVcGRhdGVzKHRoaXMuX3VwZGF0ZUxpbmVEaWZmU3RhdGUpKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChkaWZmTW9kZWwub25EaWRVcGRhdGVTdGF0ZSh0aGlzLl9vbk1vZGVsU3RhdGVDaGFuZ2UpKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKGFjdGl2ZUl0ZW0gPT4ge1xuICAgICAgaWYgKGFjdGl2ZUl0ZW0gIT0gbnVsbCAmJiAoYWN0aXZlSXRlbTogYW55KS50YWdOYW1lID09PSAnTlVDTElERS1ESUZGLVZJRVcnKSB7XG4gICAgICAgIC8vIFJlLXJlbmRlciBvbiBhY3RpdmF0aW9uLlxuICAgICAgICB0aGlzLnNldFN0YXRlKHt9KTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICB0aGlzLl9wYW5lQ29udGFpbmVyID0gY3JlYXRlUGFuZUNvbnRhaW5lcigpO1xuICAgIC8vIFRoZSBjaGFuZ2VkIGZpbGVzIHN0YXR1cyB0cmVlIHRha2VzIDEvNSBvZiB0aGUgd2lkdGggYW5kIGxpdmVzIG9uIHRoZSByaWdodCBtb3N0LFxuICAgIC8vIHdoaWxlIGJlaW5nIHZlcnRpY2FsbHkgc3BsdCB3aXRoIHRoZSByZXZpc2lvbiB0aW1lbGluZSBzdGFjayBwYW5lLlxuICAgIGNvbnN0IHRvcFBhbmUgPSB0aGlzLl9uZXdFZGl0b3JQYW5lID0gdGhpcy5fcGFuZUNvbnRhaW5lci5nZXRBY3RpdmVQYW5lKCk7XG4gICAgdGhpcy5fYm90dG9tUmlnaHRQYW5lID0gdG9wUGFuZS5zcGxpdERvd24oe1xuICAgICAgZmxleFNjYWxlOiAwLjMsXG4gICAgfSk7XG4gICAgdGhpcy5fdHJlZVBhbmUgPSB0aGlzLl9ib3R0b21SaWdodFBhbmUuc3BsaXRMZWZ0KHtcbiAgICAgIGZsZXhTY2FsZTogMC4zNSxcbiAgICB9KTtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uUGFuZSA9IHRvcFBhbmUuc3BsaXRSaWdodCh7XG4gICAgICBmbGV4U2NhbGU6IDAuMDQ1LFxuICAgIH0pO1xuICAgIHRoaXMuX29sZEVkaXRvclBhbmUgPSB0b3BQYW5lLnNwbGl0TGVmdCh7XG4gICAgICBmbGV4U2NhbGU6IDEsXG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZW5kZXJEaWZmVmlldygpO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fb2xkRWRpdG9yUGFuZSwgdHJ1ZSksXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fbmV3RWRpdG9yUGFuZSwgdHJ1ZSksXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fbmF2aWdhdGlvblBhbmUsIHRydWUpLFxuICAgICAgdGhpcy5fZGVzdHJveVBhbmVEaXNwb3NhYmxlKHRoaXMuX3RyZWVQYW5lLCB0cnVlKSxcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl9ib3R0b21SaWdodFBhbmUpLFxuICAgICk7XG5cbiAgICBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3BhbmVDb250YWluZXInXSkuYXBwZW5kQ2hpbGQoXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fcGFuZUNvbnRhaW5lciksXG4gICAgKTtcblxuICAgIHRoaXMuX3VwZGF0ZUxpbmVEaWZmU3RhdGUoZGlmZk1vZGVsLmdldEFjdGl2ZUZpbGVTdGF0ZSgpKTtcbiAgfVxuXG4gIF9vbk1vZGVsU3RhdGVDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7fSk7XG4gIH1cblxuICBfc2V0dXBTeW5jU2Nyb2xsKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9vbGRFZGl0b3JDb21wb25lbnQgPT0gbnVsbCB8fCB0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBvbGRUZXh0RWRpdG9yRWxlbWVudCA9IHRoaXMuX29sZEVkaXRvckNvbXBvbmVudC5nZXRFZGl0b3JEb21FbGVtZW50KCk7XG4gICAgY29uc3QgbmV3VGV4dEVkaXRvckVsZW1lbnQgPSB0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQuZ2V0RWRpdG9yRG9tRWxlbWVudCgpO1xuICAgIGNvbnN0IHN5bmNTY3JvbGwgPSB0aGlzLl9zeW5jU2Nyb2xsO1xuICAgIGlmIChzeW5jU2Nyb2xsICE9IG51bGwpIHtcbiAgICAgIHN5bmNTY3JvbGwuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5yZW1vdmUoc3luY1Njcm9sbCk7XG4gICAgfVxuICAgIHRoaXMuX3N5bmNTY3JvbGwgPSBuZXcgU3luY1Njcm9sbChcbiAgICAgIG9sZFRleHRFZGl0b3JFbGVtZW50LFxuICAgICAgbmV3VGV4dEVkaXRvckVsZW1lbnQsXG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZCh0aGlzLl9zeW5jU2Nyb2xsKTtcbiAgfVxuXG4gIF9zY3JvbGxUb0ZpcnN0SGlnaGxpZ2h0ZWRMaW5lKCk6IHZvaWQge1xuICAgIC8vIFNjaGVkdWxlIHNjcm9sbCB0byBmaXJzdCBsaW5lIGFmdGVyIGFsbCBsaW5lcyBoYXZlIGJlZW4gcmVuZGVyZWQuXG4gICAgY29uc3Qge29sZEVkaXRvclN0YXRlLCBuZXdFZGl0b3JTdGF0ZX0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHJlbW92ZWRMaW5lcyA9IG9sZEVkaXRvclN0YXRlLmhpZ2hsaWdodGVkTGluZXMucmVtb3ZlZDtcbiAgICBjb25zdCBhZGRlZExpbmVzID0gbmV3RWRpdG9yU3RhdGUuaGlnaGxpZ2h0ZWRMaW5lcy5hZGRlZDtcbiAgICBpZiAoYWRkZWRMaW5lcy5sZW5ndGggPT09IDAgJiYgcmVtb3ZlZExpbmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaXJzdFJlbW92ZWRMaW5lID0gZ2V0T2Zmc2V0TGluZU51bWJlcihcbiAgICAgIHJlbW92ZWRMaW5lc1swXSB8fCAwLFxuICAgICAgb2xkRWRpdG9yU3RhdGUub2Zmc2V0cyxcbiAgICApO1xuICAgIGNvbnN0IGZpcnN0QWRkZWRMaW5lID0gZ2V0T2Zmc2V0TGluZU51bWJlcihcbiAgICAgIGFkZGVkTGluZXNbMF0gfHwgMCxcbiAgICAgIG5ld0VkaXRvclN0YXRlLm9mZnNldHMsXG4gICAgKTtcbiAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBhZGRlZExpbmVzLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAocmVtb3ZlZExpbmVzLmxlbmd0aCA+IDAgJiYgZmlyc3RSZW1vdmVkTGluZSA8IGZpcnN0QWRkZWRMaW5lKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuX29sZEVkaXRvckNvbXBvbmVudC5zY3JvbGxUb1NjcmVlbkxpbmUoZmlyc3RSZW1vdmVkTGluZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQuc2Nyb2xsVG9TY3JlZW5MaW5lKGZpcnN0QWRkZWRMaW5lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9vbkNoYW5nZU1vZGUobW9kZTogRGlmZk1vZGVUeXBlKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuc2V0Vmlld01vZGUobW9kZSk7XG4gIH1cblxuICBfcmVuZGVyRGlmZlZpZXcoKTogdm9pZCB7XG4gICAgdGhpcy5fcmVuZGVyVHJlZSgpO1xuICAgIHRoaXMuX3JlbmRlckVkaXRvcnMoKTtcbiAgICB0aGlzLl9yZW5kZXJOYXZpZ2F0aW9uKCk7XG4gICAgdGhpcy5fcmVuZGVyQm90dG9tUmlnaHRQYW5lKCk7XG4gIH1cblxuICBfcmVuZGVyQm90dG9tUmlnaHRQYW5lKCk6IHZvaWQge1xuICAgIGNvbnN0IHt2aWV3TW9kZX0gPSB0aGlzLnByb3BzLmRpZmZNb2RlbC5nZXRTdGF0ZSgpO1xuICAgIHN3aXRjaCAodmlld01vZGUpIHtcbiAgICAgIGNhc2UgRGlmZk1vZGUuQlJPV1NFX01PREU6XG4gICAgICAgIHRoaXMuX3JlbmRlclRpbWVsaW5lVmlldygpO1xuICAgICAgICB0aGlzLl9jb21taXRDb21wb25lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLl9wdWJsaXNoQ29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERpZmZNb2RlLkNPTU1JVF9NT0RFOlxuICAgICAgICB0aGlzLl9yZW5kZXJDb21taXRWaWV3KCk7XG4gICAgICAgIHRoaXMuX3RpbWVsaW5lQ29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcHVibGlzaENvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaWZmTW9kZS5QVUJMSVNIX01PREU6XG4gICAgICAgIHRoaXMuX3JlbmRlclB1Ymxpc2hWaWV3KCk7XG4gICAgICAgIHRoaXMuX2NvbW1pdENvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuX3RpbWVsaW5lQ29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgRGlmZiBNb2RlOiAke3ZpZXdNb2RlfWApO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzLCBwcmV2U3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gICAgdGhpcy5fcmVuZGVyRGlmZlZpZXcoKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5maWxlUGF0aCAhPT0gcHJldlN0YXRlLmZpbGVQYXRoKSB7XG4gICAgICB0aGlzLl9zY3JvbGxUb0ZpcnN0SGlnaGxpZ2h0ZWRMaW5lKCk7XG4gICAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5lbWl0QWN0aXZlQnVmZmVyQ2hhbmdlTW9kaWZpZWQoKTtcbiAgICB9XG4gIH1cblxuICBfcmVuZGVyQ29tbWl0VmlldygpOiB2b2lkIHtcbiAgICBjb25zdCB7XG4gICAgICBjb21taXRNZXNzYWdlLFxuICAgICAgY29tbWl0TW9kZSxcbiAgICAgIGNvbW1pdE1vZGVTdGF0ZSxcbiAgICB9ID0gdGhpcy5wcm9wcy5kaWZmTW9kZWwuZ2V0U3RhdGUoKTtcbiAgICB0aGlzLl9jb21taXRDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RGlmZkNvbW1pdFZpZXdcbiAgICAgICAgY29tbWl0TWVzc2FnZT17Y29tbWl0TWVzc2FnZX1cbiAgICAgICAgY29tbWl0TW9kZT17Y29tbWl0TW9kZX1cbiAgICAgICAgY29tbWl0TW9kZVN0YXRlPXtjb21taXRNb2RlU3RhdGV9XG4gICAgICAgIC8vIGBkaWZmTW9kZWxgIGlzIGFjdGluZyBhcyB0aGUgYWN0aW9uIGNyZWF0b3IgZm9yIGNvbW1pdCB2aWV3IGFuZCBuZWVkcyB0byBiZSBwYXNzZWQgc29cbiAgICAgICAgLy8gbWV0aG9kcyBjYW4gYmUgY2FsbGVkIG9uIGl0LlxuICAgICAgICBkaWZmTW9kZWw9e3RoaXMucHJvcHMuZGlmZk1vZGVsfVxuICAgICAgLz4sXG4gICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9ib3R0b21SaWdodFBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyUHVibGlzaFZpZXcoKTogdm9pZCB7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIHB1Ymxpc2hNb2RlLFxuICAgICAgcHVibGlzaE1vZGVTdGF0ZSxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlLFxuICAgICAgaGVhZFJldmlzaW9uLFxuICAgIH0gPSBkaWZmTW9kZWwuZ2V0U3RhdGUoKTtcbiAgICB0aGlzLl9wdWJsaXNoQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERpZmZQdWJsaXNoVmlld1xuICAgICAgICBwdWJsaXNoTW9kZVN0YXRlPXtwdWJsaXNoTW9kZVN0YXRlfVxuICAgICAgICBtZXNzYWdlPXtwdWJsaXNoTWVzc2FnZX1cbiAgICAgICAgcHVibGlzaE1vZGU9e3B1Ymxpc2hNb2RlfVxuICAgICAgICBoZWFkUmV2aXNpb249e2hlYWRSZXZpc2lvbn1cbiAgICAgICAgZGlmZk1vZGVsPXtkaWZmTW9kZWx9XG4gICAgICAvPixcbiAgICAgIHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX2JvdHRvbVJpZ2h0UGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJUcmVlKCk6IHZvaWQge1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7c2VsZWN0ZWRGaWxlQ2hhbmdlcywgc2hvd05vbkhnUmVwb3N9ID0gZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IGRpZmZNb2RlbC5nZXRBY3RpdmVGaWxlU3RhdGUoKTtcbiAgICB0aGlzLl90cmVlQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LXRyZWUgcGFkZGVkXCI+XG4gICAgICAgICAgPERpZmZWaWV3VHJlZVxuICAgICAgICAgICAgYWN0aXZlRmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgICAgZmlsZUNoYW5nZXM9e3NlbGVjdGVkRmlsZUNoYW5nZXN9XG4gICAgICAgICAgICBzaG93Tm9uSGdSZXBvcz17c2hvd05vbkhnUmVwb3N9XG4gICAgICAgICAgICBkaWZmTW9kZWw9e2RpZmZNb2RlbH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICksXG4gICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl90cmVlUGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJFZGl0b3JzKCk6IHZvaWQge1xuICAgIGNvbnN0IHtmaWxlUGF0aCwgb2xkRWRpdG9yU3RhdGU6IG9sZFN0YXRlLCBuZXdFZGl0b3JTdGF0ZTogbmV3U3RhdGV9ID0gdGhpcy5zdGF0ZTtcbiAgICB0aGlzLl9vbGRFZGl0b3JDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICAgIDxEaWZmVmlld0VkaXRvclBhbmVcbiAgICAgICAgICBoZWFkZXJUaXRsZT17b2xkU3RhdGUucmV2aXNpb25UaXRsZX1cbiAgICAgICAgICB0ZXh0QnVmZmVyPXt0aGlzLl9yZWFkb25seUJ1ZmZlcn1cbiAgICAgICAgICBmaWxlUGF0aD17ZmlsZVBhdGh9XG4gICAgICAgICAgb2Zmc2V0cz17b2xkU3RhdGUub2Zmc2V0c31cbiAgICAgICAgICBoaWdobGlnaHRlZExpbmVzPXtvbGRTdGF0ZS5oaWdobGlnaHRlZExpbmVzfVxuICAgICAgICAgIHNhdmVkQ29udGVudHM9e29sZFN0YXRlLnRleHR9XG4gICAgICAgICAgaW5pdGlhbFRleHRDb250ZW50PXtvbGRTdGF0ZS50ZXh0fVxuICAgICAgICAgIGlubGluZUVsZW1lbnRzPXtvbGRTdGF0ZS5pbmxpbmVFbGVtZW50c31cbiAgICAgICAgICByZWFkT25seT17dHJ1ZX1cbiAgICAgICAgICBvbkNoYW5nZT17RU1QVFlfRlVOQ1RJT059XG4gICAgICAgICAgb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudD17RU1QVFlfRlVOQ1RJT059XG4gICAgICAgIC8+LFxuICAgICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9vbGRFZGl0b3JQYW5lKSxcbiAgICApO1xuICAgIGNvbnN0IHRleHRCdWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgICAgPERpZmZWaWV3RWRpdG9yUGFuZVxuICAgICAgICAgIGhlYWRlclRpdGxlPXtuZXdTdGF0ZS5yZXZpc2lvblRpdGxlfVxuICAgICAgICAgIHRleHRCdWZmZXI9e3RleHRCdWZmZXJ9XG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e25ld1N0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17bmV3U3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBpbml0aWFsVGV4dENvbnRlbnQ9e25ld1N0YXRlLnRleHR9XG4gICAgICAgICAgc2F2ZWRDb250ZW50cz17bmV3U3RhdGUuc2F2ZWRDb250ZW50c31cbiAgICAgICAgICBpbmxpbmVFbGVtZW50cz17bmV3U3RhdGUuaW5saW5lRWxlbWVudHN9XG4gICAgICAgICAgb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudD17dGhpcy5fb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudH1cbiAgICAgICAgICByZWFkT25seT17ZmFsc2V9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlTmV3VGV4dEVkaXRvcn1cbiAgICAgICAgLz4sXG4gICAgICAgIHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX25ld0VkaXRvclBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXR1cFN5bmNTY3JvbGwoKTtcbiAgfVxuXG4gIF9yZW5kZXJUaW1lbGluZVZpZXcoKTogdm9pZCB7XG4gICAgdGhpcy5fdGltZWxpbmVDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RGlmZlRpbWVsaW5lVmlld1xuICAgICAgICBkaWZmTW9kZWw9e3RoaXMucHJvcHMuZGlmZk1vZGVsfVxuICAgICAgICBvblNlbGVjdGlvbkNoYW5nZT17dGhpcy5fb25UaW1lbGluZUNoYW5nZVJldmlzaW9ufVxuICAgICAgLz4sXG4gICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9ib3R0b21SaWdodFBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyTmF2aWdhdGlvbigpOiB2b2lkIHtcbiAgICBjb25zdCB7b2xkRWRpdG9yU3RhdGUsIG5ld0VkaXRvclN0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge29mZnNldHM6IG9sZE9mZnNldHMsIGhpZ2hsaWdodGVkTGluZXM6IG9sZExpbmVzLCB0ZXh0OiBvbGRDb250ZW50c30gPSBvbGRFZGl0b3JTdGF0ZTtcbiAgICBjb25zdCB7b2Zmc2V0czogbmV3T2Zmc2V0cywgaGlnaGxpZ2h0ZWRMaW5lczogbmV3TGluZXMsIHRleHQ6IG5ld0NvbnRlbnRzfSA9IG5ld0VkaXRvclN0YXRlO1xuICAgIGNvbnN0IG5hdmlnYXRpb25QYW5lRWxlbWVudCA9IHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX25hdmlnYXRpb25QYW5lKTtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERpZmZOYXZpZ2F0aW9uQmFyXG4gICAgICAgIGVsZW1lbnRIZWlnaHQ9e25hdmlnYXRpb25QYW5lRWxlbWVudC5jbGllbnRIZWlnaHR9XG4gICAgICAgIGFkZGVkTGluZXM9e25ld0xpbmVzLmFkZGVkfVxuICAgICAgICBuZXdPZmZzZXRzPXtuZXdPZmZzZXRzfVxuICAgICAgICBuZXdDb250ZW50cz17bmV3Q29udGVudHN9XG4gICAgICAgIHJlbW92ZWRMaW5lcz17b2xkTGluZXMucmVtb3ZlZH1cbiAgICAgICAgb2xkT2Zmc2V0cz17b2xkT2Zmc2V0c31cbiAgICAgICAgb2xkQ29udGVudHM9e29sZENvbnRlbnRzfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbk5hdmlnYXRpb25DbGlja31cbiAgICAgIC8+LFxuICAgICAgbmF2aWdhdGlvblBhbmVFbGVtZW50LFxuICAgICk7XG4gIH1cblxuICBfb25OYXZpZ2F0aW9uQ2xpY2sobGluZU51bWJlcjogbnVtYmVyLCBpc0FkZGVkTGluZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGNvbnN0IHRleHRFZGl0b3JDb21wb25lbnQgPSBpc0FkZGVkTGluZSA/IHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA6IHRoaXMuX29sZEVkaXRvckNvbXBvbmVudDtcbiAgICBpbnZhcmlhbnQodGV4dEVkaXRvckNvbXBvbmVudCwgJ0RpZmYgVmlldyBOYXZpZ2F0aW9uIEVycm9yOiBOb24gdmFsaWQgdGV4dCBlZGl0b3IgY29tcG9uZW50Jyk7XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IHRleHRFZGl0b3JDb21wb25lbnQuZ2V0RWRpdG9yTW9kZWwoKTtcbiAgICB0ZXh0RWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW2xpbmVOdW1iZXIsIDBdKTtcbiAgfVxuXG4gIF9nZXRQYW5lRWxlbWVudChwYW5lOiBhdG9tJFBhbmUpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIGF0b20udmlld3MuZ2V0VmlldyhwYW5lKS5xdWVyeVNlbGVjdG9yKCcuaXRlbS12aWV3cycpO1xuICB9XG5cbiAgX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZShwYW5lOiBhdG9tJFBhbmUpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHBhbmUuZGVzdHJveSgpO1xuICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBsZXQgdG9vbGJhckNvbXBvbmVudCA9IG51bGw7XG4gICAgaWYgKHRoaXMuc3RhdGUudG9vbGJhclZpc2libGUpIHtcbiAgICAgIGNvbnN0IHt2aWV3TW9kZX0gPSB0aGlzLnByb3BzLmRpZmZNb2RlbC5nZXRTdGF0ZSgpO1xuICAgICAgY29uc3Qge29sZEVkaXRvclN0YXRlLCBuZXdFZGl0b3JTdGF0ZX0gPSB0aGlzLnN0YXRlO1xuICAgICAgdG9vbGJhckNvbXBvbmVudCA9IChcbiAgICAgICAgPERpZmZWaWV3VG9vbGJhclxuICAgICAgICAgIGZpbGVQYXRoPXt0aGlzLnN0YXRlLmZpbGVQYXRofVxuICAgICAgICAgIGRpZmZNb2RlPXt2aWV3TW9kZX1cbiAgICAgICAgICBuZXdSZXZpc2lvblRpdGxlPXtuZXdFZGl0b3JTdGF0ZS5yZXZpc2lvblRpdGxlfVxuICAgICAgICAgIG9sZFJldmlzaW9uVGl0bGU9e29sZEVkaXRvclN0YXRlLnJldmlzaW9uVGl0bGV9XG4gICAgICAgICAgb25Td2l0Y2hNb2RlPXt0aGlzLl9vbkNoYW5nZU1vZGV9XG4gICAgICAgICAgb25Td2l0Y2hUb0VkaXRvcj17dGhpcy5fb25Td2l0Y2hUb0VkaXRvcn1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LWNvbnRhaW5lclwiPlxuICAgICAgICB7dG9vbGJhckNvbXBvbmVudH1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy1jb21wb25lbnRcIiByZWY9XCJwYW5lQ29udGFpbmVyXCIgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfb25Td2l0Y2hUb0VkaXRvcigpOiB2b2lkIHtcbiAgICBjb25zdCBkaWZmVmlld05vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBpbnZhcmlhbnQoZGlmZlZpZXdOb2RlLCAnRGlmZiBWaWV3IERPTSBuZWVkcyB0byBiZSBhdHRhY2hlZCB0byBzd2l0Y2ggdG8gZWRpdG9yIG1vZGUnKTtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGRpZmZWaWV3Tm9kZSwgJ251Y2xpZGUtZGlmZi12aWV3OnN3aXRjaC10by1lZGl0b3InKTtcbiAgfVxuXG4gIF9vbkNoYW5nZU5ld1RleHRFZGl0b3IobmV3Q29udGVudHM6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldE5ld0NvbnRlbnRzKG5ld0NvbnRlbnRzKTtcbiAgfVxuXG4gIF9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24ocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldFJldmlzaW9uKHJldmlzaW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBsaW5lIGRpZmYgc3RhdGUgb24gYWN0aXZlIGZpbGUgc3RhdGUgY2hhbmdlLlxuICAgKi9cbiAgX3VwZGF0ZUxpbmVEaWZmU3RhdGUoZmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpOiB2b2lkIHtcbiAgICBjb25zdCB7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZENvbnRlbnRzLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzLFxuICAgICAgaW5saW5lQ29tcG9uZW50cyxcbiAgICAgIGZyb21SZXZpc2lvblRpdGxlLFxuICAgICAgdG9SZXZpc2lvblRpdGxlLFxuICAgIH0gPSBmaWxlU3RhdGU7XG5cbiAgICBjb25zdCB7YWRkZWRMaW5lcywgcmVtb3ZlZExpbmVzLCBvbGRMaW5lT2Zmc2V0cywgbmV3TGluZU9mZnNldHN9ID1cbiAgICAgIGNvbXB1dGVEaWZmKG9sZENvbnRlbnRzLCBuZXdDb250ZW50cyk7XG5cbiAgICAvLyBUT0RPKG1vc3QpOiBTeW5jIHRoZSB1c2VkIGNvbW1lbnQgdmVydGljYWwgc3BhY2Ugb24gYm90aCBlZGl0b3JzLlxuICAgIGNvbnN0IG9sZEVkaXRvclN0YXRlID0ge1xuICAgICAgcmV2aXNpb25UaXRsZTogZnJvbVJldmlzaW9uVGl0bGUsXG4gICAgICB0ZXh0OiBvbGRDb250ZW50cyxcbiAgICAgIG9mZnNldHM6IG9sZExpbmVPZmZzZXRzLFxuICAgICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgICBhZGRlZDogW10sXG4gICAgICAgIHJlbW92ZWQ6IHJlbW92ZWRMaW5lcyxcbiAgICAgIH0sXG4gICAgICBpbmxpbmVFbGVtZW50czogaW5saW5lQ29tcG9uZW50cyB8fCBbXSxcbiAgICB9O1xuICAgIGNvbnN0IG5ld0VkaXRvclN0YXRlID0ge1xuICAgICAgcmV2aXNpb25UaXRsZTogdG9SZXZpc2lvblRpdGxlLFxuICAgICAgdGV4dDogbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzLFxuICAgICAgb2Zmc2V0czogbmV3TGluZU9mZnNldHMsXG4gICAgICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgICAgIGFkZGVkOiBhZGRlZExpbmVzLFxuICAgICAgICByZW1vdmVkOiBbXSxcbiAgICAgIH0sXG4gICAgICBpbmxpbmVFbGVtZW50czogW10sXG4gICAgfTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgb2xkRWRpdG9yU3RhdGUsXG4gICAgICBuZXdFZGl0b3JTdGF0ZSxcbiAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpZmZWaWV3Q29tcG9uZW50O1xuIl19