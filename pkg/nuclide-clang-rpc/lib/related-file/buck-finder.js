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

import fsPromise from 'nuclide-commons/fsPromise';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {guessBuildFile, isBuckBuildFile, isSourceFile} from '../utils';

async function findAnySourceInDir(dirname: string): Promise<?string> {
  for (const file of await fsPromise.readdir(dirname).catch(() => [])) {
    if (isSourceFile(file)) {
      return nuclideUri.join(dirname, file);
    }
  }
  return null;
}

async function headerSeemsToBeInABuckProject(header: string): Promise<boolean> {
  const buildFile = await guessBuildFile(header);
  return buildFile != null && isBuckBuildFile(buildFile);
}

export async function findSourceFileInSameFolderIfBelongsToBuck(
  header: string,
): Promise<?string> {
  // we can assume that any source in the same target has the same includes,
  // but finding which target is hard, so we fallback to any source in the
  // same folder
  if (await headerSeemsToBeInABuckProject(header)) {
    return findAnySourceInDir(nuclideUri.dirname(header));
  }
  return null;
}
