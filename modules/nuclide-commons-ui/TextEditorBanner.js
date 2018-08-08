"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Notice = exports.TextEditorBanner = void 0;

function _Message() {
  const data = require("./Message");

  _Message = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
class TextEditorBanner {
  constructor(editor) {
    this.render = reactElement => {
      this.renderUnstyled(React.createElement("div", {
        className: "nuclide-ui-text-editor-banner-element"
      }, reactElement));
    };

    this.renderUnstyled = reactElement => {
      _reactDom.default.render(React.createElement("div", {
        className: "nuclide-ui-text-editor-banner"
      }, reactElement, React.createElement("div", {
        // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
        ref: ref => this._updateTextEditorElement(ref),
        className: "nuclide-ui-text-editor-banner-editor"
      })), this._element);
    };

    this._editor = editor;
    const editorElement = editor.getElement().firstChild;
    this._element = document.createElement('div');
    this._element.className = 'nuclide-ui-text-editor-banner-container';

    if (!(editorElement instanceof HTMLElement && editorElement.parentNode != null)) {
      throw new Error("Invariant violation: \"editorElement instanceof HTMLElement && editorElement.parentNode != null\"");
    }

    editorElement.parentNode.insertBefore(this._element, editorElement);
    this._editorElement = editorElement;
    this._disposables = new (_UniversalDisposable().default)(() => {
      _reactDom.default.unmountComponentAtNode(this._element);

      this._element.replaceWith(editorElement);
    }, atom.workspace.observeActiveTextEditor(activeEditor => {
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
    } // Clear the previous child


    while (editorContainerNode.lastChild) {
      editorContainerNode.removeChild(editorContainerNode.lastChild);
    } // And insert the new one instead


    editorContainerNode.appendChild(this._editorElement);

    this._editor.getElement().measureDimensions(); // Fix for Hyperclicking a read-only file.
    // Restore the scroll position in the editor.


    this._editor.getElement().getModel().scrollToCursorPosition();
  }

  hide() {
    this.dispose();
  }

}

exports.TextEditorBanner = TextEditorBanner;

class Notice extends React.Component {
  render() {
    return React.createElement("div", {
      className: "nuclide-ui-text-editor-banner-notice"
    }, React.createElement(_Message().Message, {
      type: this.props.messageType
    }, React.createElement("div", {
      className: "nuclide-ui-text-editor-banner-notice-content"
    }, this.props.children)));
  }

}

exports.Notice = Notice;