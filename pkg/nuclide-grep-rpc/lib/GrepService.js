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

import {ConnectableObservable} from 'rxjs';

import nuclideUri from '../../commons-node/nuclideUri';
import search from './scanhandler';

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

export function grepSearch(
  directory: NuclideUri,
  regex: RegExp,
  subdirs: Array<string>,
): ConnectableObservable<search$FileResult> {
  return search(directory, regex, subdirs).map(update => {
    // Transform filePath's to absolute paths.
    return {filePath: nuclideUri.join(directory, update.filePath), matches: update.matches};
  }).publish();
}
