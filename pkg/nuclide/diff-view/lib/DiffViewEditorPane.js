Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var _commons = require('../../commons');

var _reactForAtom = require('react-for-atom');

var _DiffViewEditor = require('./DiffViewEditor');

var _DiffViewEditor2 = _interopRequireDefault(_DiffViewEditor);

var _uiAtomTextEditor = require('../../ui/atom-text-editor');

var _uiAtomTextEditor2 = _interopRequireDefault(_uiAtomTextEditor);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var CHANGE_DEBOUNCE_DELAY_MS = 5;

/* eslint-disable react/prop-types */

var DiffViewEditorPane = (function (_React$Component) {
  _inherits(DiffViewEditorPane, _React$Component);

  function DiffViewEditorPane(props) {
    _classCallCheck(this, DiffViewEditorPane);

    _get(Object.getPrototypeOf(DiffViewEditorPane.prototype), 'constructor', this).call(this, props);
    this.state = {
      textContent: this.props.initialTextContent
    };
    this._subscriptions = new _atom.CompositeDisposable();
    this._isMounted = false;
  }

  _createClass(DiffViewEditorPane, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._isMounted = true;
      this._setupDiffEditor();
    }
  }, {
    key: '_setupDiffEditor',
    value: function _setupDiffEditor() {
      var _this = this;

      var editorSubscriptions = this._editorSubscriptions = new _atom.CompositeDisposable();
      this._subscriptions.add(editorSubscriptions);

      this._diffViewEditor = new _DiffViewEditor2['default'](this.getEditorDomElement());
      var textEditor = this.getEditorModel();

      var debouncedOnChange = (0, _commons.debounce)(function () {
        if (!_this._isMounted || textEditor !== _this.getEditorModel()) {
          return;
        }
        var textContent = textEditor.getText();
        if (textContent === _this.state.textContent) {
          return;
        }
        _this.setState({ textContent: textContent });
        if (_this.props.onChange) {
          _this.props.onChange(textContent);
        }
      }, CHANGE_DEBOUNCE_DELAY_MS, false);
      editorSubscriptions.add(textEditor.onDidChange(debouncedOnChange));
      /*
       * Those should have been synced automatically, but an implementation limitation of creating
       * a <atom-text-editor> element assumes default settings for those.
       * Filed: https://github.com/atom/atom/issues/10506
       */
      editorSubscriptions.add(atom.config.observe('editor.tabLength', function (tabLength) {
        textEditor.setTabLength(tabLength);
      }));
      editorSubscriptions.add(atom.config.observe('editor.softTabs', function (softTabs) {
        textEditor.setSoftTabs(softTabs);
      }));

      if (this.props.onDidUpdateTextEditorElement) {
        this.props.onDidUpdateTextEditorElement();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
      if (this._diffViewEditor != null) {
        var textEditor = this.getEditorModel();
        textEditor.destroy();
        this._diffViewEditor = null;
      }
      this._isMounted = false;
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(_uiAtomTextEditor2['default'], {
        ref: 'editor',
        readOnly: this.props.readOnly,
        textBuffer: this.props.textBuffer });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.initialTextContent !== nextProps.initialTextContent) {
        this.setState({ textContent: nextProps.initialTextContent });
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.textBuffer !== this.props.textBuffer) {
        var oldEditorSubscriptions = this._editorSubscriptions;
        if (oldEditorSubscriptions != null) {
          oldEditorSubscriptions.dispose();
          this._subscriptions.remove(oldEditorSubscriptions);
          this._editorSubscriptions = null;
        }
        this._setupDiffEditor();
      }
      this._updateDiffView(prevProps, prevState);
    }
  }, {
    key: '_updateDiffView',
    value: function _updateDiffView(oldProps, oldState) {
      var newProps = this.props;
      var newState = this.state;
      var diffEditorUpdated = oldProps.textBuffer !== newProps.textBuffer;
      // Cache latest disk contents for an accurate `isModified` functionality.
      newProps.textBuffer.cachedDiskContents = this.props.savedContents;
      if (diffEditorUpdated || oldProps.filePath !== newProps.filePath) {
        // Loading a new file should clear the undo history.
        this._setTextContent(newProps.filePath, newState.textContent, true /*clearHistory*/);
      } else if (newState.textContent !== oldState.textContent) {
          this._setTextContent(newProps.filePath, newState.textContent, false /*clearHistory*/);
        }
      if (diffEditorUpdated || oldProps.highlightedLines !== newProps.highlightedLines) {
        this._setHighlightedLines(newProps.highlightedLines);
      }
      if (diffEditorUpdated || oldProps.offsets !== newProps.offsets) {
        this._setOffsets(newProps.offsets);
      }
      if (oldProps.inlineElements !== newProps.inlineElements) {
        this._renderComponentsInline(newProps.inlineElements);
      }
    }
  }, {
    key: '_setTextContent',
    value: function _setTextContent(filePath, text, clearHistory) {
      (0, _assert2['default'])(this._diffViewEditor);
      this._diffViewEditor.setFileContents(filePath, text, clearHistory);
    }
  }, {
    key: '_setHighlightedLines',
    value: function _setHighlightedLines(highlightedLines) {
      (0, _assert2['default'])(this._diffViewEditor);
      this._diffViewEditor.setHighlightedLines(highlightedLines.added, highlightedLines.removed);
    }
  }, {
    key: '_setOffsets',
    value: function _setOffsets(offsets) {
      (0, _assert2['default'])(this._diffViewEditor);
      this._diffViewEditor.setOffsets(offsets);
    }
  }, {
    key: '_renderComponentsInline',
    value: _asyncToGenerator(function* (elements) {
      var _this2 = this;

      var diffViewEditor = this._diffViewEditor;
      (0, _assert2['default'])(diffViewEditor);
      var components = yield diffViewEditor.renderInlineComponents(elements);
      if (!this._isMounted || elements.length === 0) {
        return;
      }

      diffViewEditor.attachInlineComponents(components);
      var offsetsFromComponents = new Map();

      // TODO(gendron):
      // The React components aren't actually rendered in the DOM until the
      // associated decorations are attached to the TextEditor.
      // (see DiffViewEditor.attachInlineComponents)
      // There's no easy way to listen for this event, so just wait 0.5s per component.
      setTimeout(function () {
        if (!_this2._isMounted) {
          return;
        }
        var editorWidth = _this2.getEditorDomElement().clientWidth;
        components.forEach(function (element) {
          var domNode = _reactForAtom.ReactDOM.findDOMNode(element.component);
          // get the height of the component after it has been rendered in the DOM
          var componentHeight = domNode.clientHeight;
          var lineHeight = diffViewEditor.getLineHeightInPixels();

          // TODO(gendron):
          // Set the width of the overlay so that it won't resize when we
          // type comment replies into the text editor.
          domNode.style.width = editorWidth - 70 + 'px';

          // calculate the number of lines we need to insert in the buffer to make room
          // for the component to be displayed
          var offset = Math.ceil(componentHeight / lineHeight);
          var offsetRow = element.bufferRow;
          offsetsFromComponents.set(offsetRow, offset);

          // PhabricatorCommentsList is rendered with visibility: hidden.
          domNode.style.visibility = 'visible';
        });
        _this2.props.handleNewOffsets(offsetsFromComponents);
      }, components.length * 500);
    })
  }, {
    key: 'getEditorModel',
    value: function getEditorModel() {
      return this.refs['editor'].getModel();
    }
  }, {
    key: 'getEditorDomElement',
    value: function getEditorDomElement() {
      return this.refs['editor'].getElement();
    }
  }]);

  return DiffViewEditorPane;
})(_reactForAtom.React.Component);

exports['default'] = DiffViewEditorPane;
module.exports = exports['default'];

// TODO(most): move async code out of the view and deprecate the usage of `_isMounted`.
// All view changes should be pushed from the model/store through subscriptions.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3RWRpdG9yUGFuZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBY2tDLE1BQU07O3VCQUNqQixlQUFlOzs0QkFJL0IsZ0JBQWdCOzs4QkFDSSxrQkFBa0I7Ozs7Z0NBQ2xCLDJCQUEyQjs7OztzQkFDaEMsUUFBUTs7OztBQUU5QixJQUFNLHdCQUF3QixHQUFHLENBQUMsQ0FBQzs7OztJQXdCZCxrQkFBa0I7WUFBbEIsa0JBQWtCOztBQVcxQixXQVhRLGtCQUFrQixDQVd6QixLQUFZLEVBQUU7MEJBWFAsa0JBQWtCOztBQVluQywrQkFaaUIsa0JBQWtCLDZDQVk3QixLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsaUJBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQjtLQUMzQyxDQUFDO0FBQ0YsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUNoRCxRQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztHQUN6Qjs7ZUFsQmtCLGtCQUFrQjs7V0FvQnBCLDZCQUFTO0FBQ3hCLFVBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3pCOzs7V0FFZSw0QkFBUzs7O0FBQ3ZCLFVBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixHQUFHLCtCQUF5QixDQUFDO0FBQ2xGLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7O0FBRTdDLFVBQUksQ0FBQyxlQUFlLEdBQUcsZ0NBQW1CLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7QUFDdEUsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUV6QyxVQUFNLGlCQUFpQixHQUFHLHVCQUN4QixZQUFNO0FBQ0osWUFBSSxDQUFDLE1BQUssVUFBVSxJQUFJLFVB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QUEsT0FBTyxFQUFJO0FBQzVCLGNBQU0sT0FBTyxHQUFHLHVCQUFTLFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRXhELGNBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7QUFDN0MsY0FBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLHFCQUFxQixFQUFFLENBQUM7Ozs7O0FBSzFELGlCQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxBQUFDLFdBQVcsR0FBRyxFQUFFLEdBQUksSUFBSSxDQUFDOzs7O0FBSWhELGNBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxHQUFHLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZELGNBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFDcEMsK0JBQXFCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQzs7O0FBRzdDLGlCQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7U0FDdEMsQ0FBQyxDQUFDO0FBQ0gsZUFBSyxLQUFLLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLENBQUMsQ0FBQztPQUNwRCxFQUFFLFVBQVUsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7S0FDN0I7OztXQUVhLDBCQUFvQjtBQUNoQyxhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkM7OztXQUVrQiwrQkFBMkI7QUFDNUMsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQ3pDOzs7U0FsTWtCLGtCQUFrQjtHQUFTLG9CQUFNLFNBQVM7O3FCQUExQyxrQkFBa0IiLCJmaWxlIjoiRGlmZlZpZXdFZGl0b3JQYW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0hpZ2hsaWdodGVkTGluZXMsIE9mZnNldE1hcCwgSW5saW5lQ29tcG9uZW50fSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgRGlmZlZpZXdFZGl0b3IgZnJvbSAnLi9EaWZmVmlld0VkaXRvcic7XG5pbXBvcnQgQXRvbVRleHRFZGl0b3IgZnJvbSAnLi4vLi4vdWkvYXRvbS10ZXh0LWVkaXRvcic7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IENIQU5HRV9ERUJPVU5DRV9ERUxBWV9NUyA9IDU7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICB0ZXh0QnVmZmVyOiBhdG9tJFRleHRCdWZmZXIsXG4gIG9mZnNldHM6IE9mZnNldE1hcCxcbiAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgIGFkZGVkOiBBcnJheTxudW1iZXI+LFxuICAgIHJlbW92ZWQ6IEFycmF5PG51bWJlcj4sXG4gIH0sXG4gIGluaXRpYWxUZXh0Q29udGVudDogc3RyaW5nLFxuICBzYXZlZENvbnRlbnRzOiBzdHJpbmcsXG4gIGlubGluZUVsZW1lbnRzOiBBcnJheTxJbmxpbmVDb21wb25lbnQ+LFxuICBoYW5kbGVOZXdPZmZzZXRzOiAobmV3T2Zmc2V0czogT2Zmc2V0TWFwKSA9PiBhbnksXG4gIHJlYWRPbmx5OiBib29sZWFuLFxuICBvbkNoYW5nZTogKG5ld0NvbnRlbnRzOiBzdHJpbmcpID0+IGFueSxcbiAgb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudDogKCkgPT4gbWl4ZWQsXG59O1xuXG50eXBlIFN0YXRlID0ge1xuICB0ZXh0Q29udGVudDogc3RyaW5nO1xufTtcblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlZpZXdFZGl0b3JQYW5lIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgX2RpZmZWaWV3RWRpdG9yOiA/RGlmZlZpZXdFZGl0b3I7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZWRpdG9yU3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIC8vIFRPRE8obW9zdCk6IG1vdmUgYXN5bmMgY29kZSBvdXQgb2YgdGhlIHZpZXcgYW5kIGRlcHJlY2F0ZSB0aGUgdXNhZ2Ugb2YgYF9pc01vdW50ZWRgLlxuICAvLyBBbGwgdmlldyBjaGFuZ2VzIHNob3VsZCBiZSBwdXNoZWQgZnJvbSB0aGUgbW9kZWwvc3RvcmUgdGhyb3VnaCBzdWJzY3JpcHRpb25zLlxuICBfaXNNb3VudGVkOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgdGV4dENvbnRlbnQ6IHRoaXMucHJvcHMuaW5pdGlhbFRleHRDb250ZW50LFxuICAgIH07XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc01vdW50ZWQgPSB0cnVlO1xuICAgIHRoaXMuX3NldHVwRGlmZkVkaXRvcigpO1xuICB9XG5cbiAgX3NldHVwRGlmZkVkaXRvcigpOiB2b2lkIHtcbiAgICBjb25zdCBlZGl0b3JTdWJzY3JpcHRpb25zID0gdGhpcy5fZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yU3Vic2NyaXB0aW9ucyk7XG5cbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvciA9IG5ldyBEaWZmVmlld0VkaXRvcih0aGlzLmdldEVkaXRvckRvbUVsZW1lbnQoKSk7XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IHRoaXMuZ2V0RWRpdG9yTW9kZWwoKTtcblxuICAgIGNvbnN0IGRlYm91bmNlZE9uQ2hhbmdlID0gZGVib3VuY2UoXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5faXNNb3VudGVkIHx8IHRleHRFZGl0b3IgIT09IHRoaXMuZ2V0RWRpdG9yTW9kZWwoKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZXh0Q29udGVudCA9IHRleHRFZGl0b3IuZ2V0VGV4dCgpO1xuICAgICAgICBpZiAodGV4dENvbnRlbnQgPT09IHRoaXMuc3RhdGUudGV4dENvbnRlbnQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dGV4dENvbnRlbnR9KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRleHRDb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIENIQU5HRV9ERUJPVU5DRV9ERUxBWV9NUyxcbiAgICAgIGZhbHNlLFxuICAgICk7XG4gICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQodGV4dEVkaXRvci5vbkRpZENoYW5nZShkZWJvdW5jZWRPbkNoYW5nZSkpO1xuICAgIC8qXG4gICAgICogVGhvc2Ugc2hvdWxkIGhhdmUgYmVlbiBzeW5jZWQgYXV0b21hdGljYWxseSwgYnV0IGFuIGltcGxlbWVudGF0aW9uIGxpbWl0YXRpb24gb2YgY3JlYXRpbmdcbiAgICAgKiBhIDxhdG9tLXRleHQtZWRpdG9yPiBlbGVtZW50IGFzc3VtZXMgZGVmYXVsdCBzZXR0aW5ncyBmb3IgdGhvc2UuXG4gICAgICogRmlsZWQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzEwNTA2XG4gICAgICovXG4gICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLnRhYkxlbmd0aCcsIHRhYkxlbmd0aCA9PiB7XG4gICAgICB0ZXh0RWRpdG9yLnNldFRhYkxlbmd0aCh0YWJMZW5ndGgpO1xuICAgIH0pKTtcbiAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdlZGl0b3Iuc29mdFRhYnMnLCBzb2Z0VGFicyA9PiB7XG4gICAgICB0ZXh0RWRpdG9yLnNldFNvZnRUYWJzKHNvZnRUYWJzKTtcbiAgICB9KSk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KSB7XG4gICAgICB0aGlzLnByb3BzLm9uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQoKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5fZGlmZlZpZXdFZGl0b3IgIT0gbnVsbCkge1xuICAgICAgY29uc3QgdGV4dEVkaXRvciA9IHRoaXMuZ2V0RWRpdG9yTW9kZWwoKTtcbiAgICAgIHRleHRFZGl0b3IuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fZGlmZlZpZXdFZGl0b3IgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgcmVmPVwiZWRpdG9yXCJcbiAgICAgICAgcmVhZE9ubHk9e3RoaXMucHJvcHMucmVhZE9ubHl9XG4gICAgICAgIHRleHRCdWZmZXI9e3RoaXMucHJvcHMudGV4dEJ1ZmZlcn0gLz5cbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IFByb3BzKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuaW5pdGlhbFRleHRDb250ZW50ICE9PSBuZXh0UHJvcHMuaW5pdGlhbFRleHRDb250ZW50KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt0ZXh0Q29udGVudDogbmV4dFByb3BzLmluaXRpYWxUZXh0Q29udGVudH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFByb3BzLCBwcmV2U3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gICAgaWYgKHByZXZQcm9wcy50ZXh0QnVmZmVyICE9PSB0aGlzLnByb3BzLnRleHRCdWZmZXIpIHtcbiAgICAgIGNvbnN0IG9sZEVkaXRvclN1YnNjcmlwdGlvbnMgPSB0aGlzLl9lZGl0b3JTdWJzY3JpcHRpb25zO1xuICAgICAgaWYgKG9sZEVkaXRvclN1YnNjcmlwdGlvbnMgIT0gbnVsbCkge1xuICAgICAgICBvbGRFZGl0b3JTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5yZW1vdmUob2xkRWRpdG9yU3Vic2NyaXB0aW9ucyk7XG4gICAgICAgIHRoaXMuX2VkaXRvclN1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2V0dXBEaWZmRWRpdG9yKCk7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZURpZmZWaWV3KHByZXZQcm9wcywgcHJldlN0YXRlKTtcbiAgfVxuXG4gIF91cGRhdGVEaWZmVmlldyhvbGRQcm9wczogUHJvcHMsIG9sZFN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICAgIGNvbnN0IG5ld1Byb3BzID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBuZXdTdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgZGlmZkVkaXRvclVwZGF0ZWQgPSBvbGRQcm9wcy50ZXh0QnVmZmVyICE9PSBuZXdQcm9wcy50ZXh0QnVmZmVyO1xuICAgIC8vIENhY2hlIGxhdGVzdCBkaXNrIGNvbnRlbnRzIGZvciBhbiBhY2N1cmF0ZSBgaXNNb2RpZmllZGAgZnVuY3Rpb25hbGl0eS5cbiAgICBuZXdQcm9wcy50ZXh0QnVmZmVyLmNhY2hlZERpc2tDb250ZW50cyA9IHRoaXMucHJvcHMuc2F2ZWRDb250ZW50cztcbiAgICBpZiAoZGlmZkVkaXRvclVwZGF0ZWQgfHwgb2xkUHJvcHMuZmlsZVBhdGggIT09IG5ld1Byb3BzLmZpbGVQYXRoKSB7XG4gICAgICAvLyBMb2FkaW5nIGEgbmV3IGZpbGUgc2hvdWxkIGNsZWFyIHRoZSB1bmRvIGhpc3RvcnkuXG4gICAgICB0aGlzLl9zZXRUZXh0Q29udGVudChuZXdQcm9wcy5maWxlUGF0aCwgbmV3U3RhdGUudGV4dENvbnRlbnQsIHRydWUgLypjbGVhckhpc3RvcnkqLyk7XG4gICAgfSBlbHNlIGlmIChuZXdTdGF0ZS50ZXh0Q29udGVudCAhPT0gb2xkU3RhdGUudGV4dENvbnRlbnQpIHtcbiAgICAgIHRoaXMuX3NldFRleHRDb250ZW50KG5ld1Byb3BzLmZpbGVQYXRoLCBuZXdTdGF0ZS50ZXh0Q29udGVudCwgZmFsc2UgLypjbGVhckhpc3RvcnkqLyk7XG4gICAgfVxuICAgIGlmIChkaWZmRWRpdG9yVXBkYXRlZCB8fCBvbGRQcm9wcy5oaWdobGlnaHRlZExpbmVzICE9PSBuZXdQcm9wcy5oaWdobGlnaHRlZExpbmVzKSB7XG4gICAgICB0aGlzLl9zZXRIaWdobGlnaHRlZExpbmVzKG5ld1Byb3BzLmhpZ2hsaWdodGVkTGluZXMpO1xuICAgIH1cbiAgICBpZiAoZGlmZkVkaXRvclVwZGF0ZWQgfHwgb2xkUHJvcHMub2Zmc2V0cyAhPT0gbmV3UHJvcHMub2Zmc2V0cykge1xuICAgICAgdGhpcy5fc2V0T2Zmc2V0cyhuZXdQcm9wcy5vZmZzZXRzKTtcbiAgICB9XG4gICAgaWYgKG9sZFByb3BzLmlubGluZUVsZW1lbnRzICE9PSBuZXdQcm9wcy5pbmxpbmVFbGVtZW50cykge1xuICAgICAgdGhpcy5fcmVuZGVyQ29tcG9uZW50c0lubGluZShuZXdQcm9wcy5pbmxpbmVFbGVtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgX3NldFRleHRDb250ZW50KGZpbGVQYXRoOiBzdHJpbmcsIHRleHQ6IHN0cmluZywgY2xlYXJIaXN0b3J5OiBib29sZWFuKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zZXRGaWxlQ29udGVudHMoZmlsZVBhdGgsIHRleHQsIGNsZWFySGlzdG9yeSk7XG4gIH1cblxuICBfc2V0SGlnaGxpZ2h0ZWRMaW5lcyhoaWdobGlnaHRlZExpbmVzOiBIaWdobGlnaHRlZExpbmVzKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zZXRIaWdobGlnaHRlZExpbmVzKGhpZ2hsaWdodGVkTGluZXMuYWRkZWQsIGhpZ2hsaWdodGVkTGluZXMucmVtb3ZlZCk7XG4gIH1cblxuICBfc2V0T2Zmc2V0cyhvZmZzZXRzOiBPZmZzZXRNYXApOiB2b2lkIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fZGlmZlZpZXdFZGl0b3IpO1xuICAgIHRoaXMuX2RpZmZWaWV3RWRpdG9yLnNldE9mZnNldHMob2Zmc2V0cyk7XG4gIH1cblxuICBhc3luYyBfcmVuZGVyQ29tcG9uZW50c0lubGluZShlbGVtZW50czogQXJyYXk8T2JqZWN0Pik6IFByb21pc2Uge1xuICAgIGNvbnN0IGRpZmZWaWV3RWRpdG9yID0gdGhpcy5fZGlmZlZpZXdFZGl0b3I7XG4gICAgaW52YXJpYW50KGRpZmZWaWV3RWRpdG9yKTtcbiAgICBjb25zdCBjb21wb25lbnRzID0gYXdhaXQgZGlmZlZpZXdFZGl0b3IucmVuZGVySW5saW5lQ29tcG9uZW50cyhlbGVtZW50cyk7XG4gICAgaWYgKCF0aGlzLl9pc01vdW50ZWQgfHwgZWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZGlmZlZpZXdFZGl0b3IuYXR0YWNoSW5saW5lQ29tcG9uZW50cyhjb21wb25lbnRzKTtcbiAgICBjb25zdCBvZmZzZXRzRnJvbUNvbXBvbmVudHMgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBUT0RPKGdlbmRyb24pOlxuICAgIC8vIFRoZSBSZWFjdCBjb21wb25lbnRzIGFyZW4ndCBhY3R1YWxseSByZW5kZXJlZCBpbiB0aGUgRE9NIHVudGlsIHRoZVxuICAgIC8vIGFzc29jaWF0ZWQgZGVjb3JhdGlvbnMgYXJlIGF0dGFjaGVkIHRvIHRoZSBUZXh0RWRpdG9yLlxuICAgIC8vIChzZWUgRGlmZlZpZXdFZGl0b3IuYXR0YWNoSW5saW5lQ29tcG9uZW50cylcbiAgICAvLyBUaGVyZSdzIG5vIGVhc3kgd2F5IHRvIGxpc3RlbiBmb3IgdGhpcyBldmVudCwgc28ganVzdCB3YWl0IDAuNXMgcGVyIGNvbXBvbmVudC5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5faXNNb3VudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVkaXRvcldpZHRoID0gdGhpcy5nZXRFZGl0b3JEb21FbGVtZW50KCkuY2xpZW50V2lkdGg7XG4gICAgICBjb21wb25lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGNvbnN0IGRvbU5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZShlbGVtZW50LmNvbXBvbmVudCk7XG4gICAgICAgIC8vIGdldCB0aGUgaGVpZ2h0IG9mIHRoZSBjb21wb25lbnQgYWZ0ZXIgaXQgaGFzIGJlZW4gcmVuZGVyZWQgaW4gdGhlIERPTVxuICAgICAgICBjb25zdCBjb21wb25lbnRIZWlnaHQgPSBkb21Ob2RlLmNsaWVudEhlaWdodDtcbiAgICAgICAgY29uc3QgbGluZUhlaWdodCA9IGRpZmZWaWV3RWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpO1xuXG4gICAgICAgIC8vIFRPRE8oZ2VuZHJvbik6XG4gICAgICAgIC8vIFNldCB0aGUgd2lkdGggb2YgdGhlIG92ZXJsYXkgc28gdGhhdCBpdCB3b24ndCByZXNpemUgd2hlbiB3ZVxuICAgICAgICAvLyB0eXBlIGNvbW1lbnQgcmVwbGllcyBpbnRvIHRoZSB0ZXh0IGVkaXRvci5cbiAgICAgICAgZG9tTm9kZS5zdHlsZS53aWR0aCA9IChlZGl0b3JXaWR0aCAtIDcwKSArICdweCc7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBudW1iZXIgb2YgbGluZXMgd2UgbmVlZCB0byBpbnNlcnQgaW4gdGhlIGJ1ZmZlciB0byBtYWtlIHJvb21cbiAgICAgICAgLy8gZm9yIHRoZSBjb21wb25lbnQgdG8gYmUgZGlzcGxheWVkXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IE1hdGguY2VpbChjb21wb25lbnRIZWlnaHQgLyBsaW5lSGVpZ2h0KTtcbiAgICAgICAgY29uc3Qgb2Zmc2V0Um93ID0gZWxlbWVudC5idWZmZXJSb3c7XG4gICAgICAgIG9mZnNldHNGcm9tQ29tcG9uZW50cy5zZXQob2Zmc2V0Um93LCBvZmZzZXQpO1xuXG4gICAgICAgIC8vIFBoYWJyaWNhdG9yQ29tbWVudHNMaXN0IGlzIHJlbmRlcmVkIHdpdGggdmlzaWJpbGl0eTogaGlkZGVuLlxuICAgICAgICBkb21Ob2RlLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvcHMuaGFuZGxlTmV3T2Zmc2V0cyhvZmZzZXRzRnJvbUNvbXBvbmVudHMpO1xuICAgIH0sIGNvbXBvbmVudHMubGVuZ3RoICogNTAwKTtcbiAgfVxuXG4gIGdldEVkaXRvck1vZGVsKCk6IGF0b20kVGV4dEVkaXRvciB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snZWRpdG9yJ10uZ2V0TW9kZWwoKTtcbiAgfVxuXG4gIGdldEVkaXRvckRvbUVsZW1lbnQoKTogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snZWRpdG9yJ10uZ2V0RWxlbWVudCgpO1xuICB9XG59XG4iXX0=