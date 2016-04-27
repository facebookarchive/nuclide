Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

module.exports = Object.defineProperties({}, {
  USER: {
    // Get name of the user who starts this process, supports both *nix and Windows.

    get: function get() {
      var user = process.env['USER'] || process.env['USERNAME'];
      (0, _assert2['default'])(user != null);
      return user;
    },
    configurable: true,
    enumerable: true
  },
  HOME: {

    // Get home directory of the user who starts this process, supports both *nix and Windows.

    get: function get() {
      return process.env['HOME'] || process.env['USERPROFILE'];
    },
    configurable: true,
    enumerable: true
  }
});