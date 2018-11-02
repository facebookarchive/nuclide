"use strict";

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _IpcTransports() {
  const data = require("../lib/IpcTransports");

  _IpcTransports = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
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
describe('IpcTransports', () => {
  let processStream;
  beforeEach(() => {
    processStream = (0, _process().fork)('--require', [require.resolve("../../commons-node/load-transpiler"), require.resolve("../__mocks__/ipc_echo_process")], {
      stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'ipc']
    });
  });
  it('is able to communicate with a child process', async () => {
    const transport = new (_IpcTransports().IpcClientTransport)(processStream);
    const messageSpy = jest.fn();
    transport.onMessage().subscribe(msg => messageSpy(msg));
    expect(!transport.isClosed());
    transport.send('hello');
    await (0, _waits_for().default)(() => messageSpy.mock.calls.length === 1, 'a reply from the local server', 10000);
    expect(messageSpy).toHaveBeenCalledWith('HELLO');
    transport.send('a'.repeat(99999));
    await (0, _waits_for().default)(() => messageSpy.mock.calls.length === 2, 'another reply from the local server', 10000);
    expect(messageSpy).toHaveBeenCalledWith('A'.repeat(99999));
    transport.send('exit');
    await (0, _waits_for().default)(() => transport.isClosed());
  });
});