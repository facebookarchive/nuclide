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

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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
  }

  _createClass(DiffViewComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var diffModel = this.props.diffModel;
      var subscriptions = this._subscriptions = new _atom.CompositeDisposable();
      subscriptions.add(diffModel.onActiveFileUpdates(this._boundUpdateLineDiffState));

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

      _reactForAtom2['default'].findDOMNode(this.refs['paneContainer']).appendChild(atom.views.getView(this._paneContainer));

      (0, _assert2['default'])(this._oldEditorComponent);
      var oldTextEditorElement = this._oldEditorComponent.getEditorDomElement();
      (0, _assert2['default'])(this._newEditorComponent);
      var newTextEditorElement = this._newEditorComponent.getEditorDomElement();

      subscriptions.add(new _SyncScroll2['default'](oldTextEditorElement, newTextEditorElement));

      this._updateLineDiffState(diffModel.getActiveFileState());
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
      this._treeComponent = _reactForAtom2['default'].render(_reactForAtom2['default'].createElement(
        'div',
        { className: "nuclide-diff-view-tree" },
        _reactForAtom2['default'].createElement(_DiffViewTree2['default'], { diffModel: this.props.diffModel })
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
      this._oldEditorComponent = _reactForAtom2['default'].render(_reactForAtom2['default'].createElement(_DiffViewEditorPane2['default'], {
        filePath: filePath,
        offsets: oldState.offsets,
        highlightedLines: oldState.highlightedLines,
        initialTextContent: oldState.text,
        inlineElements: oldState.inlineElements,
        handleNewOffsets: this._boundHandleNewOffsets,
        readOnly: true }), this._getPaneElement(this._oldEditorPane));
      (0, _assert2['default'])(this._newEditorPane);
      this._newEditorComponent = _reactForAtom2['default'].render(_reactForAtom2['default'].createElement(_DiffViewEditorPane2['default'], {
        filePath: filePath,
        offsets: newState.offsets,
        highlightedLines: newState.highlightedLines,
        initialTextContent: newState.text,
        inlineElements: newState.inlineElements,
        handleNewOffsets: this._boundHandleNewOffsets,
        readOnly: false,
        onChange: this._boundOnChangeNewTextEditor }), this._getPaneElement(this._newEditorPane));
    }
  }, {
    key: '_renderTimeline',
    value: function _renderTimeline() {
      (0, _assert2['default'])(this._timelinePane);
      this._timelineComponent = _reactForAtom2['default'].render(_reactForAtom2['default'].createElement(_DiffTimelineView2['default'], {
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
      this._navigationComponent = _reactForAtom2['default'].render(_reactForAtom2['default'].createElement(_DiffNavigationBar2['default'], {
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
      if (this._subscriptions) {
        this._subscriptions.dispose();
        this._subscriptions = null;
      }
      if (this._oldEditorPane) {
        _reactForAtom2['default'].unmountComponentAtNode(this._getPaneElement(this._oldEditorPane));
        this._oldEditorPane = null;
        this._oldEditorComponent = null;
      }
      if (this._newEditorPane) {
        _reactForAtom2['default'].unmountComponentAtNode(this._getPaneElement(this._newEditorPane));
        this._newEditorPane = null;
        this._newEditorComponent = null;
      }
      if (this._treePane) {
        _reactForAtom2['default'].unmountComponentAtNode(this._getPaneElement(this._treePane));
        this._treePane = null;
        this._treeComponent = null;
      }
      if (this._timelinePane) {
        _reactForAtom2['default'].unmountComponentAtNode(this._getPaneElement(this._timelinePane));
        this._timelinePane = null;
        this._timelineComponent = null;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom2['default'].createElement('div', { className: 'nuclide-diff-view-component', ref: 'paneContainer' });
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
})(_reactForAtom2['default'].Component);

module.exports = DiffViewComponent;
//# sourceMappingURL=data:application/json;base64,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LGdCQUFnQixHQUFJLFNBQVMsQ0FBN0IsZ0JBQWdCOztxQkFFckMsT0FBTyxDQUFDLGNBQWMsQ0FBQzs7VUFBdEMsV0FBVyxZQUFYLFdBQVc7O3lCQUVoQixXQUFXLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQzs7VUFEaEMsVUFBVSxnQkFBVixVQUFVO1VBQUUsWUFBWSxnQkFBWixZQUFZO1VBQUUsY0FBYyxnQkFBZCxjQUFjO1VBQUUsY0FBYyxnQkFBZCxjQUFjOztBQUcvRCxVQUFNLGNBQWMsR0FBRztBQUNyQixZQUFJLEVBQUUsV0FBVztBQUNqQixlQUFPLEVBQUUsY0FBYztBQUN2Qix3QkFBZ0IsRUFBRTtBQUNoQixlQUFLLEVBQUUsRUFBRTtBQUNULGlCQUFPLEVBQUUsWUFBWTtTQUN0QjtBQUNELHNCQUFjLEVBQUUsZ0JBQWdCLElBQUksRUFBRTtPQUN2QyxDQUFDO0FBQ0YsVUFBTSxjQUFjLEdBQUc7QUFDckIsWUFBSSxFQUFFLFdBQVc7QUFDakIsZUFBTyxFQUFFLGNBQWM7QUFDdkIsd0JBQWdCLEVBQUU7QUFDaEIsZUFBSyxFQUFFLFVBQVU7QUFDakIsaUJBQU8sRUFBRSxFQUFFO1NBQ1o7QUFDRCxzQkFBYyxFQUFFLEVBQUU7T0FDbkIsQ0FBQztBQUNGLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixnQkFBUSxFQUFSLFFBQVE7QUFDUixzQkFBYyxFQUFkLGNBQWM7QUFDZCxzQkFBYyxFQUFkLGNBQWM7T0FDZixDQUFDLENBQUM7S0FDSjs7O1NBelJHLGlCQUFpQjtHQUFTLDBCQUFNLFNBQVM7O0FBNFIvQyxNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkRpZmZWaWV3Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2VTdGF0ZSwgSW5saW5lQ29tcG9uZW50LCBPZmZzZXRNYXB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBEaWZmVmlld0VkaXRvclBhbmUgZnJvbSAnLi9EaWZmVmlld0VkaXRvclBhbmUnO1xuaW1wb3J0IERpZmZWaWV3VHJlZSBmcm9tICcuL0RpZmZWaWV3VHJlZSc7XG5pbXBvcnQgU3luY1Njcm9sbCBmcm9tICcuL1N5bmNTY3JvbGwnO1xuaW1wb3J0IERpZmZUaW1lbGluZVZpZXcgZnJvbSAnLi9EaWZmVGltZWxpbmVWaWV3JztcbmltcG9ydCBEaWZmTmF2aWdhdGlvbkJhciBmcm9tICcuL0RpZmZOYXZpZ2F0aW9uQmFyJztcbmltcG9ydCB7b2JqZWN0fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7Y3JlYXRlUGFuZUNvbnRhaW5lcn0gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcblxudHlwZSBQcm9wcyA9IHtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxudHlwZSBFZGl0b3JTdGF0ZSA9IHtcbiAgdGV4dDogc3RyaW5nO1xuICBvZmZzZXRzOiBPZmZzZXRNYXA7XG4gIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICBhZGRlZDogQXJyYXk8bnVtYmVyPjtcbiAgICByZW1vdmVkOiBBcnJheTxudW1iZXI+O1xuICB9O1xuICBpbmxpbmVFbGVtZW50czogQXJyYXk8SW5saW5lQ29tcG9uZW50Pjtcbn1cblxudHlwZSBTdGF0ZSA9IHtcbiAgZmlsZVBhdGg6IHN0cmluZyxcbiAgb2xkRWRpdG9yU3RhdGU6IEVkaXRvclN0YXRlO1xuICBuZXdFZGl0b3JTdGF0ZTogRWRpdG9yU3RhdGU7XG59O1xuXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5jbGFzcyBEaWZmVmlld0NvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIF9zdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX29sZEVkaXRvclBhbmU6ID9hdG9tJFBhbmU7XG4gIF9vbGRFZGl0b3JDb21wb25lbnQ6ID9EaWZmVmlld0VkaXRvclBhbmU7XG4gIF9uZXdFZGl0b3JQYW5lOiA/YXRvbSRQYW5lO1xuICBfbmV3RWRpdG9yQ29tcG9uZW50OiA/RGlmZlZpZXdFZGl0b3JQYW5lO1xuICBfdGltZWxpbmVQYW5lOiA/YXRvbSRQYW5lO1xuICBfdGltZWxpbmVDb21wb25lbnQ6ID9EaWZmVGltZWxpbmVWaWV3O1xuICBfdHJlZVBhbmU6ID9hdG9tJFBhbmU7XG4gIF90cmVlQ29tcG9uZW50OiA/UmVhY3RDb21wb25lbnQ7XG4gIF9uYXZpZ2F0aW9uUGFuZTogP2F0b20kUGFuZTtcbiAgX25hdmlnYXRpb25Db21wb25lbnQ6ID9EaWZmTmF2aWdhdGlvbkJhcjtcblxuICBfYm91bmRIYW5kbGVOZXdPZmZzZXRzOiBGdW5jdGlvbjtcbiAgX2JvdW5kVXBkYXRlTGluZURpZmZTdGF0ZTogRnVuY3Rpb247XG4gIF9ib3VuZE9uTmF2aWdhdGlvbkNsaWNrOiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgY29uc3Qgb2xkRWRpdG9yU3RhdGUgPSB7XG4gICAgICB0ZXh0OiAnJyxcbiAgICAgIG9mZnNldHM6IG5ldyBNYXAoKSxcbiAgICAgIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICAgICAgYWRkZWQ6IFtdLFxuICAgICAgICByZW1vdmVkOiBbXSxcbiAgICAgIH0sXG4gICAgICBpbmxpbmVFbGVtZW50czogW10sXG4gICAgfTtcbiAgICBjb25zdCBuZXdFZGl0b3JTdGF0ZSA9IHtcbiAgICAgIHRleHQ6ICcnLFxuICAgICAgb2Zmc2V0czogbmV3IE1hcCgpLFxuICAgICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgICBhZGRlZDogW10sXG4gICAgICAgIHJlbW92ZWQ6IFtdLFxuICAgICAgfSxcbiAgICAgIGlubGluZUVsZW1lbnRzOiBbXSxcbiAgICB9O1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBmaWxlUGF0aDogJycsXG4gICAgICBvbGRFZGl0b3JTdGF0ZSxcbiAgICAgIG5ld0VkaXRvclN0YXRlLFxuICAgIH07XG4gICAgdGhpcy5fYm91bmRIYW5kbGVOZXdPZmZzZXRzID0gdGhpcy5faGFuZGxlTmV3T2Zmc2V0cy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kVXBkYXRlTGluZURpZmZTdGF0ZSA9IHRoaXMuX3VwZGF0ZUxpbmVEaWZmU3RhdGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZE9uQ2hhbmdlTmV3VGV4dEVkaXRvciA9IHRoaXMuX29uQ2hhbmdlTmV3VGV4dEVkaXRvci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kT25UaW1lbGluZUNoYW5nZVJldmlzaW9uID0gdGhpcy5fb25UaW1lbGluZUNoYW5nZVJldmlzaW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRPbk5hdmlnYXRpb25DbGljayA9IHRoaXMuX29uTmF2aWdhdGlvbkNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCBkaWZmTW9kZWwgPSB0aGlzLnByb3BzLmRpZmZNb2RlbDtcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoZGlmZk1vZGVsLm9uQWN0aXZlRmlsZVVwZGF0ZXModGhpcy5fYm91bmRVcGRhdGVMaW5lRGlmZlN0YXRlKSk7XG5cbiAgICB0aGlzLl9wYW5lQ29udGFpbmVyID0gY3JlYXRlUGFuZUNvbnRhaW5lcigpO1xuICAgIC8vIFRoZSBjaGFuZ2VkIGZpbGVzIHN0YXR1cyB0cmVlIHRha2VzIDEvNSBvZiB0aGUgd2lkdGggYW5kIGxpdmVzIG9uIHRoZSByaWdodCBtb3N0LFxuICAgIC8vIHdoaWxlIGJlaW5nIHZlcnRpY2FsbHkgc3BsdCB3aXRoIHRoZSByZXZpc2lvbiB0aW1lbGluZSBzdGFjayBwYW5lLlxuICAgIGNvbnN0IHRyZWVQYW5lID0gdGhpcy5fdHJlZVBhbmUgPSB0aGlzLl9wYW5lQ29udGFpbmVyLmdldEFjdGl2ZVBhbmUoKTtcbiAgICB0aGlzLl9vbGRFZGl0b3JQYW5lID0gdHJlZVBhbmUuc3BsaXRMZWZ0KHtcbiAgICAgIGNvcHlBY3RpdmVJdGVtOiBmYWxzZSxcbiAgICAgIGZsZXhTY2FsZTogMixcbiAgICB9KTtcbiAgICB0aGlzLl9uZXdFZGl0b3JQYW5lID0gdHJlZVBhbmUuc3BsaXRMZWZ0KHtcbiAgICAgIGNvcHlBY3RpdmVJdGVtOiBmYWxzZSxcbiAgICAgIGZsZXhTY2FsZTogMixcbiAgICB9KTtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uUGFuZSA9IHRyZWVQYW5lLnNwbGl0TGVmdCh7XG4gICAgICAvLyBUaGUgbmF2aWdhdGlvbiBwYW5lIHNpdHMgYmV0d2VlbiB0aGUgdHJlZSBhbmQgdGhlIGVkaXRvcnMuXG4gICAgICBmbGV4U2NhbGU6IDAuMDgsXG4gICAgfSk7XG4gICAgdGhpcy5fdGltZWxpbmVQYW5lID0gdHJlZVBhbmUuc3BsaXREb3duKHtcbiAgICAgIGNvcHlBY3RpdmVJdGVtOiBmYWxzZSxcbiAgICAgIGZsZXhTY2FsZTogMSxcbiAgICB9KTtcblxuICAgIHRoaXMuX3JlbmRlckRpZmZWaWV3KCk7XG5cbiAgICBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3BhbmVDb250YWluZXInXSkuYXBwZW5kQ2hpbGQoXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fcGFuZUNvbnRhaW5lciksXG4gICAgKTtcblxuICAgIGludmFyaWFudCh0aGlzLl9vbGRFZGl0b3JDb21wb25lbnQpO1xuICAgIGNvbnN0IG9sZFRleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50LmdldEVkaXRvckRvbUVsZW1lbnQoKTtcbiAgICBpbnZhcmlhbnQodGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50KTtcbiAgICBjb25zdCBuZXdUZXh0RWRpdG9yRWxlbWVudCA9IHRoaXMuX25ld0VkaXRvckNvbXBvbmVudC5nZXRFZGl0b3JEb21FbGVtZW50KCk7XG5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChuZXcgU3luY1Njcm9sbChcbiAgICAgICAgb2xkVGV4dEVkaXRvckVsZW1lbnQsXG4gICAgICAgIG5ld1RleHRFZGl0b3JFbGVtZW50LFxuICAgICAgKVxuICAgICk7XG5cbiAgICB0aGlzLl91cGRhdGVMaW5lRGlmZlN0YXRlKGRpZmZNb2RlbC5nZXRBY3RpdmVGaWxlU3RhdGUoKSk7XG4gIH1cblxuICBfcmVuZGVyRGlmZlZpZXcoKTogdm9pZCB7XG4gICAgdGhpcy5fcmVuZGVyVHJlZSgpO1xuICAgIHRoaXMuX3JlbmRlckVkaXRvcnMoKTtcbiAgICB0aGlzLl9yZW5kZXJOYXZpZ2F0aW9uKCk7XG4gICAgdGhpcy5fcmVuZGVyVGltZWxpbmUoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW5kZXJEaWZmVmlldygpO1xuICB9XG5cbiAgX3JlbmRlclRyZWUoKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX3RyZWVQYW5lKTtcbiAgICB0aGlzLl90cmVlQ29tcG9uZW50ID0gUmVhY3QucmVuZGVyKFxuICAgICAgKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17XCJudWNsaWRlLWRpZmYtdmlldy10cmVlXCJ9PlxuICAgICAgICAgIDxEaWZmVmlld1RyZWUgZGlmZk1vZGVsPXt0aGlzLnByb3BzLmRpZmZNb2RlbH0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApLFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fdHJlZVBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyRWRpdG9ycygpOiB2b2lkIHtcbiAgICBjb25zdCB7ZmlsZVBhdGgsIG9sZEVkaXRvclN0YXRlOiBvbGRTdGF0ZSwgbmV3RWRpdG9yU3RhdGU6IG5ld1N0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgaW52YXJpYW50KHRoaXMuX29sZEVkaXRvclBhbmUpO1xuICAgIHRoaXMuX29sZEVkaXRvckNvbXBvbmVudCA9IFJlYWN0LnJlbmRlcihcbiAgICAgICAgPERpZmZWaWV3RWRpdG9yUGFuZVxuICAgICAgICAgIGZpbGVQYXRoPXtmaWxlUGF0aH1cbiAgICAgICAgICBvZmZzZXRzPXtvbGRTdGF0ZS5vZmZzZXRzfVxuICAgICAgICAgIGhpZ2hsaWdodGVkTGluZXM9e29sZFN0YXRlLmhpZ2hsaWdodGVkTGluZXN9XG4gICAgICAgICAgaW5pdGlhbFRleHRDb250ZW50PXtvbGRTdGF0ZS50ZXh0fVxuICAgICAgICAgIGlubGluZUVsZW1lbnRzPXtvbGRTdGF0ZS5pbmxpbmVFbGVtZW50c31cbiAgICAgICAgICBoYW5kbGVOZXdPZmZzZXRzPXt0aGlzLl9ib3VuZEhhbmRsZU5ld09mZnNldHN9XG4gICAgICAgICAgcmVhZE9ubHk9e3RydWV9Lz4sXG4gICAgICAgIHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX29sZEVkaXRvclBhbmUpLFxuICAgICk7XG4gICAgaW52YXJpYW50KHRoaXMuX25ld0VkaXRvclBhbmUpO1xuICAgIHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA9IFJlYWN0LnJlbmRlcihcbiAgICAgICAgPERpZmZWaWV3RWRpdG9yUGFuZVxuICAgICAgICAgIGZpbGVQYXRoPXtmaWxlUGF0aH1cbiAgICAgICAgICBvZmZzZXRzPXtuZXdTdGF0ZS5vZmZzZXRzfVxuICAgICAgICAgIGhpZ2hsaWdodGVkTGluZXM9e25ld1N0YXRlLmhpZ2hsaWdodGVkTGluZXN9XG4gICAgICAgICAgaW5pdGlhbFRleHRDb250ZW50PXtuZXdTdGF0ZS50ZXh0fVxuICAgICAgICAgIGlubGluZUVsZW1lbnRzPXtuZXdTdGF0ZS5pbmxpbmVFbGVtZW50c31cbiAgICAgICAgICBoYW5kbGVOZXdPZmZzZXRzPXt0aGlzLl9ib3VuZEhhbmRsZU5ld09mZnNldHN9XG4gICAgICAgICAgcmVhZE9ubHk9e2ZhbHNlfVxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9ib3VuZE9uQ2hhbmdlTmV3VGV4dEVkaXRvcn0vPixcbiAgICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fbmV3RWRpdG9yUGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJUaW1lbGluZSgpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fdGltZWxpbmVQYW5lKTtcbiAgICB0aGlzLl90aW1lbGluZUNvbXBvbmVudCA9IFJlYWN0LnJlbmRlcihcbiAgICAgIDxEaWZmVGltZWxpbmVWaWV3XG4gICAgICAgIGRpZmZNb2RlbD17dGhpcy5wcm9wcy5kaWZmTW9kZWx9XG4gICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlPXt0aGlzLl9ib3VuZE9uVGltZWxpbmVDaGFuZ2VSZXZpc2lvbn0vPixcbiAgICAgIHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX3RpbWVsaW5lUGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJOYXZpZ2F0aW9uKCk6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLl9uYXZpZ2F0aW9uUGFuZSk7XG4gICAgY29uc3Qge29sZEVkaXRvclN0YXRlLCBuZXdFZGl0b3JTdGF0ZX0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHtvZmZzZXRzOiBvbGRPZmZzZXRzLCBoaWdobGlnaHRlZExpbmVzOiBvbGRMaW5lcywgdGV4dDogb2xkQ29udGVudHN9ID0gb2xkRWRpdG9yU3RhdGU7XG4gICAgY29uc3Qge29mZnNldHM6IG5ld09mZnNldHMsIGhpZ2hsaWdodGVkTGluZXM6IG5ld0xpbmVzLCB0ZXh0OiBuZXdDb250ZW50c30gPSBuZXdFZGl0b3JTdGF0ZTtcbiAgICBjb25zdCBuYXZpZ2F0aW9uUGFuZUVsZW1lbnQgPSB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9uYXZpZ2F0aW9uUGFuZSk7XG4gICAgdGhpcy5fbmF2aWdhdGlvbkNvbXBvbmVudCA9IFJlYWN0LnJlbmRlcihcbiAgICAgIDxEaWZmTmF2aWdhdGlvbkJhclxuICAgICAgICBlbGVtZW50SGVpZ2h0PXtuYXZpZ2F0aW9uUGFuZUVsZW1lbnQuY2xpZW50SGVpZ2h0fVxuICAgICAgICBhZGRlZExpbmVzPXtuZXdMaW5lcy5hZGRlZH1cbiAgICAgICAgbmV3T2Zmc2V0cz17bmV3T2Zmc2V0c31cbiAgICAgICAgbmV3Q29udGVudHM9e25ld0NvbnRlbnRzfVxuICAgICAgICByZW1vdmVkTGluZXM9e29sZExpbmVzLnJlbW92ZWR9XG4gICAgICAgIG9sZE9mZnNldHM9e29sZE9mZnNldHN9XG4gICAgICAgIG9sZENvbnRlbnRzPXtvbGRDb250ZW50c31cbiAgICAgICAgb25DbGljaz17dGhpcy5fYm91bmRPbk5hdmlnYXRpb25DbGlja30vPixcbiAgICAgICAgbmF2aWdhdGlvblBhbmVFbGVtZW50LFxuICAgICk7XG4gIH1cblxuICBfb25OYXZpZ2F0aW9uQ2xpY2sobGluZU51bWJlcjogbnVtYmVyLCBpc0FkZGVkTGluZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGNvbnN0IHRleHRFZGl0b3JDb21wb25lbnQgPSBpc0FkZGVkTGluZSA/IHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA6IHRoaXMuX29sZEVkaXRvckNvbXBvbmVudDtcbiAgICBpbnZhcmlhbnQodGV4dEVkaXRvckNvbXBvbmVudCwgJ0RpZmYgVmlldyBOYXZpZ2F0aW9uIEVycm9yOiBOb24gdmFsaWQgdGV4dCBlZGl0b3IgY29tcG9uZW50Jyk7XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IHRleHRFZGl0b3JDb21wb25lbnQuZ2V0RWRpdG9yTW9kZWwoKTtcbiAgICB0ZXh0RWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW2xpbmVOdW1iZXIsIDBdKTtcbiAgfVxuXG4gIF9nZXRQYW5lRWxlbWVudChwYW5lOiBhdG9tJFBhbmUpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIGF0b20udmlld3MuZ2V0VmlldyhwYW5lKS5xdWVyeVNlbGVjdG9yKCcuaXRlbS12aWV3cycpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9vbGRFZGl0b3JQYW5lKSB7XG4gICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX29sZEVkaXRvclBhbmUpKTtcbiAgICAgIHRoaXMuX29sZEVkaXRvclBhbmUgPSBudWxsO1xuICAgICAgdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50ID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX25ld0VkaXRvclBhbmUpIHtcbiAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fbmV3RWRpdG9yUGFuZSkpO1xuICAgICAgdGhpcy5fbmV3RWRpdG9yUGFuZSA9IG51bGw7XG4gICAgICB0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdHJlZVBhbmUpIHtcbiAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fdHJlZVBhbmUpKTtcbiAgICAgIHRoaXMuX3RyZWVQYW5lID0gbnVsbDtcbiAgICAgIHRoaXMuX3RyZWVDb21wb25lbnQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdGltZWxpbmVQYW5lKSB7XG4gICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX3RpbWVsaW5lUGFuZSkpO1xuICAgICAgdGhpcy5fdGltZWxpbmVQYW5lID0gbnVsbDtcbiAgICAgIHRoaXMuX3RpbWVsaW5lQ29tcG9uZW50ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy1jb21wb25lbnRcIiByZWY9XCJwYW5lQ29udGFpbmVyXCIgLz5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZU5ld09mZnNldHMob2Zmc2V0c0Zyb21Db21wb25lbnRzOiBNYXApOiB2b2lkIHtcbiAgICBjb25zdCBvbGRMaW5lT2Zmc2V0cyA9IG5ldyBNYXAodGhpcy5zdGF0ZS5vbGRFZGl0b3JTdGF0ZS5vZmZzZXRzKTtcbiAgICBjb25zdCBuZXdMaW5lT2Zmc2V0cyA9IG5ldyBNYXAodGhpcy5zdGF0ZS5uZXdFZGl0b3JTdGF0ZS5vZmZzZXRzKTtcbiAgICBvZmZzZXRzRnJvbUNvbXBvbmVudHMuZm9yRWFjaCgob2Zmc2V0QW1vdW50LCByb3cpID0+IHtcbiAgICAgIG5ld0xpbmVPZmZzZXRzLnNldChyb3csIChuZXdMaW5lT2Zmc2V0cy5nZXQocm93KSB8fCAwKSArIG9mZnNldEFtb3VudCk7XG4gICAgICBvbGRMaW5lT2Zmc2V0cy5zZXQocm93LCAob2xkTGluZU9mZnNldHMuZ2V0KHJvdykgfHwgMCkgKyBvZmZzZXRBbW91bnQpO1xuICAgIH0pO1xuICAgIGNvbnN0IG9sZEVkaXRvclN0YXRlID0gb2JqZWN0LmFzc2lnbih7fSwgdGhpcy5zdGF0ZS5vbGRFZGl0b3JTdGF0ZSwge29mZnNldHM6IG9sZExpbmVPZmZzZXRzfSk7XG4gICAgY29uc3QgbmV3RWRpdG9yU3RhdGUgPSBvYmplY3QuYXNzaWduKHt9LCB0aGlzLnN0YXRlLm5ld0VkaXRvclN0YXRlLCB7b2Zmc2V0czogbmV3TGluZU9mZnNldHN9KTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVQYXRoOiB0aGlzLnN0YXRlLmZpbGVQYXRoLFxuICAgICAgb2xkRWRpdG9yU3RhdGUsXG4gICAgICBuZXdFZGl0b3JTdGF0ZSxcbiAgICB9KTtcbiAgfVxuXG4gIF9vbkNoYW5nZU5ld1RleHRFZGl0b3IobmV3Q29udGVudHM6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldE5ld0NvbnRlbnRzKG5ld0NvbnRlbnRzKTtcbiAgfVxuXG4gIF9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24ocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLnNldFJldmlzaW9uKHJldmlzaW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBsaW5lIGRpZmYgc3RhdGUgb24gYWN0aXZlIGZpbGUgc3RhdGUgY2hhbmdlLlxuICAgKi9cbiAgX3VwZGF0ZUxpbmVEaWZmU3RhdGUoZmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpOiB2b2lkIHtcbiAgICBjb25zdCB7b2xkQ29udGVudHMsIG5ld0NvbnRlbnRzLCBmaWxlUGF0aCwgaW5saW5lQ29tcG9uZW50c30gPSBmaWxlU3RhdGU7XG5cbiAgICBjb25zdCB7Y29tcHV0ZURpZmZ9ID0gcmVxdWlyZSgnLi9kaWZmLXV0aWxzJyk7XG4gICAgY29uc3Qge2FkZGVkTGluZXMsIHJlbW92ZWRMaW5lcywgb2xkTGluZU9mZnNldHMsIG5ld0xpbmVPZmZzZXRzfSA9XG4gICAgICBjb21wdXRlRGlmZihvbGRDb250ZW50cywgbmV3Q29udGVudHMpO1xuXG4gICAgY29uc3Qgb2xkRWRpdG9yU3RhdGUgPSB7XG4gICAgICB0ZXh0OiBvbGRDb250ZW50cyxcbiAgICAgIG9mZnNldHM6IG9sZExpbmVPZmZzZXRzLFxuICAgICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgICBhZGRlZDogW10sXG4gICAgICAgIHJlbW92ZWQ6IHJlbW92ZWRMaW5lcyxcbiAgICAgIH0sXG4gICAgICBpbmxpbmVFbGVtZW50czogaW5saW5lQ29tcG9uZW50cyB8fCBbXSxcbiAgICB9O1xuICAgIGNvbnN0IG5ld0VkaXRvclN0YXRlID0ge1xuICAgICAgdGV4dDogbmV3Q29udGVudHMsXG4gICAgICBvZmZzZXRzOiBuZXdMaW5lT2Zmc2V0cyxcbiAgICAgIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICAgICAgYWRkZWQ6IGFkZGVkTGluZXMsXG4gICAgICAgIHJlbW92ZWQ6IFtdLFxuICAgICAgfSxcbiAgICAgIGlubGluZUVsZW1lbnRzOiBbXSxcbiAgICB9O1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZVBhdGgsXG4gICAgICBvbGRFZGl0b3JTdGF0ZSxcbiAgICAgIG5ld0VkaXRvclN0YXRlLFxuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZlZpZXdDb21wb25lbnQ7XG4iXX0=