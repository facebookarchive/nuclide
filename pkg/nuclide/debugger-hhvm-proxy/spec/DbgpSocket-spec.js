'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {makeDbgpMessage} = require('../lib/utils');
var DbgpSocket = require('../lib/DbgpSocket').DbgpSocket;
var {idOfFrame, functionOfFrame, fileOfFrame, locationOfFrame} = require('../lib/frame');

function makeMessage(obj, body) {
  body = body || '';
  var result = '<?xml version="1.0" encoding="iso-8859-1"?><response xmlns="urn:debugger_protocol_v1" xmlns:xdebug="http://xdebug.org/dbgp/xdebug"';
  for (var key in obj) {
    result += ' ' + key + '="' + obj[key] + '"';
  }
  result += '>' + body + '</response>';
  return makeDbgpMessage(result);
}

describe('debugger-hhvm-proxy DbgpSocket', () => {
    var socket;
    var dbgpSocket;
    var onData;

    beforeEach(() => {
      socket = jasmine.createSpyObj('socket', ['write', 'end', 'destroy']);
      socket.on = (event, callback) => { onData = callback; };
      spyOn(socket, 'on').andCallThrough();
      dbgpSocket = new DbgpSocket(socket);
    });

    function testCallResult(socketWrite, onDataObject, body): void {
      expect(socket.write).toHaveBeenCalledWith(socketWrite + '\x00');
      onData(makeMessage(onDataObject, body));
    }

    async function testCall(resultPromise, socketWrite, onDataObject, expectedResult, body) {
      testCallResult(socketWrite, onDataObject, body);
      var result = await resultPromise;
      expect(result).toBe(expectedResult);
    }

    it('constructor', () => {
      expect(socket.on).toHaveBeenCalledWith('data', jasmine.any(Function));
    });

    it('dispose', () => {
      dbgpSocket.dispose();
      expect(socket.end).toHaveBeenCalled();
      expect(socket.destroy).toHaveBeenCalled();
    });

    it('constructor', () => {
      expect(socket.on).toHaveBeenCalledWith('data', jasmine.any(Function));
    });

    it('getStatus', () => {
      waitsForPromise(() => {
        return testCall(
          dbgpSocket.getStatus(),
          'status -i 1',
          {
            status: 'stopping',
            reason: 'ok',
            command: 'status',
            transaction_id: '1',
          },
          'stopping');
      });
    });

    it('sendBreakCommand', () => {
      waitsForPromise(async () => {
        await testCall(
          dbgpSocket.sendBreakCommand(),
          'break -i 1',
          {
            success: '1',
            command: 'break',
            transaction_id: '1',
          },
          true);
        await testCall(
          dbgpSocket.sendBreakCommand(),
          'break -i 2',
          {
            success: '0',
            command: 'break',
            transaction_id: '2',
          },
          false);
      });
    });

    it('getStackFrames', () => {
      waitsForPromise(async () => {
        var call = dbgpSocket.getStackFrames();
        testCallResult(
          'stack_get -i 1',
          {
            command: 'stack_get',
            transaction_id: '1',
          },
          '<stack where="foo" level="0" type="file" filename="file:///home/peterhal/test/dbgp/test-client.php" lineno="4"></stack>' +
          '<stack where="{main}" level="1" type="file" filename="file:///home/peterhal/test/dbgp/test-client.php" lineno="10"></stack>');
        var result = await call;

        var stack = result.stack;
        expect(stack.length).toBe(2);

        var frame0 = stack[0];
        expect(idOfFrame(frame0)).toBe(0);
        expect(functionOfFrame(frame0)).toBe('foo');
        expect(fileOfFrame(frame0)).toBe('/home/peterhal/test/dbgp/test-client.php');
        expect(locationOfFrame(frame0)).toEqual({lineNumber:3, scriptId: fileOfFrame(frame0)});

        var frame1 = stack[1];
        expect(idOfFrame(frame1)).toBe(1);
        expect(functionOfFrame(frame1)).toBe('{main}');
        expect(fileOfFrame(frame1)).toBe('/home/peterhal/test/dbgp/test-client.php');
        expect(locationOfFrame(frame1)).toEqual({lineNumber:9, scriptId: fileOfFrame(frame1)});
      });
    });

    it('setBreakpoint', () => {
      waitsForPromise(async () => {
        var call = dbgpSocket.setBreakpoint('/test.php', 42);
        testCallResult(
          'breakpoint_set -i 1 -t line -f /test.php -n 42',
          {
            command: 'breakpoint_set',
            transaction_id: '1',
            state: 'enabled',
            id: '12',
          });
        var result = await call;
        expect(result).toBe('12');
      });
    });

    it('setBreakpoint - error', () => {
      var call = dbgpSocket.setBreakpoint('/test.php', 42);
      testCallResult(
        'breakpoint_set -i 1 -t line -f /test.php -n 42',
        {
          command: 'breakpoint_set',
          transaction_id: '1',
        },
        '<error code="1" apperr="42"><message>setBreakpoint error</message></error>');
      waitsForPromise({shouldReject: true}, async () => (await call));
    });

    it('removeBreakpoint', () => {
      waitsForPromise(async () => {
        var call = dbgpSocket.removeBreakpoint('42');
        testCallResult(
          'breakpoint_remove -i 1 -d 42',
          {
            command: 'breakpoint_remove',
            transaction_id: '1',
          });
        var result = await call;
        expect(result).toBe(undefined);
      });
    });

    it('removeBreakpoint - error', () => {
      var call = dbgpSocket.removeBreakpoint('42');
      testCallResult(
        'breakpoint_remove -i 1 -d 42',
        {
          command: 'breakpoint_remove',
          transaction_id: '1',
        },
        '<error code="1" apperr="42"><message>removeBreakpoint error</message></error>');
      waitsForPromise({shouldReject: true}, async () => (await call));
    });
});
