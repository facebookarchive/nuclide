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

declare var jest;

import {TunnelManager} from '../TunnelManager';
import {TestTransportFactory} from './util';

const TEST_PORT_1 = 8091;
const TEST_PORT_2 = 8092;

describe('TunnelManager', () => {
  let tunnelManager;
  let testTransport;

  beforeEach(() => {
    testTransport = TestTransportFactory();
    tunnelManager = new TunnelManager(testTransport);
  });

  it('should allow for multiple tunnels to be created', async () => {
    await tunnelManager.createTunnel(TEST_PORT_1, TEST_PORT_1);
    await tunnelManager.createTunnel(TEST_PORT_2, TEST_PORT_2);

    expect(testTransport.send.mock.calls.length).toBe(2);
    const messages = testTransport.send.mock.calls.map(msg => JSON.parse(msg));
    expect(messages[0].tunnelId).not.toEqual(messages[1].tunnelId);
    tunnelManager.close();
  });

  it('should close all tunnels when closed', async () => {
    await tunnelManager.createTunnel(TEST_PORT_1, TEST_PORT_1);
    await tunnelManager.createTunnel(TEST_PORT_2, TEST_PORT_2);
    tunnelManager.close();

    expect(testTransport.send.mock.calls.length).toBe(4);
    const messages = testTransport.send.mock.calls.map(msg => JSON.parse(msg));
    expect(messages.filter(msg => msg.event === 'proxyClosed').length).toBe(2);
  });

  it('should send a createProxy message when creating a reverse tunnel', async () => {
    await tunnelManager.createReverseTunnel(TEST_PORT_1, TEST_PORT_2);
    expect(testTransport.send.mock.calls.length).toBe(1);
    const messages = testTransport.send.mock.calls.map(msg => JSON.parse(msg));
    expect(messages.filter(msg => msg.event === 'createProxy').length).toBe(1);
  });

  it('should send a closeProxy message when closing a reverse tunnel', async () => {
    const tunnel = await tunnelManager.createReverseTunnel(
      TEST_PORT_1,
      TEST_PORT_2,
    );
    tunnel.close();
    expect(testTransport.send.mock.calls.length).toBe(2);
    const messages = testTransport.send.mock.calls.map(msg => JSON.parse(msg));
    expect(messages.filter(msg => msg.event === 'closeProxy').length).toBe(1);
  });
});
