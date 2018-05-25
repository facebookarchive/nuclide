'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

class RecentFilesService {
  // Map uses `Map`'s insertion ordering to keep files in order.
  constructor(state) {
    this._fileList = (0, (_lruCache || _load_lruCache()).default)({ max: 100 });
    if (state != null && state.filelist != null) {
      // Serialized state is in reverse chronological order. Reverse it to insert items correctly.
      state.filelist.reduceRight((_, fileItem) => {
        this._fileList.set(fileItem.path, fileItem.timestamp);
      }, null);
    }
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._subscriptions.add(atom.workspace.onDidChangeActivePaneItem(item => {
      // Not all `item`s are instances of TextEditor (e.g. the diff view).
      // flowlint-next-line sketchy-null-mixed:off
      if (!item || typeof item.getPath !== 'function') {
        return;
      }
      const editorPath = item.getPath();
      if (editorPath != null) {
        this.touchFile(editorPath);
      }
    }));
  }

  touchFile(path) {
    this._fileList.set(path, Date.now());
  }

  /**
   * Returns a reverse-chronological list of recently opened files.
   */
  getRecentFiles() {
    return this._fileList.dump().map(({ k, v }) => ({
      resultType: 'FILE',
      path: k,
      timestamp: v
    }));
  }

  dispose() {
    this._subscriptions.dispose();
  }
}
exports.default = RecentFilesService;