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
  var textEditor = atom.workspace.buildTextEditor(textEditorParams);

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
      var className = (0, _classnames2['default'])(this.props.className, 'nuclide-text-editor-container', {
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
      className: PropTypes.string,
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
//# sourceMappingURL=data:application/json;base64,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O0FBQ3BCLGtCQUFZLEVBQUUsS0FBSztBQUNuQiw2QkFBdUIsRUFBRSxJQUFJO0FBQzdCLGNBQVEsRUFBRSxLQUFLO0FBQ2YsY0FBUSxFQUFFLEtBQUs7QUFDZixzQkFBZ0IsRUFBRSxJQUFJO0tBQ3ZCOzs7O1NBckJVLGNBQWM7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkF0b21UZXh0RWRpdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtUZXh0QnVmZmVyfSBmcm9tICdhdG9tJztcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcbmNvbnN0IGRvTm90aGluZyA9ICgpID0+IHt9O1xuXG5mdW5jdGlvbiBzZXR1cFRleHRFZGl0b3IocHJvcHM6IE9iamVjdCk6IGF0b20kVGV4dEVkaXRvciB7XG4gIGNvbnN0IHRleHRCdWZmZXIgPSBwcm9wcy50ZXh0QnVmZmVyIHx8IG5ldyBUZXh0QnVmZmVyKCk7XG4gIGlmIChwcm9wcy5wYXRoKSB7XG4gICAgdGV4dEJ1ZmZlci5zZXRQYXRoKHByb3BzLnBhdGgpO1xuICB9XG5cbiAgY29uc3QgdGV4dEVkaXRvclBhcmFtcyA9IHtcbiAgICBidWZmZXI6IHRleHRCdWZmZXIsXG4gICAgbGluZU51bWJlckd1dHRlclZpc2libGU6ICFwcm9wcy5ndXR0ZXJIaWRkZW4sXG4gIH07XG4gIGNvbnN0IHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih0ZXh0RWRpdG9yUGFyYW1zKTtcblxuICBpZiAocHJvcHMuZ3JhbW1hciAhPSBudWxsKSB7XG4gICAgdGV4dEVkaXRvci5zZXRHcmFtbWFyKHByb3BzLmdyYW1tYXIpO1xuICB9XG5cbiAgLy8gQXMgb2YgdGhlIGludHJvZHVjdGlvbiBvZiBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3IoKSwgaXQgaXMgbm8gbG9uZ2VyIHBvc3NpYmxlIHRvXG4gIC8vIHN1YmNsYXNzIFRleHRFZGl0b3IgdG8gY3JlYXRlIGEgUmVhZE9ubHlUZXh0RWRpdG9yLiBJbnN0ZWFkLCB0aGUgd2F5IHRvIGFjaGlldmUgdGhpcyBlZmZlY3RcbiAgLy8gaXMgdG8gY3JlYXRlIGFuIG9yZGluYXJ5IFRleHRFZGl0b3IgYW5kIHRoZW4gb3ZlcnJpZGUgYW55IG1ldGhvZHMgdGhhdCB3b3VsZCBhbGxvdyBpdCB0b1xuICAvLyBjaGFuZ2UgaXRzIGNvbnRlbnRzLlxuICAvLyBUT0RPOiBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy85MjM3LlxuICBpZiAocHJvcHMucmVhZE9ubHkpIHtcbiAgICAvLyBDYW5jZWwgaW5zZXJ0IGV2ZW50cyB0byBwcmV2ZW50IHR5cGluZyBpbiB0aGUgdGV4dCBlZGl0b3IgYW5kIGRpc2FsbG93IGVkaXRpbmcgKHJlYWQtb25seSkuXG4gICAgdGV4dEVkaXRvci5vbldpbGxJbnNlcnRUZXh0KGV2ZW50ID0+IHtcbiAgICAgIGV2ZW50LmNhbmNlbCgpO1xuICAgIH0pO1xuXG4gICAgLy8gTWFrZSBwYXN0aW5nIGluIHRoZSB0ZXh0IGVkaXRvciBhIG5vLW9wIHRvIGRpc2FsbG93IGVkaXRpbmcgKHJlYWQtb25seSkuXG4gICAgdGV4dEVkaXRvci5wYXN0ZVRleHQgPSBkb05vdGhpbmc7XG5cbiAgICAvLyBNYWtlIGRlbGV0ZSBrZXkgcHJlc3NlcyBpbiB0aGUgdGV4dCBlZGl0b3IgYSBuby1vcCB0byBkaXNhbGxvdyBlZGl0aW5nIChyZWFkLW9ubHkpLlxuICAgIHRleHRFZGl0b3IuZGVsZXRlID0gZG9Ob3RoaW5nO1xuXG4gICAgLy8gTWFrZSBiYWNrc3BhY2Uga2V5IHByZXNzZXMgaW4gdGhlIHRleHQgZWRpdG9yIGEgbm8tb3AgdG8gZGlzYWxsb3cgZWRpdGluZyAocmVhZC1vbmx5KS5cbiAgICB0ZXh0RWRpdG9yLmJhY2tzcGFjZSA9IGRvTm90aGluZztcblxuICAgIC8vIE1ha2UgZHVwbGljYXRlIGxpbmVzIGEgbm8tb3AgdG8gZGlzYWxsb3cgZWRpdGluZyAocmVhZC1vbmx5KS5cbiAgICB0ZXh0RWRpdG9yLmR1cGxpY2F0ZUxpbmVzID0gZG9Ob3RoaW5nO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBjdXJzb3IgbGluZSBkZWNvcmF0aW9ucyBiZWNhdXNlIHRoYXQncyBkaXN0cmFjdGluZyBpbiByZWFkLW9ubHkgbW9kZS5cbiAgICB0ZXh0RWRpdG9yLmdldERlY29yYXRpb25zKHtjbGFzczogJ2N1cnNvci1saW5lJ30pLmZvckVhY2goZGVjb3JhdGlvbiA9PiB7XG4gICAgICBkZWNvcmF0aW9uLmRlc3Ryb3koKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB0ZXh0RWRpdG9yO1xufVxuXG5leHBvcnQgY2xhc3MgQXRvbVRleHRFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0ZTogdm9pZDtcbiAgX3RleHRFZGl0b3JFbGVtZW50OiA/YXRvbSRUZXh0RWRpdG9yRWxlbWVudDtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBndXR0ZXJIaWRkZW46IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgZ3JhbW1hcjogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBwYXRoOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHJlYWRPbmx5OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIHRleHRCdWZmZXI6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFRleHRCdWZmZXIpLFxuICAgIHN5bmNUZXh0Q29udGVudHM6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgYXV0b0dyb3c6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBndXR0ZXJIaWRkZW46IGZhbHNlLFxuICAgIGxpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlOiB0cnVlLFxuICAgIHJlYWRPbmx5OiBmYWxzZSxcbiAgICBhdXRvR3JvdzogZmFsc2UsXG4gICAgc3luY1RleHRDb250ZW50czogdHJ1ZSxcbiAgfTtcblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl91cGRhdGVUZXh0RWRpdG9yKHNldHVwVGV4dEVkaXRvcih0aGlzLnByb3BzKSk7XG4gICAgdGhpcy5fb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudCh0aGlzLnByb3BzKTtcbiAgfVxuXG4gIF91cGRhdGVUZXh0RWRpdG9yKHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGNvbnN0IHRleHRFZGl0b3JFbGVtZW50OiBhdG9tJFRleHRFZGl0b3JFbGVtZW50ID0gdGhpcy5fdGV4dEVkaXRvckVsZW1lbnQgPVxuICAgICAgKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F0b20tdGV4dC1lZGl0b3InKTogYW55KTtcbiAgICB0ZXh0RWRpdG9yRWxlbWVudC5zZXRNb2RlbCh0ZXh0RWRpdG9yKTtcbiAgICAvLyBIQUNLISBUaGlzIGlzIGEgd29ya2Fyb3VuZCBmb3IgdGhlIFZpZXdSZWdpc3RyeSB3aGVyZSBBdG9tIGhhcyBhIGRlZmF1bHQgdmlldyBwcm92aWRlciBmb3JcbiAgICAvLyBUZXh0RWRpdG9yICh0aGF0IHdlIGNhbm5vdCBvdmVycmlkZSksIHdoaWNoIGlzIHJlc3BvbnNpYmxlIGZvciBjcmVhdGluZyB0aGUgdmlldyBhc3NvY2lhdGVkXG4gICAgLy8gd2l0aCB0aGUgVGV4dEVkaXRvciB0aGF0IHdlIGNyZWF0ZSBhbmQgYWRkaW5nIGEgbWFwcGluZyBmb3IgaXQgaW4gaXRzIHByaXZhdGUgdmlld3MgbWFwLlxuICAgIC8vIFRvIHdvcmthcm91bmQgdGhpcywgd2UgcmVhY2ggaW50byB0aGUgaW50ZXJuYWxzIG9mIHRoZSBWaWV3UmVnaXN0cnkgYW5kIHVwZGF0ZSB0aGUgZW50cnkgaW5cbiAgICAvLyB0aGUgbWFwIG1hbnVhbGx5LiBGaWxlZCBhcyBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy83OTU0LlxuICAgIC8vICRGbG93Rml4TWVcbiAgICBhdG9tLnZpZXdzLnZpZXdzLnNldCh0ZXh0RWRpdG9yLCB0ZXh0RWRpdG9yRWxlbWVudCk7XG4gICAgLy8gQXR0YWNoIHRvIERPTS5cbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRleHRFZGl0b3JFbGVtZW50KTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoXG4gICAgICAgIG5leHRQcm9wcy50ZXh0QnVmZmVyICE9PSB0aGlzLnByb3BzLnRleHRCdWZmZXIgfHxcbiAgICAgICAgbmV4dFByb3BzLnJlYWRPbmx5ICE9PSB0aGlzLnByb3BzLnJlYWRPbmx5XG4gICAgICApIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzVGV4dENvbnRlbnRzID0gdGhpcy5nZXRUZXh0QnVmZmVyKCkuZ2V0VGV4dCgpO1xuICAgICAgY29uc3QgdGV4dEVkaXRvciA9IHNldHVwVGV4dEVkaXRvcihuZXh0UHJvcHMpO1xuICAgICAgaWYgKG5leHRQcm9wcy5zeW5jVGV4dENvbnRlbnRzKSB7XG4gICAgICAgIHRleHRFZGl0b3Iuc2V0VGV4dChwcmV2aW91c1RleHRDb250ZW50cyk7XG4gICAgICB9XG4gICAgICB0aGlzLl91cGRhdGVUZXh0RWRpdG9yKHRleHRFZGl0b3IpO1xuICAgICAgdGhpcy5fb25EaWRVcGRhdGVUZXh0RWRpdG9yRWxlbWVudChuZXh0UHJvcHMpO1xuICAgIH1cbiAgICBpZiAobmV4dFByb3BzLnBhdGggIT09IHRoaXMucHJvcHMucGF0aCkge1xuICAgICAgdGhpcy5nZXRUZXh0QnVmZmVyKCkuc2V0UGF0aChuZXh0UHJvcHMucGF0aCk7XG4gICAgfVxuICAgIGlmIChuZXh0UHJvcHMuZ3V0dGVySGlkZGVuICE9PSB0aGlzLnByb3BzLmd1dHRlckhpZGRlbikge1xuICAgICAgdGhpcy5nZXRNb2RlbCgpLnNldExpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlKG5leHRQcm9wcy5ndXR0ZXJIaWRkZW4pO1xuICAgIH1cbiAgICBpZiAobmV4dFByb3BzLmdyYW1tYXIgIT09IHRoaXMucHJvcHMuZ3JhbW1hcikge1xuICAgICAgdGhpcy5nZXRNb2RlbCgpLnNldEdyYW1tYXIobmV4dFByb3BzLmdyYW1tYXIpO1xuICAgIH1cbiAgfVxuXG4gIF9vbkRpZFVwZGF0ZVRleHRFZGl0b3JFbGVtZW50KHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoIXByb3BzLnJlYWRPbmx5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFRPRE8obW9zdCk6IHQ5OTI5Njc5IFJlbW92ZSB0aGlzIGhhY2sgd2hlbiBBdG9tIGhhcyBhIGJsaW5raW5nIGN1cnNvciBjb25maWd1cmF0aW9uIEFQSS5cbiAgICBjb25zdCB7Y29tcG9uZW50fSA9IHRoaXMuZ2V0RWxlbWVudCgpO1xuICAgIGlmIChjb21wb25lbnQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7cHJlc2VudGVyfSA9IGNvbXBvbmVudDtcbiAgICBwcmVzZW50ZXIuc3RhcnRCbGlua2luZ0N1cnNvcnMgPSBkb05vdGhpbmc7XG4gICAgcHJlc2VudGVyLnN0b3BCbGlua2luZ0N1cnNvcnMoZmFsc2UpO1xuICB9XG5cbiAgZ2V0VGV4dEJ1ZmZlcigpOiBhdG9tJFRleHRCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmdldE1vZGVsKCkuZ2V0QnVmZmVyKCk7XG4gIH1cblxuICBnZXRNb2RlbCgpOiBhdG9tJFRleHRFZGl0b3Ige1xuICAgIHJldHVybiB0aGlzLmdldEVsZW1lbnQoKS5nZXRNb2RlbCgpO1xuICB9XG5cbiAgZ2V0RWxlbWVudCgpOiBhdG9tJFRleHRFZGl0b3JFbGVtZW50IHtcbiAgICBpbnZhcmlhbnQodGhpcy5fdGV4dEVkaXRvckVsZW1lbnQpO1xuICAgIHJldHVybiB0aGlzLl90ZXh0RWRpdG9yRWxlbWVudDtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc25hbWVzKFxuICAgICAgdGhpcy5wcm9wcy5jbGFzc05hbWUsXG4gICAgICAnbnVjbGlkZS10ZXh0LWVkaXRvci1jb250YWluZXInLFxuICAgICAge1xuICAgICAgICAnbm8tYXV0by1ncm93JzogIXRoaXMucHJvcHMuYXV0b0dyb3csXG4gICAgICB9LFxuICAgICk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWV9IC8+XG4gICAgKTtcbiAgfVxuXG4gIC8vIFRoaXMgY29tcG9uZW50IHdyYXBzIHRoZSBpbXBlcmF0aXZlIEFQSSBvZiBgPGF0b20tdGV4dC1lZGl0b3I+YCwgYW5kIHNvIFJlYWN0J3MgcmVuZGVyaW5nXG4gIC8vIHNob3VsZCBhbHdheXMgcGFzcyBiZWNhdXNlIHRoaXMgc3VidHJlZSB3b24ndCBjaGFuZ2UuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IE9iamVjdCwgbmV4dFN0YXRlOiB2b2lkKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbn1cbiJdfQ==