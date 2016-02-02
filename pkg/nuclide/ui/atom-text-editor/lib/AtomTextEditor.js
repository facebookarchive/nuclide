var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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

var _atom = require('atom');

var _atomHelpers = require('../../../atom-helpers');

var PropTypes = _reactForAtom.React.PropTypes;

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
      var atomTextEditorElement = _reactForAtom.ReactDOM.findDOMNode(this);
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
      return _reactForAtom.React.createElement('atom-text-editor', null);
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
//# sourceMappingURL=data:application/json;base64,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QUFlO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0tBQzlCOzs7V0FFSyxrQkFBaUI7QUFDckIsYUFDRSwyREFBb0IsQ0FDcEI7S0FDSDs7Ozs7O1dBSW9CLCtCQUFDLFNBQWlCLEVBQUUsU0FBaUIsRUFBVztBQUNuRSxhQUFPLEtBQUssQ0FBQztLQUNkOzs7U0F0R0csY0FBYztHQUFTLG9CQUFNLFNBQVM7O0FBMEc1QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJBdG9tVGV4dEVkaXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtUZXh0QnVmZmVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7Y3JlYXRlVGV4dEVkaXRvcn0gZnJvbSAnLi4vLi4vLi4vYXRvbS1oZWxwZXJzJztcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY2xhc3MgQXRvbVRleHRFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIF90ZXh0QnVmZmVyOiBUZXh0QnVmZmVyO1xuICBfdGV4dEVkaXRvck1vZGVsOiBUZXh0RWRpdG9yO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgZ3V0dGVySGlkZGVuOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIHBhdGg6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgcmVhZE9ubHk6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgdGV4dEJ1ZmZlcjogUHJvcFR5cGVzLmluc3RhbmNlT2YoVGV4dEJ1ZmZlciksXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBndXR0ZXJIaWRkZW46IGZhbHNlLFxuICAgIGxpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlOiB0cnVlLFxuICAgIHJlYWRPbmx5OiBmYWxzZSxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5fdGV4dEJ1ZmZlciA9IHByb3BzLnRleHRCdWZmZXIgfHwgbmV3IFRleHRCdWZmZXIoKTtcbiAgICBpZiAocHJvcHMucGF0aCkge1xuICAgICAgdGhpcy5fdGV4dEJ1ZmZlci5zZXRQYXRoKHByb3BzLnBhdGgpO1xuICAgIH1cblxuICAgIGNvbnN0IHRleHRFZGl0b3JQYXJhbXMgPSB7XG4gICAgICBidWZmZXI6IHRoaXMuX3RleHRCdWZmZXIsXG4gICAgICBsaW5lTnVtYmVyR3V0dGVyVmlzaWJsZTogIXRoaXMucHJvcHMuZ3V0dGVySGlkZGVuLFxuICAgIH07XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IGNyZWF0ZVRleHRFZGl0b3IodGV4dEVkaXRvclBhcmFtcyk7XG5cbiAgICAvLyBBcyBvZiB0aGUgaW50cm9kdWN0aW9uIG9mIGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcigpLCBpdCBpcyBubyBsb25nZXIgcG9zc2libGUgdG9cbiAgICAvLyBzdWJjbGFzcyBUZXh0RWRpdG9yIHRvIGNyZWF0ZSBhIFJlYWRPbmx5VGV4dEVkaXRvci4gSW5zdGVhZCwgdGhlIHdheSB0byBhY2hpZXZlIHRoaXMgZWZmZWN0XG4gICAgLy8gaXMgdG8gY3JlYXRlIGFuIG9yZGluYXJ5IFRleHRFZGl0b3IgYW5kIHRoZW4gb3ZlcnJpZGUgYW55IG1ldGhvZHMgdGhhdCB3b3VsZCBhbGxvdyBpdCB0b1xuICAgIC8vIGNoYW5nZSBpdHMgY29udGVudHMuXG4gICAgLy8gVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvOTIzNy5cbiAgICBpZiAocHJvcHMucmVhZE9ubHkpIHtcbiAgICAgIC8vIENhbmNlbCBpbnNlcnQgZXZlbnRzIHRvIHByZXZlbnQgdHlwaW5nIGluIHRoZSB0ZXh0IGVkaXRvciBhbmQgZGlzYWxsb3cgZWRpdGluZyAocmVhZC1vbmx5KS5cbiAgICAgIHRleHRFZGl0b3Iub25XaWxsSW5zZXJ0VGV4dChldmVudCA9PiB7XG4gICAgICAgIGV2ZW50LmNhbmNlbCgpO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGRvTm90aGluZyA9ICgpID0+IHt9O1xuXG4gICAgICAvLyBNYWtlIHBhc3RpbmcgaW4gdGhlIHRleHQgZWRpdG9yIGEgbm8tb3AgdG8gZGlzYWxsb3cgZWRpdGluZyAocmVhZC1vbmx5KS5cbiAgICAgIHRleHRFZGl0b3IucGFzdGVUZXh0ID0gZG9Ob3RoaW5nO1xuXG4gICAgICAvLyBNYWtlIGRlbGV0ZSBrZXkgcHJlc3NlcyBpbiB0aGUgdGV4dCBlZGl0b3IgYSBuby1vcCB0byBkaXNhbGxvdyBlZGl0aW5nIChyZWFkLW9ubHkpLlxuICAgICAgdGV4dEVkaXRvci5kZWxldGUgPSBkb05vdGhpbmc7XG5cbiAgICAgIC8vIE1ha2UgYmFja3NwYWNlIGtleSBwcmVzc2VzIGluIHRoZSB0ZXh0IGVkaXRvciBhIG5vLW9wIHRvIGRpc2FsbG93IGVkaXRpbmcgKHJlYWQtb25seSkuXG4gICAgICB0ZXh0RWRpdG9yLmJhY2tzcGFjZSA9IGRvTm90aGluZztcbiAgICB9XG5cbiAgICB0aGlzLl90ZXh0RWRpdG9yTW9kZWwgPSB0ZXh0RWRpdG9yO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgY29uc3QgYXRvbVRleHRFZGl0b3JFbGVtZW50ID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gICAgYXRvbVRleHRFZGl0b3JFbGVtZW50LnNldE1vZGVsKHRoaXMuX3RleHRFZGl0b3JNb2RlbCk7XG5cbiAgICAvLyBIQUNLISBUaGlzIGlzIGEgd29ya2Fyb3VuZCBmb3IgdGhlIFZpZXdSZWdpc3RyeSB3aGVyZSBBdG9tIGhhcyBhIGRlZmF1bHQgdmlldyBwcm92aWRlciBmb3JcbiAgICAvLyBUZXh0RWRpdG9yICh0aGF0IHdlIGNhbm5vdCBvdmVycmlkZSksIHdoaWNoIGlzIHJlc3BvbnNpYmxlIGZvciBjcmVhdGluZyB0aGUgdmlldyBhc3NvY2lhdGVkXG4gICAgLy8gd2l0aCB0aGUgVGV4dEVkaXRvciB0aGF0IHdlIGNyZWF0ZSBhbmQgYWRkaW5nIGEgbWFwcGluZyBmb3IgaXQgaW4gaXRzIHByaXZhdGUgdmlld3MgbWFwLlxuICAgIC8vIFRvIHdvcmthcm91bmQgdGhpcywgd2UgcmVhY2ggaW50byB0aGUgaW50ZXJuYWxzIG9mIHRoZSBWaWV3UmVnaXN0cnkgYW5kIHVwZGF0ZSB0aGUgZW50cnkgaW5cbiAgICAvLyB0aGUgbWFwIG1hbnVhbGx5LiBGaWxlZCBhcyBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy83OTU0LlxuICAgIC8vICRGbG93Rml4TWVcbiAgICBhdG9tLnZpZXdzLnZpZXdzLnNldCh0aGlzLl90ZXh0RWRpdG9yTW9kZWwsIGF0b21UZXh0RWRpdG9yRWxlbWVudCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKG5leHRQcm9wcy5wYXRoICE9PSB0aGlzLnByb3BzLnBhdGgpIHtcbiAgICAgIHRoaXMuX3RleHRCdWZmZXIuc2V0UGF0aChuZXh0UHJvcHMucGF0aCk7XG4gICAgfVxuICAgIGlmIChuZXh0UHJvcHMuZ3V0dGVySGlkZGVuICE9PSB0aGlzLnByb3BzLmd1dHRlckhpZGRlbikge1xuICAgICAgdGhpcy5fdGV4dEVkaXRvck1vZGVsLnNldExpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlKG5leHRQcm9wcy5ndXR0ZXJIaWRkZW4pO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3RleHRFZGl0b3JNb2RlbC5kZXN0cm95KCk7XG4gIH1cblxuICBnZXRUZXh0QnVmZmVyKCk6IFRleHRCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLl90ZXh0QnVmZmVyO1xuICB9XG5cbiAgZ2V0TW9kZWwoKTogVGV4dEVkaXRvciB7XG4gICAgcmV0dXJuIHRoaXMuX3RleHRFZGl0b3JNb2RlbDtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8YXRvbS10ZXh0LWVkaXRvciAvPlxuICAgICk7XG4gIH1cblxuICAvLyBUaGlzIGNvbXBvbmVudCB3cmFwcyB0aGUgaW1wZXJhdGl2ZSBBUEkgb2YgYDxhdG9tLXRleHQtZWRpdG9yPmAsIGFuZCBzbyBSZWFjdCdzIHJlbmRlcmluZ1xuICAvLyBzaG91bGQgYWx3YXlzIHBhc3MgYmVjYXVzZSB0aGlzIHN1YnRyZWUgd29uJ3QgY2hhbmdlLlxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBPYmplY3QsIG5leHRTdGF0ZTogT2JqZWN0KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdG9tVGV4dEVkaXRvcjtcbiJdfQ==