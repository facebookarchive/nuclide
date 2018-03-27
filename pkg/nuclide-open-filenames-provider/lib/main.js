'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerProvider = registerProvider;

var _OpenFileNameProvider;

function _load_OpenFileNameProvider() {
  return _OpenFileNameProvider = _interopRequireDefault(require('./OpenFileNameProvider'));
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

function registerProvider() {
  return (_OpenFileNameProvider || _load_OpenFileNameProvider()).default;
}