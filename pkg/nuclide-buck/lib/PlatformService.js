'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Platform} from './types';

import {Observable} from 'rxjs';
import * as IosSimulator from '../../nuclide-ios-common';

export function platformsForRuleType(ruleType: string): Observable<?Array<Platform>> {
  // TODO: Fetch platforms from registered providers
  if (ruleType !== 'apple_bundle') {
    return Observable.of(null);
  }
  const iosDevices = IosSimulator.getDevices().map(devices => ({
    name: 'iOS Simulators',
    devices: devices.map(device => ({
      name: device.name,
      udid: device.udid,
      flavor: 'iphonesimulator-x86_64',
    })),
  }));
  const allPlatforms = iosDevices.map(platform => [platform]);

  return allPlatforms.map(platforms =>
    platforms.sort((a, b) =>
    a.name.toUpperCase().localeCompare(b.name.toUpperCase())),
  );
}
