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

export const WORKSPACE_VIEW_URI = 'atom://nuclide/devices';

export class DevicesPanelState {
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
    return renderReactRoot(<DevicePanel />);
  }
}
