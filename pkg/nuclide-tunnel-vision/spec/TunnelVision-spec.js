'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {TunnelVision} from '../lib/TunnelVision';

describe('TunnelVision', () => {
  let tunnelVision: TunnelVision = (null: any);
  let provider1: FakeProvider = (null: any);
  let provider2: FakeProvider = (null: any);

  beforeEach(() => {
    tunnelVision = new TunnelVision();
    provider1 = new FakeProvider();
    provider2 = new FakeProvider();

    tunnelVision.consumeTunnelVisionProvider(provider1);
    tunnelVision.consumeTunnelVisionProvider(provider2);
  });

  it('should hide the providers', () => {
    tunnelVision.toggleTunnelVision();
    expect(provider1.isVisible()).toBeFalsy();
    expect(provider2.isVisible()).toBeFalsy();
  });

  it('should show the providers again', () => {
    tunnelVision.toggleTunnelVision();
    tunnelVision.toggleTunnelVision();
    expect(provider1.isVisible()).toBeTruthy();
    expect(provider2.isVisible()).toBeTruthy();
  });

  it('should only restore the providers that were visible', () => {
    provider1.toggle();
    expect(provider1.isVisible()).toBeFalsy();
    expect(provider2.isVisible()).toBeTruthy();

    tunnelVision.toggleTunnelVision();

    expect(provider1.isVisible()).toBeFalsy();
    expect(provider2.isVisible()).toBeFalsy();

    tunnelVision.toggleTunnelVision();
    expect(provider1.isVisible()).toBeFalsy();
    expect(provider2.isVisible()).toBeTruthy();
  });

  it('should re-enter tunnel vision if a provider is manually opened', () => {
    provider1.toggle();
    expect(provider1.isVisible()).toBeFalsy();
    expect(provider2.isVisible()).toBeTruthy();

    // Enter tunnel vision
    tunnelVision.toggleTunnelVision();

    // User manually opens something
    provider1.toggle();

    // Since something is open, the intent is probably to get back into the tunnel vision state. So,
    // the provider should be hidden.
    tunnelVision.toggleTunnelVision();
    expect(provider1.isVisible()).toBeFalsy();
    expect(provider2.isVisible()).toBeFalsy();

    // Now they are leaving tunnel vision. We should restore all the providers that we have
    // previously hidden. So we shoudl restore provider2 (hidden on first entry) and provider1
    // (hidden on second entry)
    tunnelVision.toggleTunnelVision();
    expect(provider1.isVisible()).toBeTruthy();
    expect(provider2.isVisible()).toBeTruthy();
  });
});

class FakeProvider {
  _isVisible: boolean;

  constructor() {
    this._isVisible = true;
  }

  isVisible(): boolean {
    return this._isVisible;
  }

  toggle(): void {
    this._isVisible = !this._isVisible;
  }
}
