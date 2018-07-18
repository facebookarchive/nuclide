"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThriftClientManager = void 0;

function _serverPort() {
  const data = require("../../../../nuclide-commons/serverPort");

  _serverPort = function () {
    return data;
  };

  return data;
}

function _RemoteFileSystemService() {
  const data = _interopRequireDefault(require("../fs/gen-nodejs/RemoteFileSystemService"));

  _RemoteFileSystemService = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _Tunnel() {
  const data = require("../tunnel/Tunnel");

  _Tunnel = function () {
    return data;
  };

  return data;
}

function _TunnelManager() {
  const data = require("../tunnel/TunnelManager");

  _TunnelManager = function () {
    return data;
  };

  return data;
}

var _events = _interopRequireDefault(require("events"));

function _createThriftClient() {
  const data = require("./createThriftClient");

  _createThriftClient = function () {
    return data;
  };

  return data;
}

function _util() {
  const data = require("./util");

  _util = function () {
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
 */

/**
 * This class manages the creation and disposal of thrift clients.
 * `ThriftClientManager` instances will be created and managed by BigDigClient
 */
class ThriftClientManager {
  // The following attributes are used to managing multiple Thrift service client
  constructor(transport, tunnelManager) {
    this._transport = transport;
    this._tunnelManager = tunnelManager;
    this._logger = (0, _log4js().getLogger)('bigdig-thrift-client-manager');
    this._messageId = 0;
    this._clientIndex = 0;
    this._isClosed = false;
    this._emitter = new _events.default();
    this._availableServices = new Set();
    this._clientMap = new Map();
    this._nameToTunnel = new Map();
    this._nameToServiceConfig = new Map(); // Register all available thrift services

    this._registerThriftServices();

    const observable = this._transport.onMessage();

    observable.subscribe({
      // TODO(terryltang): Temporarily use json format for readability, later
      // consider to use the new tunnel/Encoder to encode/decode message
      next: value => {
        const response = (0, _util().decodeMessage)(value);

        this._emitter.emit(response.id, response);
      },

      error(err) {
        // eslint-disable-next-line no-console
        this._logger.error('Error received in big-dig thrift client manager!', err);
      },

      complete() {
        // eslint-disable-next-line no-console
        this._logger.error('big-dig thrift client manager transport subscription completed');
      }

    });
  }
  /**
   * Register all available Thrift services and do initializaiton
   *
   * TODO(terryltang): (T30983466) later we should create a Thrift service
   * config file list available thrift service name and install path. And we
   * will have a thrift service loader to fetch all thrift client factory
   * functions and pass the factory functions to here. Probably also need to
   * pass more information from each thrift service to here, which will be used
   * by in `_startRemoteThrfitServer` will resovle these in later diffs
   */


  _registerThriftServices() {
    const serviceName = 'thrift-rfs'; // Register available service name, set factory function and initializaiton

    this._availableServices.add(serviceName);

    const serviceConfig = {
      name: serviceName,
      remoteUri: '',
      remoteCommand: '',
      remoteCommandArgs: [],
      remotePort: 0,
      thriftTransport: 'buffered',
      thriftProtocol: 'binary',
      thriftService: _RemoteFileSystemService().default,
      killOldThriftServerProcess: true
    };

    this._nameToServiceConfig.set(serviceName, serviceConfig);
  }

  addThriftService(serviceConfig) {
    this._availableServices.add(serviceConfig.name);

    this._nameToServiceConfig.set(serviceConfig.name, serviceConfig);
  }

  _getServiceConfig(serviceName) {
    const config = this._nameToServiceConfig.get(serviceName);

    if (!(config != null)) {
      throw new Error("Invariant violation: \"config != null\"");
    }

    return config;
  }
  /**
   * each client will increase tunnel and server's refCount by 1, so here
   * reduce refCount by 1 while closing client
   */


  async _handleClientCloseEvent(clientId) {
    const serviceName = clientId.split('\0')[0]; // 1. Reduce tunnel refCount by 1 [and close tunnel]

    const tunnelCacheEntry = this._nameToTunnel.get(serviceName);

    if (!(tunnelCacheEntry != null)) {
      throw new Error("Invariant violation: \"tunnelCacheEntry != null\"");
    }

    const {
      tunnel,
      refCount
    } = tunnelCacheEntry;

    this._clientMap.delete(clientId); // When handling the last ref, also close the tunnel (actually it will just
    // reduce refCount by 1 on the Tunnel side) and also delete the map entry
    // for the serviceName:  <serviceName, TunnelCacheEntry>


    if (refCount === 1) {
      this._nameToTunnel.delete(serviceName);

      tunnel.close(); // to close tunnel also means to reduce remote server refCount by 1

      await this._closeRemoteServer(serviceName);
    } else {
      this._nameToTunnel.set(serviceName, {
        tunnel,
        refCount: refCount - 1
      });
    }
  }
  /**
   * Before, the method name was `getOrCreateThriftClient`, we then decided to
   * return a new Thrift client every single time, but they will reuse tunnel
   * and Thrift server if possible. Each module will maintain its own singleton
   * of Thrift client to increase the separation of the Thrift clients
   * (potentially reliability) yet reduce resource consumption through reusing
   *  tunnel and Thrift server.
   */


  async createThriftClient(serviceName) {
    if (!!this._isClosed) {
      throw new Error('big-dig thrift client manager close!');
    }

    if (!this._availableServices.has(serviceName)) {
      throw new Error(`No available thrift service for ${serviceName}`);
    }

    const serviceConfig = this._getServiceConfig(serviceName);

    const serverConfig = (0, _util().convertToServerConfig)(serviceConfig);

    const tunnelCacheEntry = this._nameToTunnel.get(serviceName);

    let tunnel = null;

    if (tunnelCacheEntry != null) {
      this._logger.info(`Tunnel and remote server already exist for ${serviceName}!`);

      const {
        refCount
      } = tunnelCacheEntry;
      tunnel = tunnelCacheEntry.tunnel;

      this._nameToTunnel.set(serviceName, {
        tunnel,
        refCount: refCount + 1
      });
    } else {
      // Step 1: launch remote thrift server, get remote port number
      const remotePort = await this._createRemoteServer(serverConfig); // Step 2: Then create/get a new big-dig tunnel

      tunnel = await this._createTunnel(serviceName, remotePort);
    }

    const clientId = `${serviceConfig.name}\0${this._clientIndex++}`;
    const client = await (0, _createThriftClient().createThriftClient)(serviceConfig, tunnel.getLocalPort()); // need to do clean up work for both cases: closing a client and client lost connection

    client.onConnectionEnd(() => {
      this._handleClientCloseEvent(clientId);
    });
    client.onUnexpectedConnectionEnd(() => {
      this._handleClientCloseEvent(clientId);
    });

    this._clientMap.set(clientId, client);

    return client;
  }

  _sendMessage(message) {
    this._transport.send((0, _util().encodeMessage)(message));
  }
  /**
   * Expect result from remote methods. Here return type `any` can be downcasted
   * to other expected data types in callers
   */


  async _invokeRemoteMethod(command, serverConfig) {
    const id = (this._messageId++).toString(16);
    const response = new Promise((resolve, reject) => {
      function onResponse(message) {
        if (message.payload.success) {
          resolve(message.payload.port);
        } else {
          reject(new Error(message.payload.error));
        }
      }

      this._emitter.once(id, onResponse); // Still need to consider: this._emitter.removeListener(id, onResponse)

    });
    const message = {
      id,
      payload: {
        type: 'request',
        command,
        serverConfig
      }
    };

    this._sendMessage(message);

    return response;
  }

  _createRemoteServer(serverConfig) {
    return this._invokeRemoteMethod('start-server', serverConfig);
  }

  _closeRemoteServer(serviceName) {
    const serverConfig = this._getServiceConfig(serviceName);

    return this._invokeRemoteMethod('stop-server', serverConfig);
  }

  async _createTunnel(serviceName, remotePort, useIPv4 = false) {
    const tunnelCacheEntry = this._nameToTunnel.get(serviceName);

    if (tunnelCacheEntry != null) {
      this._logger.info(`Tunnel already exists for ${serviceName}!`);

      const {
        tunnel,
        refCount
      } = tunnelCacheEntry;

      this._nameToTunnel.set(serviceName, {
        tunnel,
        refCount: refCount + 1
      });

      return tunnel;
    } // Otherise, if there is no available tunnel for the service, we need to
    // find an available localPort and let big-dig tunnel manager to create a
    // new tunnel for the service


    const localPort = await (0, _serverPort().getAvailableServerPort)(); // may need to try multiple times incease the following method throw error
    // if there is already

    const tunnel = await this._tunnelManager.createTunnel(localPort, remotePort, useIPv4);

    this._nameToTunnel.set(serviceName, {
      tunnel,
      refCount: 1
    });

    return tunnel;
  }

  close() {
    if (this._isClosed) {
      return;
    }

    this._logger.info('Close Big-Dig thrift client manager!'); // close all clients


    for (const client of this._clientMap.values()) {
      client.close();
    } // Close all tunnels, closing each tunnel means to reduce its corresponding
    // remote server refCount by 1


    for (const [serviceName, tunnelCacheEntry] of this._nameToTunnel.entries()) {
      const {
        tunnel
      } = tunnelCacheEntry;

      this._closeRemoteServer(serviceName);

      tunnel.close();
    }

    this._clientMap.clear();

    this._nameToTunnel.clear();

    this._availableServices.clear();

    this._emitter.removeAllListeners();

    this._isClosed = true;
  }

}

exports.ThriftClientManager = ThriftClientManager;