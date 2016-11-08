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

var _dec, _desc, _value, _class;

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

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

let LintHelpers = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-python.lint'), (_class = class LintHelpers {
  static lint(editor) {
    return (0, _asyncToGenerator.default)(function* () {
      const src = editor.getPath();
      if (src == null || !(0, (_config || _load_config()).getEnableLinting)()) {
        return [];
      }

      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);

      if (!service) {
        throw new Error('Invariant violation: "service"');
      }

      const diagnostics = yield service.getDiagnostics(src, editor.getText());
      return diagnostics.map(function (diagnostic) {
        return {
          name: 'flake8: ' + diagnostic.code,
          type: diagnostic.type,
          text: diagnostic.message,
          filePath: diagnostic.file,
          range: (0, (_diagnosticRange || _load_diagnosticRange()).getDiagnosticRange)(diagnostic, editor)
        };
      });
    })();
  }

}, (_applyDecoratedDescriptor(_class, 'lint', [_dec], Object.getOwnPropertyDescriptor(_class, 'lint'), _class)), _class));
exports.default = LintHelpers;
module.exports = exports['default'];