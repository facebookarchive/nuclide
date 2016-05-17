Object.defineProperty(exports, '__esModule', {
  value: true
});

var getWatchmanBinaryPath = _asyncToGenerator(function* () {
  try {
    var stats = yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.stat(WATCHMAN_DEFAULT_PATH);
    // `stats` contains a `mode` property, a number which can be used to determine
    // whether this file is executable. However, the number is platform-dependent.
    if (stats && stats.isFile()) {
      return WATCHMAN_DEFAULT_PATH;
    }
  } catch (e) {}
  // Suppress the error.

  // Let the watchman Client find the watchman binary via the default env PATH.
  return 'watchman';
});

exports.getWatchmanBinaryPath = getWatchmanBinaryPath;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

var WATCHMAN_DEFAULT_PATH = '/usr/local/bin/watchman';