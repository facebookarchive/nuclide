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

var _hgRepositoryBaseLibHgConstants = require('../../hg-repository-base/lib/hg-constants');

var _commons = require('../../commons');

var _commonsLibPaths = require('../../commons/lib/paths');

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

var serializeAsyncCall = _commons.promises.serializeAsyncCall;

/**
 *
 * Section: Constants, Type Definitions
 *
 */

var EDITOR_SUBSCRIPTION_NAME = 'hg-repository-editor-subscription';
var MAX_INDIVIDUAL_CHANGED_PATHS = 1;

exports.MAX_INDIVIDUAL_CHANGED_PATHS = MAX_INDIVIDUAL_CHANGED_PATHS;
function filterForOnlyNotIgnored(code) {
  return code !== _hgRepositoryBaseLibHgConstants.StatusCodeId.IGNORED;
}

function filterForOnlyIgnored(code) {
  return code === _hgRepositoryBaseLibHgConstants.StatusCodeId.IGNORED;
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
        return this.isStatusModified(_hgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[cachedPathStatus]);
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
        return this.isStatusNew(_hgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[cachedPathStatus]);
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
      return this._hgStatusCache[filePath] === _hgRepositoryBaseLibHgConstants.StatusCodeId.IGNORED || this._isPathWithinHgRepo(filePath);
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
        return _hgRepositoryBaseLibHgConstants.StatusCodeNumber.CLEAN;
      }
      var directoryPathWithSeparator = (0, _commonsLibPaths.ensureTrailingSeparator)(directoryPath);
      if (this._modifiedDirectoryCache.has(directoryPathWithSeparator)) {
        return _hgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED;
      }
      return _hgRepositoryBaseLibHgConstants.StatusCodeNumber.CLEAN;
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
        return _hgRepositoryBaseLibHgConstants.StatusCodeNumber.CLEAN;
      }
      var cachedStatus = this._hgStatusCache[filePath];
      if (cachedStatus) {
        return _hgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[cachedStatus];
      }
      return _hgRepositoryBaseLibHgConstants.StatusCodeNumber.CLEAN;
    }
  }, {
    key: 'getAllPathStatuses',
    value: function getAllPathStatuses() {
      var pathStatuses = Object.create(null);
      for (var _filePath in this._hgStatusCache) {
        pathStatuses[_filePath] = _hgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[this._hgStatusCache[_filePath]];
      }
      return pathStatuses;
    }
  }, {
    key: 'isStatusModified',
    value: function isStatusModified(status) {
      return status === _hgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED || status === _hgRepositoryBaseLibHgConstants.StatusCodeNumber.MISSING || status === _hgRepositoryBaseLibHgConstants.StatusCodeNumber.REMOVED;
    }
  }, {
    key: 'isStatusNew',
    value: function isStatusNew(status) {
      return status === _hgRepositoryBaseLibHgConstants.StatusCodeNumber.ADDED || status === _hgRepositoryBaseLibHgConstants.StatusCodeNumber.UNTRACKED;
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
          statusMap.set(filePath, _hgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[statusId]);
        } else {
          pathsWithCacheMiss.push(filePath);
        }
      });

      // Fetch any uncached statuses.
      if (pathsWithCacheMiss.length) {
        var newStatusInfo = yield this._updateStatuses(pathsWithCacheMiss, options);
        newStatusInfo.forEach(function (status, filePath) {
          statusMap.set(filePath, _hgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[status]);
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
        if (oldStatus && oldStatus !== newStatusId || !oldStatus && newStatusId !== _hgRepositoryBaseLibHgConstants.StatusCodeId.CLEAN) {
          statusChangeEvents.push({
            path: filePath,
            pathStatus: _hgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[newStatusId]
          });
          if (newStatusId === _hgRepositoryBaseLibHgConstants.StatusCodeId.CLEAN) {
            // Don't bother keeping 'clean' files in the cache.
            delete _this4._hgStatusCache[filePath];
            _this4._removeAllParentDirectoriesFromCache(filePath);
          } else {
            _this4._hgStatusCache[filePath] = newStatusId;
            if (newStatusId === _hgRepositoryBaseLibHgConstants.StatusCodeId.MODIFIED) {
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
      if (hgStatusOption === _hgRepositoryBaseLibHgConstants.HgStatusOption.ONLY_IGNORED) {
        queriedFiles.forEach(function (filePath) {
          if (_this4._hgStatusCache[filePath] === _hgRepositoryBaseLibHgConstants.StatusCodeId.IGNORED) {
            delete _this4._hgStatusCache[filePath];
          }
        });
      } else if (hgStatusOption === _hgRepositoryBaseLibHgConstants.HgStatusOption.ALL_STATUSES) {
        // If HgStatusOption.ALL_STATUSES was passed and a file does not appear in
        // the results, it must mean the file was removed from the filesystem.
        queriedFiles.forEach(function (filePath) {
          var cachedStatusId = _this4._hgStatusCache[filePath];
          delete _this4._hgStatusCache[filePath];
          if (cachedStatusId === _hgRepositoryBaseLibHgConstants.StatusCodeId.MODIFIED) {
            _this4._removeAllParentDirectoriesFromCache(filePath);
          }
        });
      } else {
        queriedFiles.forEach(function (filePath) {
          var cachedStatusId = _this4._hgStatusCache[filePath];
          if (cachedStatusId !== _hgRepositoryBaseLibHgConstants.StatusCodeId.IGNORED) {
            delete _this4._hgStatusCache[filePath];
            if (cachedStatusId === _hgRepositoryBaseLibHgConstants.StatusCodeId.MODIFIED) {
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

      if (hgStatusOption === _hgRepositoryBaseLibHgConstants.HgStatusOption.ONLY_IGNORED) {
        return filterForOnlyIgnored;
      } else if (hgStatusOption === _hgRepositoryBaseLibHgConstants.HgStatusOption.ALL_STATUSES) {
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
        yield this._updateStatuses(relevantChangedPaths, { hgStatusOption: _hgRepositoryBaseLibHgConstants.HgStatusOption.ALL_STATUSES });
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
      yield this._updateStatuses([this.getProjectDirectory()], { hgStatusOption: _hgRepositoryBaseLibHgConstants.HgStatusOption.ONLY_NON_IGNORED });
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
    value: function add(filePath) {
      return this._service.add(filePath);
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
//# sourceMappingURL=data:application/json;base64,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O0tBQ3pFOzs7V0FFVSxxQkFBQyxTQUFrQixFQUFFLE9BQWdCLEVBQW1CO0FBQ2pFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3REOzs7V0FFSyxnQkFBQyxXQUFtQixFQUFFLFdBQW1CLEVBQWlCO0FBQzlELGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ3ZEOzs7V0FFSyxnQkFBQyxRQUFnQixFQUFpQjtBQUN0QyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3ZDOzs7V0FFRSxhQUFDLFFBQWdCLEVBQWlCO0FBQ25DLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDcEM7OztXQUVLLGdCQUFDLE9BQWUsRUFBaUI7QUFDckMsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN0Qzs7O1dBRUksZUFBQyxPQUFnQixFQUFpQjtBQUNyQyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3JDOzs7V0FFZSwwQkFBQyxPQUFnQyxFQUF3QjtBQUN2RSxVQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7QUFDbkIsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELGFBQU8sT0FBTyxDQUFDLGNBQWMsQ0FBQztLQUMvQjs7O1NBNXpCa0Isa0JBQWtCOzs7cUJBQWxCLGtCQUFrQiIsImZpbGUiOiJIZ1JlcG9zaXRvcnlDbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEhnU2VydmljZSxcbiAgRGlmZkluZm8sXG4gIEhnU3RhdHVzT3B0aW9uVmFsdWUsXG4gIExpbmVEaWZmLFxuICBSZXZpc2lvbkluZm8sXG4gIFJldmlzaW9uRmlsZUNoYW5nZXMsXG4gIFN0YXR1c0NvZGVJZFZhbHVlLFxuICBTdGF0dXNDb2RlTnVtYmVyVmFsdWUsXG59IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIFN0YXR1c0NvZGVJZCxcbiAgU3RhdHVzQ29kZUlkVG9OdW1iZXIsXG4gIFN0YXR1c0NvZGVOdW1iZXIsXG4gIEhnU3RhdHVzT3B0aW9uLFxufSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL2hnLWNvbnN0YW50cyc7XG5pbXBvcnQge3Byb21pc2VzfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7ZW5zdXJlVHJhaWxpbmdTZXBhcmF0b3J9IGZyb20gJy4uLy4uL2NvbW1vbnMvbGliL3BhdGhzJztcbmltcG9ydCB7YWRkQWxsUGFyZW50RGlyZWN0b3JpZXNUb0NhY2hlLCByZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZX0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IHtzZXJpYWxpemVBc3luY0NhbGx9ID0gcHJvbWlzZXM7XG5cbnR5cGUgSGdSZXBvc2l0b3J5T3B0aW9ucyA9IHtcbiAgLyoqIFRoZSBvcmlnaW4gVVJMIG9mIHRoaXMgcmVwb3NpdG9yeS4gKi9cbiAgb3JpZ2luVVJMOiA/c3RyaW5nO1xuXG4gIC8qKiBUaGUgd29ya2luZyBkaXJlY3Rvcnkgb2YgdGhpcyByZXBvc2l0b3J5LiAqL1xuICB3b3JraW5nRGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSB8IFJlbW90ZURpcmVjdG9yeTtcblxuICAvKiogVGhlIHJvb3QgZGlyZWN0b3J5IHRoYXQgaXMgb3BlbmVkIGluIEF0b20sIHdoaWNoIHRoaXMgUmVwb3NpdG9yeSBzZXJ2ZXMuICoqL1xuICBwcm9qZWN0Um9vdERpcmVjdG9yeTogYXRvbSREaXJlY3Rvcnk7XG59O1xuXG4vKipcbiAqXG4gKiBTZWN0aW9uOiBDb25zdGFudHMsIFR5cGUgRGVmaW5pdGlvbnNcbiAqXG4gKi9cblxuZXhwb3J0IHR5cGUgSGdTdGF0dXNDb21tYW5kT3B0aW9ucyA9IHtcbiAgaGdTdGF0dXNPcHRpb246IEhnU3RhdHVzT3B0aW9uVmFsdWU7XG59O1xuXG5jb25zdCBFRElUT1JfU1VCU0NSSVBUSU9OX05BTUUgPSAnaGctcmVwb3NpdG9yeS1lZGl0b3Itc3Vic2NyaXB0aW9uJztcbmV4cG9ydCBjb25zdCBNQVhfSU5ESVZJRFVBTF9DSEFOR0VEX1BBVEhTID0gMTtcblxuZnVuY3Rpb24gZmlsdGVyRm9yT25seU5vdElnbm9yZWQoY29kZTogU3RhdHVzQ29kZUlkVmFsdWUpOiBib29sZWFuIHtcbiAgcmV0dXJuIChjb2RlICE9PSBTdGF0dXNDb2RlSWQuSUdOT1JFRCk7XG59XG5cbmZ1bmN0aW9uIGZpbHRlckZvck9ubHlJZ25vcmVkKGNvZGU6IFN0YXR1c0NvZGVJZFZhbHVlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoY29kZSA9PT0gU3RhdHVzQ29kZUlkLklHTk9SRUQpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJGb3JBbGxTdGF0dWVzKCkge1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuXG4vKipcbiAqXG4gKiBTZWN0aW9uOiBIZ1JlcG9zaXRvcnlDbGllbnRcbiAqXG4gKi9cblxuLyoqXG4gKiBIZ1JlcG9zaXRvcnlDbGllbnQgcnVucyBvbiB0aGUgbWFjaGluZSB0aGF0IE51Y2xpZGUvQXRvbSBpcyBydW5uaW5nIG9uLlxuICogSXQgaXMgdGhlIGludGVyZmFjZSB0aGF0IG90aGVyIEF0b20gcGFja2FnZXMgd2lsbCB1c2UgdG8gYWNjZXNzIE1lcmN1cmlhbC5cbiAqIEl0IGNhY2hlcyBkYXRhIGZldGNoZWQgZnJvbSBhbiBIZ1NlcnZpY2UuXG4gKiBJdCBpbXBsZW1lbnRzIHRoZSBzYW1lIGludGVyZmFjZSBhcyBHaXRSZXBvc2l0b3J5LCAoaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL2xhdGVzdC9HaXRSZXBvc2l0b3J5KVxuICogaW4gYWRkaXRpb24gdG8gcHJvdmlkaW5nIGFzeW5jaHJvbm91cyBtZXRob2RzIGZvciBzb21lIGdldHRlcnMuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1JlbW90ZURpcmVjdG9yeX0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZ1JlcG9zaXRvcnlDbGllbnQge1xuICBfcGF0aDogc3RyaW5nO1xuICBfd29ya2luZ0RpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3Rvcnk7XG4gIF9wcm9qZWN0RGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeTtcbiAgX29yaWdpblVSTDogP3N0cmluZztcbiAgX3NlcnZpY2U6IEhnU2VydmljZTtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIC8vIEEgbWFwIGZyb20gYSBrZXkgKGluIG1vc3QgY2FzZXMsIGEgZmlsZSBwYXRoKSwgdG8gYSByZWxhdGVkIERpc3Bvc2FibGUuXG4gIF9kaXNwb3NhYmxlczoge1trZXk6IHN0cmluZ106IElEaXNwb3NhYmxlfTtcbiAgX2hnU3RhdHVzQ2FjaGU6IHtbZmlsZVBhdGg6IE51Y2xpZGVVcmldOiBTdGF0dXNDb2RlSWRWYWx1ZX07XG4gIC8vIE1hcCBvZiBkaXJlY3RvcnkgcGF0aCB0byB0aGUgbnVtYmVyIG9mIG1vZGlmaWVkIGZpbGVzIHdpdGhpbiB0aGF0IGRpcmVjdG9yeS5cbiAgX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGU6IE1hcDxzdHJpbmcsIG51bWJlcj47XG4gIF9oZ0RpZmZDYWNoZToge1tmaWxlUGF0aDogTnVjbGlkZVVyaV06IERpZmZJbmZvfTtcbiAgX2hnRGlmZkNhY2hlRmlsZXNVcGRhdGluZzogU2V0PE51Y2xpZGVVcmk+O1xuICBfaGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXI6IFNldDxOdWNsaWRlVXJpPjtcblxuICBfY3VycmVudEJvb2ttYXJrOiA/c3RyaW5nO1xuICBfc2VyaWFsaXplZFJlZnJlc2hTdGF0dXNlc0NhY2hlOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKHJlcG9QYXRoOiBzdHJpbmcsIGhnU2VydmljZTogSGdTZXJ2aWNlLCBvcHRpb25zOiBIZ1JlcG9zaXRvcnlPcHRpb25zKSB7XG4gICAgdGhpcy5fcGF0aCA9IHJlcG9QYXRoO1xuICAgIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkgPSBvcHRpb25zLndvcmtpbmdEaXJlY3Rvcnk7XG4gICAgdGhpcy5fcHJvamVjdERpcmVjdG9yeSA9IG9wdGlvbnMucHJvamVjdFJvb3REaXJlY3Rvcnk7XG4gICAgdGhpcy5fb3JpZ2luVVJMID0gb3B0aW9ucy5vcmlnaW5VUkw7XG4gICAgdGhpcy5fc2VydmljZSA9IGhnU2VydmljZTtcblxuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0ge307XG5cbiAgICB0aGlzLl9oZ1N0YXR1c0NhY2hlID0ge307XG4gICAgdGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZSA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX2hnRGlmZkNhY2hlID0ge307XG4gICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNUb0NsZWFyID0gbmV3IFNldCgpO1xuXG4gICAgdGhpcy5fc2VyaWFsaXplZFJlZnJlc2hTdGF0dXNlc0NhY2hlID0gc2VyaWFsaXplQXN5bmNDYWxsKFxuICAgICAgdGhpcy5fcmVmcmVzaFN0YXR1c2VzT2ZBbGxGaWxlc0luQ2FjaGUuYmluZCh0aGlzKSxcbiAgICApO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXNbRURJVE9SX1NVQlNDUklQVElPTl9OQU1FXSA9IGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyhlZGl0b3IgPT4ge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgICAvLyBUT0RPOiBvYnNlcnZlIGZvciB3aGVuIHRoaXMgZWRpdG9yJ3MgcGF0aCBjaGFuZ2VzLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuX2lzUGF0aFJlbGV2YW50KGZpbGVQYXRoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBJZiB0aGlzIGVkaXRvciBoYXMgYmVlbiBwcmV2aW91c2x5IGFjdGl2ZSwgd2Ugd2lsbCBoYXZlIGFscmVhZHlcbiAgICAgIC8vIGluaXRpYWxpemVkIGRpZmYgaW5mbyBhbmQgcmVnaXN0ZXJlZCBsaXN0ZW5lcnMgb24gaXQuXG4gICAgICBpZiAodGhpcy5fZGlzcG9zYWJsZXNbZmlsZVBhdGhdKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFRPRE8gKHQ4MjI3NTcwKSBHZXQgaW5pdGlhbCBkaWZmIHN0YXRzIGZvciB0aGlzIGVkaXRvciwgYW5kIHJlZnJlc2hcbiAgICAgIC8vIHRoaXMgaW5mb3JtYXRpb24gd2hlbmV2ZXIgdGhlIGNvbnRlbnQgb2YgdGhlIGVkaXRvciBjaGFuZ2VzLlxuICAgICAgY29uc3QgZWRpdG9yU3Vic2NyaXB0aW9ucyA9IHRoaXMuX2Rpc3Bvc2FibGVzW2ZpbGVQYXRoXSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChlZGl0b3Iub25EaWRTYXZlKGV2ZW50ID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlRGlmZkluZm8oW2V2ZW50LnBhdGhdKTtcbiAgICAgIH0pKTtcbiAgICAgIC8vIFJlbW92ZSB0aGUgZmlsZSBmcm9tIHRoZSBkaWZmIHN0YXRzIGNhY2hlIHdoZW4gdGhlIGVkaXRvciBpcyBjbG9zZWQuXG4gICAgICAvLyBUaGlzIGlzbid0IHN0cmljdGx5IG5lY2Vzc2FyeSwgYnV0IGtlZXBzIHRoZSBjYWNoZSBhcyBzbWFsbCBhcyBwb3NzaWJsZS5cbiAgICAgIC8vIFRoZXJlIGFyZSBjYXNlcyB3aGVyZSB0aGlzIHJlbW92YWwgbWF5IHJlc3VsdCBpbiByZW1vdmluZyBpbmZvcm1hdGlvblxuICAgICAgLy8gdGhhdCBpcyBzdGlsbCByZWxldmFudDogZS5nLlxuICAgICAgLy8gICAqIGlmIHRoZSB1c2VyIHZlcnkgcXVpY2tseSBjbG9zZXMgYW5kIHJlb3BlbnMgYSBmaWxlOyBvclxuICAgICAgLy8gICAqIGlmIHRoZSBmaWxlIGlzIG9wZW4gaW4gbXVsdGlwbGUgZWRpdG9ycywgYW5kIG9uZSBvZiB0aG9zZSBpcyBjbG9zZWQuXG4gICAgICAvLyBUaGVzZSBhcmUgcHJvYmFibHkgZWRnZSBjYXNlcywgdGhvdWdoLCBhbmQgdGhlIGluZm9ybWF0aW9uIHdpbGwgYmVcbiAgICAgIC8vIHJlZmV0Y2hlZCB0aGUgbmV4dCB0aW1lIHRoZSBmaWxlIGlzIGVkaXRlZC5cbiAgICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVG9DbGVhci5hZGQoZmlsZVBhdGgpO1xuICAgICAgICB0aGlzLl9kaXNwb3NhYmxlc1tmaWxlUGF0aF0uZGlzcG9zZSgpO1xuICAgICAgICBkZWxldGUgdGhpcy5fZGlzcG9zYWJsZXNbZmlsZVBhdGhdO1xuICAgICAgfSkpO1xuICAgIH0pO1xuXG4gICAgLy8gUmVnYXJkbGVzcyBvZiBob3cgZnJlcXVlbnRseSB0aGUgc2VydmljZSBzZW5kcyBmaWxlIGNoYW5nZSB1cGRhdGVzLFxuICAgIC8vIE9ubHkgb25lIGJhdGNoZWQgc3RhdHVzIHVwZGF0ZSBjYW4gYmUgcnVubmluZyBhdCBhbnkgcG9pbnQgb2YgdGltZS5cbiAgICBjb25zdCB0b1VwZGF0ZUNoYW5nZWRQYXRocyA9IFtdO1xuICAgIGNvbnN0IHNlcmlhbGl6ZWRVcGRhdGVDaGFuZ2VkUGF0aHMgPSBzZXJpYWxpemVBc3luY0NhbGwoKCkgPT4ge1xuICAgICAgLy8gU2VuZCBhIGJhdGNoZWQgdXBkYXRlIGFuZCBjbGVhciB0aGUgcGVuZGluZyBjaGFuZ2VzLlxuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZUNoYW5nZWRQYXRocyh0b1VwZGF0ZUNoYW5nZWRQYXRocy5zcGxpY2UoMCkpO1xuICAgIH0pO1xuICAgIGNvbnN0IG9uRmlsZXNDaGFuZ2VzID0gKGNoYW5nZWRQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4pID0+IHtcbiAgICAgIHRvVXBkYXRlQ2hhbmdlZFBhdGhzLnB1c2goLi4uY2hhbmdlZFBhdGhzKTtcbiAgICAgIC8vIFdpbGwgdHJpZ2dlciBhbiB1cGRhdGUgaW1tZWRpYXRlbHkgaWYgbm8gb3RoZXIgYXN5bmMgY2FsbCBpcyBhY3RpdmUuXG4gICAgICAvLyBPdGhlcndpc2UsIHdpbGwgc2NoZWR1bGUgYW4gYXN5bmMgY2FsbCB3aGVuIGl0J3MgZG9uZS5cbiAgICAgIHNlcmlhbGl6ZWRVcGRhdGVDaGFuZ2VkUGF0aHMoKTtcbiAgICB9O1xuICAgIC8vIEdldCB1cGRhdGVzIHRoYXQgdGVsbCB0aGUgSGdSZXBvc2l0b3J5Q2xpZW50IHdoZW4gdG8gY2xlYXIgaXRzIGNhY2hlcy5cbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVGaWxlc0RpZENoYW5nZSgpLnN1YnNjcmliZShvbkZpbGVzQ2hhbmdlcyk7XG4gICAgdGhpcy5fc2VydmljZS5vYnNlcnZlSGdJZ25vcmVGaWxlRGlkQ2hhbmdlKClcbiAgICAgIC5zdWJzY3JpYmUodGhpcy5fc2VyaWFsaXplZFJlZnJlc2hTdGF0dXNlc0NhY2hlKTtcbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVIZ1JlcG9TdGF0ZURpZENoYW5nZSgpXG4gICAgICAuc3Vic2NyaWJlKHRoaXMuX3NlcmlhbGl6ZWRSZWZyZXNoU3RhdHVzZXNDYWNoZSk7XG4gICAgdGhpcy5fc2VydmljZS5vYnNlcnZlSGdCb29rbWFya0RpZENoYW5nZSgpXG4gICAgICAuc3Vic2NyaWJlKHRoaXMuZmV0Y2hDdXJyZW50Qm9va21hcmsuYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWRlc3Ryb3knKTtcbiAgICB0aGlzLl9lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9kaXNwb3NhYmxlcykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXNba2V5XS5kaXNwb3NlKCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VydmljZS5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogRXZlbnQgU3Vic2NyaXB0aW9uXG4gICAqXG4gICAqL1xuXG4gIG9uRGlkRGVzdHJveShjYWxsYmFjazogKCkgPT4gbWl4ZWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChldmVudDoge3BhdGg6IHN0cmluZzsgcGF0aFN0YXR1czogU3RhdHVzQ29kZU51bWJlclZhbHVlfSkgPT4gbWl4ZWQsXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignZGlkLWNoYW5nZS1zdGF0dXMnLCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZVN0YXR1c2VzKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignZGlkLWNoYW5nZS1zdGF0dXNlcycsIGNhbGxiYWNrKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJlcG9zaXRvcnkgRGV0YWlsc1xuICAgKlxuICAgKi9cblxuICBnZXRUeXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdoZyc7XG4gIH1cblxuICBnZXRQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3BhdGg7XG4gIH1cblxuICBnZXRXb3JraW5nRGlyZWN0b3J5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICB9XG5cbiAgLy8gQHJldHVybiBUaGUgcGF0aCBvZiB0aGUgcm9vdCBwcm9qZWN0IGZvbGRlciBpbiBBdG9tIHRoYXQgdGhpc1xuICAvLyBIZ1JlcG9zaXRvcnlDbGllbnQgcHJvdmlkZXMgaW5mb3JtYXRpb24gYWJvdXQuXG4gIGdldFByb2plY3REaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvamVjdERpcmVjdG9yeS5nZXRQYXRoKCk7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBpc1Byb2plY3RBdFJvb3QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZWxhdGl2aXplKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fd29ya2luZ0RpcmVjdG9yeS5yZWxhdGl2aXplKGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGhhc0JyYW5jaChicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIFRoZSBjdXJyZW50IEhnIGJvb2ttYXJrLlxuICAgKi9cbiAgZ2V0U2hvcnRIZWFkKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMuX2N1cnJlbnRCb29rbWFyaykge1xuICAgICAgLy8gS2ljayBvZmYgYSBmZXRjaCB0byBnZXQgdGhlIGN1cnJlbnQgYm9va21hcmsuIFRoaXMgaXMgYXN5bmMuXG4gICAgICB0aGlzLmZldGNoQ3VycmVudEJvb2ttYXJrKCk7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jdXJyZW50Qm9va21hcms7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBpc1N1Ym1vZHVsZShwYXRoOiBOdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0QWhlYWRCZWhpbmRDb3VudChyZWZlcmVuY2U6IHN0cmluZywgcGF0aDogTnVjbGlkZVVyaSk6IG51bWJlciB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBnZXRDYWNoZWRVcHN0cmVhbUFoZWFkQmVoaW5kQ291bnQocGF0aDogP051Y2xpZGVVcmkpOiB7YWhlYWQ6IG51bWJlcjsgYmVoaW5kOiBudW1iZXI7fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFoZWFkOiAwLFxuICAgICAgYmVoaW5kOiAwLFxuICAgIH07XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBnZXRDb25maWdWYWx1ZShrZXk6IHN0cmluZywgcGF0aDogP3N0cmluZyk6ID9zdHJpbmcge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0T3JpZ2luVVJMKHBhdGg6ID9zdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fb3JpZ2luVVJMO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0VXBzdHJlYW1CcmFuY2gocGF0aDogP3N0cmluZyk6ID9zdHJpbmcge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0UmVmZXJlbmNlcyhcbiAgICBwYXRoOiA/TnVjbGlkZVVyaSxcbiAgKToge2hlYWRzOiBBcnJheTxzdHJpbmc+OyByZW1vdGVzOiBBcnJheTxzdHJpbmc+OyB0YWdzOiBBcnJheTxzdHJpbmc+O30ge1xuICAgIHJldHVybiB7XG4gICAgICBoZWFkczogW10sXG4gICAgICByZW1vdGVzOiBbXSxcbiAgICAgIHRhZ3M6IFtdLFxuICAgIH07XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBnZXRSZWZlcmVuY2VUYXJnZXQocmVmZXJlbmNlOiBzdHJpbmcsIHBhdGg6ID9OdWNsaWRlVXJpKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZWFkaW5nIFN0YXR1cyAocGFyaXR5IHdpdGggR2l0UmVwb3NpdG9yeSlcbiAgICpcbiAgICovXG5cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgQ2FuIHdlIGNoYW5nZSB0aGUgQVBJIHRvIG1ha2UgdGhpcyBtZXRob2QgcmV0dXJuIGEgUHJvbWlzZT9cbiAgLy8gSWYgbm90LCBtaWdodCBuZWVkIHRvIGRvIGEgc3luY2hyb25vdXMgYGhnIHN0YXR1c2AgcXVlcnkuXG4gIGlzUGF0aE1vZGlmaWVkKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgY2FjaGVkUGF0aFN0YXR1cyA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmICghY2FjaGVkUGF0aFN0YXR1cykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5pc1N0YXR1c01vZGlmaWVkKFN0YXR1c0NvZGVJZFRvTnVtYmVyW2NhY2hlZFBhdGhTdGF0dXNdKTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPIChqZXNzaWNhbGluKSBDYW4gd2UgY2hhbmdlIHRoZSBBUEkgdG8gbWFrZSB0aGlzIG1ldGhvZCByZXR1cm4gYSBQcm9taXNlP1xuICAvLyBJZiBub3QsIG1pZ2h0IG5lZWQgdG8gZG8gYSBzeW5jaHJvbm91cyBgaGcgc3RhdHVzYCBxdWVyeS5cbiAgaXNQYXRoTmV3KGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgY2FjaGVkUGF0aFN0YXR1cyA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmICghY2FjaGVkUGF0aFN0YXR1cykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5pc1N0YXR1c05ldyhTdGF0dXNDb2RlSWRUb051bWJlcltjYWNoZWRQYXRoU3RhdHVzXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgQ2FuIHdlIGNoYW5nZSB0aGUgQVBJIHRvIG1ha2UgdGhpcyBtZXRob2QgcmV0dXJuIGEgUHJvbWlzZT9cbiAgLy8gSWYgbm90LCB0aGlzIG1ldGhvZCBsaWVzIGEgYml0IGJ5IHVzaW5nIGNhY2hlZCBpbmZvcm1hdGlvbi5cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgTWFrZSB0aGlzIHdvcmsgZm9yIGlnbm9yZWQgZGlyZWN0b3JpZXMuXG4gIGlzUGF0aElnbm9yZWQoZmlsZVBhdGg6ID9OdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBgaGcgc3RhdHVzIC1pYCBkb2VzIG5vdCBsaXN0IHRoZSByZXBvICh0aGUgLmhnIGRpcmVjdG9yeSksIHByZXN1bWFibHlcbiAgICAvLyBiZWNhdXNlIHRoZSByZXBvIGRvZXMgbm90IHRyYWNrIGl0c2VsZi5cbiAgICAvLyBXZSB3YW50IHRvIHJlcHJlc2VudCB0aGUgZmFjdCB0aGF0IGl0J3Mgbm90IHBhcnQgb2YgdGhlIHRyYWNrZWQgY29udGVudHMsXG4gICAgLy8gc28gd2UgbWFudWFsbHkgYWRkIGFuIGV4Y2VwdGlvbiBmb3IgaXQgdmlhIHRoZSBfaXNQYXRoV2l0aGluSGdSZXBvIGNoZWNrLlxuICAgIHJldHVybiAodGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF0gPT09IFN0YXR1c0NvZGVJZC5JR05PUkVEKSB8fFxuICAgICAgICB0aGlzLl9pc1BhdGhXaXRoaW5IZ1JlcG8oZmlsZVBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gcGF0aCBpcyB3aXRoaW4gdGhlIHJlcG8gZGlyZWN0b3J5IChpLmUuIGAuaGcvYCkuXG4gICAqL1xuICBfaXNQYXRoV2l0aGluSGdSZXBvKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChmaWxlUGF0aCA9PT0gdGhpcy5nZXRQYXRoKCkpIHx8IChmaWxlUGF0aC5pbmRleE9mKHRoaXMuZ2V0UGF0aCgpICsgJy8nKSA9PT0gMCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgYSBwYXRoIGlzIHJlbGV2YW50IHRvIHRoaXMgSGdSZXBvc2l0b3J5Q2xpZW50LiBBIHBhdGggaXNcbiAgICogZGVmaW5lZCBhcyAncmVsZXZhbnQnIGlmIGl0IGlzIHdpdGhpbiB0aGUgcHJvamVjdCBkaXJlY3Rvcnkgb3BlbmVkIHdpdGhpbiB0aGUgcmVwby5cbiAgICovXG4gIF9pc1BhdGhSZWxldmFudChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9wcm9qZWN0RGlyZWN0b3J5LmNvbnRhaW5zKGZpbGVQYXRoKSB8fFxuICAgICAgICAgICAodGhpcy5fcHJvamVjdERpcmVjdG9yeS5nZXRQYXRoKCkgPT09IGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8vIEZvciBub3csIHRoaXMgbWV0aG9kIG9ubHkgcmVmbGVjdHMgdGhlIHN0YXR1cyBvZiBcIm1vZGlmaWVkXCIgZGlyZWN0b3JpZXMuXG4gIC8vIFRyYWNraW5nIGRpcmVjdG9yeSBzdGF0dXMgaXNuJ3Qgc3RyYWlnaHRmb3J3YXJkLCBhcyBIZyBvbmx5IHRyYWNrcyBmaWxlcy5cbiAgLy8gaHR0cDovL21lcmN1cmlhbC5zZWxlbmljLmNvbS93aWtpL0ZBUSNGQVEuMkZDb21tb25Qcm9ibGVtcy5JX3RyaWVkX3RvX2NoZWNrX2luX2FuX2VtcHR5X2RpcmVjdG9yeV9hbmRfaXRfZmFpbGVkLjIxXG4gIC8vIFRPRE86IE1ha2UgdGhpcyBtZXRob2QgcmVmbGVjdCBOZXcgYW5kIElnbm9yZWQgc3RhdHVzZXMuXG4gIGdldERpcmVjdG9yeVN0YXR1cyhkaXJlY3RvcnlQYXRoOiA/c3RyaW5nKTogU3RhdHVzQ29kZU51bWJlclZhbHVlIHtcbiAgICBpZiAoIWRpcmVjdG9yeVBhdGgpIHtcbiAgICAgIHJldHVybiBTdGF0dXNDb2RlTnVtYmVyLkNMRUFOO1xuICAgIH1cbiAgICBjb25zdCBkaXJlY3RvcnlQYXRoV2l0aFNlcGFyYXRvciA9IGVuc3VyZVRyYWlsaW5nU2VwYXJhdG9yKGRpcmVjdG9yeVBhdGgpO1xuICAgIGlmICh0aGlzLl9tb2RpZmllZERpcmVjdG9yeUNhY2hlLmhhcyhkaXJlY3RvcnlQYXRoV2l0aFNlcGFyYXRvcikpIHtcbiAgICAgIHJldHVybiBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEO1xuICAgIH1cbiAgICByZXR1cm4gU3RhdHVzQ29kZU51bWJlci5DTEVBTjtcbiAgfVxuXG4gIC8vIFdlIGRvbid0IHdhbnQgdG8gZG8gYW55IHN5bmNocm9ub3VzICdoZyBzdGF0dXMnIGNhbGxzLiBKdXN0IHVzZSBjYWNoZWQgdmFsdWVzLlxuICBnZXRQYXRoU3RhdHVzKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogU3RhdHVzQ29kZU51bWJlclZhbHVlIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDYWNoZWRQYXRoU3RhdHVzKGZpbGVQYXRoKTtcbiAgfVxuXG4gIGdldENhY2hlZFBhdGhTdGF0dXMoZmlsZVBhdGg6ID9OdWNsaWRlVXJpKTogU3RhdHVzQ29kZU51bWJlclZhbHVlIHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gU3RhdHVzQ29kZU51bWJlci5DTEVBTjtcbiAgICB9XG4gICAgY29uc3QgY2FjaGVkU3RhdHVzID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgaWYgKGNhY2hlZFN0YXR1cykge1xuICAgICAgcmV0dXJuIFN0YXR1c0NvZGVJZFRvTnVtYmVyW2NhY2hlZFN0YXR1c107XG4gICAgfVxuICAgIHJldHVybiBTdGF0dXNDb2RlTnVtYmVyLkNMRUFOO1xuICB9XG5cbiAgZ2V0QWxsUGF0aFN0YXR1c2VzKCk6IHtbZmlsZVBhdGg6IE51Y2xpZGVVcmldOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWV9IHtcbiAgICBjb25zdCBwYXRoU3RhdHVzZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIGZvciAoY29uc3QgZmlsZVBhdGggaW4gdGhpcy5faGdTdGF0dXNDYWNoZSkge1xuICAgICAgcGF0aFN0YXR1c2VzW2ZpbGVQYXRoXSA9IFN0YXR1c0NvZGVJZFRvTnVtYmVyW3RoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdXTtcbiAgICB9XG4gICAgcmV0dXJuIHBhdGhTdGF0dXNlcztcbiAgfVxuXG4gIGlzU3RhdHVzTW9kaWZpZWQoc3RhdHVzOiA/bnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHN0YXR1cyA9PT0gU3RhdHVzQ29kZU51bWJlci5NT0RJRklFRCB8fFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLk1JU1NJTkcgfHxcbiAgICAgIHN0YXR1cyA9PT0gU3RhdHVzQ29kZU51bWJlci5SRU1PVkVEXG4gICAgKTtcbiAgfVxuXG4gIGlzU3RhdHVzTmV3KHN0YXR1czogP251bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuQURERUQgfHxcbiAgICAgIHN0YXR1cyA9PT0gU3RhdHVzQ29kZU51bWJlci5VTlRSQUNLRURcbiAgICApO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmVhZGluZyBIZyBTdGF0dXMgKGFzeW5jIG1ldGhvZHMpXG4gICAqXG4gICAqL1xuXG4gIC8qKlxuICAgKiBSZWNvbW1lbmRlZCBtZXRob2QgdG8gdXNlIHRvIGdldCB0aGUgc3RhdHVzIG9mIGZpbGVzIGluIHRoaXMgcmVwby5cbiAgICogQHBhcmFtIHBhdGhzIEFuIGFycmF5IG9mIGZpbGUgcGF0aHMgdG8gZ2V0IHRoZSBzdGF0dXMgZm9yLiBJZiBhIHBhdGggaXMgbm90IGluIHRoZVxuICAgKiAgIHByb2plY3QsIGl0IHdpbGwgYmUgaWdub3JlZC5cbiAgICogU2VlIEhnU2VydmljZTo6Z2V0U3RhdHVzZXMgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAqL1xuICBhc3luYyBnZXRTdGF0dXNlcyhcbiAgICBwYXRoczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zPzogSGdTdGF0dXNDb21tYW5kT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxNYXA8TnVjbGlkZVVyaSwgU3RhdHVzQ29kZU51bWJlclZhbHVlPj4ge1xuICAgIGNvbnN0IHN0YXR1c01hcCA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBpc1JlbGF2YW50U3RhdHVzID0gdGhpcy5fZ2V0UHJlZGljYXRlRm9yUmVsZXZhbnRTdGF0dXNlcyhvcHRpb25zKTtcblxuICAgIC8vIENoZWNrIHRoZSBjYWNoZS5cbiAgICAvLyBOb3RlOiBJZiBwYXRocyBpcyBlbXB0eSwgYSBmdWxsIGBoZyBzdGF0dXNgIHdpbGwgYmUgcnVuLCB3aGljaCBmb2xsb3dzIHRoZSBzcGVjLlxuICAgIGNvbnN0IHBhdGhzV2l0aENhY2hlTWlzcyA9IFtdO1xuICAgIHBhdGhzLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgICAgY29uc3Qgc3RhdHVzSWQgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgIGlmIChzdGF0dXNJZCkge1xuICAgICAgICBpZiAoIWlzUmVsYXZhbnRTdGF0dXMoc3RhdHVzSWQpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0YXR1c01hcC5zZXQoZmlsZVBhdGgsIFN0YXR1c0NvZGVJZFRvTnVtYmVyW3N0YXR1c0lkXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXRoc1dpdGhDYWNoZU1pc3MucHVzaChmaWxlUGF0aCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBGZXRjaCBhbnkgdW5jYWNoZWQgc3RhdHVzZXMuXG4gICAgaWYgKHBhdGhzV2l0aENhY2hlTWlzcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IG5ld1N0YXR1c0luZm8gPSBhd2FpdCB0aGlzLl91cGRhdGVTdGF0dXNlcyhwYXRoc1dpdGhDYWNoZU1pc3MsIG9wdGlvbnMpO1xuICAgICAgbmV3U3RhdHVzSW5mby5mb3JFYWNoKChzdGF0dXMsIGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIHN0YXR1c01hcC5zZXQoZmlsZVBhdGgsIFN0YXR1c0NvZGVJZFRvTnVtYmVyW3N0YXR1c10pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBzdGF0dXNNYXA7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgc3RhdHVzZXMgZm9yIHRoZSBnaXZlbiBmaWxlIHBhdGhzLCBhbmQgdXBkYXRlcyB0aGUgY2FjaGUgYW5kXG4gICAqIHNlbmRzIG91dCBjaGFuZ2UgZXZlbnRzIGFzIGFwcHJvcHJpYXRlLlxuICAgKiBAcGFyYW0gZmlsZVBhdGhzIEFuIGFycmF5IG9mIGZpbGUgcGF0aHMgdG8gdXBkYXRlIHRoZSBzdGF0dXMgZm9yLiBJZiBhIHBhdGhcbiAgICogICBpcyBub3QgaW4gdGhlIHByb2plY3QsIGl0IHdpbGwgYmUgaWdub3JlZC5cbiAgICovXG4gIGFzeW5jIF91cGRhdGVTdGF0dXNlcyhcbiAgICBmaWxlUGF0aHM6IEFycmF5PHN0cmluZz4sXG4gICAgb3B0aW9uczogP0hnU3RhdHVzQ29tbWFuZE9wdGlvbnMsXG4gICk6IFByb21pc2U8TWFwPE51Y2xpZGVVcmksIFN0YXR1c0NvZGVJZFZhbHVlPj4ge1xuICAgIGNvbnN0IHBhdGhzSW5SZXBvID0gZmlsZVBhdGhzLmZpbHRlcihmaWxlUGF0aCA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5faXNQYXRoUmVsZXZhbnQoZmlsZVBhdGgpO1xuICAgIH0pO1xuICAgIGlmIChwYXRoc0luUmVwby5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdHVzTWFwUGF0aFRvU3RhdHVzSWQgPSBhd2FpdCB0aGlzLl9zZXJ2aWNlLmZldGNoU3RhdHVzZXMocGF0aHNJblJlcG8sIG9wdGlvbnMpO1xuXG4gICAgY29uc3QgcXVlcmllZEZpbGVzID0gbmV3IFNldChwYXRoc0luUmVwbyk7XG4gICAgY29uc3Qgc3RhdHVzQ2hhbmdlRXZlbnRzID0gW107XG4gICAgc3RhdHVzTWFwUGF0aFRvU3RhdHVzSWQuZm9yRWFjaCgobmV3U3RhdHVzSWQsIGZpbGVQYXRoKSA9PiB7XG5cbiAgICAgIGNvbnN0IG9sZFN0YXR1cyA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgaWYgKG9sZFN0YXR1cyAmJiAob2xkU3RhdHVzICE9PSBuZXdTdGF0dXNJZCkgfHxcbiAgICAgICAgICAhb2xkU3RhdHVzICYmIChuZXdTdGF0dXNJZCAhPT0gU3RhdHVzQ29kZUlkLkNMRUFOKSkge1xuICAgICAgICBzdGF0dXNDaGFuZ2VFdmVudHMucHVzaCh7XG4gICAgICAgICAgcGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgcGF0aFN0YXR1czogU3RhdHVzQ29kZUlkVG9OdW1iZXJbbmV3U3RhdHVzSWRdLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG5ld1N0YXR1c0lkID09PSBTdGF0dXNDb2RlSWQuQ0xFQU4pIHtcbiAgICAgICAgICAvLyBEb24ndCBib3RoZXIga2VlcGluZyAnY2xlYW4nIGZpbGVzIGluIHRoZSBjYWNoZS5cbiAgICAgICAgICBkZWxldGUgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgICAgdGhpcy5fcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoZmlsZVBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdID0gbmV3U3RhdHVzSWQ7XG4gICAgICAgICAgaWYgKG5ld1N0YXR1c0lkID09PSBTdGF0dXNDb2RlSWQuTU9ESUZJRUQpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZEFsbFBhcmVudERpcmVjdG9yaWVzVG9DYWNoZShmaWxlUGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBxdWVyaWVkRmlsZXMuZGVsZXRlKGZpbGVQYXRoKTtcbiAgICB9KTtcblxuICAgIC8vIElmIHRoZSBzdGF0dXNlcyB3ZXJlIGZldGNoZWQgZm9yIG9ubHkgY2hhbmdlZCAoYGhnIHN0YXR1c2ApIG9yXG4gICAgLy8gaWdub3JlZCAoJ2hnIHN0YXR1cyAtLWlnbm9yZWRgKSBmaWxlcywgYSBxdWVyaWVkIGZpbGUgbWF5IG5vdCBiZVxuICAgIC8vIHJldHVybmVkIGluIHRoZSByZXNwb25zZS4gSWYgaXQgd2Fzbid0IHJldHVybmVkLCB0aGlzIG1lYW5zIGl0cyBzdGF0dXNcbiAgICAvLyBtYXkgaGF2ZSBjaGFuZ2VkLCBpbiB3aGljaCBjYXNlIGl0IHNob3VsZCBiZSByZW1vdmVkIGZyb20gdGhlIGhnU3RhdHVzQ2FjaGUuXG4gICAgLy8gTm90ZTogd2UgZG9uJ3Qga25vdyB0aGUgcmVhbCB1cGRhdGVkIHN0YXR1cyBvZiB0aGUgZmlsZSwgc28gZG9uJ3Qgc2VuZCBhIGNoYW5nZSBldmVudC5cbiAgICAvLyBUT0RPIChqZXNzaWNhbGluKSBDYW4gd2UgbWFrZSB0aGUgJ3BhdGhTdGF0dXMnIGZpZWxkIGluIHRoZSBjaGFuZ2UgZXZlbnQgb3B0aW9uYWw/XG4gICAgLy8gVGhlbiB3ZSBjYW4gc2VuZCB0aGVzZSBldmVudHMuXG4gICAgY29uc3QgaGdTdGF0dXNPcHRpb24gPSB0aGlzLl9nZXRTdGF0dXNPcHRpb24ob3B0aW9ucyk7XG4gICAgaWYgKGhnU3RhdHVzT3B0aW9uID09PSBIZ1N0YXR1c09wdGlvbi5PTkxZX0lHTk9SRUQpIHtcbiAgICAgIHF1ZXJpZWRGaWxlcy5mb3JFYWNoKGZpbGVQYXRoID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdID09PSBTdGF0dXNDb2RlSWQuSUdOT1JFRCkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChoZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTKSB7XG4gICAgICAvLyBJZiBIZ1N0YXR1c09wdGlvbi5BTExfU1RBVFVTRVMgd2FzIHBhc3NlZCBhbmQgYSBmaWxlIGRvZXMgbm90IGFwcGVhciBpblxuICAgICAgLy8gdGhlIHJlc3VsdHMsIGl0IG11c3QgbWVhbiB0aGUgZmlsZSB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBmaWxlc3lzdGVtLlxuICAgICAgcXVlcmllZEZpbGVzLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgICAgICBjb25zdCBjYWNoZWRTdGF0dXNJZCA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICBkZWxldGUgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgIGlmIChjYWNoZWRTdGF0dXNJZCA9PT0gU3RhdHVzQ29kZUlkLk1PRElGSUVEKSB7XG4gICAgICAgICAgdGhpcy5fcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcmllZEZpbGVzLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgICAgICBjb25zdCBjYWNoZWRTdGF0dXNJZCA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICBpZiAoY2FjaGVkU3RhdHVzSWQgIT09IFN0YXR1c0NvZGVJZC5JR05PUkVEKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICAgIGlmIChjYWNoZWRTdGF0dXNJZCA9PT0gU3RhdHVzQ29kZUlkLk1PRElGSUVEKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZShmaWxlUGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBFbWl0IGNoYW5nZSBldmVudHMgb25seSBhZnRlciB0aGUgY2FjaGUgaGFzIGJlZW4gZnVsbHkgdXBkYXRlZC5cbiAgICBzdGF0dXNDaGFuZ2VFdmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc3RhdHVzJywgZXZlbnQpO1xuICAgIH0pO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1zdGF0dXNlcycpO1xuXG4gICAgcmV0dXJuIHN0YXR1c01hcFBhdGhUb1N0YXR1c0lkO1xuICB9XG5cbiAgX2FkZEFsbFBhcmVudERpcmVjdG9yaWVzVG9DYWNoZShmaWxlUGF0aDogTnVjbGlkZVVyaSkge1xuICAgIGFkZEFsbFBhcmVudERpcmVjdG9yaWVzVG9DYWNoZShcbiAgICAgIHRoaXMuX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGUsXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIHRoaXMuX3Byb2plY3REaXJlY3RvcnkuZ2V0UGFyZW50KCkuZ2V0UGF0aCgpXG4gICAgKTtcbiAgfVxuXG4gIF9yZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZShmaWxlUGF0aDogTnVjbGlkZVVyaSkge1xuICAgIHJlbW92ZUFsbFBhcmVudERpcmVjdG9yaWVzRnJvbUNhY2hlKFxuICAgICAgdGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZSxcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgdGhpcy5fcHJvamVjdERpcmVjdG9yeS5nZXRQYXJlbnQoKS5nZXRQYXRoKClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiBmb3IgOjpnZXRTdGF0dXNlcy5cbiAgICogUmV0dXJucyBhIGZpbHRlciBmb3Igd2hldGhlciBvciBub3QgdGhlIGdpdmVuIHN0YXR1cyBjb2RlIHNob3VsZCBiZVxuICAgKiByZXR1cm5lZCwgZ2l2ZW4gdGhlIHBhc3NlZC1pbiBvcHRpb25zIGZvciA6OmdldFN0YXR1c2VzLlxuICAgKi9cbiAgX2dldFByZWRpY2F0ZUZvclJlbGV2YW50U3RhdHVzZXMoXG4gICAgb3B0aW9uczogP0hnU3RhdHVzQ29tbWFuZE9wdGlvbnNcbiAgKTogKGNvZGU6IFN0YXR1c0NvZGVJZFZhbHVlKSA9PiBib29sZWFuIHtcbiAgICBjb25zdCBoZ1N0YXR1c09wdGlvbiA9IHRoaXMuX2dldFN0YXR1c09wdGlvbihvcHRpb25zKTtcblxuICAgIGlmIChoZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uT05MWV9JR05PUkVEKSB7XG4gICAgICByZXR1cm4gZmlsdGVyRm9yT25seUlnbm9yZWQ7XG4gICAgfSBlbHNlIGlmIChoZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTKSB7XG4gICAgICByZXR1cm4gZmlsdGVyRm9yQWxsU3RhdHVlcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZpbHRlckZvck9ubHlOb3RJZ25vcmVkO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJldHJpZXZpbmcgRGlmZnMgKHBhcml0eSB3aXRoIEdpdFJlcG9zaXRvcnkpXG4gICAqXG4gICAqL1xuXG4gIGdldERpZmZTdGF0cyhmaWxlUGF0aDogP051Y2xpZGVVcmkpOiB7YWRkZWQ6IG51bWJlcjsgZGVsZXRlZDogbnVtYmVyO30ge1xuICAgIGNvbnN0IGNsZWFuU3RhdHMgPSB7YWRkZWQ6IDAsIGRlbGV0ZWQ6IDB9O1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBjbGVhblN0YXRzO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZWREYXRhID0gdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdO1xuICAgIHJldHVybiBjYWNoZWREYXRhID8ge2FkZGVkOiBjYWNoZWREYXRhLmFkZGVkLCBkZWxldGVkOiBjYWNoZWREYXRhLmRlbGV0ZWR9IDpcbiAgICAgICAgY2xlYW5TdGF0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIExpbmVEaWZmIHRoYXQgZGVzY3JpYmVzIHRoZSBkaWZmcyBiZXR3ZWVuIHRoZSBnaXZlblxuICAgKiBmaWxlJ3MgYEhFQURgIGNvbnRlbnRzIGFuZCBpdHMgY3VycmVudCBjb250ZW50cy5cbiAgICogTk9URTogdGhpcyBtZXRob2QgY3VycmVudGx5IGlnbm9yZXMgdGhlIHBhc3NlZC1pbiB0ZXh0LCBhbmQgaW5zdGVhZCBkaWZmc1xuICAgKiBhZ2FpbnN0IHRoZSBjdXJyZW50bHkgc2F2ZWQgY29udGVudHMgb2YgdGhlIGZpbGUuXG4gICAqL1xuICAvLyBUT0RPIChqZXNzaWNhbGluKSBFeHBvcnQgdGhlIExpbmVEaWZmIHR5cGUgKGZyb20gaGctb3V0cHV0LWhlbHBlcnMpIHdoZW5cbiAgLy8gdHlwZXMgY2FuIGJlIGV4cG9ydGVkLlxuICAvLyBUT0RPIChqZXNzaWNhbGluKSBNYWtlIHRoaXMgbWV0aG9kIHdvcmsgd2l0aCB0aGUgcGFzc2VkLWluIGB0ZXh0YC4gdDYzOTE1NzlcbiAgZ2V0TGluZURpZmZzKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSwgdGV4dDogP3N0cmluZyk6IEFycmF5PExpbmVEaWZmPiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBkaWZmSW5mbyA9IHRoaXMuX2hnRGlmZkNhY2hlW2ZpbGVQYXRoXTtcbiAgICByZXR1cm4gZGlmZkluZm8gPyBkaWZmSW5mby5saW5lRGlmZnMgOiBbXTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJldHJpZXZpbmcgRGlmZnMgKGFzeW5jIG1ldGhvZHMpXG4gICAqXG4gICAqL1xuXG4gIC8qKlxuICAgKiBSZWNvbW1lbmRlZCBtZXRob2QgdG8gdXNlIHRvIGdldCB0aGUgZGlmZiBzdGF0cyBvZiBmaWxlcyBpbiB0aGlzIHJlcG8uXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBmaWxlIHBhdGggdG8gZ2V0IHRoZSBzdGF0dXMgZm9yLiBJZiBhIHBhdGggaXMgbm90IGluIHRoZVxuICAgKiAgIHByb2plY3QsIGRlZmF1bHQgXCJjbGVhblwiIHN0YXRzIHdpbGwgYmUgcmV0dXJuZWQuXG4gICAqL1xuICBhc3luYyBnZXREaWZmU3RhdHNGb3JQYXRoKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx7YWRkZWQ6IG51bWJlcjsgZGVsZXRlZDogbnVtYmVyO30+IHtcbiAgICBjb25zdCBjbGVhblN0YXRzID0ge2FkZGVkOiAwLCBkZWxldGVkOiAwfTtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gY2xlYW5TdGF0cztcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgY2FjaGUuXG4gICAgY29uc3QgY2FjaGVkRGlmZkluZm8gPSB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF07XG4gICAgaWYgKGNhY2hlZERpZmZJbmZvKSB7XG4gICAgICByZXR1cm4ge2FkZGVkOiBjYWNoZWREaWZmSW5mby5hZGRlZCwgZGVsZXRlZDogY2FjaGVkRGlmZkluZm8uZGVsZXRlZH07XG4gICAgfVxuXG4gICAgLy8gRmFsbCBiYWNrIHRvIGEgZmV0Y2guXG4gICAgY29uc3QgZmV0Y2hlZFBhdGhUb0RpZmZJbmZvID0gYXdhaXQgdGhpcy5fdXBkYXRlRGlmZkluZm8oW2ZpbGVQYXRoXSk7XG4gICAgaWYgKGZldGNoZWRQYXRoVG9EaWZmSW5mbykge1xuICAgICAgY29uc3QgZGlmZkluZm8gPSBmZXRjaGVkUGF0aFRvRGlmZkluZm8uZ2V0KGZpbGVQYXRoKTtcbiAgICAgIGlmIChkaWZmSW5mbyAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB7YWRkZWQ6IGRpZmZJbmZvLmFkZGVkLCBkZWxldGVkOiBkaWZmSW5mby5kZWxldGVkfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2xlYW5TdGF0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNvbW1lbmRlZCBtZXRob2QgdG8gdXNlIHRvIGdldCB0aGUgbGluZSBkaWZmcyBvZiBmaWxlcyBpbiB0aGlzIHJlcG8uXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBhYnNvbHV0ZSBmaWxlIHBhdGggdG8gZ2V0IHRoZSBsaW5lIGRpZmZzIGZvci4gSWYgdGhlIHBhdGggXFxcbiAgICogICBpcyBub3QgaW4gdGhlIHByb2plY3QsIGFuIGVtcHR5IEFycmF5IHdpbGwgYmUgcmV0dXJuZWQuXG4gICAqL1xuICBhc3luYyBnZXRMaW5lRGlmZnNGb3JQYXRoKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxBcnJheTxMaW5lRGlmZj4+IHtcbiAgICBjb25zdCBsaW5lRGlmZnMgPSBbXTtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gbGluZURpZmZzO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRoZSBjYWNoZS5cbiAgICBjb25zdCBjYWNoZWREaWZmSW5mbyA9IHRoaXMuX2hnRGlmZkNhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoY2FjaGVkRGlmZkluZm8pIHtcbiAgICAgIHJldHVybiBjYWNoZWREaWZmSW5mby5saW5lRGlmZnM7XG4gICAgfVxuXG4gICAgLy8gRmFsbCBiYWNrIHRvIGEgZmV0Y2guXG4gICAgY29uc3QgZmV0Y2hlZFBhdGhUb0RpZmZJbmZvID0gYXdhaXQgdGhpcy5fdXBkYXRlRGlmZkluZm8oW2ZpbGVQYXRoXSk7XG4gICAgaWYgKGZldGNoZWRQYXRoVG9EaWZmSW5mbyAhPSBudWxsKSB7XG4gICAgICBjb25zdCBkaWZmSW5mbyA9IGZldGNoZWRQYXRoVG9EaWZmSW5mby5nZXQoZmlsZVBhdGgpO1xuICAgICAgaWYgKGRpZmZJbmZvICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGRpZmZJbmZvLmxpbmVEaWZmcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGluZURpZmZzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGRpZmYgaW5mb3JtYXRpb24gZm9yIHRoZSBnaXZlbiBwYXRocywgYW5kIHVwZGF0ZXMgdGhlIGNhY2hlLlxuICAgKiBAcGFyYW0gQW4gYXJyYXkgb2YgYWJzb2x1dGUgZmlsZSBwYXRocyBmb3Igd2hpY2ggdG8gdXBkYXRlIHRoZSBkaWZmIGluZm8uXG4gICAqIEByZXR1cm4gQSBtYXAgb2YgZWFjaCBwYXRoIHRvIGl0cyBEaWZmSW5mby5cbiAgICogICBUaGlzIG1ldGhvZCBtYXkgcmV0dXJuIGBudWxsYCBpZiB0aGUgY2FsbCB0byBgaGcgZGlmZmAgZmFpbHMuXG4gICAqICAgQSBmaWxlIHBhdGggd2lsbCBub3QgYXBwZWFyIGluIHRoZSByZXR1cm5lZCBNYXAgaWYgaXQgaXMgbm90IGluIHRoZSByZXBvLFxuICAgKiAgIGlmIGl0IGhhcyBubyBjaGFuZ2VzLCBvciBpZiB0aGVyZSBpcyBhIHBlbmRpbmcgYGhnIGRpZmZgIGNhbGwgZm9yIGl0IGFscmVhZHkuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlRGlmZkluZm8oZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPik6IFByb21pc2U8P01hcDxOdWNsaWRlVXJpLCBEaWZmSW5mbz4+IHtcbiAgICBjb25zdCBwYXRoc1RvRmV0Y2ggPSBmaWxlUGF0aHMuZmlsdGVyKGFQYXRoID0+IHtcbiAgICAgIC8vIERvbid0IHRyeSB0byBmZXRjaCBpbmZvcm1hdGlvbiBmb3IgdGhpcyBwYXRoIGlmIGl0J3Mgbm90IGluIHRoZSByZXBvLlxuICAgICAgaWYgKCF0aGlzLl9pc1BhdGhSZWxldmFudChhUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gRG9uJ3QgZG8gYW5vdGhlciB1cGRhdGUgZm9yIHRoaXMgcGF0aCBpZiB3ZSBhcmUgaW4gdGhlIG1pZGRsZSBvZiBydW5uaW5nIGFuIHVwZGF0ZS5cbiAgICAgIGlmICh0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVXBkYXRpbmcuaGFzKGFQYXRoKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVXBkYXRpbmcuYWRkKGFQYXRoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAocGF0aHNUb0ZldGNoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICAvLyBDYWxsIHRoZSBIZ1NlcnZpY2UgYW5kIHVwZGF0ZSBvdXIgY2FjaGUgd2l0aCB0aGUgcmVzdWx0cy5cbiAgICBjb25zdCBwYXRoc1RvRGlmZkluZm8gPSBhd2FpdCB0aGlzLl9zZXJ2aWNlLmZldGNoRGlmZkluZm8ocGF0aHNUb0ZldGNoKTtcbiAgICBpZiAocGF0aHNUb0RpZmZJbmZvKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWxlUGF0aCwgZGlmZkluZm9dIG9mIHBhdGhzVG9EaWZmSW5mbykge1xuICAgICAgICB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF0gPSBkaWZmSW5mbztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZmlsZXMgbWFya2VkIGZvciBkZWxldGlvbi5cbiAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVG9DbGVhci5mb3JFYWNoKGZpbGVUb0NsZWFyID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlVG9DbGVhcl07XG4gICAgfSk7XG4gICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXIuY2xlYXIoKTtcblxuICAgIC8vIFRoZSBmZXRjaGVkIGZpbGVzIGNhbiBub3cgYmUgdXBkYXRlZCBhZ2Fpbi5cbiAgICBmb3IgKGNvbnN0IHBhdGhUb0ZldGNoIG9mIHBhdGhzVG9GZXRjaCkge1xuICAgICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nLmRlbGV0ZShwYXRoVG9GZXRjaCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyAodDkxMTM5MTMpIElkZWFsbHksIHdlIGNvdWxkIHNlbmQgbW9yZSB0YXJnZXRlZCBldmVudHMgdGhhdCBiZXR0ZXJcbiAgICAvLyBkZXNjcmliZSB3aGF0IGNoYW5nZSBoYXMgb2NjdXJyZWQuIFJpZ2h0IG5vdywgR2l0UmVwb3NpdG9yeSBkaWN0YXRlcyBlaXRoZXJcbiAgICAvLyAnZGlkLWNoYW5nZS1zdGF0dXMnIG9yICdkaWQtY2hhbmdlLXN0YXR1c2VzJy5cbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnKTtcbiAgICByZXR1cm4gcGF0aHNUb0RpZmZJbmZvO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmV0cmlldmluZyBCb29rbWFyayAoYXN5bmMgbWV0aG9kcylcbiAgICpcbiAgICovXG4gIGFzeW5jIGZldGNoQ3VycmVudEJvb2ttYXJrKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IG5ld2x5RmV0Y2hlZEJvb2ttYXJrID0gJyc7XG4gICAgdHJ5IHtcbiAgICAgIG5ld2x5RmV0Y2hlZEJvb2ttYXJrID0gYXdhaXQgdGhpcy5fc2VydmljZS5mZXRjaEN1cnJlbnRCb29rbWFyaygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFN1cHByZXNzIHRoZSBlcnJvci4gVGhlcmUgYXJlIGxlZ2l0aW1hdGUgdGltZXMgd2hlbiB0aGVyZSBtYXkgYmUgbm9cbiAgICAgIC8vIGN1cnJlbnQgYm9va21hcmssIHN1Y2ggYXMgZHVyaW5nIGEgcmViYXNlLiBJbiB0aGlzIGNhc2UsIHdlIGp1c3Qgd2FudFxuICAgICAgLy8gdG8gcmV0dXJuIGFuIGVtcHR5IHN0cmluZyBpZiB0aGVyZSBpcyBubyBjdXJyZW50IGJvb2ttYXJrLlxuICAgIH1cbiAgICBpZiAobmV3bHlGZXRjaGVkQm9va21hcmsgIT09IHRoaXMuX2N1cnJlbnRCb29rbWFyaykge1xuICAgICAgdGhpcy5fY3VycmVudEJvb2ttYXJrID0gbmV3bHlGZXRjaGVkQm9va21hcms7XG4gICAgICAvLyBUaGUgQXRvbSBzdGF0dXMtYmFyIHVzZXMgdGhpcyBhcyBhIHNpZ25hbCB0byByZWZyZXNoIHRoZSAnc2hvcnRIZWFkJy5cbiAgICAgIC8vIFRoZXJlIGlzIGN1cnJlbnRseSBubyBkZWRpY2F0ZWQgJ3Nob3J0SGVhZERpZENoYW5nZScgZXZlbnQuXG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRCb29rbWFyayB8fCAnJztcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IENoZWNraW5nIE91dFxuICAgKlxuICAgKi9cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBjaGVja291dEhlYWQocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgY2hlY2tvdXRSZWZlcmVuY2UocmVmZXJlbmNlOiBzdHJpbmcsIGNyZWF0ZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHRoZSBhc3luYyB2ZXJzaW9uIG9mIHdoYXQgY2hlY2tvdXRSZWZlcmVuY2UoKSBpcyBtZWFudCB0byBkby5cbiAgICovXG4gIGFzeW5jIGNoZWNrb3V0UmV2aXNpb24ocmVmZXJlbmNlOiBzdHJpbmcsIGNyZWF0ZTogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGF3YWl0IHRoaXMuX3NlcnZpY2UuY2hlY2tvdXQocmVmZXJlbmNlLCBjcmVhdGUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogSGdTZXJ2aWNlIHN1YnNjcmlwdGlvbnNcbiAgICpcbiAgICovXG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGNhY2hlIGluIHJlc3BvbnNlIHRvIGFueSBudW1iZXIgb2YgKG5vbi0uaGdpZ25vcmUpIGZpbGVzIGNoYW5naW5nLlxuICAgKiBAcGFyYW0gdXBkYXRlIFRoZSBjaGFuZ2VkIGZpbGUgcGF0aHMuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlQ2hhbmdlZFBhdGhzKGNoYW5nZWRQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCByZWxldmFudENoYW5nZWRQYXRocyA9IGNoYW5nZWRQYXRocy5maWx0ZXIodGhpcy5faXNQYXRoUmVsZXZhbnQuYmluZCh0aGlzKSk7XG4gICAgaWYgKHJlbGV2YW50Q2hhbmdlZFBhdGhzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAocmVsZXZhbnRDaGFuZ2VkUGF0aHMubGVuZ3RoIDw9IE1BWF9JTkRJVklEVUFMX0NIQU5HRURfUEFUSFMpIHtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgc3RhdHVzZXMgaW5kaXZpZHVhbGx5LlxuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlU3RhdHVzZXMoXG4gICAgICAgIHJlbGV2YW50Q2hhbmdlZFBhdGhzLFxuICAgICAgICB7aGdTdGF0dXNPcHRpb246IEhnU3RhdHVzT3B0aW9uLkFMTF9TVEFUVVNFU30sXG4gICAgICApO1xuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZkluZm8oXG4gICAgICAgIHJlbGV2YW50Q2hhbmdlZFBhdGhzLmZpbHRlcihmaWxlUGF0aCA9PiB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF0pLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhpcyBpcyBhIGhldXJpc3RpYyB0byBpbXByb3ZlIHBlcmZvcm1hbmNlLiBNYW55IGZpbGVzIGJlaW5nIGNoYW5nZWQgbWF5XG4gICAgICAvLyBiZSBhIHNpZ24gdGhhdCB3ZSBhcmUgcGlja2luZyB1cCBjaGFuZ2VzIHRoYXQgd2VyZSBjcmVhdGVkIGluIGFuIGF1dG9tYXRlZFxuICAgICAgLy8gd2F5IC0tIHNvIGluIGFkZGl0aW9uLCB0aGVyZSBtYXkgYmUgbWFueSBiYXRjaGVzIG9mIGNoYW5nZXMgaW4gc3VjY2Vzc2lvbi5cbiAgICAgIC8vIFRoZSByZWZyZXNoIGlzIHNlcmlhbGl6ZWQsIHNvIGl0IGlzIHNhZmUgdG8gY2FsbCBpdCBtdWx0aXBsZSB0aW1lcyBpbiBzdWNjZXNzaW9uLlxuICAgICAgYXdhaXQgdGhpcy5fc2VyaWFsaXplZFJlZnJlc2hTdGF0dXNlc0NhY2hlKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3JlZnJlc2hTdGF0dXNlc09mQWxsRmlsZXNJbkNhY2hlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX2hnU3RhdHVzQ2FjaGUgPSB7fTtcbiAgICB0aGlzLl9tb2RpZmllZERpcmVjdG9yeUNhY2hlID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IHBhdGhzSW5EaWZmQ2FjaGUgPSBPYmplY3Qua2V5cyh0aGlzLl9oZ0RpZmZDYWNoZSk7XG4gICAgdGhpcy5faGdEaWZmQ2FjaGUgPSB7fTtcbiAgICAvLyBXZSBzaG91bGQgZ2V0IHRoZSBtb2RpZmllZCBzdGF0dXMgb2YgYWxsIGZpbGVzIGluIHRoZSByZXBvIHRoYXQgaXNcbiAgICAvLyB1bmRlciB0aGUgSGdSZXBvc2l0b3J5Q2xpZW50J3MgcHJvamVjdCBkaXJlY3RvcnksIGJlY2F1c2Ugd2hlbiBIZ1xuICAgIC8vIG1vZGlmaWVzIHRoZSByZXBvLCBpdCBkb2Vzbid0IG5lY2Vzc2FyaWx5IG9ubHkgbW9kaWZ5IGZpbGVzIHRoYXQgd2VyZVxuICAgIC8vIHByZXZpb3VzbHkgbW9kaWZpZWQuXG4gICAgYXdhaXQgdGhpcy5fdXBkYXRlU3RhdHVzZXMoXG4gICAgICBbdGhpcy5nZXRQcm9qZWN0RGlyZWN0b3J5KCldLFxuICAgICAge2hnU3RhdHVzT3B0aW9uOiBIZ1N0YXR1c09wdGlvbi5PTkxZX05PTl9JR05PUkVEfSxcbiAgICApO1xuICAgIGlmIChwYXRoc0luRGlmZkNhY2hlLmxlbmd0aCA+IDApIHtcbiAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZJbmZvKHBhdGhzSW5EaWZmQ2FjaGUpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJlcG9zaXRvcnkgU3RhdGUgYXQgU3BlY2lmaWMgUmV2aXNpb25zXG4gICAqXG4gICAqL1xuICBmZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aDogTnVjbGlkZVVyaSwgcmV2aXNpb246ID9zdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5mZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aCwgcmV2aXNpb24pO1xuICB9XG5cbiAgZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKHJldmlzaW9uOiBzdHJpbmcpOiBQcm9taXNlPD9SZXZpc2lvbkZpbGVDaGFuZ2VzPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKHJldmlzaW9uKTtcbiAgfVxuXG4gIGZldGNoUmV2aXNpb25JbmZvQmV0d2VlbkhlYWRBbmRCYXNlKCk6IFByb21pc2U8P0FycmF5PFJldmlzaW9uSW5mbz4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5mZXRjaFJldmlzaW9uSW5mb0JldHdlZW5IZWFkQW5kQmFzZSgpO1xuICB9XG5cbiAgLy8gU2VlIEhnU2VydmljZS5nZXRCbGFtZUF0SGVhZC5cbiAgZ2V0QmxhbWVBdEhlYWQoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPE1hcDxzdHJpbmcsIHN0cmluZz4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5nZXRCbGFtZUF0SGVhZChmaWxlUGF0aCk7XG4gIH1cblxuICBnZXRDb25maWdWYWx1ZUFzeW5jKGtleTogc3RyaW5nLCBwYXRoOiA/c3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZ2V0Q29uZmlnVmFsdWVBc3luYyhrZXkpO1xuICB9XG5cbiAgLy8gU2VlIEhnU2VydmljZS5nZXREaWZmZXJlbnRpYWxSZXZpc2lvbkZvckNoYW5nZVNldElkLlxuICBnZXREaWZmZXJlbnRpYWxSZXZpc2lvbkZvckNoYW5nZVNldElkKGNoYW5nZVNldElkOiBzdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5nZXREaWZmZXJlbnRpYWxSZXZpc2lvbkZvckNoYW5nZVNldElkKGNoYW5nZVNldElkKTtcbiAgfVxuXG4gIGdldFNtYXJ0bG9nKHR0eU91dHB1dDogYm9vbGVhbiwgY29uY2lzZTogYm9vbGVhbik6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZ2V0U21hcnRsb2codHR5T3V0cHV0LCBjb25jaXNlKTtcbiAgfVxuXG4gIHJlbmFtZShvbGRGaWxlUGF0aDogc3RyaW5nLCBuZXdGaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UucmVuYW1lKG9sZEZpbGVQYXRoLCBuZXdGaWxlUGF0aCk7XG4gIH1cblxuICByZW1vdmUoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLnJlbW92ZShmaWxlUGF0aCk7XG4gIH1cblxuICBhZGQoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmFkZChmaWxlUGF0aCk7XG4gIH1cblxuICBjb21taXQobWVzc2FnZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuY29tbWl0KG1lc3NhZ2UpO1xuICB9XG5cbiAgYW1lbmQobWVzc2FnZTogP3N0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmFtZW5kKG1lc3NhZ2UpO1xuICB9XG5cbiAgX2dldFN0YXR1c09wdGlvbihvcHRpb25zOiA/SGdTdGF0dXNDb21tYW5kT3B0aW9ucyk6ID9IZ1N0YXR1c09wdGlvblZhbHVlIHtcbiAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnMuaGdTdGF0dXNPcHRpb247XG4gIH1cbn1cbiJdfQ==