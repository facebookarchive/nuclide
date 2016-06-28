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

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

function dedupeUris(uris) {
  var dedepped = uris.map((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.trimTrailingSeparator);
  dedepped.sort();

  var lastOKPrefix = '';

  return dedepped.filter(function (u, i) {
    if (i !== 0 && u.startsWith(lastOKPrefix)) {
      return false;
    }

    lastOKPrefix = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.ensureTrailingSeparator(dedepped[i]);
    return true;
  });
}