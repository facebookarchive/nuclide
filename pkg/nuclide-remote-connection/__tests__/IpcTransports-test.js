'use strict';

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _IpcTransports;

function _load_IpcTransports() {
  return _IpcTransports = require('../lib/IpcTransports');
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('IpcTransports', () => {
  let processStream;
  beforeEach(() => {
    processStream = (0, (_process || _load_process()).fork)('--require', [require.resolve('../../commons-node/load-transpiler'), require.resolve('../__mocks__/ipc_echo_process')], {
      stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'ipc']
    });
  });

  it('is able to communicate with a child process', async () => {
    const transport = new (_IpcTransports || _load_IpcTransports()).IpcClientTransport(processStream);
    const messageSpy = jest.fn();
    transport.onMessage().subscribe(msg => messageSpy(msg));

    expect(!transport.isClosed());
    transport.send('hello');

    await (0, (_waits_for || _load_waits_for()).default)(() => messageSpy.mock.calls.length === 1, 'a reply from the local server', 10000);

    expect(messageSpy).toHaveBeenCalledWith('HELLO');
    transport.send('a'.repeat(99999));

    await (0, (_waits_for || _load_waits_for()).default)(() => messageSpy.mock.calls.length === 2, 'another reply from the local server', 10000);

    expect(messageSpy).toHaveBeenCalledWith('A'.repeat(99999));
    transport.send('exit');

    await (0, (_waits_for || _load_waits_for()).default)(() => transport.isClosed());
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */