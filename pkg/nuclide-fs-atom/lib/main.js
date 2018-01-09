'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ROOT_ARCHIVE_FS = exports.ArchiveFileSystem = exports.ArchiveFileAsDirectory = exports.ArchiveFile = exports.ArchiveDirectory = undefined;

var _ArchiveDirectory;

function _load_ArchiveDirectory() {
  return _ArchiveDirectory = require('./ArchiveDirectory');
}

Object.defineProperty(exports, 'ArchiveDirectory', {
  enumerable: true,
  get: function () {
    return (_ArchiveDirectory || _load_ArchiveDirectory()).ArchiveDirectory;
  }
});

var _ArchiveFile;

function _load_ArchiveFile() {
  return _ArchiveFile = require('./ArchiveFile');
}

Object.defineProperty(exports, 'ArchiveFile', {
  enumerable: true,
  get: function () {
    return (_ArchiveFile || _load_ArchiveFile()).ArchiveFile;
  }
});

var _ArchiveFileAsDirectory;

function _load_ArchiveFileAsDirectory() {
  return _ArchiveFileAsDirectory = require('./ArchiveFileAsDirectory');
}

Object.defineProperty(exports, 'ArchiveFileAsDirectory', {
  enumerable: true,
  get: function () {
    return (_ArchiveFileAsDirectory || _load_ArchiveFileAsDirectory()).ArchiveFileAsDirectory;
  }
});

var _ArchiveFileSystem;

function _load_ArchiveFileSystem() {
  return _ArchiveFileSystem = require('./ArchiveFileSystem');
}

Object.defineProperty(exports, 'ArchiveFileSystem', {
  enumerable: true,
  get: function () {
    return (_ArchiveFileSystem || _load_ArchiveFileSystem()).ArchiveFileSystem;
  }
});

var _nuclideFs;

function _load_nuclideFs() {
  return _nuclideFs = require('../../nuclide-fs');
}

const ROOT_ARCHIVE_FS = exports.ROOT_ARCHIVE_FS = new (_ArchiveFileSystem || _load_ArchiveFileSystem()).ArchiveFileSystem((_nuclideFs || _load_nuclideFs()).ROOT_FS);