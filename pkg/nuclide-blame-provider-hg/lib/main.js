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

exports.provideHgBlameProvider = provideHgBlameProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _HgBlameProvider;

function _load_HgBlameProvider() {
  return _HgBlameProvider = _interopRequireDefault(require('./HgBlameProvider'));
}

function provideHgBlameProvider() {
  return (_HgBlameProvider || _load_HgBlameProvider()).default;
}