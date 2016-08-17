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

// Use this module to import the global `WebInspector` with types.

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

// Prevent accidental import for this file when `WebInspector` is not in scope.
(0, (_assert2 || _assert()).default)(global.WebInspector != null);

exports.default = global.WebInspector;
module.exports = exports.default;