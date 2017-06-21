'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gitDiffContentAgainstFile = gitDiffContentAgainstFile;
exports.gitDiffStrings = gitDiffStrings;

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
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

function gitDiffContentAgainstFile(content, filePath) {
  const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(filePath);
  const diff = _rxjsBundlesRxMinJs.Observable.fromPromise(service.readFile(filePath)).switchMap(buffer => {
    return gitDiffStrings(content, buffer.toString('utf8'));
  });
  return diff;
}

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
}

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