'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HgRepositoryClient} from 'nuclide-hg-repository-client';
import type {FileChangeStatusValue, HgDiffState, RevisionsState} from './types';
import type {RevisionFileChanges} from 'nuclide-hg-repository-base/lib/hg-constants';
import type {NuclideUri} from 'nuclide-remote-uri';

import invariant from 'assert';
import {CompositeDisposable, Emitter} from 'atom';
import {HgStatusToFileChangeStatus, FileChangeStatus} from './constants';
import {getFileSystemContents} from './utils';
import {array, promises, debounce} from 'nuclide-commons';
import {notifyInternalError} from './notifications';

const {RequestSerializer, serializeAsyncCall} = promises;
const CHANGE_COMPARE_STATUS_EVENT = 'did-change-compare-status';
const CHANGE_DIRTY_STATUS_EVENT = 'did-change-dirty-status';
const CHANGE_REVISIONS_EVENT = 'did-change-revisions';
const UPDATE_STATUS_DEBOUNCE_MS = 2000;

const FETCH_REV_INFO_RETRY_TIME_MS = 1000;
const FETCH_REV_INFO_MAX_TRIES = 5;

type RevisionsFileHistory = Array<{
  id: number;
  changes: RevisionFileChanges;
}>;

export default class RepositoryStack {

  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _dirtyFileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _compareFileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _repository: HgRepositoryClient;
  _revisionsState: ?RevisionsState;
  _revisionsStateRequests: RequestSerializer;
  _revisionsFileHistory: ?RevisionsFileHistory;

  constructor(repository: HgRepositoryClient) {
    this._repository = repository;
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._compareFileChanges = new Map();
    this._dirtyFileChanges = new Map();
    this._revisionsStateRequests = new RequestSerializer();
    const debouncedBoundUpdateStatus = debounce(
      serializeAsyncCall(() => this._updateChangedStatus()),
      UPDATE_STATUS_DEBOUNCE_MS,
      false,
    );
    debouncedBoundUpdateStatus();
    // Get the initial project status, if it's not already there,
    // triggered by another integration, like the file tree.
    repository.getStatuses([repository.getProjectDirectory()]);
    this._subscriptions.add(
      repository.onDidChangeStatuses(debouncedBoundUpdateStatus)
    );
  }

  async _updateChangedStatus(): Promise<void> {
    try {
      this._updateDirtyFileChanges();
      await this._updateCompareFileChanges();
    } catch(error) {
      notifyInternalError(error);
    }
  }

  _updateDirtyFileChanges(): void {
    this._dirtyFileChanges = this._getDirtyChangedStatus();
    this._emitter.emit(CHANGE_DIRTY_STATUS_EVENT, this._dirtyFileChanges);
  }

  _getDirtyChangedStatus(): Map<NuclideUri, FileChangeStatusValue> {
    const dirtyFileChanges = new Map();
    const statuses = this._repository.getAllPathStatuses();
    for (const filePath in statuses) {
      const changeStatus = HgStatusToFileChangeStatus[statuses[filePath]];
      if (changeStatus != null) {
        dirtyFileChanges.set(filePath, changeStatus);
      }
    }
    return dirtyFileChanges;
  }

  /**
   * Update the file change state comparing the dirty filesystem status
   * to a selected commit.
   * That would be a merge of `hg status` with the diff from commits,
   * and `hg log --rev ${revId}` for every commit.
   */
  async _updateCompareFileChanges(): Promise<void> {
    const {status, result} = await this._revisionsStateRequests.run(this._fetchRevisionsState());
    if (status === 'outdated') {
      return;
    }
    this._revisionsState = result;
    this._emitter.emit(CHANGE_REVISIONS_EVENT, this._revisionsState);
    const {
      revisionsHistory,
      compareChanges,
    } = await this._fetchCompareAndHistoryChanges();
    this._revisionsFileHistory = revisionsHistory;
    this._compareFileChanges = compareChanges;
    this._emitter.emit(CHANGE_COMPARE_STATUS_EVENT, this._compareFileChanges);
  }

  async _fetchRevisionsState(): Promise<RevisionsState> {
    // While rebasing, the common ancestor of `HEAD` and `BASE`
    // may be not applicable, but that's defined once the rebase is done.
    // Hence, we need to retry fetching the revision info (depending on the common ancestor)
    // because the watchman-based Mercurial updates doesn't consider or wait while rebasing.
    const revisions = await promises.retryLimit(
      () => this._repository.fetchRevisionInfoBetweenHeadAndBase(),
      (result) => result != null,
      FETCH_REV_INFO_MAX_TRIES,
      FETCH_REV_INFO_RETRY_TIME_MS,
    );
    /* eslint-enable no-await-in-loop */
    if (revisions == null) {
      throw new Error('Cannot fetch revision info needed!');
    }
    // Prioritize the cached compaereCommitId, if it exists.
    // The user could have selected that from the timeline view.
    let {compareCommitId} = this._revisionsState || {};
    if (!array.find(revisions, revision => revision.id === compareCommitId)) {
      // Invalidate if there there is no longer a revision with that id.
      compareCommitId = null;
    }
    const latestToOldestRevisions = revisions.slice().reverse();
    const commitId = latestToOldestRevisions[0].id;
    if (compareCommitId == null && latestToOldestRevisions.length > 1) {
      // If the user has already committed, most of the times, he'd be working on an amend.
      // So, the heuristic here is to compare against the previous version,
      // not the just-committed one, while the revisions timeline
      // would give a way to specify otherwise.
      compareCommitId = latestToOldestRevisions[1].id;
    }
    return {
      revisions,
      commitId,
      compareCommitId,
    };
  }

  async _fetchCompareAndHistoryChanges()
  : Promise<{
    revisionsHistory: RevisionsFileHistory;
    compareChanges: Map<NuclideUri, FileChangeStatusValue>;
  }> {
    invariant(this._revisionsState);
    const {revisions, commitId, compareCommitId} = this._revisionsState;

    const revisionsFileHistory = await Promise.all(revisions
      .slice(1) // Exclude the BASE revision.
      .map(async(revision) => {
        const {id} = revision;
        const changes = await this._repository.fetchFilesChangedAtRevision(`${id}`);
        return {id, changes};
      })
    );

    // The status is fetched by merging the changes right after the `compareCommitId` if specified,
    // or `HEAD` if not.
    const startCommitId = compareCommitId ? (compareCommitId + 1) : commitId;
    // Get the revision changes that's newer than or is the current commit id.
    const compareRevisionsFileChanges = revisionsFileHistory
      .filter(revision => revision.id >= startCommitId)
      .map(revision => revision.changes);

    // The last status to merge is the dirty filesystem status.
    const mergedFileStatuses = this._mergeFileStatuses(
      this._dirtyFileChanges,
      compareRevisionsFileChanges,
    );
    return {
      revisionsHistory: revisionsFileHistory,
      compareChanges: mergedFileStatuses,
    };
  }

  /**
   * Merges the file change statuses of the dirty filesystem state with
   * the revision changes, where dirty changes and more recent revisions
   * take priority in deciding which status a file is in.
   */
  _mergeFileStatuses(
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
      mergeStatusPaths(deleted, FileChangeStatus.DELETED);
    }

    return mergedStatus;
  }

  getDirtyFileChanges(): Map<NuclideUri, FileChangeStatusValue> {
    return this._dirtyFileChanges;
  }

  getCompareFileChanges(): Map<NuclideUri, FileChangeStatusValue> {
    return this._compareFileChanges;
  }

  getRevisionsState(): ?RevisionsState {
    return this._revisionsState;
  }

  async fetchHgDiff(filePath: NuclideUri): Promise<HgDiffState> {
    const {compareCommitId} = await this._revisionsStateRequests.waitForLatestResult();
    const committedContentsPromise = this._repository
      .fetchFileContentAtRevision(filePath, `${compareCommitId}`)
      // If the file didn't exist on the previous revision, return empty contents.
      .then(contents => contents || '', err => '');

    const filesystemContentsPromise = getFileSystemContents(filePath);

    const [
      committedContents,
      filesystemContents,
    ] = await Promise.all([committedContentsPromise, filesystemContentsPromise]);
    return {
      committedContents,
      filesystemContents,
    };
  }

  onDidChangeDirtyStatus(
    callback: (fileChanges: Map<NuclideUri, FileChangeStatusValue>) => void
  ): atom$Disposable {
    return this._emitter.on(CHANGE_DIRTY_STATUS_EVENT, callback);
  }

  onDidChangeCompareStatus(
    callback: (fileChanges: Map<NuclideUri, FileChangeStatusValue>) => void
  ): atom$Disposable {
    return this._emitter.on(CHANGE_COMPARE_STATUS_EVENT, callback);
  }

  onDidChangeRevisions(
    callback: (revisionsState: RevisionsState) => void
  ): atom$Disposable {
    return this._emitter.on(CHANGE_REVISIONS_EVENT, callback);
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}
