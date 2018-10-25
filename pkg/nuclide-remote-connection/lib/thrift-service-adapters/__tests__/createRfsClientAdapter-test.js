"use strict";

function _ReliableSocket() {
  const data = require("../../../../../modules/big-dig/src/socket/ReliableSocket");

  _ReliableSocket = function () {
    return data;
  };

  return data;
}

function _ThriftRfsClientAdapter() {
  const data = require("../ThriftRfsClientAdapter");

  _ThriftRfsClientAdapter = function () {
    return data;
  };

  return data;
}

var _events = _interopRequireDefault(require("events"));

function _BigDigClient() {
  const data = require("../../../../../modules/big-dig/src/client/BigDigClient");

  _BigDigClient = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
jest.mock(require.resolve("../../../../../modules/big-dig/src/socket/ReliableSocket"), () => {
  class MockReliableSocket {}

  return {
    ReliableSocket: MockReliableSocket
  };
});
jest.mock(require.resolve("../../../../../modules/big-dig/src/client/BigDigClient"), () => {
  class MockBigDigClient {
    constructor() {
      this.getOrCreateThriftClient = jest.fn().mockReturnValue(Promise.resolve({
        onUnexpectedClientFailure: jest.fn().mockImplementation(cb => {
          mockEventEmitter.on('close', cb);
        }),
        getClient: () => {}
      }));
    }

  }

  return {
    BigDigClient: MockBigDigClient
  };
});
const mockEventEmitter = new _events.default();
describe('createRfsClientAdapter', () => {
  let bigDigClient;
  beforeEach(() => {
    bigDigClient = new (_BigDigClient().BigDigClient)(new (_ReliableSocket().ReliableSocket)('serverUri', 'heartbeatChannel'));
  });
  afterEach(() => {
    mockEventEmitter.removeAllListeners();
    jest.resetAllMocks();
  });
  it('get the same cached adapter for the same input', async () => {
    const adapter1 = await (0, _ThriftRfsClientAdapter().getOrCreateRfsClientAdapter)(bigDigClient);
    const adapter2 = await (0, _ThriftRfsClientAdapter().getOrCreateRfsClientAdapter)(bigDigClient);
    expect(adapter1).toBe(adapter2);
  });
  it('get the different adapters when input changes', async () => {
    const bigDigClient2 = new (_BigDigClient().BigDigClient)(new (_ReliableSocket().ReliableSocket)('serverUri', 'heartbeatChannel'));
    const adapter1 = await (0, _ThriftRfsClientAdapter().getOrCreateRfsClientAdapter)(bigDigClient);
    const adapter2 = await (0, _ThriftRfsClientAdapter().getOrCreateRfsClientAdapter)(bigDigClient2);
    const adapter3 = await (0, _ThriftRfsClientAdapter().getOrCreateRfsClientAdapter)(bigDigClient);
    expect(adapter1).not.toBe(adapter2);
    expect(adapter1).toBe(adapter3);
  });
  it('clear cache for an input, expect a different adapter', async () => {
    const adapter1 = await (0, _ThriftRfsClientAdapter().getOrCreateRfsClientAdapter)(bigDigClient);
    const adapter2 = await (0, _ThriftRfsClientAdapter().getOrCreateRfsClientAdapter)(bigDigClient);
    expect(adapter1).toBe(adapter2);
    mockEventEmitter.emit('close');
    const adapter3 = await (0, _ThriftRfsClientAdapter().getOrCreateRfsClientAdapter)(bigDigClient);
    expect(adapter1).not.toBe(adapter3);
    expect(adapter2).not.toBe(adapter3);
  });
});