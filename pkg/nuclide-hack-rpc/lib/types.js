/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {HackSearchPosition} from './HackService-types';

export type HHSearchPosition = {
  filename: string,
  line: number,
  char_start: number,
  char_end: number,
  scope: string,
  name: string,
  desc: string,
};

export type HackSearchResult = {
  hackRoot: NuclideUri,
  result: Array<HackSearchPosition>,
};
