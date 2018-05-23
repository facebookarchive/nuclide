/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import {DEFAULT_ADB_PORT} from 'nuclide-adb/lib/common/DebugBridge';
import {getAdbServiceByNuclideUri} from 'nuclide-adb';
import invariant from 'assert';

export const NUCLIDE_ONE_WORLD_ADB_PATH_NAME = 'NUCLIDE_ONE_WORLD_ADB_PATH';

export function getAdbPath(): string {
  const atomConfigAdbPathName = atom.config.get(
    NUCLIDE_ONE_WORLD_ADB_PATH_NAME,
  );
  if (
    atomConfigAdbPathName != null &&
    typeof atomConfigAdbPathName === 'string'
  ) {
    return atomConfigAdbPathName;
  }
  return 'adb';
}

export async function getAdbPorts(
  targetUri: NuclideUri,
): Promise<Array<number>> {
  const adbService = getAdbServiceByNuclideUri(targetUri);
  const ports = await adbService.getAdbPorts();

  // Don't show the user the default adb port. This should always be included.
  return ports.filter(port => port !== DEFAULT_ADB_PORT);
}

export async function addAdbPorts(
  targetUri: NuclideUri,
  ports: Array<number>,
): Promise<void> {
  const adbService = getAdbServiceByNuclideUri(targetUri);
  const existingPorts = await adbService.getAdbPorts();

  // Remove any ports that are no longer in the list, but never remove
  // the default adb server port.
  // NOTE: the list of ports is expected to be very short here (like 5 items or less)
  for (const oldPort of existingPorts) {
    if (oldPort !== DEFAULT_ADB_PORT && !ports.includes(oldPort)) {
      adbService.removeAdbPort(oldPort);
    }
  }

  for (const newPort of ports) {
    invariant(newPort != null);
    if (!existingPorts.includes(newPort)) {
      adbService.addAdbPort(newPort);
    }
  }
}

export function setAdbPath(targetUri: NuclideUri, adbPath: string) {
  const adbService = getAdbServiceByNuclideUri(targetUri);
  if (adbPath != null) {
    adbService.registerCustomPath(adbPath);
  } else {
    // If the user-specified info is invalid, set empty strings to cause the ADB service
    // to fallback to its default configuration.
    adbService.registerCustomPath(null);
  }
}
