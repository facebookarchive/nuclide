'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClangFlagsFileWatcher = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _cache;

function _load_cache() {
  return _cache = require('../../commons-node/cache');
}

var _SharedObservableCache;

function _load_SharedObservableCache() {
  return _SharedObservableCache = _interopRequireDefault(require('../../commons-node/SharedObservableCache'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

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

class ClangFlagsFileWatcher {

  constructor(host) {
    this._flagsFileForSourceCache = new (_cache || _load_cache()).Cache();
    this._watchedFilesCache = new (_cache || _load_cache()).Cache({
      dispose: subscription => subscription.unsubscribe()
    });

    this._watchedFilesObservablesCache = new (_SharedObservableCache || _load_SharedObservableCache()).default(buildFile => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileWatcherServiceByNuclideUri)(host).watchFileWithNode(buildFile).refCount().share().take(1));
  }

  watch(flagsFile, src, onChange) {
    const watchedFile = this._flagsFileForSourceCache.get(src);
    if (watchedFile != null) {
      return;
    }
    this._flagsFileForSourceCache.set(src, flagsFile);
    this._watchedFilesCache.set(src, this._watchedFilesObservablesCache.get(flagsFile).subscribe(() => {
      try {
        onChange();
      } catch (_) {}
    }));
  }

  reset() {
    this._flagsFileForSourceCache.clear();
    this._watchedFilesCache.clear();
  }

  resetForSource(src) {
    this._flagsFileForSourceCache.delete(src);
    this._watchedFilesCache.delete(src);
  }
}
exports.ClangFlagsFileWatcher = ClangFlagsFileWatcher;