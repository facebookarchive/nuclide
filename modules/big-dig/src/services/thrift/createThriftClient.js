"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createThriftClient = createThriftClient;
exports.ThriftClientClass = void 0;

function _thrift() {
  const data = _interopRequireDefault(require("thrift"));

  _thrift = function () {
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
class ThriftClientClass {
  constructor(clientId, connection, client) {
    this._status = 'CONNECTED';
    this._connection = connection;
    this._client = client;
    this._clientId = clientId;

    this._connection.on('end', () => {
      if (this._status === 'CONNECTED') {
        this._status = 'CLOSED_BY_CONNECTION';
      }
    });
  }

  getClient() {
    switch (this._status) {
      case 'CONNECTED':
        return this._client;

      case 'CLOSED_MANUALLY':
        throw new Error('Cannot get a closed client');

      case 'CLOSED_BY_CONNECTION':
        throw new Error('Cannot get a client because connection ended');

      default:
        this._status;
        throw new Error('exaustive');
    }
  }

  close() {
    if (this._status === 'CONNECTED') {
      this._status = 'CLOSED_MANUALLY';

      this._connection.end();
    }
  }

  onConnectionEnd(handler) {
    // need to send back clientId so the caller knows which client this is
    const cb = () => {
      handler(this._clientId);
    };

    this._connection.on('end', cb);

    return {
      unsubscribe: () => {
        this._connection.removeListener('end', cb);
      }
    };
  }

}

exports.ThriftClientClass = ThriftClientClass;

async function createThriftClient(clientId, serviceConfig, port) {
  const connection = _thrift().default.createConnection('localhost', port, {
    transport: (0, _configUtils().getTransport)(serviceConfig),
    protocol: (0, _configUtils().getProtocol)(serviceConfig)
  });

  const client = _thrift().default.createClient(serviceConfig.thriftService, connection);

  return new ThriftClientClass(clientId, connection, client);
}