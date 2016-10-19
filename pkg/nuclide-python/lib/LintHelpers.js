Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
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

var LintHelpers = (function () {
  function LintHelpers() {
    _classCallCheck(this, LintHelpers);
  }

  _createDecoratedClass(LintHelpers, null, [{
    key: 'lint',
    decorators: [(0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-python.lint')],
    value: _asyncToGenerator(function* (editor) {
      var src = editor.getPath();
      if (src == null || !(0, (_config || _load_config()).getEnableLinting)()) {
        return [];
      }

      var service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);
      (0, (_assert || _load_assert()).default)(service);

      var diagnostics = yield service.getDiagnostics(src, editor.getText());
      return diagnostics.map(function (diagnostic) {
        return {
          name: 'flake8: ' + diagnostic.code,
          type: diagnostic.type,
          text: diagnostic.message,
          filePath: diagnostic.file,
          range: (0, (_diagnosticRange || _load_diagnosticRange()).getDiagnosticRange)(diagnostic, editor)
        };
      });
    })
  }]);

  return LintHelpers;
})();

exports.default = LintHelpers;
module.exports = exports.default;