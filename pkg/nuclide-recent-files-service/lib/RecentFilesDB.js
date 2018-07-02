/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */
import type {FilePath, TimeStamp} from '..';

import LRUCache from 'lru-cache';
import AsyncStorage from 'idb-keyval';

const MAX_RECENT_FILES = 100;
const CLEAN_CACHE_TIMEOUT = 1000 * 15;
const RECENT_FILES_DB_NAME = 'nuclide-recent-files';

/**
 * We don't want to keep making IDB calls for performance reasons, and we only
 * care about tracking MAX_RECENT_FILES files.  So, we keep the LRU cached
 * locally and load from the database the first time we need to access it, and
 * save back to the database (only the top 100) periodically.
 */
let cachedLRU: LRUCache<FilePath, TimeStamp>;
/**
 * Keep a timeout to prevent too many repeated saves to the database.
 */
let dbUpdateTimeout: ?TimeoutID;

/**
 * Load in cachedLRU if it isn't there already.
 */
async function ensureCache(): Promise<LRUCache<FilePath, TimeStamp>> {
  if (!cachedLRU) {
    const dbEntries = await AsyncStorage.get(RECENT_FILES_DB_NAME);
    cachedLRU = LRUCache({max: MAX_RECENT_FILES});
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
export async function touchFileDB(
  path: FilePath,
  time: TimeStamp,
): Promise<void> {
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
export async function getAllRecents(): Promise<LRUCache<FilePath, TimeStamp>> {
  return ensureCache();
}

/**
 * Save the LRU files back to the stable store.
 * With clearCache = true, clears the local cache.
 */
export async function syncCache(clearCache: boolean = false): Promise<void> {
  if (cachedLRU) {
    // This technically saves the "value" as a serialized json, but it will only
    // be up to MAX_RECENT_FILES long.
    await AsyncStorage.set(RECENT_FILES_DB_NAME, cachedLRU.dump());
    if (clearCache) {
      cachedLRU = null;
    }
  }
}
