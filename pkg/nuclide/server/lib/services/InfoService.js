'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getVersion} from '../../../version';
import NuclideServer from '../NuclideServer';

export async function getServerVersion(): Promise<string> {
  return getVersion();
}

export function shutdownServer(): void {
  NuclideServer.shutdown();
}
