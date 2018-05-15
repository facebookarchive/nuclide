'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.Notice = exports.TextEditorBanner = undefined;var _Message;













function _load_Message() {return _Message = require('./Message');}var _UniversalDisposable;

function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));}
var _react = _interopRequireWildcard(require('react'));
var _reactDom = _interopRequireDefault(require('react-dom'));function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                            * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                            * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                            * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                            * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                            * 
                                                                                                                                                                                                                                                                                                                                                                                                                            * @format
                                                                                                                                                                                                                                                                                                                                                                                                                            */class TextEditorBanner {constructor(editor) {
    this._editor = editor;
    const editorElement = editor.getElement().firstChild;
    this._element = document.createElement('div');
    this._element.className = 'nuclide-ui-text-editor-banner-container';if (!(


    editorElement instanceof HTMLElement && editorElement.parentNode != null)) {throw new Error('Invariant violation: "editorElement instanceof HTMLElement && editorElement.parentNode != null"');}


    editorElement.parentNode.insertBefore(this._element, editorElement);
    this._editorElement = editorElement;

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    () => {
      _reactDom.default.unmountComponentAtNode(this._element);
      this._element.replaceWith(editorElement);
    },
    atom.workspace.observeActiveTextEditor(activeEditor => {
      if (activeEditor == null) {
        return;
      }
      if (activeEditor.getElement().contains(editor.getElement())) {
        // This is needed for situations where the editor was rendered while
        // display: none so _updateTextEditorElement wasn't able to properly
        // measure at that time.
        editor.getElement().measureDimensions();
      }
    }));

  }

  dispose() {
    this._disposables.dispose();
  }

  _updateTextEditorElement(editorContainerRef) {
    const editorContainerNode = _reactDom.default.findDOMNode(editorContainerRef);
    if (editorContainerNode == null) {
      return;
    }

    // Clear the previous child
    while (editorContainerNode.lastChild) {
      editorContainerNode.removeChild(editorContainerNode.lastChild);
    }

    // And insert the new one instead
    editorContainerNode.appendChild(this._editorElement);
    this._editor.getElement().measureDimensions();

    // Fix for Hyperclicking a read-only file.
    // Restore the scroll position in the editor.
    this._editor.
    getElement().
    getModel().
    scrollToCursorPosition();
  }

  render(reactElement) {
    _reactDom.default.render(
    _react.createElement('div', { className: 'nuclide-ui-text-editor-banner' },
      _react.createElement('div', { className: 'nuclide-ui-text-editor-banner-element' },
        reactElement),

      _react.createElement('div', {
        // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
        ref: ref => this._updateTextEditorElement(ref),
        className: 'nuclide-ui-text-editor-banner-editor' })),


    this._element);

  }

  hide() {
    this.dispose();
  }}exports.TextEditorBanner = TextEditorBanner;







class Notice extends _react.Component {
  render() {
    return (
      _react.createElement('div', { className: 'nuclide-ui-text-editor-banner-notice' },
        _react.createElement((_Message || _load_Message()).Message, { type: this.props.messageType },
          _react.createElement('div', { className: 'nuclide-ui-text-editor-banner-notice-content' },
            this.props.children))));




  }}exports.Notice = Notice;