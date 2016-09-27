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

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var DEBUGGER_LOGGER_CATEGORY = 'nuclide-node-debugger';
exports.default = (0, (_nuclideLogging2 || _nuclideLogging()).getCategoryLogger)(DEBUGGER_LOGGER_CATEGORY);

function getConfig() {
  return (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-debugger-node');
}