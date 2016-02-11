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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _reactForAtom = require('react-for-atom');

var _atom = require('atom');

var _atomHelpers = require('../../../atom-helpers');

var PropTypes = _reactForAtom.React.PropTypes;

var doNothing = function doNothing() {};

function setupTextEditor(props) {
  var textBuffer = props.textBuffer || new _atom.TextBuffer();
  if (props.path) {
    textBuffer.setPath(props.path);
  }

  var textEditorParams = {
    buffer: textBuffer,
    lineNumberGutterVisible: !props.gutterHidden
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

    // Make pasting in the text editor a no-op to disallow editing (read-only).
    textEditor.pasteText = doNothing;

    // Make delete key presses in the text editor a no-op to disallow editing (read-only).
    textEditor['delete'] = doNothing;

    // Make backspace key presses in the text editor a no-op to disallow editing (read-only).
    textEditor.backspace = doNothing;

    // Make duplicate lines a no-op to disallow editing (read-only).
    textEditor.duplicateLines = doNothing;

    // Remove the cursor line decorations because that's distracting in read-only mode.
    textEditor.getDecorations({ 'class': 'cursor-line' }).forEach(function (decoration) {
      decoration.destroy();
    });
  }

  return textEditor;
}

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
  }

  _createClass(AtomTextEditor, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._updateTextEditor(setupTextEditor(this.props));
      this._onDidUpdateTextEditorElement();
    }
  }, {
    key: '_updateTextEditor',
    value: function _updateTextEditor(textEditor) {
      var container = _reactForAtom.ReactDOM.findDOMNode(this);
      var textEditorElement = this._textEditorElement = document.createElement('atom-text-editor');
      textEditorElement.setModel(textEditor);
      // HACK! This is a workaround for the ViewRegistry where Atom has a default view provider for
      // TextEditor (that we cannot override), which is responsible for creating the view associated
      // with the TextEditor that we create and adding a mapping for it in its private views map.
      // To workaround this, we reach into the internals of the ViewRegistry and update the entry in
      // the map manually. Filed as https://github.com/atom/atom/issues/7954.
      // $FlowFixMe
      atom.views.views.set(textEditor, textEditorElement);
      // Attach to DOM.
      container.innerHTML = '';
      container.appendChild(textEditorElement);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.textBuffer !== this.props.textBuffer) {
        this._updateTextEditor(setupTextEditor(nextProps));
      }
      if (nextProps.path !== this.props.path) {
        this.getTextBuffer().setPath(nextProps.path);
      }
      if (nextProps.gutterHidden !== this.props.gutterHidden) {
        this.getModel().setLineNumberGutterVisible(nextProps.gutterHidden);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.textBuffer !== this.props.textBuffer) {
        this._onDidUpdateTextEditorElement();
      }
    }
  }, {
    key: '_onDidUpdateTextEditorElement',
    value: function _onDidUpdateTextEditorElement() {
      if (!this.props.readOnly) {
        return;
      }
      // TODO(most): t9929679 Remove this hack when Atom has a blinking cursor configuration API.

      var _getElement = this.getElement();

      var component = _getElement.component;

      if (component == null) {
        return;
      }
      var presenter = component.presenter;

      presenter.startBlinkingCursors = doNothing;
      presenter.stopBlinkingCursors(false);
    }
  }, {
    key: 'getTextBuffer',
    value: function getTextBuffer() {
      return this.getModel().getBuffer();
    }
  }, {
    key: 'getModel',
    value: function getModel() {
      return this.getElement().getModel();
    }
  }, {
    key: 'getElement',
    value: function getElement() {
      (0, _assert2['default'])(this._textEditorElement);
      return this._textEditorElement;
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement('div', { className: 'nuclide-text-editor-container' });
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
})(_reactForAtom.React.Component);

module.exports = AtomTextEditor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0b21UZXh0RWRpdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFZc0IsUUFBUTs7Ozs0QkFJdkIsZ0JBQWdCOztvQkFDRSxNQUFNOzsyQkFDQSx1QkFBdUI7O0lBRS9DLFNBQVMsdUJBQVQsU0FBUzs7QUFDaEIsSUFBTSxTQUFTLEdBQUcsU0FBWixTQUFTLEdBQVMsRUFBRSxDQUFDOztBQUUzQixTQUFTLGVBQWUsQ0FBQyxLQUFhLEVBQW1CO0FBQ3ZELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLElBQUksc0JBQWdCLENBQUM7QUFDeEQsTUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO0FBQ2QsY0FBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDaEM7O0FBRUQsTUFBTSxnQkFBZ0IsR0FBRztBQUN2QixVQUFNLEVBQUUsVUFBVTtBQUNsQiwyQkFBdUIsRUFBRSxDQUFDLEtBQUssQ0FBQyxZQUFZO0dBQzdDLENBQUM7QUFDRixNQUFNLFVBQVUsR0FBRyxtQ0FBaUIsZ0JBQWdCLENBQUMsQ0FBQzs7Ozs7OztBQU90RCxNQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7O0FBRWxCLGNBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUNuQyxXQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDaEIsQ0FBQyxDQUFDOzs7QUFHSCxjQUFVLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQzs7O0FBR2pDLGNBQVUsVUFBTyxHQUFHLFNBQVMsQ0FBQzs7O0FBRzlCLGNBQVUsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDOzs7QUFHakMsY0FBVSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUM7OztBQUd0QyxjQUFVLENBQUMsY0FBYyxDQUFDLEVBQUMsU0FBTyxhQUFhLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUN0RSxnQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3RCLENBQUMsQ0FBQztHQUNKOztBQUVELFNBQU8sVUFBVSxDQUFDO0NBQ25COztJQUVLLGNBQWM7WUFBZCxjQUFjOztlQUFkLGNBQWM7O1dBSUM7QUFDakIsa0JBQVksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDdkMsVUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQ3RCLGNBQVEsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDbkMsZ0JBQVUsRUFBRSxTQUFTLENBQUMsVUFBVSxrQkFBWTtLQUM3Qzs7OztXQUVxQjtBQUNwQixrQkFBWSxFQUFFLEtBQUs7QUFDbkIsNkJBQXVCLEVBQUUsSUFBSTtBQUM3QixjQUFRLEVBQUUsS0FBSztLQUNoQjs7OztBQUVVLFdBakJQLGNBQWMsQ0FpQk4sS0FBYSxFQUFFOzBCQWpCdkIsY0FBYzs7QUFrQmhCLCtCQWxCRSxjQUFjLDZDQWtCVixLQUFLLEVBQUU7R0FDZDs7ZUFuQkcsY0FBYzs7V0FxQkQsNkJBQVM7QUFDeEIsVUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNwRCxVQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztLQUN0Qzs7O1dBRWdCLDJCQUFDLFVBQTJCLEVBQVE7QUFDbkQsVUFBTSxTQUFTLEdBQUcsdUJBQVMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdDLFVBQU0saUJBQXlDLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixHQUN0RSxRQUFRLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLEFBQU0sQ0FBQztBQUNwRCx1QkFBaUIsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7Ozs7Ozs7QUFPdkMsVUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDOztBQUVwRCxlQUFTLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUN6QixlQUFTLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDMUM7OztXQUV3QixtQ0FBQyxTQUFpQixFQUFRO0FBQ2pELFVBQUksU0FBUyxDQUFDLFVBQVUsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRTtBQUNsRCxZQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7T0FDcEQ7QUFDRCxVQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7QUFDdEMsWUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDOUM7QUFDRCxVQUFJLFNBQVMsQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUU7QUFDdEQsWUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLDBCQUEwQixDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztPQUNwRTtLQUNGOzs7V0FFaUIsNEJBQUMsU0FBaUIsRUFBRSxTQUFpQixFQUFRO0FBQzdELFVBQUksU0FBUyxDQUFDLFVBQVUsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRTtBQUNsRCxZQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztPQUN0QztLQUNGOzs7V0FFNEIseUNBQVM7QUFDcEMsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ3hCLGVBQU87T0FDUjs7O3dCQUVtQixJQUFJLENBQUMsVUFBVSxFQUFFOztVQUE5QixTQUFTLGVBQVQsU0FBUzs7QUFDaEIsVUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO0FBQ3JCLGVBQU87T0FDUjtVQUNNLFNBQVMsR0FBSSxTQUFTLENBQXRCLFNBQVM7O0FBQ2hCLGVBQVMsQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUM7QUFDM0MsZUFBUyxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3RDOzs7V0FFWSx5QkFBb0I7QUFDL0IsYUFBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7S0FDcEM7OztXQUVPLG9CQUFvQjtBQUMxQixhQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNyQzs7O1dBRVMsc0JBQTJCO0FBQ25DLCtCQUFVLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ25DLGFBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO0tBQ2hDOzs7V0FFSyxrQkFBaUI7QUFDckIsYUFDRSwyQ0FBSyxTQUFTLEVBQUMsK0JBQStCLEdBQUUsQ0FDaEQ7S0FDSDs7Ozs7O1dBSW9CLCtCQUFDLFNBQWlCLEVBQUUsU0FBaUIsRUFBVztBQUNuRSxhQUFPLEtBQUssQ0FBQztLQUNkOzs7U0FsR0csY0FBYztHQUFTLG9CQUFNLFNBQVM7O0FBc0c1QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJBdG9tVGV4dEVkaXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge1RleHRCdWZmZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtjcmVhdGVUZXh0RWRpdG9yfSBmcm9tICcuLi8uLi8uLi9hdG9tLWhlbHBlcnMnO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuY29uc3QgZG9Ob3RoaW5nID0gKCkgPT4ge307XG5cbmZ1bmN0aW9uIHNldHVwVGV4dEVkaXRvcihwcm9wczogT2JqZWN0KTogYXRvbSRUZXh0RWRpdG9yIHtcbiAgY29uc3QgdGV4dEJ1ZmZlciA9IHByb3BzLnRleHRCdWZmZXIgfHwgbmV3IFRleHRCdWZmZXIoKTtcbiAgaWYgKHByb3BzLnBhdGgpIHtcbiAgICB0ZXh0QnVmZmVyLnNldFBhdGgocHJvcHMucGF0aCk7XG4gIH1cblxuICBjb25zdCB0ZXh0RWRpdG9yUGFyYW1zID0ge1xuICAgIGJ1ZmZlcjogdGV4dEJ1ZmZlcixcbiAgICBsaW5lTnVtYmVyR3V0dGVyVmlzaWJsZTogIXByb3BzLmd1dHRlckhpZGRlbixcbiAgfTtcbiAgY29uc3QgdGV4dEVkaXRvciA9IGNyZWF0ZVRleHRFZGl0b3IodGV4dEVkaXRvclBhcmFtcyk7XG5cbiAgLy8gQXMgb2YgdGhlIGludHJvZHVjdGlvbiBvZiBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IoKSwgaXQgaXMgbm8gbG9uZ2VyIHBvc3NpYmxlIHRvXG4gIC8vIHN1YmNsYXNzIFRleHRFZGl0b3IgdG8gY3JlYXRlIGEgUmVhZE9ubHlUZXh0RWRpdG9yLiBJbnN0ZWFkLCB0aGUgd2F5IHRvIGFjaGlldmUgdGhpcyBlZmZlY3RcbiAgLy8gaXMgdG8gY3JlYXRlIGFuIG9yZGluYXJ5IFRleHRFZGl0b3IgYW5kIHRoZW4gb3ZlcnJpZGUgYW55IG1ldGhvZHMgdGhhdCB3b3VsZCBhbGxvdyBpdCB0b1xuICAvLyBjaGFuZ2UgaXRzIGNvbnRlbnRzLlxuICAvLyBUT0RPOiBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy85MjM3LlxuICBpZiAocHJvcHMucmVhZE9ubHkpIHtcbiAgICAvLyBDYW5jZWwgaW5zZXJ0IGV2ZW50cyB0byBwcmV2ZW50IHR5cGluZyBpbiB0aGUgdGV4dCBlZGl0b3IgYW5kIGRpc2FsbG93IGVkaXRpbmcgKHJlYWQtb25seSkuXG4gICAgdGV4dEVkaXRvci5vbldpbGxJbnNlcnRUZXh0KGV2ZW50ID0+IHtcbiAgICAgIGV2ZW50LmNhbmNlbCgpO1xuICAgIH0pO1xuXG4gICAgLy8gTWFrZSBwYXN0aW5nIGluIHRoZSB0ZXh0IGVkaXRvciBhIG5vLW9wIHRvIGRpc2FsbG93IGVkaXRpbmcgKHJlYWQtb25seSkuXG4gICAgdGV4dEVkaXRvci5wYXN0ZVRleHQgPSBkb05vdGhpbmc7XG5cbiAgICAvLyBNYWtlIGRlbGV0ZSBrZXkgcHJlc3NlcyBpbiB0aGUgdGV4dCBlZGl0b3IgYSBuby1vcCB0byBkaXNhbGxvdyBlZGl0aW5nIChyZWFkLW9ubHkpLlxuICAgIHRleHRFZGl0b3IuZGVsZXRlID0gZG9Ob3RoaW5nO1xuXG4gICAgLy8gTWFrZSBiYWNrc3BhY2Uga2V5IHByZXNzZXMgaW4gdGhlIHRleHQgZWRpdG9yIGEgbm8tb3AgdG8gZGlzYWxsb3cgZWRpdGluZyAocmVhZC1vbmx5KS5cbiAgICB0ZXh0RWRpdG9yLmJhY2tzcGFjZSA9IGRvTm90aGluZztcblxuICAgIC8vIE1ha2UgZHVwbGljYXRlIGxpbmVzIGEgbm8tb3AgdG8gZGlzYWxsb3cgZWRpdGluZyAocmVhZC1vbmx5KS5cbiAgICB0ZXh0RWRpdG9yLmR1cGxpY2F0ZUxpbmVzID0gZG9Ob3RoaW5nO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBjdXJzb3IgbGluZSBkZWNvcmF0aW9ucyBiZWNhdXNlIHRoYXQncyBkaXN0cmFjdGluZyBpbiByZWFkLW9ubHkgbW9kZS5cbiAgICB0ZXh0RWRpdG9yLmdldERlY29yYXRpb25zKHtjbGFzczogJ2N1cnNvci1saW5lJ30pLmZvckVhY2goZGVjb3JhdGlvbiA9PiB7XG4gICAgICBkZWNvcmF0aW9uLmRlc3Ryb3koKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB0ZXh0RWRpdG9yO1xufVxuXG5jbGFzcyBBdG9tVGV4dEVkaXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgX3RleHRFZGl0b3JFbGVtZW50OiA/YXRvbSRUZXh0RWRpdG9yRWxlbWVudDtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGd1dHRlckhpZGRlbjogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBwYXRoOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHJlYWRPbmx5OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIHRleHRCdWZmZXI6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFRleHRCdWZmZXIpLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgZ3V0dGVySGlkZGVuOiBmYWxzZSxcbiAgICBsaW5lTnVtYmVyR3V0dGVyVmlzaWJsZTogdHJ1ZSxcbiAgICByZWFkT25seTogZmFsc2UsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZVRleHRFZGl0b3Ioc2V0dXBUZXh0RWRpdG9yKHRoaXMucHJvcHMpKTtcbiAgICB0aGlzLl9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KCk7XG4gIH1cblxuICBfdXBkYXRlVGV4dEVkaXRvcih0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yRWxlbWVudDogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCA9IHRoaXMuX3RleHRFZGl0b3JFbGVtZW50ID1cbiAgICAgIChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdG9tLXRleHQtZWRpdG9yJyk6IGFueSk7XG4gICAgdGV4dEVkaXRvckVsZW1lbnQuc2V0TW9kZWwodGV4dEVkaXRvcik7XG4gICAgLy8gSEFDSyEgVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIHRoZSBWaWV3UmVnaXN0cnkgd2hlcmUgQXRvbSBoYXMgYSBkZWZhdWx0IHZpZXcgcHJvdmlkZXIgZm9yXG4gICAgLy8gVGV4dEVkaXRvciAodGhhdCB3ZSBjYW5ub3Qgb3ZlcnJpZGUpLCB3aGljaCBpcyByZXNwb25zaWJsZSBmb3IgY3JlYXRpbmcgdGhlIHZpZXcgYXNzb2NpYXRlZFxuICAgIC8vIHdpdGggdGhlIFRleHRFZGl0b3IgdGhhdCB3ZSBjcmVhdGUgYW5kIGFkZGluZyBhIG1hcHBpbmcgZm9yIGl0IGluIGl0cyBwcml2YXRlIHZpZXdzIG1hcC5cbiAgICAvLyBUbyB3b3JrYXJvdW5kIHRoaXMsIHdlIHJlYWNoIGludG8gdGhlIGludGVybmFscyBvZiB0aGUgVmlld1JlZ2lzdHJ5IGFuZCB1cGRhdGUgdGhlIGVudHJ5IGluXG4gICAgLy8gdGhlIG1hcCBtYW51YWxseS4gRmlsZWQgYXMgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvNzk1NC5cbiAgICAvLyAkRmxvd0ZpeE1lXG4gICAgYXRvbS52aWV3cy52aWV3cy5zZXQodGV4dEVkaXRvciwgdGV4dEVkaXRvckVsZW1lbnQpO1xuICAgIC8vIEF0dGFjaCB0byBET00uXG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZXh0RWRpdG9yRWxlbWVudCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKG5leHRQcm9wcy50ZXh0QnVmZmVyICE9PSB0aGlzLnByb3BzLnRleHRCdWZmZXIpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVRleHRFZGl0b3Ioc2V0dXBUZXh0RWRpdG9yKG5leHRQcm9wcykpO1xuICAgIH1cbiAgICBpZiAobmV4dFByb3BzLnBhdGggIT09IHRoaXMucHJvcHMucGF0aCkge1xuICAgICAgdGhpcy5nZXRUZXh0QnVmZmVyKCkuc2V0UGF0aChuZXh0UHJvcHMucGF0aCk7XG4gICAgfVxuICAgIGlmIChuZXh0UHJvcHMuZ3V0dGVySGlkZGVuICE9PSB0aGlzLnByb3BzLmd1dHRlckhpZGRlbikge1xuICAgICAgdGhpcy5nZXRNb2RlbCgpLnNldExpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlKG5leHRQcm9wcy5ndXR0ZXJIaWRkZW4pO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IE9iamVjdCwgcHJldlN0YXRlOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAocHJldlByb3BzLnRleHRCdWZmZXIgIT09IHRoaXMucHJvcHMudGV4dEJ1ZmZlcikge1xuICAgICAgdGhpcy5fb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudCgpO1xuICAgIH1cbiAgfVxuXG4gIF9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5wcm9wcy5yZWFkT25seSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUT0RPKG1vc3QpOiB0OTkyOTY3OSBSZW1vdmUgdGhpcyBoYWNrIHdoZW4gQXRvbSBoYXMgYSBibGlua2luZyBjdXJzb3IgY29uZmlndXJhdGlvbiBBUEkuXG4gICAgY29uc3Qge2NvbXBvbmVudH0gPSB0aGlzLmdldEVsZW1lbnQoKTtcbiAgICBpZiAoY29tcG9uZW50ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge3ByZXNlbnRlcn0gPSBjb21wb25lbnQ7XG4gICAgcHJlc2VudGVyLnN0YXJ0QmxpbmtpbmdDdXJzb3JzID0gZG9Ob3RoaW5nO1xuICAgIHByZXNlbnRlci5zdG9wQmxpbmtpbmdDdXJzb3JzKGZhbHNlKTtcbiAgfVxuXG4gIGdldFRleHRCdWZmZXIoKTogYXRvbSRUZXh0QnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRNb2RlbCgpLmdldEJ1ZmZlcigpO1xuICB9XG5cbiAgZ2V0TW9kZWwoKTogYXRvbSRUZXh0RWRpdG9yIHtcbiAgICByZXR1cm4gdGhpcy5nZXRFbGVtZW50KCkuZ2V0TW9kZWwoKTtcbiAgfVxuXG4gIGdldEVsZW1lbnQoKTogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCB7XG4gICAgaW52YXJpYW50KHRoaXMuX3RleHRFZGl0b3JFbGVtZW50KTtcbiAgICByZXR1cm4gdGhpcy5fdGV4dEVkaXRvckVsZW1lbnQ7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXRleHQtZWRpdG9yLWNvbnRhaW5lclwiLz5cbiAgICApO1xuICB9XG5cbiAgLy8gVGhpcyBjb21wb25lbnQgd3JhcHMgdGhlIGltcGVyYXRpdmUgQVBJIG9mIGA8YXRvbS10ZXh0LWVkaXRvcj5gLCBhbmQgc28gUmVhY3QncyByZW5kZXJpbmdcbiAgLy8gc2hvdWxkIGFsd2F5cyBwYXNzIGJlY2F1c2UgdGhpcyBzdWJ0cmVlIHdvbid0IGNoYW5nZS5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogT2JqZWN0LCBuZXh0U3RhdGU6IE9iamVjdCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXRvbVRleHRFZGl0b3I7XG4iXX0=