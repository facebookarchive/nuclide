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

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _libclang2;

function _libclang() {
  return _libclang2 = require('./libclang');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var DEFAULT_FLAGS_WARNING = 'Diagnostics are disabled due to lack of compilation flags. ' + 'Build this file with Buck, or create a compile_commands.json file manually.';

function atomRangeFromSourceRange(clangRange) {
  return new (_atom2 || _atom()).Range([clangRange.start.line, clangRange.start.column], [clangRange.end.line, clangRange.end.column]);
}

function atomRangeFromLocation(location) {
  var line = Math.max(0, location.line);
  return new (_atom2 || _atom()).Range([line, 0], [line + 1, 0]);
}

var ClangLinter = (function () {
  function ClangLinter() {
    _classCallCheck(this, ClangLinter);
  }

  _createDecoratedClass(ClangLinter, null, [{
    key: 'lint',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('nuclide-clang-atom.fetch-diagnostics')],
    value: _asyncToGenerator(function* (textEditor) {
      var filePath = textEditor.getPath();
      if (!filePath) {
        return;
      }

      try {
        var diagnostics = yield (0, (_libclang2 || _libclang()).getDiagnostics)(textEditor);
        if (diagnostics == null) {
          return [];
        }

        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-clang-atom.fetch-diagnostics', {
          filePath: filePath,
          count: String(diagnostics.diagnostics.length),
          accurateFlags: String(diagnostics.accurateFlags)
        });
        return ClangLinter._processDiagnostics(diagnostics, filePath);
      } catch (error) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('ClangLinter: error linting ' + filePath, error);
        return [];
      }
    })
  }, {
    key: '_processDiagnostics',
    value: function _processDiagnostics(data, editorPath) {
      var result = [];
      if (data.accurateFlags || (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-clang.defaultDiagnostics')) {
        data.diagnostics.forEach(function (diagnostic) {
          // We show only warnings, errors and fatals (2, 3 and 4, respectively).
          if (diagnostic.severity < 2) {
            return;
          }

          // Clang adds file-wide errors on line -1, so we put it on line 0 instead.
          // The usual file-wide error is 'too many errors emitted, stopping now'.
          var range = undefined;
          if (diagnostic.ranges) {
            // Use the first range from the diagnostic as the range for Linter.
            range = atomRangeFromSourceRange(diagnostic.ranges[0]);
          } else {
            range = atomRangeFromLocation(diagnostic.location);
          }

          var filePath = diagnostic.location.file || editorPath;

          var trace = undefined;
          if (diagnostic.children != null) {
            trace = diagnostic.children.map(function (child) {
              return {
                type: 'Trace',
                text: child.spelling,
                filePath: child.location.file || editorPath,
                range: atomRangeFromLocation(child.location)
              };
            });
          }

          var fix = undefined;
          if (diagnostic.fixits != null) {
            // TODO: support multiple fixits (if it's ever used at all)
            var fixit = diagnostic.fixits[0];
            if (fixit != null) {
              fix = {
                range: atomRangeFromSourceRange(fixit.range),
                newText: fixit.value
              };
            }
          }

          result.push({
            scope: 'file',
            providerName: 'Clang',
            type: diagnostic.severity === 2 ? 'Warning' : 'Error',
            filePath: filePath,
            text: diagnostic.spelling,
            range: range,
            trace: trace,
            fix: fix
          });
        });
      } else {
        result.push({
          scope: 'file',
          providerName: 'Clang',
          type: 'Warning',
          filePath: editorPath,
          text: DEFAULT_FLAGS_WARNING,
          range: new (_atom2 || _atom()).Range([0, 0], [1, 0])
        });
      }

      return result;
    }
  }]);

  return ClangLinter;
})();

exports.default = ClangLinter;
module.exports = exports.default;