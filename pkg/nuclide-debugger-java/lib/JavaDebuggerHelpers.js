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
import type {VspProcessInfo} from 'nuclide-debugger-common';

import {getSourcePathString} from 'atom-ide-debugger-java/utils';
import * as BuckService from '../../nuclide-buck-rpc';
import nuclideUri from 'nuclide-commons/nuclideUri';

// Employs a heuristic to try and find the Java source path roots for a buck target.
export async function javaDebugAddBuckTargetSourcePaths(
  processInfo: VspProcessInfo,
  buckRoot: NuclideUri,
  targetName: string,
): Promise<void> {
  const newSourceDirs = new Set();
  const sources = await BuckService.query(
    buckRoot,
    `inputs(deps("${targetName}", 1))`,
    [] /* no extra arguments */,
  );
  for (const sourcePath of sources) {
    const fullPath = nuclideUri.join(buckRoot, sourcePath);
    const javaRootsToTry = ['java', 'com', 'net', 'org'];
    for (const javaRoot of javaRootsToTry) {
      const idx = fullPath.indexOf('/' + javaRoot + '/');
      if (idx > 0) {
        const dirname = fullPath.substring(0, idx);
        newSourceDirs.add(dirname);
        newSourceDirs.add(nuclideUri.join(dirname, javaRoot));
      }
    }
  }

  const newDirs = Array.from(newSourceDirs);
  if (newDirs.length > 0) {
    await javaDebugSetSourcePaths(processInfo, newDirs);
  }
}

async function javaDebugSetSourcePaths(
  processInfo: VspProcessInfo,
  sourcePaths: Array<string>,
): Promise<void> {
  await processInfo.customRequest('setSourcePath', {
    sourcePath: getSourcePathString(sourcePaths),
  });
}
