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

var _events = _interopRequireDefault(require("events"));

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
  constructor(connection, client) {
    this._status = 'CONNECTED';
    this._connection = connection;
    this._client = client;
    this._emitter = new _events.default();

    this._connection.on('end', () => {
      if (this._status === 'CONNECTED') {
        this._status = 'LOST_CONNECTION';

        this._emitter.emit('lost_connection');
      }
    });
  }

  getClient() {
    switch (this._status) {
      case 'CONNECTED':
        return this._client;

      case 'CLOSED_MANUALLY':
        throw new Error('Cannot get a closed client');

      case 'LOST_CONNECTION':
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

    this._emitter.removeAllListeners();
  }

  onConnectionEnd(handler) {
    const cb = () => {
      if (this._status === 'CLOSED_MANUALLY') {
        handler();
      }
    };

    this._connection.on('end', cb);

    return {
      unsubscribe: () => {
        this._connection.removeListener('end', cb);
      }
    };
  }

  onUnexpectedConnectionEnd(handler) {
    this._emitter.on('lost_connection', handler);

    return {
      unsubscribe: () => {
        this._emitter.removeListener('lost_connection', handler);
      }
    };
  }

}

exports.ThriftClientClass = ThriftClientClass;

async function createThriftClient(serviceConfig, port) {
  const connection = _thrift().default.createConnection('localhost', port, {
    transport: (0, _configUtils().getTransport)(serviceConfig),
    protocol: (0, _configUtils().getProtocol)(serviceConfig)
  });

  const client = _thrift().default.createClient(serviceConfig.thriftService, connection);

  return new ThriftClientClass(connection, client);
}