"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findNearestCompilationDbDir = findNearestCompilationDbDir;
exports.COMPILATION_DATABASE_FILE = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
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
const COMPILATION_DATABASE_FILE = 'compile_commands.json';
exports.COMPILATION_DATABASE_FILE = COMPILATION_DATABASE_FILE;

async function findNearestCompilationDbDir(source) {
  return _fsPromise().default.findNearestFile(COMPILATION_DATABASE_FILE, _nuclideUri().default.dirname(source));
}