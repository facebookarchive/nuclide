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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var CHANGE_DEBOUNCE_DELAY_MS = 100;

/* eslint-disable react/prop-types */

var DiffViewEditorPane = (function (_React$Component) {
  _inherits(DiffViewEditorPane, _React$Component);

  function DiffViewEditorPane(props) {
    _classCallCheck(this, DiffViewEditorPane);

    _get(Object.getPrototypeOf(DiffViewEditorPane.prototype), 'constructor', this).call(this, props);
    this.state = {
      textContent: this.props.initialTextContent
    };
    this._isMounted = false;
    this._subscriptions = new _atom.CompositeDisposable();
  }

  _createClass(DiffViewEditorPane, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this._isMounted = true;
      var diffViewEditor = this._diffViewEditor = new _DiffViewEditor2['default'](this.getEditorDomElement());
      var textEditor = this.getEditorModel();
      var debouncedOnChange = (0, _commons.debounce)(function () {
        var textContent = textEditor.getText();
        _this.setState({ textContent: textContent });
        if (_this.props.onChange) {
          _this.props.onChange(textContent);
        }
      }, CHANGE_DEBOUNCE_DELAY_MS, false);
      if (this.props.readOnly) {
        diffViewEditor.setReadOnly();
      }
      this._subscriptions.add(textEditor.onDidChange(debouncedOnChange));
      /*
       * Those should have been synced automatically, but an implementation limitation of creating
       * a <atom-text-editor> element assumes default settings for those.
       * Filed: https://github.com/atom/atom/issues/10506
       */
      this._subscriptions.add(atom.config.observe('editor.tabLength', function (tabLength) {
        textEditor.setTabLength(tabLength);
      }));
      this._subscriptions.add(atom.config.observe('editor.softTabs', function (softTabs) {
        textEditor.setSoftTabs(softTabs);
      }));
      this._updateDiffView(this.props, this.state);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._subscriptions) {
        this._subscriptions.dispose();
      }
      if (this._diffViewEditor) {
        var textEditor = this.getEditorModel();
        textEditor.destroy();
        this._diffViewEditor = null;
      }
      this._isMounted = false;
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return false;
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement('atom-text-editor', { ref: 'editor', style: { height: '100%', overflow: 'hidden' } });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      var newState = this.state;
      if (newProps.initialTextContent !== this.state.textContent) {
        newState = { textContent: newProps.initialTextContent };
        this.setState(newState);
        this._setTextContent(newProps.filePath, newState.textContent, false /*clearHistory*/);
      }
      this._updateDiffView(newProps, newState);
    }
  }, {
    key: '_updateDiffView',
    value: function _updateDiffView(newProps, newState) {
      var oldProps = this.props;
      if (oldProps.filePath !== newProps.filePath) {
        // Loading a new file should clear the undo history.
        this._setTextContent(newProps.filePath, newState.textContent, true /*clearHistory*/);
      }
      if (oldProps.highlightedLines !== newProps.highlightedLines) {
        this._setHighlightedLines(newProps.highlightedLines);
      }
      if (oldProps.offsets !== newProps.offsets) {
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
      if (!this._isMounted) {
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
      (0, _assert2['default'])(this._diffViewEditor);
      return this._diffViewEditor.getModel();
    }
  }, {
    key: 'getEditorDomElement',
    value: function getEditorDomElement() {
      return _reactForAtom.ReactDOM.findDOMNode(this.refs['editor']);
    }
  }]);

  return DiffViewEditorPane;
})(_reactForAtom.React.Component);

exports['default'] = DiffViewEditorPane;
module.exports = exports['default'];

// TODO(most): move async code out of the view and deprecate the usage of `_isMounted`.
// All view changes should be pushed from the model/store through subscriptions.
//# sourceMappingURL=data:application/json;base64,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QUFRLENBQUMsQ0FBQyxDQUFDO0tBQ2xEOzs7U0F4S2tCLGtCQUFrQjtHQUFTLG9CQUFNLFNBQVM7O3FCQUExQyxrQkFBa0IiLCJmaWxlIjoiRGlmZlZpZXdFZGl0b3JQYW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0hpZ2hsaWdodGVkTGluZXMsIE9mZnNldE1hcCwgSW5saW5lQ29tcG9uZW50fSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgRGlmZlZpZXdFZGl0b3IgZnJvbSAnLi9EaWZmVmlld0VkaXRvcic7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IENIQU5HRV9ERUJPVU5DRV9ERUxBWV9NUyA9IDEwMDtcblxudHlwZSBQcm9wcyA9IHtcbiAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gIG9mZnNldHM6IE9mZnNldE1hcCxcbiAgaGlnaGxpZ2h0ZWRMaW5lczoge1xuICAgIGFkZGVkOiBBcnJheTxudW1iZXI+O1xuICAgIHJlbW92ZWQ6IEFycmF5PG51bWJlcj47XG4gIH0sXG4gIGluaXRpYWxUZXh0Q29udGVudDogc3RyaW5nO1xuICBpbmxpbmVFbGVtZW50czogQXJyYXk8SW5saW5lQ29tcG9uZW50PjtcbiAgaGFuZGxlTmV3T2Zmc2V0czogKG5ld09mZnNldHM6IE9mZnNldE1hcCkgPT4gYW55LFxuICByZWFkT25seTogYm9vbGVhbixcbiAgb25DaGFuZ2U6IChuZXdDb250ZW50czogc3RyaW5nKSA9PiBhbnksXG59O1xuXG50eXBlIFN0YXRlID0ge1xuICB0ZXh0Q29udGVudDogc3RyaW5nO1xufTtcblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlZpZXdFZGl0b3JQYW5lIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgX2RpZmZWaWV3RWRpdG9yOiA/RGlmZlZpZXdFZGl0b3I7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICAvLyBUT0RPKG1vc3QpOiBtb3ZlIGFzeW5jIGNvZGUgb3V0IG9mIHRoZSB2aWV3IGFuZCBkZXByZWNhdGUgdGhlIHVzYWdlIG9mIGBfaXNNb3VudGVkYC5cbiAgLy8gQWxsIHZpZXcgY2hhbmdlcyBzaG91bGQgYmUgcHVzaGVkIGZyb20gdGhlIG1vZGVsL3N0b3JlIHRocm91Z2ggc3Vic2NyaXB0aW9ucy5cbiAgX2lzTW91bnRlZDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHRleHRDb250ZW50OiB0aGlzLnByb3BzLmluaXRpYWxUZXh0Q29udGVudCxcbiAgICB9O1xuICAgIHRoaXMuX2lzTW91bnRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5faXNNb3VudGVkID0gdHJ1ZTtcbiAgICBjb25zdCBkaWZmVmlld0VkaXRvciA9IHRoaXMuX2RpZmZWaWV3RWRpdG9yID0gbmV3IERpZmZWaWV3RWRpdG9yKHRoaXMuZ2V0RWRpdG9yRG9tRWxlbWVudCgpKTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGhpcy5nZXRFZGl0b3JNb2RlbCgpO1xuICAgIGNvbnN0IGRlYm91bmNlZE9uQ2hhbmdlID0gZGVib3VuY2UoXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHRDb250ZW50ID0gdGV4dEVkaXRvci5nZXRUZXh0KCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3RleHRDb250ZW50fSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0ZXh0Q29udGVudCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBDSEFOR0VfREVCT1VOQ0VfREVMQVlfTVMsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIGlmICh0aGlzLnByb3BzLnJlYWRPbmx5KSB7XG4gICAgICBkaWZmVmlld0VkaXRvci5zZXRSZWFkT25seSgpO1xuICAgIH1cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZCh0ZXh0RWRpdG9yLm9uRGlkQ2hhbmdlKGRlYm91bmNlZE9uQ2hhbmdlKSk7XG4gICAgLypcbiAgICAgKiBUaG9zZSBzaG91bGQgaGF2ZSBiZWVuIHN5bmNlZCBhdXRvbWF0aWNhbGx5LCBidXQgYW4gaW1wbGVtZW50YXRpb24gbGltaXRhdGlvbiBvZiBjcmVhdGluZ1xuICAgICAqIGEgPGF0b20tdGV4dC1lZGl0b3I+IGVsZW1lbnQgYXNzdW1lcyBkZWZhdWx0IHNldHRpbmdzIGZvciB0aG9zZS5cbiAgICAgKiBGaWxlZDogaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvMTA1MDZcbiAgICAgKi9cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdlZGl0b3IudGFiTGVuZ3RoJywgdGFiTGVuZ3RoID0+IHtcbiAgICAgIHRleHRFZGl0b3Iuc2V0VGFiTGVuZ3RoKHRhYkxlbmd0aCk7XG4gICAgfSkpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2VkaXRvci5zb2Z0VGFicycsIHNvZnRUYWJzID0+IHtcbiAgICAgIHRleHRFZGl0b3Iuc2V0U29mdFRhYnMoc29mdFRhYnMpO1xuICAgIH0pKTtcbiAgICB0aGlzLl91cGRhdGVEaWZmVmlldyh0aGlzLnByb3BzLCB0aGlzLnN0YXRlKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2RpZmZWaWV3RWRpdG9yKSB7XG4gICAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGhpcy5nZXRFZGl0b3JNb2RlbCgpO1xuICAgICAgdGV4dEVkaXRvci5kZXN0cm95KCk7XG4gICAgICB0aGlzLl9kaWZmVmlld0VkaXRvciA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX2lzTW91bnRlZCA9IGZhbHNlO1xuICB9XG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogT2JqZWN0LCBuZXh0U3RhdGU6IE9iamVjdCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8YXRvbS10ZXh0LWVkaXRvciByZWY9XCJlZGl0b3JcIiBzdHlsZT17e2hlaWdodDogJzEwMCUnLCBvdmVyZmxvdzogJ2hpZGRlbid9fSAvPlxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICBsZXQgbmV3U3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgIGlmIChuZXdQcm9wcy5pbml0aWFsVGV4dENvbnRlbnQgIT09IHRoaXMuc3RhdGUudGV4dENvbnRlbnQpIHtcbiAgICAgIG5ld1N0YXRlID0ge3RleHRDb250ZW50OiBuZXdQcm9wcy5pbml0aWFsVGV4dENvbnRlbnR9O1xuICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgICB0aGlzLl9zZXRUZXh0Q29udGVudChuZXdQcm9wcy5maWxlUGF0aCwgbmV3U3RhdGUudGV4dENvbnRlbnQsIGZhbHNlIC8qY2xlYXJIaXN0b3J5Ki8pO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVEaWZmVmlldyhuZXdQcm9wcywgbmV3U3RhdGUpO1xuICB9XG5cbiAgX3VwZGF0ZURpZmZWaWV3KG5ld1Byb3BzOiBPYmplY3QsIG5ld1N0YXRlOiBPYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCBvbGRQcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG9sZFByb3BzLmZpbGVQYXRoICE9PSBuZXdQcm9wcy5maWxlUGF0aCkge1xuICAgICAgLy8gTG9hZGluZyBhIG5ldyBmaWxlIHNob3VsZCBjbGVhciB0aGUgdW5kbyBoaXN0b3J5LlxuICAgICAgdGhpcy5fc2V0VGV4dENvbnRlbnQobmV3UHJvcHMuZmlsZVBhdGgsIG5ld1N0YXRlLnRleHRDb250ZW50LCB0cnVlIC8qY2xlYXJIaXN0b3J5Ki8pO1xuICAgIH1cbiAgICBpZiAob2xkUHJvcHMuaGlnaGxpZ2h0ZWRMaW5lcyAhPT0gbmV3UHJvcHMuaGlnaGxpZ2h0ZWRMaW5lcykge1xuICAgICAgdGhpcy5fc2V0SGlnaGxpZ2h0ZWRMaW5lcyhuZXdQcm9wcy5oaWdobGlnaHRlZExpbmVzKTtcbiAgICB9XG4gICAgaWYgKG9sZFByb3BzLm9mZnNldHMgIT09IG5ld1Byb3BzLm9mZnNldHMpIHtcbiAgICAgIHRoaXMuX3NldE9mZnNldHMobmV3UHJvcHMub2Zmc2V0cyk7XG4gICAgfVxuICAgIGlmIChvbGRQcm9wcy5pbmxpbmVFbGVtZW50cyAhPT0gbmV3UHJvcHMuaW5saW5lRWxlbWVudHMpIHtcbiAgICAgIHRoaXMuX3JlbmRlckNvbXBvbmVudHNJbmxpbmUobmV3UHJvcHMuaW5saW5lRWxlbWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRUZXh0Q29udGVudChmaWxlUGF0aDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcsIGNsZWFySGlzdG9yeTogYm9vbGVhbik6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLl9kaWZmVmlld0VkaXRvcik7XG4gICAgdGhpcy5fZGlmZlZpZXdFZGl0b3Iuc2V0RmlsZUNvbnRlbnRzKGZpbGVQYXRoLCB0ZXh0LCBjbGVhckhpc3RvcnkpO1xuICB9XG5cbiAgX3NldEhpZ2hsaWdodGVkTGluZXMoaGlnaGxpZ2h0ZWRMaW5lczogSGlnaGxpZ2h0ZWRMaW5lcyk6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLl9kaWZmVmlld0VkaXRvcik7XG4gICAgdGhpcy5fZGlmZlZpZXdFZGl0b3Iuc2V0SGlnaGxpZ2h0ZWRMaW5lcyhoaWdobGlnaHRlZExpbmVzLmFkZGVkLCBoaWdobGlnaHRlZExpbmVzLnJlbW92ZWQpO1xuICB9XG5cbiAgX3NldE9mZnNldHMob2Zmc2V0czogT2Zmc2V0TWFwKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zZXRPZmZzZXRzKG9mZnNldHMpO1xuICB9XG5cbiAgYXN5bmMgX3JlbmRlckNvbXBvbmVudHNJbmxpbmUoZWxlbWVudHM6IEFycmF5PE9iamVjdD4pOiBQcm9taXNlIHtcbiAgICBjb25zdCBkaWZmVmlld0VkaXRvciA9IHRoaXMuX2RpZmZWaWV3RWRpdG9yO1xuICAgIGludmFyaWFudChkaWZmVmlld0VkaXRvcik7XG4gICAgY29uc3QgY29tcG9uZW50cyA9IGF3YWl0IGRpZmZWaWV3RWRpdG9yLnJlbmRlcklubGluZUNvbXBvbmVudHMoZWxlbWVudHMpO1xuICAgIGlmICghdGhpcy5faXNNb3VudGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZGlmZlZpZXdFZGl0b3IuYXR0YWNoSW5saW5lQ29tcG9uZW50cyhjb21wb25lbnRzKTtcbiAgICBjb25zdCBvZmZzZXRzRnJvbUNvbXBvbmVudHMgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBUT0RPKGdlbmRyb24pOlxuICAgIC8vIFRoZSBSZWFjdCBjb21wb25lbnRzIGFyZW4ndCBhY3R1YWxseSByZW5kZXJlZCBpbiB0aGUgRE9NIHVudGlsIHRoZVxuICAgIC8vIGFzc29jaWF0ZWQgZGVjb3JhdGlvbnMgYXJlIGF0dGFjaGVkIHRvIHRoZSBUZXh0RWRpdG9yLlxuICAgIC8vIChzZWUgRGlmZlZpZXdFZGl0b3IuYXR0YWNoSW5saW5lQ29tcG9uZW50cylcbiAgICAvLyBUaGVyZSdzIG5vIGVhc3kgd2F5IHRvIGxpc3RlbiBmb3IgdGhpcyBldmVudCwgc28ganVzdCB3YWl0IDAuNXMgcGVyIGNvbXBvbmVudC5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5faXNNb3VudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVkaXRvcldpZHRoID0gdGhpcy5nZXRFZGl0b3JEb21FbGVtZW50KCkuY2xpZW50V2lkdGg7XG4gICAgICBjb21wb25lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGNvbnN0IGRvbU5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZShlbGVtZW50LmNvbXBvbmVudCk7XG4gICAgICAgIC8vIGdldCB0aGUgaGVpZ2h0IG9mIHRoZSBjb21wb25lbnQgYWZ0ZXIgaXQgaGFzIGJlZW4gcmVuZGVyZWQgaW4gdGhlIERPTVxuICAgICAgICBjb25zdCBjb21wb25lbnRIZWlnaHQgPSBkb21Ob2RlLmNsaWVudEhlaWdodDtcbiAgICAgICAgY29uc3QgbGluZUhlaWdodCA9IGRpZmZWaWV3RWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpO1xuXG4gICAgICAgIC8vIFRPRE8oZ2VuZHJvbik6XG4gICAgICAgIC8vIFNldCB0aGUgd2lkdGggb2YgdGhlIG92ZXJsYXkgc28gdGhhdCBpdCB3b24ndCByZXNpemUgd2hlbiB3ZVxuICAgICAgICAvLyB0eXBlIGNvbW1lbnQgcmVwbGllcyBpbnRvIHRoZSB0ZXh0IGVkaXRvci5cbiAgICAgICAgZG9tTm9kZS5zdHlsZS53aWR0aCA9IChlZGl0b3JXaWR0aCAtIDcwKSArICdweCc7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBudW1iZXIgb2YgbGluZXMgd2UgbmVlZCB0byBpbnNlcnQgaW4gdGhlIGJ1ZmZlciB0byBtYWtlIHJvb21cbiAgICAgICAgLy8gZm9yIHRoZSBjb21wb25lbnQgdG8gYmUgZGlzcGxheWVkXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IE1hdGguY2VpbChjb21wb25lbnRIZWlnaHQgLyBsaW5lSGVpZ2h0KTtcbiAgICAgICAgY29uc3Qgb2Zmc2V0Um93ID0gZWxlbWVudC5idWZmZXJSb3c7XG4gICAgICAgIG9mZnNldHNGcm9tQ29tcG9uZW50cy5zZXQob2Zmc2V0Um93LCBvZmZzZXQpO1xuXG4gICAgICAgIC8vIFBoYWJyaWNhdG9yQ29tbWVudHNMaXN0IGlzIHJlbmRlcmVkIHdpdGggdmlzaWJpbGl0eTogaGlkZGVuLlxuICAgICAgICBkb21Ob2RlLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvcHMuaGFuZGxlTmV3T2Zmc2V0cyhvZmZzZXRzRnJvbUNvbXBvbmVudHMpO1xuICAgIH0sIGNvbXBvbmVudHMubGVuZ3RoICogNTAwKTtcbiAgfVxuXG4gIGdldEVkaXRvck1vZGVsKCk6IGF0b20kVGV4dEVkaXRvciB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yKTtcbiAgICByZXR1cm4gdGhpcy5fZGlmZlZpZXdFZGl0b3IuZ2V0TW9kZWwoKTtcbiAgfVxuXG4gIGdldEVkaXRvckRvbUVsZW1lbnQoKTogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCB7XG4gICAgcmV0dXJuIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snZWRpdG9yJ10pO1xuICB9XG59XG4iXX0=