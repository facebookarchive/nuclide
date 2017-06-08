'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findHgRepository = undefined;

var _hgRepository;

function _load_hgRepository() {
  return _hgRepository = _interopRequireDefault(require('./hg-repository'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

exports.findHgRepository = (_hgRepository || _load_hgRepository()).default;