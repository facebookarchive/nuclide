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

import {Observable} from 'rxjs';

import path from 'path';
import search from './scanhandler';

export type search$Match = {
  lineText: string;
  lineTextOffset: number;
  matchText: string;
  range: Array<Array<number>>;
};

export type search$FileResult = {
  filePath: NuclideUri;
  matches: Array<search$Match>;
};

export function findInProjectSearch(directory: NuclideUri, regex: RegExp, subdirs: Array<string>):
    Observable<search$FileResult> {
  return search(directory, regex, subdirs).map(update => {
    // Transform filePath's to absolute paths.
    return {filePath: path.join(directory, update.filePath), matches: update.matches};
  });
}
