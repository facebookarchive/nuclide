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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _HgRepositoryClientAsync2;

function _HgRepositoryClientAsync() {
  return _HgRepositoryClientAsync2 = _interopRequireDefault(require('./HgRepositoryClientAsync'));
}

var _nuclideHgRepositoryBaseLibHgConstants2;

function _nuclideHgRepositoryBaseLibHgConstants() {
  return _nuclideHgRepositoryBaseLibHgConstants2 = require('../../nuclide-hg-repository-base/lib/hg-constants');
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _commonsNodeDebounce2;

function _commonsNodeDebounce() {
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var STATUS_DEBOUNCE_DELAY_MS = 300;

/**
 *
 * Section: Constants, Type Definitions
 *
 */

var DID_CHANGE_CONFLICT_STATE = 'did-change-conflict-state';
var EDITOR_SUBSCRIPTION_NAME = 'hg-repository-editor-subscription';
var MAX_INDIVIDUAL_CHANGED_PATHS = 1;

exports.MAX_INDIVIDUAL_CHANGED_PATHS = MAX_INDIVIDUAL_CHANGED_PATHS;
function filterForOnlyNotIgnored(code) {
  return code !== (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeId.IGNORED;
}

function filterForOnlyIgnored(code) {
  return code === (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeId.IGNORED;
}

function filterForAllStatues() {
  return true;
}
var HgRepositoryClient = (function () {
  function HgRepositoryClient(repoPath, hgService, options) {
    var _this = this;

    _classCallCheck(this, HgRepositoryClient);

    this.async = new (_HgRepositoryClientAsync2 || _HgRepositoryClientAsync()).default(this);

    this._path = repoPath;
    this._workingDirectory = options.workingDirectory;
    this._projectDirectory = options.projectRootDirectory;
    this._originURL = options.originURL;
    this._service = hgService;
    this._isInConflict = false;

    this._emitter = new (_atom2 || _atom()).Emitter();
    this._disposables = {};

    this._hgStatusCache = {};
    this._modifiedDirectoryCache = new Map();

    this._hgDiffCache = {};
    this._hgDiffCacheFilesUpdating = new Set();
    this._hgDiffCacheFilesToClear = new Set();

    this._serializedRefreshStatusesCache = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)((0, (_commonsNodePromise2 || _commonsNodePromise()).serializeAsyncCall)(this._refreshStatusesOfAllFilesInCache.bind(this)), STATUS_DEBOUNCE_DELAY_MS);

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
      var editorSubscriptions = _this._disposables[filePath] = new (_atom2 || _atom()).CompositeDisposable();
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
    var serializedUpdateChangedPaths = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)((0, (_commonsNodePromise2 || _commonsNodePromise()).serializeAsyncCall)(function () {
      // Send a batched update and clear the pending changes.
      return _this._updateChangedPaths(toUpdateChangedPaths.splice(0));
    }), STATUS_DEBOUNCE_DELAY_MS);
    var onFilesChanges = function onFilesChanges(changedPaths) {
      toUpdateChangedPaths.push.apply(toUpdateChangedPaths, changedPaths);
      // Will trigger an update immediately if no other async call is active.
      // Otherwise, will schedule an async call when it's done.
      serializedUpdateChangedPaths();
    };
    this._initializationPromise = this._service.waitForWatchmanSubscriptions();
    this._initializationPromise.catch(function (error) {
      atom.notifications.addWarning('Mercurial: failed to subscribe to watchman!');
    });
    // Get updates that tell the HgRepositoryClient when to clear its caches.
    this._service.observeFilesDidChange().subscribe(onFilesChanges);
    this._service.observeHgRepoStateDidChange().subscribe(this._serializedRefreshStatusesCache);
    this._service.observeActiveBookmarkDidChange().subscribe(this.fetchActiveBookmark.bind(this));
    this._service.observeBookmarksDidChange().subscribe(function () {
      _this._emitter.emit('did-change-bookmarks');
    });
    this._service.observeHgConflictStateDidChange().subscribe(this._conflictStateChanged.bind(this));
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
        this.async.getShortHead();
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
        return this.isStatusModified((_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
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
        return this.isStatusNew((_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
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
        return this.isStatusAdded((_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
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
        return this.isStatusUntracked((_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
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
        return this.isStatusIgnored((_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeIdToNumber[cachedPathStatus]);
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
        return (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeNumber.CLEAN;
      }
      var directoryPathWithSeparator = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.normalizeDir(directoryPath);
      if (this._modifiedDirectoryCache.has(directoryPathWithSeparator)) {
        return (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeNumber.MODIFIED;
      }
      return (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeNumber.CLEAN;
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
        return (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeNumber.CLEAN;
      }
      var cachedStatus = this._hgStatusCache[filePath];
      if (cachedStatus) {
        return (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeIdToNumber[cachedStatus];
      }
      return (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeNumber.CLEAN;
    }
  }, {
    key: 'getAllPathStatuses',
    value: function getAllPathStatuses() {
      var pathStatuses = Object.create(null);
      for (var _filePath in this._hgStatusCache) {
        pathStatuses[_filePath] = (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeIdToNumber[this._hgStatusCache[_filePath]];
      }
      return pathStatuses;
    }
  }, {
    key: 'isStatusModified',
    value: function isStatusModified(status) {
      return this.async.isStatusModified(status);
    }
  }, {
    key: 'isStatusNew',
    value: function isStatusNew(status) {
      return this.async.isStatusNew(status);
    }
  }, {
    key: 'isStatusAdded',
    value: function isStatusAdded(status) {
      return this.async.isStatusAdded(status);
    }
  }, {
    key: 'isStatusUntracked',
    value: function isStatusUntracked(status) {
      return this.async.isStatusUntracked(status);
    }
  }, {
    key: 'isStatusIgnored',
    value: function isStatusIgnored(status) {
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
          statusMap.set(filePath, (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeIdToNumber[statusId]);
        } else {
          pathsWithCacheMiss.push(filePath);
        }
      });

      // Fetch any uncached statuses.
      if (pathsWithCacheMiss.length) {
        var newStatusInfo = yield this._updateStatuses(pathsWithCacheMiss, options);
        newStatusInfo.forEach(function (status, filePath) {
          statusMap.set(filePath, (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeIdToNumber[status]);
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
        if (oldStatus && oldStatus !== newStatusId || !oldStatus && newStatusId !== (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeId.CLEAN) {
          statusChangeEvents.push({
            path: filePath,
            pathStatus: (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeIdToNumber[newStatusId]
          });
          if (newStatusId === (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeId.CLEAN) {
            // Don't bother keeping 'clean' files in the cache.
            delete _this4._hgStatusCache[filePath];
            _this4._removeAllParentDirectoriesFromCache(filePath);
          } else {
            _this4._hgStatusCache[filePath] = newStatusId;
            if (newStatusId === (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeId.MODIFIED) {
              _this4._addAllParentDirectoriesToCache(filePath);
            }
          }
        }
        queriedFiles.delete(filePath);
      });

      // If the statuses were fetched for only changed (`hg status`) or
      // ignored ('hg status --ignored`) files, a queried file may not be
      // returned in the response. If it wasn't returned, this means its status
      // may have changed, in which case it should be removed from the hgStatusCache.
      // Note: we don't know the real updated status of the file, so don't send a change event.
      // TODO (jessicalin) Can we make the 'pathStatus' field in the change event optional?
      // Then we can send these events.
      var hgStatusOption = this._getStatusOption(options);
      if (hgStatusOption === (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).HgStatusOption.ONLY_IGNORED) {
        queriedFiles.forEach(function (filePath) {
          if (_this4._hgStatusCache[filePath] === (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeId.IGNORED) {
            delete _this4._hgStatusCache[filePath];
          }
        });
      } else if (hgStatusOption === (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).HgStatusOption.ALL_STATUSES) {
        // If HgStatusOption.ALL_STATUSES was passed and a file does not appear in
        // the results, it must mean the file was removed from the filesystem.
        queriedFiles.forEach(function (filePath) {
          var cachedStatusId = _this4._hgStatusCache[filePath];
          delete _this4._hgStatusCache[filePath];
          if (cachedStatusId === (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeId.MODIFIED) {
            _this4._removeAllParentDirectoriesFromCache(filePath);
          }
        });
      } else {
        queriedFiles.forEach(function (filePath) {
          var cachedStatusId = _this4._hgStatusCache[filePath];
          if (cachedStatusId !== (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeId.IGNORED) {
            delete _this4._hgStatusCache[filePath];
            if (cachedStatusId === (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeId.MODIFIED) {
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
      (0, (_utils2 || _utils()).addAllParentDirectoriesToCache)(this._modifiedDirectoryCache, filePath, this._projectDirectory.getParent().getPath());
    }
  }, {
    key: '_removeAllParentDirectoriesFromCache',
    value: function _removeAllParentDirectoriesFromCache(filePath) {
      (0, (_utils2 || _utils()).removeAllParentDirectoriesFromCache)(this._modifiedDirectoryCache, filePath, this._projectDirectory.getParent().getPath());
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

      if (hgStatusOption === (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).HgStatusOption.ONLY_IGNORED) {
        return filterForOnlyIgnored;
      } else if (hgStatusOption === (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).HgStatusOption.ALL_STATUSES) {
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
      return this.async.getShortHead();
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
        yield this._updateStatuses(relevantChangedPaths, { hgStatusOption: (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).HgStatusOption.ALL_STATUSES });
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
      yield this._updateStatuses([this.getProjectDirectory()], { hgStatusOption: (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).HgStatusOption.ONLY_NON_IGNORED });
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
    value: _asyncToGenerator(function* (message) {
      yield this._service.commit(message);
      this._clearClientCache();
    })
  }, {
    key: 'amend',
    value: _asyncToGenerator(function* (message) {
      yield this._service.amend(message);
      this._clearClientCache();
    })
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
    key: '_getStatusOption',
    value: function _getStatusOption(options) {
      if (options == null) {
        return null;
      }
      return options.hgStatusOption;
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

/** The root directory that is opened in Atom, which this Repository serves. **/

// A map from a key (in most cases, a file path), to a related Disposable.

// Map of directory path to the number of modified files within that directory.