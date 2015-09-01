'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import search from './scanhandler';
import path from 'path';
import {Observable} from 'rx';

export function findInProjectSearch(directory: NuclideUri, regex: RegExp, subdirs: Array<string>):
    Observable<search$FileResult> {
  return search(directory, regex, subdirs).map(update => {
    // Transform filePath's to absolute paths.
    return {filePath: path.join(directory, update.filePath), matches: update.matches};
  });
}
