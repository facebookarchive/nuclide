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

export const NUCLIDE_ONE_WORLD_ADB_PATH_NAME = 'NUCLIDE_ONE_WORLD_ADB_PATH';

export function getAdbPath(): string {
  return 'adb';
}

export async function getAdbPorts(
  targetUri: NuclideUri,
): Promise<Array<number>> {
  return [];
}

export async function addAdbPorts(
  targetUri: NuclideUri,
  ports: Array<number>,
): Promise<void> {}

export function setAdbPath(targetUri: NuclideUri, adbPath: string) {}
