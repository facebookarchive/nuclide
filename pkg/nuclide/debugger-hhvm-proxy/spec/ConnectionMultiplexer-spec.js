'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {uncachedRequire, clearRequireCache} = require('nuclide-test-helpers');

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
} = require('../lib/DbgpSocket');

describe('debugger-hhvm-proxy ConnectionMultiplexer', () => {
  var socket;
  var connectionCount;
  var connections;
  var connectionSpys;
  var onAttach;
  var onClose;
  var onStatus;
  var haveStatusThrow;

  var config = {
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

    socket = jasmine.createSpyObj('socket', ['on']);
    connector = jasmine.createSpyObj('connector', [
        'listen',
        'onAttach',
        'onClose',
        'dispose',
      ]);
    connector.onAttach = jasmine.createSpy('onAttach').andCallFake(callback => { onAttach = callback; });
    connector.onClose = jasmine.createSpy('onClose').andCallFake(callback => { onClose = callback; });
    DbgpConnector = spyOn(require('../lib/DbgpConnector'), 'DbgpConnector').andReturn(connector);

    connectionSpys = [];
    connections = [];
    function createConnectionSpy() {
      var result = {};
      var connection = jasmine.createSpyObj('connection' + connectionCount, [
          'onStatus',
          'evaluateOnCallFrame',
          'getProperties',
          'getScopesForFrame',
          'setBreakpoint',
          'removeBreakpoint',
          'getStackFrames',
          'getStatus',
          'sendContinuationCommand',
          'sendBreakCommand',
          'dispose',
        ]);
      var id = connectionCount;
      connection.getId = () => id;

      if (haveStatusThrow) {
        connection.getStatus = jasmine.createSpy('getStatus').andCallFake(() => {
          throw new Error('Failed to get status.');
        });
      } else {
        connection.getStatus = jasmine.createSpy('getStatus').andReturn(STATUS_STARTING);
      }

      var statusDispose = jasmine.createSpy('connection.onStatus.dispose' + connectionCount);
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

    Connection = spyOn(require('../lib/Connection'), 'Connection').andCallFake(() => {
      return createConnectionSpy();
    });

    breakpointStore = jasmine.createSpyObj('breakpointStore', [
      'addConnection',
      'removeConnection',
      'setBreakpoint',
      'setPauseOnExceptions',
      'removeBreakpoint',
    ]);
    BreakpointStore = spyOn(require('../lib/BreakpointStore'), 'BreakpointStore').andReturn(breakpointStore);

    var {ConnectionMultiplexer} =
      uncachedRequire(require, '../lib/ConnectionMultiplexer');
    connectionMultiplexer = new ConnectionMultiplexer(config);
    connectionMultiplexer.onStatus(onStatus);
  });

  afterEach(() => {
    unspy(require('../lib/DbgpConnector'), 'DbgpConnector');
    unspy(require('../lib/Connection'), 'Connection');
    unspy(require('../lib/BreakpointStore'), 'BreakpointStore');
    clearRequireCache(require, '../lib/ConnectionMultiplexer');
  });

  function expectListen() {
    expect(DbgpConnector).toHaveBeenCalledWith(config);
    expect(connector.onAttach).toHaveBeenCalledWith(onAttach);
    expect(connector.onClose).toHaveBeenCalledWith(onClose);
    expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
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
    await onAttach(socket);
    expect(connectionCount).toBe(1);

    expect(connector.dispose).not.toHaveBeenCalledWith();
    expect(Connection).toHaveBeenCalledWith(socket);
    expect(breakpointStore.addConnection).toHaveBeenCalledWith(connections[0]);
    expect(connections[0].onStatus).toHaveBeenCalledWith(connectionSpys[0].onStatus);
    expect(connections[0].getStatus).toHaveBeenCalledWith();
    expect(connections[0].sendContinuationCommand).toHaveBeenCalledWith(COMMAND_RUN);
    expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
  }
  it('attach', () => {
    waitsForPromise(doAttach);
  });

  var enabledIndex = 0;
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
      await onAttach(socket);
      expect(connectionCount).toBe(1);

      expect(connector.dispose).not.toHaveBeenCalledWith();
      expect(Connection).toHaveBeenCalledWith(socket);
      expect(breakpointStore.addConnection).toHaveBeenCalledWith(connections[0]);
      expect(connections[0].onStatus).toHaveBeenCalledWith(connectionSpys[0].onStatus);
      expect(connections[0].getStatus).toHaveBeenCalledWith();
      expect(connections[0].sendContinuationCommand).not.toHaveBeenCalledWith(COMMAND_RUN);
      expect(connectionMultiplexer.getStatus()).toBe(STATUS_RUNNING);
    });
  });

  // These test cases test the state machine for mulitple connections.
  // The name indicates the start state and the transition being tested.
  // The state is encoded in 3 booleans:
  //   enabled: is there an enabled connection
  //   break: are there any disabled connections in break status
  //   running: are there any connections in running status
  //
  async function gotoTFF(): Promise {
    await doAttach();
    sendConnectionStatus(0, STATUS_BREAK);

    expectEnabled(0);
  }
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
    await onAttach(socket);
    expect(connectionCount).toBe(2);
    expect(connectionSpys[1]).not.toBe(undefined);
    await onAttach(socket);
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

    onClose();

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
});
