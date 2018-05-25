/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {DeadlineRequest} from 'nuclide-commons/promise';
import typeof * as HgService from '../../nuclide-hg-rpc/lib/HgService';
import type {
  AmendModeValue,
  BookmarkInfo,
  CheckoutOptions,
  HgRepositorySubscriptions,
  DiffInfo,
  LineDiff,
  OperationProgress,
  RevisionInfo,
  RevisionShowInfo,
  MergeConflicts,
  RevisionFileChanges,
  StatusCodeNumberValue,
  StatusCodeIdValue,
  VcsLogResponse,
  RevisionInfoFetched,
} from '../../nuclide-hg-rpc/lib/HgService';
import type {LegacyProcessMessage} from 'nuclide-commons/process';
import type {LRUCache} from 'lru-cache';
import type {ConnectableObservable} from 'rxjs';

import nuclideUri from 'nuclide-commons/nuclideUri';
import {timeoutAfterDeadline} from 'nuclide-commons/promise';
import {stringifyError} from 'nuclide-commons/string';
import {Emitter} from 'event-kit';
import {
  cacheWhileSubscribed,
  fastDebounce,
  compact,
} from 'nuclide-commons/observable';
import RevisionsCache from './RevisionsCache';
import {
  StatusCodeIdToNumber,
  StatusCodeNumber,
} from '../../nuclide-hg-rpc/lib/hg-constants';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import LRU from 'lru-cache';
import observePaneItemVisibility from 'nuclide-commons-atom/observePaneItemVisibility';
import {getLogger} from 'log4js';
import nullthrows from 'nullthrows';

const STATUS_DEBOUNCE_DELAY_MS = 300;
const REVISION_DEBOUNCE_DELAY = 300;
const BOOKMARKS_DEBOUNCE_DELAY = 200;
const FETCH_BOOKMARKS_TIMEOUT = 15 * 1000;

export type RevisionStatusDisplay = {
  id: number,
  name: string,
  className: ?string,
  latestDiff: number, // id of the latest diff within this revision
  seriesLandBlocker?: string,
  seriesLandBlockerMessage?: string,
};

type HgRepositoryOptions = {
  /** The origin URL of this repository. */
  originURL: ?string,

  /** The working directory of this repository. */
  workingDirectory: atom$Directory | RemoteDirectory,

  /** The root directory that is opened in Atom, which this Repository serves. */
  projectRootDirectory?: atom$Directory,
};

/**
 *
 * Section: Constants, Type Definitions
 *
 */

const DID_CHANGE_CONFLICT_STATE = 'did-change-conflict-state';

export type RevisionStatuses = Map<number, RevisionStatusDisplay>;

type RevisionStatusCache = {
  getCachedRevisionStatuses(): Map<number, RevisionStatusDisplay>,
  observeRevisionStatusesChanges(): Observable<RevisionStatuses>,
  refresh(): void,
};

function getRevisionStatusCache(
  revisionsCache: RevisionsCache,
  workingDirectoryPath: string,
): RevisionStatusCache {
  try {
    // $FlowFB
    const FbRevisionStatusCache = require('./fb/RevisionStatusCache').default;
    return new FbRevisionStatusCache(revisionsCache, workingDirectoryPath);
  } catch (e) {
    return {
      getCachedRevisionStatuses() {
        return new Map();
      },
      observeRevisionStatusesChanges() {
        return Observable.empty();
      },
      refresh() {},
    };
  }
}

/**
 *
 * Section: HgRepositoryClient
 *
 */

/**
 * HgRepositoryClient runs on the machine that Nuclide/Atom is running on.
 * It is the interface that other Atom packages will use to access Mercurial.
 * It caches data fetched from an HgService.
 * It implements the same interface as GitRepository, (https://atom.io/docs/api/latest/GitRepository)
 * in addition to providing asynchronous methods for some getters.
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {AdditionalLogFile} from '../../nuclide-logging/lib/rpc-types';
import type {RemoteDirectory} from '../../nuclide-remote-connection';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {mapTransform} from 'nuclide-commons/collection';

export type HgStatusChanges = {
  statusChanges: Observable<Map<NuclideUri, StatusCodeNumberValue>>,
  isCalculatingChanges: Observable<boolean>,
};

export class HgRepositoryClient {
  // An instance of HgRepositoryClient may be cloned to share the subscriptions
  // across multiple atom projects in the same hg repository, but allow
  // overriding of certain functionality depending on project root. To make sure
  // that changes to member vars are seen between all cloned instances, wrap
  // them in this object.
  // Not all properties need to be shared, but it was easier for the time-being
  // to do so. The only properties that TRULY need to be shared are those that
  // are assigned to from a cloned instance. A future refactor could possibly
  // better separate between those that are needed to be shared and those that
  // aren't. An even better--but more involved--future refactor could possibly
  // eliminate all instances of assigning to a member property from a cloned
  // instance in the first place.
  // Do not reassign this object.
  _sharedMembers: {
    rootRepo: HgRepositoryClient,
    path: string,
    workingDirectory: atom$Directory | RemoteDirectory,
    workingDirectoryPath: string,
    projectDirectory: ?atom$Directory,
    repoSubscriptions: Promise<?HgRepositorySubscriptions>,
    originURL: ?string,
    service: HgService,
    emitter: Emitter,
    subscriptions: UniversalDisposable,
    hgStatusCache: Map<NuclideUri, StatusCodeNumberValue>, // legacy, only for uncommitted
    hgUncommittedStatusChanges: HgStatusChanges,
    hgHeadStatusChanges: HgStatusChanges,
    hgStackStatusChanges: HgStatusChanges,
    revisionsCache: RevisionsCache,
    revisionStatusCache: RevisionStatusCache,
    revisionIdToFileChanges: LRUCache<string, RevisionFileChanges>,
    fileContentsAtRevisionIds: LRUCache<string, Map<NuclideUri, string>>,
    currentHeadId: ?string,
    bookmarks: BehaviorSubject<{
      isLoading: boolean,
      bookmarks: Array<BookmarkInfo>,
    }>,

    isInConflict: boolean,
    isDestroyed: boolean,
    isFetchingPathStatuses: Subject<boolean>,
    manualStatusRefreshRequests: Subject<void>,

    // absolute path of file to DiffInfo
    bufferDiffsFromHeadCache: Map<NuclideUri, DiffInfo>,
  };

  constructor(
    repoPath: string,
    hgService: HgService,
    options: HgRepositoryOptions,
  ) {
    // $FlowFixMe - by the end of the constructor, all the members should be initialized
    this._sharedMembers = {};

    this._sharedMembers.rootRepo = this;
    this._sharedMembers.path = repoPath;
    this._sharedMembers.workingDirectory = options.workingDirectory;
    this._sharedMembers.workingDirectoryPath = options.workingDirectory.getPath();
    this._sharedMembers.projectDirectory = options.projectRootDirectory;
    this._sharedMembers.originURL = options.originURL;
    this._sharedMembers.service = hgService;
    this._sharedMembers.isInConflict = false;
    this._sharedMembers.isDestroyed = false;
    this._sharedMembers.revisionsCache = new RevisionsCache(
      this._sharedMembers.workingDirectoryPath,
      hgService,
    );
    this._sharedMembers.revisionStatusCache = getRevisionStatusCache(
      this._sharedMembers.revisionsCache,
      this._sharedMembers.workingDirectory.getPath(),
    );
    this._sharedMembers.revisionIdToFileChanges = new LRU({max: 100});
    this._sharedMembers.fileContentsAtRevisionIds = new LRU({max: 20});

    this._sharedMembers.emitter = new Emitter();
    this._sharedMembers.subscriptions = new UniversalDisposable(
      this._sharedMembers.emitter,
    );
    this._sharedMembers.isFetchingPathStatuses = new Subject();
    this._sharedMembers.manualStatusRefreshRequests = new Subject();
    this._sharedMembers.hgStatusCache = new Map();
    this._sharedMembers.bookmarks = new BehaviorSubject({
      isLoading: true,
      bookmarks: [],
    });

    this._sharedMembers.bufferDiffsFromHeadCache = new Map();

    this._sharedMembers.repoSubscriptions = this._sharedMembers.service
      .createRepositorySubscriptions(this._sharedMembers.workingDirectoryPath)
      .catch(error => {
        atom.notifications.addWarning(
          'Mercurial: failed to subscribe to watchman!',
        );
        getLogger('nuclide-hg-repository-client').error(
          `Failed to subscribe to watchman in ${
            this._sharedMembers.workingDirectoryPath
          }`,
          error,
        );
        return null;
      });
    const fileChanges = this._tryObserve(s =>
      s.observeFilesDidChange().refCount(),
    );
    const repoStateChanges = Observable.merge(
      this._tryObserve(s => s.observeHgRepoStateDidChange().refCount()),
      this._sharedMembers.manualStatusRefreshRequests,
    );
    const activeBookmarkChanges = this._tryObserve(s =>
      s.observeActiveBookmarkDidChange().refCount(),
    );
    const allBookmarkChanges = this._tryObserve(s =>
      s.observeBookmarksDidChange().refCount(),
    );
    const conflictStateChanges = this._tryObserve(s =>
      s.observeHgConflictStateDidChange().refCount(),
    );
    const commitChanges = this._tryObserve(s =>
      s.observeHgCommitsDidChange().refCount(),
    );

    this._sharedMembers.hgUncommittedStatusChanges = this._observeStatus(
      fileChanges,
      repoStateChanges,
      () =>
        this._sharedMembers.service.fetchStatuses(
          this._sharedMembers.workingDirectoryPath,
        ),
    );

    this._sharedMembers.hgStackStatusChanges = this._observeStatus(
      fileChanges,
      repoStateChanges,
      () =>
        this._sharedMembers.service.fetchStackStatuses(
          this._sharedMembers.workingDirectoryPath,
        ),
    );

    this._sharedMembers.hgHeadStatusChanges = this._observeStatus(
      fileChanges,
      repoStateChanges,
      () =>
        this._sharedMembers.service.fetchHeadStatuses(
          this._sharedMembers.workingDirectoryPath,
        ),
    );

    const statusChangesSubscription = this._sharedMembers.hgUncommittedStatusChanges.statusChanges.subscribe(
      statuses => {
        this._sharedMembers.hgStatusCache = statuses;
        this._sharedMembers.emitter.emit('did-change-statuses');
      },
    );

    const shouldRevisionsUpdate = Observable.merge(
      this._sharedMembers.bookmarks.asObservable(),
      commitChanges,
      repoStateChanges,
    ).let(fastDebounce(REVISION_DEBOUNCE_DELAY));

    const bookmarksUpdates = Observable.merge(
      activeBookmarkChanges,
      allBookmarkChanges,
    )
      .startWith(null)
      .let(fastDebounce(BOOKMARKS_DEBOUNCE_DELAY))
      .switchMap(() =>
        Observable.defer(() => {
          return Observable.fromPromise(
            this._sharedMembers.service.fetchBookmarks(
              this._sharedMembers.workingDirectoryPath,
            ),
          ).timeout(FETCH_BOOKMARKS_TIMEOUT);
        })
          .retry(2)
          .catch(error => {
            getLogger('nuclide-hg-repository-client').error(
              'failed to fetch bookmarks info:',
              error,
            );
            return Observable.empty();
          }),
      );

    this._sharedMembers.subscriptions.add(
      statusChangesSubscription,
      bookmarksUpdates.subscribe(bookmarks =>
        this._sharedMembers.bookmarks.next({isLoading: false, bookmarks}),
      ),
      conflictStateChanges.subscribe(this._conflictStateChanged.bind(this)),
      shouldRevisionsUpdate.subscribe(() => {
        this._sharedMembers.revisionsCache.refreshRevisions();
      }),
    );
  }

  // A single root HgRepositoryClient can back multiple HgRepositoryClients
  // via differential inheritance. This gets the 'original' HgRepositoryClient
  getRootRepoClient(): HgRepositoryClient {
    return this._sharedMembers.rootRepo;
  }

  // this._repoSubscriptions can potentially fail if Watchman fails.
  // The current behavior is to behave as if no changes ever occur.
  _tryObserve<T>(
    observe: (s: HgRepositorySubscriptions) => Observable<T>,
  ): Observable<T> {
    return Observable.fromPromise(
      this._sharedMembers.repoSubscriptions,
    ).switchMap(repoSubscriptions => {
      if (repoSubscriptions == null) {
        return Observable.never();
      }
      return observe(repoSubscriptions);
    });
  }

  async getAdditionalLogFiles(
    deadline: DeadlineRequest,
  ): Promise<Array<AdditionalLogFile>> {
    const path = this._sharedMembers.workingDirectory.getPath();
    const prefix = nuclideUri.isRemote(path)
      ? `${nuclideUri.getHostname(path)}:`
      : '';
    const results = await timeoutAfterDeadline(
      deadline,
      this._sharedMembers.service.getAdditionalLogFiles(
        this._sharedMembers.workingDirectoryPath,
        deadline - 1000,
      ),
    ).catch(e => [{title: `${path}:hg`, data: stringifyError(e)}]);
    return results.map(log => ({...log, title: prefix + log.title}));
  }

  _observeStatus(
    fileChanges: Observable<Array<string>>,
    repoStateChanges: Observable<void>,
    fetchStatuses: () => ConnectableObservable<
      Map<NuclideUri, StatusCodeIdValue>,
    >,
  ): HgStatusChanges {
    const triggers = Observable.merge(fileChanges, repoStateChanges)
      .let(fastDebounce(STATUS_DEBOUNCE_DELAY_MS))
      .share()
      .startWith(null);
    // Share comes before startWith. That's because fileChanges/repoStateChanges
    // are already hot and can be shared fine. But we want both our subscribers,
    // statusChanges and isCalculatingChanges, to pick up their own copy of
    // startWith(null) no matter which order they subscribe.

    const statusChanges = cacheWhileSubscribed(
      triggers
        .switchMap(() => {
          this._sharedMembers.isFetchingPathStatuses.next(true);
          return fetchStatuses()
            .refCount()
            .catch(error => {
              getLogger('nuclide-hg-repository-client').error(
                'HgService cannot fetch statuses',
                error,
              );
              return Observable.empty();
            })
            .finally(() => {
              this._sharedMembers.isFetchingPathStatuses.next(false);
            });
        })
        .map(uriToStatusIds =>
          mapTransform(uriToStatusIds, (v, k) => StatusCodeIdToNumber[v]),
        ),
    );

    const isCalculatingChanges = cacheWhileSubscribed(
      Observable.merge(
        triggers.map(_ => true),
        statusChanges.map(_ => false),
      ).distinctUntilChanged(),
    );

    return {statusChanges, isCalculatingChanges};
  }

  destroy() {
    if (this._sharedMembers.isDestroyed) {
      return;
    }
    this._sharedMembers.isDestroyed = true;
    this._sharedMembers.emitter.emit('did-destroy');
    this._sharedMembers.subscriptions.dispose();
    this._sharedMembers.revisionIdToFileChanges.reset();
    this._sharedMembers.fileContentsAtRevisionIds.reset();
    this._sharedMembers.repoSubscriptions.then(repoSubscriptions => {
      if (repoSubscriptions != null) {
        repoSubscriptions.dispose();
      }
    });
  }

  isDestroyed(): boolean {
    return this._sharedMembers.isDestroyed;
  }

  _conflictStateChanged(isInConflict: boolean): void {
    this._sharedMembers.isInConflict = isInConflict;
    this._sharedMembers.emitter.emit(DID_CHANGE_CONFLICT_STATE);
  }

  /**
   *
   * Section: Event Subscription
   *
   */

  onDidDestroy(callback: () => mixed): IDisposable {
    return this._sharedMembers.emitter.on('did-destroy', callback);
  }

  onDidChangeStatus(
    callback: (event: {
      path: string,
      pathStatus: StatusCodeNumberValue,
    }) => mixed,
  ): IDisposable {
    return this._sharedMembers.emitter.on('did-change-status', callback);
  }

  observeBookmarks(): Observable<Array<BookmarkInfo>> {
    return this._sharedMembers.bookmarks
      .asObservable()
      .filter(b => !b.isLoading)
      .map(b => b.bookmarks);
  }

  observeRevisionChanges(): Observable<RevisionInfoFetched> {
    return this._sharedMembers.revisionsCache.observeRevisionChanges();
  }

  observeIsFetchingRevisions(): Observable<boolean> {
    return this._sharedMembers.revisionsCache.observeIsFetchingRevisions();
  }

  observeIsFetchingPathStatuses(): Observable<boolean> {
    return this._sharedMembers.isFetchingPathStatuses.asObservable();
  }

  observeRevisionStatusesChanges(): Observable<RevisionStatuses> {
    return this._sharedMembers.revisionStatusCache.observeRevisionStatusesChanges();
  }

  observeUncommittedStatusChanges(): HgStatusChanges {
    return this._sharedMembers.hgUncommittedStatusChanges;
  }

  observeHeadStatusChanges(): HgStatusChanges {
    return this._sharedMembers.hgHeadStatusChanges;
  }

  observeStackStatusChanges(): HgStatusChanges {
    return this._sharedMembers.hgStackStatusChanges;
  }

  _observePaneItemVisibility(item: Object): Observable<boolean> {
    return observePaneItemVisibility(item);
  }

  observeOperationProgressChanges(): Observable<OperationProgress> {
    return this._tryObserve(s =>
      s.observeHgOperationProgressDidChange().refCount(),
    );
  }

  onDidChangeStatuses(callback: () => mixed): IDisposable {
    return this._sharedMembers.emitter.on('did-change-statuses', callback);
  }

  onDidChangeConflictState(callback: () => mixed): IDisposable {
    return this._sharedMembers.emitter.on(DID_CHANGE_CONFLICT_STATE, callback);
  }

  observeLockFiles(): Observable<Map<string, boolean>> {
    return this._tryObserve(s => s.observeLockFilesDidChange().refCount());
  }

  observeHeadRevision(): Observable<RevisionInfo> {
    return this.observeRevisionChanges()
      .map(revisionInfoFetched =>
        revisionInfoFetched.revisions.find(revision => revision.isHead),
      )
      .let(compact)
      .distinctUntilChanged(
        (prevRev, nextRev) => prevRev.hash === nextRev.hash,
      );
  }

  /**
   *
   * Section: Repository Details
   *
   */

  getType(): string {
    return 'hg';
  }

  getPath(): string {
    return this._sharedMembers.path;
  }

  getWorkingDirectory(): string {
    return this._sharedMembers.workingDirectory.getPath();
  }

  // @return The path of the root project folder in Atom that this
  // HgRepositoryClient provides information about.
  getProjectDirectory(): string {
    return this.getInternalProjectDirectory().getPath();
  }

  // This function exists to be shadowed
  getInternalProjectDirectory(): atom$Directory {
    return nullthrows(this._sharedMembers.projectDirectory);
  }

  // TODO This is a stub.
  isProjectAtRoot(): boolean {
    return true;
  }

  relativize(filePath: NuclideUri): string {
    return this._sharedMembers.workingDirectory.relativize(filePath);
  }

  // TODO This is a stub.
  hasBranch(branch: string): boolean {
    return false;
  }

  /**
   * @return The current Hg bookmark.
   */
  getShortHead(filePath?: NuclideUri): string {
    return (
      this._sharedMembers.bookmarks
        .getValue()
        .bookmarks.filter(bookmark => bookmark.active)
        .map(bookmark => bookmark.bookmark)[0] || ''
    );
  }

  // TODO This is a stub.
  isSubmodule(path: NuclideUri): boolean {
    return false;
  }

  // TODO This is a stub.
  getAheadBehindCount(reference: string, path: NuclideUri): number {
    return 0;
  }

  // TODO This is a stub.
  getCachedUpstreamAheadBehindCount(
    path: ?NuclideUri,
  ): {ahead: number, behind: number} {
    return {
      ahead: 0,
      behind: 0,
    };
  }

  // TODO This is a stub.
  getConfigValue(key: string, path: ?string): ?string {
    return null;
  }

  getOriginURL(path: ?string): ?string {
    return this._sharedMembers.originURL;
  }

  // TODO This is a stub.
  getUpstreamBranch(path: ?string): ?string {
    return null;
  }

  // TODO This is a stub.
  getReferences(
    path: ?NuclideUri,
  ): {heads: Array<string>, remotes: Array<string>, tags: Array<string>} {
    return {
      heads: [],
      remotes: [],
      tags: [],
    };
  }

  // TODO This is a stub.
  getReferenceTarget(reference: string, path: ?NuclideUri): ?string {
    return null;
  }

  // Added for conflict detection.
  isInConflict(): boolean {
    return this._sharedMembers.isInConflict;
  }

  /**
   *
   * Section: Reading Status (parity with GitRepository)
   *
   */

  // TODO (jessicalin) Can we change the API to make this method return a Promise?
  // If not, might need to do a synchronous `hg status` query.
  isPathModified(filePath: ?NuclideUri): boolean {
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return false;
    }
    const cachedPathStatus = this._sharedMembers.hgStatusCache.get(filePath);
    if (!cachedPathStatus) {
      return false;
    } else {
      return this.isStatusModified(cachedPathStatus);
    }
  }

  // TODO (jessicalin) Can we change the API to make this method return a Promise?
  // If not, might need to do a synchronous `hg status` query.
  isPathNew(filePath: ?NuclideUri): boolean {
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return false;
    }
    const cachedPathStatus = this._sharedMembers.hgStatusCache.get(filePath);
    if (!cachedPathStatus) {
      return false;
    } else {
      return this.isStatusNew(cachedPathStatus);
    }
  }

  isPathAdded(filePath: ?NuclideUri): boolean {
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return false;
    }
    const cachedPathStatus = this._sharedMembers.hgStatusCache.get(filePath);
    if (!cachedPathStatus) {
      return false;
    } else {
      return this.isStatusAdded(cachedPathStatus);
    }
  }

  isPathUntracked(filePath: ?NuclideUri): boolean {
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return false;
    }
    const cachedPathStatus = this._sharedMembers.hgStatusCache.get(filePath);
    if (!cachedPathStatus) {
      return false;
    } else {
      return this.isStatusUntracked(cachedPathStatus);
    }
  }

  // TODO (jessicalin) Can we change the API to make this method return a Promise?
  // If not, this method lies a bit by using cached information.
  // TODO (jessicalin) Make this work for ignored directories.
  isPathIgnored(filePath: ?NuclideUri): boolean {
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return false;
    }
    // `hg status -i` does not list the repo (the .hg directory), presumably
    // because the repo does not track itself.
    // We want to represent the fact that it's not part of the tracked contents,
    // so we manually add an exception for it via the _isPathWithinHgRepo check.
    const cachedPathStatus = this._sharedMembers.hgStatusCache.get(filePath);
    if (!cachedPathStatus) {
      return this._isPathWithinHgRepo(filePath);
    } else {
      return this.isStatusIgnored(cachedPathStatus);
    }
  }

  /**
   * Checks if the given path is within the repo directory (i.e. `.hg/`).
   */
  _isPathWithinHgRepo(filePath: NuclideUri): boolean {
    return (
      filePath === this.getPath() ||
      filePath.indexOf(this.getPath() + '/') === 0
    );
  }

  /**
   * Checks whether a path is relevant to this HgRepositoryClient. A path is
   * defined as 'relevant' if it is within the project directory opened within the repo.
   */
  isPathRelevant(filePath: NuclideUri): boolean {
    return (
      this.getInternalProjectDirectory().contains(filePath) ||
      this.getInternalProjectDirectory().getPath() === filePath
    );
  }

  isPathRelevantToRepository(filePath: NuclideUri): boolean {
    return (
      this._sharedMembers.workingDirectory.contains(filePath) ||
      this._sharedMembers.workingDirectory.getPath() === filePath
    );
  }

  // non-used stub.
  getDirectoryStatus(directoryPath: ?string): StatusCodeNumberValue {
    return StatusCodeNumber.CLEAN;
  }

  // We don't want to do any synchronous 'hg status' calls. Just use cached values.
  getPathStatus(filePath: NuclideUri): StatusCodeNumberValue {
    return this.getCachedPathStatus(filePath);
  }

  getCachedPathStatus(filePath: ?NuclideUri): StatusCodeNumberValue {
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return StatusCodeNumber.CLEAN;
    }
    const cachedStatus = this._sharedMembers.hgStatusCache.get(filePath);
    if (cachedStatus) {
      return cachedStatus;
    }
    return StatusCodeNumber.CLEAN;
  }

  // getAllPathStatuses -- this legacy API gets only uncommitted statuses
  getAllPathStatuses(): {[filePath: NuclideUri]: StatusCodeNumberValue} {
    const pathStatuses = Object.create(null);
    for (const [filePath, status] of this._sharedMembers.hgStatusCache) {
      pathStatuses[filePath] = status;
    }
    // $FlowFixMe(>=0.55.0) Flow suppress
    return pathStatuses;
  }

  isStatusModified(status: ?number): boolean {
    return status === StatusCodeNumber.MODIFIED;
  }

  isStatusDeleted(status: ?number): boolean {
    return (
      status === StatusCodeNumber.MISSING || status === StatusCodeNumber.REMOVED
    );
  }

  isStatusNew(status: ?number): boolean {
    return (
      status === StatusCodeNumber.ADDED || status === StatusCodeNumber.UNTRACKED
    );
  }

  isStatusAdded(status: ?number): boolean {
    return status === StatusCodeNumber.ADDED;
  }

  isStatusUntracked(status: ?number): boolean {
    return status === StatusCodeNumber.UNTRACKED;
  }

  isStatusIgnored(status: ?number): boolean {
    return status === StatusCodeNumber.IGNORED;
  }

  /**
   *
   * Section: Retrieving Diffs (parity with GitRepository)
   *
   */

  setDiffInfo(filePath: NuclideUri, diffInfo: DiffInfo): void {
    if (this.isPathRelevantToRepository(filePath)) {
      this._sharedMembers.bufferDiffsFromHeadCache.set(filePath, diffInfo);
    }
  }

  deleteDiffInfo(filePath: NuclideUri): void {
    this._sharedMembers.bufferDiffsFromHeadCache.delete(filePath);
  }

  clearAllDiffInfo(): void {
    this._sharedMembers.bufferDiffsFromHeadCache.clear();
  }

  getDiffStats(filePath: NuclideUri): {added: number, deleted: number} {
    return (
      this._sharedMembers.bufferDiffsFromHeadCache.get(filePath) || {
        added: 0,
        deleted: 0,
      }
    );
  }

  /**
   * Returns an array of LineDiff that describes the diffs between the given
   * file's `HEAD` contents and its current contents.
   * NOTE: this method currently ignores the passed-in text, and instead diffs
   * against the currently saved contents of the file.
   */
  // TODO (jessicalin) Make this method work with the passed-in `text`. t6391579
  // TODO (tjfryan): diff gutters is a pull-based API, but we calculate diffs in a
  // push-based way. This can lead to some cases like committing changes
  // sometimes won't clear gutters until changes are made to the buffer
  getLineDiffs(filePath: NuclideUri, text: ?string): Array<LineDiff> {
    const diffInfo = this._sharedMembers.bufferDiffsFromHeadCache.get(filePath);
    return diffInfo != null ? diffInfo.lineDiffs : [];
  }

  /**
   *
   * Section: Retrieving Diffs (async methods)
   *
   */

  fetchMergeConflicts(): Observable<?MergeConflicts> {
    return this._sharedMembers.service
      .fetchMergeConflicts(this._sharedMembers.workingDirectoryPath)
      .refCount();
  }

  markConflictedFile(
    filePath: NuclideUri,
    resolved: boolean,
  ): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    return this._sharedMembers.service
      .markConflictedFile(
        this._sharedMembers.workingDirectoryPath,
        filePath,
        resolved,
      )
      .refCount();
  }

  /**
   *
   * Section: Checking Out
   *
   */

  /**
   * That extends the `GitRepository` implementation which takes a single file path.
   * Here, it's possible to pass an array of file paths to revert/checkout-head.
   */
  checkoutHead(filePathsArg: NuclideUri | Array<NuclideUri>): Promise<void> {
    const filePaths = Array.isArray(filePathsArg)
      ? filePathsArg
      : [filePathsArg];
    return this._sharedMembers.service.revert(
      this._sharedMembers.workingDirectoryPath,
      filePaths,
    );
  }

  checkoutReference(
    reference: string,
    create: boolean,
    options?: CheckoutOptions,
  ): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    return this._sharedMembers.service
      .checkout(
        this._sharedMembers.workingDirectoryPath,
        reference,
        create,
        options,
      )
      .refCount();
  }

  show(revision: number): Observable<RevisionShowInfo> {
    return this._sharedMembers.service
      .show(this._sharedMembers.workingDirectoryPath, revision)
      .refCount();
  }

  diff(
    revision: number | string,
    options: {
      // diffCommitted uses the -c flag instead of -r, fetches committed changes
      // '--unified n' gives us n lines of context around the change
      // '--noprefix' omits the a/ and b/ prefixes from filenames
      // '--nodates' avoids appending dates to the file path line
      unified?: number,
      diffCommitted?: boolean,
      noPrefix?: boolean,
      noDates?: boolean,
    } = {},
  ): Observable<string> {
    const {unified, diffCommitted, noPrefix, noDates} = options;
    return this._sharedMembers.service
      .diff(
        this._sharedMembers.workingDirectoryPath,
        String(revision),
        unified,
        diffCommitted,
        noPrefix,
        noDates,
      )
      .refCount();
  }

  purge(): Promise<void> {
    return this._sharedMembers.service.purge(
      this._sharedMembers.workingDirectoryPath,
    );
  }

  stripReference(reference: string): Promise<void> {
    return this._sharedMembers.service.strip(
      this._sharedMembers.workingDirectoryPath,
      reference,
    );
  }

  uncommit(): Promise<void> {
    return this._sharedMembers.service.uncommit(
      this._sharedMembers.workingDirectoryPath,
    );
  }

  checkoutForkBase(): Promise<void> {
    return this._sharedMembers.service.checkoutForkBase(
      this._sharedMembers.workingDirectoryPath,
    );
  }

  /**
   *
   * Section: Bookmarks
   *
   */
  createBookmark(name: string, revision: ?string): Promise<void> {
    return this._sharedMembers.service.createBookmark(
      this._sharedMembers.workingDirectoryPath,
      name,
      revision,
    );
  }

  deleteBookmark(name: string): Promise<void> {
    return this._sharedMembers.service.deleteBookmark(
      this._sharedMembers.workingDirectoryPath,
      name,
    );
  }

  renameBookmark(name: string, nextName: string): Promise<void> {
    return this._sharedMembers.service.renameBookmark(
      this._sharedMembers.workingDirectoryPath,
      name,
      nextName,
    );
  }

  /**
   *
   * Section: HgService subscriptions
   *
   */

  /**
   *
   * Section: Repository State at Specific Revisions
   *
   */
  fetchFileContentAtRevision(
    filePath: NuclideUri,
    revision: string,
  ): Observable<string> {
    let fileContentsAtRevision = this._sharedMembers.fileContentsAtRevisionIds.get(
      revision,
    );
    if (fileContentsAtRevision == null) {
      fileContentsAtRevision = new Map();
      this._sharedMembers.fileContentsAtRevisionIds.set(
        revision,
        fileContentsAtRevision,
      );
    }
    const committedContents = fileContentsAtRevision.get(filePath);
    if (committedContents != null) {
      return Observable.of(committedContents);
    } else {
      return this._sharedMembers.service
        .fetchFileContentAtRevision(
          this._sharedMembers.workingDirectoryPath,
          filePath,
          revision,
        )
        .refCount()
        .do(contents => fileContentsAtRevision.set(filePath, contents));
    }
  }

  fetchMultipleFilesContentAtRevision(
    filePaths: Array<NuclideUri>,
    revision: string,
  ): Observable<Array<{abspath: NuclideUri, path: NuclideUri, data: string}>> {
    return this.runCommand(['cat', '-Tjson', ...filePaths]).map(JSON.parse);
  }

  fetchFilesChangedAtRevision(
    revision: string,
  ): Observable<RevisionFileChanges> {
    const changes = this._sharedMembers.revisionIdToFileChanges.get(revision);
    if (changes != null) {
      return Observable.of(changes);
    } else {
      return this._sharedMembers.service
        .fetchFilesChangedAtRevision(
          this._sharedMembers.workingDirectoryPath,
          revision,
        )
        .refCount()
        .do(fetchedChanges =>
          this._sharedMembers.revisionIdToFileChanges.set(
            revision,
            fetchedChanges,
          ),
        );
    }
  }

  fetchFilesChangedSinceRevision(
    revision: string,
  ): Observable<Map<NuclideUri, StatusCodeNumberValue>> {
    return this._sharedMembers.service
      .fetchStatuses(this._sharedMembers.workingDirectoryPath, revision)
      .refCount()
      .map(fileStatuses => {
        const statusesWithCodeIds = new Map();
        for (const [filePath, code] of fileStatuses) {
          statusesWithCodeIds.set(filePath, StatusCodeIdToNumber[code]);
        }
        return statusesWithCodeIds;
      });
  }

  fetchRevisionInfoBetweenHeadAndBase(): Promise<Array<RevisionInfo>> {
    return this._sharedMembers.service.fetchRevisionInfoBetweenHeadAndBase(
      this._sharedMembers.workingDirectoryPath,
    );
  }

  fetchSmartlogRevisions(): Observable<Array<RevisionInfo>> {
    return this._sharedMembers.service
      .fetchSmartlogRevisions(this._sharedMembers.workingDirectoryPath)
      .refCount();
  }

  refreshRevisions(): void {
    this._sharedMembers.revisionsCache.refreshRevisions();
  }

  refreshRevisionsStatuses(): void {
    this._sharedMembers.revisionStatusCache.refresh();
  }

  getCachedRevisions(): Array<RevisionInfo> {
    return this._sharedMembers.revisionsCache.getCachedRevisions().revisions;
  }

  getCachedRevisionStatuses(): RevisionStatuses {
    return this._sharedMembers.revisionStatusCache.getCachedRevisionStatuses();
  }

  // See HgService.getBaseRevision.
  getBaseRevision(): Promise<RevisionInfo> {
    return this._sharedMembers.service.getBaseRevision(
      this._sharedMembers.workingDirectoryPath,
    );
  }

  // See HgService.getBlameAtHead.
  getBlameAtHead(filePath: NuclideUri): Promise<Array<?RevisionInfo>> {
    return this._sharedMembers.service.getBlameAtHead(
      this._sharedMembers.workingDirectoryPath,
      filePath,
    );
  }

  getTemplateCommitMessage(): Promise<?string> {
    return this._sharedMembers.service.getTemplateCommitMessage(
      this._sharedMembers.workingDirectoryPath,
    );
  }

  getHeadCommitMessage(): Promise<?string> {
    return this._sharedMembers.service.getHeadCommitMessage(
      this._sharedMembers.workingDirectoryPath,
    );
  }

  /**
   * Return relative paths to status code number values object.
   * matching `GitRepositoryAsync` implementation.
   */
  getCachedPathStatuses(): {[filePath: string]: StatusCodeNumberValue} {
    const absoluteCodePaths = this.getAllPathStatuses();
    const relativeCodePaths = {};
    for (const absolutePath in absoluteCodePaths) {
      const relativePath = this.relativize(absolutePath);
      relativeCodePaths[relativePath] = absoluteCodePaths[absolutePath];
    }
    return relativeCodePaths;
  }

  getConfigValueAsync(key: string, path: ?string): Promise<?string> {
    return this._sharedMembers.service.getConfigValueAsync(
      this._sharedMembers.workingDirectoryPath,
      key,
    );
  }

  // See HgService.getDifferentialRevisionForChangeSetId.
  getDifferentialRevisionForChangeSetId(changeSetId: string): Promise<?string> {
    return this._sharedMembers.service.getDifferentialRevisionForChangeSetId(
      this._sharedMembers.workingDirectoryPath,
      changeSetId,
    );
  }

  getSmartlog(ttyOutput: boolean, concise: boolean): Promise<Object> {
    return this._sharedMembers.service.getSmartlog(
      this._sharedMembers.workingDirectoryPath,
      ttyOutput,
      concise,
    );
  }

  copy(
    filePaths: Array<NuclideUri>,
    destPath: NuclideUri,
    after: boolean = false,
  ): Promise<void> {
    return this._sharedMembers.service.copy(
      this._sharedMembers.workingDirectoryPath,
      filePaths,
      destPath,
      after,
    );
  }

  rename(
    filePaths: Array<NuclideUri>,
    destPath: NuclideUri,
    after: boolean = false,
  ): Promise<void> {
    return this._sharedMembers.service.rename(
      this._sharedMembers.workingDirectoryPath,
      filePaths,
      destPath,
      after,
    );
  }

  remove(filePaths: Array<NuclideUri>, after: boolean = false): Promise<void> {
    return this._sharedMembers.service.remove(
      this._sharedMembers.workingDirectoryPath,
      filePaths,
      after,
    );
  }

  forget(filePaths: Array<NuclideUri>): Promise<void> {
    return this._sharedMembers.service.forget(
      this._sharedMembers.workingDirectoryPath,
      filePaths,
    );
  }

  addAll(filePaths: Array<NuclideUri>): Promise<void> {
    return this._sharedMembers.service.add(
      this._sharedMembers.workingDirectoryPath,
      filePaths,
    );
  }

  commit(
    message: string,
    filePaths: Array<NuclideUri> = [],
  ): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    return this._sharedMembers.service
      .commit(this._sharedMembers.workingDirectoryPath, message, filePaths)
      .refCount()
      .do(processMessage =>
        this._clearOnSuccessExit(processMessage, filePaths),
      );
  }

  amend(
    message: ?string,
    amendMode: AmendModeValue,
    filePaths: Array<NuclideUri> = [],
  ): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    return this._sharedMembers.service
      .amend(
        this._sharedMembers.workingDirectoryPath,
        message,
        amendMode,
        filePaths,
      )
      .refCount()
      .do(processMessage =>
        this._clearOnSuccessExit(processMessage, filePaths),
      );
  }

  restack(): Observable<LegacyProcessMessage> {
    return this._sharedMembers.service
      .restack(this._sharedMembers.workingDirectoryPath)
      .refCount();
  }

  editCommitMessage(
    revision: string,
    message: string,
  ): Observable<LegacyProcessMessage> {
    return this._sharedMembers.service
      .editCommitMessage(
        this._sharedMembers.workingDirectoryPath,
        revision,
        message,
      )
      .refCount();
  }

  _clearOnSuccessExit(
    message: LegacyProcessMessage,
    filePaths: Array<NuclideUri>,
  ) {
    if (message.kind === 'exit' && message.exitCode === 0) {
      this._clearClientCache(filePaths);
    }
  }

  revert(filePaths: Array<NuclideUri>, toRevision?: ?string): Promise<void> {
    return this._sharedMembers.service.revert(
      this._sharedMembers.workingDirectoryPath,
      filePaths,
      toRevision,
    );
  }

  log(filePaths: Array<NuclideUri>, limit?: ?number): Promise<VcsLogResponse> {
    // TODO(mbolin): Return an Observable so that results appear faster.
    // Unfortunately, `hg log -Tjson` is not Observable-friendly because it will
    // not parse as JSON until all of the data has been printed to stdout.
    return this._sharedMembers.service.log(
      this._sharedMembers.workingDirectoryPath,
      filePaths,
      limit,
    );
  }

  getFullHashForRevision(rev: string): Promise<?string> {
    return this._sharedMembers.service.getFullHashForRevision(
      this._sharedMembers.workingDirectoryPath,
      rev,
    );
  }

  continueOperation(
    commandWithOptions: Array<string>,
  ): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    return this._sharedMembers.service
      .continueOperation(
        this._sharedMembers.workingDirectoryPath,
        commandWithOptions,
      )
      .refCount();
  }

  abortOperation(commandWithOptions: Array<string>): Observable<string> {
    return this._sharedMembers.service
      .abortOperation(
        this._sharedMembers.workingDirectoryPath,
        commandWithOptions,
      )
      .refCount();
  }

  resolveAllFiles(): Observable<LegacyProcessMessage> {
    return this._sharedMembers.service
      .resolveAllFiles(this._sharedMembers.workingDirectoryPath)
      .refCount();
  }

  rebase(
    destination: string,
    source?: string,
  ): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    return this._sharedMembers.service
      .rebase(this._sharedMembers.workingDirectoryPath, destination, source)
      .refCount();
  }

  reorderWithinStack(orderedRevisions: Array<string>): Observable<string> {
    return this._sharedMembers.service
      .reorderWithinStack(
        this._sharedMembers.workingDirectoryPath,
        orderedRevisions,
      )
      .refCount();
  }

  pull(options?: Array<string> = []): Observable<LegacyProcessMessage> {
    // TODO(T17463635)
    return this._sharedMembers.service
      .pull(this._sharedMembers.workingDirectoryPath, options)
      .refCount();
  }

  fold(from: string, to: string, message: string): Observable<string> {
    return this._sharedMembers.service
      .fold(this._sharedMembers.workingDirectoryPath, from, to, message)
      .refCount();
  }

  _clearClientCache(filePaths: Array<NuclideUri>): void {
    if (filePaths.length === 0) {
      this._sharedMembers.hgStatusCache = new Map();
    } else {
      this._sharedMembers.hgStatusCache = new Map(
        this._sharedMembers.hgStatusCache,
      );
      filePaths.forEach(filePath => {
        this._sharedMembers.hgStatusCache.delete(filePath);
      });
    }
    this._sharedMembers.emitter.emit('did-change-statuses');
  }

  requestPathStatusRefresh(): void {
    this._sharedMembers.manualStatusRefreshRequests.next();
  }

  runCommand(args: Array<string>): Observable<string> {
    return this._sharedMembers.service
      .runCommand(this._sharedMembers.workingDirectoryPath, args)
      .refCount();
  }

  observeExecution(args: Array<string>): Observable<LegacyProcessMessage> {
    return this._sharedMembers.service
      .observeExecution(this._sharedMembers.workingDirectoryPath, args)
      .refCount();
  }
}
