/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {getSdbServiceByNuclideUri} from '../../../nuclide-remote-connection';
import {AndroidTizenBaseFetcher} from './AndroidTizenBaseFetcher';

import type {NuclideUri} from '../../../commons-node/nuclideUri';

export class TizenFetcher extends AndroidTizenBaseFetcher {
  constructor() {
    super('tizen', (host: NuclideUri) => getSdbServiceByNuclideUri(host));
  }
}
