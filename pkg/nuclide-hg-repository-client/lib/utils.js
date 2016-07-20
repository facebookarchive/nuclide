function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var ADD_ACTION = 'add';
var REMOVE_ACTION = 'remove';

/**
 * This function takes in a file path, and computes all directories that would
 * be considered a parent of it, i.e., the file path is contained by all of these
 * directories. The function sets the directories (terminated by a separator) as
 * keys in the `directories` Map, and bumps the value accordingly.
 * @param directories The Map that will be modified by this function. The keys are
 *   expected to be directory paths (terminated by a separator) and the values are
 *   the number of times this directory path has been 'added' to this Map.
 * @param modifiedPath A file path (assumed to not have a trailing separator).
 * @param pathPrefixToSkip Optionally, a string that, if found at the beginning
 *   of the modifiedPath, will be skipped when computing the parent directories.
 *   That is, if modifiedPath is /A/B/C/D and pathPrefixToSkip is /A/B/ (or /A/B),
 *   `directories` will be populated with '/A/B/C/', but not '/A/' or '/A/B/'.
 */
function addAllParentDirectoriesToCache(directories, modifiedPath, pathPrefixToSkip) {
  computeAllParentDirectories(directories, modifiedPath, pathPrefixToSkip, ADD_ACTION);
}

/**
 * Like `addAllParentDirectoriesToCache`, except it removes all parent directories.
 */
function removeAllParentDirectoriesFromCache(directories, modifiedPath, pathPrefixToSkip) {
  computeAllParentDirectories(directories, modifiedPath, pathPrefixToSkip, REMOVE_ACTION);
}

/**
 * Helper function to `addAllParentDirectoriesToCache` and
 * `removeAllParentDirectoriesFromCach`. Either adds or removes the computed
 * parent directories depending on the operation passed in.
 */
function computeAllParentDirectories(directories, modifiedPath, pathPrefixToSkip, operation) {
  var shouldAdd = operation === ADD_ACTION;
  var current = modifiedPath;
  var stopPrefix = pathPrefixToSkip == null ? '' : (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.ensureTrailingSeparator(pathPrefixToSkip);
  do {
    current = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.ensureTrailingSeparator((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(current));
    if (stopPrefix.startsWith(current)) {
      return;
    }

    if (shouldAdd) {
      addItemToCache(current, directories);
    } else {
      removeItemFromCache(current, directories);
    }
  } while (!(_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isRoot(current));
}

function addItemToCache(item, cache) {
  var existingValue = cache.get(item);
  if (existingValue) {
    cache.set(item, existingValue + 1);
  } else {
    cache.set(item, 1);
  }
}

function removeItemFromCache(item, cache) {
  var existingValue = cache.get(item);
  if (existingValue) {
    var newValue = existingValue - 1;
    if (newValue > 0) {
      cache.set(item, newValue);
    } else {
      cache.delete(item);
    }
  }
}

module.exports = {
  addAllParentDirectoriesToCache: addAllParentDirectoriesToCache,
  removeAllParentDirectoriesFromCache: removeAllParentDirectoriesFromCache
};