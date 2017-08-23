'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OPEN_FILES_SERVICE = exports.ConfigObserver = exports.FileEventKind = exports.FileVersionNotifier = exports.FileCache = undefined;

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

Object.defineProperty(exports, 'FileEventKind', {
  enumerable: true,
  get: function () {
    return (_constants || _load_constants()).FileEventKind;
  }
});

var _ConfigObserver;

function _load_ConfigObserver() {
  return _ConfigObserver = require('./ConfigObserver');
}

Object.defineProperty(exports, 'ConfigObserver', {
  enumerable: true,
  get: function () {
    return (_ConfigObserver || _load_ConfigObserver()).ConfigObserver;
  }
});
exports.getBufferAtVersion = getBufferAtVersion;

var _FileCache;

function _load_FileCache() {
  return _FileCache = require('./FileCache');
}

var _FileVersionNotifier;

function _load_FileVersionNotifier() {
  return _FileVersionNotifier = require('./FileVersionNotifier');
}

exports.FileCache = (_FileCache || _load_FileCache()).FileCache;
exports.FileVersionNotifier = (_FileVersionNotifier || _load_FileVersionNotifier()).FileVersionNotifier; /**
                                                                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                          * All rights reserved.
                                                                                                          *
                                                                                                          * This source code is licensed under the license found in the LICENSE file in
                                                                                                          * the root directory of this source tree.
                                                                                                          *
                                                                                                          * 
                                                                                                          * @format
                                                                                                          */

const OPEN_FILES_SERVICE = exports.OPEN_FILES_SERVICE = 'OpenFilesService';

function getBufferAtVersion(fileVersion) {
  if (!(fileVersion.notifier instanceof (_FileCache || _load_FileCache()).FileCache)) {
    throw new Error("Don't call this from the Atom process");
  }

  return fileVersion.notifier.getBufferAtVersion(fileVersion);
}