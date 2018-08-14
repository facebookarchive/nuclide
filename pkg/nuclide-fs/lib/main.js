"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "FileSystem", {
  enumerable: true,
  get: function () {
    return _FileSystem().FileSystem;
  }
});
exports.ROOT_FS = void 0;

function _CompositeFileSystem() {
  const data = require("./CompositeFileSystem");

  _CompositeFileSystem = function () {
    return data;
  };

  return data;
}

function _FsFileSystem() {
  const data = require("./FsFileSystem");

  _FsFileSystem = function () {
    return data;
  };

  return data;
}

function _FileSystem() {
  const data = require("./FileSystem");

  _FileSystem = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const ROOT_FS = new (_CompositeFileSystem().CompositeFileSystem)(new (_FsFileSystem().FsFileSystem)());
exports.ROOT_FS = ROOT_FS;