'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.getClangProvider = getClangProvider;

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

var _BuckTaskRunner;

function _load_BuckTaskRunner() {
  return _BuckTaskRunner = require('./BuckTaskRunner');
}

var _ClangFlagsFileWatcher;

function _load_ClangFlagsFileWatcher() {
  return _ClangFlagsFileWatcher = require('../../nuclide-clang-base/lib/ClangFlagsFileWatcher');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Provider {

  constructor(host, params) {
    this._projectRootCache = new (_cache || _load_cache()).Cache();
    this._compilationDBCache = new (_cache || _load_cache()).Cache();

    this._host = host;
    this._flagsFileWatcher = new (_ClangFlagsFileWatcher || _load_ClangFlagsFileWatcher()).ClangFlagsFileWatcher(host);
    this._params = params;
  }

  getCompilationDatabase(src) {
    return this._compilationDBCache.getOrCreate(src, () => {
      return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(this._host).getCompilationDatabase(src, this._params).refCount().do(db => {
        if (db != null && db.flagsFile != null) {
          this._flagsFileWatcher.watch(db.flagsFile, src, () => this.resetForSource(src));
        }
      }).toPromise();
    });
  }

  getProjectRoot(src) {
    return this._projectRootCache.getOrCreate(src, () => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(this._host).getRootForPath(src));
  }

  resetForSource(src) {
    this._compilationDBCache.delete(src);
    (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(this._host).resetCompilationDatabaseForSource(src, this._params);
    this._flagsFileWatcher.resetForSource(src);
  }

  reset() {
    this._compilationDBCache.clear();
    (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(this._host).resetCompilationDatabase(this._params);
    this._flagsFileWatcher.reset();
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

const supportsSourceCache = new (_cache || _load_cache()).Cache();

function getClangProvider(taskRunner) {
  return {
    supportsSource(src) {
      return (0, _asyncToGenerator.default)(function* () {
        return supportsSourceCache.getOrCreate(src, (0, _asyncToGenerator.default)(function* () {
          return (yield (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(src).getRootForPath(src)) != null;
        }));
      })();
    },
    getSettings(src) {
      return (0, _asyncToGenerator.default)(function* () {
        const params = taskRunner.getCompilationDatabaseParamsForCurrentContext();
        const provider = getProvider(src, params);
        const [compilationDatabase, projectRoot] = yield Promise.all([provider.getCompilationDatabase(src), provider.getProjectRoot(src)]);
        if (projectRoot == null) {
          return null;
        }
        return {
          projectRoot,
          compilationDatabase
        };
      })();
    },
    resetForSource(src) {
      const params = taskRunner.getCompilationDatabaseParamsForCurrentContext();
      getProvider(src, params).resetForSource(src);
      supportsSourceCache.delete(src);
    },
    reset(src) {
      const params = taskRunner.getCompilationDatabaseParamsForCurrentContext();
      providersCache.delete([src, params]);
      supportsSourceCache.clear();
    },
    priority: 100
  };
}