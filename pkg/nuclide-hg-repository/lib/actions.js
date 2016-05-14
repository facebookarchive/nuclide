'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import type {HgRepositoryClientAsync} from '../../nuclide-hg-repository-client';
import type {NuclideUri} from '../../nuclide-remote-uri';

import invariant from 'assert';
import {repositoryForPath} from '../../nuclide-hg-git-bridge';
import {track} from '../../nuclide-analytics';

export function addPath(nodePath: ?NuclideUri): Promise<void> {
  return hgActionToPath(
    nodePath,
    'add',
    'Added',
    async (hgRepositoryAsync: HgRepositoryClientAsync) => {
      invariant(nodePath);
      track('hg-repository-add', {nodePath});
      await hgRepositoryAsync.addAll([nodePath]);
    },
  );
}

export function revertPath(nodePath: ?NuclideUri): Promise<void> {
  return hgActionToPath(
    nodePath,
    'revert',
    'Reverted',
    async (hgRepositoryAsync: HgRepositoryClientAsync) => {
      invariant(nodePath);
      track('hg-repository-revert', {nodePath});
      await hgRepositoryAsync.checkoutHead(nodePath);
    },
  );
}

async function hgActionToPath(
  nodePath: ?NuclideUri,
  actionName: string,
  actionDoneMessage: string,
  action: (hgRepositoryAsync: HgRepositoryClientAsync) => Promise<void>,
): Promise<void> {
  if (nodePath == null || nodePath.length === 0) {
    atom.notifications.addError(`Cannot ${actionName} an empty path!`);
    return;
  }
  const repository = repositoryForPath(nodePath);
  if (repository == null || repository.getType() !== 'hg') {
    atom.notifications.addError(`Cannot ${actionName} a non-mercurial repository path`);
    return;
  }
  const hgRepositoryAsync: HgRepositoryClientAsync = (repository : any).async;
  try {
    await action(hgRepositoryAsync);
    atom.notifications.addSuccess(
      `${actionDoneMessage} \`${repository.relativize(nodePath)}\` successfully.`
    );
  } catch (error) {
    atom.notifications.addError(
      `Failed to ${actionName} \`${repository.relativize(nodePath)}\``,
      {detail: error.message},
    );
  }
}
