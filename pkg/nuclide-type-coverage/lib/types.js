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

// This type is highly likely to change in the near future as we add information like *which* parts
// of the file are covered. Expect breaking changes.
export type CoverageResult = number;

export interface CoverageProvider {
  getCoverage(path: NuclideUri): Promise<?CoverageResult>;
  priority: number;
  grammarScopes: Array<string>;
}
