"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.touchFileDB = touchFileDB;
exports.getAllRecents = getAllRecents;
exports.syncCache = syncCache;

function _lruCache() {
  const data = _interopRequireDefault(require("lru-cache"));

  _lruCache = function () {
    return data;
  };

  return data;
}

function _idbKeyval() {
  const data = _interopRequireDefault(require("idb-keyval"));

  _idbKeyval = function () {
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
 *  strict-local
 * @format
 */
const MAX_RECENT_FILES = 100;
const CLEAN_CACHE_TIMEOUT = 1000 * 15;
const RECENT_FILES_DB_NAME = 'nuclide-recent-files';
/**
 * We don't want to keep making IDB calls for performance reasons, and we only
 * care about tracking MAX_RECENT_FILES files.  So, we keep the LRU cached
 * locally and load from the database the first time we need to access it, and
 * save back to the database (only the top 100) periodically.
 */

let cachedLRU;
/**
 * Keep a timeout to prevent too many repeated saves to the database.
 */

let dbUpdateTimeout;
/**
 * Load in cachedLRU if it isn't there already.
 */

async function ensureCache() {
  if (!cachedLRU) {
    const dbEntries = await _idbKeyval().default.get(RECENT_FILES_DB_NAME);
    cachedLRU = (0, _lruCache().default)({
      max: MAX_RECENT_FILES
    });

    if (dbEntries && dbEntries.length > 0) {
      cachedLRU.load(dbEntries);
    }
  }

  return cachedLRU;
}
/**
 * Update the timestamp for a file in the list of LRU files that is backed by
 * the database.
 */


async function touchFileDB(path, time) {
  (await ensureCache()).set(path, time);

  if (!dbUpdateTimeout) {
    dbUpdateTimeout = setTimeout(() => {
      dbUpdateTimeout = null;
      syncCache();
    }, CLEAN_CACHE_TIMEOUT);
  }
}
/**
 * Get the LRU files.
 */


async function getAllRecents() {
  return ensureCache();
}
/**
 * Save the LRU files back to the stable store.
 * With clearCache = true, clears the local cache.
 */


async function syncCache(clearCache = false) {
  if (cachedLRU) {
    // This technically saves the "value" as a serialized json, but it will only
    // be up to MAX_RECENT_FILES long.
    await _idbKeyval().default.set(RECENT_FILES_DB_NAME, cachedLRU.dump());

    if (clearCache) {
      cachedLRU = null;
    }
  }
}