Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactForAtom = require('react-for-atom');

var _atom = require('atom');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

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
  var textEditor = (0, _nuclideAtomHelpers.createTextEditor)(textEditorParams);

  if (props.grammar != null) {
    textEditor.setGrammar(props.grammar);
  }

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
        if (nextProps.syncTextContents) {
          textEditor.setText(previousTextContents);
        }
        this._updateTextEditor(textEditor);
        this._onDidUpdateTextEditorElement(nextProps);
      }
      if (nextProps.path !== this.props.path) {
        this.getTextBuffer().setPath(nextProps.path);
      }
      if (nextProps.gutterHidden !== this.props.gutterHidden) {
        this.getModel().setLineNumberGutterVisible(nextProps.gutterHidden);
      }
      if (nextProps.grammar !== this.props.grammar) {
        this.getModel().setGrammar(nextProps.grammar);
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
      var className = (0, _classnames2['default'])('nuclide-text-editor-container', {
        'no-auto-grow': !this.props.autoGrow
      });
      return _reactForAtom.React.createElement('div', { className: className });
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
      grammar: PropTypes.object,
      path: PropTypes.string,
      readOnly: PropTypes.bool.isRequired,
      textBuffer: PropTypes.instanceOf(_atom.TextBuffer),
      syncTextContents: PropTypes.bool.isRequired,
      autoGrow: PropTypes.bool.isRequired
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      gutterHidden: false,
      lineNumberGutterVisible: true,
      readOnly: false,
      autoGrow: false,
      syncTextContents: true
    },
    enumerable: true
  }]);

  return AtomTextEditor;
})(_reactForAtom.React.Component);

exports.AtomTextEditor = AtomTextEditor;
//# sourceMappingURL=data:application/json;base64,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QUFRLEVBQUUsS0FBSztBQUNmLHNCQUFnQixFQUFFLElBQUk7S0FDdkI7Ozs7U0FwQlUsY0FBYztHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiQXRvbVRleHRFZGl0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge1RleHRCdWZmZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtjcmVhdGVUZXh0RWRpdG9yfSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5jb25zdCBkb05vdGhpbmcgPSAoKSA9PiB7fTtcblxuZnVuY3Rpb24gc2V0dXBUZXh0RWRpdG9yKHByb3BzOiBPYmplY3QpOiBhdG9tJFRleHRFZGl0b3Ige1xuICBjb25zdCB0ZXh0QnVmZmVyID0gcHJvcHMudGV4dEJ1ZmZlciB8fCBuZXcgVGV4dEJ1ZmZlcigpO1xuICBpZiAocHJvcHMucGF0aCkge1xuICAgIHRleHRCdWZmZXIuc2V0UGF0aChwcm9wcy5wYXRoKTtcbiAgfVxuXG4gIGNvbnN0IHRleHRFZGl0b3JQYXJhbXMgPSB7XG4gICAgYnVmZmVyOiB0ZXh0QnVmZmVyLFxuICAgIGxpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlOiAhcHJvcHMuZ3V0dGVySGlkZGVuLFxuICB9O1xuICBjb25zdCB0ZXh0RWRpdG9yID0gY3JlYXRlVGV4dEVkaXRvcih0ZXh0RWRpdG9yUGFyYW1zKTtcblxuICBpZiAocHJvcHMuZ3JhbW1hciAhPSBudWxsKSB7XG4gICAgdGV4dEVkaXRvci5zZXRHcmFtbWFyKHByb3BzLmdyYW1tYXIpO1xuICB9XG5cbiAgLy8gQXMgb2YgdGhlIGludHJvZHVjdGlvbiBvZiBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IoKSwgaXQgaXMgbm8gbG9uZ2VyIHBvc3NpYmxlIHRvXG4gIC8vIHN1YmNsYXNzIFRleHRFZGl0b3IgdG8gY3JlYXRlIGEgUmVhZE9ubHlUZXh0RWRpdG9yLiBJbnN0ZWFkLCB0aGUgd2F5IHRvIGFjaGlldmUgdGhpcyBlZmZlY3RcbiAgLy8gaXMgdG8gY3JlYXRlIGFuIG9yZGluYXJ5IFRleHRFZGl0b3IgYW5kIHRoZW4gb3ZlcnJpZGUgYW55IG1ldGhvZHMgdGhhdCB3b3VsZCBhbGxvdyBpdCB0b1xuICAvLyBjaGFuZ2UgaXRzIGNvbnRlbnRzLlxuICAvLyBUT0RPOiBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy85MjM3LlxuICBpZiAocHJvcHMucmVhZE9ubHkpIHtcbiAgICAvLyBDYW5jZWwgaW5zZXJ0IGV2ZW50cyB0byBwcmV2ZW50IHR5cGluZyBpbiB0aGUgdGV4dCBlZGl0b3IgYW5kIGRpc2FsbG93IGVkaXRpbmcgKHJlYWQtb25seSkuXG4gICAgdGV4dEVkaXRvci5vbldpbGxJbnNlcnRUZXh0KGV2ZW50ID0+IHtcbiAgICAgIGV2ZW50LmNhbmNlbCgpO1xuICAgIH0pO1xuXG4gICAgLy8gTWFrZSBwYXN0aW5nIGluIHRoZSB0ZXh0IGVkaXRvciBhIG5vLW9wIHRvIGRpc2FsbG93IGVkaXRpbmcgKHJlYWQtb25seSkuXG4gICAgdGV4dEVkaXRvci5wYXN0ZVRleHQgPSBkb05vdGhpbmc7XG5cbiAgICAvLyBNYWtlIGRlbGV0ZSBrZXkgcHJlc3NlcyBpbiB0aGUgdGV4dCBlZGl0b3IgYSBuby1vcCB0byBkaXNhbGxvdyBlZGl0aW5nIChyZWFkLW9ubHkpLlxuICAgIHRleHRFZGl0b3IuZGVsZXRlID0gZG9Ob3RoaW5nO1xuXG4gICAgLy8gTWFrZSBiYWNrc3BhY2Uga2V5IHByZXNzZXMgaW4gdGhlIHRleHQgZWRpdG9yIGEgbm8tb3AgdG8gZGlzYWxsb3cgZWRpdGluZyAocmVhZC1vbmx5KS5cbiAgICB0ZXh0RWRpdG9yLmJhY2tzcGFjZSA9IGRvTm90aGluZztcblxuICAgIC8vIE1ha2UgZHVwbGljYXRlIGxpbmVzIGEgbm8tb3AgdG8gZGlzYWxsb3cgZWRpdGluZyAocmVhZC1vbmx5KS5cbiAgICB0ZXh0RWRpdG9yLmR1cGxpY2F0ZUxpbmVzID0gZG9Ob3RoaW5nO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBjdXJzb3IgbGluZSBkZWNvcmF0aW9ucyBiZWNhdXNlIHRoYXQncyBkaXN0cmFjdGluZyBpbiByZWFkLW9ubHkgbW9kZS5cbiAgICB0ZXh0RWRpdG9yLmdldERlY29yYXRpb25zKHtjbGFzczogJ2N1cnNvci1saW5lJ30pLmZvckVhY2goZGVjb3JhdGlvbiA9PiB7XG4gICAgICBkZWNvcmF0aW9uLmRlc3Ryb3koKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB0ZXh0RWRpdG9yO1xufVxuXG5leHBvcnQgY2xhc3MgQXRvbVRleHRFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0ZTogdm9pZDtcbiAgX3RleHRFZGl0b3JFbGVtZW50OiA/YXRvbSRUZXh0RWRpdG9yRWxlbWVudDtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGd1dHRlckhpZGRlbjogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBncmFtbWFyOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIHBhdGg6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgcmVhZE9ubHk6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgdGV4dEJ1ZmZlcjogUHJvcFR5cGVzLmluc3RhbmNlT2YoVGV4dEJ1ZmZlciksXG4gICAgc3luY1RleHRDb250ZW50czogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBhdXRvR3JvdzogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGd1dHRlckhpZGRlbjogZmFsc2UsXG4gICAgbGluZU51bWJlckd1dHRlclZpc2libGU6IHRydWUsXG4gICAgcmVhZE9ubHk6IGZhbHNlLFxuICAgIGF1dG9Hcm93OiBmYWxzZSxcbiAgICBzeW5jVGV4dENvbnRlbnRzOiB0cnVlLFxuICB9O1xuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3VwZGF0ZVRleHRFZGl0b3Ioc2V0dXBUZXh0RWRpdG9yKHRoaXMucHJvcHMpKTtcbiAgICB0aGlzLl9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KHRoaXMucHJvcHMpO1xuICB9XG5cbiAgX3VwZGF0ZVRleHRFZGl0b3IodGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgY29uc3QgY29udGFpbmVyID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gICAgY29uc3QgdGV4dEVkaXRvckVsZW1lbnQ6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQgPSB0aGlzLl90ZXh0RWRpdG9yRWxlbWVudCA9XG4gICAgICAoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXRvbS10ZXh0LWVkaXRvcicpOiBhbnkpO1xuICAgIHRleHRFZGl0b3JFbGVtZW50LnNldE1vZGVsKHRleHRFZGl0b3IpO1xuICAgIC8vIEhBQ0shIFRoaXMgaXMgYSB3b3JrYXJvdW5kIGZvciB0aGUgVmlld1JlZ2lzdHJ5IHdoZXJlIEF0b20gaGFzIGEgZGVmYXVsdCB2aWV3IHByb3ZpZGVyIGZvclxuICAgIC8vIFRleHRFZGl0b3IgKHRoYXQgd2UgY2Fubm90IG92ZXJyaWRlKSwgd2hpY2ggaXMgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIHRoZSB2aWV3IGFzc29jaWF0ZWRcbiAgICAvLyB3aXRoIHRoZSBUZXh0RWRpdG9yIHRoYXQgd2UgY3JlYXRlIGFuZCBhZGRpbmcgYSBtYXBwaW5nIGZvciBpdCBpbiBpdHMgcHJpdmF0ZSB2aWV3cyBtYXAuXG4gICAgLy8gVG8gd29ya2Fyb3VuZCB0aGlzLCB3ZSByZWFjaCBpbnRvIHRoZSBpbnRlcm5hbHMgb2YgdGhlIFZpZXdSZWdpc3RyeSBhbmQgdXBkYXRlIHRoZSBlbnRyeSBpblxuICAgIC8vIHRoZSBtYXAgbWFudWFsbHkuIEZpbGVkIGFzIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzc5NTQuXG4gICAgLy8gJEZsb3dGaXhNZVxuICAgIGF0b20udmlld3Mudmlld3Muc2V0KHRleHRFZGl0b3IsIHRleHRFZGl0b3JFbGVtZW50KTtcbiAgICAvLyBBdHRhY2ggdG8gRE9NLlxuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dEVkaXRvckVsZW1lbnQpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmIChcbiAgICAgICAgbmV4dFByb3BzLnRleHRCdWZmZXIgIT09IHRoaXMucHJvcHMudGV4dEJ1ZmZlciB8fFxuICAgICAgICBuZXh0UHJvcHMucmVhZE9ubHkgIT09IHRoaXMucHJvcHMucmVhZE9ubHlcbiAgICAgICkge1xuICAgICAgY29uc3QgcHJldmlvdXNUZXh0Q29udGVudHMgPSB0aGlzLmdldFRleHRCdWZmZXIoKS5nZXRUZXh0KCk7XG4gICAgICBjb25zdCB0ZXh0RWRpdG9yID0gc2V0dXBUZXh0RWRpdG9yKG5leHRQcm9wcyk7XG4gICAgICBpZiAobmV4dFByb3BzLnN5bmNUZXh0Q29udGVudHMpIHtcbiAgICAgICAgdGV4dEVkaXRvci5zZXRUZXh0KHByZXZpb3VzVGV4dENvbnRlbnRzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3VwZGF0ZVRleHRFZGl0b3IodGV4dEVkaXRvcik7XG4gICAgICB0aGlzLl9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KG5leHRQcm9wcyk7XG4gICAgfVxuICAgIGlmIChuZXh0UHJvcHMucGF0aCAhPT0gdGhpcy5wcm9wcy5wYXRoKSB7XG4gICAgICB0aGlzLmdldFRleHRCdWZmZXIoKS5zZXRQYXRoKG5leHRQcm9wcy5wYXRoKTtcbiAgICB9XG4gICAgaWYgKG5leHRQcm9wcy5ndXR0ZXJIaWRkZW4gIT09IHRoaXMucHJvcHMuZ3V0dGVySGlkZGVuKSB7XG4gICAgICB0aGlzLmdldE1vZGVsKCkuc2V0TGluZU51bWJlckd1dHRlclZpc2libGUobmV4dFByb3BzLmd1dHRlckhpZGRlbik7XG4gICAgfVxuICAgIGlmIChuZXh0UHJvcHMuZ3JhbW1hciAhPT0gdGhpcy5wcm9wcy5ncmFtbWFyKSB7XG4gICAgICB0aGlzLmdldE1vZGVsKCkuc2V0R3JhbW1hcihuZXh0UHJvcHMuZ3JhbW1hcik7XG4gICAgfVxuICB9XG5cbiAgX29uRGlkVXBkYXRlVGV4dEVkaXRvckVsZW1lbnQocHJvcHM6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmICghcHJvcHMucmVhZE9ubHkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gVE9ETyhtb3N0KTogdDk5Mjk2NzkgUmVtb3ZlIHRoaXMgaGFjayB3aGVuIEF0b20gaGFzIGEgYmxpbmtpbmcgY3Vyc29yIGNvbmZpZ3VyYXRpb24gQVBJLlxuICAgIGNvbnN0IHtjb21wb25lbnR9ID0gdGhpcy5nZXRFbGVtZW50KCk7XG4gICAgaWYgKGNvbXBvbmVudCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtwcmVzZW50ZXJ9ID0gY29tcG9uZW50O1xuICAgIHByZXNlbnRlci5zdGFydEJsaW5raW5nQ3Vyc29ycyA9IGRvTm90aGluZztcbiAgICBwcmVzZW50ZXIuc3RvcEJsaW5raW5nQ3Vyc29ycyhmYWxzZSk7XG4gIH1cblxuICBnZXRUZXh0QnVmZmVyKCk6IGF0b20kVGV4dEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWwoKS5nZXRCdWZmZXIoKTtcbiAgfVxuXG4gIGdldE1vZGVsKCk6IGF0b20kVGV4dEVkaXRvciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudCgpLmdldE1vZGVsKCk7XG4gIH1cblxuICBnZXRFbGVtZW50KCk6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQge1xuICAgIGludmFyaWFudCh0aGlzLl90ZXh0RWRpdG9yRWxlbWVudCk7XG4gICAgcmV0dXJuIHRoaXMuX3RleHRFZGl0b3JFbGVtZW50O1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NuYW1lcygnbnVjbGlkZS10ZXh0LWVkaXRvci1jb250YWluZXInLCB7XG4gICAgICAnbm8tYXV0by1ncm93JzogIXRoaXMucHJvcHMuYXV0b0dyb3csXG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWV9IC8+XG4gICAgKTtcbiAgfVxuXG4gIC8vIFRoaXMgY29tcG9uZW50IHdyYXBzIHRoZSBpbXBlcmF0aXZlIEFQSSBvZiBgPGF0b20tdGV4dC1lZGl0b3I+YCwgYW5kIHNvIFJlYWN0J3MgcmVuZGVyaW5nXG4gIC8vIHNob3VsZCBhbHdheXMgcGFzcyBiZWNhdXNlIHRoaXMgc3VidHJlZSB3b24ndCBjaGFuZ2UuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IE9iamVjdCwgbmV4dFN0YXRlOiB2b2lkKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbn1cbiJdfQ==