'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVersion = getVersion;

var _package;

function _load_package() {
  return _package = require('../../../nuclide-commons/package');
}

let version; /**
              * Copyright (c) 2017-present, Facebook, Inc.
              * All rights reserved.
              *
              * This source code is licensed under the BSD-style license found in the
              * LICENSE file in the root directory of this source tree. An additional grant
              * of patent rights can be found in the PATENTS file in the same directory.
              *
              *  strict
              * @format
              */

// eslint-disable-next-line
function getVersion() {
  if (!version) {
    // Don't use require() because it may be reading from the module cache.
    // Do use require.resolve so the paths can be codemoded in the future.
    const packageJsonPath = require.resolve('../../package.json');
    version = (0, (_package || _load_package()).getPackageMinorVersion)(packageJsonPath);
  }
  return version;
}