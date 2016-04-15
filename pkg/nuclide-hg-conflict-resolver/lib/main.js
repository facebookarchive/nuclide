'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';
import type {NuclideUri} from '../../nuclide-remote-uri';
import type {RemoteDirectory} from '../../nuclide-remote-connection';

import {repositoryForPath} from '../../nuclide-hg-git-bridge';
import {MercurialConflictContext} from './MercurialConflictContext';

let cwdApi: ?CwdApi = null;

export type CheckoutSideName = 'ours' | 'theirs';

export type MergeConflict = {
  path: NuclideUri;
  message: string;
  resolveMessage: string;
};

export type RepositoryContext = {
  workingDirectory: atom$Directory | RemoteDirectory;
  priority: number;
  resolveText: string;

  readConflicts(): Promise<Array<MergeConflict>>;
  isResolvedFile(filePath: NuclideUri): Promise<boolean>;
  checkoutSide(sideName: CheckoutSideName, filePath: NuclideUri): Promise<void>;
  resolveFile(filePath: NuclideUri): Promise<void>;
  isRebasing(): boolean;
  joinPath(relativePath: string): NuclideUri;
};

export type ConflictsContextApi = {
  getContext(): Promise<?RepositoryContext>;
};

export type ConflictsApi = {
  registerContextApi(contextApi: ConflictsContextApi): void;
};

export function activate() {
}

export function consumeMergeConflictsApi(conflictsApi: ConflictsApi) {
  conflictsApi.registerContextApi({
    getContext() { return getMercurialContext(); },
  });
}

export function consumeCwdApi(api: CwdApi): void {
  cwdApi = api;
}

async function getMercurialContext(): Promise<?RepositoryContext> {
  const activeTextEditor = atom.workspace.getActiveTextEditor();
  let activePath = null;
  if (activeTextEditor != null && activeTextEditor.getPath()) {
    activePath = activeTextEditor.getPath();
  }
  if (activePath == null && cwdApi != null) {
    const directory = cwdApi.getCwd();
    if (directory != null) {
      activePath = directory.getPath();
    }
  }
  let hgRepository: ?HgRepositoryClient = null;
  let priority = 2;
  if (activePath != null) {
    const repository = repositoryForPath(activePath);
    if (isHgRepo(repository)) {
      hgRepository = (repository: any);
      priority = 3;
    }
  }
  const repositories = atom.project.getRepositories();
  const directories = atom.project.getDirectories();
  if (hgRepository == null) {
    hgRepository = ((repositories.filter(isHgRepo)[0]: any): ?HgRepositoryClient);
  }
  if (hgRepository == null) {
    return null;
  }
  const workingDirectory = directories[repositories.indexOf((hgRepository: any))];
  return new MercurialConflictContext(hgRepository, workingDirectory, priority);
}

function isHgRepo(repository: ?atom$Repository) {
  return repository != null && repository.getType() === 'hg';
}
