'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _outline;

function _load_outline() {
  return _outline = require('./outline');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let OutlineHelpers = class OutlineHelpers {
  static getOutline(editor) {
    return (0, _asyncToGenerator.default)(function* () {
      const src = editor.getPath();
      if (!src) {
        return null;
      }
      const contents = editor.getText();
      const mode = (0, (_config || _load_config()).getShowGlobalVariables)() ? 'all' : 'constants';

      const service = yield (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);
      if (!service) {
        return null;
      }

      const items = yield service.getOutline(src, contents);
      if (items == null) {
        return null;
      }

      return {
        outlineTrees: (0, (_outline || _load_outline()).itemsToOutline)(mode, items)
      };
    })();
  }
};
exports.default = OutlineHelpers;
module.exports = exports['default'];