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

var HACK_CONFIG_PATH = 'nuclide-hack';
exports.HACK_CONFIG_PATH = HACK_CONFIG_PATH;
var SHOW_TYPE_COVERAGE_CONFIG_PATH = HACK_CONFIG_PATH + '.showTypeCoverage';

exports.SHOW_TYPE_COVERAGE_CONFIG_PATH = SHOW_TYPE_COVERAGE_CONFIG_PATH;

function getConfig() {
  return (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get(HACK_CONFIG_PATH);
}