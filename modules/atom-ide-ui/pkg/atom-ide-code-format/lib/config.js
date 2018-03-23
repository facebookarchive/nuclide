'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFormatOnSave = getFormatOnSave;
exports.getFormatOnType = getFormatOnType;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getFormatOnSave() {
  const formatOnSave = (_featureConfig || _load_featureConfig()).default.get('atom-ide-code-format.formatOnSave');
  return formatOnSave == null ? false : formatOnSave;
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
   */

function getFormatOnType() {
  return (_featureConfig || _load_featureConfig()).default.getWithDefaults('atom-ide-code-format.formatOnType', false);
}