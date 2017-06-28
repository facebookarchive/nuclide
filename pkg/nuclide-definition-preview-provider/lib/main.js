'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.provideDefinitionPreview = provideDefinitionPreview;

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
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

function provideDefinitionPreview() {
  return {
    getDefinitionPreview(definition) {
      return (0, _asyncToGenerator.default)(function* () {
        const service = yield (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getDefinitionPreviewServiceByNuclideUri)(definition.path);

        return service.getDefinitionPreview(definition);
      })();
    }
  };
}