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
import type {FileChangeStatusValue, HgDiffState, RevisionsState, DiffOptionType} from './types';
import type {
  RevisionFileChanges,
  RevisionInfo,
} from '../../nuclide-hg-repository-base/lib/HgService';
import type {NuclideUri} from '../../nuclide-remote-uri';

import {CompositeDisposable, Emitter} from 'atom';
import {HgStatusToFileChangeStatus, FileChangeStatus, DiffOption} from './constants';
import {array, promises, debounce} from '../../nuclide-commons';
import {trackTiming} from '../../nuclide-analytics';
import {notifyInternalError} from './notifications';
import invariant from 'assert';
import LRU from 'lru-cache';
import {getLogger} from '../../nuclide-logging';

const logger = getLogger();
const {serializeAsyncCall} = promises;
const UPDATE_COMMIT_MERGE_FILES_EVENT = 'update-commit-merge-files';
const UPDATE_DIRTY_FILES_EVENT = 'update-dirty-files';
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
  _commitMergeFileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _lastCommitMergeFileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _repository: HgRepositoryClient;
  _lastRevisionsState: ?RevisionsState;
  _revisionsStatePromise: ?Promise<RevisionsState>;
  _revisionsFileHistoryPromise: ?Promise<RevisionsFileHistory>;
  _lastRevisionsFileHistory: ?RevisionsFileHistory;
  _selectedCompareCommitId: ?number;
  _isActive: boolean;
  _serializedUpdateStatus: () => Promise<void>;
  _revisionIdToFileChanges: LRU<number, RevisionFileChanges>;

  constructor(repository: HgRepositoryClient) {
    this._repository = repository;
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._commitMergeFileChanges = new Map();
    this._lastCommitMergeFileChanges = new Map();
    this._dirtyFileChanges = new Map();
    this._isActive = false;
    this._revisionIdToFileChanges = new LRU({max: 100});
    this._selectedCompareCommitId = null;
    this._lastRevisionsFileHistory = null;
    this._lastRevisionsState = null;
    this._serializedUpdateStatus = serializeAsyncCall(() => this._updateChangedStatus());
    const debouncedSerializedUpdateStatus = debounce(
      this._serializedUpdateStatus,
      UPDATE_STATUS_DEBOUNCE_MS,
      false,
    );
    debouncedSerializedUpdateStatus();
    // Get the initial project status, if it's not already there,
    // triggered by another integration, like the file tree.
    repository.getStatuses([repository.getProjectDirectory()]);
    this._subscriptions.add(
      repository.onDidChangeStatuses(debouncedSerializedUpdateStatus),
    );
  }

  activate(): void {
    if (this._isActive) {
      return;
    }
    this._isActive = true;
    this._serializedUpdateStatus();
  }

  deactivate(): void {
    this._isActive = false;
  }

  @trackTiming('diff-view.update-change-status')
  async _updateChangedStatus(): Promise<void> {
    try {
      this._updateDirtyFileChanges();
      await this._updateCommitMergeFileChanges();
    } catch (error) {
      notifyInternalError(error);
    }
  }

  _updateDirtyFileChanges(): void {
    this._dirtyFileChanges = this._getDirtyChangedStatus();
    this._emitter.emit(UPDATE_DIRTY_FILES_EVENT);
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

  commit(message: string): Promise<void> {
    return this._repository.commit(message);
  }

  amend(message: string): Promise<void> {
    return this._repository.amend(message);
  }

  revert(filePaths: Array<NuclideUri>): Promise<void> {
    return this._repository.revert(filePaths);
  }

  add(filePaths: Array<NuclideUri>): Promise<void> {
    return this._repository.add(filePaths);
  }

  /**
   * Update the file change state comparing the dirty filesystem status
   * to a selected commit.
   * That would be a merge of `hg status` with the diff from commits,
   * and `hg log --rev ${revId}` for every commit.
   */
  async _updateCommitMergeFileChanges(): Promise<void> {
    // We should only update the revision state when the repository is active.
    if (!this._isActive) {
      this._revisionsStatePromise = null;
      return;
    }
    const lastRevisionsState = this._lastRevisionsState;
    const revisionsState = await this.getRevisionsStatePromise();
    // The revisions haven't changed if the revisions' ids are the same.
    // That's because commit ids are unique and incremental.
    // Also, any write operation will update them.
    // That way, we guarantee we only update the revisions state if the revisions are changed.
    if (
      lastRevisionsState == null ||
      !array.equal(
        lastRevisionsState.revisions,
        revisionsState.revisions,
        (revision1, revision2) => revision1.id === revision2.id,
      )
    ) {
      this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);
    }
    this._lastRevisionsState = revisionsState;

    // If the commits haven't changed ids, then thier diff haven't changed as well.
    let revisionsFileHistory = null;
    if (this._lastRevisionsFileHistory != null) {
      const fileHistoryRevisionIds = this._lastRevisionsFileHistory
        .map(revisionChanges => revisionChanges.id);
      const revisionIds = revisionsState.revisions.map(revision => revision.id);
      if (array.equal(revisionIds, fileHistoryRevisionIds)) {
        revisionsFileHistory = this._lastRevisionsFileHistory;
      }
    }

    // Fetch revisions history if revisions state have changed.
    if (revisionsFileHistory == null) {
      try {
        revisionsFileHistory = await this._getRevisionFileHistoryPromise(revisionsState);
      } catch (error) {
        logger.error(
          'Cannot fetch revision history: ' +
          '(could happen with pending source-control history writing operations)',
          error,
        );
        return;
      }
    }
    this._commitMergeFileChanges = this._computeCommitMergeFromHistory(
      revisionsState,
      revisionsFileHistory,
    );

    const lastCommitFileChanges = revisionsFileHistory.length <= 1
      ? null :
      revisionsFileHistory[revisionsFileHistory.length - 1].changes;

    this._lastCommitMergeFileChanges = this._mergeFileStatuses(
      this._dirtyFileChanges,
      lastCommitFileChanges == null ? [] : [lastCommitFileChanges],
    );
    this._emitter.emit(UPDATE_COMMIT_MERGE_FILES_EVENT);
  }

  getRevisionsStatePromise(): Promise<RevisionsState> {
    this._revisionsStatePromise = this._fetchRevisionsState().then(
      this._amendSelectedCompareCommitId.bind(this),
      error => {
        this._revisionsStatePromise = null;
        throw error;
      },
    );
    return this._revisionsStatePromise;
  }

  getCachedRevisionsStatePromise(): Promise<RevisionsState> {
    const revisionsStatePromise = this._revisionsStatePromise;
    if (revisionsStatePromise != null) {
      return revisionsStatePromise.then(this._amendSelectedCompareCommitId.bind(this));
    } else {
      return this.getRevisionsStatePromise();
    }
  }

  /**
   * Amend the revisions state with the latest selected valid compare commit id.
   */
  _amendSelectedCompareCommitId(revisionsState: RevisionsState): RevisionsState {
    const {commitId, revisions} = revisionsState;
    // Prioritize the cached compaereCommitId, if it exists.
    // The user could have selected that from the timeline view.
    let compareCommitId = this._selectedCompareCommitId;
    if (!array.find(revisions, revision => revision.id === compareCommitId)) {
      // Invalidate if there there is no longer a revision with that id.
      compareCommitId = null;
    }
    const latestToOldestRevisions = revisions.slice().reverse();
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

  _getRevisionFileHistoryPromise(
    revisionsState: RevisionsState,
  ): Promise<RevisionsFileHistory> {
    this._revisionsFileHistoryPromise = this._fetchRevisionsFileHistory(revisionsState)
      .then(revisionsFileHistory =>
        this._lastRevisionsFileHistory = revisionsFileHistory
      , error => {
        this._revisionsFileHistoryPromise = null;
        this._lastRevisionsFileHistory = null;
        throw error;
      });
    return this._revisionsFileHistoryPromise;
  }

  _getCachedRevisionFileHistoryPromise(
    revisionsState: RevisionsState,
  ): Promise<RevisionsFileHistory> {
    if (this._revisionsFileHistoryPromise != null) {
      return this._revisionsFileHistoryPromise;
    } else {
      return this._getRevisionFileHistoryPromise(revisionsState);
    }
  }

  @trackTiming('diff-view.fetch-revisions-state')
  async _fetchRevisionsState(): Promise<RevisionsState> {
    if (!this._isActive) {
      throw new Error('Diff View should not fetch revisions while not active');
    }
    // While rebasing, the common ancestor of `HEAD` and `BASE`
    // may be not applicable, but that's defined once the rebase is done.
    // Hence, we need to retry fetching the revision info (depending on the common ancestor)
    // because the watchman-based Mercurial updates doesn't consider or wait while rebasing.
    const revisions = await promises.retryLimit(
      () => this._repository.fetchRevisionInfoBetweenHeadAndBase(),
      result => result != null,
      FETCH_REV_INFO_MAX_TRIES,
      FETCH_REV_INFO_RETRY_TIME_MS,
    );
    if (revisions == null || revisions.length === 0) {
      throw new Error('Cannot fetch revision info needed!');
    }
    const commitId = revisions[revisions.length - 1].id;
    return {
      revisions,
      commitId,
      compareCommitId: null,
    };
  }

  @trackTiming('diff-view.fetch-revisions-change-history')
  async _fetchRevisionsFileHistory(revisionsState: RevisionsState): Promise<RevisionsFileHistory> {
    const {revisions} = revisionsState;

    // Revision ids are unique and don't change, except when the revision is amended/rebased.
    // Hence, it's cached here to avoid service calls when working on a stack of commits.
    const revisionsFileHistory = await Promise.all(revisions
      .map(async revision => {
        const {id} = revision;
        let changes = null;
        if (this._revisionIdToFileChanges.has(id)) {
          changes = this._revisionIdToFileChanges.get(id);
        } else {
          changes = await this._repository.fetchFilesChangedAtRevision(`${id}`);
          if (changes == null) {
            throw new Error(`Changes not available for revision: ${id}`);
          }
          this._revisionIdToFileChanges.set(id, changes);
        }
        return {id, changes};
      })
    );

    return revisionsFileHistory;
  }

  _computeCommitMergeFromHistory(
    revisionsState: RevisionsState,
    revisionsFileHistory: RevisionsFileHistory,
  ): Map<NuclideUri, FileChangeStatusValue> {

    const {commitId, compareCommitId} = revisionsState;
    // The status is fetched by merging the changes right after the `compareCommitId` if specified,
    // or `HEAD` if not.
    const startCommitId = compareCommitId ? (compareCommitId + 1) : commitId;
    // Get the revision changes that's newer than or is the current commit id.
    const commitRevisionsFileChanges = revisionsFileHistory
      .slice(1) // Exclude the BASE revision.
      .filter(revision => revision.id >= startCommitId)
      .map(revision => revision.changes);

    // The last status to merge is the dirty filesystem status.
    const mergedFileStatuses = this._mergeFileStatuses(
      this._dirtyFileChanges,
      commitRevisionsFileChanges,
    );
    return mergedFileStatuses;
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
      mergeStatusPaths(deleted, FileChangeStatus.REMOVED);
    }

    return mergedStatus;
  }

  getDirtyFileChanges(): Map<NuclideUri, FileChangeStatusValue> {
    return this._dirtyFileChanges;
  }

  getCommitMergeFileChanges(): Map<NuclideUri, FileChangeStatusValue> {
    return this._commitMergeFileChanges;
  }

  getLastCommitMergeFileChanges(): Map<NuclideUri, FileChangeStatusValue> {
    return this._lastCommitMergeFileChanges;
  }

  async fetchHgDiff(filePath: NuclideUri, diffOption: DiffOptionType): Promise<HgDiffState> {
    const revisionsState = await this.getCachedRevisionsStatePromise();
    const {revisions, commitId} = revisionsState;
    // When `compareCommitId` is null, the `HEAD` commit contents is compared
    // to the filesystem, otherwise it compares that commit to filesystem.
    let compareCommitId = null;
    switch (diffOption) {
      case DiffOption.DIRTY:
        compareCommitId = null;
        break;
      case DiffOption.LAST_COMMIT:
        compareCommitId = revisions.length <= 1
          ? null
          : revisions[revisions.length - 2].id;
        break;
      case DiffOption.COMPARE_COMMIT:
        compareCommitId = revisionsState.compareCommitId;
        break;
      default:
        throw new Error(`Invalid Diff Option: ${diffOption}`);
    }
    const committedContents = await this._repository
      .fetchFileContentAtRevision(filePath, compareCommitId ? `${compareCommitId}` : null)
      // If the file didn't exist on the previous revision, return empty contents.
      .then(contents => contents || '', _err => '');

    const fetchedRevisionId = compareCommitId != null ? compareCommitId : commitId;
    const [revisionInfo] = revisions.filter(revision => revision.id === fetchedRevisionId);
    invariant(
      revisionInfo,
      `Diff Viw Fetcher: revision with id ${fetchedRevisionId} not found`,
    );
    return {
      committedContents,
      revisionInfo,
    };
  }

  getTemplateCommitMessage(): Promise<?string> {
    return this._repository.getConfigValueAsync('committemplate.emptymsg');
  }

  async setRevision(revision: RevisionInfo): Promise<void> {
    const revisionsState = await this.getCachedRevisionsStatePromise();
    const {revisions} = revisionsState;

    invariant(
      revisions && array.find(revisions, check => check.id === revision.id),
      'Diff Viw Timeline: non-applicable selected revision',
    );

    this._selectedCompareCommitId = revisionsState.compareCommitId = revision.id;
    this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);

    const revisionsFileHistory = await this._getCachedRevisionFileHistoryPromise(revisionsState);
    this._commitMergeFileChanges = this._computeCommitMergeFromHistory(
      revisionsState,
      revisionsFileHistory,
    );
    this._emitter.emit(UPDATE_COMMIT_MERGE_FILES_EVENT);
  }

  onDidUpdateDirtyFileChanges(
    callback: () => void
  ): IDisposable {
    return this._emitter.on(UPDATE_DIRTY_FILES_EVENT, callback);
  }

  onDidUpdateCommitMergeFileChanges(
    callback: () => void
  ): IDisposable {
    return this._emitter.on(UPDATE_COMMIT_MERGE_FILES_EVENT, callback);
  }

  onDidChangeRevisions(
    callback: (revisionsState: RevisionsState) => void
  ): IDisposable {
    return this._emitter.on(CHANGE_REVISIONS_EVENT, callback);
  }

  getRepository(): HgRepositoryClient {
    return this._repository;
  }

  dispose(): void {
    this._subscriptions.dispose();
    this._dirtyFileChanges.clear();
    this._commitMergeFileChanges.clear();
    this._lastCommitMergeFileChanges.clear();
    this._revisionIdToFileChanges.reset();
  }
}
