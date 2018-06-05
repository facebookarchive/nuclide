'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.grepReplace = grepReplace;

var _replaceInFile;

function _load_replaceInFile() {
  return _replaceInFile = _interopRequireDefault(require('./replaceInFile'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function grepReplace(filePaths, regex, replacementText, concurrency = 4) {
  return _rxjsBundlesRxMinJs.Observable.from(filePaths).mergeMap(filePath => (0, (_replaceInFile || _load_replaceInFile()).default)(filePath, regex, replacementText).map(replacements => ({
    type: 'success',
    filePath,
    replacements
  })).catch(err => {
    return _rxjsBundlesRxMinJs.Observable.of({
      type: 'error',
      filePath,
      message: err.message
    });
  }), concurrency).publish();
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */