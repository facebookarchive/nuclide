'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.INDEFINITE_END_COLUMN = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
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
 */

const DIAGNOSTIC_REGEX = /^([^\s:]+):([0-9]+):([0-9]+): (.*)$/gm;

// Buck output for Objetive-C tests looks something like this:
//     PASS    <100ms  6 Passed   0 Skipped   0 Failed   FooTests
//     FAIL    <100ms  6 Passed   0 Skipped   1 Failed   BarTests
//     FAILURE BarTests -[BarTests testBaz]: path/to/BarTests.m:33: ((obj == obj) is true) failed
//     path/to/BarTests.m:36: ((ObjectIsEqual(obj, obj)) is false) failed
// In this example, there are two failures in the -[BarTests testBaz] test method.
// The START regex matches the first failure, the CONTINUED regex matches every other failure.
const TEST_FAILURE_START_REGEX = /^FAILURE.*: (.*):([0-9]+): (.*)$/gm;
const TEST_FAILURE_CONTINUED_REGEX = /^([^:]+):([0-9]+): (.*)$/gm;

// It's expensive to get the real length of the lines (we'd have to read each file).
// Instead, just use a very large number ("infinity"). The diagnostics UI handles this
// and won't underline any characters past the end of the line.
const INDEFINITE_END_COLUMN = exports.INDEFINITE_END_COLUMN = 1e9;

// An intermediate step towards creating real diagnostics.


function getFileSystemServiceIfNecessary(fileSystemService, root) {
  if (fileSystemService == null) {
    return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(root);
  } else {
    return fileSystemService;
  }
}

function pushParsedDiagnostic(fileSystemService, promises, root, file, level, text, line, column) {
  if (fileSystemService != null) {
    const filePath = (_nuclideUri || _load_nuclideUri()).default.resolve(root, file);
    const localPath = (_nuclideUri || _load_nuclideUri()).default.getPath(filePath);
    promises.push(fileSystemService.exists(localPath).then(exists => !exists ? null : {
      level,
      filePath,
      text,
      line,
      column
    },
    // Silently ignore files resulting in an error.
    () => null));
  }
}

function pushParsedTestDiagnostic(fileSystemService, promises, root, match) {
  const [, file, strLine, text] = match;
  pushParsedDiagnostic(fileSystemService, promises, root, file, 'error', text, parseInt(strLine, 10), 0);
}

function makeDiagnostic(result) {
  return {
    scope: 'file',
    providerName: 'Buck',
    type: result.level === 'error' ? 'Error' : 'Warning',
    filePath: result.filePath,
    text: result.text,
    range: new _atom.Range([result.line - 1, 0], [result.line - 1, INDEFINITE_END_COLUMN])
  };
}

function makeTrace(result) {
  const point = new _atom.Point(result.line - 1, result.column - 1);
  return {
    type: 'Trace',
    text: result.text,
    filePath: result.filePath,
    // Display trace locations more precisely, since they don't show in the editor.
    range: new _atom.Range(point, point)
  };
}

/**
 * Consumes Buck console output and emits a set of file-level diagnostic messages.
 * Ideally Buck should do this for us, but let's parse the messages manually for now.
 * This only (officially) handles Clang/g++ output.
 */
class DiagnosticsParser {
  constructor() {
    this.testFailuresHaveStarted = false;
  }

  getDiagnostics(message, level, root) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Only fetch the file system service if we need it.
      let fileSystemService;

      // Global regexps need to be reset before use.
      DIAGNOSTIC_REGEX.lastIndex = 0;
      TEST_FAILURE_START_REGEX.lastIndex = 0;
      TEST_FAILURE_CONTINUED_REGEX.lastIndex = 0;

      // Collect diagnostics promises and check all matches at once.
      const promises = [];
      let diagnosticMatch;
      while (diagnosticMatch = DIAGNOSTIC_REGEX.exec(message)) {
        const [, file, strLine, strCol, text] = diagnosticMatch;
        fileSystemService = getFileSystemServiceIfNecessary(fileSystemService, root);
        const line = parseInt(strLine, 10);
        const column = parseInt(strCol, 10);
        pushParsedDiagnostic(fileSystemService, promises, root, file, level, text, line, column);
      }

      // Collect test failure promises and check all matches at once.
      let testFailureMatch;
      // Only check for test failures if this line hasn't already matched for something else.
      if (promises.length === 0) {
        const regexp = _this.testFailuresHaveStarted ? TEST_FAILURE_CONTINUED_REGEX : TEST_FAILURE_START_REGEX;
        const failuresHadStarted = _this.testFailuresHaveStarted;

        _this.testFailuresHaveStarted = false;
        while (testFailureMatch = regexp.exec(message)) {
          _this.testFailuresHaveStarted = true;
          fileSystemService = getFileSystemServiceIfNecessary(fileSystemService, root);
          pushParsedTestDiagnostic(fileSystemService, promises, root, testFailureMatch);
        }

        if (failuresHadStarted && promises.length === 0) {
          // This function has already checked for a continued failure.
          // Now it checks for two new failures in a row:
          //     FAILURE TestOne ...
          //     FAILURE TestTwo ...
          // In practice, Buck does not output faliures this way (it outputs a
          // line that begins with "FAIL" in between), but in case it ever
          // begins doing so this function will match it correctly.
          while (testFailureMatch = TEST_FAILURE_START_REGEX.exec(message)) {
            _this.testFailuresHaveStarted = true;
            fileSystemService = getFileSystemServiceIfNecessary(fileSystemService, root);
            pushParsedTestDiagnostic(fileSystemService, promises, root, testFailureMatch);
          }
        }
      }

      const results = yield Promise.all(promises);
      // Merge 'note' level messages into diagnostics as traces.
      const diagnostics = [];
      for (const result of results.filter(Boolean)) {
        if (result.text.startsWith('note: ') && diagnostics.length > 0) {
          const previous = diagnostics[diagnostics.length - 1];
          if (previous.trace == null) {
            previous.trace = [];
          }
          previous.trace.push(makeTrace(result));
        } else {
          diagnostics.push(makeDiagnostic(result));
        }
      }
      return diagnostics;
    })();
  }
}
exports.default = DiagnosticsParser;