'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findArcProjectIdAndDirectory = findArcProjectIdAndDirectory;
exports.getCachedArcProjectIdAndDirectory = getCachedArcProjectIdAndDirectory;
exports.getLastProjectPath = getLastProjectPath;

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const arcInfoCache = new (_lruCache || _load_lruCache()).default({
  max: 200
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */

/* global localStorage */

const arcInfoResultCache = new (_lruCache || _load_lruCache()).default({
  max: 200
});
const STORAGE_KEY = 'nuclide.last-arc-project-path';

/**
 * Cached wrapper around ArcanistService.findArcProjectIdAndDirectory.
 * The service also caches this, but since this is called so frequently we should
 * try to avoid going over the RPC layer as well.
 */
function findArcProjectIdAndDirectory(src) {
  let cached = arcInfoCache.get(src);
  if (cached == null) {
    const arcService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getArcanistServiceByNuclideUri)(src);
    cached = arcService.findArcProjectIdAndDirectory(src).then(result => {
      // Store the path in local storage for `getLastProjectPath`.
      if (result != null) {
        localStorage.setItem(`${STORAGE_KEY}.${result.projectId}`, result.directory);
      }
      arcInfoResultCache.set(src, result);
      return result;
    }).catch(err => {
      // Clear the cache if there's an error to enable retries.
      arcInfoCache.del(src);
      return Promise.reject(err);
    });
    arcInfoCache.set(src, cached);
  }
  return cached;
}

/**
 * A best-effort function that only works if findArcProjectIdAndDirectory
 * has completed at some point in the past.
 * This is actually the common case due to its ubiquity.
 */
function getCachedArcProjectIdAndDirectory(src) {
  return arcInfoResultCache.get(src);
}

function getLastProjectPath(projectId) {
  return localStorage.getItem(`${STORAGE_KEY}.${projectId}`);
}