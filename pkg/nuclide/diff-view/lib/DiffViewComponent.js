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
var TOOLBAR_VISIBLE_SETTING = 'nuclide-diff-view.toolbarVisible';

/* eslint-disable react/prop-types */

var DiffViewComponent = (function (_React$Component) {
  _inherits(DiffViewComponent, _React$Component);

  function DiffViewComponent(props) {
    _classCallCheck(this, DiffViewComponent);

    _get(Object.getPrototypeOf(DiffViewComponent.prototype), 'constructor', this).call(this, props);
    var toolbarVisible = _featureConfig2['default'].get(TOOLBAR_VISIBLE_SETTING);
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

      this._subscriptions.add(_featureConfig2['default'].observe(TOOLBAR_VISIBLE_SETTING, function (toolbarVisible) {
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
    value: function componentDidUpdate() {
      this._renderDiffView();
    }
  }, {
    key: '_renderCommitView',
    value: function _renderCommitView() {
      this._commitComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_DiffCommitView2['default'], { diffModel: this.props.diffModel }), this._getPaneElement(this._bottomRightPane));
    }
  }, {
    key: '_renderPublishView',
    value: function _renderPublishView() {
      var diffModel = this.props.diffModel;

      var _diffModel$getState = diffModel.getState();

      var publishMessageLoading = _diffModel$getState.publishMessageLoading;
      var publishMessage = _diffModel$getState.publishMessage;
      var isPublishing = _diffModel$getState.isPublishing;
      var publishMode = _diffModel$getState.publishMode;
      var headRevision = _diffModel$getState.headRevision;

      this._publishComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_DiffPublishView2['default'], {
        isLoading: publishMessageLoading,
        isPublishing: isPublishing,
        message: publishMessage,
        publishMode: publishMode,
        headRevision: headRevision,
        diffModel: diffModel
      }), this._getPaneElement(this._bottomRightPane));
    }
  }, {
    key: '_renderTree',
    value: function _renderTree() {
      this._treeComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-view-tree' },
        _reactForAtom.React.createElement(_DiffViewTree2['default'], { diffModel: this.props.diffModel })
      ), this._getPaneElement(this._treePane));
    }
  }, {
    key: '_renderEditors',
    value: function _renderEditors() {
      var _state = this.state;
      var filePath = _state.filePath;
      var oldState = _state.oldEditorState;
      var newState = _state.newEditorState;

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
      var _state2 = this.state;
      var oldEditorState = _state2.oldEditorState;
      var newEditorState = _state2.newEditorState;
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
        var _props$diffModel$getState2 = this.props.diffModel.getState();

        var viewMode = _props$diffModel$getState2.viewMode;

        toolbarComponent = _reactForAtom.React.createElement(_DiffViewToolbar2['default'], {
          filePath: this.state.filePath,
          diffMode: viewMode,
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

      var _require = require('./diff-utils');

      var computeDiff = _require.computeDiff;

      var _computeDiff = computeDiff(oldContents, newContents);

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
//# sourceMappingURL=data:application/json;base64,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QURYLGVBQWU7O3FCQUdLLE9BQU8sQ0FBQyxjQUFjLENBQUM7O1VBQXRDLFdBQVcsWUFBWCxXQUFXOzt5QkFFaEIsV0FBVyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7O1VBRGhDLFVBQVUsZ0JBQVYsVUFBVTtVQUFFLFlBQVksZ0JBQVosWUFBWTtVQUFFLGNBQWMsZ0JBQWQsY0FBYztVQUFFLGNBQWMsZ0JBQWQsY0FBYzs7QUFHL0QsVUFBTSxjQUFjLEdBQUc7QUFDckIscUJBQWEsRUFBRSxpQkFBaUI7QUFDaEMsWUFBSSxFQUFFLFdBQVc7QUFDakIsZUFBTyxFQUFFLGNBQWM7QUFDdkIsd0JBQWdCLEVBQUU7QUFDaEIsZUFBSyxFQUFFLEVBQUU7QUFDVCxpQkFBTyxFQUFFLFlBQVk7U0FDdEI7QUFDRCxzQkFBYyxFQUFFLGdCQUFnQixJQUFJLEVBQUU7T0FDdkMsQ0FBQztBQUNGLFVBQU0sY0FBYyxHQUFHO0FBQ3JCLHFCQUFhLEVBQUUsZUFBZTtBQUM5QixZQUFJLEVBQUUsV0FBVztBQUNqQixxQkFBYSxFQUFiLGFBQWE7QUFDYixlQUFPLEVBQUUsY0FBYztBQUN2Qix3QkFBZ0IsRUFBRTtBQUNoQixlQUFLLEVBQUUsVUFBVTtBQUNqQixpQkFBTyxFQUFFLEVBQUU7U0FDWjtBQUNELHNCQUFjLEVBQUUsRUFBRTtPQUNuQixDQUFDO0FBQ0YsVUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGdCQUFRLEVBQVIsUUFBUTtBQUNSLHNCQUFjLEVBQWQsY0FBYztBQUNkLHNCQUFjLEVBQWQsY0FBYztPQUNmLENBQUMsQ0FBQztLQUNKOzs7U0F2WEcsaUJBQWlCO0dBQVMsb0JBQU0sU0FBUzs7QUEwWC9DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMiLCJmaWxlIjoiRGlmZlZpZXdDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RmlsZUNoYW5nZVN0YXRlLCBJbmxpbmVDb21wb25lbnQsIE9mZnNldE1hcCwgRGlmZk1vZGVUeXBlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWwgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlLCBUZXh0QnVmZmVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IERpZmZWaWV3RWRpdG9yUGFuZSBmcm9tICcuL0RpZmZWaWV3RWRpdG9yUGFuZSc7XG5pbXBvcnQgRGlmZlZpZXdUcmVlIGZyb20gJy4vRGlmZlZpZXdUcmVlJztcbmltcG9ydCBTeW5jU2Nyb2xsIGZyb20gJy4vU3luY1Njcm9sbCc7XG5pbXBvcnQgRGlmZlRpbWVsaW5lVmlldyBmcm9tICcuL0RpZmZUaW1lbGluZVZpZXcnO1xuaW1wb3J0IERpZmZWaWV3VG9vbGJhciBmcm9tICcuL0RpZmZWaWV3VG9vbGJhcic7XG5pbXBvcnQgRGlmZk5hdmlnYXRpb25CYXIgZnJvbSAnLi9EaWZmTmF2aWdhdGlvbkJhcic7XG5pbXBvcnQgRGlmZkNvbW1pdFZpZXcgZnJvbSAnLi9EaWZmQ29tbWl0Vmlldyc7XG5pbXBvcnQgRGlmZlB1Ymxpc2hWaWV3IGZyb20gJy4vRGlmZlB1Ymxpc2hWaWV3JztcbmltcG9ydCB7Y3JlYXRlUGFuZUNvbnRhaW5lcn0gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7YnVmZmVyRm9yVXJpfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtEaWZmTW9kZX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vZmVhdHVyZS1jb25maWcnO1xuXG50eXBlIFByb3BzID0ge1xuICBkaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG59O1xuXG50eXBlIEVkaXRvclN0YXRlID0ge1xuICByZXZpc2lvblRpdGxlOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgc2F2ZWRDb250ZW50cz86IHN0cmluZztcbiAgb2Zmc2V0czogT2Zmc2V0TWFwO1xuICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgYWRkZWQ6IEFycmF5PG51bWJlcj47XG4gICAgcmVtb3ZlZDogQXJyYXk8bnVtYmVyPjtcbiAgfTtcbiAgaW5saW5lRWxlbWVudHM6IEFycmF5PElubGluZUNvbXBvbmVudD47XG59XG5cbnR5cGUgU3RhdGUgPSB7XG4gIGZpbGVQYXRoOiBOdWNsaWRlVXJpO1xuICBvbGRFZGl0b3JTdGF0ZTogRWRpdG9yU3RhdGU7XG4gIG5ld0VkaXRvclN0YXRlOiBFZGl0b3JTdGF0ZTtcbiAgdG9vbGJhclZpc2libGU6IGJvb2xlYW47XG59O1xuXG5mdW5jdGlvbiBpbml0aWFsRWRpdG9yU3RhdGUoKTogRWRpdG9yU3RhdGUge1xuICByZXR1cm4ge1xuICAgIHJldmlzaW9uVGl0bGU6ICcnLFxuICAgIHRleHQ6ICcnLFxuICAgIG9mZnNldHM6IG5ldyBNYXAoKSxcbiAgICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgICBhZGRlZDogW10sXG4gICAgICByZW1vdmVkOiBbXSxcbiAgICB9LFxuICAgIGlubGluZUVsZW1lbnRzOiBbXSxcbiAgfTtcbn1cblxuY29uc3QgRU1QVFlfRlVOQ1RJT04gPSAoKSA9PiB7fTtcbmNvbnN0IFRPT0xCQVJfVklTSUJMRV9TRVRUSU5HID0gJ251Y2xpZGUtZGlmZi12aWV3LnRvb2xiYXJWaXNpYmxlJztcblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuY2xhc3MgRGlmZlZpZXdDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3N5bmNTY3JvbGw6IFN5bmNTY3JvbGw7XG4gIF9vbGRFZGl0b3JQYW5lOiBhdG9tJFBhbmU7XG4gIF9vbGRFZGl0b3JDb21wb25lbnQ6IERpZmZWaWV3RWRpdG9yUGFuZTtcbiAgX3BhbmVDb250YWluZXI6IE9iamVjdDtcbiAgX25ld0VkaXRvclBhbmU6IGF0b20kUGFuZTtcbiAgX25ld0VkaXRvckNvbXBvbmVudDogRGlmZlZpZXdFZGl0b3JQYW5lO1xuICBfYm90dG9tUmlnaHRQYW5lOiBhdG9tJFBhbmU7XG4gIF90aW1lbGluZUNvbXBvbmVudDogP0RpZmZUaW1lbGluZVZpZXc7XG4gIF90cmVlUGFuZTogYXRvbSRQYW5lO1xuICBfdHJlZUNvbXBvbmVudDogUmVhY3RDb21wb25lbnQ7XG4gIF9uYXZpZ2F0aW9uUGFuZTogYXRvbSRQYW5lO1xuICBfbmF2aWdhdGlvbkNvbXBvbmVudDogRGlmZk5hdmlnYXRpb25CYXI7XG4gIF9jb21taXRDb21wb25lbnQ6ID9EaWZmQ29tbWl0VmlldztcbiAgX3B1Ymxpc2hDb21wb25lbnQ6ID9EaWZmUHVibGlzaFZpZXc7XG4gIF9yZWFkb25seUJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICBjb25zdCB0b29sYmFyVmlzaWJsZSA9ICgoZmVhdHVyZUNvbmZpZy5nZXQoVE9PTEJBUl9WSVNJQkxFX1NFVFRJTkcpOiBhbnkpOiBib29sZWFuKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbW9kZTogRGlmZk1vZGUuQlJPV1NFX01PREUsXG4gICAgICBmaWxlUGF0aDogJycsXG4gICAgICB0b29sYmFyVmlzaWJsZSxcbiAgICAgIG9sZEVkaXRvclN0YXRlOiBpbml0aWFsRWRpdG9yU3RhdGUoKSxcbiAgICAgIG5ld0VkaXRvclN0YXRlOiBpbml0aWFsRWRpdG9yU3RhdGUoKSxcbiAgICB9O1xuICAgICh0aGlzOiBhbnkpLl9vbk1vZGVsU3RhdGVDaGFuZ2UgPSB0aGlzLl9vbk1vZGVsU3RhdGVDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlTmV3T2Zmc2V0cyA9IHRoaXMuX2hhbmRsZU5ld09mZnNldHMuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fdXBkYXRlTGluZURpZmZTdGF0ZSA9IHRoaXMuX3VwZGF0ZUxpbmVEaWZmU3RhdGUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25DaGFuZ2VOZXdUZXh0RWRpdG9yID0gdGhpcy5fb25DaGFuZ2VOZXdUZXh0RWRpdG9yLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uVGltZWxpbmVDaGFuZ2VSZXZpc2lvbiA9IHRoaXMuX29uVGltZWxpbmVDaGFuZ2VSZXZpc2lvbi5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbk5hdmlnYXRpb25DbGljayA9IHRoaXMuX29uTmF2aWdhdGlvbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQgPSB0aGlzLl9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50LmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2hhbmdlTW9kZSA9IHRoaXMuX29uQ2hhbmdlTW9kZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vblN3aXRjaFRvRWRpdG9yID0gdGhpcy5fb25Td2l0Y2hUb0VkaXRvci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3JlYWRvbmx5QnVmZmVyID0gbmV3IFRleHRCdWZmZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChmZWF0dXJlQ29uZmlnLm9ic2VydmUoVE9PTEJBUl9WSVNJQkxFX1NFVFRJTkcsIHRvb2xiYXJWaXNpYmxlID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3Rvb2xiYXJWaXNpYmxlfSk7XG4gICAgfSkpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSB0aGlzLnByb3BzO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGRpZmZNb2RlbC5vbkFjdGl2ZUZpbGVVcGRhdGVzKHRoaXMuX3VwZGF0ZUxpbmVEaWZmU3RhdGUpKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChkaWZmTW9kZWwub25EaWRVcGRhdGVTdGF0ZSh0aGlzLl9vbk1vZGVsU3RhdGVDaGFuZ2UpKTtcblxuICAgIHRoaXMuX3BhbmVDb250YWluZXIgPSBjcmVhdGVQYW5lQ29udGFpbmVyKCk7XG4gICAgLy8gVGhlIGNoYW5nZWQgZmlsZXMgc3RhdHVzIHRyZWUgdGFrZXMgMS81IG9mIHRoZSB3aWR0aCBhbmQgbGl2ZXMgb24gdGhlIHJpZ2h0IG1vc3QsXG4gICAgLy8gd2hpbGUgYmVpbmcgdmVydGljYWxseSBzcGx0IHdpdGggdGhlIHJldmlzaW9uIHRpbWVsaW5lIHN0YWNrIHBhbmUuXG4gICAgY29uc3QgdG9wUGFuZSA9IHRoaXMuX25ld0VkaXRvclBhbmUgPSB0aGlzLl9wYW5lQ29udGFpbmVyLmdldEFjdGl2ZVBhbmUoKTtcbiAgICB0aGlzLl9ib3R0b21SaWdodFBhbmUgPSB0b3BQYW5lLnNwbGl0RG93bih7XG4gICAgICBmbGV4U2NhbGU6IDAuMyxcbiAgICB9KTtcbiAgICB0aGlzLl90cmVlUGFuZSA9IHRoaXMuX2JvdHRvbVJpZ2h0UGFuZS5zcGxpdExlZnQoe1xuICAgICAgZmxleFNjYWxlOiAwLjM1LFxuICAgIH0pO1xuICAgIHRoaXMuX25hdmlnYXRpb25QYW5lID0gdG9wUGFuZS5zcGxpdFJpZ2h0KHtcbiAgICAgIGZsZXhTY2FsZTogMC4wNDUsXG4gICAgfSk7XG4gICAgdGhpcy5fb2xkRWRpdG9yUGFuZSA9IHRvcFBhbmUuc3BsaXRMZWZ0KHtcbiAgICAgIGZsZXhTY2FsZTogMSxcbiAgICB9KTtcblxuICAgIHRoaXMuX3JlbmRlckRpZmZWaWV3KCk7XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl9vbGRFZGl0b3JQYW5lLCB0cnVlKSxcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl9uZXdFZGl0b3JQYW5lLCB0cnVlKSxcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl9uYXZpZ2F0aW9uUGFuZSwgdHJ1ZSksXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fdHJlZVBhbmUsIHRydWUpLFxuICAgICAgdGhpcy5fZGVzdHJveVBhbmVEaXNwb3NhYmxlKHRoaXMuX2JvdHRvbVJpZ2h0UGFuZSksXG4gICAgKTtcblxuICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1sncGFuZUNvbnRhaW5lciddKS5hcHBlbmRDaGlsZChcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9wYW5lQ29udGFpbmVyKSxcbiAgICApO1xuXG4gICAgdGhpcy5fdXBkYXRlTGluZURpZmZTdGF0ZShkaWZmTW9kZWwuZ2V0QWN0aXZlRmlsZVN0YXRlKCkpO1xuICB9XG5cbiAgX29uTW9kZWxTdGF0ZUNoYW5nZSgpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHt9KTtcbiAgfVxuXG4gIF9zZXR1cFN5bmNTY3JvbGwoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX29sZEVkaXRvckNvbXBvbmVudCA9PSBudWxsIHx8IHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG9sZFRleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50LmdldEVkaXRvckRvbUVsZW1lbnQoKTtcbiAgICBjb25zdCBuZXdUZXh0RWRpdG9yRWxlbWVudCA9IHRoaXMuX25ld0VkaXRvckNvbXBvbmVudC5nZXRFZGl0b3JEb21FbGVtZW50KCk7XG4gICAgY29uc3Qgc3luY1Njcm9sbCA9IHRoaXMuX3N5bmNTY3JvbGw7XG4gICAgaWYgKHN5bmNTY3JvbGwgIT0gbnVsbCkge1xuICAgICAgc3luY1Njcm9sbC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnJlbW92ZShzeW5jU2Nyb2xsKTtcbiAgICB9XG4gICAgdGhpcy5fc3luY1Njcm9sbCA9IG5ldyBTeW5jU2Nyb2xsKFxuICAgICAgb2xkVGV4dEVkaXRvckVsZW1lbnQsXG4gICAgICBuZXdUZXh0RWRpdG9yRWxlbWVudCxcbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRoaXMuX3N5bmNTY3JvbGwpO1xuICB9XG5cbiAgX29uQ2hhbmdlTW9kZShtb2RlOiBEaWZmTW9kZVR5cGUpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5zZXRWaWV3TW9kZShtb2RlKTtcbiAgfVxuXG4gIF9yZW5kZXJEaWZmVmlldygpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW5kZXJUcmVlKCk7XG4gICAgdGhpcy5fcmVuZGVyRWRpdG9ycygpO1xuICAgIHRoaXMuX3JlbmRlck5hdmlnYXRpb24oKTtcbiAgICB0aGlzLl9yZW5kZXJCb3R0b21SaWdodFBhbmUoKTtcbiAgfVxuXG4gIF9yZW5kZXJCb3R0b21SaWdodFBhbmUoKTogdm9pZCB7XG4gICAgY29uc3Qge3ZpZXdNb2RlfSA9IHRoaXMucHJvcHMuZGlmZk1vZGVsLmdldFN0YXRlKCk7XG4gICAgc3dpdGNoICh2aWV3TW9kZSkge1xuICAgICAgY2FzZSBEaWZmTW9kZS5CUk9XU0VfTU9ERTpcbiAgICAgICAgdGhpcy5fcmVuZGVyVGltZWxpbmVWaWV3KCk7XG4gICAgICAgIHRoaXMuX2NvbW1pdENvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuX3B1Ymxpc2hDb21wb25lbnQgPSBudWxsO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRGlmZk1vZGUuQ09NTUlUX01PREU6XG4gICAgICAgIHRoaXMuX3JlbmRlckNvbW1pdFZpZXcoKTtcbiAgICAgICAgdGhpcy5fdGltZWxpbmVDb21wb25lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLl9wdWJsaXNoQ29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERpZmZNb2RlLlBVQkxJU0hfTU9ERTpcbiAgICAgICAgdGhpcy5fcmVuZGVyUHVibGlzaFZpZXcoKTtcbiAgICAgICAgdGhpcy5fY29tbWl0Q29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fdGltZWxpbmVDb21wb25lbnQgPSBudWxsO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBEaWZmIE1vZGU6ICR7dmlld01vZGV9YCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlckRpZmZWaWV3KCk7XG4gIH1cblxuICBfcmVuZGVyQ29tbWl0VmlldygpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21taXRDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RGlmZkNvbW1pdFZpZXcgZGlmZk1vZGVsPXt0aGlzLnByb3BzLmRpZmZNb2RlbH0gLz4sXG4gICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9ib3R0b21SaWdodFBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyUHVibGlzaFZpZXcoKTogdm9pZCB7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIHB1Ymxpc2hNZXNzYWdlTG9hZGluZyxcbiAgICAgIHB1Ymxpc2hNZXNzYWdlLFxuICAgICAgaXNQdWJsaXNoaW5nLFxuICAgICAgcHVibGlzaE1vZGUsXG4gICAgICBoZWFkUmV2aXNpb24sXG4gICAgfSA9IGRpZmZNb2RlbC5nZXRTdGF0ZSgpO1xuICAgIHRoaXMuX3B1Ymxpc2hDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RGlmZlB1Ymxpc2hWaWV3XG4gICAgICAgIGlzTG9hZGluZz17cHVibGlzaE1lc3NhZ2VMb2FkaW5nfVxuICAgICAgICBpc1B1Ymxpc2hpbmc9e2lzUHVibGlzaGluZ31cbiAgICAgICAgbWVzc2FnZT17cHVibGlzaE1lc3NhZ2V9XG4gICAgICAgIHB1Ymxpc2hNb2RlPXtwdWJsaXNoTW9kZX1cbiAgICAgICAgaGVhZFJldmlzaW9uPXtoZWFkUmV2aXNpb259XG4gICAgICAgIGRpZmZNb2RlbD17ZGlmZk1vZGVsfVxuICAgICAgLz4sXG4gICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9ib3R0b21SaWdodFBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyVHJlZSgpOiB2b2lkIHtcbiAgICB0aGlzLl90cmVlQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LXRyZWVcIj5cbiAgICAgICAgICA8RGlmZlZpZXdUcmVlIGRpZmZNb2RlbD17dGhpcy5wcm9wcy5kaWZmTW9kZWx9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSxcbiAgICAgIHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX3RyZWVQYW5lKSxcbiAgICApO1xuICB9XG5cbiAgX3JlbmRlckVkaXRvcnMoKTogdm9pZCB7XG4gICAgY29uc3Qge2ZpbGVQYXRoLCBvbGRFZGl0b3JTdGF0ZTogb2xkU3RhdGUsIG5ld0VkaXRvclN0YXRlOiBuZXdTdGF0ZX0gPSB0aGlzLnN0YXRlO1xuICAgIHRoaXMuX29sZEVkaXRvckNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgICAgPERpZmZWaWV3RWRpdG9yUGFuZVxuICAgICAgICAgIGhlYWRlclRpdGxlPXtvbGRTdGF0ZS5yZXZpc2lvblRpdGxlfVxuICAgICAgICAgIHRleHRCdWZmZXI9e3RoaXMuX3JlYWRvbmx5QnVmZmVyfVxuICAgICAgICAgIGZpbGVQYXRoPXtmaWxlUGF0aH1cbiAgICAgICAgICBvZmZzZXRzPXtvbGRTdGF0ZS5vZmZzZXRzfVxuICAgICAgICAgIGhpZ2hsaWdodGVkTGluZXM9e29sZFN0YXRlLmhpZ2hsaWdodGVkTGluZXN9XG4gICAgICAgICAgc2F2ZWRDb250ZW50cz17b2xkU3RhdGUudGV4dH1cbiAgICAgICAgICBpbml0aWFsVGV4dENvbnRlbnQ9e29sZFN0YXRlLnRleHR9XG4gICAgICAgICAgaW5saW5lRWxlbWVudHM9e29sZFN0YXRlLmlubGluZUVsZW1lbnRzfVxuICAgICAgICAgIGhhbmRsZU5ld09mZnNldHM9e3RoaXMuX2hhbmRsZU5ld09mZnNldHN9XG4gICAgICAgICAgcmVhZE9ubHk9e3RydWV9XG4gICAgICAgICAgb25DaGFuZ2U9e0VNUFRZX0ZVTkNUSU9OfVxuICAgICAgICAgIG9uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQ9e0VNUFRZX0ZVTkNUSU9OfVxuICAgICAgICAvPixcbiAgICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fb2xkRWRpdG9yUGFuZSksXG4gICAgKTtcbiAgICBjb25zdCB0ZXh0QnVmZmVyID0gYnVmZmVyRm9yVXJpKGZpbGVQYXRoKTtcbiAgICB0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICAgIDxEaWZmVmlld0VkaXRvclBhbmVcbiAgICAgICAgICBoZWFkZXJUaXRsZT17bmV3U3RhdGUucmV2aXNpb25UaXRsZX1cbiAgICAgICAgICB0ZXh0QnVmZmVyPXt0ZXh0QnVmZmVyfVxuICAgICAgICAgIGZpbGVQYXRoPXtmaWxlUGF0aH1cbiAgICAgICAgICBvZmZzZXRzPXtuZXdTdGF0ZS5vZmZzZXRzfVxuICAgICAgICAgIGhpZ2hsaWdodGVkTGluZXM9e25ld1N0YXRlLmhpZ2hsaWdodGVkTGluZXN9XG4gICAgICAgICAgaW5pdGlhbFRleHRDb250ZW50PXtuZXdTdGF0ZS50ZXh0fVxuICAgICAgICAgIHNhdmVkQ29udGVudHM9e25ld1N0YXRlLnNhdmVkQ29udGVudHN9XG4gICAgICAgICAgaW5saW5lRWxlbWVudHM9e25ld1N0YXRlLmlubGluZUVsZW1lbnRzfVxuICAgICAgICAgIGhhbmRsZU5ld09mZnNldHM9e3RoaXMuX2hhbmRsZU5ld09mZnNldHN9XG4gICAgICAgICAgb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudD17dGhpcy5fb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudH1cbiAgICAgICAgICByZWFkT25seT17ZmFsc2V9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlTmV3VGV4dEVkaXRvcn1cbiAgICAgICAgLz4sXG4gICAgICAgIHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX25ld0VkaXRvclBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXR1cFN5bmNTY3JvbGwoKTtcbiAgfVxuXG4gIF9yZW5kZXJUaW1lbGluZVZpZXcoKTogdm9pZCB7XG4gICAgdGhpcy5fdGltZWxpbmVDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RGlmZlRpbWVsaW5lVmlld1xuICAgICAgICBkaWZmTW9kZWw9e3RoaXMucHJvcHMuZGlmZk1vZGVsfVxuICAgICAgICBvblNlbGVjdGlvbkNoYW5nZT17dGhpcy5fb25UaW1lbGluZUNoYW5nZVJldmlzaW9ufVxuICAgICAgLz4sXG4gICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9ib3R0b21SaWdodFBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyTmF2aWdhdGlvbigpOiB2b2lkIHtcbiAgICBjb25zdCB7b2xkRWRpdG9yU3RhdGUsIG5ld0VkaXRvclN0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge29mZnNldHM6IG9sZE9mZnNldHMsIGhpZ2hsaWdodGVkTGluZXM6IG9sZExpbmVzLCB0ZXh0OiBvbGRDb250ZW50c30gPSBvbGRFZGl0b3JTdGF0ZTtcbiAgICBjb25zdCB7b2Zmc2V0czogbmV3T2Zmc2V0cywgaGlnaGxpZ2h0ZWRMaW5lczogbmV3TGluZXMsIHRleHQ6IG5ld0NvbnRlbnRzfSA9IG5ld0VkaXRvclN0YXRlO1xuICAgIGNvbnN0IG5hdmlnYXRpb25QYW5lRWxlbWVudCA9IHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX25hdmlnYXRpb25QYW5lKTtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERpZmZOYXZpZ2F0aW9uQmFyXG4gICAgICAgIGVsZW1lbnRIZWlnaHQ9e25hdmlnYXRpb25QYW5lRWxlbWVudC5jbGllbnRIZWlnaHR9XG4gICAgICAgIGFkZGVkTGluZXM9e25ld0xpbmVzLmFkZGVkfVxuICAgICAgICBuZXdPZmZzZXRzPXtuZXdPZmZzZXRzfVxuICAgICAgICBuZXdDb250ZW50cz17bmV3Q29udGVudHN9XG4gICAgICAgIHJlbW92ZWRMaW5lcz17b2xkTGluZXMucmVtb3ZlZH1cbiAgICAgICAgb2xkT2Zmc2V0cz17b2xkT2Zmc2V0c31cbiAgICAgICAgb2xkQ29udGVudHM9e29sZENvbnRlbnRzfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbk5hdmlnYXRpb25DbGlja31cbiAgICAgIC8+LFxuICAgICAgbmF2aWdhdGlvblBhbmVFbGVtZW50LFxuICAgICk7XG4gIH1cblxuICBfb25OYXZpZ2F0aW9uQ2xpY2sobGluZU51bWJlcjogbnVtYmVyLCBpc0FkZGVkTGluZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGNvbnN0IHRleHRFZGl0b3JDb21wb25lbnQgPSBpc0FkZGVkTGluZSA/IHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA6IHRoaXMuX29sZEVkaXRvckNvbXBvbmVudDtcbiAgICBpbnZhcmlhbnQodGV4dEVkaXRvckNvbXBvbmVudCwgJ0RpZmYgVmlldyBOYXZpZ2F0aW9uIEVycm9yOiBOb24gdmFsaWQgdGV4dCBlZGl0b3IgY29tcG9uZW50Jyk7XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IHRleHRFZGl0b3JDb21wb25lbnQuZ2V0RWRpdG9yTW9kZWwoKTtcbiAgICB0ZXh0RWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW2xpbmVOdW1iZXIsIDBdKTtcbiAgfVxuXG4gIF9nZXRQYW5lRWxlbWVudChwYW5lOiBhdG9tJFBhbmUpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIGF0b20udmlld3MuZ2V0VmlldyhwYW5lKS5xdWVyeVNlbGVjdG9yKCcuaXRlbS12aWV3cycpO1xuICB9XG5cbiAgX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZShwYW5lOiBhdG9tJFBhbmUpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHBhbmUuZGVzdHJveSgpO1xuICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBsZXQgdG9vbGJhckNvbXBvbmVudCA9IG51bGw7XG4gICAgaWYgKHRoaXMuc3RhdGUudG9vbGJhclZpc2libGUpIHtcbiAgICAgIGNvbnN0IHt2aWV3TW9kZX0gPSB0aGlzLnByb3BzLmRpZmZNb2RlbC5nZXRTdGF0ZSgpO1xuICAgICAgdG9vbGJhckNvbXBvbmVudCA9IChcbiAgICAgICAgPERpZmZWaWV3VG9vbGJhclxuICAgICAgICAgIGZpbGVQYXRoPXt0aGlzLnN0YXRlLmZpbGVQYXRofVxuICAgICAgICAgIGRpZmZNb2RlPXt2aWV3TW9kZX1cbiAgICAgICAgICBvblN3aXRjaE1vZGU9e3RoaXMuX29uQ2hhbmdlTW9kZX1cbiAgICAgICAgICBvblN3aXRjaFRvRWRpdG9yPXt0aGlzLl9vblN3aXRjaFRvRWRpdG9yfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctY29udGFpbmVyXCI+XG4gICAgICAgIHt0b29sYmFyQ29tcG9uZW50fVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LWNvbXBvbmVudFwiIHJlZj1cInBhbmVDb250YWluZXJcIiAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vblN3aXRjaFRvRWRpdG9yKCk6IHZvaWQge1xuICAgIGNvbnN0IGRpZmZWaWV3Tm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGludmFyaWFudChkaWZmVmlld05vZGUsICdEaWZmIFZpZXcgRE9NIG5lZWRzIHRvIGJlIGF0dGFjaGVkIHRvIHN3aXRjaCB0byBlZGl0b3IgbW9kZScpO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZGlmZlZpZXdOb2RlLCAnbnVjbGlkZS1kaWZmLXZpZXc6c3dpdGNoLXRvLWVkaXRvcicpO1xuICB9XG5cbiAgX2hhbmRsZU5ld09mZnNldHMob2Zmc2V0c0Zyb21Db21wb25lbnRzOiBNYXApOiB2b2lkIHtcbiAgICBjb25zdCBvbGRMaW5lT2Zmc2V0cyA9IG5ldyBNYXAodGhpcy5zdGF0ZS5vbGRFZGl0b3JTdGF0ZS5vZmZzZXRzKTtcbiAgICBjb25zdCBuZXdMaW5lT2Zmc2V0cyA9IG5ldyBNYXAodGhpcy5zdGF0ZS5uZXdFZGl0b3JTdGF0ZS5vZmZzZXRzKTtcbiAgICBvZmZzZXRzRnJvbUNvbXBvbmVudHMuZm9yRWFjaCgob2Zmc2V0QW1vdW50LCByb3cpID0+IHtcbiAgICAgIG5ld0xpbmVPZmZzZXRzLnNldChyb3csIChuZXdMaW5lT2Zmc2V0cy5nZXQocm93KSB8fCAwKSArIG9mZnNldEFtb3VudCk7XG4gICAgICBvbGRMaW5lT2Zmc2V0cy5zZXQocm93LCAob2xkTGluZU9mZnNldHMuZ2V0KHJvdykgfHwgMCkgKyBvZmZzZXRBbW91bnQpO1xuICAgIH0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb2xkRWRpdG9yU3RhdGU6IHsuLi50aGlzLnN0YXRlLm9sZEVkaXRvclN0YXRlLCBvZmZzZXRzOiBvbGRMaW5lT2Zmc2V0c30sXG4gICAgICBuZXdFZGl0b3JTdGF0ZTogey4uLnRoaXMuc3RhdGUubmV3RWRpdG9yU3RhdGUsIG9mZnNldHM6IG5ld0xpbmVPZmZzZXRzfSxcbiAgICB9KTtcbiAgfVxuXG4gIF9vbkNoYW5nZU5ld1RleHRFZGl0b3IobmV3Q29udGVudHM6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldE5ld0NvbnRlbnRzKG5ld0NvbnRlbnRzKTtcbiAgfVxuXG4gIF9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24ocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldFJldmlzaW9uKHJldmlzaW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBsaW5lIGRpZmYgc3RhdGUgb24gYWN0aXZlIGZpbGUgc3RhdGUgY2hhbmdlLlxuICAgKi9cbiAgX3VwZGF0ZUxpbmVEaWZmU3RhdGUoZmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpOiB2b2lkIHtcbiAgICBjb25zdCB7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZENvbnRlbnRzLFxuICAgICAgbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzLFxuICAgICAgaW5saW5lQ29tcG9uZW50cyxcbiAgICAgIGZyb21SZXZpc2lvblRpdGxlLFxuICAgICAgdG9SZXZpc2lvblRpdGxlLFxuICAgIH0gPSBmaWxlU3RhdGU7XG5cbiAgICBjb25zdCB7Y29tcHV0ZURpZmZ9ID0gcmVxdWlyZSgnLi9kaWZmLXV0aWxzJyk7XG4gICAgY29uc3Qge2FkZGVkTGluZXMsIHJlbW92ZWRMaW5lcywgb2xkTGluZU9mZnNldHMsIG5ld0xpbmVPZmZzZXRzfSA9XG4gICAgICBjb21wdXRlRGlmZihvbGRDb250ZW50cywgbmV3Q29udGVudHMpO1xuXG4gICAgY29uc3Qgb2xkRWRpdG9yU3RhdGUgPSB7XG4gICAgICByZXZpc2lvblRpdGxlOiBmcm9tUmV2aXNpb25UaXRsZSxcbiAgICAgIHRleHQ6IG9sZENvbnRlbnRzLFxuICAgICAgb2Zmc2V0czogb2xkTGluZU9mZnNldHMsXG4gICAgICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgICAgIGFkZGVkOiBbXSxcbiAgICAgICAgcmVtb3ZlZDogcmVtb3ZlZExpbmVzLFxuICAgICAgfSxcbiAgICAgIGlubGluZUVsZW1lbnRzOiBpbmxpbmVDb21wb25lbnRzIHx8IFtdLFxuICAgIH07XG4gICAgY29uc3QgbmV3RWRpdG9yU3RhdGUgPSB7XG4gICAgICByZXZpc2lvblRpdGxlOiB0b1JldmlzaW9uVGl0bGUsXG4gICAgICB0ZXh0OiBuZXdDb250ZW50cyxcbiAgICAgIHNhdmVkQ29udGVudHMsXG4gICAgICBvZmZzZXRzOiBuZXdMaW5lT2Zmc2V0cyxcbiAgICAgIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICAgICAgYWRkZWQ6IGFkZGVkTGluZXMsXG4gICAgICAgIHJlbW92ZWQ6IFtdLFxuICAgICAgfSxcbiAgICAgIGlubGluZUVsZW1lbnRzOiBbXSxcbiAgICB9O1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZVBhdGgsXG4gICAgICBvbGRFZGl0b3JTdGF0ZSxcbiAgICAgIG5ld0VkaXRvclN0YXRlLFxuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlZpZXdDb21wb25lbnQ7XG4iXX0=