'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DID_DESTROY_EVENT_NAME = 'did-destroy';
const CHANGE_TITLE_EVENT_NAME = 'did-change-title';

let DiffViewElement = class DiffViewElement extends HTMLElement {

  initialize(diffModel, uri) {
    this._diffModel = diffModel;
    this._uri = uri;
    this._emitter = new _atom.Emitter();
    this._subscriptions = new _atom.CompositeDisposable();

    let fileName = this._getActiveFileName();
    this._subscriptions.add(this._diffModel.onDidUpdateState(() => {
      const newFileName = this._getActiveFileName();
      if (newFileName !== fileName) {
        fileName = newFileName;
        this._emitter.emit(CHANGE_TITLE_EVENT_NAME, this.getTitle());
      }
    }));
    this._subscriptions.add(this._emitter);
    return this;
  }

  _getActiveFileName() {
    const filePath = this._diffModel.getState().fileDiff.filePath;

    if (filePath == null || filePath.length === 0) {
      return null;
    }
    return (_nuclideUri || _load_nuclideUri()).default.basename(filePath);
  }

  getIconName() {
    return 'git-branch';
  }

  /**
   * Return the tab title for the opened diff view tab item.
   */
  getTitle() {
    const fileName = this._getActiveFileName();
    return 'Diff View' + (fileName == null ? '' : ` : ${ fileName }`);
  }

  /**
   * Change the title as the active file changes.
   */
  onDidChangeTitle(callback) {
    return this._emitter.on('did-change-title', callback);
  }

  /**
   * Return the tab URI for the opened diff view tab item.
   * This guarantees only one diff view will be opened per URI.
   */
  getURI() {
    return this._uri;
  }

  /**
   * Saves the edited file in the editable right text editor.
   */
  save() {
    this._diffModel.saveActiveFile();
  }

  onDidChangeModified(callback) {
    return this._diffModel.onDidActiveBufferChangeModified(callback);
  }

  isModified() {
    return this._diffModel.isActiveBufferModified();
  }

  /**
   * Emits a destroy event that's used to unmount the attached React component
   * and invalidate the cached view instance of the Diff View.
   */
  destroy() {
    this._emitter.emit('did-destroy');
    this._subscriptions.dispose();
  }

  serialize() {
    return null;
  }

  onDidDestroy(callback) {
    return this._emitter.on(DID_DESTROY_EVENT_NAME, callback);
  }

};
exports.default = document.registerElement('nuclide-diff-view', {
  prototype: DiffViewElement.prototype
});
module.exports = exports['default'];