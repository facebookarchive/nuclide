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
import type {FileChangeStatusValue} from '../nuclide-diff-view/lib/types';

import {hgConstants} from '../nuclide-hg-rpc';
import {asyncExecute} from './process';
import {Observable} from 'rxjs';
import {observableFromSubscribeFunction} from './event';

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
