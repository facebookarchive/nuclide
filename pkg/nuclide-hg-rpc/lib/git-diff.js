'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gitDiffStrings = gitDiffStrings;

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function gitDiffStrings(oldString, newString) {
  return makeTempFiles(oldString, newString).switchMap(([oldTempFile, newTempFile]) => (0, (_process || _load_process()).runCommandDetailed)('git', ['diff', '--unified=0', '--no-index', oldTempFile, newTempFile], {
    killTreeWhenDone: true
  }).map(({ stdout }) => stdout).catch(e => {
    // git diff returns with exit code 1 if there was a difference between
    // the files being compared
    return _rxjsBundlesRxMinJs.Observable.of(e.stdout);
  }).finally(() => {
    (_fsPromise || _load_fsPromise()).default.unlink(oldTempFile);
    (_fsPromise || _load_fsPromise()).default.unlink(newTempFile);
  }));
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function makeTempFiles(oldString, newString) {
  let oldFilePath;
  let newFilePath;
  return _rxjsBundlesRxMinJs.Observable.forkJoin(_rxjsBundlesRxMinJs.Observable.fromPromise((_fsPromise || _load_fsPromise()).default.tempfile()).map(filePath => {
    oldFilePath = filePath.trim();
    return oldFilePath;
  }).switchMap(filePath => {
    return writeContentsToFile(oldString, filePath).map(() => filePath);
  }), _rxjsBundlesRxMinJs.Observable.fromPromise((_fsPromise || _load_fsPromise()).default.tempfile()).map(filePath => {
    newFilePath = filePath.trim();
    return newFilePath;
  }).switchMap(filePath => {
    return writeContentsToFile(newString, filePath).map(() => filePath);
  })).catch(error => {
    if (oldFilePath != null) {
      (_fsPromise || _load_fsPromise()).default.unlink(oldFilePath);
    }
    if (newFilePath != null) {
      (_fsPromise || _load_fsPromise()).default.unlink(newFilePath);
    }
    return _rxjsBundlesRxMinJs.Observable.throw(error);
  });
}

function writeContentsToFile(contents, filePath) {
  return _rxjsBundlesRxMinJs.Observable.fromPromise((_fsPromise || _load_fsPromise()).default.writeFile(filePath, contents));
}