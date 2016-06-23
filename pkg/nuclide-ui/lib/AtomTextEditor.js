Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var doNothing = function doNothing() {};

function setupTextEditor(props) {
  var textBuffer = props.textBuffer || new (_atom2 || _atom()).TextBuffer();
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
    textEditor.delete = doNothing;

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
      var container = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this);
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
      (0, (_assert2 || _assert()).default)(this._textEditorElement);
      return this._textEditorElement;
    }
  }, {
    key: 'render',
    value: function render() {
      var className = (0, (_classnames2 || _classnames()).default)(this.props.className, 'nuclide-text-editor-container', {
        'no-auto-grow': !this.props.autoGrow
      });
      return (_reactForAtom2 || _reactForAtom()).React.createElement('div', { className: className });
    }

    // This component wraps the imperative API of `<atom-text-editor>`, and so React's rendering
    // should always pass because this subtree won't change.
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return false;
    }
  }], [{
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
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.AtomTextEditor = AtomTextEditor;