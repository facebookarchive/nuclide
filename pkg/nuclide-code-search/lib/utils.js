'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pickConfigByUri = pickConfigByUri;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function pickConfigByUri(uri) {
  const config = (_featureConfig || _load_featureConfig()).default.get('nuclide-code-search');
  const tool = (_nuclideUri || _load_nuclideUri()).default.isRemote(uri) ? config.remoteTool : config.localTool;
  const useVcsSearch = (_nuclideUri || _load_nuclideUri()).default.isRemote(uri) ? config.remoteUseVcsSearch : config.localUseVcsSearch;
  return { tool, useVcsSearch, maxResults: config.maxResults };
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