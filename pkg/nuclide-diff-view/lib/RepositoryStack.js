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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _commonsNodeDebounce2;

function _commonsNodeDebounce() {
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _notifications2;

function _notifications() {
  return _notifications2 = require('./notifications');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _lruCache2;

function _lruCache() {
  return _lruCache2 = _interopRequireDefault(require('lru-cache'));
}

var UPDATE_SELECTED_FILE_CHANGES_EVENT = 'update-selected-file-changes';
var UPDATE_DIRTY_FILES_EVENT = 'update-dirty-files';
var CHANGE_REVISIONS_EVENT = 'did-change-revisions';
var UPDATE_STATUS_DEBOUNCE_MS = 50;

var FETCH_REV_INFO_RETRY_TIME_MS = 1000;
var FETCH_REV_INFO_MAX_TRIES = 5;

var diffStatusFetcher = undefined;

function getDiffStatusFetcher() {
  if (diffStatusFetcher != null) {
    return diffStatusFetcher;
  }
  try {
    // $FlowFB
    diffStatusFetcher = require('./fb/services').diffStatusFetcher;
  } catch (e) {
    diffStatusFetcher = _asyncToGenerator(function* () {
      return new Map();
    });
  }
  return diffStatusFetcher;
}

// The revisions haven't changed if the revisions' ids are the same.
// That's because commit ids are unique and incremental.
// Also, any write operation will update them.
// That way, we guarantee we only update the revisions state if the revisions are changed.
function isEqualRevisionsStates(revisionsState1, revisionsState2) {
  if (revisionsState1 === revisionsState2) {
    return true;
  }
  if (revisionsState1 == null || revisionsState2 == null) {
    return false;
  }
  return (0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayEqual)(revisionsState1.revisions, revisionsState2.revisions, function (revision1, revision2) {
    return revision1.id === revision2.id && (0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayEqual)(revision1.bookmarks, revision2.bookmarks);
  });
}

var RepositoryStack = (function () {
  function RepositoryStack(repository, diffOption) {
    var _this = this;

    _classCallCheck(this, RepositoryStack);

    this._repository = repository;
    this._emitter = new (_atom2 || _atom()).Emitter();
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._dirtyFileChanges = new Map();
    this._selectedFileChanges = new Map();
    this._isActive = false;
    this._revisionIdToFileChanges = new (_lruCache2 || _lruCache()).default({ max: 100 });
    this._fileContentsAtCommitIds = new (_lruCache2 || _lruCache()).default({ max: 20 });
    this._selectedCompareCommitId = null;
    this._lastRevisionsState = null;
    this._commitIdsToDiffStatuses = new Map();
    this._diffOption = diffOption;

    this._serializedUpdateStackState = (0, (_commonsNodePromise2 || _commonsNodePromise()).serializeAsyncCall)(function () {
      return _this._tryUpdateStackState();
    });
    this._serializedUpdateSelectedFileChanges = (0, (_commonsNodePromise2 || _commonsNodePromise()).serializeAsyncCall)(function () {
      return _this._updateSelectedFileChanges();
    });
    this._serializedUpdateDiffStatusForCommits = (0, (_commonsNodePromise2 || _commonsNodePromise()).serializeAsyncCall)(function () {
      return _this._updateDiffStatusForCommits();
    });
    var debouncedSerializedUpdateStackState = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(this._serializedUpdateStackState, UPDATE_STATUS_DEBOUNCE_MS, false);
    this._serializedUpdateStackState();
    // Get the initial project status, if it's not already there,
    // triggered by another integration, like the file tree.
    repository.getStatuses([repository.getProjectDirectory()]);
    this._subscriptions.add(repository.onDidChangeStatuses(function () {
      // Do the lightweight dirty cache update to reflect the changes,
      // While only commit merge changes consumers wait for its results.
      _this._updateDirtyFileChanges();
      debouncedSerializedUpdateStackState();
    }));
  }

  _createDecoratedClass(RepositoryStack, [{
    key: 'setDiffOption',
    value: function setDiffOption(diffOption) {
      if (this._diffOption === diffOption) {
        return;
      }
      this._diffOption = diffOption;
      this._serializedUpdateSelectedFileChanges().catch((_notifications2 || _notifications()).notifyInternalError);
    }
  }, {
    key: 'activate',
    value: function activate() {
      if (this._isActive) {
        return;
      }
      this._isActive = true;
      this._serializedUpdateStackState();
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this._isActive = false;
      this._fetchRevisionsPromise = null;
      this._fileContentsAtCommitIds.reset();
    }
  }, {
    key: '_tryUpdateStackState',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('diff-view.update-change-status')],
    value: _asyncToGenerator(function* () {
      if (!this._isActive) {
        return;
      }
      try {
        yield this._updateRevisionsState();
        if (!this._isActive) {
          return;
        }
        yield this._serializedUpdateSelectedFileChanges();
      } catch (error) {
        (0, (_notifications2 || _notifications()).notifyInternalError)(error);
      }
    })
  }, {
    key: '_updateDirtyFileChanges',
    value: function _updateDirtyFileChanges() {
      this._dirtyFileChanges = this._getDirtyChangedStatus();
      this._emitter.emit(UPDATE_DIRTY_FILES_EVENT);
    }
  }, {
    key: '_getDirtyChangedStatus',
    value: function _getDirtyChangedStatus() {
      var dirtyFileChanges = new Map();
      var statuses = this._repository.getAllPathStatuses();
      for (var filePath in statuses) {
        var changeStatus = (_constants2 || _constants()).HgStatusToFileChangeStatus[statuses[filePath]];
        if (changeStatus != null) {
          dirtyFileChanges.set(filePath, changeStatus);
        }
      }
      return dirtyFileChanges;
    }
  }, {
    key: '_updateRevisionsState',
    value: _asyncToGenerator(function* () {
      // We should only update the revision state when the repository is active.
      if (!this._isActive) {
        return;
      }
      var lastRevisionsState = this._lastRevisionsState;
      var revisionsState = yield this.getRevisionsStatePromise();
      this._lastRevisionsState = revisionsState;
      if (!isEqualRevisionsStates(revisionsState, lastRevisionsState)) {
        this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);
        this._serializedUpdateDiffStatusForCommits().catch(function (error) {
          (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().warn('Failed to update diff status for commits', error);
        });
      }
    })
  }, {
    key: '_updateDiffStatusForCommits',
    value: _asyncToGenerator(function* () {
      if (!this._isActive) {
        return;
      }
      var cachedRevisionsState = yield this.getCachedRevisionsStatePromise();
      this._commitIdsToDiffStatuses = yield getDiffStatusFetcher()(this._repository.getWorkingDirectory(), cachedRevisionsState.revisions);
      // Emit the new revisions state with the diff statuses.
      this._emitter.emit(CHANGE_REVISIONS_EVENT, (yield this.getCachedRevisionsStatePromise()));
    })

    /**
     * Update the file change state comparing the dirty filesystem status
     * to a selected commit.
     * That would be a merge of `hg status` with the diff from commits,
     * and `hg log --rev ${revId}` for every commit.
     */
  }, {
    key: '_updateSelectedFileChanges',
    value: _asyncToGenerator(function* () {
      var revisionsState = yield this.getCachedRevisionsStatePromise();
      switch (this._diffOption) {
        case (_constants2 || _constants()).DiffOption.DIRTY:
          this._selectedFileChanges = this._dirtyFileChanges;
          break;
        case (_constants2 || _constants()).DiffOption.COMPARE_COMMIT:
          if (revisionsState.compareCommitId == null || revisionsState.compareCommitId === revisionsState.commitId) {
            this._selectedFileChanges = this._dirtyFileChanges;
          } else {
            // No need to fetch every commit file changes unless requested.
            yield this._updateSelectedChangesToCommit(revisionsState, revisionsState.compareCommitId);
          }
          break;
        case (_constants2 || _constants()).DiffOption.LAST_COMMIT:
          var revisions = revisionsState.revisions;

          if (revisions.length <= 1) {
            this._selectedFileChanges = this._dirtyFileChanges;
          } else {
            yield this._updateSelectedChangesToCommit(revisionsState, revisions[revisions.length - 2].id);
          }
          break;
      }
      this._emitter.emit(UPDATE_SELECTED_FILE_CHANGES_EVENT);
    })
  }, {
    key: '_updateSelectedChangesToCommit',
    value: _asyncToGenerator(function* (revisionsState, beforeCommitId) {
      var latestToOldesRevisions = revisionsState.revisions.slice().reverse();
      var revisionChanges = yield this._fetchFileChangesForRevisions(latestToOldesRevisions.filter(function (revision) {
        return revision.id > beforeCommitId;
      }));
      this._selectedFileChanges = this._mergeFileStatuses(this._dirtyFileChanges, revisionChanges);
    })
  }, {
    key: 'getRevisionsStatePromise',
    value: _asyncToGenerator(function* () {
      var revisionPromise = this._fetchRevisionsPromise = this._fetchRevisions();
      var revisions = undefined;
      try {
        revisions = yield this._fetchRevisionsPromise;
      } catch (error) {
        if (revisionPromise === this._fetchRevisionsPromise) {
          this._fetchRevisionsPromise = null;
        }
        throw error;
      }
      return this._createRevisionsState(revisions);
    })
  }, {
    key: 'getCachedRevisionsStatePromise',
    value: _asyncToGenerator(function* () {
      if (this._fetchRevisionsPromise != null) {
        return this._createRevisionsState((yield this._fetchRevisionsPromise));
      } else {
        return this.getRevisionsStatePromise();
      }
    })

    /**
     * Amend the revisions state with the latest selected valid compare commit id.
     */
  }, {
    key: '_createRevisionsState',
    value: function _createRevisionsState(revisions) {
      var commitId = revisions[revisions.length - 1].id;
      // Prioritize the cached compaereCommitId, if it exists.
      // The user could have selected that from the timeline view.
      var compareCommitId = this._selectedCompareCommitId;
      if (!revisions.find(function (revision) {
        return revision.id === compareCommitId;
      })) {
        // Invalidate if there there is no longer a revision with that id.
        compareCommitId = null;
      }
      var diffStatuses = this._commitIdsToDiffStatuses;
      return {
        commitId: commitId,
        compareCommitId: compareCommitId,
        diffStatuses: diffStatuses,
        revisions: revisions
      };
    }
  }, {
    key: '_fetchRevisions',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('diff-view.fetch-revisions-state')],
    value: _asyncToGenerator(function* () {
      var _this2 = this;

      if (!this._isActive) {
        throw new Error('Diff View should not fetch revisions while not active');
      }
      // While rebasing, the common ancestor of `HEAD` and `BASE`
      // may be not applicable, but that's defined once the rebase is done.
      // Hence, we need to retry fetching the revision info (depending on the common ancestor)
      // because the watchman-based Mercurial updates doesn't consider or wait while rebasing.
      var revisions = yield (0, (_commonsNodePromise2 || _commonsNodePromise()).retryLimit)(function () {
        return _this2._repository.fetchRevisionInfoBetweenHeadAndBase();
      }, function (result) {
        return result != null;
      }, FETCH_REV_INFO_MAX_TRIES, FETCH_REV_INFO_RETRY_TIME_MS);
      if (revisions == null || revisions.length === 0) {
        throw new Error('Cannot fetch revision info needed!');
      }
      return revisions;
    })
  }, {
    key: '_fetchFileChangesForRevisions',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('diff-view.fetch-revisions-change-history')],
    value: _asyncToGenerator(function* (revisions) {
      var _this3 = this;

      // Revision ids are unique and don't change, except when the revision is amended/rebased.
      // Hence, it's cached here to avoid service calls when working on a stack of commits.
      var revisionsFileHistory = yield Promise.all(revisions.map(_asyncToGenerator(function* (revision) {
        var id = revision.id;

        var changes = null;
        if (_this3._revisionIdToFileChanges.has(id)) {
          changes = _this3._revisionIdToFileChanges.get(id);
        } else {
          changes = yield _this3._repository.fetchFilesChangedAtRevision('' + id);
          if (changes == null) {
            throw new Error('Changes not available for revision: ' + id);
          }
          _this3._revisionIdToFileChanges.set(id, changes);
        }
        return changes;
      })));

      return revisionsFileHistory;
    })

    /**
     * Merges the file change statuses of the dirty filesystem state with
     * the revision changes, where dirty changes and more recent revisions
     * take priority in deciding which status a file is in.
     */
  }, {
    key: '_mergeFileStatuses',
    value: function _mergeFileStatuses(dirtyStatus, revisionsFileChanges) {
      var mergedStatus = new Map(dirtyStatus);
      var mergedFilePaths = new Set(mergedStatus.keys());

      function mergeStatusPaths(filePaths, changeStatusValue) {
        for (var filePath of filePaths) {
          if (!mergedFilePaths.has(filePath)) {
            mergedStatus.set(filePath, changeStatusValue);
            mergedFilePaths.add(filePath);
          }
        }
      }

      // More recent revision changes takes priority in specifying a files' statuses.
      var latestToOldestRevisionsChanges = revisionsFileChanges.slice().reverse();
      for (var revisionFileChanges of latestToOldestRevisionsChanges) {
        var added = revisionFileChanges.added;
        var modified = revisionFileChanges.modified;
        var deleted = revisionFileChanges.deleted;

        mergeStatusPaths(added, (_constants2 || _constants()).FileChangeStatus.ADDED);
        mergeStatusPaths(modified, (_constants2 || _constants()).FileChangeStatus.MODIFIED);
        mergeStatusPaths(deleted, (_constants2 || _constants()).FileChangeStatus.REMOVED);
      }

      return mergedStatus;
    }
  }, {
    key: 'getDirtyFileChanges',
    value: function getDirtyFileChanges() {
      return this._dirtyFileChanges;
    }
  }, {
    key: 'getSelectedFileChanges',
    value: function getSelectedFileChanges() {
      return this._selectedFileChanges;
    }
  }, {
    key: 'fetchHgDiff',
    value: _asyncToGenerator(function* (filePath) {
      var revisionsState = yield this.getCachedRevisionsStatePromise();
      var revisions = revisionsState.revisions;
      var commitId = revisionsState.commitId;

      // When `compareCommitId` is null, the `HEAD` commit contents is compared
      // to the filesystem, otherwise it compares that commit to filesystem.
      var compareCommitId = undefined;
      switch (this._diffOption) {
        case (_constants2 || _constants()).DiffOption.DIRTY:
          compareCommitId = commitId;
          break;
        case (_constants2 || _constants()).DiffOption.LAST_COMMIT:
          compareCommitId = revisions.length > 1 ? revisions[revisions.length - 2].id : commitId;
          break;
        case (_constants2 || _constants()).DiffOption.COMPARE_COMMIT:
          compareCommitId = revisionsState.compareCommitId || commitId;
          break;
        default:
          throw new Error('Invalid Diff Option: ' + this._diffOption);
      }

      var _revisions$filter = revisions.filter(function (revision) {
        return revision.id === compareCommitId;
      });

      var _revisions$filter2 = _slicedToArray(_revisions$filter, 1);

      var revisionInfo = _revisions$filter2[0];

      (0, (_assert2 || _assert()).default)(revisionInfo, 'Diff Viw Fetcher: revision with id ' + compareCommitId + ' not found');

      if (!this._fileContentsAtCommitIds.has(compareCommitId)) {
        this._fileContentsAtCommitIds.set(compareCommitId, new Map());
      }
      var fileContentsAtCommit = this._fileContentsAtCommitIds.get(compareCommitId);
      var committedContents = undefined;
      if (fileContentsAtCommit.has(filePath)) {
        committedContents = fileContentsAtCommit.get(filePath);
        (0, (_assert2 || _assert()).default)(committedContents != null);
      } else {
        committedContents = yield this._repository.fetchFileContentAtRevision(filePath, compareCommitId.toString())
        // If the file didn't exist on the previous revision, return empty contents.
        .catch(function (_err) {
          return '';
        });
        fileContentsAtCommit.set(filePath, committedContents);
      }

      return {
        committedContents: committedContents,
        revisionInfo: revisionInfo
      };
    })
  }, {
    key: 'getTemplateCommitMessage',
    value: function getTemplateCommitMessage() {
      return this._repository.getConfigValueAsync('committemplate.emptymsg');
    }
  }, {
    key: 'setRevision',
    value: _asyncToGenerator(function* (revision) {
      var revisionsState = yield this.getCachedRevisionsStatePromise();
      var revisions = revisionsState.revisions;

      (0, (_assert2 || _assert()).default)(revisions && revisions.find(function (check) {
        return check.id === revision.id;
      }), 'Diff Viw Timeline: non-applicable selected revision');

      this._selectedCompareCommitId = revisionsState.compareCommitId = revision.id;
      this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);

      (0, (_assert2 || _assert()).default)(this._diffOption === (_constants2 || _constants()).DiffOption.COMPARE_COMMIT, 'Invalid Diff Option at setRevision time!');
      yield this._serializedUpdateSelectedFileChanges().catch((_notifications2 || _notifications()).notifyInternalError);
    })
  }, {
    key: 'onDidUpdateDirtyFileChanges',
    value: function onDidUpdateDirtyFileChanges(callback) {
      return this._emitter.on(UPDATE_DIRTY_FILES_EVENT, callback);
    }
  }, {
    key: 'onDidUpdateSelectedFileChanges',
    value: function onDidUpdateSelectedFileChanges(callback) {
      return this._emitter.on(UPDATE_SELECTED_FILE_CHANGES_EVENT, callback);
    }
  }, {
    key: 'onDidChangeRevisions',
    value: function onDidChangeRevisions(callback) {
      return this._emitter.on(CHANGE_REVISIONS_EVENT, callback);
    }
  }, {
    key: 'getRepository',
    value: function getRepository() {
      return this._repository;
    }
  }, {
    key: 'commit',
    value: function commit(message) {
      return this._repository.commit(message);
    }
  }, {
    key: 'amend',
    value: function amend(message) {
      return this._repository.amend(message);
    }
  }, {
    key: 'revert',
    value: function revert(filePaths) {
      return this._repository.revert(filePaths);
    }
  }, {
    key: 'addAll',
    value: function addAll(filePaths) {
      return this._repository.addAll(filePaths);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.deactivate();
      this._subscriptions.dispose();
      this._dirtyFileChanges.clear();
      this._selectedFileChanges.clear();
      this._revisionIdToFileChanges.reset();
    }
  }]);

  return RepositoryStack;
})();

exports.default = RepositoryStack;
module.exports = exports.default;