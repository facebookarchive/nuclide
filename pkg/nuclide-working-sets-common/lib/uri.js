"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dedupeUris = dedupeUris;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
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
function dedupeUris(uris) {
  const deduped = uris.map(_nuclideUri().default.ensureTrailingSeparator);
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
  }).map(_nuclideUri().default.trimTrailingSeparator);
}