/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {getAdbServiceByNuclideUri} from '../../../nuclide-remote-connection';
import {AndroidTizenBaseFetcher} from './AndroidTizenBaseFetcher';

import type {NuclideUri} from '../../../commons-node/nuclideUri';

export class AndroidFetcher extends AndroidTizenBaseFetcher {
  constructor() {
    super('android', (host: NuclideUri) => getAdbServiceByNuclideUri(host));
  }
}
