"use strict";

function _createThriftClient() {
  const data = require("../createThriftClient");

  _createThriftClient = function () {
    return data;
  };

  return data;
}

function _thrift() {
  const data = _interopRequireDefault(require("thrift"));

  _thrift = function () {
    return data;
  };

  return data;
}

var _events = _interopRequireDefault(require("events"));

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
 * @emails oncall+nuclide
 */
// TODO: Handler unsubscription while connection ended
describe('createThriftClient', () => {
  let mockedClient;
  let mockedConnection;
  let mockServiceConfig;
  let mockPort;
  beforeEach(() => {
    mockServiceConfig = {
      name: 'thrift-mocked',
      remoteUri: '',
      remoteCommand: '',
      remoteCommandArgs: [],
      remotePort: 0,
      thriftTransport: 'buffered',
      thriftProtocol: 'binary',
      thriftService: {},
      killOldThriftServerProcess: true
    };
    mockPort = 9000;
    mockedClient = {};

    class MockedConnection extends _events.default {
      constructor(...args) {
        var _temp;

        return _temp = super(...args), this.end = jest.fn(() => this.emit('close')), _temp;
      }

    }

    mockedConnection = new MockedConnection();
    jest.spyOn(_thrift().default, 'createClient').mockImplementationOnce(() => mockedClient);
    jest.spyOn(_thrift().default, 'createConnection').mockImplementationOnce(() => mockedConnection);
  });
  it('cannot get a closed client', async () => {
    const client = await (0, _createThriftClient().createThriftClient)(mockServiceConfig, mockPort);
    client.close();
    expect(() => client.getClient()).toThrow('Cannot get a closed client');
  });
  it('successfully initialize a client', async () => {
    const client = await (0, _createThriftClient().createThriftClient)(mockServiceConfig, mockPort);
    expect(client.getClient()).toBe(mockedClient);
  });
  it('cannot get a client after connection end', async () => {
    const client = await (0, _createThriftClient().createThriftClient)(mockServiceConfig, mockPort);
    mockedConnection.emit('close');
    expect(() => client.getClient()).toThrow('Cannot get a client because connection is closed');
  });
  it('successfully close a client', async () => {
    const client = await (0, _createThriftClient().createThriftClient)(mockServiceConfig, mockPort);
    client.close();
    client.close();
    expect(mockedConnection.end).toHaveBeenCalledTimes(1);
  });
  it('fire connection end handler while manually close connection', async () => {
    const client = await (0, _createThriftClient().createThriftClient)(mockServiceConfig, mockPort);
    const clientClosedHandler = jest.fn();
    const clientBrokenHandler = jest.fn();
    client.onClientClose(clientClosedHandler);
    client.onUnexpectedClientFailure(clientBrokenHandler);
    client.close();
    client.close();
    expect(clientClosedHandler).toHaveBeenCalledTimes(1);
    expect(clientBrokenHandler).not.toHaveBeenCalled();
  });
  it('fire connection close handler while connection is broken', async () => {
    const client = await (0, _createThriftClient().createThriftClient)(mockServiceConfig, mockPort);
    const clientClosedHandler = jest.fn();
    const clientBrokenHandler = jest.fn();
    client.onClientClose(clientClosedHandler);
    client.onUnexpectedClientFailure(clientBrokenHandler);
    mockedConnection.emit('close');
    expect(clientClosedHandler).not.toHaveBeenCalled();
    expect(clientBrokenHandler).toHaveBeenCalledTimes(1);
  });
  it('handle unsubscription to connection end event', async () => {
    const client = await (0, _createThriftClient().createThriftClient)(mockServiceConfig, mockPort);
    const fn = jest.fn();
    const subscription = client.onClientClose(fn);
    subscription.unsubscribe();
    client.close();
    expect(fn).not.toHaveBeenCalled();
  });
});