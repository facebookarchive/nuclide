Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var newFileSearch = _asyncToGenerator(function* (directoryUri, ignoredNames) {
  var exists = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.exists(directoryUri);
  if (!exists) {
    throw new Error('Could not find directory to search : ' + directoryUri);
  }

  var stat = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.stat(directoryUri);
  if (!stat.isDirectory()) {
    throw new Error('Provided path is not a directory : ' + directoryUri);
  }

  var task = new (_nuclideTask2 || _nuclideTask()).default();
  yield task.invokeRemoteMethod({
    file: require.resolve('./FileSearch'),
    method: 'initFileSearchForDirectory',
    args: [directoryUri, ignoredNames]
  });
  return new FileSearchProcess(task, directoryUri, ignoredNames);
});

var fileSearchForDirectory = _asyncToGenerator(function* (directoryUri, ignoredNames) {
  var cached = fileSearchForDirectoryUri[directoryUri];
  if (cached != null) {
    var fileSearch = yield cached;
    if ((0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayEqual)(fileSearch.getIgnoredNames(), ignoredNames)) {
      return fileSearch;
    }
    // In case of a mismatch, dispose and recreate the searcher task.
    fileSearch.dispose();
  }

  var promise = newFileSearch(directoryUri, ignoredNames).catch(function (error) {
    // Remove errored processes from the cache so we can try again.
    delete fileSearchForDirectoryUri[directoryUri];
    throw error;
  });
  fileSearchForDirectoryUri[directoryUri] = promise;
  return promise;
});

exports.fileSearchForDirectory = fileSearchForDirectory;
exports.getExistingSearchDirectories = getExistingSearchDirectories;

var disposeSearchForDirectory = _asyncToGenerator(function* (directoryUri) {
  var cached = fileSearchForDirectoryUri[directoryUri];
  if (cached != null) {
    var search = yield cached;
    search.dispose();
  }
});

exports.disposeSearchForDirectory = disposeSearchForDirectory;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideTask2;

function _nuclideTask() {
  return _nuclideTask2 = _interopRequireDefault(require('../../nuclide-task'));
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

/**
 * This is an object that lives in the main process that delegates calls to the
 * FileSearch in the forked process.
 */

var FileSearchProcess = (function () {
  function FileSearchProcess(task, directoryUri, ignoredNames) {
    var _this = this;

    _classCallCheck(this, FileSearchProcess);

    this._task = task;
    this._task.onError(function (buffer) {
      logger.error('File search process crashed with message:', buffer.toString());
      _this.dispose();
    });
    this._directoryUri = directoryUri;
    this._ignoredNames = ignoredNames;
  }

  _createClass(FileSearchProcess, [{
    key: 'query',
    value: _asyncToGenerator(function* (_query) {
      var task = this._task;
      if (task == null) {
        throw new Error('Task has been disposed');
      }
      return task.invokeRemoteMethod({
        file: require.resolve('./FileSearch'),
        method: 'doSearch',
        args: [this._directoryUri, _query]
      });
    })
  }, {
    key: 'getIgnoredNames',
    value: function getIgnoredNames() {
      return this._ignoredNames;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._task != null) {
        delete fileSearchForDirectoryUri[this._directoryUri];
        this._task.dispose();
        this._task = null;
      }
    }
  }]);

  return FileSearchProcess;
})();

var fileSearchForDirectoryUri = {};

function getExistingSearchDirectories() {
  return Object.keys(fileSearchForDirectoryUri);
}