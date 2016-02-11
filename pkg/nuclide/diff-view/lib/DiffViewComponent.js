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

var _DiffNavigationBar = require('./DiffNavigationBar');

var _DiffNavigationBar2 = _interopRequireDefault(_DiffNavigationBar);

var _commons = require('../../commons');

var _atomHelpers = require('../../atom-helpers');

/* eslint-disable react/prop-types */

var DiffViewComponent = (function (_React$Component) {
  _inherits(DiffViewComponent, _React$Component);

  function DiffViewComponent(props) {
    _classCallCheck(this, DiffViewComponent);

    _get(Object.getPrototypeOf(DiffViewComponent.prototype), 'constructor', this).call(this, props);
    var oldEditorState = {
      text: '',
      offsets: new Map(),
      highlightedLines: {
        added: [],
        removed: []
      },
      inlineElements: []
    };
    var newEditorState = {
      text: '',
      offsets: new Map(),
      highlightedLines: {
        added: [],
        removed: []
      },
      inlineElements: []
    };
    this.state = {
      filePath: '',
      oldEditorState: oldEditorState,
      newEditorState: newEditorState
    };
    this._boundHandleNewOffsets = this._handleNewOffsets.bind(this);
    this._boundUpdateLineDiffState = this._updateLineDiffState.bind(this);
    this._boundOnChangeNewTextEditor = this._onChangeNewTextEditor.bind(this);
    this._boundOnTimelineChangeRevision = this._onTimelineChangeRevision.bind(this);
    this._boundOnNavigationClick = this._onNavigationClick.bind(this);
    this._boundOnDidUpdateTextEditorElement = this._onDidUpdateTextEditorElement.bind(this);
    this._readonlyBuffer = new _atom.TextBuffer();
    this._subscriptions = new _atom.CompositeDisposable();
  }

  _createClass(DiffViewComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var diffModel = this.props.diffModel;

      this._subscriptions.add(diffModel.onActiveFileUpdates(this._boundUpdateLineDiffState));

      this._paneContainer = (0, _atomHelpers.createPaneContainer)();
      // The changed files status tree takes 1/5 of the width and lives on the right most,
      // while being vertically splt with the revision timeline stack pane.
      var treePane = this._treePane = this._paneContainer.getActivePane();
      this._oldEditorPane = treePane.splitLeft({
        copyActiveItem: false,
        flexScale: 2
      });
      this._newEditorPane = treePane.splitLeft({
        copyActiveItem: false,
        flexScale: 2
      });
      this._navigationPane = treePane.splitLeft({
        // The navigation pane sits between the tree and the editors.
        flexScale: 0.08
      });
      this._timelinePane = treePane.splitDown({
        copyActiveItem: false,
        flexScale: 1
      });

      this._renderDiffView();

      _reactForAtom.ReactDOM.findDOMNode(this.refs['paneContainer']).appendChild(atom.views.getView(this._paneContainer));

      this._updateLineDiffState(diffModel.getActiveFileState());
    }
  }, {
    key: '_setupSyncScroll',
    value: function _setupSyncScroll() {
      if (this._oldEditorComponent == null || this._newEditorComponent == null) {
        return;
      }
      (0, _assert2['default'])(this._oldEditorComponent);
      var oldTextEditorElement = this._oldEditorComponent.getEditorDomElement();
      (0, _assert2['default'])(this._newEditorComponent);
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
    key: '_renderDiffView',
    value: function _renderDiffView() {
      this._renderTree();
      this._renderEditors();
      this._renderNavigation();
      this._renderTimeline();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._renderDiffView();
    }
  }, {
    key: '_renderTree',
    value: function _renderTree() {
      (0, _assert2['default'])(this._treePane);
      this._treeComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
        'div',
        { className: "nuclide-diff-view-tree" },
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

      (0, _assert2['default'])(this._oldEditorPane);
      this._oldEditorComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_DiffViewEditorPane2['default'], {
        textBuffer: this._readonlyBuffer,
        filePath: filePath,
        offsets: oldState.offsets,
        highlightedLines: oldState.highlightedLines,
        savedContents: oldState.text,
        initialTextContent: oldState.text,
        inlineElements: oldState.inlineElements,
        handleNewOffsets: this._boundHandleNewOffsets,
        readOnly: true }), this._getPaneElement(this._oldEditorPane));
      var textBuffer = (0, _atomHelpers.bufferForUri)(filePath);
      (0, _assert2['default'])(this._newEditorPane);
      this._newEditorComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_DiffViewEditorPane2['default'], {
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
        onChange: this._boundOnChangeNewTextEditor }), this._getPaneElement(this._newEditorPane));
    }
  }, {
    key: '_onDidUpdateTextEditorElement',
    value: function _onDidUpdateTextEditorElement() {
      this._setupSyncScroll();
    }
  }, {
    key: '_renderTimeline',
    value: function _renderTimeline() {
      (0, _assert2['default'])(this._timelinePane);
      this._timelineComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_DiffTimelineView2['default'], {
        diffModel: this.props.diffModel,
        onSelectionChange: this._boundOnTimelineChangeRevision }), this._getPaneElement(this._timelinePane));
    }
  }, {
    key: '_renderNavigation',
    value: function _renderNavigation() {
      (0, _assert2['default'])(this._navigationPane);
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
        onClick: this._boundOnNavigationClick }), navigationPaneElement);
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
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
      if (this._oldEditorPane) {
        _reactForAtom.ReactDOM.unmountComponentAtNode(this._getPaneElement(this._oldEditorPane));
        this._oldEditorPane = null;
        this._oldEditorComponent = null;
      }
      if (this._newEditorPane) {
        _reactForAtom.ReactDOM.unmountComponentAtNode(this._getPaneElement(this._newEditorPane));
        this._newEditorPane = null;
        this._newEditorComponent = null;
      }
      if (this._treePane) {
        _reactForAtom.ReactDOM.unmountComponentAtNode(this._getPaneElement(this._treePane));
        this._treePane = null;
        this._treeComponent = null;
      }
      if (this._timelinePane) {
        _reactForAtom.ReactDOM.unmountComponentAtNode(this._getPaneElement(this._timelinePane));
        this._timelinePane = null;
        this._timelineComponent = null;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement('div', { className: 'nuclide-diff-view-component', ref: 'paneContainer' });
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
      var oldEditorState = _commons.object.assign({}, this.state.oldEditorState, { offsets: oldLineOffsets });
      var newEditorState = _commons.object.assign({}, this.state.newEditorState, { offsets: newLineOffsets });
      this.setState({
        filePath: this.state.filePath,
        oldEditorState: oldEditorState,
        newEditorState: newEditorState
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
      var oldContents = fileState.oldContents;
      var newContents = fileState.newContents;
      var savedContents = fileState.savedContents;
      var filePath = fileState.filePath;
      var inlineComponents = fileState.inlineComponents;

      var _require = require('./diff-utils');

      var computeDiff = _require.computeDiff;

      var _computeDiff = computeDiff(oldContents, newContents);

      var addedLines = _computeDiff.addedLines;
      var removedLines = _computeDiff.removedLines;
      var oldLineOffsets = _computeDiff.oldLineOffsets;
      var newLineOffsets = _computeDiff.newLineOffsets;

      var oldEditorState = {
        text: oldContents,
        offsets: oldLineOffsets,
        highlightedLines: {
          added: [],
          removed: removedLines
        },
        inlineElements: inlineComponents || []
      };
      var newEditorState = {
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
//# sourceMappingURL=data:application/json;base64,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VztBQUNqQixlQUFPLEVBQUUsY0FBYztBQUN2Qix3QkFBZ0IsRUFBRTtBQUNoQixlQUFLLEVBQUUsRUFBRTtBQUNULGlCQUFPLEVBQUUsWUFBWTtTQUN0QjtBQUNELHNCQUFjLEVBQUUsZ0JBQWdCLElBQUksRUFBRTtPQUN2QyxDQUFDO0FBQ0YsVUFBTSxjQUFjLEdBQUc7QUFDckIsWUFBSSxFQUFFLFdBQVc7QUFDakIscUJBQWEsRUFBYixhQUFhO0FBQ2IsZUFBTyxFQUFFLGNBQWM7QUFDdkIsd0JBQWdCLEVBQUU7QUFDaEIsZUFBSyxFQUFFLFVBQVU7QUFDakIsaUJBQU8sRUFBRSxFQUFFO1NBQ1o7QUFDRCxzQkFBYyxFQUFFLEVBQUU7T0FDbkIsQ0FBQztBQUNGLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixnQkFBUSxFQUFSLFFBQVE7QUFDUixzQkFBYyxFQUFkLGNBQWM7QUFDZCxzQkFBYyxFQUFkLGNBQWM7T0FDZixDQUFDLENBQUM7S0FDSjs7O1NBL1NHLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVM7O0FBa1QvQyxNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkRpZmZWaWV3Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2VTdGF0ZSwgSW5saW5lQ29tcG9uZW50LCBPZmZzZXRNYXB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIFRleHRCdWZmZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgRGlmZlZpZXdFZGl0b3JQYW5lIGZyb20gJy4vRGlmZlZpZXdFZGl0b3JQYW5lJztcbmltcG9ydCBEaWZmVmlld1RyZWUgZnJvbSAnLi9EaWZmVmlld1RyZWUnO1xuaW1wb3J0IFN5bmNTY3JvbGwgZnJvbSAnLi9TeW5jU2Nyb2xsJztcbmltcG9ydCBEaWZmVGltZWxpbmVWaWV3IGZyb20gJy4vRGlmZlRpbWVsaW5lVmlldyc7XG5pbXBvcnQgRGlmZk5hdmlnYXRpb25CYXIgZnJvbSAnLi9EaWZmTmF2aWdhdGlvbkJhcic7XG5pbXBvcnQge29iamVjdH0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge2NyZWF0ZVBhbmVDb250YWluZXJ9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5pbXBvcnQge2J1ZmZlckZvclVyaX0gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcblxudHlwZSBQcm9wcyA9IHtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxudHlwZSBFZGl0b3JTdGF0ZSA9IHtcbiAgdGV4dDogc3RyaW5nO1xuICBzYXZlZENvbnRlbnRzPzogc3RyaW5nO1xuICBvZmZzZXRzOiBPZmZzZXRNYXA7XG4gIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICBhZGRlZDogQXJyYXk8bnVtYmVyPjtcbiAgICByZW1vdmVkOiBBcnJheTxudW1iZXI+O1xuICB9O1xuICBpbmxpbmVFbGVtZW50czogQXJyYXk8SW5saW5lQ29tcG9uZW50Pjtcbn1cblxudHlwZSBTdGF0ZSA9IHtcbiAgZmlsZVBhdGg6IHN0cmluZyxcbiAgb2xkRWRpdG9yU3RhdGU6IEVkaXRvclN0YXRlO1xuICBuZXdFZGl0b3JTdGF0ZTogRWRpdG9yU3RhdGU7XG59O1xuXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5jbGFzcyBEaWZmVmlld0NvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc3luY1Njcm9sbDogU3luY1Njcm9sbDtcbiAgX29sZEVkaXRvclBhbmU6ID9hdG9tJFBhbmU7XG4gIF9vbGRFZGl0b3JDb21wb25lbnQ6ID9EaWZmVmlld0VkaXRvclBhbmU7XG4gIF9uZXdFZGl0b3JQYW5lOiA/YXRvbSRQYW5lO1xuICBfbmV3RWRpdG9yQ29tcG9uZW50OiA/RGlmZlZpZXdFZGl0b3JQYW5lO1xuICBfdGltZWxpbmVQYW5lOiA/YXRvbSRQYW5lO1xuICBfdGltZWxpbmVDb21wb25lbnQ6ID9EaWZmVGltZWxpbmVWaWV3O1xuICBfdHJlZVBhbmU6ID9hdG9tJFBhbmU7XG4gIF90cmVlQ29tcG9uZW50OiA/UmVhY3RDb21wb25lbnQ7XG4gIF9uYXZpZ2F0aW9uUGFuZTogP2F0b20kUGFuZTtcbiAgX25hdmlnYXRpb25Db21wb25lbnQ6ID9EaWZmTmF2aWdhdGlvbkJhcjtcbiAgX3JlYWRvbmx5QnVmZmVyOiBhdG9tJFRleHRCdWZmZXI7XG5cbiAgX2JvdW5kSGFuZGxlTmV3T2Zmc2V0czogRnVuY3Rpb247XG4gIF9ib3VuZFVwZGF0ZUxpbmVEaWZmU3RhdGU6IEZ1bmN0aW9uO1xuICBfYm91bmRPbk5hdmlnYXRpb25DbGljazogRnVuY3Rpb247XG4gIF9ib3VuZE9uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQ6IEZ1bmN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICBjb25zdCBvbGRFZGl0b3JTdGF0ZSA9IHtcbiAgICAgIHRleHQ6ICcnLFxuICAgICAgb2Zmc2V0czogbmV3IE1hcCgpLFxuICAgICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgICBhZGRlZDogW10sXG4gICAgICAgIHJlbW92ZWQ6IFtdLFxuICAgICAgfSxcbiAgICAgIGlubGluZUVsZW1lbnRzOiBbXSxcbiAgICB9O1xuICAgIGNvbnN0IG5ld0VkaXRvclN0YXRlID0ge1xuICAgICAgdGV4dDogJycsXG4gICAgICBvZmZzZXRzOiBuZXcgTWFwKCksXG4gICAgICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgICAgIGFkZGVkOiBbXSxcbiAgICAgICAgcmVtb3ZlZDogW10sXG4gICAgICB9LFxuICAgICAgaW5saW5lRWxlbWVudHM6IFtdLFxuICAgIH07XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGZpbGVQYXRoOiAnJyxcbiAgICAgIG9sZEVkaXRvclN0YXRlLFxuICAgICAgbmV3RWRpdG9yU3RhdGUsXG4gICAgfTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZU5ld09mZnNldHMgPSB0aGlzLl9oYW5kbGVOZXdPZmZzZXRzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRVcGRhdGVMaW5lRGlmZlN0YXRlID0gdGhpcy5fdXBkYXRlTGluZURpZmZTdGF0ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kT25DaGFuZ2VOZXdUZXh0RWRpdG9yID0gdGhpcy5fb25DaGFuZ2VOZXdUZXh0RWRpdG9yLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRPblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24gPSB0aGlzLl9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZE9uTmF2aWdhdGlvbkNsaWNrID0gdGhpcy5fb25OYXZpZ2F0aW9uQ2xpY2suYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZE9uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQgPSB0aGlzLl9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fcmVhZG9ubHlCdWZmZXIgPSBuZXcgVGV4dEJ1ZmZlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSB0aGlzLnByb3BzO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGRpZmZNb2RlbC5vbkFjdGl2ZUZpbGVVcGRhdGVzKHRoaXMuX2JvdW5kVXBkYXRlTGluZURpZmZTdGF0ZSkpO1xuXG4gICAgdGhpcy5fcGFuZUNvbnRhaW5lciA9IGNyZWF0ZVBhbmVDb250YWluZXIoKTtcbiAgICAvLyBUaGUgY2hhbmdlZCBmaWxlcyBzdGF0dXMgdHJlZSB0YWtlcyAxLzUgb2YgdGhlIHdpZHRoIGFuZCBsaXZlcyBvbiB0aGUgcmlnaHQgbW9zdCxcbiAgICAvLyB3aGlsZSBiZWluZyB2ZXJ0aWNhbGx5IHNwbHQgd2l0aCB0aGUgcmV2aXNpb24gdGltZWxpbmUgc3RhY2sgcGFuZS5cbiAgICBjb25zdCB0cmVlUGFuZSA9IHRoaXMuX3RyZWVQYW5lID0gdGhpcy5fcGFuZUNvbnRhaW5lci5nZXRBY3RpdmVQYW5lKCk7XG4gICAgdGhpcy5fb2xkRWRpdG9yUGFuZSA9IHRyZWVQYW5lLnNwbGl0TGVmdCh7XG4gICAgICBjb3B5QWN0aXZlSXRlbTogZmFsc2UsXG4gICAgICBmbGV4U2NhbGU6IDIsXG4gICAgfSk7XG4gICAgdGhpcy5fbmV3RWRpdG9yUGFuZSA9IHRyZWVQYW5lLnNwbGl0TGVmdCh7XG4gICAgICBjb3B5QWN0aXZlSXRlbTogZmFsc2UsXG4gICAgICBmbGV4U2NhbGU6IDIsXG4gICAgfSk7XG4gICAgdGhpcy5fbmF2aWdhdGlvblBhbmUgPSB0cmVlUGFuZS5zcGxpdExlZnQoe1xuICAgICAgLy8gVGhlIG5hdmlnYXRpb24gcGFuZSBzaXRzIGJldHdlZW4gdGhlIHRyZWUgYW5kIHRoZSBlZGl0b3JzLlxuICAgICAgZmxleFNjYWxlOiAwLjA4LFxuICAgIH0pO1xuICAgIHRoaXMuX3RpbWVsaW5lUGFuZSA9IHRyZWVQYW5lLnNwbGl0RG93bih7XG4gICAgICBjb3B5QWN0aXZlSXRlbTogZmFsc2UsXG4gICAgICBmbGV4U2NhbGU6IDEsXG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZW5kZXJEaWZmVmlldygpO1xuXG4gICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydwYW5lQ29udGFpbmVyJ10pLmFwcGVuZENoaWxkKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX3BhbmVDb250YWluZXIpLFxuICAgICk7XG5cbiAgICB0aGlzLl91cGRhdGVMaW5lRGlmZlN0YXRlKGRpZmZNb2RlbC5nZXRBY3RpdmVGaWxlU3RhdGUoKSk7XG4gIH1cblxuICBfc2V0dXBTeW5jU2Nyb2xsKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9vbGRFZGl0b3JDb21wb25lbnQgPT0gbnVsbCB8fCB0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbnZhcmlhbnQodGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50KTtcbiAgICBjb25zdCBvbGRUZXh0RWRpdG9yRWxlbWVudCA9IHRoaXMuX29sZEVkaXRvckNvbXBvbmVudC5nZXRFZGl0b3JEb21FbGVtZW50KCk7XG4gICAgaW52YXJpYW50KHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCk7XG4gICAgY29uc3QgbmV3VGV4dEVkaXRvckVsZW1lbnQgPSB0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQuZ2V0RWRpdG9yRG9tRWxlbWVudCgpO1xuICAgIGNvbnN0IHN5bmNTY3JvbGwgPSB0aGlzLl9zeW5jU2Nyb2xsO1xuICAgIGlmIChzeW5jU2Nyb2xsICE9IG51bGwpIHtcbiAgICAgIHN5bmNTY3JvbGwuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5yZW1vdmUoc3luY1Njcm9sbCk7XG4gICAgfVxuICAgIHRoaXMuX3N5bmNTY3JvbGwgPSBuZXcgU3luY1Njcm9sbChcbiAgICAgIG9sZFRleHRFZGl0b3JFbGVtZW50LFxuICAgICAgbmV3VGV4dEVkaXRvckVsZW1lbnQsXG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZCh0aGlzLl9zeW5jU2Nyb2xsKTtcbiAgfVxuXG4gIF9yZW5kZXJEaWZmVmlldygpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW5kZXJUcmVlKCk7XG4gICAgdGhpcy5fcmVuZGVyRWRpdG9ycygpO1xuICAgIHRoaXMuX3JlbmRlck5hdmlnYXRpb24oKTtcbiAgICB0aGlzLl9yZW5kZXJUaW1lbGluZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlckRpZmZWaWV3KCk7XG4gIH1cblxuICBfcmVuZGVyVHJlZSgpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fdHJlZVBhbmUpO1xuICAgIHRoaXMuX3RyZWVDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtcIm51Y2xpZGUtZGlmZi12aWV3LXRyZWVcIn0+XG4gICAgICAgICAgPERpZmZWaWV3VHJlZSBkaWZmTW9kZWw9e3RoaXMucHJvcHMuZGlmZk1vZGVsfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICksXG4gICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl90cmVlUGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJFZGl0b3JzKCk6IHZvaWQge1xuICAgIGNvbnN0IHtmaWxlUGF0aCwgb2xkRWRpdG9yU3RhdGU6IG9sZFN0YXRlLCBuZXdFZGl0b3JTdGF0ZTogbmV3U3RhdGV9ID0gdGhpcy5zdGF0ZTtcbiAgICBpbnZhcmlhbnQodGhpcy5fb2xkRWRpdG9yUGFuZSk7XG4gICAgdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgICA8RGlmZlZpZXdFZGl0b3JQYW5lXG4gICAgICAgICAgdGV4dEJ1ZmZlcj17dGhpcy5fcmVhZG9ubHlCdWZmZXJ9XG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e29sZFN0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17b2xkU3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBzYXZlZENvbnRlbnRzPXtvbGRTdGF0ZS50ZXh0fVxuICAgICAgICAgIGluaXRpYWxUZXh0Q29udGVudD17b2xkU3RhdGUudGV4dH1cbiAgICAgICAgICBpbmxpbmVFbGVtZW50cz17b2xkU3RhdGUuaW5saW5lRWxlbWVudHN9XG4gICAgICAgICAgaGFuZGxlTmV3T2Zmc2V0cz17dGhpcy5fYm91bmRIYW5kbGVOZXdPZmZzZXRzfVxuICAgICAgICAgIHJlYWRPbmx5PXt0cnVlfS8+LFxuICAgICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9vbGRFZGl0b3JQYW5lKSxcbiAgICApO1xuICAgIGNvbnN0IHRleHRCdWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIGludmFyaWFudCh0aGlzLl9uZXdFZGl0b3JQYW5lKTtcbiAgICB0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICAgIDxEaWZmVmlld0VkaXRvclBhbmVcbiAgICAgICAgICB0ZXh0QnVmZmVyPXt0ZXh0QnVmZmVyfVxuICAgICAgICAgIGZpbGVQYXRoPXtmaWxlUGF0aH1cbiAgICAgICAgICBvZmZzZXRzPXtuZXdTdGF0ZS5vZmZzZXRzfVxuICAgICAgICAgIGhpZ2hsaWdodGVkTGluZXM9e25ld1N0YXRlLmhpZ2hsaWdodGVkTGluZXN9XG4gICAgICAgICAgaW5pdGlhbFRleHRDb250ZW50PXtuZXdTdGF0ZS50ZXh0fVxuICAgICAgICAgIHNhdmVkQ29udGVudHM9e25ld1N0YXRlLnNhdmVkQ29udGVudHN9XG4gICAgICAgICAgaW5saW5lRWxlbWVudHM9e25ld1N0YXRlLmlubGluZUVsZW1lbnRzfVxuICAgICAgICAgIGhhbmRsZU5ld09mZnNldHM9e3RoaXMuX2JvdW5kSGFuZGxlTmV3T2Zmc2V0c31cbiAgICAgICAgICBvbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50PXt0aGlzLl9ib3VuZE9uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnR9XG4gICAgICAgICAgcmVhZE9ubHk9e2ZhbHNlfVxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9ib3VuZE9uQ2hhbmdlTmV3VGV4dEVkaXRvcn0vPixcbiAgICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fbmV3RWRpdG9yUGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3NldHVwU3luY1Njcm9sbCgpO1xuICB9XG5cbiAgX3JlbmRlclRpbWVsaW5lKCk6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLl90aW1lbGluZVBhbmUpO1xuICAgIHRoaXMuX3RpbWVsaW5lQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERpZmZUaW1lbGluZVZpZXdcbiAgICAgICAgZGlmZk1vZGVsPXt0aGlzLnByb3BzLmRpZmZNb2RlbH1cbiAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2U9e3RoaXMuX2JvdW5kT25UaW1lbGluZUNoYW5nZVJldmlzaW9ufS8+LFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fdGltZWxpbmVQYW5lKSxcbiAgICApO1xuICB9XG5cbiAgX3JlbmRlck5hdmlnYXRpb24oKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX25hdmlnYXRpb25QYW5lKTtcbiAgICBjb25zdCB7b2xkRWRpdG9yU3RhdGUsIG5ld0VkaXRvclN0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge29mZnNldHM6IG9sZE9mZnNldHMsIGhpZ2hsaWdodGVkTGluZXM6IG9sZExpbmVzLCB0ZXh0OiBvbGRDb250ZW50c30gPSBvbGRFZGl0b3JTdGF0ZTtcbiAgICBjb25zdCB7b2Zmc2V0czogbmV3T2Zmc2V0cywgaGlnaGxpZ2h0ZWRMaW5lczogbmV3TGluZXMsIHRleHQ6IG5ld0NvbnRlbnRzfSA9IG5ld0VkaXRvclN0YXRlO1xuICAgIGNvbnN0IG5hdmlnYXRpb25QYW5lRWxlbWVudCA9IHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX25hdmlnYXRpb25QYW5lKTtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERpZmZOYXZpZ2F0aW9uQmFyXG4gICAgICAgIGVsZW1lbnRIZWlnaHQ9e25hdmlnYXRpb25QYW5lRWxlbWVudC5jbGllbnRIZWlnaHR9XG4gICAgICAgIGFkZGVkTGluZXM9e25ld0xpbmVzLmFkZGVkfVxuICAgICAgICBuZXdPZmZzZXRzPXtuZXdPZmZzZXRzfVxuICAgICAgICBuZXdDb250ZW50cz17bmV3Q29udGVudHN9XG4gICAgICAgIHJlbW92ZWRMaW5lcz17b2xkTGluZXMucmVtb3ZlZH1cbiAgICAgICAgb2xkT2Zmc2V0cz17b2xkT2Zmc2V0c31cbiAgICAgICAgb2xkQ29udGVudHM9e29sZENvbnRlbnRzfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9ib3VuZE9uTmF2aWdhdGlvbkNsaWNrfS8+LFxuICAgICAgICBuYXZpZ2F0aW9uUGFuZUVsZW1lbnQsXG4gICAgKTtcbiAgfVxuXG4gIF9vbk5hdmlnYXRpb25DbGljayhsaW5lTnVtYmVyOiBudW1iZXIsIGlzQWRkZWRMaW5lOiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgdGV4dEVkaXRvckNvbXBvbmVudCA9IGlzQWRkZWRMaW5lID8gdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50IDogdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50O1xuICAgIGludmFyaWFudCh0ZXh0RWRpdG9yQ29tcG9uZW50LCAnRGlmZiBWaWV3IE5hdmlnYXRpb24gRXJyb3I6IE5vbiB2YWxpZCB0ZXh0IGVkaXRvciBjb21wb25lbnQnKTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGV4dEVkaXRvckNvbXBvbmVudC5nZXRFZGl0b3JNb2RlbCgpO1xuICAgIHRleHRFZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbbGluZU51bWJlciwgMF0pO1xuICB9XG5cbiAgX2dldFBhbmVFbGVtZW50KHBhbmU6IGF0b20kUGFuZSk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gYXRvbS52aWV3cy5nZXRWaWV3KHBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5fb2xkRWRpdG9yUGFuZSkge1xuICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9vbGRFZGl0b3JQYW5lKSk7XG4gICAgICB0aGlzLl9vbGRFZGl0b3JQYW5lID0gbnVsbDtcbiAgICAgIHRoaXMuX29sZEVkaXRvckNvbXBvbmVudCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9uZXdFZGl0b3JQYW5lKSB7XG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX25ld0VkaXRvclBhbmUpKTtcbiAgICAgIHRoaXMuX25ld0VkaXRvclBhbmUgPSBudWxsO1xuICAgICAgdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50ID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3RyZWVQYW5lKSB7XG4gICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX3RyZWVQYW5lKSk7XG4gICAgICB0aGlzLl90cmVlUGFuZSA9IG51bGw7XG4gICAgICB0aGlzLl90cmVlQ29tcG9uZW50ID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3RpbWVsaW5lUGFuZSkge1xuICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl90aW1lbGluZVBhbmUpKTtcbiAgICAgIHRoaXMuX3RpbWVsaW5lUGFuZSA9IG51bGw7XG4gICAgICB0aGlzLl90aW1lbGluZUNvbXBvbmVudCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctY29tcG9uZW50XCIgcmVmPVwicGFuZUNvbnRhaW5lclwiIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVOZXdPZmZzZXRzKG9mZnNldHNGcm9tQ29tcG9uZW50czogTWFwKTogdm9pZCB7XG4gICAgY29uc3Qgb2xkTGluZU9mZnNldHMgPSBuZXcgTWFwKHRoaXMuc3RhdGUub2xkRWRpdG9yU3RhdGUub2Zmc2V0cyk7XG4gICAgY29uc3QgbmV3TGluZU9mZnNldHMgPSBuZXcgTWFwKHRoaXMuc3RhdGUubmV3RWRpdG9yU3RhdGUub2Zmc2V0cyk7XG4gICAgb2Zmc2V0c0Zyb21Db21wb25lbnRzLmZvckVhY2goKG9mZnNldEFtb3VudCwgcm93KSA9PiB7XG4gICAgICBuZXdMaW5lT2Zmc2V0cy5zZXQocm93LCAobmV3TGluZU9mZnNldHMuZ2V0KHJvdykgfHwgMCkgKyBvZmZzZXRBbW91bnQpO1xuICAgICAgb2xkTGluZU9mZnNldHMuc2V0KHJvdywgKG9sZExpbmVPZmZzZXRzLmdldChyb3cpIHx8IDApICsgb2Zmc2V0QW1vdW50KTtcbiAgICB9KTtcbiAgICBjb25zdCBvbGRFZGl0b3JTdGF0ZSA9IG9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUub2xkRWRpdG9yU3RhdGUsIHtvZmZzZXRzOiBvbGRMaW5lT2Zmc2V0c30pO1xuICAgIGNvbnN0IG5ld0VkaXRvclN0YXRlID0gb2JqZWN0LmFzc2lnbih7fSwgdGhpcy5zdGF0ZS5uZXdFZGl0b3JTdGF0ZSwge29mZnNldHM6IG5ld0xpbmVPZmZzZXRzfSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlUGF0aDogdGhpcy5zdGF0ZS5maWxlUGF0aCxcbiAgICAgIG9sZEVkaXRvclN0YXRlLFxuICAgICAgbmV3RWRpdG9yU3RhdGUsXG4gICAgfSk7XG4gIH1cblxuICBfb25DaGFuZ2VOZXdUZXh0RWRpdG9yKG5ld0NvbnRlbnRzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5zZXROZXdDb250ZW50cyhuZXdDb250ZW50cyk7XG4gIH1cblxuICBfb25UaW1lbGluZUNoYW5nZVJldmlzaW9uKHJldmlzaW9uOiBSZXZpc2lvbkluZm8pOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5zZXRSZXZpc2lvbihyZXZpc2lvbik7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgbGluZSBkaWZmIHN0YXRlIG9uIGFjdGl2ZSBmaWxlIHN0YXRlIGNoYW5nZS5cbiAgICovXG4gIF91cGRhdGVMaW5lRGlmZlN0YXRlKGZpbGVTdGF0ZTogRmlsZUNoYW5nZVN0YXRlKTogdm9pZCB7XG4gICAgY29uc3Qge29sZENvbnRlbnRzLCBuZXdDb250ZW50cywgc2F2ZWRDb250ZW50cywgZmlsZVBhdGgsIGlubGluZUNvbXBvbmVudHN9ID0gZmlsZVN0YXRlO1xuXG4gICAgY29uc3Qge2NvbXB1dGVEaWZmfSA9IHJlcXVpcmUoJy4vZGlmZi11dGlscycpO1xuICAgIGNvbnN0IHthZGRlZExpbmVzLCByZW1vdmVkTGluZXMsIG9sZExpbmVPZmZzZXRzLCBuZXdMaW5lT2Zmc2V0c30gPVxuICAgICAgY29tcHV0ZURpZmYob2xkQ29udGVudHMsIG5ld0NvbnRlbnRzKTtcblxuICAgIGNvbnN0IG9sZEVkaXRvclN0YXRlID0ge1xuICAgICAgdGV4dDogb2xkQ29udGVudHMsXG4gICAgICBvZmZzZXRzOiBvbGRMaW5lT2Zmc2V0cyxcbiAgICAgIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICAgICAgYWRkZWQ6IFtdLFxuICAgICAgICByZW1vdmVkOiByZW1vdmVkTGluZXMsXG4gICAgICB9LFxuICAgICAgaW5saW5lRWxlbWVudHM6IGlubGluZUNvbXBvbmVudHMgfHwgW10sXG4gICAgfTtcbiAgICBjb25zdCBuZXdFZGl0b3JTdGF0ZSA9IHtcbiAgICAgIHRleHQ6IG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICAgIG9mZnNldHM6IG5ld0xpbmVPZmZzZXRzLFxuICAgICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgICBhZGRlZDogYWRkZWRMaW5lcyxcbiAgICAgICAgcmVtb3ZlZDogW10sXG4gICAgICB9LFxuICAgICAgaW5saW5lRWxlbWVudHM6IFtdLFxuICAgIH07XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZEVkaXRvclN0YXRlLFxuICAgICAgbmV3RWRpdG9yU3RhdGUsXG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld0NvbXBvbmVudDtcbiJdfQ==