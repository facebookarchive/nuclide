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

describe('HackDiagnosticsProvider::processDiagnostics', () => {

  var hackDiagnosticsProvider: any;

  beforeEach(() => {
    class FakeProviderBase { }
    var HackDiagnosticsProvider = require('../lib/HackDiagnosticsProvider');
    hackDiagnosticsProvider = new HackDiagnosticsProvider(false, (FakeProviderBase: any));
  });

  it('should propertly transform a simple diagnostic', () => {
    var diagnostics = [
      {
        message: [
          {
            path: testPath,
            descr: 'message',
            line: 1,
            start: 3,
            end: 4,
          },
        ],
      },
    ];

    var expectedOutput = {
      scope: 'file',
      providerName: 'Hack',
      html: 'message',
      type: 'Error',
      filePath: testPath,
      range: new Range([0, 2], [0, 4]),
    };

    var message = hackDiagnosticsProvider
      ._processDiagnostics(diagnostics, testPath)
      .filePathToMessages.get(testPath)[0];
    expect(message).toEqual(expectedOutput);
  });

  it('should not filter diagnostics not in the target file', () => {
    var diagnostics = [
      {
        message: [
          {
            path: 'notMyPath',
            descr: 'message',
            line: 1,
            start: 3,
            end: 4,
          },
        ],
      },
    ];

    var allMessages = hackDiagnosticsProvider
      ._processDiagnostics(diagnostics, testPath)
      .filePathToMessages;
    expect(allMessages.size).toBe(1);
    expect(allMessages.has('notMyPath')).toBe(true);
  });

  it('should create traces for diagnostics on multiple messages and combine the text', () => {
    var diagnostics = [
      {
        message: [
          {
            path: testPath,
            descr: 'message',
            line: 1,
            start: 3,
            end: 4,
          },
          {
            path: 'otherPath',
            descr: 'more message',
            line: 5,
            start: 7,
            end: 8,
          },
        ],
      },
    ];

    var expectedOutput = {
      scope: 'file',
      providerName: 'Hack',
      type: 'Error',
      html: 'message<br/>more message',
      filePath: testPath,
      range: new Range([0, 2], [0, 4]),
      trace: [{
        type: 'Trace',
        filePath: testPath,
        text: 'more message',
        range: new Range([0, 2], [0, 4]),
      }],
    };

    var message = hackDiagnosticsProvider
      ._processDiagnostics(diagnostics, testPath)
      .filePathToMessages.get(testPath)[0];
    expect(message).toEqual(expectedOutput);
  });
});
