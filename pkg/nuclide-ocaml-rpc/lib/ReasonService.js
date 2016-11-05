'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {refmt} from './ReasonProcess';

export type refmtResult =
  {type: 'result', formattedResult: string} | {type: 'error', error: string};

export async function format(content: string, flags: Array<string>): Promise<refmtResult> {
  return refmt(content, flags);
}
