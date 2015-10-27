'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {BusySignalProviderBase} from '../lib/BusySignalProviderBase';

describe('BusySignalProviderBase', () => {
  let providerBase: BusySignalProviderBase = (null: any);
  let messages: Array<BusySignalMessage> = (null: any);

  beforeEach(() => {
    providerBase = new BusySignalProviderBase();
    messages = [];
    providerBase.messages.subscribe(message => messages.push(message));
  });

  it('should record messages before and after a call', () => {
    expect(messages.length).toBe(0);
    providerBase.reportBusy('foo', async () => 5);
    expect(messages.length).toBe(1);
    waitsFor(() => messages.length === 2, 'It should publish a second message', 100);
  });

  it('should throw if the function does not return a promise', () => {
    // We have to cast here because the test case purposely subverts the type system.
    const f = () => providerBase.reportBusy('foo', ((() => 5): any));
    expect(f).toThrow();
    expect(messages.length).toBe(2);
  });

  it("should send the 'done' message even if the promise rejects", () => {
    providerBase.reportBusy('foo', () => Promise.reject());
    expect(messages.length).toBe(1);
    waitsFor(() => messages.length === 2, 'It should publish a second message', 100);
  });
});
