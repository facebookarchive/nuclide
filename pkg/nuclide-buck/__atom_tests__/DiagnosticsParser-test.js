'use strict';

var _atom = require('atom');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = _interopRequireWildcard(require('../../nuclide-remote-connection'));
}

var _DiagnosticsParser;

function _load_DiagnosticsParser() {
  return _DiagnosticsParser = require('../lib/DiagnosticsParser');
}

var _DiagnosticsParser2;

function _load_DiagnosticsParser2() {
  return _DiagnosticsParser2 = _interopRequireDefault(require('../lib/DiagnosticsParser'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('DiagnosticsProvider', () => {
  let diagnosticsParser;
  beforeEach(() => {
    diagnosticsParser = new (_DiagnosticsParser2 || _load_DiagnosticsParser2()).default();
    jest.spyOn(_nuclideRemoteConnection || _load_nuclideRemoteConnection(), 'getFileSystemServiceByNuclideUri').mockReturnValue({
      exists(filename) {
        return Promise.resolve(filename.indexOf('good') !== -1);
      }
    });
  });

  it('matches all lines that look like errors', async () => {
    await (async () => {
      const message = 'good_file.cpp:1:2: test error\n' + 'good_file.cpp:1:3: note: trace\n' + 'good_file.cpp:1:4: note: trace2\n' + 'good_file.cpp:1:2 bad line\n' + 'good_file.cpp:12: bad line2\n' + ':12:2: bad line3\n' + 'good_file2.cpp:2:3: test error2\n' + 'good_file2.cpp:2:4: note: trace\n';

      expect((await diagnosticsParser.getDiagnostics(message, 'error', '/'))).toEqual([{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/good_file.cpp',
        text: 'test error',
        range: new _atom.Range([0, 1], [0, 1]),
        trace: [{
          type: 'Trace',
          text: 'note: trace',
          filePath: '/good_file.cpp',
          range: new _atom.Range([0, 2], [0, 2])
        }, {
          type: 'Trace',
          text: 'note: trace2',
          filePath: '/good_file.cpp',
          range: new _atom.Range([0, 3], [0, 3])
        }]
      }, {
        providerName: 'Buck',
        type: 'Error',
        filePath: '/good_file2.cpp',
        text: 'test error2',
        range: new _atom.Range([1, 2], [1, 2]),
        trace: [{
          type: 'Trace',
          text: 'note: trace',
          filePath: '/good_file2.cpp',
          range: new _atom.Range([1, 3], [1, 3])
        }]
      }]);
    })();
  });

  it('resolves absolute paths', async () => {
    await (async () => {
      const message = '/a/good_file.cpp:1:2: test error';
      expect((await diagnosticsParser.getDiagnostics(message, 'error', '/root'))).toEqual([{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/a/good_file.cpp',
        text: 'test error',
        range: new _atom.Range([0, 1], [0, 1])
      }]);
    })();
  });

  it('ignores non-existent files', async () => {
    await (async () => {
      const message = 'bad_file.cpp:1:2: test error';
      expect((await diagnosticsParser.getDiagnostics(message, 'error', '/'))).toEqual([]);
    })();
  });

  it('matches a line that looks like a test failure', async () => {
    await (async () => {
      const diagnostics = Promise.all([diagnosticsParser.getDiagnostics('PASS    <100ms  6 Passed   0 Skipped   0 Failed   FooTests', 'error', '/'), diagnosticsParser.getDiagnostics('FAIL    <100ms  4 Passed   0 Skipped   1 Failed   BarTests', 'error', '/'), diagnosticsParser.getDiagnostics('FAILURE BarTests -[BarTests testBaz]: good/path/to/BarTests.m:42: failure description', 'error', '/'), diagnosticsParser.getDiagnostics('PASS    <100ms  3 Passed   0 Skipped   0 Failed   BazTests', 'error', '/')]);
      expect((await diagnostics)).toEqual([[], [], [{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/good/path/to/BarTests.m',
        text: 'failure description',
        range: {
          start: {
            row: 41,
            column: 0
          },
          end: {
            row: 41,
            column: (_DiagnosticsParser || _load_DiagnosticsParser()).INDEFINITE_END_COLUMN
          }
        }
      }], []]);
    })();
  });

  it('matches multiple test failures from the same test', async () => {
    await (async () => {
      const diagnostics = Promise.all([diagnosticsParser.getDiagnostics('PASS    <100ms  6 Passed   0 Skipped   0 Failed   FooTests', 'error', '/'), diagnosticsParser.getDiagnostics('FAIL    <100ms  4 Passed   0 Skipped   1 Failed   BarTests', 'error', '/'), diagnosticsParser.getDiagnostics('FAILURE BarTests -[BarTests testBaz]: good/path/to/BarTests.m:91: failure one', 'error', '/'), diagnosticsParser.getDiagnostics('good/path/to/BarTests.m:92: failure two', 'error', '/'), diagnosticsParser.getDiagnostics('good/path/to/BarTests.m:98: failure three', 'error', '/'), diagnosticsParser.getDiagnostics('PASS    <100ms  3 Passed   0 Skipped   0 Failed   BazTests', 'error', '/')]);

      expect((await diagnostics)).toEqual([[], [], [{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/good/path/to/BarTests.m',
        text: 'failure one',
        range: {
          start: {
            row: 90,
            column: 0
          },
          end: {
            row: 90,
            column: (_DiagnosticsParser || _load_DiagnosticsParser()).INDEFINITE_END_COLUMN
          }
        }
      }], [{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/good/path/to/BarTests.m',
        text: 'failure two',
        range: {
          start: {
            row: 91,
            column: 0
          },
          end: {
            row: 91,
            column: (_DiagnosticsParser || _load_DiagnosticsParser()).INDEFINITE_END_COLUMN
          }
        }
      }], [{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/good/path/to/BarTests.m',
        text: 'failure three',
        range: {
          start: {
            row: 97,
            column: 0
          },
          end: {
            row: 97,
            column: (_DiagnosticsParser || _load_DiagnosticsParser()).INDEFINITE_END_COLUMN
          }
        }
      }], []]);
    })();
  });

  it('matches multiple test failures', async () => {
    await (async () => {
      const diagnostics = Promise.all([diagnosticsParser.getDiagnostics('PASS    <100ms  6 Passed   0 Skipped   0 Failed   FooTests', 'error', '/'), diagnosticsParser.getDiagnostics('FAIL    <100ms  4 Passed   0 Skipped   1 Failed   BarTests', 'error', '/'), diagnosticsParser.getDiagnostics('FAILURE BarTests -[BarTests testBaz]: good/path/to/BarTests.m:91: failure one', 'error', '/'), diagnosticsParser.getDiagnostics('PASS    <100ms  3 Passed   0 Skipped   0 Failed   BazTests', 'error', '/'), diagnosticsParser.getDiagnostics('FAIL    <100ms  1 Passed   0 Skipped   1 Failed   QuxTests', 'error', '/'), diagnosticsParser.getDiagnostics('FAILURE QuxTests -[QuxTests testNoz]: good/path/to/QuxTests.m:3: failure one', 'error', '/'), diagnosticsParser.getDiagnostics('good/path/to/QuxTests.m:25: failure two', 'error', '/')]);

      expect((await diagnostics)).toEqual([[], [], [{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/good/path/to/BarTests.m',
        text: 'failure one',
        range: {
          start: {
            row: 90,
            column: 0
          },
          end: {
            row: 90,
            column: (_DiagnosticsParser || _load_DiagnosticsParser()).INDEFINITE_END_COLUMN
          }
        }
      }], [], [], [{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/good/path/to/QuxTests.m',
        text: 'failure one',
        range: {
          start: {
            row: 2,
            column: 0
          },
          end: {
            row: 2,
            column: (_DiagnosticsParser || _load_DiagnosticsParser()).INDEFINITE_END_COLUMN
          }
        }
      }], [{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/good/path/to/QuxTests.m',
        text: 'failure two',
        range: {
          start: {
            row: 24,
            column: 0
          },
          end: {
            row: 24,
            column: (_DiagnosticsParser || _load_DiagnosticsParser()).INDEFINITE_END_COLUMN
          }
        }
      }]]);
    })();
  });

  it('matches multiple test failures, even when they appear in an order not found in Buck', async () => {
    await (async () => {
      const diagnostics = Promise.all([diagnosticsParser.getDiagnostics('FAILURE BarTests -[FooTests testBar]: good/path/to/FooTests.m:1: failure one', 'error', '/'),
      // Normally Buck would output a line beginning with "FAIL" here, but
      // this test verifies what happens if it doesn't for some reason.
      diagnosticsParser.getDiagnostics('FAILURE BazTests -[BazTests testQux]: good/path/to/BazTests.m:2: failure two', 'error', '/')]);

      expect((await diagnostics)).toEqual([[{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/good/path/to/FooTests.m',
        text: 'failure one',
        range: {
          start: {
            row: 0,
            column: 0
          },
          end: {
            row: 0,
            column: (_DiagnosticsParser || _load_DiagnosticsParser()).INDEFINITE_END_COLUMN
          }
        }
      }], [{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/good/path/to/BazTests.m',
        text: 'failure two',
        range: {
          start: {
            row: 1,
            column: 0
          },
          end: {
            row: 1,
            column: (_DiagnosticsParser || _load_DiagnosticsParser()).INDEFINITE_END_COLUMN
          }
        }
      }]]);
    })();
  });

  it('matches ocaml errors in Buck', async () => {
    await (async () => {
      const diagnostics = Promise.all([diagnosticsParser.getDiagnostics('File "/a/good_file.ml", line 2, characters 10-12:\n' + 'Error: Unbound value a\n' + 'Hint: Did you mean b?', 'error', '/'), diagnosticsParser.getDiagnostics('File "/a/good_file2.ml", line 10, characters 15-17:\n' + 'Error: whatever error', 'error', '/')]);

      expect((await diagnostics)).toEqual([[{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/a/good_file.ml',
        text: 'Error: Unbound value a, Hint: Did you mean b?',
        range: {
          start: {
            row: 1,
            column: 9
          },
          end: {
            row: 1,
            column: 9
          }
        }
      }], [{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/a/good_file2.ml',
        text: 'Error: whatever error',
        range: {
          start: {
            row: 9,
            column: 14
          },
          end: {
            row: 9,
            column: 14
          }
        }
      }]]);
    })();
  });

  it('matches ocaml warnings', async () => {
    await (async () => {
      const message = 'File "/a/good_file.ml", line 2, characters 10-12:\n' + 'Warning: Unbound value a';

      expect((await diagnosticsParser.getDiagnostics(message, 'warning', '/'))).toEqual([{
        providerName: 'Buck',
        type: 'Warning',
        filePath: '/a/good_file.ml',
        text: 'Warning: Unbound value a',
        range: new _atom.Range([1, 9], [1, 9])
      }]);
    })();
  });

  it('matches rustc errors in Buck', async () => {
    await (async () => {
      const diagnostics = Promise.all([diagnosticsParser.getDiagnostics('error: expected one of `.`, `;`, `?`, `}`, or an operator, found `breakage`\n' + '  --> buck-out/foo/bar#some-container/good/path/to/hello.rs:11:5\n' + '   |\n' + '9  |     println!("Rust says \'Hello World!\'")\n' + '   |                                         - expected one of `.`, `;`, `?`, `}`, or an operator here\n' + '10 | \n' + '11 |     breakage\n' + '   |     ^^^^^^^^ unexpected token\n' + '\n' + 'error: aborting due to previous error', 'error', '/ROOT/PATH')]);

      expect((await diagnostics)).toEqual([[{
        providerName: 'Buck',
        type: 'Error',
        filePath: '/ROOT/PATH/buck-out/foo/bar#some-container/good/path/to/hello.rs',
        text: 'error: expected one of `.`, `;`, `?`, `}`, or an operator, found `breakage`',
        range: {
          start: {
            row: 10,
            column: 4
          },
          end: {
            row: 10,
            column: 4
          }
        }
      }]]);
    })();
  });

  it('matches rustc warnings in Buck', async () => {
    await (async () => {
      const diagnostics = Promise.all([diagnosticsParser.getDiagnostics('warning: unused variable: `unused`\n' + '  --> some-container/good/path/to/hello.rs:10:9\n' + '   |\n' + '10 |     let unused = 44;\n' + '   |         ^^^^^^\n' + '   |\n' + '   = note: #[warn(unused_variables)] on by default' + 'error: aborting due to previous error', 'error', '/ROOT/PATH')]);

      expect((await diagnostics)).toEqual([[{
        providerName: 'Buck',
        type: 'Warning',
        filePath: '/ROOT/PATH/some-container/good/path/to/hello.rs',
        text: 'warning: unused variable: `unused`',
        range: {
          start: {
            row: 9,
            column: 8
          },
          end: {
            row: 9,
            column: 8
          }
        }
      }]]);
    })();
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */