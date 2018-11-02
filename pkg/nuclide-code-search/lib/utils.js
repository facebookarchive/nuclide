"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pickConfigByUri = pickConfigByUri;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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
function pickConfigByUri(uri) {
  const config = _featureConfig().default.get('nuclide-code-search');

  const tool = _nuclideUri().default.isRemote(uri) ? config.remoteTool : config.localTool;
  const useVcsSearch = _nuclideUri().default.isRemote(uri) ? config.remoteUseVcsSearch : config.localUseVcsSearch;
  return {
    tool,
    useVcsSearch,
    maxResults: config.maxResults
  };
}