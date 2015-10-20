'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {
  STATUS_STARTING,
  STATUS_STOPPING,
  STATUS_STOPPED,
  STATUS_RUNNING,
  STATUS_BREAK,
  STATUS_ERROR,
  STATUS_END,
  COMMAND_RUN,
  COMMAND_STEP_INTO,
  COMMAND_STEP_OVER,
  COMMAND_STEP_OUT,
  COMMAND_STOP,
} = require('../lib/DbgpSocket');
var {DebuggerHandler} = require('../lib/DebuggerHandler');

describe('debugger-hhvm-proxy DebuggerHandler', () => {
  var chromeCallback;
  var connectionMultiplexer;
  var handler;
  var onStatus;
  var onStatusSubscription;

  beforeEach(() => {
    chromeCallback = jasmine.createSpyObj(
      'chromeCallback',
      ['replyToCommand', 'replyWithError', 'sendMethod']
    );
    notificationCallback = jasmine.createSpyObj(
      'notificationCallback',
      ['sendInfo', 'sendWarning', 'sendError', 'sendFatalError']
    );
    connectionMultiplexer = jasmine.createSpyObj('connectionMultiplexer', [
      'onStatus',
      'onConnectionError',
      'listen',
      'getStatus',
      'getStackFrames',
      'sendContinuationCommand',
      'sendBreakCommand',
      'getScopesForFrame',
    ]);
    onStatusSubscription = jasmine.createSpyObj('onStatusSubscription', ['dispose']);
    connectionMultiplexer.onStatus = jasmine.createSpy('onStatus').
      andCallFake(callback => {
        onStatus = callback;
        return onStatusSubscription;
      });
    handler = new DebuggerHandler(chromeCallback, notificationCallback, connectionMultiplexer);
  });

  it('enable', () => {
    waitsForPromise(async () => {
      await handler.handleMethod(1, 'enable');
      expect(chromeCallback.replyToCommand).toHaveBeenCalledWith(1, {}, undefined);
      expect(connectionMultiplexer.listen).not.toHaveBeenCalledWith();
      expect(chromeCallback.sendMethod).toHaveBeenCalledWith(
        'Debugger.paused',
        {
          callFrames: [],
          reason: 'breakpoint',
          data: {},
        });
    });
  });

  it('stack', () => {

    waitsForPromise(async () => {
      connectionMultiplexer.getStackFrames = jasmine.createSpy('getStackFrames').andReturn(
        Promise.resolve({
          stack: [
            {
              $: {
                where: 'foo',
                level: '0',
                type: 'file',
                filename: 'file:///usr/test.php',
                lineno: '5',
              },
            },
            {
              $: {
                where: 'main',
                level: '1',
                type: 'file',
                filename: 'file:///usr/test.php',
                lineno: '15',
              },
            },
          ],
        }));

      await onStatus(STATUS_BREAK);

      expect(connectionMultiplexer.getStackFrames).toHaveBeenCalledWith();
      expect(connectionMultiplexer.getScopesForFrame).toHaveBeenCalledWith(0);
      expect(connectionMultiplexer.getScopesForFrame).toHaveBeenCalledWith(1);
      expect(chromeCallback.sendMethod).toHaveBeenCalledWith(
        'Debugger.scriptParsed',
        {
          scriptId: '/usr/test.php',
          url: 'file:///usr/test.php',
          startLine: 0,
          startColumn: 0,
          endLine: 0,
          endColumn: 0 ,
        });
      expect(chromeCallback.sendMethod).toHaveBeenCalledWith(
        'Debugger.paused',
        {
          callFrames: [
            {
              callFrameId: '0',
              functionName: 'foo',
              location: {
                lineNumber: 4,
                scriptId: '/usr/test.php',
              },
              scopeChain: undefined,
            },
            {
              callFrameId: '1',
              functionName: 'main',
              location: {
                lineNumber: 14,
                scriptId: '/usr/test.php',
              },
              scopeChain: undefined,
            },
          ],
          reason: 'breakpoint',
          data: {},
        });
    });
  });

  it('pause - success', () => {
    connectionMultiplexer.sendBreakCommand =
      jasmine.createSpy('sendBreakCommand').andReturn(Promise.resolve(true));
    handler.handleMethod(1, 'pause');
    expect(connectionMultiplexer.sendBreakCommand).toHaveBeenCalledWith();
  });

  it('pause - failure', () => {
    waitsForPromise(async () => {
      connectionMultiplexer.sendBreakCommand =
        jasmine.createSpy('sendBreakCommand').andReturn(Promise.resolve(false));

      await handler.handleMethod(1, 'pause');

      expect(connectionMultiplexer.sendBreakCommand).toHaveBeenCalledWith();
      expect(chromeCallback.replyWithError).toHaveBeenCalledWith(1, jasmine.any(String));
    });
  });

  it('continue from fake loader bp', () => {
    waitsForPromise(async () => {
      await handler.handleMethod(1, 'resume');
      expect(connectionMultiplexer.listen).toHaveBeenCalledWith();
      expect(chromeCallback.sendMethod).toHaveBeenCalledWith('Debugger.resumed', undefined);
    });
  });

  function testContinuationCommand(chromeCommand, dbgpCommand) {
    return async () => {
      expect(connectionMultiplexer.onStatus).toHaveBeenCalled();

      // Fake the run from loader bp
      await handler.handleMethod(1, 'resume');
      expect(connectionMultiplexer.listen).toHaveBeenCalledWith();
      expect(chromeCallback.sendMethod).toHaveBeenCalledWith('Debugger.resumed', undefined);
      expect(connectionMultiplexer.sendContinuationCommand).not.toHaveBeenCalled();

      connectionMultiplexer.getStackFrames = jasmine.createSpy('getStackFrames').andReturn(
        Promise.resolve({stack: []})
      );

      await handler.handleMethod(1, chromeCommand);

      expect(connectionMultiplexer.sendContinuationCommand).toHaveBeenCalledWith(dbgpCommand);

      await onStatus(STATUS_RUNNING);
      expect(chromeCallback.sendMethod).toHaveBeenCalledWith('Debugger.resumed', undefined);

      await onStatus(STATUS_BREAK);
      expect(connectionMultiplexer.getStackFrames).toHaveBeenCalledWith();
      expect(chromeCallback.sendMethod).toHaveBeenCalledWith(
        'Debugger.paused',
        {
          callFrames: [],
          reason: 'breakpoint',
          data: {},
        });
    };
  }

  it('stepInto', () => {
    waitsForPromise(testContinuationCommand('stepInto', 'step_into'));
  });

  it('stepOut', () => {
    waitsForPromise(testContinuationCommand('stepOut', 'step_out'));
  });

  it('stepOver', () => {
    waitsForPromise(testContinuationCommand('stepOver', 'step_over'));
  });

  it('resume', () => {
    waitsForPromise(testContinuationCommand('resume', 'run'));
  });

  it('stopping', () => {
    waitsForPromise(async () => {
      await onStatus(STATUS_STOPPING);
      expect(connectionMultiplexer.sendContinuationCommand).not.toHaveBeenCalled();
    });
  });

  it('stopped', () => {
    waitsForPromise(async () => {
      var onSessionEnd = jasmine.createSpy('onSessionEnd');
      handler.onSessionEnd(onSessionEnd);

      await onStatus(STATUS_STOPPED);

      expect(onSessionEnd).toHaveBeenCalledWith();
      expect(onStatusSubscription.dispose).toHaveBeenCalledWith();
    });
  });

  it('error', () => {
    waitsForPromise(async () => {
      var onSessionEnd = jasmine.createSpy('onSessionEnd');
      handler.onSessionEnd(onSessionEnd);

      await onStatus(STATUS_ERROR);
      expect(onSessionEnd).toHaveBeenCalledWith();
      expect(onStatusSubscription.dispose).toHaveBeenCalledWith();
    });
  });

  it('end', () => {
    waitsForPromise(async () => {
      var onSessionEnd = jasmine.createSpy('onSessionEnd');
      handler.onSessionEnd(onSessionEnd);

      await onStatus(STATUS_END);
      expect(onSessionEnd).toHaveBeenCalledWith();
      expect(onStatusSubscription.dispose).toHaveBeenCalledWith();
    });
  });

  it('setBreakpointByUrl', () => {
    waitsForPromise(async () => {
      connectionMultiplexer.setBreakpoint = jasmine.createSpy('setBreakpoint')
        .andReturn(12);

      await handler.handleMethod(1, 'setBreakpointByUrl', {
        lineNumber: 42,
        url: 'file:///test.php',
        columnNumber: 0,
        condition: '',
      });

      expect(connectionMultiplexer.setBreakpoint).toHaveBeenCalledWith('/test.php', 43);
      expect(chromeCallback.replyToCommand).toHaveBeenCalledWith(
        1,
        {
          breakpointId : 12,
          locations : [
            {
              lineNumber : 42,
              scriptId : '/test.php',
            },
          ],
        },
        undefined);
    });
  });

  it('removeBreakpoint', () => {
    waitsForPromise(async () => {
      connectionMultiplexer.removeBreakpoint = jasmine.createSpy('removeBreakpoint')
        .andCallFake(async () => {});

      await handler.handleMethod(1, 'removeBreakpoint', {
        breakpointId: 42,
      });

      expect(connectionMultiplexer.removeBreakpoint).toHaveBeenCalledWith(42);
      expect(chromeCallback.replyToCommand).toHaveBeenCalledWith(
        1,
        {
          id: 42,
        },
        undefined);
    });
  });

  it('setPauseOnExceptions', () => {
    waitsForPromise(async () => {
      connectionMultiplexer.setPauseOnExceptions =
        jasmine.createSpy('setPauseOnExceptions').andCallFake(async () => {});

      await handler.handleMethod(1, 'setPauseOnExceptions', {
        state: 'all',
      });

      expect(connectionMultiplexer.setPauseOnExceptions).toHaveBeenCalledWith('all');
      expect(chromeCallback.replyToCommand).toHaveBeenCalledWith(1, {}, undefined);
    });
  });

  it('setAsyncCallStackDepth', () => {
    handler.handleMethod(1, 'setAsyncCallStackDepth');

    expect(chromeCallback.replyWithError).toHaveBeenCalledWith(1, jasmine.any(String));
  });

  it('skipStackFrames', () => {
    handler.handleMethod(1, 'skipStackFrames');

    expect(chromeCallback.replyWithError).toHaveBeenCalledWith(1, jasmine.any(String));
  });

  it('unknown', () => {
    handler.handleMethod(4, 'unknown');
    expect(chromeCallback.replyWithError).toHaveBeenCalledWith(4, jasmine.any(String));
  });
});
