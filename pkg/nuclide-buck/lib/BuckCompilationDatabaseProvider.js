'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getClangCompilationDatabaseProvider = getClangCompilationDatabaseProvider;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _cache;

function _load_cache() {
  return _cache = require('../../commons-node/cache');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _SharedObservableCache;

function _load_SharedObservableCache() {
  return _SharedObservableCache = _interopRequireDefault(require('../../commons-node/SharedObservableCache'));
}

var _BuckTaskRunner;

function _load_BuckTaskRunner() {
  return _BuckTaskRunner = require('./BuckTaskRunner');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Provider {

  constructor(host, params) {
    this._compilationDBCache = new (_cache || _load_cache()).Cache();
    this._buildFileForSourceCache = new (_cache || _load_cache()).Cache();
    this._watchedFilesCache = new (_cache || _load_cache()).Cache({
      dispose: subscription => subscription.unsubscribe()
    });

    this._host = host;
    this._watchedFilesObservablesCache = this._createWatchedFilesObservablesCache();
    this._params = params;
  }

  _createWatchedFilesObservablesCache() {
    return new (_SharedObservableCache || _load_SharedObservableCache()).default(buildFile => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileWatcherServiceByNuclideUri)(this._host).watchFileWithNode(buildFile).refCount().share().take(1));
  }

  watchBuildFile(buildFile, src) {
    const watchedFile = this._buildFileForSourceCache.get(src);
    if (watchedFile != null) {
      return;
    }
    this._buildFileForSourceCache.set(src, buildFile);
    this._watchedFilesCache.set(src, this._watchedFilesObservablesCache.get(buildFile).subscribe(() => {
      try {
        this.resetForSource(src);
      } catch (_) {}
    }));
  }

  getCompilationDatabase(src) {
    return this._compilationDBCache.getOrCreate(src, () => {
      return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(this._host).getCompilationDatabase(src, this._params).refCount().do(db => {
        if (db != null && db.flagsFile != null) {
          this.watchBuildFile(db.flagsFile, src);
        }
      }).toPromise();
    });
  }

  resetForSource(src) {
    this._compilationDBCache.delete(src);
    (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(this._host).resetCompilationDatabaseForSource(src, this._params);
    this._buildFileForSourceCache.delete(src);
    this._watchedFilesCache.delete(src);
  }

  reset() {
    this._compilationDBCache.clear();
    (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(this._host).resetCompilationDatabase(this._params);
    this._buildFileForSourceCache.clear();
    this._watchedFilesCache.clear();
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

const providersCache = new (_cache || _load_cache()).Cache({
  keyFactory: ([host, params]) => JSON.stringify([(_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(host) || '', params]),
  dispose: provider => provider.reset()
});

function getProvider(host, params) {
  return providersCache.getOrCreate([host, params], () => new Provider(host, params));
}

function getClangCompilationDatabaseProvider(taskRunner) {
  return {
    getCompilationDatabase(src) {
      const params = taskRunner.getCompilationDatabaseParamsForCurrentContext();
      return getProvider(src, params).getCompilationDatabase(src);
    },
    resetForSource(src) {
      const params = taskRunner.getCompilationDatabaseParamsForCurrentContext();
      getProvider(src, params).resetForSource(src);
    },
    reset(host) {
      const params = taskRunner.getCompilationDatabaseParamsForCurrentContext();
      providersCache.delete([host, params]);
    }
  };
}