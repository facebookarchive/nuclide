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

var testPath = 'myPath';

describe('FlowDiagnosticsProvider::processDiagnostics', () => {

  var flowDiagnosticsProvider: any;

  beforeEach(() => {
    class FakeProviderBase { }
    var FlowDiagnosticsProvider = require('../lib/FlowDiagnosticsProvider');
    flowDiagnosticsProvider = new FlowDiagnosticsProvider(false, (FakeProviderBase: any));
  });

  it('should propertly transform a simple diagnostic', () => {
    var diags = [[
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
    ]];

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
    var diags = [[
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
    ]];

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

  it('should not filter diagnostics not in the target file', () => {
    var diags = [[
      {
        path: 'notMyPath',
        descr: 'message',
        line: 1,
        endline: 2,
        start: 3,
        end: 4,
        code: 0,
      },
    ]];

    var allMessages = flowDiagnosticsProvider._processDiagnostics(diags, testPath).filePathToMessages;
    expect(allMessages.size).toBe(1);
    expect(allMessages.has('notMyPath')).toBe(true);
  });

  it('should create traces for diagnostics spanning multiple messages and combine the error text', () => {
    var diags = [[
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
    ]];

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
