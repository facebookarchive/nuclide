/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {ATDeviceInfoProvider} from './ATDeviceInfoProvider';
import {getSdbServiceByNuclideUri} from '../../nuclide-remote-connection';

import type {NuclideUri} from '../../commons-node/nuclideUri';

export function createTizenInfoProvider() {
  return new ATDeviceInfoProvider('tizen', (host: NuclideUri) => getSdbServiceByNuclideUri(host));
}
