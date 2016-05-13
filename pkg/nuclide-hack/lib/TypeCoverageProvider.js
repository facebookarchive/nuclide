'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import type {BusySignalProviderBase} from '../../nuclide-busy-signal';
import type {
  TypeCoverageRegion,
  HackCoverageResult,
} from './TypedRegions';
import type {
  CoverageResult,
  UncoveredRegion,
} from '../../nuclide-type-coverage/lib/types';

import {getHackLanguageForUri} from './HackLanguage';
import {Range} from 'atom';
import {trackTiming} from '../../nuclide-analytics';
import {promises} from '../../nuclide-commons';
import {getLogger} from '../../nuclide-logging';

const logger = getLogger();
const {RequestSerializer} = promises;

// Provides Diagnostics for un-typed regions of Hack code.
export class TypeCoverageProvider {
  _requestSerializer: RequestSerializer<?HackCoverageResult>;
  _busySignalProvider: BusySignalProviderBase;

  constructor(busySignalProvider: BusySignalProviderBase) {
    this._busySignalProvider = busySignalProvider;
    this._requestSerializer = new RequestSerializer();
  }

  getTypeCoverage(path: NuclideUri): Promise<void> {
    return this._busySignalProvider.reportBusy(
      'Hack: Waiting for type coverage results',
      () => this._getTypeCoverage(path),
    ).catch(async e => { logger.error(e); });
  }

  @trackTiming('hack:run-type-coverage')
  async _getTypeCoverage(path: NuclideUri): Promise<?CoverageResult> {
    const hackLanguage = await getHackLanguageForUri(path);
    if (hackLanguage == null) {
      return null;
    }

    const result = await this._requestSerializer.run(
      hackLanguage.getTypeCoverage(path)
    );
    if (result.status === 'outdated') {
      return null;
    }

    const hackCoverageResult: ?HackCoverageResult = result.result;
    if (hackCoverageResult == null) {
      return null;
    }
    const uncoveredRegions = hackCoverageResult.uncoveredRegions.map(
      region => convertHackRegionToCoverageRegion(path, region)
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
