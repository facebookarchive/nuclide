/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import {renderReactRoot} from '../../commons-atom/renderReactRoot';
import {DevicePanel} from './ui/DevicePanel';

import type {DeviceFetcher, Device} from './types';
import type {NuclideUri} from '../../commons-node/nuclideUri';

export const WORKSPACE_VIEW_URI = 'atom://nuclide/devices';

export class DevicesPanelState {
  _fetchers: Set<DeviceFetcher>;

  constructor(fetchers: Set<DeviceFetcher>) {
    this._fetchers = fetchers;
  }

  getTitle() {
    return 'Devices';
  }

  getIconName() {
    return 'device-mobile';
  }

  getPreferredWidth(): number {
    return 300;
  }

  getURI(): string {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation(): string {
    return 'right';
  }

  async _getDevices(host: NuclideUri): Promise<Map<string, Device[]>> {
    const deviceLookups = Array.from(this._fetchers)
      .map(fetcher => [fetcher.getType(), fetcher.fetch(host)]);
    const deviceMap = new Map();
    (await Promise.all(deviceLookups.map(d => d[1])))
      .forEach((lookup, i) => {
        if (lookup.length > 0) {
          deviceMap.set(deviceLookups[i][0], lookup);
        }
      });
    return deviceMap;
  }

  getElement(): HTMLElement {
    return renderReactRoot(
      <DevicePanel hosts={['local']} getDevices={host => this._getDevices(host)} />,
    );
  }
}
