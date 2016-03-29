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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _nuclideHgRepositoryBaseLibHgConstants = require('../../nuclide-hg-repository-base/lib/hg-constants');

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideCommonsLibPaths = require('../../nuclide-commons/lib/paths');

var _utils = require('./utils');

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

var serializeAsyncCall = _nuclideCommons.promises.serializeAsyncCall;

/**
 *
 * Section: Constants, Type Definitions
 *
 */

var EDITOR_SUBSCRIPTION_NAME = 'hg-repository-editor-subscription';
var MAX_INDIVIDUAL_CHANGED_PATHS = 1;

exports.MAX_INDIVIDUAL_CHANGED_PATHS = MAX_INDIVIDUAL_CHANGED_PATHS;
function filterForOnlyNotIgnored(code) {
  return code !== _nuclideHgRepositoryBaseLibHgConstants.StatusCodeId.IGNORED;
}

function filterForOnlyIgnored(code) {
  return code === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeId.IGNORED;
}

function filterForAllStatues() {
  return true;
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

    this._emitter = new _atom.Emitter();
    this._disposables = {};

    this._hgStatusCache = {};
    this._modifiedDirectoryCache = new Map();

    this._hgDiffCache = {};
    this._hgDiffCacheFilesUpdating = new Set();
    this._hgDiffCacheFilesToClear = new Set();

    this._serializedRefreshStatusesCache = serializeAsyncCall(this._refreshStatusesOfAllFilesInCache.bind(this));

    this._disposables[EDITOR_SUBSCRIPTION_NAME] = atom.workspace.observeTextEditors(function (editor) {
      var filePath = editor.getPath();
      if (!filePath) {
        // TODO: observe for when this editor's path changes.
        return;
      }
      if (!_this._isPathRelevant(filePath)) {
        return;
      }
      // If this editor has been previously active, we will have already
      // initialized diff info and registered listeners on it.
      if (_this._disposables[filePath]) {
        return;
      }
      // TODO (t8227570) Get initial diff stats for this editor, and refresh
      // this information whenever the content of the editor changes.
      var editorSubscriptions = _this._disposables[filePath] = new _atom.CompositeDisposable();
      editorSubscriptions.add(editor.onDidSave(function (event) {
        _this._updateDiffInfo([event.path]);
      }));
      // Remove the file from the diff stats cache when the editor is closed.
      // This isn't strictly necessary, but keeps the cache as small as possible.
      // There are cases where this removal may result in removing information
      // that is still relevant: e.g.
      //   * if the user very quickly closes and reopens a file; or
      //   * if the file is open in multiple editors, and one of those is closed.
      // These are probably edge cases, though, and the information will be
      // refetched the next time the file is edited.
      editorSubscriptions.add(editor.onDidDestroy(function () {
        _this._hgDiffCacheFilesToClear.add(filePath);
        _this._disposables[filePath].dispose();
        delete _this._disposables[filePath];
      }));
    });

    // Regardless of how frequently the service sends file change updates,
    // Only one batched status update can be running at any point of time.
    var toUpdateChangedPaths = [];
    var serializedUpdateChangedPaths = serializeAsyncCall(function () {
      // Send a batched update and clear the pending changes.
      return _this._updateChangedPaths(toUpdateChangedPaths.splice(0));
    });
    var onFilesChanges = function onFilesChanges(changedPaths) {
      toUpdateChangedPaths.push.apply(toUpdateChangedPaths, changedPaths);
      // Will trigger an update immediately if no other async call is active.
      // Otherwise, will schedule an async call when it's done.
      serializedUpdateChangedPaths();
    };
    // Get updates that tell the HgRepositoryClient when to clear its caches.
    this._service.observeFilesDidChange().subscribe(onFilesChanges);
    this._service.observeHgIgnoreFileDidChange().subscribe(this._serializedRefreshStatusesCache);
    this._service.observeHgRepoStateDidChange().subscribe(this._serializedRefreshStatusesCache);
    this._service.observeHgBookmarkDidChange().subscribe(this.fetchCurrentBookmark.bind(this));
  }

  _createClass(HgRepositoryClient, [{
    key: 'destroy',
    value: function destroy() {
      var _this2 = this;

      this._emitter.emit('did-destroy');
      this._emitter.dispose();
      Object.keys(this._disposables).forEach(function (key) {
        _this2._disposables[key].dispose();
      });
      this._service.dispose();
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
    key: 'onDidChangeStatuses',
    value: function onDidChangeStatuses(callback) {
      return this._emitter.on('did-change-statuses', callback);
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
      if (!this._currentBookmark) {
        // Kick off a fetch to get the current bookmark. This is async.
        this.fetchCurrentBookmark();
        return '';
      }
      return this._currentBookmark;
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
        return this.isStatusModified(_nuclideHgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[cachedPathStatus]);
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
        return this.isStatusNew(_nuclideHgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[cachedPathStatus]);
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
      return this._hgStatusCache[filePath] === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeId.IGNORED || this._isPathWithinHgRepo(filePath);
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

    // For now, this method only reflects the status of "modified" directories.
    // Tracking directory status isn't straightforward, as Hg only tracks files.
    // http://mercurial.selenic.com/wiki/FAQ#FAQ.2FCommonProblems.I_tried_to_check_in_an_empty_directory_and_it_failed.21
    // TODO: Make this method reflect New and Ignored statuses.
  }, {
    key: 'getDirectoryStatus',
    value: function getDirectoryStatus(directoryPath) {
      if (!directoryPath) {
        return _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.CLEAN;
      }
      var directoryPathWithSeparator = (0, _nuclideCommonsLibPaths.ensureTrailingSeparator)(directoryPath);
      if (this._modifiedDirectoryCache.has(directoryPathWithSeparator)) {
        return _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED;
      }
      return _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.CLEAN;
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
        return _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.CLEAN;
      }
      var cachedStatus = this._hgStatusCache[filePath];
      if (cachedStatus) {
        return _nuclideHgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[cachedStatus];
      }
      return _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.CLEAN;
    }
  }, {
    key: 'getAllPathStatuses',
    value: function getAllPathStatuses() {
      var pathStatuses = Object.create(null);
      for (var _filePath in this._hgStatusCache) {
        pathStatuses[_filePath] = _nuclideHgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[this._hgStatusCache[_filePath]];
      }
      return pathStatuses;
    }
  }, {
    key: 'isStatusModified',
    value: function isStatusModified(status) {
      return status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED || status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MISSING || status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.REMOVED;
    }
  }, {
    key: 'isStatusNew',
    value: function isStatusNew(status) {
      return status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.ADDED || status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.UNTRACKED;
    }

    /**
     *
     * Section: Reading Hg Status (async methods)
     *
     */

    /**
     * Recommended method to use to get the status of files in this repo.
     * @param paths An array of file paths to get the status for. If a path is not in the
     *   project, it will be ignored.
     * See HgService::getStatuses for more information.
     */
  }, {
    key: 'getStatuses',
    value: _asyncToGenerator(function* (paths, options) {
      var _this3 = this;

      var statusMap = new Map();
      var isRelavantStatus = this._getPredicateForRelevantStatuses(options);

      // Check the cache.
      // Note: If paths is empty, a full `hg status` will be run, which follows the spec.
      var pathsWithCacheMiss = [];
      paths.forEach(function (filePath) {
        var statusId = _this3._hgStatusCache[filePath];
        if (statusId) {
          if (!isRelavantStatus(statusId)) {
            return;
          }
          statusMap.set(filePath, _nuclideHgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[statusId]);
        } else {
          pathsWithCacheMiss.push(filePath);
        }
      });

      // Fetch any uncached statuses.
      if (pathsWithCacheMiss.length) {
        var newStatusInfo = yield this._updateStatuses(pathsWithCacheMiss, options);
        newStatusInfo.forEach(function (status, filePath) {
          statusMap.set(filePath, _nuclideHgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[status]);
        });
      }
      return statusMap;
    })

    /**
     * Fetches the statuses for the given file paths, and updates the cache and
     * sends out change events as appropriate.
     * @param filePaths An array of file paths to update the status for. If a path
     *   is not in the project, it will be ignored.
     */
  }, {
    key: '_updateStatuses',
    value: _asyncToGenerator(function* (filePaths, options) {
      var _this4 = this;

      var pathsInRepo = filePaths.filter(function (filePath) {
        return _this4._isPathRelevant(filePath);
      });
      if (pathsInRepo.length === 0) {
        return new Map();
      }

      var statusMapPathToStatusId = yield this._service.fetchStatuses(pathsInRepo, options);

      var queriedFiles = new Set(pathsInRepo);
      var statusChangeEvents = [];
      statusMapPathToStatusId.forEach(function (newStatusId, filePath) {

        var oldStatus = _this4._hgStatusCache[filePath];
        if (oldStatus && oldStatus !== newStatusId || !oldStatus && newStatusId !== _nuclideHgRepositoryBaseLibHgConstants.StatusCodeId.CLEAN) {
          statusChangeEvents.push({
            path: filePath,
            pathStatus: _nuclideHgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[newStatusId]
          });
          if (newStatusId === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeId.CLEAN) {
            // Don't bother keeping 'clean' files in the cache.
            delete _this4._hgStatusCache[filePath];
            _this4._removeAllParentDirectoriesFromCache(filePath);
          } else {
            _this4._hgStatusCache[filePath] = newStatusId;
            if (newStatusId === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeId.MODIFIED) {
              _this4._addAllParentDirectoriesToCache(filePath);
            }
          }
        }
        queriedFiles['delete'](filePath);
      });

      // If the statuses were fetched for only changed (`hg status`) or
      // ignored ('hg status --ignored`) files, a queried file may not be
      // returned in the response. If it wasn't returned, this means its status
      // may have changed, in which case it should be removed from the hgStatusCache.
      // Note: we don't know the real updated status of the file, so don't send a change event.
      // TODO (jessicalin) Can we make the 'pathStatus' field in the change event optional?
      // Then we can send these events.
      var hgStatusOption = this._getStatusOption(options);
      if (hgStatusOption === _nuclideHgRepositoryBaseLibHgConstants.HgStatusOption.ONLY_IGNORED) {
        queriedFiles.forEach(function (filePath) {
          if (_this4._hgStatusCache[filePath] === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeId.IGNORED) {
            delete _this4._hgStatusCache[filePath];
          }
        });
      } else if (hgStatusOption === _nuclideHgRepositoryBaseLibHgConstants.HgStatusOption.ALL_STATUSES) {
        // If HgStatusOption.ALL_STATUSES was passed and a file does not appear in
        // the results, it must mean the file was removed from the filesystem.
        queriedFiles.forEach(function (filePath) {
          var cachedStatusId = _this4._hgStatusCache[filePath];
          delete _this4._hgStatusCache[filePath];
          if (cachedStatusId === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeId.MODIFIED) {
            _this4._removeAllParentDirectoriesFromCache(filePath);
          }
        });
      } else {
        queriedFiles.forEach(function (filePath) {
          var cachedStatusId = _this4._hgStatusCache[filePath];
          if (cachedStatusId !== _nuclideHgRepositoryBaseLibHgConstants.StatusCodeId.IGNORED) {
            delete _this4._hgStatusCache[filePath];
            if (cachedStatusId === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeId.MODIFIED) {
              _this4._removeAllParentDirectoriesFromCache(filePath);
            }
          }
        });
      }

      // Emit change events only after the cache has been fully updated.
      statusChangeEvents.forEach(function (event) {
        _this4._emitter.emit('did-change-status', event);
      });
      this._emitter.emit('did-change-statuses');

      return statusMapPathToStatusId;
    })
  }, {
    key: '_addAllParentDirectoriesToCache',
    value: function _addAllParentDirectoriesToCache(filePath) {
      (0, _utils.addAllParentDirectoriesToCache)(this._modifiedDirectoryCache, filePath, this._projectDirectory.getParent().getPath());
    }
  }, {
    key: '_removeAllParentDirectoriesFromCache',
    value: function _removeAllParentDirectoriesFromCache(filePath) {
      (0, _utils.removeAllParentDirectoriesFromCache)(this._modifiedDirectoryCache, filePath, this._projectDirectory.getParent().getPath());
    }

    /**
     * Helper function for ::getStatuses.
     * Returns a filter for whether or not the given status code should be
     * returned, given the passed-in options for ::getStatuses.
     */
  }, {
    key: '_getPredicateForRelevantStatuses',
    value: function _getPredicateForRelevantStatuses(options) {
      var hgStatusOption = this._getStatusOption(options);

      if (hgStatusOption === _nuclideHgRepositoryBaseLibHgConstants.HgStatusOption.ONLY_IGNORED) {
        return filterForOnlyIgnored;
      } else if (hgStatusOption === _nuclideHgRepositoryBaseLibHgConstants.HgStatusOption.ALL_STATUSES) {
        return filterForAllStatues;
      } else {
        return filterForOnlyNotIgnored;
      }
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
     * Recommended method to use to get the diff stats of files in this repo.
     * @param path The file path to get the status for. If a path is not in the
     *   project, default "clean" stats will be returned.
     */
  }, {
    key: 'getDiffStatsForPath',
    value: _asyncToGenerator(function* (filePath) {
      var cleanStats = { added: 0, deleted: 0 };
      if (!filePath) {
        return cleanStats;
      }

      // Check the cache.
      var cachedDiffInfo = this._hgDiffCache[filePath];
      if (cachedDiffInfo) {
        return { added: cachedDiffInfo.added, deleted: cachedDiffInfo.deleted };
      }

      // Fall back to a fetch.
      var fetchedPathToDiffInfo = yield this._updateDiffInfo([filePath]);
      if (fetchedPathToDiffInfo) {
        var diffInfo = fetchedPathToDiffInfo.get(filePath);
        if (diffInfo != null) {
          return { added: diffInfo.added, deleted: diffInfo.deleted };
        }
      }

      return cleanStats;
    })

    /**
     * Recommended method to use to get the line diffs of files in this repo.
     * @param path The absolute file path to get the line diffs for. If the path \
     *   is not in the project, an empty Array will be returned.
     */
  }, {
    key: 'getLineDiffsForPath',
    value: _asyncToGenerator(function* (filePath) {
      var lineDiffs = [];
      if (!filePath) {
        return lineDiffs;
      }

      // Check the cache.
      var cachedDiffInfo = this._hgDiffCache[filePath];
      if (cachedDiffInfo) {
        return cachedDiffInfo.lineDiffs;
      }

      // Fall back to a fetch.
      var fetchedPathToDiffInfo = yield this._updateDiffInfo([filePath]);
      if (fetchedPathToDiffInfo != null) {
        var diffInfo = fetchedPathToDiffInfo.get(filePath);
        if (diffInfo != null) {
          return diffInfo.lineDiffs;
        }
      }

      return lineDiffs;
    })

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
      var _this5 = this;

      var pathsToFetch = filePaths.filter(function (aPath) {
        // Don't try to fetch information for this path if it's not in the repo.
        if (!_this5._isPathRelevant(aPath)) {
          return false;
        }
        // Don't do another update for this path if we are in the middle of running an update.
        if (_this5._hgDiffCacheFilesUpdating.has(aPath)) {
          return false;
        } else {
          _this5._hgDiffCacheFilesUpdating.add(aPath);
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
        delete _this5._hgDiffCache[fileToClear];
      });
      this._hgDiffCacheFilesToClear.clear();

      // The fetched files can now be updated again.
      for (var pathToFetch of pathsToFetch) {
        this._hgDiffCacheFilesUpdating['delete'](pathToFetch);
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
  }, {
    key: 'fetchCurrentBookmark',
    value: _asyncToGenerator(function* () {
      var newlyFetchedBookmark = '';
      try {
        newlyFetchedBookmark = yield this._service.fetchCurrentBookmark();
      } catch (e) {
        // Suppress the error. There are legitimate times when there may be no
        // current bookmark, such as during a rebase. In this case, we just want
        // to return an empty string if there is no current bookmark.
      }
      if (newlyFetchedBookmark !== this._currentBookmark) {
        this._currentBookmark = newlyFetchedBookmark;
        // The Atom status-bar uses this as a signal to refresh the 'shortHead'.
        // There is currently no dedicated 'shortHeadDidChange' event.
        this._emitter.emit('did-change-statuses');
      }
      return this._currentBookmark || '';
    })

    /**
     *
     * Section: Checking Out
     *
     */

    // TODO This is a stub.
  }, {
    key: 'checkoutHead',
    value: function checkoutHead(path) {
      return false;
    }

    // TODO This is a stub.
  }, {
    key: 'checkoutReference',
    value: function checkoutReference(reference, create) {
      return false;
    }

    /**
     * This is the async version of what checkoutReference() is meant to do.
     */
  }, {
    key: 'checkoutRevision',
    value: _asyncToGenerator(function* (reference, create) {
      yield this._service.checkout(reference, create);
      return true;
    })

    /**
     *
     * Section: HgService subscriptions
     *
     */

    /**
     * Updates the cache in response to any number of (non-.hgignore) files changing.
     * @param update The changed file paths.
     */
  }, {
    key: '_updateChangedPaths',
    value: _asyncToGenerator(function* (changedPaths) {
      var _this6 = this;

      var relevantChangedPaths = changedPaths.filter(this._isPathRelevant.bind(this));
      if (relevantChangedPaths.length === 0) {
        return;
      } else if (relevantChangedPaths.length <= MAX_INDIVIDUAL_CHANGED_PATHS) {
        // Update the statuses individually.
        yield this._updateStatuses(relevantChangedPaths, { hgStatusOption: _nuclideHgRepositoryBaseLibHgConstants.HgStatusOption.ALL_STATUSES });
        yield this._updateDiffInfo(relevantChangedPaths.filter(function (filePath) {
          return _this6._hgDiffCache[filePath];
        }));
      } else {
        // This is a heuristic to improve performance. Many files being changed may
        // be a sign that we are picking up changes that were created in an automated
        // way -- so in addition, there may be many batches of changes in succession.
        // The refresh is serialized, so it is safe to call it multiple times in succession.
        yield this._serializedRefreshStatusesCache();
      }
    })
  }, {
    key: '_refreshStatusesOfAllFilesInCache',
    value: _asyncToGenerator(function* () {
      this._hgStatusCache = {};
      this._modifiedDirectoryCache = new Map();
      var pathsInDiffCache = Object.keys(this._hgDiffCache);
      this._hgDiffCache = {};
      // We should get the modified status of all files in the repo that is
      // under the HgRepositoryClient's project directory, because when Hg
      // modifies the repo, it doesn't necessarily only modify files that were
      // previously modified.
      yield this._updateStatuses([this.getProjectDirectory()], { hgStatusOption: _nuclideHgRepositoryBaseLibHgConstants.HgStatusOption.ONLY_NON_IGNORED });
      if (pathsInDiffCache.length > 0) {
        yield this._updateDiffInfo(pathsInDiffCache);
      }
    })

    /**
     *
     * Section: Repository State at Specific Revisions
     *
     */
  }, {
    key: 'fetchFileContentAtRevision',
    value: function fetchFileContentAtRevision(filePath, revision) {
      return this._service.fetchFileContentAtRevision(filePath, revision);
    }
  }, {
    key: 'fetchFilesChangedAtRevision',
    value: function fetchFilesChangedAtRevision(revision) {
      return this._service.fetchFilesChangedAtRevision(revision);
    }
  }, {
    key: 'fetchRevisionInfoBetweenHeadAndBase',
    value: function fetchRevisionInfoBetweenHeadAndBase() {
      return this._service.fetchRevisionInfoBetweenHeadAndBase();
    }

    // See HgService.getBlameAtHead.
  }, {
    key: 'getBlameAtHead',
    value: function getBlameAtHead(filePath) {
      return this._service.getBlameAtHead(filePath);
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
    key: 'rename',
    value: function rename(oldFilePath, newFilePath) {
      return this._service.rename(oldFilePath, newFilePath);
    }
  }, {
    key: 'remove',
    value: function remove(filePath) {
      return this._service.remove(filePath);
    }
  }, {
    key: 'add',
    value: function add(filePaths) {
      return this._service.add(filePaths);
    }
  }, {
    key: 'commit',
    value: function commit(message) {
      return this._service.commit(message);
    }
  }, {
    key: 'amend',
    value: function amend(message) {
      return this._service.amend(message);
    }
  }, {
    key: 'revert',
    value: function revert(filePaths) {
      return this._service.revert(filePaths);
    }
  }, {
    key: '_getStatusOption',
    value: function _getStatusOption(options) {
      if (options == null) {
        return null;
      }
      return options.hgStatusOption;
    }
  }]);

  return HgRepositoryClient;
})();

exports['default'] = HgRepositoryClient;

/** The origin URL of this repository. */

/** The working directory of this repository. */

/** The root directory that is opened in Atom, which this Repository serves. **/

// A map from a key (in most cases, a file path), to a related Disposable.

// Map of directory path to the number of modified files within that directory.
//# sourceMappingURL=data:application/json;base64,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QztLQUN6RTs7O1dBRVUscUJBQUMsU0FBa0IsRUFBRSxPQUFnQixFQUFtQjtBQUNqRSxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUN0RDs7O1dBRUssZ0JBQUMsV0FBbUIsRUFBRSxXQUFtQixFQUFpQjtBQUM5RCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztLQUN2RDs7O1dBRUssZ0JBQUMsUUFBZ0IsRUFBaUI7QUFDdEMsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN2Qzs7O1dBRUUsYUFBQyxTQUE0QixFQUFpQjtBQUMvQyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3JDOzs7V0FFSyxnQkFBQyxPQUFlLEVBQWlCO0FBQ3JDLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDdEM7OztXQUVJLGVBQUMsT0FBZ0IsRUFBaUI7QUFDckMsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNyQzs7O1dBRUssZ0JBQUMsU0FBNEIsRUFBaUI7QUFDbEQsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN4Qzs7O1dBRWUsMEJBQUMsT0FBZ0MsRUFBd0I7QUFDdkUsVUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO0FBQ25CLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxhQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUM7S0FDL0I7OztTQWgwQmtCLGtCQUFrQjs7O3FCQUFsQixrQkFBa0IiLCJmaWxlIjoiSGdSZXBvc2l0b3J5Q2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBIZ1NlcnZpY2UsXG4gIERpZmZJbmZvLFxuICBIZ1N0YXR1c09wdGlvblZhbHVlLFxuICBMaW5lRGlmZixcbiAgUmV2aXNpb25JbmZvLFxuICBSZXZpc2lvbkZpbGVDaGFuZ2VzLFxuICBTdGF0dXNDb2RlSWRWYWx1ZSxcbiAgU3RhdHVzQ29kZU51bWJlclZhbHVlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIFN0YXR1c0NvZGVJZCxcbiAgU3RhdHVzQ29kZUlkVG9OdW1iZXIsXG4gIFN0YXR1c0NvZGVOdW1iZXIsXG4gIEhnU3RhdHVzT3B0aW9uLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcbmltcG9ydCB7cHJvbWlzZXN9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge2Vuc3VyZVRyYWlsaW5nU2VwYXJhdG9yfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMvbGliL3BhdGhzJztcbmltcG9ydCB7YWRkQWxsUGFyZW50RGlyZWN0b3JpZXNUb0NhY2hlLCByZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZX0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IHtzZXJpYWxpemVBc3luY0NhbGx9ID0gcHJvbWlzZXM7XG5cbnR5cGUgSGdSZXBvc2l0b3J5T3B0aW9ucyA9IHtcbiAgLyoqIFRoZSBvcmlnaW4gVVJMIG9mIHRoaXMgcmVwb3NpdG9yeS4gKi9cbiAgb3JpZ2luVVJMOiA/c3RyaW5nO1xuXG4gIC8qKiBUaGUgd29ya2luZyBkaXJlY3Rvcnkgb2YgdGhpcyByZXBvc2l0b3J5LiAqL1xuICB3b3JraW5nRGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSB8IFJlbW90ZURpcmVjdG9yeTtcblxuICAvKiogVGhlIHJvb3QgZGlyZWN0b3J5IHRoYXQgaXMgb3BlbmVkIGluIEF0b20sIHdoaWNoIHRoaXMgUmVwb3NpdG9yeSBzZXJ2ZXMuICoqL1xuICBwcm9qZWN0Um9vdERpcmVjdG9yeTogYXRvbSREaXJlY3Rvcnk7XG59O1xuXG4vKipcbiAqXG4gKiBTZWN0aW9uOiBDb25zdGFudHMsIFR5cGUgRGVmaW5pdGlvbnNcbiAqXG4gKi9cblxuZXhwb3J0IHR5cGUgSGdTdGF0dXNDb21tYW5kT3B0aW9ucyA9IHtcbiAgaGdTdGF0dXNPcHRpb246IEhnU3RhdHVzT3B0aW9uVmFsdWU7XG59O1xuXG5jb25zdCBFRElUT1JfU1VCU0NSSVBUSU9OX05BTUUgPSAnaGctcmVwb3NpdG9yeS1lZGl0b3Itc3Vic2NyaXB0aW9uJztcbmV4cG9ydCBjb25zdCBNQVhfSU5ESVZJRFVBTF9DSEFOR0VEX1BBVEhTID0gMTtcblxuZnVuY3Rpb24gZmlsdGVyRm9yT25seU5vdElnbm9yZWQoY29kZTogU3RhdHVzQ29kZUlkVmFsdWUpOiBib29sZWFuIHtcbiAgcmV0dXJuIChjb2RlICE9PSBTdGF0dXNDb2RlSWQuSUdOT1JFRCk7XG59XG5cbmZ1bmN0aW9uIGZpbHRlckZvck9ubHlJZ25vcmVkKGNvZGU6IFN0YXR1c0NvZGVJZFZhbHVlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoY29kZSA9PT0gU3RhdHVzQ29kZUlkLklHTk9SRUQpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJGb3JBbGxTdGF0dWVzKCkge1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuXG4vKipcbiAqXG4gKiBTZWN0aW9uOiBIZ1JlcG9zaXRvcnlDbGllbnRcbiAqXG4gKi9cblxuLyoqXG4gKiBIZ1JlcG9zaXRvcnlDbGllbnQgcnVucyBvbiB0aGUgbWFjaGluZSB0aGF0IE51Y2xpZGUvQXRvbSBpcyBydW5uaW5nIG9uLlxuICogSXQgaXMgdGhlIGludGVyZmFjZSB0aGF0IG90aGVyIEF0b20gcGFja2FnZXMgd2lsbCB1c2UgdG8gYWNjZXNzIE1lcmN1cmlhbC5cbiAqIEl0IGNhY2hlcyBkYXRhIGZldGNoZWQgZnJvbSBhbiBIZ1NlcnZpY2UuXG4gKiBJdCBpbXBsZW1lbnRzIHRoZSBzYW1lIGludGVyZmFjZSBhcyBHaXRSZXBvc2l0b3J5LCAoaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL2xhdGVzdC9HaXRSZXBvc2l0b3J5KVxuICogaW4gYWRkaXRpb24gdG8gcHJvdmlkaW5nIGFzeW5jaHJvbm91cyBtZXRob2RzIGZvciBzb21lIGdldHRlcnMuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7UmVtb3RlRGlyZWN0b3J5fSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGdSZXBvc2l0b3J5Q2xpZW50IHtcbiAgX3BhdGg6IHN0cmluZztcbiAgX3dvcmtpbmdEaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5IHwgUmVtb3RlRGlyZWN0b3J5O1xuICBfcHJvamVjdERpcmVjdG9yeTogYXRvbSREaXJlY3Rvcnk7XG4gIF9vcmlnaW5VUkw6ID9zdHJpbmc7XG4gIF9zZXJ2aWNlOiBIZ1NlcnZpY2U7XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICAvLyBBIG1hcCBmcm9tIGEga2V5IChpbiBtb3N0IGNhc2VzLCBhIGZpbGUgcGF0aCksIHRvIGEgcmVsYXRlZCBEaXNwb3NhYmxlLlxuICBfZGlzcG9zYWJsZXM6IHtba2V5OiBzdHJpbmddOiBJRGlzcG9zYWJsZX07XG4gIF9oZ1N0YXR1c0NhY2hlOiB7W2ZpbGVQYXRoOiBOdWNsaWRlVXJpXTogU3RhdHVzQ29kZUlkVmFsdWV9O1xuICAvLyBNYXAgb2YgZGlyZWN0b3J5IHBhdGggdG8gdGhlIG51bWJlciBvZiBtb2RpZmllZCBmaWxlcyB3aXRoaW4gdGhhdCBkaXJlY3RvcnkuXG4gIF9tb2RpZmllZERpcmVjdG9yeUNhY2hlOiBNYXA8c3RyaW5nLCBudW1iZXI+O1xuICBfaGdEaWZmQ2FjaGU6IHtbZmlsZVBhdGg6IE51Y2xpZGVVcmldOiBEaWZmSW5mb307XG4gIF9oZ0RpZmZDYWNoZUZpbGVzVXBkYXRpbmc6IFNldDxOdWNsaWRlVXJpPjtcbiAgX2hnRGlmZkNhY2hlRmlsZXNUb0NsZWFyOiBTZXQ8TnVjbGlkZVVyaT47XG5cbiAgX2N1cnJlbnRCb29rbWFyazogP3N0cmluZztcbiAgX3NlcmlhbGl6ZWRSZWZyZXNoU3RhdHVzZXNDYWNoZTogKCkgPT4gUHJvbWlzZTx2b2lkPjtcblxuICBjb25zdHJ1Y3RvcihyZXBvUGF0aDogc3RyaW5nLCBoZ1NlcnZpY2U6IEhnU2VydmljZSwgb3B0aW9uczogSGdSZXBvc2l0b3J5T3B0aW9ucykge1xuICAgIHRoaXMuX3BhdGggPSByZXBvUGF0aDtcbiAgICB0aGlzLl93b3JraW5nRGlyZWN0b3J5ID0gb3B0aW9ucy53b3JraW5nRGlyZWN0b3J5O1xuICAgIHRoaXMuX3Byb2plY3REaXJlY3RvcnkgPSBvcHRpb25zLnByb2plY3RSb290RGlyZWN0b3J5O1xuICAgIHRoaXMuX29yaWdpblVSTCA9IG9wdGlvbnMub3JpZ2luVVJMO1xuICAgIHRoaXMuX3NlcnZpY2UgPSBoZ1NlcnZpY2U7XG5cbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IHt9O1xuXG4gICAgdGhpcy5faGdTdGF0dXNDYWNoZSA9IHt9O1xuICAgIHRoaXMuX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGUgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9oZ0RpZmZDYWNoZSA9IHt9O1xuICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNVcGRhdGluZyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVG9DbGVhciA9IG5ldyBTZXQoKTtcblxuICAgIHRoaXMuX3NlcmlhbGl6ZWRSZWZyZXNoU3RhdHVzZXNDYWNoZSA9IHNlcmlhbGl6ZUFzeW5jQ2FsbChcbiAgICAgIHRoaXMuX3JlZnJlc2hTdGF0dXNlc09mQWxsRmlsZXNJbkNhY2hlLmJpbmQodGhpcyksXG4gICAgKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzW0VESVRPUl9TVUJTQ1JJUFRJT05fTkFNRV0gPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoZWRpdG9yID0+IHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgICAgLy8gVE9ETzogb2JzZXJ2ZSBmb3Igd2hlbiB0aGlzIGVkaXRvcidzIHBhdGggY2hhbmdlcy5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLl9pc1BhdGhSZWxldmFudChmaWxlUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gSWYgdGhpcyBlZGl0b3IgaGFzIGJlZW4gcHJldmlvdXNseSBhY3RpdmUsIHdlIHdpbGwgaGF2ZSBhbHJlYWR5XG4gICAgICAvLyBpbml0aWFsaXplZCBkaWZmIGluZm8gYW5kIHJlZ2lzdGVyZWQgbGlzdGVuZXJzIG9uIGl0LlxuICAgICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGVzW2ZpbGVQYXRoXSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBUT0RPICh0ODIyNzU3MCkgR2V0IGluaXRpYWwgZGlmZiBzdGF0cyBmb3IgdGhpcyBlZGl0b3IsIGFuZCByZWZyZXNoXG4gICAgICAvLyB0aGlzIGluZm9ybWF0aW9uIHdoZW5ldmVyIHRoZSBjb250ZW50IG9mIHRoZSBlZGl0b3IgY2hhbmdlcy5cbiAgICAgIGNvbnN0IGVkaXRvclN1YnNjcmlwdGlvbnMgPSB0aGlzLl9kaXNwb3NhYmxlc1tmaWxlUGF0aF0gPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkU2F2ZShldmVudCA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURpZmZJbmZvKFtldmVudC5wYXRoXSk7XG4gICAgICB9KSk7XG4gICAgICAvLyBSZW1vdmUgdGhlIGZpbGUgZnJvbSB0aGUgZGlmZiBzdGF0cyBjYWNoZSB3aGVuIHRoZSBlZGl0b3IgaXMgY2xvc2VkLlxuICAgICAgLy8gVGhpcyBpc24ndCBzdHJpY3RseSBuZWNlc3NhcnksIGJ1dCBrZWVwcyB0aGUgY2FjaGUgYXMgc21hbGwgYXMgcG9zc2libGUuXG4gICAgICAvLyBUaGVyZSBhcmUgY2FzZXMgd2hlcmUgdGhpcyByZW1vdmFsIG1heSByZXN1bHQgaW4gcmVtb3ZpbmcgaW5mb3JtYXRpb25cbiAgICAgIC8vIHRoYXQgaXMgc3RpbGwgcmVsZXZhbnQ6IGUuZy5cbiAgICAgIC8vICAgKiBpZiB0aGUgdXNlciB2ZXJ5IHF1aWNrbHkgY2xvc2VzIGFuZCByZW9wZW5zIGEgZmlsZTsgb3JcbiAgICAgIC8vICAgKiBpZiB0aGUgZmlsZSBpcyBvcGVuIGluIG11bHRpcGxlIGVkaXRvcnMsIGFuZCBvbmUgb2YgdGhvc2UgaXMgY2xvc2VkLlxuICAgICAgLy8gVGhlc2UgYXJlIHByb2JhYmx5IGVkZ2UgY2FzZXMsIHRob3VnaCwgYW5kIHRoZSBpbmZvcm1hdGlvbiB3aWxsIGJlXG4gICAgICAvLyByZWZldGNoZWQgdGhlIG5leHQgdGltZSB0aGUgZmlsZSBpcyBlZGl0ZWQuXG4gICAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXIuYWRkKGZpbGVQYXRoKTtcbiAgICAgICAgdGhpcy5fZGlzcG9zYWJsZXNbZmlsZVBhdGhdLmRpc3Bvc2UoKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2Rpc3Bvc2FibGVzW2ZpbGVQYXRoXTtcbiAgICAgIH0pKTtcbiAgICB9KTtcblxuICAgIC8vIFJlZ2FyZGxlc3Mgb2YgaG93IGZyZXF1ZW50bHkgdGhlIHNlcnZpY2Ugc2VuZHMgZmlsZSBjaGFuZ2UgdXBkYXRlcyxcbiAgICAvLyBPbmx5IG9uZSBiYXRjaGVkIHN0YXR1cyB1cGRhdGUgY2FuIGJlIHJ1bm5pbmcgYXQgYW55IHBvaW50IG9mIHRpbWUuXG4gICAgY29uc3QgdG9VcGRhdGVDaGFuZ2VkUGF0aHMgPSBbXTtcbiAgICBjb25zdCBzZXJpYWxpemVkVXBkYXRlQ2hhbmdlZFBhdGhzID0gc2VyaWFsaXplQXN5bmNDYWxsKCgpID0+IHtcbiAgICAgIC8vIFNlbmQgYSBiYXRjaGVkIHVwZGF0ZSBhbmQgY2xlYXIgdGhlIHBlbmRpbmcgY2hhbmdlcy5cbiAgICAgIHJldHVybiB0aGlzLl91cGRhdGVDaGFuZ2VkUGF0aHModG9VcGRhdGVDaGFuZ2VkUGF0aHMuc3BsaWNlKDApKTtcbiAgICB9KTtcbiAgICBjb25zdCBvbkZpbGVzQ2hhbmdlcyA9IChjaGFuZ2VkUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+KSA9PiB7XG4gICAgICB0b1VwZGF0ZUNoYW5nZWRQYXRocy5wdXNoKC4uLmNoYW5nZWRQYXRocyk7XG4gICAgICAvLyBXaWxsIHRyaWdnZXIgYW4gdXBkYXRlIGltbWVkaWF0ZWx5IGlmIG5vIG90aGVyIGFzeW5jIGNhbGwgaXMgYWN0aXZlLlxuICAgICAgLy8gT3RoZXJ3aXNlLCB3aWxsIHNjaGVkdWxlIGFuIGFzeW5jIGNhbGwgd2hlbiBpdCdzIGRvbmUuXG4gICAgICBzZXJpYWxpemVkVXBkYXRlQ2hhbmdlZFBhdGhzKCk7XG4gICAgfTtcbiAgICAvLyBHZXQgdXBkYXRlcyB0aGF0IHRlbGwgdGhlIEhnUmVwb3NpdG9yeUNsaWVudCB3aGVuIHRvIGNsZWFyIGl0cyBjYWNoZXMuXG4gICAgdGhpcy5fc2VydmljZS5vYnNlcnZlRmlsZXNEaWRDaGFuZ2UoKS5zdWJzY3JpYmUob25GaWxlc0NoYW5nZXMpO1xuICAgIHRoaXMuX3NlcnZpY2Uub2JzZXJ2ZUhnSWdub3JlRmlsZURpZENoYW5nZSgpXG4gICAgICAuc3Vic2NyaWJlKHRoaXMuX3NlcmlhbGl6ZWRSZWZyZXNoU3RhdHVzZXNDYWNoZSk7XG4gICAgdGhpcy5fc2VydmljZS5vYnNlcnZlSGdSZXBvU3RhdGVEaWRDaGFuZ2UoKVxuICAgICAgLnN1YnNjcmliZSh0aGlzLl9zZXJpYWxpemVkUmVmcmVzaFN0YXR1c2VzQ2FjaGUpO1xuICAgIHRoaXMuX3NlcnZpY2Uub2JzZXJ2ZUhnQm9va21hcmtEaWRDaGFuZ2UoKVxuICAgICAgLnN1YnNjcmliZSh0aGlzLmZldGNoQ3VycmVudEJvb2ttYXJrLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95Jyk7XG4gICAgdGhpcy5fZW1pdHRlci5kaXNwb3NlKCk7XG4gICAgT2JqZWN0LmtleXModGhpcy5fZGlzcG9zYWJsZXMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzW2tleV0uZGlzcG9zZSgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NlcnZpY2UuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IEV2ZW50IFN1YnNjcmlwdGlvblxuICAgKlxuICAgKi9cblxuICBvbkRpZERlc3Ryb3koY2FsbGJhY2s6ICgpID0+IG1peGVkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdkaWQtZGVzdHJveScsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlU3RhdHVzKFxuICAgIGNhbGxiYWNrOiAoZXZlbnQ6IHtwYXRoOiBzdHJpbmc7IHBhdGhTdGF0dXM6IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZX0pID0+IG1peGVkLFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1jaGFuZ2Utc3RhdHVzJywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VTdGF0dXNlcyhjYWxsYmFjazogKCkgPT4gbWl4ZWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnLCBjYWxsYmFjayk7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZXBvc2l0b3J5IERldGFpbHNcbiAgICpcbiAgICovXG5cbiAgZ2V0VHlwZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnaGcnO1xuICB9XG5cbiAgZ2V0UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9wYXRoO1xuICB9XG5cbiAgZ2V0V29ya2luZ0RpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl93b3JraW5nRGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgfVxuXG4gIC8vIEByZXR1cm4gVGhlIHBhdGggb2YgdGhlIHJvb3QgcHJvamVjdCBmb2xkZXIgaW4gQXRvbSB0aGF0IHRoaXNcbiAgLy8gSGdSZXBvc2l0b3J5Q2xpZW50IHByb3ZpZGVzIGluZm9ybWF0aW9uIGFib3V0LlxuICBnZXRQcm9qZWN0RGlyZWN0b3J5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2plY3REaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgaXNQcm9qZWN0QXRSb290KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmVsYXRpdml6ZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkucmVsYXRpdml6ZShmaWxlUGF0aCk7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBoYXNCcmFuY2goYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiBUaGUgY3VycmVudCBIZyBib29rbWFyay5cbiAgICovXG4gIGdldFNob3J0SGVhZChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLl9jdXJyZW50Qm9va21hcmspIHtcbiAgICAgIC8vIEtpY2sgb2ZmIGEgZmV0Y2ggdG8gZ2V0IHRoZSBjdXJyZW50IGJvb2ttYXJrLiBUaGlzIGlzIGFzeW5jLlxuICAgICAgdGhpcy5mZXRjaEN1cnJlbnRCb29rbWFyaygpO1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEJvb2ttYXJrO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgaXNTdWJtb2R1bGUocGF0aDogTnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldEFoZWFkQmVoaW5kQ291bnQocmVmZXJlbmNlOiBzdHJpbmcsIHBhdGg6IE51Y2xpZGVVcmkpOiBudW1iZXIge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0Q2FjaGVkVXBzdHJlYW1BaGVhZEJlaGluZENvdW50KHBhdGg6ID9OdWNsaWRlVXJpKToge2FoZWFkOiBudW1iZXI7IGJlaGluZDogbnVtYmVyO30ge1xuICAgIHJldHVybiB7XG4gICAgICBhaGVhZDogMCxcbiAgICAgIGJlaGluZDogMCxcbiAgICB9O1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0Q29uZmlnVmFsdWUoa2V5OiBzdHJpbmcsIHBhdGg6ID9zdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldE9yaWdpblVSTChwYXRoOiA/c3RyaW5nKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX29yaWdpblVSTDtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldFVwc3RyZWFtQnJhbmNoKHBhdGg6ID9zdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldFJlZmVyZW5jZXMoXG4gICAgcGF0aDogP051Y2xpZGVVcmksXG4gICk6IHtoZWFkczogQXJyYXk8c3RyaW5nPjsgcmVtb3RlczogQXJyYXk8c3RyaW5nPjsgdGFnczogQXJyYXk8c3RyaW5nPjt9IHtcbiAgICByZXR1cm4ge1xuICAgICAgaGVhZHM6IFtdLFxuICAgICAgcmVtb3RlczogW10sXG4gICAgICB0YWdzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0UmVmZXJlbmNlVGFyZ2V0KHJlZmVyZW5jZTogc3RyaW5nLCBwYXRoOiA/TnVjbGlkZVVyaSk6ID9zdHJpbmcge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmVhZGluZyBTdGF0dXMgKHBhcml0eSB3aXRoIEdpdFJlcG9zaXRvcnkpXG4gICAqXG4gICAqL1xuXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIENhbiB3ZSBjaGFuZ2UgdGhlIEFQSSB0byBtYWtlIHRoaXMgbWV0aG9kIHJldHVybiBhIFByb21pc2U/XG4gIC8vIElmIG5vdCwgbWlnaHQgbmVlZCB0byBkbyBhIHN5bmNocm9ub3VzIGBoZyBzdGF0dXNgIHF1ZXJ5LlxuICBpc1BhdGhNb2RpZmllZChmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZFBhdGhTdGF0dXMgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoIWNhY2hlZFBhdGhTdGF0dXMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaXNTdGF0dXNNb2RpZmllZChTdGF0dXNDb2RlSWRUb051bWJlcltjYWNoZWRQYXRoU3RhdHVzXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgQ2FuIHdlIGNoYW5nZSB0aGUgQVBJIHRvIG1ha2UgdGhpcyBtZXRob2QgcmV0dXJuIGEgUHJvbWlzZT9cbiAgLy8gSWYgbm90LCBtaWdodCBuZWVkIHRvIGRvIGEgc3luY2hyb25vdXMgYGhnIHN0YXR1c2AgcXVlcnkuXG4gIGlzUGF0aE5ldyhmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZFBhdGhTdGF0dXMgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoIWNhY2hlZFBhdGhTdGF0dXMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaXNTdGF0dXNOZXcoU3RhdHVzQ29kZUlkVG9OdW1iZXJbY2FjaGVkUGF0aFN0YXR1c10pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIENhbiB3ZSBjaGFuZ2UgdGhlIEFQSSB0byBtYWtlIHRoaXMgbWV0aG9kIHJldHVybiBhIFByb21pc2U/XG4gIC8vIElmIG5vdCwgdGhpcyBtZXRob2QgbGllcyBhIGJpdCBieSB1c2luZyBjYWNoZWQgaW5mb3JtYXRpb24uXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIE1ha2UgdGhpcyB3b3JrIGZvciBpZ25vcmVkIGRpcmVjdG9yaWVzLlxuICBpc1BhdGhJZ25vcmVkKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gYGhnIHN0YXR1cyAtaWAgZG9lcyBub3QgbGlzdCB0aGUgcmVwbyAodGhlIC5oZyBkaXJlY3RvcnkpLCBwcmVzdW1hYmx5XG4gICAgLy8gYmVjYXVzZSB0aGUgcmVwbyBkb2VzIG5vdCB0cmFjayBpdHNlbGYuXG4gICAgLy8gV2Ugd2FudCB0byByZXByZXNlbnQgdGhlIGZhY3QgdGhhdCBpdCdzIG5vdCBwYXJ0IG9mIHRoZSB0cmFja2VkIGNvbnRlbnRzLFxuICAgIC8vIHNvIHdlIG1hbnVhbGx5IGFkZCBhbiBleGNlcHRpb24gZm9yIGl0IHZpYSB0aGUgX2lzUGF0aFdpdGhpbkhnUmVwbyBjaGVjay5cbiAgICByZXR1cm4gKHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdID09PSBTdGF0dXNDb2RlSWQuSUdOT1JFRCkgfHxcbiAgICAgICAgdGhpcy5faXNQYXRoV2l0aGluSGdSZXBvKGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGdpdmVuIHBhdGggaXMgd2l0aGluIHRoZSByZXBvIGRpcmVjdG9yeSAoaS5lLiBgLmhnL2ApLlxuICAgKi9cbiAgX2lzUGF0aFdpdGhpbkhnUmVwbyhmaWxlUGF0aDogTnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoZmlsZVBhdGggPT09IHRoaXMuZ2V0UGF0aCgpKSB8fCAoZmlsZVBhdGguaW5kZXhPZih0aGlzLmdldFBhdGgoKSArICcvJykgPT09IDApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIGEgcGF0aCBpcyByZWxldmFudCB0byB0aGlzIEhnUmVwb3NpdG9yeUNsaWVudC4gQSBwYXRoIGlzXG4gICAqIGRlZmluZWQgYXMgJ3JlbGV2YW50JyBpZiBpdCBpcyB3aXRoaW4gdGhlIHByb2plY3QgZGlyZWN0b3J5IG9wZW5lZCB3aXRoaW4gdGhlIHJlcG8uXG4gICAqL1xuICBfaXNQYXRoUmVsZXZhbnQoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvamVjdERpcmVjdG9yeS5jb250YWlucyhmaWxlUGF0aCkgfHxcbiAgICAgICAgICAgKHRoaXMuX3Byb2plY3REaXJlY3RvcnkuZ2V0UGF0aCgpID09PSBmaWxlUGF0aCk7XG4gIH1cblxuICAvLyBGb3Igbm93LCB0aGlzIG1ldGhvZCBvbmx5IHJlZmxlY3RzIHRoZSBzdGF0dXMgb2YgXCJtb2RpZmllZFwiIGRpcmVjdG9yaWVzLlxuICAvLyBUcmFja2luZyBkaXJlY3Rvcnkgc3RhdHVzIGlzbid0IHN0cmFpZ2h0Zm9yd2FyZCwgYXMgSGcgb25seSB0cmFja3MgZmlsZXMuXG4gIC8vIGh0dHA6Ly9tZXJjdXJpYWwuc2VsZW5pYy5jb20vd2lraS9GQVEjRkFRLjJGQ29tbW9uUHJvYmxlbXMuSV90cmllZF90b19jaGVja19pbl9hbl9lbXB0eV9kaXJlY3RvcnlfYW5kX2l0X2ZhaWxlZC4yMVxuICAvLyBUT0RPOiBNYWtlIHRoaXMgbWV0aG9kIHJlZmxlY3QgTmV3IGFuZCBJZ25vcmVkIHN0YXR1c2VzLlxuICBnZXREaXJlY3RvcnlTdGF0dXMoZGlyZWN0b3J5UGF0aDogP3N0cmluZyk6IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZSB7XG4gICAgaWYgKCFkaXJlY3RvcnlQYXRoKSB7XG4gICAgICByZXR1cm4gU3RhdHVzQ29kZU51bWJlci5DTEVBTjtcbiAgICB9XG4gICAgY29uc3QgZGlyZWN0b3J5UGF0aFdpdGhTZXBhcmF0b3IgPSBlbnN1cmVUcmFpbGluZ1NlcGFyYXRvcihkaXJlY3RvcnlQYXRoKTtcbiAgICBpZiAodGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZS5oYXMoZGlyZWN0b3J5UGF0aFdpdGhTZXBhcmF0b3IpKSB7XG4gICAgICByZXR1cm4gU3RhdHVzQ29kZU51bWJlci5NT0RJRklFRDtcbiAgICB9XG4gICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU47XG4gIH1cblxuICAvLyBXZSBkb24ndCB3YW50IHRvIGRvIGFueSBzeW5jaHJvbm91cyAnaGcgc3RhdHVzJyBjYWxscy4gSnVzdCB1c2UgY2FjaGVkIHZhbHVlcy5cbiAgZ2V0UGF0aFN0YXR1cyhmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2FjaGVkUGF0aFN0YXR1cyhmaWxlUGF0aCk7XG4gIH1cblxuICBnZXRDYWNoZWRQYXRoU3RhdHVzKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZSB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU47XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZFN0YXR1cyA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmIChjYWNoZWRTdGF0dXMpIHtcbiAgICAgIHJldHVybiBTdGF0dXNDb2RlSWRUb051bWJlcltjYWNoZWRTdGF0dXNdO1xuICAgIH1cbiAgICByZXR1cm4gU3RhdHVzQ29kZU51bWJlci5DTEVBTjtcbiAgfVxuXG4gIGdldEFsbFBhdGhTdGF0dXNlcygpOiB7W2ZpbGVQYXRoOiBOdWNsaWRlVXJpXTogU3RhdHVzQ29kZU51bWJlclZhbHVlfSB7XG4gICAgY29uc3QgcGF0aFN0YXR1c2VzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIGluIHRoaXMuX2hnU3RhdHVzQ2FjaGUpIHtcbiAgICAgIHBhdGhTdGF0dXNlc1tmaWxlUGF0aF0gPSBTdGF0dXNDb2RlSWRUb051bWJlclt0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXV07XG4gICAgfVxuICAgIHJldHVybiBwYXRoU3RhdHVzZXM7XG4gIH1cblxuICBpc1N0YXR1c01vZGlmaWVkKHN0YXR1czogP251bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQgfHxcbiAgICAgIHN0YXR1cyA9PT0gU3RhdHVzQ29kZU51bWJlci5NSVNTSU5HIHx8XG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuUkVNT1ZFRFxuICAgICk7XG4gIH1cblxuICBpc1N0YXR1c05ldyhzdGF0dXM6ID9udW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLkFEREVEIHx8XG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuVU5UUkFDS0VEXG4gICAgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJlYWRpbmcgSGcgU3RhdHVzIChhc3luYyBtZXRob2RzKVxuICAgKlxuICAgKi9cblxuICAvKipcbiAgICogUmVjb21tZW5kZWQgbWV0aG9kIHRvIHVzZSB0byBnZXQgdGhlIHN0YXR1cyBvZiBmaWxlcyBpbiB0aGlzIHJlcG8uXG4gICAqIEBwYXJhbSBwYXRocyBBbiBhcnJheSBvZiBmaWxlIHBhdGhzIHRvIGdldCB0aGUgc3RhdHVzIGZvci4gSWYgYSBwYXRoIGlzIG5vdCBpbiB0aGVcbiAgICogICBwcm9qZWN0LCBpdCB3aWxsIGJlIGlnbm9yZWQuXG4gICAqIFNlZSBIZ1NlcnZpY2U6OmdldFN0YXR1c2VzIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgYXN5bmMgZ2V0U3RhdHVzZXMoXG4gICAgcGF0aHM6IEFycmF5PHN0cmluZz4sXG4gICAgb3B0aW9ucz86IEhnU3RhdHVzQ29tbWFuZE9wdGlvbnMsXG4gICk6IFByb21pc2U8TWFwPE51Y2xpZGVVcmksIFN0YXR1c0NvZGVOdW1iZXJWYWx1ZT4+IHtcbiAgICBjb25zdCBzdGF0dXNNYXAgPSBuZXcgTWFwKCk7XG4gICAgY29uc3QgaXNSZWxhdmFudFN0YXR1cyA9IHRoaXMuX2dldFByZWRpY2F0ZUZvclJlbGV2YW50U3RhdHVzZXMob3B0aW9ucyk7XG5cbiAgICAvLyBDaGVjayB0aGUgY2FjaGUuXG4gICAgLy8gTm90ZTogSWYgcGF0aHMgaXMgZW1wdHksIGEgZnVsbCBgaGcgc3RhdHVzYCB3aWxsIGJlIHJ1biwgd2hpY2ggZm9sbG93cyB0aGUgc3BlYy5cbiAgICBjb25zdCBwYXRoc1dpdGhDYWNoZU1pc3MgPSBbXTtcbiAgICBwYXRocy5mb3JFYWNoKGZpbGVQYXRoID0+IHtcbiAgICAgIGNvbnN0IHN0YXR1c0lkID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICBpZiAoc3RhdHVzSWQpIHtcbiAgICAgICAgaWYgKCFpc1JlbGF2YW50U3RhdHVzKHN0YXR1c0lkKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzdGF0dXNNYXAuc2V0KGZpbGVQYXRoLCBTdGF0dXNDb2RlSWRUb051bWJlcltzdGF0dXNJZF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGF0aHNXaXRoQ2FjaGVNaXNzLnB1c2goZmlsZVBhdGgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gRmV0Y2ggYW55IHVuY2FjaGVkIHN0YXR1c2VzLlxuICAgIGlmIChwYXRoc1dpdGhDYWNoZU1pc3MubGVuZ3RoKSB7XG4gICAgICBjb25zdCBuZXdTdGF0dXNJbmZvID0gYXdhaXQgdGhpcy5fdXBkYXRlU3RhdHVzZXMocGF0aHNXaXRoQ2FjaGVNaXNzLCBvcHRpb25zKTtcbiAgICAgIG5ld1N0YXR1c0luZm8uZm9yRWFjaCgoc3RhdHVzLCBmaWxlUGF0aCkgPT4ge1xuICAgICAgICBzdGF0dXNNYXAuc2V0KGZpbGVQYXRoLCBTdGF0dXNDb2RlSWRUb051bWJlcltzdGF0dXNdKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdHVzTWFwO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIHN0YXR1c2VzIGZvciB0aGUgZ2l2ZW4gZmlsZSBwYXRocywgYW5kIHVwZGF0ZXMgdGhlIGNhY2hlIGFuZFxuICAgKiBzZW5kcyBvdXQgY2hhbmdlIGV2ZW50cyBhcyBhcHByb3ByaWF0ZS5cbiAgICogQHBhcmFtIGZpbGVQYXRocyBBbiBhcnJheSBvZiBmaWxlIHBhdGhzIHRvIHVwZGF0ZSB0aGUgc3RhdHVzIGZvci4gSWYgYSBwYXRoXG4gICAqICAgaXMgbm90IGluIHRoZSBwcm9qZWN0LCBpdCB3aWxsIGJlIGlnbm9yZWQuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlU3RhdHVzZXMoXG4gICAgZmlsZVBhdGhzOiBBcnJheTxzdHJpbmc+LFxuICAgIG9wdGlvbnM6ID9IZ1N0YXR1c0NvbW1hbmRPcHRpb25zLFxuICApOiBQcm9taXNlPE1hcDxOdWNsaWRlVXJpLCBTdGF0dXNDb2RlSWRWYWx1ZT4+IHtcbiAgICBjb25zdCBwYXRoc0luUmVwbyA9IGZpbGVQYXRocy5maWx0ZXIoZmlsZVBhdGggPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuX2lzUGF0aFJlbGV2YW50KGZpbGVQYXRoKTtcbiAgICB9KTtcbiAgICBpZiAocGF0aHNJblJlcG8ubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXR1c01hcFBhdGhUb1N0YXR1c0lkID0gYXdhaXQgdGhpcy5fc2VydmljZS5mZXRjaFN0YXR1c2VzKHBhdGhzSW5SZXBvLCBvcHRpb25zKTtcblxuICAgIGNvbnN0IHF1ZXJpZWRGaWxlcyA9IG5ldyBTZXQocGF0aHNJblJlcG8pO1xuICAgIGNvbnN0IHN0YXR1c0NoYW5nZUV2ZW50cyA9IFtdO1xuICAgIHN0YXR1c01hcFBhdGhUb1N0YXR1c0lkLmZvckVhY2goKG5ld1N0YXR1c0lkLCBmaWxlUGF0aCkgPT4ge1xuXG4gICAgICBjb25zdCBvbGRTdGF0dXMgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgIGlmIChvbGRTdGF0dXMgJiYgKG9sZFN0YXR1cyAhPT0gbmV3U3RhdHVzSWQpIHx8XG4gICAgICAgICAgIW9sZFN0YXR1cyAmJiAobmV3U3RhdHVzSWQgIT09IFN0YXR1c0NvZGVJZC5DTEVBTikpIHtcbiAgICAgICAgc3RhdHVzQ2hhbmdlRXZlbnRzLnB1c2goe1xuICAgICAgICAgIHBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgIHBhdGhTdGF0dXM6IFN0YXR1c0NvZGVJZFRvTnVtYmVyW25ld1N0YXR1c0lkXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChuZXdTdGF0dXNJZCA9PT0gU3RhdHVzQ29kZUlkLkNMRUFOKSB7XG4gICAgICAgICAgLy8gRG9uJ3QgYm90aGVyIGtlZXBpbmcgJ2NsZWFuJyBmaWxlcyBpbiB0aGUgY2FjaGUuXG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICAgIHRoaXMuX3JlbW92ZUFsbFBhcmVudERpcmVjdG9yaWVzRnJvbUNhY2hlKGZpbGVQYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXSA9IG5ld1N0YXR1c0lkO1xuICAgICAgICAgIGlmIChuZXdTdGF0dXNJZCA9PT0gU3RhdHVzQ29kZUlkLk1PRElGSUVEKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRBbGxQYXJlbnREaXJlY3Rvcmllc1RvQ2FjaGUoZmlsZVBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcXVlcmllZEZpbGVzLmRlbGV0ZShmaWxlUGF0aCk7XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgc3RhdHVzZXMgd2VyZSBmZXRjaGVkIGZvciBvbmx5IGNoYW5nZWQgKGBoZyBzdGF0dXNgKSBvclxuICAgIC8vIGlnbm9yZWQgKCdoZyBzdGF0dXMgLS1pZ25vcmVkYCkgZmlsZXMsIGEgcXVlcmllZCBmaWxlIG1heSBub3QgYmVcbiAgICAvLyByZXR1cm5lZCBpbiB0aGUgcmVzcG9uc2UuIElmIGl0IHdhc24ndCByZXR1cm5lZCwgdGhpcyBtZWFucyBpdHMgc3RhdHVzXG4gICAgLy8gbWF5IGhhdmUgY2hhbmdlZCwgaW4gd2hpY2ggY2FzZSBpdCBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIHRoZSBoZ1N0YXR1c0NhY2hlLlxuICAgIC8vIE5vdGU6IHdlIGRvbid0IGtub3cgdGhlIHJlYWwgdXBkYXRlZCBzdGF0dXMgb2YgdGhlIGZpbGUsIHNvIGRvbid0IHNlbmQgYSBjaGFuZ2UgZXZlbnQuXG4gICAgLy8gVE9ETyAoamVzc2ljYWxpbikgQ2FuIHdlIG1ha2UgdGhlICdwYXRoU3RhdHVzJyBmaWVsZCBpbiB0aGUgY2hhbmdlIGV2ZW50IG9wdGlvbmFsP1xuICAgIC8vIFRoZW4gd2UgY2FuIHNlbmQgdGhlc2UgZXZlbnRzLlxuICAgIGNvbnN0IGhnU3RhdHVzT3B0aW9uID0gdGhpcy5fZ2V0U3RhdHVzT3B0aW9uKG9wdGlvbnMpO1xuICAgIGlmIChoZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uT05MWV9JR05PUkVEKSB7XG4gICAgICBxdWVyaWVkRmlsZXMuZm9yRWFjaChmaWxlUGF0aCA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXSA9PT0gU3RhdHVzQ29kZUlkLklHTk9SRUQpIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLkFMTF9TVEFUVVNFUykge1xuICAgICAgLy8gSWYgSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTIHdhcyBwYXNzZWQgYW5kIGEgZmlsZSBkb2VzIG5vdCBhcHBlYXIgaW5cbiAgICAgIC8vIHRoZSByZXN1bHRzLCBpdCBtdXN0IG1lYW4gdGhlIGZpbGUgd2FzIHJlbW92ZWQgZnJvbSB0aGUgZmlsZXN5c3RlbS5cbiAgICAgIHF1ZXJpZWRGaWxlcy5mb3JFYWNoKGZpbGVQYXRoID0+IHtcbiAgICAgICAgY29uc3QgY2FjaGVkU3RhdHVzSWQgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICBpZiAoY2FjaGVkU3RhdHVzSWQgPT09IFN0YXR1c0NvZGVJZC5NT0RJRklFRCkge1xuICAgICAgICAgIHRoaXMuX3JlbW92ZUFsbFBhcmVudERpcmVjdG9yaWVzRnJvbUNhY2hlKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHF1ZXJpZWRGaWxlcy5mb3JFYWNoKGZpbGVQYXRoID0+IHtcbiAgICAgICAgY29uc3QgY2FjaGVkU3RhdHVzSWQgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgICAgaWYgKGNhY2hlZFN0YXR1c0lkICE9PSBTdGF0dXNDb2RlSWQuSUdOT1JFRCkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgICAgICBpZiAoY2FjaGVkU3RhdHVzSWQgPT09IFN0YXR1c0NvZGVJZC5NT0RJRklFRCkge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoZmlsZVBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRW1pdCBjaGFuZ2UgZXZlbnRzIG9ubHkgYWZ0ZXIgdGhlIGNhY2hlIGhhcyBiZWVuIGZ1bGx5IHVwZGF0ZWQuXG4gICAgc3RhdHVzQ2hhbmdlRXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXN0YXR1cycsIGV2ZW50KTtcbiAgICB9KTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnKTtcblxuICAgIHJldHVybiBzdGF0dXNNYXBQYXRoVG9TdGF0dXNJZDtcbiAgfVxuXG4gIF9hZGRBbGxQYXJlbnREaXJlY3Rvcmllc1RvQ2FjaGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpIHtcbiAgICBhZGRBbGxQYXJlbnREaXJlY3Rvcmllc1RvQ2FjaGUoXG4gICAgICB0aGlzLl9tb2RpZmllZERpcmVjdG9yeUNhY2hlLFxuICAgICAgZmlsZVBhdGgsXG4gICAgICB0aGlzLl9wcm9qZWN0RGlyZWN0b3J5LmdldFBhcmVudCgpLmdldFBhdGgoKVxuICAgICk7XG4gIH1cblxuICBfcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpIHtcbiAgICByZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZShcbiAgICAgIHRoaXMuX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGUsXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIHRoaXMuX3Byb2plY3REaXJlY3RvcnkuZ2V0UGFyZW50KCkuZ2V0UGF0aCgpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gZm9yIDo6Z2V0U3RhdHVzZXMuXG4gICAqIFJldHVybnMgYSBmaWx0ZXIgZm9yIHdoZXRoZXIgb3Igbm90IHRoZSBnaXZlbiBzdGF0dXMgY29kZSBzaG91bGQgYmVcbiAgICogcmV0dXJuZWQsIGdpdmVuIHRoZSBwYXNzZWQtaW4gb3B0aW9ucyBmb3IgOjpnZXRTdGF0dXNlcy5cbiAgICovXG4gIF9nZXRQcmVkaWNhdGVGb3JSZWxldmFudFN0YXR1c2VzKFxuICAgIG9wdGlvbnM6ID9IZ1N0YXR1c0NvbW1hbmRPcHRpb25zXG4gICk6IChjb2RlOiBTdGF0dXNDb2RlSWRWYWx1ZSkgPT4gYm9vbGVhbiB7XG4gICAgY29uc3QgaGdTdGF0dXNPcHRpb24gPSB0aGlzLl9nZXRTdGF0dXNPcHRpb24ob3B0aW9ucyk7XG5cbiAgICBpZiAoaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLk9OTFlfSUdOT1JFRCkge1xuICAgICAgcmV0dXJuIGZpbHRlckZvck9ubHlJZ25vcmVkO1xuICAgIH0gZWxzZSBpZiAoaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLkFMTF9TVEFUVVNFUykge1xuICAgICAgcmV0dXJuIGZpbHRlckZvckFsbFN0YXR1ZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmaWx0ZXJGb3JPbmx5Tm90SWdub3JlZDtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZXRyaWV2aW5nIERpZmZzIChwYXJpdHkgd2l0aCBHaXRSZXBvc2l0b3J5KVxuICAgKlxuICAgKi9cblxuICBnZXREaWZmU3RhdHMoZmlsZVBhdGg6ID9OdWNsaWRlVXJpKToge2FkZGVkOiBudW1iZXI7IGRlbGV0ZWQ6IG51bWJlcjt9IHtcbiAgICBjb25zdCBjbGVhblN0YXRzID0ge2FkZGVkOiAwLCBkZWxldGVkOiAwfTtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gY2xlYW5TdGF0cztcbiAgICB9XG4gICAgY29uc3QgY2FjaGVkRGF0YSA9IHRoaXMuX2hnRGlmZkNhY2hlW2ZpbGVQYXRoXTtcbiAgICByZXR1cm4gY2FjaGVkRGF0YSA/IHthZGRlZDogY2FjaGVkRGF0YS5hZGRlZCwgZGVsZXRlZDogY2FjaGVkRGF0YS5kZWxldGVkfSA6XG4gICAgICAgIGNsZWFuU3RhdHM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBMaW5lRGlmZiB0aGF0IGRlc2NyaWJlcyB0aGUgZGlmZnMgYmV0d2VlbiB0aGUgZ2l2ZW5cbiAgICogZmlsZSdzIGBIRUFEYCBjb250ZW50cyBhbmQgaXRzIGN1cnJlbnQgY29udGVudHMuXG4gICAqIE5PVEU6IHRoaXMgbWV0aG9kIGN1cnJlbnRseSBpZ25vcmVzIHRoZSBwYXNzZWQtaW4gdGV4dCwgYW5kIGluc3RlYWQgZGlmZnNcbiAgICogYWdhaW5zdCB0aGUgY3VycmVudGx5IHNhdmVkIGNvbnRlbnRzIG9mIHRoZSBmaWxlLlxuICAgKi9cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgRXhwb3J0IHRoZSBMaW5lRGlmZiB0eXBlIChmcm9tIGhnLW91dHB1dC1oZWxwZXJzKSB3aGVuXG4gIC8vIHR5cGVzIGNhbiBiZSBleHBvcnRlZC5cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgTWFrZSB0aGlzIG1ldGhvZCB3b3JrIHdpdGggdGhlIHBhc3NlZC1pbiBgdGV4dGAuIHQ2MzkxNTc5XG4gIGdldExpbmVEaWZmcyhmaWxlUGF0aDogP051Y2xpZGVVcmksIHRleHQ6ID9zdHJpbmcpOiBBcnJheTxMaW5lRGlmZj4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgZGlmZkluZm8gPSB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF07XG4gICAgcmV0dXJuIGRpZmZJbmZvID8gZGlmZkluZm8ubGluZURpZmZzIDogW107XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZXRyaWV2aW5nIERpZmZzIChhc3luYyBtZXRob2RzKVxuICAgKlxuICAgKi9cblxuICAvKipcbiAgICogUmVjb21tZW5kZWQgbWV0aG9kIHRvIHVzZSB0byBnZXQgdGhlIGRpZmYgc3RhdHMgb2YgZmlsZXMgaW4gdGhpcyByZXBvLlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgZmlsZSBwYXRoIHRvIGdldCB0aGUgc3RhdHVzIGZvci4gSWYgYSBwYXRoIGlzIG5vdCBpbiB0aGVcbiAgICogICBwcm9qZWN0LCBkZWZhdWx0IFwiY2xlYW5cIiBzdGF0cyB3aWxsIGJlIHJldHVybmVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0RGlmZlN0YXRzRm9yUGF0aChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8e2FkZGVkOiBudW1iZXI7IGRlbGV0ZWQ6IG51bWJlcjt9PiB7XG4gICAgY29uc3QgY2xlYW5TdGF0cyA9IHthZGRlZDogMCwgZGVsZXRlZDogMH07XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGNsZWFuU3RhdHM7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIGNhY2hlLlxuICAgIGNvbnN0IGNhY2hlZERpZmZJbmZvID0gdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmIChjYWNoZWREaWZmSW5mbykge1xuICAgICAgcmV0dXJuIHthZGRlZDogY2FjaGVkRGlmZkluZm8uYWRkZWQsIGRlbGV0ZWQ6IGNhY2hlZERpZmZJbmZvLmRlbGV0ZWR9O1xuICAgIH1cblxuICAgIC8vIEZhbGwgYmFjayB0byBhIGZldGNoLlxuICAgIGNvbnN0IGZldGNoZWRQYXRoVG9EaWZmSW5mbyA9IGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZJbmZvKFtmaWxlUGF0aF0pO1xuICAgIGlmIChmZXRjaGVkUGF0aFRvRGlmZkluZm8pIHtcbiAgICAgIGNvbnN0IGRpZmZJbmZvID0gZmV0Y2hlZFBhdGhUb0RpZmZJbmZvLmdldChmaWxlUGF0aCk7XG4gICAgICBpZiAoZGlmZkluZm8gIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge2FkZGVkOiBkaWZmSW5mby5hZGRlZCwgZGVsZXRlZDogZGlmZkluZm8uZGVsZXRlZH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsZWFuU3RhdHM7XG4gIH1cblxuICAvKipcbiAgICogUmVjb21tZW5kZWQgbWV0aG9kIHRvIHVzZSB0byBnZXQgdGhlIGxpbmUgZGlmZnMgb2YgZmlsZXMgaW4gdGhpcyByZXBvLlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgYWJzb2x1dGUgZmlsZSBwYXRoIHRvIGdldCB0aGUgbGluZSBkaWZmcyBmb3IuIElmIHRoZSBwYXRoIFxcXG4gICAqICAgaXMgbm90IGluIHRoZSBwcm9qZWN0LCBhbiBlbXB0eSBBcnJheSB3aWxsIGJlIHJldHVybmVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0TGluZURpZmZzRm9yUGF0aChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8QXJyYXk8TGluZURpZmY+PiB7XG4gICAgY29uc3QgbGluZURpZmZzID0gW107XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGxpbmVEaWZmcztcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgY2FjaGUuXG4gICAgY29uc3QgY2FjaGVkRGlmZkluZm8gPSB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF07XG4gICAgaWYgKGNhY2hlZERpZmZJbmZvKSB7XG4gICAgICByZXR1cm4gY2FjaGVkRGlmZkluZm8ubGluZURpZmZzO1xuICAgIH1cblxuICAgIC8vIEZhbGwgYmFjayB0byBhIGZldGNoLlxuICAgIGNvbnN0IGZldGNoZWRQYXRoVG9EaWZmSW5mbyA9IGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZJbmZvKFtmaWxlUGF0aF0pO1xuICAgIGlmIChmZXRjaGVkUGF0aFRvRGlmZkluZm8gIT0gbnVsbCkge1xuICAgICAgY29uc3QgZGlmZkluZm8gPSBmZXRjaGVkUGF0aFRvRGlmZkluZm8uZ2V0KGZpbGVQYXRoKTtcbiAgICAgIGlmIChkaWZmSW5mbyAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBkaWZmSW5mby5saW5lRGlmZnM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVEaWZmcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBkaWZmIGluZm9ybWF0aW9uIGZvciB0aGUgZ2l2ZW4gcGF0aHMsIGFuZCB1cGRhdGVzIHRoZSBjYWNoZS5cbiAgICogQHBhcmFtIEFuIGFycmF5IG9mIGFic29sdXRlIGZpbGUgcGF0aHMgZm9yIHdoaWNoIHRvIHVwZGF0ZSB0aGUgZGlmZiBpbmZvLlxuICAgKiBAcmV0dXJuIEEgbWFwIG9mIGVhY2ggcGF0aCB0byBpdHMgRGlmZkluZm8uXG4gICAqICAgVGhpcyBtZXRob2QgbWF5IHJldHVybiBgbnVsbGAgaWYgdGhlIGNhbGwgdG8gYGhnIGRpZmZgIGZhaWxzLlxuICAgKiAgIEEgZmlsZSBwYXRoIHdpbGwgbm90IGFwcGVhciBpbiB0aGUgcmV0dXJuZWQgTWFwIGlmIGl0IGlzIG5vdCBpbiB0aGUgcmVwbyxcbiAgICogICBpZiBpdCBoYXMgbm8gY2hhbmdlcywgb3IgaWYgdGhlcmUgaXMgYSBwZW5kaW5nIGBoZyBkaWZmYCBjYWxsIGZvciBpdCBhbHJlYWR5LlxuICAgKi9cbiAgYXN5bmMgX3VwZGF0ZURpZmZJbmZvKGZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4pOiBQcm9taXNlPD9NYXA8TnVjbGlkZVVyaSwgRGlmZkluZm8+PiB7XG4gICAgY29uc3QgcGF0aHNUb0ZldGNoID0gZmlsZVBhdGhzLmZpbHRlcihhUGF0aCA9PiB7XG4gICAgICAvLyBEb24ndCB0cnkgdG8gZmV0Y2ggaW5mb3JtYXRpb24gZm9yIHRoaXMgcGF0aCBpZiBpdCdzIG5vdCBpbiB0aGUgcmVwby5cbiAgICAgIGlmICghdGhpcy5faXNQYXRoUmVsZXZhbnQoYVBhdGgpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIERvbid0IGRvIGFub3RoZXIgdXBkYXRlIGZvciB0aGlzIHBhdGggaWYgd2UgYXJlIGluIHRoZSBtaWRkbGUgb2YgcnVubmluZyBhbiB1cGRhdGUuXG4gICAgICBpZiAodGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nLmhhcyhhUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nLmFkZChhUGF0aCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHBhdGhzVG9GZXRjaC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgLy8gQ2FsbCB0aGUgSGdTZXJ2aWNlIGFuZCB1cGRhdGUgb3VyIGNhY2hlIHdpdGggdGhlIHJlc3VsdHMuXG4gICAgY29uc3QgcGF0aHNUb0RpZmZJbmZvID0gYXdhaXQgdGhpcy5fc2VydmljZS5mZXRjaERpZmZJbmZvKHBhdGhzVG9GZXRjaCk7XG4gICAgaWYgKHBhdGhzVG9EaWZmSW5mbykge1xuICAgICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIGRpZmZJbmZvXSBvZiBwYXRoc1RvRGlmZkluZm8pIHtcbiAgICAgICAgdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdID0gZGlmZkluZm87XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGZpbGVzIG1hcmtlZCBmb3IgZGVsZXRpb24uXG4gICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXIuZm9yRWFjaChmaWxlVG9DbGVhciA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVRvQ2xlYXJdO1xuICAgIH0pO1xuICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNUb0NsZWFyLmNsZWFyKCk7XG5cbiAgICAvLyBUaGUgZmV0Y2hlZCBmaWxlcyBjYW4gbm93IGJlIHVwZGF0ZWQgYWdhaW4uXG4gICAgZm9yIChjb25zdCBwYXRoVG9GZXRjaCBvZiBwYXRoc1RvRmV0Y2gpIHtcbiAgICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNVcGRhdGluZy5kZWxldGUocGF0aFRvRmV0Y2gpO1xuICAgIH1cblxuICAgIC8vIFRPRE8gKHQ5MTEzOTEzKSBJZGVhbGx5LCB3ZSBjb3VsZCBzZW5kIG1vcmUgdGFyZ2V0ZWQgZXZlbnRzIHRoYXQgYmV0dGVyXG4gICAgLy8gZGVzY3JpYmUgd2hhdCBjaGFuZ2UgaGFzIG9jY3VycmVkLiBSaWdodCBub3csIEdpdFJlcG9zaXRvcnkgZGljdGF0ZXMgZWl0aGVyXG4gICAgLy8gJ2RpZC1jaGFuZ2Utc3RhdHVzJyBvciAnZGlkLWNoYW5nZS1zdGF0dXNlcycuXG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXN0YXR1c2VzJyk7XG4gICAgcmV0dXJuIHBhdGhzVG9EaWZmSW5mbztcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJldHJpZXZpbmcgQm9va21hcmsgKGFzeW5jIG1ldGhvZHMpXG4gICAqXG4gICAqL1xuICBhc3luYyBmZXRjaEN1cnJlbnRCb29rbWFyaygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCBuZXdseUZldGNoZWRCb29rbWFyayA9ICcnO1xuICAgIHRyeSB7XG4gICAgICBuZXdseUZldGNoZWRCb29rbWFyayA9IGF3YWl0IHRoaXMuX3NlcnZpY2UuZmV0Y2hDdXJyZW50Qm9va21hcmsoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBTdXBwcmVzcyB0aGUgZXJyb3IuIFRoZXJlIGFyZSBsZWdpdGltYXRlIHRpbWVzIHdoZW4gdGhlcmUgbWF5IGJlIG5vXG4gICAgICAvLyBjdXJyZW50IGJvb2ttYXJrLCBzdWNoIGFzIGR1cmluZyBhIHJlYmFzZS4gSW4gdGhpcyBjYXNlLCB3ZSBqdXN0IHdhbnRcbiAgICAgIC8vIHRvIHJldHVybiBhbiBlbXB0eSBzdHJpbmcgaWYgdGhlcmUgaXMgbm8gY3VycmVudCBib29rbWFyay5cbiAgICB9XG4gICAgaWYgKG5ld2x5RmV0Y2hlZEJvb2ttYXJrICE9PSB0aGlzLl9jdXJyZW50Qm9va21hcmspIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRCb29rbWFyayA9IG5ld2x5RmV0Y2hlZEJvb2ttYXJrO1xuICAgICAgLy8gVGhlIEF0b20gc3RhdHVzLWJhciB1c2VzIHRoaXMgYXMgYSBzaWduYWwgdG8gcmVmcmVzaCB0aGUgJ3Nob3J0SGVhZCcuXG4gICAgICAvLyBUaGVyZSBpcyBjdXJyZW50bHkgbm8gZGVkaWNhdGVkICdzaG9ydEhlYWREaWRDaGFuZ2UnIGV2ZW50LlxuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXN0YXR1c2VzJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jdXJyZW50Qm9va21hcmsgfHwgJyc7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBDaGVja2luZyBPdXRcbiAgICpcbiAgICovXG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgY2hlY2tvdXRIZWFkKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGNoZWNrb3V0UmVmZXJlbmNlKHJlZmVyZW5jZTogc3RyaW5nLCBjcmVhdGU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyB0aGUgYXN5bmMgdmVyc2lvbiBvZiB3aGF0IGNoZWNrb3V0UmVmZXJlbmNlKCkgaXMgbWVhbnQgdG8gZG8uXG4gICAqL1xuICBhc3luYyBjaGVja291dFJldmlzaW9uKHJlZmVyZW5jZTogc3RyaW5nLCBjcmVhdGU6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBhd2FpdCB0aGlzLl9zZXJ2aWNlLmNoZWNrb3V0KHJlZmVyZW5jZSwgY3JlYXRlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IEhnU2VydmljZSBzdWJzY3JpcHRpb25zXG4gICAqXG4gICAqL1xuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBjYWNoZSBpbiByZXNwb25zZSB0byBhbnkgbnVtYmVyIG9mIChub24tLmhnaWdub3JlKSBmaWxlcyBjaGFuZ2luZy5cbiAgICogQHBhcmFtIHVwZGF0ZSBUaGUgY2hhbmdlZCBmaWxlIHBhdGhzLlxuICAgKi9cbiAgYXN5bmMgX3VwZGF0ZUNoYW5nZWRQYXRocyhjaGFuZ2VkUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVsZXZhbnRDaGFuZ2VkUGF0aHMgPSBjaGFuZ2VkUGF0aHMuZmlsdGVyKHRoaXMuX2lzUGF0aFJlbGV2YW50LmJpbmQodGhpcykpO1xuICAgIGlmIChyZWxldmFudENoYW5nZWRQYXRocy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKHJlbGV2YW50Q2hhbmdlZFBhdGhzLmxlbmd0aCA8PSBNQVhfSU5ESVZJRFVBTF9DSEFOR0VEX1BBVEhTKSB7XG4gICAgICAvLyBVcGRhdGUgdGhlIHN0YXR1c2VzIGluZGl2aWR1YWxseS5cbiAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZVN0YXR1c2VzKFxuICAgICAgICByZWxldmFudENoYW5nZWRQYXRocyxcbiAgICAgICAge2hnU3RhdHVzT3B0aW9uOiBIZ1N0YXR1c09wdGlvbi5BTExfU1RBVFVTRVN9LFxuICAgICAgKTtcbiAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZJbmZvKFxuICAgICAgICByZWxldmFudENoYW5nZWRQYXRocy5maWx0ZXIoZmlsZVBhdGggPT4gdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdKSxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoaXMgaXMgYSBoZXVyaXN0aWMgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZS4gTWFueSBmaWxlcyBiZWluZyBjaGFuZ2VkIG1heVxuICAgICAgLy8gYmUgYSBzaWduIHRoYXQgd2UgYXJlIHBpY2tpbmcgdXAgY2hhbmdlcyB0aGF0IHdlcmUgY3JlYXRlZCBpbiBhbiBhdXRvbWF0ZWRcbiAgICAgIC8vIHdheSAtLSBzbyBpbiBhZGRpdGlvbiwgdGhlcmUgbWF5IGJlIG1hbnkgYmF0Y2hlcyBvZiBjaGFuZ2VzIGluIHN1Y2Nlc3Npb24uXG4gICAgICAvLyBUaGUgcmVmcmVzaCBpcyBzZXJpYWxpemVkLCBzbyBpdCBpcyBzYWZlIHRvIGNhbGwgaXQgbXVsdGlwbGUgdGltZXMgaW4gc3VjY2Vzc2lvbi5cbiAgICAgIGF3YWl0IHRoaXMuX3NlcmlhbGl6ZWRSZWZyZXNoU3RhdHVzZXNDYWNoZSgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9yZWZyZXNoU3RhdHVzZXNPZkFsbEZpbGVzSW5DYWNoZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9oZ1N0YXR1c0NhY2hlID0ge307XG4gICAgdGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZSA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBwYXRoc0luRGlmZkNhY2hlID0gT2JqZWN0LmtleXModGhpcy5faGdEaWZmQ2FjaGUpO1xuICAgIHRoaXMuX2hnRGlmZkNhY2hlID0ge307XG4gICAgLy8gV2Ugc2hvdWxkIGdldCB0aGUgbW9kaWZpZWQgc3RhdHVzIG9mIGFsbCBmaWxlcyBpbiB0aGUgcmVwbyB0aGF0IGlzXG4gICAgLy8gdW5kZXIgdGhlIEhnUmVwb3NpdG9yeUNsaWVudCdzIHByb2plY3QgZGlyZWN0b3J5LCBiZWNhdXNlIHdoZW4gSGdcbiAgICAvLyBtb2RpZmllcyB0aGUgcmVwbywgaXQgZG9lc24ndCBuZWNlc3NhcmlseSBvbmx5IG1vZGlmeSBmaWxlcyB0aGF0IHdlcmVcbiAgICAvLyBwcmV2aW91c2x5IG1vZGlmaWVkLlxuICAgIGF3YWl0IHRoaXMuX3VwZGF0ZVN0YXR1c2VzKFxuICAgICAgW3RoaXMuZ2V0UHJvamVjdERpcmVjdG9yeSgpXSxcbiAgICAgIHtoZ1N0YXR1c09wdGlvbjogSGdTdGF0dXNPcHRpb24uT05MWV9OT05fSUdOT1JFRH0sXG4gICAgKTtcbiAgICBpZiAocGF0aHNJbkRpZmZDYWNoZS5sZW5ndGggPiAwKSB7XG4gICAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmSW5mbyhwYXRoc0luRGlmZkNhY2hlKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZXBvc2l0b3J5IFN0YXRlIGF0IFNwZWNpZmljIFJldmlzaW9uc1xuICAgKlxuICAgKi9cbiAgZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24oZmlsZVBhdGg6IE51Y2xpZGVVcmksIHJldmlzaW9uOiA/c3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24oZmlsZVBhdGgsIHJldmlzaW9uKTtcbiAgfVxuXG4gIGZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbihyZXZpc2lvbjogc3RyaW5nKTogUHJvbWlzZTw/UmV2aXNpb25GaWxlQ2hhbmdlcz4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbihyZXZpc2lvbik7XG4gIH1cblxuICBmZXRjaFJldmlzaW9uSW5mb0JldHdlZW5IZWFkQW5kQmFzZSgpOiBQcm9taXNlPD9BcnJheTxSZXZpc2lvbkluZm8+PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuSGVhZEFuZEJhc2UoKTtcbiAgfVxuXG4gIC8vIFNlZSBIZ1NlcnZpY2UuZ2V0QmxhbWVBdEhlYWQuXG4gIGdldEJsYW1lQXRIZWFkKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxNYXA8c3RyaW5nLCBzdHJpbmc+PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZ2V0QmxhbWVBdEhlYWQoZmlsZVBhdGgpO1xuICB9XG5cbiAgZ2V0Q29uZmlnVmFsdWVBc3luYyhrZXk6IHN0cmluZywgcGF0aDogP3N0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmdldENvbmZpZ1ZhbHVlQXN5bmMoa2V5KTtcbiAgfVxuXG4gIC8vIFNlZSBIZ1NlcnZpY2UuZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZC5cbiAgZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZChjaGFuZ2VTZXRJZDogc3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZChjaGFuZ2VTZXRJZCk7XG4gIH1cblxuICBnZXRTbWFydGxvZyh0dHlPdXRwdXQ6IGJvb2xlYW4sIGNvbmNpc2U6IGJvb2xlYW4pOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmdldFNtYXJ0bG9nKHR0eU91dHB1dCwgY29uY2lzZSk7XG4gIH1cblxuICByZW5hbWUob2xkRmlsZVBhdGg6IHN0cmluZywgbmV3RmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLnJlbmFtZShvbGRGaWxlUGF0aCwgbmV3RmlsZVBhdGgpO1xuICB9XG5cbiAgcmVtb3ZlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5yZW1vdmUoZmlsZVBhdGgpO1xuICB9XG5cbiAgYWRkKGZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5hZGQoZmlsZVBhdGhzKTtcbiAgfVxuXG4gIGNvbW1pdChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5jb21taXQobWVzc2FnZSk7XG4gIH1cblxuICBhbWVuZChtZXNzYWdlOiA/c3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuYW1lbmQobWVzc2FnZSk7XG4gIH1cblxuICByZXZlcnQoZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLnJldmVydChmaWxlUGF0aHMpO1xuICB9XG5cbiAgX2dldFN0YXR1c09wdGlvbihvcHRpb25zOiA/SGdTdGF0dXNDb21tYW5kT3B0aW9ucyk6ID9IZ1N0YXR1c09wdGlvblZhbHVlIHtcbiAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnMuaGdTdGF0dXNPcHRpb247XG4gIH1cbn1cbiJdfQ==