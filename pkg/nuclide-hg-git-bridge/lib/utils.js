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
import type {FileChangeStatusValue} from './constants';

import {arrayCompact} from '../../commons-node/collection';
import nuclideUri from '../../commons-node/nuclideUri';
import {repositoryForPath} from '../../nuclide-hg-git-bridge';

export function getMultiRootFileChanges(
  fileChanges: Map<NuclideUri, FileChangeStatusValue>,
  rootPaths?: Array<NuclideUri>,
): Map<NuclideUri, Map<NuclideUri, FileChangeStatusValue>> {
  let roots;
  if (rootPaths == null) {
    roots = arrayCompact(
      atom.project.getDirectories().map(directory => {
        const rootPath = directory.getPath();
        const repository = repositoryForPath(rootPath);
        if ((repository == null || repository.getType() !== 'hg')) {
          return null;
        }
        return nuclideUri.ensureTrailingSeparator(rootPath);
      }),
    );
  } else {
    roots = rootPaths.map(root => nuclideUri.ensureTrailingSeparator(root));
  }

  const sortedFilePaths = Array.from(fileChanges.entries())
    .sort(([filePath1], [filePath2]) =>
      nuclideUri.basename(filePath1).toLowerCase().localeCompare(
        nuclideUri.basename(filePath2).toLowerCase(),
      ),
    );

  const changedRoots = new Map(roots.map(root => {
    const rootChanges = new Map(
      sortedFilePaths.filter(([filePath]) => nuclideUri.contains(root, filePath)),
    );
    return [root, rootChanges];
  }));

  return changedRoots;
}
