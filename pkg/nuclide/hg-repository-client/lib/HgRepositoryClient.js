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
      var hasOptions = options && 'hgStatusOption' in options;
      if (hasOptions && options.hgStatusOption === _hgRepositoryBaseLibHgConstants.HgStatusOption.ONLY_IGNORED) {
        queriedFiles.forEach(function (filePath) {
          if (_this4._hgStatusCache[filePath] === _hgRepositoryBaseLibHgConstants.StatusCodeId.IGNORED) {
            delete _this4._hgStatusCache[filePath];
          }
        });
      } else if (hasOptions && options.hgStatusOption === _hgRepositoryBaseLibHgConstants.HgStatusOption.ALL_STATUSES) {
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
      var hasOptions = options && 'hgStatusOption' in options;

      if (hasOptions && options.hgStatusOption === _hgRepositoryBaseLibHgConstants.HgStatusOption.ONLY_IGNORED) {
        return filterForOnlyIgnored;
      } else if (hasOptions && options.hgStatusOption === _hgRepositoryBaseLibHgConstants.HgStatusOption.ALL_STATUSES) {
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
//# sourceMappingURL=data:application/json;base64,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O0tBQzVEOzs7OztXQUdhLHdCQUFDLFFBQW9CLEVBQWdDO0FBQ2pFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDL0M7Ozs7O1dBR29DLCtDQUFDLFdBQW1CLEVBQW9CO0FBQzNFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUN6RTs7O1dBRVUscUJBQUMsU0FBa0IsRUFBRSxPQUFnQixFQUFtQjtBQUNqRSxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUN0RDs7O1dBRUssZ0JBQUMsV0FBbUIsRUFBRSxXQUFtQixFQUFvQjtBQUNqRSxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztLQUN2RDs7O1dBRUssZ0JBQUMsUUFBZ0IsRUFBb0I7QUFDekMsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN2Qzs7O1dBRUUsYUFBQyxRQUFnQixFQUFvQjtBQUN0QyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3BDOzs7U0FqekJrQixrQkFBa0I7OztxQkFBbEIsa0JBQWtCIiwiZmlsZSI6IkhnUmVwb3NpdG9yeUNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRGlmZkluZm8sXG4gIEhnU3RhdHVzT3B0aW9uVmFsdWUsXG4gIExpbmVEaWZmLFxuICBSZXZpc2lvbkluZm8sXG4gIFJldmlzaW9uRmlsZUNoYW5nZXMsXG4gIFN0YXR1c0NvZGVJZFZhbHVlLFxuICBTdGF0dXNDb2RlTnVtYmVyVmFsdWUsXG59IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuaW1wb3J0IHR5cGUge1xuICBIZ1NlcnZpY2UsXG59IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlLmpzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIFN0YXR1c0NvZGVJZCxcbiAgU3RhdHVzQ29kZUlkVG9OdW1iZXIsXG4gIFN0YXR1c0NvZGVOdW1iZXIsXG4gIEhnU3RhdHVzT3B0aW9uLFxufSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL2hnLWNvbnN0YW50cyc7XG5pbXBvcnQge2RlYm91bmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7ZW5zdXJlVHJhaWxpbmdTZXBhcmF0b3J9IGZyb20gJy4uLy4uL2NvbW1vbnMvbGliL3BhdGhzJztcbmltcG9ydCB7YWRkQWxsUGFyZW50RGlyZWN0b3JpZXNUb0NhY2hlLCByZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZX0gZnJvbSAnLi91dGlscyc7XG5cbnR5cGUgSGdSZXBvc2l0b3J5T3B0aW9ucyA9IHtcbiAgLyoqIFRoZSBvcmlnaW4gVVJMIG9mIHRoaXMgcmVwb3NpdG9yeS4gKi9cbiAgb3JpZ2luVVJMOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSB3b3JraW5nIGRpcmVjdG9yeSBvZiB0aGlzIHJlcG9zaXRvcnkuICovXG4gIHdvcmtpbmdEaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5IHwgUmVtb3RlRGlyZWN0b3J5O1xuXG4gIC8qKiBUaGUgcm9vdCBkaXJlY3RvcnkgdGhhdCBpcyBvcGVuZWQgaW4gQXRvbSwgd2hpY2ggdGhpcyBSZXBvc2l0b3J5IHNlcnZlcy4gKiovXG4gIHByb2plY3RSb290RGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeTtcbn07XG5cbi8qKlxuICpcbiAqIFNlY3Rpb246IENvbnN0YW50cywgVHlwZSBEZWZpbml0aW9uc1xuICpcbiAqL1xuXG5leHBvcnQgdHlwZSBIZ1N0YXR1c0NvbW1hbmRPcHRpb25zID0ge1xuICBoZ1N0YXR1c09wdGlvbjogSGdTdGF0dXNPcHRpb25WYWx1ZTtcbn07XG5cbmNvbnN0IEVESVRPUl9TVUJTQ1JJUFRJT05fTkFNRSA9ICdoZy1yZXBvc2l0b3J5LWVkaXRvci1zdWJzY3JpcHRpb24nO1xuZXhwb3J0IGNvbnN0IERFQk9VTkNFX01JTExJU0VDT05EU19GT1JfUkVGUkVTSF9BTEwgPSA1MDA7XG5leHBvcnQgY29uc3QgTUFYX0lORElWSURVQUxfQ0hBTkdFRF9QQVRIUyA9IDE7XG5cbmZ1bmN0aW9uIGZpbHRlckZvck9ubHlOb3RJZ25vcmVkKGNvZGU6IFN0YXR1c0NvZGVJZFZhbHVlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoY29kZSAhPT0gU3RhdHVzQ29kZUlkLklHTk9SRUQpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJGb3JPbmx5SWdub3JlZChjb2RlOiBTdGF0dXNDb2RlSWRWYWx1ZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKGNvZGUgPT09IFN0YXR1c0NvZGVJZC5JR05PUkVEKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyRm9yQWxsU3RhdHVlcygpIHtcbiAgcmV0dXJuIHRydWU7XG59XG5cblxuLyoqXG4gKlxuICogU2VjdGlvbjogSGdSZXBvc2l0b3J5Q2xpZW50XG4gKlxuICovXG5cbi8qKlxuICogSGdSZXBvc2l0b3J5Q2xpZW50IHJ1bnMgb24gdGhlIG1hY2hpbmUgdGhhdCBOdWNsaWRlL0F0b20gaXMgcnVubmluZyBvbi5cbiAqIEl0IGlzIHRoZSBpbnRlcmZhY2UgdGhhdCBvdGhlciBBdG9tIHBhY2thZ2VzIHdpbGwgdXNlIHRvIGFjY2VzcyBNZXJjdXJpYWwuXG4gKiBJdCBjYWNoZXMgZGF0YSBmZXRjaGVkIGZyb20gYW4gSGdTZXJ2aWNlLlxuICogSXQgaW1wbGVtZW50cyB0aGUgc2FtZSBpbnRlcmZhY2UgYXMgR2l0UmVwb3NpdG9yeSwgKGh0dHBzOi8vYXRvbS5pby9kb2NzL2FwaS9sYXRlc3QvR2l0UmVwb3NpdG9yeSlcbiAqIGluIGFkZGl0aW9uIHRvIHByb3ZpZGluZyBhc3luY2hyb25vdXMgbWV0aG9kcyBmb3Igc29tZSBnZXR0ZXJzLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtSZW1vdGVEaXJlY3Rvcnl9IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGdSZXBvc2l0b3J5Q2xpZW50IHtcbiAgX3BhdGg6IHN0cmluZztcbiAgX3dvcmtpbmdEaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5IHwgUmVtb3RlRGlyZWN0b3J5O1xuICBfcHJvamVjdERpcmVjdG9yeTogYXRvbSREaXJlY3Rvcnk7XG4gIF9vcmlnaW5VUkw6IHN0cmluZztcbiAgX3NlcnZpY2U6IEhnU2VydmljZTtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIC8vIEEgbWFwIGZyb20gYSBrZXkgKGluIG1vc3QgY2FzZXMsIGEgZmlsZSBwYXRoKSwgdG8gYSByZWxhdGVkIERpc3Bvc2FibGUuXG4gIF9kaXNwb3NhYmxlczoge1trZXk6IHN0cmluZ106IGF0b20kSURpc3Bvc2FibGV9O1xuICBfaGdTdGF0dXNDYWNoZToge1tmaWxlUGF0aDogTnVjbGlkZVVyaV06IFN0YXR1c0NvZGVJZFZhbHVlfTtcbiAgLy8gTWFwIG9mIGRpcmVjdG9yeSBwYXRoIHRvIHRoZSBudW1iZXIgb2YgbW9kaWZpZWQgZmlsZXMgd2l0aGluIHRoYXQgZGlyZWN0b3J5LlxuICBfbW9kaWZpZWREaXJlY3RvcnlDYWNoZTogTWFwPHN0cmluZywgbnVtYmVyPjtcbiAgX2hnRGlmZkNhY2hlOiB7W2ZpbGVQYXRoOiBOdWNsaWRlVXJpXTogRGlmZkluZm99O1xuICBfaGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nOiBTZXQ8TnVjbGlkZVVyaT47XG4gIF9oZ0RpZmZDYWNoZUZpbGVzVG9DbGVhcjogU2V0PE51Y2xpZGVVcmk+O1xuXG4gIC8vIEEgZGVib3VuY2VkIGZ1bmN0aW9uIHRoYXQgZXZlbnR1YWxseSBjYWxscyBfZG9SZWZyZXNoU3RhdHVzZXNPZkFsbEZpbGVzSW5DYWNoZS5cbiAgX2RlYm91bmNlZFJlZnJlc2hBbGw6ID8oKSA9PiBtaXhlZDtcbiAgX2lzUmVmcmVzaGluZ0FsbEZpbGVzSW5DYWNoZTogYm9vbGVhbjtcblxuICBfY3VycmVudEJvb2ttYXJrOiA/c3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJlcG9QYXRoOiBzdHJpbmcsIGhnU2VydmljZTogSGdTZXJ2aWNlLCBvcHRpb25zOiBIZ1JlcG9zaXRvcnlPcHRpb25zKSB7XG4gICAgdGhpcy5fcGF0aCA9IHJlcG9QYXRoO1xuICAgIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkgPSBvcHRpb25zLndvcmtpbmdEaXJlY3Rvcnk7XG4gICAgdGhpcy5fcHJvamVjdERpcmVjdG9yeSA9IG9wdGlvbnMucHJvamVjdFJvb3REaXJlY3Rvcnk7XG4gICAgdGhpcy5fb3JpZ2luVVJMID0gb3B0aW9ucy5vcmlnaW5VUkw7XG4gICAgdGhpcy5fc2VydmljZSA9IGhnU2VydmljZTtcblxuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0ge307XG5cbiAgICB0aGlzLl9oZ1N0YXR1c0NhY2hlID0ge307XG4gICAgdGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZSA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX2hnRGlmZkNhY2hlID0ge307XG4gICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNUb0NsZWFyID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzW0VESVRPUl9TVUJTQ1JJUFRJT05fTkFNRV0gPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoZWRpdG9yID0+IHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgICAgLy8gVE9ETzogb2JzZXJ2ZSBmb3Igd2hlbiB0aGlzIGVkaXRvcidzIHBhdGggY2hhbmdlcy5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLl9pc1BhdGhSZWxldmFudChmaWxlUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gSWYgdGhpcyBlZGl0b3IgaGFzIGJlZW4gcHJldmlvdXNseSBhY3RpdmUsIHdlIHdpbGwgaGF2ZSBhbHJlYWR5XG4gICAgICAvLyBpbml0aWFsaXplZCBkaWZmIGluZm8gYW5kIHJlZ2lzdGVyZWQgbGlzdGVuZXJzIG9uIGl0LlxuICAgICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGVzW2ZpbGVQYXRoXSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBUT0RPICh0ODIyNzU3MCkgR2V0IGluaXRpYWwgZGlmZiBzdGF0cyBmb3IgdGhpcyBlZGl0b3IsIGFuZCByZWZyZXNoXG4gICAgICAvLyB0aGlzIGluZm9ybWF0aW9uIHdoZW5ldmVyIHRoZSBjb250ZW50IG9mIHRoZSBlZGl0b3IgY2hhbmdlcy5cbiAgICAgIGNvbnN0IGVkaXRvclN1YnNjcmlwdGlvbnMgPSB0aGlzLl9kaXNwb3NhYmxlc1tmaWxlUGF0aF0gPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkU2F2ZShldmVudCA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZURpZmZJbmZvKFtldmVudC5wYXRoXSk7XG4gICAgICB9KSk7XG4gICAgICAvLyBSZW1vdmUgdGhlIGZpbGUgZnJvbSB0aGUgZGlmZiBzdGF0cyBjYWNoZSB3aGVuIHRoZSBlZGl0b3IgaXMgY2xvc2VkLlxuICAgICAgLy8gVGhpcyBpc24ndCBzdHJpY3RseSBuZWNlc3NhcnksIGJ1dCBrZWVwcyB0aGUgY2FjaGUgYXMgc21hbGwgYXMgcG9zc2libGUuXG4gICAgICAvLyBUaGVyZSBhcmUgY2FzZXMgd2hlcmUgdGhpcyByZW1vdmFsIG1heSByZXN1bHQgaW4gcmVtb3ZpbmcgaW5mb3JtYXRpb25cbiAgICAgIC8vIHRoYXQgaXMgc3RpbGwgcmVsZXZhbnQ6IGUuZy5cbiAgICAgIC8vICAgKiBpZiB0aGUgdXNlciB2ZXJ5IHF1aWNrbHkgY2xvc2VzIGFuZCByZW9wZW5zIGEgZmlsZTsgb3JcbiAgICAgIC8vICAgKiBpZiB0aGUgZmlsZSBpcyBvcGVuIGluIG11bHRpcGxlIGVkaXRvcnMsIGFuZCBvbmUgb2YgdGhvc2UgaXMgY2xvc2VkLlxuICAgICAgLy8gVGhlc2UgYXJlIHByb2JhYmx5IGVkZ2UgY2FzZXMsIHRob3VnaCwgYW5kIHRoZSBpbmZvcm1hdGlvbiB3aWxsIGJlXG4gICAgICAvLyByZWZldGNoZWQgdGhlIG5leHQgdGltZSB0aGUgZmlsZSBpcyBlZGl0ZWQuXG4gICAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXIuYWRkKGZpbGVQYXRoKTtcbiAgICAgICAgdGhpcy5fZGlzcG9zYWJsZXNbZmlsZVBhdGhdLmRpc3Bvc2UoKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2Rpc3Bvc2FibGVzW2ZpbGVQYXRoXTtcbiAgICAgIH0pKTtcbiAgICB9KTtcblxuICAgIC8vIEdldCB1cGRhdGVzIHRoYXQgdGVsbCB0aGUgSGdSZXBvc2l0b3J5Q2xpZW50IHdoZW4gdG8gY2xlYXIgaXRzIGNhY2hlcy5cbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVGaWxlc0RpZENoYW5nZSgpLnN1YnNjcmliZSh0aGlzLl9maWxlc0RpZENoYW5nZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVIZ0lnbm9yZUZpbGVEaWRDaGFuZ2UoKVxuICAgICAgLnN1YnNjcmliZSh0aGlzLl9yZWZyZXNoU3RhdHVzZXNPZkFsbEZpbGVzSW5DYWNoZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVIZ1JlcG9TdGF0ZURpZENoYW5nZSgpXG4gICAgICAuc3Vic2NyaWJlKHRoaXMuX3JlZnJlc2hTdGF0dXNlc09mQWxsRmlsZXNJbkNhY2hlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX3NlcnZpY2Uub2JzZXJ2ZUhnQm9va21hcmtEaWRDaGFuZ2UoKVxuICAgICAgLnN1YnNjcmliZSh0aGlzLmZldGNoQ3VycmVudEJvb2ttYXJrLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5faXNSZWZyZXNoaW5nQWxsRmlsZXNJbkNhY2hlID0gZmFsc2U7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWRlc3Ryb3knKTtcbiAgICB0aGlzLl9lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9kaXNwb3NhYmxlcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlc1trZXldLmRpc3Bvc2UoKTtcbiAgICB9KTtcbiAgICB0aGlzLl9zZXJ2aWNlLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBFdmVudCBTdWJzY3JpcHRpb25cbiAgICpcbiAgICovXG5cbiAgb25EaWREZXN0cm95KGNhbGxiYWNrOiAoKSA9PiB7fSk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChldmVudDoge3BhdGg6IHN0cmluZzsgcGF0aFN0YXR1czogU3RhdHVzQ29kZU51bWJlclZhbHVlfSkgPT4ge31cbiAgKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignZGlkLWNoYW5nZS1zdGF0dXMnLCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZVN0YXR1c2VzKGNhbGxiYWNrOiAoKSA9PiB7fSk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnLCBjYWxsYmFjayk7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZXBvc2l0b3J5IERldGFpbHNcbiAgICpcbiAgICovXG5cbiAgZ2V0VHlwZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnaGcnO1xuICB9XG5cbiAgZ2V0UGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9wYXRoO1xuICB9XG5cbiAgZ2V0V29ya2luZ0RpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl93b3JraW5nRGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgfVxuXG4gIC8vIEByZXR1cm4gVGhlIHBhdGggb2YgdGhlIHJvb3QgcHJvamVjdCBmb2xkZXIgaW4gQXRvbSB0aGF0IHRoaXNcbiAgLy8gSGdSZXBvc2l0b3J5Q2xpZW50IHByb3ZpZGVzIGluZm9ybWF0aW9uIGFib3V0LlxuICBnZXRQcm9qZWN0RGlyZWN0b3J5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2plY3REaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgaXNQcm9qZWN0QXRSb290KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmVsYXRpdml6ZShmaWxlUGF0aDogTnVjbGlkZVVyaSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkucmVsYXRpdml6ZShmaWxlUGF0aCk7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBoYXNCcmFuY2goYnJhbmNoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiBUaGUgY3VycmVudCBIZyBib29rbWFyay5cbiAgICovXG4gIGdldFNob3J0SGVhZChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLl9jdXJyZW50Qm9va21hcmspIHtcbiAgICAgIC8vIEtpY2sgb2ZmIGEgZmV0Y2ggdG8gZ2V0IHRoZSBjdXJyZW50IGJvb2ttYXJrLiBUaGlzIGlzIGFzeW5jLlxuICAgICAgdGhpcy5mZXRjaEN1cnJlbnRCb29rbWFyaygpO1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEJvb2ttYXJrO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgaXNTdWJtb2R1bGUocGF0aDogTnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldEFoZWFkQmVoaW5kQ291bnQocmVmZXJlbmNlOiBzdHJpbmcsIHBhdGg6IE51Y2xpZGVVcmkpOiBudW1iZXIge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0Q2FjaGVkVXBzdHJlYW1BaGVhZEJlaGluZENvdW50KHBhdGg6ID9OdWNsaWRlVXJpKToge2FoZWFkOiBudW1iZXI7IGJlaGluZDogbnVtYmVyO30ge1xuICAgIHJldHVybiB7XG4gICAgICBhaGVhZDogMCxcbiAgICAgIGJlaGluZDogMCxcbiAgICB9O1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0Q29uZmlnVmFsdWUoa2V5OiBzdHJpbmcsIHBhdGg6ID9zdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldE9yaWdpblVSTChwYXRoOiA/c3RyaW5nKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX29yaWdpblVSTDtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldFVwc3RyZWFtQnJhbmNoKHBhdGg6ID9zdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldFJlZmVyZW5jZXMoXG4gICAgcGF0aDogP051Y2xpZGVVcmksXG4gICk6IHtoZWFkczogQXJyYXk8c3RyaW5nPjsgcmVtb3RlczogQXJyYXk8c3RyaW5nPjsgdGFnczogQXJyYXk8c3RyaW5nPjt9IHtcbiAgICByZXR1cm4ge1xuICAgICAgaGVhZHM6IFtdLFxuICAgICAgcmVtb3RlczogW10sXG4gICAgICB0YWdzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0UmVmZXJlbmNlVGFyZ2V0KHJlZmVyZW5jZTogc3RyaW5nLCBwYXRoOiA/TnVjbGlkZVVyaSk6ID9zdHJpbmcge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmVhZGluZyBTdGF0dXMgKHBhcml0eSB3aXRoIEdpdFJlcG9zaXRvcnkpXG4gICAqXG4gICAqL1xuXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIENhbiB3ZSBjaGFuZ2UgdGhlIEFQSSB0byBtYWtlIHRoaXMgbWV0aG9kIHJldHVybiBhIFByb21pc2U/XG4gIC8vIElmIG5vdCwgbWlnaHQgbmVlZCB0byBkbyBhIHN5bmNocm9ub3VzIGBoZyBzdGF0dXNgIHF1ZXJ5LlxuICBpc1BhdGhNb2RpZmllZChmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZFBhdGhTdGF0dXMgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoIWNhY2hlZFBhdGhTdGF0dXMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaXNTdGF0dXNNb2RpZmllZChTdGF0dXNDb2RlSWRUb051bWJlcltjYWNoZWRQYXRoU3RhdHVzXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgQ2FuIHdlIGNoYW5nZSB0aGUgQVBJIHRvIG1ha2UgdGhpcyBtZXRob2QgcmV0dXJuIGEgUHJvbWlzZT9cbiAgLy8gSWYgbm90LCBtaWdodCBuZWVkIHRvIGRvIGEgc3luY2hyb25vdXMgYGhnIHN0YXR1c2AgcXVlcnkuXG4gIGlzUGF0aE5ldyhmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZFBhdGhTdGF0dXMgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoIWNhY2hlZFBhdGhTdGF0dXMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaXNTdGF0dXNOZXcoU3RhdHVzQ29kZUlkVG9OdW1iZXJbY2FjaGVkUGF0aFN0YXR1c10pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIENhbiB3ZSBjaGFuZ2UgdGhlIEFQSSB0byBtYWtlIHRoaXMgbWV0aG9kIHJldHVybiBhIFByb21pc2U/XG4gIC8vIElmIG5vdCwgdGhpcyBtZXRob2QgbGllcyBhIGJpdCBieSB1c2luZyBjYWNoZWQgaW5mb3JtYXRpb24uXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIE1ha2UgdGhpcyB3b3JrIGZvciBpZ25vcmVkIGRpcmVjdG9yaWVzLlxuICBpc1BhdGhJZ25vcmVkKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gYGhnIHN0YXR1cyAtaWAgZG9lcyBub3QgbGlzdCB0aGUgcmVwbyAodGhlIC5oZyBkaXJlY3RvcnkpLCBwcmVzdW1hYmx5XG4gICAgLy8gYmVjYXVzZSB0aGUgcmVwbyBkb2VzIG5vdCB0cmFjayBpdHNlbGYuXG4gICAgLy8gV2Ugd2FudCB0byByZXByZXNlbnQgdGhlIGZhY3QgdGhhdCBpdCdzIG5vdCBwYXJ0IG9mIHRoZSB0cmFja2VkIGNvbnRlbnRzLFxuICAgIC8vIHNvIHdlIG1hbnVhbGx5IGFkZCBhbiBleGNlcHRpb24gZm9yIGl0IHZpYSB0aGUgX2lzUGF0aFdpdGhpbkhnUmVwbyBjaGVjay5cbiAgICByZXR1cm4gKHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdID09PSBTdGF0dXNDb2RlSWQuSUdOT1JFRCkgfHxcbiAgICAgICAgdGhpcy5faXNQYXRoV2l0aGluSGdSZXBvKGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGdpdmVuIHBhdGggaXMgd2l0aGluIHRoZSByZXBvIGRpcmVjdG9yeSAoaS5lLiBgLmhnL2ApLlxuICAgKi9cbiAgX2lzUGF0aFdpdGhpbkhnUmVwbyhmaWxlUGF0aDogTnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoZmlsZVBhdGggPT09IHRoaXMuZ2V0UGF0aCgpKSB8fCAoZmlsZVBhdGguaW5kZXhPZih0aGlzLmdldFBhdGgoKSArICcvJykgPT09IDApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIGEgcGF0aCBpcyByZWxldmFudCB0byB0aGlzIEhnUmVwb3NpdG9yeUNsaWVudC4gQSBwYXRoIGlzXG4gICAqIGRlZmluZWQgYXMgJ3JlbGV2YW50JyBpZiBpdCBpcyB3aXRoaW4gdGhlIHByb2plY3QgZGlyZWN0b3J5IG9wZW5lZCB3aXRoaW4gdGhlIHJlcG8uXG4gICAqL1xuICBfaXNQYXRoUmVsZXZhbnQoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvamVjdERpcmVjdG9yeS5jb250YWlucyhmaWxlUGF0aCkgfHxcbiAgICAgICAgICAgKHRoaXMuX3Byb2plY3REaXJlY3RvcnkuZ2V0UGF0aCgpID09PSBmaWxlUGF0aCk7XG4gIH1cblxuICAvLyBGb3Igbm93LCB0aGlzIG1ldGhvZCBvbmx5IHJlZmxlY3RzIHRoZSBzdGF0dXMgb2YgXCJtb2RpZmllZFwiIGRpcmVjdG9yaWVzLlxuICAvLyBUcmFja2luZyBkaXJlY3Rvcnkgc3RhdHVzIGlzbid0IHN0cmFpZ2h0Zm9yd2FyZCwgYXMgSGcgb25seSB0cmFja3MgZmlsZXMuXG4gIC8vIGh0dHA6Ly9tZXJjdXJpYWwuc2VsZW5pYy5jb20vd2lraS9GQVEjRkFRLjJGQ29tbW9uUHJvYmxlbXMuSV90cmllZF90b19jaGVja19pbl9hbl9lbXB0eV9kaXJlY3RvcnlfYW5kX2l0X2ZhaWxlZC4yMVxuICAvLyBUT0RPOiBNYWtlIHRoaXMgbWV0aG9kIHJlZmxlY3QgTmV3IGFuZCBJZ25vcmVkIHN0YXR1c2VzLlxuICBnZXREaXJlY3RvcnlTdGF0dXMoZGlyZWN0b3J5UGF0aDogP3N0cmluZyk6IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZSB7XG4gICAgaWYgKCFkaXJlY3RvcnlQYXRoKSB7XG4gICAgICByZXR1cm4gU3RhdHVzQ29kZU51bWJlci5DTEVBTjtcbiAgICB9XG4gICAgY29uc3QgZGlyZWN0b3J5UGF0aFdpdGhTZXBhcmF0b3IgPSBlbnN1cmVUcmFpbGluZ1NlcGFyYXRvcihkaXJlY3RvcnlQYXRoKTtcbiAgICBpZiAodGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZS5oYXMoZGlyZWN0b3J5UGF0aFdpdGhTZXBhcmF0b3IpKSB7XG4gICAgICByZXR1cm4gU3RhdHVzQ29kZU51bWJlci5NT0RJRklFRDtcbiAgICB9XG4gICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU47XG4gIH1cblxuICAvLyBXZSBkb24ndCB3YW50IHRvIGRvIGFueSBzeW5jaHJvbm91cyAnaGcgc3RhdHVzJyBjYWxscy4gSnVzdCB1c2UgY2FjaGVkIHZhbHVlcy5cbiAgZ2V0UGF0aFN0YXR1cyhmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2FjaGVkUGF0aFN0YXR1cyhmaWxlUGF0aCk7XG4gIH1cblxuICBnZXRDYWNoZWRQYXRoU3RhdHVzKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZSB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU47XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZFN0YXR1cyA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmIChjYWNoZWRTdGF0dXMpIHtcbiAgICAgIHJldHVybiBTdGF0dXNDb2RlSWRUb051bWJlcltjYWNoZWRTdGF0dXNdO1xuICAgIH1cbiAgICByZXR1cm4gU3RhdHVzQ29kZU51bWJlci5DTEVBTjtcbiAgfVxuXG4gIGdldEFsbFBhdGhTdGF0dXNlcygpOiB7W2ZpbGVQYXRoOiBOdWNsaWRlVXJpXTogU3RhdHVzQ29kZU51bWJlclZhbHVlfSB7XG4gICAgY29uc3QgcGF0aFN0YXR1c2VzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIGluIHRoaXMuX2hnU3RhdHVzQ2FjaGUpIHtcbiAgICAgIHBhdGhTdGF0dXNlc1tmaWxlUGF0aF0gPSBTdGF0dXNDb2RlSWRUb051bWJlclt0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXV07XG4gICAgfVxuICAgIHJldHVybiBwYXRoU3RhdHVzZXM7XG4gIH1cblxuICBpc1N0YXR1c01vZGlmaWVkKHN0YXR1czogP251bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQgfHxcbiAgICAgIHN0YXR1cyA9PT0gU3RhdHVzQ29kZU51bWJlci5NSVNTSU5HIHx8XG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuUkVNT1ZFRFxuICAgICk7XG4gIH1cblxuICBpc1N0YXR1c05ldyhzdGF0dXM6ID9udW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLkFEREVEIHx8XG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuVU5UUkFDS0VEXG4gICAgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJlYWRpbmcgSGcgU3RhdHVzIChhc3luYyBtZXRob2RzKVxuICAgKlxuICAgKi9cblxuICAvKipcbiAgICogUmVjb21tZW5kZWQgbWV0aG9kIHRvIHVzZSB0byBnZXQgdGhlIHN0YXR1cyBvZiBmaWxlcyBpbiB0aGlzIHJlcG8uXG4gICAqIEBwYXJhbSBwYXRocyBBbiBhcnJheSBvZiBmaWxlIHBhdGhzIHRvIGdldCB0aGUgc3RhdHVzIGZvci4gSWYgYSBwYXRoIGlzIG5vdCBpbiB0aGVcbiAgICogICBwcm9qZWN0LCBpdCB3aWxsIGJlIGlnbm9yZWQuXG4gICAqIFNlZSBIZ1NlcnZpY2U6OmdldFN0YXR1c2VzIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgYXN5bmMgZ2V0U3RhdHVzZXMoXG4gICAgcGF0aHM6IEFycmF5PHN0cmluZz4sXG4gICAgb3B0aW9ucz86IEhnU3RhdHVzQ29tbWFuZE9wdGlvbnMsXG4gICk6IFByb21pc2U8TWFwPE51Y2xpZGVVcmksIFN0YXR1c0NvZGVOdW1iZXJWYWx1ZT4+IHtcbiAgICBjb25zdCBzdGF0dXNNYXAgPSBuZXcgTWFwKCk7XG4gICAgY29uc3QgaXNSZWxhdmFudFN0YXR1cyA9IHRoaXMuX2dldFByZWRpY2F0ZUZvclJlbGV2YW50U3RhdHVzZXMob3B0aW9ucyk7XG5cbiAgICAvLyBDaGVjayB0aGUgY2FjaGUuXG4gICAgLy8gTm90ZTogSWYgcGF0aHMgaXMgZW1wdHksIGEgZnVsbCBgaGcgc3RhdHVzYCB3aWxsIGJlIHJ1biwgd2hpY2ggZm9sbG93cyB0aGUgc3BlYy5cbiAgICBjb25zdCBwYXRoc1dpdGhDYWNoZU1pc3MgPSBbXTtcbiAgICBwYXRocy5mb3JFYWNoKChmaWxlUGF0aCkgPT4ge1xuICAgICAgY29uc3Qgc3RhdHVzSWQgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgIGlmIChzdGF0dXNJZCkge1xuICAgICAgICBpZiAoIWlzUmVsYXZhbnRTdGF0dXMoc3RhdHVzSWQpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0YXR1c01hcC5zZXQoZmlsZVBhdGgsIFN0YXR1c0NvZGVJZFRvTnVtYmVyW3N0YXR1c0lkXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXRoc1dpdGhDYWNoZU1pc3MucHVzaChmaWxlUGF0aCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBGZXRjaCBhbnkgdW5jYWNoZWQgc3RhdHVzZXMuXG4gICAgaWYgKHBhdGhzV2l0aENhY2hlTWlzcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IG5ld1N0YXR1c0luZm8gPSBhd2FpdCB0aGlzLl91cGRhdGVTdGF0dXNlcyhwYXRoc1dpdGhDYWNoZU1pc3MsIG9wdGlvbnMpO1xuICAgICAgbmV3U3RhdHVzSW5mby5mb3JFYWNoKChzdGF0dXMsIGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIHN0YXR1c01hcC5zZXQoZmlsZVBhdGgsIFN0YXR1c0NvZGVJZFRvTnVtYmVyW3N0YXR1c10pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBzdGF0dXNNYXA7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgc3RhdHVzZXMgZm9yIHRoZSBnaXZlbiBmaWxlIHBhdGhzLCBhbmQgdXBkYXRlcyB0aGUgY2FjaGUgYW5kXG4gICAqIHNlbmRzIG91dCBjaGFuZ2UgZXZlbnRzIGFzIGFwcHJvcHJpYXRlLlxuICAgKiBAcGFyYW0gZmlsZVBhdGhzIEFuIGFycmF5IG9mIGZpbGUgcGF0aHMgdG8gdXBkYXRlIHRoZSBzdGF0dXMgZm9yLiBJZiBhIHBhdGhcbiAgICogICBpcyBub3QgaW4gdGhlIHByb2plY3QsIGl0IHdpbGwgYmUgaWdub3JlZC5cbiAgICovXG4gIGFzeW5jIF91cGRhdGVTdGF0dXNlcyhcbiAgICBmaWxlUGF0aHM6IEFycmF5PHN0cmluZz4sXG4gICAgb3B0aW9uczogP0hnU3RhdHVzQ29tbWFuZE9wdGlvbnMsXG4gICk6IFByb21pc2U8TWFwPE51Y2xpZGVVcmksIFN0YXR1c0NvZGVJZFZhbHVlPj4ge1xuICAgIGNvbnN0IHBhdGhzSW5SZXBvID0gZmlsZVBhdGhzLmZpbHRlcigoZmlsZVBhdGgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLl9pc1BhdGhSZWxldmFudChmaWxlUGF0aCk7XG4gICAgfSk7XG4gICAgaWYgKHBhdGhzSW5SZXBvLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGF0dXNNYXBQYXRoVG9TdGF0dXNJZCA9IGF3YWl0IHRoaXMuX3NlcnZpY2UuZmV0Y2hTdGF0dXNlcyhwYXRoc0luUmVwbywgb3B0aW9ucyk7XG5cbiAgICBjb25zdCBxdWVyaWVkRmlsZXMgPSBuZXcgU2V0KHBhdGhzSW5SZXBvKTtcbiAgICBjb25zdCBzdGF0dXNDaGFuZ2VFdmVudHMgPSBbXTtcbiAgICBzdGF0dXNNYXBQYXRoVG9TdGF0dXNJZC5mb3JFYWNoKChuZXdTdGF0dXNJZCwgZmlsZVBhdGgpID0+IHtcblxuICAgICAgY29uc3Qgb2xkU3RhdHVzID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICBpZiAob2xkU3RhdHVzICYmIChvbGRTdGF0dXMgIT09IG5ld1N0YXR1c0lkKSB8fFxuICAgICAgICAgICFvbGRTdGF0dXMgJiYgKG5ld1N0YXR1c0lkICE9PSBTdGF0dXNDb2RlSWQuQ0xFQU4pKSB7XG4gICAgICAgIHN0YXR1c0NoYW5nZUV2ZW50cy5wdXNoKHtcbiAgICAgICAgICBwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICBwYXRoU3RhdHVzOiBTdGF0dXNDb2RlSWRUb051bWJlcltuZXdTdGF0dXNJZF0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAobmV3U3RhdHVzSWQgPT09IFN0YXR1c0NvZGVJZC5DTEVBTikge1xuICAgICAgICAgIC8vIERvbid0IGJvdGhlciBrZWVwaW5nICdjbGVhbicgZmlsZXMgaW4gdGhlIGNhY2hlLlxuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgICAgICB0aGlzLl9yZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZShmaWxlUGF0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF0gPSBuZXdTdGF0dXNJZDtcbiAgICAgICAgICBpZiAobmV3U3RhdHVzSWQgPT09IFN0YXR1c0NvZGVJZC5NT0RJRklFRCkge1xuICAgICAgICAgICAgdGhpcy5fYWRkQWxsUGFyZW50RGlyZWN0b3JpZXNUb0NhY2hlKGZpbGVQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHF1ZXJpZWRGaWxlcy5kZWxldGUoZmlsZVBhdGgpO1xuICAgIH0pO1xuXG4gICAgLy8gSWYgdGhlIHN0YXR1c2VzIHdlcmUgZmV0Y2hlZCBmb3Igb25seSBjaGFuZ2VkIChgaGcgc3RhdHVzYCkgb3JcbiAgICAvLyBpZ25vcmVkICgnaGcgc3RhdHVzIC0taWdub3JlZGApIGZpbGVzLCBhIHF1ZXJpZWQgZmlsZSBtYXkgbm90IGJlXG4gICAgLy8gcmV0dXJuZWQgaW4gdGhlIHJlc3BvbnNlLiBJZiBpdCB3YXNuJ3QgcmV0dXJuZWQsIHRoaXMgbWVhbnMgaXRzIHN0YXR1c1xuICAgIC8vIG1heSBoYXZlIGNoYW5nZWQsIGluIHdoaWNoIGNhc2UgaXQgc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSB0aGUgaGdTdGF0dXNDYWNoZS5cbiAgICAvLyBOb3RlOiB3ZSBkb24ndCBrbm93IHRoZSByZWFsIHVwZGF0ZWQgc3RhdHVzIG9mIHRoZSBmaWxlLCBzbyBkb24ndCBzZW5kIGEgY2hhbmdlIGV2ZW50LlxuICAgIC8vIFRPRE8gKGplc3NpY2FsaW4pIENhbiB3ZSBtYWtlIHRoZSAncGF0aFN0YXR1cycgZmllbGQgaW4gdGhlIGNoYW5nZSBldmVudCBvcHRpb25hbD9cbiAgICAvLyBUaGVuIHdlIGNhbiBzZW5kIHRoZXNlIGV2ZW50cy5cbiAgICBjb25zdCBoYXNPcHRpb25zID0gb3B0aW9ucyAmJiAoJ2hnU3RhdHVzT3B0aW9uJyBpbiBvcHRpb25zKTtcbiAgICBpZiAoaGFzT3B0aW9ucyAmJiAob3B0aW9ucy5oZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uT05MWV9JR05PUkVEKSkge1xuICAgICAgcXVlcmllZEZpbGVzLmZvckVhY2goKGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXSA9PT0gU3RhdHVzQ29kZUlkLklHTk9SRUQpIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoaGFzT3B0aW9ucyAmJiAob3B0aW9ucy5oZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTKSkge1xuICAgICAgLy8gSWYgSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTIHdhcyBwYXNzZWQgYW5kIGEgZmlsZSBkb2VzIG5vdCBhcHBlYXIgaW5cbiAgICAgIC8vIHRoZSByZXN1bHRzLCBpdCBtdXN0IG1lYW4gdGhlIGZpbGUgd2FzIHJlbW92ZWQgZnJvbSB0aGUgZmlsZXN5c3RlbS5cbiAgICAgIHF1ZXJpZWRGaWxlcy5mb3JFYWNoKChmaWxlUGF0aCkgPT4ge1xuICAgICAgICBjb25zdCBjYWNoZWRTdGF0dXNJZCA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICBkZWxldGUgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgIGlmIChjYWNoZWRTdGF0dXNJZCA9PT0gU3RhdHVzQ29kZUlkLk1PRElGSUVEKSB7XG4gICAgICAgICAgdGhpcy5fcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcmllZEZpbGVzLmZvckVhY2goKGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhY2hlZFN0YXR1c0lkID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgIGlmIChjYWNoZWRTdGF0dXNJZCAhPT0gU3RhdHVzQ29kZUlkLklHTk9SRUQpIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgICAgaWYgKGNhY2hlZFN0YXR1c0lkID09PSBTdGF0dXNDb2RlSWQuTU9ESUZJRUQpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUFsbFBhcmVudERpcmVjdG9yaWVzRnJvbUNhY2hlKGZpbGVQYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEVtaXQgY2hhbmdlIGV2ZW50cyBvbmx5IGFmdGVyIHRoZSBjYWNoZSBoYXMgYmVlbiBmdWxseSB1cGRhdGVkLlxuICAgIHN0YXR1c0NoYW5nZUV2ZW50cy5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXN0YXR1cycsIGV2ZW50KTtcbiAgICB9KTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnKTtcblxuICAgIHJldHVybiBzdGF0dXNNYXBQYXRoVG9TdGF0dXNJZDtcbiAgfVxuXG4gIF9hZGRBbGxQYXJlbnREaXJlY3Rvcmllc1RvQ2FjaGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpIHtcbiAgICBhZGRBbGxQYXJlbnREaXJlY3Rvcmllc1RvQ2FjaGUoXG4gICAgICB0aGlzLl9tb2RpZmllZERpcmVjdG9yeUNhY2hlLFxuICAgICAgZmlsZVBhdGgsXG4gICAgICB0aGlzLl9wcm9qZWN0RGlyZWN0b3J5LmdldFBhcmVudCgpLmdldFBhdGgoKVxuICAgICk7XG4gIH1cblxuICBfcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpIHtcbiAgICByZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZShcbiAgICAgIHRoaXMuX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGUsXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIHRoaXMuX3Byb2plY3REaXJlY3RvcnkuZ2V0UGFyZW50KCkuZ2V0UGF0aCgpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gZm9yIDo6Z2V0U3RhdHVzZXMuXG4gICAqIFJldHVybnMgYSBmaWx0ZXIgZm9yIHdoZXRoZXIgb3Igbm90IHRoZSBnaXZlbiBzdGF0dXMgY29kZSBzaG91bGQgYmVcbiAgICogcmV0dXJuZWQsIGdpdmVuIHRoZSBwYXNzZWQtaW4gb3B0aW9ucyBmb3IgOjpnZXRTdGF0dXNlcy5cbiAgICovXG4gIF9nZXRQcmVkaWNhdGVGb3JSZWxldmFudFN0YXR1c2VzKFxuICAgIG9wdGlvbnM6ID9IZ1N0YXR1c0NvbW1hbmRPcHRpb25zXG4gICk6IChjb2RlOiBTdGF0dXNDb2RlSWRWYWx1ZSkgPT4gYm9vbGVhbiB7XG4gICAgY29uc3QgaGFzT3B0aW9ucyA9IG9wdGlvbnMgJiYgKCdoZ1N0YXR1c09wdGlvbicgaW4gb3B0aW9ucyk7XG5cbiAgICBpZiAoaGFzT3B0aW9ucyAmJiAob3B0aW9ucy5oZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uT05MWV9JR05PUkVEKSkge1xuICAgICAgcmV0dXJuIGZpbHRlckZvck9ubHlJZ25vcmVkO1xuICAgIH0gZWxzZSBpZiAoaGFzT3B0aW9ucyAmJiAob3B0aW9ucy5oZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTKSkge1xuICAgICAgcmV0dXJuIGZpbHRlckZvckFsbFN0YXR1ZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmaWx0ZXJGb3JPbmx5Tm90SWdub3JlZDtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZXRyaWV2aW5nIERpZmZzIChwYXJpdHkgd2l0aCBHaXRSZXBvc2l0b3J5KVxuICAgKlxuICAgKi9cblxuICBnZXREaWZmU3RhdHMoZmlsZVBhdGg6ID9OdWNsaWRlVXJpKToge2FkZGVkOiBudW1iZXI7IGRlbGV0ZWQ6IG51bWJlcjt9IHtcbiAgICBjb25zdCBjbGVhblN0YXRzID0ge2FkZGVkOiAwLCBkZWxldGVkOiAwfTtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gY2xlYW5TdGF0cztcbiAgICB9XG4gICAgY29uc3QgY2FjaGVkRGF0YSA9IHRoaXMuX2hnRGlmZkNhY2hlW2ZpbGVQYXRoXTtcbiAgICByZXR1cm4gY2FjaGVkRGF0YSA/IHthZGRlZDogY2FjaGVkRGF0YS5hZGRlZCwgZGVsZXRlZDogY2FjaGVkRGF0YS5kZWxldGVkfSA6XG4gICAgICAgIGNsZWFuU3RhdHM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBMaW5lRGlmZiB0aGF0IGRlc2NyaWJlcyB0aGUgZGlmZnMgYmV0d2VlbiB0aGUgZ2l2ZW5cbiAgICogZmlsZSdzIGBIRUFEYCBjb250ZW50cyBhbmQgaXRzIGN1cnJlbnQgY29udGVudHMuXG4gICAqIE5PVEU6IHRoaXMgbWV0aG9kIGN1cnJlbnRseSBpZ25vcmVzIHRoZSBwYXNzZWQtaW4gdGV4dCwgYW5kIGluc3RlYWQgZGlmZnNcbiAgICogYWdhaW5zdCB0aGUgY3VycmVudGx5IHNhdmVkIGNvbnRlbnRzIG9mIHRoZSBmaWxlLlxuICAgKi9cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgRXhwb3J0IHRoZSBMaW5lRGlmZiB0eXBlIChmcm9tIGhnLW91dHB1dC1oZWxwZXJzKSB3aGVuXG4gIC8vIHR5cGVzIGNhbiBiZSBleHBvcnRlZC5cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgTWFrZSB0aGlzIG1ldGhvZCB3b3JrIHdpdGggdGhlIHBhc3NlZC1pbiBgdGV4dGAuIHQ2MzkxNTc5XG4gIGdldExpbmVEaWZmcyhmaWxlUGF0aDogP051Y2xpZGVVcmksIHRleHQ6ID9zdHJpbmcpOiBBcnJheTxMaW5lRGlmZj4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgZGlmZkluZm8gPSB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF07XG4gICAgcmV0dXJuIGRpZmZJbmZvID8gZGlmZkluZm8ubGluZURpZmZzIDogW107XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZXRyaWV2aW5nIERpZmZzIChhc3luYyBtZXRob2RzKVxuICAgKlxuICAgKi9cblxuICAvKipcbiAgICogUmVjb21tZW5kZWQgbWV0aG9kIHRvIHVzZSB0byBnZXQgdGhlIGRpZmYgc3RhdHMgb2YgZmlsZXMgaW4gdGhpcyByZXBvLlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgZmlsZSBwYXRoIHRvIGdldCB0aGUgc3RhdHVzIGZvci4gSWYgYSBwYXRoIGlzIG5vdCBpbiB0aGVcbiAgICogICBwcm9qZWN0LCBkZWZhdWx0IFwiY2xlYW5cIiBzdGF0cyB3aWxsIGJlIHJldHVybmVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0RGlmZlN0YXRzRm9yUGF0aChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8e2FkZGVkOiBudW1iZXI7IGRlbGV0ZWQ6IG51bWJlcjt9PiB7XG4gICAgY29uc3QgY2xlYW5TdGF0cyA9IHthZGRlZDogMCwgZGVsZXRlZDogMH07XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGNsZWFuU3RhdHM7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIGNhY2hlLlxuICAgIGNvbnN0IGNhY2hlZERpZmZJbmZvID0gdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmIChjYWNoZWREaWZmSW5mbykge1xuICAgICAgcmV0dXJuIHthZGRlZDogY2FjaGVkRGlmZkluZm8uYWRkZWQsIGRlbGV0ZWQ6IGNhY2hlZERpZmZJbmZvLmRlbGV0ZWR9O1xuICAgIH1cblxuICAgIC8vIEZhbGwgYmFjayB0byBhIGZldGNoLlxuICAgIGNvbnN0IGZldGNoZWRQYXRoVG9EaWZmSW5mbyA9IGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZJbmZvKFtmaWxlUGF0aF0pO1xuICAgIGlmIChmZXRjaGVkUGF0aFRvRGlmZkluZm8pIHtcbiAgICAgIGNvbnN0IGRpZmZJbmZvID0gZmV0Y2hlZFBhdGhUb0RpZmZJbmZvLmdldChmaWxlUGF0aCk7XG4gICAgICBpZiAoZGlmZkluZm8gIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge2FkZGVkOiBkaWZmSW5mby5hZGRlZCwgZGVsZXRlZDogZGlmZkluZm8uZGVsZXRlZH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsZWFuU3RhdHM7XG4gIH1cblxuICAvKipcbiAgICogUmVjb21tZW5kZWQgbWV0aG9kIHRvIHVzZSB0byBnZXQgdGhlIGxpbmUgZGlmZnMgb2YgZmlsZXMgaW4gdGhpcyByZXBvLlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgYWJzb2x1dGUgZmlsZSBwYXRoIHRvIGdldCB0aGUgbGluZSBkaWZmcyBmb3IuIElmIHRoZSBwYXRoIFxcXG4gICAqICAgaXMgbm90IGluIHRoZSBwcm9qZWN0LCBhbiBlbXB0eSBBcnJheSB3aWxsIGJlIHJldHVybmVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0TGluZURpZmZzRm9yUGF0aChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8QXJyYXk8TGluZURpZmY+PiB7XG4gICAgY29uc3QgbGluZURpZmZzID0gW107XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGxpbmVEaWZmcztcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgY2FjaGUuXG4gICAgY29uc3QgY2FjaGVkRGlmZkluZm8gPSB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF07XG4gICAgaWYgKGNhY2hlZERpZmZJbmZvKSB7XG4gICAgICByZXR1cm4gY2FjaGVkRGlmZkluZm8ubGluZURpZmZzO1xuICAgIH1cblxuICAgIC8vIEZhbGwgYmFjayB0byBhIGZldGNoLlxuICAgIGNvbnN0IGZldGNoZWRQYXRoVG9EaWZmSW5mbyA9IGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZJbmZvKFtmaWxlUGF0aF0pO1xuICAgIGlmIChmZXRjaGVkUGF0aFRvRGlmZkluZm8gIT0gbnVsbCkge1xuICAgICAgY29uc3QgZGlmZkluZm8gPSBmZXRjaGVkUGF0aFRvRGlmZkluZm8uZ2V0KGZpbGVQYXRoKTtcbiAgICAgIGlmIChkaWZmSW5mbyAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBkaWZmSW5mby5saW5lRGlmZnM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVEaWZmcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBkaWZmIGluZm9ybWF0aW9uIGZvciB0aGUgZ2l2ZW4gcGF0aHMsIGFuZCB1cGRhdGVzIHRoZSBjYWNoZS5cbiAgICogQHBhcmFtIEFuIGFycmF5IG9mIGFic29sdXRlIGZpbGUgcGF0aHMgZm9yIHdoaWNoIHRvIHVwZGF0ZSB0aGUgZGlmZiBpbmZvLlxuICAgKiBAcmV0dXJuIEEgbWFwIG9mIGVhY2ggcGF0aCB0byBpdHMgRGlmZkluZm8uXG4gICAqICAgVGhpcyBtZXRob2QgbWF5IHJldHVybiBgbnVsbGAgaWYgdGhlIGNhbGwgdG8gYGhnIGRpZmZgIGZhaWxzLlxuICAgKiAgIEEgZmlsZSBwYXRoIHdpbGwgbm90IGFwcGVhciBpbiB0aGUgcmV0dXJuZWQgTWFwIGlmIGl0IGlzIG5vdCBpbiB0aGUgcmVwbyxcbiAgICogICBpZiBpdCBoYXMgbm8gY2hhbmdlcywgb3IgaWYgdGhlcmUgaXMgYSBwZW5kaW5nIGBoZyBkaWZmYCBjYWxsIGZvciBpdCBhbHJlYWR5LlxuICAgKi9cbiAgYXN5bmMgX3VwZGF0ZURpZmZJbmZvKGZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4pOiBQcm9taXNlPD9NYXA8TnVjbGlkZVVyaSwgRGlmZkluZm8+PiB7XG4gICAgY29uc3QgcGF0aHNUb0ZldGNoID0gZmlsZVBhdGhzLmZpbHRlcigoYVBhdGgpID0+IHtcbiAgICAgIC8vIERvbid0IHRyeSB0byBmZXRjaCBpbmZvcm1hdGlvbiBmb3IgdGhpcyBwYXRoIGlmIGl0J3Mgbm90IGluIHRoZSByZXBvLlxuICAgICAgaWYgKCF0aGlzLl9pc1BhdGhSZWxldmFudChhUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gRG9uJ3QgZG8gYW5vdGhlciB1cGRhdGUgZm9yIHRoaXMgcGF0aCBpZiB3ZSBhcmUgaW4gdGhlIG1pZGRsZSBvZiBydW5uaW5nIGFuIHVwZGF0ZS5cbiAgICAgIGlmICh0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVXBkYXRpbmcuaGFzKGFQYXRoKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVXBkYXRpbmcuYWRkKGFQYXRoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAocGF0aHNUb0ZldGNoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICAvLyBDYWxsIHRoZSBIZ1NlcnZpY2UgYW5kIHVwZGF0ZSBvdXIgY2FjaGUgd2l0aCB0aGUgcmVzdWx0cy5cbiAgICBjb25zdCBwYXRoc1RvRGlmZkluZm8gPSBhd2FpdCB0aGlzLl9zZXJ2aWNlLmZldGNoRGlmZkluZm8ocGF0aHNUb0ZldGNoKTtcbiAgICBpZiAocGF0aHNUb0RpZmZJbmZvKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWxlUGF0aCwgZGlmZkluZm9dIG9mIHBhdGhzVG9EaWZmSW5mbykge1xuICAgICAgICB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF0gPSBkaWZmSW5mbztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZmlsZXMgbWFya2VkIGZvciBkZWxldGlvbi5cbiAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVG9DbGVhci5mb3JFYWNoKChmaWxlVG9DbGVhcikgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuX2hnRGlmZkNhY2hlW2ZpbGVUb0NsZWFyXTtcbiAgICB9KTtcbiAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVG9DbGVhci5jbGVhcigpO1xuXG4gICAgLy8gVGhlIGZldGNoZWQgZmlsZXMgY2FuIG5vdyBiZSB1cGRhdGVkIGFnYWluLlxuICAgIGZvciAoY29uc3QgcGF0aFRvRmV0Y2ggb2YgcGF0aHNUb0ZldGNoKSB7XG4gICAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVXBkYXRpbmcuZGVsZXRlKHBhdGhUb0ZldGNoKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPICh0OTExMzkxMykgSWRlYWxseSwgd2UgY291bGQgc2VuZCBtb3JlIHRhcmdldGVkIGV2ZW50cyB0aGF0IGJldHRlclxuICAgIC8vIGRlc2NyaWJlIHdoYXQgY2hhbmdlIGhhcyBvY2N1cnJlZC4gUmlnaHQgbm93LCBHaXRSZXBvc2l0b3J5IGRpY3RhdGVzIGVpdGhlclxuICAgIC8vICdkaWQtY2hhbmdlLXN0YXR1cycgb3IgJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnLlxuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1zdGF0dXNlcycpO1xuICAgIHJldHVybiBwYXRoc1RvRGlmZkluZm87XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZXRyaWV2aW5nIEJvb2ttYXJrIChhc3luYyBtZXRob2RzKVxuICAgKlxuICAgKi9cbiAgYXN5bmMgZmV0Y2hDdXJyZW50Qm9va21hcmsoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgbmV3bHlGZXRjaGVkQm9va21hcmsgPSAnJztcbiAgICB0cnkge1xuICAgICAgbmV3bHlGZXRjaGVkQm9va21hcmsgPSBhd2FpdCB0aGlzLl9zZXJ2aWNlLmZldGNoQ3VycmVudEJvb2ttYXJrKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gU3VwcHJlc3MgdGhlIGVycm9yLiBUaGVyZSBhcmUgbGVnaXRpbWF0ZSB0aW1lcyB3aGVuIHRoZXJlIG1heSBiZSBub1xuICAgICAgLy8gY3VycmVudCBib29rbWFyaywgc3VjaCBhcyBkdXJpbmcgYSByZWJhc2UuIEluIHRoaXMgY2FzZSwgd2UganVzdCB3YW50XG4gICAgICAvLyB0byByZXR1cm4gYW4gZW1wdHkgc3RyaW5nIGlmIHRoZXJlIGlzIG5vIGN1cnJlbnQgYm9va21hcmsuXG4gICAgfVxuICAgIGlmIChuZXdseUZldGNoZWRCb29rbWFyayAhPT0gdGhpcy5fY3VycmVudEJvb2ttYXJrKSB7XG4gICAgICB0aGlzLl9jdXJyZW50Qm9va21hcmsgPSBuZXdseUZldGNoZWRCb29rbWFyaztcbiAgICAgIC8vIFRoZSBBdG9tIHN0YXR1cy1iYXIgdXNlcyB0aGlzIGFzIGEgc2lnbmFsIHRvIHJlZnJlc2ggdGhlICdzaG9ydEhlYWQnLlxuICAgICAgLy8gVGhlcmUgaXMgY3VycmVudGx5IG5vIGRlZGljYXRlZCAnc2hvcnRIZWFkRGlkQ2hhbmdlJyBldmVudC5cbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1zdGF0dXNlcycpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEJvb2ttYXJrIHx8ICcnO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogQ2hlY2tpbmcgT3V0XG4gICAqXG4gICAqL1xuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGNoZWNrb3V0SGVhZChwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBjaGVja291dFJlZmVyZW5jZShyZWZlcmVuY2U6IHN0cmluZywgY3JlYXRlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgdGhlIGFzeW5jIHZlcnNpb24gb2Ygd2hhdCBjaGVja291dFJlZmVyZW5jZSgpIGlzIG1lYW50IHRvIGRvLlxuICAgKi9cbiAgYXN5bmMgY2hlY2tvdXRSZXZpc2lvbihyZWZlcmVuY2U6IHN0cmluZywgY3JlYXRlOiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX3NlcnZpY2UuY2hlY2tvdXQocmVmZXJlbmNlLCBjcmVhdGUpO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogSGdTZXJ2aWNlIHN1YnNjcmlwdGlvbnNcbiAgICpcbiAgICovXG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGNhY2hlIGluIHJlc3BvbnNlIHRvIGFueSBudW1iZXIgb2YgKG5vbi0uaGdpZ25vcmUpIGZpbGVzIGNoYW5naW5nLlxuICAgKiBAcGFyYW0gdXBkYXRlIFRoZSBjaGFuZ2VkIGZpbGUgcGF0aHMuXG4gICAqL1xuICBfZmlsZXNEaWRDaGFuZ2UoY2hhbmdlZFBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPik6IHZvaWQge1xuICAgIGNvbnN0IHJlbGV2YW50Q2hhbmdlZFBhdGhzID0gY2hhbmdlZFBhdGhzLmZpbHRlcih0aGlzLl9pc1BhdGhSZWxldmFudC5iaW5kKHRoaXMpKTtcbiAgICBpZiAocmVsZXZhbnRDaGFuZ2VkUGF0aHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChyZWxldmFudENoYW5nZWRQYXRocy5sZW5ndGggPD0gTUFYX0lORElWSURVQUxfQ0hBTkdFRF9QQVRIUykge1xuICAgICAgLy8gVXBkYXRlIHRoZSBzdGF0dXNlcyBpbmRpdmlkdWFsbHkuXG4gICAgICB0aGlzLl91cGRhdGVTdGF0dXNlcyhyZWxldmFudENoYW5nZWRQYXRocywge2hnU3RhdHVzT3B0aW9uOiBIZ1N0YXR1c09wdGlvbi5BTExfU1RBVFVTRVN9KTtcbiAgICAgIHRoaXMuX3VwZGF0ZURpZmZJbmZvKHJlbGV2YW50Q2hhbmdlZFBhdGhzLmZpbHRlcihmaWxlUGF0aCA9PiB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhpcyBpcyBhIGhldXJpc3RpYyB0byBpbXByb3ZlIHBlcmZvcm1hbmNlLiBNYW55IGZpbGVzIGJlaW5nIGNoYW5nZWQgbWF5XG4gICAgICAvLyBiZSBhIHNpZ24gdGhhdCB3ZSBhcmUgcGlja2luZyB1cCBjaGFuZ2VzIHRoYXQgd2VyZSBjcmVhdGVkIGluIGFuIGF1dG9tYXRlZFxuICAgICAgLy8gd2F5IC0tIHNvIGluIGFkZGl0aW9uLCB0aGVyZSBtYXkgYmUgbWFueSBiYXRjaGVzIG9mIGNoYW5nZXMgaW4gc3VjY2Vzc2lvbi5cbiAgICAgIC8vIF9yZWZyZXNoU3RhdHVzZXNPZkFsbEZpbGVzSW5DYWNoZSBkZWJvdW5jZXMgY2FsbHMsIHNvIGl0IGlzIHNhZmUgdG8gY2FsbFxuICAgICAgLy8gaXQgbXVsdGlwbGUgdGltZXMgaW4gc3VjY2Vzc2lvbi5cbiAgICAgIHRoaXMuX3JlZnJlc2hTdGF0dXNlc09mQWxsRmlsZXNJbkNhY2hlKCk7XG4gICAgfVxuICB9XG5cbiAgX3JlZnJlc2hTdGF0dXNlc09mQWxsRmlsZXNJbkNhY2hlKCk6IHZvaWQge1xuICAgIGxldCBkZWJvdW5jZWRSZWZyZXNoQWxsID0gdGhpcy5fZGVib3VuY2VkUmVmcmVzaEFsbDtcbiAgICBpZiAoZGVib3VuY2VkUmVmcmVzaEFsbCA9PSBudWxsKSB7XG4gICAgICBjb25zdCBkb1JlZnJlc2ggPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9pc1JlZnJlc2hpbmdBbGxGaWxlc0luQ2FjaGUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faXNSZWZyZXNoaW5nQWxsRmlsZXNJbkNhY2hlID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBwYXRoc0luU3RhdHVzQ2FjaGUgPSBPYmplY3Qua2V5cyh0aGlzLl9oZ1N0YXR1c0NhY2hlKTtcbiAgICAgICAgdGhpcy5faGdTdGF0dXNDYWNoZSA9IHt9O1xuICAgICAgICB0aGlzLl9tb2RpZmllZERpcmVjdG9yeUNhY2hlID0gbmV3IE1hcCgpO1xuICAgICAgICAvLyBXZSBzaG91bGQgZ2V0IHRoZSBtb2RpZmllZCBzdGF0dXMgb2YgYWxsIGZpbGVzIGluIHRoZSByZXBvIHRoYXQgaXNcbiAgICAgICAgLy8gdW5kZXIgdGhlIEhnUmVwb3NpdG9yeUNsaWVudCdzIHByb2plY3QgZGlyZWN0b3J5LCBiZWNhdXNlIHdoZW4gSGdcbiAgICAgICAgLy8gbW9kaWZpZXMgdGhlIHJlcG8sIGl0IGRvZXNuJ3QgbmVjZXNzYXJpbHkgb25seSBtb2RpZnkgZmlsZXMgdGhhdCB3ZXJlXG4gICAgICAgIC8vIHByZXZpb3VzbHkgbW9kaWZpZWQuXG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YXR1c2VzKFxuICAgICAgICAgICAgW3RoaXMuZ2V0UHJvamVjdERpcmVjdG9yeSgpXSwge2hnU3RhdHVzT3B0aW9uOiBIZ1N0YXR1c09wdGlvbi5PTkxZX05PTl9JR05PUkVEfSk7XG4gICAgICAgIGlmIChwYXRoc0luU3RhdHVzQ2FjaGUubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gVGhlIGxvZ2ljIGlzIGEgYml0IGRpZmZlcmVudCBmb3IgaWdub3JlZCBmaWxlcywgYmVjYXVzZSB0aGVcbiAgICAgICAgICAvLyBIZ1JlcG9zaXRvcnlDbGllbnQgYWx3YXlzIGZldGNoZXMgaWdub3JlZCBzdGF0dXNlcyBsYXppbHkgKGFzIGNhbGxlcnNcbiAgICAgICAgICAvLyBhc2sgZm9yIHRoZW0pLiBTbywgd2Ugb25seSBmZXRjaCB0aGUgaWdub3JlZCBzdGF0dXMgb2YgZmlsZXMgYWxyZWFkeVxuICAgICAgICAgIC8vIGluIHRoZSBjYWNoZS4gKE5vdGU6IGlmIEkgYXNrIEhnIGZvciB0aGUgJ2lnbm9yZWQnIHN0YXR1cyBvZiBhIGxpc3Qgb2ZcbiAgICAgICAgICAvLyBmaWxlcywgYW5kIG5vbmUgb2YgdGhlbSBhcmUgaWdub3JlZCwgbm8gc3RhdHVzZXMgd2lsbCBiZSByZXR1cm5lZC4pXG4gICAgICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlU3RhdHVzZXMoXG4gICAgICAgICAgICAgIHBhdGhzSW5TdGF0dXNDYWNoZSwge2hnU3RhdHVzT3B0aW9uOiBIZ1N0YXR1c09wdGlvbi5PTkxZX0lHTk9SRUR9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhdGhzSW5EaWZmQ2FjaGUgPSBPYmplY3Qua2V5cyh0aGlzLl9oZ0RpZmZDYWNoZSk7XG4gICAgICAgIHRoaXMuX2hnRGlmZkNhY2hlID0ge307XG4gICAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZJbmZvKHBhdGhzSW5EaWZmQ2FjaGUpO1xuXG4gICAgICAgIHRoaXMuX2lzUmVmcmVzaGluZ0FsbEZpbGVzSW5DYWNoZSA9IGZhbHNlO1xuICAgICAgfTtcbiAgICAgIHRoaXMuX2RlYm91bmNlZFJlZnJlc2hBbGwgPSBkZWJvdW5jZShcbiAgICAgICAgZG9SZWZyZXNoLFxuICAgICAgICBERUJPVU5DRV9NSUxMSVNFQ09ORFNfRk9SX1JFRlJFU0hfQUxMLFxuICAgICAgICAvKiBpbW1lZGlhdGUgKi8gZmFsc2VcbiAgICAgICk7XG4gICAgICBkZWJvdW5jZWRSZWZyZXNoQWxsID0gdGhpcy5fZGVib3VuY2VkUmVmcmVzaEFsbDtcbiAgICB9XG4gICAgZGVib3VuY2VkUmVmcmVzaEFsbCgpO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmVwb3NpdG9yeSBTdGF0ZSBhdCBTcGVjaWZpYyBSZXZpc2lvbnNcbiAgICpcbiAgICovXG4gIGZldGNoRmlsZUNvbnRlbnRBdFJldmlzaW9uKGZpbGVQYXRoOiBOdWNsaWRlVXJpLCByZXZpc2lvbjogP3N0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmZldGNoRmlsZUNvbnRlbnRBdFJldmlzaW9uKGZpbGVQYXRoLCByZXZpc2lvbik7XG4gIH1cblxuICBmZXRjaEZpbGVzQ2hhbmdlZEF0UmV2aXNpb24ocmV2aXNpb246IHN0cmluZyk6IFByb21pc2U8P1JldmlzaW9uRmlsZUNoYW5nZXM+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5mZXRjaEZpbGVzQ2hhbmdlZEF0UmV2aXNpb24ocmV2aXNpb24pO1xuICB9XG5cbiAgZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuSGVhZEFuZEJhc2UoKTogUHJvbWlzZTw/QXJyYXk8UmV2aXNpb25JbmZvPj4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmZldGNoUmV2aXNpb25JbmZvQmV0d2VlbkhlYWRBbmRCYXNlKCk7XG4gIH1cblxuICAvLyBTZWUgSGdTZXJ2aWNlLmdldEJsYW1lQXRIZWFkLlxuICBnZXRCbGFtZUF0SGVhZChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8TWFwPHN0cmluZywgc3RyaW5nPj4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmdldEJsYW1lQXRIZWFkKGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8vIFNlZSBIZ1NlcnZpY2UuZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZC5cbiAgZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZChjaGFuZ2VTZXRJZDogc3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZChjaGFuZ2VTZXRJZCk7XG4gIH1cblxuICBnZXRTbWFydGxvZyh0dHlPdXRwdXQ6IGJvb2xlYW4sIGNvbmNpc2U6IGJvb2xlYW4pOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmdldFNtYXJ0bG9nKHR0eU91dHB1dCwgY29uY2lzZSk7XG4gIH1cblxuICByZW5hbWUob2xkRmlsZVBhdGg6IHN0cmluZywgbmV3RmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLnJlbmFtZShvbGRGaWxlUGF0aCwgbmV3RmlsZVBhdGgpO1xuICB9XG5cbiAgcmVtb3ZlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5yZW1vdmUoZmlsZVBhdGgpO1xuICB9XG5cbiAgYWRkKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5hZGQoZmlsZVBhdGgpO1xuICB9XG59XG4iXX0=