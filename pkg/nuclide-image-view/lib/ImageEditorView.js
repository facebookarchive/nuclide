'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _imageEditorView;

function _load_imageEditorView() {
  return _imageEditorView = _interopRequireDefault(require('../VendorLib/image-view/lib/image-editor-view'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This view wraps the vendored one. This is necessary because the Atom ImageEditorView performs
 * a stat on the file so we neeed to make sure that the (local) file exists.
 */
class ImageEditorView {

  constructor(editor) {
    this.element = document.createElement('div');
    this.element.className = 'nuclide-image-view-wrapper';
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    // We need to defer loading the real view until the local file is ready because it assumes it
    // exists.
    editor.whenReady(() => {
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
exports.default = ImageEditorView; /**
                                    * Copyright (c) 2015-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the license found in the LICENSE file in
                                    * the root directory of this source tree.
                                    *
                                    * 
                                    * @format
                                    */