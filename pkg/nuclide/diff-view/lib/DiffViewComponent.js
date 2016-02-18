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

var _DiffNavigationBar = require('./DiffNavigationBar');

var _DiffNavigationBar2 = _interopRequireDefault(_DiffNavigationBar);

var _atomHelpers = require('../../atom-helpers');

var _constants = require('./constants');

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

/* eslint-disable react/prop-types */

var DiffViewComponent = (function (_React$Component) {
  _inherits(DiffViewComponent, _React$Component);

  function DiffViewComponent(props) {
    _classCallCheck(this, DiffViewComponent);

    _get(Object.getPrototypeOf(DiffViewComponent.prototype), 'constructor', this).call(this, props);
    this.state = {
      mode: _constants.DiffMode.BROWSE_MODE,
      filePath: '',
      oldEditorState: initialEditorState(),
      newEditorState: initialEditorState()
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
      this.setState(_extends({}, this.state, {
        mode: mode
      }));
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
      this._commitComponent = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-commit-view' },
        'TODO (Show the commit message editor, load template message or amend).'
      ), this._getPaneElement(this._bottomRightPane));
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
        readOnly: true }), this._getPaneElement(this._oldEditorPane));
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
        onChange: this._boundOnChangeNewTextEditor }), this._getPaneElement(this._newEditorPane));
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
        onSelectionChange: this._boundOnTimelineChangeRevision }), this._getPaneElement(this._bottomRightPane));
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
      this.setState(_extends({}, this.state, {
        oldEditorState: _extends({}, this.state.oldEditorState, { offsets: oldLineOffsets }),
        newEditorState: _extends({}, this.state.newEditorState, { offsets: newLineOffsets })
      }));
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
      this.setState(_extends({}, this.state, {
        filePath: filePath,
        oldEditorState: oldEditorState,
        newEditorState: newEditorState
      }));
    }
  }]);

  return DiffViewComponent;
})(_reactForAtom.React.Component);

module.exports = DiffViewComponent;
//# sourceMappingURL=data:application/json;base64,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LElBQUksRUFBRTtPQUN2QyxDQUFDO0FBQ0YsVUFBTSxjQUFjLEdBQUc7QUFDckIscUJBQWEsRUFBRSxlQUFlO0FBQzlCLFlBQUksRUFBRSxXQUFXO0FBQ2pCLHFCQUFhLEVBQWIsYUFBYTtBQUNiLGVBQU8sRUFBRSxjQUFjO0FBQ3ZCLHdCQUFnQixFQUFFO0FBQ2hCLGVBQUssRUFBRSxVQUFVO0FBQ2pCLGlCQUFPLEVBQUUsRUFBRTtTQUNaO0FBQ0Qsc0JBQWMsRUFBRSxFQUFFO09BQ25CLENBQUM7QUFDRixVQUFJLENBQUMsUUFBUSxjQUNSLElBQUksQ0FBQyxLQUFLO0FBQ2IsZ0JBQVEsRUFBUixRQUFRO0FBQ1Isc0JBQWMsRUFBZCxjQUFjO0FBQ2Qsc0JBQWMsRUFBZCxjQUFjO1NBQ2QsQ0FBQztLQUNKOzs7U0ExVEcsaUJBQWlCO0dBQVMsb0JBQU0sU0FBUzs7QUE2VC9DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMiLCJmaWxlIjoiRGlmZlZpZXdDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RmlsZUNoYW5nZVN0YXRlLCBJbmxpbmVDb21wb25lbnQsIE9mZnNldE1hcCwgRGlmZk1vZGVUeXBlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWwgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlLCBUZXh0QnVmZmVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IERpZmZWaWV3RWRpdG9yUGFuZSBmcm9tICcuL0RpZmZWaWV3RWRpdG9yUGFuZSc7XG5pbXBvcnQgRGlmZlZpZXdUcmVlIGZyb20gJy4vRGlmZlZpZXdUcmVlJztcbmltcG9ydCBTeW5jU2Nyb2xsIGZyb20gJy4vU3luY1Njcm9sbCc7XG5pbXBvcnQgRGlmZlRpbWVsaW5lVmlldyBmcm9tICcuL0RpZmZUaW1lbGluZVZpZXcnO1xuaW1wb3J0IERpZmZOYXZpZ2F0aW9uQmFyIGZyb20gJy4vRGlmZk5hdmlnYXRpb25CYXInO1xuaW1wb3J0IHtjcmVhdGVQYW5lQ29udGFpbmVyfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtidWZmZXJGb3JVcml9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5pbXBvcnQge0RpZmZNb2RlfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGRpZmZNb2RlbDogRGlmZlZpZXdNb2RlbCxcbn07XG5cbnR5cGUgRWRpdG9yU3RhdGUgPSB7XG4gIHJldmlzaW9uVGl0bGU6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBzYXZlZENvbnRlbnRzPzogc3RyaW5nO1xuICBvZmZzZXRzOiBPZmZzZXRNYXA7XG4gIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICBhZGRlZDogQXJyYXk8bnVtYmVyPixcbiAgICByZW1vdmVkOiBBcnJheTxudW1iZXI+LFxuICB9LFxuICBpbmxpbmVFbGVtZW50czogQXJyYXk8SW5saW5lQ29tcG9uZW50Pixcbn1cblxudHlwZSBTdGF0ZSA9IHtcbiAgbW9kZTogRGlmZk1vZGVUeXBlLFxuICBmaWxlUGF0aDogc3RyaW5nLFxuICBvbGRFZGl0b3JTdGF0ZTogRWRpdG9yU3RhdGUsXG4gIG5ld0VkaXRvclN0YXRlOiBFZGl0b3JTdGF0ZSxcbn07XG5cbmZ1bmN0aW9uIGluaXRpYWxFZGl0b3JTdGF0ZSgpOiBFZGl0b3JTdGF0ZSB7XG4gIHJldHVybiB7XG4gICAgcmV2aXNpb25UaXRsZTogJycsXG4gICAgdGV4dDogJycsXG4gICAgb2Zmc2V0czogbmV3IE1hcCgpLFxuICAgIGhpZ2hsaWdodGVkTGluZXM6IHtcbiAgICAgIGFkZGVkOiBbXSxcbiAgICAgIHJlbW92ZWQ6IFtdLFxuICAgIH0sXG4gICAgaW5saW5lRWxlbWVudHM6IFtdLFxuICB9O1xufVxuXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5jbGFzcyBEaWZmVmlld0NvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc3luY1Njcm9sbDogU3luY1Njcm9sbDtcbiAgX29sZEVkaXRvclBhbmU6IGF0b20kUGFuZTtcbiAgX29sZEVkaXRvckNvbXBvbmVudDogRGlmZlZpZXdFZGl0b3JQYW5lO1xuICBfbmV3RWRpdG9yUGFuZTogYXRvbSRQYW5lO1xuICBfbmV3RWRpdG9yQ29tcG9uZW50OiBEaWZmVmlld0VkaXRvclBhbmU7XG4gIF9ib3R0b21SaWdodFBhbmU6IGF0b20kUGFuZTtcbiAgX3RpbWVsaW5lQ29tcG9uZW50OiA/RGlmZlRpbWVsaW5lVmlldztcbiAgX3RyZWVQYW5lOiBhdG9tJFBhbmU7XG4gIF90cmVlQ29tcG9uZW50OiBSZWFjdENvbXBvbmVudDtcbiAgX25hdmlnYXRpb25QYW5lOiBhdG9tJFBhbmU7XG4gIF9uYXZpZ2F0aW9uQ29tcG9uZW50OiBEaWZmTmF2aWdhdGlvbkJhcjtcbiAgX2NvbW1pdENvbXBvbmVudDogP1JlYWN0Q29tcG9uZW50O1xuICBfcmVhZG9ubHlCdWZmZXI6IGF0b20kVGV4dEJ1ZmZlcjtcblxuICBfYm91bmRIYW5kbGVOZXdPZmZzZXRzOiBGdW5jdGlvbjtcbiAgX2JvdW5kVXBkYXRlTGluZURpZmZTdGF0ZTogRnVuY3Rpb247XG4gIF9ib3VuZE9uTmF2aWdhdGlvbkNsaWNrOiBGdW5jdGlvbjtcbiAgX2JvdW5kT25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudDogRnVuY3Rpb247XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBtb2RlOiBEaWZmTW9kZS5CUk9XU0VfTU9ERSxcbiAgICAgIGZpbGVQYXRoOiAnJyxcbiAgICAgIG9sZEVkaXRvclN0YXRlOiBpbml0aWFsRWRpdG9yU3RhdGUoKSxcbiAgICAgIG5ld0VkaXRvclN0YXRlOiBpbml0aWFsRWRpdG9yU3RhdGUoKSxcbiAgICB9O1xuICAgIHRoaXMuX2JvdW5kSGFuZGxlTmV3T2Zmc2V0cyA9IHRoaXMuX2hhbmRsZU5ld09mZnNldHMuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZFVwZGF0ZUxpbmVEaWZmU3RhdGUgPSB0aGlzLl91cGRhdGVMaW5lRGlmZlN0YXRlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRPbkNoYW5nZU5ld1RleHRFZGl0b3IgPSB0aGlzLl9vbkNoYW5nZU5ld1RleHRFZGl0b3IuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZE9uVGltZWxpbmVDaGFuZ2VSZXZpc2lvbiA9IHRoaXMuX29uVGltZWxpbmVDaGFuZ2VSZXZpc2lvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kT25OYXZpZ2F0aW9uQ2xpY2sgPSB0aGlzLl9vbk5hdmlnYXRpb25DbGljay5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kT25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudCA9IHRoaXMuX29uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9yZWFkb25seUJ1ZmZlciA9IG5ldyBUZXh0QnVmZmVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCB7ZGlmZk1vZGVsfSA9IHRoaXMucHJvcHM7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZGlmZk1vZGVsLm9uQWN0aXZlRmlsZVVwZGF0ZXModGhpcy5fYm91bmRVcGRhdGVMaW5lRGlmZlN0YXRlKSk7XG5cbiAgICB0aGlzLl9wYW5lQ29udGFpbmVyID0gY3JlYXRlUGFuZUNvbnRhaW5lcigpO1xuICAgIC8vIFRoZSBjaGFuZ2VkIGZpbGVzIHN0YXR1cyB0cmVlIHRha2VzIDEvNSBvZiB0aGUgd2lkdGggYW5kIGxpdmVzIG9uIHRoZSByaWdodCBtb3N0LFxuICAgIC8vIHdoaWxlIGJlaW5nIHZlcnRpY2FsbHkgc3BsdCB3aXRoIHRoZSByZXZpc2lvbiB0aW1lbGluZSBzdGFjayBwYW5lLlxuICAgIGNvbnN0IHRvcFBhbmUgPSB0aGlzLl9uZXdFZGl0b3JQYW5lID0gdGhpcy5fcGFuZUNvbnRhaW5lci5nZXRBY3RpdmVQYW5lKCk7XG4gICAgdGhpcy5fYm90dG9tUmlnaHRQYW5lID0gdG9wUGFuZS5zcGxpdERvd24oe1xuICAgICAgZmxleFNjYWxlOiAwLjMsXG4gICAgfSk7XG4gICAgdGhpcy5fdHJlZVBhbmUgPSB0aGlzLl9ib3R0b21SaWdodFBhbmUuc3BsaXRMZWZ0KHtcbiAgICAgIGZsZXhTY2FsZTogMC4zNSxcbiAgICB9KTtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uUGFuZSA9IHRvcFBhbmUuc3BsaXRSaWdodCh7XG4gICAgICBmbGV4U2NhbGU6IDAuMDQ1LFxuICAgIH0pO1xuICAgIHRoaXMuX29sZEVkaXRvclBhbmUgPSB0b3BQYW5lLnNwbGl0TGVmdCh7XG4gICAgICBmbGV4U2NhbGU6IDEsXG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZW5kZXJEaWZmVmlldygpO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fb2xkRWRpdG9yUGFuZSwgdHJ1ZSksXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fbmV3RWRpdG9yUGFuZSwgdHJ1ZSksXG4gICAgICB0aGlzLl9kZXN0cm95UGFuZURpc3Bvc2FibGUodGhpcy5fbmF2aWdhdGlvblBhbmUsIHRydWUpLFxuICAgICAgdGhpcy5fZGVzdHJveVBhbmVEaXNwb3NhYmxlKHRoaXMuX3RyZWVQYW5lLCB0cnVlKSxcbiAgICAgIHRoaXMuX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZSh0aGlzLl9ib3R0b21SaWdodFBhbmUpLFxuICAgICk7XG5cbiAgICBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3BhbmVDb250YWluZXInXSkuYXBwZW5kQ2hpbGQoXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fcGFuZUNvbnRhaW5lciksXG4gICAgKTtcblxuICAgIHRoaXMuX3VwZGF0ZUxpbmVEaWZmU3RhdGUoZGlmZk1vZGVsLmdldEFjdGl2ZUZpbGVTdGF0ZSgpKTtcbiAgfVxuXG4gIF9zZXR1cFN5bmNTY3JvbGwoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX29sZEVkaXRvckNvbXBvbmVudCA9PSBudWxsIHx8IHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG9sZFRleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50LmdldEVkaXRvckRvbUVsZW1lbnQoKTtcbiAgICBjb25zdCBuZXdUZXh0RWRpdG9yRWxlbWVudCA9IHRoaXMuX25ld0VkaXRvckNvbXBvbmVudC5nZXRFZGl0b3JEb21FbGVtZW50KCk7XG4gICAgY29uc3Qgc3luY1Njcm9sbCA9IHRoaXMuX3N5bmNTY3JvbGw7XG4gICAgaWYgKHN5bmNTY3JvbGwgIT0gbnVsbCkge1xuICAgICAgc3luY1Njcm9sbC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnJlbW92ZShzeW5jU2Nyb2xsKTtcbiAgICB9XG4gICAgdGhpcy5fc3luY1Njcm9sbCA9IG5ldyBTeW5jU2Nyb2xsKFxuICAgICAgb2xkVGV4dEVkaXRvckVsZW1lbnQsXG4gICAgICBuZXdUZXh0RWRpdG9yRWxlbWVudCxcbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRoaXMuX3N5bmNTY3JvbGwpO1xuICB9XG5cbiAgX29uQ2hhbmdlTW9kZShtb2RlOiBEaWZmTW9kZVR5cGUpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuc3RhdGUsXG4gICAgICBtb2RlLFxuICAgIH0pO1xuICB9XG5cbiAgX3JlbmRlckRpZmZWaWV3KCk6IHZvaWQge1xuICAgIHRoaXMuX3JlbmRlclRyZWUoKTtcbiAgICB0aGlzLl9yZW5kZXJFZGl0b3JzKCk7XG4gICAgdGhpcy5fcmVuZGVyTmF2aWdhdGlvbigpO1xuICAgIHRoaXMuX3JlbmRlckJvdHRvbVJpZ2h0UGFuZSh0aGlzLnN0YXRlLm1vZGUpO1xuICB9XG5cbiAgX3JlbmRlckJvdHRvbVJpZ2h0UGFuZShtb2RlOiBEaWZmTW9kZVR5cGUpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgIGNhc2UgRGlmZk1vZGUuQlJPV1NFX01PREU6XG4gICAgICAgIHRoaXMuX3JlbmRlclRpbWVsaW5lVmlldygpO1xuICAgICAgICB0aGlzLl9jb21taXRDb21wb25lbnQgPSBudWxsO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRGlmZk1vZGUuQ09NTUlUX01PREU6XG4gICAgICAgIHRoaXMuX3JlbmRlckNvbW1pdFZpZXcoKTtcbiAgICAgICAgdGhpcy5fdGltZWxpbmVDb21wb25lbnQgPSBudWxsO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBEaWZmIE1vZGU6ICR7bW9kZX1gKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fcmVuZGVyRGlmZlZpZXcoKTtcbiAgfVxuXG4gIF9yZW5kZXJDb21taXRWaWV3KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1pdENvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtY29tbWl0LXZpZXdcIj5cbiAgICAgICAgICBUT0RPIChTaG93IHRoZSBjb21taXQgbWVzc2FnZSBlZGl0b3IsIGxvYWQgdGVtcGxhdGUgbWVzc2FnZSBvciBhbWVuZCkuXG4gICAgICAgIDwvZGl2PlxuICAgICAgKSxcbiAgICAgIHRoaXMuX2dldFBhbmVFbGVtZW50KHRoaXMuX2JvdHRvbVJpZ2h0UGFuZSksXG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJUcmVlKCk6IHZvaWQge1xuICAgIHRoaXMuX3RyZWVDb21wb25lbnQgPSBSZWFjdERPTS5yZW5kZXIoXG4gICAgICAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kaWZmLXZpZXctdHJlZVwiPlxuICAgICAgICAgIDxEaWZmVmlld1RyZWUgZGlmZk1vZGVsPXt0aGlzLnByb3BzLmRpZmZNb2RlbH0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApLFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fdHJlZVBhbmUpLFxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyRWRpdG9ycygpOiB2b2lkIHtcbiAgICBjb25zdCB7ZmlsZVBhdGgsIG9sZEVkaXRvclN0YXRlOiBvbGRTdGF0ZSwgbmV3RWRpdG9yU3RhdGU6IG5ld1N0YXRlfSA9IHRoaXMuc3RhdGU7XG4gICAgdGhpcy5fb2xkRWRpdG9yQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgICA8RGlmZlZpZXdFZGl0b3JQYW5lXG4gICAgICAgICAgaGVhZGVyVGl0bGU9e29sZFN0YXRlLnJldmlzaW9uVGl0bGV9XG4gICAgICAgICAgdGV4dEJ1ZmZlcj17dGhpcy5fcmVhZG9ubHlCdWZmZXJ9XG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e29sZFN0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17b2xkU3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBzYXZlZENvbnRlbnRzPXtvbGRTdGF0ZS50ZXh0fVxuICAgICAgICAgIGluaXRpYWxUZXh0Q29udGVudD17b2xkU3RhdGUudGV4dH1cbiAgICAgICAgICBpbmxpbmVFbGVtZW50cz17b2xkU3RhdGUuaW5saW5lRWxlbWVudHN9XG4gICAgICAgICAgaGFuZGxlTmV3T2Zmc2V0cz17dGhpcy5fYm91bmRIYW5kbGVOZXdPZmZzZXRzfVxuICAgICAgICAgIHJlYWRPbmx5PXt0cnVlfS8+LFxuICAgICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9vbGRFZGl0b3JQYW5lKSxcbiAgICApO1xuICAgIGNvbnN0IHRleHRCdWZmZXIgPSBidWZmZXJGb3JVcmkoZmlsZVBhdGgpO1xuICAgIHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgICAgPERpZmZWaWV3RWRpdG9yUGFuZVxuICAgICAgICAgIGhlYWRlclRpdGxlPXtuZXdTdGF0ZS5yZXZpc2lvblRpdGxlfVxuICAgICAgICAgIHRleHRCdWZmZXI9e3RleHRCdWZmZXJ9XG4gICAgICAgICAgZmlsZVBhdGg9e2ZpbGVQYXRofVxuICAgICAgICAgIG9mZnNldHM9e25ld1N0YXRlLm9mZnNldHN9XG4gICAgICAgICAgaGlnaGxpZ2h0ZWRMaW5lcz17bmV3U3RhdGUuaGlnaGxpZ2h0ZWRMaW5lc31cbiAgICAgICAgICBpbml0aWFsVGV4dENvbnRlbnQ9e25ld1N0YXRlLnRleHR9XG4gICAgICAgICAgc2F2ZWRDb250ZW50cz17bmV3U3RhdGUuc2F2ZWRDb250ZW50c31cbiAgICAgICAgICBpbmxpbmVFbGVtZW50cz17bmV3U3RhdGUuaW5saW5lRWxlbWVudHN9XG4gICAgICAgICAgaGFuZGxlTmV3T2Zmc2V0cz17dGhpcy5fYm91bmRIYW5kbGVOZXdPZmZzZXRzfVxuICAgICAgICAgIG9uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQ9e3RoaXMuX2JvdW5kT25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudH1cbiAgICAgICAgICByZWFkT25seT17ZmFsc2V9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2JvdW5kT25DaGFuZ2VOZXdUZXh0RWRpdG9yfS8+LFxuICAgICAgICB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9uZXdFZGl0b3JQYW5lKSxcbiAgICApO1xuICB9XG5cbiAgX29uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0dXBTeW5jU2Nyb2xsKCk7XG4gIH1cblxuICBfcmVuZGVyVGltZWxpbmVWaWV3KCk6IHZvaWQge1xuICAgIHRoaXMuX3RpbWVsaW5lQ29tcG9uZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERpZmZUaW1lbGluZVZpZXdcbiAgICAgICAgZGlmZk1vZGVsPXt0aGlzLnByb3BzLmRpZmZNb2RlbH1cbiAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2U9e3RoaXMuX2JvdW5kT25UaW1lbGluZUNoYW5nZVJldmlzaW9ufS8+LFxuICAgICAgdGhpcy5fZ2V0UGFuZUVsZW1lbnQodGhpcy5fYm90dG9tUmlnaHRQYW5lKSxcbiAgICApO1xuICB9XG5cbiAgX3JlbmRlck5hdmlnYXRpb24oKTogdm9pZCB7XG4gICAgY29uc3Qge29sZEVkaXRvclN0YXRlLCBuZXdFZGl0b3JTdGF0ZX0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHtvZmZzZXRzOiBvbGRPZmZzZXRzLCBoaWdobGlnaHRlZExpbmVzOiBvbGRMaW5lcywgdGV4dDogb2xkQ29udGVudHN9ID0gb2xkRWRpdG9yU3RhdGU7XG4gICAgY29uc3Qge29mZnNldHM6IG5ld09mZnNldHMsIGhpZ2hsaWdodGVkTGluZXM6IG5ld0xpbmVzLCB0ZXh0OiBuZXdDb250ZW50c30gPSBuZXdFZGl0b3JTdGF0ZTtcbiAgICBjb25zdCBuYXZpZ2F0aW9uUGFuZUVsZW1lbnQgPSB0aGlzLl9nZXRQYW5lRWxlbWVudCh0aGlzLl9uYXZpZ2F0aW9uUGFuZSk7XG4gICAgdGhpcy5fbmF2aWdhdGlvbkNvbXBvbmVudCA9IFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxEaWZmTmF2aWdhdGlvbkJhclxuICAgICAgICBlbGVtZW50SGVpZ2h0PXtuYXZpZ2F0aW9uUGFuZUVsZW1lbnQuY2xpZW50SGVpZ2h0fVxuICAgICAgICBhZGRlZExpbmVzPXtuZXdMaW5lcy5hZGRlZH1cbiAgICAgICAgbmV3T2Zmc2V0cz17bmV3T2Zmc2V0c31cbiAgICAgICAgbmV3Q29udGVudHM9e25ld0NvbnRlbnRzfVxuICAgICAgICByZW1vdmVkTGluZXM9e29sZExpbmVzLnJlbW92ZWR9XG4gICAgICAgIG9sZE9mZnNldHM9e29sZE9mZnNldHN9XG4gICAgICAgIG9sZENvbnRlbnRzPXtvbGRDb250ZW50c31cbiAgICAgICAgb25DbGljaz17dGhpcy5fYm91bmRPbk5hdmlnYXRpb25DbGlja30vPixcbiAgICAgICAgbmF2aWdhdGlvblBhbmVFbGVtZW50LFxuICAgICk7XG4gIH1cblxuICBfb25OYXZpZ2F0aW9uQ2xpY2sobGluZU51bWJlcjogbnVtYmVyLCBpc0FkZGVkTGluZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGNvbnN0IHRleHRFZGl0b3JDb21wb25lbnQgPSBpc0FkZGVkTGluZSA/IHRoaXMuX25ld0VkaXRvckNvbXBvbmVudCA6IHRoaXMuX29sZEVkaXRvckNvbXBvbmVudDtcbiAgICBpbnZhcmlhbnQodGV4dEVkaXRvckNvbXBvbmVudCwgJ0RpZmYgVmlldyBOYXZpZ2F0aW9uIEVycm9yOiBOb24gdmFsaWQgdGV4dCBlZGl0b3IgY29tcG9uZW50Jyk7XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IHRleHRFZGl0b3JDb21wb25lbnQuZ2V0RWRpdG9yTW9kZWwoKTtcbiAgICB0ZXh0RWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW2xpbmVOdW1iZXIsIDBdKTtcbiAgfVxuXG4gIF9nZXRQYW5lRWxlbWVudChwYW5lOiBhdG9tJFBhbmUpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIGF0b20udmlld3MuZ2V0VmlldyhwYW5lKS5xdWVyeVNlbGVjdG9yKCcuaXRlbS12aWV3cycpO1xuICB9XG5cbiAgX2Rlc3Ryb3lQYW5lRGlzcG9zYWJsZShwYW5lOiBhdG9tJFBhbmUpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHBhbmUuZGVzdHJveSgpO1xuICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRpZmYtdmlldy1jb21wb25lbnRcIiByZWY9XCJwYW5lQ29udGFpbmVyXCIgLz5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZU5ld09mZnNldHMob2Zmc2V0c0Zyb21Db21wb25lbnRzOiBNYXApOiB2b2lkIHtcbiAgICBjb25zdCBvbGRMaW5lT2Zmc2V0cyA9IG5ldyBNYXAodGhpcy5zdGF0ZS5vbGRFZGl0b3JTdGF0ZS5vZmZzZXRzKTtcbiAgICBjb25zdCBuZXdMaW5lT2Zmc2V0cyA9IG5ldyBNYXAodGhpcy5zdGF0ZS5uZXdFZGl0b3JTdGF0ZS5vZmZzZXRzKTtcbiAgICBvZmZzZXRzRnJvbUNvbXBvbmVudHMuZm9yRWFjaCgob2Zmc2V0QW1vdW50LCByb3cpID0+IHtcbiAgICAgIG5ld0xpbmVPZmZzZXRzLnNldChyb3csIChuZXdMaW5lT2Zmc2V0cy5nZXQocm93KSB8fCAwKSArIG9mZnNldEFtb3VudCk7XG4gICAgICBvbGRMaW5lT2Zmc2V0cy5zZXQocm93LCAob2xkTGluZU9mZnNldHMuZ2V0KHJvdykgfHwgMCkgKyBvZmZzZXRBbW91bnQpO1xuICAgIH0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgLi4udGhpcy5zdGF0ZSxcbiAgICAgIG9sZEVkaXRvclN0YXRlOiB7Li4udGhpcy5zdGF0ZS5vbGRFZGl0b3JTdGF0ZSwgb2Zmc2V0czogb2xkTGluZU9mZnNldHN9LFxuICAgICAgbmV3RWRpdG9yU3RhdGU6IHsuLi50aGlzLnN0YXRlLm5ld0VkaXRvclN0YXRlLCBvZmZzZXRzOiBuZXdMaW5lT2Zmc2V0c30sXG4gICAgfSk7XG4gIH1cblxuICBfb25DaGFuZ2VOZXdUZXh0RWRpdG9yKG5ld0NvbnRlbnRzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5zZXROZXdDb250ZW50cyhuZXdDb250ZW50cyk7XG4gIH1cblxuICBfb25UaW1lbGluZUNoYW5nZVJldmlzaW9uKHJldmlzaW9uOiBSZXZpc2lvbkluZm8pOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5zZXRSZXZpc2lvbihyZXZpc2lvbik7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgbGluZSBkaWZmIHN0YXRlIG9uIGFjdGl2ZSBmaWxlIHN0YXRlIGNoYW5nZS5cbiAgICovXG4gIF91cGRhdGVMaW5lRGlmZlN0YXRlKGZpbGVTdGF0ZTogRmlsZUNoYW5nZVN0YXRlKTogdm9pZCB7XG4gICAgY29uc3Qge1xuICAgICAgZmlsZVBhdGgsXG4gICAgICBvbGRDb250ZW50cyxcbiAgICAgIG5ld0NvbnRlbnRzLFxuICAgICAgc2F2ZWRDb250ZW50cyxcbiAgICAgIGlubGluZUNvbXBvbmVudHMsXG4gICAgICBmcm9tUmV2aXNpb25UaXRsZSxcbiAgICAgIHRvUmV2aXNpb25UaXRsZSxcbiAgICB9ID0gZmlsZVN0YXRlO1xuXG4gICAgY29uc3Qge2NvbXB1dGVEaWZmfSA9IHJlcXVpcmUoJy4vZGlmZi11dGlscycpO1xuICAgIGNvbnN0IHthZGRlZExpbmVzLCByZW1vdmVkTGluZXMsIG9sZExpbmVPZmZzZXRzLCBuZXdMaW5lT2Zmc2V0c30gPVxuICAgICAgY29tcHV0ZURpZmYob2xkQ29udGVudHMsIG5ld0NvbnRlbnRzKTtcblxuICAgIGNvbnN0IG9sZEVkaXRvclN0YXRlID0ge1xuICAgICAgcmV2aXNpb25UaXRsZTogZnJvbVJldmlzaW9uVGl0bGUsXG4gICAgICB0ZXh0OiBvbGRDb250ZW50cyxcbiAgICAgIG9mZnNldHM6IG9sZExpbmVPZmZzZXRzLFxuICAgICAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgICAgICBhZGRlZDogW10sXG4gICAgICAgIHJlbW92ZWQ6IHJlbW92ZWRMaW5lcyxcbiAgICAgIH0sXG4gICAgICBpbmxpbmVFbGVtZW50czogaW5saW5lQ29tcG9uZW50cyB8fCBbXSxcbiAgICB9O1xuICAgIGNvbnN0IG5ld0VkaXRvclN0YXRlID0ge1xuICAgICAgcmV2aXNpb25UaXRsZTogdG9SZXZpc2lvblRpdGxlLFxuICAgICAgdGV4dDogbmV3Q29udGVudHMsXG4gICAgICBzYXZlZENvbnRlbnRzLFxuICAgICAgb2Zmc2V0czogbmV3TGluZU9mZnNldHMsXG4gICAgICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgICAgIGFkZGVkOiBhZGRlZExpbmVzLFxuICAgICAgICByZW1vdmVkOiBbXSxcbiAgICAgIH0sXG4gICAgICBpbmxpbmVFbGVtZW50czogW10sXG4gICAgfTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIC4uLnRoaXMuc3RhdGUsXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIG9sZEVkaXRvclN0YXRlLFxuICAgICAgbmV3RWRpdG9yU3RhdGUsXG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaWZmVmlld0NvbXBvbmVudDtcbiJdfQ==