'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {CoverageResult} from '../../nuclide-type-coverage/lib/rpc-types';

import {getHackLanguageForUri} from './HackLanguage';
import {trackTiming} from '../../nuclide-analytics';

// Provides Diagnostics for un-typed regions of Hack code.
export class TypeCoverageProvider {

  constructor() {
  }

  @trackTiming('hack:run-type-coverage')
  async getCoverage(path: NuclideUri): Promise<?CoverageResult> {
    const hackLanguage = await getHackLanguageForUri(path);
    if (hackLanguage == null) {
      return null;
    }

    return await hackLanguage.getCoverage(path);
  }
}
