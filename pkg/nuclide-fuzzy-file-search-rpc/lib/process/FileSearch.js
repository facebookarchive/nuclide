'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fileSearchForDirectory = fileSearchForDirectory;
exports.initFileSearchForDirectory = initFileSearchForDirectory;
exports.doSearch = doSearch;

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../../modules/nuclide-commons/fsPromise'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _PathSet;

function _load_PathSet() {
  return _PathSet = require('./PathSet');
}

var _PathSetFactory;

function _load_PathSetFactory() {
  return _PathSetFactory = require('./PathSetFactory');
}

var _PathSetUpdater;

function _load_PathSetUpdater() {
  return _PathSetUpdater = _interopRequireDefault(require('./PathSetUpdater'));
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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-fuzzy-file-search-rpc');

const fileSearchCache = {};

async function fileSearchForDirectory(directory, pathSetUpdater, ignoredNames = []) {
  // Note: races are not an issue here since initialization is managed in
  // FileSearchProcess (which protects against simultaneous inits).
  const cached = fileSearchCache[directory];
  if (cached) {
    return cached;
  }

  const realpath = await (_fsPromise || _load_fsPromise()).default.realpath(directory);
  const paths = await (0, (_PathSetFactory || _load_PathSetFactory()).getPaths)(realpath);
  const pathSet = new (_PathSet || _load_PathSet()).PathSet(paths, ignoredNames || [], directory);

  const thisPathSetUpdater = pathSetUpdater || getPathSetUpdater();
  try {
    await thisPathSetUpdater.startUpdatingPathSet(pathSet, realpath);
  } catch (e) {
    logger.warn(`Could not update path sets for ${realpath}. Searches may be stale`, e);
    // TODO(hansonw): Fall back to manual refresh or node watches
  }

  fileSearchCache[directory] = pathSet;
  return pathSet;
}

let pathSetUpdater;

function getPathSetUpdater() {
  if (!pathSetUpdater) {
    pathSetUpdater = new (_PathSetUpdater || _load_PathSetUpdater()).default();
  }
  return pathSetUpdater;
}

// The return values of the following functions must be JSON-serializable so they
// can be sent across a process boundary.

async function initFileSearchForDirectory(directory, ignoredNames) {
  await fileSearchForDirectory(directory, null, ignoredNames);
}

async function doSearch(directory, query, options = Object.freeze({})) {
  const pathSet = await fileSearchForDirectory(directory);
  return pathSet.query(query, options);
}