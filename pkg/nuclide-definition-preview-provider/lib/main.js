'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.provideDefinitionPreview = provideDefinitionPreview;

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

function provideDefinitionPreview() {
  return {
    async getDefinitionPreview(definition) {
      const service = await (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getDefinitionPreviewServiceByNuclideUri)(definition.path);

      return service.getDefinitionPreview(definition);
    }
  };
}