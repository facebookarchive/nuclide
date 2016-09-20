Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.getBufferAtVersion = getBufferAtVersion;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _FileCache2;

function _FileCache() {
  return _FileCache2 = require('./FileCache');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var OPEN_FILES_SERVICE = 'OpenFilesService';

exports.OPEN_FILES_SERVICE = OPEN_FILES_SERVICE;

function getBufferAtVersion(fileVersion) {
  (0, (_assert2 || _assert()).default)(fileVersion.notifier instanceof (_FileCache2 || _FileCache()).FileCache, 'Don\'t call this from the Atom process');
  return fileVersion.notifier.getBufferAtVersion(fileVersion);
}