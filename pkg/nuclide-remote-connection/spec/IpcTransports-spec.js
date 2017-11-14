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

import {fork} from 'nuclide-commons/process';
import {IpcClientTransport} from '../lib/IpcTransports';

describe('IpcTransports', () => {
  let processStream;
  beforeEach(() => {
    processStream = fork(
      '--require',
      [
        require.resolve('../../commons-node/load-transpiler'),
        require.resolve('./ipc_echo_process'),
      ],
      {silent: true},
    );
  });

  it('is able to communicate with a child process', () => {
    const transport = new IpcClientTransport(processStream);
    const messageSpy = jasmine.createSpy('onMessage');
    transport.onMessage().subscribe(msg => messageSpy(msg));

    runs(() => {
      expect(!transport.isClosed());
      transport.send('hello');
    });

    waitsFor(
      () => messageSpy.callCount === 1,
      'a reply from the local server',
      10000,
    );

    runs(() => {
      expect(messageSpy).toHaveBeenCalledWith('HELLO');
      transport.send('a'.repeat(99999));
    });

    waitsFor(
      () => messageSpy.callCount === 2,
      'another reply from the local server',
      10000,
    );

    runs(() => {
      expect(messageSpy).toHaveBeenCalledWith('A'.repeat(99999));
      transport.send('exit');
    });

    waitsFor(() => transport.isClosed());
  });
});
