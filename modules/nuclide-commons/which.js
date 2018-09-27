"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _os = _interopRequireDefault(require("os"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("./nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("./process");

  _process = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

/**
 * Provides a cross-platform way to check whether a binary is available.
 *
 * We ran into problems with the npm `which` package (the nature of which I unfortunately don't
 * remember) so we can use this for now.
 */
function sanitizePathForWindows(path) {
  if (_nuclideUri().default.basename(path) === path) {
    // simple binary in $PATH like `flow`
    return path;
  } else {
    return `${_nuclideUri().default.dirname(path)}:${_nuclideUri().default.basename(path)}`;
  }
}

var which = async function which(path, options = {}) {
  const isWindows = process.platform === 'win32';
  const whichCommand = isWindows ? 'where' : 'which';
  const searchPath = isWindows ? sanitizePathForWindows(path) : path;

  try {
    const result = await (0, _process().runCommand)(whichCommand, [searchPath], options).toPromise();
    return result.split(_os.default.EOL)[0];
  } catch (e) {
    return null;
  }
};

exports.default = which;