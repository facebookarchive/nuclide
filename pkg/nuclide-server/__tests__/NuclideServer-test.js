'use strict';

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _NuclideServer;

function _load_NuclideServer() {
  return _NuclideServer = _interopRequireDefault(require('../lib/NuclideServer'));
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _servicesConfig;

function _load_servicesConfig() {
  return _servicesConfig = _interopRequireDefault(require('../lib/servicesConfig'));
}

var _ReliableSocket;

function _load_ReliableSocket() {
  return _ReliableSocket = require('../../../modules/big-dig/src/socket/ReliableSocket');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

jest.setTimeout(20000);

const HEARTBEAT_CHANNEL = 'test-heartbeat';

let server;
let client;
let socket;

describe('Nuclide Server test suite', () => {
  beforeEach(async () => {
    server = new (_NuclideServer || _load_NuclideServer()).default({ port: 8178 }, (_servicesConfig || _load_servicesConfig()).default);
    await server.connect();
    socket = new (_ReliableSocket || _load_ReliableSocket()).ReliableSocket('http://localhost:8178', HEARTBEAT_CHANNEL, null);
    client = (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createRemote(socket, [(0, (_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).getRemoteNuclideUriMarshalers)('localhost')], (_servicesConfig || _load_servicesConfig()).default);
  });

  afterEach(() => {
    server.close();
    client.dispose();
  });

  // This test does not clean up after itself properly
  // and leaves open connections
  it.skip('websocket is connected with the server', async () => {
    const websocket = new (_ws || _load_ws()).default('ws://localhost:8178');
    let opened = false;
    websocket.once('open', () => {
      opened = true;
    });
    await (0, (_waits_for || _load_waits_for()).default)(() => opened);
    websocket.close();
  });

  describe.skip('reconnect websocket flow', () => {
    it('server sent messages, while disconnected will still be delievered', async () => {
      // Here is the initial message.
      const reliableSocket = socket;
      const messageHandler = jest.fn();
      const reconnectHandler = jest.fn();
      reliableSocket.onReconnect(reconnectHandler);
      reliableSocket.onMessage().subscribe(messageHandler);
      // The maximum reconnect time is 5 seconds - advance clock to sip the reconnect time.
      reliableSocket.onDisconnect(() => process.nextTick(() => advanceClock(6000)));

      await (() => reliableSocket.waitForConnect())();

      const message1 = JSON.stringify({ foo1: 'bar1' });
      const message2 = JSON.stringify({ foo2: 'bar2' });
      const message3 = JSON.stringify({ foo3: 'bar3' });
      const message4 = JSON.stringify({ foo4: 'bar4' });

      // Wait for the connection to exist on the server.
      await (0, (_waits_for || _load_waits_for()).default)(() => server._clients.size === 1);

      let serverSocketClient = null;
      const clientId = Array.from(server._clients.keys())[0];
      serverSocketClient = server._clients.get(clientId);

      if (!(serverSocketClient != null)) {
        throw new Error('Invariant violation: "serverSocketClient != null"');
      }

      expect(serverSocketClient.getTransport().id).toBe(clientId);

      serverSocketClient.getTransport().send(message1);

      await (0, (_waits_for || _load_waits_for()).default)(() => messageHandler.mock.calls.length === 1);
      // Close the client socket and start a reconnect trial, send a message in between.
      // A server socket close will trigger a client disconnect and a scheduled reconnect.
      // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
      if (serverSocketClient != null && serverSocketClient.socket != null) {
        // $FlowIgnore: This test has bitrotted
        serverSocketClient.socket.close();
        serverSocketClient.getTransport().send(message2);
        // The default WebSocket's close timeout is 30 seconds.
        advanceClock(31 * 1000);
        serverSocketClient.getTransport().send(message3);
      }

      await (0, (_waits_for || _load_waits_for()).default)(() => reconnectHandler.mock.calls.length === 1);
      if (serverSocketClient != null) {
        serverSocketClient.getTransport().send(message4);
      }

      await (0, (_waits_for || _load_waits_for()).default)(() => messageHandler.mock.calls.length === 4);
      // Received on the first stable websocket connection.
      expect(messageHandler.mock.calls[0][0]).toEqual(message1);
      // Cached in the queue when disconnected.
      expect(messageHandler.mock.calls[1][0]).toEqual(message2);
      // Cached in the queue when disconnected.
      expect(messageHandler.mock.calls[2][0]).toEqual(message3);
      // Received on the reconnected stable websocket connection.
      expect(messageHandler.mock.calls[3][0]).toEqual(message4);
    });
  });
});