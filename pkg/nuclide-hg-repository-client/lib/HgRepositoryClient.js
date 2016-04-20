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
      var cachedPathStatus = this._hgStatusCache[filePath];
      if (!cachedPathStatus) {
        return this._isPathWithinHgRepo(filePath);
      } else {
        return this.isStatusIgnored(_nuclideHgRepositoryBaseLibHgConstants.StatusCodeIdToNumber[cachedPathStatus]);
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
  }, {
    key: 'isStatusIgnored',
    value: function isStatusIgnored(status) {
      // $FlowIssue: `async` not able to be annotated on classes
      return this.async.isStatusIgnored(status);
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
//# sourceMappingURL=data:application/json;base64,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T0FBTyxDQUFDLENBQUM7S0FDdEQ7OztXQUVLLGdCQUFDLFdBQW1CLEVBQUUsV0FBbUIsRUFBaUI7QUFDOUQsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDdkQ7OztXQUVLLGdCQUFDLFFBQWdCLEVBQWlCO0FBQ3RDLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDdkM7OztXQUVFLGFBQUMsU0FBNEIsRUFBaUI7QUFDL0MsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNyQzs7O1dBRUssZ0JBQUMsT0FBZSxFQUFpQjtBQUNyQyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3RDOzs7V0FFSSxlQUFDLE9BQWdCLEVBQWlCO0FBQ3JDLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDckM7OztXQUVLLGdCQUFDLFNBQTRCLEVBQWlCO0FBQ2xELGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDeEM7OztXQUVlLDBCQUFDLE9BQWdDLEVBQXdCO0FBQ3ZFLFVBQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUNuQixlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsYUFBTyxPQUFPLENBQUMsY0FBYyxDQUFDO0tBQy9COzs7U0E3eEJVLGtCQUFrQiIsImZpbGUiOiJIZ1JlcG9zaXRvcnlDbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEhnU2VydmljZSxcbiAgRGlmZkluZm8sXG4gIEhnU3RhdHVzT3B0aW9uVmFsdWUsXG4gIExpbmVEaWZmLFxuICBSZXZpc2lvbkluZm8sXG4gIFJldmlzaW9uRmlsZUNoYW5nZXMsXG4gIFN0YXR1c0NvZGVJZFZhbHVlLFxuICBTdGF0dXNDb2RlTnVtYmVyVmFsdWUsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IEhnUmVwb3NpdG9yeUNsaWVudEFzeW5jIGZyb20gJy4vSGdSZXBvc2l0b3J5Q2xpZW50QXN5bmMnO1xuaW1wb3J0IHtcbiAgU3RhdHVzQ29kZUlkLFxuICBTdGF0dXNDb2RlSWRUb051bWJlcixcbiAgU3RhdHVzQ29kZU51bWJlcixcbiAgSGdTdGF0dXNPcHRpb24sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHtwcm9taXNlc30gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7ZW5zdXJlVHJhaWxpbmdTZXBhcmF0b3J9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucy9saWIvcGF0aHMnO1xuaW1wb3J0IHthZGRBbGxQYXJlbnREaXJlY3Rvcmllc1RvQ2FjaGUsIHJlbW92ZUFsbFBhcmVudERpcmVjdG9yaWVzRnJvbUNhY2hlfSBmcm9tICcuL3V0aWxzJztcblxuY29uc3Qge3NlcmlhbGl6ZUFzeW5jQ2FsbH0gPSBwcm9taXNlcztcblxudHlwZSBIZ1JlcG9zaXRvcnlPcHRpb25zID0ge1xuICAvKiogVGhlIG9yaWdpbiBVUkwgb2YgdGhpcyByZXBvc2l0b3J5LiAqL1xuICBvcmlnaW5VUkw6ID9zdHJpbmc7XG5cbiAgLyoqIFRoZSB3b3JraW5nIGRpcmVjdG9yeSBvZiB0aGlzIHJlcG9zaXRvcnkuICovXG4gIHdvcmtpbmdEaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5IHwgUmVtb3RlRGlyZWN0b3J5O1xuXG4gIC8qKiBUaGUgcm9vdCBkaXJlY3RvcnkgdGhhdCBpcyBvcGVuZWQgaW4gQXRvbSwgd2hpY2ggdGhpcyBSZXBvc2l0b3J5IHNlcnZlcy4gKiovXG4gIHByb2plY3RSb290RGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeTtcbn07XG5cbi8qKlxuICpcbiAqIFNlY3Rpb246IENvbnN0YW50cywgVHlwZSBEZWZpbml0aW9uc1xuICpcbiAqL1xuXG5leHBvcnQgdHlwZSBIZ1N0YXR1c0NvbW1hbmRPcHRpb25zID0ge1xuICBoZ1N0YXR1c09wdGlvbjogSGdTdGF0dXNPcHRpb25WYWx1ZTtcbn07XG5cbmNvbnN0IEVESVRPUl9TVUJTQ1JJUFRJT05fTkFNRSA9ICdoZy1yZXBvc2l0b3J5LWVkaXRvci1zdWJzY3JpcHRpb24nO1xuZXhwb3J0IGNvbnN0IE1BWF9JTkRJVklEVUFMX0NIQU5HRURfUEFUSFMgPSAxO1xuXG5mdW5jdGlvbiBmaWx0ZXJGb3JPbmx5Tm90SWdub3JlZChjb2RlOiBTdGF0dXNDb2RlSWRWYWx1ZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKGNvZGUgIT09IFN0YXR1c0NvZGVJZC5JR05PUkVEKTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyRm9yT25seUlnbm9yZWQoY29kZTogU3RhdHVzQ29kZUlkVmFsdWUpOiBib29sZWFuIHtcbiAgcmV0dXJuIChjb2RlID09PSBTdGF0dXNDb2RlSWQuSUdOT1JFRCk7XG59XG5cbmZ1bmN0aW9uIGZpbHRlckZvckFsbFN0YXR1ZXMoKSB7XG4gIHJldHVybiB0cnVlO1xufVxuXG5cbi8qKlxuICpcbiAqIFNlY3Rpb246IEhnUmVwb3NpdG9yeUNsaWVudFxuICpcbiAqL1xuXG4vKipcbiAqIEhnUmVwb3NpdG9yeUNsaWVudCBydW5zIG9uIHRoZSBtYWNoaW5lIHRoYXQgTnVjbGlkZS9BdG9tIGlzIHJ1bm5pbmcgb24uXG4gKiBJdCBpcyB0aGUgaW50ZXJmYWNlIHRoYXQgb3RoZXIgQXRvbSBwYWNrYWdlcyB3aWxsIHVzZSB0byBhY2Nlc3MgTWVyY3VyaWFsLlxuICogSXQgY2FjaGVzIGRhdGEgZmV0Y2hlZCBmcm9tIGFuIEhnU2VydmljZS5cbiAqIEl0IGltcGxlbWVudHMgdGhlIHNhbWUgaW50ZXJmYWNlIGFzIEdpdFJlcG9zaXRvcnksIChodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L0dpdFJlcG9zaXRvcnkpXG4gKiBpbiBhZGRpdGlvbiB0byBwcm92aWRpbmcgYXN5bmNocm9ub3VzIG1ldGhvZHMgZm9yIHNvbWUgZ2V0dGVycy5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtSZW1vdGVEaXJlY3Rvcnl9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLWNvbm5lY3Rpb24nO1xuXG5leHBvcnQgY2xhc3MgSGdSZXBvc2l0b3J5Q2xpZW50IHtcbiAgX3BhdGg6IHN0cmluZztcbiAgX3dvcmtpbmdEaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5IHwgUmVtb3RlRGlyZWN0b3J5O1xuICBfcHJvamVjdERpcmVjdG9yeTogYXRvbSREaXJlY3Rvcnk7XG4gIF9vcmlnaW5VUkw6ID9zdHJpbmc7XG4gIF9zZXJ2aWNlOiBIZ1NlcnZpY2U7XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICAvLyBBIG1hcCBmcm9tIGEga2V5IChpbiBtb3N0IGNhc2VzLCBhIGZpbGUgcGF0aCksIHRvIGEgcmVsYXRlZCBEaXNwb3NhYmxlLlxuICBfZGlzcG9zYWJsZXM6IHtba2V5OiBzdHJpbmddOiBJRGlzcG9zYWJsZX07XG4gIF9oZ1N0YXR1c0NhY2hlOiB7W2ZpbGVQYXRoOiBOdWNsaWRlVXJpXTogU3RhdHVzQ29kZUlkVmFsdWV9O1xuICAvLyBNYXAgb2YgZGlyZWN0b3J5IHBhdGggdG8gdGhlIG51bWJlciBvZiBtb2RpZmllZCBmaWxlcyB3aXRoaW4gdGhhdCBkaXJlY3RvcnkuXG4gIF9tb2RpZmllZERpcmVjdG9yeUNhY2hlOiBNYXA8c3RyaW5nLCBudW1iZXI+O1xuICBfaGdEaWZmQ2FjaGU6IHtbZmlsZVBhdGg6IE51Y2xpZGVVcmldOiBEaWZmSW5mb307XG4gIF9oZ0RpZmZDYWNoZUZpbGVzVXBkYXRpbmc6IFNldDxOdWNsaWRlVXJpPjtcbiAgX2hnRGlmZkNhY2hlRmlsZXNUb0NsZWFyOiBTZXQ8TnVjbGlkZVVyaT47XG5cbiAgX2N1cnJlbnRCb29rbWFyazogP3N0cmluZztcbiAgX3NlcmlhbGl6ZWRSZWZyZXNoU3RhdHVzZXNDYWNoZTogKCkgPT4gUHJvbWlzZTx2b2lkPjtcblxuICBjb25zdHJ1Y3RvcihyZXBvUGF0aDogc3RyaW5nLCBoZ1NlcnZpY2U6IEhnU2VydmljZSwgb3B0aW9uczogSGdSZXBvc2l0b3J5T3B0aW9ucykge1xuICAgIC8vICRGbG93SXNzdWU6IGBhc3luY2Agbm90IGFibGUgdG8gYmUgYW5ub3RhdGVkIG9uIGNsYXNzZXNcbiAgICB0aGlzLmFzeW5jID0gbmV3IEhnUmVwb3NpdG9yeUNsaWVudEFzeW5jKHRoaXMpO1xuXG4gICAgdGhpcy5fcGF0aCA9IHJlcG9QYXRoO1xuICAgIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkgPSBvcHRpb25zLndvcmtpbmdEaXJlY3Rvcnk7XG4gICAgdGhpcy5fcHJvamVjdERpcmVjdG9yeSA9IG9wdGlvbnMucHJvamVjdFJvb3REaXJlY3Rvcnk7XG4gICAgdGhpcy5fb3JpZ2luVVJMID0gb3B0aW9ucy5vcmlnaW5VUkw7XG4gICAgdGhpcy5fc2VydmljZSA9IGhnU2VydmljZTtcblxuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0ge307XG5cbiAgICB0aGlzLl9oZ1N0YXR1c0NhY2hlID0ge307XG4gICAgdGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZSA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuX2hnRGlmZkNhY2hlID0ge307XG4gICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2hnRGlmZkNhY2hlRmlsZXNUb0NsZWFyID0gbmV3IFNldCgpO1xuXG4gICAgdGhpcy5fc2VyaWFsaXplZFJlZnJlc2hTdGF0dXNlc0NhY2hlID0gc2VyaWFsaXplQXN5bmNDYWxsKFxuICAgICAgdGhpcy5fcmVmcmVzaFN0YXR1c2VzT2ZBbGxGaWxlc0luQ2FjaGUuYmluZCh0aGlzKSxcbiAgICApO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXNbRURJVE9SX1NVQlNDUklQVElPTl9OQU1FXSA9IGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyhlZGl0b3IgPT4ge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgICAvLyBUT0RPOiBvYnNlcnZlIGZvciB3aGVuIHRoaXMgZWRpdG9yJ3MgcGF0aCBjaGFuZ2VzLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuX2lzUGF0aFJlbGV2YW50KGZpbGVQYXRoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBJZiB0aGlzIGVkaXRvciBoYXMgYmVlbiBwcmV2aW91c2x5IGFjdGl2ZSwgd2Ugd2lsbCBoYXZlIGFscmVhZHlcbiAgICAgIC8vIGluaXRpYWxpemVkIGRpZmYgaW5mbyBhbmQgcmVnaXN0ZXJlZCBsaXN0ZW5lcnMgb24gaXQuXG4gICAgICBpZiAodGhpcy5fZGlzcG9zYWJsZXNbZmlsZVBhdGhdKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFRPRE8gKHQ4MjI3NTcwKSBHZXQgaW5pdGlhbCBkaWZmIHN0YXRzIGZvciB0aGlzIGVkaXRvciwgYW5kIHJlZnJlc2hcbiAgICAgIC8vIHRoaXMgaW5mb3JtYXRpb24gd2hlbmV2ZXIgdGhlIGNvbnRlbnQgb2YgdGhlIGVkaXRvciBjaGFuZ2VzLlxuICAgICAgY29uc3QgZWRpdG9yU3Vic2NyaXB0aW9ucyA9IHRoaXMuX2Rpc3Bvc2FibGVzW2ZpbGVQYXRoXSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChlZGl0b3Iub25EaWRTYXZlKGV2ZW50ID0+IHtcbiAgICAgICAgdGhpcy5fdXBkYXRlRGlmZkluZm8oW2V2ZW50LnBhdGhdKTtcbiAgICAgIH0pKTtcbiAgICAgIC8vIFJlbW92ZSB0aGUgZmlsZSBmcm9tIHRoZSBkaWZmIHN0YXRzIGNhY2hlIHdoZW4gdGhlIGVkaXRvciBpcyBjbG9zZWQuXG4gICAgICAvLyBUaGlzIGlzbid0IHN0cmljdGx5IG5lY2Vzc2FyeSwgYnV0IGtlZXBzIHRoZSBjYWNoZSBhcyBzbWFsbCBhcyBwb3NzaWJsZS5cbiAgICAgIC8vIFRoZXJlIGFyZSBjYXNlcyB3aGVyZSB0aGlzIHJlbW92YWwgbWF5IHJlc3VsdCBpbiByZW1vdmluZyBpbmZvcm1hdGlvblxuICAgICAgLy8gdGhhdCBpcyBzdGlsbCByZWxldmFudDogZS5nLlxuICAgICAgLy8gICAqIGlmIHRoZSB1c2VyIHZlcnkgcXVpY2tseSBjbG9zZXMgYW5kIHJlb3BlbnMgYSBmaWxlOyBvclxuICAgICAgLy8gICAqIGlmIHRoZSBmaWxlIGlzIG9wZW4gaW4gbXVsdGlwbGUgZWRpdG9ycywgYW5kIG9uZSBvZiB0aG9zZSBpcyBjbG9zZWQuXG4gICAgICAvLyBUaGVzZSBhcmUgcHJvYmFibHkgZWRnZSBjYXNlcywgdGhvdWdoLCBhbmQgdGhlIGluZm9ybWF0aW9uIHdpbGwgYmVcbiAgICAgIC8vIHJlZmV0Y2hlZCB0aGUgbmV4dCB0aW1lIHRoZSBmaWxlIGlzIGVkaXRlZC5cbiAgICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVG9DbGVhci5hZGQoZmlsZVBhdGgpO1xuICAgICAgICB0aGlzLl9kaXNwb3NhYmxlc1tmaWxlUGF0aF0uZGlzcG9zZSgpO1xuICAgICAgICBkZWxldGUgdGhpcy5fZGlzcG9zYWJsZXNbZmlsZVBhdGhdO1xuICAgICAgfSkpO1xuICAgIH0pO1xuXG4gICAgLy8gUmVnYXJkbGVzcyBvZiBob3cgZnJlcXVlbnRseSB0aGUgc2VydmljZSBzZW5kcyBmaWxlIGNoYW5nZSB1cGRhdGVzLFxuICAgIC8vIE9ubHkgb25lIGJhdGNoZWQgc3RhdHVzIHVwZGF0ZSBjYW4gYmUgcnVubmluZyBhdCBhbnkgcG9pbnQgb2YgdGltZS5cbiAgICBjb25zdCB0b1VwZGF0ZUNoYW5nZWRQYXRocyA9IFtdO1xuICAgIGNvbnN0IHNlcmlhbGl6ZWRVcGRhdGVDaGFuZ2VkUGF0aHMgPSBzZXJpYWxpemVBc3luY0NhbGwoKCkgPT4ge1xuICAgICAgLy8gU2VuZCBhIGJhdGNoZWQgdXBkYXRlIGFuZCBjbGVhciB0aGUgcGVuZGluZyBjaGFuZ2VzLlxuICAgICAgcmV0dXJuIHRoaXMuX3VwZGF0ZUNoYW5nZWRQYXRocyh0b1VwZGF0ZUNoYW5nZWRQYXRocy5zcGxpY2UoMCkpO1xuICAgIH0pO1xuICAgIGNvbnN0IG9uRmlsZXNDaGFuZ2VzID0gKGNoYW5nZWRQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4pID0+IHtcbiAgICAgIHRvVXBkYXRlQ2hhbmdlZFBhdGhzLnB1c2goLi4uY2hhbmdlZFBhdGhzKTtcbiAgICAgIC8vIFdpbGwgdHJpZ2dlciBhbiB1cGRhdGUgaW1tZWRpYXRlbHkgaWYgbm8gb3RoZXIgYXN5bmMgY2FsbCBpcyBhY3RpdmUuXG4gICAgICAvLyBPdGhlcndpc2UsIHdpbGwgc2NoZWR1bGUgYW4gYXN5bmMgY2FsbCB3aGVuIGl0J3MgZG9uZS5cbiAgICAgIHNlcmlhbGl6ZWRVcGRhdGVDaGFuZ2VkUGF0aHMoKTtcbiAgICB9O1xuICAgIC8vIEdldCB1cGRhdGVzIHRoYXQgdGVsbCB0aGUgSGdSZXBvc2l0b3J5Q2xpZW50IHdoZW4gdG8gY2xlYXIgaXRzIGNhY2hlcy5cbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVGaWxlc0RpZENoYW5nZSgpLnN1YnNjcmliZShvbkZpbGVzQ2hhbmdlcyk7XG4gICAgdGhpcy5fc2VydmljZS5vYnNlcnZlSGdJZ25vcmVGaWxlRGlkQ2hhbmdlKClcbiAgICAgIC5zdWJzY3JpYmUodGhpcy5fc2VyaWFsaXplZFJlZnJlc2hTdGF0dXNlc0NhY2hlKTtcbiAgICB0aGlzLl9zZXJ2aWNlLm9ic2VydmVIZ1JlcG9TdGF0ZURpZENoYW5nZSgpXG4gICAgICAuc3Vic2NyaWJlKHRoaXMuX3NlcmlhbGl6ZWRSZWZyZXNoU3RhdHVzZXNDYWNoZSk7XG4gICAgdGhpcy5fc2VydmljZS5vYnNlcnZlSGdCb29rbWFya0RpZENoYW5nZSgpXG4gICAgICAuc3Vic2NyaWJlKHRoaXMuZmV0Y2hDdXJyZW50Qm9va21hcmsuYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWRlc3Ryb3knKTtcbiAgICB0aGlzLl9lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLl9kaXNwb3NhYmxlcykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXNba2V5XS5kaXNwb3NlKCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VydmljZS5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogRXZlbnQgU3Vic2NyaXB0aW9uXG4gICAqXG4gICAqL1xuXG4gIG9uRGlkRGVzdHJveShjYWxsYmFjazogKCkgPT4gbWl4ZWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChldmVudDoge3BhdGg6IHN0cmluZzsgcGF0aFN0YXR1czogU3RhdHVzQ29kZU51bWJlclZhbHVlfSkgPT4gbWl4ZWQsXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignZGlkLWNoYW5nZS1zdGF0dXMnLCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZVN0YXR1c2VzKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbignZGlkLWNoYW5nZS1zdGF0dXNlcycsIGNhbGxiYWNrKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJlcG9zaXRvcnkgRGV0YWlsc1xuICAgKlxuICAgKi9cblxuICBnZXRUeXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdoZyc7XG4gIH1cblxuICBnZXRQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3BhdGg7XG4gIH1cblxuICBnZXRXb3JraW5nRGlyZWN0b3J5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICB9XG5cbiAgLy8gQHJldHVybiBUaGUgcGF0aCBvZiB0aGUgcm9vdCBwcm9qZWN0IGZvbGRlciBpbiBBdG9tIHRoYXQgdGhpc1xuICAvLyBIZ1JlcG9zaXRvcnlDbGllbnQgcHJvdmlkZXMgaW5mb3JtYXRpb24gYWJvdXQuXG4gIGdldFByb2plY3REaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvamVjdERpcmVjdG9yeS5nZXRQYXRoKCk7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBpc1Byb2plY3RBdFJvb3QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZWxhdGl2aXplKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fd29ya2luZ0RpcmVjdG9yeS5yZWxhdGl2aXplKGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGhhc0JyYW5jaChicmFuY2g6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIFRoZSBjdXJyZW50IEhnIGJvb2ttYXJrLlxuICAgKi9cbiAgZ2V0U2hvcnRIZWFkKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMuX2N1cnJlbnRCb29rbWFyaykge1xuICAgICAgLy8gS2ljayBvZmYgYSBmZXRjaCB0byBnZXQgdGhlIGN1cnJlbnQgYm9va21hcmsuIFRoaXMgaXMgYXN5bmMuXG4gICAgICAvLyAkRmxvd0lzc3VlOiBgYXN5bmNgIG5vdCBhYmxlIHRvIGJlIGFubm90YXRlZCBvbiBjbGFzc2VzXG4gICAgICB0aGlzLmFzeW5jLmdldFNob3J0SGVhZCgpO1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEJvb2ttYXJrO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgaXNTdWJtb2R1bGUocGF0aDogTnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldEFoZWFkQmVoaW5kQ291bnQocmVmZXJlbmNlOiBzdHJpbmcsIHBhdGg6IE51Y2xpZGVVcmkpOiBudW1iZXIge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0Q2FjaGVkVXBzdHJlYW1BaGVhZEJlaGluZENvdW50KHBhdGg6ID9OdWNsaWRlVXJpKToge2FoZWFkOiBudW1iZXI7IGJlaGluZDogbnVtYmVyO30ge1xuICAgIHJldHVybiB7XG4gICAgICBhaGVhZDogMCxcbiAgICAgIGJlaGluZDogMCxcbiAgICB9O1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0Q29uZmlnVmFsdWUoa2V5OiBzdHJpbmcsIHBhdGg6ID9zdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldE9yaWdpblVSTChwYXRoOiA/c3RyaW5nKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX29yaWdpblVSTDtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldFVwc3RyZWFtQnJhbmNoKHBhdGg6ID9zdHJpbmcpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGdldFJlZmVyZW5jZXMoXG4gICAgcGF0aDogP051Y2xpZGVVcmksXG4gICk6IHtoZWFkczogQXJyYXk8c3RyaW5nPjsgcmVtb3RlczogQXJyYXk8c3RyaW5nPjsgdGFnczogQXJyYXk8c3RyaW5nPjt9IHtcbiAgICByZXR1cm4ge1xuICAgICAgaGVhZHM6IFtdLFxuICAgICAgcmVtb3RlczogW10sXG4gICAgICB0YWdzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0UmVmZXJlbmNlVGFyZ2V0KHJlZmVyZW5jZTogc3RyaW5nLCBwYXRoOiA/TnVjbGlkZVVyaSk6ID9zdHJpbmcge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmVhZGluZyBTdGF0dXMgKHBhcml0eSB3aXRoIEdpdFJlcG9zaXRvcnkpXG4gICAqXG4gICAqL1xuXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIENhbiB3ZSBjaGFuZ2UgdGhlIEFQSSB0byBtYWtlIHRoaXMgbWV0aG9kIHJldHVybiBhIFByb21pc2U/XG4gIC8vIElmIG5vdCwgbWlnaHQgbmVlZCB0byBkbyBhIHN5bmNocm9ub3VzIGBoZyBzdGF0dXNgIHF1ZXJ5LlxuICBpc1BhdGhNb2RpZmllZChmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZFBhdGhTdGF0dXMgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoIWNhY2hlZFBhdGhTdGF0dXMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaXNTdGF0dXNNb2RpZmllZChTdGF0dXNDb2RlSWRUb051bWJlcltjYWNoZWRQYXRoU3RhdHVzXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETyAoamVzc2ljYWxpbikgQ2FuIHdlIGNoYW5nZSB0aGUgQVBJIHRvIG1ha2UgdGhpcyBtZXRob2QgcmV0dXJuIGEgUHJvbWlzZT9cbiAgLy8gSWYgbm90LCBtaWdodCBuZWVkIHRvIGRvIGEgc3luY2hyb25vdXMgYGhnIHN0YXR1c2AgcXVlcnkuXG4gIGlzUGF0aE5ldyhmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGNhY2hlZFBhdGhTdGF0dXMgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoIWNhY2hlZFBhdGhTdGF0dXMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaXNTdGF0dXNOZXcoU3RhdHVzQ29kZUlkVG9OdW1iZXJbY2FjaGVkUGF0aFN0YXR1c10pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIENhbiB3ZSBjaGFuZ2UgdGhlIEFQSSB0byBtYWtlIHRoaXMgbWV0aG9kIHJldHVybiBhIFByb21pc2U/XG4gIC8vIElmIG5vdCwgdGhpcyBtZXRob2QgbGllcyBhIGJpdCBieSB1c2luZyBjYWNoZWQgaW5mb3JtYXRpb24uXG4gIC8vIFRPRE8gKGplc3NpY2FsaW4pIE1ha2UgdGhpcyB3b3JrIGZvciBpZ25vcmVkIGRpcmVjdG9yaWVzLlxuICBpc1BhdGhJZ25vcmVkKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IGJvb2xlYW4ge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gYGhnIHN0YXR1cyAtaWAgZG9lcyBub3QgbGlzdCB0aGUgcmVwbyAodGhlIC5oZyBkaXJlY3RvcnkpLCBwcmVzdW1hYmx5XG4gICAgLy8gYmVjYXVzZSB0aGUgcmVwbyBkb2VzIG5vdCB0cmFjayBpdHNlbGYuXG4gICAgLy8gV2Ugd2FudCB0byByZXByZXNlbnQgdGhlIGZhY3QgdGhhdCBpdCdzIG5vdCBwYXJ0IG9mIHRoZSB0cmFja2VkIGNvbnRlbnRzLFxuICAgIC8vIHNvIHdlIG1hbnVhbGx5IGFkZCBhbiBleGNlcHRpb24gZm9yIGl0IHZpYSB0aGUgX2lzUGF0aFdpdGhpbkhnUmVwbyBjaGVjay5cbiAgICBjb25zdCBjYWNoZWRQYXRoU3RhdHVzID0gdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgaWYgKCFjYWNoZWRQYXRoU3RhdHVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5faXNQYXRoV2l0aGluSGdSZXBvKGZpbGVQYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaXNTdGF0dXNJZ25vcmVkKFN0YXR1c0NvZGVJZFRvTnVtYmVyW2NhY2hlZFBhdGhTdGF0dXNdKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBwYXRoIGlzIHdpdGhpbiB0aGUgcmVwbyBkaXJlY3RvcnkgKGkuZS4gYC5oZy9gKS5cbiAgICovXG4gIF9pc1BhdGhXaXRoaW5IZ1JlcG8oZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKGZpbGVQYXRoID09PSB0aGlzLmdldFBhdGgoKSkgfHwgKGZpbGVQYXRoLmluZGV4T2YodGhpcy5nZXRQYXRoKCkgKyAnLycpID09PSAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciBhIHBhdGggaXMgcmVsZXZhbnQgdG8gdGhpcyBIZ1JlcG9zaXRvcnlDbGllbnQuIEEgcGF0aCBpc1xuICAgKiBkZWZpbmVkIGFzICdyZWxldmFudCcgaWYgaXQgaXMgd2l0aGluIHRoZSBwcm9qZWN0IGRpcmVjdG9yeSBvcGVuZWQgd2l0aGluIHRoZSByZXBvLlxuICAgKi9cbiAgX2lzUGF0aFJlbGV2YW50KGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2plY3REaXJlY3RvcnkuY29udGFpbnMoZmlsZVBhdGgpIHx8XG4gICAgICAgICAgICh0aGlzLl9wcm9qZWN0RGlyZWN0b3J5LmdldFBhdGgoKSA9PT0gZmlsZVBhdGgpO1xuICB9XG5cbiAgLy8gRm9yIG5vdywgdGhpcyBtZXRob2Qgb25seSByZWZsZWN0cyB0aGUgc3RhdHVzIG9mIFwibW9kaWZpZWRcIiBkaXJlY3Rvcmllcy5cbiAgLy8gVHJhY2tpbmcgZGlyZWN0b3J5IHN0YXR1cyBpc24ndCBzdHJhaWdodGZvcndhcmQsIGFzIEhnIG9ubHkgdHJhY2tzIGZpbGVzLlxuICAvLyBodHRwOi8vbWVyY3VyaWFsLnNlbGVuaWMuY29tL3dpa2kvRkFRI0ZBUS4yRkNvbW1vblByb2JsZW1zLklfdHJpZWRfdG9fY2hlY2tfaW5fYW5fZW1wdHlfZGlyZWN0b3J5X2FuZF9pdF9mYWlsZWQuMjFcbiAgLy8gVE9ETzogTWFrZSB0aGlzIG1ldGhvZCByZWZsZWN0IE5ldyBhbmQgSWdub3JlZCBzdGF0dXNlcy5cbiAgZ2V0RGlyZWN0b3J5U3RhdHVzKGRpcmVjdG9yeVBhdGg6ID9zdHJpbmcpOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWUge1xuICAgIGlmICghZGlyZWN0b3J5UGF0aCkge1xuICAgICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU47XG4gICAgfVxuICAgIGNvbnN0IGRpcmVjdG9yeVBhdGhXaXRoU2VwYXJhdG9yID0gZW5zdXJlVHJhaWxpbmdTZXBhcmF0b3IoZGlyZWN0b3J5UGF0aCk7XG4gICAgaWYgKHRoaXMuX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGUuaGFzKGRpcmVjdG9yeVBhdGhXaXRoU2VwYXJhdG9yKSkge1xuICAgICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQ7XG4gICAgfVxuICAgIHJldHVybiBTdGF0dXNDb2RlTnVtYmVyLkNMRUFOO1xuICB9XG5cbiAgLy8gV2UgZG9uJ3Qgd2FudCB0byBkbyBhbnkgc3luY2hyb25vdXMgJ2hnIHN0YXR1cycgY2FsbHMuIEp1c3QgdXNlIGNhY2hlZCB2YWx1ZXMuXG4gIGdldFBhdGhTdGF0dXMoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWUge1xuICAgIHJldHVybiB0aGlzLmdldENhY2hlZFBhdGhTdGF0dXMoZmlsZVBhdGgpO1xuICB9XG5cbiAgZ2V0Q2FjaGVkUGF0aFN0YXR1cyhmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWUge1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBTdGF0dXNDb2RlTnVtYmVyLkNMRUFOO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZWRTdGF0dXMgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoY2FjaGVkU3RhdHVzKSB7XG4gICAgICByZXR1cm4gU3RhdHVzQ29kZUlkVG9OdW1iZXJbY2FjaGVkU3RhdHVzXTtcbiAgICB9XG4gICAgcmV0dXJuIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU47XG4gIH1cblxuICBnZXRBbGxQYXRoU3RhdHVzZXMoKToge1tmaWxlUGF0aDogTnVjbGlkZVVyaV06IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZX0ge1xuICAgIGNvbnN0IHBhdGhTdGF0dXNlcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBpbiB0aGlzLl9oZ1N0YXR1c0NhY2hlKSB7XG4gICAgICBwYXRoU3RhdHVzZXNbZmlsZVBhdGhdID0gU3RhdHVzQ29kZUlkVG9OdW1iZXJbdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF1dO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aFN0YXR1c2VzO1xuICB9XG5cbiAgaXNTdGF0dXNNb2RpZmllZChzdGF0dXM6ID9udW1iZXIpOiBib29sZWFuIHtcbiAgICAvLyAkRmxvd0lzc3VlOiBgYXN5bmNgIG5vdCBhYmxlIHRvIGJlIGFubm90YXRlZCBvbiBjbGFzc2VzXG4gICAgcmV0dXJuIHRoaXMuYXN5bmMuaXNTdGF0dXNNb2RpZmllZChzdGF0dXMpO1xuICB9XG5cbiAgaXNTdGF0dXNOZXcoc3RhdHVzOiA/bnVtYmVyKTogYm9vbGVhbiB7XG4gICAgLy8gJEZsb3dJc3N1ZTogYGFzeW5jYCBub3QgYWJsZSB0byBiZSBhbm5vdGF0ZWQgb24gY2xhc3Nlc1xuICAgIHJldHVybiB0aGlzLmFzeW5jLmlzU3RhdHVzTmV3KHN0YXR1cyk7XG4gIH1cblxuICBpc1N0YXR1c0lnbm9yZWQoc3RhdHVzOiA/bnVtYmVyKTogYm9vbGVhbiB7XG4gICAgLy8gJEZsb3dJc3N1ZTogYGFzeW5jYCBub3QgYWJsZSB0byBiZSBhbm5vdGF0ZWQgb24gY2xhc3Nlc1xuICAgIHJldHVybiB0aGlzLmFzeW5jLmlzU3RhdHVzSWdub3JlZChzdGF0dXMpO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogUmVhZGluZyBIZyBTdGF0dXMgKGFzeW5jIG1ldGhvZHMpXG4gICAqXG4gICAqL1xuXG4gIC8qKlxuICAgKiBSZWNvbW1lbmRlZCBtZXRob2QgdG8gdXNlIHRvIGdldCB0aGUgc3RhdHVzIG9mIGZpbGVzIGluIHRoaXMgcmVwby5cbiAgICogQHBhcmFtIHBhdGhzIEFuIGFycmF5IG9mIGZpbGUgcGF0aHMgdG8gZ2V0IHRoZSBzdGF0dXMgZm9yLiBJZiBhIHBhdGggaXMgbm90IGluIHRoZVxuICAgKiAgIHByb2plY3QsIGl0IHdpbGwgYmUgaWdub3JlZC5cbiAgICogU2VlIEhnU2VydmljZTo6Z2V0U3RhdHVzZXMgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAqL1xuICBhc3luYyBnZXRTdGF0dXNlcyhcbiAgICBwYXRoczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zPzogSGdTdGF0dXNDb21tYW5kT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxNYXA8TnVjbGlkZVVyaSwgU3RhdHVzQ29kZU51bWJlclZhbHVlPj4ge1xuICAgIGNvbnN0IHN0YXR1c01hcCA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBpc1JlbGF2YW50U3RhdHVzID0gdGhpcy5fZ2V0UHJlZGljYXRlRm9yUmVsZXZhbnRTdGF0dXNlcyhvcHRpb25zKTtcblxuICAgIC8vIENoZWNrIHRoZSBjYWNoZS5cbiAgICAvLyBOb3RlOiBJZiBwYXRocyBpcyBlbXB0eSwgYSBmdWxsIGBoZyBzdGF0dXNgIHdpbGwgYmUgcnVuLCB3aGljaCBmb2xsb3dzIHRoZSBzcGVjLlxuICAgIGNvbnN0IHBhdGhzV2l0aENhY2hlTWlzcyA9IFtdO1xuICAgIHBhdGhzLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgICAgY29uc3Qgc3RhdHVzSWQgPSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgIGlmIChzdGF0dXNJZCkge1xuICAgICAgICBpZiAoIWlzUmVsYXZhbnRTdGF0dXMoc3RhdHVzSWQpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN0YXR1c01hcC5zZXQoZmlsZVBhdGgsIFN0YXR1c0NvZGVJZFRvTnVtYmVyW3N0YXR1c0lkXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXRoc1dpdGhDYWNoZU1pc3MucHVzaChmaWxlUGF0aCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBGZXRjaCBhbnkgdW5jYWNoZWQgc3RhdHVzZXMuXG4gICAgaWYgKHBhdGhzV2l0aENhY2hlTWlzcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IG5ld1N0YXR1c0luZm8gPSBhd2FpdCB0aGlzLl91cGRhdGVTdGF0dXNlcyhwYXRoc1dpdGhDYWNoZU1pc3MsIG9wdGlvbnMpO1xuICAgICAgbmV3U3RhdHVzSW5mby5mb3JFYWNoKChzdGF0dXMsIGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIHN0YXR1c01hcC5zZXQoZmlsZVBhdGgsIFN0YXR1c0NvZGVJZFRvTnVtYmVyW3N0YXR1c10pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBzdGF0dXNNYXA7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgc3RhdHVzZXMgZm9yIHRoZSBnaXZlbiBmaWxlIHBhdGhzLCBhbmQgdXBkYXRlcyB0aGUgY2FjaGUgYW5kXG4gICAqIHNlbmRzIG91dCBjaGFuZ2UgZXZlbnRzIGFzIGFwcHJvcHJpYXRlLlxuICAgKiBAcGFyYW0gZmlsZVBhdGhzIEFuIGFycmF5IG9mIGZpbGUgcGF0aHMgdG8gdXBkYXRlIHRoZSBzdGF0dXMgZm9yLiBJZiBhIHBhdGhcbiAgICogICBpcyBub3QgaW4gdGhlIHByb2plY3QsIGl0IHdpbGwgYmUgaWdub3JlZC5cbiAgICovXG4gIGFzeW5jIF91cGRhdGVTdGF0dXNlcyhcbiAgICBmaWxlUGF0aHM6IEFycmF5PHN0cmluZz4sXG4gICAgb3B0aW9uczogP0hnU3RhdHVzQ29tbWFuZE9wdGlvbnMsXG4gICk6IFByb21pc2U8TWFwPE51Y2xpZGVVcmksIFN0YXR1c0NvZGVJZFZhbHVlPj4ge1xuICAgIGNvbnN0IHBhdGhzSW5SZXBvID0gZmlsZVBhdGhzLmZpbHRlcihmaWxlUGF0aCA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5faXNQYXRoUmVsZXZhbnQoZmlsZVBhdGgpO1xuICAgIH0pO1xuICAgIGlmIChwYXRoc0luUmVwby5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdHVzTWFwUGF0aFRvU3RhdHVzSWQgPSBhd2FpdCB0aGlzLl9zZXJ2aWNlLmZldGNoU3RhdHVzZXMocGF0aHNJblJlcG8sIG9wdGlvbnMpO1xuXG4gICAgY29uc3QgcXVlcmllZEZpbGVzID0gbmV3IFNldChwYXRoc0luUmVwbyk7XG4gICAgY29uc3Qgc3RhdHVzQ2hhbmdlRXZlbnRzID0gW107XG4gICAgc3RhdHVzTWFwUGF0aFRvU3RhdHVzSWQuZm9yRWFjaCgobmV3U3RhdHVzSWQsIGZpbGVQYXRoKSA9PiB7XG5cbiAgICAgIGNvbnN0IG9sZFN0YXR1cyA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgaWYgKG9sZFN0YXR1cyAmJiAob2xkU3RhdHVzICE9PSBuZXdTdGF0dXNJZCkgfHxcbiAgICAgICAgICAhb2xkU3RhdHVzICYmIChuZXdTdGF0dXNJZCAhPT0gU3RhdHVzQ29kZUlkLkNMRUFOKSkge1xuICAgICAgICBzdGF0dXNDaGFuZ2VFdmVudHMucHVzaCh7XG4gICAgICAgICAgcGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgcGF0aFN0YXR1czogU3RhdHVzQ29kZUlkVG9OdW1iZXJbbmV3U3RhdHVzSWRdLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG5ld1N0YXR1c0lkID09PSBTdGF0dXNDb2RlSWQuQ0xFQU4pIHtcbiAgICAgICAgICAvLyBEb24ndCBib3RoZXIga2VlcGluZyAnY2xlYW4nIGZpbGVzIGluIHRoZSBjYWNoZS5cbiAgICAgICAgICBkZWxldGUgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgICAgdGhpcy5fcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoZmlsZVBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdID0gbmV3U3RhdHVzSWQ7XG4gICAgICAgICAgaWYgKG5ld1N0YXR1c0lkID09PSBTdGF0dXNDb2RlSWQuTU9ESUZJRUQpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZEFsbFBhcmVudERpcmVjdG9yaWVzVG9DYWNoZShmaWxlUGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBxdWVyaWVkRmlsZXMuZGVsZXRlKGZpbGVQYXRoKTtcbiAgICB9KTtcblxuICAgIC8vIElmIHRoZSBzdGF0dXNlcyB3ZXJlIGZldGNoZWQgZm9yIG9ubHkgY2hhbmdlZCAoYGhnIHN0YXR1c2ApIG9yXG4gICAgLy8gaWdub3JlZCAoJ2hnIHN0YXR1cyAtLWlnbm9yZWRgKSBmaWxlcywgYSBxdWVyaWVkIGZpbGUgbWF5IG5vdCBiZVxuICAgIC8vIHJldHVybmVkIGluIHRoZSByZXNwb25zZS4gSWYgaXQgd2Fzbid0IHJldHVybmVkLCB0aGlzIG1lYW5zIGl0cyBzdGF0dXNcbiAgICAvLyBtYXkgaGF2ZSBjaGFuZ2VkLCBpbiB3aGljaCBjYXNlIGl0IHNob3VsZCBiZSByZW1vdmVkIGZyb20gdGhlIGhnU3RhdHVzQ2FjaGUuXG4gICAgLy8gTm90ZTogd2UgZG9uJ3Qga25vdyB0aGUgcmVhbCB1cGRhdGVkIHN0YXR1cyBvZiB0aGUgZmlsZSwgc28gZG9uJ3Qgc2VuZCBhIGNoYW5nZSBldmVudC5cbiAgICAvLyBUT0RPIChqZXNzaWNhbGluKSBDYW4gd2UgbWFrZSB0aGUgJ3BhdGhTdGF0dXMnIGZpZWxkIGluIHRoZSBjaGFuZ2UgZXZlbnQgb3B0aW9uYWw/XG4gICAgLy8gVGhlbiB3ZSBjYW4gc2VuZCB0aGVzZSBldmVudHMuXG4gICAgY29uc3QgaGdTdGF0dXNPcHRpb24gPSB0aGlzLl9nZXRTdGF0dXNPcHRpb24ob3B0aW9ucyk7XG4gICAgaWYgKGhnU3RhdHVzT3B0aW9uID09PSBIZ1N0YXR1c09wdGlvbi5PTkxZX0lHTk9SRUQpIHtcbiAgICAgIHF1ZXJpZWRGaWxlcy5mb3JFYWNoKGZpbGVQYXRoID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdID09PSBTdGF0dXNDb2RlSWQuSUdOT1JFRCkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9oZ1N0YXR1c0NhY2hlW2ZpbGVQYXRoXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChoZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTKSB7XG4gICAgICAvLyBJZiBIZ1N0YXR1c09wdGlvbi5BTExfU1RBVFVTRVMgd2FzIHBhc3NlZCBhbmQgYSBmaWxlIGRvZXMgbm90IGFwcGVhciBpblxuICAgICAgLy8gdGhlIHJlc3VsdHMsIGl0IG11c3QgbWVhbiB0aGUgZmlsZSB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBmaWxlc3lzdGVtLlxuICAgICAgcXVlcmllZEZpbGVzLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgICAgICBjb25zdCBjYWNoZWRTdGF0dXNJZCA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICBkZWxldGUgdGhpcy5faGdTdGF0dXNDYWNoZVtmaWxlUGF0aF07XG4gICAgICAgIGlmIChjYWNoZWRTdGF0dXNJZCA9PT0gU3RhdHVzQ29kZUlkLk1PRElGSUVEKSB7XG4gICAgICAgICAgdGhpcy5fcmVtb3ZlQWxsUGFyZW50RGlyZWN0b3JpZXNGcm9tQ2FjaGUoZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcmllZEZpbGVzLmZvckVhY2goZmlsZVBhdGggPT4ge1xuICAgICAgICBjb25zdCBjYWNoZWRTdGF0dXNJZCA9IHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICBpZiAoY2FjaGVkU3RhdHVzSWQgIT09IFN0YXR1c0NvZGVJZC5JR05PUkVEKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2hnU3RhdHVzQ2FjaGVbZmlsZVBhdGhdO1xuICAgICAgICAgIGlmIChjYWNoZWRTdGF0dXNJZCA9PT0gU3RhdHVzQ29kZUlkLk1PRElGSUVEKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZShmaWxlUGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBFbWl0IGNoYW5nZSBldmVudHMgb25seSBhZnRlciB0aGUgY2FjaGUgaGFzIGJlZW4gZnVsbHkgdXBkYXRlZC5cbiAgICBzdGF0dXNDaGFuZ2VFdmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc3RhdHVzJywgZXZlbnQpO1xuICAgIH0pO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1zdGF0dXNlcycpO1xuXG4gICAgcmV0dXJuIHN0YXR1c01hcFBhdGhUb1N0YXR1c0lkO1xuICB9XG5cbiAgX2FkZEFsbFBhcmVudERpcmVjdG9yaWVzVG9DYWNoZShmaWxlUGF0aDogTnVjbGlkZVVyaSkge1xuICAgIGFkZEFsbFBhcmVudERpcmVjdG9yaWVzVG9DYWNoZShcbiAgICAgIHRoaXMuX21vZGlmaWVkRGlyZWN0b3J5Q2FjaGUsXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIHRoaXMuX3Byb2plY3REaXJlY3RvcnkuZ2V0UGFyZW50KCkuZ2V0UGF0aCgpXG4gICAgKTtcbiAgfVxuXG4gIF9yZW1vdmVBbGxQYXJlbnREaXJlY3Rvcmllc0Zyb21DYWNoZShmaWxlUGF0aDogTnVjbGlkZVVyaSkge1xuICAgIHJlbW92ZUFsbFBhcmVudERpcmVjdG9yaWVzRnJvbUNhY2hlKFxuICAgICAgdGhpcy5fbW9kaWZpZWREaXJlY3RvcnlDYWNoZSxcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgdGhpcy5fcHJvamVjdERpcmVjdG9yeS5nZXRQYXJlbnQoKS5nZXRQYXRoKClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiBmb3IgOjpnZXRTdGF0dXNlcy5cbiAgICogUmV0dXJucyBhIGZpbHRlciBmb3Igd2hldGhlciBvciBub3QgdGhlIGdpdmVuIHN0YXR1cyBjb2RlIHNob3VsZCBiZVxuICAgKiByZXR1cm5lZCwgZ2l2ZW4gdGhlIHBhc3NlZC1pbiBvcHRpb25zIGZvciA6OmdldFN0YXR1c2VzLlxuICAgKi9cbiAgX2dldFByZWRpY2F0ZUZvclJlbGV2YW50U3RhdHVzZXMoXG4gICAgb3B0aW9uczogP0hnU3RhdHVzQ29tbWFuZE9wdGlvbnNcbiAgKTogKGNvZGU6IFN0YXR1c0NvZGVJZFZhbHVlKSA9PiBib29sZWFuIHtcbiAgICBjb25zdCBoZ1N0YXR1c09wdGlvbiA9IHRoaXMuX2dldFN0YXR1c09wdGlvbihvcHRpb25zKTtcblxuICAgIGlmIChoZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uT05MWV9JR05PUkVEKSB7XG4gICAgICByZXR1cm4gZmlsdGVyRm9yT25seUlnbm9yZWQ7XG4gICAgfSBlbHNlIGlmIChoZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTKSB7XG4gICAgICByZXR1cm4gZmlsdGVyRm9yQWxsU3RhdHVlcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZpbHRlckZvck9ubHlOb3RJZ25vcmVkO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJldHJpZXZpbmcgRGlmZnMgKHBhcml0eSB3aXRoIEdpdFJlcG9zaXRvcnkpXG4gICAqXG4gICAqL1xuXG4gIGdldERpZmZTdGF0cyhmaWxlUGF0aDogP051Y2xpZGVVcmkpOiB7YWRkZWQ6IG51bWJlcjsgZGVsZXRlZDogbnVtYmVyO30ge1xuICAgIGNvbnN0IGNsZWFuU3RhdHMgPSB7YWRkZWQ6IDAsIGRlbGV0ZWQ6IDB9O1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBjbGVhblN0YXRzO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZWREYXRhID0gdGhpcy5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdO1xuICAgIHJldHVybiBjYWNoZWREYXRhID8ge2FkZGVkOiBjYWNoZWREYXRhLmFkZGVkLCBkZWxldGVkOiBjYWNoZWREYXRhLmRlbGV0ZWR9IDpcbiAgICAgICAgY2xlYW5TdGF0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIExpbmVEaWZmIHRoYXQgZGVzY3JpYmVzIHRoZSBkaWZmcyBiZXR3ZWVuIHRoZSBnaXZlblxuICAgKiBmaWxlJ3MgYEhFQURgIGNvbnRlbnRzIGFuZCBpdHMgY3VycmVudCBjb250ZW50cy5cbiAgICogTk9URTogdGhpcyBtZXRob2QgY3VycmVudGx5IGlnbm9yZXMgdGhlIHBhc3NlZC1pbiB0ZXh0LCBhbmQgaW5zdGVhZCBkaWZmc1xuICAgKiBhZ2FpbnN0IHRoZSBjdXJyZW50bHkgc2F2ZWQgY29udGVudHMgb2YgdGhlIGZpbGUuXG4gICAqL1xuICAvLyBUT0RPIChqZXNzaWNhbGluKSBFeHBvcnQgdGhlIExpbmVEaWZmIHR5cGUgKGZyb20gaGctb3V0cHV0LWhlbHBlcnMpIHdoZW5cbiAgLy8gdHlwZXMgY2FuIGJlIGV4cG9ydGVkLlxuICAvLyBUT0RPIChqZXNzaWNhbGluKSBNYWtlIHRoaXMgbWV0aG9kIHdvcmsgd2l0aCB0aGUgcGFzc2VkLWluIGB0ZXh0YC4gdDYzOTE1NzlcbiAgZ2V0TGluZURpZmZzKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSwgdGV4dDogP3N0cmluZyk6IEFycmF5PExpbmVEaWZmPiB7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBkaWZmSW5mbyA9IHRoaXMuX2hnRGlmZkNhY2hlW2ZpbGVQYXRoXTtcbiAgICByZXR1cm4gZGlmZkluZm8gPyBkaWZmSW5mby5saW5lRGlmZnMgOiBbXTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJldHJpZXZpbmcgRGlmZnMgKGFzeW5jIG1ldGhvZHMpXG4gICAqXG4gICAqL1xuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBVc2UgeyNhc3luYy5nZXREaWZmU3RhdHN9IGluc3RlYWRcbiAgICpcbiAgICogUmVjb21tZW5kZWQgbWV0aG9kIHRvIHVzZSB0byBnZXQgdGhlIGRpZmYgc3RhdHMgb2YgZmlsZXMgaW4gdGhpcyByZXBvLlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgZmlsZSBwYXRoIHRvIGdldCB0aGUgc3RhdHVzIGZvci4gSWYgYSBwYXRoIGlzIG5vdCBpbiB0aGVcbiAgICogICBwcm9qZWN0LCBkZWZhdWx0IFwiY2xlYW5cIiBzdGF0cyB3aWxsIGJlIHJldHVybmVkLlxuICAgKi9cbiAgZ2V0RGlmZlN0YXRzRm9yUGF0aChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8e2FkZGVkOiBudW1iZXI7IGRlbGV0ZWQ6IG51bWJlcjt9PiB7XG4gICAgLy8gJEZsb3dJc3N1ZTogYGFzeW5jYCBub3QgYWJsZSB0byBiZSBhbm5vdGF0ZWQgb24gY2xhc3Nlc1xuICAgIHJldHVybiB0aGlzLmFzeW5jLmdldERpZmZTdGF0cyhmaWxlUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgVXNlIHsjYXN5bmMuZ2V0TGluZURpZmZzfSBpbnN0ZWFkXG4gICAqXG4gICAqIFJlY29tbWVuZGVkIG1ldGhvZCB0byB1c2UgdG8gZ2V0IHRoZSBsaW5lIGRpZmZzIG9mIGZpbGVzIGluIHRoaXMgcmVwby5cbiAgICogQHBhcmFtIHBhdGggVGhlIGFic29sdXRlIGZpbGUgcGF0aCB0byBnZXQgdGhlIGxpbmUgZGlmZnMgZm9yLiBJZiB0aGUgcGF0aCBcXFxuICAgKiAgIGlzIG5vdCBpbiB0aGUgcHJvamVjdCwgYW4gZW1wdHkgQXJyYXkgd2lsbCBiZSByZXR1cm5lZC5cbiAgICovXG4gIGdldExpbmVEaWZmc0ZvclBhdGgoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPEFycmF5PExpbmVEaWZmPj4ge1xuICAgIC8vICRGbG93SXNzdWU6IGBhc3luY2Agbm90IGFibGUgdG8gYmUgYW5ub3RhdGVkIG9uIGNsYXNzZXNcbiAgICByZXR1cm4gdGhpcy5hc3luYy5nZXRMaW5lRGlmZnMoZmlsZVBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGRpZmYgaW5mb3JtYXRpb24gZm9yIHRoZSBnaXZlbiBwYXRocywgYW5kIHVwZGF0ZXMgdGhlIGNhY2hlLlxuICAgKiBAcGFyYW0gQW4gYXJyYXkgb2YgYWJzb2x1dGUgZmlsZSBwYXRocyBmb3Igd2hpY2ggdG8gdXBkYXRlIHRoZSBkaWZmIGluZm8uXG4gICAqIEByZXR1cm4gQSBtYXAgb2YgZWFjaCBwYXRoIHRvIGl0cyBEaWZmSW5mby5cbiAgICogICBUaGlzIG1ldGhvZCBtYXkgcmV0dXJuIGBudWxsYCBpZiB0aGUgY2FsbCB0byBgaGcgZGlmZmAgZmFpbHMuXG4gICAqICAgQSBmaWxlIHBhdGggd2lsbCBub3QgYXBwZWFyIGluIHRoZSByZXR1cm5lZCBNYXAgaWYgaXQgaXMgbm90IGluIHRoZSByZXBvLFxuICAgKiAgIGlmIGl0IGhhcyBubyBjaGFuZ2VzLCBvciBpZiB0aGVyZSBpcyBhIHBlbmRpbmcgYGhnIGRpZmZgIGNhbGwgZm9yIGl0IGFscmVhZHkuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlRGlmZkluZm8oZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPik6IFByb21pc2U8P01hcDxOdWNsaWRlVXJpLCBEaWZmSW5mbz4+IHtcbiAgICBjb25zdCBwYXRoc1RvRmV0Y2ggPSBmaWxlUGF0aHMuZmlsdGVyKGFQYXRoID0+IHtcbiAgICAgIC8vIERvbid0IHRyeSB0byBmZXRjaCBpbmZvcm1hdGlvbiBmb3IgdGhpcyBwYXRoIGlmIGl0J3Mgbm90IGluIHRoZSByZXBvLlxuICAgICAgaWYgKCF0aGlzLl9pc1BhdGhSZWxldmFudChhUGF0aCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gRG9uJ3QgZG8gYW5vdGhlciB1cGRhdGUgZm9yIHRoaXMgcGF0aCBpZiB3ZSBhcmUgaW4gdGhlIG1pZGRsZSBvZiBydW5uaW5nIGFuIHVwZGF0ZS5cbiAgICAgIGlmICh0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVXBkYXRpbmcuaGFzKGFQYXRoKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVXBkYXRpbmcuYWRkKGFQYXRoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAocGF0aHNUb0ZldGNoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICAvLyBDYWxsIHRoZSBIZ1NlcnZpY2UgYW5kIHVwZGF0ZSBvdXIgY2FjaGUgd2l0aCB0aGUgcmVzdWx0cy5cbiAgICBjb25zdCBwYXRoc1RvRGlmZkluZm8gPSBhd2FpdCB0aGlzLl9zZXJ2aWNlLmZldGNoRGlmZkluZm8ocGF0aHNUb0ZldGNoKTtcbiAgICBpZiAocGF0aHNUb0RpZmZJbmZvKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWxlUGF0aCwgZGlmZkluZm9dIG9mIHBhdGhzVG9EaWZmSW5mbykge1xuICAgICAgICB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF0gPSBkaWZmSW5mbztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZmlsZXMgbWFya2VkIGZvciBkZWxldGlvbi5cbiAgICB0aGlzLl9oZ0RpZmZDYWNoZUZpbGVzVG9DbGVhci5mb3JFYWNoKGZpbGVUb0NsZWFyID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlVG9DbGVhcl07XG4gICAgfSk7XG4gICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1RvQ2xlYXIuY2xlYXIoKTtcblxuICAgIC8vIFRoZSBmZXRjaGVkIGZpbGVzIGNhbiBub3cgYmUgdXBkYXRlZCBhZ2Fpbi5cbiAgICBmb3IgKGNvbnN0IHBhdGhUb0ZldGNoIG9mIHBhdGhzVG9GZXRjaCkge1xuICAgICAgdGhpcy5faGdEaWZmQ2FjaGVGaWxlc1VwZGF0aW5nLmRlbGV0ZShwYXRoVG9GZXRjaCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyAodDkxMTM5MTMpIElkZWFsbHksIHdlIGNvdWxkIHNlbmQgbW9yZSB0YXJnZXRlZCBldmVudHMgdGhhdCBiZXR0ZXJcbiAgICAvLyBkZXNjcmliZSB3aGF0IGNoYW5nZSBoYXMgb2NjdXJyZWQuIFJpZ2h0IG5vdywgR2l0UmVwb3NpdG9yeSBkaWN0YXRlcyBlaXRoZXJcbiAgICAvLyAnZGlkLWNoYW5nZS1zdGF0dXMnIG9yICdkaWQtY2hhbmdlLXN0YXR1c2VzJy5cbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utc3RhdHVzZXMnKTtcbiAgICByZXR1cm4gcGF0aHNUb0RpZmZJbmZvO1xuICB9XG5cbiAgLyoqXG4gICpcbiAgKiBTZWN0aW9uOiBSZXRyaWV2aW5nIEJvb2ttYXJrIChhc3luYyBtZXRob2RzKVxuICAqXG4gICovXG5cbiAgLypcbiAgICogQGRlcHJlY2F0ZWQgVXNlIHsjYXN5bmMuZ2V0U2hvcnRIZWFkfSBpbnN0ZWFkXG4gICAqL1xuICBmZXRjaEN1cnJlbnRCb29rbWFyaygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIC8vICRGbG93SXNzdWU6IGBhc3luY2Agbm90IGFibGUgdG8gYmUgYW5ub3RhdGVkIG9uIGNsYXNzZXNcbiAgICByZXR1cm4gdGhpcy5hc3luYy5nZXRTaG9ydEhlYWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBTZWN0aW9uOiBDaGVja2luZyBPdXRcbiAgICpcbiAgICovXG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgY2hlY2tvdXRIZWFkKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRPRE8gVGhpcyBpcyBhIHN0dWIuXG4gIGNoZWNrb3V0UmVmZXJlbmNlKHJlZmVyZW5jZTogc3RyaW5nLCBjcmVhdGU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgVXNlIHsjYXN5bmMuY2hlY2tvdXRSZWZlcmVuY2V9IGluc3RlYWRcbiAgICpcbiAgICogVGhpcyBpcyB0aGUgYXN5bmMgdmVyc2lvbiBvZiB3aGF0IGNoZWNrb3V0UmVmZXJlbmNlKCkgaXMgbWVhbnQgdG8gZG8uXG4gICAqL1xuICBjaGVja291dFJldmlzaW9uKHJlZmVyZW5jZTogc3RyaW5nLCBjcmVhdGU6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyAkRmxvd0lzc3VlOiBgYXN5bmNgIG5vdCBhYmxlIHRvIGJlIGFubm90YXRlZCBvbiBjbGFzc2VzXG4gICAgcmV0dXJuIHRoaXMuYXN5bmMuY2hlY2tvdXRSZWZlcmVuY2UocmVmZXJlbmNlLCBjcmVhdGUpO1xuICB9XG5cblxuICAvKipcbiAgICpcbiAgICogU2VjdGlvbjogSGdTZXJ2aWNlIHN1YnNjcmlwdGlvbnNcbiAgICpcbiAgICovXG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGNhY2hlIGluIHJlc3BvbnNlIHRvIGFueSBudW1iZXIgb2YgKG5vbi0uaGdpZ25vcmUpIGZpbGVzIGNoYW5naW5nLlxuICAgKiBAcGFyYW0gdXBkYXRlIFRoZSBjaGFuZ2VkIGZpbGUgcGF0aHMuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlQ2hhbmdlZFBhdGhzKGNoYW5nZWRQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCByZWxldmFudENoYW5nZWRQYXRocyA9IGNoYW5nZWRQYXRocy5maWx0ZXIodGhpcy5faXNQYXRoUmVsZXZhbnQuYmluZCh0aGlzKSk7XG4gICAgaWYgKHJlbGV2YW50Q2hhbmdlZFBhdGhzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAocmVsZXZhbnRDaGFuZ2VkUGF0aHMubGVuZ3RoIDw9IE1BWF9JTkRJVklEVUFMX0NIQU5HRURfUEFUSFMpIHtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgc3RhdHVzZXMgaW5kaXZpZHVhbGx5LlxuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlU3RhdHVzZXMoXG4gICAgICAgIHJlbGV2YW50Q2hhbmdlZFBhdGhzLFxuICAgICAgICB7aGdTdGF0dXNPcHRpb246IEhnU3RhdHVzT3B0aW9uLkFMTF9TVEFUVVNFU30sXG4gICAgICApO1xuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlRGlmZkluZm8oXG4gICAgICAgIHJlbGV2YW50Q2hhbmdlZFBhdGhzLmZpbHRlcihmaWxlUGF0aCA9PiB0aGlzLl9oZ0RpZmZDYWNoZVtmaWxlUGF0aF0pLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhpcyBpcyBhIGhldXJpc3RpYyB0byBpbXByb3ZlIHBlcmZvcm1hbmNlLiBNYW55IGZpbGVzIGJlaW5nIGNoYW5nZWQgbWF5XG4gICAgICAvLyBiZSBhIHNpZ24gdGhhdCB3ZSBhcmUgcGlja2luZyB1cCBjaGFuZ2VzIHRoYXQgd2VyZSBjcmVhdGVkIGluIGFuIGF1dG9tYXRlZFxuICAgICAgLy8gd2F5IC0tIHNvIGluIGFkZGl0aW9uLCB0aGVyZSBtYXkgYmUgbWFueSBiYXRjaGVzIG9mIGNoYW5nZXMgaW4gc3VjY2Vzc2lvbi5cbiAgICAgIC8vIFRoZSByZWZyZXNoIGlzIHNlcmlhbGl6ZWQsIHNvIGl0IGlzIHNhZmUgdG8gY2FsbCBpdCBtdWx0aXBsZSB0aW1lcyBpbiBzdWNjZXNzaW9uLlxuICAgICAgYXdhaXQgdGhpcy5fc2VyaWFsaXplZFJlZnJlc2hTdGF0dXNlc0NhY2hlKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX3JlZnJlc2hTdGF0dXNlc09mQWxsRmlsZXNJbkNhY2hlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX2hnU3RhdHVzQ2FjaGUgPSB7fTtcbiAgICB0aGlzLl9tb2RpZmllZERpcmVjdG9yeUNhY2hlID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IHBhdGhzSW5EaWZmQ2FjaGUgPSBPYmplY3Qua2V5cyh0aGlzLl9oZ0RpZmZDYWNoZSk7XG4gICAgdGhpcy5faGdEaWZmQ2FjaGUgPSB7fTtcbiAgICAvLyBXZSBzaG91bGQgZ2V0IHRoZSBtb2RpZmllZCBzdGF0dXMgb2YgYWxsIGZpbGVzIGluIHRoZSByZXBvIHRoYXQgaXNcbiAgICAvLyB1bmRlciB0aGUgSGdSZXBvc2l0b3J5Q2xpZW50J3MgcHJvamVjdCBkaXJlY3RvcnksIGJlY2F1c2Ugd2hlbiBIZ1xuICAgIC8vIG1vZGlmaWVzIHRoZSByZXBvLCBpdCBkb2Vzbid0IG5lY2Vzc2FyaWx5IG9ubHkgbW9kaWZ5IGZpbGVzIHRoYXQgd2VyZVxuICAgIC8vIHByZXZpb3VzbHkgbW9kaWZpZWQuXG4gICAgYXdhaXQgdGhpcy5fdXBkYXRlU3RhdHVzZXMoXG4gICAgICBbdGhpcy5nZXRQcm9qZWN0RGlyZWN0b3J5KCldLFxuICAgICAge2hnU3RhdHVzT3B0aW9uOiBIZ1N0YXR1c09wdGlvbi5PTkxZX05PTl9JR05PUkVEfSxcbiAgICApO1xuICAgIGlmIChwYXRoc0luRGlmZkNhY2hlLmxlbmd0aCA+IDApIHtcbiAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZURpZmZJbmZvKHBhdGhzSW5EaWZmQ2FjaGUpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIFNlY3Rpb246IFJlcG9zaXRvcnkgU3RhdGUgYXQgU3BlY2lmaWMgUmV2aXNpb25zXG4gICAqXG4gICAqL1xuICBmZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aDogTnVjbGlkZVVyaSwgcmV2aXNpb246ID9zdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5mZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aCwgcmV2aXNpb24pO1xuICB9XG5cbiAgZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKHJldmlzaW9uOiBzdHJpbmcpOiBQcm9taXNlPD9SZXZpc2lvbkZpbGVDaGFuZ2VzPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKHJldmlzaW9uKTtcbiAgfVxuXG4gIGZldGNoUmV2aXNpb25JbmZvQmV0d2VlbkhlYWRBbmRCYXNlKCk6IFByb21pc2U8P0FycmF5PFJldmlzaW9uSW5mbz4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5mZXRjaFJldmlzaW9uSW5mb0JldHdlZW5IZWFkQW5kQmFzZSgpO1xuICB9XG5cbiAgLy8gU2VlIEhnU2VydmljZS5nZXRCbGFtZUF0SGVhZC5cbiAgZ2V0QmxhbWVBdEhlYWQoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPE1hcDxzdHJpbmcsIHN0cmluZz4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5nZXRCbGFtZUF0SGVhZChmaWxlUGF0aCk7XG4gIH1cblxuICBnZXRDb25maWdWYWx1ZUFzeW5jKGtleTogc3RyaW5nLCBwYXRoOiA/c3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZ2V0Q29uZmlnVmFsdWVBc3luYyhrZXkpO1xuICB9XG5cbiAgLy8gU2VlIEhnU2VydmljZS5nZXREaWZmZXJlbnRpYWxSZXZpc2lvbkZvckNoYW5nZVNldElkLlxuICBnZXREaWZmZXJlbnRpYWxSZXZpc2lvbkZvckNoYW5nZVNldElkKGNoYW5nZVNldElkOiBzdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5nZXREaWZmZXJlbnRpYWxSZXZpc2lvbkZvckNoYW5nZVNldElkKGNoYW5nZVNldElkKTtcbiAgfVxuXG4gIGdldFNtYXJ0bG9nKHR0eU91dHB1dDogYm9vbGVhbiwgY29uY2lzZTogYm9vbGVhbik6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UuZ2V0U21hcnRsb2codHR5T3V0cHV0LCBjb25jaXNlKTtcbiAgfVxuXG4gIHJlbmFtZShvbGRGaWxlUGF0aDogc3RyaW5nLCBuZXdGaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UucmVuYW1lKG9sZEZpbGVQYXRoLCBuZXdGaWxlUGF0aCk7XG4gIH1cblxuICByZW1vdmUoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLnJlbW92ZShmaWxlUGF0aCk7XG4gIH1cblxuICBhZGQoZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmFkZChmaWxlUGF0aHMpO1xuICB9XG5cbiAgY29tbWl0KG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2aWNlLmNvbW1pdChtZXNzYWdlKTtcbiAgfVxuXG4gIGFtZW5kKG1lc3NhZ2U6ID9zdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmljZS5hbWVuZChtZXNzYWdlKTtcbiAgfVxuXG4gIHJldmVydChmaWxlUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2UucmV2ZXJ0KGZpbGVQYXRocyk7XG4gIH1cblxuICBfZ2V0U3RhdHVzT3B0aW9uKG9wdGlvbnM6ID9IZ1N0YXR1c0NvbW1hbmRPcHRpb25zKTogP0hnU3RhdHVzT3B0aW9uVmFsdWUge1xuICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gb3B0aW9ucy5oZ1N0YXR1c09wdGlvbjtcbiAgfVxufVxuIl19