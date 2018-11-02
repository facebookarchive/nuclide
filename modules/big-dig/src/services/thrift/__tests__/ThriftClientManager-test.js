"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MockedThriftClientClass = void 0;

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _jest_mock_utils() {
  const data = require("../../../../../../jest/jest_mock_utils");

  _jest_mock_utils = function () {
    return data;
  };

  return data;
}

function _TunnelManager() {
  const data = require("../../tunnel/TunnelManager");

  _TunnelManager = function () {
    return data;
  };

  return data;
}

function _ThriftClientManager() {
  const data = require("../ThriftClientManager");

  _ThriftClientManager = function () {
    return data;
  };

  return data;
}

function _thrift() {
  const data = _interopRequireDefault(require("thrift"));

  _thrift = function () {
    return data;
  };

  return data;
}

function _util() {
  const data = require("../util");

  _util = function () {
    return data;
  };

  return data;
}

var _events = _interopRequireDefault(require("events"));

function _waits_for() {
  const data = _interopRequireDefault(require("../../../../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _createThriftClient() {
  const data = require("../createThriftClient");

  _createThriftClient = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
jest.mock(require.resolve("../createThriftClient"));
jest.mock(require.resolve("../../tunnel/TunnelManager"), () => {
  class MockTunnelManager {
    constructor() {
      this.createTunnel = jest.fn().mockReturnValue({
        getConfig: jest.fn().mockReturnValue({
          local: {
            port: 1
          }
        }),
        close: jest.fn()
      });
    }

  }

  return {
    TunnelManager: MockTunnelManager
  };
});

class MockedThriftClientClass {
  constructor(clientId, connection, client) {
    this._connection = connection;
    this._client = client;
    this._clientId = clientId;
  }

  getClient() {
    return this._client;
  }

  close() {
    this._connection.end();
  }

  onClientClose(handler) {
    this._connection.on('end', handler);

    return {
      unsubscribe: () => {}
    };
  }

  onUnexpectedClientFailure(handler) {
    this._connection.on('lost_connection', handler);

    return {
      unsubscribe: () => {}
    };
  }

}
/**
 * create new client process:  create server -> create tunnel -> create client
 */


exports.MockedThriftClientClass = MockedThriftClientClass;
describe('ThriftClientManager', () => {
  let mockedTransport;
  let mockedTunnelManager;
  let manager;
  let serverMessage;
  let clientMessage;
  const mockedServiceConfig = {
    name: 'thrift-rfs',
    remoteUri: '',
    remoteCommand: '',
    remoteCommandArgs: [],
    remoteConnection: {
      type: 'tcp',
      port: 0
    },
    thriftTransport: 'buffered',
    thriftProtocol: 'binary',
    thriftService: {},
    killOldThriftServerProcess: true
  };
  beforeEach(() => {
    class MockedTransport {
      onMessage() {
        // Do not use Observable.of(message) here, which will immediately fire
        // event, use Subject() instead so that we have more controls on it.
        return serverMessage;
      }

      send(message) {
        clientMessage.next(message);
      }

    }

    serverMessage = new _rxjsCompatUmdMin.Subject();
    clientMessage = new _rxjsCompatUmdMin.Subject();
    mockedTransport = new MockedTransport();
    mockedTunnelManager = new (_TunnelManager().TunnelManager)(new MockedTransport());
    manager = new (_ThriftClientManager().ThriftClientManager)(mockedTransport, mockedTunnelManager);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('create thrift client Case 1: failed to start server', async () => {
    clientMessage.do(message => {
      serverMessage.next(JSON.stringify({
        id: (0, _util().decodeMessage)(message).id,
        payload: {
          type: 'response',
          success: false,
          // failed to create server
          error: 'failed to start server'
        }
      }));
    }).subscribe();
    await expect(manager.createThriftClient(mockedServiceConfig)).rejects.toThrow('failed to start server');
  });
  it('create thrift client Case 2: failed to create tunnel', async () => {
    // successfully create remote thrift server
    mockClientServerCommunication(clientMessage, serverMessage); // mock failed to create tunnel

    const mockedFailureMessage = 'failed to create tunnel'; // wow, mocked a mock!

    jest.spyOn(mockedTunnelManager, 'createTunnel').mockImplementation(async (...args) => {
      return Promise.reject(new Error(mockedFailureMessage));
    });
    manager = new (_ThriftClientManager().ThriftClientManager)(mockedTransport, mockedTunnelManager);
    await expect(manager.createThriftClient(mockedServiceConfig)).rejects.toThrow(mockedFailureMessage);
  });
  it('create thrift client Case 3: failed to create client', async () => {
    // successfully create remote thrift server
    mockClientServerCommunication(clientMessage, serverMessage); // mock failed to create tunnel

    const mockedFailureMessage = 'failed to create thrift client';
    (0, _jest_mock_utils().getMock)(_createThriftClient().createThriftClient).mockImplementation((...args) => {
      throw new Error(mockedFailureMessage);
    });
    manager = new (_ThriftClientManager().ThriftClientManager)(mockedTransport, mockedTunnelManager);
    await expect(manager.createThriftClient(mockedServiceConfig)).rejects.toThrow(mockedFailureMessage);
  });
  it('invoke remote method request timeout', async () => {
    // delay mocked server message, longer than timeout limit
    const TIME_INTERVAL = 20000; // make ThriftClientManager _invokeRemoteMethod timeout really short

    (0, _ThriftClientManager().setTimeoutLimit)(10);
    clientMessage.do(message => {
      setTimeout(() => {
        serverMessage.next((0, _util().encodeMessage)({
          id: JSON.parse(message).id,
          payload: {
            type: 'response',
            success: true,
            port: '9000'
          }
        }));
      }, TIME_INTERVAL);
    }).subscribe();
    await expect(manager.createThriftClient(mockedServiceConfig)).rejects.toThrow(/Service:[\s\S]+command:[\s\S]+timeout/);
  });
  it('successfully start a client', async () => {
    const mockedClient = {
      onClientClose: () => {},
      onUnexpectedClientFailure: () => {}
    };
    (0, _jest_mock_utils().getMock)(_createThriftClient().createThriftClient).mockReturnValue(mockedClient);
    mockClientServerCommunication(clientMessage, serverMessage);
    const client = await manager.createThriftClient(mockedServiceConfig);
    expect(client).toBe(mockedClient);
  });
  it('reuse existing tunnel', async () => {
    // create the first client -> create new tunnel and new server
    (0, _jest_mock_utils().getMock)(_createThriftClient().createThriftClient).mockReturnValue({
      onClientClose: () => {},
      onUnexpectedClientFailure: () => {}
    });
    mockClientServerCommunication(clientMessage, serverMessage);
    await manager.createThriftClient(mockedServiceConfig); // create second client

    const callServer = jest.fn();
    clientMessage.subscribe(callServer);
    await manager.createThriftClient(mockedServiceConfig);
    expect(callServer).not.toHaveBeenCalled();
  });
  it('stop server used by multiple clients', async () => {
    class MockedConnection extends _events.default {
      end() {
        this.emit('end');
      }

    }

    const mockedConnection1 = new MockedConnection();
    const mockedConnection2 = new MockedConnection();
    jest.spyOn(_thrift().default, 'createClient').mockImplementationOnce(() => {}).mockImplementationOnce(() => {});
    jest.spyOn(_thrift().default, 'createConnection').mockImplementationOnce(() => mockedConnection1).mockImplementationOnce(() => mockedConnection2);
    mockClientServerCommunication(clientMessage, serverMessage); // mock createThriftClient

    (0, _jest_mock_utils().getMock)(_createThriftClient().createThriftClient).mockImplementation((clientId, serviceConfig, port) => {
      const mockedConnection = _thrift().default.createConnection();

      const mockedClient = _thrift().default.createClient();

      return new MockedThriftClientClass(clientId, mockedConnection, mockedClient);
    }); // monitor calls to server

    const callServer = jest.fn();
    clientMessage.subscribe(callServer); // 1. create the first client

    const client1 = await manager.createThriftClient(mockedServiceConfig);
    expect(callServer).toHaveBeenCalledTimes(1); // 2. create the second client, since we reuse tunnel and server, so still called once

    const client2 = await manager.createThriftClient(mockedServiceConfig);
    expect(callServer).toHaveBeenCalledTimes(1); // 3.stop client2, only reduce tunnel refCount, not yet need to stop server

    client2.close();
    expect(callServer).toHaveBeenCalledTimes(1); // 4. stop client1, tunnel refCount reduce to 0, need to stop server this time

    client1.close();
    expect(callServer).toHaveBeenCalledTimes(2);
  }); // test plan: create two clients of the same service, one client of another service
  // when close() called, we should only need to close send two 'stop-server' messages

  it('close ThriftClientManager instance', async () => {
    class MockedConnection extends _events.default {
      end() {
        this.emit('end');
      }

    }

    const mockedConnection1 = new MockedConnection();
    const mockedConnection2 = new MockedConnection();
    const mockedConnection3 = new MockedConnection();
    jest.spyOn(_thrift().default, 'createClient').mockImplementationOnce(() => {}).mockImplementationOnce(() => {}).mockImplementationOnce(() => {});
    jest.spyOn(_thrift().default, 'createConnection').mockImplementationOnce(() => mockedConnection1).mockImplementationOnce(() => mockedConnection2).mockImplementationOnce(() => mockedConnection3);
    mockClientServerCommunication(clientMessage, serverMessage); // mock createThriftClient

    (0, _jest_mock_utils().getMock)(_createThriftClient().createThriftClient).mockImplementation((clientId, serviceConfig, port) => {
      const mockedConnection = _thrift().default.createConnection();

      const mockedClient = _thrift().default.createClient();

      return new MockedThriftClientClass(clientId, mockedConnection, mockedClient);
    });
    const anotherServiceConfig = {
      name: 'mock-service',
      remoteUri: '',
      remoteCommand: '',
      remoteCommandArgs: [],
      remoteConnection: {
        type: 'tcp',
        port: 0
      },
      thriftTransport: 'buffered',
      thriftProtocol: 'binary',
      thriftService: {},
      killOldThriftServerProcess: true
    }; // monitor calls to server

    const callServer = jest.fn();
    clientMessage.subscribe(callServer); // create three clients

    await manager.createThriftClient(mockedServiceConfig);
    await manager.createThriftClient(mockedServiceConfig);
    expect(callServer).toHaveBeenCalledTimes(1);
    await manager.createThriftClient(anotherServiceConfig);
    expect(callServer).toHaveBeenCalledTimes(2); // close ThriftClientManager, close all tunnels and clients

    await manager.close();
    await (0, _waits_for().default)(() => callServer.mock.calls.length >= 4);
    expect(callServer).toHaveBeenCalledTimes(4);
  });
});

function mockClientServerCommunication(clientMessage, serverMessage) {
  clientMessage.do(message => {
    serverMessage.next((0, _util().encodeMessage)({
      id: (0, _util().decodeMessage)(message).id,
      payload: {
        type: 'response',
        success: true,
        port: '9000'
      }
    }));
  }).subscribe();
}