"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fileSearchForDirectory = fileSearchForDirectory;
exports.initFileSearchForDirectory = initFileSearchForDirectory;
exports.doSearch = doSearch;

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
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

function _PathSet() {
  const data = require("./PathSet");

  _PathSet = function () {
    return data;
  };

  return data;
}

function _PathSetFactory() {
  const data = require("./PathSetFactory");

  _PathSetFactory = function () {
    return data;
  };

  return data;
}

function _PathSetUpdater() {
  const data = _interopRequireDefault(require("./PathSetUpdater"));

  _PathSetUpdater = function () {
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
const logger = (0, _log4js().getLogger)('nuclide-fuzzy-file-search-rpc');
const fileSearchCache = {};

async function fileSearchForDirectory(directory, pathSetUpdater, ignoredNames = []) {
  // Note: races are not an issue here since initialization is managed in
  // FileSearchProcess (which protects against simultaneous inits).
  const cached = fileSearchCache[directory];

  if (cached) {
    return cached;
  }

  const realpath = await _fsPromise().default.realpath(directory);
  const paths = await (0, _PathSetFactory().getPaths)(realpath);
  const pathSet = new (_PathSet().PathSet)(paths, ignoredNames || [], directory);
  const thisPathSetUpdater = pathSetUpdater || getPathSetUpdater();

  try {
    await thisPathSetUpdater.startUpdatingPathSet(pathSet, realpath);
  } catch (e) {
    logger.warn(`Could not update path sets for ${realpath}. Searches may be stale`, e); // TODO(hansonw): Fall back to manual refresh or node watches
  }

  fileSearchCache[directory] = pathSet;
  return pathSet;
}

let pathSetUpdater;

function getPathSetUpdater() {
  if (!pathSetUpdater) {
    pathSetUpdater = new (_PathSetUpdater().default)();
  }

  return pathSetUpdater;
} // The return values of the following functions must be JSON-serializable so they
// can be sent across a process boundary.


async function initFileSearchForDirectory(directory, ignoredNames) {
  await fileSearchForDirectory(directory, null, ignoredNames);
}

async function doSearch(directory, query, options = Object.freeze({})) {
  const pathSet = await fileSearchForDirectory(directory);
  return pathSet.query(query, options);
}