'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _diagnosticRange;

function _load_diagnosticRange() {
  return _diagnosticRange = require('./diagnostic-range');
}

var _config;

function _load_config() {
  return _config = require('./config');
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

class LintHelpers {
  static lint(editor) {
    const src = editor.getPath();
    if (src == null || !(0, (_config || _load_config()).getEnableLinting)() || (0, (_config || _load_config()).getLintExtensionBlacklist)().includes((_nuclideUri || _load_nuclideUri()).default.extname(src))) {
      return Promise.resolve([]);
    }

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-python.lint', (0, _asyncToGenerator.default)(function* () {
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getPythonServiceByNuclideUri)(src);
      const diagnostics = yield service.getDiagnostics(src, editor.getText());
      if (editor.isDestroyed()) {
        return [];
      }
      return diagnostics.map(function (diagnostic) {
        return {
          name: 'flake8: ' + diagnostic.code,
          type: diagnostic.type,
          text: diagnostic.message,
          filePath: diagnostic.file,
          range: (0, (_diagnosticRange || _load_diagnosticRange()).getDiagnosticRange)(diagnostic, editor)
        };
      });
    }));
  }
}
exports.default = LintHelpers;