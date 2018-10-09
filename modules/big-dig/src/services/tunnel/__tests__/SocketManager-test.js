"use strict";

function _SocketManager() {
  const data = require("../SocketManager");

  _SocketManager = function () {
    return data;
  };

  return data;
}

function _util() {
  const data = require("../__mocks__/util");

  _util = function () {
    return data;
  };

  return data;
}

function _Encoder() {
  const data = _interopRequireDefault(require("../Encoder"));

  _Encoder = function () {
    return data;
  };

  return data;
}

var _net = _interopRequireDefault(require("net"));

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
const TEST_PORT = 5678;
const clientId = 1;
describe('SocketManager', () => {
  let socketManager;
  let transport;
  let listener;
  let dataSpy;
  beforeEach(async () => {
    dataSpy = jest.fn();
    return new Promise(resolve => {
      listener = _net.default.createServer(socket => {
        socket.on('data', data => {
          dataSpy(data, socket.remotePort);
          socket.write(data);
        });
      });
      listener.listen({
        port: TEST_PORT
      }, resolve);
    });
  });
  afterEach(() => {
    listener.close();
    socketManager.close();
  });
  it('should create a connection when requested', async () => {
    const messages = [{
      event: 'connection',
      port: TEST_PORT,
      clientId
    }];
    transport = (0, _util().TestTransportFactory)();
    socketManager = new (_SocketManager().SocketManager)('tunnel1', TEST_PORT, false, transport);
    expect(socketManager).not.toBe(undefined);
    sendMessages(socketManager, messages);
    return new Promise(resolve => {
      listener.on('connection', () => {
        listener.getConnections((err, count) => {
          if (err) {
            throw err;
          }

          expect(count).toBe(1);
          resolve();
        });
      });
    });
  });
  it('should correctly write data when a data message comes through', async () => {
    const messages = [{
      event: 'connection',
      port: TEST_PORT,
      clientId
    }, {
      event: 'data',
      TEST_PORT,
      clientId,
      arg: 'hello world'
    }];
    transport = (0, _util().TestTransportFactory)();
    socketManager = new (_SocketManager().SocketManager)('tunnel1', TEST_PORT, false, transport);
    sendMessages(socketManager, messages);
    await waitsForSpy(dataSpy);
    expect(dataSpy.mock.calls.length).toBeGreaterThan(0);
  });
  it('should correctly handle multiple connections', async () => {
    const messages = [{
      event: 'connection',
      port: TEST_PORT,
      clientId
    }, {
      event: 'connection',
      port: TEST_PORT,
      clientId: clientId + 1
    }, {
      event: 'data',
      TEST_PORT,
      clientId,
      arg: '1st connect'
    }, {
      event: 'data',
      TEST_PORT,
      clientId: clientId + 1,
      arg: '2nd connect'
    }];
    transport = (0, _util().TestTransportFactory)();
    socketManager = new (_SocketManager().SocketManager)('tunnel1', TEST_PORT, false, transport);
    sendMessages(socketManager, messages);
    await waitsForSpy(dataSpy, 2); // XXX: the remote ports should be different, this isn't very
    // self-explanatory here, and it's tied to the spy call above

    expect(dataSpy.mock.calls[0][1]).not.toEqual(dataSpy.mock.calls[1][1]);
  });
  it('should send data back when data is written to the socket', async () => {
    const data = 'hello world';
    const messages = [{
      event: 'connection',
      port: TEST_PORT,
      clientId
    }, {
      event: 'data',
      TEST_PORT,
      clientId,
      arg: data
    }];
    transport = (0, _util().TestTransportFactory)();
    socketManager = new (_SocketManager().SocketManager)('tunnel1', TEST_PORT, false, transport);
    sendMessages(socketManager, messages);
    await waitsForSpy(dataSpy);
    await waitsForSpy(transport.send);

    const decodedMessage = _Encoder().default.decode(transport.send.mock.calls[0].toString());

    expect(decodedMessage.arg.toString()).toEqual(data);
  });
});

function waitsForSpy(spy, numberOfCalls) {
  const count = numberOfCalls != null ? numberOfCalls : 1;
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (spy.mock.calls.length >= count) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

function sendMessages(socketManager, messages) {
  messages.forEach(message => setTimeout(() => socketManager.receive(message), 100));
}