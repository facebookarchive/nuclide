"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.touchFileDB = touchFileDB;
exports.getAllRecents = getAllRecents;
exports.syncCache = syncCache;

function _memoize2() {
  const data = _interopRequireDefault(require("lodash/memoize"));

  _memoize2 = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

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

function _debounce() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/debounce"));

  _debounce = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MAX_RECENT_FILES = 100;
const SYNC_CACHE_DEBOUNCE = 1000 * 15;
const RECENT_FILES_DB_NAME = 'nuclide-recent-files';
const logger = (0, _log4js().getLogger)('RecentFilesDB');
/**
 * We don't want to keep making IDB calls for performance reasons, and we only
 * care about tracking MAX_RECENT_FILES files.  So, we keep the LRU cached
 * locally and load from the database the first time we need to access it, and
 * save back to the database (only the top 100) periodically.
 */

const ensureCache = (0, _memoize2().default)(async () => {
  const dbEntries = await _idbKeyval().default.get(RECENT_FILES_DB_NAME).catch(err => {
    logger.warn('Error retrieving recent files from IndexedDB', err);
    return null;
  });
  const cachedLRU = (0, _lruCache().default)({
    max: MAX_RECENT_FILES
  });

  if (dbEntries && dbEntries.length > 0) {
    cachedLRU.load(dbEntries);
  }

  return cachedLRU;
});
/**
 * Update the timestamp for a file in the list of LRU files that is backed by
 * the database.
 */

async function touchFileDB(path, time) {
  (await ensureCache()).set(path, time);
  debouncedSyncCache();
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
  const cachedLRU = await ensureCache(); // This technically saves the "value" as a serialized json, but it will only
  // be up to MAX_RECENT_FILES long.

  await _idbKeyval().default.set(RECENT_FILES_DB_NAME, cachedLRU.dump()).catch(err => logger.warn('Error in syncCache', err));

  if (clearCache) {
    ensureCache.cache.clear();
  }
}

const debouncedSyncCache = (0, _debounce().default)(syncCache, SYNC_CACHE_DEBOUNCE);