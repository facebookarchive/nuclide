'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type search$RangeIndexes = Array<Array<number>>;

export type search$Match = {
  lineText: string;
  lineTextOffset: number;
  matchText: string;
  range: search$RangeIndexes;
};

export type search$FileResult = {
  filePath: NuclideUri;
  matches: Array<search$Match>;
}
