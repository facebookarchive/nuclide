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

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _commonsAtomRange2;

function _commonsAtomRange() {
  return _commonsAtomRange2 = require('../../commons-atom/range');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _libclang2;

function _libclang() {
  return _libclang2 = require('./libclang');
}

var IDENTIFIER_REGEX = /[a-z0-9_]+/gi;
var DEFAULT_FLAGS_WARNING = 'Diagnostics are disabled due to lack of compilation flags. ' + 'Build this file with Buck, or create a compile_commands.json file manually.';

function fixSourceRange(editor, clangRange) {
  // Some ranges are unbounded/invalid (end with -1) or empty.
  // Treat these as point diagnostics.
  if (clangRange.end.row === -1 || clangRange.start.isEqual(clangRange.end)) {
    return getRangeFromPoint(editor, clangRange.start);
  }
  return clangRange;
}

function getRangeFromPoint(editor, location) {
  if (location.row < 0) {
    return editor.getBuffer().rangeForRow(0);
  }
  // Attempt to match a C/C++ identifier at the given location.
  var word = (0, (_commonsAtomRange2 || _commonsAtomRange()).wordAtPosition)(editor, location, IDENTIFIER_REGEX);
  if (word != null) {
    return word.range;
  }
  return editor.getBuffer().rangeForRow(location.row);
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
      if (filePath == null) {
        return [];
      }

      try {
        var diagnostics = yield (0, (_libclang2 || _libclang()).getDiagnostics)(textEditor);
        // Editor may have been destroyed during the fetch.
        if (diagnostics == null || textEditor.isDestroyed()) {
          return [];
        }

        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-clang-atom.fetch-diagnostics', {
          filePath: filePath,
          count: String(diagnostics.diagnostics.length),
          accurateFlags: String(diagnostics.accurateFlags)
        });
        return ClangLinter._processDiagnostics(diagnostics, textEditor);
      } catch (error) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('ClangLinter: error linting ' + filePath, error);
        return [];
      }
    })
  }, {
    key: '_processDiagnostics',
    value: function _processDiagnostics(data, editor) {
      var result = [];
      var buffer = editor.getBuffer();
      var bufferPath = buffer.getPath();
      (0, (_assert2 || _assert()).default)(bufferPath != null);
      if (data.accurateFlags || (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-clang.defaultDiagnostics')) {
        data.diagnostics.forEach(function (diagnostic) {
          // We show only warnings, errors and fatals (2, 3 and 4, respectively).
          if (diagnostic.severity < 2) {
            return;
          }

          var range = undefined;
          if (diagnostic.ranges) {
            // Use the first range from the diagnostic as the range for Linter.
            range = fixSourceRange(editor, diagnostic.ranges[0].range);
          } else {
            range = getRangeFromPoint(editor, diagnostic.location.point);
          }

          var filePath = diagnostic.location.file || bufferPath;

          var trace = undefined;
          if (diagnostic.children != null) {
            trace = diagnostic.children.map(function (child) {
              return {
                type: 'Trace',
                text: child.spelling,
                filePath: child.location.file || bufferPath,
                range: getRangeFromPoint(editor, child.location.point)
              };
            });
          }

          var fix = undefined;
          if (diagnostic.fixits != null) {
            // TODO: support multiple fixits (if it's ever used at all)
            var fixit = diagnostic.fixits[0];
            if (fixit != null) {
              fix = {
                // Do not use fixSourceRange here, since we need this to be exact.
                range: fixit.range.range,
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
          filePath: bufferPath,
          text: DEFAULT_FLAGS_WARNING,
          range: buffer.rangeForRow(0)
        });
      }

      return result;
    }
  }]);

  return ClangLinter;
})();

exports.default = ClangLinter;
module.exports = exports.default;