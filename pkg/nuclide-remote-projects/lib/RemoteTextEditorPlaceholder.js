'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteTextEditorPlaceholder = exports.TextEditor = undefined;

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../../modules/nuclide-commons-ui/renderReactRoot');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _react = _interopRequireWildcard(require('react'));

var _RemoteTextEditorPlaceholderComponent;

function _load_RemoteTextEditorPlaceholderComponent() {
  return _RemoteTextEditorPlaceholderComponent = _interopRequireDefault(require('./RemoteTextEditorPlaceholderComponent'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

  constructor({ data }) {
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
    return (_nuclideUri || _load_nuclideUri()).default.basename(this._uri);
  }

  // This shouldn't *exactly* match the real URI.
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
    return (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.createElement((_RemoteTextEditorPlaceholderComponent || _load_RemoteTextEditorPlaceholderComponent()).default, {
      contents: this._contents,
      uri: this._uri
    }));
  }
}

exports.TextEditor = TextEditor; // We name the class "TextEditor" because Atom uses the constructor name as the `data-type`
// attribute of the tab and themes style that. We want to make sure that these themes style our tab
// like text editor tabs.

const RemoteTextEditorPlaceholder = exports.RemoteTextEditorPlaceholder = TextEditor;