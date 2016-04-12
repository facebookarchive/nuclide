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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _HgRepositoryClientAsync = require('./HgRepositoryClientAsync');

var _HgRepositoryClientAsync2 = _interopRequireDefault(_HgRepositoryClientAsync);

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

    // $FlowIssue: `async` not able to be annotated on classes
    this.async = new _HgRepositoryClientAsync2['default'](this);

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
        // $FlowIssue: `async` not able to be annotated on classes
        this.async.getShortHead();
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
      // $FlowIssue: `async` not able to be annotated on classes
      return this.async.isStatusModified(status);
    }
  }, {
    key: 'isStatusNew',
    value: function isStatusNew(status) {
      // $FlowIssue: `async` not able to be annotated on classes
      return this.async.isStatusNew(status);
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
     * @deprecated Use {#async.getDiffStats} instead
     *
     * Recommended method to use to get the diff stats of files in this repo.
     * @param path The file path to get the status for. If a path is not in the
     *   project, default "clean" stats will be returned.
     */
  }, {
    key: 'getDiffStatsForPath',
    value: function getDiffStatsForPath(filePath) {
      // $FlowIssue: `async` not able to be annotated on classes
      return this.async.getDiffStats(filePath);
    }

    /**
     * @deprecated Use {#async.getLineDiffs} instead
     *
     * Recommended method to use to get the line diffs of files in this repo.
     * @param path The absolute file path to get the line diffs for. If the path \
     *   is not in the project, an empty Array will be returned.
     */
  }, {
    key: 'getLineDiffsForPath',
    value: function getLineDiffsForPath(filePath) {
      // $FlowIssue: `async` not able to be annotated on classes
      return this.async.getLineDiffs(filePath);
    }

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

    /*
     * @deprecated Use {#async.getShortHead} instead
     */
  }, {
    key: 'fetchCurrentBookmark',
    value: function fetchCurrentBookmark() {
      // $FlowIssue: `async` not able to be annotated on classes
      return this.async.getShortHead();
    }

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
     * @deprecated Use {#async.checkoutReference} instead
     *
     * This is the async version of what checkoutReference() is meant to do.
     */
  }, {
    key: 'checkoutRevision',
    value: function checkoutRevision(reference, create) {
      // $FlowIssue: `async` not able to be annotated on classes
      return this.async.checkoutReference(reference, create);
    }

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

exports.HgRepositoryClient = HgRepositoryClient;

/** The origin URL of this repository. */

/** The working directory of this repository. */

/** The root directory that is opened in Atom, which this Repository serves. **/

// A map from a key (in most cases, a file path), to a related Disposable.

// Map of directory path to the number of modified files within that directory.
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxRQUFRLENBQUMsQ0FBQztLQUN2Qzs7O1dBRUUsYUFBQyxTQUE0QixFQUFpQjtBQUMvQyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3JDOzs7V0FFSyxnQkFBQyxPQUFlLEVBQWlCO0FBQ3JDLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDdEM7OztXQUVJLGVBQUMsT0FBZ0IsRUFBaUI7QUFDckMsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNyQzs7O1dBRUssZ0JBQUMsU0FBNEIsRUFBaUI7QUFDbEQsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN4Qzs7O1dBRWUsMEJBQUMsT0FBZ0MsRUFBd0I7QUFDdkUsVUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO0FBQ25CLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxhQUFPLE9BQU8sQ0FBQyxjQUFjLENBQUM7S0FDL0I7OztTQXB4QlUsa0JBQWtCIiwiZmlsZSI6IkhnUmVwb3NpdG9yeUNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgSGdTZXJ2aWNlLFxuICBEaWZmSW5mbyxcbiAgSGdTdGF0dXNPcHRpb25WYWx1ZSxcbiAgTGluZURpZmYsXG4gIFJldmlzaW9uSW5mbyxcbiAgUmV2aXNpb25GaWxlQ2hhbmdlcyxcbiAgU3RhdHVzQ29kZUlkVmFsdWUsXG4gIFN0YXR1c0NvZGVOdW1iZXJWYWx1ZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWJhc2UvbGliL0hnU2VydmljZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgSGdSZXBvc2l0b3J5Q2xpZW50QXN5bmMgZnJvbSAnLi9IZ1JlcG9zaXRvcnlDbGllbnRBc3luYyc7XG5pbXBvcnQge1xuICBTdGF0dXNDb2RlSWQsXG4gIFN0YXR1c0NvZGVJZFRvTnVtYmVyLFxuICBTdGF0dXNDb2RlTnVtYmVyLFxuICBIZ1N0YXR1c09wdGlvbixcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWJhc2UvbGliL2hnLWNvbnN0YW50cyc7XG5pbXBvcnQge3Byb21pc2VzfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtlbnN1cmVUcmFpbGluZ1NlcGFyYXRvcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zL2xpYi9wYXRocyc7XG5pbXBvcnQge2FkZEFsbFBhcmVudERpcmVjdG9yaWVzVG9DYWNoZSwgcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGV9IGZyb20gJy4vdXRpbHMnO1xuXG5jb25zdCB7c2VyaWFsaXplQXN5bmNDYWxsfSA9IHByb21pc2VzO1xuXG50eXBlIEhnUmVwb3NpdG9yeU9wdGlvbnMgPSB7XG4gIC8qKiBUaGUgb3JpZ2luIFVSTCBvZiB0aGlzIHJlcG9zaXRvcnkuICovXG4gIG9yaWdpblVSTDogP3N0cmluZztcblxuICAvKiogVGhlIHdvcmtpbmcgZGlyZWN0b3J5IG9mIHRoaXMgcmVwb3NpdG9yeS4gKi9cbiAgd29ya2luZ0RpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3Rvcnk7XG5cbiAgLyoqIFRoZSByb290IGRpcmVjdG9yeSB0aGF0IGlzIG9wZW5lZCBpbiBBdG9tLCB3aGljaCB0aGlzIFJlcG9zaXRvcnkgc2VydmVzLiAqKi9cbiAgcHJvamVjdFJvb3REaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5O1xufTtcblxuLyoqXG4gKlxuICogU2VjdGlvbjogQ29uc3RhbnRzLCBUeXBlIERlZmluaXRpb25zXG4gKlxuICovXG5cbmV4cG9ydCB0eXBlIEhnU3RhdHVzQ29tbWFuZE9wdGlvbnMgPSB7XG4gIGhnU3RhdHVzT3B0aW9uOiBIZ1N0YXR1c09wdGlvblZhbHVlO1xufTtcblxuY29uc3QgRURJVE9SX1NVQlNDUklQVElPTl9OQU1FID0gJ2hnLXJlcG9zaXRvcnktZWRpdG9yLXN1YnNjcmlwdGlvbic7XG5leHBvcnQgY29uc3QgTUFYX0lORElWSURVQUxfQ0hBTkdFRF9QQVRIUyA9IDE7XG5cbmZ1bmN0aW9uIGZpbHRlckZvck9ubHlOb3RJZ25vcmVkKGNvZGU6IFN0YXR1c0NvZGVJZFZhbHVlKTogYm9vbGVhbiB7XG4gIHJldHVybiAoY29kZSAhPT0gU3RhdHVzQ29kZUlkLklHTk9SRUQpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJGb3JPbmx5SWdub3JlZChjb2RlOiBTdGF0dXNDb2RlSWRWYWx1ZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKGNvZGUgPT09IFN0YXR1c0NvZGVJZC5JR05PUkVEKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyRm9yQWxsU3RhdHVlcygpIHtcbiAgcmV0dXJuIHRydWU7XG59XG5cblxuLyoqXG4gKlxuICogU2VjdGlvbjogSGdSZXBvc2l0b3J5Q2xpZW50XG4gKlxuICovXG5cbi8qKlxuICogSGdSZXBvc2l0b3J5Q2xpZW50IHJ1bnMgb24gdGhlIG1hY2hpbmUgdGhhdCBOdWNsaWRlL0F0b20gaXMgcnVubmluZyBvbi5cbiAqIEl0IGlzIHRoZSBpbnRlcmZhY2UgdGhhdCBvdGhlciBBdG9tIHBhY2thZ2VzIHdpbGwgdXNlIHRvIGFjY2VzcyBNZXJjdXJpYWwuXG4gKiBJdCBjYWNoZXMgZGF0YSBmZXRjaGVkIGZyb20gYW4gSGdTZXJ2aWNlLlxuICogSXQgaW1wbGVtZW50cyB0aGUgc2FtZSBpbnRlcmZhY2UgYXMgR2l0UmVwb3NpdG9yeSwgKGh0dHBzOi8vYXRvbS5pby9kb2NzL2FwaS9sYXRlc3QvR2l0UmVwb3NpdG9yeSlcbiAqIGluIGFkZGl0aW9uIHRvIHByb3ZpZGluZyBhc3luY2hyb25vdXMgbWV0aG9kcyBmb3Igc29tZSBnZXR0ZXJzLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1JlbW90ZURpcmVjdG9yeX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbic7XG5cbmV4cG9ydCBjbGFzcyBIZ1JlcG9zaXRvcnlDbGllbnQge1xuICBfcGF0aDogc3RyaW5nO1xuICBfd29ya2luZ0RpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkgfCBSZW1vdGVEaXJlY3Rvcnk7XG4gIF9wcm9qZWN0RGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeTtcbiAgX29yaWdpblVSTDogP3N0cmluZztcbiAgX3NlcnZpY2U6IEhnU2VydmljZTtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIC8vIEEgbWFwIGZyb20gYSBrZXkgKGluIG1vc3QgY2FzZXMsIGEgZmlsZSBwYXRoKSwgdG8gYSByZWxhdGVkIERpc3Bvc2FibGUuXG4gIF9kaXNwb3NhYmxlczoge1trZXk6IHN0cmluZ106IElEaXNwb3NhYmxlfTtcbiAgX2hnU3RhdHVzQ2FjaGU6IHtbZmlsZVBhdGg6IE51Y2xpZGVVcmldOiBTdGF0dXNDb2RlSWRWYWx1ZX07XG4gIC8vIE1hcCBvZiBkaXJlY3RvcnkgcGF0aCB0byB0aGUgbnVtYmVyIG9mIG1vZGlmaWVkIGZpbGVzIHdpdGhpbiB0aGF0IGRpcmVjdG9yeS5cbiAgX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGU6IE1hcDxzdHJpbmcsIG51bWJlcj47XG4gIF9oZ0RpZmZDYWNoZToge1tmaWxlUGF0aDogTnVjbGlkZVVyaV06IERpZmZJbmZvfTtcbiAgX2hnRGlmZkNhY2hlRmlsZXNVcGRhdGluZzogU2V0PE51Y2xpZGVVcmk+O1xuICBfaGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXI6IFNldDxOdWNsaWRlVXJpPjtcblxuICBfY3VycmVudEJvb2ttYXJrOiA/c3RyaW5nO1xuICBfc2VyaWFsaXplZFJlZnJlc2hTdGF0dXNlc0NhY2hlOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKHJlcG9QYXRoOiBzdHJpbmcsIGhnU2VydmljZTogSGdTZXJ2aWNlLCBvcHRpb25zOiBIZ1JlcG9zaXRvcnlPcHRpb25zKSB7XG4gICAgLy8gJEZsb3dJc3N1ZTogYGFzeW5jYCBub3QgYWJsZSB0byBiZSBhbm5vdGF0ZWQgb24gY2xhc3Nlc1xuICAgIHRoaXMuYXN5bmMgPSBuZXcgSGdSZXBvc2l0b3J5Q2xpZW50QXN5bmModGhpcyk7XG5cbiAgICB0aGlzLl9wYXRoID0gcmVwb1BhdGg7XG4gICAgdGhpcy5fd29ya2luZ0RpcmVjdG9yeSA9IG9wdGlvbnMud29ya2luZ0RpcmVjdG9yeTtcbiAgICB0aGlzLl9wcm9qZWN0RGlyZWN0b3J5ID0gb3B0aW9ucy5wcm9qZWN0Um9vdERpcmVjdG9yeTtcbiAgICB0aGlzLl9vcmlnaW5VUkwgPSBvcHRpb25zLm9yaWdpblVSTDtcbiAgICB0aGlzLl9zZXJ2aWNlID0gaGdTZXJ2aWNlO1xuXG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSB7fTtcblxuICAgIHRoaXMuX2hnU3RhdHVzQ2FjaGUgPSB7fTtcbiAgICB0aGlzLl9tb2RpZmllZERpcmVjdG9yeUNhY2hlID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5faGdEaWZmQ2FjaGUgPSB7fTtcbiAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVXBkYXRpbmcgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXIgPSBuZXcgU2V0KCk7XG5cbiAgICB0aGlzLl9zZXJpYWxpemVkUmVmcmVzaFN0YXR1c2VzQ2FjaGUgPSBzZXJpYWxpemVBc3luY0NhbGwoXG4gICAgICB0aGlzLl9yZWZyZXNoU3RhdHVzZXNPZkFsbEZpbGVzSW5DYWNoZS5iaW5kKHRoaXMpLFxuICAgICk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlc1tFRElUT1JfU1VCU0NSSVBUSU9OX05BTUVdID0gYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKGVkaXRvciA9PiB7XG4gICAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICAgIC8vIFRPRE86IG9ic2VydmUgZm9yIHdoZW4gdGhpcyBlZGl0b3IncyBwYXRoIGNoYW5nZXMuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5faXNQYXRoUmVsZXZhbnQoZmlsZVBhdGgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIElmIHRoaXMgZWRpdG9yIGhhcyBiZWVuIHByZXZpb3VzbHkgYWN0aXZlLCB3ZSB3aWxsIGhhdmUgYWxyZWFkeVxuICAgICAgLy8gaW5pdGlhbGl6ZWQgZGlmZiBpbmZvIGFuZCByZWdpc3RlcmVkIGxpc3RlbmVycyBvbiBpdC5cbiAgICAgIGlmICh0aGlzLl9kaXNwb3NhYmxlc1tmaWxlUGF0aF0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gVE9ETyAodDgyMjc1NzApIEdldCBpbml0aWFsIGRpZmYgc3RhdHMgZm9yIHRoaXMgZWRpdG9yLCBhbmQgcmVmcmVzaFxuICAgICAgLy8gdGhpcyBpbmZvcm1hdGlvbiB3aGVuZXZlciB0aGUgY29udGVudCBvZiB0aGUgZWRpdG9yIGNoYW5nZXMuXG4gICAgICBjb25zdCBlZGl0b3JTdWJzY3JpcHRpb25zID0gdGhpcy5fZGlzcG9zYWJsZXNbZmlsZVBhdGhdID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5vbkRpZFNhdmUoZXZlbnQgPT4ge1xuICAgICAgICB0aGlzLl91cGRhdGVEaWZmSW5mbyhbZXZlbnQucGF0aF0pO1xuICAgICAgfSkpO1xuICAgICAgLy8gUmVtb3ZlIHRoZSBmaWxlIGZyb20gdGhlIGRpZmYgc3RhdHMgY2FjaGUgd2hlbiB0aGUgZWRpdG9yIGlzIGNsb3NlZC5cbiAgICAgIC8vIFRoaXMgaXNuJ3Qgc3RyaWN0bHkgbmVjZXNzYXJ5LCBidXQga2VlcHMgdGhlIGNhY2hlIGFzIHNtYWxsIGFzIHBvc3NpYmxlLlxuICAgICAgLy8gVGhlcmUgYXJlIGNhc2VzIHdoZXJlIHRoaXMgcmVtb3ZhbCBtYXkgcmVzdWx0IGluIHJlbW92aW5nIGluZm9ybWF0aW9uXG4gICAgICAvLyB0aGF0IGlzIHN0aWxsIHJlbGV2YW50OiBlLmcuXG4gICAgICAvLyAgICogaWYgdGhlIHVzZXIgdmVyeSBxdWlja2x5IGNsb3NlcyBhbmQgcmVvcGVucyBhIGZpbGU7IG9yXG4gICAgICAvLyAgICogaWYgdGhlIGZpbGUgaXMgb3BlbiBpbiBtdWx0aXBsZSBlZGl0b3JzLCBhbmQgb25lIG9mIHRob3NlIGlzIGNsb3NlZC5cbiAgICAgIC8vIFRoZXNlIGFyZSBwcm9iYWJseSBlZGdlIGNhc2VzLCB0aG91Z2gsIGFuZCB0aGUgaW5mb3JtYXRpb24gd2lsbCBiZVxuICAgICAgLy8gcmVmZXRjaGVkIHRoZSBuZXh0IHRpbWUgdGhlIGZpbGUgaXMgZWRpdGVkLlxuICAgICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNUb0NsZWFyLmFkZChmaWxlUGF0aCk7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzW2ZpbGVQYXRoXS5kaXNwb3NlKCk7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9kaXNwb3NhYmxlc1tmaWxlUGF0aF07XG4gICAgICB9KSk7XG4gICAgfSk7XG5cbiAgICAvLyBSZWdhcmRsZXNzIG9mIGhvdyBmcmVxdWVudGx5IHRoZSBzZXJ2aWNlIHNlbmRzIGZpbGUgY2hhbmdlIHVwZGF0ZXMsXG4gICAgLy8gT25seSBvbmUgYmF0Y2hlZCBzdGF0dXMgdXBkYXRlIGNhbiBiZSBydW5uaW5nIGF0IGFueSBwb2ludCBvZiB0aW1lLlxuICAgIGNvbnN0IHRvVXBkYXRlQ2hhbmdlZFBhdGhzID0gW107XG4gICAgY29uc3Qgc2VyaWFsaXplZFVwZGF0ZUNoYW5nZWRQYXRocyA9IHNlcmlhbGl6ZUFzeW5jQ2FsbCgoKSA9PiB7XG4gICAgICAvLyBTZW5kIGEgYmF0Y2hlZCB1cGRhdGUgYW5kIGNsZWFyIHRoZSBwZW5kaW5nIGNoYW5nZXMuXG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlQ2hhbmdlZFBhdGhzKHRvVXBkYXRlQ2hhbmdlZFBhdGhzLnNwbGljZSgwKSk7XG4gICAgfSk7XG4gICAgY29uc3Qgb25GaWxlc0NoYW5nZXMgPSAoY2hhbmdlZFBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPikgPT4ge1xuICAgICAgdG9VcGRhdGVDaGFuZ2VkUGF0aHMucHVzaCguLi5jaGFuZ2VkUGF0aHMpO1xuICAgICAgLy8gV2lsbCB0cmlnZ2VyIGFuIHVwZGF0ZSBpbW1lZGlhdGVseSBpZiBubyBvdGhlciBhc3luYyBjYWxsIGlzIGFjdGl2ZS5cbiAgICAgIC8vIE90aGVyd2lzZSwgd2lsbCBzY2hlZHVsZSBhbiBhc3luYyBjYWxsIHdoZW4gaXQncyBkb25lLlxuICAgICAgc2VyaWFsaXplZFVwZGF0ZUNoYW5nZWRQYXRocygpO1xuICAgIH07XG4gICAgLy8gR2V0IHVwZGF0ZXMgdGhhdCB0ZWxsIHRoZSBIZ1JlcG9zaXRvcnlDbGllbnQgd2hlbiB0byBjbGVhciBpdHMgY2FjaGVzLlxuICAgIHRoaXMuX3NlcnZpY2Uub2JzZXJ2ZUZpbGVzRGlkQ2hhbmdlKCkuc3Vic2NyaWJlKG9uRmlsZXNDaGFuZ2VzKTtcbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVIZ0lnbm9yZUZpbGVEaWRDaGFuZ2UoKVxuICAgICAgLnN1YnNjcmliZSh0aGlzLl9zZXJpYWxpemVkUmVmcmVzaFN0YXR1c2VzQ2FjaGUpO1xuICAgIHRoaXMuX3NlcnZpY2Uub2JzZXJ2ZUhnUmVwb1N0YXRlRGlkQ2hhbmdlKClcbiAgICAgIC5zdWJzY3JpYmUodGhpcy5fc2VyaWFsaXplZFJlZnJlc2hTdGF0dXNlc0NhY2hlKTtcbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVIZ0Jvb2ttYXJrRGlkQ2hhbmdlKClcbiAgICAgIC5zdWJzY3JpYmUodGhpcy5mZXRjaEN1cnJlbnRCb29rbWFyay5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdkaWQtZGVzdHJveScpO1xuICAgIHRoaXMuX2VtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIE9iamVjdC5rZXlzKHRoaXMuX2Rpc3Bvc2FibGVzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlc1trZXldLmRpc3Bvc2UoKTtcbiAgICB9KTtcbiAgICB0aGlzLl9zZXJ2aWNlLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBFdmVudCBTdWJzY3JpcHRpb25cbiAgICpcbiAgICovXG5cbiAgb25EaWREZXN0cm95KGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGV2ZW50OiB7cGF0aDogc3RyaW5nOyBwYXRoU3RhdHVzOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWV9KSA9PiBtaXhlZCxcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXN0YXR1cycsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlU3RhdHVzZXMoY2FsbGJhY2s6ICgpID0+IG1peGVkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLXN0YXR1c2VzJywgY2FsbGJhY2spO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmVwb3NpdG9yeSBEZXRhaWxzXG4gICAqXG4gICAqL1xuXG4gIGdldFR5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ2hnJztcbiAgfVxuXG4gIGdldFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcGF0aDtcbiAgfVxuXG4gIGdldFdvcmtpbmdEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fd29ya2luZ0RpcmVjdG9yeS5nZXRQYXRoKCk7XG4gIH1cblxuICAvLyBAcmV0dXJuIFRoZSBwYXRoIG9mIHRoZSByb290IHByb2plY3QgZm9sZGVyIGluIEF0b20gdGhhdCB0aGlzXG4gIC8vIEhnUmVwb3NpdG9yeUNsaWVudCBwcm92aWRlcyBpbmZvcm1hdGlvbiBhYm91dC5cbiAgZ2V0UHJvamVjdERpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9wcm9qZWN0RGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGlzUHJvamVjdEF0Um9vdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJlbGF0aXZpemUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl93b3JraW5nRGlyZWN0b3J5LnJlbGF0aXZpemUoZmlsZVBhdGgpO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgaGFzQnJhbmNoKGJyYW5jaDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gVGhlIGN1cnJlbnQgSGcgYm9va21hcmsuXG4gICAqL1xuICBnZXRTaG9ydEhlYWQoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5fY3VycmVudEJvb2ttYXJrKSB7XG4gICAgICAvLyBLaWNrIG9mZiBhIGZldGNoIHRvIGdldCB0aGUgY3VycmVudCBib29rbWFyay4gVGhpcyBpcyBhc3luYy5cbiAgICAgIC8vICRGbG93SXNzdWU6IGBhc3luY2Agbm90IGFibGUgdG8gYmUgYW5ub3RhdGVkIG9uIGNsYXNzZXNcbiAgICAgIHRoaXMuYXN5bmMuZ2V0U2hvcnRIZWFkKCk7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jdXJyZW50Qm9va21hcms7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBpc1N1Ym1vZHVsZShwYXRoOiBOdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0QWhlYWRCZWhpbmRDb3VudChyZWZlcmVuY2U6IHN0cmluZywgcGF0aDogTnVjbGlkZVVyaSk6IG51bWJlciB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBnZXRDYWNoZWRVcHN0cmVhbUFoZWFkQmVoaW5kQ291bnQocGF0aDogP051Y2xpZGVVcmkpOiB7YWhlYWQ6IG51bWJlcjsgYmVoaW5kOiBudW1iZXI7fSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFoZWFkOiAwLFxuICAgICAgYmVoaW5kOiAwLFxuICAgIH07XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBnZXRDb25maWdWYWx1ZShrZXk6IHN0cmluZywgcGF0aDogP3N0cmluZyk6ID9zdHJpbmcge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0T3JpZ2luVVJMKHBhdGg6ID9zdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fb3JpZ2luVVJMO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0VXBzdHJlYW1CcmFuY2gocGF0aDogP3N0cmluZyk6ID9zdHJpbmcge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0UmVmZXJlbmNlcyhcbiAgICBwYXRoOiA/TnVjbGlkZVVyaSxcbiAgKToge2hlYWRzOiBBcnJheTxzdHJpbmc+OyByZW1vdGVzOiBBcnJheTxzdHJpbmc+OyB0YWdzOiBBcnJheTxzdHJpbmc+O30ge1xuICAgIHJldHVybiB7XG4gICAgICBoZWFkczogW10sXG4gICAgICByZW1vdGVzOiBbXSxcbiAgICAgIHRhZ3M6IFtdLFxuICAgIH07XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBnZXRSZWZlcmVuY2VUYXJnZXQocmVmZXJlbmNlOiBzdHJpbmcsIHBhdGg6ID9OdWNsaWRlVXJpKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBSZWFkaW5nIFN0YXR1cyAocGFyaXR5IHdpdGggR2l0UmVwb3NpdG9yeSlcbiAgICpcbiAgICovXG5cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgQ2FuIHdlIGNoYW5nZSB0aGUgQVBJIHRvIG1ha2UgdGhpcyBtZXRob2QgcmV0dXJuIGEgUHJvbWlzZT9cbiAgLy8gSWYgbm90LCBtaWdodCBuZWVkIHRvIGRvIGEgc3luY2hyb25vdXMgYGhnIHN0YXR1c2AgcXVlcnkuXG4gIGlzUGF0aE1vZGlmaWVkKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgY2FjaGVkUGF0aFN0YXR1cyA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmICghY2FjaGVkUGF0aFN0YXR1cykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5pc1N0YXR1c01vZGlmaWVkKFN0YXR1c0NvZGVJZFRvTnVtYmVyW2NhY2hlZFBhdGhTdGF0dXNdKTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPIChqZXNzaWNhbGluKSBDYW4gd2UgY2hhbmdlIHRoZSBBUEkgdG8gbWFrZSB0aGlzIG1ldGhvZCByZXR1cm4gYSBQcm9taXNlP1xuICAvLyBJZiBub3QsIG1pZ2h0IG5lZWQgdG8gZG8gYSBzeW5jaHJvbm91cyBgaGcgc3RhdHVzYCBxdWVyeS5cbiAgaXNQYXRoTmV3KGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgY2FjaGVkUGF0aFN0YXR1cyA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmICghY2FjaGVkUGF0aFN0YXR1cykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5pc1N0YXR1c05ldyhTdGF0dXNDb2RlSWRUb051bWJlcltjYWNoZWRQYXRoU3RhdHVzXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgQ2FuIHdlIGNoYW5nZSB0aGUgQVBJIHRvIG1ha2UgdGhpcyBtZXRob2QgcmV0dXJuIGEgUHJvbWlzZT9cbiAgLy8gSWYgbm90LCB0aGlzIG1ldGhvZCBsaWVzIGEgYml0IGJ5IHVzaW5nIGNhY2hlZCBpbmZvcm1hdGlvbi5cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgTWFrZSB0aGlzIHdvcmsgZm9yIGlnbm9yZWQgZGlyZWN0b3JpZXMuXG4gIGlzUGF0aElnbm9yZWQoZmlsZVBhdGg6ID9OdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBgaGcgc3RhdHVzIC1pYCBkb2VzIG5vdCBsaXN0IHRoZSByZXBvICh0aGUgLmhnIGRpcmVjdG9yeSksIHByZXN1bWFibHlcbiAgICAvLyBiZWNhdXNlIHRoZSByZXBvIGRvZXMgbm90IHRyYWNrIGl0c2VsZi5cbiAgICAvLyBXZSB3YW50IHRvIHJlcHJlc2VudCB0aGUgZmFjdCB0aGF0IGl0J3Mgbm90IHBhcnQgb2YgdGhlIHRyYWNrZWQgY29udGVudHMsXG4gICAgLy8gc28gd2UgbWFudWFsbHkgYWRkIGFuIGV4Y2VwdGlvbiBmb3IgaXQgdmlhIHRoZSBfaXNQYXRoV2l0aGluSGdSZXBvIGNoZWNrLlxuICAgIHJldHVybiAodGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF0gPT09IFN0YXR1c0NvZGVJZC5JR05PUkVEKSB8fFxuICAgICAgICB0aGlzLl9pc1BhdGhXaXRoaW5IZ1JlcG8oZmlsZVBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gcGF0aCBpcyB3aXRoaW4gdGhlIHJlcG8gZGlyZWN0b3J5IChpLmUuIGAuaGcvYCkuXG4gICAqL1xuICBfaXNQYXRoV2l0aGluSGdSZXBvKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChmaWxlUGF0aCA9PT0gdGhpcy5nZXRQYXRoKCkpIHx8IChmaWxlUGF0aC5pbmRleE9mKHRoaXMuZ2V0UGF0aCgpICsgJy8nKSA9PT0gMCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgYSBwYXRoIGlzIHJlbGV2YW50IHRvIHRoaXMgSGdSZXBvc2l0b3J5Q2xpZW50LiBBIHBhdGggaXNcbiAgICogZGVmaW5lZCBhcyAncmVsZXZhbnQnIGlmIGl0IGlzIHdpdGhpbiB0aGUgcHJvamVjdCBkaXJlY3Rvcnkgb3BlbmVkIHdpdGhpbiB0aGUgcmVwby5cbiAgICovXG4gIF9pc1BhdGhSZWxldmFudChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9wcm9qZWN0RGlyZWN0b3J5LmNvbnRhaW5zKGZpbGVQYXRoKSB8fFxuICAgICAgICAgICAodGhpcy5fcHJvamVjdERpcmVjdG9yeS5nZXRQYXRoKCkgPT09IGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8vIEZvciBub3csIHRoaXMgbWV0aG9kIG9ubHkgcmVmbGVjdHMgdGhlIHN0YXR1cyBvZiBcIm1vZGlmaWVkXCIgZGlyZWN0b3JpZXMuXG4gIC8vIFRyYWNraW5nIGRpcmVjdG9yeSBzdGF0dXMgaXNuJ3Qgc3RyYWlnaHRmb3J3YXJkLCBhcyBIZyBvbmx5IHRyYWNrcyBmaWxlcy5cbiAgLy8gaHR0cDovL21lcmN1cmlhbC5zZWxlbmljLmNvbS93aWtpL0ZBUSNGQVEuMkZDb21tb25Qcm9ibGVtcy5JX3RyaWVkX3RvX2NoZWNrX2luX2FuX2VtcHR5X2RpcmVjdG9yeV9hbmRfaXRfZmFpbGVkLjIxXG4gIC8vIFRPRE86IE1ha2UgdGhpcyBtZXRob2QgcmVmbGVjdCBOZXcgYW5kIElnbm9yZWQgc3RhdHVzZXMuXG4gIGdldERpcmVjdG9yeVN0YXR1cyhkaXJlY3RvcnlQYXRoOiA/c3RyaW5nKTogU3RhdHVzQ29kZU51bWJlclZhbHVlIHtcbiAgICBpZiAoIWRpcmVjdG9yeVBhdGgpIHtcbiAgICAgIHJldHVybiBTdGF0dXNDb2RlTnVtYmVyLkNMRUFOO1xuICAgIH1cbiAgICBjb25zdCBkaXJlY3RvcnlQYXRoV2l0aFNlcGFyYXRvciA9IGVuc3VyZVRyYWlsaW5nU2VwYXJhdG9yKGRpcmVjdG9yeVBhdGgpO1xuICAgIGlmICh0aGlzLl9tb2RpZmllZERpcmVjdG9yeUNhY2hlLmhhcyhkaXJlY3RvcnlQYXRoV2l0aFNlcGFyYXRvcikpIHtcbiAgICAgIHJldHVybiBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEO1xuICAgIH1cbiAgICByZXR1cm4gU3RhdHVzQ29kZU51bWJlci5DTEVBTjtcbiAgfVxuXG4gIC8vIFdlIGRvbid0IHdhbnQgdG8gZG8gYW55IHN5bmNocm9ub3VzICdoZyBzdGF0dXMnIGNhbGxzLiBKdXN0IHVzZSBjYWNoZWQgdmFsdWVzLlxuICBnZXRQYXRoU3RhdHVzKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogU3RhdHVzQ29kZU51bWJlclZhbHVlIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDYWNoZWRQYXRoU3RhdHVzKGZpbGVQYXRoKTtcbiAgfVxuXG4gIGdldENhY2hlZFBhdGhTdGF0dXMoZmlsZVBhdGg6ID9OdWNsaWRlVXJpKTogU3RhdHVzQ29kZU51bWJlclZhbHVlIHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gU3RhdHVzQ29kZU51bWJlci5DTEVBTjtcbiAgICB9XG4gICAgY29uc3QgY2FjaGVkU3RhdHVzID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgaWYgKGNhY2hlZFN0YXR1cykge1xuICAgICAgcmV0dXJuIFN0YXR1c0NvZGVJZFRvTnVtYmVyW2NhY2hlZFN0YXR1c107XG4gICAgfVxuICAgIHJldHVybiBTdGF0dXNDb2RlTnVtYmVyLkNMRUFOO1xuICB9XG5cbiAgZ2V0QWxsUGF0aFN0YXR1c2VzKCk6IHtbZmlsZVBhdGg6IE51Y2xpZGVVcmldOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWV9IHtcbiAgICBjb25zdCBwYXRoU3RhdHVzZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIGZvciAoY29uc3QgZmlsZVBhdGggaW4gdGhpcy5faGdTdGF0dXNDYWNoZSkge1xuICAgICAgcGF0aFN0YXR1c2VzW2ZpbGVQYXRoXSA9IFN0YXR1c0NvZGVJZFRvTnVtYmVyW3RoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdXTtcbiAgICB9XG4gICAgcmV0dXJuIHBhdGhTdGF0dXNlcztcbiAgfVxuXG4gIGlzU3RhdHVzTW9kaWZpZWQoc3RhdHVzOiA/bnVtYmVyKTogYm9vbGVhbiB7XG4gICAgLy8gJEZsb3dJc3N1ZTogYGFzeW5jYCBub3QgYWJsZSB0byBiZSBhbm5vdGF0ZWQgb24gY2xhc3Nlc1xuICAgIHJldHVybiB0aGlzLmFzeW5jLmlzU3RhdHVzTW9kaWZpZWQoc3RhdHVzKTtcbiAgfVxuXG4gIGlzU3RhdHVzTmV3KHN0YXR1czogP251bWJlcik6IGJvb2xlYW4ge1xuICAgIC8vICRGbG93SXNzdWU6IGBhc3luY2Agbm90IGFibGUgdG8gYmUgYW5ub3RhdGVkIG9uIGNsYXNzZXNcbiAgICByZXR1cm4gdGhpcy5hc3luYy5pc1N0YXR1c05ldyhzdGF0dXMpO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmVhZGluZyBIZyBTdGF0dXMgKGFzeW5jIG1ldGhvZHMpXG4gICAqXG4gICAqL1xuXG4gIC8qKlxuICAgKiBSZWNvbW1lbmRlZCBtZXRob2QgdG8gdXNlIHRvIGdldCB0aGUgc3RhdHVzIG9mIGZpbGVzIGluIHRoaXMgcmVwby5cbiAgICogQHBhcmFtIHBhdGhzIEFuIGFycmF5IG9mIGZpbGUgcGF0aHMgdG8gZ2V0IHRoZSBzdGF0dXMgZm9yLiBJZiBhIHBhdGggaXMgbm90IGluIHRoZVxuICAgKiAgIHByb2plY3QsIGl0IHdpbGwgYmUgaWdub3JlZC5cbiAgICogU2VlIEhnU2VydmljZTo6Z2V0U3RhdHVzZXMgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAqL1xuICBhc3luYyBnZXRTdGF0dXNlcyhcbiAgICBwYXRoczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zPzogSGdTdGF0dXNDb21tYW5kT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxNYXA8TnVjbGlkZVVyaSwgU3RhdHVzQ29kZU51bWJlclZhbHVlPj4ge1xuICAgIGNvbnN0IHN0YXR1c01hcCA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBpc1JlbGF2YW50U3RhdHVzID0gdGhpcy5fZ2V0UHJlZGljYXRlRm9yUmVsZXZhbnRTdGF0dXNlcyhvcHRpb25zKTtcblxuICAgIC8vIENoZWNrIHRoZSBjYWNoZS5cbiAgICAvLyBOb3RlOiBJZiBwYXRocyBpcyBlbXB0eSwgYSBmdWxsIGBoZyBzdGF0dXNgIHdpbGwgYmUgcnVuLCB3aGljaCBmb2xsb3dzIHRoZSBzcGVjLlxuICAgIGNvbnN0IHBhdGhzV2l0aENhY2hlTWlzcyA9IFtdO1xuICAgIHBhdGhzLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgICAgY29uc3Qgc3RhdHVzSWQgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgIGlmIChzdGF0dXNJZCkge1xuICAgICAgICBpZiAoIWlzUmVsYXZhbnRTdGF0dXMoc3RhdHVzSWQpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0YXR1c01hcC5zZXQoZmlsZVBhdGgsIFN0YXR1c0NvZGVJZFRvTnVtYmVyW3N0YXR1c0lkXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXRoc1dpdGhDYWNoZU1pc3MucHVzaChmaWxlUGF0aCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBGZXRjaCBhbnkgdW5jYWNoZWQgc3RhdHVzZXMuXG4gICAgaWYgKHBhdGhzV2l0aENhY2hlTWlzcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IG5ld1N0YXR1c0luZm8gPSBhd2FpdCB0aGlzLl91cGRhdGVTdGF0dXNlcyhwYXRoc1dpdGhDYWNoZU1pc3MsIG9wdGlvbnMpO1xuICAgICAgbmV3U3RhdHVzSW5mby5mb3JFYWNoKChzdGF0dXMsIGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIHN0YXR1c01hcC5zZXQoZmlsZVBhdGgsIFN0YXR1c0NvZGVJZFRvTnVtYmVyW3N0YXR1c10pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBzdGF0dXNNYXA7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgc3RhdHVzZXMgZm9yIHRoZSBnaXZlbiBmaWxlIHBhdGhzLCBhbmQgdXBkYXRlcyB0aGUgY2FjaGUgYW5kXG4gICAqIHNlbmRzIG91dCBjaGFuZ2UgZXZlbnRzIGFzIGFwcHJvcHJpYXRlLlxuICAgKiBAcGFyYW0gZmlsZVBhdGhzIEFuIGFycmF5IG9mIGZpbGUgcGF0aHMgdG8gdXBkYXRlIHRoZSBzdGF0dXMgZm9yLiBJZiBhIHBhdGhcbiAgICogICBpcyBub3QgaW4gdGhlIHByb2plY3QsIGl0IHdpbGwgYmUgaWdub3JlZC5cbiAgICovXG4gIGFzeW5jIF91cGRhdGVTdGF0dXNlcyhcbiAgICBmaWxlUGF0aHM6IEFycmF5PHN0cmluZz4sXG4gICAgb3B0aW9uczogP0hnU3RhdHVzQ29tbWFuZE9wdGlvbnMsXG4gICk6IFByb21pc2U8TWFwPE51Y2xpZGVVcmksIFN0YXR1c0NvZGVJZFZhbHVlPj4ge1xuICAgIGNvbnN0IHBhdGhzSW5SZXBvID0gZmlsZVBhdGhzLmZpbHRlcihmaWxlUGF0aCA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5faXNQYXRoUmVsZXZhbnQoZmlsZVBhdGgpO1xuICAgIH0pO1xuICAgIGlmIChwYXRoc0luUmVwby5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdHVzTWFwUGF0aFRvU3RhdHVzSWQgPSBhd2FpdCB0aGlzLl9zZXJ2aWNlLmZldGNoU3RhdHVzZXMocGF0aHNJblJlcG8sIG9wdGlvbnMpO1xuXG4gICAgY29uc3QgcXVlcmllZEZpbGVzID0gbmV3IFNldChwYXRoc0luUmVwbyk7XG4gICAgY29uc3Qgc3RhdHVzQ2hhbmdlRXZlbnRzID0gW107XG4gICAgc3RhdHVzTWFwUGF0aFRvU3RhdHVzSWQuZm9yRWFjaCgobmV3U3RhdHVzSWQsIGZpbGVQYXRoKSA9PiB7XG5cbiAgICAgIGNvbnN0IG9sZFN0YXR1cyA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgaWYgKG9sZFN0YXR1cyAmJiAob2xkU3RhdHVzICE9PSBuZXdTdGF0dXNJZCkgfHxcbiAgICAgICAgICAhb2xkU3RhdHVzICYmIChuZXdTdGF0dXNJZCAhPT0gU3RhdHVzQ29kZUlkLkNMRUFOKSkge1xuICAgICAgICBzdGF0dXNDaGFuZ2VFdmVudHMucHVzaCh7XG4gICAgICAgICAgcGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgcGF0aFN0YXR1czogU3RhdHVzQ29kZUlkVG9OdW1iZXJbbmV3U3RhdHVzSWRdLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG5ld1N0YXR1c0lkID09PSBTdGF0dXNDb2RlSWQuQ0xFQU4pIHtcbiAgICAgICAgICAvLyBEb24ndCBib3RoZXIga2VlcGluZyAnY2xlYW4nIGZpbGVzIGluIHRoZSBjYWNoZS5cbiAgICAgICAgICBkZWxldGUgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgICAgdGhpcy5fcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoZmlsZVBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdID0gbmV3U3RhdHVzSWQ7XG4gICAgICAgICAgaWYgKG5ld1N0YXR1c0lkID09PSBTdGF0dXNDb2RlSWQuTU9ESUZJRUQpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZEFsbFBhcmVudERpcmVjdG9yaWVzVG9DYWNoZShmaWxlUGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBxdWVyaWVkRmlsZXMuZGVsZXRlKGZpbGVQYXRoKTtcbiAgICB9KTtcblxuICAgIC8vIElmIHRoZSBzdGF0dXNlcyB3ZXJlIGZldGNoZWQgZm9yIG9ubHkgY2hhbmdlZCAoYGhnIHN0YXR1c2ApIG9yXG4gICAgLy8gaWdub3JlZCAoJ2hnIHN0YXR1cyAtLWlnbm9yZWRgKSBmaWxlcywgYSBxdWVyaWVkIGZpbGUgbWF5IG5vdCBiZVxuICAgIC8vIHJldHVybmVkIGluIHRoZSByZXNwb25zZS4gSWYgaXQgd2Fzbid0IHJldHVybmVkLCB0aGlzIG1lYW5zIGl0cyBzdGF0dXNcbiAgICAvLyBtYXkgaGF2ZSBjaGFuZ2VkLCBpbiB3aGljaCBjYXNlIGl0IHNob3VsZCBiZSByZW1vdmVkIGZyb20gdGhlIGhnU3RhdHVzQ2FjaGUuXG4gICAgLy8gTm90ZTogd2UgZG9uJ3Qga25vdyB0aGUgcmVhbCB1cGRhdGVkIHN0YXR1cyBvZiB0aGUgZmlsZSwgc28gZG9uJ3Qgc2VuZCBhIGNoYW5nZSBldmVudC5cbiAgICAvLyBUT0RPIChqZXNzaWNhbGluKSBDYW4gd2UgbWFrZSB0aGUgJ3BhdGhTdGF0dXMnIGZpZWxkIGluIHRoZSBjaGFuZ2UgZXZlbnQgb3B0aW9uYWw/XG4gICAgLy8gVGhlbiB3ZSBjYW4gc2VuZCB0aGVzZSBldmVudHMuXG4gICAgY29uc3QgaGdTdGF0dXNPcHRpb24gPSB0aGlzLl9nZXRTdGF0dXNPcHRpb24ob3B0aW9ucyk7XG4gICAgaWYgKGhnU3RhdHVzT3B0aW9uID09PSBIZ1N0YXR1c09wdGlvbi5PTkxZX0lHTk9SRUQpIHtcbiAgICAgIHF1ZXJpZWRGaWxlcy5mb3JFYWNoKGZpbGVQYXRoID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdID09PSBTdGF0dXNDb2RlSWQuSUdOT1JFRCkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChoZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTKSB7XG4gICAgICAvLyBJZiBIZ1N0YXR1c09wdGlvbi5BTExfU1RBVFVTRVMgd2FzIHBhc3NlZCBhbmQgYSBmaWxlIGRvZXMgbm90IGFwcGVhciBpblxuICAgICAgLy8gdGhlIHJlc3VsdHMsIGl0IG11c3QgbWVhbiB0aGUgZmlsZSB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBmaWxlc3lzdGVtLlxuICAgICAgcXVlcmllZEZpbGVzLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgICAgICBjb25zdCBjYWNoZWRTdGF0dXNJZCA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICBkZWxldGUgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgIGlmIChjYWNoZWRTdGF0dXNJZCA9PT0gU3RhdHVzQ29kZUlkLk1PRElGSUVEKSB7XG4gICAgICAgICAgdGhpcy5fcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcmllZEZpbGVzLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgICAgICBjb25zdCBjYWNoZWRTdGF0dXNJZCA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICBpZiAoY2FjaGVkU3RhdHVzSWQgIT09IFN0YXR1c0NvZGVJZC5JR05PUkVEKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICAgIGlmIChjYWNoZWRTdGF0dXNJZCA9PT0gU3RhdHVzQ29kZUlkLk1PRElGSUVEKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZShmaWxlUGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBFbWl0IGNoYW5nZSBldmVudHMgb25seSBhZnRlciB0aGUgY2FjaGUgaGFzIGJlZW4gZnVsbHkgdXBkYXRlZC5cbiAgICBzdGF0dXNDaGFuZ2VFdmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc3RhdHVzJywgZXZlbnQpO1xuICAgIH0pO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1zdGF0dXNlcycpO1xuXG4gICAgcmV0dXJuIHN0YXR1c01hcFBhdGhUb1N0YXR1c0lkO1xuICB9XG5cbiAgX2FkZEFsbFBhcmVudERpcmVjdG9yaWVzVG9DYWNoZShmaWxlUGF0aDogTnVjbGlkZVVyaSkge1xuICAgIGFkZEFsbFBhcmVudERpcmVjdG9yaWVzVG9DYWNoZShcbiAgICAgIHRoaXMuX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGUsXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIHRoaXMuX3Byb2plY3REaXJlY3RvcnkuZ2V0UGFyZW50KCkuZ2V0UGF0aCgpXG4gICAgKTtcbiAgfVxuXG4gIF9yZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZShmaWxlUGF0aDogTnVjbGlkZVVyaSkge1xuICAgIHJlbW92ZUFsbFBhcmVudERpcmVjdG9yaWVzRnJvbUNhY2hlKFxuICAgICAgdGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZSxcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgdGhpcy5fcHJvamVjdERpcmVjdG9yeS5nZXRQYXJlbnQoKS5nZXRQYXRoKClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiBmb3IgOjpnZXRTdGF0dXNlcy5cbiAgICogUmV0dXJucyBhIGZpbHRlciBmb3Igd2hldGhlciBvciBub3QgdGhlIGdpdmVuIHN0YXR1cyBjb2RlIHNob3VsZCBiZVxuICAgKiByZXR1cm5lZCwgZ2l2ZW4gdGhlIHBhc3NlZC1pbiBvcHRpb25zIGZvciA6OmdldFN0YXR1c2VzLlxuICAgKi9cbiAgX2dldFByZWRpY2F0ZUZvclJlbGV2YW50U3RhdHVzZXMoXG4gICAgb3B0aW9uczogP0hnU3RhdHVzQ29tbWFuZE9wdGlvbnNcbiAgKTogKGNvZGU6IFN0YXR1c0NvZGVJZFZhbHVlKSA9PiBib29sZWFuIHtcbiAgICBjb25zdCBoZ1N0YXR1c09wdGlvbiA9IHRoaXMuX2dldFN0YXR1c09wdGlvbihvcHRpb25zKTtcblxuICAgIGlmIChoZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uT05MWV9JR05PUkVEKSB7XG4gICAgICByZXR1cm4gZmlsdGVyRm9yT25seUlnbm9yZWQ7XG4gICAgfSBlbHNlIGlmIChoZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTKSB7XG4gICAgICByZXR1cm4gZmlsdGVyRm9yQWxsU3RhdHVlcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZpbHRlckZvck9ubHlOb3RJZ25vcmVkO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJldHJpZXZpbmcgRGlmZnMgKHBhcml0eSB3aXRoIEdpdFJlcG9zaXRvcnkpXG4gICAqXG4gICAqL1xuXG4gIGdldERpZmZTdGF0cyhmaWxlUGF0aDogP051Y2xpZGVVcmkpOiB7YWRkZWQ6IG51bWJlcjsgZGVsZXRlZDogbnVtYmVyO30ge1xuICAgIGNvbnN0IGNsZWFuU3RhdHMgPSB7YWRkZWQ6IDAsIGRlbGV0ZWQ6IDB9O1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBjbGVhblN0YXRzO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZWREYXRhID0gdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdO1xuICAgIHJldHVybiBjYWNoZWREYXRhID8ge2FkZGVkOiBjYWNoZWREYXRhLmFkZGVkLCBkZWxldGVkOiBjYWNoZWREYXRhLmRlbGV0ZWR9IDpcbiAgICAgICAgY2xlYW5TdGF0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIExpbmVEaWZmIHRoYXQgZGVzY3JpYmVzIHRoZSBkaWZmcyBiZXR3ZWVuIHRoZSBnaXZlblxuICAgKiBmaWxlJ3MgYEhFQURgIGNvbnRlbnRzIGFuZCBpdHMgY3VycmVudCBjb250ZW50cy5cbiAgICogTk9URTogdGhpcyBtZXRob2QgY3VycmVudGx5IGlnbm9yZXMgdGhlIHBhc3NlZC1pbiB0ZXh0LCBhbmQgaW5zdGVhZCBkaWZmc1xuICAgKiBhZ2FpbnN0IHRoZSBjdXJyZW50bHkgc2F2ZWQgY29udGVudHMgb2YgdGhlIGZpbGUuXG4gICAqL1xuICAvLyBUT0RPIChqZXNzaWNhbGluKSBFeHBvcnQgdGhlIExpbmVEaWZmIHR5cGUgKGZyb20gaGctb3V0cHV0LWhlbHBlcnMpIHdoZW5cbiAgLy8gdHlwZXMgY2FuIGJlIGV4cG9ydGVkLlxuICAvLyBUT0RPIChqZXNzaWNhbGluKSBNYWtlIHRoaXMgbWV0aG9kIHdvcmsgd2l0aCB0aGUgcGFzc2VkLWluIGB0ZXh0YC4gdDYzOTE1NzlcbiAgZ2V0TGluZURpZmZzKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSwgdGV4dDogP3N0cmluZyk6IEFycmF5PExpbmVEaWZmPiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBkaWZmSW5mbyA9IHRoaXMuX2hnRGlmZkNhY2hlW2ZpbGVQYXRoXTtcbiAgICByZXR1cm4gZGlmZkluZm8gPyBkaWZmSW5mby5saW5lRGlmZnMgOiBbXTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJldHJpZXZpbmcgRGlmZnMgKGFzeW5jIG1ldGhvZHMpXG4gICAqXG4gICAqL1xuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBVc2UgeyNhc3luYy5nZXREaWZmU3RhdHN9IGluc3RlYWRcbiAgICpcbiAgICogUmVjb21tZW5kZWQgbWV0aG9kIHRvIHVzZSB0byBnZXQgdGhlIGRpZmYgc3RhdHMgb2YgZmlsZXMgaW4gdGhpcyByZXBvLlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgZmlsZSBwYXRoIHRvIGdldCB0aGUgc3RhdHVzIGZvci4gSWYgYSBwYXRoIGlzIG5vdCBpbiB0aGVcbiAgICogICBwcm9qZWN0LCBkZWZhdWx0IFwiY2xlYW5cIiBzdGF0cyB3aWxsIGJlIHJldHVybmVkLlxuICAgKi9cbiAgZ2V0RGlmZlN0YXRzRm9yUGF0aChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8e2FkZGVkOiBudW1iZXI7IGRlbGV0ZWQ6IG51bWJlcjt9PiB7XG4gICAgLy8gJEZsb3dJc3N1ZTogYGFzeW5jYCBub3QgYWJsZSB0byBiZSBhbm5vdGF0ZWQgb24gY2xhc3Nlc1xuICAgIHJldHVybiB0aGlzLmFzeW5jLmdldERpZmZTdGF0cyhmaWxlUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgVXNlIHsjYXN5bmMuZ2V0TGluZURpZmZzfSBpbnN0ZWFkXG4gICAqXG4gICAqIFJlY29tbWVuZGVkIG1ldGhvZCB0byB1c2UgdG8gZ2V0IHRoZSBsaW5lIGRpZmZzIG9mIGZpbGVzIGluIHRoaXMgcmVwby5cbiAgICogQHBhcmFtIHBhdGggVGhlIGFic29sdXRlIGZpbGUgcGF0aCB0byBnZXQgdGhlIGxpbmUgZGlmZnMgZm9yLiBJZiB0aGUgcGF0aCBcXFxuICAgKiAgIGlzIG5vdCBpbiB0aGUgcHJvamVjdCwgYW4gZW1wdHkgQXJyYXkgd2lsbCBiZSByZXR1cm5lZC5cbiAgICovXG4gIGdldExpbmVEaWZmc0ZvclBhdGgoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPEFycmF5PExpbmVEaWZmPj4ge1xuICAgIC8vICRGbG93SXNzdWU6IGBhc3luY2Agbm90IGFibGUgdG8gYmUgYW5ub3RhdGVkIG9uIGNsYXNzZXNcbiAgICByZXR1cm4gdGhpcy5hc3luYy5nZXRMaW5lRGlmZnMoZmlsZVBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGRpZmYgaW5mb3JtYXRpb24gZm9yIHRoZSBnaXZlbiBwYXRocywgYW5kIHVwZGF0ZXMgdGhlIGNhY2hlLlxuICAgKiBAcGFyYW0gQW4gYXJyYXkgb2YgYWJzb2x1dGUgZmlsZSBwYXRocyBmb3Igd2hpY2ggdG8gdXBkYXRlIHRoZSBkaWZmIGluZm8uXG4gICAqIEByZXR1cm4gQSBtYXAgb2YgZWFjaCBwYXRoIHRvIGl0cyBEaWZmSW5mby5cbiAgICogICBUaGlzIG1ldGhvZCBtYXkgcmV0dXJuIGBudWxsYCBpZiB0aGUgY2FsbCB0byBgaGcgZGlmZmAgZmFpbHMuXG4gICAqICAgQSBmaWxlIHBhdGggd2lsbCBub3QgYXBwZWFyIGluIHRoZSByZXR1cm5lZCBNYXAgaWYgaXQgaXMgbm90IGluIHRoZSByZXBvLFxuICAgKiAgIGlmIGl0IGhhcyBubyBjaGFuZ2VzLCBvciBpZiB0aGVyZSBpcyBhIHBlbmRpbmcgYGhnIGRpZmZgIGNhbGwgZm9yIGl0IGFscmVhZHkuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlRGlmZkluZm8oZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPik6IFByb21pc2U8P01hcDxOdWNsaWRlVXJpLCBEaWZmSW5mbz4+IHtcbiAgICBjb25zdCBwYXRoc1RvRmV0Y2ggPSBmaWxlUGF0aHMuZmlsdGVyKGFQYXRoID0+IHtcbiAgICAgIC8vIERvbid0IHRyeSB0byBmZXRjaCBpbmZvcm1hdGlvbiBmb3IgdGhpcyBwYXRoIGlmIGl0J3Mgbm90IGluIHRoZSByZXBvLlxuICAgICAgaWYgKCF0aGlzLl9pc1BhdGhSZWxldmFudChhUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gRG9uJ3QgZG8gYW5vdGhlciB1cGRhdGUgZm9yIHRoaXMgcGF0aCBpZiB3ZSBhcmUgaW4gdGhlIG1pZGRsZSBvZiBydW5uaW5nIGFuIHVwZGF0ZS5cbiAgICAgIGlmICh0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVXBkYXRpbmcuaGFzKGFQYXRoKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVXBkYXRpbmcuYWRkKGFQYXRoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAocGF0aHNUb0ZldGNoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICAvLyBDYWxsIHRoZSBIZ1NlcnZpY2UgYW5kIHVwZGF0ZSBvdXIgY2FjaGUgd2l0aCB0aGUgcmVzdWx0cy5cbiAgICBjb25zdCBwYXRoc1RvRGlmZkluZm8gPSBhd2FpdCB0aGlzLl9zZXJ2aWNlLmZldGNoRGlmZkluZm8ocGF0aHNUb0ZldGNoKTtcbiAgICBpZiAocGF0aHNUb0RpZmZJbmZvKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWxlUGF0aCwgZGlmZkluZm9dIG9mIHBhdGhzVG9EaWZmSW5mbykge1xuICAgICAgICB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF0gPSBkaWZmSW5mbztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZmlsZXMgbWFya2VkIGZvciBkZWxldGlvbi5cbiAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVG9DbGVhci5mb3JFYWNoKGZpbGVUb0NsZWFyID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlVG9DbGVhcl07XG4gICAgfSk7XG4gICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXIuY2xlYXIoKTtcblxuICAgIC8vIFRoZSBmZXRjaGVkIGZpbGVzIGNhbiBub3cgYmUgdXBkYXRlZCBhZ2Fpbi5cbiAgICBmb3IgKGNvbnN0IHBhdGhUb0ZldGNoIG9mIHBhdGhzVG9GZXRjaCkge1xuICAgICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nLmRlbGV0ZShwYXRoVG9GZXRjaCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyAodDkxMTM5MTMpIElkZWFsbHksIHdlIGNvdWxkIHNlbmQgbW9yZSB0YXJnZXRlZCBldmVudHMgdGhhdCBiZXR0ZXJcbiAgICAvLyBkZXNjcmliZSB3aGF0IGNoYW5nZSBoYXMgb2NjdXJyZWQuIFJpZ2h0IG5vdywgR2l0UmVwb3NpdG9yeSBkaWN0YXRlcyBlaXRoZXJcbiAgICAvLyAnZGlkLWNoYW5nZS1zdGF0dXMnIG9yICdkaWQtY2hhbmdlLXN0YXR1c2VzJy5cbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnKTtcbiAgICByZXR1cm4gcGF0aHNUb0RpZmZJbmZvO1xuICB9XG5cbiAgLyoqXG4gICpcbiAgKiBTZWN0aW9uOiBSZXRyaWV2aW5nIEJvb2ttYXJrIChhc3luYyBtZXRob2RzKVxuICAqXG4gICovXG5cbiAgLypcbiAgICogQGRlcHJlY2F0ZWQgVXNlIHsjYXN5bmMuZ2V0U2hvcnRIZWFkfSBpbnN0ZWFkXG4gICAqL1xuICBmZXRjaEN1cnJlbnRCb29rbWFyaygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIC8vICRGbG93SXNzdWU6IGBhc3luY2Agbm90IGFibGUgdG8gYmUgYW5ub3RhdGVkIG9uIGNsYXNzZXNcbiAgICByZXR1cm4gdGhpcy5hc3luYy5nZXRTaG9ydEhlYWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBDaGVja2luZyBPdXRcbiAgICpcbiAgICovXG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgY2hlY2tvdXRIZWFkKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGNoZWNrb3V0UmVmZXJlbmNlKHJlZmVyZW5jZTogc3RyaW5nLCBjcmVhdGU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgVXNlIHsjYXN5bmMuY2hlY2tvdXRSZWZlcmVuY2V9IGluc3RlYWRcbiAgICpcbiAgICogVGhpcyBpcyB0aGUgYXN5bmMgdmVyc2lvbiBvZiB3aGF0IGNoZWNrb3V0UmVmZXJlbmNlKCkgaXMgbWVhbnQgdG8gZG8uXG4gICAqL1xuICBjaGVja291dFJldmlzaW9uKHJlZmVyZW5jZTogc3RyaW5nLCBjcmVhdGU6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyAkRmxvd0lzc3VlOiBgYXN5bmNgIG5vdCBhYmxlIHRvIGJlIGFubm90YXRlZCBvbiBjbGFzc2VzXG4gICAgcmV0dXJuIHRoaXMuYXN5bmMuY2hlY2tvdXRSZWZlcmVuY2UocmVmZXJlbmNlLCBjcmVhdGUpO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogSGdTZXJ2aWNlIHN1YnNjcmlwdGlvbnNcbiAgICpcbiAgICovXG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGNhY2hlIGluIHJlc3BvbnNlIHRvIGFueSBudW1iZXIgb2YgKG5vbi0uaGdpZ25vcmUpIGZpbGVzIGNoYW5naW5nLlxuICAgKiBAcGFyYW0gdXBkYXRlIFRoZSBjaGFuZ2VkIGZpbGUgcGF0aHMuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlQ2hhbmdlZFBhdGhzKGNoYW5nZWRQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCByZWxldmFudENoYW5nZWRQYXRocyA9IGNoYW5nZWRQYXRocy5maWx0ZXIodGhpcy5faXNQYXRoUmVsZXZhbnQuYmluZCh0aGlzKSk7XG4gICAgaWYgKHJlbGV2YW50Q2hhbmdlZFBhdGhzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAocmVsZXZhbnRDaGFuZ2VkUGF0aHMubGVuZ3RoIDw9IE1BWF9JTkRJVklEVUFMX0NIQU5HRURfUEFUSFMpIHtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgc3RhdHVzZXMgaW5kaXZpZHVhbGx5LlxuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlU3RhdHVzZXMoXG4gICAgICAgIHJlbGV2YW50Q2hhbmdlZFBhdGhzLFxuICAgICAgICB7aGdTdGF0dXNPcHRpb246IEhnU3RhdHVzT3B0aW9uLkFMTF9TVEFUVVNFU30sXG4gICAgICApO1xuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZkluZm8oXG4gICAgICAgIHJlbGV2YW50Q2hhbmdlZFBhdGhzLmZpbHRlcihmaWxlUGF0aCA9PiB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF0pLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhpcyBpcyBhIGhldXJpc3RpYyB0byBpbXByb3ZlIHBlcmZvcm1hbmNlLiBNYW55IGZpbGVzIGJlaW5nIGNoYW5nZWQgbWF5XG4gICAgICAvLyBiZSBhIHNpZ24gdGhhdCB3ZSBhcmUgcGlja2luZyB1cCBjaGFuZ2VzIHRoYXQgd2VyZSBjcmVhdGVkIGluIGFuIGF1dG9tYXRlZFxuICAgICAgLy8gd2F5IC0tIHNvIGluIGFkZGl0aW9uLCB0aGVyZSBtYXkgYmUgbWFueSBiYXRjaGVzIG9mIGNoYW5nZXMgaW4gc3VjY2Vzc2lvbi5cbiAgICAgIC8vIFRoZSByZWZyZXNoIGlzIHNlcmlhbGl6ZWQsIHNvIGl0IGlzIHNhZmUgdG8gY2FsbCBpdCBtdWx0aXBsZSB0aW1lcyBpbiBzdWNjZXNzaW9uLlxuICAgICAgYXdhaXQgdGhpcy5fc2VyaWFsaXplZFJlZnJlc2hTdGF0dXNlc0NhY2hlKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3JlZnJlc2hTdGF0dXNlc09mQWxsRmlsZXNJbkNhY2hlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX2hnU3RhdHVzQ2FjaGUgPSB7fTtcbiAgICB0aGlzLl9tb2RpZmllZERpcmVjdG9yeUNhY2hlID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IHBhdGhzSW5EaWZmQ2FjaGUgPSBPYmplY3Qua2V5cyh0aGlzLl9oZ0RpZmZDYWNoZSk7XG4gICAgdGhpcy5faGdEaWZmQ2FjaGUgPSB7fTtcbiAgICAvLyBXZSBzaG91bGQgZ2V0IHRoZSBtb2RpZmllZCBzdGF0dXMgb2YgYWxsIGZpbGVzIGluIHRoZSByZXBvIHRoYXQgaXNcbiAgICAvLyB1bmRlciB0aGUgSGdSZXBvc2l0b3J5Q2xpZW50J3MgcHJvamVjdCBkaXJlY3RvcnksIGJlY2F1c2Ugd2hlbiBIZ1xuICAgIC8vIG1vZGlmaWVzIHRoZSByZXBvLCBpdCBkb2Vzbid0IG5lY2Vzc2FyaWx5IG9ubHkgbW9kaWZ5IGZpbGVzIHRoYXQgd2VyZVxuICAgIC8vIHByZXZpb3VzbHkgbW9kaWZpZWQuXG4gICAgYXdhaXQgdGhpcy5fdXBkYXRlU3RhdHVzZXMoXG4gICAgICBbdGhpcy5nZXRQcm9qZWN0RGlyZWN0b3J5KCldLFxuICAgICAge2hnU3RhdHVzT3B0aW9uOiBIZ1N0YXR1c09wdGlvbi5PTkxZX05PTl9JR05PUkVEfSxcbiAgICApO1xuICAgIGlmIChwYXRoc0luRGlmZkNhY2hlLmxlbmd0aCA+IDApIHtcbiAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZJbmZvKHBhdGhzSW5EaWZmQ2FjaGUpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJlcG9zaXRvcnkgU3RhdGUgYXQgU3BlY2lmaWMgUmV2aXNpb25zXG4gICAqXG4gICAqL1xuICBmZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aDogTnVjbGlkZVVyaSwgcmV2aXNpb246ID9zdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5mZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aCwgcmV2aXNpb24pO1xuICB9XG5cbiAgZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKHJldmlzaW9uOiBzdHJpbmcpOiBQcm9taXNlPD9SZXZpc2lvbkZpbGVDaGFuZ2VzPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKHJldmlzaW9uKTtcbiAgfVxuXG4gIGZldGNoUmV2aXNpb25JbmZvQmV0d2VlbkhlYWRBbmRCYXNlKCk6IFByb21pc2U8P0FycmF5PFJldmlzaW9uSW5mbz4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5mZXRjaFJldmlzaW9uSW5mb0JldHdlZW5IZWFkQW5kQmFzZSgpO1xuICB9XG5cbiAgLy8gU2VlIEhnU2VydmljZS5nZXRCbGFtZUF0SGVhZC5cbiAgZ2V0QmxhbWVBdEhlYWQoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPE1hcDxzdHJpbmcsIHN0cmluZz4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5nZXRCbGFtZUF0SGVhZChmaWxlUGF0aCk7XG4gIH1cblxuICBnZXRDb25maWdWYWx1ZUFzeW5jKGtleTogc3RyaW5nLCBwYXRoOiA/c3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZ2V0Q29uZmlnVmFsdWVBc3luYyhrZXkpO1xuICB9XG5cbiAgLy8gU2VlIEhnU2VydmljZS5nZXREaWZmZXJlbnRpYWxSZXZpc2lvbkZvckNoYW5nZVNldElkLlxuICBnZXREaWZmZXJlbnRpYWxSZXZpc2lvbkZvckNoYW5nZVNldElkKGNoYW5nZVNldElkOiBzdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5nZXREaWZmZXJlbnRpYWxSZXZpc2lvbkZvckNoYW5nZVNldElkKGNoYW5nZVNldElkKTtcbiAgfVxuXG4gIGdldFNtYXJ0bG9nKHR0eU91dHB1dDogYm9vbGVhbiwgY29uY2lzZTogYm9vbGVhbik6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZ2V0U21hcnRsb2codHR5T3V0cHV0LCBjb25jaXNlKTtcbiAgfVxuXG4gIHJlbmFtZShvbGRGaWxlUGF0aDogc3RyaW5nLCBuZXdGaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UucmVuYW1lKG9sZEZpbGVQYXRoLCBuZXdGaWxlUGF0aCk7XG4gIH1cblxuICByZW1vdmUoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLnJlbW92ZShmaWxlUGF0aCk7XG4gIH1cblxuICBhZGQoZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmFkZChmaWxlUGF0aHMpO1xuICB9XG5cbiAgY29tbWl0KG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmNvbW1pdChtZXNzYWdlKTtcbiAgfVxuXG4gIGFtZW5kKG1lc3NhZ2U6ID9zdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5hbWVuZChtZXNzYWdlKTtcbiAgfVxuXG4gIHJldmVydChmaWxlUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UucmV2ZXJ0KGZpbGVQYXRocyk7XG4gIH1cblxuICBfZ2V0U3RhdHVzT3B0aW9uKG9wdGlvbnM6ID9IZ1N0YXR1c0NvbW1hbmRPcHRpb25zKTogP0hnU3RhdHVzT3B0aW9uVmFsdWUge1xuICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gb3B0aW9ucy5oZ1N0YXR1c09wdGlvbjtcbiAgfVxufVxuIl19