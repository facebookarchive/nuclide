Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getConfig = getConfig;
exports.getShowTypeCoverage = getShowTypeCoverage;
exports.setShowTypeCoverage = setShowTypeCoverage;

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

var HACK_CONFIG_PATH = 'nuclide-hack';
exports.HACK_CONFIG_PATH = HACK_CONFIG_PATH;
var SHOW_TYPE_COVERAGE_CONFIG_PATH = HACK_CONFIG_PATH + '.showTypeCoverage';

exports.SHOW_TYPE_COVERAGE_CONFIG_PATH = SHOW_TYPE_COVERAGE_CONFIG_PATH;

function getConfig() {
  return _nuclideFeatureConfig2['default'].get(HACK_CONFIG_PATH);
}

function getShowTypeCoverage() {
  return getConfig().showTypeCoverage;
}

function setShowTypeCoverage(value) {
  _nuclideFeatureConfig2['default'].set(SHOW_TYPE_COVERAGE_CONFIG_PATH, value);
}