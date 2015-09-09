'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var {Range} = require('atom');

var libClangProcessSingleton;
function getLibClangProcess() {
  if (!libClangProcessSingleton) {
    libClangProcessSingleton = require('./main-shared').getSharedLibClangProcess();
  }
  return libClangProcessSingleton;
}

module.exports = {
  providerName: 'Clang',
  grammarScopes: ['source.c', 'source.cpp', 'source.objc', 'source.objcpp'],
  scope: 'file',
  lintOnFly: true,
  async lint(textEditor: TextEditor): Promise<Array<Object>> {
    var filePath = textEditor.getPath();
    if (!filePath) {
      return [];
    }

    // If libClangProcess has not been installed yet, then do not try to lint.
    var libClangProcess = getLibClangProcess();
    if (!libClangProcess) {
      return [];
    }

    var data = await libClangProcess.getDiagnostics(textEditor);
    var messages = data.diagnostics.map(function(diagnostic) {
      // We show only warnings, errors and fatals (2, 3 and 4, respectively).
      if (diagnostic.severity < 2) {
        return null;
      }

      // Only show the diagnostics for current editing file.
      if (filePath !== diagnostic.location.file) {
        return null;
      }

      var type = diagnostic.severity === 2 ? 'Warning' : 'Error';
      // Clang adds file-wide errors on line -1, so we put it on line 0 instead.
      // The usual file-wide error is 'too many errors emitted, stopping now'.
      var line = Math.max(0, diagnostic.location.line);
      var col = 0;
      var range;
      if (diagnostic.ranges) {
        // Use the first range from the diagnostic as the range for Linter.
        var clangRange = diagnostic.ranges[0];
        range = new Range(
          [clangRange.start.line, clangRange.start.column],
          [clangRange.end.line, clangRange.end.column]
        );
      } else {
        range = new Range(
          [line, col],
          [line, textEditor.getBuffer().lineLengthForRow(line)]
        );
      }

      return {
        type,
        text: diagnostic.spelling,
        filePath,
        range,
      };
    }, this);
    return messages.filter(function(message) { return message != null; });
  },
};
