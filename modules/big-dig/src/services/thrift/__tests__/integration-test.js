"use strict";

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../../../nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _serverPort() {
  const data = require("../../../../../nuclide-commons/serverPort");

  _serverPort = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _ThriftClientManager() {
  const data = require("../ThriftClientManager");

  _ThriftClientManager = function () {
    return data;
  };

  return data;
}

function _ThriftServerManager() {
  const data = require("../ThriftServerManager");

  _ThriftServerManager = function () {
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

function _AddOne() {
  const data = _interopRequireDefault(require("../__fixtures__/add-one/gen-nodejs/AddOne"));

  _AddOne = function () {
    return data;
  };

  return data;
}

function _uuid() {
  const data = _interopRequireDefault(require("uuid"));

  _uuid = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+nuclide
 * 
 * @format
 */
const ADD_ONE_SERVER_PATH = '{BIG_DIG_SERVICES_PATH}/src/services/thrift/__fixtures__/add-one/AddOneServer.js';
const ADD_ONE_BAD_SERVER_PATH = '{BIG_DIG_SERVICES_PATH}/src/services/thrift/__fixtures__/add-one/AddOneServer.js';
const CONFIG = {
  name: 'add-one',
  remoteUri: '',
  remoteCommand: 'node',
  remoteCommandArgs: [ADD_ONE_SERVER_PATH, '{PORT}'],
  remoteConnection: {
    type: 'tcp',
    port: 0
  },
  thriftTransport: 'buffered',
  thriftProtocol: 'binary',
  thriftService: _AddOne().default,
  killOldThriftServerProcess: true
};
/**
 * Returns a client and server transports connected, which can be used to
 * simulate a BigDig connection.
 */

function createTransport() {
  const clientStream = new _rxjsCompatUmdMin.Subject();
  const serverStream = new _rxjsCompatUmdMin.Subject();
  return {
    client: {
      send(message) {
        serverStream.next(message);
      },

      onMessage() {
        return clientStream;
      }

    },
    server: {
      send(message) {
        clientStream.next(message);
      },

      onMessage() {
        return serverStream;
      }

    }
  };
}
/**
 * Returns a Thrift Client Manager which the client and server lives in the
 * same computer.
 */


function createThriftManager() {
  const tunnelTransport = createTransport();
  const thriftTransport = createTransport(); // eslint-disable-next-line no-unused-vars

  const serverTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.server);
  const clientTunnelManager = new (_TunnelManager().TunnelManager)(tunnelTransport.client); // eslint-disable-next-line no-unused-vars

  const thriftServerManager = new (_ThriftServerManager().ThriftServerManager)(thriftTransport.server);
  const thriftClientManager = new (_ThriftClientManager().ThriftClientManager)(thriftTransport.client, clientTunnelManager);
  return thriftClientManager;
} // Returns PID for the process that has a given magic string in its command line.
//
// NOTE:
// To avoid exposing implementation detail, this test passes a unique value
// in the command arguments to later use it to check if the thrift server is
// running after all clients are closed.


async function getProcessPidByCommandArgument(commandArgument) {
  const processes = await (0, _process().psTree)();
  return processes.filter(p => p.commandWithArgs.includes(commandArgument)).map(p => p.pid)[0];
}

async function isServerRunning(commandArgument) {
  return (await getProcessPidByCommandArgument(commandArgument)) != null;
}

test('creates server in a random ipc socket', async () => {
  const thriftClientManager = createThriftManager();
  const thriftClient = await thriftClientManager.createThriftClient(Object.assign({}, CONFIG, {
    remoteCommandArgs: [ADD_ONE_SERVER_PATH, '{IPC_PATH}'],
    remoteConnection: {
      type: 'ipcSocket',
      path: ''
    }
  }));
  expect((await thriftClient.getClient().calc(1))).toBe(2);
  expect((await thriftClient.getClient().calc(2))).toBe(3);
  thriftClient.close();
});
test('creates server in a specific socket', async () => {
  const ipcSocketPath = _path.default.join((await _fsPromise().default.tempdir()), 'socket');

  const thriftClientManager = createThriftManager();
  const thriftClient = await thriftClientManager.createThriftClient(Object.assign({}, CONFIG, {
    remoteCommandArgs: [ADD_ONE_SERVER_PATH, ipcSocketPath],
    remoteConnection: {
      type: 'ipcSocket',
      path: ipcSocketPath
    }
  }));
  expect((await thriftClient.getClient().calc(1))).toBe(2);
  expect((await thriftClient.getClient().calc(2))).toBe(3);
  thriftClient.close();
});
test('creates server in a random port', async () => {
  const thriftClientManager = createThriftManager();
  const thriftClient = await thriftClientManager.createThriftClient(CONFIG);
  expect((await thriftClient.getClient().calc(1))).toBe(2);
  expect((await thriftClient.getClient().calc(2))).toBe(3);
  thriftClient.close();
});
test('creates server in a specific port', async () => {
  const remotePort = await (0, _serverPort().getAvailableServerPort)();
  const thriftClientManager = createThriftManager();
  const thriftClient = await thriftClientManager.createThriftClient(Object.assign({}, CONFIG, {
    remoteCommandArgs: [ADD_ONE_SERVER_PATH, String(remotePort)],
    remoteConnection: {
      type: 'tcp',
      port: remotePort
    }
  }));
  expect((await thriftClient.getClient().calc(1))).toBe(2);
  thriftClient.close();
});
test('caches server', async () => {
  const remotePort = await (0, _serverPort().getAvailableServerPort)();
  const thriftClientManager = createThriftManager();

  const commandArgument = _uuid().default.v4();

  const config = Object.assign({}, CONFIG, {
    remoteCommandArgs: [ADD_ONE_SERVER_PATH, String(remotePort), commandArgument],
    remoteConnection: {
      type: 'tcp',
      port: remotePort
    }
  });
  const thriftClient1 = await thriftClientManager.createThriftClient(config);
  const thriftClient2 = await thriftClientManager.createThriftClient(config);
  expect(isServerRunning(commandArgument)).toBeTruthy();
  expect((await thriftClient1.getClient().calc(1))).toBe(2);
  thriftClient1.close();
  expect(isServerRunning(commandArgument)).toBeTruthy();
  expect((await thriftClient2.getClient().calc(1))).toBe(2);
  thriftClient2.close();
});
test('kills server process', async () => {
  const commandArgument = _uuid().default.v4();

  const thriftClientManager = createThriftManager();
  const config = Object.assign({}, CONFIG, {
    remoteCommandArgs: [...CONFIG.remoteCommandArgs, commandArgument]
  });
  const thriftClient1 = await thriftClientManager.createThriftClient(config);
  const thriftClient2 = await thriftClientManager.createThriftClient(config); // After closing the first thrift client, the server should continue to run
  // until the second thrift client is closed.

  thriftClient1.close();
  expect((await isServerRunning(commandArgument))).toBeTruthy(); // The server should be running until the second client closes the connection.

  thriftClient2.close();
  await (0, _waits_for().default)(async () => (await isServerRunning(commandArgument)) === false);
});
test('kills old server process', async () => {
  const commandArgument = _uuid().default.v4();

  const remotePort = await (0, _serverPort().getAvailableServerPort)();
  const baseConfig = Object.assign({}, CONFIG, {
    remoteCommandArgs: [ADD_ONE_SERVER_PATH, String(remotePort), commandArgument],
    remoteConnection: {
      type: 'tcp',
      port: remotePort
    }
  });
  const config1 = Object.assign({}, baseConfig, {
    name: 'first-service'
  });
  const thriftClientManager1 = createThriftManager(); // eslint-disable-next-line no-unused-vars

  const thriftClient1 = await thriftClientManager1.createThriftClient(config1);
  const pid1 = await getProcessPidByCommandArgument(commandArgument);
  const config2 = Object.assign({}, baseConfig, {
    // changing the service name will invalidate the last cached server config
    // what will force to kill the old server
    name: 'second-service'
  });
  const thriftClientManager2 = createThriftManager(); // eslint-disable-next-line no-unused-vars

  const thriftClient2 = await thriftClientManager2.createThriftClient(config2);
  const pid2 = await getProcessPidByCommandArgument(commandArgument);
  expect(pid1).not.toBe(pid2);
});
test('throws if remote command is not valid', async () => {
  const thriftClientManager = createThriftManager();
  await expect(thriftClientManager.createThriftClient(Object.assign({}, CONFIG, {
    remoteCommand: '/tmp/invalid-command-that-doesnt-exist'
  }))).rejects.toThrow('Failed to create server');
});
test('throws if remote port is 0 but "{PORT}" is not part of arguments', async () => {
  const thriftClientManager = createThriftManager();
  await expect(thriftClientManager.createThriftClient(Object.assign({}, CONFIG, {
    remoteCommandArgs: [ADD_ONE_SERVER_PATH]
  }))).rejects.toThrow('Failed to create server');
});
test('throws when server failed to be ready', async () => {
  const thriftClientManager = createThriftManager();
  await expect(thriftClientManager.createThriftClient(Object.assign({}, CONFIG, {
    remoteCommandArgs: [ADD_ONE_BAD_SERVER_PATH]
  }))).rejects.toThrow('Failed to create server');
});