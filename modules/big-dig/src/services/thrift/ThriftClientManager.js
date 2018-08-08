"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setTimeoutLimit = setTimeoutLimit;
exports.ThriftClientManager = void 0;

function _serverPort() {
  const data = require("../../../../nuclide-commons/serverPort");

  _serverPort = function () {
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

function _configUtils() {
  const data = require("./config-utils");

  _configUtils = function () {
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
// waiting for server response timeout
let remoteCallTimeLimit = 15000; // create and export for speeding up testing

function setTimeoutLimit(time) {
  remoteCallTimeLimit = time;
}
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
    this._clientByClientId = new Map();
    this._tunnelByServiceConfigId = new Map();

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
   * Returns a new thrift client.
   *
   * NOTE: Two clients with the same service config can share the same tunnel
   * to the remote server.
   */


  async createThriftClient(serviceConfig) {
    if (!!this._isClosed) {
      throw new Error('big-dig thrift client manager close!');
    }

    const tunnel = await this._getOrCreateTunnel(serviceConfig);
    const clientId = `${serviceConfig.name}\0${this._clientIndex++}`;
    const client = await (0, _createThriftClient().createThriftClient)(serviceConfig, tunnel.getLocalPort());

    const clientDispose = () => {
      this._clientByClientId.delete(clientId);

      this._closeTunnel(serviceConfig);
    };

    client.onClientClose(clientDispose);
    client.onUnexpectedClientFailure(clientDispose);

    this._clientByClientId.set(clientId, client);

    return client;
  }
  /**
   * Expect result from remote methods. Here return type `any` can be downcasted
   * to other expected data types in callers
   */


  async _invokeRemoteMethod(command, serverConfig) {
    const id = (this._messageId++).toString(16);
    const response = new Promise((resolve, reject) => {
      let timeoutHandler = setTimeout(() => {
        this._emitter.removeListener(id, onResponse);

        reject(new Error(`Service: ${serverConfig.name} command: ${command} timeout`));
        timeoutHandler = null;
      }, remoteCallTimeLimit);

      function onResponse(message) {
        if (timeoutHandler != null) {
          clearTimeout(timeoutHandler);
        }

        if (message.payload.success) {
          resolve(message.payload.port);
        } else {
          reject(new Error(message.payload.error));
        }
      }

      this._emitter.once(id, onResponse);
    });
    const message = {
      id,
      payload: {
        type: 'request',
        command,
        serverConfig
      }
    };

    this._transport.send((0, _util().encodeMessage)(message));

    return response;
  }

  _createRemoteServer(serverConfig) {
    return this._invokeRemoteMethod('start-server', serverConfig);
  }

  _closeRemoteServer(serverConfig) {
    return this._invokeRemoteMethod('stop-server', serverConfig);
  }

  async _getOrCreateTunnel(serviceConfig) {
    const serviceConfigId = (0, _configUtils().genConfigId)(serviceConfig);

    const tunnelCacheEntry = this._tunnelByServiceConfigId.get(serviceConfigId);

    let tunnel = null;

    if (tunnelCacheEntry != null) {
      this._logger.info(`Using an existent tunnel for ${serviceConfig.name}`);

      tunnel = tunnelCacheEntry.tunnel;
      tunnelCacheEntry.refCount++;
    } else {
      this._logger.info(`Creating a new tunnel for ${serviceConfig.name}`);

      const serverConfig = (0, _configUtils().convertToServerConfig)(serviceConfig);
      const remotePort = await this._createRemoteServer(serverConfig);
      const localPort = await (0, _serverPort().getAvailableServerPort)();
      const useIPv4 = false;
      tunnel = await this._tunnelManager.createTunnel(localPort, remotePort, useIPv4);

      this._tunnelByServiceConfigId.set(serviceConfigId, {
        tunnel,
        refCount: 1
      });
    }

    return tunnel;
  }

  async _closeTunnel(serviceConfig) {
    const serviceConfigId = (0, _configUtils().genConfigId)(serviceConfig);

    const tunnelCacheEntry = this._tunnelByServiceConfigId.get(serviceConfigId);

    if (tunnelCacheEntry == null) {
      throw new Error(`Expected tunnel to be open: ${serviceConfig.name}`);
    }

    if (tunnelCacheEntry.refCount === 1) {
      this._tunnelByServiceConfigId.delete(serviceConfigId);

      tunnelCacheEntry.tunnel.close();
      await this._closeRemoteServer((0, _configUtils().convertToServerConfig)(serviceConfig));
    } else {
      tunnelCacheEntry.refCount -= 1;
    }
  }

  close() {
    if (this._isClosed) {
      return;
    }

    this._isClosed = true;

    this._logger.info('Close Big-Dig thrift client manager!');

    for (const client of this._clientByClientId.values()) {
      client.close();
    }

    this._emitter.removeAllListeners();
  }

}

exports.ThriftClientManager = ThriftClientManager;