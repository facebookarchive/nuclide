Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getAutocompleteArguments = getAutocompleteArguments;
exports.getIncludeOptionalArguments = getIncludeOptionalArguments;
exports.getPythonPath = getPythonPath;
exports.getShowGlobalVariables = getShowGlobalVariables;
exports.getEnableLinting = getEnableLinting;
exports.getLintOnFly = getLintOnFly;

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

function getAutocompleteArguments() {
  return (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-python.autocompleteArguments');
}

function getIncludeOptionalArguments() {
  return (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-python.includeOptionalArguments');
}

function getPythonPath() {
  return (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-python.pathToPython');
}

function getShowGlobalVariables() {
  return (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-python.showGlobalVariables');
}

function getEnableLinting() {
  return (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-python.enableLinting');
}

function getLintOnFly() {
  return (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-python.lintOnFly');
}