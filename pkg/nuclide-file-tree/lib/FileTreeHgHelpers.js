'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import FileTreeHelpers from './FileTreeHelpers';
import type {FileTreeNode} from './FileTreeNode';
import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';

import {getPath} from '../../nuclide-remote-uri';
import {getFileSystemServiceByNuclideUri} from '../../nuclide-client';
import {StatusCodeNumber} from '../../nuclide-hg-repository-base/lib/hg-constants';

const legalStatusCodeForRename = new Set([
  StatusCodeNumber.ADDED,
  StatusCodeNumber.CLEAN,
  StatusCodeNumber.MODIFIED,
]);

async function renameNode(node: FileTreeNode, newPath: string): Promise<void> {
  const entry = FileTreeHelpers.getEntryByKey(node.uri);
  if (entry == null) {
    // TODO: Connection could have been lost for remote file.
    return;
  }
  const filePath = entry.getPath();
  // Ignore move if entry is moved to same location as currently.
  if (getPath(filePath) === newPath) {
    return;
  }

  const hgRepository = getHgRepositoryForNode(node);
  let shouldFSRename = true;
  if (hgRepository != null) {
    try {
      shouldFSRename = false;
      await hgRepository.rename(filePath, newPath);
    } catch (e) {
      const statuses = await hgRepository.getStatuses([filePath]);
      const pathStatus = statuses.get(filePath);
      if (legalStatusCodeForRename.has(pathStatus)) {
        atom.notifications.addError(
          '`hg rename` failed, will try to move the file ignoring version control instead.  ' +
          'Error: ' + e.toString(),
        );
      }
      shouldFSRename = true;
    }
  }
  if (shouldFSRename) {
    const service = getFileSystemServiceByNuclideUri(filePath);
    await service.rename(getPath(filePath), newPath);
  }
}

function getHgRepositoryForNode(node: FileTreeNode): ?HgRepositoryClient {
  const repository = node.repo;
  if (repository != null && repository.getType() === 'hg') {
    return ((repository: any): HgRepositoryClient);
  }
  return null;
}

module.exports = {
  getHgRepositoryForNode,
  renameNode,
};
