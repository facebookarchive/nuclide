'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.HgRepositoryClient = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _nuclideUri;
































function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));}var _promise;
function _load_promise() {return _promise = require('../../../modules/nuclide-commons/promise');}var _string;
function _load_string() {return _string = require('../../../modules/nuclide-commons/string');}var _hgDiffOutputParser;
function _load_hgDiffOutputParser() {return _hgDiffOutputParser = require('../../nuclide-hg-rpc/lib/hg-diff-output-parser');}
var _atom = require('atom');var _observable;
function _load_observable() {return _observable = require('../../../modules/nuclide-commons/observable');}var _RevisionsCache;




function _load_RevisionsCache() {return _RevisionsCache = _interopRequireDefault(require('./RevisionsCache'));}var _utils;
function _load_utils() {return _utils = require('./utils');}var _hgConstants;
function _load_hgConstants() {return _hgConstants = require('../../nuclide-hg-rpc/lib/hg-constants');}



var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _lruCache;
function _load_lruCache() {return _lruCache = _interopRequireDefault(require('lru-cache'));}var _featureConfig;
function _load_featureConfig() {return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));}var _observePaneItemVisibility;
function _load_observePaneItemVisibility() {return _observePaneItemVisibility = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/observePaneItemVisibility'));}var _textBuffer;
function _load_textBuffer() {return _textBuffer = require('../../commons-atom/text-buffer');}var _log4js;
function _load_log4js() {return _log4js = require('log4js');}var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _UniversalDisposable;

















































































function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));}var _event;
function _load_event() {return _event = require('../../../modules/nuclide-commons/event');}var _collection;
function _load_collection() {return _collection = require('../../../modules/nuclide-commons/collection');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}const STATUS_DEBOUNCE_DELAY_MS = 300; /**
                                                                                                                                                                                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                              * All rights reserved.
                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                                              * the root directory of this source tree.
                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                              * 
                                                                                                                                                                                                                                              * @format
                                                                                                                                                                                                                                              */const REVISION_DEBOUNCE_DELAY = 300;const BOOKMARKS_DEBOUNCE_DELAY = 200;const FETCH_BOOKMARKS_TIMEOUT = 15 * 1000; /**
                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                     * Section: Constants, Type Definitions
                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                     */const DID_CHANGE_CONFLICT_STATE = 'did-change-conflict-state';function getRevisionStatusCache(revisionsCache, workingDirectoryPath) {try {// $FlowFB
    const FbRevisionStatusCache = require('./fb/RevisionStatusCache').default;return new FbRevisionStatusCache(revisionsCache, workingDirectoryPath);} catch (e) {return { getCachedRevisionStatuses() {return new Map();}, observeRevisionStatusesChanges() {return _rxjsBundlesRxMinJs.Observable.empty();}, refresh() {} };}} /**
                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                  * Section: HgRepositoryClient
                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                  */ /**
                                                                                                                                                                                                                                                                                                                                      * HgRepositoryClient runs on the machine that Nuclide/Atom is running on.
                                                                                                                                                                                                                                                                                                                                      * It is the interface that other Atom packages will use to access Mercurial.
                                                                                                                                                                                                                                                                                                                                      * It caches data fetched from an HgService.
                                                                                                                                                                                                                                                                                                                                      * It implements the same interface as GitRepository, (https://atom.io/docs/api/latest/GitRepository)
                                                                                                                                                                                                                                                                                                                                      * in addition to providing asynchronous methods for some getters.
                                                                                                                                                                                                                                                                                                                                      */class HgRepositoryClient {






























  constructor(
  repoPath,
  hgService,
  options)
  {
    // $FlowFixMe - by the end of the constructor, all the members should be initialized
    this._sharedMembers = {};

    this._sharedMembers.rootRepo = this;
    this._sharedMembers.path = repoPath;
    this._sharedMembers.workingDirectory = options.workingDirectory;
    this._sharedMembers.projectDirectory = options.projectRootDirectory;
    this._sharedMembers.originURL = options.originURL;
    this._sharedMembers.service = hgService;
    this._sharedMembers.isInConflict = false;
    this._sharedMembers.isDestroyed = false;
    this._sharedMembers.revisionsCache = new (_RevisionsCache || _load_RevisionsCache()).default(hgService);
    this._sharedMembers.revisionStatusCache = getRevisionStatusCache(
    this._sharedMembers.revisionsCache,
    this._sharedMembers.workingDirectory.getPath());

    this._sharedMembers.revisionIdToFileChanges = new (_lruCache || _load_lruCache()).default({ max: 100 });
    this._sharedMembers.fileContentsAtRevisionIds = new (_lruCache || _load_lruCache()).default({ max: 20 });
    this._sharedMembers.fileContentsAtHead = new (_lruCache || _load_lruCache()).default({ max: 30 });

    this._sharedMembers.emitter = new _atom.Emitter();
    this._sharedMembers.subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    this._sharedMembers.emitter,
    this._sharedMembers.service);

    this._sharedMembers.isFetchingPathStatuses = new _rxjsBundlesRxMinJs.Subject();
    this._sharedMembers.manualStatusRefreshRequests = new _rxjsBundlesRxMinJs.Subject();
    this._sharedMembers.hgStatusCache = new Map();
    this._sharedMembers.bookmarks = new _rxjsBundlesRxMinJs.BehaviorSubject({
      isLoading: true,
      bookmarks: [] });


    this._sharedMembers.hgDiffCache = new Map();
    this._sharedMembers.hgDiffCacheFilesUpdating = new Set();
    this._sharedMembers.hgDiffCacheFilesToClear = new Set();

    const diffStatsSubscription = (_featureConfig || _load_featureConfig()).default.observeAsStream(
    'nuclide-hg-repository.enableDiffStats').

    switchMap(enableDiffStats => {
      if (!enableDiffStats) {
        // TODO(most): rewrite fetching structures avoiding side effects
        this._sharedMembers.hgDiffCache = new Map();
        this._sharedMembers.emitter.emit('did-change-statuses');
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      return (0, (_event || _load_event()).observableFromSubscribeFunction)(
      atom.workspace.observeTextEditors.bind(atom.workspace)).
      flatMap(textEditor => {
        return this._observePaneItemVisibility(textEditor).switchMap(
        visible => {
          if (!visible) {
            return _rxjsBundlesRxMinJs.Observable.empty();
          }

          const buffer = textEditor.getBuffer();
          const filePath = buffer.getPath();
          if (
          filePath == null ||
          filePath.length === 0 ||
          !this.isPathRelevantToRepository(filePath))
          {
            return _rxjsBundlesRxMinJs.Observable.empty();
          }
          return _rxjsBundlesRxMinJs.Observable.combineLatest(
          (0, (_event || _load_event()).observableFromSubscribeFunction)(
          buffer.onDidSave.bind(buffer)).
          startWith(''),
          this._sharedMembers.hgUncommittedStatusChanges.statusChanges).

          filter(([_, statusChanges]) => {
            return (
              statusChanges.has(filePath) &&
              this.isStatusModified(statusChanges.get(filePath)));

          }).
          map(() => filePath).
          takeUntil(
          _rxjsBundlesRxMinJs.Observable.merge(
          (0, (_textBuffer || _load_textBuffer()).observeBufferCloseOrRename)(buffer),
          this._observePaneItemVisibility(textEditor).filter(v => !v)).
          do(() => {
            // TODO(most): rewrite to be simpler and avoid side effects.
            // Remove the file from the diff stats cache when the buffer is closed.
            this._sharedMembers.hgDiffCacheFilesToClear.add(filePath);
          }));

        });

      });
    }).
    flatMap(filePath => this._updateDiffInfo([filePath])).
    subscribe();
    this._sharedMembers.subscriptions.add(diffStatsSubscription);

    this._sharedMembers.initializationPromise = this._sharedMembers.service.waitForWatchmanSubscriptions();
    this._sharedMembers.initializationPromise.catch(error => {
      atom.notifications.addWarning(
      'Mercurial: failed to subscribe to watchman!');

    });
    // Get updates that tell the HgRepositoryClient when to clear its caches.
    const fileChanges = this._sharedMembers.service.
    observeFilesDidChange().
    refCount();
    const repoStateChanges = _rxjsBundlesRxMinJs.Observable.merge(
    this._sharedMembers.service.observeHgRepoStateDidChange().refCount(),
    this._sharedMembers.manualStatusRefreshRequests);

    const activeBookmarkChanges = this._sharedMembers.service.
    observeActiveBookmarkDidChange().
    refCount();
    const allBookmarkChanges = this._sharedMembers.service.
    observeBookmarksDidChange().
    refCount();
    const conflictStateChanges = this._sharedMembers.service.
    observeHgConflictStateDidChange().
    refCount();
    const commitChanges = this._sharedMembers.service.
    observeHgCommitsDidChange().
    refCount();

    this._sharedMembers.hgUncommittedStatusChanges = this._observeStatus(
    fileChanges,
    repoStateChanges,
    () => this._sharedMembers.service.fetchStatuses());


    this._sharedMembers.hgStackStatusChanges = this._observeStatus(
    fileChanges,
    repoStateChanges,
    () => this._sharedMembers.service.fetchStackStatuses());


    this._sharedMembers.hgHeadStatusChanges = this._observeStatus(
    fileChanges,
    repoStateChanges,
    () => this._sharedMembers.service.fetchHeadStatuses());


    const statusChangesSubscription = this._sharedMembers.hgUncommittedStatusChanges.statusChanges.subscribe(
    statuses => {
      this._sharedMembers.hgStatusCache = statuses;
      this._sharedMembers.emitter.emit('did-change-statuses');
    });


    const shouldRevisionsUpdate = _rxjsBundlesRxMinJs.Observable.merge(
    this._sharedMembers.bookmarks.asObservable(),
    commitChanges,
    repoStateChanges).
    let((0, (_observable || _load_observable()).fastDebounce)(REVISION_DEBOUNCE_DELAY));

    const bookmarksUpdates = _rxjsBundlesRxMinJs.Observable.merge(
    activeBookmarkChanges,
    allBookmarkChanges).

    startWith(null).
    let((0, (_observable || _load_observable()).fastDebounce)(BOOKMARKS_DEBOUNCE_DELAY)).
    switchMap(() =>
    _rxjsBundlesRxMinJs.Observable.defer(() => {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(
      this._sharedMembers.service.fetchBookmarks()).
      timeout(FETCH_BOOKMARKS_TIMEOUT);
    }).
    retry(2).
    catch(error => {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-repository-client').error(
      'failed to fetch bookmarks info:',
      error);

      return _rxjsBundlesRxMinJs.Observable.empty();
    }));


    this._sharedMembers.subscriptions.add(
    statusChangesSubscription,
    bookmarksUpdates.subscribe(bookmarks =>
    this._sharedMembers.bookmarks.next({ isLoading: false, bookmarks })),

    conflictStateChanges.subscribe(this._conflictStateChanged.bind(this)),
    shouldRevisionsUpdate.subscribe(() => {
      this._sharedMembers.revisionsCache.refreshRevisions();
      this._sharedMembers.fileContentsAtHead.reset();
      this._sharedMembers.hgDiffCache = new Map();
    }));

  }

  // A single root HgRepositoryClient can back multiple HgRepositoryClients
  // via differential inheritance. This gets the 'original' HgRepositoryClient
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
  getRootRepoClient() {return this._sharedMembers.rootRepo;}getAdditionalLogFiles(deadline) {var _this = this;return (0, _asyncToGenerator.default)(function* () {const path = _this._sharedMembers.workingDirectory.getPath();const prefix = (_nuclideUri || _load_nuclideUri()).default.isRemote(path) ? `${(_nuclideUri || _load_nuclideUri()).default.getHostname(path)}:` : '';const results = yield (0, (_promise || _load_promise()).timeoutAfterDeadline)(deadline, _this._sharedMembers.service.getAdditionalLogFiles(deadline - 1000)).
      catch(function (e) {return [{ title: `${path}:hg`, data: (0, (_string || _load_string()).stringifyError)(e) }];});
      return results.map(function (log) {return Object.assign({}, log, { title: prefix + log.title });});})();
  }

  _observeStatus(
  fileChanges,
  repoStateChanges,
  fetchStatuses)


  {
    const triggers = _rxjsBundlesRxMinJs.Observable.merge(fileChanges, repoStateChanges).
    let((0, (_observable || _load_observable()).fastDebounce)(STATUS_DEBOUNCE_DELAY_MS)).
    share().
    startWith(null);
    // Share comes before startWith. That's because fileChanges/repoStateChanges
    // are already hot and can be shared fine. But we want both our subscribers,
    // statusChanges and isCalculatingChanges, to pick up their own copy of
    // startWith(null) no matter which order they subscribe.

    const statusChanges = (0, (_observable || _load_observable()).cacheWhileSubscribed)(
    triggers.
    switchMap(() => {
      this._sharedMembers.isFetchingPathStatuses.next(true);
      return fetchStatuses().
      refCount().
      catch(error => {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-repository-client').error(
        'HgService cannot fetch statuses',
        error);

        return _rxjsBundlesRxMinJs.Observable.empty();
      }).
      finally(() => {
        this._sharedMembers.isFetchingPathStatuses.next(false);
      });
    }).
    map(uriToStatusIds =>
    (0, (_collection || _load_collection()).mapTransform)(uriToStatusIds, (v, k) => (_hgConstants || _load_hgConstants()).StatusCodeIdToNumber[v])));



    const isCalculatingChanges = (0, (_observable || _load_observable()).cacheWhileSubscribed)(
    _rxjsBundlesRxMinJs.Observable.merge(
    triggers.map(_ => true),
    statusChanges.map(_ => false)).
    distinctUntilChanged());


    return { statusChanges, isCalculatingChanges };
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
  }

  isDestroyed() {
    return this._sharedMembers.isDestroyed;
  }

  _conflictStateChanged(isInConflict) {
    this._sharedMembers.isInConflict = isInConflict;
    this._sharedMembers.emitter.emit(DID_CHANGE_CONFLICT_STATE);
  }

  /**
     *
     * Section: Event Subscription
     *
     */

  onDidDestroy(callback) {
    return this._sharedMembers.emitter.on('did-destroy', callback);
  }

  onDidChangeStatus(
  callback)



  {
    return this._sharedMembers.emitter.on('did-change-status', callback);
  }

  observeBookmarks() {
    return this._sharedMembers.bookmarks.
    asObservable().
    filter(b => !b.isLoading).
    map(b => b.bookmarks);
  }

  observeRevisionChanges() {
    return this._sharedMembers.revisionsCache.observeRevisionChanges();
  }

  observeIsFetchingRevisions() {
    return this._sharedMembers.revisionsCache.observeIsFetchingRevisions();
  }

  observeIsFetchingPathStatuses() {
    return this._sharedMembers.isFetchingPathStatuses.asObservable();
  }

  observeRevisionStatusesChanges() {
    return this._sharedMembers.revisionStatusCache.observeRevisionStatusesChanges();
  }

  observeUncommittedStatusChanges() {
    return this._sharedMembers.hgUncommittedStatusChanges;
  }

  observeHeadStatusChanges() {
    return this._sharedMembers.hgHeadStatusChanges;
  }

  observeStackStatusChanges() {
    return this._sharedMembers.hgStackStatusChanges;
  }

  _observePaneItemVisibility(item) {
    return (0, (_observePaneItemVisibility || _load_observePaneItemVisibility()).default)(item);
  }

  observeOperationProgressChanges() {
    return this._sharedMembers.service.
    observeHgOperationProgressDidChange().
    refCount();
  }

  onDidChangeStatuses(callback) {
    return this._sharedMembers.emitter.on('did-change-statuses', callback);
  }

  onDidChangeConflictState(callback) {
    return this._sharedMembers.emitter.on(DID_CHANGE_CONFLICT_STATE, callback);
  }

  observeLockFiles() {
    return this._sharedMembers.service.observeLockFilesDidChange().refCount();
  }

  observeHeadRevision() {
    return this.observeRevisionChanges().
    map(revisionInfoFetched =>
    revisionInfoFetched.revisions.find(revision => revision.isHead)).

    let((_observable || _load_observable()).compact).
    distinctUntilChanged(
    (prevRev, nextRev) => prevRev.hash === nextRev.hash);

  }

  /**
     *
     * Section: Repository Details
     *
     */

  getType() {
    return 'hg';
  }

  getPath() {
    return this._sharedMembers.path;
  }

  getWorkingDirectory() {
    return this._sharedMembers.workingDirectory.getPath();
  }

  // @return The path of the root project folder in Atom that this
  // HgRepositoryClient provides information about.
  getProjectDirectory() {
    return this.getInternalProjectDirectory().getPath();
  }

  // This function exists to be shadowed
  getInternalProjectDirectory() {
    return (0, (_nullthrows || _load_nullthrows()).default)(this._sharedMembers.projectDirectory);
  }

  // TODO This is a stub.
  isProjectAtRoot() {
    return true;
  }

  relativize(filePath) {
    return this._sharedMembers.workingDirectory.relativize(filePath);
  }

  // TODO This is a stub.
  hasBranch(branch) {
    return false;
  }

  /**
     * @return The current Hg bookmark.
     */
  getShortHead(filePath) {
    return (
      this._sharedMembers.bookmarks.
      getValue().
      bookmarks.filter(bookmark => bookmark.active).
      map(bookmark => bookmark.bookmark)[0] || '');

  }

  // TODO This is a stub.
  isSubmodule(path) {
    return false;
  }

  // TODO This is a stub.
  getAheadBehindCount(reference, path) {
    return 0;
  }

  // TODO This is a stub.
  getCachedUpstreamAheadBehindCount(
  path)
  {
    return {
      ahead: 0,
      behind: 0 };

  }

  // TODO This is a stub.
  getConfigValue(key, path) {
    return null;
  }

  getOriginURL(path) {
    return this._sharedMembers.originURL;
  }

  // TODO This is a stub.
  getUpstreamBranch(path) {
    return null;
  }

  // TODO This is a stub.
  getReferences(
  path)
  {
    return {
      heads: [],
      remotes: [],
      tags: [] };

  }

  // TODO This is a stub.
  getReferenceTarget(reference, path) {
    return null;
  }

  // Added for conflict detection.
  isInConflict() {
    return this._sharedMembers.isInConflict;
  }

  /**
     *
     * Section: Reading Status (parity with GitRepository)
     *
     */

  // TODO (jessicalin) Can we change the API to make this method return a Promise?
  // If not, might need to do a synchronous `hg status` query.
  isPathModified(filePath) {
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
  isPathNew(filePath) {
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

  isPathAdded(filePath) {
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

  isPathUntracked(filePath) {
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
  isPathIgnored(filePath) {
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
  _isPathWithinHgRepo(filePath) {
    return (
      filePath === this.getPath() ||
      filePath.indexOf(this.getPath() + '/') === 0);

  }

  /**
     * Checks whether a path is relevant to this HgRepositoryClient. A path is
     * defined as 'relevant' if it is within the project directory opened within the repo.
     */
  isPathRelevant(filePath) {
    return (
      this.getInternalProjectDirectory().contains(filePath) ||
      this.getInternalProjectDirectory().getPath() === filePath);

  }

  isPathRelevantToRepository(filePath) {
    return (
      this._sharedMembers.workingDirectory.contains(filePath) ||
      this._sharedMembers.workingDirectory.getPath() === filePath);

  }

  // non-used stub.
  getDirectoryStatus(directoryPath) {
    return (_hgConstants || _load_hgConstants()).StatusCodeNumber.CLEAN;
  }

  // We don't want to do any synchronous 'hg status' calls. Just use cached values.
  getPathStatus(filePath) {
    return this.getCachedPathStatus(filePath);
  }

  getCachedPathStatus(filePath) {
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return (_hgConstants || _load_hgConstants()).StatusCodeNumber.CLEAN;
    }
    const cachedStatus = this._sharedMembers.hgStatusCache.get(filePath);
    if (cachedStatus) {
      return cachedStatus;
    }
    return (_hgConstants || _load_hgConstants()).StatusCodeNumber.CLEAN;
  }

  // getAllPathStatuses -- this legacy API gets only uncommitted statuses
  getAllPathStatuses() {
    const pathStatuses = Object.create(null);
    for (const [filePath, status] of this._sharedMembers.hgStatusCache) {
      pathStatuses[filePath] = status;
    }
    // $FlowFixMe(>=0.55.0) Flow suppress
    return pathStatuses;
  }

  isStatusModified(status) {
    return status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED;
  }

  isStatusDeleted(status) {
    return (
      status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.MISSING || status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.REMOVED);

  }

  isStatusNew(status) {
    return (
      status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.ADDED || status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.UNTRACKED);

  }

  isStatusAdded(status) {
    return status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.ADDED;
  }

  isStatusUntracked(status) {
    return status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.UNTRACKED;
  }

  isStatusIgnored(status) {
    return status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.IGNORED;
  }

  /**
     *
     * Section: Retrieving Diffs (parity with GitRepository)
     *
     */

  getDiffStats(filePath) {
    const cleanStats = { added: 0, deleted: 0 };
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return cleanStats;
    }
    const cachedData = this._sharedMembers.hgDiffCache.get(filePath);
    return cachedData ?
    { added: cachedData.added, deleted: cachedData.deleted } :
    cleanStats;
  }

  /**
     * Returns an array of LineDiff that describes the diffs between the given
     * file's `HEAD` contents and its current contents.
     * NOTE: this method currently ignores the passed-in text, and instead diffs
     * against the currently saved contents of the file.
     */
  // TODO (jessicalin) Export the LineDiff type (from hg-output-helpers) when
  // types can be exported.
  // TODO (jessicalin) Make this method work with the passed-in `text`. t6391579
  getLineDiffs(filePath, text) {
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return [];
    }
    const diffInfo = this._sharedMembers.hgDiffCache.get(filePath);
    return diffInfo ? diffInfo.lineDiffs : [];
  }

  /**
     *
     * Section: Retrieving Diffs (async methods)
     *
     */

  /**
         * Updates the diff information for the given paths, and updates the cache.
         * @param An array of absolute file paths for which to update the diff info.
         * @return A map of each path to its DiffInfo.
         *   This method may return `null` if the call to `hg diff` fails.
         *   A file path will not appear in the returned Map if it is not in the repo,
         *   if it has no changes, or if there is a pending `hg diff` call for it already.
         */
  _updateDiffInfo(
  filePaths)
  {
    const pathsToFetch = filePaths.filter(aPath => {
      // Don't try to fetch information for this path if it's not in the repo.
      if (!this.isPathRelevantToRepository(aPath)) {
        return false;
      }
      // Don't do another update for this path if we are in the middle of running an update.
      if (this._sharedMembers.hgDiffCacheFilesUpdating.has(aPath)) {
        return false;
      } else {
        this._sharedMembers.hgDiffCacheFilesUpdating.add(aPath);
        return true;
      }
    });

    if (pathsToFetch.length === 0) {
      return _rxjsBundlesRxMinJs.Observable.of(new Map());
    }

    return this._getCurrentHeadId().switchMap(currentHeadId => {
      if (currentHeadId == null) {
        return _rxjsBundlesRxMinJs.Observable.of(new Map());
      }

      return this._getFileDiffs(pathsToFetch, currentHeadId).do(
      pathsToDiffInfo => {
        if (pathsToDiffInfo) {
          for (const [filePath, diffInfo] of pathsToDiffInfo) {
            this._sharedMembers.hgDiffCache.set(filePath, diffInfo);
          }
        }

        // Remove files marked for deletion.
        this._sharedMembers.hgDiffCacheFilesToClear.forEach(fileToClear => {
          this._sharedMembers.hgDiffCache.delete(fileToClear);
        });
        this._sharedMembers.hgDiffCacheFilesToClear.clear();

        // The fetched files can now be updated again.
        for (const pathToFetch of pathsToFetch) {
          this._sharedMembers.hgDiffCacheFilesUpdating.delete(pathToFetch);
        }

        // TODO (t9113913) Ideally, we could send more targeted events that better
        // describe what change has occurred. Right now, GitRepository dictates either
        // 'did-change-status' or 'did-change-statuses'.
        this._sharedMembers.emitter.emit('did-change-statuses');
      });

    });
  }

  _getFileDiffs(
  pathsToFetch,
  revision)
  {
    const fileContents = pathsToFetch.map(filePath => {
      const cachedContent = this._sharedMembers.fileContentsAtHead.get(
      filePath);

      let contentObservable;
      if (cachedContent == null) {
        contentObservable = this._sharedMembers.service.
        fetchFileContentAtRevision(filePath, revision).
        refCount().
        map(contents => {
          this._sharedMembers.fileContentsAtHead.set(filePath, contents);
          return contents;
        });
      } else {
        contentObservable = _rxjsBundlesRxMinJs.Observable.of(cachedContent);
      }
      return contentObservable.
      switchMap(content => {
        return (0, (_utils || _load_utils()).gitDiffContentAgainstFile)(content, filePath);
      }).
      map(diff => ({
        filePath,
        diff }));

    });
    const diffs = _rxjsBundlesRxMinJs.Observable.merge(...fileContents).
    map(({ filePath, diff }) => {
      // This is to differentiate between diff delimiter and the source
      // eslint-disable-next-line no-useless-escape
      const toParse = diff.split('--- ');
      const lineDiff = (0, (_hgDiffOutputParser || _load_hgDiffOutputParser()).parseHgDiffUnifiedOutput)(toParse[1]);
      return [filePath, lineDiff];
    }).
    toArray().
    map(contents => new Map(contents));
    return diffs;
  }

  _getCurrentHeadId() {
    if (this._sharedMembers.currentHeadId != null) {
      return _rxjsBundlesRxMinJs.Observable.of(this._sharedMembers.currentHeadId);
    }
    return this._sharedMembers.service.
    getHeadId().
    refCount().
    do(headId => this._sharedMembers.currentHeadId = headId);
  }

  fetchMergeConflicts() {
    return this._sharedMembers.service.fetchMergeConflicts().refCount();
  }

  markConflictedFile(
  filePath,
  resolved)
  {
    // TODO(T17463635)
    return this._sharedMembers.service.
    markConflictedFile(filePath, resolved).
    refCount();
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
  checkoutHead(filePathsArg) {
    const filePaths = Array.isArray(filePathsArg) ?
    filePathsArg :
    [filePathsArg];
    return this._sharedMembers.service.revert(filePaths);
  }

  checkoutReference(
  reference,
  create,
  options)
  {
    // TODO(T17463635)
    return this._sharedMembers.service.
    checkout(reference, create, options).
    refCount();
  }

  show(revision) {
    return this._sharedMembers.service.show(revision).refCount();
  }

  diff(
  revision,
  options =








  {})
  {
    const { unified, diffCommitted, noPrefix, noDates } = options;
    return this._sharedMembers.service.
    diff(String(revision), unified, diffCommitted, noPrefix, noDates).
    refCount();
  }

  purge() {
    return this._sharedMembers.service.purge();
  }

  stripReference(reference) {
    return this._sharedMembers.service.strip(reference);
  }

  uncommit() {
    return this._sharedMembers.service.uncommit();
  }

  checkoutForkBase() {
    return this._sharedMembers.service.checkoutForkBase();
  }

  /**
     *
     * Section: Bookmarks
     *
     */
  createBookmark(name, revision) {
    return this._sharedMembers.service.createBookmark(name, revision);
  }

  deleteBookmark(name) {
    return this._sharedMembers.service.deleteBookmark(name);
  }

  renameBookmark(name, nextName) {
    return this._sharedMembers.service.renameBookmark(name, nextName);
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
  filePath,
  revision)
  {
    let fileContentsAtRevision = this._sharedMembers.fileContentsAtRevisionIds.get(
    revision);

    if (fileContentsAtRevision == null) {
      fileContentsAtRevision = new Map();
      this._sharedMembers.fileContentsAtRevisionIds.set(
      revision,
      fileContentsAtRevision);

    }
    const committedContents = fileContentsAtRevision.get(filePath);
    if (committedContents != null) {
      return _rxjsBundlesRxMinJs.Observable.of(committedContents);
    } else {
      return this._sharedMembers.service.
      fetchFileContentAtRevision(filePath, revision).
      refCount().
      do(contents => fileContentsAtRevision.set(filePath, contents));
    }
  }

  fetchFilesChangedAtRevision(
  revision)
  {
    const changes = this._sharedMembers.revisionIdToFileChanges.get(revision);
    if (changes != null) {
      return _rxjsBundlesRxMinJs.Observable.of(changes);
    } else {
      return this._sharedMembers.service.
      fetchFilesChangedAtRevision(revision).
      refCount().
      do(fetchedChanges =>
      this._sharedMembers.revisionIdToFileChanges.set(
      revision,
      fetchedChanges));


    }
  }

  fetchFilesChangedSinceRevision(
  revision)
  {
    return this._sharedMembers.service.
    fetchStatuses(revision).
    refCount().
    map(fileStatuses => {
      const statusesWithCodeIds = new Map();
      for (const [filePath, code] of fileStatuses) {
        statusesWithCodeIds.set(filePath, (_hgConstants || _load_hgConstants()).StatusCodeIdToNumber[code]);
      }
      return statusesWithCodeIds;
    });
  }

  fetchRevisionInfoBetweenHeadAndBase() {
    return this._sharedMembers.service.fetchRevisionInfoBetweenHeadAndBase();
  }

  fetchSmartlogRevisions() {
    return this._sharedMembers.service.fetchSmartlogRevisions().refCount();
  }

  refreshRevisions() {
    this._sharedMembers.revisionsCache.refreshRevisions();
  }

  refreshRevisionsStatuses() {
    this._sharedMembers.revisionStatusCache.refresh();
  }

  getCachedRevisions() {
    return this._sharedMembers.revisionsCache.getCachedRevisions().revisions;
  }

  getCachedRevisionStatuses() {
    return this._sharedMembers.revisionStatusCache.getCachedRevisionStatuses();
  }

  // See HgService.getBaseRevision.
  getBaseRevision() {
    return this._sharedMembers.service.getBaseRevision();
  }

  // See HgService.getBlameAtHead.
  getBlameAtHead(filePath) {
    return this._sharedMembers.service.getBlameAtHead(filePath);
  }

  getTemplateCommitMessage() {
    return this._sharedMembers.service.getTemplateCommitMessage();
  }

  getHeadCommitMessage() {
    return this._sharedMembers.service.getHeadCommitMessage();
  }

  /**
     * Return relative paths to status code number values object.
     * matching `GitRepositoryAsync` implementation.
     */
  getCachedPathStatuses() {
    const absoluteCodePaths = this.getAllPathStatuses();
    const relativeCodePaths = {};
    for (const absolutePath in absoluteCodePaths) {
      const relativePath = this.relativize(absolutePath);
      relativeCodePaths[relativePath] = absoluteCodePaths[absolutePath];
    }
    return relativeCodePaths;
  }

  getConfigValueAsync(key, path) {
    return this._sharedMembers.service.getConfigValueAsync(key);
  }

  // See HgService.getDifferentialRevisionForChangeSetId.
  getDifferentialRevisionForChangeSetId(changeSetId) {
    return this._sharedMembers.service.getDifferentialRevisionForChangeSetId(
    changeSetId);

  }

  getSmartlog(ttyOutput, concise) {
    return this._sharedMembers.service.getSmartlog(ttyOutput, concise);
  }

  copy(
  filePaths,
  destPath,
  after = false)
  {
    return this._sharedMembers.service.copy(filePaths, destPath, after);
  }

  rename(
  filePaths,
  destPath,
  after = false)
  {
    return this._sharedMembers.service.rename(filePaths, destPath, after);
  }

  remove(filePaths, after = false) {
    return this._sharedMembers.service.remove(filePaths, after);
  }

  forget(filePaths) {
    return this._sharedMembers.service.forget(filePaths);
  }

  addAll(filePaths) {
    return this._sharedMembers.service.add(filePaths);
  }

  commit(
  message,
  filePaths = [])
  {
    // TODO(T17463635)
    return this._sharedMembers.service.
    commit(message, filePaths).
    refCount().
    do(processMessage =>
    this._clearOnSuccessExit(processMessage, filePaths));

  }

  amend(
  message,
  amendMode,
  filePaths = [])
  {
    // TODO(T17463635)
    return this._sharedMembers.service.
    amend(message, amendMode, filePaths).
    refCount().
    do(processMessage =>
    this._clearOnSuccessExit(processMessage, filePaths));

  }

  restack() {
    return this._sharedMembers.service.restack().refCount();
  }

  editCommitMessage(
  revision,
  message)
  {
    return this._sharedMembers.service.
    editCommitMessage(revision, message).
    refCount();
  }

  _clearOnSuccessExit(
  message,
  filePaths)
  {
    if (message.kind === 'exit' && message.exitCode === 0) {
      this._clearClientCache(filePaths);
    }
  }

  revert(filePaths, toRevision) {
    return this._sharedMembers.service.revert(filePaths, toRevision);
  }

  log(filePaths, limit) {
    // TODO(mbolin): Return an Observable so that results appear faster.
    // Unfortunately, `hg log -Tjson` is not Observable-friendly because it will
    // not parse as JSON until all of the data has been printed to stdout.
    return this._sharedMembers.service.log(filePaths, limit);
  }

  getFullHashForRevision(rev) {
    return this._sharedMembers.service.getFullHashForRevision(rev);
  }

  continueOperation(
  commandWithOptions)
  {
    // TODO(T17463635)
    return this._sharedMembers.service.
    continueOperation(commandWithOptions).
    refCount();
  }

  abortOperation(commandWithOptions) {
    return this._sharedMembers.service.
    abortOperation(commandWithOptions).
    refCount();
  }

  resolveAllFiles() {
    return this._sharedMembers.service.resolveAllFiles().refCount();
  }

  rebase(
  destination,
  source)
  {
    // TODO(T17463635)
    return this._sharedMembers.service.rebase(destination, source).refCount();
  }

  reorderWithinStack(orderedRevisions) {
    return this._sharedMembers.service.
    reorderWithinStack(orderedRevisions).
    refCount();
  }

  pull(options = []) {
    // TODO(T17463635)
    return this._sharedMembers.service.pull(options).refCount();
  }

  fold(from, to, message) {
    return this._sharedMembers.service.fold(from, to, message).refCount();
  }

  _clearClientCache(filePaths) {
    if (filePaths.length === 0) {
      this._sharedMembers.hgDiffCache = new Map();
      this._sharedMembers.hgStatusCache = new Map();
      this._sharedMembers.fileContentsAtHead.reset();
    } else {
      this._sharedMembers.hgDiffCache = new Map(
      this._sharedMembers.hgDiffCache);

      this._sharedMembers.hgStatusCache = new Map(
      this._sharedMembers.hgStatusCache);

      filePaths.forEach(filePath => {
        this._sharedMembers.hgDiffCache.delete(filePath);
        this._sharedMembers.hgStatusCache.delete(filePath);
      });
    }
    this._sharedMembers.emitter.emit('did-change-statuses');
  }

  requestPathStatusRefresh() {
    this._sharedMembers.manualStatusRefreshRequests.next();
  }

  runCommand(args) {
    return this._sharedMembers.service.runCommand(args).refCount();
  }

  observeExecution(args) {
    return this._sharedMembers.service.observeExecution(args).refCount();
  }}exports.HgRepositoryClient = HgRepositoryClient;