Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getAutocompleteArguments = getAutocompleteArguments;
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

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

// config can be null in tests.
function getConfig() {
  return (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-python');
}

function getAutocompleteArguments() {
  var config = getConfig();
  return config == null ? true : config.autocompleteArguments;
}

function getPythonPath() {
  var config = getConfig();
  return config == null ? 'python' : config.pathToPython;
}

function getShowGlobalVariables() {
  var config = getConfig();
  return config == null ? true : config.showGlobalVariables;
}