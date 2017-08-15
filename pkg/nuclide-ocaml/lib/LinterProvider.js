'use strict';

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

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = {
  name: 'nuclide-ocaml',
  grammarScopes: Array.from((_constants || _load_constants()).GRAMMARS),
  scope: 'file',
  lintOnFly: false,

  lint(textEditor) {
    if (!(_featureConfig || _load_featureConfig()).default.get('nuclide-ocaml.enableDiagnostics')) {
      return Promise.resolve([]);
    }
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-ocaml.lint', (0, _asyncToGenerator.default)(function* () {
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
      if (diagnostics == null || textEditor.isDestroyed()) {
        return [];
      }
      return diagnostics.map(function (diagnostic) {
        const { start, end } = diagnostic;
        return {
          type: diagnostic.type === 'warning' ? 'Warning' : 'Error',
          filePath,
          html: '<pre>' + diagnostic.message + '</pre>',
          range: new _atom.Range(start == null ? [0, 0] : [start.line - 1, start.col], end == null ? [0, 0] : [end.line - 1, end.col])
        };
      });
    }));
  }
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */