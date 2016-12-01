'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {StatusCodeNumberValue} from '../nuclide-hg-rpc/lib/HgService';
import type {HgRepositoryClient} from '../nuclide-hg-repository-client/lib/HgRepositoryClient';
import type {NuclideUri} from '../commons-node/nuclideUri';

import {arrayCompact} from './collection';
import {asyncExecute} from './process';
import {diffSets} from './observable';
import {hgConstants} from '../nuclide-hg-rpc';
import invariant from 'assert';
import {Observable} from 'rxjs';
import {observableFromSubscribeFunction} from './event';
// TODO(most): move `nuclide-hg-git-bridge` utils here.
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {repositoryForPath} from '../nuclide-hg-git-bridge';
import {track} from '../nuclide-analytics';

type VcsInfo = {
  vcs: string,
  root: string,
};

const {StatusCodeNumber: HgStatusCodeNumber} = hgConstants;
const vcsInfoCache: {[dir: string]: VcsInfo} = {};

async function findVcsHelper(dir: string): Promise<VcsInfo> {
  const options = {cwd: dir};
  const hgResult = await asyncExecute('hg', ['root'], options);
  if (hgResult.exitCode === 0) {
    return {
      vcs: 'hg',
      root: hgResult.stdout.trim(),
    };
  }

  const gitResult = await asyncExecute('git', ['rev-parse', '--show-toplevel'], options);
  if (gitResult.exitCode === 0) {
    return {
      vcs: 'git',
      root: gitResult.stdout.trim(),
    };
  }

  throw new Error('Could not find VCS for: ' + dir);
}

/**
 * For the given source file, find the type of vcs that is managing it as well
 * as the root directory for the VCS.
 */
export async function findVcs(dir: string): Promise<VcsInfo> {
  let vcsInfo = vcsInfoCache[dir];
  if (vcsInfo) {
    return vcsInfo;
  }

  vcsInfo = await findVcsHelper(dir);
  vcsInfoCache[dir] = vcsInfo;
  return vcsInfo;
}

export type FileChangeStatusValue = 1 | 2 | 3 | 4 | 5;

export const FileChangeStatus = Object.freeze({
  ADDED: 1,
  MODIFIED: 2,
  MISSING: 3,
  REMOVED: 4,
  UNTRACKED: 5,
});

(FileChangeStatus: {[key: string]: FileChangeStatusValue});

export const HgStatusToFileChangeStatus
  : {[key: StatusCodeNumberValue]: FileChangeStatusValue} = Object.freeze({
    [HgStatusCodeNumber.ADDED]: FileChangeStatus.ADDED,
    [HgStatusCodeNumber.MODIFIED]: FileChangeStatus.MODIFIED,
    [HgStatusCodeNumber.MISSING]: FileChangeStatus.MISSING,
    [HgStatusCodeNumber.REMOVED]: FileChangeStatus.REMOVED,
    [HgStatusCodeNumber.UNTRACKED]: FileChangeStatus.UNTRACKED,
  },
);

export const FileChangeStatusToPrefix: {[key: FileChangeStatusValue]: string} = Object.freeze({
  [FileChangeStatus.ADDED]: '[A] ',
  [FileChangeStatus.MODIFIED]: '[M] ',
  [FileChangeStatus.MISSING]: '[!] ',
  [FileChangeStatus.REMOVED]: '[D] ',
  [FileChangeStatus.UNTRACKED]: '[?] ',
});

export const FileChangeStatusToIcon: {[key: ?FileChangeStatusValue]: atom$Octicon} = Object.freeze({
  [FileChangeStatus.ADDED]: 'diff-added',
  [FileChangeStatus.MODIFIED]: 'diff-modified',
  [FileChangeStatus.MISSING]: 'stop',
  [FileChangeStatus.REMOVED]: 'diff-removed',
  [FileChangeStatus.UNTRACKED]: 'question',
});

export const FileChangeStatusToTextColor: {[key: ?FileChangeStatusValue]: string} = Object.freeze({
  [FileChangeStatus.ADDED]: 'text-success',
  [FileChangeStatus.MODIFIED]: 'text-warning',
  [FileChangeStatus.MISSING]: 'text-error',
  [FileChangeStatus.REMOVED]: 'text-error',
  [FileChangeStatus.UNTRACKED]: 'text-error',
});

export const RevertibleStatusCodes = [
  FileChangeStatus.ADDED,
  FileChangeStatus.MODIFIED,
  FileChangeStatus.REMOVED,
];

export function getDirtyFileChanges(
  repository: HgRepositoryClient,
): Map<NuclideUri, FileChangeStatusValue> {
  const dirtyFileChanges = new Map();
  const statuses = repository.getAllPathStatuses();
  for (const filePath in statuses) {
    const changeStatus = HgStatusToFileChangeStatus[statuses[filePath]];
    if (changeStatus != null) {
      dirtyFileChanges.set(filePath, changeStatus);
    }
  }
  return dirtyFileChanges;
}

const UPDATE_STATUS_DEBOUNCE_MS = 50;
export function observeStatusChanges(
  repository: HgRepositoryClient,
): Observable<Map<NuclideUri, FileChangeStatusValue>> {
  return observableFromSubscribeFunction(
    repository.onDidChangeStatuses.bind(repository),
  )
  .debounceTime(UPDATE_STATUS_DEBOUNCE_MS)
  .startWith(null)
  .map(() => getDirtyFileChanges(repository));
}

export function addPath(nodePath: ?NuclideUri): Promise<void> {
  return hgActionToPath(
    nodePath,
    'add',
    'Added',
    async (hgRepository: HgRepositoryClient) => {
      invariant(nodePath);
      track('hg-repository-add', {nodePath});
      await hgRepository.addAll([nodePath]);
    },
  );
}

export function revertPath(nodePath: ?NuclideUri, toRevision?: ?string): Promise<void> {
  return hgActionToPath(
    nodePath,
    'revert',
    'Reverted',
    async (hgRepository: HgRepositoryClient) => {
      invariant(nodePath);
      track('hg-repository-revert', {nodePath});
      await hgRepository.revert([nodePath], toRevision);
    },
  );
}

export function confirmAndRevertPath(path: ?NuclideUri, toRevision?: ?string): void {
  const result = atom.confirm({
    message: 'Are you sure you want to revert?',
    buttons: ['Revert', 'Cancel'],
  });
  invariant(result === 0 || result === 1);
  if (result === 0) {
    revertPath(path, toRevision);
  }
}

async function hgActionToPath(
  nodePath: ?NuclideUri,
  actionName: string,
  actionDoneMessage: string,
  action: (hgRepository: HgRepositoryClient) => Promise<void>,
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
  const hgRepository: HgRepositoryClient = (repository: any);
  try {
    await action(hgRepository);
    atom.notifications.addSuccess(
      `${actionDoneMessage} \`${repository.relativize(nodePath)}\` successfully.`,
    );
  } catch (error) {
    atom.notifications.addError(
      `Failed to ${actionName} \`${repository.relativize(nodePath)}\``,
      {detail: error.message},
    );
  }
}

export function getHgRepositories(): Set<HgRepositoryClient> {
  return new Set(
    arrayCompact(atom.project.getRepositories())
      .filter(repository => repository.getType() === 'hg'),
  );
}

export function getHgRepositoryStream(): Observable<HgRepositoryClient> {
  const currentRepositories =
    observableFromSubscribeFunction(atom.project.onDidChangePaths.bind(atom.project))
    .startWith(null)
    .map(() => getHgRepositories());

  return diffSets(currentRepositories).flatMap(
    repoDiff => Observable.from(repoDiff.added),
  );
}
