"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

function _Message() {
  const data = require("../../../modules/nuclide-commons-ui/Message");

  _Message = function () {
    return data;
  };

  return data;
}

function _renderReactRoot() {
  const data = require("../../../modules/nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _imageEditorView() {
  const data = _interopRequireDefault(require("../VendorLib/image-view/lib/image-editor-view"));

  _imageEditorView = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

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

/**
 * This view wraps the vendored one. This is necessary because the Atom ImageEditorView performs
 * a stat on the file so we neeed to make sure that the (local) file exists.
 */
class ImageEditorView {
  constructor(editor) {
    this.element = document.createElement('div');
    this.element.className = 'nuclide-image-view-wrapper';
    this._disposables = new (_UniversalDisposable().default)( // We need to defer loading the real view until the local file is ready because it assumes it
    // exists.
    editor.whenReady(() => {
      // In some weird cases (e.g. Dash cached a deleted file path?), we might have tried to open
      // a nonexistent file. In that case, just show an error. It's important that we don't create
      // an AtomImageEditorView because that will try to stat the nonexistent file and error.
      if (!_fs.default.existsSync((0, _nullthrows().default)(editor.getLocalPath()))) {
        const message = (0, _renderReactRoot().renderReactRoot)(React.createElement(_Message().Message, {
          type: "error"
        }, "Image doesn't exist"));
        message.style.flexDirection = 'column';
        this.element.appendChild(message);
        return;
      } // AtomImageEditorView tries to do a stat using the result of `getPath()` so we give it a
      // proxy that always returns the local path instead of the real editor. (We don't want to
      // change the editor's `getPath()` because other things use that for display purposes and we
      // want to show the remote path.)


      const proxy = new Proxy(editor, {
        get(obj, prop) {
          if (prop === 'getPath') {
            return editor.getLocalPath;
          } // $FlowIgnore


          return obj[prop];
        }

      });
      this._realView = new (_imageEditorView().default)(proxy);
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