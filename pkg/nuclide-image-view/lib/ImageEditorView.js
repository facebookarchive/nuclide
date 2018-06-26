'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = _interopRequireDefault(require('fs'));

var _Message;

function _load_Message() {
  return _Message = require('../../../modules/nuclide-commons-ui/Message');
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../../modules/nuclide-commons-ui/renderReactRoot');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _imageEditorView;

function _load_imageEditorView() {
  return _imageEditorView = _interopRequireDefault(require('../VendorLib/image-view/lib/image-editor-view'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This view wraps the vendored one. This is necessary because the Atom ImageEditorView performs
 * a stat on the file so we neeed to make sure that the (local) file exists.
 */
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

class ImageEditorView {

  constructor(editor) {
    this.element = document.createElement('div');
    this.element.className = 'nuclide-image-view-wrapper';
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    // We need to defer loading the real view until the local file is ready because it assumes it
    // exists.
    editor.whenReady(() => {
      // In some weird cases (e.g. Dash cached a deleted file path?), we might have tried to open
      // a nonexistent file. In that case, just show an error. It's important that we don't create
      // an AtomImageEditorView because that will try to stat the nonexistent file and error.
      if (!_fs.default.existsSync((0, (_nullthrows || _load_nullthrows()).default)(editor.getLocalPath()))) {
        const message = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.createElement(
          (_Message || _load_Message()).Message,
          { type: 'error' },
          'Image doesn\'t exist'
        ));
        message.style.flexDirection = 'column';
        this.element.appendChild(message);
        return;
      }

      // AtomImageEditorView tries to do a stat using the result of `getPath()` so we give it a
      // proxy that always returns the local path instead of the real editor. (We don't want to
      // change the editor's `getPath()` because other things use that for display purposes and we
      // want to show the remote path.)
      const proxy = new Proxy(editor, {
        get(obj, prop) {
          if (prop === 'getPath') {
            return editor.getLocalPath;
          }
          // $FlowIgnore
          return obj[prop];
        }
      });
      this._realView = new (_imageEditorView || _load_imageEditorView()).default(proxy);
      this.element.appendChild(this._realView.element);
    }), () => {
      if (this._realView != null) {
        this._realView.destroy();
      }
    });
  }

  getElement() {
    return this.element;
  }

  destroy() {
    this._disposables.dispose();
  }
}
exports.default = ImageEditorView;