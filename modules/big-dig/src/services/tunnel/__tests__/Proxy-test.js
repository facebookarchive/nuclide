"use strict";

function _Proxy() {
  const data = require("../Proxy");

  _Proxy = function () {
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

var _net = _interopRequireDefault(require("net"));

function _Encoder() {
  const data = _interopRequireDefault(require("../Encoder"));

  _Encoder = function () {
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
const TEST_PORT = 4321;
describe('Proxy', () => {
  let testProxy;
  let transport;
  beforeEach(async () => {
    transport = (0, _util().TestTransportFactory)();
    testProxy = await _Proxy().Proxy.createProxy('test-tunnel', TEST_PORT, 5678, false, transport);
  });
  afterEach(() => {
    testProxy.close();
  });
  it('sends a connection message on a connection', async () => {
    const socket = _net.default.createConnection({
      port: TEST_PORT
    }, async () => {
      const message = (await waitsForMessage(transport, 'connection'))[0];
      expect(message.event).toBe('connection');
      socket.end();
    });
  });
  it('sends data when data is written to the socket', async () => {
    const data = 'hello world';

    const socket = _net.default.createConnection({
      port: TEST_PORT
    }, async () => {
      socket.write(data);
      const message = (await waitsForMessage(transport, 'data'))[0];
      expect(message.event).toBe('data');
      const buffer = message.arg;
      expect(buffer.toString()).toBe(data);
    });
  });
  it('sends the end event when the socket is closed', async () => {
    const socket = _net.default.createConnection({
      port: TEST_PORT
    }, async () => {
      socket.end();
      const message = (await waitsForMessage(transport, 'end'))[0];
      expect(message.event).toBe('end');
    });
  });
  it('sends the close event when the socket is closed', async () => {
    const socket = _net.default.createConnection({
      port: TEST_PORT
    }, async () => {
      socket.end();
      const message = (await waitsForMessage(transport, 'close'))[0];
      expect(message.event).toBe('close');
    });
  });
  it('should differentiate destinations by a clientId', async () => {
    _net.default.createConnection({
      port: TEST_PORT
    });

    _net.default.createConnection({
      port: TEST_PORT
    });

    const messages = await waitsForMessage(transport, 'connection', 2);
    expect(messages[0].clientId).not.toEqual(messages[1].clientId);
  });
  it('should only write responses to the appropriate client', async () => {});
  it('should close all the sockets when it is closed', async () => {
    _net.default.createConnection({
      port: TEST_PORT
    });

    _net.default.createConnection({
      port: TEST_PORT
    });

    _net.default.createConnection({
      port: TEST_PORT
    });

    const connectionMessages = await waitsForMessage(transport, 'connection', 3);
    testProxy.close();
    const closeMessages = await waitsForMessage(transport, 'close', 3);
    const connectionIds = connectionMessages.map(message => message.clientId);
    const closeIds = closeMessages.map(message => message.clientId);
    connectionIds.forEach(id => {
      expect(closeIds.includes(id));
    });
  });
});

function waitsForMessage(transport, messageType, numberOfMessages) {
  const count = numberOfMessages != null ? numberOfMessages : 1;
  return new Promise(resolve => {
    const interval = setInterval(() => {
      const messages = transport.send.mock.calls.map(message => _Encoder().default.decode(message)).filter(message => message.event === messageType);

      if (messages.length >= count) {
        clearInterval(interval);
        resolve(messages);
      }
    }, 100);
  });
}