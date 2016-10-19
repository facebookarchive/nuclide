Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _RevisionsCache;

function _load_RevisionsCache() {
  return _RevisionsCache = _interopRequireDefault(require('./RevisionsCache'));
}

var _nuclideHgRpcLibHgConstants;

function _load_nuclideHgRpcLibHgConstants() {
  return _nuclideHgRpcLibHgConstants = require('../../nuclide-hg-rpc/lib/hg-constants');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _commonsAtomBuffer;

function _load_commonsAtomBuffer() {
  return _commonsAtomBuffer = require('../../commons-atom/buffer');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var STATUS_DEBOUNCE_DELAY_MS = 300;
var REVISION_DEBOUNCE_DELAY = 300;

/**
 *
 * Section: Constants, Type Definitions
 *
 */

var DID_CHANGE_CONFLICT_STATE = 'did-change-conflict-state';

function getRevisionStatusCache(revisionsCache, workingDirectoryPath) {
  try {
    // $FlowFB
    var FbRevisionStatusCache = require('./fb/RevisionStatusCache');
    return new FbRevisionStatusCache(revisionsCache, workingDirectoryPath);
  } catch (e) {
    return {
      getCachedRevisionStatuses: function getCachedRevisionStatuses() {
        return new Map();
      },
      observeRevisionStatusesChanges: function observeRevisionStatusesChanges() {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
      }
    };
  }
}
var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _commonsNodeCollection;

function _load_commonsNodeCollection() {
  return _commonsNodeCollection = require('../../commons-node/collection');
}

var HgRepositoryClient = (function () {
  function HgRepositoryClient(repoPath, hgService, options) {
    var _this = this;

    _classCallCheck(this, HgRepositoryClient);

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

    this._emitter = new (_atom || _load_atom()).Emitter();
    this._subscriptions = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(this._emitter, this._service);

    this._hgStatusCache = {};

    this._hgDiffCache = {};
    this._hgDiffCacheFilesUpdating = new Set();
    this._hgDiffCacheFilesToClear = new Set();

    var diffStatsSubscription = (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.observeAsStream('nuclide-hg-repository.enableDiffStats').switchMap(function (enableDiffStats) {
      if (!enableDiffStats) {
        // TODO(most): rewrite fetching structures avoiding side effects
        _this._hgDiffCache = {};
        _this._emitter.emit('did-change-statuses');
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
      }

      return (0, (_commonsAtomBuffer || _load_commonsAtomBuffer()).observeBufferOpen)().filter(function (buffer) {
        var filePath = buffer.getPath();
        return filePath != null && filePath.length !== 0 && _this._isPathRelevant(filePath);
      }).flatMap(function (buffer) {
        var filePath = buffer.getPath();
        (0, (_assert || _load_assert()).default)(filePath, 'already filtered empty and non-relevant file paths');
        return (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidSave.bind(buffer)).map(function () {
          return filePath;
        }).startWith(filePath).takeUntil((0, (_commonsAtomBuffer || _load_commonsAtomBuffer()).observeBufferCloseOrRename)(buffer).do(function () {
          // TODO(most): rewrite to be simpler and avoid side effects.
          // Remove the file from the diff stats cache when the buffer is closed.
          _this._hgDiffCacheFilesToClear.add(filePath);
        }));
      });
    }).subscribe(function (filePath) {
      return _this._updateDiffInfo([filePath]);
    });

    this._subscriptions.add(diffStatsSubscription);

    this._initializationPromise = this._service.waitForWatchmanSubscriptions();
    this._initializationPromise.catch(function (error) {
      atom.notifications.addWarning('Mercurial: failed to subscribe to watchman!');
    });
    // Get updates that tell the HgRepositoryClient when to clear its caches.
    var fileChanges = this._service.observeFilesDidChange().refCount();
    var repoStateChanges = this._service.observeHgRepoStateDidChange().refCount();
    var activeBookmarkChanges = this._service.observeActiveBookmarkDidChange().refCount();
    var allBookmarChanges = this._service.observeBookmarksDidChange().refCount();
    var conflictStateChanges = this._service.observeHgConflictStateDidChange().refCount();
    var commitChanges = this._service.observeHgCommitsDidChange().refCount();

    var statusChangesSubscription = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge(fileChanges, repoStateChanges).debounceTime(STATUS_DEBOUNCE_DELAY_MS).startWith(null).switchMap(function () {
      return _this._service.fetchStatuses().refCount().catch(function (error) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('HgService cannot fetch statuses', error);
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
      });
    }).subscribe(function (statuses) {
      _this._hgStatusCache = (0, (_commonsNodeCollection || _load_commonsNodeCollection()).objectFromMap)(statuses);
      _this._emitter.emit('did-change-statuses');
    });

    var shouldRevisionsUpdate = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge(activeBookmarkChanges, allBookmarChanges, commitChanges, repoStateChanges).debounceTime(REVISION_DEBOUNCE_DELAY);

    this._subscriptions.add(statusChangesSubscription, activeBookmarkChanges.subscribe(this.fetchActiveBookmark.bind(this)), allBookmarChanges.subscribe(function () {
      _this._emitter.emit('did-change-bookmarks');
    }), conflictStateChanges.subscribe(this._conflictStateChanged.bind(this)), shouldRevisionsUpdate.subscribe(function () {
      return _this._revisionsCache.refreshRevisions();
    }));
  }

  _createClass(HgRepositoryClient, [{
    key: 'destroy',
    value: function destroy() {
      if (this._isDestroyed) {
        return;
      }
      this._isDestroyed = true;
      this._emitter.emit('did-destroy');
      this._subscriptions.dispose();
      this._revisionIdToFileChanges.reset();
      this._fileContentsAtRevisionIds.reset();
    }
  }, {
    key: 'isDestroyed',
    value: function isDestroyed() {
      return this._isDestroyed;
    }
  }, {
    key: '_conflictStateChanged',
    value: function _conflictStateChanged(isInConflict) {
      this._isInConflict = isInConflict;
      this._emitter.emit(DID_CHANGE_CONFLICT_STATE);
    }

    /**
     *
     * Section: Event Subscription
     *
     */

  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      return this._emitter.on('did-destroy', callback);
    }
  }, {
    key: 'onDidChangeStatus',
    value: function onDidChangeStatus(callback) {
      return this._emitter.on('did-change-status', callback);
    }
  }, {
    key: 'observeRevisionChanges',
    value: function observeRevisionChanges() {
      return this._revisionsCache.observeRevisionChanges();
    }
  }, {
    key: 'observeRevisionStatusesChanges',
    value: function observeRevisionStatusesChanges() {
      return this._revisionStatusCache.observeRevisionStatusesChanges();
    }
  }, {
    key: 'onDidChangeStatuses',
    value: function onDidChangeStatuses(callback) {
      return this._emitter.on('did-change-statuses', callback);
    }
  }, {
    key: 'onDidChangeConflictState',
    value: function onDidChangeConflictState(callback) {
      return this._emitter.on(DID_CHANGE_CONFLICT_STATE, callback);
    }

    /**
     *
     * Section: Repository Details
     *
     */

  }, {
    key: 'getType',
    value: function getType() {
      return 'hg';
    }
  }, {
    key: 'getPath',
    value: function getPath() {
      return this._path;
    }
  }, {
    key: 'getWorkingDirectory',
    value: function getWorkingDirectory() {
      return this._workingDirectory.getPath();
    }

    // @return The path of the root project folder in Atom that this
    // HgRepositoryClient provides information about.
  }, {
    key: 'getProjectDirectory',
    value: function getProjectDirectory() {
      return this._projectDirectory.getPath();
    }

    // TODO This is a stub.
  }, {
    key: 'isProjectAtRoot',
    value: function isProjectAtRoot() {
      return true;
    }
  }, {
    key: 'relativize',
    value: function relativize(filePath) {
      return this._workingDirectory.relativize(filePath);
    }

    // TODO This is a stub.
  }, {
    key: 'hasBranch',
    value: function hasBranch(branch) {
      return false;
    }

    /**
     * @return The current Hg bookmark.
     */
  }, {
    key: 'getShortHead',
    value: function getShortHead(filePath) {
      if (!this._activeBookmark) {
        // Kick off a fetch to get the current bookmark. This is async.
        this._getShortHeadAsync();
        return '';
      }
      return this._activeBookmark;
    }

    // TODO This is a stub.
  }, {
    key: 'isSubmodule',
    value: function isSubmodule(path) {
      return false;
    }

    // TODO This is a stub.
  }, {
    key: 'getAheadBehindCount',
    value: function getAheadBehindCount(reference, path) {
      return 0;
    }

    // TODO This is a stub.
  }, {
    key: 'getCachedUpstreamAheadBehindCount',
    value: function getCachedUpstreamAheadBehindCount(path) {
      return {
        ahead: 0,
        behind: 0
      };
    }

    // TODO This is a stub.
  }, {
    key: 'getConfigValue',
    value: function getConfigValue(key, path) {
      return null;
    }
  }, {
    key: 'getOriginURL',
    value: function getOriginURL(path) {
      return this._originURL;
    }

    // TODO This is a stub.
  }, {
    key: 'getUpstreamBranch',
    value: function getUpstreamBranch(path) {
      return null;
    }

    // TODO This is a stub.
  }, {
    key: 'getReferences',
    value: function getReferences(path) {
      return {
        heads: [],
        remotes: [],
        tags: []
      };
    }

    // TODO This is a stub.
  }, {
    key: 'getReferenceTarget',
    value: function getReferenceTarget(reference, path) {
      return null;
    }

    // Added for conflict detection.
  }, {
    key: 'isInConflict',
    value: function isInConflict() {
      return this._isInConflict;
    }

    /**
     *
     * Section: Reading Status (parity with GitRepository)
     *
     */

    // TODO (jessicalin) Can we change the API to make this method return a Promise?
    // If not, might need to do a synchronous `hg status` query.
  }, {
    key: 'isPathModified',
    value: function isPathModified(filePath) {
      if (!filePath) {
        return false;
      }
      var cachedPathStatus = this._hgStatusCache[filePath];
      if (!cachedPathStatus) {
        return false;
      } else {
        return this.isStatusModified((_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
      }
    }

    // TODO (jessicalin) Can we change the API to make this method return a Promise?
    // If not, might need to do a synchronous `hg status` query.
  }, {
    key: 'isPathNew',
    value: function isPathNew(filePath) {
      if (!filePath) {
        return false;
      }
      var cachedPathStatus = this._hgStatusCache[filePath];
      if (!cachedPathStatus) {
        return false;
      } else {
        return this.isStatusNew((_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
      }
    }
  }, {
    key: 'isPathAdded',
    value: function isPathAdded(filePath) {
      if (!filePath) {
        return false;
      }
      var cachedPathStatus = this._hgStatusCache[filePath];
      if (!cachedPathStatus) {
        return false;
      } else {
        return this.isStatusAdded((_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
      }
    }
  }, {
    key: 'isPathUntracked',
    value: function isPathUntracked(filePath) {
      if (!filePath) {
        return false;
      }
      var cachedPathStatus = this._hgStatusCache[filePath];
      if (!cachedPathStatus) {
        return false;
      } else {
        return this.isStatusUntracked((_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
      }
    }

    // TODO (jessicalin) Can we change the API to make this method return a Promise?
    // If not, this method lies a bit by using cached information.
    // TODO (jessicalin) Make this work for ignored directories.
  }, {
    key: 'isPathIgnored',
    value: function isPathIgnored(filePath) {
      if (!filePath) {
        return false;
      }
      // `hg status -i` does not list the repo (the .hg directory), presumably
      // because the repo does not track itself.
      // We want to represent the fact that it's not part of the tracked contents,
      // so we manually add an exception for it via the _isPathWithinHgRepo check.
      var cachedPathStatus = this._hgStatusCache[filePath];
      if (!cachedPathStatus) {
        return this._isPathWithinHgRepo(filePath);
      } else {
        return this.isStatusIgnored((_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
      }
    }

    /**
     * Checks if the given path is within the repo directory (i.e. `.hg/`).
     */
  }, {
    key: '_isPathWithinHgRepo',
    value: function _isPathWithinHgRepo(filePath) {
      return filePath === this.getPath() || filePath.indexOf(this.getPath() + '/') === 0;
    }

    /**
     * Checks whether a path is relevant to this HgRepositoryClient. A path is
     * defined as 'relevant' if it is within the project directory opened within the repo.
     */
  }, {
    key: '_isPathRelevant',
    value: function _isPathRelevant(filePath) {
      return this._projectDirectory.contains(filePath) || this._projectDirectory.getPath() === filePath;
    }

    // non-used stub.
  }, {
    key: 'getDirectoryStatus',
    value: function getDirectoryStatus(directoryPath) {
      return (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeNumber.CLEAN;
    }

    // We don't want to do any synchronous 'hg status' calls. Just use cached values.
  }, {
    key: 'getPathStatus',
    value: function getPathStatus(filePath) {
      return this.getCachedPathStatus(filePath);
    }
  }, {
    key: 'getCachedPathStatus',
    value: function getCachedPathStatus(filePath) {
      if (!filePath) {
        return (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeNumber.CLEAN;
      }
      var cachedStatus = this._hgStatusCache[filePath];
      if (cachedStatus) {
        return (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeIdToNumber[cachedStatus];
      }
      return (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeNumber.CLEAN;
    }
  }, {
    key: 'getAllPathStatuses',
    value: function getAllPathStatuses() {
      var pathStatuses = Object.create(null);
      for (var _filePath in this._hgStatusCache) {
        pathStatuses[_filePath] = (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeIdToNumber[this._hgStatusCache[_filePath]];
      }
      return pathStatuses;
    }
  }, {
    key: 'isStatusModified',
    value: function isStatusModified(status) {
      return status === (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeNumber.MODIFIED;
    }
  }, {
    key: 'isStatusDeleted',
    value: function isStatusDeleted(status) {
      return status === (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeNumber.MISSING || status === (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeNumber.REMOVED;
    }
  }, {
    key: 'isStatusNew',
    value: function isStatusNew(status) {
      return status === (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeNumber.ADDED || status === (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeNumber.UNTRACKED;
    }
  }, {
    key: 'isStatusAdded',
    value: function isStatusAdded(status) {
      return status === (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeNumber.ADDED;
    }
  }, {
    key: 'isStatusUntracked',
    value: function isStatusUntracked(status) {
      return status === (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeNumber.UNTRACKED;
    }
  }, {
    key: 'isStatusIgnored',
    value: function isStatusIgnored(status) {
      return status === (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeNumber.IGNORED;
    }

    /**
     *
     * Section: Retrieving Diffs (parity with GitRepository)
     *
     */

  }, {
    key: 'getDiffStats',
    value: function getDiffStats(filePath) {
      var cleanStats = { added: 0, deleted: 0 };
      if (!filePath) {
        return cleanStats;
      }
      var cachedData = this._hgDiffCache[filePath];
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
  }, {
    key: 'getLineDiffs',
    value: function getLineDiffs(filePath, text) {
      if (!filePath) {
        return [];
      }
      var diffInfo = this._hgDiffCache[filePath];
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
  }, {
    key: '_updateDiffInfo',
    value: _asyncToGenerator(function* (filePaths) {
      var _this2 = this;

      var pathsToFetch = filePaths.filter(function (aPath) {
        // Don't try to fetch information for this path if it's not in the repo.
        if (!_this2._isPathRelevant(aPath)) {
          return false;
        }
        // Don't do another update for this path if we are in the middle of running an update.
        if (_this2._hgDiffCacheFilesUpdating.has(aPath)) {
          return false;
        } else {
          _this2._hgDiffCacheFilesUpdating.add(aPath);
          return true;
        }
      });

      if (pathsToFetch.length === 0) {
        return new Map();
      }

      // Call the HgService and update our cache with the results.
      var pathsToDiffInfo = yield this._service.fetchDiffInfo(pathsToFetch);
      if (pathsToDiffInfo) {
        for (var _ref3 of pathsToDiffInfo) {
          var _ref2 = _slicedToArray(_ref3, 2);

          var _filePath2 = _ref2[0];
          var diffInfo = _ref2[1];

          this._hgDiffCache[_filePath2] = diffInfo;
        }
      }

      // Remove files marked for deletion.
      this._hgDiffCacheFilesToClear.forEach(function (fileToClear) {
        delete _this2._hgDiffCache[fileToClear];
      });
      this._hgDiffCacheFilesToClear.clear();

      // The fetched files can now be updated again.
      for (var pathToFetch of pathsToFetch) {
        this._hgDiffCacheFilesUpdating.delete(pathToFetch);
      }

      // TODO (t9113913) Ideally, we could send more targeted events that better
      // describe what change has occurred. Right now, GitRepository dictates either
      // 'did-change-status' or 'did-change-statuses'.
      this._emitter.emit('did-change-statuses');
      return pathsToDiffInfo;
    })

    /**
    *
    * Section: Retrieving Bookmark (async methods)
    *
    */

    /*
     * @deprecated Use {#async.getShortHead} instead
     */
  }, {
    key: 'fetchActiveBookmark',
    value: function fetchActiveBookmark() {
      return this._getShortHeadAsync();
    }
  }, {
    key: 'fetchMergeConflicts',
    value: function fetchMergeConflicts() {
      return this._service.fetchMergeConflicts();
    }
  }, {
    key: 'resolveConflictedFile',
    value: function resolveConflictedFile(filePath) {
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
  }, {
    key: 'checkoutHead',
    value: function checkoutHead(filePathsArg) {
      var filePaths = Array.isArray(filePathsArg) ? filePathsArg : [filePathsArg];
      return this._service.revert(filePaths);
    }
  }, {
    key: 'checkoutReference',
    value: function checkoutReference(reference, create) {
      return this._service.checkout(reference, create);
    }

    /**
     *
     * Section: Bookmarks
     *
     */
  }, {
    key: 'createBookmark',
    value: function createBookmark(name, revision) {
      return this._service.createBookmark(name, revision);
    }
  }, {
    key: 'deleteBookmark',
    value: function deleteBookmark(name) {
      return this._service.deleteBookmark(name);
    }
  }, {
    key: 'renameBookmark',
    value: function renameBookmark(name, nextName) {
      return this._service.renameBookmark(name, nextName);
    }
  }, {
    key: 'getBookmarks',
    value: function getBookmarks() {
      return this._service.fetchBookmarks();
    }
  }, {
    key: 'onDidChangeBookmarks',
    value: function onDidChangeBookmarks(callback) {
      return this._emitter.on('did-change-bookmarks', callback);
    }
  }, {
    key: '_getShortHeadAsync',
    value: _asyncToGenerator(function* () {
      var newlyFetchedBookmark = '';
      try {
        newlyFetchedBookmark = yield this._service.fetchActiveBookmark();
      } catch (e) {
        // Suppress the error. There are legitimate times when there may be no
        // current bookmark, such as during a rebase. In this case, we just want
        // to return an empty string if there is no current bookmark.
      }
      if (newlyFetchedBookmark !== this._activeBookmark) {
        this._activeBookmark = newlyFetchedBookmark;
        // The Atom status-bar uses this as a signal to refresh the 'shortHead'.
        // There is currently no dedicated 'shortHeadDidChange' event.
        this._emitter.emit('did-change-statuses');
        this._emitter.emit('did-change-short-head');
      }
      return this._activeBookmark || '';
    })
  }, {
    key: 'onDidChangeShortHead',
    value: function onDidChangeShortHead(callback) {
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
  }, {
    key: 'fetchFileContentAtRevision',
    value: function fetchFileContentAtRevision(filePath, revision) {
      var fileContentsAtRevision = this._fileContentsAtRevisionIds.get(revision);
      if (fileContentsAtRevision == null) {
        fileContentsAtRevision = new Map();
        this._fileContentsAtRevisionIds.set(revision, fileContentsAtRevision);
      }
      var committedContents = fileContentsAtRevision.get(filePath);
      if (committedContents != null) {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(committedContents);
      } else {
        return this._service.fetchFileContentAtRevision(filePath, revision).refCount().do(function (contents) {
          return fileContentsAtRevision.set(filePath, contents);
        });
      }
    }
  }, {
    key: 'fetchFilesChangedAtRevision',
    value: function fetchFilesChangedAtRevision(revision) {
      var _this3 = this;

      var changes = this._revisionIdToFileChanges.get(revision);
      if (changes != null) {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(changes);
      } else {
        return this._service.fetchFilesChangedAtRevision(revision).refCount().do(function (fetchedChanges) {
          return _this3._revisionIdToFileChanges.set(revision, fetchedChanges);
        });
      }
    }
  }, {
    key: 'fetchRevisionInfoBetweenHeadAndBase',
    value: function fetchRevisionInfoBetweenHeadAndBase() {
      return this._service.fetchRevisionInfoBetweenHeadAndBase();
    }
  }, {
    key: 'fetchSmartlogRevisions',
    value: function fetchSmartlogRevisions() {
      return this._service.fetchSmartlogRevisions().refCount();
    }
  }, {
    key: 'refreshRevisions',
    value: function refreshRevisions() {
      this._revisionsCache.refreshRevisions();
    }
  }, {
    key: 'getCachedRevisions',
    value: function getCachedRevisions() {
      return this._revisionsCache.getCachedRevisions();
    }
  }, {
    key: 'getCachedRevisionStatuses',
    value: function getCachedRevisionStatuses() {
      return this._revisionStatusCache.getCachedRevisionStatuses();
    }

    // See HgService.getBaseRevision.
  }, {
    key: 'getBaseRevision',
    value: function getBaseRevision() {
      return this._service.getBaseRevision();
    }

    // See HgService.getBlameAtHead.
  }, {
    key: 'getBlameAtHead',
    value: function getBlameAtHead(filePath) {
      return this._service.getBlameAtHead(filePath);
    }
  }, {
    key: 'getTemplateCommitMessage',
    value: function getTemplateCommitMessage() {
      // TODO(t12228275) This is a stopgap hack, fix it.
      return this._service.getTemplateCommitMessage();
    }
  }, {
    key: 'getHeadCommitMessage',
    value: function getHeadCommitMessage() {
      return this._service.getHeadCommitMessage();
    }

    /**
     * Return relative paths to status code number values object.
     * matching `GitRepositoryAsync` implementation.
     */
  }, {
    key: 'getCachedPathStatuses',
    value: function getCachedPathStatuses() {
      var absoluteCodePaths = this.getAllPathStatuses();
      var relativeCodePaths = {};
      for (var absolutePath in absoluteCodePaths) {
        var relativePath = this.relativize(absolutePath);
        relativeCodePaths[relativePath] = absoluteCodePaths[absolutePath];
      }
      return relativeCodePaths;
    }
  }, {
    key: 'getConfigValueAsync',
    value: function getConfigValueAsync(key, path) {
      return this._service.getConfigValueAsync(key);
    }

    // See HgService.getDifferentialRevisionForChangeSetId.
  }, {
    key: 'getDifferentialRevisionForChangeSetId',
    value: function getDifferentialRevisionForChangeSetId(changeSetId) {
      return this._service.getDifferentialRevisionForChangeSetId(changeSetId);
    }
  }, {
    key: 'getSmartlog',
    value: function getSmartlog(ttyOutput, concise) {
      return this._service.getSmartlog(ttyOutput, concise);
    }
  }, {
    key: 'copy',
    value: function copy(filePaths, destPath) {
      var after = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      return this._service.copy(filePaths, destPath, after);
    }
  }, {
    key: 'rename',
    value: function rename(filePaths, destPath) {
      var after = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      return this._service.rename(filePaths, destPath, after);
    }
  }, {
    key: 'remove',
    value: function remove(filePaths) {
      var after = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      return this._service.remove(filePaths, after);
    }
  }, {
    key: 'addAll',
    value: function addAll(filePaths) {
      return this._service.add(filePaths);
    }
  }, {
    key: 'commit',
    value: function commit(message) {
      return this._service.commit(message).refCount().finally(this._clearClientCache.bind(this));
    }
  }, {
    key: 'amend',
    value: function amend(message, amendMode) {
      return this._service.amend(message, amendMode).refCount().finally(this._clearClientCache.bind(this));
    }
  }, {
    key: 'revert',
    value: function revert(filePaths) {
      return this._service.revert(filePaths);
    }
  }, {
    key: 'log',
    value: function log(filePaths, limit) {
      // TODO(mbolin): Return an Observable so that results appear faster.
      // Unfortunately, `hg log -Tjson` is not Observable-friendly because it will
      // not parse as JSON until all of the data has been printed to stdout.
      return this._service.log(filePaths, limit);
    }
  }, {
    key: 'continueRebase',
    value: function continueRebase() {
      return this._service.continueRebase();
    }
  }, {
    key: 'abortRebase',
    value: function abortRebase() {
      return this._service.abortRebase();
    }
  }, {
    key: 'rebase',
    value: function rebase(destination, source) {
      return this._service.rebase(destination, source).refCount();
    }
  }, {
    key: '_clearClientCache',
    value: function _clearClientCache() {
      this._hgDiffCache = {};
      this._hgStatusCache = {};
      this._emitter.emit('did-change-statuses');
    }
  }]);

  return HgRepositoryClient;
})();

exports.HgRepositoryClient = HgRepositoryClient;

/** The origin URL of this repository. */

/** The working directory of this repository. */

/** The root directory that is opened in Atom, which this Repository serves. */