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

const compilationDBCache = new (_cache || _load_cache()).Cache();
function getCompilationDBCache(host) {
  return compilationDBCache.getOrCreate((_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(host) || '', () => new (_cache || _load_cache()).Cache());
}

const _buildFileForSource = new (_cache || _load_cache()).Cache();
const _watchedFiles = new (_cache || _load_cache()).Cache();
const _watchedFilesObservables = new (_cache || _load_cache()).Cache();

function getWatchedFilesObservablesCache(host) {
  return _watchedFilesObservables.getOrCreate(host, () => new (_SharedObservableCache || _load_SharedObservableCache()).default(buildFile => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileWatcherServiceByNuclideUri)(host).watchFileWithNode(buildFile).refCount().share().take(1)));
}

function getBuildFilesForSourceCache(host) {
  return _buildFileForSource.getOrCreate((_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(host) || '', () => new (_cache || _load_cache()).Cache(buildFile => getWatchedFilesForSourceCache(host).delete(buildFile)));
}

function getWatchedFilesForSourceCache(host) {
  return _watchedFiles.getOrCreate((_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(host) || '', () => new (_cache || _load_cache()).Cache(subscription => subscription.unsubscribe()));
}

function getClangCompilationDatabaseProvider() {
  return {
    watchBuildFile(buildFile, src) {
      const host = src;
      const buildFilesCache = getBuildFilesForSourceCache(host);
      const watchedFile = buildFilesCache.get(src);
      if (watchedFile != null) {
        return;
      }
      buildFilesCache.set(src, buildFile);
      getWatchedFilesForSourceCache(host).set(buildFile, getWatchedFilesObservablesCache(host).get(buildFile).subscribe(() => {
        try {
          this.resetForSource(src);
        } catch (_) {}
      }));
    },
    getCompilationDatabase(src) {
      return getCompilationDBCache(src).getOrCreate(src, () => {
        return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(src).getCompilationDatabase(src).refCount().do(db => {
          if (db != null && db.flagsFile != null) {
            this.watchBuildFile(db.flagsFile, src);
          }
        }).toPromise();
      });
    },
    resetForSource(src) {
      const host = src;
      getCompilationDBCache(host).delete(src);
      (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(host).resetCompilationDatabaseForSource(src);
      getBuildFilesForSourceCache(host).delete(src);
    },
    reset(host) {
      getCompilationDBCache(host).clear();
      (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(host).resetCompilationDatabase();
      getBuildFilesForSourceCache(host).clear();
      getWatchedFilesForSourceCache(host).clear();
    }
  };
}