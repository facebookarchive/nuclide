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

  function AtomTextEditor() {
    _classCallCheck(this, AtomTextEditor);

    _get(Object.getPrototypeOf(AtomTextEditor.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(AtomTextEditor, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._updateTextEditor(setupTextEditor(this.props));
      this._onDidUpdateTextEditorElement(this.props);
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
      if (nextProps.textBuffer !== this.props.textBuffer || nextProps.readOnly !== this.props.readOnly) {
        var previousTextContents = this.getTextBuffer().getText();
        var textEditor = setupTextEditor(nextProps);
        textEditor.setText(previousTextContents);
        this._updateTextEditor(textEditor);
        this._onDidUpdateTextEditorElement(nextProps);
      }
      if (nextProps.path !== this.props.path) {
        this.getTextBuffer().setPath(nextProps.path);
      }
      if (nextProps.gutterHidden !== this.props.gutterHidden) {
        this.getModel().setLineNumberGutterVisible(nextProps.gutterHidden);
      }
    }
  }, {
    key: '_onDidUpdateTextEditorElement',
    value: function _onDidUpdateTextEditorElement(props) {
      if (!props.readOnly) {
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
  }], [{
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

  return AtomTextEditor;
})(_reactForAtom.React.Component);

module.exports = AtomTextEditor;
//# sourceMappingURL=data:application/json;base64,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LGtCQUFrQixDQUFDO0tBQ2hDOzs7V0FFSyxrQkFBaUI7QUFDckIsYUFDRSwyQ0FBSyxTQUFTLEVBQUMsK0JBQStCLEdBQUcsQ0FDakQ7S0FDSDs7Ozs7O1dBSW9CLCtCQUFDLFNBQWlCLEVBQUUsU0FBZSxFQUFXO0FBQ2pFLGFBQU8sS0FBSyxDQUFDO0tBQ2Q7OztXQTNGa0I7QUFDakIsa0JBQVksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDdkMsVUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQ3RCLGNBQVEsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDbkMsZ0JBQVUsRUFBRSxTQUFTLENBQUMsVUFBVSxrQkFBWTtLQUM3Qzs7OztXQUVxQjtBQUNwQixrQkFBWSxFQUFFLEtBQUs7QUFDbkIsNkJBQXVCLEVBQUUsSUFBSTtBQUM3QixjQUFRLEVBQUUsS0FBSztLQUNoQjs7OztTQWZHLGNBQWM7R0FBUyxvQkFBTSxTQUFTOztBQW1HNUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMiLCJmaWxlIjoiQXRvbVRleHRFZGl0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtUZXh0QnVmZmVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7Y3JlYXRlVGV4dEVkaXRvcn0gZnJvbSAnLi4vLi4vLi4vYXRvbS1oZWxwZXJzJztcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcbmNvbnN0IGRvTm90aGluZyA9ICgpID0+IHt9O1xuXG5mdW5jdGlvbiBzZXR1cFRleHRFZGl0b3IocHJvcHM6IE9iamVjdCk6IGF0b20kVGV4dEVkaXRvciB7XG4gIGNvbnN0IHRleHRCdWZmZXIgPSBwcm9wcy50ZXh0QnVmZmVyIHx8IG5ldyBUZXh0QnVmZmVyKCk7XG4gIGlmIChwcm9wcy5wYXRoKSB7XG4gICAgdGV4dEJ1ZmZlci5zZXRQYXRoKHByb3BzLnBhdGgpO1xuICB9XG5cbiAgY29uc3QgdGV4dEVkaXRvclBhcmFtcyA9IHtcbiAgICBidWZmZXI6IHRleHRCdWZmZXIsXG4gICAgbGluZU51bWJlckd1dHRlclZpc2libGU6ICFwcm9wcy5ndXR0ZXJIaWRkZW4sXG4gIH07XG4gIGNvbnN0IHRleHRFZGl0b3IgPSBjcmVhdGVUZXh0RWRpdG9yKHRleHRFZGl0b3JQYXJhbXMpO1xuXG4gIC8vIEFzIG9mIHRoZSBpbnRyb2R1Y3Rpb24gb2YgYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKCksIGl0IGlzIG5vIGxvbmdlciBwb3NzaWJsZSB0b1xuICAvLyBzdWJjbGFzcyBUZXh0RWRpdG9yIHRvIGNyZWF0ZSBhIFJlYWRPbmx5VGV4dEVkaXRvci4gSW5zdGVhZCwgdGhlIHdheSB0byBhY2hpZXZlIHRoaXMgZWZmZWN0XG4gIC8vIGlzIHRvIGNyZWF0ZSBhbiBvcmRpbmFyeSBUZXh0RWRpdG9yIGFuZCB0aGVuIG92ZXJyaWRlIGFueSBtZXRob2RzIHRoYXQgd291bGQgYWxsb3cgaXQgdG9cbiAgLy8gY2hhbmdlIGl0cyBjb250ZW50cy5cbiAgLy8gVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvOTIzNy5cbiAgaWYgKHByb3BzLnJlYWRPbmx5KSB7XG4gICAgLy8gQ2FuY2VsIGluc2VydCBldmVudHMgdG8gcHJldmVudCB0eXBpbmcgaW4gdGhlIHRleHQgZWRpdG9yIGFuZCBkaXNhbGxvdyBlZGl0aW5nIChyZWFkLW9ubHkpLlxuICAgIHRleHRFZGl0b3Iub25XaWxsSW5zZXJ0VGV4dChldmVudCA9PiB7XG4gICAgICBldmVudC5jYW5jZWwoKTtcbiAgICB9KTtcblxuICAgIC8vIE1ha2UgcGFzdGluZyBpbiB0aGUgdGV4dCBlZGl0b3IgYSBuby1vcCB0byBkaXNhbGxvdyBlZGl0aW5nIChyZWFkLW9ubHkpLlxuICAgIHRleHRFZGl0b3IucGFzdGVUZXh0ID0gZG9Ob3RoaW5nO1xuXG4gICAgLy8gTWFrZSBkZWxldGUga2V5IHByZXNzZXMgaW4gdGhlIHRleHQgZWRpdG9yIGEgbm8tb3AgdG8gZGlzYWxsb3cgZWRpdGluZyAocmVhZC1vbmx5KS5cbiAgICB0ZXh0RWRpdG9yLmRlbGV0ZSA9IGRvTm90aGluZztcblxuICAgIC8vIE1ha2UgYmFja3NwYWNlIGtleSBwcmVzc2VzIGluIHRoZSB0ZXh0IGVkaXRvciBhIG5vLW9wIHRvIGRpc2FsbG93IGVkaXRpbmcgKHJlYWQtb25seSkuXG4gICAgdGV4dEVkaXRvci5iYWNrc3BhY2UgPSBkb05vdGhpbmc7XG5cbiAgICAvLyBNYWtlIGR1cGxpY2F0ZSBsaW5lcyBhIG5vLW9wIHRvIGRpc2FsbG93IGVkaXRpbmcgKHJlYWQtb25seSkuXG4gICAgdGV4dEVkaXRvci5kdXBsaWNhdGVMaW5lcyA9IGRvTm90aGluZztcblxuICAgIC8vIFJlbW92ZSB0aGUgY3Vyc29yIGxpbmUgZGVjb3JhdGlvbnMgYmVjYXVzZSB0aGF0J3MgZGlzdHJhY3RpbmcgaW4gcmVhZC1vbmx5IG1vZGUuXG4gICAgdGV4dEVkaXRvci5nZXREZWNvcmF0aW9ucyh7Y2xhc3M6ICdjdXJzb3ItbGluZSd9KS5mb3JFYWNoKGRlY29yYXRpb24gPT4ge1xuICAgICAgZGVjb3JhdGlvbi5kZXN0cm95KCk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdGV4dEVkaXRvcjtcbn1cblxuY2xhc3MgQXRvbVRleHRFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0ZTogdm9pZDtcbiAgX3RleHRFZGl0b3JFbGVtZW50OiA/YXRvbSRUZXh0RWRpdG9yRWxlbWVudDtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGd1dHRlckhpZGRlbjogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBwYXRoOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHJlYWRPbmx5OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIHRleHRCdWZmZXI6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFRleHRCdWZmZXIpLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgZ3V0dGVySGlkZGVuOiBmYWxzZSxcbiAgICBsaW5lTnVtYmVyR3V0dGVyVmlzaWJsZTogdHJ1ZSxcbiAgICByZWFkT25seTogZmFsc2UsXG4gIH07XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fdXBkYXRlVGV4dEVkaXRvcihzZXR1cFRleHRFZGl0b3IodGhpcy5wcm9wcykpO1xuICAgIHRoaXMuX29uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQodGhpcy5wcm9wcyk7XG4gIH1cblxuICBfdXBkYXRlVGV4dEVkaXRvcih0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBjb25zdCB0ZXh0RWRpdG9yRWxlbWVudDogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCA9IHRoaXMuX3RleHRFZGl0b3JFbGVtZW50ID1cbiAgICAgIChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdG9tLXRleHQtZWRpdG9yJyk6IGFueSk7XG4gICAgdGV4dEVkaXRvckVsZW1lbnQuc2V0TW9kZWwodGV4dEVkaXRvcik7XG4gICAgLy8gSEFDSyEgVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIHRoZSBWaWV3UmVnaXN0cnkgd2hlcmUgQXRvbSBoYXMgYSBkZWZhdWx0IHZpZXcgcHJvdmlkZXIgZm9yXG4gICAgLy8gVGV4dEVkaXRvciAodGhhdCB3ZSBjYW5ub3Qgb3ZlcnJpZGUpLCB3aGljaCBpcyByZXNwb25zaWJsZSBmb3IgY3JlYXRpbmcgdGhlIHZpZXcgYXNzb2NpYXRlZFxuICAgIC8vIHdpdGggdGhlIFRleHRFZGl0b3IgdGhhdCB3ZSBjcmVhdGUgYW5kIGFkZGluZyBhIG1hcHBpbmcgZm9yIGl0IGluIGl0cyBwcml2YXRlIHZpZXdzIG1hcC5cbiAgICAvLyBUbyB3b3JrYXJvdW5kIHRoaXMsIHdlIHJlYWNoIGludG8gdGhlIGludGVybmFscyBvZiB0aGUgVmlld1JlZ2lzdHJ5IGFuZCB1cGRhdGUgdGhlIGVudHJ5IGluXG4gICAgLy8gdGhlIG1hcCBtYW51YWxseS4gRmlsZWQgYXMgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvNzk1NC5cbiAgICAvLyAkRmxvd0ZpeE1lXG4gICAgYXRvbS52aWV3cy52aWV3cy5zZXQodGV4dEVkaXRvciwgdGV4dEVkaXRvckVsZW1lbnQpO1xuICAgIC8vIEF0dGFjaCB0byBET00uXG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZXh0RWRpdG9yRWxlbWVudCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKFxuICAgICAgICBuZXh0UHJvcHMudGV4dEJ1ZmZlciAhPT0gdGhpcy5wcm9wcy50ZXh0QnVmZmVyIHx8XG4gICAgICAgIG5leHRQcm9wcy5yZWFkT25seSAhPT0gdGhpcy5wcm9wcy5yZWFkT25seVxuICAgICAgKSB7XG4gICAgICBjb25zdCBwcmV2aW91c1RleHRDb250ZW50cyA9IHRoaXMuZ2V0VGV4dEJ1ZmZlcigpLmdldFRleHQoKTtcbiAgICAgIGNvbnN0IHRleHRFZGl0b3IgPSBzZXR1cFRleHRFZGl0b3IobmV4dFByb3BzKTtcbiAgICAgIHRleHRFZGl0b3Iuc2V0VGV4dChwcmV2aW91c1RleHRDb250ZW50cyk7XG4gICAgICB0aGlzLl91cGRhdGVUZXh0RWRpdG9yKHRleHRFZGl0b3IpO1xuICAgICAgdGhpcy5fb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudChuZXh0UHJvcHMpO1xuICAgIH1cbiAgICBpZiAobmV4dFByb3BzLnBhdGggIT09IHRoaXMucHJvcHMucGF0aCkge1xuICAgICAgdGhpcy5nZXRUZXh0QnVmZmVyKCkuc2V0UGF0aChuZXh0UHJvcHMucGF0aCk7XG4gICAgfVxuICAgIGlmIChuZXh0UHJvcHMuZ3V0dGVySGlkZGVuICE9PSB0aGlzLnByb3BzLmd1dHRlckhpZGRlbikge1xuICAgICAgdGhpcy5nZXRNb2RlbCgpLnNldExpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlKG5leHRQcm9wcy5ndXR0ZXJIaWRkZW4pO1xuICAgIH1cbiAgfVxuXG4gIF9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoIXByb3BzLnJlYWRPbmx5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFRPRE8obW9zdCk6IHQ5OTI5Njc5IFJlbW92ZSB0aGlzIGhhY2sgd2hlbiBBdG9tIGhhcyBhIGJsaW5raW5nIGN1cnNvciBjb25maWd1cmF0aW9uIEFQSS5cbiAgICBjb25zdCB7Y29tcG9uZW50fSA9IHRoaXMuZ2V0RWxlbWVudCgpO1xuICAgIGlmIChjb21wb25lbnQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7cHJlc2VudGVyfSA9IGNvbXBvbmVudDtcbiAgICBwcmVzZW50ZXIuc3RhcnRCbGlua2luZ0N1cnNvcnMgPSBkb05vdGhpbmc7XG4gICAgcHJlc2VudGVyLnN0b3BCbGlua2luZ0N1cnNvcnMoZmFsc2UpO1xuICB9XG5cbiAgZ2V0VGV4dEJ1ZmZlcigpOiBhdG9tJFRleHRCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmdldE1vZGVsKCkuZ2V0QnVmZmVyKCk7XG4gIH1cblxuICBnZXRNb2RlbCgpOiBhdG9tJFRleHRFZGl0b3Ige1xuICAgIHJldHVybiB0aGlzLmdldEVsZW1lbnQoKS5nZXRNb2RlbCgpO1xuICB9XG5cbiAgZ2V0RWxlbWVudCgpOiBhdG9tJFRleHRFZGl0b3JFbGVtZW50IHtcbiAgICBpbnZhcmlhbnQodGhpcy5fdGV4dEVkaXRvckVsZW1lbnQpO1xuICAgIHJldHVybiB0aGlzLl90ZXh0RWRpdG9yRWxlbWVudDtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtdGV4dC1lZGl0b3ItY29udGFpbmVyXCIgLz5cbiAgICApO1xuICB9XG5cbiAgLy8gVGhpcyBjb21wb25lbnQgd3JhcHMgdGhlIGltcGVyYXRpdmUgQVBJIG9mIGA8YXRvbS10ZXh0LWVkaXRvcj5gLCBhbmQgc28gUmVhY3QncyByZW5kZXJpbmdcbiAgLy8gc2hvdWxkIGFsd2F5cyBwYXNzIGJlY2F1c2UgdGhpcyBzdWJ0cmVlIHdvbid0IGNoYW5nZS5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogT2JqZWN0LCBuZXh0U3RhdGU6IHZvaWQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF0b21UZXh0RWRpdG9yO1xuIl19