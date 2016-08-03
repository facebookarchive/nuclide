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
import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';

import {Directory} from 'atom';
import nuclideUri from '../../commons-node/nuclideUri';

/**
 * @param repository Either a GitRepository or HgRepositoryClient.
 * @param filePath The absolute file path of interest.
 * @return boolean Whether the file path exists within the working directory
 *   (aka root directory) of the repository, or is the working directory.
 */
export default function repositoryContainsPath(
  repository: atom$Repository,
  filePath: NuclideUri,
): boolean {
  const workingDirectoryPath = repository.getWorkingDirectory();
  if (pathsAreEqual(workingDirectoryPath, filePath)) {
    return true;
  }

  if (repository.getType() === 'git') {
    const rootGitProjectDirectory = new Directory(workingDirectoryPath);
    return rootGitProjectDirectory.contains(filePath);
  } else if (repository.getType() === 'hg') {
    const hgRepository = ((repository: any): HgRepositoryClient);
    return hgRepository._workingDirectory.contains(filePath);
  }
  throw new Error(
    'repositoryContainsPath: Received an unrecognized repository type. Expected git or hg.');
}

/**
 * @param filePath1 An abolute file path.
 * @param filePath2 An absolute file path.
 * @return Whether the file paths are equal, accounting for trailing slashes.
 */
function pathsAreEqual(filePath1: string, filePath2: string): boolean {
  const realPath1 = nuclideUri.resolve(filePath1);
  const realPath2 = nuclideUri.resolve(filePath2);
  return realPath1 === realPath2;
}
