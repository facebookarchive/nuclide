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

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _scanhandler2;

function _scanhandler() {
  return _scanhandler2 = _interopRequireDefault(require('./scanhandler'));
}

function findInProjectSearch(directory, regex, subdirs) {
  return (0, (_scanhandler2 || _scanhandler()).default)(directory, regex, subdirs).map(function (update) {
    // Transform filePath's to absolute paths.
    return { filePath: (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(directory, update.filePath), matches: update.matches };
  });
}