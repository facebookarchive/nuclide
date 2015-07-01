'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var DebuggerHandler = require('../lib/DebuggerHandler');

describe('debugger-hhvm-proxy DebuggerHandler', () => {
    var callback;
    var socket;
    var cache;
    var handler;

    beforeEach(() => {
      callback = jasmine.createSpyObj('callback', ['replyToCommand', 'replyWithError', 'sendMethod']);
      socket = jasmine.createSpyObj('socket', ['getStatus', 'getStackFrames', 'sendContinuationCommand', 'sendBreakCommand']);
      cache = jasmine.createSpyObj('cache', ['enable', 'disable', 'getScopesForFrame']);
      handler = new DebuggerHandler(callback, socket, cache);
    });

    it('enable', () => {
      waitsForPromise(async () => {
        socket.getStatus = jasmine.createSpy('getStatus').andReturn(Promise.resolve('starting'));
        socket.sendContinuationCommand = jasmine.createSpy('sendContinuationCommand')
          .andReturn(Promise.resolve('break'));
        socket.getStackFrames = jasmine.createSpy('getStackFrames').andReturn(Promise.resolve(
          {
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
            ]
          }));

        await handler.handleMethod(1, 'enable');

        expect(socket.getStatus).toHaveBeenCalledWith();
        expect(cache.disable).toHaveBeenCalledWith();
        expect(socket.sendContinuationCommand).toHaveBeenCalledWith('step_into');
        expect(callback.sendMethod).toHaveBeenCalledWith('Debugger.resumed', undefined);
        expect(socket.getStackFrames).toHaveBeenCalledWith();
        expect(cache.enable).toHaveBeenCalledWith();
        expect(cache.getScopesForFrame).toHaveBeenCalledWith(0);
        expect(cache.getScopesForFrame).toHaveBeenCalledWith(1);
        expect(callback.sendMethod).toHaveBeenCalledWith(
          'Debugger.scriptParsed',
          {
            scriptId: '/usr/test.php',
            url: 'file:///usr/test.php',
            startLine: 0,
            startColumn: 0,
            endLine: 0,
            endColumn: 0 ,
          });
        expect(callback.sendMethod).toHaveBeenCalledWith(
          'Debugger.paused',
          {
            callFrames: [
              {
                  callFrameId: 0,
                  functionName: 'foo',
                  location: {
                    lineNumber: 4,
                    scriptId: '/usr/test.php',
                  },
                  scopeChain: undefined,
              },
              {
                  callFrameId: 1,
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
      socket.sendBreakCommand = jasmine.createSpy('sendBreakCommand').andReturn(Promise.resolve(true));
      handler.handleMethod(1, 'pause');
      expect(socket.sendBreakCommand).toHaveBeenCalledWith();
    });

    it('pause - failure', () => {
      waitsForPromise(async () => {
        socket.sendBreakCommand = jasmine.createSpy('sendBreakCommand').andReturn(Promise.resolve(false));

        await handler.handleMethod(1, 'pause');

        expect(socket.sendBreakCommand).toHaveBeenCalledWith();
        expect(callback.replyWithError).toHaveBeenCalledWith(1, jasmine.any(String));
      });
    });

    function testContinuationCommand(chromeCommand, dbgpCommand) {
      return async () => {
        socket.sendContinuationCommand = jasmine.createSpy('sendContinuationCommand')
          .andReturn(Promise.resolve('break'));
        socket.getStackFrames = jasmine.createSpy('getStackFrames').andReturn(Promise.resolve({stack: []}));

        await handler.handleMethod(1, chromeCommand);

        expect(cache.disable).toHaveBeenCalledWith();
        expect(socket.sendContinuationCommand).toHaveBeenCalledWith(dbgpCommand);
        expect(callback.sendMethod).toHaveBeenCalledWith('Debugger.resumed', undefined);
        expect(cache.enable).toHaveBeenCalledWith();
        expect(socket.getStackFrames).toHaveBeenCalledWith();
        expect(callback.sendMethod).toHaveBeenCalledWith(
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
        var status = 'stopping';
        socket.sendContinuationCommand = jasmine.createSpy('sendContinuationCommand')
          .andCallFake(async () => {
            if (status === 'stopping') {
              status = 'stopped';
              return 'stopping';
            } else {
              return status;
            }
          });
        var onSessionEnd = jasmine.createSpy('onSessionEnd');
        handler.onSessionEnd(onSessionEnd);

        await handler.handleMethod(1, 'resume');

        expect(cache.disable).toHaveBeenCalledWith();
        expect(socket.sendContinuationCommand).toHaveBeenCalledWith('run');
        expect(callback.sendMethod).toHaveBeenCalledWith('Debugger.resumed', undefined);
        expect(socket.sendContinuationCommand).toHaveBeenCalledWith('stop');
        expect(callback.sendMethod).toHaveBeenCalledWith('Debugger.resumed', undefined);
        expect(callback.sendMethod).toHaveBeenCalledWith(
          'Debugger.paused',
          {
            callFrames: [],
            reason: 'breakpoint',
            data: {},
          });
        expect(onSessionEnd).toHaveBeenCalledWith();
      });
    });

    it('setBreakpointByUrl', () => {
      waitsForPromise(async () => {
        socket.setBreakpoint = jasmine.createSpy('setBreakpoint')
          .andCallFake(async () => {
            return 12;
          });

        await handler.handleMethod(1, 'setBreakpointByUrl', {
          lineNumber: 42,
          url: 'file:///test.php',
          columnNumber: 0,
          condition: '',
        });

        expect(socket.setBreakpoint).toHaveBeenCalledWith('/test.php', 43);
        expect(callback.replyToCommand).toHaveBeenCalledWith(
          1,
          {
            breakpointId : 12,
            locations : [
              {
                lineNumber : 42,
                scriptId : '/test.php',
              },
            ]
          },
          undefined);
      });
    });

    it('removeBreakpoint', () => {
      waitsForPromise(async () => {
        socket.removeBreakpoint = jasmine.createSpy('removeBreakpoint')
          .andCallFake(async () => {});

        await handler.handleMethod(1, 'removeBreakpoint', {
          breakpointId: 42,
        });

        expect(socket.removeBreakpoint).toHaveBeenCalledWith(42);
        expect(callback.replyToCommand).toHaveBeenCalledWith(
          1,
          {
            id: 42,
          },
          undefined);
      });
    });

    it('setPauseOnExceptions', () => {
      handler.handleMethod(1, 'setPauseOnExceptions');

      expect(callback.replyWithError).toHaveBeenCalledWith(1, jasmine.any(String));
    });

    it('setAsyncCallStackDepth', () => {
      handler.handleMethod(1, 'setAsyncCallStackDepth');

      expect(callback.replyWithError).toHaveBeenCalledWith(1, jasmine.any(String));
    });

    it('skipStackFrames', () => {
      handler.handleMethod(1, 'skipStackFrames');

      expect(callback.replyWithError).toHaveBeenCalledWith(1, jasmine.any(String));
    });

    it('unknown', () => {
      handler.handleMethod(4, 'unknown');
      expect(callback.replyWithError).toHaveBeenCalledWith(4, jasmine.any(String));
    });
});
