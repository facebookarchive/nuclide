'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _UniversalDisposable;











function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}
var _react = _interopRequireWildcard(require('react'));
var _reactDom = _interopRequireDefault(require('react-dom'));var _AtomTextEditor;
function _load_AtomTextEditor() {return _AtomTextEditor = require('../../../../../nuclide-commons-ui/AtomTextEditor');}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}















const ENTER_KEY_CODE = 13; /**
                            * Copyright (c) 2017-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the BSD-style license found in the
                            * LICENSE file in the root directory of this source tree. An additional grant
                            * of patent rights can be found in the PATENTS file in the same directory.
                            *
                            *  strict-local
                            * @format
                            */const UP_KEY_CODE = 38;const DOWN_KEY_CODE = 40;class InputArea extends _react.Component {constructor(props) {super(props);this.





    focus = () => {
      if (this._textEditorModel != null) {
        this._textEditorModel.getElement().focus();
      }
    };this.

    _submit = () => {
      // Clear the text and trigger the `onSubmit` callback
      const editor = this._textEditorModel;
      if (editor == null) {
        return;
      }

      const text = editor.getText();
      if (text === '') {
        return;
      }

      editor.setText(''); // Clear the text field.
      this.props.onSubmit(text);
      this.setState({ historyIndex: -1 });
    };this.

    _attachLabel = editor => {
      const { watchEditor } = this.props;
      const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();
      if (watchEditor) {
        disposable.add(watchEditor(editor, ['nuclide-console']));
      }
      return disposable;
    };this.

    _handleTextEditor = component => {
      if (this._keySubscription) {
        this._textEditorModel = null;
        this._keySubscription.unsubscribe();
      }
      if (component) {
        this._textEditorModel = component.getModel();
        const el = _reactDom.default.findDOMNode(component);
        this._keySubscription = _rxjsBundlesRxMinJs.Observable.fromEvent(el, 'keydown').subscribe(
        this._handleKeyDown);

      }
    };this.

    _handleKeyDown = event => {
      const editor = this._textEditorModel;
      // Detect AutocompletePlus menu element: https://git.io/vddLi
      const isAutocompleteOpen =
      document.querySelector('autocomplete-suggestion-list') != null;
      if (editor == null) {
        return;
      }
      if (event.which === ENTER_KEY_CODE) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (event.ctrlKey || event.altKey || event.shiftKey) {
          editor.insertNewline();
          return;
        }

        this._submit();
      } else if (
      event.which === UP_KEY_CODE && (
      editor.getLineCount() <= 1 || editor.getCursorBufferPosition().row === 0))
      {
        if (this.props.history.length === 0 || isAutocompleteOpen) {
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        const historyIndex = Math.min(
        this.state.historyIndex + 1,
        this.props.history.length - 1);

        if (this.state.historyIndex === -1) {
          this.setState({ historyIndex, draft: editor.getText() });
        } else {
          this.setState({ historyIndex });
        }
        editor.setText(
        this.props.history[this.props.history.length - historyIndex - 1]);

      } else if (
      event.which === DOWN_KEY_CODE && (
      editor.getLineCount() <= 1 ||
      editor.getCursorBufferPosition().row === editor.getLineCount() - 1))
      {
        if (this.props.history.length === 0 || isAutocompleteOpen) {
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        const historyIndex = Math.max(this.state.historyIndex - 1, -1);
        this.setState({ historyIndex });
        if (historyIndex === -1) {
          editor.setText(this.state.draft);
        } else {
          editor.setText(
          this.props.history[this.props.history.length - historyIndex - 1]);

        }
      }
    };this.state = { historyIndex: -1, draft: '' };}

  render() {
    const grammar =
    this.props.scopeName == null ?
    null :
    atom.grammars.grammarForScopeName(this.props.scopeName);
    return (
      _react.createElement('div', { className: 'console-input-wrapper' },
        _react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
          ref: this._handleTextEditor,
          grammar: grammar,
          gutterHidden: true,
          autoGrow: true,
          lineNumberGutterVisible: false,
          onConfirm: this._submit,
          onInitialized: this._attachLabel,
          onDidTextBufferChange: this.props.onDidTextBufferChange,
          placeholderText: this.props.placeholderText })));



  }}exports.default = InputArea;