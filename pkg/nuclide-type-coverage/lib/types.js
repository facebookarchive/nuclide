/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

export type UncoveredRegion = {
  range: atom$Range;
  message?: string;
};

export type CoverageResult = {
  percentage: number;
  uncoveredRegions: Array<UncoveredRegion>;
};

export interface CoverageProvider {
  getCoverage(path: NuclideUri): Promise<?CoverageResult>;
  priority: number;
  grammarScopes: Array<string>;
  displayName: string;
}
