'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfig = getConfig;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
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

const DEBUGGER_LOGGER_CATEGORY = 'nuclide-lldb-client-debugger';

exports.default = (0, (_log4js || _load_log4js()).getLogger)(DEBUGGER_LOGGER_CATEGORY);
function getConfig() {
  return (_featureConfig || _load_featureConfig()).default.get('nuclide-debugger-native');
}