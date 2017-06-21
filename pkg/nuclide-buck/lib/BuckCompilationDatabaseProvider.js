'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getClangCompilationDatabaseProvider = getClangCompilationDatabaseProvider;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const compilationDBCache = new (_cache || _load_cache()).Cache(); /**
                                                                   * Copyright (c) 2015-present, Facebook, Inc.
                                                                   * All rights reserved.
                                                                   *
                                                                   * This source code is licensed under the license found in the LICENSE file in
                                                                   * the root directory of this source tree.
                                                                   *
                                                                   * 
                                                                   * @format
                                                                   */

function getCompilationDBCache(host) {
  return compilationDBCache.getOrCreate((_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(host) || '', () => new (_cache || _load_cache()).Cache());
}

function getClangCompilationDatabaseProvider() {
  return {
    getCompilationDatabase(src) {
      return getCompilationDBCache(src).getOrCreate(src, () => (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(src).getCompilationDatabase(src).refCount().toPromise());
    },
    resetForSource(src) {
      getCompilationDBCache(src).delete(src);
      (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(src).resetCompilationDatabaseForSource(src);
    },
    reset(host) {
      getCompilationDBCache(host).clear();
      (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(host).resetCompilationDatabase();
    }
  };
}