'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ROOT_FS = exports.FileSystem = undefined;

var _FileSystem;

function _load_FileSystem() {
  return _FileSystem = require('./FileSystem');
}

Object.defineProperty(exports, 'FileSystem', {
  enumerable: true,
  get: function () {
    return (_FileSystem || _load_FileSystem()).FileSystem;
  }
});

var _CompositeFileSystem;

function _load_CompositeFileSystem() {
  return _CompositeFileSystem = require('./CompositeFileSystem');
}

var _FsFileSystem;

function _load_FsFileSystem() {
  return _FsFileSystem = require('./FsFileSystem');
}

const ROOT_FS = exports.ROOT_FS = new (_CompositeFileSystem || _load_CompositeFileSystem()).CompositeFileSystem(new (_FsFileSystem || _load_FsFileSystem()).FsFileSystem());