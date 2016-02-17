'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Socket} from 'net';
import type {ClientCallback as ClientCallbackType} from '../lib/ClientCallback';
import type {DbgpConnector as DbgpConnectorType} from '../lib/DbgpConnector';
import type {Connection as ConnectionType} from '../lib/Connection';
import type {BreakpointStore as BreakpointStoreType} from '../lib/BreakpointStore';
import type {
  ConnectionMultiplexer as ConnectionMultiplexerType,
} from '../lib/ConnectionMultiplexer';
import {uncachedRequire, clearRequireCache} from '../../test-helpers';

import {
  STATUS_STARTING,
  STATUS_RUNNING,
  STATUS_BREAK,
  STATUS_END,
  COMMAND_RUN,
} from '../lib/DbgpSocket';

describe('debugger-hhvm-proxy ConnectionMultiplexer', () => {
  let socket: any;
  let connectionCount = 0;
  let connections: any;
  let connectionSpys: any;
  let onDbgpConnectorAttach: any;
  let onDbgpConnectorClose: any;
  let onDbgpConnectorError: any;
  let BreakpointStore: any;
  let breakpointStore: any;
  let DbgpConnector: any;
  let connector: any;
  let Connection: any;
  let onStatus: any;
  let haveStatusThrow;
  let connectionMultiplexer: any;
  let isCorrectConnectionResult;
  let isDummyConnectionResult;
  let ConnectionUtils: any;
  let clientCallback: any;

  const config = {
    xdebugPort: 9000,
    pid: null,
    idekeyRegex: null,
    scriptRegex: null,
    endDebugWhenNoRequests: false,
  };

  function sendConnectionStatus(connectionIndex, status): void {
    connectionSpys[connectionIndex].onStatus(status);
  }

  beforeEach(() => {
    haveStatusThrow = false;
    connectionCount = 0;
    onStatus = jasmine.createSpy('onStatus');

    socket = ((
      jasmine.createSpyObj('socket', ['on', 'end', 'destroy']): any
    ): Socket);
    connector = ((
      jasmine.createSpyObj('connector', [
        'listen',
        'onAttach',
        'onClose',
        'dispose',
      ]): any
    ): DbgpConnectorType);
    // $FlowFixMe override instance methods.
    connector.onAttach = jasmine.createSpy('onAttach').andCallFake(
      callback => { onDbgpConnectorAttach = callback; }
    );
    // $FlowFixMe override instance methods.
    connector.onClose = jasmine.createSpy('onClose').andCallFake(
      callback => { onDbgpConnectorClose = callback; }
    );
    // $FlowFixMe override instance methods.
    connector.onError = jasmine.createSpy('onError').andCallFake(
      callback => { onDbgpConnectorError = callback; }
    );
    DbgpConnector = ((
      spyOn(require('../lib/DbgpConnector'), 'DbgpConnector').andReturn(connector): any
    ): () => DbgpConnectorType);

    connectionSpys = [];
    connections = [];
    function createConnectionSpy() {
      const result = {};
      const connection = ((
        jasmine.createSpyObj('connection' + connectionCount, [
          'onStatus',
          'runtimeEvaluate',
          'evaluateOnCallFrame',
          'getProperties',
          'getScopesForFrame',
          'setBreakpoint',
          'removeBreakpoint',
          'getStackFrames',
          'getStatus',
          'sendContinuationCommand',
          'sendBreakCommand',
          'sendStdoutRequest',
          'sendStderrRequest',
          'dispose',
        ]): any
      ): ConnectionType);
      const id = connectionCount;
      // $FlowFixMe override instance method.
      connection.getId = () => id;

      if (haveStatusThrow) {
        // $FlowFixMe override instance method.
        connection.getStatus = jasmine.createSpy('getStatus').andCallFake(() => {
          throw new Error('Failed to get status.');
        });
      } else {
        // $FlowFixMe override instance method.
        connection.getStatus = jasmine.createSpy('getStatus').andReturn(STATUS_STARTING);
      }
      // $FlowFixMe override instance method.
      connection.evaluateOnCallFrame = jasmine.createSpy('evaluateOnCallFrame').andReturn({});

      const statusDispose = jasmine.createSpy('connection.onStatus.dispose' + connectionCount);
      // $FlowFixMe override instance method.
      connection.onStatus = jasmine.createSpy('onStatus').andCallFake(callback => {
        result.onStatus = callback;
        return {dispose: statusDispose};
      });

      result.connection = connection;
      result.statusDispose = statusDispose;

      connectionSpys[connectionCount] = result;
      connections[connectionCount] = connection;

      connectionCount++;

      return connection;
    }

    Connection = ((
      spyOn(require('../lib/Connection'), 'Connection').andCallFake(() => {
        return createConnectionSpy();
      }): any
    ): () => ConnectionType);

    breakpointStore = jasmine.createSpyObj('breakpointStore', [
      'addConnection',
      'removeConnection',
      'setBreakpoint',
      'setPauseOnExceptions',
      'removeBreakpoint',
    ]);
    BreakpointStore = ((
      spyOn(require('../lib/BreakpointStore'), 'BreakpointStore')
        .andReturn(breakpointStore): any
    ): () => BreakpointStoreType);

    isCorrectConnectionResult = true;
    const isCorrectConnection = spyOn(require('../lib/ConnectionUtils'), 'isCorrectConnection')
      .andCallFake(() => isCorrectConnectionResult);
    isDummyConnectionResult = false;
    const isDummyConnection = spyOn(require('../lib/ConnectionUtils'), 'isDummyConnection')
      .andCallFake(() => isDummyConnectionResult);
    const sendDummyRequest = spyOn(require('../lib/ConnectionUtils'), 'sendDummyRequest');
    const failConnection = spyOn(require('../lib/ConnectionUtils'), 'failConnection');
    ConnectionUtils = {
      isCorrectConnection,
      isDummyConnection,
      sendDummyRequest,
      failConnection,
    };

    clientCallback = ((
      jasmine.createSpyObj('clientCallback', [
        'sendUserMessage',
      ]): any
    ): ClientCallbackType);

    const {ConnectionMultiplexer} = ((
      uncachedRequire(require, '../lib/ConnectionMultiplexer'): any
    ): {ConnectionMultiplexer: () => ConnectionMultiplexerType});
    connectionMultiplexer = new ConnectionMultiplexer(config, clientCallback);
    connectionMultiplexer.onStatus(onStatus);
  });

  afterEach(() => {
    config.idekeyRegex = null;
    config.scriptRegex = null;
    unspy(require('../lib/ConnectionUtils'), 'sendDummyRequest');
    unspy(require('../lib/ConnectionUtils'), 'isDummyConnection');
    unspy(require('../lib/ConnectionUtils'), 'isCorrectConnection');
    unspy(require('../lib/ConnectionUtils'), 'failConnection');
    unspy(require('../lib/DbgpConnector'), 'DbgpConnector');
    unspy(require('../lib/Connection'), 'Connection');
    unspy(require('../lib/BreakpointStore'), 'BreakpointStore');
    clearRequireCache(require, '../lib/ConnectionMultiplexer');
  });

  function expectListen() {
    expect(DbgpConnector).toHaveBeenCalledWith(config);
    expect(connector.onAttach).toHaveBeenCalledWith(onDbgpConnectorAttach);
    expect(connector.onClose).toHaveBeenCalledWith(onDbgpConnectorClose);
    expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
    expect(ConnectionUtils.sendDummyRequest).toHaveBeenCalled();
  }

  function expectDetached(connectionIndex): void {
    expect(connectionSpys[connectionIndex].statusDispose).toHaveBeenCalledWith();
  }

  it('constructor', () => {
    expect(BreakpointStore).toHaveBeenCalledWith();
    expect(connectionMultiplexer.getStatus()).toBe(STATUS_STARTING);
  });

  it('listen', () => {
    connectionMultiplexer.listen();
    expectListen();
  });

  async function doAttach(): Promise {
    connectionMultiplexer.listen();
    expectListen();

    expect(connectionCount).toBe(0);
    await onDbgpConnectorAttach({
      socket,
      message: 'normal connection',
    });
    expect(connectionCount).toBe(1);

    expect(connector.dispose).not.toHaveBeenCalledWith();
    expect(Connection.calls[0].args[0]).toEqual(socket);
    expect(breakpointStore.addConnection).toHaveBeenCalledWith(connections[0]);
    expect(connections[0].onStatus).toHaveBeenCalledWith(connectionSpys[0].onStatus);
    expect(connections[0].getStatus).toHaveBeenCalledWith();
    expect(connections[0].sendContinuationCommand).toHaveBeenCalledWith(COMMAND_RUN);
    expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
  }
  it('attach', () => {
    waitsForPromise(doAttach);
  });

  let enabledIndex = 0;
  function expectEnabled(connectionIndex): void {
    expect(connectionMultiplexer.getStatus()).toBe(STATUS_BREAK);
    connectionMultiplexer.getProperties(enabledIndex);
    expect(connections[connectionIndex].getProperties).toHaveBeenCalledWith(enabledIndex);
    enabledIndex++;
  }

  async function doEnable(): Promise {
    await doAttach();

    sendConnectionStatus(0, STATUS_BREAK);

    expect(onStatus).toHaveBeenCalledWith(STATUS_BREAK);
    expectEnabled(0);
  }

  it('enable', () => {
    waitsForPromise(async () => {
      await doEnable();
    });
  });

  it('enable to run', () => {
    waitsForPromise(async () => {
      await doEnable();
      sendConnectionStatus(0, STATUS_RUNNING);

      expect(onStatus).toHaveBeenCalledWith(STATUS_RUNNING);
      expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
    });
  });

  it('attach - fail to get status', () => {
    waitsForPromise(async () => {
      connectionMultiplexer.listen();
      expectListen();

      haveStatusThrow = true;
      expect(connectionCount).toBe(0);
      await onDbgpConnectorAttach({
        socket,
        message: 'normal connection',
      });
      expect(connectionCount).toBe(1);

      expect(connector.dispose).not.toHaveBeenCalledWith();
      expect(Connection.calls[0].args[0]).toEqual(socket);
      expect(breakpointStore.addConnection).toHaveBeenCalledWith(connections[0]);
      expect(connections[0].onStatus).toHaveBeenCalledWith(connectionSpys[0].onStatus);
      expect(connections[0].getStatus).toHaveBeenCalledWith();
      expect(connections[0].sendContinuationCommand).not.toHaveBeenCalledWith(COMMAND_RUN);
      expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
    });
  });

  it('attach - filter connection', () => {
    waitsForPromise(async () => {
      connectionMultiplexer.listen();
      expectListen();

      expect(connectionCount).toBe(0);
      expect(ConnectionUtils.failConnection).not.toHaveBeenCalled();
      await onDbgpConnectorAttach({
        socket,
        message: 'passed connection',
      });
      expect(connectionCount).toBe(1);
      expect(ConnectionUtils.failConnection).not.toHaveBeenCalled();

      // Test rejected connection.
      isCorrectConnectionResult = false;
      await onDbgpConnectorAttach({
        socket,
        message: 'rejected connection',
      });
      expect(connectionCount).toBe(1);
      expect(ConnectionUtils.failConnection).toHaveBeenCalled();
    });
  });

  it('attach - dummy connection', () => {
    waitsForPromise(async () => {
      isDummyConnectionResult = true;

      connectionMultiplexer.listen();
      expectListen();

      expect(connectionCount).toBe(0);
      expect(connectionMultiplexer.getDummyConnection()).toBeNull();
      await onDbgpConnectorAttach({
        socket,
        message: 'dummy connection',
      });
      expect(connectionCount).toBe(1);
      expect(connectionMultiplexer.getDummyConnection()).not.toBeNull();
    });
  });

  // These test cases test the state machine for mulitple connections.
  // The name indicates the start state and the transition being tested.
  // The state is encoded in 3 booleans:
  //   enabled: is there an enabled connection
  //   break: are there any disabled connections in break status
  //   running: are there any connections in running status
  //
  it('TFF: Break-Enabled', () => {
    waitsForPromise(async () => {
      await doAttach();

      sendConnectionStatus(0, STATUS_BREAK);

      expectEnabled(0);
    });
  });
  it('TFF: Running-Enabled', () => {
    waitsForPromise(async () => {
      await doAttach();

      sendConnectionStatus(0, STATUS_RUNNING);

      expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
    });
  });
  it('TFF: Detach-Enabled', () => {
    waitsForPromise(async () => {
      await doAttach();

      sendConnectionStatus(0, STATUS_END);

      expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
      expectDetached(0);
    });
  });
  async function gotoFFT(): Promise {
    await doAttach();
    expect(connectionSpys[0]).not.toBe(undefined);
    await onDbgpConnectorAttach({
      socket,
      message: 'normal connection',
    });
    expect(connectionCount).toBe(2);
    expect(connectionSpys[1]).not.toBe(undefined);
    await onDbgpConnectorAttach({
      socket,
      message: 'normal connection',
    });
    expect(connectionCount).toBe(3);
    expect(connectionSpys[2]).not.toBe(undefined);
    expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
  }
  it('FFT: Break-Running', () => {
    waitsForPromise(async () => {
      await gotoFFT();

      sendConnectionStatus(2, STATUS_BREAK);

      expectEnabled(2);
    });
  });
  it('FFT: Run-Running', () => {
    waitsForPromise(async () => {
      await gotoFFT();

      sendConnectionStatus(1, STATUS_RUNNING);

      expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
    });
  });
  it('FFT: Detach-Running', () => {
    waitsForPromise(async () => {
      await gotoFFT();

      sendConnectionStatus(1, STATUS_END);

      expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
      expectDetached(1);
    });
  });
  async function gotoTFT(): Promise {
    await gotoFFT();
    sendConnectionStatus(2, STATUS_BREAK);

    expectEnabled(2);
  }
  it('TFT: Run-Enabled', () => {
    waitsForPromise(async () => {
      await gotoTFT();

      sendConnectionStatus(2, STATUS_RUNNING);

      expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
    });
  });
  it('TFT: Break-Running', () => {
    waitsForPromise(async () => {
      await gotoTFT();

      sendConnectionStatus(0, STATUS_BREAK);

      expectEnabled(2);
    });
  });
  it('TFT: Break-Enabled', () => {
    waitsForPromise(async () => {
      await gotoTFT();

      sendConnectionStatus(2, STATUS_BREAK);

      expectEnabled(2);
    });
  });
  it('TFT: Run-Running', () => {
    waitsForPromise(async () => {
      await gotoTFT();

      sendConnectionStatus(1, STATUS_RUNNING);

      expectEnabled(2);
    });
  });
  it('TFT: Detach-Running', () => {
    waitsForPromise(async () => {
      await gotoTFT();

      sendConnectionStatus(0, STATUS_END);

      expectEnabled(2);
      expectDetached(0);
    });
  });
  it('TFT: Detach-Enabled', () => {
    waitsForPromise(async () => {
      await gotoTFT();

      sendConnectionStatus(2, STATUS_END);

      expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
      expectDetached(2);
    });
  });
  async function gotoTTT(): Promise {
    await gotoFFT();
    sendConnectionStatus(0, STATUS_BREAK);
    sendConnectionStatus(2, STATUS_BREAK);

    expectEnabled(0);
  }
  it('TTT: Break-Break', () => {
    waitsForPromise(async () => {
      await gotoTTT();

      sendConnectionStatus(2, STATUS_BREAK);

      expectEnabled(0);
    });
  });
  it('TTT: Break-Enabled', () => {
    waitsForPromise(async () => {
      await gotoTTT();

      sendConnectionStatus(0, STATUS_BREAK);

      expectEnabled(0);
    });
  });
  it('TTT: Break-Running', () => {
    waitsForPromise(async () => {
      await gotoTTT();

      sendConnectionStatus(1, STATUS_BREAK);

      expectEnabled(0);
    });
  });
  it('TTT: Run-Break', () => {
    waitsForPromise(async () => {
      await gotoTTT();

      sendConnectionStatus(2, STATUS_RUNNING);

      expectEnabled(0);
    });
  });
  it('TTT: Run-Enabled', () => {
    waitsForPromise(async () => {
      await gotoTTT();

      sendConnectionStatus(0, STATUS_RUNNING);

      expectEnabled(2);
    });
  });
  it('TTT: Run-Running', () => {
    waitsForPromise(async () => {
      await gotoTTT();

      sendConnectionStatus(1, STATUS_RUNNING);

      expectEnabled(0);
    });
  });
  it('TTT: Detach-Running', () => {
    waitsForPromise(async () => {
      await gotoTTT();

      sendConnectionStatus(1, STATUS_END);

      expectEnabled(0);
      expectDetached(1);
    });
  });
  it('TTT: Detach-Break', () => {
    waitsForPromise(async () => {
      await gotoTTT();

      sendConnectionStatus(2, STATUS_END);

      expectEnabled(0);
      expectDetached(2);
    });
  });
  it('TTT: Detach-Enabled', () => {
    waitsForPromise(async () => {
      await gotoTTT();

      sendConnectionStatus(0, STATUS_END);

      expectEnabled(2);
      expectDetached(0);
    });
  });
  async function gotoTTF(): Promise {
    await gotoFFT();
    sendConnectionStatus(1, STATUS_BREAK);
    sendConnectionStatus(0, STATUS_BREAK);
    sendConnectionStatus(2, STATUS_BREAK);

    expectEnabled(1);
  }
  it('TTF: Break-Break', () => {
    waitsForPromise(async () => {
      await gotoTTF();

      sendConnectionStatus(0, STATUS_BREAK);

      expectEnabled(1);
    });
  });
  it('TTF: Break-Enabled', () => {
    waitsForPromise(async () => {
      await gotoTTF();

      sendConnectionStatus(1, STATUS_BREAK);

      expectEnabled(1);
    });
  });
  it('TTF: Run-Break', () => {
    waitsForPromise(async () => {
      await gotoTTF();

      sendConnectionStatus(2, STATUS_RUNNING);

      expectEnabled(1);
    });
  });
  it('TTF: Run-Enabled', () => {
    waitsForPromise(async () => {
      await gotoTTF();

      sendConnectionStatus(1, STATUS_RUNNING);

      expectEnabled(0);
    });
  });
  it('TTF: Detach-Enabled', () => {
    waitsForPromise(async () => {
      await gotoTTF();

      sendConnectionStatus(1, STATUS_END);

      expectEnabled(0);
      expectDetached(1);
    });
  });
  it('TTF: Detach-Break', () => {
    waitsForPromise(async () => {
      await gotoTTF();

      sendConnectionStatus(2, STATUS_END);

      expectEnabled(1);
      expectDetached(2);
    });
  });

  it('runtimeEvaluate', () => {
    waitsForPromise(async () => {
      await doEnable();

      // Jasmine toThrow() does not support calling async function using await
      // so manually checking exception instead.
      let exceptionThrown = false;
      const expression = 'runtime expression';
      try {
        await connectionMultiplexer.runtimeEvaluate(expression);
      } catch (e) {
        exceptionThrown = true;
      }
      expect(exceptionThrown).toBe(true);


      isDummyConnectionResult = true;
      await onDbgpConnectorAttach({
        socket,
        message: 'dummy connection',
      });

      const dummyConnection = connectionMultiplexer.getDummyConnection();
      expect(dummyConnection).not.toBeNull();

      await connectionMultiplexer.runtimeEvaluate(expression);
      expect(dummyConnection.evaluateOnCallFrame).toHaveBeenCalledWith(0, expression);
    });
  });

  it('evaluateOnCallFrame', () => {
    waitsForPromise(async () => {
      await doEnable();

      connectionMultiplexer.evaluateOnCallFrame(42, 'hello');
      expect(connections[0].evaluateOnCallFrame).toHaveBeenCalledWith(42, 'hello');
    });
  });

  it('getProperties', () => {
    waitsForPromise(async () => {
      await doEnable();

      connectionMultiplexer.getProperties('remoteId');
      expect(connections[0].getProperties).toHaveBeenCalledWith('remoteId');
    });
  });

  it('getScopesForFrame', () => {
    waitsForPromise(async () => {
      await doEnable();

      connectionMultiplexer.getScopesForFrame(42);
      expect(connections[0].getScopesForFrame).toHaveBeenCalledWith(42);
    });
  });

  it('getStackFrames', () => {
    waitsForPromise(async () => {
      await doEnable();

      connectionMultiplexer.getStackFrames();
      expect(connections[0].getStackFrames).toHaveBeenCalledWith();
    });
  });

  it('sendContinuationCommand', () => {
    waitsForPromise(async () => {
      await doEnable();

      connectionMultiplexer.sendContinuationCommand('step_into');
      expect(connections[0].sendContinuationCommand).toHaveBeenCalledWith('step_into');
    });
  });

  it('sendBreakCommand', () => {
    waitsForPromise(async () => {
      await doEnable();

      connectionMultiplexer.sendBreakCommand();
      expect(connections[0].sendBreakCommand).toHaveBeenCalledWith();
    });
  });

  it('onClose', () => {
    connectionMultiplexer.listen();

    onDbgpConnectorClose();

    expect(connector.dispose).toHaveBeenCalledWith();
  });

  it('setPauseOnExceptions', () => {
    connectionMultiplexer.setPauseOnExceptions('all');
    expect(breakpointStore.setPauseOnExceptions).toHaveBeenCalledWith('all');
  });

  it('setBreakpoint', () => {
    connectionMultiplexer.setBreakpoint('filename', 42);
    expect(breakpointStore.setBreakpoint).toHaveBeenCalledWith('filename', 42);
  });

  it('removeBreakpoint', () => {
    connectionMultiplexer.removeBreakpoint('breakpointId');
    expect(breakpointStore.removeBreakpoint).toHaveBeenCalledWith('breakpointId');
  });

  it('endDebugWhenNoRequests - true', () => {
    waitsForPromise(async () => {
      config.endDebugWhenNoRequests = true;
      await doEnable();
      sendConnectionStatus(0, STATUS_END);
      expect(onStatus).toHaveBeenCalledWith(STATUS_END);
    });
  });

  it('endDebugWhenNoRequests - false', () => {
    waitsForPromise(async () => {
      config.endDebugWhenNoRequests = false;
      await doEnable();
      sendConnectionStatus(0, STATUS_END);
      expect(onStatus).not.toHaveBeenCalledWith(STATUS_END);
    });
  });

  it('onConnectionError', () => {
    waitsForPromise(async () => {
      connectionMultiplexer.listen();

      const errorMessage = 'error message';
      onDbgpConnectorError(errorMessage);

      expect(clientCallback.sendUserMessage).toHaveBeenCalledWith('notification', {
        type: 'error',
        message: errorMessage,
      });
    });
  });
});
