'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';
import type {SymbolTypeValue} from '../../hack-common';
import type {HackSearchPosition} from './HackService';

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

export type HackSymbolNameResult = {
  name: string,
  type: SymbolTypeValue,
  line: number,
  column: number,
  length: number,
};
