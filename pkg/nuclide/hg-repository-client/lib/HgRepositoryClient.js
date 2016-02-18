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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhnUmVwb3NpdG9yeUNsaWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkF5QjJDLE1BQU07OzhDQU0xQywyQ0FBMkM7O3VCQUMzQixlQUFlOzsrQkFDQSx5QkFBeUI7O3FCQUNtQixTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUIzRixJQUFNLHdCQUF3QixHQUFHLG1DQUFtQyxDQUFDO0FBQzlELElBQU0scUNBQXFDLEdBQUcsR0FBRyxDQUFDOztBQUNsRCxJQUFNLDRCQUE0QixHQUFHLENBQUMsQ0FBQzs7O0FBRTlDLFNBQVMsdUJBQXVCLENBQUMsSUFBdUIsRUFBVztBQUNqRSxTQUFRLElBQUksS0FBSyw2Q0FBYSxPQUFPLENBQUU7Q0FDeEM7O0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxJQUF1QixFQUFXO0FBQzlELFNBQVEsSUFBSSxLQUFLLDZDQUFhLE9BQU8sQ0FBRTtDQUN4Qzs7QUFFRCxTQUFTLG1CQUFtQixHQUFHO0FBQzdCLFNBQU8sSUFBSSxDQUFDO0NBQ2I7SUFvQm9CLGtCQUFrQjtBQXNCMUIsV0F0QlEsa0JBQWtCLENBc0J6QixRQUFnQixFQUFFLFNBQW9CLEVBQUUsT0FBNEIsRUFBRTs7OzBCQXRCL0Qsa0JBQWtCOztBQXVCbkMsUUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7QUFDdEIsUUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztBQUNsRCxRQUFJLENBQUMsaUJBQWlCLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDO0FBQ3RELFFBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUNwQyxRQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQzs7QUFFMUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxtQkFBYSxDQUFDO0FBQzlCLFFBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDOztBQUV2QixRQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztBQUN6QixRQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7QUFFekMsUUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDdkIsUUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDM0MsUUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDMUMsUUFBSSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDeEYsVUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xDLFVBQUksQ0FBQyxRQUFRLEVBQUU7O0FBRWIsZUFBTztPQUNSO0FBQ0QsVUFBSSxDQUFDLE1BQUssZUFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ25DLGVBQU87T0FDUjs7O0FBR0QsVUFBSSxNQUFLLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUMvQixlQUFPO09BQ1I7OztBQUdELFVBQU0sbUJBQW1CLEdBQUcsTUFBSyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsK0JBQXlCLENBQUM7QUFDcEYseUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDaEQsY0FBSyxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztPQUNwQyxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7O0FBU0oseUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsWUFBTTtBQUNoRCxjQUFLLHdCQUF3QixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QyxjQUFLLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN0QyxlQUFPLE1BQUssWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ3BDLENBQUMsQ0FBQyxDQUFDO0tBQ0wsQ0FBQyxDQUFDOzs7QUFHSCxRQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDakYsUUFBSSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxDQUN6QyxTQUFTLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLFFBQUksQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUUsQ0FDeEMsU0FBUyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNoRSxRQUFJLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLENBQ3ZDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O0FBRW5ELFFBQUksQ0FBQyw0QkFBNEIsR0FBRyxLQUFLLENBQUM7R0FDM0M7O2VBbkZrQixrQkFBa0I7O1dBcUY5QixtQkFBRzs7O0FBQ1IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbEMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4QixZQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDNUMsZUFBSyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDbEMsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN6Qjs7Ozs7Ozs7OztXQVFXLHNCQUFDLFFBQWtCLEVBQWU7QUFDNUMsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDbEQ7OztXQUVnQiwyQkFDZixRQUEwRSxFQUM3RDtBQUNiLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDeEQ7OztXQUVrQiw2QkFBQyxRQUFrQixFQUFlO0FBQ25ELGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDMUQ7Ozs7Ozs7Ozs7V0FTTSxtQkFBVztBQUNoQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFTSxtQkFBVztBQUNoQixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7S0FDbkI7OztXQUVrQiwrQkFBVztBQUM1QixhQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN6Qzs7Ozs7O1dBSWtCLCtCQUFXO0FBQzVCLGFBQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3pDOzs7OztXQUdjLDJCQUFZO0FBQ3pCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVTLG9CQUFDLFFBQW9CLEVBQVU7QUFDdkMsYUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3BEOzs7OztXQUdRLG1CQUFDLE1BQWMsRUFBVztBQUNqQyxhQUFPLEtBQUssQ0FBQztLQUNkOzs7Ozs7O1dBS1csc0JBQUMsUUFBb0IsRUFBVTtBQUN6QyxVQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFOztBQUUxQixZQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztBQUM1QixlQUFPLEVBQUUsQ0FBQztPQUNYO0FBQ0QsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7S0FDOUI7Ozs7O1dBR1UscUJBQUMsSUFBZ0IsRUFBVztBQUNyQyxhQUFPLEtBQUssQ0FBQztLQUNkOzs7OztXQUdrQiw2QkFBQyxTQUFpQixFQUFFLElBQWdCLEVBQVU7QUFDL0QsYUFBTyxDQUFDLENBQUM7S0FDVjs7Ozs7V0FHZ0MsMkNBQUMsSUFBaUIsRUFBb0M7QUFDckYsYUFBTztBQUNMLGFBQUssRUFBRSxDQUFDO0FBQ1IsY0FBTSxFQUFFLENBQUM7T0FDVixDQUFDO0tBQ0g7Ozs7O1dBR2Esd0JBQUMsR0FBVyxFQUFFLElBQWEsRUFBVztBQUNsRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFVyxzQkFBQyxJQUFhLEVBQVc7QUFDbkMsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0tBQ3hCOzs7OztXQUdnQiwyQkFBQyxJQUFhLEVBQVc7QUFDeEMsYUFBTyxJQUFJLENBQUM7S0FDYjs7Ozs7V0FHWSx1QkFDWCxJQUFpQixFQUNxRDtBQUN0RSxhQUFPO0FBQ0wsYUFBSyxFQUFFLEVBQUU7QUFDVCxlQUFPLEVBQUUsRUFBRTtBQUNYLFlBQUksRUFBRSxFQUFFO09BQ1QsQ0FBQztLQUNIOzs7OztXQUdpQiw0QkFBQyxTQUFpQixFQUFFLElBQWlCLEVBQVc7QUFDaEUsYUFBTyxJQUFJLENBQUM7S0FDYjs7Ozs7Ozs7Ozs7O1dBV2Esd0JBQUMsUUFBcUIsRUFBVztBQUM3QyxVQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsZUFBTyxLQUFLLENBQUM7T0FDZDtBQUNELFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2RCxVQUFJLENBQUMsZ0JBQWdCLEVBQUU7QUFDckIsZUFBTyxLQUFLLENBQUM7T0FDZCxNQUFNO0FBQ0wsZUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMscURBQXFCLGdCQUFnQixDQUFDLENBQUMsQ0FBQztPQUN0RTtLQUNGOzs7Ozs7V0FJUSxtQkFBQyxRQUFxQixFQUFXO0FBQ3hDLFVBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixlQUFPLEtBQUssQ0FBQztPQUNkO0FBQ0QsVUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRTtBQUNyQixlQUFPLEtBQUssQ0FBQztPQUNkLE1BQU07QUFDTCxlQUFPLElBQUksQ0FBQyxXQUFXLENBQUMscURBQXFCLGdCQUFnQixDQUFDLENBQUMsQ0FBQztPQUNqRTtLQUNGOzs7Ozs7O1dBS1ksdUJBQUMsUUFBcUIsRUFBVztBQUM1QyxVQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsZUFBTyxLQUFLLENBQUM7T0FDZDs7Ozs7QUFLRCxhQUFPLEFBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyw2Q0FBYSxPQUFPLElBQzFELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN4Qzs7Ozs7OztXQUtrQiw2QkFBQyxRQUFvQixFQUFXO0FBQ2pELGFBQU8sQUFBQyxRQUFRLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQUFBQyxDQUFDO0tBQ3hGOzs7Ozs7OztXQU1jLHlCQUFDLFFBQW9CLEVBQVc7QUFDN0MsYUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUN4QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLEtBQUssUUFBUSxBQUFDLENBQUM7S0FDeEQ7Ozs7Ozs7O1dBTWlCLDRCQUFDLGFBQXNCLEVBQXlCO0FBQ2hFLFVBQUksQ0FBQyxhQUFhLEVBQUU7QUFDbEIsZUFBTyxpREFBaUIsS0FBSyxDQUFDO09BQy9CO0FBQ0QsVUFBTSwwQkFBMEIsR0FBRyw4Q0FBd0IsYUFBYSxDQUFDLENBQUM7QUFDMUUsVUFBSSxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLEVBQUU7QUFDaEUsZUFBTyxpREFBaUIsUUFBUSxDQUFDO09BQ2xDO0FBQ0QsYUFBTyxpREFBaUIsS0FBSyxDQUFDO0tBQy9COzs7OztXQUdZLHVCQUFDLFFBQW9CLEVBQXlCO0FBQ3pELGFBQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzNDOzs7V0FFa0IsNkJBQUMsUUFBcUIsRUFBeUI7QUFDaEUsVUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLGVBQU8saURBQWlCLEtBQUssQ0FBQztPQUMvQjtBQUNELFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkQsVUFBSSxZQUFZLEVBQUU7QUFDaEIsZUFBTyxxREFBcUIsWUFBWSxDQUFDLENBQUM7T0FDM0M7QUFDRCxhQUFPLGlEQUFpQixLQUFLLENBQUM7S0FDL0I7OztXQUVpQiw4QkFBb0Q7QUFDcEUsVUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QyxXQUFLLElBQU0sU0FBUSxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDMUMsb0JBQVksQ0FBQyxTQUFRLENBQUMsR0FBRyxxREFBcUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFRLENBQUMsQ0FBQyxDQUFDO09BQzlFO0FBQ0QsYUFBTyxZQUFZLENBQUM7S0FDckI7OztXQUVlLDBCQUFDLE1BQWUsRUFBVztBQUN6QyxhQUNFLE1BQU0sS0FBSyxpREFBaUIsUUFBUSxJQUNwQyxNQUFNLEtBQUssaURBQWlCLE9BQU8sSUFDbkMsTUFBTSxLQUFLLGlEQUFpQixPQUFPLENBQ25DO0tBQ0g7OztXQUVVLHFCQUFDLE1BQWUsRUFBVztBQUNwQyxhQUNFLE1BQU0sS0FBSyxpREFBaUIsS0FBSyxJQUNqQyxNQUFNLEtBQUssaURBQWlCLFNBQVMsQ0FDckM7S0FDSDs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFlZ0IsV0FDZixLQUFvQixFQUNwQixPQUFnQyxFQUNpQjs7O0FBQ2pELFVBQU0sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDNUIsVUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsT0FBTyxDQUFDLENBQUM7Ozs7QUFJeEUsVUFBTSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7QUFDOUIsV0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUN4QixZQUFNLFFBQVEsR0FBRyxPQUFLLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQyxZQUFJLFFBQVEsRUFBRTtBQUNaLGNBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUMvQixtQkFBTztXQUNSO0FBQ0QsbUJBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLHFEQUFxQixRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQ3pELE1BQU07QUFDTCw0QkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDbkM7T0FDRixDQUFDLENBQUM7OztBQUdILFVBQUksa0JBQWtCLENBQUMsTUFBTSxFQUFFO0FBQzdCLFlBQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM5RSxxQkFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUs7QUFDMUMsbUJBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLHFEQUFxQixNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQ3ZELENBQUMsQ0FBQztPQUNKO0FBQ0QsYUFBTyxTQUFTLENBQUM7S0FDbEI7Ozs7Ozs7Ozs7NkJBUW9CLFdBQ25CLFNBQXdCLEVBQ3hCLE9BQWdDLEVBQ2E7OztBQUM3QyxVQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQy9DLGVBQU8sT0FBSyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDdkMsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUM1QixlQUFPLElBQUksR0FBRyxFQUFFLENBQUM7T0FDbEI7O0FBRUQsVUFBTSx1QkFBdUIsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFeEYsVUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDMUMsVUFBTSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7QUFDOUIsNkJBQXVCLENBQUMsT0FBTyxDQUFDLFVBQUMsV0FBVyxFQUFFLFFBQVEsRUFBSzs7QUFFekQsWUFBTSxTQUFTLEdBQUcsT0FBSyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEQsWUFBSSxTQUFTLElBQUssU0FBUyxLQUFLLFdBQVcsQUFBQyxJQUN4QyxDQUFDLFNBQVMsSUFBSyxXQUFXLEtBQUssNkNBQWEsS0FBSyxBQUFDLEVBQUU7QUFDdEQsNEJBQWtCLENBQUMsSUFBSSxDQUFDO0FBQ3RCLGdCQUFJLEVBQUUsUUFBUTtBQUNkLHNCQUFVLEVBQUUscURBQXFCLFdBQVcsQ0FBQztXQUM5QyxDQUFDLENBQUM7QUFDSCxjQUFJLFdBQVcsS0FBSyw2Q0FBYSxLQUFLLEVBQUU7O0FBRXRDLG1CQUFPLE9BQUssY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JDLG1CQUFLLG9DQUFvQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1dBQ3JELE1BQU07QUFDTCxtQkFBSyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsV0FBVyxDQUFDO0FBQzVDLGdCQUFJLFdBQVcsS0FBSyw2Q0FBYSxRQUFRLEVBQUU7QUFDekMscUJBQUssK0JBQStCLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDaEQ7V0FDRjtTQUNGO0FBQ0Qsb0JBQVksVUFBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQy9CLENBQUMsQ0FBQzs7Ozs7Ozs7O0FBU0gsVUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RELFVBQUksY0FBYyxLQUFLLCtDQUFlLFlBQVksRUFBRTtBQUNsRCxvQkFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUMvQixjQUFJLE9BQUssY0FBYyxDQUFDLFFBQVEsQ0FBQyxLQUFLLDZDQUFhLE9BQU8sRUFBRTtBQUMxRCxtQkFBTyxPQUFLLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztXQUN0QztTQUNGLENBQUMsQ0FBQztPQUNKLE1BQU0sSUFBSSxjQUFjLEtBQUssK0NBQWUsWUFBWSxFQUFFOzs7QUFHekQsb0JBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDL0IsY0FBTSxjQUFjLEdBQUcsT0FBSyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckQsaUJBQU8sT0FBSyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckMsY0FBSSxjQUFjLEtBQUssNkNBQWEsUUFBUSxFQUFFO0FBQzVDLG1CQUFLLG9DQUFvQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1dBQ3JEO1NBQ0YsQ0FBQyxDQUFDO09BQ0osTUFBTTtBQUNMLG9CQUFZLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQy9CLGNBQU0sY0FBYyxHQUFHLE9BQUssY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JELGNBQUksY0FBYyxLQUFLLDZDQUFhLE9BQU8sRUFBRTtBQUMzQyxtQkFBTyxPQUFLLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQyxnQkFBSSxjQUFjLEtBQUssNkNBQWEsUUFBUSxFQUFFO0FBQzVDLHFCQUFLLG9DQUFvQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3JEO1dBQ0Y7U0FDRixDQUFDLENBQUM7T0FDSjs7O0FBR0Qsd0JBQWtCLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSyxFQUFJO0FBQ2xDLGVBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQztPQUNoRCxDQUFDLENBQUM7QUFDSCxVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUUxQyxhQUFPLHVCQUF1QixDQUFDO0tBQ2hDOzs7V0FFOEIseUNBQUMsUUFBb0IsRUFBRTtBQUNwRCxpREFDRSxJQUFJLENBQUMsdUJBQXVCLEVBQzVCLFFBQVEsRUFDUixJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQzdDLENBQUM7S0FDSDs7O1dBRW1DLDhDQUFDLFFBQW9CLEVBQUU7QUFDekQsc0RBQ0UsSUFBSSxDQUFDLHVCQUF1QixFQUM1QixRQUFRLEVBQ1IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUM3QyxDQUFDO0tBQ0g7Ozs7Ozs7OztXQU8rQiwwQ0FDOUIsT0FBZ0MsRUFDTTtBQUN0QyxVQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRXRELFVBQUksY0FBYyxLQUFLLCtDQUFlLFlBQVksRUFBRTtBQUNsRCxlQUFPLG9CQUFvQixDQUFDO09BQzdCLE1BQU0sSUFBSSxjQUFjLEtBQUssK0NBQWUsWUFBWSxFQUFFO0FBQ3pELGVBQU8sbUJBQW1CLENBQUM7T0FDNUIsTUFBTTtBQUNMLGVBQU8sdUJBQXVCLENBQUM7T0FDaEM7S0FDRjs7Ozs7Ozs7OztXQVNXLHNCQUFDLFFBQXFCLEVBQXFDO0FBQ3JFLFVBQU0sVUFBVSxHQUFHLEVBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUM7QUFDMUMsVUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLGVBQU8sVUFBVSxDQUFDO09BQ25CO0FBQ0QsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQyxhQUFPLFVBQVUsR0FBRyxFQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFDLEdBQ3RFLFVBQVUsQ0FBQztLQUNoQjs7Ozs7Ozs7Ozs7OztXQVdXLHNCQUFDLFFBQXFCLEVBQUUsSUFBYSxFQUFtQjtBQUNsRSxVQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsZUFBTyxFQUFFLENBQUM7T0FDWDtBQUNELFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDN0MsYUFBTyxRQUFRLEdBQUcsUUFBUSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7S0FDM0M7Ozs7Ozs7Ozs7Ozs7Ozs2QkFjd0IsV0FBQyxRQUFvQixFQUE4QztBQUMxRixVQUFNLFVBQVUsR0FBRyxFQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBQyxDQUFDO0FBQzFDLFVBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixlQUFPLFVBQVUsQ0FBQztPQUNuQjs7O0FBR0QsVUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNuRCxVQUFJLGNBQWMsRUFBRTtBQUNsQixlQUFPLEVBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUMsQ0FBQztPQUN2RTs7O0FBR0QsVUFBTSxxQkFBcUIsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLFVBQUkscUJBQXFCLEVBQUU7QUFDekIsWUFBTSxRQUFRLEdBQUcscUJBQXFCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JELFlBQUksUUFBUSxJQUFJLElBQUksRUFBRTtBQUNwQixpQkFBTyxFQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTyxFQUFDLENBQUM7U0FDM0Q7T0FDRjs7QUFFRCxhQUFPLFVBQVUsQ0FBQztLQUNuQjs7Ozs7Ozs7OzZCQU93QixXQUFDLFFBQW9CLEVBQTRCO0FBQ3hFLFVBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNyQixVQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsZUFBTyxTQUFTLENBQUM7T0FDbEI7OztBQUdELFVBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkQsVUFBSSxjQUFjLEVBQUU7QUFDbEIsZUFBTyxjQUFjLENBQUMsU0FBUyxDQUFDO09BQ2pDOzs7QUFHRCxVQUFNLHFCQUFxQixHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDckUsVUFBSSxxQkFBcUIsSUFBSSxJQUFJLEVBQUU7QUFDakMsWUFBTSxRQUFRLEdBQUcscUJBQXFCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JELFlBQUksUUFBUSxJQUFJLElBQUksRUFBRTtBQUNwQixpQkFBTyxRQUFRLENBQUMsU0FBUyxDQUFDO1NBQzNCO09BQ0Y7O0FBRUQsYUFBTyxTQUFTLENBQUM7S0FDbEI7Ozs7Ozs7Ozs7Ozs2QkFVb0IsV0FBQyxTQUE0QixFQUF1Qzs7O0FBQ3ZGLFVBQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBQSxLQUFLLEVBQUk7O0FBRTdDLFlBQUksQ0FBQyxPQUFLLGVBQWUsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNoQyxpQkFBTyxLQUFLLENBQUM7U0FDZDs7QUFFRCxZQUFJLE9BQUsseUJBQXlCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzdDLGlCQUFPLEtBQUssQ0FBQztTQUNkLE1BQU07QUFDTCxpQkFBSyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUMsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7T0FDRixDQUFDLENBQUM7O0FBRUgsVUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUM3QixlQUFPLElBQUksR0FBRyxFQUFFLENBQUM7T0FDbEI7OztBQUdELFVBQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDeEUsVUFBSSxlQUFlLEVBQUU7QUFDbkIsMEJBQW1DLGVBQWUsRUFBRTs7O2NBQXhDLFVBQVE7Y0FBRSxRQUFROztBQUM1QixjQUFJLENBQUMsWUFBWSxDQUFDLFVBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQztTQUN4QztPQUNGOzs7QUFHRCxVQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLFVBQUEsV0FBVyxFQUFJO0FBQ25ELGVBQU8sT0FBSyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7T0FDdkMsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDOzs7QUFHdEMsV0FBSyxJQUFNLFdBQVcsSUFBSSxZQUFZLEVBQUU7QUFDdEMsWUFBSSxDQUFDLHlCQUF5QixVQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7T0FDcEQ7Ozs7O0FBS0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUMxQyxhQUFPLGVBQWUsQ0FBQztLQUN4Qjs7Ozs7Ozs7OzZCQVF5QixhQUFvQjtBQUM1QyxVQUFJLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztBQUM5QixVQUFJO0FBQ0YsNEJBQW9CLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLENBQUM7T0FDbkUsQ0FBQyxPQUFPLENBQUMsRUFBRTs7OztPQUlYO0FBQ0QsVUFBSSxvQkFBb0IsS0FBSyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7QUFDbEQsWUFBSSxDQUFDLGdCQUFnQixHQUFHLG9CQUFvQixDQUFDOzs7QUFHN0MsWUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztPQUMzQztBQUNELGFBQU8sSUFBSSxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQztLQUNwQzs7Ozs7Ozs7Ozs7V0FVVyxzQkFBQyxJQUFZLEVBQVc7QUFDbEMsYUFBTyxLQUFLLENBQUM7S0FDZDs7Ozs7V0FHZ0IsMkJBQUMsU0FBaUIsRUFBRSxNQUFlLEVBQVc7QUFDN0QsYUFBTyxLQUFLLENBQUM7S0FDZDs7Ozs7Ozs2QkFLcUIsV0FBQyxTQUFpQixFQUFFLE1BQWUsRUFBb0I7QUFDM0UsYUFBTyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUN4RDs7Ozs7Ozs7Ozs7Ozs7V0FhYyx5QkFBQyxZQUErQixFQUFROzs7QUFDckQsVUFBTSxvQkFBb0IsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDbEYsVUFBSSxvQkFBb0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3JDLGVBQU87T0FDUixNQUFNLElBQUksb0JBQW9CLENBQUMsTUFBTSxJQUFJLDRCQUE0QixFQUFFOztBQUV0RSxZQUFJLENBQUMsZUFBZSxDQUFDLG9CQUFvQixFQUFFLEVBQUMsY0FBYyxFQUFFLCtDQUFlLFlBQVksRUFBQyxDQUFDLENBQUM7QUFDMUYsWUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsVUFBQSxRQUFRO2lCQUFJLE9BQUssWUFBWSxDQUFDLFFBQVEsQ0FBQztTQUFBLENBQUMsQ0FBQyxDQUFDO09BQzVGLE1BQU07Ozs7OztBQU1MLFlBQUksQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDO09BQzFDO0tBQ0Y7OztXQUVnQyw2Q0FBUzs7O0FBQ3hDLFVBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDO0FBQ3BELFVBQUksbUJBQW1CLElBQUksSUFBSSxFQUFFO0FBQy9CLFlBQU0sU0FBUyxxQkFBRyxhQUFZO0FBQzVCLGNBQUksT0FBSyw0QkFBNEIsRUFBRTtBQUNyQyxtQkFBTztXQUNSO0FBQ0QsaUJBQUssNEJBQTRCLEdBQUcsSUFBSSxDQUFDOztBQUV6QyxjQUFNLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBSyxjQUFjLENBQUMsQ0FBQztBQUM1RCxpQkFBSyxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLGlCQUFLLHVCQUF1QixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Ozs7O0FBS3pDLGlCQUFLLGVBQWUsQ0FDaEIsQ0FBQyxPQUFLLG1CQUFtQixFQUFFLENBQUMsRUFBRSxFQUFDLGNBQWMsRUFBRSwrQ0FBZSxnQkFBZ0IsRUFBQyxDQUFDLENBQUM7QUFDckYsY0FBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7Ozs7OztBQU03QixrQkFBTSxPQUFLLGVBQWUsQ0FDdEIsa0JBQWtCLEVBQUUsRUFBQyxjQUFjLEVBQUUsK0NBQWUsWUFBWSxFQUFDLENBQUMsQ0FBQztXQUN4RTs7QUFFRCxjQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBSyxZQUFZLENBQUMsQ0FBQztBQUN4RCxpQkFBSyxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLGdCQUFNLE9BQUssZUFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0FBRTdDLGlCQUFLLDRCQUE0QixHQUFHLEtBQUssQ0FBQztTQUMzQyxDQUFBLENBQUM7QUFDRixZQUFJLENBQUMsb0JBQW9CLEdBQUcsdUJBQzFCLFNBQVMsRUFDVCxxQ0FBcUM7dUJBQ3JCLEtBQUssQ0FDdEIsQ0FBQztBQUNGLDJCQUFtQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztPQUNqRDtBQUNELHlCQUFtQixFQUFFLENBQUM7S0FDdkI7Ozs7Ozs7OztXQVF5QixvQ0FBQyxRQUFvQixFQUFFLFFBQWlCLEVBQW9CO0FBQ3BGLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDckU7OztXQUUwQixxQ0FBQyxRQUFnQixFQUFpQztBQUMzRSxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsMkJBQTJCLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDNUQ7OztXQUVrQywrQ0FBa0M7QUFDbkUsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLG1DQUFtQyxFQUFFLENBQUM7S0FDNUQ7Ozs7O1dBR2Esd0JBQUMsUUFBb0IsRUFBZ0M7QUFDakUsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMvQzs7Ozs7V0FHb0MsK0NBQUMsV0FBbUIsRUFBb0I7QUFDM0UsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLHFDQUFxQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3pFOzs7V0FFVSxxQkFBQyxTQUFrQixFQUFFLE9BQWdCLEVBQW1CO0FBQ2pFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3REOzs7V0FFSyxnQkFBQyxXQUFtQixFQUFFLFdBQW1CLEVBQW9CO0FBQ2pFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ3ZEOzs7V0FFSyxnQkFBQyxRQUFnQixFQUFvQjtBQUN6QyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3ZDOzs7V0FFRSxhQUFDLFFBQWdCLEVBQW9CO0FBQ3RDLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDcEM7OztXQUVlLDBCQUFDLE9BQWdDLEVBQXdCO0FBQ3ZFLFVBQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUNuQixlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsYUFBTyxPQUFPLENBQUMsY0FBYyxDQUFDO0tBQy9COzs7U0F4ekJrQixrQkFBa0I7OztxQkFBbEIsa0JBQWtCIiwiZmlsZSI6IkhnUmVwb3NpdG9yeUNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRGlmZkluZm8sXG4gIEhnU3RhdHVzT3B0aW9uVmFsdWUsXG4gIExpbmVEaWZmLFxuICBSZXZpc2lvbkluZm8sXG4gIFJldmlzaW9uRmlsZUNoYW5nZXMsXG4gIFN0YXR1c0NvZGVJZFZhbHVlLFxuICBTdGF0dXNDb2RlTnVtYmVyVmFsdWUsXG59IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuaW1wb3J0IHR5cGUge1xuICBIZ1NlcnZpY2UsXG59IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlLmpzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIFN0YXR1c0NvZGVJZCxcbiAgU3RhdHVzQ29kZUlkVG9OdW1iZXIsXG4gIFN0YXR1c0NvZGVOdW1iZXIsXG4gIEhnU3RhdHVzT3B0aW9uLFxufSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL2hnLWNvbnN0YW50cyc7XG5pbXBvcnQge2RlYm91bmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7ZW5zdXJlVHJhaWxpbmdTZXBhcmF0b3J9IGZyb20gJy4uLy4uL2NvbW1vbnMvbGliL3BhdGhzJztcbmltcG9ydCB7YWRkQWxsUGFyZW50RGlyZWN0b3JpZXNUb0NhY2hlLCByZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZX0gZnJvbSAnLi91dGlscyc7XG5cbnR5cGUgSGdSZXBvc2l0b3J5T3B0aW9ucyA9IHtcbiAgLyoqIFRoZSBvcmlnaW4gVVJMIG9mIHRoaXMgcmVwb3NpdG9yeS4gKi9cbiAgb3JpZ2luVVJMOiA/c3RyaW5nLFxuXG4gIC8qKiBUaGUgd29ya2luZyBkaXJlY3Rvcnkgb2YgdGhpcyByZXBvc2l0b3J5LiAqL1xuICB3b3JraW5nRGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSB8IFJlbW90ZURpcmVjdG9yeSxcblxuICAvKiogVGhlIHJvb3QgZGlyZWN0b3J5IHRoYXQgaXMgb3BlbmVkIGluIEF0b20sIHdoaWNoIHRoaXMgUmVwb3NpdG9yeSBzZXJ2ZXMuICoqL1xuICBwcm9qZWN0Um9vdERpcmVjdG9yeTogYXRvbSREaXJlY3RvcnksXG59O1xuXG4vKipcbiAqXG4gKiBTZWN0aW9uOiBDb25zdGFudHMsIFR5cGUgRGVmaW5pdGlvbnNcbiAqXG4gKi9cblxuZXhwb3J0IHR5cGUgSGdTdGF0dXNDb21tYW5kT3B0aW9ucyA9IHtcbiAgaGdTdGF0dXNPcHRpb246IEhnU3RhdHVzT3B0aW9uVmFsdWUsXG59O1xuXG5jb25zdCBFRElUT1JfU1VCU0NSSVBUSU9OX05BTUUgPSAnaGctcmVwb3NpdG9yeS1lZGl0b3Itc3Vic2NyaXB0aW9uJztcbmV4cG9ydCBjb25zdCBERUJPVU5DRV9NSUxMSVNFQ09ORFNfRk9SX1JFRlJFU0hfQUxMID0gNTAwO1xuZXhwb3J0IGNvbnN0IE1BWF9JTkRJVklEVUFMX0NIQU5HRURfUEFUSFMgPSAxO1xuXG5mdW5jdGlvbiBmaWx0ZXJGb3JPbmx5Tm90SWdub3JlZChjb2RlOiBTdGF0dXNDb2RlSWRWYWx1ZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKGNvZGUgIT09IFN0YXR1c0NvZGVJZC5JR05PUkVEKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyRm9yT25seUlnbm9yZWQoY29kZTogU3RhdHVzQ29kZUlkVmFsdWUpOiBib29sZWFuIHtcbiAgcmV0dXJuIChjb2RlID09PSBTdGF0dXNDb2RlSWQuSUdOT1JFRCk7XG59XG5cbmZ1bmN0aW9uIGZpbHRlckZvckFsbFN0YXR1ZXMoKSB7XG4gIHJldHVybiB0cnVlO1xufVxuXG5cbi8qKlxuICpcbiAqIFNlY3Rpb246IEhnUmVwb3NpdG9yeUNsaWVudFxuICpcbiAqL1xuXG4vKipcbiAqIEhnUmVwb3NpdG9yeUNsaWVudCBydW5zIG9uIHRoZSBtYWNoaW5lIHRoYXQgTnVjbGlkZS9BdG9tIGlzIHJ1bm5pbmcgb24uXG4gKiBJdCBpcyB0aGUgaW50ZXJmYWNlIHRoYXQgb3RoZXIgQXRvbSBwYWNrYWdlcyB3aWxsIHVzZSB0byBhY2Nlc3MgTWVyY3VyaWFsLlxuICogSXQgY2FjaGVzIGRhdGEgZmV0Y2hlZCBmcm9tIGFuIEhnU2VydmljZS5cbiAqIEl0IGltcGxlbWVudHMgdGhlIHNhbWUgaW50ZXJmYWNlIGFzIEdpdFJlcG9zaXRvcnksIChodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L0dpdFJlcG9zaXRvcnkpXG4gKiBpbiBhZGRpdGlvbiB0byBwcm92aWRpbmcgYXN5bmNocm9ub3VzIG1ldGhvZHMgZm9yIHNvbWUgZ2V0dGVycy5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7UmVtb3RlRGlyZWN0b3J5fSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhnUmVwb3NpdG9yeUNsaWVudCB7XG4gIF9wYXRoOiBzdHJpbmc7XG4gIF93b3JraW5nRGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSB8IFJlbW90ZURpcmVjdG9yeTtcbiAgX3Byb2plY3REaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5O1xuICBfb3JpZ2luVVJMOiA/c3RyaW5nO1xuICBfc2VydmljZTogSGdTZXJ2aWNlO1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgLy8gQSBtYXAgZnJvbSBhIGtleSAoaW4gbW9zdCBjYXNlcywgYSBmaWxlIHBhdGgpLCB0byBhIHJlbGF0ZWQgRGlzcG9zYWJsZS5cbiAgX2Rpc3Bvc2FibGVzOiB7W2tleTogc3RyaW5nXTogSURpc3Bvc2FibGV9O1xuICBfaGdTdGF0dXNDYWNoZToge1tmaWxlUGF0aDogTnVjbGlkZVVyaV06IFN0YXR1c0NvZGVJZFZhbHVlfTtcbiAgLy8gTWFwIG9mIGRpcmVjdG9yeSBwYXRoIHRvIHRoZSBudW1iZXIgb2YgbW9kaWZpZWQgZmlsZXMgd2l0aGluIHRoYXQgZGlyZWN0b3J5LlxuICBfbW9kaWZpZWREaXJlY3RvcnlDYWNoZTogTWFwPHN0cmluZywgbnVtYmVyPjtcbiAgX2hnRGlmZkNhY2hlOiB7W2ZpbGVQYXRoOiBOdWNsaWRlVXJpXTogRGlmZkluZm99O1xuICBfaGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nOiBTZXQ8TnVjbGlkZVVyaT47XG4gIF9oZ0RpZmZDYWNoZUZpbGVzVG9DbGVhcjogU2V0PE51Y2xpZGVVcmk+O1xuXG4gIC8vIEEgZGVib3VuY2VkIGZ1bmN0aW9uIHRoYXQgZXZlbnR1YWxseSBjYWxscyBfZG9SZWZyZXNoU3RhdHVzZXNPZkFsbEZpbGVzSW5DYWNoZS5cbiAgX2RlYm91bmNlZFJlZnJlc2hBbGw6ID8oKSA9PiBtaXhlZDtcbiAgX2lzUmVmcmVzaGluZ0FsbEZpbGVzSW5DYWNoZTogYm9vbGVhbjtcblxuICBfY3VycmVudEJvb2ttYXJrOiA/c3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJlcG9QYXRoOiBzdHJpbmcsIGhnU2VydmljZTogSGdTZXJ2aWNlLCBvcHRpb25zOiBIZ1JlcG9zaXRvcnlPcHRpb25zKSB7XG4gICAgdGhpcy5fcGF0aCA9IHJlcG9QYXRoO1xuICAgIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkgPSBvcHRpb25zLndvcmtpbmdEaXJlY3Rvcnk7XG4gICAgdGhpcy5fcHJvamVjdERpcmVjdG9yeSA9IG9wdGlvbnMucHJvamVjdFJvb3REaXJlY3Rvcnk7XG4gICAgdGhpcy5fb3JpZ2luVVJMID0gb3B0aW9ucy5vcmlnaW5VUkw7XG4gICAgdGhpcy5fc2VydmljZSA9IGhnU2VydmljZTtcblxuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0ge307XG5cbiAgICB0aGlzLl9oZ1N0YXR1c0NhY2hlID0ge307XG4gICAgdGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZSA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX2hnRGlmZkNhY2hlID0ge307XG4gICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNUb0NsZWFyID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzW0VESVRPUl9TVUJTQ1JJUFRJT05fTkFNRV0gPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoZWRpdG9yID0+IHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgICAgLy8gVE9ETzogb2JzZXJ2ZSBmb3Igd2hlbiB0aGlzIGVkaXRvcidzIHBhdGggY2hhbmdlcy5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLl9pc1BhdGhSZWxldmFudChmaWxlUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gSWYgdGhpcyBlZGl0b3IgaGFzIGJlZW4gcHJldmlvdXNseSBhY3RpdmUsIHdlIHdpbGwgaGF2ZSBhbHJlYWR5XG4gICAgICAvLyBpbml0aWFsaXplZCBkaWZmIGluZm8gYW5kIHJlZ2lzdGVyZWQgbGlzdGVuZXJzIG9uIGl0LlxuICAgICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGVzW2ZpbGVQYXRoXSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBUT0RPICh0ODIyNzU3MCkgR2V0IGluaXRpYWwgZGlmZiBzdGF0cyBmb3IgdGhpcyBlZGl0b3IsIGFuZCByZWZyZXNoXG4gICAgICAvLyB0aGlzIGluZm9ybWF0aW9uIHdoZW5ldmVyIHRoZSBjb250ZW50IG9mIHRoZSBlZGl0b3IgY2hhbmdlcy5cbiAgICAgIGNvbnN0IGVkaXRvclN1YnNjcmlwdGlvbnMgPSB0aGlzLl9kaXNwb3NhYmxlc1tmaWxlUGF0aF0gPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkU2F2ZShldmVudCA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURpZmZJbmZvKFtldmVudC5wYXRoXSk7XG4gICAgICB9KSk7XG4gICAgICAvLyBSZW1vdmUgdGhlIGZpbGUgZnJvbSB0aGUgZGlmZiBzdGF0cyBjYWNoZSB3aGVuIHRoZSBlZGl0b3IgaXMgY2xvc2VkLlxuICAgICAgLy8gVGhpcyBpc24ndCBzdHJpY3RseSBuZWNlc3NhcnksIGJ1dCBrZWVwcyB0aGUgY2FjaGUgYXMgc21hbGwgYXMgcG9zc2libGUuXG4gICAgICAvLyBUaGVyZSBhcmUgY2FzZXMgd2hlcmUgdGhpcyByZW1vdmFsIG1heSByZXN1bHQgaW4gcmVtb3ZpbmcgaW5mb3JtYXRpb25cbiAgICAgIC8vIHRoYXQgaXMgc3RpbGwgcmVsZXZhbnQ6IGUuZy5cbiAgICAgIC8vICAgKiBpZiB0aGUgdXNlciB2ZXJ5IHF1aWNrbHkgY2xvc2VzIGFuZCByZW9wZW5zIGEgZmlsZTsgb3JcbiAgICAgIC8vICAgKiBpZiB0aGUgZmlsZSBpcyBvcGVuIGluIG11bHRpcGxlIGVkaXRvcnMsIGFuZCBvbmUgb2YgdGhvc2UgaXMgY2xvc2VkLlxuICAgICAgLy8gVGhlc2UgYXJlIHByb2JhYmx5IGVkZ2UgY2FzZXMsIHRob3VnaCwgYW5kIHRoZSBpbmZvcm1hdGlvbiB3aWxsIGJlXG4gICAgICAvLyByZWZldGNoZWQgdGhlIG5leHQgdGltZSB0aGUgZmlsZSBpcyBlZGl0ZWQuXG4gICAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXIuYWRkKGZpbGVQYXRoKTtcbiAgICAgICAgdGhpcy5fZGlzcG9zYWJsZXNbZmlsZVBhdGhdLmRpc3Bvc2UoKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2Rpc3Bvc2FibGVzW2ZpbGVQYXRoXTtcbiAgICAgIH0pKTtcbiAgICB9KTtcblxuICAgIC8vIEdldCB1cGRhdGVzIHRoYXQgdGVsbCB0aGUgSGdSZXBvc2l0b3J5Q2xpZW50IHdoZW4gdG8gY2xlYXIgaXRzIGNhY2hlcy5cbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVGaWxlc0RpZENoYW5nZSgpLnN1YnNjcmliZSh0aGlzLl9maWxlc0RpZENoYW5nZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVIZ0lnbm9yZUZpbGVEaWRDaGFuZ2UoKVxuICAgICAgLnN1YnNjcmliZSh0aGlzLl9yZWZyZXNoU3RhdHVzZXNPZkFsbEZpbGVzSW5DYWNoZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVIZ1JlcG9TdGF0ZURpZENoYW5nZSgpXG4gICAgICAuc3Vic2NyaWJlKHRoaXMuX3JlZnJlc2hTdGF0dXNlc09mQWxsRmlsZXNJbkNhY2hlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX3NlcnZpY2Uub2JzZXJ2ZUhnQm9va21hcmtEaWRDaGFuZ2UoKVxuICAgICAgLnN1YnNjcmliZSh0aGlzLmZldGNoQ3VycmVudEJvb2ttYXJrLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5faXNSZWZyZXNoaW5nQWxsRmlsZXNJbkNhY2hlID0gZmFsc2U7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWRlc3Ryb3knKTtcbiAgICB0aGlzLl9lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9kaXNwb3NhYmxlcykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXNba2V5XS5kaXNwb3NlKCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VydmljZS5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogRXZlbnQgU3Vic2NyaXB0aW9uXG4gICAqXG4gICAqL1xuXG4gIG9uRGlkRGVzdHJveShjYWxsYmFjazogKCkgPT4ge30pOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChldmVudDoge3BhdGg6IHN0cmluZywgcGF0aFN0YXR1czogU3RhdHVzQ29kZU51bWJlclZhbHVlfSkgPT4ge31cbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXN0YXR1cycsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlU3RhdHVzZXMoY2FsbGJhY2s6ICgpID0+IHt9KTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXN0YXR1c2VzJywgY2FsbGJhY2spO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmVwb3NpdG9yeSBEZXRhaWxzXG4gICAqXG4gICAqL1xuXG4gIGdldFR5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ2hnJztcbiAgfVxuXG4gIGdldFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcGF0aDtcbiAgfVxuXG4gIGdldFdvcmtpbmdEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fd29ya2luZ0RpcmVjdG9yeS5nZXRQYXRoKCk7XG4gIH1cblxuICAvLyBAcmV0dXJuIFRoZSBwYXRoIG9mIHRoZSByb290IHByb2plY3QgZm9sZGVyIGluIEF0b20gdGhhdCB0aGlzXG4gIC8vIEhnUmVwb3NpdG9yeUNsaWVudCBwcm92aWRlcyBpbmZvcm1hdGlvbiBhYm91dC5cbiAgZ2V0UHJvamVjdERpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9wcm9qZWN0RGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGlzUHJvamVjdEF0Um9vdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJlbGF0aXZpemUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl93b3JraW5nRGlyZWN0b3J5LnJlbGF0aXZpemUoZmlsZVBhdGgpO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgaGFzQnJhbmNoKGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gVGhlIGN1cnJlbnQgSGcgYm9va21hcmsuXG4gICAqL1xuICBnZXRTaG9ydEhlYWQoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5fY3VycmVudEJvb2ttYXJrKSB7XG4gICAgICAvLyBLaWNrIG9mZiBhIGZldGNoIHRvIGdldCB0aGUgY3VycmVudCBib29rbWFyay4gVGhpcyBpcyBhc3luYy5cbiAgICAgIHRoaXMuZmV0Y2hDdXJyZW50Qm9va21hcmsoKTtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRCb29rbWFyaztcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGlzU3VibW9kdWxlKHBhdGg6IE51Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBnZXRBaGVhZEJlaGluZENvdW50KHJlZmVyZW5jZTogc3RyaW5nLCBwYXRoOiBOdWNsaWRlVXJpKTogbnVtYmVyIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldENhY2hlZFVwc3RyZWFtQWhlYWRCZWhpbmRDb3VudChwYXRoOiA/TnVjbGlkZVVyaSk6IHthaGVhZDogbnVtYmVyLCBiZWhpbmQ6IG51bWJlcix9IHtcbiAgICByZXR1cm4ge1xuICAgICAgYWhlYWQ6IDAsXG4gICAgICBiZWhpbmQ6IDAsXG4gICAgfTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldENvbmZpZ1ZhbHVlKGtleTogc3RyaW5nLCBwYXRoOiA/c3RyaW5nKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRPcmlnaW5VUkwocGF0aDogP3N0cmluZyk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9vcmlnaW5VUkw7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBnZXRVcHN0cmVhbUJyYW5jaChwYXRoOiA/c3RyaW5nKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBnZXRSZWZlcmVuY2VzKFxuICAgIHBhdGg6ID9OdWNsaWRlVXJpLFxuICApOiB7aGVhZHM6IEFycmF5PHN0cmluZz4sIHJlbW90ZXM6IEFycmF5PHN0cmluZz4sIHRhZ3M6IEFycmF5PHN0cmluZz4sfSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhlYWRzOiBbXSxcbiAgICAgIHJlbW90ZXM6IFtdLFxuICAgICAgdGFnczogW10sXG4gICAgfTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldFJlZmVyZW5jZVRhcmdldChyZWZlcmVuY2U6IHN0cmluZywgcGF0aDogP051Y2xpZGVVcmkpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJlYWRpbmcgU3RhdHVzIChwYXJpdHkgd2l0aCBHaXRSZXBvc2l0b3J5KVxuICAgKlxuICAgKi9cblxuICAvLyBUT0RPIChqZXNzaWNhbGluKSBDYW4gd2UgY2hhbmdlIHRoZSBBUEkgdG8gbWFrZSB0aGlzIG1ldGhvZCByZXR1cm4gYSBQcm9taXNlP1xuICAvLyBJZiBub3QsIG1pZ2h0IG5lZWQgdG8gZG8gYSBzeW5jaHJvbm91cyBgaGcgc3RhdHVzYCBxdWVyeS5cbiAgaXNQYXRoTW9kaWZpZWQoZmlsZVBhdGg6ID9OdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZWRQYXRoU3RhdHVzID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgaWYgKCFjYWNoZWRQYXRoU3RhdHVzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmlzU3RhdHVzTW9kaWZpZWQoU3RhdHVzQ29kZUlkVG9OdW1iZXJbY2FjaGVkUGF0aFN0YXR1c10pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIENhbiB3ZSBjaGFuZ2UgdGhlIEFQSSB0byBtYWtlIHRoaXMgbWV0aG9kIHJldHVybiBhIFByb21pc2U/XG4gIC8vIElmIG5vdCwgbWlnaHQgbmVlZCB0byBkbyBhIHN5bmNocm9ub3VzIGBoZyBzdGF0dXNgIHF1ZXJ5LlxuICBpc1BhdGhOZXcoZmlsZVBhdGg6ID9OdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZWRQYXRoU3RhdHVzID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgaWYgKCFjYWNoZWRQYXRoU3RhdHVzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmlzU3RhdHVzTmV3KFN0YXR1c0NvZGVJZFRvTnVtYmVyW2NhY2hlZFBhdGhTdGF0dXNdKTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPIChqZXNzaWNhbGluKSBDYW4gd2UgY2hhbmdlIHRoZSBBUEkgdG8gbWFrZSB0aGlzIG1ldGhvZCByZXR1cm4gYSBQcm9taXNlP1xuICAvLyBJZiBub3QsIHRoaXMgbWV0aG9kIGxpZXMgYSBiaXQgYnkgdXNpbmcgY2FjaGVkIGluZm9ybWF0aW9uLlxuICAvLyBUT0RPIChqZXNzaWNhbGluKSBNYWtlIHRoaXMgd29yayBmb3IgaWdub3JlZCBkaXJlY3Rvcmllcy5cbiAgaXNQYXRoSWdub3JlZChmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIGBoZyBzdGF0dXMgLWlgIGRvZXMgbm90IGxpc3QgdGhlIHJlcG8gKHRoZSAuaGcgZGlyZWN0b3J5KSwgcHJlc3VtYWJseVxuICAgIC8vIGJlY2F1c2UgdGhlIHJlcG8gZG9lcyBub3QgdHJhY2sgaXRzZWxmLlxuICAgIC8vIFdlIHdhbnQgdG8gcmVwcmVzZW50IHRoZSBmYWN0IHRoYXQgaXQncyBub3QgcGFydCBvZiB0aGUgdHJhY2tlZCBjb250ZW50cyxcbiAgICAvLyBzbyB3ZSBtYW51YWxseSBhZGQgYW4gZXhjZXB0aW9uIGZvciBpdCB2aWEgdGhlIF9pc1BhdGhXaXRoaW5IZ1JlcG8gY2hlY2suXG4gICAgcmV0dXJuICh0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXSA9PT0gU3RhdHVzQ29kZUlkLklHTk9SRUQpIHx8XG4gICAgICAgIHRoaXMuX2lzUGF0aFdpdGhpbkhnUmVwbyhmaWxlUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBwYXRoIGlzIHdpdGhpbiB0aGUgcmVwbyBkaXJlY3RvcnkgKGkuZS4gYC5oZy9gKS5cbiAgICovXG4gIF9pc1BhdGhXaXRoaW5IZ1JlcG8oZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKGZpbGVQYXRoID09PSB0aGlzLmdldFBhdGgoKSkgfHwgKGZpbGVQYXRoLmluZGV4T2YodGhpcy5nZXRQYXRoKCkgKyAnLycpID09PSAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciBhIHBhdGggaXMgcmVsZXZhbnQgdG8gdGhpcyBIZ1JlcG9zaXRvcnlDbGllbnQuIEEgcGF0aCBpc1xuICAgKiBkZWZpbmVkIGFzICdyZWxldmFudCcgaWYgaXQgaXMgd2l0aGluIHRoZSBwcm9qZWN0IGRpcmVjdG9yeSBvcGVuZWQgd2l0aGluIHRoZSByZXBvLlxuICAgKi9cbiAgX2lzUGF0aFJlbGV2YW50KGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2plY3REaXJlY3RvcnkuY29udGFpbnMoZmlsZVBhdGgpIHx8XG4gICAgICAgICAgICh0aGlzLl9wcm9qZWN0RGlyZWN0b3J5LmdldFBhdGgoKSA9PT0gZmlsZVBhdGgpO1xuICB9XG5cbiAgLy8gRm9yIG5vdywgdGhpcyBtZXRob2Qgb25seSByZWZsZWN0cyB0aGUgc3RhdHVzIG9mIFwibW9kaWZpZWRcIiBkaXJlY3Rvcmllcy5cbiAgLy8gVHJhY2tpbmcgZGlyZWN0b3J5IHN0YXR1cyBpc24ndCBzdHJhaWdodGZvcndhcmQsIGFzIEhnIG9ubHkgdHJhY2tzIGZpbGVzLlxuICAvLyBodHRwOi8vbWVyY3VyaWFsLnNlbGVuaWMuY29tL3dpa2kvRkFRI0ZBUS4yRkNvbW1vblByb2JsZW1zLklfdHJpZWRfdG9fY2hlY2tfaW5fYW5fZW1wdHlfZGlyZWN0b3J5X2FuZF9pdF9mYWlsZWQuMjFcbiAgLy8gVE9ETzogTWFrZSB0aGlzIG1ldGhvZCByZWZsZWN0IE5ldyBhbmQgSWdub3JlZCBzdGF0dXNlcy5cbiAgZ2V0RGlyZWN0b3J5U3RhdHVzKGRpcmVjdG9yeVBhdGg6ID9zdHJpbmcpOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWUge1xuICAgIGlmICghZGlyZWN0b3J5UGF0aCkge1xuICAgICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU47XG4gICAgfVxuICAgIGNvbnN0IGRpcmVjdG9yeVBhdGhXaXRoU2VwYXJhdG9yID0gZW5zdXJlVHJhaWxpbmdTZXBhcmF0b3IoZGlyZWN0b3J5UGF0aCk7XG4gICAgaWYgKHRoaXMuX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGUuaGFzKGRpcmVjdG9yeVBhdGhXaXRoU2VwYXJhdG9yKSkge1xuICAgICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQ7XG4gICAgfVxuICAgIHJldHVybiBTdGF0dXNDb2RlTnVtYmVyLkNMRUFOO1xuICB9XG5cbiAgLy8gV2UgZG9uJ3Qgd2FudCB0byBkbyBhbnkgc3luY2hyb25vdXMgJ2hnIHN0YXR1cycgY2FsbHMuIEp1c3QgdXNlIGNhY2hlZCB2YWx1ZXMuXG4gIGdldFBhdGhTdGF0dXMoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWUge1xuICAgIHJldHVybiB0aGlzLmdldENhY2hlZFBhdGhTdGF0dXMoZmlsZVBhdGgpO1xuICB9XG5cbiAgZ2V0Q2FjaGVkUGF0aFN0YXR1cyhmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWUge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBTdGF0dXNDb2RlTnVtYmVyLkNMRUFOO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZWRTdGF0dXMgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoY2FjaGVkU3RhdHVzKSB7XG4gICAgICByZXR1cm4gU3RhdHVzQ29kZUlkVG9OdW1iZXJbY2FjaGVkU3RhdHVzXTtcbiAgICB9XG4gICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU47XG4gIH1cblxuICBnZXRBbGxQYXRoU3RhdHVzZXMoKToge1tmaWxlUGF0aDogTnVjbGlkZVVyaV06IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZX0ge1xuICAgIGNvbnN0IHBhdGhTdGF0dXNlcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBpbiB0aGlzLl9oZ1N0YXR1c0NhY2hlKSB7XG4gICAgICBwYXRoU3RhdHVzZXNbZmlsZVBhdGhdID0gU3RhdHVzQ29kZUlkVG9OdW1iZXJbdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF1dO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aFN0YXR1c2VzO1xuICB9XG5cbiAgaXNTdGF0dXNNb2RpZmllZChzdGF0dXM6ID9udW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEIHx8XG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuTUlTU0lORyB8fFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLlJFTU9WRURcbiAgICApO1xuICB9XG5cbiAgaXNTdGF0dXNOZXcoc3RhdHVzOiA/bnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHN0YXR1cyA9PT0gU3RhdHVzQ29kZU51bWJlci5BRERFRCB8fFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLlVOVFJBQ0tFRFxuICAgICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZWFkaW5nIEhnIFN0YXR1cyAoYXN5bmMgbWV0aG9kcylcbiAgICpcbiAgICovXG5cbiAgLyoqXG4gICAqIFJlY29tbWVuZGVkIG1ldGhvZCB0byB1c2UgdG8gZ2V0IHRoZSBzdGF0dXMgb2YgZmlsZXMgaW4gdGhpcyByZXBvLlxuICAgKiBAcGFyYW0gcGF0aHMgQW4gYXJyYXkgb2YgZmlsZSBwYXRocyB0byBnZXQgdGhlIHN0YXR1cyBmb3IuIElmIGEgcGF0aCBpcyBub3QgaW4gdGhlXG4gICAqICAgcHJvamVjdCwgaXQgd2lsbCBiZSBpZ25vcmVkLlxuICAgKiBTZWUgSGdTZXJ2aWNlOjpnZXRTdGF0dXNlcyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIGFzeW5jIGdldFN0YXR1c2VzKFxuICAgIHBhdGhzOiBBcnJheTxzdHJpbmc+LFxuICAgIG9wdGlvbnM/OiBIZ1N0YXR1c0NvbW1hbmRPcHRpb25zLFxuICApOiBQcm9taXNlPE1hcDxOdWNsaWRlVXJpLCBTdGF0dXNDb2RlTnVtYmVyVmFsdWU+PiB7XG4gICAgY29uc3Qgc3RhdHVzTWFwID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IGlzUmVsYXZhbnRTdGF0dXMgPSB0aGlzLl9nZXRQcmVkaWNhdGVGb3JSZWxldmFudFN0YXR1c2VzKG9wdGlvbnMpO1xuXG4gICAgLy8gQ2hlY2sgdGhlIGNhY2hlLlxuICAgIC8vIE5vdGU6IElmIHBhdGhzIGlzIGVtcHR5LCBhIGZ1bGwgYGhnIHN0YXR1c2Agd2lsbCBiZSBydW4sIHdoaWNoIGZvbGxvd3MgdGhlIHNwZWMuXG4gICAgY29uc3QgcGF0aHNXaXRoQ2FjaGVNaXNzID0gW107XG4gICAgcGF0aHMuZm9yRWFjaChmaWxlUGF0aCA9PiB7XG4gICAgICBjb25zdCBzdGF0dXNJZCA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgaWYgKHN0YXR1c0lkKSB7XG4gICAgICAgIGlmICghaXNSZWxhdmFudFN0YXR1cyhzdGF0dXNJZCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc3RhdHVzTWFwLnNldChmaWxlUGF0aCwgU3RhdHVzQ29kZUlkVG9OdW1iZXJbc3RhdHVzSWRdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhdGhzV2l0aENhY2hlTWlzcy5wdXNoKGZpbGVQYXRoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEZldGNoIGFueSB1bmNhY2hlZCBzdGF0dXNlcy5cbiAgICBpZiAocGF0aHNXaXRoQ2FjaGVNaXNzLmxlbmd0aCkge1xuICAgICAgY29uc3QgbmV3U3RhdHVzSW5mbyA9IGF3YWl0IHRoaXMuX3VwZGF0ZVN0YXR1c2VzKHBhdGhzV2l0aENhY2hlTWlzcywgb3B0aW9ucyk7XG4gICAgICBuZXdTdGF0dXNJbmZvLmZvckVhY2goKHN0YXR1cywgZmlsZVBhdGgpID0+IHtcbiAgICAgICAgc3RhdHVzTWFwLnNldChmaWxlUGF0aCwgU3RhdHVzQ29kZUlkVG9OdW1iZXJbc3RhdHVzXSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXR1c01hcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIHRoZSBzdGF0dXNlcyBmb3IgdGhlIGdpdmVuIGZpbGUgcGF0aHMsIGFuZCB1cGRhdGVzIHRoZSBjYWNoZSBhbmRcbiAgICogc2VuZHMgb3V0IGNoYW5nZSBldmVudHMgYXMgYXBwcm9wcmlhdGUuXG4gICAqIEBwYXJhbSBmaWxlUGF0aHMgQW4gYXJyYXkgb2YgZmlsZSBwYXRocyB0byB1cGRhdGUgdGhlIHN0YXR1cyBmb3IuIElmIGEgcGF0aFxuICAgKiAgIGlzIG5vdCBpbiB0aGUgcHJvamVjdCwgaXQgd2lsbCBiZSBpZ25vcmVkLlxuICAgKi9cbiAgYXN5bmMgX3VwZGF0ZVN0YXR1c2VzKFxuICAgIGZpbGVQYXRoczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/SGdTdGF0dXNDb21tYW5kT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxNYXA8TnVjbGlkZVVyaSwgU3RhdHVzQ29kZUlkVmFsdWU+PiB7XG4gICAgY29uc3QgcGF0aHNJblJlcG8gPSBmaWxlUGF0aHMuZmlsdGVyKGZpbGVQYXRoID0+IHtcbiAgICAgIHJldHVybiB0aGlzLl9pc1BhdGhSZWxldmFudChmaWxlUGF0aCk7XG4gICAgfSk7XG4gICAgaWYgKHBhdGhzSW5SZXBvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGF0dXNNYXBQYXRoVG9TdGF0dXNJZCA9IGF3YWl0IHRoaXMuX3NlcnZpY2UuZmV0Y2hTdGF0dXNlcyhwYXRoc0luUmVwbywgb3B0aW9ucyk7XG5cbiAgICBjb25zdCBxdWVyaWVkRmlsZXMgPSBuZXcgU2V0KHBhdGhzSW5SZXBvKTtcbiAgICBjb25zdCBzdGF0dXNDaGFuZ2VFdmVudHMgPSBbXTtcbiAgICBzdGF0dXNNYXBQYXRoVG9TdGF0dXNJZC5mb3JFYWNoKChuZXdTdGF0dXNJZCwgZmlsZVBhdGgpID0+IHtcblxuICAgICAgY29uc3Qgb2xkU3RhdHVzID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICBpZiAob2xkU3RhdHVzICYmIChvbGRTdGF0dXMgIT09IG5ld1N0YXR1c0lkKSB8fFxuICAgICAgICAgICFvbGRTdGF0dXMgJiYgKG5ld1N0YXR1c0lkICE9PSBTdGF0dXNDb2RlSWQuQ0xFQU4pKSB7XG4gICAgICAgIHN0YXR1c0NoYW5nZUV2ZW50cy5wdXNoKHtcbiAgICAgICAgICBwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICBwYXRoU3RhdHVzOiBTdGF0dXNDb2RlSWRUb051bWJlcltuZXdTdGF0dXNJZF0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAobmV3U3RhdHVzSWQgPT09IFN0YXR1c0NvZGVJZC5DTEVBTikge1xuICAgICAgICAgIC8vIERvbid0IGJvdGhlciBrZWVwaW5nICdjbGVhbicgZmlsZXMgaW4gdGhlIGNhY2hlLlxuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgICAgICB0aGlzLl9yZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZShmaWxlUGF0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF0gPSBuZXdTdGF0dXNJZDtcbiAgICAgICAgICBpZiAobmV3U3RhdHVzSWQgPT09IFN0YXR1c0NvZGVJZC5NT0RJRklFRCkge1xuICAgICAgICAgICAgdGhpcy5fYWRkQWxsUGFyZW50RGlyZWN0b3JpZXNUb0NhY2hlKGZpbGVQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHF1ZXJpZWRGaWxlcy5kZWxldGUoZmlsZVBhdGgpO1xuICAgIH0pO1xuXG4gICAgLy8gSWYgdGhlIHN0YXR1c2VzIHdlcmUgZmV0Y2hlZCBmb3Igb25seSBjaGFuZ2VkIChgaGcgc3RhdHVzYCkgb3JcbiAgICAvLyBpZ25vcmVkICgnaGcgc3RhdHVzIC0taWdub3JlZGApIGZpbGVzLCBhIHF1ZXJpZWQgZmlsZSBtYXkgbm90IGJlXG4gICAgLy8gcmV0dXJuZWQgaW4gdGhlIHJlc3BvbnNlLiBJZiBpdCB3YXNuJ3QgcmV0dXJuZWQsIHRoaXMgbWVhbnMgaXRzIHN0YXR1c1xuICAgIC8vIG1heSBoYXZlIGNoYW5nZWQsIGluIHdoaWNoIGNhc2UgaXQgc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSB0aGUgaGdTdGF0dXNDYWNoZS5cbiAgICAvLyBOb3RlOiB3ZSBkb24ndCBrbm93IHRoZSByZWFsIHVwZGF0ZWQgc3RhdHVzIG9mIHRoZSBmaWxlLCBzbyBkb24ndCBzZW5kIGEgY2hhbmdlIGV2ZW50LlxuICAgIC8vIFRPRE8gKGplc3NpY2FsaW4pIENhbiB3ZSBtYWtlIHRoZSAncGF0aFN0YXR1cycgZmllbGQgaW4gdGhlIGNoYW5nZSBldmVudCBvcHRpb25hbD9cbiAgICAvLyBUaGVuIHdlIGNhbiBzZW5kIHRoZXNlIGV2ZW50cy5cbiAgICBjb25zdCBoZ1N0YXR1c09wdGlvbiA9IHRoaXMuX2dldFN0YXR1c09wdGlvbihvcHRpb25zKTtcbiAgICBpZiAoaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLk9OTFlfSUdOT1JFRCkge1xuICAgICAgcXVlcmllZEZpbGVzLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgICAgICBpZiAodGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF0gPT09IFN0YXR1c0NvZGVJZC5JR05PUkVEKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGhnU3RhdHVzT3B0aW9uID09PSBIZ1N0YXR1c09wdGlvbi5BTExfU1RBVFVTRVMpIHtcbiAgICAgIC8vIElmIEhnU3RhdHVzT3B0aW9uLkFMTF9TVEFUVVNFUyB3YXMgcGFzc2VkIGFuZCBhIGZpbGUgZG9lcyBub3QgYXBwZWFyIGluXG4gICAgICAvLyB0aGUgcmVzdWx0cywgaXQgbXVzdCBtZWFuIHRoZSBmaWxlIHdhcyByZW1vdmVkIGZyb20gdGhlIGZpbGVzeXN0ZW0uXG4gICAgICBxdWVyaWVkRmlsZXMuZm9yRWFjaChmaWxlUGF0aCA9PiB7XG4gICAgICAgIGNvbnN0IGNhY2hlZFN0YXR1c0lkID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgICAgaWYgKGNhY2hlZFN0YXR1c0lkID09PSBTdGF0dXNDb2RlSWQuTU9ESUZJRUQpIHtcbiAgICAgICAgICB0aGlzLl9yZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZShmaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBxdWVyaWVkRmlsZXMuZm9yRWFjaChmaWxlUGF0aCA9PiB7XG4gICAgICAgIGNvbnN0IGNhY2hlZFN0YXR1c0lkID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgIGlmIChjYWNoZWRTdGF0dXNJZCAhPT0gU3RhdHVzQ29kZUlkLklHTk9SRUQpIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgICAgaWYgKGNhY2hlZFN0YXR1c0lkID09PSBTdGF0dXNDb2RlSWQuTU9ESUZJRUQpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUFsbFBhcmVudERpcmVjdG9yaWVzRnJvbUNhY2hlKGZpbGVQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEVtaXQgY2hhbmdlIGV2ZW50cyBvbmx5IGFmdGVyIHRoZSBjYWNoZSBoYXMgYmVlbiBmdWxseSB1cGRhdGVkLlxuICAgIHN0YXR1c0NoYW5nZUV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1zdGF0dXMnLCBldmVudCk7XG4gICAgfSk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXN0YXR1c2VzJyk7XG5cbiAgICByZXR1cm4gc3RhdHVzTWFwUGF0aFRvU3RhdHVzSWQ7XG4gIH1cblxuICBfYWRkQWxsUGFyZW50RGlyZWN0b3JpZXNUb0NhY2hlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKSB7XG4gICAgYWRkQWxsUGFyZW50RGlyZWN0b3JpZXNUb0NhY2hlKFxuICAgICAgdGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZSxcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgdGhpcy5fcHJvamVjdERpcmVjdG9yeS5nZXRQYXJlbnQoKS5nZXRQYXRoKClcbiAgICApO1xuICB9XG5cbiAgX3JlbW92ZUFsbFBhcmVudERpcmVjdG9yaWVzRnJvbUNhY2hlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKSB7XG4gICAgcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoXG4gICAgICB0aGlzLl9tb2RpZmllZERpcmVjdG9yeUNhY2hlLFxuICAgICAgZmlsZVBhdGgsXG4gICAgICB0aGlzLl9wcm9qZWN0RGlyZWN0b3J5LmdldFBhcmVudCgpLmdldFBhdGgoKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIGZvciA6OmdldFN0YXR1c2VzLlxuICAgKiBSZXR1cm5zIGEgZmlsdGVyIGZvciB3aGV0aGVyIG9yIG5vdCB0aGUgZ2l2ZW4gc3RhdHVzIGNvZGUgc2hvdWxkIGJlXG4gICAqIHJldHVybmVkLCBnaXZlbiB0aGUgcGFzc2VkLWluIG9wdGlvbnMgZm9yIDo6Z2V0U3RhdHVzZXMuXG4gICAqL1xuICBfZ2V0UHJlZGljYXRlRm9yUmVsZXZhbnRTdGF0dXNlcyhcbiAgICBvcHRpb25zOiA/SGdTdGF0dXNDb21tYW5kT3B0aW9uc1xuICApOiAoY29kZTogU3RhdHVzQ29kZUlkVmFsdWUpID0+IGJvb2xlYW4ge1xuICAgIGNvbnN0IGhnU3RhdHVzT3B0aW9uID0gdGhpcy5fZ2V0U3RhdHVzT3B0aW9uKG9wdGlvbnMpO1xuXG4gICAgaWYgKGhnU3RhdHVzT3B0aW9uID09PSBIZ1N0YXR1c09wdGlvbi5PTkxZX0lHTk9SRUQpIHtcbiAgICAgIHJldHVybiBmaWx0ZXJGb3JPbmx5SWdub3JlZDtcbiAgICB9IGVsc2UgaWYgKGhnU3RhdHVzT3B0aW9uID09PSBIZ1N0YXR1c09wdGlvbi5BTExfU1RBVFVTRVMpIHtcbiAgICAgIHJldHVybiBmaWx0ZXJGb3JBbGxTdGF0dWVzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmlsdGVyRm9yT25seU5vdElnbm9yZWQ7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmV0cmlldmluZyBEaWZmcyAocGFyaXR5IHdpdGggR2l0UmVwb3NpdG9yeSlcbiAgICpcbiAgICovXG5cbiAgZ2V0RGlmZlN0YXRzKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IHthZGRlZDogbnVtYmVyLCBkZWxldGVkOiBudW1iZXIsfSB7XG4gICAgY29uc3QgY2xlYW5TdGF0cyA9IHthZGRlZDogMCwgZGVsZXRlZDogMH07XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGNsZWFuU3RhdHM7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZERhdGEgPSB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF07XG4gICAgcmV0dXJuIGNhY2hlZERhdGEgPyB7YWRkZWQ6IGNhY2hlZERhdGEuYWRkZWQsIGRlbGV0ZWQ6IGNhY2hlZERhdGEuZGVsZXRlZH0gOlxuICAgICAgICBjbGVhblN0YXRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgTGluZURpZmYgdGhhdCBkZXNjcmliZXMgdGhlIGRpZmZzIGJldHdlZW4gdGhlIGdpdmVuXG4gICAqIGZpbGUncyBgSEVBRGAgY29udGVudHMgYW5kIGl0cyBjdXJyZW50IGNvbnRlbnRzLlxuICAgKiBOT1RFOiB0aGlzIG1ldGhvZCBjdXJyZW50bHkgaWdub3JlcyB0aGUgcGFzc2VkLWluIHRleHQsIGFuZCBpbnN0ZWFkIGRpZmZzXG4gICAqIGFnYWluc3QgdGhlIGN1cnJlbnRseSBzYXZlZCBjb250ZW50cyBvZiB0aGUgZmlsZS5cbiAgICovXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIEV4cG9ydCB0aGUgTGluZURpZmYgdHlwZSAoZnJvbSBoZy1vdXRwdXQtaGVscGVycykgd2hlblxuICAvLyB0eXBlcyBjYW4gYmUgZXhwb3J0ZWQuXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIE1ha2UgdGhpcyBtZXRob2Qgd29yayB3aXRoIHRoZSBwYXNzZWQtaW4gYHRleHRgLiB0NjM5MTU3OVxuICBnZXRMaW5lRGlmZnMoZmlsZVBhdGg6ID9OdWNsaWRlVXJpLCB0ZXh0OiA/c3RyaW5nKTogQXJyYXk8TGluZURpZmY+IHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGRpZmZJbmZvID0gdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdO1xuICAgIHJldHVybiBkaWZmSW5mbyA/IGRpZmZJbmZvLmxpbmVEaWZmcyA6IFtdO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmV0cmlldmluZyBEaWZmcyAoYXN5bmMgbWV0aG9kcylcbiAgICpcbiAgICovXG5cbiAgLyoqXG4gICAqIFJlY29tbWVuZGVkIG1ldGhvZCB0byB1c2UgdG8gZ2V0IHRoZSBkaWZmIHN0YXRzIG9mIGZpbGVzIGluIHRoaXMgcmVwby5cbiAgICogQHBhcmFtIHBhdGggVGhlIGZpbGUgcGF0aCB0byBnZXQgdGhlIHN0YXR1cyBmb3IuIElmIGEgcGF0aCBpcyBub3QgaW4gdGhlXG4gICAqICAgcHJvamVjdCwgZGVmYXVsdCBcImNsZWFuXCIgc3RhdHMgd2lsbCBiZSByZXR1cm5lZC5cbiAgICovXG4gIGFzeW5jIGdldERpZmZTdGF0c0ZvclBhdGgoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHthZGRlZDogbnVtYmVyLCBkZWxldGVkOiBudW1iZXIsfT4ge1xuICAgIGNvbnN0IGNsZWFuU3RhdHMgPSB7YWRkZWQ6IDAsIGRlbGV0ZWQ6IDB9O1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBjbGVhblN0YXRzO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRoZSBjYWNoZS5cbiAgICBjb25zdCBjYWNoZWREaWZmSW5mbyA9IHRoaXMuX2hnRGlmZkNhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoY2FjaGVkRGlmZkluZm8pIHtcbiAgICAgIHJldHVybiB7YWRkZWQ6IGNhY2hlZERpZmZJbmZvLmFkZGVkLCBkZWxldGVkOiBjYWNoZWREaWZmSW5mby5kZWxldGVkfTtcbiAgICB9XG5cbiAgICAvLyBGYWxsIGJhY2sgdG8gYSBmZXRjaC5cbiAgICBjb25zdCBmZXRjaGVkUGF0aFRvRGlmZkluZm8gPSBhd2FpdCB0aGlzLl91cGRhdGVEaWZmSW5mbyhbZmlsZVBhdGhdKTtcbiAgICBpZiAoZmV0Y2hlZFBhdGhUb0RpZmZJbmZvKSB7XG4gICAgICBjb25zdCBkaWZmSW5mbyA9IGZldGNoZWRQYXRoVG9EaWZmSW5mby5nZXQoZmlsZVBhdGgpO1xuICAgICAgaWYgKGRpZmZJbmZvICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHthZGRlZDogZGlmZkluZm8uYWRkZWQsIGRlbGV0ZWQ6IGRpZmZJbmZvLmRlbGV0ZWR9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjbGVhblN0YXRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY29tbWVuZGVkIG1ldGhvZCB0byB1c2UgdG8gZ2V0IHRoZSBsaW5lIGRpZmZzIG9mIGZpbGVzIGluIHRoaXMgcmVwby5cbiAgICogQHBhcmFtIHBhdGggVGhlIGFic29sdXRlIGZpbGUgcGF0aCB0byBnZXQgdGhlIGxpbmUgZGlmZnMgZm9yLiBJZiB0aGUgcGF0aCBcXFxuICAgKiAgIGlzIG5vdCBpbiB0aGUgcHJvamVjdCwgYW4gZW1wdHkgQXJyYXkgd2lsbCBiZSByZXR1cm5lZC5cbiAgICovXG4gIGFzeW5jIGdldExpbmVEaWZmc0ZvclBhdGgoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPEFycmF5PExpbmVEaWZmPj4ge1xuICAgIGNvbnN0IGxpbmVEaWZmcyA9IFtdO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBsaW5lRGlmZnM7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIGNhY2hlLlxuICAgIGNvbnN0IGNhY2hlZERpZmZJbmZvID0gdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmIChjYWNoZWREaWZmSW5mbykge1xuICAgICAgcmV0dXJuIGNhY2hlZERpZmZJbmZvLmxpbmVEaWZmcztcbiAgICB9XG5cbiAgICAvLyBGYWxsIGJhY2sgdG8gYSBmZXRjaC5cbiAgICBjb25zdCBmZXRjaGVkUGF0aFRvRGlmZkluZm8gPSBhd2FpdCB0aGlzLl91cGRhdGVEaWZmSW5mbyhbZmlsZVBhdGhdKTtcbiAgICBpZiAoZmV0Y2hlZFBhdGhUb0RpZmZJbmZvICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGRpZmZJbmZvID0gZmV0Y2hlZFBhdGhUb0RpZmZJbmZvLmdldChmaWxlUGF0aCk7XG4gICAgICBpZiAoZGlmZkluZm8gIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZGlmZkluZm8ubGluZURpZmZzO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaW5lRGlmZnM7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgZGlmZiBpbmZvcm1hdGlvbiBmb3IgdGhlIGdpdmVuIHBhdGhzLCBhbmQgdXBkYXRlcyB0aGUgY2FjaGUuXG4gICAqIEBwYXJhbSBBbiBhcnJheSBvZiBhYnNvbHV0ZSBmaWxlIHBhdGhzIGZvciB3aGljaCB0byB1cGRhdGUgdGhlIGRpZmYgaW5mby5cbiAgICogQHJldHVybiBBIG1hcCBvZiBlYWNoIHBhdGggdG8gaXRzIERpZmZJbmZvLlxuICAgKiAgIFRoaXMgbWV0aG9kIG1heSByZXR1cm4gYG51bGxgIGlmIHRoZSBjYWxsIHRvIGBoZyBkaWZmYCBmYWlscy5cbiAgICogICBBIGZpbGUgcGF0aCB3aWxsIG5vdCBhcHBlYXIgaW4gdGhlIHJldHVybmVkIE1hcCBpZiBpdCBpcyBub3QgaW4gdGhlIHJlcG8sXG4gICAqICAgaWYgaXQgaGFzIG5vIGNoYW5nZXMsIG9yIGlmIHRoZXJlIGlzIGEgcGVuZGluZyBgaGcgZGlmZmAgY2FsbCBmb3IgaXQgYWxyZWFkeS5cbiAgICovXG4gIGFzeW5jIF91cGRhdGVEaWZmSW5mbyhmaWxlUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+KTogUHJvbWlzZTw/TWFwPE51Y2xpZGVVcmksIERpZmZJbmZvPj4ge1xuICAgIGNvbnN0IHBhdGhzVG9GZXRjaCA9IGZpbGVQYXRocy5maWx0ZXIoYVBhdGggPT4ge1xuICAgICAgLy8gRG9uJ3QgdHJ5IHRvIGZldGNoIGluZm9ybWF0aW9uIGZvciB0aGlzIHBhdGggaWYgaXQncyBub3QgaW4gdGhlIHJlcG8uXG4gICAgICBpZiAoIXRoaXMuX2lzUGF0aFJlbGV2YW50KGFQYXRoKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvLyBEb24ndCBkbyBhbm90aGVyIHVwZGF0ZSBmb3IgdGhpcyBwYXRoIGlmIHdlIGFyZSBpbiB0aGUgbWlkZGxlIG9mIHJ1bm5pbmcgYW4gdXBkYXRlLlxuICAgICAgaWYgKHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNVcGRhdGluZy5oYXMoYVBhdGgpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNVcGRhdGluZy5hZGQoYVBhdGgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChwYXRoc1RvRmV0Y2gubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbmV3IE1hcCgpO1xuICAgIH1cblxuICAgIC8vIENhbGwgdGhlIEhnU2VydmljZSBhbmQgdXBkYXRlIG91ciBjYWNoZSB3aXRoIHRoZSByZXN1bHRzLlxuICAgIGNvbnN0IHBhdGhzVG9EaWZmSW5mbyA9IGF3YWl0IHRoaXMuX3NlcnZpY2UuZmV0Y2hEaWZmSW5mbyhwYXRoc1RvRmV0Y2gpO1xuICAgIGlmIChwYXRoc1RvRGlmZkluZm8pIHtcbiAgICAgIGZvciAoY29uc3QgW2ZpbGVQYXRoLCBkaWZmSW5mb10gb2YgcGF0aHNUb0RpZmZJbmZvKSB7XG4gICAgICAgIHRoaXMuX2hnRGlmZkNhY2hlW2ZpbGVQYXRoXSA9IGRpZmZJbmZvO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlbW92ZSBmaWxlcyBtYXJrZWQgZm9yIGRlbGV0aW9uLlxuICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNUb0NsZWFyLmZvckVhY2goZmlsZVRvQ2xlYXIgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuX2hnRGlmZkNhY2hlW2ZpbGVUb0NsZWFyXTtcbiAgICB9KTtcbiAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVG9DbGVhci5jbGVhcigpO1xuXG4gICAgLy8gVGhlIGZldGNoZWQgZmlsZXMgY2FuIG5vdyBiZSB1cGRhdGVkIGFnYWluLlxuICAgIGZvciAoY29uc3QgcGF0aFRvRmV0Y2ggb2YgcGF0aHNUb0ZldGNoKSB7XG4gICAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVXBkYXRpbmcuZGVsZXRlKHBhdGhUb0ZldGNoKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPICh0OTExMzkxMykgSWRlYWxseSwgd2UgY291bGQgc2VuZCBtb3JlIHRhcmdldGVkIGV2ZW50cyB0aGF0IGJldHRlclxuICAgIC8vIGRlc2NyaWJlIHdoYXQgY2hhbmdlIGhhcyBvY2N1cnJlZC4gUmlnaHQgbm93LCBHaXRSZXBvc2l0b3J5IGRpY3RhdGVzIGVpdGhlclxuICAgIC8vICdkaWQtY2hhbmdlLXN0YXR1cycgb3IgJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnLlxuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1zdGF0dXNlcycpO1xuICAgIHJldHVybiBwYXRoc1RvRGlmZkluZm87XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZXRyaWV2aW5nIEJvb2ttYXJrIChhc3luYyBtZXRob2RzKVxuICAgKlxuICAgKi9cbiAgYXN5bmMgZmV0Y2hDdXJyZW50Qm9va21hcmsoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgbmV3bHlGZXRjaGVkQm9va21hcmsgPSAnJztcbiAgICB0cnkge1xuICAgICAgbmV3bHlGZXRjaGVkQm9va21hcmsgPSBhd2FpdCB0aGlzLl9zZXJ2aWNlLmZldGNoQ3VycmVudEJvb2ttYXJrKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gU3VwcHJlc3MgdGhlIGVycm9yLiBUaGVyZSBhcmUgbGVnaXRpbWF0ZSB0aW1lcyB3aGVuIHRoZXJlIG1heSBiZSBub1xuICAgICAgLy8gY3VycmVudCBib29rbWFyaywgc3VjaCBhcyBkdXJpbmcgYSByZWJhc2UuIEluIHRoaXMgY2FzZSwgd2UganVzdCB3YW50XG4gICAgICAvLyB0byByZXR1cm4gYW4gZW1wdHkgc3RyaW5nIGlmIHRoZXJlIGlzIG5vIGN1cnJlbnQgYm9va21hcmsuXG4gICAgfVxuICAgIGlmIChuZXdseUZldGNoZWRCb29rbWFyayAhPT0gdGhpcy5fY3VycmVudEJvb2ttYXJrKSB7XG4gICAgICB0aGlzLl9jdXJyZW50Qm9va21hcmsgPSBuZXdseUZldGNoZWRCb29rbWFyaztcbiAgICAgIC8vIFRoZSBBdG9tIHN0YXR1cy1iYXIgdXNlcyB0aGlzIGFzIGEgc2lnbmFsIHRvIHJlZnJlc2ggdGhlICdzaG9ydEhlYWQnLlxuICAgICAgLy8gVGhlcmUgaXMgY3VycmVudGx5IG5vIGRlZGljYXRlZCAnc2hvcnRIZWFkRGlkQ2hhbmdlJyBldmVudC5cbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1zdGF0dXNlcycpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEJvb2ttYXJrIHx8ICcnO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogQ2hlY2tpbmcgT3V0XG4gICAqXG4gICAqL1xuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGNoZWNrb3V0SGVhZChwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBjaGVja291dFJlZmVyZW5jZShyZWZlcmVuY2U6IHN0cmluZywgY3JlYXRlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgdGhlIGFzeW5jIHZlcnNpb24gb2Ygd2hhdCBjaGVja291dFJlZmVyZW5jZSgpIGlzIG1lYW50IHRvIGRvLlxuICAgKi9cbiAgYXN5bmMgY2hlY2tvdXRSZXZpc2lvbihyZWZlcmVuY2U6IHN0cmluZywgY3JlYXRlOiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX3NlcnZpY2UuY2hlY2tvdXQocmVmZXJlbmNlLCBjcmVhdGUpO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogSGdTZXJ2aWNlIHN1YnNjcmlwdGlvbnNcbiAgICpcbiAgICovXG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGNhY2hlIGluIHJlc3BvbnNlIHRvIGFueSBudW1iZXIgb2YgKG5vbi0uaGdpZ25vcmUpIGZpbGVzIGNoYW5naW5nLlxuICAgKiBAcGFyYW0gdXBkYXRlIFRoZSBjaGFuZ2VkIGZpbGUgcGF0aHMuXG4gICAqL1xuICBfZmlsZXNEaWRDaGFuZ2UoY2hhbmdlZFBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPik6IHZvaWQge1xuICAgIGNvbnN0IHJlbGV2YW50Q2hhbmdlZFBhdGhzID0gY2hhbmdlZFBhdGhzLmZpbHRlcih0aGlzLl9pc1BhdGhSZWxldmFudC5iaW5kKHRoaXMpKTtcbiAgICBpZiAocmVsZXZhbnRDaGFuZ2VkUGF0aHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChyZWxldmFudENoYW5nZWRQYXRocy5sZW5ndGggPD0gTUFYX0lORElWSURVQUxfQ0hBTkdFRF9QQVRIUykge1xuICAgICAgLy8gVXBkYXRlIHRoZSBzdGF0dXNlcyBpbmRpdmlkdWFsbHkuXG4gICAgICB0aGlzLl91cGRhdGVTdGF0dXNlcyhyZWxldmFudENoYW5nZWRQYXRocywge2hnU3RhdHVzT3B0aW9uOiBIZ1N0YXR1c09wdGlvbi5BTExfU1RBVFVTRVN9KTtcbiAgICAgIHRoaXMuX3VwZGF0ZURpZmZJbmZvKHJlbGV2YW50Q2hhbmdlZFBhdGhzLmZpbHRlcihmaWxlUGF0aCA9PiB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhpcyBpcyBhIGhldXJpc3RpYyB0byBpbXByb3ZlIHBlcmZvcm1hbmNlLiBNYW55IGZpbGVzIGJlaW5nIGNoYW5nZWQgbWF5XG4gICAgICAvLyBiZSBhIHNpZ24gdGhhdCB3ZSBhcmUgcGlja2luZyB1cCBjaGFuZ2VzIHRoYXQgd2VyZSBjcmVhdGVkIGluIGFuIGF1dG9tYXRlZFxuICAgICAgLy8gd2F5IC0tIHNvIGluIGFkZGl0aW9uLCB0aGVyZSBtYXkgYmUgbWFueSBiYXRjaGVzIG9mIGNoYW5nZXMgaW4gc3VjY2Vzc2lvbi5cbiAgICAgIC8vIF9yZWZyZXNoU3RhdHVzZXNPZkFsbEZpbGVzSW5DYWNoZSBkZWJvdW5jZXMgY2FsbHMsIHNvIGl0IGlzIHNhZmUgdG8gY2FsbFxuICAgICAgLy8gaXQgbXVsdGlwbGUgdGltZXMgaW4gc3VjY2Vzc2lvbi5cbiAgICAgIHRoaXMuX3JlZnJlc2hTdGF0dXNlc09mQWxsRmlsZXNJbkNhY2hlKCk7XG4gICAgfVxuICB9XG5cbiAgX3JlZnJlc2hTdGF0dXNlc09mQWxsRmlsZXNJbkNhY2hlKCk6IHZvaWQge1xuICAgIGxldCBkZWJvdW5jZWRSZWZyZXNoQWxsID0gdGhpcy5fZGVib3VuY2VkUmVmcmVzaEFsbDtcbiAgICBpZiAoZGVib3VuY2VkUmVmcmVzaEFsbCA9PSBudWxsKSB7XG4gICAgICBjb25zdCBkb1JlZnJlc2ggPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9pc1JlZnJlc2hpbmdBbGxGaWxlc0luQ2FjaGUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faXNSZWZyZXNoaW5nQWxsRmlsZXNJbkNhY2hlID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBwYXRoc0luU3RhdHVzQ2FjaGUgPSBPYmplY3Qua2V5cyh0aGlzLl9oZ1N0YXR1c0NhY2hlKTtcbiAgICAgICAgdGhpcy5faGdTdGF0dXNDYWNoZSA9IHt9O1xuICAgICAgICB0aGlzLl9tb2RpZmllZERpcmVjdG9yeUNhY2hlID0gbmV3IE1hcCgpO1xuICAgICAgICAvLyBXZSBzaG91bGQgZ2V0IHRoZSBtb2RpZmllZCBzdGF0dXMgb2YgYWxsIGZpbGVzIGluIHRoZSByZXBvIHRoYXQgaXNcbiAgICAgICAgLy8gdW5kZXIgdGhlIEhnUmVwb3NpdG9yeUNsaWVudCdzIHByb2plY3QgZGlyZWN0b3J5LCBiZWNhdXNlIHdoZW4gSGdcbiAgICAgICAgLy8gbW9kaWZpZXMgdGhlIHJlcG8sIGl0IGRvZXNuJ3QgbmVjZXNzYXJpbHkgb25seSBtb2RpZnkgZmlsZXMgdGhhdCB3ZXJlXG4gICAgICAgIC8vIHByZXZpb3VzbHkgbW9kaWZpZWQuXG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YXR1c2VzKFxuICAgICAgICAgICAgW3RoaXMuZ2V0UHJvamVjdERpcmVjdG9yeSgpXSwge2hnU3RhdHVzT3B0aW9uOiBIZ1N0YXR1c09wdGlvbi5PTkxZX05PTl9JR05PUkVEfSk7XG4gICAgICAgIGlmIChwYXRoc0luU3RhdHVzQ2FjaGUubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gVGhlIGxvZ2ljIGlzIGEgYml0IGRpZmZlcmVudCBmb3IgaWdub3JlZCBmaWxlcywgYmVjYXVzZSB0aGVcbiAgICAgICAgICAvLyBIZ1JlcG9zaXRvcnlDbGllbnQgYWx3YXlzIGZldGNoZXMgaWdub3JlZCBzdGF0dXNlcyBsYXppbHkgKGFzIGNhbGxlcnNcbiAgICAgICAgICAvLyBhc2sgZm9yIHRoZW0pLiBTbywgd2Ugb25seSBmZXRjaCB0aGUgaWdub3JlZCBzdGF0dXMgb2YgZmlsZXMgYWxyZWFkeVxuICAgICAgICAgIC8vIGluIHRoZSBjYWNoZS4gKE5vdGU6IGlmIEkgYXNrIEhnIGZvciB0aGUgJ2lnbm9yZWQnIHN0YXR1cyBvZiBhIGxpc3Qgb2ZcbiAgICAgICAgICAvLyBmaWxlcywgYW5kIG5vbmUgb2YgdGhlbSBhcmUgaWdub3JlZCwgbm8gc3RhdHVzZXMgd2lsbCBiZSByZXR1cm5lZC4pXG4gICAgICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlU3RhdHVzZXMoXG4gICAgICAgICAgICAgIHBhdGhzSW5TdGF0dXNDYWNoZSwge2hnU3RhdHVzT3B0aW9uOiBIZ1N0YXR1c09wdGlvbi5PTkxZX0lHTk9SRUR9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhdGhzSW5EaWZmQ2FjaGUgPSBPYmplY3Qua2V5cyh0aGlzLl9oZ0RpZmZDYWNoZSk7XG4gICAgICAgIHRoaXMuX2hnRGlmZkNhY2hlID0ge307XG4gICAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZJbmZvKHBhdGhzSW5EaWZmQ2FjaGUpO1xuXG4gICAgICAgIHRoaXMuX2lzUmVmcmVzaGluZ0FsbEZpbGVzSW5DYWNoZSA9IGZhbHNlO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX2RlYm91bmNlZFJlZnJlc2hBbGwgPSBkZWJvdW5jZShcbiAgICAgICAgZG9SZWZyZXNoLFxuICAgICAgICBERUJPVU5DRV9NSUxMSVNFQ09ORFNfRk9SX1JFRlJFU0hfQUxMLFxuICAgICAgICAvKiBpbW1lZGlhdGUgKi8gZmFsc2VcbiAgICAgICk7XG4gICAgICBkZWJvdW5jZWRSZWZyZXNoQWxsID0gdGhpcy5fZGVib3VuY2VkUmVmcmVzaEFsbDtcbiAgICB9XG4gICAgZGVib3VuY2VkUmVmcmVzaEFsbCgpO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmVwb3NpdG9yeSBTdGF0ZSBhdCBTcGVjaWZpYyBSZXZpc2lvbnNcbiAgICpcbiAgICovXG4gIGZldGNoRmlsZUNvbnRlbnRBdFJldmlzaW9uKGZpbGVQYXRoOiBOdWNsaWRlVXJpLCByZXZpc2lvbjogP3N0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmZldGNoRmlsZUNvbnRlbnRBdFJldmlzaW9uKGZpbGVQYXRoLCByZXZpc2lvbik7XG4gIH1cblxuICBmZXRjaEZpbGVzQ2hhbmdlZEF0UmV2aXNpb24ocmV2aXNpb246IHN0cmluZyk6IFByb21pc2U8P1JldmlzaW9uRmlsZUNoYW5nZXM+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5mZXRjaEZpbGVzQ2hhbmdlZEF0UmV2aXNpb24ocmV2aXNpb24pO1xuICB9XG5cbiAgZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuSGVhZEFuZEJhc2UoKTogUHJvbWlzZTw/QXJyYXk8UmV2aXNpb25JbmZvPj4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmZldGNoUmV2aXNpb25JbmZvQmV0d2VlbkhlYWRBbmRCYXNlKCk7XG4gIH1cblxuICAvLyBTZWUgSGdTZXJ2aWNlLmdldEJsYW1lQXRIZWFkLlxuICBnZXRCbGFtZUF0SGVhZChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8TWFwPHN0cmluZywgc3RyaW5nPj4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmdldEJsYW1lQXRIZWFkKGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8vIFNlZSBIZ1NlcnZpY2UuZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZC5cbiAgZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZChjaGFuZ2VTZXRJZDogc3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZChjaGFuZ2VTZXRJZCk7XG4gIH1cblxuICBnZXRTbWFydGxvZyh0dHlPdXRwdXQ6IGJvb2xlYW4sIGNvbmNpc2U6IGJvb2xlYW4pOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmdldFNtYXJ0bG9nKHR0eU91dHB1dCwgY29uY2lzZSk7XG4gIH1cblxuICByZW5hbWUob2xkRmlsZVBhdGg6IHN0cmluZywgbmV3RmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLnJlbmFtZShvbGRGaWxlUGF0aCwgbmV3RmlsZVBhdGgpO1xuICB9XG5cbiAgcmVtb3ZlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5yZW1vdmUoZmlsZVBhdGgpO1xuICB9XG5cbiAgYWRkKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5hZGQoZmlsZVBhdGgpO1xuICB9XG5cbiAgX2dldFN0YXR1c09wdGlvbihvcHRpb25zOiA/SGdTdGF0dXNDb21tYW5kT3B0aW9ucyk6ID9IZ1N0YXR1c09wdGlvblZhbHVlIHtcbiAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnMuaGdTdGF0dXNPcHRpb247XG4gIH1cbn1cbiJdfQ==