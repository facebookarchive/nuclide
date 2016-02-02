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
//# sourceMappingURL=data:application/json;base64,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QzVEOzs7OztXQUdhLHdCQUFDLFFBQW9CLEVBQWdDO0FBQ2pFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDL0M7Ozs7O1dBR29DLCtDQUFDLFdBQW1CLEVBQW9CO0FBQzNFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUN6RTs7O1dBRVUscUJBQUMsU0FBa0IsRUFBRSxPQUFnQixFQUFtQjtBQUNqRSxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUN0RDs7O1dBRUssZ0JBQUMsV0FBbUIsRUFBRSxXQUFtQixFQUFvQjtBQUNqRSxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztLQUN2RDs7O1dBRUssZ0JBQUMsUUFBZ0IsRUFBb0I7QUFDekMsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN2Qzs7O1dBRUUsYUFBQyxRQUFnQixFQUFvQjtBQUN0QyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3BDOzs7U0FqekJrQixrQkFBa0I7OztxQkFBbEIsa0JBQWtCIiwiZmlsZSI6IkhnUmVwb3NpdG9yeUNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRGlmZkluZm8sXG4gIEhnU3RhdHVzT3B0aW9uVmFsdWUsXG4gIExpbmVEaWZmLFxuICBSZXZpc2lvbkluZm8sXG4gIFJldmlzaW9uRmlsZUNoYW5nZXMsXG4gIFN0YXR1c0NvZGVJZFZhbHVlLFxuICBTdGF0dXNDb2RlTnVtYmVyVmFsdWUsXG59IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuaW1wb3J0IHR5cGUge1xuICBIZ1NlcnZpY2UsXG59IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlLmpzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIFN0YXR1c0NvZGVJZCxcbiAgU3RhdHVzQ29kZUlkVG9OdW1iZXIsXG4gIFN0YXR1c0NvZGVOdW1iZXIsXG4gIEhnU3RhdHVzT3B0aW9uLFxufSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL2hnLWNvbnN0YW50cyc7XG5pbXBvcnQge2RlYm91bmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7ZW5zdXJlVHJhaWxpbmdTZXBhcmF0b3J9IGZyb20gJy4uLy4uL2NvbW1vbnMvbGliL3BhdGhzJztcbmltcG9ydCB7YWRkQWxsUGFyZW50RGlyZWN0b3JpZXNUb0NhY2hlLCByZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZX0gZnJvbSAnLi91dGlscyc7XG5cbnR5cGUgSGdSZXBvc2l0b3J5T3B0aW9ucyA9IHtcbiAgLyoqIFRoZSBvcmlnaW4gVVJMIG9mIHRoaXMgcmVwb3NpdG9yeS4gKi9cbiAgb3JpZ2luVVJMOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSB3b3JraW5nIGRpcmVjdG9yeSBvZiB0aGlzIHJlcG9zaXRvcnkuICovXG4gIHdvcmtpbmdEaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5IHwgUmVtb3RlRGlyZWN0b3J5O1xuXG4gIC8qKiBUaGUgcm9vdCBkaXJlY3RvcnkgdGhhdCBpcyBvcGVuZWQgaW4gQXRvbSwgd2hpY2ggdGhpcyBSZXBvc2l0b3J5IHNlcnZlcy4gKiovXG4gIHByb2plY3RSb290RGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeTtcbn07XG5cbi8qKlxuICpcbiAqIFNlY3Rpb246IENvbnN0YW50cywgVHlwZSBEZWZpbml0aW9uc1xuICpcbiAqL1xuXG5leHBvcnQgdHlwZSBIZ1N0YXR1c0NvbW1hbmRPcHRpb25zID0ge1xuICBoZ1N0YXR1c09wdGlvbjogSGdTdGF0dXNPcHRpb25WYWx1ZTtcbn07XG5cbmNvbnN0IEVESVRPUl9TVUJTQ1JJUFRJT05fTkFNRSA9ICdoZy1yZXBvc2l0b3J5LWVkaXRvci1zdWJzY3JpcHRpb24nO1xuZXhwb3J0IGNvbnN0IERFQk9VTkNFX01JTExJU0VDT05EU19GT1JfUkVGUkVTSF9BTEwgPSA1MDA7XG5leHBvcnQgY29uc3QgTUFYX0lORElWSURVQUxfQ0hBTkdFRF9QQVRIUyA9IDE7XG5cbmZ1bmN0aW9uIGZpbHRlckZvck9ubHlOb3RJZ25vcmVkKGNvZGU6IFN0YXR1c0NvZGVJZFZhbHVlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoY29kZSAhPT0gU3RhdHVzQ29kZUlkLklHTk9SRUQpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJGb3JPbmx5SWdub3JlZChjb2RlOiBTdGF0dXNDb2RlSWRWYWx1ZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKGNvZGUgPT09IFN0YXR1c0NvZGVJZC5JR05PUkVEKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyRm9yQWxsU3RhdHVlcygpIHtcbiAgcmV0dXJuIHRydWU7XG59XG5cblxuLyoqXG4gKlxuICogU2VjdGlvbjogSGdSZXBvc2l0b3J5Q2xpZW50XG4gKlxuICovXG5cbi8qKlxuICogSGdSZXBvc2l0b3J5Q2xpZW50IHJ1bnMgb24gdGhlIG1hY2hpbmUgdGhhdCBOdWNsaWRlL0F0b20gaXMgcnVubmluZyBvbi5cbiAqIEl0IGlzIHRoZSBpbnRlcmZhY2UgdGhhdCBvdGhlciBBdG9tIHBhY2thZ2VzIHdpbGwgdXNlIHRvIGFjY2VzcyBNZXJjdXJpYWwuXG4gKiBJdCBjYWNoZXMgZGF0YSBmZXRjaGVkIGZyb20gYW4gSGdTZXJ2aWNlLlxuICogSXQgaW1wbGVtZW50cyB0aGUgc2FtZSBpbnRlcmZhY2UgYXMgR2l0UmVwb3NpdG9yeSwgKGh0dHBzOi8vYXRvbS5pby9kb2NzL2FwaS9sYXRlc3QvR2l0UmVwb3NpdG9yeSlcbiAqIGluIGFkZGl0aW9uIHRvIHByb3ZpZGluZyBhc3luY2hyb25vdXMgbWV0aG9kcyBmb3Igc29tZSBnZXR0ZXJzLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtSZW1vdGVEaXJlY3Rvcnl9IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGdSZXBvc2l0b3J5Q2xpZW50IHtcbiAgX3BhdGg6IHN0cmluZztcbiAgX3dvcmtpbmdEaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5IHwgUmVtb3RlRGlyZWN0b3J5O1xuICBfcHJvamVjdERpcmVjdG9yeTogYXRvbSREaXJlY3Rvcnk7XG4gIF9vcmlnaW5VUkw6IHN0cmluZztcbiAgX3NlcnZpY2U6IEhnU2VydmljZTtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIC8vIEEgbWFwIGZyb20gYSBrZXkgKGluIG1vc3QgY2FzZXMsIGEgZmlsZSBwYXRoKSwgdG8gYSByZWxhdGVkIERpc3Bvc2FibGUuXG4gIF9kaXNwb3NhYmxlczoge1trZXk6IHN0cmluZ106IElEaXNwb3NhYmxlfTtcbiAgX2hnU3RhdHVzQ2FjaGU6IHtbZmlsZVBhdGg6IE51Y2xpZGVVcmldOiBTdGF0dXNDb2RlSWRWYWx1ZX07XG4gIC8vIE1hcCBvZiBkaXJlY3RvcnkgcGF0aCB0byB0aGUgbnVtYmVyIG9mIG1vZGlmaWVkIGZpbGVzIHdpdGhpbiB0aGF0IGRpcmVjdG9yeS5cbiAgX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGU6IE1hcDxzdHJpbmcsIG51bWJlcj47XG4gIF9oZ0RpZmZDYWNoZToge1tmaWxlUGF0aDogTnVjbGlkZVVyaV06IERpZmZJbmZvfTtcbiAgX2hnRGlmZkNhY2hlRmlsZXNVcGRhdGluZzogU2V0PE51Y2xpZGVVcmk+O1xuICBfaGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXI6IFNldDxOdWNsaWRlVXJpPjtcblxuICAvLyBBIGRlYm91bmNlZCBmdW5jdGlvbiB0aGF0IGV2ZW50dWFsbHkgY2FsbHMgX2RvUmVmcmVzaFN0YXR1c2VzT2ZBbGxGaWxlc0luQ2FjaGUuXG4gIF9kZWJvdW5jZWRSZWZyZXNoQWxsOiA/KCkgPT4gbWl4ZWQ7XG4gIF9pc1JlZnJlc2hpbmdBbGxGaWxlc0luQ2FjaGU6IGJvb2xlYW47XG5cbiAgX2N1cnJlbnRCb29rbWFyazogP3N0cmluZztcblxuICBjb25zdHJ1Y3RvcihyZXBvUGF0aDogc3RyaW5nLCBoZ1NlcnZpY2U6IEhnU2VydmljZSwgb3B0aW9uczogSGdSZXBvc2l0b3J5T3B0aW9ucykge1xuICAgIHRoaXMuX3BhdGggPSByZXBvUGF0aDtcbiAgICB0aGlzLl93b3JraW5nRGlyZWN0b3J5ID0gb3B0aW9ucy53b3JraW5nRGlyZWN0b3J5O1xuICAgIHRoaXMuX3Byb2plY3REaXJlY3RvcnkgPSBvcHRpb25zLnByb2plY3RSb290RGlyZWN0b3J5O1xuICAgIHRoaXMuX29yaWdpblVSTCA9IG9wdGlvbnMub3JpZ2luVVJMO1xuICAgIHRoaXMuX3NlcnZpY2UgPSBoZ1NlcnZpY2U7XG5cbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IHt9O1xuXG4gICAgdGhpcy5faGdTdGF0dXNDYWNoZSA9IHt9O1xuICAgIHRoaXMuX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGUgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9oZ0RpZmZDYWNoZSA9IHt9O1xuICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNVcGRhdGluZyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVG9DbGVhciA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlc1tFRElUT1JfU1VCU0NSSVBUSU9OX05BTUVdID0gYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKGVkaXRvciA9PiB7XG4gICAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICAgIC8vIFRPRE86IG9ic2VydmUgZm9yIHdoZW4gdGhpcyBlZGl0b3IncyBwYXRoIGNoYW5nZXMuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5faXNQYXRoUmVsZXZhbnQoZmlsZVBhdGgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIElmIHRoaXMgZWRpdG9yIGhhcyBiZWVuIHByZXZpb3VzbHkgYWN0aXZlLCB3ZSB3aWxsIGhhdmUgYWxyZWFkeVxuICAgICAgLy8gaW5pdGlhbGl6ZWQgZGlmZiBpbmZvIGFuZCByZWdpc3RlcmVkIGxpc3RlbmVycyBvbiBpdC5cbiAgICAgIGlmICh0aGlzLl9kaXNwb3NhYmxlc1tmaWxlUGF0aF0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gVE9ETyAodDgyMjc1NzApIEdldCBpbml0aWFsIGRpZmYgc3RhdHMgZm9yIHRoaXMgZWRpdG9yLCBhbmQgcmVmcmVzaFxuICAgICAgLy8gdGhpcyBpbmZvcm1hdGlvbiB3aGVuZXZlciB0aGUgY29udGVudCBvZiB0aGUgZWRpdG9yIGNoYW5nZXMuXG4gICAgICBjb25zdCBlZGl0b3JTdWJzY3JpcHRpb25zID0gdGhpcy5fZGlzcG9zYWJsZXNbZmlsZVBhdGhdID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5vbkRpZFNhdmUoZXZlbnQgPT4ge1xuICAgICAgICB0aGlzLl91cGRhdGVEaWZmSW5mbyhbZXZlbnQucGF0aF0pO1xuICAgICAgfSkpO1xuICAgICAgLy8gUmVtb3ZlIHRoZSBmaWxlIGZyb20gdGhlIGRpZmYgc3RhdHMgY2FjaGUgd2hlbiB0aGUgZWRpdG9yIGlzIGNsb3NlZC5cbiAgICAgIC8vIFRoaXMgaXNuJ3Qgc3RyaWN0bHkgbmVjZXNzYXJ5LCBidXQga2VlcHMgdGhlIGNhY2hlIGFzIHNtYWxsIGFzIHBvc3NpYmxlLlxuICAgICAgLy8gVGhlcmUgYXJlIGNhc2VzIHdoZXJlIHRoaXMgcmVtb3ZhbCBtYXkgcmVzdWx0IGluIHJlbW92aW5nIGluZm9ybWF0aW9uXG4gICAgICAvLyB0aGF0IGlzIHN0aWxsIHJlbGV2YW50OiBlLmcuXG4gICAgICAvLyAgICogaWYgdGhlIHVzZXIgdmVyeSBxdWlja2x5IGNsb3NlcyBhbmQgcmVvcGVucyBhIGZpbGU7IG9yXG4gICAgICAvLyAgICogaWYgdGhlIGZpbGUgaXMgb3BlbiBpbiBtdWx0aXBsZSBlZGl0b3JzLCBhbmQgb25lIG9mIHRob3NlIGlzIGNsb3NlZC5cbiAgICAgIC8vIFRoZXNlIGFyZSBwcm9iYWJseSBlZGdlIGNhc2VzLCB0aG91Z2gsIGFuZCB0aGUgaW5mb3JtYXRpb24gd2lsbCBiZVxuICAgICAgLy8gcmVmZXRjaGVkIHRoZSBuZXh0IHRpbWUgdGhlIGZpbGUgaXMgZWRpdGVkLlxuICAgICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNUb0NsZWFyLmFkZChmaWxlUGF0aCk7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzW2ZpbGVQYXRoXS5kaXNwb3NlKCk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9kaXNwb3NhYmxlc1tmaWxlUGF0aF07XG4gICAgICB9KSk7XG4gICAgfSk7XG5cbiAgICAvLyBHZXQgdXBkYXRlcyB0aGF0IHRlbGwgdGhlIEhnUmVwb3NpdG9yeUNsaWVudCB3aGVuIHRvIGNsZWFyIGl0cyBjYWNoZXMuXG4gICAgdGhpcy5fc2VydmljZS5vYnNlcnZlRmlsZXNEaWRDaGFuZ2UoKS5zdWJzY3JpYmUodGhpcy5fZmlsZXNEaWRDaGFuZ2UuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fc2VydmljZS5vYnNlcnZlSGdJZ25vcmVGaWxlRGlkQ2hhbmdlKClcbiAgICAgIC5zdWJzY3JpYmUodGhpcy5fcmVmcmVzaFN0YXR1c2VzT2ZBbGxGaWxlc0luQ2FjaGUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fc2VydmljZS5vYnNlcnZlSGdSZXBvU3RhdGVEaWRDaGFuZ2UoKVxuICAgICAgLnN1YnNjcmliZSh0aGlzLl9yZWZyZXNoU3RhdHVzZXNPZkFsbEZpbGVzSW5DYWNoZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVIZ0Jvb2ttYXJrRGlkQ2hhbmdlKClcbiAgICAgIC5zdWJzY3JpYmUodGhpcy5mZXRjaEN1cnJlbnRCb29rbWFyay5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuX2lzUmVmcmVzaGluZ0FsbEZpbGVzSW5DYWNoZSA9IGZhbHNlO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95Jyk7XG4gICAgdGhpcy5fZW1pdHRlci5kaXNwb3NlKCk7XG4gICAgT2JqZWN0LmtleXModGhpcy5fZGlzcG9zYWJsZXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXNba2V5XS5kaXNwb3NlKCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VydmljZS5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogRXZlbnQgU3Vic2NyaXB0aW9uXG4gICAqXG4gICAqL1xuXG4gIG9uRGlkRGVzdHJveShjYWxsYmFjazogKCkgPT4ge30pOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChldmVudDoge3BhdGg6IHN0cmluZzsgcGF0aFN0YXR1czogU3RhdHVzQ29kZU51bWJlclZhbHVlfSkgPT4ge31cbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXN0YXR1cycsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlU3RhdHVzZXMoY2FsbGJhY2s6ICgpID0+IHt9KTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXN0YXR1c2VzJywgY2FsbGJhY2spO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmVwb3NpdG9yeSBEZXRhaWxzXG4gICAqXG4gICAqL1xuXG4gIGdldFR5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ2hnJztcbiAgfVxuXG4gIGdldFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcGF0aDtcbiAgfVxuXG4gIGdldFdvcmtpbmdEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fd29ya2luZ0RpcmVjdG9yeS5nZXRQYXRoKCk7XG4gIH1cblxuICAvLyBAcmV0dXJuIFRoZSBwYXRoIG9mIHRoZSByb290IHByb2plY3QgZm9sZGVyIGluIEF0b20gdGhhdCB0aGlzXG4gIC8vIEhnUmVwb3NpdG9yeUNsaWVudCBwcm92aWRlcyBpbmZvcm1hdGlvbiBhYm91dC5cbiAgZ2V0UHJvamVjdERpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9wcm9qZWN0RGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGlzUHJvamVjdEF0Um9vdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJlbGF0aXZpemUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl93b3JraW5nRGlyZWN0b3J5LnJlbGF0aXZpemUoZmlsZVBhdGgpO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgaGFzQnJhbmNoKGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gVGhlIGN1cnJlbnQgSGcgYm9va21hcmsuXG4gICAqL1xuICBnZXRTaG9ydEhlYWQoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5fY3VycmVudEJvb2ttYXJrKSB7XG4gICAgICAvLyBLaWNrIG9mZiBhIGZldGNoIHRvIGdldCB0aGUgY3VycmVudCBib29rbWFyay4gVGhpcyBpcyBhc3luYy5cbiAgICAgIHRoaXMuZmV0Y2hDdXJyZW50Qm9va21hcmsoKTtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRCb29rbWFyaztcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGlzU3VibW9kdWxlKHBhdGg6IE51Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBnZXRBaGVhZEJlaGluZENvdW50KHJlZmVyZW5jZTogc3RyaW5nLCBwYXRoOiBOdWNsaWRlVXJpKTogbnVtYmVyIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldENhY2hlZFVwc3RyZWFtQWhlYWRCZWhpbmRDb3VudChwYXRoOiA/TnVjbGlkZVVyaSk6IHthaGVhZDogbnVtYmVyOyBiZWhpbmQ6IG51bWJlcjt9IHtcbiAgICByZXR1cm4ge1xuICAgICAgYWhlYWQ6IDAsXG4gICAgICBiZWhpbmQ6IDAsXG4gICAgfTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldENvbmZpZ1ZhbHVlKGtleTogc3RyaW5nLCBwYXRoOiA/c3RyaW5nKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRPcmlnaW5VUkwocGF0aDogP3N0cmluZyk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9vcmlnaW5VUkw7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBnZXRVcHN0cmVhbUJyYW5jaChwYXRoOiA/c3RyaW5nKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBnZXRSZWZlcmVuY2VzKFxuICAgIHBhdGg6ID9OdWNsaWRlVXJpLFxuICApOiB7aGVhZHM6IEFycmF5PHN0cmluZz47IHJlbW90ZXM6IEFycmF5PHN0cmluZz47IHRhZ3M6IEFycmF5PHN0cmluZz47fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhlYWRzOiBbXSxcbiAgICAgIHJlbW90ZXM6IFtdLFxuICAgICAgdGFnczogW10sXG4gICAgfTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldFJlZmVyZW5jZVRhcmdldChyZWZlcmVuY2U6IHN0cmluZywgcGF0aDogP051Y2xpZGVVcmkpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJlYWRpbmcgU3RhdHVzIChwYXJpdHkgd2l0aCBHaXRSZXBvc2l0b3J5KVxuICAgKlxuICAgKi9cblxuICAvLyBUT0RPIChqZXNzaWNhbGluKSBDYW4gd2UgY2hhbmdlIHRoZSBBUEkgdG8gbWFrZSB0aGlzIG1ldGhvZCByZXR1cm4gYSBQcm9taXNlP1xuICAvLyBJZiBub3QsIG1pZ2h0IG5lZWQgdG8gZG8gYSBzeW5jaHJvbm91cyBgaGcgc3RhdHVzYCBxdWVyeS5cbiAgaXNQYXRoTW9kaWZpZWQoZmlsZVBhdGg6ID9OdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZWRQYXRoU3RhdHVzID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgaWYgKCFjYWNoZWRQYXRoU3RhdHVzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmlzU3RhdHVzTW9kaWZpZWQoU3RhdHVzQ29kZUlkVG9OdW1iZXJbY2FjaGVkUGF0aFN0YXR1c10pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIENhbiB3ZSBjaGFuZ2UgdGhlIEFQSSB0byBtYWtlIHRoaXMgbWV0aG9kIHJldHVybiBhIFByb21pc2U/XG4gIC8vIElmIG5vdCwgbWlnaHQgbmVlZCB0byBkbyBhIHN5bmNocm9ub3VzIGBoZyBzdGF0dXNgIHF1ZXJ5LlxuICBpc1BhdGhOZXcoZmlsZVBhdGg6ID9OdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZWRQYXRoU3RhdHVzID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgaWYgKCFjYWNoZWRQYXRoU3RhdHVzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmlzU3RhdHVzTmV3KFN0YXR1c0NvZGVJZFRvTnVtYmVyW2NhY2hlZFBhdGhTdGF0dXNdKTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPIChqZXNzaWNhbGluKSBDYW4gd2UgY2hhbmdlIHRoZSBBUEkgdG8gbWFrZSB0aGlzIG1ldGhvZCByZXR1cm4gYSBQcm9taXNlP1xuICAvLyBJZiBub3QsIHRoaXMgbWV0aG9kIGxpZXMgYSBiaXQgYnkgdXNpbmcgY2FjaGVkIGluZm9ybWF0aW9uLlxuICAvLyBUT0RPIChqZXNzaWNhbGluKSBNYWtlIHRoaXMgd29yayBmb3IgaWdub3JlZCBkaXJlY3Rvcmllcy5cbiAgaXNQYXRoSWdub3JlZChmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIGBoZyBzdGF0dXMgLWlgIGRvZXMgbm90IGxpc3QgdGhlIHJlcG8gKHRoZSAuaGcgZGlyZWN0b3J5KSwgcHJlc3VtYWJseVxuICAgIC8vIGJlY2F1c2UgdGhlIHJlcG8gZG9lcyBub3QgdHJhY2sgaXRzZWxmLlxuICAgIC8vIFdlIHdhbnQgdG8gcmVwcmVzZW50IHRoZSBmYWN0IHRoYXQgaXQncyBub3QgcGFydCBvZiB0aGUgdHJhY2tlZCBjb250ZW50cyxcbiAgICAvLyBzbyB3ZSBtYW51YWxseSBhZGQgYW4gZXhjZXB0aW9uIGZvciBpdCB2aWEgdGhlIF9pc1BhdGhXaXRoaW5IZ1JlcG8gY2hlY2suXG4gICAgcmV0dXJuICh0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXSA9PT0gU3RhdHVzQ29kZUlkLklHTk9SRUQpIHx8XG4gICAgICAgIHRoaXMuX2lzUGF0aFdpdGhpbkhnUmVwbyhmaWxlUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBwYXRoIGlzIHdpdGhpbiB0aGUgcmVwbyBkaXJlY3RvcnkgKGkuZS4gYC5oZy9gKS5cbiAgICovXG4gIF9pc1BhdGhXaXRoaW5IZ1JlcG8oZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKGZpbGVQYXRoID09PSB0aGlzLmdldFBhdGgoKSkgfHwgKGZpbGVQYXRoLmluZGV4T2YodGhpcy5nZXRQYXRoKCkgKyAnLycpID09PSAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciBhIHBhdGggaXMgcmVsZXZhbnQgdG8gdGhpcyBIZ1JlcG9zaXRvcnlDbGllbnQuIEEgcGF0aCBpc1xuICAgKiBkZWZpbmVkIGFzICdyZWxldmFudCcgaWYgaXQgaXMgd2l0aGluIHRoZSBwcm9qZWN0IGRpcmVjdG9yeSBvcGVuZWQgd2l0aGluIHRoZSByZXBvLlxuICAgKi9cbiAgX2lzUGF0aFJlbGV2YW50KGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2plY3REaXJlY3RvcnkuY29udGFpbnMoZmlsZVBhdGgpIHx8XG4gICAgICAgICAgICh0aGlzLl9wcm9qZWN0RGlyZWN0b3J5LmdldFBhdGgoKSA9PT0gZmlsZVBhdGgpO1xuICB9XG5cbiAgLy8gRm9yIG5vdywgdGhpcyBtZXRob2Qgb25seSByZWZsZWN0cyB0aGUgc3RhdHVzIG9mIFwibW9kaWZpZWRcIiBkaXJlY3Rvcmllcy5cbiAgLy8gVHJhY2tpbmcgZGlyZWN0b3J5IHN0YXR1cyBpc24ndCBzdHJhaWdodGZvcndhcmQsIGFzIEhnIG9ubHkgdHJhY2tzIGZpbGVzLlxuICAvLyBodHRwOi8vbWVyY3VyaWFsLnNlbGVuaWMuY29tL3dpa2kvRkFRI0ZBUS4yRkNvbW1vblByb2JsZW1zLklfdHJpZWRfdG9fY2hlY2tfaW5fYW5fZW1wdHlfZGlyZWN0b3J5X2FuZF9pdF9mYWlsZWQuMjFcbiAgLy8gVE9ETzogTWFrZSB0aGlzIG1ldGhvZCByZWZsZWN0IE5ldyBhbmQgSWdub3JlZCBzdGF0dXNlcy5cbiAgZ2V0RGlyZWN0b3J5U3RhdHVzKGRpcmVjdG9yeVBhdGg6ID9zdHJpbmcpOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWUge1xuICAgIGlmICghZGlyZWN0b3J5UGF0aCkge1xuICAgICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU47XG4gICAgfVxuICAgIGNvbnN0IGRpcmVjdG9yeVBhdGhXaXRoU2VwYXJhdG9yID0gZW5zdXJlVHJhaWxpbmdTZXBhcmF0b3IoZGlyZWN0b3J5UGF0aCk7XG4gICAgaWYgKHRoaXMuX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGUuaGFzKGRpcmVjdG9yeVBhdGhXaXRoU2VwYXJhdG9yKSkge1xuICAgICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQ7XG4gICAgfVxuICAgIHJldHVybiBTdGF0dXNDb2RlTnVtYmVyLkNMRUFOO1xuICB9XG5cbiAgLy8gV2UgZG9uJ3Qgd2FudCB0byBkbyBhbnkgc3luY2hyb25vdXMgJ2hnIHN0YXR1cycgY2FsbHMuIEp1c3QgdXNlIGNhY2hlZCB2YWx1ZXMuXG4gIGdldFBhdGhTdGF0dXMoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWUge1xuICAgIHJldHVybiB0aGlzLmdldENhY2hlZFBhdGhTdGF0dXMoZmlsZVBhdGgpO1xuICB9XG5cbiAgZ2V0Q2FjaGVkUGF0aFN0YXR1cyhmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWUge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBTdGF0dXNDb2RlTnVtYmVyLkNMRUFOO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZWRTdGF0dXMgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoY2FjaGVkU3RhdHVzKSB7XG4gICAgICByZXR1cm4gU3RhdHVzQ29kZUlkVG9OdW1iZXJbY2FjaGVkU3RhdHVzXTtcbiAgICB9XG4gICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU47XG4gIH1cblxuICBnZXRBbGxQYXRoU3RhdHVzZXMoKToge1tmaWxlUGF0aDogTnVjbGlkZVVyaV06IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZX0ge1xuICAgIGNvbnN0IHBhdGhTdGF0dXNlcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBpbiB0aGlzLl9oZ1N0YXR1c0NhY2hlKSB7XG4gICAgICBwYXRoU3RhdHVzZXNbZmlsZVBhdGhdID0gU3RhdHVzQ29kZUlkVG9OdW1iZXJbdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF1dO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aFN0YXR1c2VzO1xuICB9XG5cbiAgaXNTdGF0dXNNb2RpZmllZChzdGF0dXM6ID9udW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEIHx8XG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuTUlTU0lORyB8fFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLlJFTU9WRURcbiAgICApO1xuICB9XG5cbiAgaXNTdGF0dXNOZXcoc3RhdHVzOiA/bnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHN0YXR1cyA9PT0gU3RhdHVzQ29kZU51bWJlci5BRERFRCB8fFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLlVOVFJBQ0tFRFxuICAgICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZWFkaW5nIEhnIFN0YXR1cyAoYXN5bmMgbWV0aG9kcylcbiAgICpcbiAgICovXG5cbiAgLyoqXG4gICAqIFJlY29tbWVuZGVkIG1ldGhvZCB0byB1c2UgdG8gZ2V0IHRoZSBzdGF0dXMgb2YgZmlsZXMgaW4gdGhpcyByZXBvLlxuICAgKiBAcGFyYW0gcGF0aHMgQW4gYXJyYXkgb2YgZmlsZSBwYXRocyB0byBnZXQgdGhlIHN0YXR1cyBmb3IuIElmIGEgcGF0aCBpcyBub3QgaW4gdGhlXG4gICAqICAgcHJvamVjdCwgaXQgd2lsbCBiZSBpZ25vcmVkLlxuICAgKiBTZWUgSGdTZXJ2aWNlOjpnZXRTdGF0dXNlcyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIGFzeW5jIGdldFN0YXR1c2VzKFxuICAgIHBhdGhzOiBBcnJheTxzdHJpbmc+LFxuICAgIG9wdGlvbnM/OiBIZ1N0YXR1c0NvbW1hbmRPcHRpb25zLFxuICApOiBQcm9taXNlPE1hcDxOdWNsaWRlVXJpLCBTdGF0dXNDb2RlTnVtYmVyVmFsdWU+PiB7XG4gICAgY29uc3Qgc3RhdHVzTWFwID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IGlzUmVsYXZhbnRTdGF0dXMgPSB0aGlzLl9nZXRQcmVkaWNhdGVGb3JSZWxldmFudFN0YXR1c2VzKG9wdGlvbnMpO1xuXG4gICAgLy8gQ2hlY2sgdGhlIGNhY2hlLlxuICAgIC8vIE5vdGU6IElmIHBhdGhzIGlzIGVtcHR5LCBhIGZ1bGwgYGhnIHN0YXR1c2Agd2lsbCBiZSBydW4sIHdoaWNoIGZvbGxvd3MgdGhlIHNwZWMuXG4gICAgY29uc3QgcGF0aHNXaXRoQ2FjaGVNaXNzID0gW107XG4gICAgcGF0aHMuZm9yRWFjaCgoZmlsZVBhdGgpID0+IHtcbiAgICAgIGNvbnN0IHN0YXR1c0lkID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICBpZiAoc3RhdHVzSWQpIHtcbiAgICAgICAgaWYgKCFpc1JlbGF2YW50U3RhdHVzKHN0YXR1c0lkKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzdGF0dXNNYXAuc2V0KGZpbGVQYXRoLCBTdGF0dXNDb2RlSWRUb051bWJlcltzdGF0dXNJZF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGF0aHNXaXRoQ2FjaGVNaXNzLnB1c2goZmlsZVBhdGgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gRmV0Y2ggYW55IHVuY2FjaGVkIHN0YXR1c2VzLlxuICAgIGlmIChwYXRoc1dpdGhDYWNoZU1pc3MubGVuZ3RoKSB7XG4gICAgICBjb25zdCBuZXdTdGF0dXNJbmZvID0gYXdhaXQgdGhpcy5fdXBkYXRlU3RhdHVzZXMocGF0aHNXaXRoQ2FjaGVNaXNzLCBvcHRpb25zKTtcbiAgICAgIG5ld1N0YXR1c0luZm8uZm9yRWFjaCgoc3RhdHVzLCBmaWxlUGF0aCkgPT4ge1xuICAgICAgICBzdGF0dXNNYXAuc2V0KGZpbGVQYXRoLCBTdGF0dXNDb2RlSWRUb051bWJlcltzdGF0dXNdKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdHVzTWFwO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIHN0YXR1c2VzIGZvciB0aGUgZ2l2ZW4gZmlsZSBwYXRocywgYW5kIHVwZGF0ZXMgdGhlIGNhY2hlIGFuZFxuICAgKiBzZW5kcyBvdXQgY2hhbmdlIGV2ZW50cyBhcyBhcHByb3ByaWF0ZS5cbiAgICogQHBhcmFtIGZpbGVQYXRocyBBbiBhcnJheSBvZiBmaWxlIHBhdGhzIHRvIHVwZGF0ZSB0aGUgc3RhdHVzIGZvci4gSWYgYSBwYXRoXG4gICAqICAgaXMgbm90IGluIHRoZSBwcm9qZWN0LCBpdCB3aWxsIGJlIGlnbm9yZWQuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlU3RhdHVzZXMoXG4gICAgZmlsZVBhdGhzOiBBcnJheTxzdHJpbmc+LFxuICAgIG9wdGlvbnM6ID9IZ1N0YXR1c0NvbW1hbmRPcHRpb25zLFxuICApOiBQcm9taXNlPE1hcDxOdWNsaWRlVXJpLCBTdGF0dXNDb2RlSWRWYWx1ZT4+IHtcbiAgICBjb25zdCBwYXRoc0luUmVwbyA9IGZpbGVQYXRocy5maWx0ZXIoKGZpbGVQYXRoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5faXNQYXRoUmVsZXZhbnQoZmlsZVBhdGgpO1xuICAgIH0pO1xuICAgIGlmIChwYXRoc0luUmVwby5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdHVzTWFwUGF0aFRvU3RhdHVzSWQgPSBhd2FpdCB0aGlzLl9zZXJ2aWNlLmZldGNoU3RhdHVzZXMocGF0aHNJblJlcG8sIG9wdGlvbnMpO1xuXG4gICAgY29uc3QgcXVlcmllZEZpbGVzID0gbmV3IFNldChwYXRoc0luUmVwbyk7XG4gICAgY29uc3Qgc3RhdHVzQ2hhbmdlRXZlbnRzID0gW107XG4gICAgc3RhdHVzTWFwUGF0aFRvU3RhdHVzSWQuZm9yRWFjaCgobmV3U3RhdHVzSWQsIGZpbGVQYXRoKSA9PiB7XG5cbiAgICAgIGNvbnN0IG9sZFN0YXR1cyA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgaWYgKG9sZFN0YXR1cyAmJiAob2xkU3RhdHVzICE9PSBuZXdTdGF0dXNJZCkgfHxcbiAgICAgICAgICAhb2xkU3RhdHVzICYmIChuZXdTdGF0dXNJZCAhPT0gU3RhdHVzQ29kZUlkLkNMRUFOKSkge1xuICAgICAgICBzdGF0dXNDaGFuZ2VFdmVudHMucHVzaCh7XG4gICAgICAgICAgcGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgcGF0aFN0YXR1czogU3RhdHVzQ29kZUlkVG9OdW1iZXJbbmV3U3RhdHVzSWRdLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG5ld1N0YXR1c0lkID09PSBTdGF0dXNDb2RlSWQuQ0xFQU4pIHtcbiAgICAgICAgICAvLyBEb24ndCBib3RoZXIga2VlcGluZyAnY2xlYW4nIGZpbGVzIGluIHRoZSBjYWNoZS5cbiAgICAgICAgICBkZWxldGUgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgICAgdGhpcy5fcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoZmlsZVBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdID0gbmV3U3RhdHVzSWQ7XG4gICAgICAgICAgaWYgKG5ld1N0YXR1c0lkID09PSBTdGF0dXNDb2RlSWQuTU9ESUZJRUQpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZEFsbFBhcmVudERpcmVjdG9yaWVzVG9DYWNoZShmaWxlUGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBxdWVyaWVkRmlsZXMuZGVsZXRlKGZpbGVQYXRoKTtcbiAgICB9KTtcblxuICAgIC8vIElmIHRoZSBzdGF0dXNlcyB3ZXJlIGZldGNoZWQgZm9yIG9ubHkgY2hhbmdlZCAoYGhnIHN0YXR1c2ApIG9yXG4gICAgLy8gaWdub3JlZCAoJ2hnIHN0YXR1cyAtLWlnbm9yZWRgKSBmaWxlcywgYSBxdWVyaWVkIGZpbGUgbWF5IG5vdCBiZVxuICAgIC8vIHJldHVybmVkIGluIHRoZSByZXNwb25zZS4gSWYgaXQgd2Fzbid0IHJldHVybmVkLCB0aGlzIG1lYW5zIGl0cyBzdGF0dXNcbiAgICAvLyBtYXkgaGF2ZSBjaGFuZ2VkLCBpbiB3aGljaCBjYXNlIGl0IHNob3VsZCBiZSByZW1vdmVkIGZyb20gdGhlIGhnU3RhdHVzQ2FjaGUuXG4gICAgLy8gTm90ZTogd2UgZG9uJ3Qga25vdyB0aGUgcmVhbCB1cGRhdGVkIHN0YXR1cyBvZiB0aGUgZmlsZSwgc28gZG9uJ3Qgc2VuZCBhIGNoYW5nZSBldmVudC5cbiAgICAvLyBUT0RPIChqZXNzaWNhbGluKSBDYW4gd2UgbWFrZSB0aGUgJ3BhdGhTdGF0dXMnIGZpZWxkIGluIHRoZSBjaGFuZ2UgZXZlbnQgb3B0aW9uYWw/XG4gICAgLy8gVGhlbiB3ZSBjYW4gc2VuZCB0aGVzZSBldmVudHMuXG4gICAgY29uc3QgaGFzT3B0aW9ucyA9IG9wdGlvbnMgJiYgKCdoZ1N0YXR1c09wdGlvbicgaW4gb3B0aW9ucyk7XG4gICAgaWYgKGhhc09wdGlvbnMgJiYgKG9wdGlvbnMuaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLk9OTFlfSUdOT1JFRCkpIHtcbiAgICAgIHF1ZXJpZWRGaWxlcy5mb3JFYWNoKChmaWxlUGF0aCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF0gPT09IFN0YXR1c0NvZGVJZC5JR05PUkVEKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGhhc09wdGlvbnMgJiYgKG9wdGlvbnMuaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLkFMTF9TVEFUVVNFUykpIHtcbiAgICAgIC8vIElmIEhnU3RhdHVzT3B0aW9uLkFMTF9TVEFUVVNFUyB3YXMgcGFzc2VkIGFuZCBhIGZpbGUgZG9lcyBub3QgYXBwZWFyIGluXG4gICAgICAvLyB0aGUgcmVzdWx0cywgaXQgbXVzdCBtZWFuIHRoZSBmaWxlIHdhcyByZW1vdmVkIGZyb20gdGhlIGZpbGVzeXN0ZW0uXG4gICAgICBxdWVyaWVkRmlsZXMuZm9yRWFjaCgoZmlsZVBhdGgpID0+IHtcbiAgICAgICAgY29uc3QgY2FjaGVkU3RhdHVzSWQgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICBpZiAoY2FjaGVkU3RhdHVzSWQgPT09IFN0YXR1c0NvZGVJZC5NT0RJRklFRCkge1xuICAgICAgICAgIHRoaXMuX3JlbW92ZUFsbFBhcmVudERpcmVjdG9yaWVzRnJvbUNhY2hlKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHF1ZXJpZWRGaWxlcy5mb3JFYWNoKChmaWxlUGF0aCkgPT4ge1xuICAgICAgICBjb25zdCBjYWNoZWRTdGF0dXNJZCA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICBpZiAoY2FjaGVkU3RhdHVzSWQgIT09IFN0YXR1c0NvZGVJZC5JR05PUkVEKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICAgIGlmIChjYWNoZWRTdGF0dXNJZCA9PT0gU3RhdHVzQ29kZUlkLk1PRElGSUVEKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZShmaWxlUGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBFbWl0IGNoYW5nZSBldmVudHMgb25seSBhZnRlciB0aGUgY2FjaGUgaGFzIGJlZW4gZnVsbHkgdXBkYXRlZC5cbiAgICBzdGF0dXNDaGFuZ2VFdmVudHMuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1zdGF0dXMnLCBldmVudCk7XG4gICAgfSk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXN0YXR1c2VzJyk7XG5cbiAgICByZXR1cm4gc3RhdHVzTWFwUGF0aFRvU3RhdHVzSWQ7XG4gIH1cblxuICBfYWRkQWxsUGFyZW50RGlyZWN0b3JpZXNUb0NhY2hlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKSB7XG4gICAgYWRkQWxsUGFyZW50RGlyZWN0b3JpZXNUb0NhY2hlKFxuICAgICAgdGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZSxcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgdGhpcy5fcHJvamVjdERpcmVjdG9yeS5nZXRQYXJlbnQoKS5nZXRQYXRoKClcbiAgICApO1xuICB9XG5cbiAgX3JlbW92ZUFsbFBhcmVudERpcmVjdG9yaWVzRnJvbUNhY2hlKGZpbGVQYXRoOiBOdWNsaWRlVXJpKSB7XG4gICAgcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoXG4gICAgICB0aGlzLl9tb2RpZmllZERpcmVjdG9yeUNhY2hlLFxuICAgICAgZmlsZVBhdGgsXG4gICAgICB0aGlzLl9wcm9qZWN0RGlyZWN0b3J5LmdldFBhcmVudCgpLmdldFBhdGgoKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIGZvciA6OmdldFN0YXR1c2VzLlxuICAgKiBSZXR1cm5zIGEgZmlsdGVyIGZvciB3aGV0aGVyIG9yIG5vdCB0aGUgZ2l2ZW4gc3RhdHVzIGNvZGUgc2hvdWxkIGJlXG4gICAqIHJldHVybmVkLCBnaXZlbiB0aGUgcGFzc2VkLWluIG9wdGlvbnMgZm9yIDo6Z2V0U3RhdHVzZXMuXG4gICAqL1xuICBfZ2V0UHJlZGljYXRlRm9yUmVsZXZhbnRTdGF0dXNlcyhcbiAgICBvcHRpb25zOiA/SGdTdGF0dXNDb21tYW5kT3B0aW9uc1xuICApOiAoY29kZTogU3RhdHVzQ29kZUlkVmFsdWUpID0+IGJvb2xlYW4ge1xuICAgIGNvbnN0IGhhc09wdGlvbnMgPSBvcHRpb25zICYmICgnaGdTdGF0dXNPcHRpb24nIGluIG9wdGlvbnMpO1xuXG4gICAgaWYgKGhhc09wdGlvbnMgJiYgKG9wdGlvbnMuaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLk9OTFlfSUdOT1JFRCkpIHtcbiAgICAgIHJldHVybiBmaWx0ZXJGb3JPbmx5SWdub3JlZDtcbiAgICB9IGVsc2UgaWYgKGhhc09wdGlvbnMgJiYgKG9wdGlvbnMuaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLkFMTF9TVEFUVVNFUykpIHtcbiAgICAgIHJldHVybiBmaWx0ZXJGb3JBbGxTdGF0dWVzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmlsdGVyRm9yT25seU5vdElnbm9yZWQ7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmV0cmlldmluZyBEaWZmcyAocGFyaXR5IHdpdGggR2l0UmVwb3NpdG9yeSlcbiAgICpcbiAgICovXG5cbiAgZ2V0RGlmZlN0YXRzKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IHthZGRlZDogbnVtYmVyOyBkZWxldGVkOiBudW1iZXI7fSB7XG4gICAgY29uc3QgY2xlYW5TdGF0cyA9IHthZGRlZDogMCwgZGVsZXRlZDogMH07XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGNsZWFuU3RhdHM7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZERhdGEgPSB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF07XG4gICAgcmV0dXJuIGNhY2hlZERhdGEgPyB7YWRkZWQ6IGNhY2hlZERhdGEuYWRkZWQsIGRlbGV0ZWQ6IGNhY2hlZERhdGEuZGVsZXRlZH0gOlxuICAgICAgICBjbGVhblN0YXRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgTGluZURpZmYgdGhhdCBkZXNjcmliZXMgdGhlIGRpZmZzIGJldHdlZW4gdGhlIGdpdmVuXG4gICAqIGZpbGUncyBgSEVBRGAgY29udGVudHMgYW5kIGl0cyBjdXJyZW50IGNvbnRlbnRzLlxuICAgKiBOT1RFOiB0aGlzIG1ldGhvZCBjdXJyZW50bHkgaWdub3JlcyB0aGUgcGFzc2VkLWluIHRleHQsIGFuZCBpbnN0ZWFkIGRpZmZzXG4gICAqIGFnYWluc3QgdGhlIGN1cnJlbnRseSBzYXZlZCBjb250ZW50cyBvZiB0aGUgZmlsZS5cbiAgICovXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIEV4cG9ydCB0aGUgTGluZURpZmYgdHlwZSAoZnJvbSBoZy1vdXRwdXQtaGVscGVycykgd2hlblxuICAvLyB0eXBlcyBjYW4gYmUgZXhwb3J0ZWQuXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIE1ha2UgdGhpcyBtZXRob2Qgd29yayB3aXRoIHRoZSBwYXNzZWQtaW4gYHRleHRgLiB0NjM5MTU3OVxuICBnZXRMaW5lRGlmZnMoZmlsZVBhdGg6ID9OdWNsaWRlVXJpLCB0ZXh0OiA/c3RyaW5nKTogQXJyYXk8TGluZURpZmY+IHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGRpZmZJbmZvID0gdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdO1xuICAgIHJldHVybiBkaWZmSW5mbyA/IGRpZmZJbmZvLmxpbmVEaWZmcyA6IFtdO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmV0cmlldmluZyBEaWZmcyAoYXN5bmMgbWV0aG9kcylcbiAgICpcbiAgICovXG5cbiAgLyoqXG4gICAqIFJlY29tbWVuZGVkIG1ldGhvZCB0byB1c2UgdG8gZ2V0IHRoZSBkaWZmIHN0YXRzIG9mIGZpbGVzIGluIHRoaXMgcmVwby5cbiAgICogQHBhcmFtIHBhdGggVGhlIGZpbGUgcGF0aCB0byBnZXQgdGhlIHN0YXR1cyBmb3IuIElmIGEgcGF0aCBpcyBub3QgaW4gdGhlXG4gICAqICAgcHJvamVjdCwgZGVmYXVsdCBcImNsZWFuXCIgc3RhdHMgd2lsbCBiZSByZXR1cm5lZC5cbiAgICovXG4gIGFzeW5jIGdldERpZmZTdGF0c0ZvclBhdGgoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHthZGRlZDogbnVtYmVyOyBkZWxldGVkOiBudW1iZXI7fT4ge1xuICAgIGNvbnN0IGNsZWFuU3RhdHMgPSB7YWRkZWQ6IDAsIGRlbGV0ZWQ6IDB9O1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBjbGVhblN0YXRzO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRoZSBjYWNoZS5cbiAgICBjb25zdCBjYWNoZWREaWZmSW5mbyA9IHRoaXMuX2hnRGlmZkNhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoY2FjaGVkRGlmZkluZm8pIHtcbiAgICAgIHJldHVybiB7YWRkZWQ6IGNhY2hlZERpZmZJbmZvLmFkZGVkLCBkZWxldGVkOiBjYWNoZWREaWZmSW5mby5kZWxldGVkfTtcbiAgICB9XG5cbiAgICAvLyBGYWxsIGJhY2sgdG8gYSBmZXRjaC5cbiAgICBjb25zdCBmZXRjaGVkUGF0aFRvRGlmZkluZm8gPSBhd2FpdCB0aGlzLl91cGRhdGVEaWZmSW5mbyhbZmlsZVBhdGhdKTtcbiAgICBpZiAoZmV0Y2hlZFBhdGhUb0RpZmZJbmZvKSB7XG4gICAgICBjb25zdCBkaWZmSW5mbyA9IGZldGNoZWRQYXRoVG9EaWZmSW5mby5nZXQoZmlsZVBhdGgpO1xuICAgICAgaWYgKGRpZmZJbmZvICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHthZGRlZDogZGlmZkluZm8uYWRkZWQsIGRlbGV0ZWQ6IGRpZmZJbmZvLmRlbGV0ZWR9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjbGVhblN0YXRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY29tbWVuZGVkIG1ldGhvZCB0byB1c2UgdG8gZ2V0IHRoZSBsaW5lIGRpZmZzIG9mIGZpbGVzIGluIHRoaXMgcmVwby5cbiAgICogQHBhcmFtIHBhdGggVGhlIGFic29sdXRlIGZpbGUgcGF0aCB0byBnZXQgdGhlIGxpbmUgZGlmZnMgZm9yLiBJZiB0aGUgcGF0aCBcXFxuICAgKiAgIGlzIG5vdCBpbiB0aGUgcHJvamVjdCwgYW4gZW1wdHkgQXJyYXkgd2lsbCBiZSByZXR1cm5lZC5cbiAgICovXG4gIGFzeW5jIGdldExpbmVEaWZmc0ZvclBhdGgoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPEFycmF5PExpbmVEaWZmPj4ge1xuICAgIGNvbnN0IGxpbmVEaWZmcyA9IFtdO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBsaW5lRGlmZnM7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIGNhY2hlLlxuICAgIGNvbnN0IGNhY2hlZERpZmZJbmZvID0gdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmIChjYWNoZWREaWZmSW5mbykge1xuICAgICAgcmV0dXJuIGNhY2hlZERpZmZJbmZvLmxpbmVEaWZmcztcbiAgICB9XG5cbiAgICAvLyBGYWxsIGJhY2sgdG8gYSBmZXRjaC5cbiAgICBjb25zdCBmZXRjaGVkUGF0aFRvRGlmZkluZm8gPSBhd2FpdCB0aGlzLl91cGRhdGVEaWZmSW5mbyhbZmlsZVBhdGhdKTtcbiAgICBpZiAoZmV0Y2hlZFBhdGhUb0RpZmZJbmZvICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGRpZmZJbmZvID0gZmV0Y2hlZFBhdGhUb0RpZmZJbmZvLmdldChmaWxlUGF0aCk7XG4gICAgICBpZiAoZGlmZkluZm8gIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZGlmZkluZm8ubGluZURpZmZzO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaW5lRGlmZnM7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgZGlmZiBpbmZvcm1hdGlvbiBmb3IgdGhlIGdpdmVuIHBhdGhzLCBhbmQgdXBkYXRlcyB0aGUgY2FjaGUuXG4gICAqIEBwYXJhbSBBbiBhcnJheSBvZiBhYnNvbHV0ZSBmaWxlIHBhdGhzIGZvciB3aGljaCB0byB1cGRhdGUgdGhlIGRpZmYgaW5mby5cbiAgICogQHJldHVybiBBIG1hcCBvZiBlYWNoIHBhdGggdG8gaXRzIERpZmZJbmZvLlxuICAgKiAgIFRoaXMgbWV0aG9kIG1heSByZXR1cm4gYG51bGxgIGlmIHRoZSBjYWxsIHRvIGBoZyBkaWZmYCBmYWlscy5cbiAgICogICBBIGZpbGUgcGF0aCB3aWxsIG5vdCBhcHBlYXIgaW4gdGhlIHJldHVybmVkIE1hcCBpZiBpdCBpcyBub3QgaW4gdGhlIHJlcG8sXG4gICAqICAgaWYgaXQgaGFzIG5vIGNoYW5nZXMsIG9yIGlmIHRoZXJlIGlzIGEgcGVuZGluZyBgaGcgZGlmZmAgY2FsbCBmb3IgaXQgYWxyZWFkeS5cbiAgICovXG4gIGFzeW5jIF91cGRhdGVEaWZmSW5mbyhmaWxlUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+KTogUHJvbWlzZTw/TWFwPE51Y2xpZGVVcmksIERpZmZJbmZvPj4ge1xuICAgIGNvbnN0IHBhdGhzVG9GZXRjaCA9IGZpbGVQYXRocy5maWx0ZXIoKGFQYXRoKSA9PiB7XG4gICAgICAvLyBEb24ndCB0cnkgdG8gZmV0Y2ggaW5mb3JtYXRpb24gZm9yIHRoaXMgcGF0aCBpZiBpdCdzIG5vdCBpbiB0aGUgcmVwby5cbiAgICAgIGlmICghdGhpcy5faXNQYXRoUmVsZXZhbnQoYVBhdGgpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIERvbid0IGRvIGFub3RoZXIgdXBkYXRlIGZvciB0aGlzIHBhdGggaWYgd2UgYXJlIGluIHRoZSBtaWRkbGUgb2YgcnVubmluZyBhbiB1cGRhdGUuXG4gICAgICBpZiAodGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nLmhhcyhhUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nLmFkZChhUGF0aCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHBhdGhzVG9GZXRjaC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgLy8gQ2FsbCB0aGUgSGdTZXJ2aWNlIGFuZCB1cGRhdGUgb3VyIGNhY2hlIHdpdGggdGhlIHJlc3VsdHMuXG4gICAgY29uc3QgcGF0aHNUb0RpZmZJbmZvID0gYXdhaXQgdGhpcy5fc2VydmljZS5mZXRjaERpZmZJbmZvKHBhdGhzVG9GZXRjaCk7XG4gICAgaWYgKHBhdGhzVG9EaWZmSW5mbykge1xuICAgICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIGRpZmZJbmZvXSBvZiBwYXRoc1RvRGlmZkluZm8pIHtcbiAgICAgICAgdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdID0gZGlmZkluZm87XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGZpbGVzIG1hcmtlZCBmb3IgZGVsZXRpb24uXG4gICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXIuZm9yRWFjaCgoZmlsZVRvQ2xlYXIpID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlVG9DbGVhcl07XG4gICAgfSk7XG4gICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXIuY2xlYXIoKTtcblxuICAgIC8vIFRoZSBmZXRjaGVkIGZpbGVzIGNhbiBub3cgYmUgdXBkYXRlZCBhZ2Fpbi5cbiAgICBmb3IgKGNvbnN0IHBhdGhUb0ZldGNoIG9mIHBhdGhzVG9GZXRjaCkge1xuICAgICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nLmRlbGV0ZShwYXRoVG9GZXRjaCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyAodDkxMTM5MTMpIElkZWFsbHksIHdlIGNvdWxkIHNlbmQgbW9yZSB0YXJnZXRlZCBldmVudHMgdGhhdCBiZXR0ZXJcbiAgICAvLyBkZXNjcmliZSB3aGF0IGNoYW5nZSBoYXMgb2NjdXJyZWQuIFJpZ2h0IG5vdywgR2l0UmVwb3NpdG9yeSBkaWN0YXRlcyBlaXRoZXJcbiAgICAvLyAnZGlkLWNoYW5nZS1zdGF0dXMnIG9yICdkaWQtY2hhbmdlLXN0YXR1c2VzJy5cbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnKTtcbiAgICByZXR1cm4gcGF0aHNUb0RpZmZJbmZvO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmV0cmlldmluZyBCb29rbWFyayAoYXN5bmMgbWV0aG9kcylcbiAgICpcbiAgICovXG4gIGFzeW5jIGZldGNoQ3VycmVudEJvb2ttYXJrKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IG5ld2x5RmV0Y2hlZEJvb2ttYXJrID0gJyc7XG4gICAgdHJ5IHtcbiAgICAgIG5ld2x5RmV0Y2hlZEJvb2ttYXJrID0gYXdhaXQgdGhpcy5fc2VydmljZS5mZXRjaEN1cnJlbnRCb29rbWFyaygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFN1cHByZXNzIHRoZSBlcnJvci4gVGhlcmUgYXJlIGxlZ2l0aW1hdGUgdGltZXMgd2hlbiB0aGVyZSBtYXkgYmUgbm9cbiAgICAgIC8vIGN1cnJlbnQgYm9va21hcmssIHN1Y2ggYXMgZHVyaW5nIGEgcmViYXNlLiBJbiB0aGlzIGNhc2UsIHdlIGp1c3Qgd2FudFxuICAgICAgLy8gdG8gcmV0dXJuIGFuIGVtcHR5IHN0cmluZyBpZiB0aGVyZSBpcyBubyBjdXJyZW50IGJvb2ttYXJrLlxuICAgIH1cbiAgICBpZiAobmV3bHlGZXRjaGVkQm9va21hcmsgIT09IHRoaXMuX2N1cnJlbnRCb29rbWFyaykge1xuICAgICAgdGhpcy5fY3VycmVudEJvb2ttYXJrID0gbmV3bHlGZXRjaGVkQm9va21hcms7XG4gICAgICAvLyBUaGUgQXRvbSBzdGF0dXMtYmFyIHVzZXMgdGhpcyBhcyBhIHNpZ25hbCB0byByZWZyZXNoIHRoZSAnc2hvcnRIZWFkJy5cbiAgICAgIC8vIFRoZXJlIGlzIGN1cnJlbnRseSBubyBkZWRpY2F0ZWQgJ3Nob3J0SGVhZERpZENoYW5nZScgZXZlbnQuXG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRCb29rbWFyayB8fCAnJztcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IENoZWNraW5nIE91dFxuICAgKlxuICAgKi9cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBjaGVja291dEhlYWQocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgY2hlY2tvdXRSZWZlcmVuY2UocmVmZXJlbmNlOiBzdHJpbmcsIGNyZWF0ZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHRoZSBhc3luYyB2ZXJzaW9uIG9mIHdoYXQgY2hlY2tvdXRSZWZlcmVuY2UoKSBpcyBtZWFudCB0byBkby5cbiAgICovXG4gIGFzeW5jIGNoZWNrb3V0UmV2aXNpb24ocmVmZXJlbmNlOiBzdHJpbmcsIGNyZWF0ZTogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLl9zZXJ2aWNlLmNoZWNrb3V0KHJlZmVyZW5jZSwgY3JlYXRlKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IEhnU2VydmljZSBzdWJzY3JpcHRpb25zXG4gICAqXG4gICAqL1xuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBjYWNoZSBpbiByZXNwb25zZSB0byBhbnkgbnVtYmVyIG9mIChub24tLmhnaWdub3JlKSBmaWxlcyBjaGFuZ2luZy5cbiAgICogQHBhcmFtIHVwZGF0ZSBUaGUgY2hhbmdlZCBmaWxlIHBhdGhzLlxuICAgKi9cbiAgX2ZpbGVzRGlkQ2hhbmdlKGNoYW5nZWRQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4pOiB2b2lkIHtcbiAgICBjb25zdCByZWxldmFudENoYW5nZWRQYXRocyA9IGNoYW5nZWRQYXRocy5maWx0ZXIodGhpcy5faXNQYXRoUmVsZXZhbnQuYmluZCh0aGlzKSk7XG4gICAgaWYgKHJlbGV2YW50Q2hhbmdlZFBhdGhzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAocmVsZXZhbnRDaGFuZ2VkUGF0aHMubGVuZ3RoIDw9IE1BWF9JTkRJVklEVUFMX0NIQU5HRURfUEFUSFMpIHtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgc3RhdHVzZXMgaW5kaXZpZHVhbGx5LlxuICAgICAgdGhpcy5fdXBkYXRlU3RhdHVzZXMocmVsZXZhbnRDaGFuZ2VkUGF0aHMsIHtoZ1N0YXR1c09wdGlvbjogSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTfSk7XG4gICAgICB0aGlzLl91cGRhdGVEaWZmSW5mbyhyZWxldmFudENoYW5nZWRQYXRocy5maWx0ZXIoZmlsZVBhdGggPT4gdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoaXMgaXMgYSBoZXVyaXN0aWMgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZS4gTWFueSBmaWxlcyBiZWluZyBjaGFuZ2VkIG1heVxuICAgICAgLy8gYmUgYSBzaWduIHRoYXQgd2UgYXJlIHBpY2tpbmcgdXAgY2hhbmdlcyB0aGF0IHdlcmUgY3JlYXRlZCBpbiBhbiBhdXRvbWF0ZWRcbiAgICAgIC8vIHdheSAtLSBzbyBpbiBhZGRpdGlvbiwgdGhlcmUgbWF5IGJlIG1hbnkgYmF0Y2hlcyBvZiBjaGFuZ2VzIGluIHN1Y2Nlc3Npb24uXG4gICAgICAvLyBfcmVmcmVzaFN0YXR1c2VzT2ZBbGxGaWxlc0luQ2FjaGUgZGVib3VuY2VzIGNhbGxzLCBzbyBpdCBpcyBzYWZlIHRvIGNhbGxcbiAgICAgIC8vIGl0IG11bHRpcGxlIHRpbWVzIGluIHN1Y2Nlc3Npb24uXG4gICAgICB0aGlzLl9yZWZyZXNoU3RhdHVzZXNPZkFsbEZpbGVzSW5DYWNoZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9yZWZyZXNoU3RhdHVzZXNPZkFsbEZpbGVzSW5DYWNoZSgpOiB2b2lkIHtcbiAgICBsZXQgZGVib3VuY2VkUmVmcmVzaEFsbCA9IHRoaXMuX2RlYm91bmNlZFJlZnJlc2hBbGw7XG4gICAgaWYgKGRlYm91bmNlZFJlZnJlc2hBbGwgPT0gbnVsbCkge1xuICAgICAgY29uc3QgZG9SZWZyZXNoID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5faXNSZWZyZXNoaW5nQWxsRmlsZXNJbkNhY2hlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lzUmVmcmVzaGluZ0FsbEZpbGVzSW5DYWNoZSA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgcGF0aHNJblN0YXR1c0NhY2hlID0gT2JqZWN0LmtleXModGhpcy5faGdTdGF0dXNDYWNoZSk7XG4gICAgICAgIHRoaXMuX2hnU3RhdHVzQ2FjaGUgPSB7fTtcbiAgICAgICAgdGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgLy8gV2Ugc2hvdWxkIGdldCB0aGUgbW9kaWZpZWQgc3RhdHVzIG9mIGFsbCBmaWxlcyBpbiB0aGUgcmVwbyB0aGF0IGlzXG4gICAgICAgIC8vIHVuZGVyIHRoZSBIZ1JlcG9zaXRvcnlDbGllbnQncyBwcm9qZWN0IGRpcmVjdG9yeSwgYmVjYXVzZSB3aGVuIEhnXG4gICAgICAgIC8vIG1vZGlmaWVzIHRoZSByZXBvLCBpdCBkb2Vzbid0IG5lY2Vzc2FyaWx5IG9ubHkgbW9kaWZ5IGZpbGVzIHRoYXQgd2VyZVxuICAgICAgICAvLyBwcmV2aW91c2x5IG1vZGlmaWVkLlxuICAgICAgICB0aGlzLl91cGRhdGVTdGF0dXNlcyhcbiAgICAgICAgICAgIFt0aGlzLmdldFByb2plY3REaXJlY3RvcnkoKV0sIHtoZ1N0YXR1c09wdGlvbjogSGdTdGF0dXNPcHRpb24uT05MWV9OT05fSUdOT1JFRH0pO1xuICAgICAgICBpZiAocGF0aHNJblN0YXR1c0NhY2hlLmxlbmd0aCkge1xuICAgICAgICAgIC8vIFRoZSBsb2dpYyBpcyBhIGJpdCBkaWZmZXJlbnQgZm9yIGlnbm9yZWQgZmlsZXMsIGJlY2F1c2UgdGhlXG4gICAgICAgICAgLy8gSGdSZXBvc2l0b3J5Q2xpZW50IGFsd2F5cyBmZXRjaGVzIGlnbm9yZWQgc3RhdHVzZXMgbGF6aWx5IChhcyBjYWxsZXJzXG4gICAgICAgICAgLy8gYXNrIGZvciB0aGVtKS4gU28sIHdlIG9ubHkgZmV0Y2ggdGhlIGlnbm9yZWQgc3RhdHVzIG9mIGZpbGVzIGFscmVhZHlcbiAgICAgICAgICAvLyBpbiB0aGUgY2FjaGUuIChOb3RlOiBpZiBJIGFzayBIZyBmb3IgdGhlICdpZ25vcmVkJyBzdGF0dXMgb2YgYSBsaXN0IG9mXG4gICAgICAgICAgLy8gZmlsZXMsIGFuZCBub25lIG9mIHRoZW0gYXJlIGlnbm9yZWQsIG5vIHN0YXR1c2VzIHdpbGwgYmUgcmV0dXJuZWQuKVxuICAgICAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZVN0YXR1c2VzKFxuICAgICAgICAgICAgICBwYXRoc0luU3RhdHVzQ2FjaGUsIHtoZ1N0YXR1c09wdGlvbjogSGdTdGF0dXNPcHRpb24uT05MWV9JR05PUkVEfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXRoc0luRGlmZkNhY2hlID0gT2JqZWN0LmtleXModGhpcy5faGdEaWZmQ2FjaGUpO1xuICAgICAgICB0aGlzLl9oZ0RpZmZDYWNoZSA9IHt9O1xuICAgICAgICBhd2FpdCB0aGlzLl91cGRhdGVEaWZmSW5mbyhwYXRoc0luRGlmZkNhY2hlKTtcblxuICAgICAgICB0aGlzLl9pc1JlZnJlc2hpbmdBbGxGaWxlc0luQ2FjaGUgPSBmYWxzZTtcbiAgICAgIH07XG4gICAgICB0aGlzLl9kZWJvdW5jZWRSZWZyZXNoQWxsID0gZGVib3VuY2UoXG4gICAgICAgIGRvUmVmcmVzaCxcbiAgICAgICAgREVCT1VOQ0VfTUlMTElTRUNPTkRTX0ZPUl9SRUZSRVNIX0FMTCxcbiAgICAgICAgLyogaW1tZWRpYXRlICovIGZhbHNlXG4gICAgICApO1xuICAgICAgZGVib3VuY2VkUmVmcmVzaEFsbCA9IHRoaXMuX2RlYm91bmNlZFJlZnJlc2hBbGw7XG4gICAgfVxuICAgIGRlYm91bmNlZFJlZnJlc2hBbGwoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJlcG9zaXRvcnkgU3RhdGUgYXQgU3BlY2lmaWMgUmV2aXNpb25zXG4gICAqXG4gICAqL1xuICBmZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aDogTnVjbGlkZVVyaSwgcmV2aXNpb246ID9zdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5mZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aCwgcmV2aXNpb24pO1xuICB9XG5cbiAgZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKHJldmlzaW9uOiBzdHJpbmcpOiBQcm9taXNlPD9SZXZpc2lvbkZpbGVDaGFuZ2VzPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKHJldmlzaW9uKTtcbiAgfVxuXG4gIGZldGNoUmV2aXNpb25JbmZvQmV0d2VlbkhlYWRBbmRCYXNlKCk6IFByb21pc2U8P0FycmF5PFJldmlzaW9uSW5mbz4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5mZXRjaFJldmlzaW9uSW5mb0JldHdlZW5IZWFkQW5kQmFzZSgpO1xuICB9XG5cbiAgLy8gU2VlIEhnU2VydmljZS5nZXRCbGFtZUF0SGVhZC5cbiAgZ2V0QmxhbWVBdEhlYWQoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPE1hcDxzdHJpbmcsIHN0cmluZz4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5nZXRCbGFtZUF0SGVhZChmaWxlUGF0aCk7XG4gIH1cblxuICAvLyBTZWUgSGdTZXJ2aWNlLmdldERpZmZlcmVudGlhbFJldmlzaW9uRm9yQ2hhbmdlU2V0SWQuXG4gIGdldERpZmZlcmVudGlhbFJldmlzaW9uRm9yQ2hhbmdlU2V0SWQoY2hhbmdlU2V0SWQ6IHN0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmdldERpZmZlcmVudGlhbFJldmlzaW9uRm9yQ2hhbmdlU2V0SWQoY2hhbmdlU2V0SWQpO1xuICB9XG5cbiAgZ2V0U21hcnRsb2codHR5T3V0cHV0OiBib29sZWFuLCBjb25jaXNlOiBib29sZWFuKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5nZXRTbWFydGxvZyh0dHlPdXRwdXQsIGNvbmNpc2UpO1xuICB9XG5cbiAgcmVuYW1lKG9sZEZpbGVQYXRoOiBzdHJpbmcsIG5ld0ZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5yZW5hbWUob2xkRmlsZVBhdGgsIG5ld0ZpbGVQYXRoKTtcbiAgfVxuXG4gIHJlbW92ZShmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UucmVtb3ZlKGZpbGVQYXRoKTtcbiAgfVxuXG4gIGFkZChmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuYWRkKGZpbGVQYXRoKTtcbiAgfVxufVxuIl19