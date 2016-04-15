'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RemoteDirectory} from '../../nuclide-remote-connection';
import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';
import type {CheckoutSideName, MergeConflict} from '..';
import type {NuclideUri} from '../../nuclide-remote-uri';

import remoteUri from '../../nuclide-remote-uri';

export class MercurialConflictContext {

  _hgRepository: HgRepositoryClient;

  workingDirectory: atom$Directory | RemoteDirectory;
  resolveText: string;
  priority: number;

  constructor(
    hgRepository: HgRepositoryClient,
    workingDirectory: atom$Directory | RemoteDirectory,
    priority: number,
  ) {
    this._hgRepository = hgRepository;
    this.workingDirectory = workingDirectory;
    this.priority = priority;
    this.resolveText = 'Resolve';
  }

  readConflicts(): Promise<Array<MergeConflict>> {
    // TODO(most)
    return Promise.resolve([{
      message: 'both changed',
      path: 'test.txt',
      resolveMessage: 'Resolve',
    }]);
  }

  isResolvedFile(filePath: NuclideUri): Promise<boolean> {
    return Promise.resolve(true);
  }

  checkoutSide(sideName: CheckoutSideName, filePath: NuclideUri): Promise<void> {
    // TODO(most)
    return Promise.resolve();
  }

  resolveFile(filePath: NuclideUri): Promise<void> {
    // TODO(most): mark as resolved.
    return Promise.resolve();
  }

  // Deletermine if that's a rebase or merge operation.
  isRebasing(): boolean {
    // TODO(most)
    return true;
  }

  joinPath(relativePath: string): NuclideUri {
    return remoteUri.join(this.workingDirectory.getPath(), relativePath);
  }
}
