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

var _OpenFilesService2;

function _OpenFilesService() {
  return _OpenFilesService2 = require('./OpenFilesService');
}

var OPEN_FILES_SERVICE = 'OpenFilesService';

exports.OPEN_FILES_SERVICE = OPEN_FILES_SERVICE;

function getBufferAtVersion(fileVersion) {
  return (_OpenFilesService2 || _OpenFilesService()).fileCache.getBufferAtVersion(fileVersion);
}

function observeFileEvents() {
  return (_OpenFilesService2 || _OpenFilesService()).fileCache.observeFileEvents();
}