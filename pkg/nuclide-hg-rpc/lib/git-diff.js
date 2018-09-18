"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gitDiffStrings = gitDiffStrings;

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
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
 * 
 * @format
 */
function gitDiffStrings(oldString, newString) {
  return makeTempFiles(oldString, newString).switchMap(([oldTempFile, newTempFile]) => (0, _process().runCommandDetailed)('git', ['diff', '--unified=0', '--no-index', oldTempFile, newTempFile], {
    killTreeWhenDone: true
  }).map(({
    stdout
  }) => stdout).catch(e => {
    // git diff returns with exit code 1 if there was a difference between
    // the files being compared
    return _RxMin.Observable.of(e.stdout);
  }).finally(() => {
    _fsPromise().default.unlink(oldTempFile);

    _fsPromise().default.unlink(newTempFile);
  }));
}

function makeTempFiles(oldString, newString) {
  let oldFilePath;
  let newFilePath;
  return _RxMin.Observable.forkJoin(_RxMin.Observable.fromPromise(_fsPromise().default.tempfile()).map(filePath => {
    oldFilePath = filePath.trim();
    return oldFilePath;
  }).switchMap(filePath => {
    return writeContentsToFile(oldString, filePath).map(() => filePath);
  }), _RxMin.Observable.fromPromise(_fsPromise().default.tempfile()).map(filePath => {
    newFilePath = filePath.trim();
    return newFilePath;
  }).switchMap(filePath => {
    return writeContentsToFile(newString, filePath).map(() => filePath);
  })).catch(error => {
    if (oldFilePath != null) {
      _fsPromise().default.unlink(oldFilePath);
    }

    if (newFilePath != null) {
      _fsPromise().default.unlink(newFilePath);
    }

    return _RxMin.Observable.throw(error);
  });
}

function writeContentsToFile(contents, filePath) {
  return _RxMin.Observable.fromPromise(_fsPromise().default.writeFile(filePath, contents));
}