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
import type {
  DiffOptionType,
  DiffStatusDisplay,
  FileChangeStatusValue,
  HgDiffState,
  RevisionsState,
} from './types';
import type {
  RevisionFileChanges,
  RevisionInfo,
} from '../../nuclide-hg-rpc/lib/HgService';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import {CompositeDisposable, Emitter} from 'atom';
import {HgStatusToFileChangeStatus, FileChangeStatus, DiffOption} from './constants';
import debounce from '../../commons-node/debounce';
import {serializeAsyncCall} from '../../commons-node/promise';
import {trackTiming} from '../../nuclide-analytics';
import {notifyInternalError} from './notifications';
import {getLogger} from '../../nuclide-logging';
import {hgConstants} from '../../nuclide-hg-rpc';
import invariant from 'assert';
import LRU from 'lru-cache';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {Observable} from 'rxjs';

const UPDATE_SELECTED_FILE_CHANGES_EVENT = 'update-selected-file-changes';
const UPDATE_DIRTY_FILES_EVENT = 'update-dirty-files';
const CHANGE_REVISIONS_STATE_EVENT = 'did-change-state-revisions';
const UPDATE_STATUS_DEBOUNCE_MS = 50;
const REVISION_STATE_TIMEOUT_MS = 50 * 1000;

type DiffStatusFetcher = (
  directoryPath: NuclideUri,
  revisions: Array<RevisionInfo>,
) => Promise<Map<number, DiffStatusDisplay>>;

let diffStatusFetcher;

function getDiffStatusFetcher(): DiffStatusFetcher {
  if (diffStatusFetcher != null) {
    return diffStatusFetcher;
  }
  try {
    // $FlowFB
    diffStatusFetcher = require('./fb/services').diffStatusFetcher;
  } catch (e) {
    diffStatusFetcher = async () => new Map();
  }
  return diffStatusFetcher;
}

function getHeadRevision(revisions: Array<RevisionInfo>): ?RevisionInfo {
  const {HEAD_COMMIT_TAG} = hgConstants;
  return revisions.find(revision => revision.tags.includes(HEAD_COMMIT_TAG));
}

export default class RepositoryStack {

  _emitter: Emitter;
  _subscriptions: CompositeDisposable;
  _dirtyFileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _selectedFileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _commitIdsToDiffStatuses: Map<number, DiffStatusDisplay>;
  _repository: HgRepositoryClient;
  _lastRevisionsState: ?RevisionsState;
  _selectedCompareCommitId: ?number;
  _isActive: boolean;
  _serializedUpdateStackState: () => Promise<void>;
  _serializedUpdateSelectedFileChanges: () => Promise<void>;
  _serializedUpdateDiffStatusForCommits: () => Promise<void>;
  _revisionIdToFileChanges: LRUCache<number, RevisionFileChanges>;
  _fileContentsAtCommitIds: LRUCache<number, Map<NuclideUri, string>>;
  _diffOption: DiffOptionType;

  constructor(repository: HgRepositoryClient, diffOption: DiffOptionType) {
    this._repository = repository;
    this._emitter = new Emitter();
    this._subscriptions = new CompositeDisposable();
    this._dirtyFileChanges = new Map();
    this._selectedFileChanges = new Map();
    this._isActive = false;
    this._revisionIdToFileChanges = new LRU({max: 100});
    this._fileContentsAtCommitIds = new LRU({max: 20});
    this._selectedCompareCommitId = null;
    this._lastRevisionsState = null;
    this._commitIdsToDiffStatuses = new Map();
    this._diffOption = diffOption;

    this._serializedUpdateStackState = serializeAsyncCall(
      () => this._tryUpdateStackState(),
    );
    this._serializedUpdateSelectedFileChanges = serializeAsyncCall(
      () => this._updateSelectedFileChanges(),
    );
    this._serializedUpdateDiffStatusForCommits = serializeAsyncCall(
      () => this._updateDiffStatusForCommits(),
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
      repository.onDidChangeRevisions(debouncedSerializedUpdateStackState),
    );
  }

  setDiffOption(diffOption: DiffOptionType): void {
    if (this._diffOption === diffOption) {
      return;
    }
    this._diffOption = diffOption;
    this._serializedUpdateSelectedFileChanges().catch(notifyInternalError);
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
    this._fileContentsAtCommitIds.reset();
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
      await this._serializedUpdateSelectedFileChanges();
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

  _updateRevisionsState(): void {
    // We should only update the revision state when the repository is active.
    if (!this._isActive) {
      return;
    }
    this._emitter.emit(CHANGE_REVISIONS_STATE_EVENT);
    this._serializedUpdateDiffStatusForCommits().catch(error => {
      getLogger().warn('Failed to update diff status for commits', error);
    });
  }

  async _updateDiffStatusForCommits(): Promise<void> {
    if (!this._isActive) {
      return;
    }
    const cachedRevisionsState = this.getCachedRevisionsState();
    if (cachedRevisionsState == null) {
      getLogger().warn('Cannot update diff statuses for null revisions state');
      return;
    }
    this._commitIdsToDiffStatuses = await getDiffStatusFetcher()(
      this._repository.getWorkingDirectory(),
      cachedRevisionsState.revisions,
    );
    // Emit the new revisions state with the diff statuses.
    this._emitter.emit(CHANGE_REVISIONS_STATE_EVENT);
  }

  _waitForValidRevisionsState(): Promise<void> {
    return Observable.of(this._repository.getCachedRevisions())
      .concat(observableFromSubscribeFunction(
        this._repository.onDidChangeRevisions.bind(this._repository)))
      .filter(revisions => getHeadRevision(revisions) != null)
      .take(1)
      .timeout(
        REVISION_STATE_TIMEOUT_MS,
        new Error('Timed out waiting for a valid revisions state'),
      ).ignoreElements()
      .toPromise();
  }

  /**
   * Update the file change state comparing the dirty filesystem status
   * to a selected commit.
   * That would be a merge of `hg status` with the diff from commits,
   * and `hg log --rev ${revId}` for every commit.
   */
  async _updateSelectedFileChanges(): Promise<void> {
    const revisionsState = this.getCachedRevisionsState();
    if (revisionsState == null) {
      getLogger().warn('Cannot update selected file changes for null revisions state');
      return;
    }
    switch (this._diffOption) {
      case DiffOption.DIRTY:
        this._selectedFileChanges = this._dirtyFileChanges;
        break;
      case DiffOption.COMPARE_COMMIT:
        if (
          revisionsState.compareCommitId == null ||
          revisionsState.compareCommitId === revisionsState.headCommitId
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
        const {headToForkBaseRevisions} = revisionsState;
        if (headToForkBaseRevisions.length <= 1) {
          this._selectedFileChanges = this._dirtyFileChanges;
        } else {
          await this._updateSelectedChangesToCommit(
            revisionsState,
            headToForkBaseRevisions[headToForkBaseRevisions.length - 2].id,
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
    const latestToOldesRevisions = revisionsState.headToForkBaseRevisions.slice().reverse();
    const revisionChanges = await this._fetchFileChangesForRevisions(
      latestToOldesRevisions.filter(revision => revision.id > beforeCommitId),
    );
    this._selectedFileChanges = this._mergeFileStatuses(
      this._dirtyFileChanges,
      revisionChanges,
    );
  }

  refreshRevisionsState(): void {
    this._repository.refreshRevisions();
  }

  getCachedRevisionsState(): ?RevisionsState {
    return this._createRevisionsState(this._repository.getCachedRevisions());
  }

  /**
   * Amend the revisions state with the latest selected valid compare commit id.
   */
  _createRevisionsState(revisions: Array<RevisionInfo>): ?RevisionsState {
    const headRevision = getHeadRevision(revisions);
    if (headRevision == null) {
      return null;
    }
    const {CommitPhase} = hgConstants;
    const hashToRevisionInfo = new Map(revisions.map(revision => [revision.hash, revision]));
    // Prioritize the cached compaereCommitId, if it exists.
    // The user could have selected that from the timeline view.
    let compareCommitId = this._selectedCompareCommitId;
    if (!revisions.find(revision => revision.id === compareCommitId)) {
      // Invalidate if there there is no longer a revision with that id.
      compareCommitId = null;
    }
    const diffStatuses = this._commitIdsToDiffStatuses;

    // `headToForkBaseRevisions` should have the public commit at the fork base as the first.
    // and the rest of the current `HEAD` stack in order with the `HEAD` being last.
    const headToForkBaseRevisions = [];
    let parentRevision = headRevision;
    while (parentRevision != null && parentRevision.phase !== CommitPhase.PUBLIC) {
      headToForkBaseRevisions.unshift(parentRevision);
      parentRevision = hashToRevisionInfo.get(parentRevision.parents[0]);
    }
    if (parentRevision != null) {
      headToForkBaseRevisions.unshift(parentRevision);
    }

    return {
      headCommitId: headRevision.id,
      compareCommitId,
      diffStatuses,
      headToForkBaseRevisions,
      revisions,
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
      }),
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
    // During a initialization, rebase or histedit,
    // the loaded revisions may not have a head revision to be able to diff against.
    await this._waitForValidRevisionsState();

    const revisionsState = this.getCachedRevisionsState();
    if (revisionsState == null) {
      throw new Error('Cannot fetch hg diff while revisions not yet fetched!');
    }
    const {headToForkBaseRevisions, headCommitId} = revisionsState;
    // When `compareCommitId` is null, the `HEAD` commit contents is compared
    // to the filesystem, otherwise it compares that commit to filesystem.
    let compareCommitId;
    switch (this._diffOption) {
      case DiffOption.DIRTY:
        compareCommitId = headCommitId;
        break;
      case DiffOption.LAST_COMMIT:
        compareCommitId = headToForkBaseRevisions.length > 1
          ? headToForkBaseRevisions[headToForkBaseRevisions.length - 2].id
          : headCommitId;
        break;
      case DiffOption.COMPARE_COMMIT:
        compareCommitId = revisionsState.compareCommitId || headCommitId;
        break;
      default:
        throw new Error(`Invalid Diff Option: ${this._diffOption}`);
    }

    const revisionInfo = headToForkBaseRevisions.find(
      revision => revision.id === compareCommitId,
    );
    invariant(
      revisionInfo,
      `Diff Viw Fetcher: revision with id ${compareCommitId} not found`,
    );

    if (!this._fileContentsAtCommitIds.has(compareCommitId)) {
      this._fileContentsAtCommitIds.set(compareCommitId, new Map());
    }
    const fileContentsAtCommit = this._fileContentsAtCommitIds.get(compareCommitId);
    let committedContents;
    if (fileContentsAtCommit.has(filePath)) {
      committedContents = fileContentsAtCommit.get(filePath);
      invariant(committedContents != null);
    } else {
      committedContents = await this._repository
        .fetchFileContentAtRevision(filePath, compareCommitId.toString())
        // If the file didn't exist on the previous revision, return empty contents.
        .catch(_err => '');
      fileContentsAtCommit.set(filePath, committedContents);
    }

    return {
      committedContents,
      revisionInfo,
    };
  }

  async setCompareRevision(revision: RevisionInfo): Promise<void> {
    const revisionsState = this.getCachedRevisionsState();
    if (revisionsState == null) {
      throw new Error('Cannot set compare revision on a null revisions state');
    }
    const {headToForkBaseRevisions} = revisionsState;

    invariant(
      headToForkBaseRevisions && headToForkBaseRevisions.find(check => check.id === revision.id),
      'Diff Viw Timeline: non-applicable selected revision',
    );

    this._selectedCompareCommitId = revision.id;
    this._emitter.emit(CHANGE_REVISIONS_STATE_EVENT);

    invariant(
      this._diffOption === DiffOption.COMPARE_COMMIT,
      'Invalid Diff Option at setRevision time!',
    );
    await this._serializedUpdateSelectedFileChanges().catch(notifyInternalError);
  }

  onDidUpdateDirtyFileChanges(
    callback: () => void,
  ): IDisposable {
    return this._emitter.on(UPDATE_DIRTY_FILES_EVENT, callback);
  }

  onDidUpdateSelectedFileChanges(
    callback: () => void,
  ): IDisposable {
    return this._emitter.on(UPDATE_SELECTED_FILE_CHANGES_EVENT, callback);
  }

  onDidChangeRevisionsState(
    callback: () => void,
  ): IDisposable {
    return this._emitter.on(CHANGE_REVISIONS_STATE_EVENT, callback);
  }

  getRepository(): HgRepositoryClient {
    return this._repository;
  }

  dispose(): void {
    this.deactivate();
    this._subscriptions.dispose();
    this._dirtyFileChanges.clear();
    this._selectedFileChanges.clear();
    this._revisionIdToFileChanges.reset();
  }
}
