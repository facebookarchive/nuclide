Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getAutocompleteArguments = getAutocompleteArguments;
exports.getIncludeOptionalArguments = getIncludeOptionalArguments;
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

function getAutocompleteArguments() {
  return (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-python.autocompleteArguments');
}

function getIncludeOptionalArguments() {
  return (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-python.includeOptionalArguments');
}

function getPythonPath() {
  return (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-python.pathToPython');
}

function getShowGlobalVariables() {
  return (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-python.showGlobalVariables');
}