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

/**
 *
 * Section: Constants, Type Definitions
 *
 */

var EDITOR_SUBSCRIPTION_NAME = 'hg-repository-editor-subscription';
var DEBOUNCE_MILLISECONDS_FOR_REFRESH_ALL = 500;
exports.DEBOUNCE_MILLISECONDS_FOR_REFRESH_ALL = DEBOUNCE_MILLISECONDS_FOR_REFRESH_ALL;
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

    // Get updates that tell the HgRepositoryClient when to clear its caches.
    this._service.observeFilesDidChange().subscribe(this._filesDidChange.bind(this));
    this._service.observeHgIgnoreFileDidChange().subscribe(this._refreshStatusesOfAllFilesInCache.bind(this));
    this._service.observeHgRepoStateDidChange().subscribe(this._refreshStatusesOfAllFilesInCache.bind(this));
    this._service.observeHgBookmarkDidChange().subscribe(this.fetchCurrentBookmark.bind(this));

    this._isRefreshingAllFilesInCache = false;
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
      return yield this._service.checkout(reference, create);
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
    key: '_filesDidChange',
    value: function _filesDidChange(changedPaths) {
      var _this6 = this;

      var relevantChangedPaths = changedPaths.filter(this._isPathRelevant.bind(this));
      if (relevantChangedPaths.length === 0) {
        return;
      } else if (relevantChangedPaths.length <= MAX_INDIVIDUAL_CHANGED_PATHS) {
        // Update the statuses individually.
        this._updateStatuses(relevantChangedPaths, { hgStatusOption: _hgRepositoryBaseLibHgConstants.HgStatusOption.ALL_STATUSES });
        this._updateDiffInfo(relevantChangedPaths.filter(function (filePath) {
          return _this6._hgDiffCache[filePath];
        }));
      } else {
        // This is a heuristic to improve performance. Many files being changed may
        // be a sign that we are picking up changes that were created in an automated
        // way -- so in addition, there may be many batches of changes in succession.
        // _refreshStatusesOfAllFilesInCache debounces calls, so it is safe to call
        // it multiple times in succession.
        this._refreshStatusesOfAllFilesInCache();
      }
    }
  }, {
    key: '_refreshStatusesOfAllFilesInCache',
    value: function _refreshStatusesOfAllFilesInCache() {
      var _this7 = this;

      var debouncedRefreshAll = this._debouncedRefreshAll;
      if (debouncedRefreshAll == null) {
        var doRefresh = _asyncToGenerator(function* () {
          if (_this7._isRefreshingAllFilesInCache) {
            return;
          }
          _this7._isRefreshingAllFilesInCache = true;

          var pathsInStatusCache = Object.keys(_this7._hgStatusCache);
          _this7._hgStatusCache = {};
          _this7._modifiedDirectoryCache = new Map();
          // We should get the modified status of all files in the repo that is
          // under the HgRepositoryClient's project directory, because when Hg
          // modifies the repo, it doesn't necessarily only modify files that were
          // previously modified.
          _this7._updateStatuses([_this7.getProjectDirectory()], { hgStatusOption: _hgRepositoryBaseLibHgConstants.HgStatusOption.ONLY_NON_IGNORED });
          if (pathsInStatusCache.length) {
            // The logic is a bit different for ignored files, because the
            // HgRepositoryClient always fetches ignored statuses lazily (as callers
            // ask for them). So, we only fetch the ignored status of files already
            // in the cache. (Note: if I ask Hg for the 'ignored' status of a list of
            // files, and none of them are ignored, no statuses will be returned.)
            yield _this7._updateStatuses(pathsInStatusCache, { hgStatusOption: _hgRepositoryBaseLibHgConstants.HgStatusOption.ONLY_IGNORED });
          }

          var pathsInDiffCache = Object.keys(_this7._hgDiffCache);
          _this7._hgDiffCache = {};
          yield _this7._updateDiffInfo(pathsInDiffCache);

          _this7._isRefreshingAllFilesInCache = false;
        });
        this._debouncedRefreshAll = (0, _commons.debounce)(doRefresh, DEBOUNCE_MILLISECONDS_FOR_REFRESH_ALL,
        /* immediate */false);
        debouncedRefreshAll = this._debouncedRefreshAll;
      }
      debouncedRefreshAll();
    }

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

// A debounced function that eventually calls _doRefreshStatusesOfAllFilesInCache.
//# sourceMappingURL=data:application/json;base64,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bGUiOiJIZ1JlcG9zaXRvcnlDbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIERpZmZJbmZvLFxuICBIZ1N0YXR1c09wdGlvblZhbHVlLFxuICBMaW5lRGlmZixcbiAgUmV2aXNpb25JbmZvLFxuICBSZXZpc2lvbkZpbGVDaGFuZ2VzLFxuICBTdGF0dXNDb2RlSWRWYWx1ZSxcbiAgU3RhdHVzQ29kZU51bWJlclZhbHVlLFxufSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL2hnLWNvbnN0YW50cyc7XG5cbmltcG9ydCB0eXBlIHtcbiAgSGdTZXJ2aWNlLFxufSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL0hnU2VydmljZS5qcyc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBTdGF0dXNDb2RlSWQsXG4gIFN0YXR1c0NvZGVJZFRvTnVtYmVyLFxuICBTdGF0dXNDb2RlTnVtYmVyLFxuICBIZ1N0YXR1c09wdGlvbixcbn0gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHtkZWJvdW5jZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge2Vuc3VyZVRyYWlsaW5nU2VwYXJhdG9yfSBmcm9tICcuLi8uLi9jb21tb25zL2xpYi9wYXRocyc7XG5pbXBvcnQge2FkZEFsbFBhcmVudERpcmVjdG9yaWVzVG9DYWNoZSwgcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGV9IGZyb20gJy4vdXRpbHMnO1xuXG50eXBlIEhnUmVwb3NpdG9yeU9wdGlvbnMgPSB7XG4gIC8qKiBUaGUgb3JpZ2luIFVSTCBvZiB0aGlzIHJlcG9zaXRvcnkuICovXG4gIG9yaWdpblVSTDogP3N0cmluZztcblxuICAvKiogVGhlIHdvcmtpbmcgZGlyZWN0b3J5IG9mIHRoaXMgcmVwb3NpdG9yeS4gKi9cbiAgd29ya2luZ0RpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3Rvcnk7XG5cbiAgLyoqIFRoZSByb290IGRpcmVjdG9yeSB0aGF0IGlzIG9wZW5lZCBpbiBBdG9tLCB3aGljaCB0aGlzIFJlcG9zaXRvcnkgc2VydmVzLiAqKi9cbiAgcHJvamVjdFJvb3REaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5O1xufTtcblxuLyoqXG4gKlxuICogU2VjdGlvbjogQ29uc3RhbnRzLCBUeXBlIERlZmluaXRpb25zXG4gKlxuICovXG5cbmV4cG9ydCB0eXBlIEhnU3RhdHVzQ29tbWFuZE9wdGlvbnMgPSB7XG4gIGhnU3RhdHVzT3B0aW9uOiBIZ1N0YXR1c09wdGlvblZhbHVlO1xufTtcblxuY29uc3QgRURJVE9SX1NVQlNDUklQVElPTl9OQU1FID0gJ2hnLXJlcG9zaXRvcnktZWRpdG9yLXN1YnNjcmlwdGlvbic7XG5leHBvcnQgY29uc3QgREVCT1VOQ0VfTUlMTElTRUNPTkRTX0ZPUl9SRUZSRVNIX0FMTCA9IDUwMDtcbmV4cG9ydCBjb25zdCBNQVhfSU5ESVZJRFVBTF9DSEFOR0VEX1BBVEhTID0gMTtcblxuZnVuY3Rpb24gZmlsdGVyRm9yT25seU5vdElnbm9yZWQoY29kZTogU3RhdHVzQ29kZUlkVmFsdWUpOiBib29sZWFuIHtcbiAgcmV0dXJuIChjb2RlICE9PSBTdGF0dXNDb2RlSWQuSUdOT1JFRCk7XG59XG5cbmZ1bmN0aW9uIGZpbHRlckZvck9ubHlJZ25vcmVkKGNvZGU6IFN0YXR1c0NvZGVJZFZhbHVlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoY29kZSA9PT0gU3RhdHVzQ29kZUlkLklHTk9SRUQpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJGb3JBbGxTdGF0dWVzKCkge1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuXG4vKipcbiAqXG4gKiBTZWN0aW9uOiBIZ1JlcG9zaXRvcnlDbGllbnRcbiAqXG4gKi9cblxuLyoqXG4gKiBIZ1JlcG9zaXRvcnlDbGllbnQgcnVucyBvbiB0aGUgbWFjaGluZSB0aGF0IE51Y2xpZGUvQXRvbSBpcyBydW5uaW5nIG9uLlxuICogSXQgaXMgdGhlIGludGVyZmFjZSB0aGF0IG90aGVyIEF0b20gcGFja2FnZXMgd2lsbCB1c2UgdG8gYWNjZXNzIE1lcmN1cmlhbC5cbiAqIEl0IGNhY2hlcyBkYXRhIGZldGNoZWQgZnJvbSBhbiBIZ1NlcnZpY2UuXG4gKiBJdCBpbXBsZW1lbnRzIHRoZSBzYW1lIGludGVyZmFjZSBhcyBHaXRSZXBvc2l0b3J5LCAoaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL2xhdGVzdC9HaXRSZXBvc2l0b3J5KVxuICogaW4gYWRkaXRpb24gdG8gcHJvdmlkaW5nIGFzeW5jaHJvbm91cyBtZXRob2RzIGZvciBzb21lIGdldHRlcnMuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1JlbW90ZURpcmVjdG9yeX0gZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZ1JlcG9zaXRvcnlDbGllbnQge1xuICBfcGF0aDogc3RyaW5nO1xuICBfd29ya2luZ0RpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3Rvcnk7XG4gIF9wcm9qZWN0RGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeTtcbiAgX29yaWdpblVSTDogP3N0cmluZztcbiAgX3NlcnZpY2U6IEhnU2VydmljZTtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIC8vIEEgbWFwIGZyb20gYSBrZXkgKGluIG1vc3QgY2FzZXMsIGEgZmlsZSBwYXRoKSwgdG8gYSByZWxhdGVkIERpc3Bvc2FibGUuXG4gIF9kaXNwb3NhYmxlczoge1trZXk6IHN0cmluZ106IElEaXNwb3NhYmxlfTtcbiAgX2hnU3RhdHVzQ2FjaGU6IHtbZmlsZVBhdGg6IE51Y2xpZGVVcmldOiBTdGF0dXNDb2RlSWRWYWx1ZX07XG4gIC8vIE1hcCBvZiBkaXJlY3RvcnkgcGF0aCB0byB0aGUgbnVtYmVyIG9mIG1vZGlmaWVkIGZpbGVzIHdpdGhpbiB0aGF0IGRpcmVjdG9yeS5cbiAgX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGU6IE1hcDxzdHJpbmcsIG51bWJlcj47XG4gIF9oZ0RpZmZDYWNoZToge1tmaWxlUGF0aDogTnVjbGlkZVVyaV06IERpZmZJbmZvfTtcbiAgX2hnRGlmZkNhY2hlRmlsZXNVcGRhdGluZzogU2V0PE51Y2xpZGVVcmk+O1xuICBfaGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXI6IFNldDxOdWNsaWRlVXJpPjtcblxuICAvLyBBIGRlYm91bmNlZCBmdW5jdGlvbiB0aGF0IGV2ZW50dWFsbHkgY2FsbHMgX2RvUmVmcmVzaFN0YXR1c2VzT2ZBbGxGaWxlc0luQ2FjaGUuXG4gIF9kZWJvdW5jZWRSZWZyZXNoQWxsOiA/KCkgPT4gbWl4ZWQ7XG4gIF9pc1JlZnJlc2hpbmdBbGxGaWxlc0luQ2FjaGU6IGJvb2xlYW47XG5cbiAgX2N1cnJlbnRCb29rbWFyazogP3N0cmluZztcblxuICBjb25zdHJ1Y3RvcihyZXBvUGF0aDogc3RyaW5nLCBoZ1NlcnZpY2U6IEhnU2VydmljZSwgb3B0aW9uczogSGdSZXBvc2l0b3J5T3B0aW9ucykge1xuICAgIHRoaXMuX3BhdGggPSByZXBvUGF0aDtcbiAgICB0aGlzLl93b3JraW5nRGlyZWN0b3J5ID0gb3B0aW9ucy53b3JraW5nRGlyZWN0b3J5O1xuICAgIHRoaXMuX3Byb2plY3REaXJlY3RvcnkgPSBvcHRpb25zLnByb2plY3RSb290RGlyZWN0b3J5O1xuICAgIHRoaXMuX29yaWdpblVSTCA9IG9wdGlvbnMub3JpZ2luVVJMO1xuICAgIHRoaXMuX3NlcnZpY2UgPSBoZ1NlcnZpY2U7XG5cbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IHt9O1xuXG4gICAgdGhpcy5faGdTdGF0dXNDYWNoZSA9IHt9O1xuICAgIHRoaXMuX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGUgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9oZ0RpZmZDYWNoZSA9IHt9O1xuICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNVcGRhdGluZyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVG9DbGVhciA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlc1tFRElUT1JfU1VCU0NSSVBUSU9OX05BTUVdID0gYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKGVkaXRvciA9PiB7XG4gICAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICAgIC8vIFRPRE86IG9ic2VydmUgZm9yIHdoZW4gdGhpcyBlZGl0b3IncyBwYXRoIGNoYW5nZXMuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5faXNQYXRoUmVsZXZhbnQoZmlsZVBhdGgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIElmIHRoaXMgZWRpdG9yIGhhcyBiZWVuIHByZXZpb3VzbHkgYWN0aXZlLCB3ZSB3aWxsIGhhdmUgYWxyZWFkeVxuICAgICAgLy8gaW5pdGlhbGl6ZWQgZGlmZiBpbmZvIGFuZCByZWdpc3RlcmVkIGxpc3RlbmVycyBvbiBpdC5cbiAgICAgIGlmICh0aGlzLl9kaXNwb3NhYmxlc1tmaWxlUGF0aF0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gVE9ETyAodDgyMjc1NzApIEdldCBpbml0aWFsIGRpZmYgc3RhdHMgZm9yIHRoaXMgZWRpdG9yLCBhbmQgcmVmcmVzaFxuICAgICAgLy8gdGhpcyBpbmZvcm1hdGlvbiB3aGVuZXZlciB0aGUgY29udGVudCBvZiB0aGUgZWRpdG9yIGNoYW5nZXMuXG4gICAgICBjb25zdCBlZGl0b3JTdWJzY3JpcHRpb25zID0gdGhpcy5fZGlzcG9zYWJsZXNbZmlsZVBhdGhdID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5vbkRpZFNhdmUoZXZlbnQgPT4ge1xuICAgICAgICB0aGlzLl91cGRhdGVEaWZmSW5mbyhbZXZlbnQucGF0aF0pO1xuICAgICAgfSkpO1xuICAgICAgLy8gUmVtb3ZlIHRoZSBmaWxlIGZyb20gdGhlIGRpZmYgc3RhdHMgY2FjaGUgd2hlbiB0aGUgZWRpdG9yIGlzIGNsb3NlZC5cbiAgICAgIC8vIFRoaXMgaXNuJ3Qgc3RyaWN0bHkgbmVjZXNzYXJ5LCBidXQga2VlcHMgdGhlIGNhY2hlIGFzIHNtYWxsIGFzIHBvc3NpYmxlLlxuICAgICAgLy8gVGhlcmUgYXJlIGNhc2VzIHdoZXJlIHRoaXMgcmVtb3ZhbCBtYXkgcmVzdWx0IGluIHJlbW92aW5nIGluZm9ybWF0aW9uXG4gICAgICAvLyB0aGF0IGlzIHN0aWxsIHJlbGV2YW50OiBlLmcuXG4gICAgICAvLyAgICogaWYgdGhlIHVzZXIgdmVyeSBxdWlja2x5IGNsb3NlcyBhbmQgcmVvcGVucyBhIGZpbGU7IG9yXG4gICAgICAvLyAgICogaWYgdGhlIGZpbGUgaXMgb3BlbiBpbiBtdWx0aXBsZSBlZGl0b3JzLCBhbmQgb25lIG9mIHRob3NlIGlzIGNsb3NlZC5cbiAgICAgIC8vIFRoZXNlIGFyZSBwcm9iYWJseSBlZGdlIGNhc2VzLCB0aG91Z2gsIGFuZCB0aGUgaW5mb3JtYXRpb24gd2lsbCBiZVxuICAgICAgLy8gcmVmZXRjaGVkIHRoZSBuZXh0IHRpbWUgdGhlIGZpbGUgaXMgZWRpdGVkLlxuICAgICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNUb0NsZWFyLmFkZChmaWxlUGF0aCk7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzW2ZpbGVQYXRoXS5kaXNwb3NlKCk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9kaXNwb3NhYmxlc1tmaWxlUGF0aF07XG4gICAgICB9KSk7XG4gICAgfSk7XG5cbiAgICAvLyBHZXQgdXBkYXRlcyB0aGF0IHRlbGwgdGhlIEhnUmVwb3NpdG9yeUNsaWVudCB3aGVuIHRvIGNsZWFyIGl0cyBjYWNoZXMuXG4gICAgdGhpcy5fc2VydmljZS5vYnNlcnZlRmlsZXNEaWRDaGFuZ2UoKS5zdWJzY3JpYmUodGhpcy5fZmlsZXNEaWRDaGFuZ2UuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fc2VydmljZS5vYnNlcnZlSGdJZ25vcmVGaWxlRGlkQ2hhbmdlKClcbiAgICAgIC5zdWJzY3JpYmUodGhpcy5fcmVmcmVzaFN0YXR1c2VzT2ZBbGxGaWxlc0luQ2FjaGUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fc2VydmljZS5vYnNlcnZlSGdSZXBvU3RhdGVEaWRDaGFuZ2UoKVxuICAgICAgLnN1YnNjcmliZSh0aGlzLl9yZWZyZXNoU3RhdHVzZXNPZkFsbEZpbGVzSW5DYWNoZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVIZ0Jvb2ttYXJrRGlkQ2hhbmdlKClcbiAgICAgIC5zdWJzY3JpYmUodGhpcy5mZXRjaEN1cnJlbnRCb29rbWFyay5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuX2lzUmVmcmVzaGluZ0FsbEZpbGVzSW5DYWNoZSA9IGZhbHNlO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95Jyk7XG4gICAgdGhpcy5fZW1pdHRlci5kaXNwb3NlKCk7XG4gICAgT2JqZWN0LmtleXModGhpcy5fZGlzcG9zYWJsZXMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzW2tleV0uZGlzcG9zZSgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NlcnZpY2UuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IEV2ZW50IFN1YnNjcmlwdGlvblxuICAgKlxuICAgKi9cblxuICBvbkRpZERlc3Ryb3koY2FsbGJhY2s6ICgpID0+IG1peGVkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdkaWQtZGVzdHJveScsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlU3RhdHVzKFxuICAgIGNhbGxiYWNrOiAoZXZlbnQ6IHtwYXRoOiBzdHJpbmc7IHBhdGhTdGF0dXM6IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZX0pID0+IG1peGVkLFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1jaGFuZ2Utc3RhdHVzJywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VTdGF0dXNlcyhjYWxsYmFjazogKCkgPT4gbWl4ZWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnLCBjYWxsYmFjayk7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZXBvc2l0b3J5IERldGFpbHNcbiAgICpcbiAgICovXG5cbiAgZ2V0VHlwZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnaGcnO1xuICB9XG5cbiAgZ2V0UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9wYXRoO1xuICB9XG5cbiAgZ2V0V29ya2luZ0RpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl93b3JraW5nRGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgfVxuXG4gIC8vIEByZXR1cm4gVGhlIHBhdGggb2YgdGhlIHJvb3QgcHJvamVjdCBmb2xkZXIgaW4gQXRvbSB0aGF0IHRoaXNcbiAgLy8gSGdSZXBvc2l0b3J5Q2xpZW50IHByb3ZpZGVzIGluZm9ybWF0aW9uIGFib3V0LlxuICBnZXRQcm9qZWN0RGlyZWN0b3J5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2plY3REaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgaXNQcm9qZWN0QXRSb290KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmVsYXRpdml6ZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkucmVsYXRpdml6ZShmaWxlUGF0aCk7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBoYXNCcmFuY2goYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiBUaGUgY3VycmVudCBIZyBib29rbWFyay5cbiAgICovXG4gIGdldFNob3J0SGVhZChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLl9jdXJyZW50Qm9va21hcmspIHtcbiAgICAgIC8vIEtpY2sgb2ZmIGEgZmV0Y2ggdG8gZ2V0IHRoZSBjdXJyZW50IGJvb2ttYXJrLiBUaGlzIGlzIGFzeW5jLlxuICAgICAgdGhpcy5mZXRjaEN1cnJlbnRCb29rbWFyaygpO1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEJvb2ttYXJrO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgaXNTdWJtb2R1bGUocGF0aDogTnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldEFoZWFkQmVoaW5kQ291bnQocmVmZXJlbmNlOiBzdHJpbmcsIHBhdGg6IE51Y2xpZGVVcmkpOiBudW1iZXIge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0Q2FjaGVkVXBzdHJlYW1BaGVhZEJlaGluZENvdW50KHBhdGg6ID9OdWNsaWRlVXJpKToge2FoZWFkOiBudW1iZXI7IGJlaGluZDogbnVtYmVyO30ge1xuICAgIHJldHVybiB7XG4gICAgICBhaGVhZDogMCxcbiAgICAgIGJlaGluZDogMCxcbiAgICB9O1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0Q29uZmlnVmFsdWUoa2V5OiBzdHJpbmcsIHBhdGg6ID9zdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldE9yaWdpblVSTChwYXRoOiA/c3RyaW5nKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX29yaWdpblVSTDtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldFVwc3RyZWFtQnJhbmNoKHBhdGg6ID9zdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldFJlZmVyZW5jZXMoXG4gICAgcGF0aDogP051Y2xpZGVVcmksXG4gICk6IHtoZWFkczogQXJyYXk8c3RyaW5nPjsgcmVtb3RlczogQXJyYXk8c3RyaW5nPjsgdGFnczogQXJyYXk8c3RyaW5nPjt9IHtcbiAgICByZXR1cm4ge1xuICAgICAgaGVhZHM6IFtdLFxuICAgICAgcmVtb3RlczogW10sXG4gICAgICB0YWdzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0UmVmZXJlbmNlVGFyZ2V0KHJlZmVyZW5jZTogc3RyaW5nLCBwYXRoOiA/TnVjbGlkZVVyaSk6ID9zdHJpbmcge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmVhZGluZyBTdGF0dXMgKHBhcml0eSB3aXRoIEdpdFJlcG9zaXRvcnkpXG4gICAqXG4gICAqL1xuXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIENhbiB3ZSBjaGFuZ2UgdGhlIEFQSSB0byBtYWtlIHRoaXMgbWV0aG9kIHJldHVybiBhIFByb21pc2U/XG4gIC8vIElmIG5vdCwgbWlnaHQgbmVlZCB0byBkbyBhIHN5bmNocm9ub3VzIGBoZyBzdGF0dXNgIHF1ZXJ5LlxuICBpc1BhdGhNb2RpZmllZChmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZFBhdGhTdGF0dXMgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoIWNhY2hlZFBhdGhTdGF0dXMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaXNTdGF0dXNNb2RpZmllZChTdGF0dXNDb2RlSWRUb051bWJlcltjYWNoZWRQYXRoU3RhdHVzXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgQ2FuIHdlIGNoYW5nZSB0aGUgQVBJIHRvIG1ha2UgdGhpcyBtZXRob2QgcmV0dXJuIGEgUHJvbWlzZT9cbiAgLy8gSWYgbm90LCBtaWdodCBuZWVkIHRvIGRvIGEgc3luY2hyb25vdXMgYGhnIHN0YXR1c2AgcXVlcnkuXG4gIGlzUGF0aE5ldyhmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZFBhdGhTdGF0dXMgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoIWNhY2hlZFBhdGhTdGF0dXMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaXNTdGF0dXNOZXcoU3RhdHVzQ29kZUlkVG9OdW1iZXJbY2FjaGVkUGF0aFN0YXR1c10pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIENhbiB3ZSBjaGFuZ2UgdGhlIEFQSSB0byBtYWtlIHRoaXMgbWV0aG9kIHJldHVybiBhIFByb21pc2U/XG4gIC8vIElmIG5vdCwgdGhpcyBtZXRob2QgbGllcyBhIGJpdCBieSB1c2luZyBjYWNoZWQgaW5mb3JtYXRpb24uXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIE1ha2UgdGhpcyB3b3JrIGZvciBpZ25vcmVkIGRpcmVjdG9yaWVzLlxuICBpc1BhdGhJZ25vcmVkKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gYGhnIHN0YXR1cyAtaWAgZG9lcyBub3QgbGlzdCB0aGUgcmVwbyAodGhlIC5oZyBkaXJlY3RvcnkpLCBwcmVzdW1hYmx5XG4gICAgLy8gYmVjYXVzZSB0aGUgcmVwbyBkb2VzIG5vdCB0cmFjayBpdHNlbGYuXG4gICAgLy8gV2Ugd2FudCB0byByZXByZXNlbnQgdGhlIGZhY3QgdGhhdCBpdCdzIG5vdCBwYXJ0IG9mIHRoZSB0cmFja2VkIGNvbnRlbnRzLFxuICAgIC8vIHNvIHdlIG1hbnVhbGx5IGFkZCBhbiBleGNlcHRpb24gZm9yIGl0IHZpYSB0aGUgX2lzUGF0aFdpdGhpbkhnUmVwbyBjaGVjay5cbiAgICByZXR1cm4gKHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdID09PSBTdGF0dXNDb2RlSWQuSUdOT1JFRCkgfHxcbiAgICAgICAgdGhpcy5faXNQYXRoV2l0aGluSGdSZXBvKGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGdpdmVuIHBhdGggaXMgd2l0aGluIHRoZSByZXBvIGRpcmVjdG9yeSAoaS5lLiBgLmhnL2ApLlxuICAgKi9cbiAgX2lzUGF0aFdpdGhpbkhnUmVwbyhmaWxlUGF0aDogTnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoZmlsZVBhdGggPT09IHRoaXMuZ2V0UGF0aCgpKSB8fCAoZmlsZVBhdGguaW5kZXhPZih0aGlzLmdldFBhdGgoKSArICcvJykgPT09IDApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIGEgcGF0aCBpcyByZWxldmFudCB0byB0aGlzIEhnUmVwb3NpdG9yeUNsaWVudC4gQSBwYXRoIGlzXG4gICAqIGRlZmluZWQgYXMgJ3JlbGV2YW50JyBpZiBpdCBpcyB3aXRoaW4gdGhlIHByb2plY3QgZGlyZWN0b3J5IG9wZW5lZCB3aXRoaW4gdGhlIHJlcG8uXG4gICAqL1xuICBfaXNQYXRoUmVsZXZhbnQoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvamVjdERpcmVjdG9yeS5jb250YWlucyhmaWxlUGF0aCkgfHxcbiAgICAgICAgICAgKHRoaXMuX3Byb2plY3REaXJlY3RvcnkuZ2V0UGF0aCgpID09PSBmaWxlUGF0aCk7XG4gIH1cblxuICAvLyBGb3Igbm93LCB0aGlzIG1ldGhvZCBvbmx5IHJlZmxlY3RzIHRoZSBzdGF0dXMgb2YgXCJtb2RpZmllZFwiIGRpcmVjdG9yaWVzLlxuICAvLyBUcmFja2luZyBkaXJlY3Rvcnkgc3RhdHVzIGlzbid0IHN0cmFpZ2h0Zm9yd2FyZCwgYXMgSGcgb25seSB0cmFja3MgZmlsZXMuXG4gIC8vIGh0dHA6Ly9tZXJjdXJpYWwuc2VsZW5pYy5jb20vd2lraS9GQVEjRkFRLjJGQ29tbW9uUHJvYmxlbXMuSV90cmllZF90b19jaGVja19pbl9hbl9lbXB0eV9kaXJlY3RvcnlfYW5kX2l0X2ZhaWxlZC4yMVxuICAvLyBUT0RPOiBNYWtlIHRoaXMgbWV0aG9kIHJlZmxlY3QgTmV3IGFuZCBJZ25vcmVkIHN0YXR1c2VzLlxuICBnZXREaXJlY3RvcnlTdGF0dXMoZGlyZWN0b3J5UGF0aDogP3N0cmluZyk6IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZSB7XG4gICAgaWYgKCFkaXJlY3RvcnlQYXRoKSB7XG4gICAgICByZXR1cm4gU3RhdHVzQ29kZU51bWJlci5DTEVBTjtcbiAgICB9XG4gICAgY29uc3QgZGlyZWN0b3J5UGF0aFdpdGhTZXBhcmF0b3IgPSBlbnN1cmVUcmFpbGluZ1NlcGFyYXRvcihkaXJlY3RvcnlQYXRoKTtcbiAgICBpZiAodGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZS5oYXMoZGlyZWN0b3J5UGF0aFdpdGhTZXBhcmF0b3IpKSB7XG4gICAgICByZXR1cm4gU3RhdHVzQ29kZU51bWJlci5NT0RJRklFRDtcbiAgICB9XG4gICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU47XG4gIH1cblxuICAvLyBXZSBkb24ndCB3YW50IHRvIGRvIGFueSBzeW5jaHJvbm91cyAnaGcgc3RhdHVzJyBjYWxscy4gSnVzdCB1c2UgY2FjaGVkIHZhbHVlcy5cbiAgZ2V0UGF0aFN0YXR1cyhmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2FjaGVkUGF0aFN0YXR1cyhmaWxlUGF0aCk7XG4gIH1cblxuICBnZXRDYWNoZWRQYXRoU3RhdHVzKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZSB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU47XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZFN0YXR1cyA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmIChjYWNoZWRTdGF0dXMpIHtcbiAgICAgIHJldHVybiBTdGF0dXNDb2RlSWRUb051bWJlcltjYWNoZWRTdGF0dXNdO1xuICAgIH1cbiAgICByZXR1cm4gU3RhdHVzQ29kZU51bWJlci5DTEVBTjtcbiAgfVxuXG4gIGdldEFsbFBhdGhTdGF0dXNlcygpOiB7W2ZpbGVQYXRoOiBOdWNsaWRlVXJpXTogU3RhdHVzQ29kZU51bWJlclZhbHVlfSB7XG4gICAgY29uc3QgcGF0aFN0YXR1c2VzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIGluIHRoaXMuX2hnU3RhdHVzQ2FjaGUpIHtcbiAgICAgIHBhdGhTdGF0dXNlc1tmaWxlUGF0aF0gPSBTdGF0dXNDb2RlSWRUb051bWJlclt0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXV07XG4gICAgfVxuICAgIHJldHVybiBwYXRoU3RhdHVzZXM7XG4gIH1cblxuICBpc1N0YXR1c01vZGlmaWVkKHN0YXR1czogP251bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQgfHxcbiAgICAgIHN0YXR1cyA9PT0gU3RhdHVzQ29kZU51bWJlci5NSVNTSU5HIHx8XG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuUkVNT1ZFRFxuICAgICk7XG4gIH1cblxuICBpc1N0YXR1c05ldyhzdGF0dXM6ID9udW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLkFEREVEIHx8XG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuVU5UUkFDS0VEXG4gICAgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJlYWRpbmcgSGcgU3RhdHVzIChhc3luYyBtZXRob2RzKVxuICAgKlxuICAgKi9cblxuICAvKipcbiAgICogUmVjb21tZW5kZWQgbWV0aG9kIHRvIHVzZSB0byBnZXQgdGhlIHN0YXR1cyBvZiBmaWxlcyBpbiB0aGlzIHJlcG8uXG4gICAqIEBwYXJhbSBwYXRocyBBbiBhcnJheSBvZiBmaWxlIHBhdGhzIHRvIGdldCB0aGUgc3RhdHVzIGZvci4gSWYgYSBwYXRoIGlzIG5vdCBpbiB0aGVcbiAgICogICBwcm9qZWN0LCBpdCB3aWxsIGJlIGlnbm9yZWQuXG4gICAqIFNlZSBIZ1NlcnZpY2U6OmdldFN0YXR1c2VzIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgYXN5bmMgZ2V0U3RhdHVzZXMoXG4gICAgcGF0aHM6IEFycmF5PHN0cmluZz4sXG4gICAgb3B0aW9ucz86IEhnU3RhdHVzQ29tbWFuZE9wdGlvbnMsXG4gICk6IFByb21pc2U8TWFwPE51Y2xpZGVVcmksIFN0YXR1c0NvZGVOdW1iZXJWYWx1ZT4+IHtcbiAgICBjb25zdCBzdGF0dXNNYXAgPSBuZXcgTWFwKCk7XG4gICAgY29uc3QgaXNSZWxhdmFudFN0YXR1cyA9IHRoaXMuX2dldFByZWRpY2F0ZUZvclJlbGV2YW50U3RhdHVzZXMob3B0aW9ucyk7XG5cbiAgICAvLyBDaGVjayB0aGUgY2FjaGUuXG4gICAgLy8gTm90ZTogSWYgcGF0aHMgaXMgZW1wdHksIGEgZnVsbCBgaGcgc3RhdHVzYCB3aWxsIGJlIHJ1biwgd2hpY2ggZm9sbG93cyB0aGUgc3BlYy5cbiAgICBjb25zdCBwYXRoc1dpdGhDYWNoZU1pc3MgPSBbXTtcbiAgICBwYXRocy5mb3JFYWNoKGZpbGVQYXRoID0+IHtcbiAgICAgIGNvbnN0IHN0YXR1c0lkID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICBpZiAoc3RhdHVzSWQpIHtcbiAgICAgICAgaWYgKCFpc1JlbGF2YW50U3RhdHVzKHN0YXR1c0lkKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzdGF0dXNNYXAuc2V0KGZpbGVQYXRoLCBTdGF0dXNDb2RlSWRUb051bWJlcltzdGF0dXNJZF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGF0aHNXaXRoQ2FjaGVNaXNzLnB1c2goZmlsZVBhdGgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gRmV0Y2ggYW55IHVuY2FjaGVkIHN0YXR1c2VzLlxuICAgIGlmIChwYXRoc1dpdGhDYWNoZU1pc3MubGVuZ3RoKSB7XG4gICAgICBjb25zdCBuZXdTdGF0dXNJbmZvID0gYXdhaXQgdGhpcy5fdXBkYXRlU3RhdHVzZXMocGF0aHNXaXRoQ2FjaGVNaXNzLCBvcHRpb25zKTtcbiAgICAgIG5ld1N0YXR1c0luZm8uZm9yRWFjaCgoc3RhdHVzLCBmaWxlUGF0aCkgPT4ge1xuICAgICAgICBzdGF0dXNNYXAuc2V0KGZpbGVQYXRoLCBTdGF0dXNDb2RlSWRUb051bWJlcltzdGF0dXNdKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdHVzTWFwO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIHN0YXR1c2VzIGZvciB0aGUgZ2l2ZW4gZmlsZSBwYXRocywgYW5kIHVwZGF0ZXMgdGhlIGNhY2hlIGFuZFxuICAgKiBzZW5kcyBvdXQgY2hhbmdlIGV2ZW50cyBhcyBhcHByb3ByaWF0ZS5cbiAgICogQHBhcmFtIGZpbGVQYXRocyBBbiBhcnJheSBvZiBmaWxlIHBhdGhzIHRvIHVwZGF0ZSB0aGUgc3RhdHVzIGZvci4gSWYgYSBwYXRoXG4gICAqICAgaXMgbm90IGluIHRoZSBwcm9qZWN0LCBpdCB3aWxsIGJlIGlnbm9yZWQuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlU3RhdHVzZXMoXG4gICAgZmlsZVBhdGhzOiBBcnJheTxzdHJpbmc+LFxuICAgIG9wdGlvbnM6ID9IZ1N0YXR1c0NvbW1hbmRPcHRpb25zLFxuICApOiBQcm9taXNlPE1hcDxOdWNsaWRlVXJpLCBTdGF0dXNDb2RlSWRWYWx1ZT4+IHtcbiAgICBjb25zdCBwYXRoc0luUmVwbyA9IGZpbGVQYXRocy5maWx0ZXIoZmlsZVBhdGggPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuX2lzUGF0aFJlbGV2YW50KGZpbGVQYXRoKTtcbiAgICB9KTtcbiAgICBpZiAocGF0aHNJblJlcG8ubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXR1c01hcFBhdGhUb1N0YXR1c0lkID0gYXdhaXQgdGhpcy5fc2VydmljZS5mZXRjaFN0YXR1c2VzKHBhdGhzSW5SZXBvLCBvcHRpb25zKTtcblxuICAgIGNvbnN0IHF1ZXJpZWRGaWxlcyA9IG5ldyBTZXQocGF0aHNJblJlcG8pO1xuICAgIGNvbnN0IHN0YXR1c0NoYW5nZUV2ZW50cyA9IFtdO1xuICAgIHN0YXR1c01hcFBhdGhUb1N0YXR1c0lkLmZvckVhY2goKG5ld1N0YXR1c0lkLCBmaWxlUGF0aCkgPT4ge1xuXG4gICAgICBjb25zdCBvbGRTdGF0dXMgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgIGlmIChvbGRTdGF0dXMgJiYgKG9sZFN0YXR1cyAhPT0gbmV3U3RhdHVzSWQpIHx8XG4gICAgICAgICAgIW9sZFN0YXR1cyAmJiAobmV3U3RhdHVzSWQgIT09IFN0YXR1c0NvZGVJZC5DTEVBTikpIHtcbiAgICAgICAgc3RhdHVzQ2hhbmdlRXZlbnRzLnB1c2goe1xuICAgICAgICAgIHBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgIHBhdGhTdGF0dXM6IFN0YXR1c0NvZGVJZFRvTnVtYmVyW25ld1N0YXR1c0lkXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChuZXdTdGF0dXNJZCA9PT0gU3RhdHVzQ29kZUlkLkNMRUFOKSB7XG4gICAgICAgICAgLy8gRG9uJ3QgYm90aGVyIGtlZXBpbmcgJ2NsZWFuJyBmaWxlcyBpbiB0aGUgY2FjaGUuXG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICAgIHRoaXMuX3JlbW92ZUFsbFBhcmVudERpcmVjdG9yaWVzRnJvbUNhY2hlKGZpbGVQYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXSA9IG5ld1N0YXR1c0lkO1xuICAgICAgICAgIGlmIChuZXdTdGF0dXNJZCA9PT0gU3RhdHVzQ29kZUlkLk1PRElGSUVEKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRBbGxQYXJlbnREaXJlY3Rvcmllc1RvQ2FjaGUoZmlsZVBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcXVlcmllZEZpbGVzLmRlbGV0ZShmaWxlUGF0aCk7XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgc3RhdHVzZXMgd2VyZSBmZXRjaGVkIGZvciBvbmx5IGNoYW5nZWQgKGBoZyBzdGF0dXNgKSBvclxuICAgIC8vIGlnbm9yZWQgKCdoZyBzdGF0dXMgLS1pZ25vcmVkYCkgZmlsZXMsIGEgcXVlcmllZCBmaWxlIG1heSBub3QgYmVcbiAgICAvLyByZXR1cm5lZCBpbiB0aGUgcmVzcG9uc2UuIElmIGl0IHdhc24ndCByZXR1cm5lZCwgdGhpcyBtZWFucyBpdHMgc3RhdHVzXG4gICAgLy8gbWF5IGhhdmUgY2hhbmdlZCwgaW4gd2hpY2ggY2FzZSBpdCBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIHRoZSBoZ1N0YXR1c0NhY2hlLlxuICAgIC8vIE5vdGU6IHdlIGRvbid0IGtub3cgdGhlIHJlYWwgdXBkYXRlZCBzdGF0dXMgb2YgdGhlIGZpbGUsIHNvIGRvbid0IHNlbmQgYSBjaGFuZ2UgZXZlbnQuXG4gICAgLy8gVE9ETyAoamVzc2ljYWxpbikgQ2FuIHdlIG1ha2UgdGhlICdwYXRoU3RhdHVzJyBmaWVsZCBpbiB0aGUgY2hhbmdlIGV2ZW50IG9wdGlvbmFsP1xuICAgIC8vIFRoZW4gd2UgY2FuIHNlbmQgdGhlc2UgZXZlbnRzLlxuICAgIGNvbnN0IGhnU3RhdHVzT3B0aW9uID0gdGhpcy5fZ2V0U3RhdHVzT3B0aW9uKG9wdGlvbnMpO1xuICAgIGlmIChoZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uT05MWV9JR05PUkVEKSB7XG4gICAgICBxdWVyaWVkRmlsZXMuZm9yRWFjaChmaWxlUGF0aCA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXSA9PT0gU3RhdHVzQ29kZUlkLklHTk9SRUQpIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLkFMTF9TVEFUVVNFUykge1xuICAgICAgLy8gSWYgSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTIHdhcyBwYXNzZWQgYW5kIGEgZmlsZSBkb2VzIG5vdCBhcHBlYXIgaW5cbiAgICAgIC8vIHRoZSByZXN1bHRzLCBpdCBtdXN0IG1lYW4gdGhlIGZpbGUgd2FzIHJlbW92ZWQgZnJvbSB0aGUgZmlsZXN5c3RlbS5cbiAgICAgIHF1ZXJpZWRGaWxlcy5mb3JFYWNoKGZpbGVQYXRoID0+IHtcbiAgICAgICAgY29uc3QgY2FjaGVkU3RhdHVzSWQgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICBpZiAoY2FjaGVkU3RhdHVzSWQgPT09IFN0YXR1c0NvZGVJZC5NT0RJRklFRCkge1xuICAgICAgICAgIHRoaXMuX3JlbW92ZUFsbFBhcmVudERpcmVjdG9yaWVzRnJvbUNhY2hlKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHF1ZXJpZWRGaWxlcy5mb3JFYWNoKGZpbGVQYXRoID0+IHtcbiAgICAgICAgY29uc3QgY2FjaGVkU3RhdHVzSWQgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgICAgaWYgKGNhY2hlZFN0YXR1c0lkICE9PSBTdGF0dXNDb2RlSWQuSUdOT1JFRCkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgICAgICBpZiAoY2FjaGVkU3RhdHVzSWQgPT09IFN0YXR1c0NvZGVJZC5NT0RJRklFRCkge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoZmlsZVBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRW1pdCBjaGFuZ2UgZXZlbnRzIG9ubHkgYWZ0ZXIgdGhlIGNhY2hlIGhhcyBiZWVuIGZ1bGx5IHVwZGF0ZWQuXG4gICAgc3RhdHVzQ2hhbmdlRXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXN0YXR1cycsIGV2ZW50KTtcbiAgICB9KTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnKTtcblxuICAgIHJldHVybiBzdGF0dXNNYXBQYXRoVG9TdGF0dXNJZDtcbiAgfVxuXG4gIF9hZGRBbGxQYXJlbnREaXJlY3Rvcmllc1RvQ2FjaGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpIHtcbiAgICBhZGRBbGxQYXJlbnREaXJlY3Rvcmllc1RvQ2FjaGUoXG4gICAgICB0aGlzLl9tb2RpZmllZERpcmVjdG9yeUNhY2hlLFxuICAgICAgZmlsZVBhdGgsXG4gICAgICB0aGlzLl9wcm9qZWN0RGlyZWN0b3J5LmdldFBhcmVudCgpLmdldFBhdGgoKVxuICAgICk7XG4gIH1cblxuICBfcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpIHtcbiAgICByZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZShcbiAgICAgIHRoaXMuX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGUsXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIHRoaXMuX3Byb2plY3REaXJlY3RvcnkuZ2V0UGFyZW50KCkuZ2V0UGF0aCgpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gZm9yIDo6Z2V0U3RhdHVzZXMuXG4gICAqIFJldHVybnMgYSBmaWx0ZXIgZm9yIHdoZXRoZXIgb3Igbm90IHRoZSBnaXZlbiBzdGF0dXMgY29kZSBzaG91bGQgYmVcbiAgICogcmV0dXJuZWQsIGdpdmVuIHRoZSBwYXNzZWQtaW4gb3B0aW9ucyBmb3IgOjpnZXRTdGF0dXNlcy5cbiAgICovXG4gIF9nZXRQcmVkaWNhdGVGb3JSZWxldmFudFN0YXR1c2VzKFxuICAgIG9wdGlvbnM6ID9IZ1N0YXR1c0NvbW1hbmRPcHRpb25zXG4gICk6IChjb2RlOiBTdGF0dXNDb2RlSWRWYWx1ZSkgPT4gYm9vbGVhbiB7XG4gICAgY29uc3QgaGdTdGF0dXNPcHRpb24gPSB0aGlzLl9nZXRTdGF0dXNPcHRpb24ob3B0aW9ucyk7XG5cbiAgICBpZiAoaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLk9OTFlfSUdOT1JFRCkge1xuICAgICAgcmV0dXJuIGZpbHRlckZvck9ubHlJZ25vcmVkO1xuICAgIH0gZWxzZSBpZiAoaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLkFMTF9TVEFUVVNFUykge1xuICAgICAgcmV0dXJuIGZpbHRlckZvckFsbFN0YXR1ZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmaWx0ZXJGb3JPbmx5Tm90SWdub3JlZDtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZXRyaWV2aW5nIERpZmZzIChwYXJpdHkgd2l0aCBHaXRSZXBvc2l0b3J5KVxuICAgKlxuICAgKi9cblxuICBnZXREaWZmU3RhdHMoZmlsZVBhdGg6ID9OdWNsaWRlVXJpKToge2FkZGVkOiBudW1iZXI7IGRlbGV0ZWQ6IG51bWJlcjt9IHtcbiAgICBjb25zdCBjbGVhblN0YXRzID0ge2FkZGVkOiAwLCBkZWxldGVkOiAwfTtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gY2xlYW5TdGF0cztcbiAgICB9XG4gICAgY29uc3QgY2FjaGVkRGF0YSA9IHRoaXMuX2hnRGlmZkNhY2hlW2ZpbGVQYXRoXTtcbiAgICByZXR1cm4gY2FjaGVkRGF0YSA/IHthZGRlZDogY2FjaGVkRGF0YS5hZGRlZCwgZGVsZXRlZDogY2FjaGVkRGF0YS5kZWxldGVkfSA6XG4gICAgICAgIGNsZWFuU3RhdHM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBMaW5lRGlmZiB0aGF0IGRlc2NyaWJlcyB0aGUgZGlmZnMgYmV0d2VlbiB0aGUgZ2l2ZW5cbiAgICogZmlsZSdzIGBIRUFEYCBjb250ZW50cyBhbmQgaXRzIGN1cnJlbnQgY29udGVudHMuXG4gICAqIE5PVEU6IHRoaXMgbWV0aG9kIGN1cnJlbnRseSBpZ25vcmVzIHRoZSBwYXNzZWQtaW4gdGV4dCwgYW5kIGluc3RlYWQgZGlmZnNcbiAgICogYWdhaW5zdCB0aGUgY3VycmVudGx5IHNhdmVkIGNvbnRlbnRzIG9mIHRoZSBmaWxlLlxuICAgKi9cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgRXhwb3J0IHRoZSBMaW5lRGlmZiB0eXBlIChmcm9tIGhnLW91dHB1dC1oZWxwZXJzKSB3aGVuXG4gIC8vIHR5cGVzIGNhbiBiZSBleHBvcnRlZC5cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgTWFrZSB0aGlzIG1ldGhvZCB3b3JrIHdpdGggdGhlIHBhc3NlZC1pbiBgdGV4dGAuIHQ2MzkxNTc5XG4gIGdldExpbmVEaWZmcyhmaWxlUGF0aDogP051Y2xpZGVVcmksIHRleHQ6ID9zdHJpbmcpOiBBcnJheTxMaW5lRGlmZj4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgZGlmZkluZm8gPSB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF07XG4gICAgcmV0dXJuIGRpZmZJbmZvID8gZGlmZkluZm8ubGluZURpZmZzIDogW107XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZXRyaWV2aW5nIERpZmZzIChhc3luYyBtZXRob2RzKVxuICAgKlxuICAgKi9cblxuICAvKipcbiAgICogUmVjb21tZW5kZWQgbWV0aG9kIHRvIHVzZSB0byBnZXQgdGhlIGRpZmYgc3RhdHMgb2YgZmlsZXMgaW4gdGhpcyByZXBvLlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgZmlsZSBwYXRoIHRvIGdldCB0aGUgc3RhdHVzIGZvci4gSWYgYSBwYXRoIGlzIG5vdCBpbiB0aGVcbiAgICogICBwcm9qZWN0LCBkZWZhdWx0IFwiY2xlYW5cIiBzdGF0cyB3aWxsIGJlIHJldHVybmVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0RGlmZlN0YXRzRm9yUGF0aChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8e2FkZGVkOiBudW1iZXI7IGRlbGV0ZWQ6IG51bWJlcjt9PiB7XG4gICAgY29uc3QgY2xlYW5TdGF0cyA9IHthZGRlZDogMCwgZGVsZXRlZDogMH07XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGNsZWFuU3RhdHM7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIGNhY2hlLlxuICAgIGNvbnN0IGNhY2hlZERpZmZJbmZvID0gdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmIChjYWNoZWREaWZmSW5mbykge1xuICAgICAgcmV0dXJuIHthZGRlZDogY2FjaGVkRGlmZkluZm8uYWRkZWQsIGRlbGV0ZWQ6IGNhY2hlZERpZmZJbmZvLmRlbGV0ZWR9O1xuICAgIH1cblxuICAgIC8vIEZhbGwgYmFjayB0byBhIGZldGNoLlxuICAgIGNvbnN0IGZldGNoZWRQYXRoVG9EaWZmSW5mbyA9IGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZJbmZvKFtmaWxlUGF0aF0pO1xuICAgIGlmIChmZXRjaGVkUGF0aFRvRGlmZkluZm8pIHtcbiAgICAgIGNvbnN0IGRpZmZJbmZvID0gZmV0Y2hlZFBhdGhUb0RpZmZJbmZvLmdldChmaWxlUGF0aCk7XG4gICAgICBpZiAoZGlmZkluZm8gIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge2FkZGVkOiBkaWZmSW5mby5hZGRlZCwgZGVsZXRlZDogZGlmZkluZm8uZGVsZXRlZH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsZWFuU3RhdHM7XG4gIH1cblxuICAvKipcbiAgICogUmVjb21tZW5kZWQgbWV0aG9kIHRvIHVzZSB0byBnZXQgdGhlIGxpbmUgZGlmZnMgb2YgZmlsZXMgaW4gdGhpcyByZXBvLlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgYWJzb2x1dGUgZmlsZSBwYXRoIHRvIGdldCB0aGUgbGluZSBkaWZmcyBmb3IuIElmIHRoZSBwYXRoIFxcXG4gICAqICAgaXMgbm90IGluIHRoZSBwcm9qZWN0LCBhbiBlbXB0eSBBcnJheSB3aWxsIGJlIHJldHVybmVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0TGluZURpZmZzRm9yUGF0aChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8QXJyYXk8TGluZURpZmY+PiB7XG4gICAgY29uc3QgbGluZURpZmZzID0gW107XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGxpbmVEaWZmcztcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgY2FjaGUuXG4gICAgY29uc3QgY2FjaGVkRGlmZkluZm8gPSB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF07XG4gICAgaWYgKGNhY2hlZERpZmZJbmZvKSB7XG4gICAgICByZXR1cm4gY2FjaGVkRGlmZkluZm8ubGluZURpZmZzO1xuICAgIH1cblxuICAgIC8vIEZhbGwgYmFjayB0byBhIGZldGNoLlxuICAgIGNvbnN0IGZldGNoZWRQYXRoVG9EaWZmSW5mbyA9IGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZJbmZvKFtmaWxlUGF0aF0pO1xuICAgIGlmIChmZXRjaGVkUGF0aFRvRGlmZkluZm8gIT0gbnVsbCkge1xuICAgICAgY29uc3QgZGlmZkluZm8gPSBmZXRjaGVkUGF0aFRvRGlmZkluZm8uZ2V0KGZpbGVQYXRoKTtcbiAgICAgIGlmIChkaWZmSW5mbyAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBkaWZmSW5mby5saW5lRGlmZnM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVEaWZmcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBkaWZmIGluZm9ybWF0aW9uIGZvciB0aGUgZ2l2ZW4gcGF0aHMsIGFuZCB1cGRhdGVzIHRoZSBjYWNoZS5cbiAgICogQHBhcmFtIEFuIGFycmF5IG9mIGFic29sdXRlIGZpbGUgcGF0aHMgZm9yIHdoaWNoIHRvIHVwZGF0ZSB0aGUgZGlmZiBpbmZvLlxuICAgKiBAcmV0dXJuIEEgbWFwIG9mIGVhY2ggcGF0aCB0byBpdHMgRGlmZkluZm8uXG4gICAqICAgVGhpcyBtZXRob2QgbWF5IHJldHVybiBgbnVsbGAgaWYgdGhlIGNhbGwgdG8gYGhnIGRpZmZgIGZhaWxzLlxuICAgKiAgIEEgZmlsZSBwYXRoIHdpbGwgbm90IGFwcGVhciBpbiB0aGUgcmV0dXJuZWQgTWFwIGlmIGl0IGlzIG5vdCBpbiB0aGUgcmVwbyxcbiAgICogICBpZiBpdCBoYXMgbm8gY2hhbmdlcywgb3IgaWYgdGhlcmUgaXMgYSBwZW5kaW5nIGBoZyBkaWZmYCBjYWxsIGZvciBpdCBhbHJlYWR5LlxuICAgKi9cbiAgYXN5bmMgX3VwZGF0ZURpZmZJbmZvKGZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4pOiBQcm9taXNlPD9NYXA8TnVjbGlkZVVyaSwgRGlmZkluZm8+PiB7XG4gICAgY29uc3QgcGF0aHNUb0ZldGNoID0gZmlsZVBhdGhzLmZpbHRlcihhUGF0aCA9PiB7XG4gICAgICAvLyBEb24ndCB0cnkgdG8gZmV0Y2ggaW5mb3JtYXRpb24gZm9yIHRoaXMgcGF0aCBpZiBpdCdzIG5vdCBpbiB0aGUgcmVwby5cbiAgICAgIGlmICghdGhpcy5faXNQYXRoUmVsZXZhbnQoYVBhdGgpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIERvbid0IGRvIGFub3RoZXIgdXBkYXRlIGZvciB0aGlzIHBhdGggaWYgd2UgYXJlIGluIHRoZSBtaWRkbGUgb2YgcnVubmluZyBhbiB1cGRhdGUuXG4gICAgICBpZiAodGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nLmhhcyhhUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nLmFkZChhUGF0aCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHBhdGhzVG9GZXRjaC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgLy8gQ2FsbCB0aGUgSGdTZXJ2aWNlIGFuZCB1cGRhdGUgb3VyIGNhY2hlIHdpdGggdGhlIHJlc3VsdHMuXG4gICAgY29uc3QgcGF0aHNUb0RpZmZJbmZvID0gYXdhaXQgdGhpcy5fc2VydmljZS5mZXRjaERpZmZJbmZvKHBhdGhzVG9GZXRjaCk7XG4gICAgaWYgKHBhdGhzVG9EaWZmSW5mbykge1xuICAgICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIGRpZmZJbmZvXSBvZiBwYXRoc1RvRGlmZkluZm8pIHtcbiAgICAgICAgdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdID0gZGlmZkluZm87XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGZpbGVzIG1hcmtlZCBmb3IgZGVsZXRpb24uXG4gICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXIuZm9yRWFjaChmaWxlVG9DbGVhciA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVRvQ2xlYXJdO1xuICAgIH0pO1xuICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNUb0NsZWFyLmNsZWFyKCk7XG5cbiAgICAvLyBUaGUgZmV0Y2hlZCBmaWxlcyBjYW4gbm93IGJlIHVwZGF0ZWQgYWdhaW4uXG4gICAgZm9yIChjb25zdCBwYXRoVG9GZXRjaCBvZiBwYXRoc1RvRmV0Y2gpIHtcbiAgICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNVcGRhdGluZy5kZWxldGUocGF0aFRvRmV0Y2gpO1xuICAgIH1cblxuICAgIC8vIFRPRE8gKHQ5MTEzOTEzKSBJZGVhbGx5LCB3ZSBjb3VsZCBzZW5kIG1vcmUgdGFyZ2V0ZWQgZXZlbnRzIHRoYXQgYmV0dGVyXG4gICAgLy8gZGVzY3JpYmUgd2hhdCBjaGFuZ2UgaGFzIG9jY3VycmVkLiBSaWdodCBub3csIEdpdFJlcG9zaXRvcnkgZGljdGF0ZXMgZWl0aGVyXG4gICAgLy8gJ2RpZC1jaGFuZ2Utc3RhdHVzJyBvciAnZGlkLWNoYW5nZS1zdGF0dXNlcycuXG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXN0YXR1c2VzJyk7XG4gICAgcmV0dXJuIHBhdGhzVG9EaWZmSW5mbztcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJldHJpZXZpbmcgQm9va21hcmsgKGFzeW5jIG1ldGhvZHMpXG4gICAqXG4gICAqL1xuICBhc3luYyBmZXRjaEN1cnJlbnRCb29rbWFyaygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCBuZXdseUZldGNoZWRCb29rbWFyayA9ICcnO1xuICAgIHRyeSB7XG4gICAgICBuZXdseUZldGNoZWRCb29rbWFyayA9IGF3YWl0IHRoaXMuX3NlcnZpY2UuZmV0Y2hDdXJyZW50Qm9va21hcmsoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBTdXBwcmVzcyB0aGUgZXJyb3IuIFRoZXJlIGFyZSBsZWdpdGltYXRlIHRpbWVzIHdoZW4gdGhlcmUgbWF5IGJlIG5vXG4gICAgICAvLyBjdXJyZW50IGJvb2ttYXJrLCBzdWNoIGFzIGR1cmluZyBhIHJlYmFzZS4gSW4gdGhpcyBjYXNlLCB3ZSBqdXN0IHdhbnRcbiAgICAgIC8vIHRvIHJldHVybiBhbiBlbXB0eSBzdHJpbmcgaWYgdGhlcmUgaXMgbm8gY3VycmVudCBib29rbWFyay5cbiAgICB9XG4gICAgaWYgKG5ld2x5RmV0Y2hlZEJvb2ttYXJrICE9PSB0aGlzLl9jdXJyZW50Qm9va21hcmspIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRCb29rbWFyayA9IG5ld2x5RmV0Y2hlZEJvb2ttYXJrO1xuICAgICAgLy8gVGhlIEF0b20gc3RhdHVzLWJhciB1c2VzIHRoaXMgYXMgYSBzaWduYWwgdG8gcmVmcmVzaCB0aGUgJ3Nob3J0SGVhZCcuXG4gICAgICAvLyBUaGVyZSBpcyBjdXJyZW50bHkgbm8gZGVkaWNhdGVkICdzaG9ydEhlYWREaWRDaGFuZ2UnIGV2ZW50LlxuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXN0YXR1c2VzJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jdXJyZW50Qm9va21hcmsgfHwgJyc7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBDaGVja2luZyBPdXRcbiAgICpcbiAgICovXG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgY2hlY2tvdXRIZWFkKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGNoZWNrb3V0UmVmZXJlbmNlKHJlZmVyZW5jZTogc3RyaW5nLCBjcmVhdGU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyB0aGUgYXN5bmMgdmVyc2lvbiBvZiB3aGF0IGNoZWNrb3V0UmVmZXJlbmNlKCkgaXMgbWVhbnQgdG8gZG8uXG4gICAqL1xuICBhc3luYyBjaGVja291dFJldmlzaW9uKHJlZmVyZW5jZTogc3RyaW5nLCBjcmVhdGU6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fc2VydmljZS5jaGVja291dChyZWZlcmVuY2UsIGNyZWF0ZSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBIZ1NlcnZpY2Ugc3Vic2NyaXB0aW9uc1xuICAgKlxuICAgKi9cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgY2FjaGUgaW4gcmVzcG9uc2UgdG8gYW55IG51bWJlciBvZiAobm9uLS5oZ2lnbm9yZSkgZmlsZXMgY2hhbmdpbmcuXG4gICAqIEBwYXJhbSB1cGRhdGUgVGhlIGNoYW5nZWQgZmlsZSBwYXRocy5cbiAgICovXG4gIF9maWxlc0RpZENoYW5nZShjaGFuZ2VkUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+KTogdm9pZCB7XG4gICAgY29uc3QgcmVsZXZhbnRDaGFuZ2VkUGF0aHMgPSBjaGFuZ2VkUGF0aHMuZmlsdGVyKHRoaXMuX2lzUGF0aFJlbGV2YW50LmJpbmQodGhpcykpO1xuICAgIGlmIChyZWxldmFudENoYW5nZWRQYXRocy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKHJlbGV2YW50Q2hhbmdlZFBhdGhzLmxlbmd0aCA8PSBNQVhfSU5ESVZJRFVBTF9DSEFOR0VEX1BBVEhTKSB7XG4gICAgICAvLyBVcGRhdGUgdGhlIHN0YXR1c2VzIGluZGl2aWR1YWxseS5cbiAgICAgIHRoaXMuX3VwZGF0ZVN0YXR1c2VzKHJlbGV2YW50Q2hhbmdlZFBhdGhzLCB7aGdTdGF0dXNPcHRpb246IEhnU3RhdHVzT3B0aW9uLkFMTF9TVEFUVVNFU30pO1xuICAgICAgdGhpcy5fdXBkYXRlRGlmZkluZm8ocmVsZXZhbnRDaGFuZ2VkUGF0aHMuZmlsdGVyKGZpbGVQYXRoID0+IHRoaXMuX2hnRGlmZkNhY2hlW2ZpbGVQYXRoXSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIGlzIGEgaGV1cmlzdGljIHRvIGltcHJvdmUgcGVyZm9ybWFuY2UuIE1hbnkgZmlsZXMgYmVpbmcgY2hhbmdlZCBtYXlcbiAgICAgIC8vIGJlIGEgc2lnbiB0aGF0IHdlIGFyZSBwaWNraW5nIHVwIGNoYW5nZXMgdGhhdCB3ZXJlIGNyZWF0ZWQgaW4gYW4gYXV0b21hdGVkXG4gICAgICAvLyB3YXkgLS0gc28gaW4gYWRkaXRpb24sIHRoZXJlIG1heSBiZSBtYW55IGJhdGNoZXMgb2YgY2hhbmdlcyBpbiBzdWNjZXNzaW9uLlxuICAgICAgLy8gX3JlZnJlc2hTdGF0dXNlc09mQWxsRmlsZXNJbkNhY2hlIGRlYm91bmNlcyBjYWxscywgc28gaXQgaXMgc2FmZSB0byBjYWxsXG4gICAgICAvLyBpdCBtdWx0aXBsZSB0aW1lcyBpbiBzdWNjZXNzaW9uLlxuICAgICAgdGhpcy5fcmVmcmVzaFN0YXR1c2VzT2ZBbGxGaWxlc0luQ2FjaGUoKTtcbiAgICB9XG4gIH1cblxuICBfcmVmcmVzaFN0YXR1c2VzT2ZBbGxGaWxlc0luQ2FjaGUoKTogdm9pZCB7XG4gICAgbGV0IGRlYm91bmNlZFJlZnJlc2hBbGwgPSB0aGlzLl9kZWJvdW5jZWRSZWZyZXNoQWxsO1xuICAgIGlmIChkZWJvdW5jZWRSZWZyZXNoQWxsID09IG51bGwpIHtcbiAgICAgIGNvbnN0IGRvUmVmcmVzaCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2lzUmVmcmVzaGluZ0FsbEZpbGVzSW5DYWNoZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pc1JlZnJlc2hpbmdBbGxGaWxlc0luQ2FjaGUgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHBhdGhzSW5TdGF0dXNDYWNoZSA9IE9iamVjdC5rZXlzKHRoaXMuX2hnU3RhdHVzQ2FjaGUpO1xuICAgICAgICB0aGlzLl9oZ1N0YXR1c0NhY2hlID0ge307XG4gICAgICAgIHRoaXMuX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGUgPSBuZXcgTWFwKCk7XG4gICAgICAgIC8vIFdlIHNob3VsZCBnZXQgdGhlIG1vZGlmaWVkIHN0YXR1cyBvZiBhbGwgZmlsZXMgaW4gdGhlIHJlcG8gdGhhdCBpc1xuICAgICAgICAvLyB1bmRlciB0aGUgSGdSZXBvc2l0b3J5Q2xpZW50J3MgcHJvamVjdCBkaXJlY3RvcnksIGJlY2F1c2Ugd2hlbiBIZ1xuICAgICAgICAvLyBtb2RpZmllcyB0aGUgcmVwbywgaXQgZG9lc24ndCBuZWNlc3NhcmlseSBvbmx5IG1vZGlmeSBmaWxlcyB0aGF0IHdlcmVcbiAgICAgICAgLy8gcHJldmlvdXNseSBtb2RpZmllZC5cbiAgICAgICAgdGhpcy5fdXBkYXRlU3RhdHVzZXMoXG4gICAgICAgICAgICBbdGhpcy5nZXRQcm9qZWN0RGlyZWN0b3J5KCldLCB7aGdTdGF0dXNPcHRpb246IEhnU3RhdHVzT3B0aW9uLk9OTFlfTk9OX0lHTk9SRUR9KTtcbiAgICAgICAgaWYgKHBhdGhzSW5TdGF0dXNDYWNoZS5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBUaGUgbG9naWMgaXMgYSBiaXQgZGlmZmVyZW50IGZvciBpZ25vcmVkIGZpbGVzLCBiZWNhdXNlIHRoZVxuICAgICAgICAgIC8vIEhnUmVwb3NpdG9yeUNsaWVudCBhbHdheXMgZmV0Y2hlcyBpZ25vcmVkIHN0YXR1c2VzIGxhemlseSAoYXMgY2FsbGVyc1xuICAgICAgICAgIC8vIGFzayBmb3IgdGhlbSkuIFNvLCB3ZSBvbmx5IGZldGNoIHRoZSBpZ25vcmVkIHN0YXR1cyBvZiBmaWxlcyBhbHJlYWR5XG4gICAgICAgICAgLy8gaW4gdGhlIGNhY2hlLiAoTm90ZTogaWYgSSBhc2sgSGcgZm9yIHRoZSAnaWdub3JlZCcgc3RhdHVzIG9mIGEgbGlzdCBvZlxuICAgICAgICAgIC8vIGZpbGVzLCBhbmQgbm9uZSBvZiB0aGVtIGFyZSBpZ25vcmVkLCBubyBzdGF0dXNlcyB3aWxsIGJlIHJldHVybmVkLilcbiAgICAgICAgICBhd2FpdCB0aGlzLl91cGRhdGVTdGF0dXNlcyhcbiAgICAgICAgICAgICAgcGF0aHNJblN0YXR1c0NhY2hlLCB7aGdTdGF0dXNPcHRpb246IEhnU3RhdHVzT3B0aW9uLk9OTFlfSUdOT1JFRH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGF0aHNJbkRpZmZDYWNoZSA9IE9iamVjdC5rZXlzKHRoaXMuX2hnRGlmZkNhY2hlKTtcbiAgICAgICAgdGhpcy5faGdEaWZmQ2FjaGUgPSB7fTtcbiAgICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZkluZm8ocGF0aHNJbkRpZmZDYWNoZSk7XG5cbiAgICAgICAgdGhpcy5faXNSZWZyZXNoaW5nQWxsRmlsZXNJbkNhY2hlID0gZmFsc2U7XG4gICAgICB9O1xuICAgICAgdGhpcy5fZGVib3VuY2VkUmVmcmVzaEFsbCA9IGRlYm91bmNlKFxuICAgICAgICBkb1JlZnJlc2gsXG4gICAgICAgIERFQk9VTkNFX01JTExJU0VDT05EU19GT1JfUkVGUkVTSF9BTEwsXG4gICAgICAgIC8qIGltbWVkaWF0ZSAqLyBmYWxzZVxuICAgICAgKTtcbiAgICAgIGRlYm91bmNlZFJlZnJlc2hBbGwgPSB0aGlzLl9kZWJvdW5jZWRSZWZyZXNoQWxsO1xuICAgIH1cbiAgICBkZWJvdW5jZWRSZWZyZXNoQWxsKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZXBvc2l0b3J5IFN0YXRlIGF0IFNwZWNpZmljIFJldmlzaW9uc1xuICAgKlxuICAgKi9cbiAgZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24oZmlsZVBhdGg6IE51Y2xpZGVVcmksIHJldmlzaW9uOiA/c3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24oZmlsZVBhdGgsIHJldmlzaW9uKTtcbiAgfVxuXG4gIGZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbihyZXZpc2lvbjogc3RyaW5nKTogUHJvbWlzZTw/UmV2aXNpb25GaWxlQ2hhbmdlcz4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbihyZXZpc2lvbik7XG4gIH1cblxuICBmZXRjaFJldmlzaW9uSW5mb0JldHdlZW5IZWFkQW5kQmFzZSgpOiBQcm9taXNlPD9BcnJheTxSZXZpc2lvbkluZm8+PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuSGVhZEFuZEJhc2UoKTtcbiAgfVxuXG4gIC8vIFNlZSBIZ1NlcnZpY2UuZ2V0QmxhbWVBdEhlYWQuXG4gIGdldEJsYW1lQXRIZWFkKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxNYXA8c3RyaW5nLCBzdHJpbmc+PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZ2V0QmxhbWVBdEhlYWQoZmlsZVBhdGgpO1xuICB9XG5cbiAgZ2V0Q29uZmlnVmFsdWVBc3luYyhrZXk6IHN0cmluZywgcGF0aDogP3N0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmdldENvbmZpZ1ZhbHVlQXN5bmMoa2V5KTtcbiAgfVxuXG4gIC8vIFNlZSBIZ1NlcnZpY2UuZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZC5cbiAgZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZChjaGFuZ2VTZXRJZDogc3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZChjaGFuZ2VTZXRJZCk7XG4gIH1cblxuICBnZXRTbWFydGxvZyh0dHlPdXRwdXQ6IGJvb2xlYW4sIGNvbmNpc2U6IGJvb2xlYW4pOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmdldFNtYXJ0bG9nKHR0eU91dHB1dCwgY29uY2lzZSk7XG4gIH1cblxuICByZW5hbWUob2xkRmlsZVBhdGg6IHN0cmluZywgbmV3RmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLnJlbmFtZShvbGRGaWxlUGF0aCwgbmV3RmlsZVBhdGgpO1xuICB9XG5cbiAgcmVtb3ZlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5yZW1vdmUoZmlsZVBhdGgpO1xuICB9XG5cbiAgYWRkKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5hZGQoZmlsZVBhdGgpO1xuICB9XG5cbiAgY29tbWl0KG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmNvbW1pdChtZXNzYWdlKTtcbiAgfVxuXG4gIGFtZW5kKG1lc3NhZ2U6ID9zdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5hbWVuZChtZXNzYWdlKTtcbiAgfVxuXG4gIF9nZXRTdGF0dXNPcHRpb24ob3B0aW9uczogP0hnU3RhdHVzQ29tbWFuZE9wdGlvbnMpOiA/SGdTdGF0dXNPcHRpb25WYWx1ZSB7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBvcHRpb25zLmhnU3RhdHVzT3B0aW9uO1xuICB9XG59XG4iXX0=