/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import {ReliableSocket} from 'big-dig/src/socket/ReliableSocket';
import {getOrCreateRfsClientAdapter} from '../createRfsClientAdapter';
import EventEmitter from 'events';
import {BigDigClient} from 'big-dig/src/client/BigDigClient';
import {FallbackToRpcError} from '../util';

jest.mock(require.resolve('big-dig/src/socket/ReliableSocket'), () => {
  class MockReliableSocket {}
  return {
    ReliableSocket: MockReliableSocket,
  };
});
jest.mock(require.resolve('big-dig/src/client/BigDigClient'), () => {
  class MockBigDigClient {
    getOrCreateThriftClient = jest.fn().mockReturnValue(
      Promise.resolve({
        onConnectionEnd: jest.fn().mockImplementation(cb => {
          mockEventEmitter.on('end', cb);
        }),
        getClient: () => {},
      }),
    );
  }
  return {
    BigDigClient: MockBigDigClient,
  };
});

const mockEventEmitter = new EventEmitter();

describe('createRfsClientAdapter', () => {
  let bigDigClient;

  beforeEach(() => {
    bigDigClient = new BigDigClient(
      new ReliableSocket('serverUri', 'heartbeatChannel'),
    );
  });

  afterEach(() => {
    mockEventEmitter.removeAllListeners();
    jest.resetAllMocks();
  });

  it('get the same cached adapter for the same input', async () => {
    const adapter1 = await getOrCreateRfsClientAdapter(bigDigClient);
    const adapter2 = await getOrCreateRfsClientAdapter(bigDigClient);
    expect(adapter1).toBe(adapter2);
  });

  it('get the different adapters when input changes', async () => {
    const bigDigClient2 = new BigDigClient(
      new ReliableSocket('serverUri', 'heartbeatChannel'),
    );
    const adapter1 = await getOrCreateRfsClientAdapter(bigDigClient);
    const adapter2 = await getOrCreateRfsClientAdapter(bigDigClient2);
    const adapter3 = await getOrCreateRfsClientAdapter(bigDigClient);
    expect(adapter1).not.toBe(adapter2);
    expect(adapter1).toBe(adapter3);
  });

  it('clear cache for an input, expect a different adapter', async () => {
    const adapter1 = await getOrCreateRfsClientAdapter(bigDigClient);
    const adapter2 = await getOrCreateRfsClientAdapter(bigDigClient);
    expect(adapter1).toBe(adapter2);
    mockEventEmitter.emit('end');
    const adapter3 = await getOrCreateRfsClientAdapter(bigDigClient);
    expect(adapter1).not.toBe(adapter3);
    expect(adapter2).not.toBe(adapter3);
  });
});

// Test cases for adapter methods
describe('ThriftRfsClientAdapter', () => {
  let bigDigClient;

  beforeEach(() => {
    bigDigClient = new BigDigClient(
      new ReliableSocket('serverUri', 'heartbeatChannel'),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('readFile - handle read archive files exception', async () => {
    const testUri1 =
      'nuclide://our.username.sb.facebook.com/data/users/username/fbsource/xplat/nuclide/testfolder/test.zip!/testfile1';
    const testUri2 =
      'nuclide://our.username.sb.facebook.com/data/users/username/fbsource/xplat/nuclide/testfolder/test.zip!dir1/subdir1/file1';

    const adapter = await getOrCreateRfsClientAdapter(bigDigClient);
    await expect(adapter.readFile(testUri1)).rejects.toThrowError(
      FallbackToRpcError,
    );
    await expect(adapter.readFile(testUri2)).rejects.toThrow(
      /Unable to read archive file: [\s\S]+, fallback to use RPC read method/,
    );
  });
});
