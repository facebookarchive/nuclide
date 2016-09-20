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

var _hgRepository2;

function _hgRepository() {
  return _hgRepository2 = _interopRequireDefault(require('./hg-repository'));
}

exports.findHgRepository = (_hgRepository2 || _hgRepository()).default;