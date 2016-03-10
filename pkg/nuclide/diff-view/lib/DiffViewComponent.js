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

var _atomHelpers = require('../../atom-helpers');

var _constants = require('./constants');

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

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

/* eslint-disable react/prop-types */

var DiffViewComponent = (function (_React$Component) {
  _inherits(DiffViewComponent, _React$Component);

  function DiffViewComponent(props) {
    _classCallCheck(this, DiffViewComponent);

    _get(Object.getPrototypeOf(DiffViewComponent.prototype), 'constructor', this).call(this, props);
    var toolbarVisible = _featureConfig2['default'].get(_constants.TOOLBAR_VISIBLE_SETTING);
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

      this._subscriptions.add(_featureConfig2['default'].observe(_constants.TOOLBAR_VISIBLE_SETTING, function (toolbarVisible) {
        _this.setState({ toolbarVisible: toolbarVisible });
      }));
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var diffModel = this.props.diffModel;

      this._subscriptions.add(diffModel.onActiveFileUpdates(this._updateLineDiffState));
      this._subscriptions.add(diffModel.onDidUpdateState(this._onModelStateChange));

      this._paneContainer = (0, _atomHelpers.createPaneContainer)();
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
      var _this2 = this;

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
          _this2._oldEditorComponent.scrollToScreenLine(firstRemovedLine);
        } else {
          _this2._newEditorComponent.scrollToScreenLine(firstAddedLine);
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

      var compareFileChanges = _diffModel$getState2.compareFileChanges;

      var _diffModel$getActiveFileState = diffModel.getActiveFileState();

      var filePath = _diffModel$getActiveFileState.filePath;

      this._treeComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-view-tree padded' },
        _reactForAtom.React.createElement(_DiffViewTree2['default'], {
          activeFilePath: filePath,
          fileChanges: compareFileChanges,
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
      var textBuffer = (0, _atomHelpers.bufferForUri)(filePath);
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
//# sourceMappingURL=data:application/json;base64,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QUksQ0FBQyxRQUFRLENBQUM7QUFDWixnQkFBUSxFQUFSLFFBQVE7QUFDUixzQkFBYyxFQUFkLGNBQWM7QUFDZCxzQkFBYyxFQUFkLGNBQWM7T0FDZixDQUFDLENBQUM7S0FDSjs7O1NBemFHLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVM7O0FBNGEvQyxNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkRpZmZWaWV3Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2VTdGF0ZSwgSW5saW5lQ29tcG9uZW50LCBPZmZzZXRNYXAsIERpZmZNb2RlVHlwZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL0hnU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSwgVGV4dEJ1ZmZlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBEaWZmVmlld0VkaXRvclBhbmUgZnJvbSAnLi9EaWZmVmlld0VkaXRvclBhbmUnO1xuaW1wb3J0IERpZmZWaWV3VHJlZSBmcm9tICcuL0RpZmZWaWV3VHJlZSc7XG5pbXBvcnQgU3luY1Njcm9sbCBmcm9tICcuL1N5bmNTY3JvbGwnO1xuaW1wb3J0IERpZmZUaW1lbGluZVZpZXcgZnJvbSAnLi9EaWZmVGltZWxpbmVWaWV3JztcbmltcG9ydCBEaWZmVmlld1Rvb2xiYXIgZnJvbSAnLi9EaWZmVmlld1Rvb2xiYXInO1xuaW1wb3J0IERpZmZOYXZpZ2F0aW9uQmFyIGZyb20gJy4vRGlmZk5hdmlnYXRpb25CYXInO1xuaW1wb3J0IERpZmZDb21taXRWaWV3IGZyb20gJy4vRGlmZkNvbW1pdFZpZXcnO1xuaW1wb3J0IERpZmZQdWJsaXNoVmlldyBmcm9tICcuL0RpZmZQdWJsaXNoVmlldyc7XG5pbXBvcnQge2NvbXB1dGVEaWZmLCBnZXRPZmZzZXRMaW5lTnVtYmVyfSBmcm9tICcuL2RpZmYtdXRpbHMnO1xuaW1wb3J0IHtjcmVhdGVQYW5lQ29udGFpbmVyfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtidWZmZXJGb3JVcml9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5pbXBvcnQge1xuICBEaWZmTW9kZSxcbiAgVE9PTEJBUl9WSVNJQkxFX1NFVFRJTkcsXG59IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL2ZlYXR1cmUtY29uZmlnJztcblxudHlwZSBQcm9wcyA9IHtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxudHlwZSBFZGl0b3JTdGF0ZSA9IHtcbiAgcmV2aXNpb25UaXRsZTogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIHNhdmVkQ29udGVudHM/OiBzdHJpbmc7XG4gIG9mZnNldHM6IE9mZnNldE1hcDtcbiAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgIGFkZGVkOiBBcnJheTxudW1iZXI+O1xuICAgIHJlbW92ZWQ6IEFycmF5PG51bWJlcj47XG4gIH07XG4gIGlubGluZUVsZW1lbnRzOiBBcnJheTxJbmxpbmVDb21wb25lbnQ+O1xufVxuXG50eXBlIFN0YXRlID0ge1xuICBmaWxlUGF0aDogTnVjbGlkZVVyaTtcbiAgb2xkRWRpdG9yU3RhdGU6IEVkaXRvclN0YXRlO1xuICBuZXdFZGl0b3JTdGF0ZTogRWRpdG9yU3RhdGU7XG4gIHRvb2xiYXJWaXNpYmxlOiBib29sZWFuO1xufTtcblxuZnVuY3Rpb24gaW5pdGlhbEVkaXRvclN0YXRlKCk6IEVkaXRvclN0YXRlIHtcbiAgcmV0dXJuIHtcbiAgICByZXZpc2lvblRpdGxlOiAnJyxcbiAgICB0ZXh0OiAnJyxcbiAgICBvZmZzZXRzOiBuZXcgTWFwKCksXG4gICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgYWRkZWQ6IFtdLFxuICAgICAgcmVtb3ZlZDogW10sXG4gICAgfSxcbiAgICBpbmxpbmVFbGVtZW50czogW10sXG4gIH07XG59XG5cbmNvbnN0IEVNUFRZX0ZVTkNUSU9OID0gKCkgPT4ge307XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmNsYXNzIERpZmZWaWV3Q29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9zeW5jU2Nyb2xsOiBTeW5jU2Nyb2xsO1xuICBfb2xkRWRpdG9yUGFuZTogYXRvbSRQYW5lO1xuICBfb2xkRWRpdG9yQ29tcG9uZW50OiBEaWZmVmlld0VkaXRvclBhbmU7XG4gIF9wYW5lQ29udGFpbmVyOiBPYmplY3Q7XG4gIF9uZXdFZGl0b3JQYW5lOiBhdG9tJFBhbmU7XG4gIF9uZXdFZGl0b3JDb21wb25lbnQ6IERpZmZWaWV3RWRpdG9yUGFuZTtcbiAgX2JvdHRvbVJpZ2h0UGFuZTogYXRvbSRQYW5lO1xuICBfdGltZWxpbmVDb21wb25lbnQ6ID9EaWZmVGltZWxpbmVWaWV3O1xuICBfdHJlZVBhbmU6IGF0b20kUGFuZTtcbiAgX3RyZWVDb21wb25lbnQ6IFJlYWN0Q29tcG9uZW50O1xuICBfbmF2aWdhdGlvblBhbmU6IGF0b20kUGFuZTtcbiAgX25hdmlnYXRpb25Db21wb25lbnQ6IERpZmZOYXZpZ2F0aW9uQmFyO1xuICBfY29tbWl0Q29tcG9uZW50OiA/RGlmZkNvbW1pdFZpZXc7XG4gIF9wdWJsaXNoQ29tcG9uZW50OiA/RGlmZlB1Ymxpc2hWaWV3O1xuICBfcmVhZG9ubHlCdWZmZXI6IGF0b20kVGV4dEJ1ZmZlcjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgY29uc3QgdG9vbGJhclZpc2libGUgPSAoKGZlYXR1cmVDb25maWcuZ2V0KFRPT0xCQVJfVklTSUJMRV9TRVRUSU5HKTogYW55KTogYm9vbGVhbik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG1vZGU6IERpZmZNb2RlLkJST1dTRV9NT0RFLFxuICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgdG9vbGJhclZpc2libGUsXG4gICAgICBvbGRFZGl0b3JTdGF0ZTogaW5pdGlhbEVkaXRvclN0YXRlKCksXG4gICAgICBuZXdFZGl0b3JTdGF0ZTogaW5pdGlhbEVkaXRvclN0YXRlKCksXG4gICAgfTtcbiAgICAodGhpczogYW55KS5fb25Nb2RlbFN0YXRlQ2hhbmdlID0gdGhpcy5fb25Nb2RlbFN0YXRlQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZU5ld09mZnNldHMgPSB0aGlzLl9oYW5kbGVOZXdPZmZzZXRzLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3VwZGF0ZUxpbmVEaWZmU3RhdGUgPSB0aGlzLl91cGRhdGVMaW5lRGlmZlN0YXRlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2hhbmdlTmV3VGV4dEVkaXRvciA9IHRoaXMuX29uQ2hhbmdlTmV3VGV4dEVkaXRvci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24gPSB0aGlzLl9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25OYXZpZ2F0aW9uQ2xpY2sgPSB0aGlzLl9vbk5hdmlnYXRpb25DbGljay5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5fb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNoYW5nZU1vZGUgPSB0aGlzLl9vbkNoYW5nZU1vZGUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25Td2l0Y2hUb0VkaXRvciA9IHRoaXMuX29uU3dpdGNoVG9FZGl0b3IuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZWFkb25seUJ1ZmZlciA9IG5ldyBUZXh0QnVmZmVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZmVhdHVyZUNvbmZpZy5vYnNlcnZlKFRPT0xCQVJfVklTSUJMRV9TRVRUSU5HLCB0b29sYmFyVmlzaWJsZSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt0b29sYmFyVmlzaWJsZX0pO1xuICAgIH0pKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChkaWZmTW9kZWwub25BY3RpdmVGaWxlVXBkYXRlcyh0aGlzLl91cGRhdGVMaW5lRGlmZlN0YXRlKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZGlmZk1vZGVsLm9uRGlkVXBkYXRlU3RhdGUodGhpcy5fb25Nb2RlbFN0YXRlQ2hhbmdlKSk7XG5cbiAgICB0aGlzLl9wYW5lQ29udGFpbmVyID0gY3JlYXRlUGFuZUNvbnRhaW5lcigpO1xuICAgIC8vIFRoZSBjaGFuZ2VkIGZpbGVzIHN0YXR1cyB0cmVlIHRha2VzIDEvNSBvZiB0aGUgd2lkdGggYW5kIGxpdmVzIG9uIHRoZSByaWdodCBtb3N0LFxuICAgIC8vIHdoaWxlIGJlaW5nIHZlcnRpY2FsbHkgc3BsdCB3aXRoIHRoZSByZXZpc2lvbiB0aW1lbGluZSBzdGFjayBwYW5lLlxuICAgIGNvbnN0IHRvcFBhbmUgPSB0aGlzLl9uZXdFZGl0b3JQYW5lID0gdGhpcy5fcGFuZUNvbnRhaW5lci5nZXRBY3RpdmVQYW5lKCk7XG4gICAgdGhpcy5fYm90dG9tUmlnaHRQYW5lID0gdG9wUGFuZS5zcGxpdERvd24oe1xuICAgICAgZmxleFNjYWxlOiAwLjMsXG4gICAgfSk7XG4gICAgdGhpcy5fdHJlZVBhbmUgPSB0aGlzLl9ib3R0b21SaWdodFBhbmUuc3BsaXRMZWZ0KHtcbiAgICAgIGZsZXhTY2FsZTogMC4zNSxcbiAgICB9KTtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uUGFuZSA9IHRvcFBhbmUuc3BsaXRSaWdodCh7XG4gICAgICBmbGV4U2NhbGU6IDAuMDQ1LFxuICAgIH0pO1xuICAgIHRoaXMuX29sZEVkaXRvclBhbmUgPSB0b3BQYW5lLnNwbGl0TGVmdCh7XG4gICAgICBmbGV4U2NhbGU6IDEsXG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZW5kZXJEaWZmVmlldygpO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fb2xkRWRpdG9yUGFuZSwgdHJ1ZSksXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fbmV3RWRpdG9yUGFuZSwgdHJ1ZSksXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fbmF2aWdhdGlvblBhbmUsIHRydWUpLFxuICAgICAgdGhpcy5fZGVzdHJveVBhbmVEaXNwb3NhYmxlKHRoaXMuX3RyZWVQYW5lLCB0cnVlKSxcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl9ib3R0b21SaWdodFBhbmUpLFxuICAgICk7XG5cbiAgICBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3BhbmVDb250YWluZXInXSkuYXBwZW5kQ2hpbGQoXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fcGFuZUNvbnRhaW5lciksXG4gICAgKTtcblxuICAgIHRoaXMuX3VwZGF0ZUxpbmVEaWZmU3RhdGUoZGlmZk1vZGVsLmdldEFjdGl2ZUZpbGVTdGF0ZSgpKTtcbiAgfVxuXG4gIF9vbk1vZGVsU3RhdGVDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7fSk7XG4gIH1cblxuICBfc2V0dXBTeW5jU2Nyb2xsKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9vbGRFZGl0b3JDb21wb25lbnQgPT0gbnVsbCB8fCB0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBvbGRUZXh0RWRpdG9yRWxlbWVudCA9IHRoaXMuX29sZEVkaXRvckNvbXBvbmVudC5nZXRFZGl0b3JEb21FbGVtZW50KCk7XG4gICAgY29uc3QgbmV3VGV4dEVkaXRvckVsZW1lbnQgPSB0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQuZ2V0RWRpdG9yRG9tRWxlbWVudCgpO1xuICAgIGNvbnN0IHN5bmNTY3JvbGwgPSB0aGlzLl9zeW5jU2Nyb2xsO1xuICAgIGlmIChzeW5jU2Nyb2xsICE9IG51bGwpIHtcbiAgICAgIHN5bmNTY3JvbGwuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5yZW1vdmUoc3luY1Njcm9sbCk7XG4gICAgfVxuICAgIHRoaXMuX3N5bmNTY3JvbGwgPSBuZXcgU3luY1Njcm9sbChcbiAgICAgIG9sZFRleHRFZGl0b3JFbGVtZW50LFxuICAgICAgbmV3VGV4dEVkaXRvckVsZW1lbnQsXG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZCh0aGlzLl9zeW5jU2Nyb2xsKTtcbiAgfVxuXG4gIF9zY3JvbGxUb0ZpcnN0SGlnaGxpZ2h0ZWRMaW5lKCk6IHZvaWQge1xuICAgIC8vIFNjaGVkdWxlIHNjcm9sbCB0byBmaXJzdCBsaW5lIGFmdGVyIGFsbCBsaW5lcyBoYXZlIGJlZW4gcmVuZGVyZWQuXG4gICAgY29uc3Qge29sZEVkaXRvclN0YXRlLCBuZXdFZGl0b3JTdGF0ZX0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHJlbW92ZWRMaW5lcyA9IG9sZEVkaXRvclN0YXRlLmhpZ2hsaWdodGVkTGluZXMucmVtb3ZlZDtcbiAgICBjb25zdCBhZGRlZExpbmVzID0gbmV3RWRpdG9yU3RhdGUuaGlnaGxpZ2h0ZWRMaW5lcy5hZGRlZDtcbiAgICBpZiAoYWRkZWRMaW5lcy5sZW5ndGggPT09IDAgJiYgcmVtb3ZlZExpbmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaXJzdFJlbW92ZWRMaW5lID0gZ2V0T2Zmc2V0TGluZU51bWJlcihcbiAgICAgIHJlbW92ZWRMaW5lc1swXSB8fCAwLFxuICAgICAgb2xkRWRpdG9yU3RhdGUub2Zmc2V0cyxcbiAgICApO1xuICAgIGNvbnN0IGZpcnN0QWRkZWRMaW5lID0gZ2V0T2Zmc2V0TGluZU51bWJlcihcbiAgICAgIGFkZGVkTGluZXNbMF0gfHwgMCxcbiAgICAgIG5ld0VkaXRvclN0YXRlLm9mZnNldHMsXG4gICAgKTtcbiAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBhZGRlZExpbmVzLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAocmVtb3ZlZExpbmVzLmxlbmd0aCA+IDAgJiYgZmlyc3RSZW1vdmVkTGluZSA8IGZpcnN0QWRkZWRMaW5lKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuX29sZEVkaXRvckNvbXBvbmVudC5zY3JvbGxUb1NjcmVlbkxpbmUoZmlyc3RSZW1vdmVkTGluZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQuc2Nyb2xsVG9TY3JlZW5MaW5lKGZpcnN0QWRkZWRMaW5lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9vbkNoYW5nZU1vZGUobW9kZTogRGlmZk1vZGVUeXBlKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuc2V0Vmlld01vZGUobW9kZSk7XG4gIH1cblxuICBfcmVuZGVyRGlmZlZpZXcoKTogdm9pZCB7XG4gICAgdGhpcy5fcmVuZGVyVHJlZSgpO1xuICAgIHRoaXMuX3JlbmRlckVkaXRvcnMoKTtcbiAgICB0aGlzLl9yZW5kZXJOYXZpZ2F0aW9uKCk7XG4gICAgdGhpcy5fcmVuZGVyQm90dG9tUmlnaHRQYW5lKCk7XG4gIH1cblxuICBfcmVuZGVyQm90dG9tUmlnaHRQYW5lKCk6IHZvaWQge1xuICAgIGNvbnN0IHt2aWV3TW9kZX0gPSB0aGlzLnByb3BzLmRpZmZNb2RlbC5nZXRTdGF0ZSgpO1xuICAgIHN3aXRjaCAodmlld01vZGUpIHtcbiAgICAgIGNhc2UgRGlmZk1vZGUuQlJPV1NFX01PREU6XG4gICAgICAgIHRoaXMuX3JlbmRlclRpbWVsaW5lVmlldygpO1xuICAgICAgICB0aGlzLl9jb21taXRDb21wb25lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLl9wdWJsaXNoQ29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERpZmZNb2RlLkNPTU1JVF9NT0RFOlxuICAgICAgICB0aGlzLl9yZW5kZXJDb21taXRWaWV3KCk7XG4gICAgICAgIHRoaXMuX3RpbWVsaW5lQ29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcHVibGlzaENvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaWZmTW9kZS5QVUJMSVNIX01PREU6XG4gICAgICAgIHRoaXMuX3JlbmRlclB1Ymxpc2hWaWV3KCk7XG4gICAgICAgIHRoaXMuX2NvbW1pdENvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuX3RpbWVsaW5lQ29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgRGlmZiBNb2RlOiAke3ZpZXdNb2RlfWApO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzLCBwcmV2U3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gICAgdGhpcy5fcmVuZGVyRGlmZlZpZXcoKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5maWxlUGF0aCAhPT0gcHJldlN0YXRlLmZpbGVQYXRoKSB7XG4gICAgICB0aGlzLl9zY3JvbGxUb0ZpcnN0SGlnaGxpZ2h0ZWRMaW5lKCk7XG4gICAgfVxuICB9XG5cbiAgX3JlbmRlckNvbW1pdFZpZXcoKTogdm9pZCB7XG4gICAgY29uc3Qge1xuICAgICAgY29tbWl0TWVzc2FnZSxcbiAgICAgIGNvbW1pdE1vZGUsXG4gICAgICBjb21taXRNb2RlU3RhdGUsXG4gICAgfSA9IHRoaXMucHJvcHMuZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgdGhpcy5fY29tbWl0Q29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERpZmZDb21taXRWaWV3XG4gICAgICAgIGNvbW1pdE1lc3NhZ2U9e2NvbW1pdE1lc3NhZ2V9XG4gICAgICAgIGNvbW1pdE1vZGU9e2NvbW1pdE1vZGV9XG4gICAgICAgIGNvbW1pdE1vZGVTdGF0ZT17Y29tbWl0TW9kZVN0YXRlfVxuICAgICAgICAvLyBgZGlmZk1vZGVsYCBpcyBhY3RpbmcgYXMgdGhlIGFjdGlvbiBjcmVhdG9yIGZvciBjb21taXQgdmlldyBhbmQgbmVlZHMgdG8gYmUgcGFzc2VkIHNvXG4gICAgICAgIC8vIG1ldGhvZHMgY2FuIGJlIGNhbGxlZCBvbiBpdC5cbiAgICAgICAgZGlmZk1vZGVsPXt0aGlzLnByb3BzLmRpZmZNb2RlbH1cbiAgICAgIC8+LFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fYm90dG9tUmlnaHRQYW5lKSxcbiAgICApO1xuICB9XG5cbiAgX3JlbmRlclB1Ymxpc2hWaWV3KCk6IHZvaWQge1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICBwdWJsaXNoTW9kZSxcbiAgICAgIHB1Ymxpc2hNb2RlU3RhdGUsXG4gICAgICBwdWJsaXNoTWVzc2FnZSxcbiAgICAgIGhlYWRSZXZpc2lvbixcbiAgICB9ID0gZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgdGhpcy5fcHVibGlzaENvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxEaWZmUHVibGlzaFZpZXdcbiAgICAgICAgcHVibGlzaE1vZGVTdGF0ZT17cHVibGlzaE1vZGVTdGF0ZX1cbiAgICAgICAgbWVzc2FnZT17cHVibGlzaE1lc3NhZ2V9XG4gICAgICAgIHB1Ymxpc2hNb2RlPXtwdWJsaXNoTW9kZX1cbiAgICAgICAgaGVhZFJldmlzaW9uPXtoZWFkUmV2aXNpb259XG4gICAgICAgIGRpZmZNb2RlbD17ZGlmZk1vZGVsfVxuICAgICAgLz4sXG4gICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9ib3R0b21SaWdodFBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyVHJlZSgpOiB2b2lkIHtcbiAgICBjb25zdCB7ZGlmZk1vZGVsfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge2NvbXBhcmVGaWxlQ2hhbmdlc30gPSBkaWZmTW9kZWwuZ2V0U3RhdGUoKTtcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gZGlmZk1vZGVsLmdldEFjdGl2ZUZpbGVTdGF0ZSgpO1xuICAgIHRoaXMuX3RyZWVDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctdHJlZSBwYWRkZWRcIj5cbiAgICAgICAgICA8RGlmZlZpZXdUcmVlXG4gICAgICAgICAgICBhY3RpdmVGaWxlUGF0aD17ZmlsZVBhdGh9XG4gICAgICAgICAgICBmaWxlQ2hhbmdlcz17Y29tcGFyZUZpbGVDaGFuZ2VzfVxuICAgICAgICAgICAgZGlmZk1vZGVsPXtkaWZmTW9kZWx9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApLFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fdHJlZVBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyRWRpdG9ycygpOiB2b2lkIHtcbiAgICBjb25zdCB7ZmlsZVBhdGgsIG9sZEVkaXRvclN0YXRlOiBvbGRTdGF0ZSwgbmV3RWRpdG9yU3RhdGU6IG5ld1N0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgICA8RGlmZlZpZXdFZGl0b3JQYW5lXG4gICAgICAgICAgaGVhZGVyVGl0bGU9e29sZFN0YXRlLnJldmlzaW9uVGl0bGV9XG4gICAgICAgICAgdGV4dEJ1ZmZlcj17dGhpcy5fcmVhZG9ubHlCdWZmZXJ9XG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e29sZFN0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17b2xkU3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBzYXZlZENvbnRlbnRzPXtvbGRTdGF0ZS50ZXh0fVxuICAgICAgICAgIGluaXRpYWxUZXh0Q29udGVudD17b2xkU3RhdGUudGV4dH1cbiAgICAgICAgICBpbmxpbmVFbGVtZW50cz17b2xkU3RhdGUuaW5saW5lRWxlbWVudHN9XG4gICAgICAgICAgaGFuZGxlTmV3T2Zmc2V0cz17dGhpcy5faGFuZGxlTmV3T2Zmc2V0c31cbiAgICAgICAgICByZWFkT25seT17dHJ1ZX1cbiAgICAgICAgICBvbkNoYW5nZT17RU1QVFlfRlVOQ1RJT059XG4gICAgICAgICAgb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudD17RU1QVFlfRlVOQ1RJT059XG4gICAgICAgIC8+LFxuICAgICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9vbGRFZGl0b3JQYW5lKSxcbiAgICApO1xuICAgIGNvbnN0IHRleHRCdWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgICAgPERpZmZWaWV3RWRpdG9yUGFuZVxuICAgICAgICAgIGhlYWRlclRpdGxlPXtuZXdTdGF0ZS5yZXZpc2lvblRpdGxlfVxuICAgICAgICAgIHRleHRCdWZmZXI9e3RleHRCdWZmZXJ9XG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e25ld1N0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17bmV3U3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBpbml0aWFsVGV4dENvbnRlbnQ9e25ld1N0YXRlLnRleHR9XG4gICAgICAgICAgc2F2ZWRDb250ZW50cz17bmV3U3RhdGUuc2F2ZWRDb250ZW50c31cbiAgICAgICAgICBpbmxpbmVFbGVtZW50cz17bmV3U3RhdGUuaW5saW5lRWxlbWVudHN9XG4gICAgICAgICAgaGFuZGxlTmV3T2Zmc2V0cz17dGhpcy5faGFuZGxlTmV3T2Zmc2V0c31cbiAgICAgICAgICBvbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50PXt0aGlzLl9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50fVxuICAgICAgICAgIHJlYWRPbmx5PXtmYWxzZX1cbiAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2VOZXdUZXh0RWRpdG9yfVxuICAgICAgICAvPixcbiAgICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fbmV3RWRpdG9yUGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3NldHVwU3luY1Njcm9sbCgpO1xuICB9XG5cbiAgX3JlbmRlclRpbWVsaW5lVmlldygpOiB2b2lkIHtcbiAgICB0aGlzLl90aW1lbGluZUNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxEaWZmVGltZWxpbmVWaWV3XG4gICAgICAgIGRpZmZNb2RlbD17dGhpcy5wcm9wcy5kaWZmTW9kZWx9XG4gICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlPXt0aGlzLl9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb259XG4gICAgICAvPixcbiAgICAgIHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX2JvdHRvbVJpZ2h0UGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJOYXZpZ2F0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IHtvbGRFZGl0b3JTdGF0ZSwgbmV3RWRpdG9yU3RhdGV9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7b2Zmc2V0czogb2xkT2Zmc2V0cywgaGlnaGxpZ2h0ZWRMaW5lczogb2xkTGluZXMsIHRleHQ6IG9sZENvbnRlbnRzfSA9IG9sZEVkaXRvclN0YXRlO1xuICAgIGNvbnN0IHtvZmZzZXRzOiBuZXdPZmZzZXRzLCBoaWdobGlnaHRlZExpbmVzOiBuZXdMaW5lcywgdGV4dDogbmV3Q29udGVudHN9ID0gbmV3RWRpdG9yU3RhdGU7XG4gICAgY29uc3QgbmF2aWdhdGlvblBhbmVFbGVtZW50ID0gdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fbmF2aWdhdGlvblBhbmUpO1xuICAgIHRoaXMuX25hdmlnYXRpb25Db21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RGlmZk5hdmlnYXRpb25CYXJcbiAgICAgICAgZWxlbWVudEhlaWdodD17bmF2aWdhdGlvblBhbmVFbGVtZW50LmNsaWVudEhlaWdodH1cbiAgICAgICAgYWRkZWRMaW5lcz17bmV3TGluZXMuYWRkZWR9XG4gICAgICAgIG5ld09mZnNldHM9e25ld09mZnNldHN9XG4gICAgICAgIG5ld0NvbnRlbnRzPXtuZXdDb250ZW50c31cbiAgICAgICAgcmVtb3ZlZExpbmVzPXtvbGRMaW5lcy5yZW1vdmVkfVxuICAgICAgICBvbGRPZmZzZXRzPXtvbGRPZmZzZXRzfVxuICAgICAgICBvbGRDb250ZW50cz17b2xkQ29udGVudHN9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uTmF2aWdhdGlvbkNsaWNrfVxuICAgICAgLz4sXG4gICAgICBuYXZpZ2F0aW9uUGFuZUVsZW1lbnQsXG4gICAgKTtcbiAgfVxuXG4gIF9vbk5hdmlnYXRpb25DbGljayhsaW5lTnVtYmVyOiBudW1iZXIsIGlzQWRkZWRMaW5lOiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgdGV4dEVkaXRvckNvbXBvbmVudCA9IGlzQWRkZWRMaW5lID8gdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50IDogdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50O1xuICAgIGludmFyaWFudCh0ZXh0RWRpdG9yQ29tcG9uZW50LCAnRGlmZiBWaWV3IE5hdmlnYXRpb24gRXJyb3I6IE5vbiB2YWxpZCB0ZXh0IGVkaXRvciBjb21wb25lbnQnKTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGV4dEVkaXRvckNvbXBvbmVudC5nZXRFZGl0b3JNb2RlbCgpO1xuICAgIHRleHRFZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbbGluZU51bWJlciwgMF0pO1xuICB9XG5cbiAgX2dldFBhbmVFbGVtZW50KHBhbmU6IGF0b20kUGFuZSk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gYXRvbS52aWV3cy5nZXRWaWV3KHBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJyk7XG4gIH1cblxuICBfZGVzdHJveVBhbmVEaXNwb3NhYmxlKHBhbmU6IGF0b20kUGFuZSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgcGFuZS5kZXN0cm95KCk7XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGxldCB0b29sYmFyQ29tcG9uZW50ID0gbnVsbDtcbiAgICBpZiAodGhpcy5zdGF0ZS50b29sYmFyVmlzaWJsZSkge1xuICAgICAgY29uc3Qge3ZpZXdNb2RlfSA9IHRoaXMucHJvcHMuZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgICBjb25zdCB7b2xkRWRpdG9yU3RhdGUsIG5ld0VkaXRvclN0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgICB0b29sYmFyQ29tcG9uZW50ID0gKFxuICAgICAgICA8RGlmZlZpZXdUb29sYmFyXG4gICAgICAgICAgZmlsZVBhdGg9e3RoaXMuc3RhdGUuZmlsZVBhdGh9XG4gICAgICAgICAgZGlmZk1vZGU9e3ZpZXdNb2RlfVxuICAgICAgICAgIG5ld1JldmlzaW9uVGl0bGU9e25ld0VkaXRvclN0YXRlLnJldmlzaW9uVGl0bGV9XG4gICAgICAgICAgb2xkUmV2aXNpb25UaXRsZT17b2xkRWRpdG9yU3RhdGUucmV2aXNpb25UaXRsZX1cbiAgICAgICAgICBvblN3aXRjaE1vZGU9e3RoaXMuX29uQ2hhbmdlTW9kZX1cbiAgICAgICAgICBvblN3aXRjaFRvRWRpdG9yPXt0aGlzLl9vblN3aXRjaFRvRWRpdG9yfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctY29udGFpbmVyXCI+XG4gICAgICAgIHt0b29sYmFyQ29tcG9uZW50fVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LWNvbXBvbmVudFwiIHJlZj1cInBhbmVDb250YWluZXJcIiAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vblN3aXRjaFRvRWRpdG9yKCk6IHZvaWQge1xuICAgIGNvbnN0IGRpZmZWaWV3Tm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGludmFyaWFudChkaWZmVmlld05vZGUsICdEaWZmIFZpZXcgRE9NIG5lZWRzIHRvIGJlIGF0dGFjaGVkIHRvIHN3aXRjaCB0byBlZGl0b3IgbW9kZScpO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZGlmZlZpZXdOb2RlLCAnbnVjbGlkZS1kaWZmLXZpZXc6c3dpdGNoLXRvLWVkaXRvcicpO1xuICB9XG5cbiAgX2hhbmRsZU5ld09mZnNldHMob2Zmc2V0c0Zyb21Db21wb25lbnRzOiBNYXApOiB2b2lkIHtcbiAgICBjb25zdCBvbGRMaW5lT2Zmc2V0cyA9IG5ldyBNYXAodGhpcy5zdGF0ZS5vbGRFZGl0b3JTdGF0ZS5vZmZzZXRzKTtcbiAgICBjb25zdCBuZXdMaW5lT2Zmc2V0cyA9IG5ldyBNYXAodGhpcy5zdGF0ZS5uZXdFZGl0b3JTdGF0ZS5vZmZzZXRzKTtcbiAgICBvZmZzZXRzRnJvbUNvbXBvbmVudHMuZm9yRWFjaCgob2Zmc2V0QW1vdW50LCByb3cpID0+IHtcbiAgICAgIG5ld0xpbmVPZmZzZXRzLnNldChyb3csIChuZXdMaW5lT2Zmc2V0cy5nZXQocm93KSB8fCAwKSArIG9mZnNldEFtb3VudCk7XG4gICAgICBvbGRMaW5lT2Zmc2V0cy5zZXQocm93LCAob2xkTGluZU9mZnNldHMuZ2V0KHJvdykgfHwgMCkgKyBvZmZzZXRBbW91bnQpO1xuICAgIH0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb2xkRWRpdG9yU3RhdGU6IHsuLi50aGlzLnN0YXRlLm9sZEVkaXRvclN0YXRlLCBvZmZzZXRzOiBvbGRMaW5lT2Zmc2V0c30sXG4gICAgICBuZXdFZGl0b3JTdGF0ZTogey4uLnRoaXMuc3RhdGUubmV3RWRpdG9yU3RhdGUsIG9mZnNldHM6IG5ld0xpbmVPZmZzZXRzfSxcbiAgICB9KTtcbiAgfVxuXG4gIF9vbkNoYW5nZU5ld1RleHRFZGl0b3IobmV3Q29udGVudHM6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldE5ld0NvbnRlbnRzKG5ld0NvbnRlbnRzKTtcbiAgfVxuXG4gIF9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24ocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldFJldmlzaW9uKHJldmlzaW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBsaW5lIGRpZmYgc3RhdGUgb24gYWN0aXZlIGZpbGUgc3RhdGUgY2hhbmdlLlxuICAgKi9cbiAgX3VwZGF0ZUxpbmVEaWZmU3RhdGUoZmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpOiB2b2lkIHtcbiAgICBjb25zdCB7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZENvbnRlbnRzLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzLFxuICAgICAgaW5saW5lQ29tcG9uZW50cyxcbiAgICAgIGZyb21SZXZpc2lvblRpdGxlLFxuICAgICAgdG9SZXZpc2lvblRpdGxlLFxuICAgIH0gPSBmaWxlU3RhdGU7XG5cbiAgICBjb25zdCB7YWRkZWRMaW5lcywgcmVtb3ZlZExpbmVzLCBvbGRMaW5lT2Zmc2V0cywgbmV3TGluZU9mZnNldHN9ID1cbiAgICAgIGNvbXB1dGVEaWZmKG9sZENvbnRlbnRzLCBuZXdDb250ZW50cyk7XG5cbiAgICBjb25zdCBvbGRFZGl0b3JTdGF0ZSA9IHtcbiAgICAgIHJldmlzaW9uVGl0bGU6IGZyb21SZXZpc2lvblRpdGxlLFxuICAgICAgdGV4dDogb2xkQ29udGVudHMsXG4gICAgICBvZmZzZXRzOiBvbGRMaW5lT2Zmc2V0cyxcbiAgICAgIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICAgICAgYWRkZWQ6IFtdLFxuICAgICAgICByZW1vdmVkOiByZW1vdmVkTGluZXMsXG4gICAgICB9LFxuICAgICAgaW5saW5lRWxlbWVudHM6IGlubGluZUNvbXBvbmVudHMgfHwgW10sXG4gICAgfTtcbiAgICBjb25zdCBuZXdFZGl0b3JTdGF0ZSA9IHtcbiAgICAgIHJldmlzaW9uVGl0bGU6IHRvUmV2aXNpb25UaXRsZSxcbiAgICAgIHRleHQ6IG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICAgIG9mZnNldHM6IG5ld0xpbmVPZmZzZXRzLFxuICAgICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgICBhZGRlZDogYWRkZWRMaW5lcyxcbiAgICAgICAgcmVtb3ZlZDogW10sXG4gICAgICB9LFxuICAgICAgaW5saW5lRWxlbWVudHM6IFtdLFxuICAgIH07XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZEVkaXRvclN0YXRlLFxuICAgICAgbmV3RWRpdG9yU3RhdGUsXG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld0NvbXBvbmVudDtcbiJdfQ==