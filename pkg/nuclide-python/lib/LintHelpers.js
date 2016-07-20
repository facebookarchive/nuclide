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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _diagnosticRange2;

function _diagnosticRange() {
  return _diagnosticRange2 = require('./diagnostic-range');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _config2;

function _config() {
  return _config2 = require('./config');
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var LintHelpers = (function () {
  function LintHelpers() {
    _classCallCheck(this, LintHelpers);
  }

  _createDecoratedClass(LintHelpers, null, [{
    key: 'lint',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('nuclide-python.lint')],
    value: _asyncToGenerator(function* (editor) {
      var src = editor.getPath();
      if (src == null || !(0, (_config2 || _config()).getEnableLinting)()) {
        return [];
      }

      var extname = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.extname(src);
      // Strip the dot if extname exists, otherwise use the basename as extension.
      // This matches the extension matching of grammar registration.
      var ext = extname.length > 0 ? extname.slice(1) : (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(src);

      if ((_constants2 || _constants()).NO_LINT_EXTENSIONS.has(ext)) {
        return [];
      }

      var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);
      (0, (_assert2 || _assert()).default)(service);

      var diagnostics = yield service.getDiagnostics(src, editor.getText());
      return diagnostics.map(function (diagnostic) {
        return {
          name: 'flake8: ' + diagnostic.code,
          type: diagnostic.type,
          text: diagnostic.message,
          filePath: diagnostic.file,
          range: (0, (_diagnosticRange2 || _diagnosticRange()).getDiagnosticRange)(diagnostic, editor)
        };
      });
    })
  }]);

  return LintHelpers;
})();

exports.default = LintHelpers;
module.exports = exports.default;