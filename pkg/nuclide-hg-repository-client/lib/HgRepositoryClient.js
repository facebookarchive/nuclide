"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HgRepositoryClient = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _eventKit() {
  const data = require("event-kit");

  _eventKit = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _RevisionsCache() {
  const data = _interopRequireDefault(require("./RevisionsCache"));

  _RevisionsCache = function () {
    return data;
  };

  return data;
}

function _hgConstants() {
  const data = require("../../nuclide-hg-rpc/lib/hg-constants");

  _hgConstants = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _lruCache() {
  const data = _interopRequireDefault(require("lru-cache"));

  _lruCache = function () {
    return data;
  };

  return data;
}

function _observePaneItemVisibility() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/observePaneItemVisibility"));

  _observePaneItemVisibility = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const STATUS_DEBOUNCE_DELAY_MS = 300;
const REVISION_DEBOUNCE_DELAY = 300;
const BOOKMARKS_DEBOUNCE_DELAY = 200;
const FETCH_BOOKMARKS_TIMEOUT = 15 * 1000;

/**
 *
 * Section: Constants, Type Definitions
 *
 */
const DID_CHANGE_CONFLICT_STATE = 'did-change-conflict-state';

function getRevisionStatusCache(revisionsCache, workingDirectoryPath) {
  try {
    // $FlowFB
    const FbRevisionStatusCache = require("./fb/RevisionStatusCache").default;

    return new FbRevisionStatusCache(revisionsCache, workingDirectoryPath);
  } catch (e) {
    return {
      getCachedRevisionStatuses() {
        return new Map();
      },

      observeRevisionStatusesChanges() {
        return _RxMin.Observable.empty();
      },

      refresh() {}

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


class HgRepositoryClient {
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
  constructor(repoPath, hgService, options) {
    // $FlowFixMe - by the end of the constructor, all the members should be initialized
    this._sharedMembers = {};
    this._sharedMembers.rootRepo = this;
    this._sharedMembers.path = repoPath;
    this._sharedMembers.workingDirectoryPath = options.workingDirectoryPath;
    this._sharedMembers.projectDirectoryPath = options.projectDirectoryPath;
    this._sharedMembers.originURL = options.originURL;
    this._sharedMembers.service = hgService;
    this._sharedMembers.isInConflict = false;
    this._sharedMembers.isDestroyed = false;
    this._sharedMembers.revisionsCache = new (_RevisionsCache().default)(this._sharedMembers.workingDirectoryPath, hgService);
    this._sharedMembers.revisionStatusCache = getRevisionStatusCache(this._sharedMembers.revisionsCache, this._sharedMembers.workingDirectoryPath);
    this._sharedMembers.revisionIdToFileChanges = new (_lruCache().default)({
      max: 100
    });
    this._sharedMembers.fileContentsAtRevisionIds = new (_lruCache().default)({
      max: 20
    });
    this._sharedMembers.emitter = new (_eventKit().Emitter)();
    this._sharedMembers.subscriptions = new (_UniversalDisposable().default)(this._sharedMembers.emitter);
    this._sharedMembers.isFetchingPathStatuses = new _RxMin.Subject();
    this._sharedMembers.manualStatusRefreshRequests = new _RxMin.Subject();
    this._sharedMembers.refreshLocksFilesObserver = new _RxMin.Subject();
    this._sharedMembers.hgStatusCache = new Map();
    this._sharedMembers.bookmarks = new _RxMin.BehaviorSubject({
      isLoading: true,
      bookmarks: []
    });
    this._sharedMembers.bufferDiffsFromHeadCache = new Map();
    this._sharedMembers.repoSubscriptions = this._sharedMembers.service.createRepositorySubscriptions(this._sharedMembers.workingDirectoryPath).catch(error => {
      atom.notifications.addWarning('Mercurial: failed to subscribe to watchman!');
      (0, _log4js().getLogger)('nuclide-hg-repository-client').error(`Failed to subscribe to watchman in ${this._sharedMembers.workingDirectoryPath}`, error);
      return null;
    });

    const fileChanges = this._tryObserve(s => s.observeFilesDidChange().refCount());

    const repoStateChanges = _RxMin.Observable.merge(this._tryObserve(s => s.observeHgRepoStateDidChange().refCount()), this._sharedMembers.manualStatusRefreshRequests);

    const activeBookmarkChanges = this._tryObserve(s => s.observeActiveBookmarkDidChange().refCount());

    const allBookmarkChanges = this._tryObserve(s => s.observeBookmarksDidChange().refCount());

    const conflictStateChanges = this._tryObserve(s => s.observeHgConflictStateDidChange().refCount());

    const commitChanges = this._tryObserve(s => s.observeHgCommitsDidChange().refCount());

    this._sharedMembers.hgUncommittedStatusChanges = this._observeStatus(fileChanges, repoStateChanges, () => this._sharedMembers.service.fetchStatuses(this._sharedMembers.workingDirectoryPath));
    this._sharedMembers.hgStackStatusChanges = this._observeStatus(fileChanges, repoStateChanges, () => this._sharedMembers.service.fetchStackStatuses(this._sharedMembers.workingDirectoryPath));
    this._sharedMembers.hgHeadStatusChanges = this._observeStatus(fileChanges, repoStateChanges, () => this._sharedMembers.service.fetchHeadStatuses(this._sharedMembers.workingDirectoryPath));

    const statusChangesSubscription = this._sharedMembers.hgUncommittedStatusChanges.statusChanges.subscribe(statuses => {
      this._sharedMembers.hgStatusCache = statuses;

      this._sharedMembers.emitter.emit('did-change-statuses');
    });

    const shouldRevisionsUpdate = _RxMin.Observable.merge(this._sharedMembers.bookmarks.asObservable(), commitChanges, repoStateChanges).let((0, _observable().fastDebounce)(REVISION_DEBOUNCE_DELAY));

    const bookmarksUpdates = _RxMin.Observable.merge(activeBookmarkChanges, allBookmarkChanges).startWith(null).let((0, _observable().fastDebounce)(BOOKMARKS_DEBOUNCE_DELAY)).switchMap(() => _RxMin.Observable.defer(() => {
      return _RxMin.Observable.fromPromise(this._sharedMembers.service.fetchBookmarks(this._sharedMembers.workingDirectoryPath)).timeout(FETCH_BOOKMARKS_TIMEOUT);
    }).retry(2).catch(error => {
      (0, _log4js().getLogger)('nuclide-hg-repository-client').error('failed to fetch bookmarks info:', error);
      return _RxMin.Observable.empty();
    }));

    this._sharedMembers.subscriptions.add(statusChangesSubscription, bookmarksUpdates.subscribe(bookmarks => this._sharedMembers.bookmarks.next({
      isLoading: false,
      bookmarks
    })), conflictStateChanges.subscribe(this._conflictStateChanged.bind(this)), shouldRevisionsUpdate.subscribe(() => {
      this._sharedMembers.revisionsCache.refreshRevisions();
    }));
  } // A single root HgRepositoryClient can back multiple HgRepositoryClients
  // via differential inheritance. This gets the 'original' HgRepositoryClient


  getRootRepoClient() {
    return this._sharedMembers.rootRepo;
  } // this._repoSubscriptions can potentially fail if Watchman fails.
  // The current behavior is to behave as if no changes ever occur.


  _tryObserve(observe) {
    return _RxMin.Observable.fromPromise(this._sharedMembers.repoSubscriptions).switchMap(repoSubscriptions => {
      if (repoSubscriptions == null) {
        return _RxMin.Observable.never();
      }

      return observe(repoSubscriptions);
    });
  }

  async getAdditionalLogFiles(deadline) {
    const path = this._sharedMembers.workingDirectoryPath;
    const prefix = _nuclideUri().default.isRemote(path) ? `${_nuclideUri().default.getHostname(path)}:` : '';
    const results = await (0, _promise().timeoutAfterDeadline)(deadline, this._sharedMembers.service.getAdditionalLogFiles(this._sharedMembers.workingDirectoryPath, deadline - 1000)).catch(e => [{
      title: `${path}:hg`,
      data: (0, _string().stringifyError)(e)
    }]);
    return results.map(log => Object.assign({}, log, {
      title: prefix + log.title
    }));
  }

  _observeStatus(fileChanges, repoStateChanges, fetchStatuses) {
    const triggers = _RxMin.Observable.merge(fileChanges, repoStateChanges).let((0, _observable().fastDebounce)(STATUS_DEBOUNCE_DELAY_MS)).share().startWith(null); // Share comes before startWith. That's because fileChanges/repoStateChanges
    // are already hot and can be shared fine. But we want both our subscribers,
    // statusChanges and isCalculatingChanges, to pick up their own copy of
    // startWith(null) no matter which order they subscribe.


    const statusChanges = (0, _observable().cacheWhileSubscribed)(triggers.switchMap(() => {
      this._sharedMembers.isFetchingPathStatuses.next(true);

      return fetchStatuses().refCount().catch(error => {
        (0, _log4js().getLogger)('nuclide-hg-repository-client').error('HgService cannot fetch statuses', error);
        return _RxMin.Observable.empty();
      }).finally(() => {
        this._sharedMembers.isFetchingPathStatuses.next(false);
      });
    }).map(uriToStatusIds => (0, _collection().mapTransform)(uriToStatusIds, (v, k) => _hgConstants().StatusCodeIdToNumber[v])));
    const isCalculatingChanges = (0, _observable().cacheWhileSubscribed)(_RxMin.Observable.merge(triggers.map(_ => true), statusChanges.map(_ => false)).distinctUntilChanged());
    return {
      statusChanges,
      isCalculatingChanges
    };
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

    this._sharedMembers.refreshLocksFilesObserver.complete();

    this._sharedMembers.repoSubscriptions.then(repoSubscriptions => {
      if (repoSubscriptions != null) {
        repoSubscriptions.dispose();
      }
    });
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

  onDidChangeStatus(callback) {
    return this._sharedMembers.emitter.on('did-change-status', callback);
  }

  observeBookmarks() {
    return this._sharedMembers.bookmarks.asObservable().filter(b => !b.isLoading).map(b => b.bookmarks);
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
    return (0, _observePaneItemVisibility().default)(item);
  }

  observeOperationProgressChanges() {
    return this._tryObserve(s => s.observeHgOperationProgressDidChange().refCount());
  }

  onDidChangeStatuses(callback) {
    return this._sharedMembers.emitter.on('did-change-statuses', callback);
  }

  onDidChangeConflictState(callback) {
    return this._sharedMembers.emitter.on(DID_CHANGE_CONFLICT_STATE, callback);
  }

  observeLockFiles() {
    return _RxMin.Observable.merge(this._tryObserve(s => s.observeLockFilesDidChange().refCount()), this._sharedMembers.refreshLocksFilesObserver.asObservable());
  }

  observeHeadRevision() {
    return this.observeRevisionChanges().map(revisionInfoFetched => revisionInfoFetched.revisions.find(revision => revision.isHead)).let(_observable().compact).distinctUntilChanged((prevRev, nextRev) => prevRev.hash === nextRev.hash);
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
    return this._sharedMembers.workingDirectoryPath;
  } // @return The path of the root project folder in Atom that this
  // HgRepositoryClient provides information about.


  getProjectDirectory() {
    return (0, _nullthrows().default)(this._sharedMembers.projectDirectoryPath);
  } // TODO This is a stub.


  isProjectAtRoot() {
    return true;
  }

  relativize(filePath) {
    return _nuclideUri().default.relative(this._sharedMembers.workingDirectoryPath, filePath);
  } // TODO This is a stub.


  hasBranch(branch) {
    return false;
  }
  /**
   * @return The current Hg bookmark.
   */


  getShortHead(filePath) {
    return this._sharedMembers.bookmarks.getValue().bookmarks.filter(bookmark => bookmark.active).map(bookmark => bookmark.bookmark)[0] || '';
  } // TODO This is a stub.


  isSubmodule(path) {
    return false;
  } // TODO This is a stub.


  getAheadBehindCount(reference, path) {
    return 0;
  } // TODO This is a stub.


  getCachedUpstreamAheadBehindCount(path) {
    return {
      ahead: 0,
      behind: 0
    };
  } // TODO This is a stub.


  getConfigValue(key, path) {
    return null;
  }

  getOriginURL(path) {
    return this._sharedMembers.originURL;
  } // TODO This is a stub.


  getUpstreamBranch(path) {
    return null;
  } // TODO This is a stub.


  getReferences(path) {
    return {
      heads: [],
      remotes: [],
      tags: []
    };
  } // TODO This is a stub.


  getReferenceTarget(reference, path) {
    return null;
  } // Added for conflict detection.


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
  } // TODO (jessicalin) Can we change the API to make this method return a Promise?
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
  } // TODO (jessicalin) Can we change the API to make this method return a Promise?
  // If not, this method lies a bit by using cached information.
  // TODO (jessicalin) Make this work for ignored directories.


  isPathIgnored(filePath) {
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return false;
    } // `hg status -i` does not list the repo (the .hg directory), presumably
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
    return filePath === this.getPath() || filePath.indexOf(this.getPath() + '/') === 0;
  }
  /**
   * Checks whether a path is relevant to this HgRepositoryClient. A path is
   * defined as 'relevant' if it is within the project directory opened within the repo.
   */


  isPathRelevant(filePath) {
    return _nuclideUri().default.contains(this.getProjectDirectory(), filePath);
  }

  isPathRelevantToRepository(filePath) {
    return _nuclideUri().default.contains(this._sharedMembers.workingDirectoryPath, filePath);
  } // non-used stub.


  getDirectoryStatus(directoryPath) {
    return _hgConstants().StatusCodeNumber.CLEAN;
  } // We don't want to do any synchronous 'hg status' calls. Just use cached values.


  getPathStatus(filePath) {
    return this.getCachedPathStatus(filePath);
  }

  getCachedPathStatus(filePath) {
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return _hgConstants().StatusCodeNumber.CLEAN;
    }

    const cachedStatus = this._sharedMembers.hgStatusCache.get(filePath);

    if (cachedStatus) {
      return cachedStatus;
    }

    return _hgConstants().StatusCodeNumber.CLEAN;
  } // getAllPathStatuses -- this legacy API gets only uncommitted statuses


  getAllPathStatuses() {
    const pathStatuses = Object.create(null);

    for (const [filePath, status] of this._sharedMembers.hgStatusCache) {
      pathStatuses[filePath] = status;
    } // $FlowFixMe(>=0.55.0) Flow suppress


    return pathStatuses;
  }

  isStatusModified(status) {
    return status === _hgConstants().StatusCodeNumber.MODIFIED;
  }

  isStatusDeleted(status) {
    return status === _hgConstants().StatusCodeNumber.MISSING || status === _hgConstants().StatusCodeNumber.REMOVED;
  }

  isStatusNew(status) {
    return status === _hgConstants().StatusCodeNumber.ADDED || status === _hgConstants().StatusCodeNumber.UNTRACKED;
  }

  isStatusAdded(status) {
    return status === _hgConstants().StatusCodeNumber.ADDED;
  }

  isStatusUntracked(status) {
    return status === _hgConstants().StatusCodeNumber.UNTRACKED;
  }

  isStatusIgnored(status) {
    return status === _hgConstants().StatusCodeNumber.IGNORED;
  }
  /**
   *
   * Section: Retrieving Diffs (parity with GitRepository)
   *
   */


  setDiffInfo(filePath, diffInfo) {
    if (this.isPathRelevantToRepository(filePath)) {
      this._sharedMembers.bufferDiffsFromHeadCache.set(filePath, diffInfo);
    }
  }

  deleteDiffInfo(filePath) {
    this._sharedMembers.bufferDiffsFromHeadCache.delete(filePath);
  }

  clearAllDiffInfo() {
    this._sharedMembers.bufferDiffsFromHeadCache.clear();
  }

  getDiffStats(filePath) {
    return this._sharedMembers.bufferDiffsFromHeadCache.get(filePath) || {
      added: 0,
      deleted: 0
    };
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


  getLineDiffs(filePath, text) {
    const diffInfo = this._sharedMembers.bufferDiffsFromHeadCache.get(filePath);

    return diffInfo != null ? diffInfo.lineDiffs : [];
  }
  /**
   *
   * Section: Retrieving Diffs (async methods)
   *
   */


  fetchMergeConflicts() {
    return this._sharedMembers.service.fetchMergeConflicts(this._sharedMembers.workingDirectoryPath).refCount();
  }

  markConflictedFile(filePath, resolved) {
    // TODO(T17463635)
    return this._sharedMembers.service.markConflictedFile(this._sharedMembers.workingDirectoryPath, filePath, resolved).refCount();
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
    const filePaths = Array.isArray(filePathsArg) ? filePathsArg : [filePathsArg];
    return this._sharedMembers.service.revert(this._sharedMembers.workingDirectoryPath, filePaths);
  }

  checkoutReference(reference, create, options) {
    // TODO(T17463635)
    return this._sharedMembers.service.checkout(this._sharedMembers.workingDirectoryPath, reference, create, options).refCount();
  }

  show(revision) {
    return this._sharedMembers.service.show(this._sharedMembers.workingDirectoryPath, revision).refCount();
  }

  diff(revision, options = {}) {
    const {
      unified,
      diffCommitted,
      noPrefix,
      noDates
    } = options;
    return this._sharedMembers.service.diff(this._sharedMembers.workingDirectoryPath, String(revision), unified, diffCommitted, noPrefix, noDates).refCount();
  }

  purge() {
    return this._sharedMembers.service.purge(this._sharedMembers.workingDirectoryPath);
  }

  stripReference(reference) {
    return this._sharedMembers.service.strip(this._sharedMembers.workingDirectoryPath, reference);
  }

  uncommit() {
    return this._sharedMembers.service.uncommit(this._sharedMembers.workingDirectoryPath);
  }

  checkoutForkBase() {
    return this._sharedMembers.service.checkoutForkBase(this._sharedMembers.workingDirectoryPath);
  }
  /**
   *
   * Section: Bookmarks
   *
   */


  createBookmark(name, revision) {
    return this._sharedMembers.service.createBookmark(this._sharedMembers.workingDirectoryPath, name, revision);
  }

  deleteBookmark(name) {
    return this._sharedMembers.service.deleteBookmark(this._sharedMembers.workingDirectoryPath, name);
  }

  renameBookmark(name, nextName) {
    return this._sharedMembers.service.renameBookmark(this._sharedMembers.workingDirectoryPath, name, nextName);
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


  fetchFileContentAtRevision(filePath, revision) {
    let fileContentsAtRevision = this._sharedMembers.fileContentsAtRevisionIds.get(revision);

    if (fileContentsAtRevision == null) {
      fileContentsAtRevision = new Map();

      this._sharedMembers.fileContentsAtRevisionIds.set(revision, fileContentsAtRevision);
    }

    const committedContents = fileContentsAtRevision.get(filePath);

    if (committedContents != null) {
      return _RxMin.Observable.of(committedContents);
    } else {
      return this._sharedMembers.service.fetchFileContentAtRevision(this._sharedMembers.workingDirectoryPath, filePath, revision).refCount().do(contents => fileContentsAtRevision.set(filePath, contents));
    }
  }

  fetchMultipleFilesContentAtRevision(filePaths, revision) {
    return this.runCommand(['cat', '-Tjson', ...filePaths]).map(JSON.parse);
  }

  fetchFilesChangedAtRevision(revision) {
    const changes = this._sharedMembers.revisionIdToFileChanges.get(revision);

    if (changes != null) {
      return _RxMin.Observable.of(changes);
    } else {
      return this._sharedMembers.service.fetchFilesChangedAtRevision(this._sharedMembers.workingDirectoryPath, revision).refCount().do(fetchedChanges => this._sharedMembers.revisionIdToFileChanges.set(revision, fetchedChanges));
    }
  }

  fetchFilesChangedSinceRevision(revision) {
    return this._sharedMembers.service.fetchStatuses(this._sharedMembers.workingDirectoryPath, revision).refCount().map(fileStatuses => {
      const statusesWithCodeIds = new Map();

      for (const [filePath, code] of fileStatuses) {
        statusesWithCodeIds.set(filePath, _hgConstants().StatusCodeIdToNumber[code]);
      }

      return statusesWithCodeIds;
    });
  }

  fetchRevisionInfoBetweenHeadAndBase() {
    return this._sharedMembers.service.fetchRevisionInfoBetweenHeadAndBase(this._sharedMembers.workingDirectoryPath);
  }

  fetchSmartlogRevisions() {
    return this._sharedMembers.service.fetchSmartlogRevisions(this._sharedMembers.workingDirectoryPath).refCount();
  }

  refreshRevisions() {
    this._sharedMembers.revisionsCache.refreshRevisions();

    this._sharedMembers.service.getLockFilesInstantaneousExistance(this._sharedMembers.workingDirectoryPath).then(result => {
      this._sharedMembers.refreshLocksFilesObserver.next(result);
    });
  }

  refreshRevisionsStatuses() {
    this._sharedMembers.revisionStatusCache.refresh();
  }

  getCachedRevisions() {
    return this._sharedMembers.revisionsCache.getCachedRevisions().revisions;
  }

  getCachedRevisionStatuses() {
    return this._sharedMembers.revisionStatusCache.getCachedRevisionStatuses();
  } // See HgService.getBaseRevision.


  getBaseRevision() {
    return this._sharedMembers.service.getBaseRevision(this._sharedMembers.workingDirectoryPath);
  } // See HgService.getBlameAtHead.


  getBlameAtHead(filePath) {
    return this._sharedMembers.service.getBlameAtHead(this._sharedMembers.workingDirectoryPath, filePath);
  }

  getTemplateCommitMessage() {
    return this._sharedMembers.service.getTemplateCommitMessage(this._sharedMembers.workingDirectoryPath);
  }

  getHeadCommitMessage() {
    return this._sharedMembers.service.getHeadCommitMessage(this._sharedMembers.workingDirectoryPath);
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
    return this._sharedMembers.service.getConfigValueAsync(this._sharedMembers.workingDirectoryPath, key);
  } // See HgService.getDifferentialRevisionForChangeSetId.


  getDifferentialRevisionForChangeSetId(changeSetId) {
    return this._sharedMembers.service.getDifferentialRevisionForChangeSetId(this._sharedMembers.workingDirectoryPath, changeSetId);
  }

  getSmartlog(ttyOutput, concise) {
    return this._sharedMembers.service.getSmartlog(this._sharedMembers.workingDirectoryPath, ttyOutput, concise);
  }

  copy(filePaths, destPath, after = false) {
    return this._sharedMembers.service.copy(this._sharedMembers.workingDirectoryPath, filePaths, destPath, after);
  }

  rename(filePaths, destPath, after = false) {
    return this._sharedMembers.service.rename(this._sharedMembers.workingDirectoryPath, filePaths, destPath, after);
  }

  remove(filePaths, after = false) {
    return this._sharedMembers.service.remove(this._sharedMembers.workingDirectoryPath, filePaths, after);
  }

  forget(filePaths) {
    return this._sharedMembers.service.forget(this._sharedMembers.workingDirectoryPath, filePaths);
  }

  addAll(filePaths) {
    return this._sharedMembers.service.add(this._sharedMembers.workingDirectoryPath, filePaths);
  }

  commit(message, filePaths = []) {
    // TODO(T17463635)
    return this._sharedMembers.service.commit(this._sharedMembers.workingDirectoryPath, message, filePaths).refCount().do(processMessage => this._clearOnSuccessExit(processMessage, filePaths));
  }

  amend(message, amendMode, filePaths = []) {
    // TODO(T17463635)
    return this._sharedMembers.service.amend(this._sharedMembers.workingDirectoryPath, message, amendMode, filePaths).refCount().do(processMessage => this._clearOnSuccessExit(processMessage, filePaths));
  }

  restack() {
    return this._sharedMembers.service.restack(this._sharedMembers.workingDirectoryPath).refCount();
  }

  editCommitMessage(revision, message) {
    return this._sharedMembers.service.editCommitMessage(this._sharedMembers.workingDirectoryPath, revision, message).refCount();
  }

  _clearOnSuccessExit(message, filePaths) {
    if (message.kind === 'exit' && message.exitCode === 0) {
      this._clearClientCache(filePaths);
    }
  }

  revert(filePaths, toRevision) {
    return this._sharedMembers.service.revert(this._sharedMembers.workingDirectoryPath, filePaths, toRevision);
  }

  log(filePaths, limit) {
    // TODO(mbolin): Return an Observable so that results appear faster.
    // Unfortunately, `hg log -Tjson` is not Observable-friendly because it will
    // not parse as JSON until all of the data has been printed to stdout.
    return this._sharedMembers.service.log(this._sharedMembers.workingDirectoryPath, filePaths, limit);
  }

  getFullHashForRevision(rev) {
    return this._sharedMembers.service.getFullHashForRevision(this._sharedMembers.workingDirectoryPath, rev);
  }

  continueOperation(commandWithOptions) {
    // TODO(T17463635)
    return this._sharedMembers.service.continueOperation(this._sharedMembers.workingDirectoryPath, commandWithOptions).refCount();
  }

  abortOperation(commandWithOptions) {
    return this._sharedMembers.service.abortOperation(this._sharedMembers.workingDirectoryPath, commandWithOptions).refCount();
  }

  resolveAllFiles() {
    return this._sharedMembers.service.resolveAllFiles(this._sharedMembers.workingDirectoryPath).refCount();
  }

  rebase(destination, source) {
    // TODO(T17463635)
    return this._sharedMembers.service.rebase(this._sharedMembers.workingDirectoryPath, destination, source).refCount();
  }

  reorderWithinStack(orderedRevisions) {
    return this._sharedMembers.service.reorderWithinStack(this._sharedMembers.workingDirectoryPath, orderedRevisions).refCount();
  }

  pull(options = []) {
    // TODO(T17463635)
    return this._sharedMembers.service.pull(this._sharedMembers.workingDirectoryPath, options).refCount();
  }

  fold(from, to, message) {
    return this._sharedMembers.service.fold(this._sharedMembers.workingDirectoryPath, from, to, message).refCount();
  }

  _clearClientCache(filePaths) {
    if (filePaths.length === 0) {
      this._sharedMembers.hgStatusCache = new Map();
    } else {
      this._sharedMembers.hgStatusCache = new Map(this._sharedMembers.hgStatusCache);
      filePaths.forEach(filePath => {
        this._sharedMembers.hgStatusCache.delete(filePath);
      });
    }

    this._sharedMembers.emitter.emit('did-change-statuses');
  }

  requestPathStatusRefresh() {
    this._sharedMembers.manualStatusRefreshRequests.next();
  }

  runCommand(args) {
    return this._sharedMembers.service.runCommand(this._sharedMembers.workingDirectoryPath, args).refCount();
  }

  observeExecution(args) {
    return this._sharedMembers.service.observeExecution(this._sharedMembers.workingDirectoryPath, args).refCount();
  }

}

exports.HgRepositoryClient = HgRepositoryClient;