'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAutocompleteArguments = getAutocompleteArguments;
exports.getIncludeOptionalArguments = getIncludeOptionalArguments;
exports.getPythonPath = getPythonPath;
exports.getShowGlobalVariables = getShowGlobalVariables;
exports.getEnableLinting = getEnableLinting;
exports.getLintExtensionBlacklist = getLintExtensionBlacklist;
exports.getLintOnFly = getLintOnFly;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAutocompleteArguments() {
  return (_featureConfig || _load_featureConfig()).default.get('nuclide-python.autocompleteArguments');
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function getIncludeOptionalArguments() {
  return (_featureConfig || _load_featureConfig()).default.get('nuclide-python.includeOptionalArguments');
}

function getPythonPath() {
  return (_featureConfig || _load_featureConfig()).default.get('nuclide-python.pathToPython');
}

function getShowGlobalVariables() {
  return (_featureConfig || _load_featureConfig()).default.get('nuclide-python.showGlobalVariables');
}

function getEnableLinting() {
  return (_featureConfig || _load_featureConfig()).default.get('nuclide-python.enableLinting');
}

function getLintExtensionBlacklist() {
  return (_featureConfig || _load_featureConfig()).default.get('nuclide-python.lintExtensionBlacklist');
}

function getLintOnFly() {
  return (_featureConfig || _load_featureConfig()).default.get('nuclide-python.lintOnFly');
}