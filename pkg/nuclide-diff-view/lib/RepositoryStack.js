'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LRUCache} from 'lru-cache';
import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';
import type {FileChangeStatusValue, HgDiffState, RevisionsState, DiffOptionType} from './types';
import type {
  RevisionFileChanges,
  RevisionInfo,
} from '../../nuclide-hg-repository-base/lib/HgService';
import type {NuclideUri} from '../../nuclide-remote-uri';

import {CompositeDisposable, Emitter} from 'atom';
import {HgStatusToFileChangeStatus, FileChangeStatus, DiffOption} from './constants';
import {arrayEqual} from '../../commons-node/collection';
import debounce from '../../commons-node/debounce';
import {serializeAsyncCall, retryLimit} from '../../commons-node/promise';
import {trackTiming} from '../../nuclide-analytics';
import {notifyInternalError} from './notifications';
import invariant from 'assert';
import LRU from 'lru-cache';

const UPDATE_SELECTED_FILE_CHANGES_EVENT = 'update-selected-file-changes';
const UPDATE_DIRTY_FILES_EVENT = 'update-dirty-files';
const CHANGE_REVISIONS_EVENT = 'did-change-revisions';
const UPDATE_STATUS_DEBOUNCE_MS = 50;

const FETCH_REV_INFO_RETRY_TIME_MS = 1000;
const FETCH_REV_INFO_MAX_TRIES = 5;

export default class RepositoryStack {

  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _dirtyFileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _selectedFileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _repository: HgRepositoryClient;
  _lastRevisionsState: ?RevisionsState;
  _revisionsStatePromise: ?Promise<RevisionsState>;
  _selectedCompareCommitId: ?number;
  _isActive: boolean;
  _serializedUpdateStackState: () => Promise<void>;
  _revisionIdToFileChanges: LRUCache<number, RevisionFileChanges>;
  _diffOption: DiffOptionType;

  constructor(repository: HgRepositoryClient, diffOption: DiffOptionType) {
    this._repository = repository;
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._dirtyFileChanges = new Map();
    this._selectedFileChanges = new Map();
    this._isActive = false;
    this._revisionIdToFileChanges = new LRU({max: 100});
    this._selectedCompareCommitId = null;
    this._lastRevisionsState = null;
    this._diffOption = diffOption;

    this._serializedUpdateStackState = serializeAsyncCall(
      () => this._tryUpdateStackState(),
    );
    const debouncedSerializedUpdateStackState = debounce(
      this._serializedUpdateStackState,
      UPDATE_STATUS_DEBOUNCE_MS,
      false,
    );
    this._serializedUpdateStackState();
    // Get the initial project status, if it's not already there,
    // triggered by another integration, like the file tree.
    repository.getStatuses([repository.getProjectDirectory()]);
    this._subscriptions.add(
      repository.onDidChangeStatuses(() => {
        // Do the lightweight dirty cache update to reflect the changes,
        // While only commit merge changes consumers wait for its results.
        this._updateDirtyFileChanges();
        debouncedSerializedUpdateStackState();
      }),
    );
  }

  setDiffOption(diffOption: DiffOptionType): void {
    if (this._diffOption === diffOption) {
      return;
    }
    this._diffOption = diffOption;
    this._updateSelectedFileChanges().catch(notifyInternalError);
  }

  activate(): void {
    if (this._isActive) {
      return;
    }
    this._isActive = true;
    this._serializedUpdateStackState();
  }

  deactivate(): void {
    this._isActive = false;
    this._revisionsStatePromise = null;
  }

  @trackTiming('diff-view.update-change-status')
  async _tryUpdateStackState(): Promise<void> {
    if (!this._isActive) {
      return;
    }
    try {
      await this._updateRevisionsState();
      if (!this._isActive) {
        return;
      }
      await this._updateSelectedFileChanges();
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

  async _updateRevisionsState(): Promise<void> {
    // We should only update the revision state when the repository is active.
    if (!this._isActive) {
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
      !arrayEqual(
        lastRevisionsState.revisions,
        revisionsState.revisions,
        (revision1, revision2) => revision1.id === revision2.id,
      )
    ) {
      this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);
    }
    this._lastRevisionsState = revisionsState;
  }

  /**
   * Update the file change state comparing the dirty filesystem status
   * to a selected commit.
   * That would be a merge of `hg status` with the diff from commits,
   * and `hg log --rev ${revId}` for every commit.
   */
  async _updateSelectedFileChanges(): Promise<void> {
    const revisionsState = await this.getCachedRevisionsStatePromise();
    switch (this._diffOption) {
      case DiffOption.DIRTY:
        this._selectedFileChanges = this._dirtyFileChanges;
        break;
      case DiffOption.COMPARE_COMMIT:
        if (
          revisionsState.compareCommitId == null ||
          revisionsState.compareCommitId === revisionsState.commitId
        ) {
          this._selectedFileChanges = this._dirtyFileChanges;
        } else {
          // No need to fetch every commit file changes unless requested.
          await this._updateSelectedChangesToCommit(
            revisionsState,
            revisionsState.compareCommitId,
          );
        }
        break;
      case DiffOption.LAST_COMMIT:
        const {revisions} = revisionsState;
        if (revisions.length <= 1) {
          this._selectedFileChanges = this._dirtyFileChanges;
        } else {
          await this._updateSelectedChangesToCommit(
            revisionsState,
            revisions[revisions.length - 2].id,
          );
        }
        break;
    }
    this._emitter.emit(UPDATE_SELECTED_FILE_CHANGES_EVENT);
  }

  async _updateSelectedChangesToCommit(
    revisionsState: RevisionsState,
    beforeCommitId: number,
  ): Promise<void> {
    const latestToOldesRevisions = revisionsState.revisions.slice().reverse();
    const revisionChanges = await this._fetchFileChangesForRevisions(
      latestToOldesRevisions.filter(revision => revision.id > beforeCommitId),
    );
    this._selectedFileChanges = this._mergeFileStatuses(
      this._dirtyFileChanges,
      revisionChanges,
    );
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
    if (!revisions.find(revision => revision.id === compareCommitId)) {
      // Invalidate if there there is no longer a revision with that id.
      compareCommitId = null;
    }
    return {
      revisions,
      commitId,
      compareCommitId,
    };
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
    const revisions = await retryLimit(
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
  async _fetchFileChangesForRevisions(
    revisions: Array<RevisionInfo>,
  ): Promise<Array<RevisionFileChanges>> {
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
        return changes;
      })
    );

    return revisionsFileHistory;
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

  getSelectedFileChanges(): Map<NuclideUri, FileChangeStatusValue> {
    return this._selectedFileChanges;
  }

  async fetchHgDiff(filePath: NuclideUri): Promise<HgDiffState> {
    const revisionsState = await this.getCachedRevisionsStatePromise();
    const {revisions, commitId} = revisionsState;
    // When `compareCommitId` is null, the `HEAD` commit contents is compared
    // to the filesystem, otherwise it compares that commit to filesystem.
    let compareCommitId = null;
    switch (this._diffOption) {
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
        throw new Error(`Invalid Diff Option: ${this._diffOption}`);
    }
    const committedContents = await this._repository
      .fetchFileContentAtRevision(filePath, compareCommitId ? `${compareCommitId}` : null)
      // If the file didn't exist on the previous revision, return empty contents.
      .catch(_err => '');

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
      revisions && revisions.find(check => check.id === revision.id),
      'Diff Viw Timeline: non-applicable selected revision',
    );

    this._selectedCompareCommitId = revisionsState.compareCommitId = revision.id;
    this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);

    invariant(
      this._diffOption === DiffOption.COMPARE_COMMIT,
      'Invalid Diff Option at setRevision time!',
    );
    await this._updateSelectedChangesToCommit(
      revisionsState,
      revision.id,
    );
    this._emitter.emit(UPDATE_SELECTED_FILE_CHANGES_EVENT);
  }

  onDidUpdateDirtyFileChanges(
    callback: () => void
  ): IDisposable {
    return this._emitter.on(UPDATE_DIRTY_FILES_EVENT, callback);
  }

  onDidUpdateSelectedFileChanges(
    callback: () => void
  ): IDisposable {
    return this._emitter.on(UPDATE_SELECTED_FILE_CHANGES_EVENT, callback);
  }

  onDidChangeRevisions(
    callback: (revisionsState: RevisionsState) => void
  ): IDisposable {
    return this._emitter.on(CHANGE_REVISIONS_EVENT, callback);
  }

  getRepository(): HgRepositoryClient {
    return this._repository;
  }

  commit(message: string): Promise<void> {
    return this._repository.commit(message);
  }

  amend(message: ?string): Promise<void> {
    return this._repository.amend(message);
  }

  revert(filePaths: Array<NuclideUri>): Promise<void> {
    return this._repository.revert(filePaths);
  }

  addAll(filePaths: Array<NuclideUri>): Promise<void> {
    return this._repository.addAll(filePaths);
  }

  dispose(): void {
    this._subscriptions.dispose();
    this._dirtyFileChanges.clear();
    this._selectedFileChanges.clear();
    this._revisionIdToFileChanges.reset();
  }
}
