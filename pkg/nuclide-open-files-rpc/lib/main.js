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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

exports.FileCache = (_FileCache || _load_FileCache()).FileCache;
exports.FileVersionNotifier = (_FileVersionNotifier || _load_FileVersionNotifier()).FileVersionNotifier;

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var OPEN_FILES_SERVICE = 'OpenFilesService';

exports.OPEN_FILES_SERVICE = OPEN_FILES_SERVICE;

function getBufferAtVersion(fileVersion) {
  return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('getBufferAtVersion', _asyncToGenerator(function* () {
    (0, (_assert || _load_assert()).default)(fileVersion.notifier instanceof (_FileCache || _load_FileCache()).FileCache, 'Don\'t call this from the Atom process');
    var buffer = yield fileVersion.notifier.getBufferAtVersion(fileVersion);
    if (buffer.changeCount !== fileVersion.version) {
      throw new Error('File sync error. File modifier past requested change.');
    }
    return buffer;
  }));
}