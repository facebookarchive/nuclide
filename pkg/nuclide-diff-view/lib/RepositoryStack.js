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
  RevisionsState,
} from './types';
import type {
  RevisionFileChanges,
  RevisionInfo,
} from '../../nuclide-hg-rpc/lib/HgService';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import {Emitter} from 'atom';
import {HgStatusToFileChangeStatus, FileChangeStatus, DiffOption} from './constants';
import {serializeAsyncCall} from '../../commons-node/promise';
import {notifyInternalError} from './notifications';
import {getLogger} from '../../nuclide-logging';
import {hgConstants} from '../../nuclide-hg-rpc';
import invariant from 'assert';
import {Observable} from 'rxjs';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {observableFromSubscribeFunction} from '../../commons-node/event';

const UPDATE_SELECTED_FILE_CHANGES_EVENT = 'update-selected-file-changes';
const UPDATE_DIRTY_FILES_EVENT = 'update-dirty-files';
const CHANGE_REVISIONS_STATE_EVENT = 'did-change-state-revisions';
const UPDATE_STATUS_DEBOUNCE_MS = 50;
const REVISION_STATE_TIMEOUT_MS = 50 * 1000;

export function getHeadRevision(revisions: Array<RevisionInfo>): ?RevisionInfo {
  const {HEAD_COMMIT_TAG} = hgConstants;
  return revisions.find(revision => revision.tags.includes(HEAD_COMMIT_TAG));
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

export default class RepositoryStack {

  _emitter: Emitter;
  _subscriptions: UniversalDisposable;
  _activeSubscriptions: ?UniversalDisposable;
  _dirtyFileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _selectedFileChanges: Map<NuclideUri, FileChangeStatusValue>;
  _repository: HgRepositoryClient;
  _selectedCompareCommitId: ?number;
  _serializedUpdateSelectedFileChanges: () => Promise<void>;
  _diffOption: DiffOptionType;

  constructor(repository: HgRepositoryClient, diffOption: DiffOptionType) {
    this._repository = repository;
    this._emitter = new Emitter();
    this._dirtyFileChanges = new Map();
    this._selectedFileChanges = new Map();
    this._selectedCompareCommitId = null;
    this._diffOption = diffOption;

    this._serializedUpdateSelectedFileChanges = serializeAsyncCall(
      () => this._updateSelectedFileChanges(),
    );
    // Get the initial project status, if it's not already there,
    // triggered by another integration, like the file tree.
    repository.getStatuses([repository.getProjectDirectory()]);
    this._subscriptions = new UniversalDisposable(
      // Do the lightweight dirty cache update to reflect the changes,
      // While only commit merge changes consumers wait for its results.
      repository.onDidChangeStatuses(this._updateDirtyFileChanges.bind(this)),
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
    if (this._activeSubscriptions != null) {
      return;
    }
    const revisionChanges = this._repository.observeRevisionChanges();
    const revisionStatusChanges = this._repository.observeRevisionStatusesChanges();
    const statusChanges = observableFromSubscribeFunction(
        this._repository.onDidChangeStatuses.bind(this._repository),
      )
      .debounceTime(UPDATE_STATUS_DEBOUNCE_MS)
      .startWith(null);

    const updateSelectedFiles = Observable.merge(revisionChanges, statusChanges)
      .switchMap(() =>
        // Ideally, Observables should have no side effects,
        // but here, that helps manage async code flows till migration complete to Observables.
        Observable.fromPromise(this._serializedUpdateSelectedFileChanges()),
      ).catch(error => {
        notifyInternalError(error);
        return Observable.empty();
      })
      .subscribe();

    const updateRevisionsStateSubscription =
      Observable.merge(revisionChanges, revisionStatusChanges)
        .subscribe(() => {
          this._emitter.emit(CHANGE_REVISIONS_STATE_EVENT);
        });

    this._activeSubscriptions = new UniversalDisposable(
      updateSelectedFiles,
      updateRevisionsStateSubscription,
    );
  }

  deactivate(): void {
    if (this._activeSubscriptions != null) {
      this._activeSubscriptions.dispose();
      this._activeSubscriptions = null;
    }
  }

  _updateDirtyFileChanges(): void {
    this._dirtyFileChanges = getDirtyFileChanges(this._repository);
    this._emitter.emit(UPDATE_DIRTY_FILES_EVENT);
  }

  _waitForValidRevisionsState(): Promise<void> {
    return Observable.of(this._repository.getCachedRevisions())
      .concat(this._repository.observeRevisionChanges())
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
    this._selectedFileChanges = await getSelectedFileChanges(
      this._repository,
      this._diffOption,
      revisionsState.revisions,
      revisionsState.compareCommitId,
    ).toPromise();
    this._emitter.emit(UPDATE_SELECTED_FILE_CHANGES_EVENT);
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
    // Prioritize the cached compaereCommitId, if it exists.
    // The user could have selected that from the timeline view.
    let compareCommitId = this._selectedCompareCommitId;
    if (!revisions.find(revision => revision.id === compareCommitId)) {
      // Invalidate if there there is no longer a revision with that id.
      compareCommitId = null;
    }
    const revisionStatuses = this._repository.getCachedRevisionStatuses();

    return {
      headCommitId: headRevision.id,
      compareCommitId,
      revisionStatuses,
      headToForkBaseRevisions: getHeadToForkBaseRevisions(revisions),
      revisions,
    };
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

    const committedContents = await this._repository
      .fetchFileContentAtRevision(filePath, `${compareCommitId}`)
      .toPromise()
      // If the file didn't exist on the previous revision,
      // Return the no such file at revision message.
      .catch(error => error.message || '');

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
  }
}
