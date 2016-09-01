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
exports.observeFileEvents = observeFileEvents;

var _FileCache2;

function _FileCache() {
  return _FileCache2 = require('./FileCache');
}

var OPEN_FILES_SERVICE = 'OpenFilesService';

exports.OPEN_FILES_SERVICE = OPEN_FILES_SERVICE;

function getBufferAtVersion(fileVersion) {
  return (_FileCache2 || _FileCache()).fileCache.getBufferAtVersion(fileVersion);
}

function observeFileEvents() {
  return (_FileCache2 || _FileCache()).fileCache.observeFileEvents();
}