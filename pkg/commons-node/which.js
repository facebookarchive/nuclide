Object.defineProperty(exports, '__esModule', {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _process2;

function _process() {
  return _process2 = require('./process');
}

var _os2;

function _os() {
  return _os2 = _interopRequireDefault(require('os'));
}

/**
 * Provides a cross-platform way to check whether a binary is available.
 *
 * We ran into problems with the npm `which` package (the nature of which I unfortunately don't
 * remember) so we can use this for now.
 */
exports.default = _asyncToGenerator(function* (command) {
  var whichCommand = process.platform === 'win32' ? 'where' : 'which';
  try {
    var result = yield (0, (_process2 || _process()).checkOutput)(whichCommand, [command]);
    return result.stdout.split((_os2 || _os()).default.EOL)[0];
  } catch (e) {
    return null;
  }
});
module.exports = exports.default;