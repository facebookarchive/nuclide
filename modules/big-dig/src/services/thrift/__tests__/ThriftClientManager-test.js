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

import type {ThriftServiceConfig, Subscription} from '../types';
import type {Transport} from '../../../server/BigDigServer';

import {Observable, Subject} from 'rxjs';
import {getMock} from '../../../../../../jest/jest_mock_utils';
import {describe, expect, it, jest} from 'nuclide-jest/globals';
import {TunnelManager} from '../../tunnel/TunnelManager';
import {ThriftClientManager} from '../ThriftClientManager';
import thrift from 'thrift';
import * as portHelper from '../../../common/ports';
import RemoteFileSystemService from '../../fs/gen-nodejs/RemoteFileSystemService';
import {encodeMessage, decodeMessage} from '../util';
import EventEmitter from 'events';
import {ThriftClientClass} from '../createThriftClient';

jest.mock(require.resolve('../createThriftClient'));
jest.mock(require.resolve('../../tunnel/TunnelManager'), () => {
  class MockTunnelManager {
    createTunnel = jest.fn().mockReturnValue({
      getLocalPort: jest.fn().mockReturnValue(1),
      close: jest.fn(),
    });
  }
  return {
    TunnelManager: MockTunnelManager,
  };
});

import {createThriftClient} from '../createThriftClient';

export class MockedThriftClientClass {
  _client: Object;
  _clientId: string;
  _connection: Object;

  constructor(clientId: string, connection: Object, client: Object) {
    this._connection = connection;
    this._client = client;
    this._clientId = clientId;
  }
  getClient<T>(): T {
    return (this._client: any);
  }
  close(): void {
    this._connection.end();
  }

  onConnectionEnd(handler: (clientId: string) => void): Subscription {
    // need to send back clientId so the caller knows which client this is
    const cb = () => {
      handler(this._clientId);
    };
    this._connection.on('end', cb);
    return {
      unsubscribe: () => {},
    };
  }
}

/**
 * create new client process:  create server -> create tunnel -> create client
 */
describe('ThriftClientManager', () => {
  let mockedTransport;
  let mockedTunnelManager;
  let manager;
  let serverMessage;
  let clientMessage;

  const mockedServiceName = 'thrift-rfs';

  beforeEach(() => {
    class MockedTransport {
      onMessage(): Observable<string> {
        // Do not use Observable.of(message) here, which will immediately fire
        // event, use Subject() instead so that we have more controls on it.
        return serverMessage;
      }
      send(message: string): void {
        clientMessage.next(message);
      }
    }

    serverMessage = new Subject();
    clientMessage = new Subject();
    mockedTransport = new MockedTransport();
    mockedTunnelManager = new TunnelManager(new MockedTransport());
    manager = new ThriftClientManager(mockedTransport, mockedTunnelManager);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('(temp test)', async () => {
    expect(true).toBe(true);
  });
});
