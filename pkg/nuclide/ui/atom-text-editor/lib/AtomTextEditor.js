var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

var _atom = require('atom');

var _atomHelpers = require('../../../atom-helpers');

var PropTypes = _reactForAtom2['default'].PropTypes;

var AtomTextEditor = (function (_React$Component) {
  _inherits(AtomTextEditor, _React$Component);

  _createClass(AtomTextEditor, null, [{
    key: 'propTypes',
    value: {
      gutterHidden: PropTypes.bool.isRequired,
      path: PropTypes.string,
      readOnly: PropTypes.bool.isRequired,
      textBuffer: PropTypes.instanceOf(_atom.TextBuffer)
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      gutterHidden: false,
      lineNumberGutterVisible: true,
      readOnly: false
    },
    enumerable: true
  }]);

  function AtomTextEditor(props) {
    _classCallCheck(this, AtomTextEditor);

    _get(Object.getPrototypeOf(AtomTextEditor.prototype), 'constructor', this).call(this, props);

    this._textBuffer = props.textBuffer || new _atom.TextBuffer();
    if (props.path) {
      this._textBuffer.setPath(props.path);
    }

    var textEditorParams = {
      buffer: this._textBuffer,
      lineNumberGutterVisible: !this.props.gutterHidden
    };
    var textEditor = (0, _atomHelpers.createTextEditor)(textEditorParams);

    // As of the introduction of atom.workspace.buildTextEditor(), it is no longer possible to
    // subclass TextEditor to create a ReadOnlyTextEditor. Instead, the way to achieve this effect
    // is to create an ordinary TextEditor and then override any methods that would allow it to
    // change its contents.
    // TODO: https://github.com/atom/atom/issues/9237.
    if (props.readOnly) {
      // Cancel insert events to prevent typing in the text editor and disallow editing (read-only).
      textEditor.onWillInsertText(function (event) {
        event.cancel();
      });

      var doNothing = function doNothing() {};

      // Make pasting in the text editor a no-op to disallow editing (read-only).
      textEditor.pasteText = doNothing;

      // Make delete key presses in the text editor a no-op to disallow editing (read-only).
      textEditor['delete'] = doNothing;

      // Make backspace key presses in the text editor a no-op to disallow editing (read-only).
      textEditor.backspace = doNothing;
    }

    this._textEditorModel = textEditor;
  }

  _createClass(AtomTextEditor, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var atomTextEditorElement = _reactForAtom2['default'].findDOMNode(this);
      atomTextEditorElement.setModel(this._textEditorModel);

      // HACK! This is a workaround for the ViewRegistry where Atom has a default view provider for
      // TextEditor (that we cannot override), which is responsible for creating the view associated
      // with the TextEditor that we create and adding a mapping for it in its private views map.
      // To workaround this, we reach into the internals of the ViewRegistry and update the entry in
      // the map manually. Filed as https://github.com/atom/atom/issues/7954.
      // $FlowFixMe
      atom.views.views.set(this._textEditorModel, atomTextEditorElement);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.path !== this.props.path) {
        this._textBuffer.setPath(nextProps.path);
      }
      if (nextProps.gutterHidden !== this.props.gutterHidden) {
        this._textEditorModel.setLineNumberGutterVisible(nextProps.gutterHidden);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._textEditorModel.destroy();
    }
  }, {
    key: 'getTextBuffer',
    value: function getTextBuffer() {
      return this._textBuffer;
    }
  }, {
    key: 'getModel',
    value: function getModel() {
      return this._textEditorModel;
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom2['default'].createElement('atom-text-editor', null);
    }

    // This component wraps the imperative API of `<atom-text-editor>`, and so React's rendering
    // should always pass because this subtree won't change.
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return false;
    }
  }]);

  return AtomTextEditor;
})(_reactForAtom2['default'].Component);

module.exports = AtomTextEditor;
//# sourceMappingURL=data:application/json;base64,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RU8sb0JBQWU7QUFDckIsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7S0FDOUI7OztXQUVLLGtCQUFpQjtBQUNyQixhQUNFLGlFQUFvQixDQUNwQjtLQUNIOzs7Ozs7V0FJb0IsK0JBQUMsU0FBaUIsRUFBRSxTQUFpQixFQUFXO0FBQ25FLGFBQU8sS0FBSyxDQUFDO0tBQ2Q7OztTQXRHRyxjQUFjO0dBQVMsMEJBQU0sU0FBUzs7QUEwRzVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDIiwiZmlsZSI6IkF0b21UZXh0RWRpdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7VGV4dEJ1ZmZlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2NyZWF0ZVRleHRFZGl0b3J9IGZyb20gJy4uLy4uLy4uL2F0b20taGVscGVycyc7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNsYXNzIEF0b21UZXh0RWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBfdGV4dEJ1ZmZlcjogVGV4dEJ1ZmZlcjtcbiAgX3RleHRFZGl0b3JNb2RlbDogVGV4dEVkaXRvcjtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGd1dHRlckhpZGRlbjogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBwYXRoOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHJlYWRPbmx5OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIHRleHRCdWZmZXI6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFRleHRCdWZmZXIpLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgZ3V0dGVySGlkZGVuOiBmYWxzZSxcbiAgICBsaW5lTnVtYmVyR3V0dGVyVmlzaWJsZTogdHJ1ZSxcbiAgICByZWFkT25seTogZmFsc2UsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuX3RleHRCdWZmZXIgPSBwcm9wcy50ZXh0QnVmZmVyIHx8IG5ldyBUZXh0QnVmZmVyKCk7XG4gICAgaWYgKHByb3BzLnBhdGgpIHtcbiAgICAgIHRoaXMuX3RleHRCdWZmZXIuc2V0UGF0aChwcm9wcy5wYXRoKTtcbiAgICB9XG5cbiAgICBjb25zdCB0ZXh0RWRpdG9yUGFyYW1zID0ge1xuICAgICAgYnVmZmVyOiB0aGlzLl90ZXh0QnVmZmVyLFxuICAgICAgbGluZU51bWJlckd1dHRlclZpc2libGU6ICF0aGlzLnByb3BzLmd1dHRlckhpZGRlbixcbiAgICB9O1xuICAgIGNvbnN0IHRleHRFZGl0b3IgPSBjcmVhdGVUZXh0RWRpdG9yKHRleHRFZGl0b3JQYXJhbXMpO1xuXG4gICAgLy8gQXMgb2YgdGhlIGludHJvZHVjdGlvbiBvZiBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IoKSwgaXQgaXMgbm8gbG9uZ2VyIHBvc3NpYmxlIHRvXG4gICAgLy8gc3ViY2xhc3MgVGV4dEVkaXRvciB0byBjcmVhdGUgYSBSZWFkT25seVRleHRFZGl0b3IuIEluc3RlYWQsIHRoZSB3YXkgdG8gYWNoaWV2ZSB0aGlzIGVmZmVjdFxuICAgIC8vIGlzIHRvIGNyZWF0ZSBhbiBvcmRpbmFyeSBUZXh0RWRpdG9yIGFuZCB0aGVuIG92ZXJyaWRlIGFueSBtZXRob2RzIHRoYXQgd291bGQgYWxsb3cgaXQgdG9cbiAgICAvLyBjaGFuZ2UgaXRzIGNvbnRlbnRzLlxuICAgIC8vIFRPRE86IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzkyMzcuXG4gICAgaWYgKHByb3BzLnJlYWRPbmx5KSB7XG4gICAgICAvLyBDYW5jZWwgaW5zZXJ0IGV2ZW50cyB0byBwcmV2ZW50IHR5cGluZyBpbiB0aGUgdGV4dCBlZGl0b3IgYW5kIGRpc2FsbG93IGVkaXRpbmcgKHJlYWQtb25seSkuXG4gICAgICB0ZXh0RWRpdG9yLm9uV2lsbEluc2VydFRleHQoZXZlbnQgPT4ge1xuICAgICAgICBldmVudC5jYW5jZWwoKTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkb05vdGhpbmcgPSAoKSA9PiB7fTtcblxuICAgICAgLy8gTWFrZSBwYXN0aW5nIGluIHRoZSB0ZXh0IGVkaXRvciBhIG5vLW9wIHRvIGRpc2FsbG93IGVkaXRpbmcgKHJlYWQtb25seSkuXG4gICAgICB0ZXh0RWRpdG9yLnBhc3RlVGV4dCA9IGRvTm90aGluZztcblxuICAgICAgLy8gTWFrZSBkZWxldGUga2V5IHByZXNzZXMgaW4gdGhlIHRleHQgZWRpdG9yIGEgbm8tb3AgdG8gZGlzYWxsb3cgZWRpdGluZyAocmVhZC1vbmx5KS5cbiAgICAgIHRleHRFZGl0b3IuZGVsZXRlID0gZG9Ob3RoaW5nO1xuXG4gICAgICAvLyBNYWtlIGJhY2tzcGFjZSBrZXkgcHJlc3NlcyBpbiB0aGUgdGV4dCBlZGl0b3IgYSBuby1vcCB0byBkaXNhbGxvdyBlZGl0aW5nIChyZWFkLW9ubHkpLlxuICAgICAgdGV4dEVkaXRvci5iYWNrc3BhY2UgPSBkb05vdGhpbmc7XG4gICAgfVxuXG4gICAgdGhpcy5fdGV4dEVkaXRvck1vZGVsID0gdGV4dEVkaXRvcjtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIGNvbnN0IGF0b21UZXh0RWRpdG9yRWxlbWVudCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGF0b21UZXh0RWRpdG9yRWxlbWVudC5zZXRNb2RlbCh0aGlzLl90ZXh0RWRpdG9yTW9kZWwpO1xuXG4gICAgLy8gSEFDSyEgVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIHRoZSBWaWV3UmVnaXN0cnkgd2hlcmUgQXRvbSBoYXMgYSBkZWZhdWx0IHZpZXcgcHJvdmlkZXIgZm9yXG4gICAgLy8gVGV4dEVkaXRvciAodGhhdCB3ZSBjYW5ub3Qgb3ZlcnJpZGUpLCB3aGljaCBpcyByZXNwb25zaWJsZSBmb3IgY3JlYXRpbmcgdGhlIHZpZXcgYXNzb2NpYXRlZFxuICAgIC8vIHdpdGggdGhlIFRleHRFZGl0b3IgdGhhdCB3ZSBjcmVhdGUgYW5kIGFkZGluZyBhIG1hcHBpbmcgZm9yIGl0IGluIGl0cyBwcml2YXRlIHZpZXdzIG1hcC5cbiAgICAvLyBUbyB3b3JrYXJvdW5kIHRoaXMsIHdlIHJlYWNoIGludG8gdGhlIGludGVybmFscyBvZiB0aGUgVmlld1JlZ2lzdHJ5IGFuZCB1cGRhdGUgdGhlIGVudHJ5IGluXG4gICAgLy8gdGhlIG1hcCBtYW51YWxseS4gRmlsZWQgYXMgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvNzk1NC5cbiAgICAvLyAkRmxvd0ZpeE1lXG4gICAgYXRvbS52aWV3cy52aWV3cy5zZXQodGhpcy5fdGV4dEVkaXRvck1vZGVsLCBhdG9tVGV4dEVkaXRvckVsZW1lbnQpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmIChuZXh0UHJvcHMucGF0aCAhPT0gdGhpcy5wcm9wcy5wYXRoKSB7XG4gICAgICB0aGlzLl90ZXh0QnVmZmVyLnNldFBhdGgobmV4dFByb3BzLnBhdGgpO1xuICAgIH1cbiAgICBpZiAobmV4dFByb3BzLmd1dHRlckhpZGRlbiAhPT0gdGhpcy5wcm9wcy5ndXR0ZXJIaWRkZW4pIHtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3JNb2RlbC5zZXRMaW5lTnVtYmVyR3V0dGVyVmlzaWJsZShuZXh0UHJvcHMuZ3V0dGVySGlkZGVuKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl90ZXh0RWRpdG9yTW9kZWwuZGVzdHJveSgpO1xuICB9XG5cbiAgZ2V0VGV4dEJ1ZmZlcigpOiBUZXh0QnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdGV4dEJ1ZmZlcjtcbiAgfVxuXG4gIGdldE1vZGVsKCk6IFRleHRFZGl0b3Ige1xuICAgIHJldHVybiB0aGlzLl90ZXh0RWRpdG9yTW9kZWw7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGF0b20tdGV4dC1lZGl0b3IgLz5cbiAgICApO1xuICB9XG5cbiAgLy8gVGhpcyBjb21wb25lbnQgd3JhcHMgdGhlIGltcGVyYXRpdmUgQVBJIG9mIGA8YXRvbS10ZXh0LWVkaXRvcj5gLCBhbmQgc28gUmVhY3QncyByZW5kZXJpbmdcbiAgLy8gc2hvdWxkIGFsd2F5cyBwYXNzIGJlY2F1c2UgdGhpcyBzdWJ0cmVlIHdvbid0IGNoYW5nZS5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogT2JqZWN0LCBuZXh0U3RhdGU6IE9iamVjdCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXRvbVRleHRFZGl0b3I7XG4iXX0=