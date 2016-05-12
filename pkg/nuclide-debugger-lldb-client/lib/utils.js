Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getConfig = getConfig;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var DEBUGGER_LOGGER_CATEGORY = 'nuclide-lldb-client-debugger';
exports.default = require('../../nuclide-logging').getCategoryLogger(DEBUGGER_LOGGER_CATEGORY);

function getConfig() {
  return (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-debugger-lldb-client');
}