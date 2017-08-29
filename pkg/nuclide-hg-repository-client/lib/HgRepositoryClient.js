'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HgRepositoryClient = undefined;

var _hgDiffOutputParser;

function _load_hgDiffOutputParser() {
  return _hgDiffOutputParser = require('../../nuclide-hg-rpc/lib/hg-diff-output-parser');
}

var _atom = require('atom');

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _RevisionsCache;

function _load_RevisionsCache() {
  return _RevisionsCache = _interopRequireDefault(require('./RevisionsCache'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
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
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _observePaneItemVisibility;

function _load_observePaneItemVisibility() {
  return _observePaneItemVisibility = _interopRequireDefault(require('nuclide-commons-atom/observePaneItemVisibility'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _textBuffer;

function _load_textBuffer() {
  return _textBuffer = require('../../commons-atom/text-buffer');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const STATUS_DEBOUNCE_DELAY_MS = 300; /**
                                       * Copyright (c) 2015-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the license found in the LICENSE file in
                                       * the root directory of this source tree.
                                       *
                                       * 
                                       * @format
                                       */

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
    const FbRevisionStatusCache = require('./fb/RevisionStatusCache').default;
    return new FbRevisionStatusCache(revisionsCache, workingDirectoryPath);
  } catch (e) {
    return {
      getCachedRevisionStatuses() {
        return new Map();
      },
      observeRevisionStatusesChanges() {
        return _rxjsBundlesRxMinJs.Observable.empty();
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
    this._fileContentsAtHead = new (_lruCache || _load_lruCache()).default({ max: 30 });

    this._emitter = new _atom.Emitter();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._emitter, this._service);

    this._hgStatusCache = new Map();
    this._bookmarks = new _rxjsBundlesRxMinJs.BehaviorSubject({ isLoading: true, bookmarks: [] });

    this._hgDiffCache = new Map();
    this._hgDiffCacheFilesUpdating = new Set();
    this._hgDiffCacheFilesToClear = new Set();

    const diffStatsSubscription = (_featureConfig || _load_featureConfig()).default.observeAsStream('nuclide-hg-repository.enableDiffStats').switchMap(enableDiffStats => {
      if (!enableDiffStats) {
        // TODO(most): rewrite fetching structures avoiding side effects
        this._hgDiffCache = new Map();
        this._emitter.emit('did-change-statuses');
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      return (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.observePaneItems.bind(atom.workspace)).flatMap(paneItem => {
        const item = paneItem;
        return this._observePaneItemVisibility(item).switchMap(visible => {
          if (!visible || !(0, (_textEditor || _load_textEditor()).isValidTextEditor)(item)) {
            return _rxjsBundlesRxMinJs.Observable.empty();
          }

          const textEditor = item;
          const buffer = textEditor.getBuffer();
          const filePath = buffer.getPath();
          if (filePath == null || filePath.length === 0 || !this.isPathRelevant(filePath)) {
            return _rxjsBundlesRxMinJs.Observable.empty();
          }
          return _rxjsBundlesRxMinJs.Observable.combineLatest((0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidSave.bind(buffer)).startWith(''), this._hgUncommittedStatusChanges.statusChanges).filter(([_, statusChanges]) => {
            return statusChanges.has(filePath) && this.isStatusModified(statusChanges.get(filePath));
          }).map(() => filePath).takeUntil(_rxjsBundlesRxMinJs.Observable.merge((0, (_textBuffer || _load_textBuffer()).observeBufferCloseOrRename)(buffer), this._observePaneItemVisibility(item).filter(v => !v)).do(() => {
            // TODO(most): rewrite to be simpler and avoid side effects.
            // Remove the file from the diff stats cache when the buffer is closed.
            this._hgDiffCacheFilesToClear.add(filePath);
          }));
        });
      });
    }).flatMap(filePath => this._updateDiffInfo([filePath])).subscribe();
    this._subscriptions.add(diffStatsSubscription);

    this._initializationPromise = this._service.waitForWatchmanSubscriptions();
    this._initializationPromise.catch(error => {
      atom.notifications.addWarning('Mercurial: failed to subscribe to watchman!');
    });
    // Get updates that tell the HgRepositoryClient when to clear its caches.
    const fileChanges = this._service.observeFilesDidChange().refCount();
    const repoStateChanges = this._service.observeHgRepoStateDidChange().refCount();
    const activeBookmarkChanges = this._service.observeActiveBookmarkDidChange().refCount();
    const allBookmarkChanges = this._service.observeBookmarksDidChange().refCount();
    const conflictStateChanges = this._service.observeHgConflictStateDidChange().refCount();
    const commitChanges = this._service.observeHgCommitsDidChange().refCount();

    this._hgUncommittedStatusChanges = this._observeStatus(fileChanges, repoStateChanges, () => this._service.fetchStatuses());

    this._hgStackStatusChanges = this._observeStatus(fileChanges, repoStateChanges, () => this._service.fetchStackStatuses());

    this._hgHeadStatusChanges = this._observeStatus(fileChanges, repoStateChanges, () => this._service.fetchHeadStatuses());

    const statusChangesSubscription = this._hgUncommittedStatusChanges.statusChanges.subscribe(statuses => {
      this._hgStatusCache = statuses;
      this._emitter.emit('did-change-statuses');
    });

    const shouldRevisionsUpdate = _rxjsBundlesRxMinJs.Observable.merge(this._bookmarks.asObservable(), commitChanges, repoStateChanges).debounceTime(REVISION_DEBOUNCE_DELAY);

    const bookmarksUpdates = _rxjsBundlesRxMinJs.Observable.merge(activeBookmarkChanges, allBookmarkChanges).startWith(null).debounceTime(BOOKMARKS_DEBOUNCE_DELAY).switchMap(() => _rxjsBundlesRxMinJs.Observable.defer(() => {
      return this._service.fetchBookmarks().refCount().timeout(FETCH_BOOKMARKS_TIMEOUT);
    }).retry(2).catch(error => {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-repository-client').error('failed to fetch bookmarks info:', error);
      return _rxjsBundlesRxMinJs.Observable.empty();
    }));

    this._subscriptions.add(statusChangesSubscription, bookmarksUpdates.subscribe(bookmarks => this._bookmarks.next({ isLoading: false, bookmarks })), conflictStateChanges.subscribe(this._conflictStateChanged.bind(this)), shouldRevisionsUpdate.subscribe(() => {
      this._revisionsCache.refreshRevisions();
      this._fileContentsAtHead.reset();
      this._hgDiffCache = new Map();
    }));
  } // legacy, only for uncommitted


  _observeStatus(fileChanges, repoStateChanges, fetchStatuses) {
    const triggers = _rxjsBundlesRxMinJs.Observable.merge(fileChanges, repoStateChanges).debounceTime(STATUS_DEBOUNCE_DELAY_MS).share().startWith(null);
    // Share comes before startWith. That's because fileChanges/repoStateChanges
    // are already hot and can be shared fine. But we want both our subscribers,
    // statusChanges and isCalculatingChanges, to pick up their own copy of
    // startWith(null) no matter which order they subscribe.

    const statusChanges = (0, (_observable || _load_observable()).cacheWhileSubscribed)(triggers.switchMap(() => fetchStatuses().refCount().catch(error => {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-repository-client').error('HgService cannot fetch statuses', error);
      return _rxjsBundlesRxMinJs.Observable.empty();
    })).map(uriToStatusIds => (0, (_collection || _load_collection()).mapTransform)(uriToStatusIds, (v, k) => (_hgConstants || _load_hgConstants()).StatusCodeIdToNumber[v])));

    const isCalculatingChanges = (0, (_observable || _load_observable()).cacheWhileSubscribed)(_rxjsBundlesRxMinJs.Observable.merge(triggers.map(_ => true), statusChanges.map(_ => false)).distinctUntilChanged());

    return { statusChanges, isCalculatingChanges };
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

  observeBookmarks() {
    return this._bookmarks.asObservable().filter(b => !b.isLoading).map(b => b.bookmarks);
  }

  observeRevisionChanges() {
    return this._revisionsCache.observeRevisionChanges();
  }

  observeRevisionStatusesChanges() {
    return this._revisionStatusCache.observeRevisionStatusesChanges();
  }

  observeUncommittedStatusChanges() {
    return this._hgUncommittedStatusChanges;
  }

  observeHeadStatusChanges() {
    return this._hgHeadStatusChanges;
  }

  observeStackStatusChanges() {
    return this._hgStackStatusChanges;
  }

  _observePaneItemVisibility(item) {
    return (0, (_observePaneItemVisibility || _load_observePaneItemVisibility()).default)(item);
  }

  onDidChangeStatuses(callback) {
    return this._emitter.on('did-change-statuses', callback);
  }

  onDidChangeConflictState(callback) {
    return this._emitter.on(DID_CHANGE_CONFLICT_STATE, callback);
  }

  onDidChangeInteractiveMode(callback) {
    return this._emitter.on('did-change-interactive-mode', callback);
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
    return this._bookmarks.getValue().bookmarks.filter(bookmark => bookmark.active).map(bookmark => bookmark.bookmark)[0] || '';
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
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return false;
    }
    const cachedPathStatus = this._hgStatusCache.get(filePath);
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
    const cachedPathStatus = this._hgStatusCache.get(filePath);
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
    const cachedPathStatus = this._hgStatusCache.get(filePath);
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
    const cachedPathStatus = this._hgStatusCache.get(filePath);
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
    const cachedPathStatus = this._hgStatusCache.get(filePath);
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
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return (_hgConstants || _load_hgConstants()).StatusCodeNumber.CLEAN;
    }
    const cachedStatus = this._hgStatusCache.get(filePath);
    if (cachedStatus) {
      return cachedStatus;
    }
    return (_hgConstants || _load_hgConstants()).StatusCodeNumber.CLEAN;
  }

  // getAllPathStatuses -- this legacy API gets only uncommitted statuses
  getAllPathStatuses() {
    const pathStatuses = Object.create(null);
    for (const [filePath, status] of this._hgStatusCache) {
      pathStatuses[filePath] = status;
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
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return cleanStats;
    }
    const cachedData = this._hgDiffCache.get(filePath);
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
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return [];
    }
    const diffInfo = this._hgDiffCache.get(filePath);
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
    const pathsToFetch = filePaths.filter(aPath => {
      // Don't try to fetch information for this path if it's not in the repo.
      if (!this.isPathRelevant(aPath)) {
        return false;
      }
      // Don't do another update for this path if we are in the middle of running an update.
      if (this._hgDiffCacheFilesUpdating.has(aPath)) {
        return false;
      } else {
        this._hgDiffCacheFilesUpdating.add(aPath);
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

      return this._getFileDiffs(pathsToFetch, currentHeadId).do(pathsToDiffInfo => {
        if (pathsToDiffInfo) {
          for (const [filePath, diffInfo] of pathsToDiffInfo) {
            this._hgDiffCache.set(filePath, diffInfo);
          }
        }

        // Remove files marked for deletion.
        this._hgDiffCacheFilesToClear.forEach(fileToClear => {
          this._hgDiffCache.delete(fileToClear);
        });
        this._hgDiffCacheFilesToClear.clear();

        // The fetched files can now be updated again.
        for (const pathToFetch of pathsToFetch) {
          this._hgDiffCacheFilesUpdating.delete(pathToFetch);
        }

        // TODO (t9113913) Ideally, we could send more targeted events that better
        // describe what change has occurred. Right now, GitRepository dictates either
        // 'did-change-status' or 'did-change-statuses'.
        this._emitter.emit('did-change-statuses');
      });
    });
  }

  _getFileDiffs(pathsToFetch, revision) {
    const fileContents = pathsToFetch.map(filePath => {
      const cachedContent = this._fileContentsAtHead.get(filePath);
      let contentObservable;
      if (cachedContent == null) {
        contentObservable = this._service.fetchFileContentAtRevision(filePath, revision).refCount().map(contents => {
          this._fileContentsAtHead.set(filePath, contents);
          return contents;
        });
      } else {
        contentObservable = _rxjsBundlesRxMinJs.Observable.of(cachedContent);
      }
      return contentObservable.switchMap(content => {
        return (0, (_utils || _load_utils()).gitDiffContentAgainstFile)(content, filePath);
      }).map(diff => ({
        filePath,
        diff
      }));
    });
    const diffs = _rxjsBundlesRxMinJs.Observable.merge(...fileContents).map(({ filePath, diff }) => {
      // This is to differentiate between diff delimiter and the source
      // eslint-disable-next-line no-useless-escape
      const toParse = diff.split('--- ');
      const lineDiff = (0, (_hgDiffOutputParser || _load_hgDiffOutputParser()).parseHgDiffUnifiedOutput)(toParse[1]);
      return [filePath, lineDiff];
    }).toArray().map(contents => new Map(contents));
    return diffs;
  }

  _getCurrentHeadId() {
    if (this._currentHeadId != null) {
      return _rxjsBundlesRxMinJs.Observable.of(this._currentHeadId);
    }
    return this._service.getHeadId().refCount().do(headId => this._currentHeadId = headId);
  }

  _updateInteractiveMode(isInteractiveMode) {
    this._emitter.emit('did-change-interactive-mode', isInteractiveMode);
  }

  fetchMergeConflicts() {
    return this._service.fetchMergeConflicts().refCount();
  }

  markConflictedFile(filePath, resolved) {
    // TODO(T17463635)
    return this._service.markConflictedFile(filePath, resolved).refCount();
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

  checkoutReference(reference, create, options) {
    // TODO(T17463635)
    return this._service.checkout(reference, create, options).refCount();
  }

  show(revision) {
    return this._service.show(revision).refCount();
  }

  purge() {
    return this._service.purge();
  }

  stripReference(reference) {
    return this._service.strip(reference);
  }

  uncommit() {
    return this._service.uncommit();
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
    return this._bookmarks.getValue().bookmarks;
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

  fetchFilesChangedSinceRevision(revision) {
    return this._service.fetchStatuses(revision).refCount().map(fileStatuses => {
      const statusesWithCodeIds = new Map();
      for (const [filePath, code] of fileStatuses) {
        statusesWithCodeIds.set(filePath, (_hgConstants || _load_hgConstants()).StatusCodeIdToNumber[code]);
      }
      return statusesWithCodeIds;
    });
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

  refreshRevisionsStatuses() {
    this._revisionStatusCache.refresh();
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

  copy(filePaths, destPath, after = false) {
    return this._service.copy(filePaths, destPath, after);
  }

  rename(filePaths, destPath, after = false) {
    return this._service.rename(filePaths, destPath, after);
  }

  remove(filePaths, after = false) {
    return this._service.remove(filePaths, after);
  }

  forget(filePaths) {
    return this._service.forget(filePaths);
  }

  addAll(filePaths) {
    return this._service.add(filePaths);
  }

  commit(message, filePaths = []) {
    // TODO(T17463635)
    return this._service.commit(message, filePaths).refCount().do(processMessage => this._clearOnSuccessExit(processMessage, filePaths));
  }

  amend(message, amendMode, filePaths = []) {
    // TODO(T17463635)
    return this._service.amend(message, amendMode, filePaths).refCount().do(processMessage => this._clearOnSuccessExit(processMessage, filePaths));
  }

  restack() {
    return this._service.restack().refCount();
  }

  editCommitMessage(revision, message) {
    return this._service.editCommitMessage(revision, message).refCount();
  }

  splitRevision() {
    // TODO(T17463635)
    this._updateInteractiveMode(true);
    return this._service.splitRevision().refCount().finally(this._updateInteractiveMode.bind(this, false));
  }

  _clearOnSuccessExit(message, filePaths) {
    if (message.kind === 'exit' && message.exitCode === 0) {
      this._clearClientCache(filePaths);
    }
  }

  revert(filePaths, toRevision) {
    return this._service.revert(filePaths, toRevision);
  }

  log(filePaths, limit) {
    // TODO(mbolin): Return an Observable so that results appear faster.
    // Unfortunately, `hg log -Tjson` is not Observable-friendly because it will
    // not parse as JSON until all of the data has been printed to stdout.
    return this._service.log(filePaths, limit);
  }

  continueOperation(command) {
    // TODO(T17463635)
    return this._service.continueOperation(command).refCount();
  }

  abortOperation(command) {
    return this._service.abortOperation(command).refCount();
  }

  resolveAllFiles() {
    return this._service.resolveAllFiles().refCount();
  }

  rebase(destination, source) {
    // TODO(T17463635)
    return this._service.rebase(destination, source).refCount();
  }

  pull(options = []) {
    // TODO(T17463635)
    return this._service.pull(options).refCount();
  }

  _clearClientCache(filePaths) {
    if (filePaths.length === 0) {
      this._hgDiffCache = new Map();
      this._hgStatusCache = new Map();
      this._fileContentsAtHead.reset();
    } else {
      this._hgDiffCache = new Map(this._hgDiffCache);
      this._hgStatusCache = new Map(this._hgStatusCache);
      filePaths.forEach(filePath => {
        this._hgDiffCache.delete(filePath);
        this._hgStatusCache.delete(filePath);
      });
    }
    this._emitter.emit('did-change-statuses');
  }
}
exports.HgRepositoryClient = HgRepositoryClient;