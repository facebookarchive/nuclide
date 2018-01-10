/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

export type CodeSearchResult = {
  file: NuclideUri,
  row: number,
  column: number,
  line: string,
};

export type search$Match = {
  lineText: string,
  lineTextOffset: number,
  matchText: string,
  range: Array<Array<number>>,
};

export type search$FileResult = {
  filePath: NuclideUri,
  matches: Array<search$Match>,
};
