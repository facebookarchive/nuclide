"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteTextEditorPlaceholder = exports.TextEditor = void 0;

function _renderReactRoot() {
  const data = require("../../../modules/nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _RemoteTextEditorPlaceholderComponent() {
  const data = _interopRequireDefault(require("./RemoteTextEditorPlaceholderComponent"));

  _RemoteTextEditorPlaceholderComponent = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
class TextEditor {
  constructor({
    data
  }) {
    this._uri = data.uri;
    this._contents = data.contents;
    this._isModified = data.isModified;
  }

  destroy() {}

  serialize() {
    return {
      deserializer: 'RemoteTextEditorPlaceholder',
      data: {
        uri: this._uri,
        contents: this._contents,
        // If the editor was unsaved, we'll restore the unsaved contents after load.
        isModified: this._isModified
      }
    };
  }

  getTitle() {
    return _nuclideUri().default.basename(this._uri);
  } // This shouldn't *exactly* match the real URI.
  // Otherwise it makes it difficult to swap it out for the real editor.


  getURI() {
    return this._uri.replace('nuclide://', 'nuclide-placeholder://');
  }

  getPath() {
    return this._uri;
  }

  getText() {
    return this._contents;
  }

  isModified() {
    return this._isModified;
  }

  getElement() {
    return (0, _renderReactRoot().renderReactRoot)(React.createElement(_RemoteTextEditorPlaceholderComponent().default, {
      contents: this._contents,
      uri: this._uri
    }));
  }

} // We name the class "TextEditor" because Atom uses the constructor name as the `data-type`
// attribute of the tab and themes style that. We want to make sure that these themes style our tab
// like text editor tabs.


exports.TextEditor = TextEditor;
const RemoteTextEditorPlaceholder = TextEditor;
exports.RemoteTextEditorPlaceholder = RemoteTextEditorPlaceholder;