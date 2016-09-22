'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';
import type {
  DiffOptionType,
  FileChangeStatusValue,
  HgDiffState,
} from './types';
import type {
  RevisionFileChanges,
  RevisionInfo,
} from '../../nuclide-hg-rpc/lib/HgService';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import {HgStatusToFileChangeStatus, FileChangeStatus, DiffOption} from './constants';
import {hgConstants} from '../../nuclide-hg-rpc';
import invariant from 'assert';
import {Observable} from 'rxjs';

export function getHeadRevision(revisions: Array<RevisionInfo>): ?RevisionInfo {
  return revisions.find(revision => revision.isHead);
}

/**
 * Merges the file change statuses of the dirty filesystem state with
 * the revision changes, where dirty changes and more recent revisions
 * take priority in deciding which status a file is in.
 */
function mergeFileStatuses(
  dirtyStatus: Map<NuclideUri, FileChangeStatusValue>,
  revisionsFileChanges: Array<RevisionFileChanges>,
): Map<NuclideUri, FileChangeStatusValue> {
  const mergedStatus = new Map(dirtyStatus);
  const mergedFilePaths = new Set(mergedStatus.keys());

  function mergeStatusPaths(
    filePaths: Array<NuclideUri>,
    changeStatusValue: FileChangeStatusValue,
  ) {
    for (const filePath of filePaths) {
      if (!mergedFilePaths.has(filePath)) {
        mergedStatus.set(filePath, changeStatusValue);
        mergedFilePaths.add(filePath);
      }
    }

  }

  // More recent revision changes takes priority in specifying a files' statuses.
  const latestToOldestRevisionsChanges = revisionsFileChanges.slice().reverse();
  for (const revisionFileChanges of latestToOldestRevisionsChanges) {
    const {added, modified, deleted} = revisionFileChanges;

    mergeStatusPaths(added, FileChangeStatus.ADDED);
    mergeStatusPaths(modified, FileChangeStatus.MODIFIED);
    mergeStatusPaths(deleted, FileChangeStatus.REMOVED);
  }

  return mergedStatus;
}

export function getHeadToForkBaseRevisions(revisions: Array<RevisionInfo>): Array<RevisionInfo> {
  // `headToForkBaseRevisions` should have the public commit at the fork base as the first.
  // and the rest of the current `HEAD` stack in order with the `HEAD` being last.
  const headRevision = getHeadRevision(revisions);
  if (headRevision == null) {
    return [];
  }
  const {CommitPhase} = hgConstants;
  const hashToRevisionInfo = new Map(revisions.map(revision => [revision.hash, revision]));
  const headToForkBaseRevisions = [];
  let parentRevision = headRevision;
  while (parentRevision != null && parentRevision.phase !== CommitPhase.PUBLIC) {
    headToForkBaseRevisions.unshift(parentRevision);
    parentRevision = hashToRevisionInfo.get(parentRevision.parents[0]);
  }
  if (parentRevision != null) {
    headToForkBaseRevisions.unshift(parentRevision);
  }
  return headToForkBaseRevisions;
}

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

function fetchFileChangesForRevisions(
  repository: HgRepositoryClient,
  revisions: Array<RevisionInfo>,
): Observable<Array<RevisionFileChanges>> {
  if (revisions.length === 0) {
    return Observable.of([]);
  }
  // Revision ids are unique and don't change, except when the revision is amended/rebased.
  // Hence, it's cached here to avoid service calls when working on a stack of commits.
  // $FlowFixMe(matthewwithanm) Type this.
  return Observable.forkJoin(...revisions.map(revision =>
    repository.fetchFilesChangedAtRevision(`${revision.id}`),
  ));
}

export function getSelectedFileChanges(
  repository: HgRepositoryClient,
  diffOption: DiffOptionType,
  revisions: Array<RevisionInfo>,
  compareCommitId: ?number,
): Observable<Map<NuclideUri, FileChangeStatusValue>> {
  const dirtyFileChanges = getDirtyFileChanges(repository);

  if (diffOption === DiffOption.DIRTY ||
    (diffOption === DiffOption.COMPARE_COMMIT && compareCommitId == null)
  ) {
    return Observable.of(dirtyFileChanges);
  }
  const headToForkBaseRevisions = getHeadToForkBaseRevisions(revisions);
  if (headToForkBaseRevisions.length <= 1) {
    return Observable.of(dirtyFileChanges);
  }

  const beforeCommitId = diffOption === DiffOption.LAST_COMMIT
    ? headToForkBaseRevisions[headToForkBaseRevisions.length - 2].id
    : compareCommitId;

  invariant(beforeCommitId != null, 'compareCommitId cannot be null!');
  return getSelectedFileChangesToCommit(
    repository,
    headToForkBaseRevisions,
    beforeCommitId,
    dirtyFileChanges,
  );
}

function getSelectedFileChangesToCommit(
  repository: HgRepositoryClient,
  headToForkBaseRevisions: Array<RevisionInfo>,
  beforeCommitId: number,
  dirtyFileChanges: Map<NuclideUri, FileChangeStatusValue>,
): Observable<Map<NuclideUri, FileChangeStatusValue>> {
  const latestToOldesRevisions = headToForkBaseRevisions.slice().reverse();
  return fetchFileChangesForRevisions(
    repository,
    latestToOldesRevisions.filter(revision => revision.id > beforeCommitId),
  ).map(revisionChanges => mergeFileStatuses(
    dirtyFileChanges,
    revisionChanges,
  ));
}

export function getHgDiff(
  repository: HgRepositoryClient,
  filePath: NuclideUri,
  headToForkBaseRevisions: Array<RevisionInfo>,
  diffOption: DiffOptionType,
  compareId: ?number,
): Observable<HgDiffState> {
  // When `compareCommitId` is null, the `HEAD` commit contents is compared
  // to the filesystem, otherwise it compares that commit to filesystem.
  const headCommit = getHeadRevision(headToForkBaseRevisions);
  if (headCommit == null) {
    throw new Error('Cannot fetch hg diff for revisions without head');
  }
  const headCommitId = headCommit.id;
  let compareCommitId;
  switch (diffOption) {
    case DiffOption.DIRTY:
      compareCommitId = headCommitId;
      break;
    case DiffOption.LAST_COMMIT:
      compareCommitId = headToForkBaseRevisions.length > 1
        ? headToForkBaseRevisions[headToForkBaseRevisions.length - 2].id
        : headCommitId;
      break;
    case DiffOption.COMPARE_COMMIT:
      compareCommitId = compareId || headCommitId;
      break;
    default:
      throw new Error(`Invalid Diff Option: ${diffOption}`);
  }

  const revisionInfo = headToForkBaseRevisions.find(
    revision => revision.id === compareCommitId,
  );
  invariant(
    revisionInfo,
    `Diff Viw Fetcher: revision with id ${compareCommitId} not found`,
  );

  return repository.fetchFileContentAtRevision(filePath, `${compareCommitId}`)
    // If the file didn't exist on the previous revision,
    // Return the no such file at revision message.
    .catch(error => Observable.of((error.message: string) || ''))
    .map(committedContents => ({
      committedContents,
      revisionInfo,
    }));
}
