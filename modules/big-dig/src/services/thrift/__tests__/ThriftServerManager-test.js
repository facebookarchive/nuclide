/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {describe, expect, it, jest} from 'nuclide-jest/globals';

jest.mock(require.resolve('../createThriftServer'));

import type {ThriftServerConfig, ThriftMessage} from '../types';
import type {Transport} from '../../../server/BigDigServer';

import EventEmitter from 'events';
import {Observable, Subject} from 'rxjs';
import {getMock} from '../../../../../../jest/jest_mock_utils';
import {RemoteFileSystemServer} from '../../fs/fsServer';
import {ThriftServerManager} from '../ThriftServerManager';
import {createThriftServer} from '../createThriftServer';
import thrift from 'thrift';
import * as portHelper from '../../../common/ports';

describe('ThriftServerManager', () => {
  let mockedTransport;
  let manager;
  let serverMessage;
  let clientMessage;

  const mockPort = 9000;
  const serverConfig: ThriftServerConfig = {
    name: 'thrift-rfs',
    remoteCommand: '',
    remoteCommandArgs: [],
    remotePort: mockPort,
    killOldThriftServerProcess: true,
  };
  const startServerMessage = {
    id: '1',
    payload: {
      type: 'request',
      command: 'start-server',
      serverConfig,
    },
  };
  let mockCloseServerFn;
  let mockGetPortFn;

  beforeEach(() => {
    class MockedTransport {
      onMessage(): Observable<string> {
        // Do not use Observable.of(message) here, which will immediately fire
        // event, use Subject() instead so that we have more controls on it.
        return clientMessage;
      }
      send(message: string): void {
        serverMessage.next(message);
      }
    }

    mockCloseServerFn = jest.fn();
    mockGetPortFn = jest.fn().mockReturnValue(mockPort);
    getMock(createThriftServer).mockImplementation(() => {
      return {
        getPort: mockGetPortFn,
        close: mockCloseServerFn,
      };
    });

    serverMessage = new Subject();
    clientMessage = new Subject();
    mockedTransport = new MockedTransport();
    manager = new ThriftServerManager(mockedTransport);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('successfully start server', async () => {
    const responseMessage = {
      id: '1',
      payload: {
        type: 'response',
        success: true,
        port: String(mockPort),
      },
    };
    const responsePromise = serverMessage.take(1).toPromise();
    clientMessage.next(convertMessage(startServerMessage));
    const response = JSON.parse(await responsePromise);
    expect(response).toEqual(responseMessage);
  });

  it('responses fail for malformatted message', async () => {
    const malformattedMessage = {
      id: '1',
    };
    const responseMessage = {
      id: '1',
      payload: {
        type: 'response',
        success: false,
        error: 'Malformatted request message!',
      },
    };
    const responsePromise = serverMessage.take(1).toPromise();
    clientMessage.next(JSON.stringify(malformattedMessage));
    const response = JSON.parse(await responsePromise);
    expect(response).toEqual(responseMessage);
  });

  it('responses fail for malformatted message payload', async () => {
    const malformattedMessage = {
      id: '1',
      payload: {type: 'request'},
    };
    const responseMessage = {
      id: '1',
      payload: {
        type: 'response',
        success: false,
        error: 'Malformatted request message!',
      },
    };
    const responsePromise = serverMessage.take(1).toPromise();
    clientMessage.next(JSON.stringify(malformattedMessage));
    const response = JSON.parse(await responsePromise);
    expect(response).toEqual(responseMessage);
  });

  it('responses fail when server failed to start', async () => {
    const responseMessage = {
      id: '1',
      payload: {
        type: 'response',
        success: false,
        error: 'Failed to create server',
      },
    };
    getMock(createThriftServer).mockImplementation(() => {
      throw new Error('mocked error');
    });
    const responsePromise = serverMessage.take(1).toPromise();
    clientMessage.next(convertMessage(startServerMessage));
    const response = JSON.parse(await responsePromise);
    expect(response).toEqual(responseMessage);
  });

  it('successfully close server', async () => {
    const closeServerMessage = {
      id: '2',
      payload: {
        type: 'request',
        command: 'stop-server',
        serverConfig,
      },
    };
    const responseMessage = {
      id: '2',
      payload: {
        type: 'response',
        success: true,
      },
    };

    const firstResponsePromise = serverMessage.take(1).toPromise();
    clientMessage.next(convertMessage(startServerMessage));
    await firstResponsePromise;
    const secondResponsePromise = serverMessage.take(1).toPromise();
    clientMessage.next(convertMessage(closeServerMessage));
    const response = JSON.parse(await secondResponsePromise);
    expect(response).toEqual(responseMessage);
    expect(mockCloseServerFn).toHaveBeenCalled();
  });
});

function convertMessage(message: ThriftMessage): string {
  return JSON.stringify(message);
}
