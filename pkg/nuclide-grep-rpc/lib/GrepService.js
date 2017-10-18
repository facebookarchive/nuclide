'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.grepSearch = grepSearch;
exports.grepReplace = grepReplace;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _replaceInFile;

function _load_replaceInFile() {
  return _replaceInFile = _interopRequireDefault(require('./replaceInFile'));
}

var _scanhandler;

function _load_scanhandler() {
  return _scanhandler = _interopRequireDefault(require('./scanhandler'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function grepSearch(directory, regex, subdirs) {
  return (0, (_scanhandler || _load_scanhandler()).default)(directory, regex, subdirs).map(update => {
    // Transform filePath's to absolute paths.
    return {
      filePath: (_nuclideUri || _load_nuclideUri()).default.join(directory, update.filePath),
      matches: update.matches
    };
  }).publish();
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
}