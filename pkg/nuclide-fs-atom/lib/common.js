"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rejectWrite = rejectWrite;
exports.rejectWriteSync = rejectWriteSync;
exports.fromEntry = fromEntry;
exports.getParentDir = getParentDir;

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
 *  strict-local
 * @format
 */
function rejectWrite() {
  return Promise.reject(newWriteError());
}

function rejectWriteSync() {
  throw newWriteError();
}

function newWriteError() {
  return new Error('Archives do not support write operations');
}

function fromEntry(afs, dirOrArchive, isDir, entry) {
  const [name, isFile] = entry;
  const path = isDir ? _nuclideUri().default.join(dirOrArchive, name) : _nuclideUri().default.archiveJoin(dirOrArchive, name);

  if (!isFile) {
    return afs.newArchiveDirectory(path);
  } else if (_nuclideUri().default.hasKnownArchiveExtension(name)) {
    return afs.newArchiveFileAsDirectory(path);
  } else {
    return afs.newArchiveFile(path);
  }
}

function getParentDir(afs, path) {
  const parentPath = _nuclideUri().default.dirname(path);

  if (_nuclideUri().default.isInArchive(parentPath)) {
    return afs.newArchiveDirectory(parentPath);
  } else {
    return afs.newArchiveFileAsDirectory(parentPath);
  }
}