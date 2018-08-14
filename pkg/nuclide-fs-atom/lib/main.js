"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ArchiveFileSystem", {
  enumerable: true,
  get: function () {
    return _ArchiveFileSystem().ArchiveFileSystem;
  }
});
Object.defineProperty(exports, "ArchiveDirectory", {
  enumerable: true,
  get: function () {
    return _ArchiveDirectory().ArchiveDirectory;
  }
});
Object.defineProperty(exports, "ArchiveFile", {
  enumerable: true,
  get: function () {
    return _ArchiveFile().ArchiveFile;
  }
});
Object.defineProperty(exports, "ArchiveFileAsDirectory", {
  enumerable: true,
  get: function () {
    return _ArchiveFileAsDirectory().ArchiveFileAsDirectory;
  }
});
exports.ROOT_ARCHIVE_FS = void 0;

function _nuclideFs() {
  const data = require("../../nuclide-fs");

  _nuclideFs = function () {
    return data;
  };

  return data;
}

function _ArchiveFileSystem() {
  const data = require("./ArchiveFileSystem");

  _ArchiveFileSystem = function () {
    return data;
  };

  return data;
}

function _ArchiveDirectory() {
  const data = require("./ArchiveDirectory");

  _ArchiveDirectory = function () {
    return data;
  };

  return data;
}

function _ArchiveFile() {
  const data = require("./ArchiveFile");

  _ArchiveFile = function () {
    return data;
  };

  return data;
}

function _ArchiveFileAsDirectory() {
  const data = require("./ArchiveFileAsDirectory");

  _ArchiveFileAsDirectory = function () {
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
const ROOT_ARCHIVE_FS = new (_ArchiveFileSystem().ArchiveFileSystem)(_nuclideFs().ROOT_FS);
exports.ROOT_ARCHIVE_FS = ROOT_ARCHIVE_FS;