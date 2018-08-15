"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _diagnosticRange() {
  const data = require("./diagnostic-range");

  _diagnosticRange = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("./config");

  _config = function () {
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
 *  strict-local
 * @format
 */
class LintHelpers {
  static lint(editor) {
    const src = editor.getPath();

    if (src == null || !(0, _config().getEnableLinting)() || (0, _config().getLintExtensionBlacklist)().includes(_nuclideUri().default.extname(src))) {
      return Promise.resolve([]);
    }

    return (0, _nuclideAnalytics().trackTiming)('nuclide-python.lint', async () => {
      const service = (0, _nuclideRemoteConnection().getPythonServiceByNuclideUri)(src);
      const diagnostics = await service.getDiagnostics(src);

      if (editor.isDestroyed()) {
        return [];
      }

      return diagnostics.map(diagnostic => ({
        name: 'flake8: ' + diagnostic.code,
        type: diagnostic.type,
        text: diagnostic.message,
        filePath: diagnostic.file,
        range: (0, _diagnosticRange().getDiagnosticRange)(diagnostic, editor)
      }));
    });
  }

}

exports.default = LintHelpers;