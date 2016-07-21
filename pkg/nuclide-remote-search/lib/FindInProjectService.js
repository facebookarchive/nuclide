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

exports.findInProjectSearch = findInProjectSearch;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _scanhandler2;

function _scanhandler() {
  return _scanhandler2 = _interopRequireDefault(require('./scanhandler'));
}

function findInProjectSearch(directory, regex, subdirs) {
  return (0, (_scanhandler2 || _scanhandler()).default)(directory, regex, subdirs).map(function (update) {
    // Transform filePath's to absolute paths.
    return { filePath: (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(directory, update.filePath), matches: update.matches };
  });
}