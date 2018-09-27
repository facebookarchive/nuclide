"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBufferAtVersion = getBufferAtVersion;
Object.defineProperty(exports, "FileCache", {
  enumerable: true,
  get: function () {
    return _FileCache().FileCache;
  }
});
Object.defineProperty(exports, "FileVersionNotifier", {
  enumerable: true,
  get: function () {
    return _FileVersionNotifier().FileVersionNotifier;
  }
});
Object.defineProperty(exports, "FileEventKind", {
  enumerable: true,
  get: function () {
    return _constants().FileEventKind;
  }
});
Object.defineProperty(exports, "ConfigObserver", {
  enumerable: true,
  get: function () {
    return _ConfigObserver().ConfigObserver;
  }
});
exports.OPEN_FILES_SERVICE = void 0;

function _FileCache() {
  const data = require("./FileCache");

  _FileCache = function () {
    return data;
  };

  return data;
}

function _FileVersionNotifier() {
  const data = require("./FileVersionNotifier");

  _FileVersionNotifier = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _ConfigObserver() {
  const data = require("./ConfigObserver");

  _ConfigObserver = function () {
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
const OPEN_FILES_SERVICE = 'OpenFilesService';
exports.OPEN_FILES_SERVICE = OPEN_FILES_SERVICE;

function getBufferAtVersion(fileVersion) {
  if (!(fileVersion.notifier instanceof _FileCache().FileCache)) {
    throw new Error("Don't call this from the Atom process");
  }

  return fileVersion.notifier.getBufferAtVersion(fileVersion);
}