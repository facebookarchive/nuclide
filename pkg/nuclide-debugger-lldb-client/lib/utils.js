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

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var DEBUGGER_LOGGER_CATEGORY = 'nuclide-lldb-client-debugger';
exports['default'] = require('../../nuclide-logging').getCategoryLogger(DEBUGGER_LOGGER_CATEGORY);

function getConfig() {
  return _nuclideFeatureConfig2['default'].get('nuclide-debugger-lldb-client');
}