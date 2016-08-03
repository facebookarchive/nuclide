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
import {arrayCompact} from '../../commons-node/collection';
import repositoryContainsPath from './repositoryContainsPath';

/**
 * @param aPath The NuclideUri of a file or directory for which you want to find
 *   a Repository it belongs to.
 * @return A Git or Hg repository the path belongs to, if any.
 */
export default function repositoryForPath(aPath: NuclideUri): ?atom$Repository {
  // Calling atom.project.repositoryForDirectory gets the real path of the directory,
  // which requires a round-trip to the server for remote paths.
  // Instead, this function keeps filtering local.
  const repositories = arrayCompact(atom.project.getRepositories());
  return repositories.find(
    repo => {
      try {
        return repositoryContainsPath(repo, aPath);
      } catch (e) {
        // The repo type is not supported.
        return false;
      }
    },
  );
}
