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
import {arrayFlatten} from '../../commons-node/collection';

import type {DeviceFetcher} from './types';
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

  getElement(): HTMLElement {
    const devicesCB = (host: NuclideUri) => {
      return Promise.all(Array.from(this._fetchers).map(fetcher => fetcher.fetch(host)))
        .then(deviceLists => arrayFlatten(deviceLists));
    };
    return renderReactRoot(<DevicePanel hosts={['local']} getDevices={devicesCB} />);
  }
}
