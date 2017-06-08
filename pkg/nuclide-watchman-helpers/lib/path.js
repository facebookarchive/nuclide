'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWatchmanBinaryPath = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getWatchmanBinaryPath = exports.getWatchmanBinaryPath = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    try {
      const stats = yield (_fsPromise || _load_fsPromise()).default.stat(WATCHMAN_DEFAULT_PATH);
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

  return function getWatchmanBinaryPath() {
    return _ref.apply(this, arguments);
  };
})();

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WATCHMAN_DEFAULT_PATH = '/usr/local/bin/watchman'; /**
                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                          * All rights reserved.
                                                          *
                                                          * This source code is licensed under the license found in the LICENSE file in
                                                          * the root directory of this source tree.
                                                          *
                                                          * 
                                                          * @format
                                                          */