/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {ThriftServiceConfig, ThriftClient, Subscription} from './types';

import thrift from 'thrift';
import {getTransport, getProtocol} from './config-utils';

export class ThriftClientClass {
  _status: 'CONNECTED' | 'CLOSED_MANUALLY' | 'CLOSED_BY_CONNECTION';
  _client: Object;
  _clientId: string;
  _connection: Object;

  constructor(clientId: string, connection: Object, client: Object) {
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

  getClient<T>(): T {
    switch (this._status) {
      case 'CONNECTED':
        return (this._client: any);
      case 'CLOSED_MANUALLY':
        throw new Error('Cannot get a closed client');
      case 'CLOSED_BY_CONNECTION':
        throw new Error('Cannot get a client because connection ended');
      default:
        (this._status: empty);
        throw new Error('exaustive');
    }
  }

  close(): void {
    if (this._status === 'CONNECTED') {
      this._status = 'CLOSED_MANUALLY';
      this._connection.end();
    }
  }

  onConnectionEnd(handler: (clientId: string) => void): Subscription {
    // need to send back clientId so the caller knows which client this is
    const cb = () => {
      handler(this._clientId);
    };
    this._connection.on('end', cb);
    return {
      unsubscribe: () => {
        this._connection.removeListener('end', cb);
      },
    };
  }
}

export async function createThriftClient(
  clientId: string,
  serviceConfig: ThriftServiceConfig,
  port: number,
): Promise<ThriftClient> {
  const connection = thrift.createConnection('localhost', port, {
    transport: getTransport(serviceConfig),
    protocol: getProtocol(serviceConfig),
  });
  const client = thrift.createClient(serviceConfig.thriftService, connection);
  return new ThriftClientClass(clientId, connection, client);
}
