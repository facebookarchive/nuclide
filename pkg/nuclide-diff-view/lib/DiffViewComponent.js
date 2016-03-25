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

      var _diffModel$getActiveFileState = diffModel.getActiveFileState();

      var filePath = _diffModel$getActiveFileState.filePath;

      this._treeComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-view-tree padded' },
        _reactForAtom.React.createElement(_DiffViewTree2['default'], {
          activeFilePath: filePath,
          fileChanges: selectedFileChanges,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWdCc0IsUUFBUTs7OztvQkFDNEIsTUFBTTs7NEJBSXpELGdCQUFnQjs7a0NBQ1Esc0JBQXNCOzs7OzRCQUM1QixnQkFBZ0I7Ozs7MEJBQ2xCLGNBQWM7Ozs7Z0NBQ1Isb0JBQW9COzs7OytCQUNyQixtQkFBbUI7Ozs7aUNBQ2pCLHFCQUFxQjs7Ozs4QkFDeEIsa0JBQWtCOzs7OytCQUNqQixtQkFBbUI7Ozs7eUJBQ0EsY0FBYzs7a0NBQzNCLDRCQUE0Qjs7eUJBS3ZELGFBQWE7O29DQUNNLDhCQUE4Qjs7OztBQXlCeEQsU0FBUyxrQkFBa0IsR0FBZ0I7QUFDekMsU0FBTztBQUNMLGlCQUFhLEVBQUUsRUFBRTtBQUNqQixRQUFJLEVBQUUsRUFBRTtBQUNSLFdBQU8sRUFBRSxJQUFJLEdBQUcsRUFBRTtBQUNsQixvQkFBZ0IsRUFBRTtBQUNoQixXQUFLLEVBQUUsRUFBRTtBQUNULGFBQU8sRUFBRSxFQUFFO0tBQ1o7QUFDRCxrQkFBYyxFQUFFLEVBQUU7R0FDbkIsQ0FBQztDQUNIOztBQUVELElBQU0sY0FBYyxHQUFHLFNBQWpCLGNBQWMsR0FBUyxFQUFFLENBQUM7O0lBRTFCLGlCQUFpQjtZQUFqQixpQkFBaUI7O0FBcUJWLFdBckJQLGlCQUFpQixDQXFCVCxLQUFZLEVBQUU7MEJBckJ0QixpQkFBaUI7O0FBc0JuQiwrQkF0QkUsaUJBQWlCLDZDQXNCYixLQUFLLEVBQUU7QUFDYixRQUFNLGNBQWMsR0FBSyxrQ0FBYyxHQUFHLG9DQUF5QixBQUFnQixDQUFDO0FBQ3BGLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxVQUFJLEVBQUUsb0JBQVMsV0FBVztBQUMxQixjQUFRLEVBQUUsRUFBRTtBQUNaLG9CQUFjLEVBQWQsY0FBYztBQUNkLG9CQUFjLEVBQUUsa0JBQWtCLEVBQUU7QUFDcEMsb0JBQWMsRUFBRSxrQkFBa0IsRUFBRTtLQUNy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RSxZQUFZO1NBQ3RCO0FBQ0Qsc0JBQWMsRUFBRSxnQkFBZ0IsSUFBSSxFQUFFO09BQ3ZDLENBQUM7QUFDRixVQUFNLGNBQWMsR0FBRztBQUNyQixxQkFBYSxFQUFFLGVBQWU7QUFDOUIsWUFBSSxFQUFFLFdBQVc7QUFDakIscUJBQWEsRUFBYixhQUFhO0FBQ2IsZUFBTyxFQUFFLGNBQWM7QUFDdkIsd0JBQWdCLEVBQUU7QUFDaEIsZUFBSyxFQUFFLFVBQVU7QUFDakIsaUJBQU8sRUFBRSxFQUFFO1NBQ1o7QUFDRCxzQkFBYyxFQUFFLEVBQUU7T0FDbkIsQ0FBQztBQUNGLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixnQkFBUSxFQUFSLFFBQVE7QUFDUixzQkFBYyxFQUFkLGNBQWM7QUFDZCxzQkFBYyxFQUFkLGNBQWM7T0FDZixDQUFDLENBQUM7S0FDSjs7O1NBaGJHLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVM7O0FBbWIvQyxNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkRpZmZWaWV3Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2VTdGF0ZSwgSW5saW5lQ29tcG9uZW50LCBPZmZzZXRNYXAsIERpZmZNb2RlVHlwZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUsIFRleHRCdWZmZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgRGlmZlZpZXdFZGl0b3JQYW5lIGZyb20gJy4vRGlmZlZpZXdFZGl0b3JQYW5lJztcbmltcG9ydCBEaWZmVmlld1RyZWUgZnJvbSAnLi9EaWZmVmlld1RyZWUnO1xuaW1wb3J0IFN5bmNTY3JvbGwgZnJvbSAnLi9TeW5jU2Nyb2xsJztcbmltcG9ydCBEaWZmVGltZWxpbmVWaWV3IGZyb20gJy4vRGlmZlRpbWVsaW5lVmlldyc7XG5pbXBvcnQgRGlmZlZpZXdUb29sYmFyIGZyb20gJy4vRGlmZlZpZXdUb29sYmFyJztcbmltcG9ydCBEaWZmTmF2aWdhdGlvbkJhciBmcm9tICcuL0RpZmZOYXZpZ2F0aW9uQmFyJztcbmltcG9ydCBEaWZmQ29tbWl0VmlldyBmcm9tICcuL0RpZmZDb21taXRWaWV3JztcbmltcG9ydCBEaWZmUHVibGlzaFZpZXcgZnJvbSAnLi9EaWZmUHVibGlzaFZpZXcnO1xuaW1wb3J0IHtjb21wdXRlRGlmZiwgZ2V0T2Zmc2V0TGluZU51bWJlcn0gZnJvbSAnLi9kaWZmLXV0aWxzJztcbmltcG9ydCB7Y3JlYXRlUGFuZUNvbnRhaW5lcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtidWZmZXJGb3JVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7XG4gIERpZmZNb2RlLFxuICBUT09MQkFSX1ZJU0lCTEVfU0VUVElORyxcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGRpZmZNb2RlbDogRGlmZlZpZXdNb2RlbDtcbn07XG5cbnR5cGUgRWRpdG9yU3RhdGUgPSB7XG4gIHJldmlzaW9uVGl0bGU6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBzYXZlZENvbnRlbnRzPzogc3RyaW5nO1xuICBvZmZzZXRzOiBPZmZzZXRNYXA7XG4gIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICBhZGRlZDogQXJyYXk8bnVtYmVyPjtcbiAgICByZW1vdmVkOiBBcnJheTxudW1iZXI+O1xuICB9O1xuICBpbmxpbmVFbGVtZW50czogQXJyYXk8SW5saW5lQ29tcG9uZW50Pjtcbn1cblxudHlwZSBTdGF0ZSA9IHtcbiAgZmlsZVBhdGg6IE51Y2xpZGVVcmk7XG4gIG9sZEVkaXRvclN0YXRlOiBFZGl0b3JTdGF0ZTtcbiAgbmV3RWRpdG9yU3RhdGU6IEVkaXRvclN0YXRlO1xuICB0b29sYmFyVmlzaWJsZTogYm9vbGVhbjtcbn07XG5cbmZ1bmN0aW9uIGluaXRpYWxFZGl0b3JTdGF0ZSgpOiBFZGl0b3JTdGF0ZSB7XG4gIHJldHVybiB7XG4gICAgcmV2aXNpb25UaXRsZTogJycsXG4gICAgdGV4dDogJycsXG4gICAgb2Zmc2V0czogbmV3IE1hcCgpLFxuICAgIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICAgIGFkZGVkOiBbXSxcbiAgICAgIHJlbW92ZWQ6IFtdLFxuICAgIH0sXG4gICAgaW5saW5lRWxlbWVudHM6IFtdLFxuICB9O1xufVxuXG5jb25zdCBFTVBUWV9GVU5DVElPTiA9ICgpID0+IHt9O1xuXG5jbGFzcyBEaWZmVmlld0NvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc3luY1Njcm9sbDogU3luY1Njcm9sbDtcbiAgX29sZEVkaXRvclBhbmU6IGF0b20kUGFuZTtcbiAgX29sZEVkaXRvckNvbXBvbmVudDogRGlmZlZpZXdFZGl0b3JQYW5lO1xuICBfcGFuZUNvbnRhaW5lcjogT2JqZWN0O1xuICBfbmV3RWRpdG9yUGFuZTogYXRvbSRQYW5lO1xuICBfbmV3RWRpdG9yQ29tcG9uZW50OiBEaWZmVmlld0VkaXRvclBhbmU7XG4gIF9ib3R0b21SaWdodFBhbmU6IGF0b20kUGFuZTtcbiAgX3RpbWVsaW5lQ29tcG9uZW50OiA/RGlmZlRpbWVsaW5lVmlldztcbiAgX3RyZWVQYW5lOiBhdG9tJFBhbmU7XG4gIF90cmVlQ29tcG9uZW50OiBSZWFjdENvbXBvbmVudDtcbiAgX25hdmlnYXRpb25QYW5lOiBhdG9tJFBhbmU7XG4gIF9uYXZpZ2F0aW9uQ29tcG9uZW50OiBEaWZmTmF2aWdhdGlvbkJhcjtcbiAgX2NvbW1pdENvbXBvbmVudDogP0RpZmZDb21taXRWaWV3O1xuICBfcHVibGlzaENvbXBvbmVudDogP0RpZmZQdWJsaXNoVmlldztcbiAgX3JlYWRvbmx5QnVmZmVyOiBhdG9tJFRleHRCdWZmZXI7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIGNvbnN0IHRvb2xiYXJWaXNpYmxlID0gKChmZWF0dXJlQ29uZmlnLmdldChUT09MQkFSX1ZJU0lCTEVfU0VUVElORyk6IGFueSk6IGJvb2xlYW4pO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBtb2RlOiBEaWZmTW9kZS5CUk9XU0VfTU9ERSxcbiAgICAgIGZpbGVQYXRoOiAnJyxcbiAgICAgIHRvb2xiYXJWaXNpYmxlLFxuICAgICAgb2xkRWRpdG9yU3RhdGU6IGluaXRpYWxFZGl0b3JTdGF0ZSgpLFxuICAgICAgbmV3RWRpdG9yU3RhdGU6IGluaXRpYWxFZGl0b3JTdGF0ZSgpLFxuICAgIH07XG4gICAgKHRoaXM6IGFueSkuX29uTW9kZWxTdGF0ZUNoYW5nZSA9IHRoaXMuX29uTW9kZWxTdGF0ZUNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVOZXdPZmZzZXRzID0gdGhpcy5faGFuZGxlTmV3T2Zmc2V0cy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl91cGRhdGVMaW5lRGlmZlN0YXRlID0gdGhpcy5fdXBkYXRlTGluZURpZmZTdGF0ZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNoYW5nZU5ld1RleHRFZGl0b3IgPSB0aGlzLl9vbkNoYW5nZU5ld1RleHRFZGl0b3IuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25UaW1lbGluZUNoYW5nZVJldmlzaW9uID0gdGhpcy5fb25UaW1lbGluZUNoYW5nZVJldmlzaW9uLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uTmF2aWdhdGlvbkNsaWNrID0gdGhpcy5fb25OYXZpZ2F0aW9uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudCA9IHRoaXMuX29uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25DaGFuZ2VNb2RlID0gdGhpcy5fb25DaGFuZ2VNb2RlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uU3dpdGNoVG9FZGl0b3IgPSB0aGlzLl9vblN3aXRjaFRvRWRpdG9yLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fcmVhZG9ubHlCdWZmZXIgPSBuZXcgVGV4dEJ1ZmZlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGZlYXR1cmVDb25maWcub2JzZXJ2ZShUT09MQkFSX1ZJU0lCTEVfU0VUVElORywgdG9vbGJhclZpc2libGUgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7dG9vbGJhclZpc2libGV9KTtcbiAgICB9KSk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCB7ZGlmZk1vZGVsfSA9IHRoaXMucHJvcHM7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZGlmZk1vZGVsLm9uQWN0aXZlRmlsZVVwZGF0ZXModGhpcy5fdXBkYXRlTGluZURpZmZTdGF0ZSkpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGRpZmZNb2RlbC5vbkRpZFVwZGF0ZVN0YXRlKHRoaXMuX29uTW9kZWxTdGF0ZUNoYW5nZSkpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oYWN0aXZlSXRlbSA9PiB7XG4gICAgICBpZiAoYWN0aXZlSXRlbSAhPSBudWxsICYmIChhY3RpdmVJdGVtOiBhbnkpLnRhZ05hbWUgPT09ICdOVUNMSURFLURJRkYtVklFVycpIHtcbiAgICAgICAgLy8gUmUtcmVuZGVyIG9uIGFjdGl2YXRpb24uXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe30pO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIHRoaXMuX3BhbmVDb250YWluZXIgPSBjcmVhdGVQYW5lQ29udGFpbmVyKCk7XG4gICAgLy8gVGhlIGNoYW5nZWQgZmlsZXMgc3RhdHVzIHRyZWUgdGFrZXMgMS81IG9mIHRoZSB3aWR0aCBhbmQgbGl2ZXMgb24gdGhlIHJpZ2h0IG1vc3QsXG4gICAgLy8gd2hpbGUgYmVpbmcgdmVydGljYWxseSBzcGx0IHdpdGggdGhlIHJldmlzaW9uIHRpbWVsaW5lIHN0YWNrIHBhbmUuXG4gICAgY29uc3QgdG9wUGFuZSA9IHRoaXMuX25ld0VkaXRvclBhbmUgPSB0aGlzLl9wYW5lQ29udGFpbmVyLmdldEFjdGl2ZVBhbmUoKTtcbiAgICB0aGlzLl9ib3R0b21SaWdodFBhbmUgPSB0b3BQYW5lLnNwbGl0RG93bih7XG4gICAgICBmbGV4U2NhbGU6IDAuMyxcbiAgICB9KTtcbiAgICB0aGlzLl90cmVlUGFuZSA9IHRoaXMuX2JvdHRvbVJpZ2h0UGFuZS5zcGxpdExlZnQoe1xuICAgICAgZmxleFNjYWxlOiAwLjM1LFxuICAgIH0pO1xuICAgIHRoaXMuX25hdmlnYXRpb25QYW5lID0gdG9wUGFuZS5zcGxpdFJpZ2h0KHtcbiAgICAgIGZsZXhTY2FsZTogMC4wNDUsXG4gICAgfSk7XG4gICAgdGhpcy5fb2xkRWRpdG9yUGFuZSA9IHRvcFBhbmUuc3BsaXRMZWZ0KHtcbiAgICAgIGZsZXhTY2FsZTogMSxcbiAgICB9KTtcblxuICAgIHRoaXMuX3JlbmRlckRpZmZWaWV3KCk7XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl9vbGRFZGl0b3JQYW5lLCB0cnVlKSxcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl9uZXdFZGl0b3JQYW5lLCB0cnVlKSxcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl9uYXZpZ2F0aW9uUGFuZSwgdHJ1ZSksXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fdHJlZVBhbmUsIHRydWUpLFxuICAgICAgdGhpcy5fZGVzdHJveVBhbmVEaXNwb3NhYmxlKHRoaXMuX2JvdHRvbVJpZ2h0UGFuZSksXG4gICAgKTtcblxuICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1sncGFuZUNvbnRhaW5lciddKS5hcHBlbmRDaGlsZChcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9wYW5lQ29udGFpbmVyKSxcbiAgICApO1xuXG4gICAgdGhpcy5fdXBkYXRlTGluZURpZmZTdGF0ZShkaWZmTW9kZWwuZ2V0QWN0aXZlRmlsZVN0YXRlKCkpO1xuICB9XG5cbiAgX29uTW9kZWxTdGF0ZUNoYW5nZSgpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHt9KTtcbiAgfVxuXG4gIF9zZXR1cFN5bmNTY3JvbGwoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX29sZEVkaXRvckNvbXBvbmVudCA9PSBudWxsIHx8IHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG9sZFRleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50LmdldEVkaXRvckRvbUVsZW1lbnQoKTtcbiAgICBjb25zdCBuZXdUZXh0RWRpdG9yRWxlbWVudCA9IHRoaXMuX25ld0VkaXRvckNvbXBvbmVudC5nZXRFZGl0b3JEb21FbGVtZW50KCk7XG4gICAgY29uc3Qgc3luY1Njcm9sbCA9IHRoaXMuX3N5bmNTY3JvbGw7XG4gICAgaWYgKHN5bmNTY3JvbGwgIT0gbnVsbCkge1xuICAgICAgc3luY1Njcm9sbC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnJlbW92ZShzeW5jU2Nyb2xsKTtcbiAgICB9XG4gICAgdGhpcy5fc3luY1Njcm9sbCA9IG5ldyBTeW5jU2Nyb2xsKFxuICAgICAgb2xkVGV4dEVkaXRvckVsZW1lbnQsXG4gICAgICBuZXdUZXh0RWRpdG9yRWxlbWVudCxcbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRoaXMuX3N5bmNTY3JvbGwpO1xuICB9XG5cbiAgX3Njcm9sbFRvRmlyc3RIaWdobGlnaHRlZExpbmUoKTogdm9pZCB7XG4gICAgLy8gU2NoZWR1bGUgc2Nyb2xsIHRvIGZpcnN0IGxpbmUgYWZ0ZXIgYWxsIGxpbmVzIGhhdmUgYmVlbiByZW5kZXJlZC5cbiAgICBjb25zdCB7b2xkRWRpdG9yU3RhdGUsIG5ld0VkaXRvclN0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgcmVtb3ZlZExpbmVzID0gb2xkRWRpdG9yU3RhdGUuaGlnaGxpZ2h0ZWRMaW5lcy5yZW1vdmVkO1xuICAgIGNvbnN0IGFkZGVkTGluZXMgPSBuZXdFZGl0b3JTdGF0ZS5oaWdobGlnaHRlZExpbmVzLmFkZGVkO1xuICAgIGlmIChhZGRlZExpbmVzLmxlbmd0aCA9PT0gMCAmJiByZW1vdmVkTGluZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGZpcnN0UmVtb3ZlZExpbmUgPSBnZXRPZmZzZXRMaW5lTnVtYmVyKFxuICAgICAgcmVtb3ZlZExpbmVzWzBdIHx8IDAsXG4gICAgICBvbGRFZGl0b3JTdGF0ZS5vZmZzZXRzLFxuICAgICk7XG4gICAgY29uc3QgZmlyc3RBZGRlZExpbmUgPSBnZXRPZmZzZXRMaW5lTnVtYmVyKFxuICAgICAgYWRkZWRMaW5lc1swXSB8fCAwLFxuICAgICAgbmV3RWRpdG9yU3RhdGUub2Zmc2V0cyxcbiAgICApO1xuICAgIHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGFkZGVkTGluZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgIChyZW1vdmVkTGluZXMubGVuZ3RoID4gMCAmJiBmaXJzdFJlbW92ZWRMaW5lIDwgZmlyc3RBZGRlZExpbmUpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50LnNjcm9sbFRvU2NyZWVuTGluZShmaXJzdFJlbW92ZWRMaW5lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX25ld0VkaXRvckNvbXBvbmVudC5zY3JvbGxUb1NjcmVlbkxpbmUoZmlyc3RBZGRlZExpbmUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX29uQ2hhbmdlTW9kZShtb2RlOiBEaWZmTW9kZVR5cGUpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5zZXRWaWV3TW9kZShtb2RlKTtcbiAgfVxuXG4gIF9yZW5kZXJEaWZmVmlldygpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW5kZXJUcmVlKCk7XG4gICAgdGhpcy5fcmVuZGVyRWRpdG9ycygpO1xuICAgIHRoaXMuX3JlbmRlck5hdmlnYXRpb24oKTtcbiAgICB0aGlzLl9yZW5kZXJCb3R0b21SaWdodFBhbmUoKTtcbiAgfVxuXG4gIF9yZW5kZXJCb3R0b21SaWdodFBhbmUoKTogdm9pZCB7XG4gICAgY29uc3Qge3ZpZXdNb2RlfSA9IHRoaXMucHJvcHMuZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgc3dpdGNoICh2aWV3TW9kZSkge1xuICAgICAgY2FzZSBEaWZmTW9kZS5CUk9XU0VfTU9ERTpcbiAgICAgICAgdGhpcy5fcmVuZGVyVGltZWxpbmVWaWV3KCk7XG4gICAgICAgIHRoaXMuX2NvbW1pdENvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuX3B1Ymxpc2hDb21wb25lbnQgPSBudWxsO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRGlmZk1vZGUuQ09NTUlUX01PREU6XG4gICAgICAgIHRoaXMuX3JlbmRlckNvbW1pdFZpZXcoKTtcbiAgICAgICAgdGhpcy5fdGltZWxpbmVDb21wb25lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLl9wdWJsaXNoQ29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERpZmZNb2RlLlBVQkxJU0hfTU9ERTpcbiAgICAgICAgdGhpcy5fcmVuZGVyUHVibGlzaFZpZXcoKTtcbiAgICAgICAgdGhpcy5fY29tbWl0Q29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fdGltZWxpbmVDb21wb25lbnQgPSBudWxsO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBEaWZmIE1vZGU6ICR7dmlld01vZGV9YCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogUHJvcHMsIHByZXZTdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW5kZXJEaWZmVmlldygpO1xuICAgIGlmICh0aGlzLnN0YXRlLmZpbGVQYXRoICE9PSBwcmV2U3RhdGUuZmlsZVBhdGgpIHtcbiAgICAgIHRoaXMuX3Njcm9sbFRvRmlyc3RIaWdobGlnaHRlZExpbmUoKTtcbiAgICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLmVtaXRBY3RpdmVCdWZmZXJDaGFuZ2VNb2RpZmllZCgpO1xuICAgIH1cbiAgfVxuXG4gIF9yZW5kZXJDb21taXRWaWV3KCk6IHZvaWQge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbW1pdE1lc3NhZ2UsXG4gICAgICBjb21taXRNb2RlLFxuICAgICAgY29tbWl0TW9kZVN0YXRlLFxuICAgIH0gPSB0aGlzLnByb3BzLmRpZmZNb2RlbC5nZXRTdGF0ZSgpO1xuICAgIHRoaXMuX2NvbW1pdENvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxEaWZmQ29tbWl0Vmlld1xuICAgICAgICBjb21taXRNZXNzYWdlPXtjb21taXRNZXNzYWdlfVxuICAgICAgICBjb21taXRNb2RlPXtjb21taXRNb2RlfVxuICAgICAgICBjb21taXRNb2RlU3RhdGU9e2NvbW1pdE1vZGVTdGF0ZX1cbiAgICAgICAgLy8gYGRpZmZNb2RlbGAgaXMgYWN0aW5nIGFzIHRoZSBhY3Rpb24gY3JlYXRvciBmb3IgY29tbWl0IHZpZXcgYW5kIG5lZWRzIHRvIGJlIHBhc3NlZCBzb1xuICAgICAgICAvLyBtZXRob2RzIGNhbiBiZSBjYWxsZWQgb24gaXQuXG4gICAgICAgIGRpZmZNb2RlbD17dGhpcy5wcm9wcy5kaWZmTW9kZWx9XG4gICAgICAvPixcbiAgICAgIHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX2JvdHRvbVJpZ2h0UGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJQdWJsaXNoVmlldygpOiB2b2lkIHtcbiAgICBjb25zdCB7ZGlmZk1vZGVsfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgcHVibGlzaE1vZGUsXG4gICAgICBwdWJsaXNoTW9kZVN0YXRlLFxuICAgICAgcHVibGlzaE1lc3NhZ2UsXG4gICAgICBoZWFkUmV2aXNpb24sXG4gICAgfSA9IGRpZmZNb2RlbC5nZXRTdGF0ZSgpO1xuICAgIHRoaXMuX3B1Ymxpc2hDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RGlmZlB1Ymxpc2hWaWV3XG4gICAgICAgIHB1Ymxpc2hNb2RlU3RhdGU9e3B1Ymxpc2hNb2RlU3RhdGV9XG4gICAgICAgIG1lc3NhZ2U9e3B1Ymxpc2hNZXNzYWdlfVxuICAgICAgICBwdWJsaXNoTW9kZT17cHVibGlzaE1vZGV9XG4gICAgICAgIGhlYWRSZXZpc2lvbj17aGVhZFJldmlzaW9ufVxuICAgICAgICBkaWZmTW9kZWw9e2RpZmZNb2RlbH1cbiAgICAgIC8+LFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fYm90dG9tUmlnaHRQYW5lKSxcbiAgICApO1xuICB9XG5cbiAgX3JlbmRlclRyZWUoKTogdm9pZCB7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtzZWxlY3RlZEZpbGVDaGFuZ2VzfSA9IGRpZmZNb2RlbC5nZXRTdGF0ZSgpO1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSBkaWZmTW9kZWwuZ2V0QWN0aXZlRmlsZVN0YXRlKCk7XG4gICAgdGhpcy5fdHJlZUNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy10cmVlIHBhZGRlZFwiPlxuICAgICAgICAgIDxEaWZmVmlld1RyZWVcbiAgICAgICAgICAgIGFjdGl2ZUZpbGVQYXRoPXtmaWxlUGF0aH1cbiAgICAgICAgICAgIGZpbGVDaGFuZ2VzPXtzZWxlY3RlZEZpbGVDaGFuZ2VzfVxuICAgICAgICAgICAgZGlmZk1vZGVsPXtkaWZmTW9kZWx9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApLFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fdHJlZVBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyRWRpdG9ycygpOiB2b2lkIHtcbiAgICBjb25zdCB7ZmlsZVBhdGgsIG9sZEVkaXRvclN0YXRlOiBvbGRTdGF0ZSwgbmV3RWRpdG9yU3RhdGU6IG5ld1N0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgICA8RGlmZlZpZXdFZGl0b3JQYW5lXG4gICAgICAgICAgaGVhZGVyVGl0bGU9e29sZFN0YXRlLnJldmlzaW9uVGl0bGV9XG4gICAgICAgICAgdGV4dEJ1ZmZlcj17dGhpcy5fcmVhZG9ubHlCdWZmZXJ9XG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e29sZFN0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17b2xkU3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBzYXZlZENvbnRlbnRzPXtvbGRTdGF0ZS50ZXh0fVxuICAgICAgICAgIGluaXRpYWxUZXh0Q29udGVudD17b2xkU3RhdGUudGV4dH1cbiAgICAgICAgICBpbmxpbmVFbGVtZW50cz17b2xkU3RhdGUuaW5saW5lRWxlbWVudHN9XG4gICAgICAgICAgaGFuZGxlTmV3T2Zmc2V0cz17dGhpcy5faGFuZGxlTmV3T2Zmc2V0c31cbiAgICAgICAgICByZWFkT25seT17dHJ1ZX1cbiAgICAgICAgICBvbkNoYW5nZT17RU1QVFlfRlVOQ1RJT059XG4gICAgICAgICAgb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudD17RU1QVFlfRlVOQ1RJT059XG4gICAgICAgIC8+LFxuICAgICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9vbGRFZGl0b3JQYW5lKSxcbiAgICApO1xuICAgIGNvbnN0IHRleHRCdWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgICAgPERpZmZWaWV3RWRpdG9yUGFuZVxuICAgICAgICAgIGhlYWRlclRpdGxlPXtuZXdTdGF0ZS5yZXZpc2lvblRpdGxlfVxuICAgICAgICAgIHRleHRCdWZmZXI9e3RleHRCdWZmZXJ9XG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e25ld1N0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17bmV3U3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBpbml0aWFsVGV4dENvbnRlbnQ9e25ld1N0YXRlLnRleHR9XG4gICAgICAgICAgc2F2ZWRDb250ZW50cz17bmV3U3RhdGUuc2F2ZWRDb250ZW50c31cbiAgICAgICAgICBpbmxpbmVFbGVtZW50cz17bmV3U3RhdGUuaW5saW5lRWxlbWVudHN9XG4gICAgICAgICAgaGFuZGxlTmV3T2Zmc2V0cz17dGhpcy5faGFuZGxlTmV3T2Zmc2V0c31cbiAgICAgICAgICBvbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50PXt0aGlzLl9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50fVxuICAgICAgICAgIHJlYWRPbmx5PXtmYWxzZX1cbiAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2VOZXdUZXh0RWRpdG9yfVxuICAgICAgICAvPixcbiAgICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fbmV3RWRpdG9yUGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3NldHVwU3luY1Njcm9sbCgpO1xuICB9XG5cbiAgX3JlbmRlclRpbWVsaW5lVmlldygpOiB2b2lkIHtcbiAgICB0aGlzLl90aW1lbGluZUNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxEaWZmVGltZWxpbmVWaWV3XG4gICAgICAgIGRpZmZNb2RlbD17dGhpcy5wcm9wcy5kaWZmTW9kZWx9XG4gICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlPXt0aGlzLl9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb259XG4gICAgICAvPixcbiAgICAgIHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX2JvdHRvbVJpZ2h0UGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJOYXZpZ2F0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IHtvbGRFZGl0b3JTdGF0ZSwgbmV3RWRpdG9yU3RhdGV9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7b2Zmc2V0czogb2xkT2Zmc2V0cywgaGlnaGxpZ2h0ZWRMaW5lczogb2xkTGluZXMsIHRleHQ6IG9sZENvbnRlbnRzfSA9IG9sZEVkaXRvclN0YXRlO1xuICAgIGNvbnN0IHtvZmZzZXRzOiBuZXdPZmZzZXRzLCBoaWdobGlnaHRlZExpbmVzOiBuZXdMaW5lcywgdGV4dDogbmV3Q29udGVudHN9ID0gbmV3RWRpdG9yU3RhdGU7XG4gICAgY29uc3QgbmF2aWdhdGlvblBhbmVFbGVtZW50ID0gdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fbmF2aWdhdGlvblBhbmUpO1xuICAgIHRoaXMuX25hdmlnYXRpb25Db21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RGlmZk5hdmlnYXRpb25CYXJcbiAgICAgICAgZWxlbWVudEhlaWdodD17bmF2aWdhdGlvblBhbmVFbGVtZW50LmNsaWVudEhlaWdodH1cbiAgICAgICAgYWRkZWRMaW5lcz17bmV3TGluZXMuYWRkZWR9XG4gICAgICAgIG5ld09mZnNldHM9e25ld09mZnNldHN9XG4gICAgICAgIG5ld0NvbnRlbnRzPXtuZXdDb250ZW50c31cbiAgICAgICAgcmVtb3ZlZExpbmVzPXtvbGRMaW5lcy5yZW1vdmVkfVxuICAgICAgICBvbGRPZmZzZXRzPXtvbGRPZmZzZXRzfVxuICAgICAgICBvbGRDb250ZW50cz17b2xkQ29udGVudHN9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uTmF2aWdhdGlvbkNsaWNrfVxuICAgICAgLz4sXG4gICAgICBuYXZpZ2F0aW9uUGFuZUVsZW1lbnQsXG4gICAgKTtcbiAgfVxuXG4gIF9vbk5hdmlnYXRpb25DbGljayhsaW5lTnVtYmVyOiBudW1iZXIsIGlzQWRkZWRMaW5lOiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgdGV4dEVkaXRvckNvbXBvbmVudCA9IGlzQWRkZWRMaW5lID8gdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50IDogdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50O1xuICAgIGludmFyaWFudCh0ZXh0RWRpdG9yQ29tcG9uZW50LCAnRGlmZiBWaWV3IE5hdmlnYXRpb24gRXJyb3I6IE5vbiB2YWxpZCB0ZXh0IGVkaXRvciBjb21wb25lbnQnKTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGV4dEVkaXRvckNvbXBvbmVudC5nZXRFZGl0b3JNb2RlbCgpO1xuICAgIHRleHRFZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbbGluZU51bWJlciwgMF0pO1xuICB9XG5cbiAgX2dldFBhbmVFbGVtZW50KHBhbmU6IGF0b20kUGFuZSk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gYXRvbS52aWV3cy5nZXRWaWV3KHBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJyk7XG4gIH1cblxuICBfZGVzdHJveVBhbmVEaXNwb3NhYmxlKHBhbmU6IGF0b20kUGFuZSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgcGFuZS5kZXN0cm95KCk7XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGxldCB0b29sYmFyQ29tcG9uZW50ID0gbnVsbDtcbiAgICBpZiAodGhpcy5zdGF0ZS50b29sYmFyVmlzaWJsZSkge1xuICAgICAgY29uc3Qge3ZpZXdNb2RlfSA9IHRoaXMucHJvcHMuZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgICBjb25zdCB7b2xkRWRpdG9yU3RhdGUsIG5ld0VkaXRvclN0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgICB0b29sYmFyQ29tcG9uZW50ID0gKFxuICAgICAgICA8RGlmZlZpZXdUb29sYmFyXG4gICAgICAgICAgZmlsZVBhdGg9e3RoaXMuc3RhdGUuZmlsZVBhdGh9XG4gICAgICAgICAgZGlmZk1vZGU9e3ZpZXdNb2RlfVxuICAgICAgICAgIG5ld1JldmlzaW9uVGl0bGU9e25ld0VkaXRvclN0YXRlLnJldmlzaW9uVGl0bGV9XG4gICAgICAgICAgb2xkUmV2aXNpb25UaXRsZT17b2xkRWRpdG9yU3RhdGUucmV2aXNpb25UaXRsZX1cbiAgICAgICAgICBvblN3aXRjaE1vZGU9e3RoaXMuX29uQ2hhbmdlTW9kZX1cbiAgICAgICAgICBvblN3aXRjaFRvRWRpdG9yPXt0aGlzLl9vblN3aXRjaFRvRWRpdG9yfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctY29udGFpbmVyXCI+XG4gICAgICAgIHt0b29sYmFyQ29tcG9uZW50fVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LWNvbXBvbmVudFwiIHJlZj1cInBhbmVDb250YWluZXJcIiAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vblN3aXRjaFRvRWRpdG9yKCk6IHZvaWQge1xuICAgIGNvbnN0IGRpZmZWaWV3Tm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGludmFyaWFudChkaWZmVmlld05vZGUsICdEaWZmIFZpZXcgRE9NIG5lZWRzIHRvIGJlIGF0dGFjaGVkIHRvIHN3aXRjaCB0byBlZGl0b3IgbW9kZScpO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZGlmZlZpZXdOb2RlLCAnbnVjbGlkZS1kaWZmLXZpZXc6c3dpdGNoLXRvLWVkaXRvcicpO1xuICB9XG5cbiAgX2hhbmRsZU5ld09mZnNldHMob2Zmc2V0c0Zyb21Db21wb25lbnRzOiBNYXApOiB2b2lkIHtcbiAgICBjb25zdCBvbGRMaW5lT2Zmc2V0cyA9IG5ldyBNYXAodGhpcy5zdGF0ZS5vbGRFZGl0b3JTdGF0ZS5vZmZzZXRzKTtcbiAgICBjb25zdCBuZXdMaW5lT2Zmc2V0cyA9IG5ldyBNYXAodGhpcy5zdGF0ZS5uZXdFZGl0b3JTdGF0ZS5vZmZzZXRzKTtcbiAgICBvZmZzZXRzRnJvbUNvbXBvbmVudHMuZm9yRWFjaCgob2Zmc2V0QW1vdW50LCByb3cpID0+IHtcbiAgICAgIG5ld0xpbmVPZmZzZXRzLnNldChyb3csIChuZXdMaW5lT2Zmc2V0cy5nZXQocm93KSB8fCAwKSArIG9mZnNldEFtb3VudCk7XG4gICAgICBvbGRMaW5lT2Zmc2V0cy5zZXQocm93LCAob2xkTGluZU9mZnNldHMuZ2V0KHJvdykgfHwgMCkgKyBvZmZzZXRBbW91bnQpO1xuICAgIH0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb2xkRWRpdG9yU3RhdGU6IHsuLi50aGlzLnN0YXRlLm9sZEVkaXRvclN0YXRlLCBvZmZzZXRzOiBvbGRMaW5lT2Zmc2V0c30sXG4gICAgICBuZXdFZGl0b3JTdGF0ZTogey4uLnRoaXMuc3RhdGUubmV3RWRpdG9yU3RhdGUsIG9mZnNldHM6IG5ld0xpbmVPZmZzZXRzfSxcbiAgICB9KTtcbiAgfVxuXG4gIF9vbkNoYW5nZU5ld1RleHRFZGl0b3IobmV3Q29udGVudHM6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldE5ld0NvbnRlbnRzKG5ld0NvbnRlbnRzKTtcbiAgfVxuXG4gIF9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24ocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldFJldmlzaW9uKHJldmlzaW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBsaW5lIGRpZmYgc3RhdGUgb24gYWN0aXZlIGZpbGUgc3RhdGUgY2hhbmdlLlxuICAgKi9cbiAgX3VwZGF0ZUxpbmVEaWZmU3RhdGUoZmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpOiB2b2lkIHtcbiAgICBjb25zdCB7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZENvbnRlbnRzLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzLFxuICAgICAgaW5saW5lQ29tcG9uZW50cyxcbiAgICAgIGZyb21SZXZpc2lvblRpdGxlLFxuICAgICAgdG9SZXZpc2lvblRpdGxlLFxuICAgIH0gPSBmaWxlU3RhdGU7XG5cbiAgICBjb25zdCB7YWRkZWRMaW5lcywgcmVtb3ZlZExpbmVzLCBvbGRMaW5lT2Zmc2V0cywgbmV3TGluZU9mZnNldHN9ID1cbiAgICAgIGNvbXB1dGVEaWZmKG9sZENvbnRlbnRzLCBuZXdDb250ZW50cyk7XG5cbiAgICBjb25zdCBvbGRFZGl0b3JTdGF0ZSA9IHtcbiAgICAgIHJldmlzaW9uVGl0bGU6IGZyb21SZXZpc2lvblRpdGxlLFxuICAgICAgdGV4dDogb2xkQ29udGVudHMsXG4gICAgICBvZmZzZXRzOiBvbGRMaW5lT2Zmc2V0cyxcbiAgICAgIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICAgICAgYWRkZWQ6IFtdLFxuICAgICAgICByZW1vdmVkOiByZW1vdmVkTGluZXMsXG4gICAgICB9LFxuICAgICAgaW5saW5lRWxlbWVudHM6IGlubGluZUNvbXBvbmVudHMgfHwgW10sXG4gICAgfTtcbiAgICBjb25zdCBuZXdFZGl0b3JTdGF0ZSA9IHtcbiAgICAgIHJldmlzaW9uVGl0bGU6IHRvUmV2aXNpb25UaXRsZSxcbiAgICAgIHRleHQ6IG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICAgIG9mZnNldHM6IG5ld0xpbmVPZmZzZXRzLFxuICAgICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgICBhZGRlZDogYWRkZWRMaW5lcyxcbiAgICAgICAgcmVtb3ZlZDogW10sXG4gICAgICB9LFxuICAgICAgaW5saW5lRWxlbWVudHM6IFtdLFxuICAgIH07XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZEVkaXRvclN0YXRlLFxuICAgICAgbmV3RWRpdG9yU3RhdGUsXG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld0NvbXBvbmVudDtcbiJdfQ==