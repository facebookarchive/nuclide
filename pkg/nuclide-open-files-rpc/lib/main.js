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

var getBufferAtVersion = _asyncToGenerator(function* (fileVersion) {
  (0, (_assert2 || _assert()).default)(fileVersion.notifier instanceof (_FileCache2 || _FileCache()).FileCache, 'Don\'t call this from the Atom process');
  var buffer = yield fileVersion.notifier.getBufferAtVersion(fileVersion);
  if (buffer.changeCount !== fileVersion.version) {
    throw new Error('File sync error. File modifier past requested change.');
  }
  return buffer;
});

exports.getBufferAtVersion = getBufferAtVersion;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _FileCache2;

function _FileCache() {
  return _FileCache2 = require('./FileCache');
}

var _FileVersionNotifier2;

function _FileVersionNotifier() {
  return _FileVersionNotifier2 = require('./FileVersionNotifier');
}

exports.FileCache = (_FileCache2 || _FileCache()).FileCache;
exports.FileVersionNotifier = (_FileVersionNotifier2 || _FileVersionNotifier()).FileVersionNotifier;

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var OPEN_FILES_SERVICE = 'OpenFilesService';

exports.OPEN_FILES_SERVICE = OPEN_FILES_SERVICE;