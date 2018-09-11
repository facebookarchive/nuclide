"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("../../nuclide-clang-rpc/lib/utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _libclang() {
  const data = require("./libclang");

  _libclang = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _range() {
  const data = require("../../../modules/nuclide-commons-atom/range");

  _range = function () {
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
 * 
 * @format
 */
const IDENTIFIER_REGEX = /[a-z0-9_]+/gi;

function isValidRange(clangRange) {
  // Some ranges are unbounded/invalid (end with -1) or empty.
  return clangRange.start.row !== -1 && clangRange.end.row !== -1 && !clangRange.start.isEqual(clangRange.end);
}

function getRangeFromPoint(editor, location) {
  if (location.row < 0) {
    return editor.getBuffer().rangeForRow(0);
  } // Attempt to match a C/C++ identifier at the given location.


  const word = (0, _range().wordAtPosition)(editor, location, IDENTIFIER_REGEX);

  if (word != null) {
    return word.range;
  }

  return editor.getBuffer().rangeForRow(location.row);
}

class ClangLinter {
  static lint(textEditor) {
    return (0, _nuclideAnalytics().trackTiming)('nuclide-clang-atom.fetch-diagnostics', () => ClangLinter._lint(textEditor));
  }

  static async _lint(textEditor) {
    const filePath = textEditor.getPath();

    if (filePath == null) {
      return [];
    }

    try {
      const diagnostics = await (0, _libclang().getDiagnostics)(textEditor); // Editor may have been destroyed during the fetch.

      if (diagnostics == null || textEditor.isDestroyed()) {
        return [];
      }

      (0, _nuclideAnalytics().track)('nuclide-clang-atom.fetch-diagnostics', {
        filePath,
        count: String(diagnostics.diagnostics.length),
        accurateFlags: String(diagnostics.accurateFlags)
      });
      return ClangLinter._processDiagnostics(diagnostics, textEditor);
    } catch (error) {
      (0, _log4js().getLogger)('nuclide-clang').error(`ClangLinter: error linting ${filePath}`, error);
      return [];
    }
  }

  static _processDiagnostics(data, editor) {
    const result = [];
    const buffer = editor.getBuffer();
    const bufferPath = buffer.getPath();

    if (!(bufferPath != null)) {
      throw new Error("Invariant violation: \"bufferPath != null\"");
    }

    if (data.accurateFlags || _featureConfig().default.get('nuclide-clang.defaultDiagnostics')) {
      data.diagnostics.forEach(diagnostic => {
        // We show only warnings, errors and fatals (2, 3 and 4, respectively).
        if (diagnostic.severity < 2) {
          return;
        }

        let range;

        if (diagnostic.ranges && isValidRange(diagnostic.ranges[0].range)) {
          // Use the first range from the diagnostic as the range for Linter.
          range = diagnostic.ranges[0].range;
        } else {
          range = getRangeFromPoint(editor, diagnostic.location.point);
        } // flowlint-next-line sketchy-null-string:off


        const filePath = diagnostic.location.file || bufferPath;
        let trace;

        if (diagnostic.children != null) {
          trace = diagnostic.children.map(child => {
            return {
              type: 'Trace',
              text: child.spelling,
              // flowlint-next-line sketchy-null-string:off
              filePath: child.location.file || bufferPath,
              range: getRangeFromPoint(editor, child.location.point)
            };
          });
        }

        let fix;

        if (diagnostic.fixits != null) {
          // TODO: support multiple fixits (if it's ever used at all)
          const fixit = diagnostic.fixits[0];

          if (fixit != null) {
            fix = {
              range: fixit.range.range,
              newText: fixit.value
            };
          }
        }

        result.push({
          type: diagnostic.severity === 2 ? 'Warning' : 'Error',
          filePath,
          text: diagnostic.spelling,
          range,
          trace,
          fix
        });
      });
    } else {
      result.push({
        type: 'Info',
        filePath: bufferPath,
        text: (0, _utils().isHeaderFile)(bufferPath) ? _constants().HEADER_DEFAULT_FLAGS_WARNING : _constants().DEFAULT_FLAGS_WARNING,
        range: buffer.rangeForRow(0)
      });
    }

    return result;
  }

}

exports.default = ClangLinter;