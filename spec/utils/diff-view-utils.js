'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HgRepositoryClient} from '../../pkg/nuclide-hg-repository-client';

import invariant from 'assert';
import {repositoryForPath} from '../../pkg/nuclide-hg-git-bridge';

// In this test, we only mock `watchman` sending updates after the files are changed.
// This is to avoid the dependency on `watchman` existing and working on test machines.
export function triggerWatchmanHgChange(filePath: string): void {
  const repository = repositoryForPath(filePath);
  invariant(repository != null && repository.getType() === 'hg', 'non-hg repository');
  const hgRepository: HgRepositoryClient = (repository: any);
  hgRepository._service._filesDidChangeObserver.next([filePath]);
}
