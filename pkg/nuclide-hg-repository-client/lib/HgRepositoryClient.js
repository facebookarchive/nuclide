'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HgRepositoryClient = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _atom = require('atom');

var _RevisionsCache;

function _load_RevisionsCache() {
  return _RevisionsCache = _interopRequireDefault(require('./RevisionsCache'));
}

var _hgConstants;

function _load_hgConstants() {
  return _hgConstants = require('../../nuclide-hg-rpc/lib/hg-constants');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _buffer;

function _load_buffer() {
  return _buffer = require('../../commons-atom/buffer');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const STATUS_DEBOUNCE_DELAY_MS = 300;
const REVISION_DEBOUNCE_DELAY = 300;

/**
 *
 * Section: Constants, Type Definitions
 *
 */

const DID_CHANGE_CONFLICT_STATE = 'did-change-conflict-state';

function getRevisionStatusCache(revisionsCache, workingDirectoryPath) {
  try {
    // $FlowFB
    const FbRevisionStatusCache = require('./fb/RevisionStatusCache');
    return new FbRevisionStatusCache(revisionsCache, workingDirectoryPath);
  } catch (e) {
    return {
      getCachedRevisionStatuses: function () {
        return new Map();
      },
      observeRevisionStatusesChanges: function () {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
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

let HgRepositoryClient = exports.HgRepositoryClient = class HgRepositoryClient {

  constructor(repoPath, hgService, options) {
    this._path = repoPath;
    this._workingDirectory = options.workingDirectory;
    this._projectDirectory = options.projectRootDirectory;
    this._originURL = options.originURL;
    this._service = hgService;
    this._isInConflict = false;
    this._isDestroyed = false;
    this._revisionsCache = new (_RevisionsCache || _load_RevisionsCache()).default(hgService);
    this._revisionStatusCache = getRevisionStatusCache(this._revisionsCache, this._workingDirectory.getPath());
    this._revisionIdToFileChanges = new (_lruCache || _load_lruCache()).default({ max: 100 });
    this._fileContentsAtRevisionIds = new (_lruCache || _load_lruCache()).default({ max: 20 });

    this._emitter = new _atom.Emitter();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._emitter, this._service);

    this._hgStatusCache = {};

    this._hgDiffCache = {};
    this._hgDiffCacheFilesUpdating = new Set();
    this._hgDiffCacheFilesToClear = new Set();

    const diffStatsSubscription = (_featureConfig || _load_featureConfig()).default.observeAsStream('nuclide-hg-repository.enableDiffStats').switchMap(enableDiffStats => {
      if (!enableDiffStats) {
        // TODO(most): rewrite fetching structures avoiding side effects
        this._hgDiffCache = {};
        this._emitter.emit('did-change-statuses');
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      return (0, (_buffer || _load_buffer()).observeBufferOpen)().filter(buffer => {
        const filePath = buffer.getPath();
        return filePath != null && filePath.length !== 0 && this.isPathRelevant(filePath);
      }).flatMap(buffer => {
        const filePath = buffer.getPath();

        if (!filePath) {
          throw new Error('already filtered empty and non-relevant file paths');
        }

        return (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidSave.bind(buffer)).map(() => filePath).startWith(filePath).takeUntil((0, (_buffer || _load_buffer()).observeBufferCloseOrRename)(buffer).do(() => {
          // TODO(most): rewrite to be simpler and avoid side effects.
          // Remove the file from the diff stats cache when the buffer is closed.
          this._hgDiffCacheFilesToClear.add(filePath);
        }));
      });
    }).subscribe(filePath => this._updateDiffInfo([filePath]));

    this._subscriptions.add(diffStatsSubscription);

    this._initializationPromise = this._service.waitForWatchmanSubscriptions();
    this._initializationPromise.catch(error => {
      atom.notifications.addWarning('Mercurial: failed to subscribe to watchman!');
    });
    // Get updates that tell the HgRepositoryClient when to clear its caches.
    const fileChanges = this._service.observeFilesDidChange().refCount();
    const repoStateChanges = this._service.observeHgRepoStateDidChange().refCount();
    const activeBookmarkChanges = this._service.observeActiveBookmarkDidChange().refCount();
    const allBookmarChanges = this._service.observeBookmarksDidChange().refCount();
    const conflictStateChanges = this._service.observeHgConflictStateDidChange().refCount();
    const commitChanges = this._service.observeHgCommitsDidChange().refCount();

    const statusChangesSubscription = _rxjsBundlesRxMinJs.Observable.merge(fileChanges, repoStateChanges).debounceTime(STATUS_DEBOUNCE_DELAY_MS).startWith(null).switchMap(() => this._service.fetchStatuses().refCount().catch(error => {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('HgService cannot fetch statuses', error);
      return _rxjsBundlesRxMinJs.Observable.empty();
    })).subscribe(statuses => {
      this._hgStatusCache = (0, (_collection || _load_collection()).objectFromMap)(statuses);
      this._emitter.emit('did-change-statuses');
    });

    const shouldRevisionsUpdate = _rxjsBundlesRxMinJs.Observable.merge(activeBookmarkChanges, allBookmarChanges, commitChanges, repoStateChanges).debounceTime(REVISION_DEBOUNCE_DELAY);

    this._subscriptions.add(statusChangesSubscription, activeBookmarkChanges.subscribe(this.fetchActiveBookmark.bind(this)), allBookmarChanges.subscribe(() => {
      this._emitter.emit('did-change-bookmarks');
    }), conflictStateChanges.subscribe(this._conflictStateChanged.bind(this)), shouldRevisionsUpdate.subscribe(() => this._revisionsCache.refreshRevisions()));
  }

  destroy() {
    if (this._isDestroyed) {
      return;
    }
    this._isDestroyed = true;
    this._emitter.emit('did-destroy');
    this._subscriptions.dispose();
    this._revisionIdToFileChanges.reset();
    this._fileContentsAtRevisionIds.reset();
  }

  isDestroyed() {
    return this._isDestroyed;
  }

  _conflictStateChanged(isInConflict) {
    this._isInConflict = isInConflict;
    this._emitter.emit(DID_CHANGE_CONFLICT_STATE);
  }

  /**
   *
   * Section: Event Subscription
   *
   */

  onDidDestroy(callback) {
    return this._emitter.on('did-destroy', callback);
  }

  onDidChangeStatus(callback) {
    return this._emitter.on('did-change-status', callback);
  }

  observeRevisionChanges() {
    return this._revisionsCache.observeRevisionChanges();
  }

  observeRevisionStatusesChanges() {
    return this._revisionStatusCache.observeRevisionStatusesChanges();
  }

  onDidChangeStatuses(callback) {
    return this._emitter.on('did-change-statuses', callback);
  }

  onDidChangeConflictState(callback) {
    return this._emitter.on(DID_CHANGE_CONFLICT_STATE, callback);
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
    return this._path;
  }

  getWorkingDirectory() {
    return this._workingDirectory.getPath();
  }

  // @return The path of the root project folder in Atom that this
  // HgRepositoryClient provides information about.
  getProjectDirectory() {
    return this._projectDirectory.getPath();
  }

  // TODO This is a stub.
  isProjectAtRoot() {
    return true;
  }

  relativize(filePath) {
    return this._workingDirectory.relativize(filePath);
  }

  // TODO This is a stub.
  hasBranch(branch) {
    return false;
  }

  /**
   * @return The current Hg bookmark.
   */
  getShortHead(filePath) {
    if (!this._activeBookmark) {
      // Kick off a fetch to get the current bookmark. This is async.
      this._getShortHeadAsync();
      return '';
    }
    return this._activeBookmark;
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
  getCachedUpstreamAheadBehindCount(path) {
    return {
      ahead: 0,
      behind: 0
    };
  }

  // TODO This is a stub.
  getConfigValue(key, path) {
    return null;
  }

  getOriginURL(path) {
    return this._originURL;
  }

  // TODO This is a stub.
  getUpstreamBranch(path) {
    return null;
  }

  // TODO This is a stub.
  getReferences(path) {
    return {
      heads: [],
      remotes: [],
      tags: []
    };
  }

  // TODO This is a stub.
  getReferenceTarget(reference, path) {
    return null;
  }

  // Added for conflict detection.
  isInConflict() {
    return this._isInConflict;
  }

  /**
   *
   * Section: Reading Status (parity with GitRepository)
   *
   */

  // TODO (jessicalin) Can we change the API to make this method return a Promise?
  // If not, might need to do a synchronous `hg status` query.
  isPathModified(filePath) {
    if (!filePath) {
      return false;
    }
    const cachedPathStatus = this._hgStatusCache[filePath];
    if (!cachedPathStatus) {
      return false;
    } else {
      return this.isStatusModified((_hgConstants || _load_hgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
    }
  }

  // TODO (jessicalin) Can we change the API to make this method return a Promise?
  // If not, might need to do a synchronous `hg status` query.
  isPathNew(filePath) {
    if (!filePath) {
      return false;
    }
    const cachedPathStatus = this._hgStatusCache[filePath];
    if (!cachedPathStatus) {
      return false;
    } else {
      return this.isStatusNew((_hgConstants || _load_hgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
    }
  }

  isPathAdded(filePath) {
    if (!filePath) {
      return false;
    }
    const cachedPathStatus = this._hgStatusCache[filePath];
    if (!cachedPathStatus) {
      return false;
    } else {
      return this.isStatusAdded((_hgConstants || _load_hgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
    }
  }

  isPathUntracked(filePath) {
    if (!filePath) {
      return false;
    }
    const cachedPathStatus = this._hgStatusCache[filePath];
    if (!cachedPathStatus) {
      return false;
    } else {
      return this.isStatusUntracked((_hgConstants || _load_hgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
    }
  }

  // TODO (jessicalin) Can we change the API to make this method return a Promise?
  // If not, this method lies a bit by using cached information.
  // TODO (jessicalin) Make this work for ignored directories.
  isPathIgnored(filePath) {
    if (!filePath) {
      return false;
    }
    // `hg status -i` does not list the repo (the .hg directory), presumably
    // because the repo does not track itself.
    // We want to represent the fact that it's not part of the tracked contents,
    // so we manually add an exception for it via the _isPathWithinHgRepo check.
    const cachedPathStatus = this._hgStatusCache[filePath];
    if (!cachedPathStatus) {
      return this._isPathWithinHgRepo(filePath);
    } else {
      return this.isStatusIgnored((_hgConstants || _load_hgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
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
    return this._projectDirectory.contains(filePath) || this._projectDirectory.getPath() === filePath;
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
    if (!filePath) {
      return (_hgConstants || _load_hgConstants()).StatusCodeNumber.CLEAN;
    }
    const cachedStatus = this._hgStatusCache[filePath];
    if (cachedStatus) {
      return (_hgConstants || _load_hgConstants()).StatusCodeIdToNumber[cachedStatus];
    }
    return (_hgConstants || _load_hgConstants()).StatusCodeNumber.CLEAN;
  }

  getAllPathStatuses() {
    const pathStatuses = Object.create(null);
    for (const filePath in this._hgStatusCache) {
      pathStatuses[filePath] = (_hgConstants || _load_hgConstants()).StatusCodeIdToNumber[this._hgStatusCache[filePath]];
    }
    return pathStatuses;
  }

  isStatusModified(status) {
    return status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED;
  }

  isStatusDeleted(status) {
    return status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.MISSING || status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.REMOVED;
  }

  isStatusNew(status) {
    return status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.ADDED || status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.UNTRACKED;
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
    if (!filePath) {
      return cleanStats;
    }
    const cachedData = this._hgDiffCache[filePath];
    return cachedData ? { added: cachedData.added, deleted: cachedData.deleted } : cleanStats;
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
    if (!filePath) {
      return [];
    }
    const diffInfo = this._hgDiffCache[filePath];
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
  _updateDiffInfo(filePaths) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const pathsToFetch = filePaths.filter(function (aPath) {
        // Don't try to fetch information for this path if it's not in the repo.
        if (!_this.isPathRelevant(aPath)) {
          return false;
        }
        // Don't do another update for this path if we are in the middle of running an update.
        if (_this._hgDiffCacheFilesUpdating.has(aPath)) {
          return false;
        } else {
          _this._hgDiffCacheFilesUpdating.add(aPath);
          return true;
        }
      });

      if (pathsToFetch.length === 0) {
        return new Map();
      }

      // Call the HgService and update our cache with the results.
      const pathsToDiffInfo = yield _this._service.fetchDiffInfo(pathsToFetch);
      if (pathsToDiffInfo) {
        for (const _ref of pathsToDiffInfo) {
          var _ref2 = _slicedToArray(_ref, 2);

          const filePath = _ref2[0];
          const diffInfo = _ref2[1];

          _this._hgDiffCache[filePath] = diffInfo;
        }
      }

      // Remove files marked for deletion.
      _this._hgDiffCacheFilesToClear.forEach(function (fileToClear) {
        delete _this._hgDiffCache[fileToClear];
      });
      _this._hgDiffCacheFilesToClear.clear();

      // The fetched files can now be updated again.
      for (const pathToFetch of pathsToFetch) {
        _this._hgDiffCacheFilesUpdating.delete(pathToFetch);
      }

      // TODO (t9113913) Ideally, we could send more targeted events that better
      // describe what change has occurred. Right now, GitRepository dictates either
      // 'did-change-status' or 'did-change-statuses'.
      _this._emitter.emit('did-change-statuses');
      return pathsToDiffInfo;
    })();
  }

  /**
  *
  * Section: Retrieving Bookmark (async methods)
  *
  */

  /*
   * @deprecated Use {#async.getShortHead} instead
   */
  fetchActiveBookmark() {
    return this._getShortHeadAsync();
  }

  fetchMergeConflicts() {
    return this._service.fetchMergeConflicts();
  }

  resolveConflictedFile(filePath) {
    return this._service.resolveConflictedFile(filePath);
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
    return this._service.revert(filePaths);
  }

  checkoutReference(reference, create) {
    return this._service.checkout(reference, create);
  }

  checkoutForkBase() {
    return this._service.checkoutForkBase();
  }

  /**
   *
   * Section: Bookmarks
   *
   */
  createBookmark(name, revision) {
    return this._service.createBookmark(name, revision);
  }

  deleteBookmark(name) {
    return this._service.deleteBookmark(name);
  }

  renameBookmark(name, nextName) {
    return this._service.renameBookmark(name, nextName);
  }

  getBookmarks() {
    return this._service.fetchBookmarks();
  }

  onDidChangeBookmarks(callback) {
    return this._emitter.on('did-change-bookmarks', callback);
  }

  _getShortHeadAsync() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let newlyFetchedBookmark = '';
      try {
        newlyFetchedBookmark = yield _this2._service.fetchActiveBookmark();
      } catch (e) {
        // Suppress the error. There are legitimate times when there may be no
        // current bookmark, such as during a rebase. In this case, we just want
        // to return an empty string if there is no current bookmark.
      }
      if (newlyFetchedBookmark !== _this2._activeBookmark) {
        _this2._activeBookmark = newlyFetchedBookmark;
        // The Atom status-bar uses this as a signal to refresh the 'shortHead'.
        // There is currently no dedicated 'shortHeadDidChange' event.
        _this2._emitter.emit('did-change-statuses');
        _this2._emitter.emit('did-change-short-head');
      }
      return _this2._activeBookmark || '';
    })();
  }

  onDidChangeShortHead(callback) {
    return this._emitter.on('did-change-short-head', callback);
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
    let fileContentsAtRevision = this._fileContentsAtRevisionIds.get(revision);
    if (fileContentsAtRevision == null) {
      fileContentsAtRevision = new Map();
      this._fileContentsAtRevisionIds.set(revision, fileContentsAtRevision);
    }
    const committedContents = fileContentsAtRevision.get(filePath);
    if (committedContents != null) {
      return _rxjsBundlesRxMinJs.Observable.of(committedContents);
    } else {
      return this._service.fetchFileContentAtRevision(filePath, revision).refCount().do(contents => fileContentsAtRevision.set(filePath, contents));
    }
  }

  fetchFilesChangedAtRevision(revision) {
    const changes = this._revisionIdToFileChanges.get(revision);
    if (changes != null) {
      return _rxjsBundlesRxMinJs.Observable.of(changes);
    } else {
      return this._service.fetchFilesChangedAtRevision(revision).refCount().do(fetchedChanges => this._revisionIdToFileChanges.set(revision, fetchedChanges));
    }
  }

  fetchRevisionInfoBetweenHeadAndBase() {
    return this._service.fetchRevisionInfoBetweenHeadAndBase();
  }

  fetchSmartlogRevisions() {
    return this._service.fetchSmartlogRevisions().refCount();
  }

  refreshRevisions() {
    this._revisionsCache.refreshRevisions();
  }

  getCachedRevisions() {
    return this._revisionsCache.getCachedRevisions();
  }

  getCachedRevisionStatuses() {
    return this._revisionStatusCache.getCachedRevisionStatuses();
  }

  // See HgService.getBaseRevision.
  getBaseRevision() {
    return this._service.getBaseRevision();
  }

  // See HgService.getBlameAtHead.
  getBlameAtHead(filePath) {
    return this._service.getBlameAtHead(filePath);
  }

  getTemplateCommitMessage() {
    // TODO(t12228275) This is a stopgap hack, fix it.
    return this._service.getTemplateCommitMessage();
  }

  getHeadCommitMessage() {
    return this._service.getHeadCommitMessage();
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
    return this._service.getConfigValueAsync(key);
  }

  // See HgService.getDifferentialRevisionForChangeSetId.
  getDifferentialRevisionForChangeSetId(changeSetId) {
    return this._service.getDifferentialRevisionForChangeSetId(changeSetId);
  }

  getSmartlog(ttyOutput, concise) {
    return this._service.getSmartlog(ttyOutput, concise);
  }

  copy(filePaths, destPath) {
    let after = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    return this._service.copy(filePaths, destPath, after);
  }

  rename(filePaths, destPath) {
    let after = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    return this._service.rename(filePaths, destPath, after);
  }

  remove(filePaths) {
    let after = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    return this._service.remove(filePaths, after);
  }

  addAll(filePaths) {
    return this._service.add(filePaths);
  }

  commit(message) {
    return this._service.commit(message).refCount().finally(this._clearClientCache.bind(this));
  }

  amend(message, amendMode) {
    return this._service.amend(message, amendMode).refCount().finally(this._clearClientCache.bind(this));
  }

  revert(filePaths) {
    return this._service.revert(filePaths);
  }

  log(filePaths, limit) {
    // TODO(mbolin): Return an Observable so that results appear faster.
    // Unfortunately, `hg log -Tjson` is not Observable-friendly because it will
    // not parse as JSON until all of the data has been printed to stdout.
    return this._service.log(filePaths, limit);
  }

  continueRebase() {
    return this._service.continueRebase();
  }

  abortRebase() {
    return this._service.abortRebase();
  }

  rebase(destination, source) {
    return this._service.rebase(destination, source).refCount();
  }

  _clearClientCache() {
    this._hgDiffCache = {};
    this._hgStatusCache = {};
    this._emitter.emit('did-change-statuses');
  }
};