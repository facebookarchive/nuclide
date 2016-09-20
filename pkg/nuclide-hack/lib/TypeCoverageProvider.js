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
import type {
  TypeCoverageRegion,
  HackCoverageResult,
} from './TypedRegions';
import type {
  CoverageResult,
  UncoveredRegion,
} from '../../nuclide-type-coverage/lib/rpc-types';

import {getHackLanguageForUri} from './HackLanguage';
import {Range} from 'atom';
import {trackTiming} from '../../nuclide-analytics';

// Provides Diagnostics for un-typed regions of Hack code.
export class TypeCoverageProvider {

  constructor() {
  }

  @trackTiming('hack:run-type-coverage')
  async getTypeCoverage(path: NuclideUri): Promise<?CoverageResult> {
    const hackLanguage = await getHackLanguageForUri(path);
    if (hackLanguage == null) {
      return null;
    }

    const hackCoverageResult: ?HackCoverageResult = await hackLanguage.getTypeCoverage(path);
    if (hackCoverageResult == null) {
      return null;
    }
    const uncoveredRegions = hackCoverageResult.uncoveredRegions.map(
      region => convertHackRegionToCoverageRegion(path, region),
    );
    return {
      percentage: hackCoverageResult.percentage,
      uncoveredRegions,
    };
  }
}

const UNCHECKED_MESSAGE = 'Un-type checked code. Consider adding type annotations.';
const PARTIAL_MESSAGE = 'Partially type checked code. Consider adding type annotations.';

function convertHackRegionToCoverageRegion(
  filePath: NuclideUri,
  region: TypeCoverageRegion,
): UncoveredRegion {
  const line = region.line - 1;
  return {
    range: new Range([line, region.start - 1], [line, region.end]),
    message: region.type === 'partial' ? PARTIAL_MESSAGE : UNCHECKED_MESSAGE,
  };
}
