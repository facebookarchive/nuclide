/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';

export type Device = {
  name: string,
  displayName: string,
  type: string,
};

export interface DeviceFetcher {
  fetch(host: NuclideUri): Promise<Device[]>,
}
