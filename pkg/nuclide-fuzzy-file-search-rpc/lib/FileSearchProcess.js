'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fileSearchForDirectory = fileSearchForDirectory;
exports.getExistingSearchDirectories = getExistingSearchDirectories;
exports.disposeSearchForDirectory = disposeSearchForDirectory;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideTask;

function _load_nuclideTask() {
  return _nuclideTask = _interopRequireDefault(require('../../nuclide-task'));
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

/**
 * This is an object that lives in the main process that delegates calls to the
 * FileSearch in the forked process.
 */
class FileSearchProcess {

  constructor(directory, ignoredNames) {
    this._directory = directory;
    this._ignoredNames = ignoredNames;
  }

  async initialize() {
    const task = new (_nuclideTask || _load_nuclideTask()).default('FileSearchProcess');
    this._task = task;
    task.onError(buffer => {
      logger.error('File search process crashed with message:', buffer.toString());
      this.dispose();
    });
    task.onExit(() => this.dispose());

    try {
      await task.invokeRemoteMethod({
        file: require.resolve('./process/FileSearch'),
        method: 'initFileSearchForDirectory',
        args: [this._directory, this._ignoredNames]
      });
    } catch (e) {
      this.dispose();
      throw e;
    }
  }

  async query(query, options) {
    const task = this._task;
    if (task == null) {
      throw new Error('Task has been disposed');
    }
    return task.invokeRemoteMethod({
      file: require.resolve('./process/FileSearch'),
      method: 'doSearch',
      args: [this._directory, query, options]
    });
  }

  getIgnoredNames() {
    return this._ignoredNames;
  }

  dispose() {
    if (this._task != null) {
      delete processForDirectory[this._directory];
      this._task.dispose();
      this._task = null;
    }
  }
}

const processForDirectory = {};

async function newFileSearch(directory, ignoredNames) {
  const exists = await (_fsPromise || _load_fsPromise()).default.exists(directory);
  if (!exists) {
    throw new Error('Could not find directory to search : ' + directory);
  }

  const stat = await (_fsPromise || _load_fsPromise()).default.stat(directory);
  if (!stat.isDirectory()) {
    throw new Error('Provided path is not a directory : ' + directory);
  }

  const fileSearchProcess = new FileSearchProcess(directory, ignoredNames);
  await fileSearchProcess.initialize();
  return fileSearchProcess;
}

async function fileSearchForDirectory(directory, ignoredNames) {
  const cached = processForDirectory[directory];
  if (cached != null) {
    const fileSearch = await cached;
    if ((0, (_collection || _load_collection()).arrayEqual)(fileSearch.getIgnoredNames(), ignoredNames)) {
      return fileSearch;
    }
    // In case of a mismatch, dispose and recreate the searcher task.
    fileSearch.dispose();
  }

  const promise = newFileSearch(directory, ignoredNames).catch(error => {
    // Remove errored processes from the cache so we can try again.
    delete processForDirectory[directory];
    throw error;
  });
  processForDirectory[directory] = promise;
  return promise;
}

function getExistingSearchDirectories() {
  return Object.keys(processForDirectory);
}

async function disposeSearchForDirectory(directory) {
  const cached = processForDirectory[directory];
  if (cached != null) {
    const search = await cached;
    search.dispose();
  }
}