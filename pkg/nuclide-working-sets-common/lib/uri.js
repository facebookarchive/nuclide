Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.dedupeUris = dedupeUris;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function dedupeUris(uris) {
  var deduped = uris.map((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.ensureTrailingSeparator);
  deduped.sort();

  var lastOKPrefix = null;

  return deduped.filter(function (pathName) {
    // Since we've sorted the paths, we know that children will be grouped directly after their
    // parent.
    if (lastOKPrefix != null && pathName.startsWith(lastOKPrefix)) {
      return false;
    }

    lastOKPrefix = pathName;
    return true;
  }).map((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.trimTrailingSeparator);
}