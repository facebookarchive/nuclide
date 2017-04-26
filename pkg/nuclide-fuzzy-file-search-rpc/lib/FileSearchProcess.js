'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.disposeSearchForDirectory = exports.fileSearchForDirectory = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let newFileSearch = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (directory, ignoredNames) {
    const exists = yield (_fsPromise || _load_fsPromise()).default.exists(directory);
    if (!exists) {
      throw new Error('Could not find directory to search : ' + directory);
    }

    const stat = yield (_fsPromise || _load_fsPromise()).default.stat(directory);
    if (!stat.isDirectory()) {
      throw new Error('Provided path is not a directory : ' + directory);
    }

    const task = new (_nuclideTask || _load_nuclideTask()).default();
    yield task.invokeRemoteMethod({
      file: require.resolve('./FileSearch'),
      method: 'initFileSearchForDirectory',
      args: [directory, ignoredNames]
    });
    return new FileSearchProcess(task, directory, ignoredNames);
  });

  return function newFileSearch(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let fileSearchForDirectory = exports.fileSearchForDirectory = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (directory, ignoredNames) {
    const cached = processForDirectory[directory];
    if (cached != null) {
      const fileSearch = yield cached;
      if ((0, (_collection || _load_collection()).arrayEqual)(fileSearch.getIgnoredNames(), ignoredNames)) {
        return fileSearch;
      }
      // In case of a mismatch, dispose and recreate the searcher task.
      fileSearch.dispose();
    }

    const promise = newFileSearch(directory, ignoredNames).catch(function (error) {
      // Remove errored processes from the cache so we can try again.
      delete processForDirectory[directory];
      throw error;
    });
    processForDirectory[directory] = promise;
    return promise;
  });

  return function fileSearchForDirectory(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

let disposeSearchForDirectory = exports.disposeSearchForDirectory = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (directory) {
    const cached = processForDirectory[directory];
    if (cached != null) {
      const search = yield cached;
      search.dispose();
    }
  });

  return function disposeSearchForDirectory(_x5) {
    return _ref3.apply(this, arguments);
  };
})();

exports.getExistingSearchDirectories = getExistingSearchDirectories;

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideTask;

function _load_nuclideTask() {
  return _nuclideTask = _interopRequireDefault(require('../../nuclide-task'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

/**
 * This is an object that lives in the main process that delegates calls to the
 * FileSearch in the forked process.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class FileSearchProcess {

  constructor(task, directory, ignoredNames) {
    this._task = task;
    task.onError(buffer => {
      logger.error('File search process crashed with message:', buffer.toString());
      this.dispose();
    });
    task.onExit(() => this.dispose());
    this._directory = directory;
    this._ignoredNames = ignoredNames;
  }

  query(query) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const task = _this._task;
      if (task == null) {
        throw new Error('Task has been disposed');
      }
      return task.invokeRemoteMethod({
        file: require.resolve('./FileSearch'),
        method: 'doSearch',
        args: [_this._directory, query]
      });
    })();
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

function getExistingSearchDirectories() {
  return Object.keys(processForDirectory);
}