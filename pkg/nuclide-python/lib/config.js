Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getPythonPath = getPythonPath;
exports.getShowGlobalVariables = getShowGlobalVariables;

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

// config can be null in tests.
function getConfig() {
  return _nuclideFeatureConfig2['default'].get('nuclide-python');
}

function getPythonPath() {
  var config = getConfig();
  return config == null ? 'python' : config.pathToPython;
}

function getShowGlobalVariables() {
  var config = getConfig();
  return config == null ? true : config.showGlobalVariables;
}