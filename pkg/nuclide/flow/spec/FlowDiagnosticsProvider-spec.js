'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Disposable, Range} = require('atom');

var {uncachedRequire} = require('nuclide-test-helpers');

var testPath = 'myPath';

describe('FlowDiagnosticsProvider::processDiagnostics', () => {

  var flowDiagnosticsProvider: any;

  beforeEach(() => {
    spyOn(require('nuclide-text-event-dispatcher'), 'getInstance').andReturn({
      onFileChange() {
        return new Disposable(() => {});
      },
    });
    var FlowDiagnosticsProvider = uncachedRequire(require, '../lib/FlowDiagnosticsProvider');
    flowDiagnosticsProvider = new FlowDiagnosticsProvider();
  });

  it('should propertly transform a simple diagnostic', () => {
    var diags = [
      {
        message: [
          {
            level: 'error',
            path: testPath,
            descr: 'message',
            line: 1,
            endline: 2,
            start: 3,
            end: 4,
            code: 0,
          },
        ],
      },
    ];

    var expectedOutput = {
      scope: 'file',
      providerName: 'Flow',
      text: 'message',
      type: 'Error',
      filePath: testPath,
      range: new Range([0, 2], [1, 4]),
    };

    var message = flowDiagnosticsProvider._processDiagnostics(diags, testPath).filePathToMessages.get(testPath)[0];
    expect(message).toEqual(expectedOutput);
  });

  it('should keep warnings as warnings', () => {
    var diags = [
      {
        message: [
          {
            level: 'warning',
            path: testPath,
            descr: 'message',
            line: 1,
            endline: 2,
            start: 3,
            end: 4,
            code: 0,
          },
        ],
      },
    ];

    var expectedOutput = {
      scope: 'file',
      providerName: 'Flow',
      text: 'message',
      type: 'Warning',
      filePath: testPath,
      range: new Range([0, 2], [1, 4]),
    };

    var message = flowDiagnosticsProvider._processDiagnostics(diags, testPath).filePathToMessages.get(testPath)[0];
    expect(message).toEqual(expectedOutput);
  });

  it('should filter diagnostics not in the target file', () => {
    var diags = [
      {
        message: [
          {
            path: 'notMyPath',
            descr: 'message',
            line: 1,
            endline: 2,
            start: 3,
            end: 4,
            code: 0,
          },
        ],
      },
    ];

    var allMessages = flowDiagnosticsProvider._processDiagnostics(diags, testPath).filePathToMessages;
    expect(allMessages.has(testPath)).toBe(false);
  });

  it('should create traces for diagnostics spanning multiple messages and combine the error text', () => {
    var diags = [
      {
        message: [
          {
            level: 'error',
            path: testPath,
            descr: 'message',
            line: 1,
            endline: 2,
            start: 3,
            end: 4,
            code: 0,
          },
          {
            level: 'error',
            path: 'otherPath',
            descr: 'more message',
            line: 5,
            endline: 6,
            start: 7,
            end: 8,
            code: 0,
          },
        ],
      },
    ];

    var expectedOutput = {
      scope: 'file',
      providerName: 'Flow',
      type: 'Error',
      text: 'message more message',
      filePath: testPath,
      range: new Range([0, 2], [1, 4]),
      trace: [{
        type: 'Trace',
        filePath: 'otherPath',
        text: 'more message',
        range: new Range([4, 6], [5, 8]),
      }],
    };

    var message = flowDiagnosticsProvider._processDiagnostics(diags, testPath).filePathToMessages.get(testPath)[0];
    expect(message).toEqual(expectedOutput);
  });
});
