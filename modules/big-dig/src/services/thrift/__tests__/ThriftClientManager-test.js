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

  it('create thrift client Case 1: failed to start server', async () => {
    clientMessage
      .do(message => {
        serverMessage.next(
          JSON.stringify({
            id: JSON.parse(message).id,
            payload: {
              type: 'response',
              success: false, // failed to create server
              error: 'failed to start server',
            },
          }),
        );
      })
      .subscribe();
    await expect(manager.createThriftClient(mockedServiceName)).rejects.toThrow(
      'failed to start server',
    );
  });

  it('create thrift client Case 2: failed to create tunnel', async () => {
    // successfully create remote thrift server
    mockClientServerCommunication(clientMessage, serverMessage);
    // mock failed to create tunnel
    const mockedFailureMessage = 'failed to create tunnel';
    // wow, mocked a mock!
    jest
      .spyOn(mockedTunnelManager, 'createTunnel')
      .mockImplementation(async (...args) => {
        return Promise.reject(new Error(mockedFailureMessage));
      });
    manager = new ThriftClientManager(mockedTransport, mockedTunnelManager);
    await expect(manager.createThriftClient(mockedServiceName)).rejects.toThrow(
      mockedFailureMessage,
    );
  });

  it('create thrift client Case 3: failed to create client', async () => {
    // successfully create remote thrift server
    mockClientServerCommunication(clientMessage, serverMessage);
    // mock failed to create tunnel
    const mockedFailureMessage = 'failed to create thrift client';
    getMock(createThriftClient).mockImplementation(async (...args) => {
      return Promise.reject(new Error(mockedFailureMessage));
    });
    manager = new ThriftClientManager(mockedTransport, mockedTunnelManager);
    await expect(manager.createThriftClient(mockedServiceName)).rejects.toThrow(
      mockedFailureMessage,
    );
  });

  it('successfully start a client', async () => {
    const mockedClient = {onConnectionEnd: () => {}};
    getMock(createThriftClient).mockReturnValue(mockedClient);
    mockClientServerCommunication(clientMessage, serverMessage);
    const client = await manager.createThriftClient(mockedServiceName);
    expect(client).toBe(mockedClient);
  });

  it('reuse existing tunnel', async () => {
    // create the first client -> create new tunnel and new server
    getMock(createThriftClient).mockReturnValue({
      onConnectionEnd: () => {},
    });
    mockClientServerCommunication(clientMessage, serverMessage);
    await manager.createThriftClient(mockedServiceName);

    // create second client
    const callServer = jest.fn();
    clientMessage.subscribe(callServer);
    await manager.createThriftClient(mockedServiceName);
    expect(callServer).not.toHaveBeenCalled();
  });
});

function mockClientServerCommunication(
  clientMessage: Subject<string>,
  serverMessage: Subject<string>,
): void {
  clientMessage
    .do(message => {
      serverMessage.next(
        encodeMessage({
          id: JSON.parse(message).id,
          payload: {
            type: 'response',
            success: true,
            port: '9000',
          },
        }),
      );
    })
    .subscribe();
}
