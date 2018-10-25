"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClangFlagsFileWatcher = void 0;

function _SimpleCache() {
  const data = require("../../../modules/nuclide-commons/SimpleCache");

  _SimpleCache = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _SharedObservableCache() {
  const data = _interopRequireDefault(require("../../commons-node/SharedObservableCache"));

  _SharedObservableCache = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
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
    this._flagsFileForSourceCache = new (_SimpleCache().SimpleCache)();
    this._watchedFilesCache = new (_SimpleCache().SimpleCache)({
      dispose: subscription => subscription.unsubscribe()
    });
    this._watchedFilesObservablesCache = new (_SharedObservableCache().default)(buildFile => (0, _nuclideRemoteConnection().getFileWatcherServiceByNuclideUri)(host).watchWithNode(buildFile).refCount().share().take(1));
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