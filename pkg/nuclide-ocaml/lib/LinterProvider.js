'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _atom = require('atom');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  name: 'nuclide-ocaml',
  grammarScopes: Array.from((_constants || _load_constants()).GRAMMARS),
  scope: 'file',
  lintOnFly: false,
  invalidateOnClose: true,

  lint: function (textEditor) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('nuclide-ocaml.lint', (0, _asyncToGenerator.default)(function* () {
      const filePath = textEditor.getPath();
      if (filePath == null) {
        return [];
      }

      const instance = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('MerlinService', filePath);
      if (instance == null) {
        return [];
      }
      yield instance.pushNewBuffer(filePath, textEditor.getText());
      const diagnostics = yield instance.errors(filePath);
      if (diagnostics == null) {
        return [];
      }
      return diagnostics.map(function (diagnostic) {
        return {
          type: diagnostic.type === 'warning' ? 'Warning' : 'Error',
          filePath: filePath,
          text: diagnostic.message,
          range: new _atom.Range([diagnostic.start.line - 1, diagnostic.start.col], [diagnostic.end.line - 1, diagnostic.end.col])
        };
      });
    }));
  }
};