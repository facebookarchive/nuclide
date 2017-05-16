'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dedupeUris = dedupeUris;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dedupeUris(uris) {
  const deduped = uris.map((_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator);
  deduped.sort();

  let lastOKPrefix = null;

  return deduped.filter(pathName => {
    // Since we've sorted the paths, we know that children will be grouped directly after their
    // parent.
    if (lastOKPrefix != null && pathName.startsWith(lastOKPrefix)) {
      return false;
    }

    lastOKPrefix = pathName;
    return true;
  }).map((_nuclideUri || _load_nuclideUri()).default.trimTrailingSeparator);
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