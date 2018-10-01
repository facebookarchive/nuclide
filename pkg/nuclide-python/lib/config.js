"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAutocompleteArguments = getAutocompleteArguments;
exports.getIncludeOptionalArguments = getIncludeOptionalArguments;
exports.getPythonPath = getPythonPath;
exports.getShowGlobalVariables = getShowGlobalVariables;
exports.getShowSignatureHelp = getShowSignatureHelp;
exports.getEnableLinting = getEnableLinting;
exports.getLintExtensionBlacklist = getLintExtensionBlacklist;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
function getAutocompleteArguments() {
  return _featureConfig().default.get('nuclide-python.autocompleteArguments');
}

function getIncludeOptionalArguments() {
  return _featureConfig().default.get('nuclide-python.includeOptionalArguments');
}

function getPythonPath() {
  return _featureConfig().default.get('nuclide-python.pathToPython');
}

function getShowGlobalVariables() {
  return _featureConfig().default.get('nuclide-python.showGlobalVariables');
}

function getShowSignatureHelp() {
  return Boolean(_featureConfig().default.get('nuclide-python.showSignatureHelp'));
}

function getEnableLinting() {
  return _featureConfig().default.get('nuclide-python.enableLinting');
}

function getLintExtensionBlacklist() {
  return _featureConfig().default.get('nuclide-python.lintExtensionBlacklist');
}