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

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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
      return _reactForAtom2['default'].createElement('atom-text-editor', { ref: 'editor', style: { height: '100%', overflow: 'hidden' } });
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
          var domNode = _reactForAtom2['default'].findDOMNode(element.component);
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
      return _reactForAtom2['default'].findDOMNode(this.refs['editor']);
    }
  }]);

  return DiffViewEditorPane;
})(_reactForAtom2['default'].Component);

exports['default'] = DiffViewEditorPane;
module.exports = exports['default'];

// TODO(most): move async code out of the view and deprecate the usage of `_isMounted`.
// All view changes should be pushed from the model/store through subscriptions.
//# sourceMappingURL=data:application/json;base64,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QkFBcUIsRUFBRSxDQUFDOzs7OztBQUsxRCxpQkFBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQUFBQyxXQUFXLEdBQUcsRUFBRSxHQUFJLElBQUksQ0FBQzs7OztBQUloRCxjQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUMsQ0FBQztBQUN2RCxjQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQ3BDLCtCQUFxQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7OztBQUc3QyxpQkFBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1NBQ3RDLENBQUMsQ0FBQztBQUNILGVBQUssS0FBSyxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDLENBQUM7T0FDcEQsRUFBRSxVQUFVLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0tBQzdCOzs7V0FFYSwwQkFBb0I7QUFDaEMsK0JBQVUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ2hDLGFBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUN4Qzs7O1dBRWtCLCtCQUEyQjtBQUM1QyxhQUFPLDBCQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7S0FDL0M7OztTQTdKa0Isa0JBQWtCO0dBQVMsMEJBQU0sU0FBUzs7cUJBQTFDLGtCQUFrQiIsImZpbGUiOiJEaWZmVmlld0VkaXRvclBhbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7SGlnaGxpZ2h0ZWRMaW5lcywgT2Zmc2V0TWFwLCBJbmxpbmVDb21wb25lbnR9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtkZWJvdW5jZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXN9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBEaWZmVmlld0VkaXRvciBmcm9tICcuL0RpZmZWaWV3RWRpdG9yJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgQ0hBTkdFX0RFQk9VTkNFX0RFTEFZX01TID0gMTAwO1xuXG50eXBlIFByb3BzID0ge1xuICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgb2Zmc2V0czogT2Zmc2V0TWFwLFxuICBoaWdobGlnaHRlZExpbmVzOiB7XG4gICAgYWRkZWQ6IEFycmF5PG51bWJlcj47XG4gICAgcmVtb3ZlZDogQXJyYXk8bnVtYmVyPjtcbiAgfSxcbiAgaW5pdGlhbFRleHRDb250ZW50OiBzdHJpbmc7XG4gIGlubGluZUVsZW1lbnRzOiBBcnJheTxJbmxpbmVDb21wb25lbnQ+O1xuICBoYW5kbGVOZXdPZmZzZXRzOiAobmV3T2Zmc2V0czogT2Zmc2V0TWFwKSA9PiBhbnksXG4gIHJlYWRPbmx5OiBib29sZWFuLFxuICBvbkNoYW5nZTogKG5ld0NvbnRlbnRzOiBzdHJpbmcpID0+IGFueSxcbn07XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHRleHRDb250ZW50OiBzdHJpbmc7XG59O1xuXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWZmVmlld0VkaXRvclBhbmUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBfZGlmZlZpZXdFZGl0b3I6ID9EaWZmVmlld0VkaXRvcjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIC8vIFRPRE8obW9zdCk6IG1vdmUgYXN5bmMgY29kZSBvdXQgb2YgdGhlIHZpZXcgYW5kIGRlcHJlY2F0ZSB0aGUgdXNhZ2Ugb2YgYF9pc01vdW50ZWRgLlxuICAvLyBBbGwgdmlldyBjaGFuZ2VzIHNob3VsZCBiZSBwdXNoZWQgZnJvbSB0aGUgbW9kZWwvc3RvcmUgdGhyb3VnaCBzdWJzY3JpcHRpb25zLlxuICBfaXNNb3VudGVkOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgdGV4dENvbnRlbnQ6IHRoaXMucHJvcHMuaW5pdGlhbFRleHRDb250ZW50LFxuICAgIH07XG4gICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc01vdW50ZWQgPSB0cnVlO1xuICAgIGNvbnN0IGRpZmZWaWV3RWRpdG9yID0gdGhpcy5fZGlmZlZpZXdFZGl0b3IgPSBuZXcgRGlmZlZpZXdFZGl0b3IodGhpcy5nZXRFZGl0b3JEb21FbGVtZW50KCkpO1xuICAgIGNvbnN0IHRleHRFZGl0b3IgPSB0aGlzLmdldEVkaXRvck1vZGVsKCk7XG4gICAgY29uc3QgZGVib3VuY2VkT25DaGFuZ2UgPSBkZWJvdW5jZShcbiAgICAgICgpID0+IHtcbiAgICAgICAgY29uc3QgdGV4dENvbnRlbnQgPSB0ZXh0RWRpdG9yLmdldFRleHQoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dGV4dENvbnRlbnR9KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRleHRDb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIENIQU5HRV9ERUJPVU5DRV9ERUxBWV9NUyxcbiAgICAgIGZhbHNlLFxuICAgICk7XG4gICAgaWYgKHRoaXMucHJvcHMucmVhZE9ubHkpIHtcbiAgICAgIGRpZmZWaWV3RWRpdG9yLnNldFJlYWRPbmx5KCk7XG4gICAgfVxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRleHRFZGl0b3Iub25EaWRDaGFuZ2UoZGVib3VuY2VkT25DaGFuZ2UpKTtcbiAgICB0aGlzLl91cGRhdGVEaWZmVmlldyh0aGlzLnByb3BzLCB0aGlzLnN0YXRlKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2RpZmZWaWV3RWRpdG9yKSB7XG4gICAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGhpcy5nZXRFZGl0b3JNb2RlbCgpO1xuICAgICAgdGV4dEVkaXRvci5kZXN0cm95KCk7XG4gICAgICB0aGlzLl9kaWZmVmlld0VkaXRvciA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX2lzTW91bnRlZCA9IGZhbHNlO1xuICB9XG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogT2JqZWN0LCBuZXh0U3RhdGU6IE9iamVjdCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8YXRvbS10ZXh0LWVkaXRvciByZWY9XCJlZGl0b3JcIiBzdHlsZT17e2hlaWdodDogJzEwMCUnLCBvdmVyZmxvdzogJ2hpZGRlbid9fSAvPlxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICBsZXQgbmV3U3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgIGlmIChuZXdQcm9wcy5pbml0aWFsVGV4dENvbnRlbnQgIT09IHRoaXMuc3RhdGUudGV4dENvbnRlbnQpIHtcbiAgICAgIG5ld1N0YXRlID0ge3RleHRDb250ZW50OiBuZXdQcm9wcy5pbml0aWFsVGV4dENvbnRlbnR9O1xuICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgICB0aGlzLl9zZXRUZXh0Q29udGVudChuZXdQcm9wcy5maWxlUGF0aCwgbmV3U3RhdGUudGV4dENvbnRlbnQsIGZhbHNlIC8qY2xlYXJIaXN0b3J5Ki8pO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVEaWZmVmlldyhuZXdQcm9wcywgbmV3U3RhdGUpO1xuICB9XG5cbiAgX3VwZGF0ZURpZmZWaWV3KG5ld1Byb3BzOiBPYmplY3QsIG5ld1N0YXRlOiBPYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCBvbGRQcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG9sZFByb3BzLmZpbGVQYXRoICE9PSBuZXdQcm9wcy5maWxlUGF0aCkge1xuICAgICAgLy8gTG9hZGluZyBhIG5ldyBmaWxlIHNob3VsZCBjbGVhciB0aGUgdW5kbyBoaXN0b3J5LlxuICAgICAgdGhpcy5fc2V0VGV4dENvbnRlbnQobmV3UHJvcHMuZmlsZVBhdGgsIG5ld1N0YXRlLnRleHRDb250ZW50LCB0cnVlIC8qY2xlYXJIaXN0b3J5Ki8pO1xuICAgIH1cbiAgICBpZiAob2xkUHJvcHMuaGlnaGxpZ2h0ZWRMaW5lcyAhPT0gbmV3UHJvcHMuaGlnaGxpZ2h0ZWRMaW5lcykge1xuICAgICAgdGhpcy5fc2V0SGlnaGxpZ2h0ZWRMaW5lcyhuZXdQcm9wcy5oaWdobGlnaHRlZExpbmVzKTtcbiAgICB9XG4gICAgaWYgKG9sZFByb3BzLm9mZnNldHMgIT09IG5ld1Byb3BzLm9mZnNldHMpIHtcbiAgICAgIHRoaXMuX3NldE9mZnNldHMobmV3UHJvcHMub2Zmc2V0cyk7XG4gICAgfVxuICAgIGlmIChvbGRQcm9wcy5pbmxpbmVFbGVtZW50cyAhPT0gbmV3UHJvcHMuaW5saW5lRWxlbWVudHMpIHtcbiAgICAgIHRoaXMuX3JlbmRlckNvbXBvbmVudHNJbmxpbmUobmV3UHJvcHMuaW5saW5lRWxlbWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRUZXh0Q29udGVudChmaWxlUGF0aDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcsIGNsZWFySGlzdG9yeTogYm9vbGVhbik6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLl9kaWZmVmlld0VkaXRvcik7XG4gICAgdGhpcy5fZGlmZlZpZXdFZGl0b3Iuc2V0RmlsZUNvbnRlbnRzKGZpbGVQYXRoLCB0ZXh0LCBjbGVhckhpc3RvcnkpO1xuICB9XG5cbiAgX3NldEhpZ2hsaWdodGVkTGluZXMoaGlnaGxpZ2h0ZWRMaW5lczogSGlnaGxpZ2h0ZWRMaW5lcyk6IHZvaWQge1xuICAgIGludmFyaWFudCh0aGlzLl9kaWZmVmlld0VkaXRvcik7XG4gICAgdGhpcy5fZGlmZlZpZXdFZGl0b3Iuc2V0SGlnaGxpZ2h0ZWRMaW5lcyhoaWdobGlnaHRlZExpbmVzLmFkZGVkLCBoaWdobGlnaHRlZExpbmVzLnJlbW92ZWQpO1xuICB9XG5cbiAgX3NldE9mZnNldHMob2Zmc2V0czogT2Zmc2V0TWFwKTogdm9pZCB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yKTtcbiAgICB0aGlzLl9kaWZmVmlld0VkaXRvci5zZXRPZmZzZXRzKG9mZnNldHMpO1xuICB9XG5cbiAgYXN5bmMgX3JlbmRlckNvbXBvbmVudHNJbmxpbmUoZWxlbWVudHM6IEFycmF5PE9iamVjdD4pOiBQcm9taXNlIHtcbiAgICBjb25zdCBkaWZmVmlld0VkaXRvciA9IHRoaXMuX2RpZmZWaWV3RWRpdG9yO1xuICAgIGludmFyaWFudChkaWZmVmlld0VkaXRvcik7XG4gICAgY29uc3QgY29tcG9uZW50cyA9IGF3YWl0IGRpZmZWaWV3RWRpdG9yLnJlbmRlcklubGluZUNvbXBvbmVudHMoZWxlbWVudHMpO1xuICAgIGlmICghdGhpcy5faXNNb3VudGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZGlmZlZpZXdFZGl0b3IuYXR0YWNoSW5saW5lQ29tcG9uZW50cyhjb21wb25lbnRzKTtcbiAgICBjb25zdCBvZmZzZXRzRnJvbUNvbXBvbmVudHMgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBUT0RPKGdlbmRyb24pOlxuICAgIC8vIFRoZSBSZWFjdCBjb21wb25lbnRzIGFyZW4ndCBhY3R1YWxseSByZW5kZXJlZCBpbiB0aGUgRE9NIHVudGlsIHRoZVxuICAgIC8vIGFzc29jaWF0ZWQgZGVjb3JhdGlvbnMgYXJlIGF0dGFjaGVkIHRvIHRoZSBUZXh0RWRpdG9yLlxuICAgIC8vIChzZWUgRGlmZlZpZXdFZGl0b3IuYXR0YWNoSW5saW5lQ29tcG9uZW50cylcbiAgICAvLyBUaGVyZSdzIG5vIGVhc3kgd2F5IHRvIGxpc3RlbiBmb3IgdGhpcyBldmVudCwgc28ganVzdCB3YWl0IDAuNXMgcGVyIGNvbXBvbmVudC5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5faXNNb3VudGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVkaXRvcldpZHRoID0gdGhpcy5nZXRFZGl0b3JEb21FbGVtZW50KCkuY2xpZW50V2lkdGg7XG4gICAgICBjb21wb25lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgIGNvbnN0IGRvbU5vZGUgPSBSZWFjdC5maW5kRE9NTm9kZShlbGVtZW50LmNvbXBvbmVudCk7XG4gICAgICAgIC8vIGdldCB0aGUgaGVpZ2h0IG9mIHRoZSBjb21wb25lbnQgYWZ0ZXIgaXQgaGFzIGJlZW4gcmVuZGVyZWQgaW4gdGhlIERPTVxuICAgICAgICBjb25zdCBjb21wb25lbnRIZWlnaHQgPSBkb21Ob2RlLmNsaWVudEhlaWdodDtcbiAgICAgICAgY29uc3QgbGluZUhlaWdodCA9IGRpZmZWaWV3RWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpO1xuXG4gICAgICAgIC8vIFRPRE8oZ2VuZHJvbik6XG4gICAgICAgIC8vIFNldCB0aGUgd2lkdGggb2YgdGhlIG92ZXJsYXkgc28gdGhhdCBpdCB3b24ndCByZXNpemUgd2hlbiB3ZVxuICAgICAgICAvLyB0eXBlIGNvbW1lbnQgcmVwbGllcyBpbnRvIHRoZSB0ZXh0IGVkaXRvci5cbiAgICAgICAgZG9tTm9kZS5zdHlsZS53aWR0aCA9IChlZGl0b3JXaWR0aCAtIDcwKSArICdweCc7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBudW1iZXIgb2YgbGluZXMgd2UgbmVlZCB0byBpbnNlcnQgaW4gdGhlIGJ1ZmZlciB0byBtYWtlIHJvb21cbiAgICAgICAgLy8gZm9yIHRoZSBjb21wb25lbnQgdG8gYmUgZGlzcGxheWVkXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IE1hdGguY2VpbChjb21wb25lbnRIZWlnaHQgLyBsaW5lSGVpZ2h0KTtcbiAgICAgICAgY29uc3Qgb2Zmc2V0Um93ID0gZWxlbWVudC5idWZmZXJSb3c7XG4gICAgICAgIG9mZnNldHNGcm9tQ29tcG9uZW50cy5zZXQob2Zmc2V0Um93LCBvZmZzZXQpO1xuXG4gICAgICAgIC8vIFBoYWJyaWNhdG9yQ29tbWVudHNMaXN0IGlzIHJlbmRlcmVkIHdpdGggdmlzaWJpbGl0eTogaGlkZGVuLlxuICAgICAgICBkb21Ob2RlLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgICB9KTtcbiAgICAgIHRoaXMucHJvcHMuaGFuZGxlTmV3T2Zmc2V0cyhvZmZzZXRzRnJvbUNvbXBvbmVudHMpO1xuICAgIH0sIGNvbXBvbmVudHMubGVuZ3RoICogNTAwKTtcbiAgfVxuXG4gIGdldEVkaXRvck1vZGVsKCk6IGF0b20kVGV4dEVkaXRvciB7XG4gICAgaW52YXJpYW50KHRoaXMuX2RpZmZWaWV3RWRpdG9yKTtcbiAgICByZXR1cm4gdGhpcy5fZGlmZlZpZXdFZGl0b3IuZ2V0TW9kZWwoKTtcbiAgfVxuXG4gIGdldEVkaXRvckRvbUVsZW1lbnQoKTogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCB7XG4gICAgcmV0dXJuIFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snZWRpdG9yJ10pO1xuICB9XG59XG4iXX0=