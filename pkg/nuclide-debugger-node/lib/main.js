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

exports.provideNuclideDebuggerNode = provideNuclideDebuggerNode;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Service2;

function _Service() {
  return _Service2 = _interopRequireDefault(require('./Service'));
}

function provideNuclideDebuggerNode() {
  return (_Service2 || _Service()).default;
}