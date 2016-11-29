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

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CodeFormatHelpers {

  static formatEntireFile(editor, range) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('python.formatCode', (0, _asyncToGenerator.default)(function* () {
      const buffer = editor.getBuffer();
      const src = editor.getPath();
      if (!src) {
        return {
          formatted: buffer.getText()
        };
      }

      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);

      if (!service) {
        throw new Error('Failed to get service for python.');
      }

      const formatted = yield service.formatCode(src, buffer.getText(), range.start.row + 1, range.end.row + 1);

      return { formatted };
    }));
  }

}
exports.default = CodeFormatHelpers;
module.exports = exports['default'];