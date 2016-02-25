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
    this._boundHandleNewOffsets = this._handleNewOffsets.bind(this);
    this._boundUpdateLineDiffState = this._updateLineDiffState.bind(this);
    this._onChangeNewTextEditor = this._onChangeNewTextEditor.bind(this);
    this._onTimelineChangeRevision = this._onTimelineChangeRevision.bind(this);
    this._boundOnNavigationClick = this._onNavigationClick.bind(this);
    this._boundOnDidUpdateTextEditorElement = this._onDidUpdateTextEditorElement.bind(this);
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

      this._subscriptions.add(diffModel.onActiveFileUpdates(this._boundUpdateLineDiffState));

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
      this.setState({ mode: mode });
    }
  }, {
    key: '_renderDiffView',
    value: function _renderDiffView() {
      this._renderTree();
      this._renderEditors();
      this._renderNavigation();
      this._renderBottomRightPane(this.state.mode);
    }
  }, {
    key: '_renderBottomRightPane',
    value: function _renderBottomRightPane(mode) {
      switch (mode) {
        case _constants.DiffMode.BROWSE_MODE:
          this._renderTimelineView();
          this._commitComponent = null;
          break;
        case _constants.DiffMode.COMMIT_MODE:
          this._renderCommitView();
          this._timelineComponent = null;
          break;
        default:
          throw new Error('Invalid Diff Mode: ' + mode);
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
        handleNewOffsets: this._boundHandleNewOffsets,
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
        handleNewOffsets: this._boundHandleNewOffsets,
        onDidUpdateTextEditorElement: this._boundOnDidUpdateTextEditorElement,
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
        onClick: this._boundOnNavigationClick
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
        toolbarComponent = _reactForAtom.React.createElement(_DiffViewToolbar2['default'], {
          filePath: this.state.filePath,
          diffMode: this.state.mode,
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
//# sourceMappingURL=data:application/json;base64,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VUFBRSxjQUFjLGdCQUFkLGNBQWM7VUFBRSxjQUFjLGdCQUFkLGNBQWM7O0FBRy9ELFVBQU0sY0FBYyxHQUFHO0FBQ3JCLHFCQUFhLEVBQUUsaUJBQWlCO0FBQ2hDLFlBQUksRUFBRSxXQUFXO0FBQ2pCLGVBQU8sRUFBRSxjQUFjO0FBQ3ZCLHdCQUFnQixFQUFFO0FBQ2hCLGVBQUssRUFBRSxFQUFFO0FBQ1QsaUJBQU8sRUFBRSxZQUFZO1NBQ3RCO0FBQ0Qsc0JBQWMsRUFBRSxnQkFBZ0IsSUFBSSxFQUFFO09BQ3ZDLENBQUM7QUFDRixVQUFNLGNBQWMsR0FBRztBQUNyQixxQkFBYSxFQUFFLGVBQWU7QUFDOUIsWUFBSSxFQUFFLFdBQVc7QUFDakIscUJBQWEsRUFBYixhQUFhO0FBQ2IsZUFBTyxFQUFFLGNBQWM7QUFDdkIsd0JBQWdCLEVBQUU7QUFDaEIsZUFBSyxFQUFFLFVBQVU7QUFDakIsaUJBQU8sRUFBRSxFQUFFO1NBQ1o7QUFDRCxzQkFBYyxFQUFFLEVBQUU7T0FDbkIsQ0FBQztBQUNGLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixnQkFBUSxFQUFSLFFBQVE7QUFDUixzQkFBYyxFQUFkLGNBQWM7QUFDZCxzQkFBYyxFQUFkLGNBQWM7T0FDZixDQUFDLENBQUM7S0FDSjs7O1NBdFZHLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVM7O0FBeVYvQyxNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkRpZmZWaWV3Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2VTdGF0ZSwgSW5saW5lQ29tcG9uZW50LCBPZmZzZXRNYXAsIERpZmZNb2RlVHlwZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL2hnLWNvbnN0YW50cyc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSwgVGV4dEJ1ZmZlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBEaWZmVmlld0VkaXRvclBhbmUgZnJvbSAnLi9EaWZmVmlld0VkaXRvclBhbmUnO1xuaW1wb3J0IERpZmZWaWV3VHJlZSBmcm9tICcuL0RpZmZWaWV3VHJlZSc7XG5pbXBvcnQgU3luY1Njcm9sbCBmcm9tICcuL1N5bmNTY3JvbGwnO1xuaW1wb3J0IERpZmZUaW1lbGluZVZpZXcgZnJvbSAnLi9EaWZmVGltZWxpbmVWaWV3JztcbmltcG9ydCBEaWZmVmlld1Rvb2xiYXIgZnJvbSAnLi9EaWZmVmlld1Rvb2xiYXInO1xuaW1wb3J0IERpZmZOYXZpZ2F0aW9uQmFyIGZyb20gJy4vRGlmZk5hdmlnYXRpb25CYXInO1xuaW1wb3J0IERpZmZDb21taXRWaWV3IGZyb20gJy4vRGlmZkNvbW1pdFZpZXcnO1xuaW1wb3J0IHtjcmVhdGVQYW5lQ29udGFpbmVyfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtidWZmZXJGb3JVcml9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5pbXBvcnQge0RpZmZNb2RlfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9mZWF0dXJlLWNvbmZpZyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGRpZmZNb2RlbDogRGlmZlZpZXdNb2RlbDtcbn07XG5cbnR5cGUgRWRpdG9yU3RhdGUgPSB7XG4gIHJldmlzaW9uVGl0bGU6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBzYXZlZENvbnRlbnRzPzogc3RyaW5nO1xuICBvZmZzZXRzOiBPZmZzZXRNYXA7XG4gIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICBhZGRlZDogQXJyYXk8bnVtYmVyPjtcbiAgICByZW1vdmVkOiBBcnJheTxudW1iZXI+O1xuICB9O1xuICBpbmxpbmVFbGVtZW50czogQXJyYXk8SW5saW5lQ29tcG9uZW50Pjtcbn1cblxudHlwZSBTdGF0ZSA9IHtcbiAgbW9kZTogRGlmZk1vZGVUeXBlO1xuICBmaWxlUGF0aDogTnVjbGlkZVVyaTtcbiAgb2xkRWRpdG9yU3RhdGU6IEVkaXRvclN0YXRlO1xuICBuZXdFZGl0b3JTdGF0ZTogRWRpdG9yU3RhdGU7XG4gIHRvb2xiYXJWaXNpYmxlOiBib29sZWFuO1xufTtcblxuZnVuY3Rpb24gaW5pdGlhbEVkaXRvclN0YXRlKCk6IEVkaXRvclN0YXRlIHtcbiAgcmV0dXJuIHtcbiAgICByZXZpc2lvblRpdGxlOiAnJyxcbiAgICB0ZXh0OiAnJyxcbiAgICBvZmZzZXRzOiBuZXcgTWFwKCksXG4gICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgYWRkZWQ6IFtdLFxuICAgICAgcmVtb3ZlZDogW10sXG4gICAgfSxcbiAgICBpbmxpbmVFbGVtZW50czogW10sXG4gIH07XG59XG5cbmNvbnN0IEVNUFRZX0ZVTkNUSU9OID0gKCkgPT4ge307XG5jb25zdCBUT09MQkFSX1ZJU0lCTEVfU0VUVElORyA9ICdudWNsaWRlLWRpZmYtdmlldy50b29sYmFyVmlzaWJsZSc7XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmNsYXNzIERpZmZWaWV3Q29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9zeW5jU2Nyb2xsOiBTeW5jU2Nyb2xsO1xuICBfb2xkRWRpdG9yUGFuZTogYXRvbSRQYW5lO1xuICBfb2xkRWRpdG9yQ29tcG9uZW50OiBEaWZmVmlld0VkaXRvclBhbmU7XG4gIF9wYW5lQ29udGFpbmVyOiBPYmplY3Q7XG4gIF9uZXdFZGl0b3JQYW5lOiBhdG9tJFBhbmU7XG4gIF9uZXdFZGl0b3JDb21wb25lbnQ6IERpZmZWaWV3RWRpdG9yUGFuZTtcbiAgX2JvdHRvbVJpZ2h0UGFuZTogYXRvbSRQYW5lO1xuICBfdGltZWxpbmVDb21wb25lbnQ6ID9EaWZmVGltZWxpbmVWaWV3O1xuICBfdHJlZVBhbmU6IGF0b20kUGFuZTtcbiAgX3RyZWVDb21wb25lbnQ6IFJlYWN0Q29tcG9uZW50O1xuICBfbmF2aWdhdGlvblBhbmU6IGF0b20kUGFuZTtcbiAgX25hdmlnYXRpb25Db21wb25lbnQ6IERpZmZOYXZpZ2F0aW9uQmFyO1xuICBfY29tbWl0Q29tcG9uZW50OiA/RGlmZkNvbW1pdFZpZXc7XG4gIF9yZWFkb25seUJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyO1xuXG4gIF9ib3VuZEhhbmRsZU5ld09mZnNldHM6IEZ1bmN0aW9uO1xuICBfYm91bmRVcGRhdGVMaW5lRGlmZlN0YXRlOiBGdW5jdGlvbjtcbiAgX2JvdW5kT25OYXZpZ2F0aW9uQ2xpY2s6IEZ1bmN0aW9uO1xuICBfYm91bmRPbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50OiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgY29uc3QgdG9vbGJhclZpc2libGUgPSAoKGZlYXR1cmVDb25maWcuZ2V0KFRPT0xCQVJfVklTSUJMRV9TRVRUSU5HKTogYW55KTogYm9vbGVhbik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG1vZGU6IERpZmZNb2RlLkJST1dTRV9NT0RFLFxuICAgICAgZmlsZVBhdGg6ICcnLFxuICAgICAgdG9vbGJhclZpc2libGUsXG4gICAgICBvbGRFZGl0b3JTdGF0ZTogaW5pdGlhbEVkaXRvclN0YXRlKCksXG4gICAgICBuZXdFZGl0b3JTdGF0ZTogaW5pdGlhbEVkaXRvclN0YXRlKCksXG4gICAgfTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZU5ld09mZnNldHMgPSB0aGlzLl9oYW5kbGVOZXdPZmZzZXRzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRVcGRhdGVMaW5lRGlmZlN0YXRlID0gdGhpcy5fdXBkYXRlTGluZURpZmZTdGF0ZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNoYW5nZU5ld1RleHRFZGl0b3IgPSB0aGlzLl9vbkNoYW5nZU5ld1RleHRFZGl0b3IuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25UaW1lbGluZUNoYW5nZVJldmlzaW9uID0gdGhpcy5fb25UaW1lbGluZUNoYW5nZVJldmlzaW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRPbk5hdmlnYXRpb25DbGljayA9IHRoaXMuX29uTmF2aWdhdGlvbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRPbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5fb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNoYW5nZU1vZGUgPSB0aGlzLl9vbkNoYW5nZU1vZGUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25Td2l0Y2hUb0VkaXRvciA9IHRoaXMuX29uU3dpdGNoVG9FZGl0b3IuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZWFkb25seUJ1ZmZlciA9IG5ldyBUZXh0QnVmZmVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZmVhdHVyZUNvbmZpZy5vYnNlcnZlKFRPT0xCQVJfVklTSUJMRV9TRVRUSU5HLCB0b29sYmFyVmlzaWJsZSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt0b29sYmFyVmlzaWJsZX0pO1xuICAgIH0pKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChkaWZmTW9kZWwub25BY3RpdmVGaWxlVXBkYXRlcyh0aGlzLl9ib3VuZFVwZGF0ZUxpbmVEaWZmU3RhdGUpKTtcblxuICAgIHRoaXMuX3BhbmVDb250YWluZXIgPSBjcmVhdGVQYW5lQ29udGFpbmVyKCk7XG4gICAgLy8gVGhlIGNoYW5nZWQgZmlsZXMgc3RhdHVzIHRyZWUgdGFrZXMgMS81IG9mIHRoZSB3aWR0aCBhbmQgbGl2ZXMgb24gdGhlIHJpZ2h0IG1vc3QsXG4gICAgLy8gd2hpbGUgYmVpbmcgdmVydGljYWxseSBzcGx0IHdpdGggdGhlIHJldmlzaW9uIHRpbWVsaW5lIHN0YWNrIHBhbmUuXG4gICAgY29uc3QgdG9wUGFuZSA9IHRoaXMuX25ld0VkaXRvclBhbmUgPSB0aGlzLl9wYW5lQ29udGFpbmVyLmdldEFjdGl2ZVBhbmUoKTtcbiAgICB0aGlzLl9ib3R0b21SaWdodFBhbmUgPSB0b3BQYW5lLnNwbGl0RG93bih7XG4gICAgICBmbGV4U2NhbGU6IDAuMyxcbiAgICB9KTtcbiAgICB0aGlzLl90cmVlUGFuZSA9IHRoaXMuX2JvdHRvbVJpZ2h0UGFuZS5zcGxpdExlZnQoe1xuICAgICAgZmxleFNjYWxlOiAwLjM1LFxuICAgIH0pO1xuICAgIHRoaXMuX25hdmlnYXRpb25QYW5lID0gdG9wUGFuZS5zcGxpdFJpZ2h0KHtcbiAgICAgIGZsZXhTY2FsZTogMC4wNDUsXG4gICAgfSk7XG4gICAgdGhpcy5fb2xkRWRpdG9yUGFuZSA9IHRvcFBhbmUuc3BsaXRMZWZ0KHtcbiAgICAgIGZsZXhTY2FsZTogMSxcbiAgICB9KTtcblxuICAgIHRoaXMuX3JlbmRlckRpZmZWaWV3KCk7XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl9vbGRFZGl0b3JQYW5lLCB0cnVlKSxcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl9uZXdFZGl0b3JQYW5lLCB0cnVlKSxcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl9uYXZpZ2F0aW9uUGFuZSwgdHJ1ZSksXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fdHJlZVBhbmUsIHRydWUpLFxuICAgICAgdGhpcy5fZGVzdHJveVBhbmVEaXNwb3NhYmxlKHRoaXMuX2JvdHRvbVJpZ2h0UGFuZSksXG4gICAgKTtcblxuICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1sncGFuZUNvbnRhaW5lciddKS5hcHBlbmRDaGlsZChcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9wYW5lQ29udGFpbmVyKSxcbiAgICApO1xuXG4gICAgdGhpcy5fdXBkYXRlTGluZURpZmZTdGF0ZShkaWZmTW9kZWwuZ2V0QWN0aXZlRmlsZVN0YXRlKCkpO1xuICB9XG5cbiAgX3NldHVwU3luY1Njcm9sbCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50ID09IG51bGwgfHwgdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgb2xkVGV4dEVkaXRvckVsZW1lbnQgPSB0aGlzLl9vbGRFZGl0b3JDb21wb25lbnQuZ2V0RWRpdG9yRG9tRWxlbWVudCgpO1xuICAgIGNvbnN0IG5ld1RleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50LmdldEVkaXRvckRvbUVsZW1lbnQoKTtcbiAgICBjb25zdCBzeW5jU2Nyb2xsID0gdGhpcy5fc3luY1Njcm9sbDtcbiAgICBpZiAoc3luY1Njcm9sbCAhPSBudWxsKSB7XG4gICAgICBzeW5jU2Nyb2xsLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKHN5bmNTY3JvbGwpO1xuICAgIH1cbiAgICB0aGlzLl9zeW5jU2Nyb2xsID0gbmV3IFN5bmNTY3JvbGwoXG4gICAgICBvbGRUZXh0RWRpdG9yRWxlbWVudCxcbiAgICAgIG5ld1RleHRFZGl0b3JFbGVtZW50LFxuICAgICk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fc3luY1Njcm9sbCk7XG4gIH1cblxuICBfb25DaGFuZ2VNb2RlKG1vZGU6IERpZmZNb2RlVHlwZSk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe21vZGV9KTtcbiAgfVxuXG4gIF9yZW5kZXJEaWZmVmlldygpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW5kZXJUcmVlKCk7XG4gICAgdGhpcy5fcmVuZGVyRWRpdG9ycygpO1xuICAgIHRoaXMuX3JlbmRlck5hdmlnYXRpb24oKTtcbiAgICB0aGlzLl9yZW5kZXJCb3R0b21SaWdodFBhbmUodGhpcy5zdGF0ZS5tb2RlKTtcbiAgfVxuXG4gIF9yZW5kZXJCb3R0b21SaWdodFBhbmUobW9kZTogRGlmZk1vZGVUeXBlKTogdm9pZCB7XG4gICAgc3dpdGNoIChtb2RlKSB7XG4gICAgICBjYXNlIERpZmZNb2RlLkJST1dTRV9NT0RFOlxuICAgICAgICB0aGlzLl9yZW5kZXJUaW1lbGluZVZpZXcoKTtcbiAgICAgICAgdGhpcy5fY29tbWl0Q29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIERpZmZNb2RlLkNPTU1JVF9NT0RFOlxuICAgICAgICB0aGlzLl9yZW5kZXJDb21taXRWaWV3KCk7XG4gICAgICAgIHRoaXMuX3RpbWVsaW5lQ29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgRGlmZiBNb2RlOiAke21vZGV9YCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlckRpZmZWaWV3KCk7XG4gIH1cblxuICBfcmVuZGVyQ29tbWl0VmlldygpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21taXRDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RGlmZkNvbW1pdFZpZXcgZGlmZk1vZGVsPXt0aGlzLnByb3BzLmRpZmZNb2RlbH0gLz4sXG4gICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9ib3R0b21SaWdodFBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyVHJlZSgpOiB2b2lkIHtcbiAgICB0aGlzLl90cmVlQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LXRyZWVcIj5cbiAgICAgICAgICA8RGlmZlZpZXdUcmVlIGRpZmZNb2RlbD17dGhpcy5wcm9wcy5kaWZmTW9kZWx9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSxcbiAgICAgIHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX3RyZWVQYW5lKSxcbiAgICApO1xuICB9XG5cbiAgX3JlbmRlckVkaXRvcnMoKTogdm9pZCB7XG4gICAgY29uc3Qge2ZpbGVQYXRoLCBvbGRFZGl0b3JTdGF0ZTogb2xkU3RhdGUsIG5ld0VkaXRvclN0YXRlOiBuZXdTdGF0ZX0gPSB0aGlzLnN0YXRlO1xuICAgIHRoaXMuX29sZEVkaXRvckNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgICAgPERpZmZWaWV3RWRpdG9yUGFuZVxuICAgICAgICAgIGhlYWRlclRpdGxlPXtvbGRTdGF0ZS5yZXZpc2lvblRpdGxlfVxuICAgICAgICAgIHRleHRCdWZmZXI9e3RoaXMuX3JlYWRvbmx5QnVmZmVyfVxuICAgICAgICAgIGZpbGVQYXRoPXtmaWxlUGF0aH1cbiAgICAgICAgICBvZmZzZXRzPXtvbGRTdGF0ZS5vZmZzZXRzfVxuICAgICAgICAgIGhpZ2hsaWdodGVkTGluZXM9e29sZFN0YXRlLmhpZ2hsaWdodGVkTGluZXN9XG4gICAgICAgICAgc2F2ZWRDb250ZW50cz17b2xkU3RhdGUudGV4dH1cbiAgICAgICAgICBpbml0aWFsVGV4dENvbnRlbnQ9e29sZFN0YXRlLnRleHR9XG4gICAgICAgICAgaW5saW5lRWxlbWVudHM9e29sZFN0YXRlLmlubGluZUVsZW1lbnRzfVxuICAgICAgICAgIGhhbmRsZU5ld09mZnNldHM9e3RoaXMuX2JvdW5kSGFuZGxlTmV3T2Zmc2V0c31cbiAgICAgICAgICByZWFkT25seT17dHJ1ZX1cbiAgICAgICAgICBvbkNoYW5nZT17RU1QVFlfRlVOQ1RJT059XG4gICAgICAgICAgb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudD17RU1QVFlfRlVOQ1RJT059XG4gICAgICAgIC8+LFxuICAgICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9vbGRFZGl0b3JQYW5lKSxcbiAgICApO1xuICAgIGNvbnN0IHRleHRCdWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgICAgPERpZmZWaWV3RWRpdG9yUGFuZVxuICAgICAgICAgIGhlYWRlclRpdGxlPXtuZXdTdGF0ZS5yZXZpc2lvblRpdGxlfVxuICAgICAgICAgIHRleHRCdWZmZXI9e3RleHRCdWZmZXJ9XG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e25ld1N0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17bmV3U3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBpbml0aWFsVGV4dENvbnRlbnQ9e25ld1N0YXRlLnRleHR9XG4gICAgICAgICAgc2F2ZWRDb250ZW50cz17bmV3U3RhdGUuc2F2ZWRDb250ZW50c31cbiAgICAgICAgICBpbmxpbmVFbGVtZW50cz17bmV3U3RhdGUuaW5saW5lRWxlbWVudHN9XG4gICAgICAgICAgaGFuZGxlTmV3T2Zmc2V0cz17dGhpcy5fYm91bmRIYW5kbGVOZXdPZmZzZXRzfVxuICAgICAgICAgIG9uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQ9e3RoaXMuX2JvdW5kT25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudH1cbiAgICAgICAgICByZWFkT25seT17ZmFsc2V9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlTmV3VGV4dEVkaXRvcn1cbiAgICAgICAgLz4sXG4gICAgICAgIHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX25ld0VkaXRvclBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXR1cFN5bmNTY3JvbGwoKTtcbiAgfVxuXG4gIF9yZW5kZXJUaW1lbGluZVZpZXcoKTogdm9pZCB7XG4gICAgdGhpcy5fdGltZWxpbmVDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RGlmZlRpbWVsaW5lVmlld1xuICAgICAgICBkaWZmTW9kZWw9e3RoaXMucHJvcHMuZGlmZk1vZGVsfVxuICAgICAgICBvblNlbGVjdGlvbkNoYW5nZT17dGhpcy5fb25UaW1lbGluZUNoYW5nZVJldmlzaW9ufVxuICAgICAgLz4sXG4gICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9ib3R0b21SaWdodFBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyTmF2aWdhdGlvbigpOiB2b2lkIHtcbiAgICBjb25zdCB7b2xkRWRpdG9yU3RhdGUsIG5ld0VkaXRvclN0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge29mZnNldHM6IG9sZE9mZnNldHMsIGhpZ2hsaWdodGVkTGluZXM6IG9sZExpbmVzLCB0ZXh0OiBvbGRDb250ZW50c30gPSBvbGRFZGl0b3JTdGF0ZTtcbiAgICBjb25zdCB7b2Zmc2V0czogbmV3T2Zmc2V0cywgaGlnaGxpZ2h0ZWRMaW5lczogbmV3TGluZXMsIHRleHQ6IG5ld0NvbnRlbnRzfSA9IG5ld0VkaXRvclN0YXRlO1xuICAgIGNvbnN0IG5hdmlnYXRpb25QYW5lRWxlbWVudCA9IHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX25hdmlnYXRpb25QYW5lKTtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERpZmZOYXZpZ2F0aW9uQmFyXG4gICAgICAgIGVsZW1lbnRIZWlnaHQ9e25hdmlnYXRpb25QYW5lRWxlbWVudC5jbGllbnRIZWlnaHR9XG4gICAgICAgIGFkZGVkTGluZXM9e25ld0xpbmVzLmFkZGVkfVxuICAgICAgICBuZXdPZmZzZXRzPXtuZXdPZmZzZXRzfVxuICAgICAgICBuZXdDb250ZW50cz17bmV3Q29udGVudHN9XG4gICAgICAgIHJlbW92ZWRMaW5lcz17b2xkTGluZXMucmVtb3ZlZH1cbiAgICAgICAgb2xkT2Zmc2V0cz17b2xkT2Zmc2V0c31cbiAgICAgICAgb2xkQ29udGVudHM9e29sZENvbnRlbnRzfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9ib3VuZE9uTmF2aWdhdGlvbkNsaWNrfVxuICAgICAgLz4sXG4gICAgICBuYXZpZ2F0aW9uUGFuZUVsZW1lbnQsXG4gICAgKTtcbiAgfVxuXG4gIF9vbk5hdmlnYXRpb25DbGljayhsaW5lTnVtYmVyOiBudW1iZXIsIGlzQWRkZWRMaW5lOiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgdGV4dEVkaXRvckNvbXBvbmVudCA9IGlzQWRkZWRMaW5lID8gdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50IDogdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50O1xuICAgIGludmFyaWFudCh0ZXh0RWRpdG9yQ29tcG9uZW50LCAnRGlmZiBWaWV3IE5hdmlnYXRpb24gRXJyb3I6IE5vbiB2YWxpZCB0ZXh0IGVkaXRvciBjb21wb25lbnQnKTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGV4dEVkaXRvckNvbXBvbmVudC5nZXRFZGl0b3JNb2RlbCgpO1xuICAgIHRleHRFZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbbGluZU51bWJlciwgMF0pO1xuICB9XG5cbiAgX2dldFBhbmVFbGVtZW50KHBhbmU6IGF0b20kUGFuZSk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gYXRvbS52aWV3cy5nZXRWaWV3KHBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJyk7XG4gIH1cblxuICBfZGVzdHJveVBhbmVEaXNwb3NhYmxlKHBhbmU6IGF0b20kUGFuZSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgcGFuZS5kZXN0cm95KCk7XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGxldCB0b29sYmFyQ29tcG9uZW50ID0gbnVsbDtcbiAgICBpZiAodGhpcy5zdGF0ZS50b29sYmFyVmlzaWJsZSkge1xuICAgICAgdG9vbGJhckNvbXBvbmVudCA9IChcbiAgICAgICAgPERpZmZWaWV3VG9vbGJhclxuICAgICAgICAgIGZpbGVQYXRoPXt0aGlzLnN0YXRlLmZpbGVQYXRofVxuICAgICAgICAgIGRpZmZNb2RlPXt0aGlzLnN0YXRlLm1vZGV9XG4gICAgICAgICAgb25Td2l0Y2hNb2RlPXt0aGlzLl9vbkNoYW5nZU1vZGV9XG4gICAgICAgICAgb25Td2l0Y2hUb0VkaXRvcj17dGhpcy5fb25Td2l0Y2hUb0VkaXRvcn1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LWNvbnRhaW5lclwiPlxuICAgICAgICB7dG9vbGJhckNvbXBvbmVudH1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy1jb21wb25lbnRcIiByZWY9XCJwYW5lQ29udGFpbmVyXCIgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfb25Td2l0Y2hUb0VkaXRvcigpOiB2b2lkIHtcbiAgICBjb25zdCBkaWZmVmlld05vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBpbnZhcmlhbnQoZGlmZlZpZXdOb2RlLCAnRGlmZiBWaWV3IERPTSBuZWVkcyB0byBiZSBhdHRhY2hlZCB0byBzd2l0Y2ggdG8gZWRpdG9yIG1vZGUnKTtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGRpZmZWaWV3Tm9kZSwgJ251Y2xpZGUtZGlmZi12aWV3OnN3aXRjaC10by1lZGl0b3InKTtcbiAgfVxuXG4gIF9oYW5kbGVOZXdPZmZzZXRzKG9mZnNldHNGcm9tQ29tcG9uZW50czogTWFwKTogdm9pZCB7XG4gICAgY29uc3Qgb2xkTGluZU9mZnNldHMgPSBuZXcgTWFwKHRoaXMuc3RhdGUub2xkRWRpdG9yU3RhdGUub2Zmc2V0cyk7XG4gICAgY29uc3QgbmV3TGluZU9mZnNldHMgPSBuZXcgTWFwKHRoaXMuc3RhdGUubmV3RWRpdG9yU3RhdGUub2Zmc2V0cyk7XG4gICAgb2Zmc2V0c0Zyb21Db21wb25lbnRzLmZvckVhY2goKG9mZnNldEFtb3VudCwgcm93KSA9PiB7XG4gICAgICBuZXdMaW5lT2Zmc2V0cy5zZXQocm93LCAobmV3TGluZU9mZnNldHMuZ2V0KHJvdykgfHwgMCkgKyBvZmZzZXRBbW91bnQpO1xuICAgICAgb2xkTGluZU9mZnNldHMuc2V0KHJvdywgKG9sZExpbmVPZmZzZXRzLmdldChyb3cpIHx8IDApICsgb2Zmc2V0QW1vdW50KTtcbiAgICB9KTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG9sZEVkaXRvclN0YXRlOiB7Li4udGhpcy5zdGF0ZS5vbGRFZGl0b3JTdGF0ZSwgb2Zmc2V0czogb2xkTGluZU9mZnNldHN9LFxuICAgICAgbmV3RWRpdG9yU3RhdGU6IHsuLi50aGlzLnN0YXRlLm5ld0VkaXRvclN0YXRlLCBvZmZzZXRzOiBuZXdMaW5lT2Zmc2V0c30sXG4gICAgfSk7XG4gIH1cblxuICBfb25DaGFuZ2VOZXdUZXh0RWRpdG9yKG5ld0NvbnRlbnRzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5zZXROZXdDb250ZW50cyhuZXdDb250ZW50cyk7XG4gIH1cblxuICBfb25UaW1lbGluZUNoYW5nZVJldmlzaW9uKHJldmlzaW9uOiBSZXZpc2lvbkluZm8pOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5zZXRSZXZpc2lvbihyZXZpc2lvbik7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgbGluZSBkaWZmIHN0YXRlIG9uIGFjdGl2ZSBmaWxlIHN0YXRlIGNoYW5nZS5cbiAgICovXG4gIF91cGRhdGVMaW5lRGlmZlN0YXRlKGZpbGVTdGF0ZTogRmlsZUNoYW5nZVN0YXRlKTogdm9pZCB7XG4gICAgY29uc3Qge1xuICAgICAgZmlsZVBhdGgsXG4gICAgICBvbGRDb250ZW50cyxcbiAgICAgIG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICAgIGlubGluZUNvbXBvbmVudHMsXG4gICAgICBmcm9tUmV2aXNpb25UaXRsZSxcbiAgICAgIHRvUmV2aXNpb25UaXRsZSxcbiAgICB9ID0gZmlsZVN0YXRlO1xuXG4gICAgY29uc3Qge2NvbXB1dGVEaWZmfSA9IHJlcXVpcmUoJy4vZGlmZi11dGlscycpO1xuICAgIGNvbnN0IHthZGRlZExpbmVzLCByZW1vdmVkTGluZXMsIG9sZExpbmVPZmZzZXRzLCBuZXdMaW5lT2Zmc2V0c30gPVxuICAgICAgY29tcHV0ZURpZmYob2xkQ29udGVudHMsIG5ld0NvbnRlbnRzKTtcblxuICAgIGNvbnN0IG9sZEVkaXRvclN0YXRlID0ge1xuICAgICAgcmV2aXNpb25UaXRsZTogZnJvbVJldmlzaW9uVGl0bGUsXG4gICAgICB0ZXh0OiBvbGRDb250ZW50cyxcbiAgICAgIG9mZnNldHM6IG9sZExpbmVPZmZzZXRzLFxuICAgICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgICBhZGRlZDogW10sXG4gICAgICAgIHJlbW92ZWQ6IHJlbW92ZWRMaW5lcyxcbiAgICAgIH0sXG4gICAgICBpbmxpbmVFbGVtZW50czogaW5saW5lQ29tcG9uZW50cyB8fCBbXSxcbiAgICB9O1xuICAgIGNvbnN0IG5ld0VkaXRvclN0YXRlID0ge1xuICAgICAgcmV2aXNpb25UaXRsZTogdG9SZXZpc2lvblRpdGxlLFxuICAgICAgdGV4dDogbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzLFxuICAgICAgb2Zmc2V0czogbmV3TGluZU9mZnNldHMsXG4gICAgICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgICAgIGFkZGVkOiBhZGRlZExpbmVzLFxuICAgICAgICByZW1vdmVkOiBbXSxcbiAgICAgIH0sXG4gICAgICBpbmxpbmVFbGVtZW50czogW10sXG4gICAgfTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgb2xkRWRpdG9yU3RhdGUsXG4gICAgICBuZXdFZGl0b3JTdGF0ZSxcbiAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpZmZWaWV3Q29tcG9uZW50O1xuIl19