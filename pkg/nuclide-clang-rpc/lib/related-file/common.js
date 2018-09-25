"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchFileWithBasename = searchFileWithBasename;

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("../utils");

  _utils = function () {
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
async function searchFileWithBasename(dir, basename, condition) {
  const files = await _fsPromise().default.readdir(dir).catch(() => []);

  for (const file of files) {
    if (condition(file) && (0, _utils().getFileBasename)(file) === basename) {
      return _nuclideUri().default.join(dir, file);
    }
  }

  return null;
}