'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OPEN_FILES_SERVICE = exports.FileVersionNotifier = exports.FileCache = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.getBufferAtVersion = getBufferAtVersion;

var _FileCache;

function _load_FileCache() {
  return _FileCache = require('./FileCache');
}

var _FileVersionNotifier;

function _load_FileVersionNotifier() {
  return _FileVersionNotifier = require('./FileVersionNotifier');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.FileCache = (_FileCache || _load_FileCache()).FileCache;
exports.FileVersionNotifier = (_FileVersionNotifier || _load_FileVersionNotifier()).FileVersionNotifier;
const OPEN_FILES_SERVICE = exports.OPEN_FILES_SERVICE = 'OpenFilesService';

function getBufferAtVersion(fileVersion) {
  return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('getBufferAtVersion', (0, _asyncToGenerator.default)(function* () {
    if (!(fileVersion.notifier instanceof (_FileCache || _load_FileCache()).FileCache)) {
      throw new Error('Don\'t call this from the Atom process');
    }

    const buffer = yield fileVersion.notifier.getBufferAtVersion(fileVersion);
    if (buffer.changeCount !== fileVersion.version) {
      throw new Error('File sync error. File modifier past requested change.');
    }
    return buffer;
  }));
}