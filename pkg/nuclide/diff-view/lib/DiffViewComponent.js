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

      _reactForAtom.ReactDOM.findDOMNode(this.refs['paneContainer']).appendChild(atom.views.getView(this._paneContainer));

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
        filePath: filePath,
        offsets: oldState.offsets,
        highlightedLines: oldState.highlightedLines,
        initialTextContent: oldState.text,
        inlineElements: oldState.inlineElements,
        handleNewOffsets: this._boundHandleNewOffsets,
        readOnly: true }), this._getPaneElement(this._oldEditorPane));
      (0, _assert2['default'])(this._newEditorPane);
      this._newEditorComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_DiffViewEditorPane2['default'], {
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
      if (this._subscriptions) {
        this._subscriptions.dispose();
        this._subscriptions = null;
      }
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
})(_reactForAtom.React.Component);

module.exports = DiffViewComponent;
//# sourceMappingURL=data:application/json;base64,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QkFBZ0IsR0FBSSxTQUFTLENBQTdCLGdCQUFnQjs7cUJBRXJDLE9BQU8sQ0FBQyxjQUFjLENBQUM7O1VBQXRDLFdBQVcsWUFBWCxXQUFXOzt5QkFFaEIsV0FBVyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7O1VBRGhDLFVBQVUsZ0JBQVYsVUFBVTtVQUFFLFlBQVksZ0JBQVosWUFBWTtVQUFFLGNBQWMsZ0JBQWQsY0FBYztVQUFFLGNBQWMsZ0JBQWQsY0FBYzs7QUFHL0QsVUFBTSxjQUFjLEdBQUc7QUFDckIsWUFBSSxFQUFFLFdBQVc7QUFDakIsZUFBTyxFQUFFLGNBQWM7QUFDdkIsd0JBQWdCLEVBQUU7QUFDaEIsZUFBSyxFQUFFLEVBQUU7QUFDVCxpQkFBTyxFQUFFLFlBQVk7U0FDdEI7QUFDRCxzQkFBYyxFQUFFLGdCQUFnQixJQUFJLEVBQUU7T0FDdkMsQ0FBQztBQUNGLFVBQU0sY0FBYyxHQUFHO0FBQ3JCLFlBQUksRUFBRSxXQUFXO0FBQ2pCLGVBQU8sRUFBRSxjQUFjO0FBQ3ZCLHdCQUFnQixFQUFFO0FBQ2hCLGVBQUssRUFBRSxVQUFVO0FBQ2pCLGlCQUFPLEVBQUUsRUFBRTtTQUNaO0FBQ0Qsc0JBQWMsRUFBRSxFQUFFO09BQ25CLENBQUM7QUFDRixVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osZ0JBQVEsRUFBUixRQUFRO0FBQ1Isc0JBQWMsRUFBZCxjQUFjO0FBQ2Qsc0JBQWMsRUFBZCxjQUFjO09BQ2YsQ0FBQyxDQUFDO0tBQ0o7OztTQXpSRyxpQkFBaUI7R0FBUyxvQkFBTSxTQUFTOztBQTRSL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJEaWZmVmlld0NvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtGaWxlQ2hhbmdlU3RhdGUsIElubGluZUNvbXBvbmVudCwgT2Zmc2V0TWFwfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWwgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IERpZmZWaWV3RWRpdG9yUGFuZSBmcm9tICcuL0RpZmZWaWV3RWRpdG9yUGFuZSc7XG5pbXBvcnQgRGlmZlZpZXdUcmVlIGZyb20gJy4vRGlmZlZpZXdUcmVlJztcbmltcG9ydCBTeW5jU2Nyb2xsIGZyb20gJy4vU3luY1Njcm9sbCc7XG5pbXBvcnQgRGlmZlRpbWVsaW5lVmlldyBmcm9tICcuL0RpZmZUaW1lbGluZVZpZXcnO1xuaW1wb3J0IERpZmZOYXZpZ2F0aW9uQmFyIGZyb20gJy4vRGlmZk5hdmlnYXRpb25CYXInO1xuaW1wb3J0IHtvYmplY3R9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtjcmVhdGVQYW5lQ29udGFpbmVyfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuXG50eXBlIFByb3BzID0ge1xuICBkaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG59O1xuXG50eXBlIEVkaXRvclN0YXRlID0ge1xuICB0ZXh0OiBzdHJpbmc7XG4gIG9mZnNldHM6IE9mZnNldE1hcDtcbiAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgIGFkZGVkOiBBcnJheTxudW1iZXI+O1xuICAgIHJlbW92ZWQ6IEFycmF5PG51bWJlcj47XG4gIH07XG4gIGlubGluZUVsZW1lbnRzOiBBcnJheTxJbmxpbmVDb21wb25lbnQ+O1xufVxuXG50eXBlIFN0YXRlID0ge1xuICBmaWxlUGF0aDogc3RyaW5nLFxuICBvbGRFZGl0b3JTdGF0ZTogRWRpdG9yU3RhdGU7XG4gIG5ld0VkaXRvclN0YXRlOiBFZGl0b3JTdGF0ZTtcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmNsYXNzIERpZmZWaWV3Q29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgX3N1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuICBfb2xkRWRpdG9yUGFuZTogP2F0b20kUGFuZTtcbiAgX29sZEVkaXRvckNvbXBvbmVudDogP0RpZmZWaWV3RWRpdG9yUGFuZTtcbiAgX25ld0VkaXRvclBhbmU6ID9hdG9tJFBhbmU7XG4gIF9uZXdFZGl0b3JDb21wb25lbnQ6ID9EaWZmVmlld0VkaXRvclBhbmU7XG4gIF90aW1lbGluZVBhbmU6ID9hdG9tJFBhbmU7XG4gIF90aW1lbGluZUNvbXBvbmVudDogP0RpZmZUaW1lbGluZVZpZXc7XG4gIF90cmVlUGFuZTogP2F0b20kUGFuZTtcbiAgX3RyZWVDb21wb25lbnQ6ID9SZWFjdENvbXBvbmVudDtcbiAgX25hdmlnYXRpb25QYW5lOiA/YXRvbSRQYW5lO1xuICBfbmF2aWdhdGlvbkNvbXBvbmVudDogP0RpZmZOYXZpZ2F0aW9uQmFyO1xuXG4gIF9ib3VuZEhhbmRsZU5ld09mZnNldHM6IEZ1bmN0aW9uO1xuICBfYm91bmRVcGRhdGVMaW5lRGlmZlN0YXRlOiBGdW5jdGlvbjtcbiAgX2JvdW5kT25OYXZpZ2F0aW9uQ2xpY2s6IEZ1bmN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICBjb25zdCBvbGRFZGl0b3JTdGF0ZSA9IHtcbiAgICAgIHRleHQ6ICcnLFxuICAgICAgb2Zmc2V0czogbmV3IE1hcCgpLFxuICAgICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgICBhZGRlZDogW10sXG4gICAgICAgIHJlbW92ZWQ6IFtdLFxuICAgICAgfSxcbiAgICAgIGlubGluZUVsZW1lbnRzOiBbXSxcbiAgICB9O1xuICAgIGNvbnN0IG5ld0VkaXRvclN0YXRlID0ge1xuICAgICAgdGV4dDogJycsXG4gICAgICBvZmZzZXRzOiBuZXcgTWFwKCksXG4gICAgICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgICAgIGFkZGVkOiBbXSxcbiAgICAgICAgcmVtb3ZlZDogW10sXG4gICAgICB9LFxuICAgICAgaW5saW5lRWxlbWVudHM6IFtdLFxuICAgIH07XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGZpbGVQYXRoOiAnJyxcbiAgICAgIG9sZEVkaXRvclN0YXRlLFxuICAgICAgbmV3RWRpdG9yU3RhdGUsXG4gICAgfTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZU5ld09mZnNldHMgPSB0aGlzLl9oYW5kbGVOZXdPZmZzZXRzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRVcGRhdGVMaW5lRGlmZlN0YXRlID0gdGhpcy5fdXBkYXRlTGluZURpZmZTdGF0ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kT25DaGFuZ2VOZXdUZXh0RWRpdG9yID0gdGhpcy5fb25DaGFuZ2VOZXdUZXh0RWRpdG9yLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRPblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24gPSB0aGlzLl9vblRpbWVsaW5lQ2hhbmdlUmV2aXNpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZE9uTmF2aWdhdGlvbkNsaWNrID0gdGhpcy5fb25OYXZpZ2F0aW9uQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIGNvbnN0IGRpZmZNb2RlbCA9IHRoaXMucHJvcHMuZGlmZk1vZGVsO1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChkaWZmTW9kZWwub25BY3RpdmVGaWxlVXBkYXRlcyh0aGlzLl9ib3VuZFVwZGF0ZUxpbmVEaWZmU3RhdGUpKTtcblxuICAgIHRoaXMuX3BhbmVDb250YWluZXIgPSBjcmVhdGVQYW5lQ29udGFpbmVyKCk7XG4gICAgLy8gVGhlIGNoYW5nZWQgZmlsZXMgc3RhdHVzIHRyZWUgdGFrZXMgMS81IG9mIHRoZSB3aWR0aCBhbmQgbGl2ZXMgb24gdGhlIHJpZ2h0IG1vc3QsXG4gICAgLy8gd2hpbGUgYmVpbmcgdmVydGljYWxseSBzcGx0IHdpdGggdGhlIHJldmlzaW9uIHRpbWVsaW5lIHN0YWNrIHBhbmUuXG4gICAgY29uc3QgdHJlZVBhbmUgPSB0aGlzLl90cmVlUGFuZSA9IHRoaXMuX3BhbmVDb250YWluZXIuZ2V0QWN0aXZlUGFuZSgpO1xuICAgIHRoaXMuX29sZEVkaXRvclBhbmUgPSB0cmVlUGFuZS5zcGxpdExlZnQoe1xuICAgICAgY29weUFjdGl2ZUl0ZW06IGZhbHNlLFxuICAgICAgZmxleFNjYWxlOiAyLFxuICAgIH0pO1xuICAgIHRoaXMuX25ld0VkaXRvclBhbmUgPSB0cmVlUGFuZS5zcGxpdExlZnQoe1xuICAgICAgY29weUFjdGl2ZUl0ZW06IGZhbHNlLFxuICAgICAgZmxleFNjYWxlOiAyLFxuICAgIH0pO1xuICAgIHRoaXMuX25hdmlnYXRpb25QYW5lID0gdHJlZVBhbmUuc3BsaXRMZWZ0KHtcbiAgICAgIC8vIFRoZSBuYXZpZ2F0aW9uIHBhbmUgc2l0cyBiZXR3ZWVuIHRoZSB0cmVlIGFuZCB0aGUgZWRpdG9ycy5cbiAgICAgIGZsZXhTY2FsZTogMC4wOCxcbiAgICB9KTtcbiAgICB0aGlzLl90aW1lbGluZVBhbmUgPSB0cmVlUGFuZS5zcGxpdERvd24oe1xuICAgICAgY29weUFjdGl2ZUl0ZW06IGZhbHNlLFxuICAgICAgZmxleFNjYWxlOiAxLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fcmVuZGVyRGlmZlZpZXcoKTtcblxuICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1sncGFuZUNvbnRhaW5lciddKS5hcHBlbmRDaGlsZChcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9wYW5lQ29udGFpbmVyKSxcbiAgICApO1xuXG4gICAgaW52YXJpYW50KHRoaXMuX29sZEVkaXRvckNvbXBvbmVudCk7XG4gICAgY29uc3Qgb2xkVGV4dEVkaXRvckVsZW1lbnQgPSB0aGlzLl9vbGRFZGl0b3JDb21wb25lbnQuZ2V0RWRpdG9yRG9tRWxlbWVudCgpO1xuICAgIGludmFyaWFudCh0aGlzLl9uZXdFZGl0b3JDb21wb25lbnQpO1xuICAgIGNvbnN0IG5ld1RleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50LmdldEVkaXRvckRvbUVsZW1lbnQoKTtcblxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKG5ldyBTeW5jU2Nyb2xsKFxuICAgICAgICBvbGRUZXh0RWRpdG9yRWxlbWVudCxcbiAgICAgICAgbmV3VGV4dEVkaXRvckVsZW1lbnQsXG4gICAgICApXG4gICAgKTtcblxuICAgIHRoaXMuX3VwZGF0ZUxpbmVEaWZmU3RhdGUoZGlmZk1vZGVsLmdldEFjdGl2ZUZpbGVTdGF0ZSgpKTtcbiAgfVxuXG4gIF9yZW5kZXJEaWZmVmlldygpOiB2b2lkIHtcbiAgICB0aGlzLl9yZW5kZXJUcmVlKCk7XG4gICAgdGhpcy5fcmVuZGVyRWRpdG9ycygpO1xuICAgIHRoaXMuX3JlbmRlck5hdmlnYXRpb24oKTtcbiAgICB0aGlzLl9yZW5kZXJUaW1lbGluZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlckRpZmZWaWV3KCk7XG4gIH1cblxuICBfcmVuZGVyVHJlZSgpOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fdHJlZVBhbmUpO1xuICAgIHRoaXMuX3RyZWVDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtcIm51Y2xpZGUtZGlmZi12aWV3LXRyZWVcIn0+XG4gICAgICAgICAgPERpZmZWaWV3VHJlZSBkaWZmTW9kZWw9e3RoaXMucHJvcHMuZGlmZk1vZGVsfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICksXG4gICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl90cmVlUGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJFZGl0b3JzKCk6IHZvaWQge1xuICAgIGNvbnN0IHtmaWxlUGF0aCwgb2xkRWRpdG9yU3RhdGU6IG9sZFN0YXRlLCBuZXdFZGl0b3JTdGF0ZTogbmV3U3RhdGV9ID0gdGhpcy5zdGF0ZTtcbiAgICBpbnZhcmlhbnQodGhpcy5fb2xkRWRpdG9yUGFuZSk7XG4gICAgdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgICA8RGlmZlZpZXdFZGl0b3JQYW5lXG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e29sZFN0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17b2xkU3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBpbml0aWFsVGV4dENvbnRlbnQ9e29sZFN0YXRlLnRleHR9XG4gICAgICAgICAgaW5saW5lRWxlbWVudHM9e29sZFN0YXRlLmlubGluZUVsZW1lbnRzfVxuICAgICAgICAgIGhhbmRsZU5ld09mZnNldHM9e3RoaXMuX2JvdW5kSGFuZGxlTmV3T2Zmc2V0c31cbiAgICAgICAgICByZWFkT25seT17dHJ1ZX0vPixcbiAgICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fb2xkRWRpdG9yUGFuZSksXG4gICAgKTtcbiAgICBpbnZhcmlhbnQodGhpcy5fbmV3RWRpdG9yUGFuZSk7XG4gICAgdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgICA8RGlmZlZpZXdFZGl0b3JQYW5lXG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e25ld1N0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17bmV3U3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBpbml0aWFsVGV4dENvbnRlbnQ9e25ld1N0YXRlLnRleHR9XG4gICAgICAgICAgaW5saW5lRWxlbWVudHM9e25ld1N0YXRlLmlubGluZUVsZW1lbnRzfVxuICAgICAgICAgIGhhbmRsZU5ld09mZnNldHM9e3RoaXMuX2JvdW5kSGFuZGxlTmV3T2Zmc2V0c31cbiAgICAgICAgICByZWFkT25seT17ZmFsc2V9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2JvdW5kT25DaGFuZ2VOZXdUZXh0RWRpdG9yfS8+LFxuICAgICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9uZXdFZGl0b3JQYW5lKSxcbiAgICApO1xuICB9XG5cbiAgX3JlbmRlclRpbWVsaW5lKCk6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLl90aW1lbGluZVBhbmUpO1xuICAgIHRoaXMuX3RpbWVsaW5lQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERpZmZUaW1lbGluZVZpZXdcbiAgICAgICAgZGlmZk1vZGVsPXt0aGlzLnByb3BzLmRpZmZNb2RlbH1cbiAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2U9e3RoaXMuX2JvdW5kT25UaW1lbGluZUNoYW5nZVJldmlzaW9ufS8+LFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fdGltZWxpbmVQYW5lKSxcbiAgICApO1xuICB9XG5cbiAgX3JlbmRlck5hdmlnYXRpb24oKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX25hdmlnYXRpb25QYW5lKTtcbiAgICBjb25zdCB7b2xkRWRpdG9yU3RhdGUsIG5ld0VkaXRvclN0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge29mZnNldHM6IG9sZE9mZnNldHMsIGhpZ2hsaWdodGVkTGluZXM6IG9sZExpbmVzLCB0ZXh0OiBvbGRDb250ZW50c30gPSBvbGRFZGl0b3JTdGF0ZTtcbiAgICBjb25zdCB7b2Zmc2V0czogbmV3T2Zmc2V0cywgaGlnaGxpZ2h0ZWRMaW5lczogbmV3TGluZXMsIHRleHQ6IG5ld0NvbnRlbnRzfSA9IG5ld0VkaXRvclN0YXRlO1xuICAgIGNvbnN0IG5hdmlnYXRpb25QYW5lRWxlbWVudCA9IHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX25hdmlnYXRpb25QYW5lKTtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERpZmZOYXZpZ2F0aW9uQmFyXG4gICAgICAgIGVsZW1lbnRIZWlnaHQ9e25hdmlnYXRpb25QYW5lRWxlbWVudC5jbGllbnRIZWlnaHR9XG4gICAgICAgIGFkZGVkTGluZXM9e25ld0xpbmVzLmFkZGVkfVxuICAgICAgICBuZXdPZmZzZXRzPXtuZXdPZmZzZXRzfVxuICAgICAgICBuZXdDb250ZW50cz17bmV3Q29udGVudHN9XG4gICAgICAgIHJlbW92ZWRMaW5lcz17b2xkTGluZXMucmVtb3ZlZH1cbiAgICAgICAgb2xkT2Zmc2V0cz17b2xkT2Zmc2V0c31cbiAgICAgICAgb2xkQ29udGVudHM9e29sZENvbnRlbnRzfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9ib3VuZE9uTmF2aWdhdGlvbkNsaWNrfS8+LFxuICAgICAgICBuYXZpZ2F0aW9uUGFuZUVsZW1lbnQsXG4gICAgKTtcbiAgfVxuXG4gIF9vbk5hdmlnYXRpb25DbGljayhsaW5lTnVtYmVyOiBudW1iZXIsIGlzQWRkZWRMaW5lOiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgdGV4dEVkaXRvckNvbXBvbmVudCA9IGlzQWRkZWRMaW5lID8gdGhpcy5fbmV3RWRpdG9yQ29tcG9uZW50IDogdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50O1xuICAgIGludmFyaWFudCh0ZXh0RWRpdG9yQ29tcG9uZW50LCAnRGlmZiBWaWV3IE5hdmlnYXRpb24gRXJyb3I6IE5vbiB2YWxpZCB0ZXh0IGVkaXRvciBjb21wb25lbnQnKTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGV4dEVkaXRvckNvbXBvbmVudC5nZXRFZGl0b3JNb2RlbCgpO1xuICAgIHRleHRFZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbbGluZU51bWJlciwgMF0pO1xuICB9XG5cbiAgX2dldFBhbmVFbGVtZW50KHBhbmU6IGF0b20kUGFuZSk6IEhUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gYXRvbS52aWV3cy5nZXRWaWV3KHBhbmUpLnF1ZXJ5U2VsZWN0b3IoJy5pdGVtLXZpZXdzJyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX29sZEVkaXRvclBhbmUpIHtcbiAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fb2xkRWRpdG9yUGFuZSkpO1xuICAgICAgdGhpcy5fb2xkRWRpdG9yUGFuZSA9IG51bGw7XG4gICAgICB0aGlzLl9vbGRFZGl0b3JDb21wb25lbnQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbmV3RWRpdG9yUGFuZSkge1xuICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9uZXdFZGl0b3JQYW5lKSk7XG4gICAgICB0aGlzLl9uZXdFZGl0b3JQYW5lID0gbnVsbDtcbiAgICAgIHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl90cmVlUGFuZSkge1xuICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl90cmVlUGFuZSkpO1xuICAgICAgdGhpcy5fdHJlZVBhbmUgPSBudWxsO1xuICAgICAgdGhpcy5fdHJlZUNvbXBvbmVudCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl90aW1lbGluZVBhbmUpIHtcbiAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fdGltZWxpbmVQYW5lKSk7XG4gICAgICB0aGlzLl90aW1lbGluZVBhbmUgPSBudWxsO1xuICAgICAgdGhpcy5fdGltZWxpbmVDb21wb25lbnQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlmZi12aWV3LWNvbXBvbmVudFwiIHJlZj1cInBhbmVDb250YWluZXJcIiAvPlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlTmV3T2Zmc2V0cyhvZmZzZXRzRnJvbUNvbXBvbmVudHM6IE1hcCk6IHZvaWQge1xuICAgIGNvbnN0IG9sZExpbmVPZmZzZXRzID0gbmV3IE1hcCh0aGlzLnN0YXRlLm9sZEVkaXRvclN0YXRlLm9mZnNldHMpO1xuICAgIGNvbnN0IG5ld0xpbmVPZmZzZXRzID0gbmV3IE1hcCh0aGlzLnN0YXRlLm5ld0VkaXRvclN0YXRlLm9mZnNldHMpO1xuICAgIG9mZnNldHNGcm9tQ29tcG9uZW50cy5mb3JFYWNoKChvZmZzZXRBbW91bnQsIHJvdykgPT4ge1xuICAgICAgbmV3TGluZU9mZnNldHMuc2V0KHJvdywgKG5ld0xpbmVPZmZzZXRzLmdldChyb3cpIHx8IDApICsgb2Zmc2V0QW1vdW50KTtcbiAgICAgIG9sZExpbmVPZmZzZXRzLnNldChyb3csIChvbGRMaW5lT2Zmc2V0cy5nZXQocm93KSB8fCAwKSArIG9mZnNldEFtb3VudCk7XG4gICAgfSk7XG4gICAgY29uc3Qgb2xkRWRpdG9yU3RhdGUgPSBvYmplY3QuYXNzaWduKHt9LCB0aGlzLnN0YXRlLm9sZEVkaXRvclN0YXRlLCB7b2Zmc2V0czogb2xkTGluZU9mZnNldHN9KTtcbiAgICBjb25zdCBuZXdFZGl0b3JTdGF0ZSA9IG9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUubmV3RWRpdG9yU3RhdGUsIHtvZmZzZXRzOiBuZXdMaW5lT2Zmc2V0c30pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZVBhdGg6IHRoaXMuc3RhdGUuZmlsZVBhdGgsXG4gICAgICBvbGRFZGl0b3JTdGF0ZSxcbiAgICAgIG5ld0VkaXRvclN0YXRlLFxuICAgIH0pO1xuICB9XG5cbiAgX29uQ2hhbmdlTmV3VGV4dEVkaXRvcihuZXdDb250ZW50czogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuc2V0TmV3Q29udGVudHMobmV3Q29udGVudHMpO1xuICB9XG5cbiAgX29uVGltZWxpbmVDaGFuZ2VSZXZpc2lvbihyZXZpc2lvbjogUmV2aXNpb25JbmZvKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuc2V0UmV2aXNpb24ocmV2aXNpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGxpbmUgZGlmZiBzdGF0ZSBvbiBhY3RpdmUgZmlsZSBzdGF0ZSBjaGFuZ2UuXG4gICAqL1xuICBfdXBkYXRlTGluZURpZmZTdGF0ZShmaWxlU3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZSk6IHZvaWQge1xuICAgIGNvbnN0IHtvbGRDb250ZW50cywgbmV3Q29udGVudHMsIGZpbGVQYXRoLCBpbmxpbmVDb21wb25lbnRzfSA9IGZpbGVTdGF0ZTtcblxuICAgIGNvbnN0IHtjb21wdXRlRGlmZn0gPSByZXF1aXJlKCcuL2RpZmYtdXRpbHMnKTtcbiAgICBjb25zdCB7YWRkZWRMaW5lcywgcmVtb3ZlZExpbmVzLCBvbGRMaW5lT2Zmc2V0cywgbmV3TGluZU9mZnNldHN9ID1cbiAgICAgIGNvbXB1dGVEaWZmKG9sZENvbnRlbnRzLCBuZXdDb250ZW50cyk7XG5cbiAgICBjb25zdCBvbGRFZGl0b3JTdGF0ZSA9IHtcbiAgICAgIHRleHQ6IG9sZENvbnRlbnRzLFxuICAgICAgb2Zmc2V0czogb2xkTGluZU9mZnNldHMsXG4gICAgICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgICAgIGFkZGVkOiBbXSxcbiAgICAgICAgcmVtb3ZlZDogcmVtb3ZlZExpbmVzLFxuICAgICAgfSxcbiAgICAgIGlubGluZUVsZW1lbnRzOiBpbmxpbmVDb21wb25lbnRzIHx8IFtdLFxuICAgIH07XG4gICAgY29uc3QgbmV3RWRpdG9yU3RhdGUgPSB7XG4gICAgICB0ZXh0OiBuZXdDb250ZW50cyxcbiAgICAgIG9mZnNldHM6IG5ld0xpbmVPZmZzZXRzLFxuICAgICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgICBhZGRlZDogYWRkZWRMaW5lcyxcbiAgICAgICAgcmVtb3ZlZDogW10sXG4gICAgICB9LFxuICAgICAgaW5saW5lRWxlbWVudHM6IFtdLFxuICAgIH07XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZEVkaXRvclN0YXRlLFxuICAgICAgbmV3RWRpdG9yU3RhdGUsXG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld0NvbXBvbmVudDtcbiJdfQ==