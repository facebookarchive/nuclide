"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _ImageEditorView() {
  const data = _interopRequireDefault(require("./ImageEditorView"));

  _ImageEditorView = function () {
    return data;
  };

  return data;
}

function _LocalFileCopy() {
  const data = _interopRequireDefault(require("./LocalFileCopy"));

  _LocalFileCopy = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
class ImageEditor {
  constructor(filePath) {
    this._disposed = new _RxMin.ReplaySubject(1);
    this._didTerminatePendingState = new _RxMin.Subject();
    this.file = _nuclideUri().default.isRemote(filePath) ? new (_LocalFileCopy().default)(filePath) : new _atom.File(filePath);
    (0, _event().observableFromSubscribeFunction)(cb => this.file.onDidDelete(cb)).takeUntil(this._disposed).subscribe(() => {
      const pane = atom.workspace.paneForURI(filePath);

      try {
        pane.destroyItem(pane.itemForURI(filePath));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Could not destroy pane after external file was deleted: ${e}`);
      }

      this.destroy();
    });
  }

  isModified() {
    return false;
  }

  copy() {
    return new ImageEditor(this.getPath());
  }

  getElement() {
    if (this._view == null) {
      this._view = new (_ImageEditorView().default)(this);
    }

    return this._view.getElement();
  }

  serialize() {
    // We use the same name as Atom's deserializer since we're replacing it.
    return {
      filePath: this.getPath(),
      deserializer: 'ImageEditor'
    };
  }

  terminatePendingState() {
    if (this.isEqual(atom.workspace.getCenter().getActivePane().getPendingItem())) {
      this._didTerminatePendingState.next();
    }
  }

  whenReady(callback) {
    if (this.file instanceof _LocalFileCopy().default) {
      return this.file.whenReady(callback);
    }

    callback();
    return new (_UniversalDisposable().default)();
  }

  onDidTerminatePendingState(callback) {
    return new (_UniversalDisposable().default)(this._didTerminatePendingState.takeUntil(this._disposed).subscribe(() => {
      callback();
    }));
  } // Register a callback for when the image file changes


  onDidChange(callback) {
    return new (_UniversalDisposable().default)((0, _event().observableFromSubscribeFunction)(cb => this.file.onDidChange(cb)).takeUntil(this._disposed).subscribe(() => {
      callback();
    }));
  } // Register a callback for whne the image's title changes


  onDidChangeTitle(callback) {
    return new (_UniversalDisposable().default)((0, _event().observableFromSubscribeFunction)(cb => this.file.onDidRename(cb)).takeUntil(this._disposed).map(() => this.getTitle()).subscribe(title => {
      callback(title);
    }));
  }

  destroy() {
    this._disposed.next();

    if (this._view != null) {
      this._view.destroy();
    }
  }

  getAllowedLocations() {
    return ['center'];
  } // Retrieves the filename of the open file.
  //
  // This is `'untitled'` if the file is new and not saved to the disk.


  getTitle() {
    const filePath = this.getPath();

    if (filePath) {
      return _nuclideUri().default.basename(filePath);
    } else {
      return 'untitled';
    }
  } // Retrieves the absolute path to the image.


  getPath() {
    return this.file.getPath();
  }

  getLocalPath() {
    return typeof this.file.getLocalPath === 'function' ? this.file.getLocalPath() : this.file.getPath();
  } // Retrieves the URI of the image.


  getURI() {
    return this.getPath();
  } // Retrieves the encoded URI of the image.


  getEncodedURI() {
    // IMPORTANT: This shouldn't be called before `whenReady()`! If it is, you could get `null`.
    const path = this.getLocalPath();
    return path == null ? null : `file://${encodeURI(path.replace(/\\/g, '/')).replace(/#/g, '%23').replace(/\?/g, '%3F')}`;
  } // Compares two {ImageEditor}s to determine equality.
  //
  // Equality is based on the condition that the two URIs are the same.


  isEqual(other) {
    return other instanceof ImageEditor && this.getURI() === other.getURI();
  } // Essential: Invoke the given callback when the editor is destroyed.


  onDidDestroy(callback) {
    return new (_UniversalDisposable().default)(this._disposed.subscribe(() => {
      callback();
    }));
  }

}

exports.default = ImageEditor;