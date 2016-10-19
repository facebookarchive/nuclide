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

exports.grepSearch = grepSearch;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _scanhandler;

function _load_scanhandler() {
  return _scanhandler = _interopRequireDefault(require('./scanhandler'));
}

function grepSearch(directory, regex, subdirs) {
  return (0, (_scanhandler || _load_scanhandler()).default)(directory, regex, subdirs).map(function (update) {
    // Transform filePath's to absolute paths.
    return { filePath: (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(directory, update.filePath), matches: update.matches };
  }).publish();
}