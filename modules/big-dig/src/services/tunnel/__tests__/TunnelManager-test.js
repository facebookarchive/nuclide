'use strict';

var _TunnelManager;

function _load_TunnelManager() {
  return _TunnelManager = require('../TunnelManager');
}

var _util;

function _load_util() {
  return _util = require('../__mocks__/util');
}

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
 */

const TEST_PORT_1 = 8091;
const TEST_PORT_2 = 8092;
const TEST_PORT_3 = 8093;
const TEST_PORT_4 = 8094;

describe('TunnelManager', () => {
  let tunnelManager;
  let testTransport;

  beforeEach(() => {
    testTransport = (0, (_util || _load_util()).TestTransportFactory)();
    tunnelManager = new (_TunnelManager || _load_TunnelManager()).TunnelManager(testTransport);
  });

  afterEach(() => {
    tunnelManager.close();
  });

  it('should allow for multiple tunnels to be created', async () => {
    await tunnelManager.createTunnel(TEST_PORT_1, TEST_PORT_1);
    await tunnelManager.createTunnel(TEST_PORT_2, TEST_PORT_2);

    expect(testTransport.send.mock.calls.length).toBe(2);
    const messages = testTransport.send.mock.calls.map(msg => JSON.parse(msg));
    expect(messages[0].tunnelId).not.toEqual(messages[1].tunnelId);
    tunnelManager.close();
  });

  it('should throw an error if either port is already bound', async () => {
    const tunnel = await tunnelManager.createTunnel(TEST_PORT_1, TEST_PORT_2);
    await expect(tunnelManager.createTunnel(TEST_PORT_1, TEST_PORT_3)).rejects.toThrowErrorMatchingSnapshot();

    await expect(tunnelManager.createTunnel(TEST_PORT_3, TEST_PORT_2)).rejects.toThrowErrorMatchingSnapshot();

    await expect(tunnelManager.createReverseTunnel(TEST_PORT_1, TEST_PORT_2)).rejects.toThrowErrorMatchingSnapshot();

    await expect(tunnelManager.createReverseTunnel(TEST_PORT_1, TEST_PORT_3)).rejects.toThrowErrorMatchingSnapshot();

    tunnel.close();
    tunnelManager.close();
  });

  it('should return an the existing tunnel if it already exists', async () => {
    const tunnelA = await tunnelManager.createTunnel(TEST_PORT_1, TEST_PORT_2);
    const tunnelB = await tunnelManager.createReverseTunnel(TEST_PORT_3, TEST_PORT_4);
    const tunnelC = await tunnelManager.createTunnel(TEST_PORT_1, TEST_PORT_2);
    const tunnelD = await tunnelManager.createReverseTunnel(TEST_PORT_3, TEST_PORT_4);

    expect(tunnelA).toBe(tunnelC);
    expect(tunnelB).toBe(tunnelD);

    tunnelManager.close();
  });

  it('should not close a tunnel until all references are removed', async () => {
    const tunnelA = await tunnelManager.createTunnel(TEST_PORT_1, TEST_PORT_2);
    const tunnelB = await tunnelManager.createReverseTunnel(TEST_PORT_3, TEST_PORT_4);
    const tunnelC = await tunnelManager.createTunnel(TEST_PORT_1, TEST_PORT_2);
    const tunnelD = await tunnelManager.createReverseTunnel(TEST_PORT_3, TEST_PORT_4);

    expect(tunnelManager.tunnels.length).toBe(2);
    tunnelA.close();
    expect(tunnelManager.tunnels.length).toBe(2);
    tunnelC.close();
    expect(tunnelManager.tunnels.length).toBe(1);
    tunnelB.close();
    expect(tunnelManager.tunnels.length).toBe(1);
    tunnelD.close();
    expect(tunnelManager.tunnels.length).toBe(0);
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

  it('should have the correct localPort in the createProxy message when creating a reverse tunnel', async () => {
    const tunnel = await tunnelManager.createReverseTunnel(TEST_PORT_1, TEST_PORT_2);
    expect(testTransport.send.mock.calls.length).toBe(1);
    const messages = testTransport.send.mock.calls.map(msg => JSON.parse(msg)).filter(msg => msg.event === 'createProxy');

    expect(messages.length).toBe(1);
    expect(messages[0].localPort).toBe(TEST_PORT_2);
    tunnel.close();
  });

  it('should send a closeProxy message when closing a reverse tunnel', async () => {
    const tunnel = await tunnelManager.createReverseTunnel(TEST_PORT_1, TEST_PORT_2);
    tunnel.close();
    expect(testTransport.send.mock.calls.length).toBe(2);
    const messages = testTransport.send.mock.calls.map(msg => JSON.parse(msg));
    expect(messages.filter(msg => msg.event === 'closeProxy').length).toBe(1);
    tunnel.close();
  });

  it('should correctly close tunnels when the tunnel manager is closed', async () => {
    await tunnelManager.createTunnel(9872, 9871);
    await tunnelManager.createTunnel(9874, 9873);
    await tunnelManager.createReverseTunnel(9876, 9875);

    expect(tunnelManager.tunnels.length).toBe(3);
    tunnelManager.close();
    expect(tunnelManager.tunnels.length).toBe(0);
  });

  it('should correctly close tunnels and remove them from the tunnel manager', async () => {
    const tunnelA = await tunnelManager.createTunnel(9872, 9871);
    const tunnelB = await tunnelManager.createTunnel(9874, 9873);
    const tunnelC = await tunnelManager.createReverseTunnel(9876, 9875);

    expect(tunnelManager.tunnels.length).toBe(3);
    tunnelA.close();
    expect(tunnelManager.tunnels.length).toBe(2);
    tunnelB.close();
    expect(tunnelManager.tunnels.length).toBe(1);
    tunnelC.close();
    expect(tunnelManager.tunnels.length).toBe(0);
    tunnelManager.close();
  });
});