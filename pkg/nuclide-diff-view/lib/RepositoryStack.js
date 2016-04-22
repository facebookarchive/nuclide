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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _constants = require('./constants');

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _notifications = require('./notifications');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _nuclideLogging = require('../../nuclide-logging');

var logger = (0, _nuclideLogging.getLogger)();
var serializeAsyncCall = _nuclideCommons.promises.serializeAsyncCall;

var UPDATE_COMMIT_MERGE_FILES_EVENT = 'update-commit-merge-files';
var UPDATE_DIRTY_FILES_EVENT = 'update-dirty-files';
var CHANGE_REVISIONS_EVENT = 'did-change-revisions';
var UPDATE_STATUS_DEBOUNCE_MS = 2000;

var FETCH_REV_INFO_RETRY_TIME_MS = 1000;
var FETCH_REV_INFO_MAX_TRIES = 5;

var RepositoryStack = (function () {
  function RepositoryStack(repository) {
    var _this = this;

    _classCallCheck(this, RepositoryStack);

    this._repository = repository;
    this._emitter = new _atom.Emitter();
    this._subscriptions = new _atom.CompositeDisposable();
    this._commitMergeFileChanges = new Map();
    this._lastCommitMergeFileChanges = new Map();
    this._dirtyFileChanges = new Map();
    this._isActive = false;
    this._revisionIdToFileChanges = new _lruCache2['default']({ max: 100 });
    this._selectedCompareCommitId = null;
    this._lastRevisionsFileHistory = null;
    this._lastRevisionsState = null;
    this._serializedUpdateStatus = serializeAsyncCall(function () {
      return _this._updateChangedStatus();
    });
    var debouncedSerializedUpdateStatus = (0, _nuclideCommons.debounce)(this._serializedUpdateStatus, UPDATE_STATUS_DEBOUNCE_MS, false);
    debouncedSerializedUpdateStatus();
    // Get the initial project status, if it's not already there,
    // triggered by another integration, like the file tree.
    repository.getStatuses([repository.getProjectDirectory()]);
    this._subscriptions.add(repository.onDidChangeStatuses(debouncedSerializedUpdateStatus));
  }

  _createDecoratedClass(RepositoryStack, [{
    key: 'activate',
    value: function activate() {
      if (this._isActive) {
        return;
      }
      this._isActive = true;
      this._serializedUpdateStatus();
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this._isActive = false;
    }
  }, {
    key: '_updateChangedStatus',
    decorators: [(0, _nuclideAnalytics.trackTiming)('diff-view.update-change-status')],
    value: _asyncToGenerator(function* () {
      try {
        this._updateDirtyFileChanges();
        yield this._updateCommitMergeFileChanges();
      } catch (error) {
        (0, _notifications.notifyInternalError)(error);
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
        var changeStatus = _constants.HgStatusToFileChangeStatus[statuses[filePath]];
        if (changeStatus != null) {
          dirtyFileChanges.set(filePath, changeStatus);
        }
      }
      return dirtyFileChanges;
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
    key: 'add',
    value: function add(filePaths) {
      return this._repository.add(filePaths);
    }

    /**
     * Update the file change state comparing the dirty filesystem status
     * to a selected commit.
     * That would be a merge of `hg status` with the diff from commits,
     * and `hg log --rev ${revId}` for every commit.
     */
  }, {
    key: '_updateCommitMergeFileChanges',
    value: _asyncToGenerator(function* () {
      // We should only update the revision state when the repository is active.
      if (!this._isActive) {
        this._revisionsStatePromise = null;
        return;
      }
      var lastRevisionsState = this._lastRevisionsState;
      var revisionsState = yield this.getRevisionsStatePromise();
      // The revisions haven't changed if the revisions' ids are the same.
      // That's because commit ids are unique and incremental.
      // Also, any write operation will update them.
      // That way, we guarantee we only update the revisions state if the revisions are changed.
      if (lastRevisionsState == null || !_nuclideCommons.array.equal(lastRevisionsState.revisions, revisionsState.revisions, function (revision1, revision2) {
        return revision1.id === revision2.id;
      })) {
        this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);
      }
      this._lastRevisionsState = revisionsState;

      // If the commits haven't changed ids, then thier diff haven't changed as well.
      var revisionsFileHistory = null;
      if (this._lastRevisionsFileHistory != null) {
        var fileHistoryRevisionIds = this._lastRevisionsFileHistory.map(function (revisionChanges) {
          return revisionChanges.id;
        });
        var revisionIds = revisionsState.revisions.map(function (revision) {
          return revision.id;
        });
        if (_nuclideCommons.array.equal(revisionIds, fileHistoryRevisionIds)) {
          revisionsFileHistory = this._lastRevisionsFileHistory;
        }
      }

      // Fetch revisions history if revisions state have changed.
      if (revisionsFileHistory == null) {
        try {
          revisionsFileHistory = yield this._getRevisionFileHistoryPromise(revisionsState);
        } catch (error) {
          logger.error('Cannot fetch revision history: ' + '(could happen with pending source-control history writing operations)', error);
          return;
        }
      }
      this._commitMergeFileChanges = this._computeCommitMergeFromHistory(revisionsState, revisionsFileHistory);

      var lastCommitFileChanges = revisionsFileHistory.length <= 1 ? null : revisionsFileHistory[revisionsFileHistory.length - 1].changes;

      this._lastCommitMergeFileChanges = this._mergeFileStatuses(this._dirtyFileChanges, lastCommitFileChanges == null ? [] : [lastCommitFileChanges]);
      this._emitter.emit(UPDATE_COMMIT_MERGE_FILES_EVENT);
    })
  }, {
    key: 'getRevisionsStatePromise',
    value: function getRevisionsStatePromise() {
      var _this2 = this;

      this._revisionsStatePromise = this._fetchRevisionsState().then(this._amendSelectedCompareCommitId.bind(this), function (error) {
        _this2._revisionsStatePromise = null;
        throw error;
      });
      return this._revisionsStatePromise;
    }
  }, {
    key: 'getCachedRevisionsStatePromise',
    value: function getCachedRevisionsStatePromise() {
      var revisionsStatePromise = this._revisionsStatePromise;
      if (revisionsStatePromise != null) {
        return revisionsStatePromise.then(this._amendSelectedCompareCommitId.bind(this));
      } else {
        return this.getRevisionsStatePromise();
      }
    }

    /**
     * Amend the revisions state with the latest selected valid compare commit id.
     */
  }, {
    key: '_amendSelectedCompareCommitId',
    value: function _amendSelectedCompareCommitId(revisionsState) {
      var commitId = revisionsState.commitId;
      var revisions = revisionsState.revisions;

      // Prioritize the cached compaereCommitId, if it exists.
      // The user could have selected that from the timeline view.
      var compareCommitId = this._selectedCompareCommitId;
      if (!revisions.find(function (revision) {
        return revision.id === compareCommitId;
      })) {
        // Invalidate if there there is no longer a revision with that id.
        compareCommitId = null;
      }
      var latestToOldestRevisions = revisions.slice().reverse();
      if (compareCommitId == null && latestToOldestRevisions.length > 1) {
        // If the user has already committed, most of the times, he'd be working on an amend.
        // So, the heuristic here is to compare against the previous version,
        // not the just-committed one, while the revisions timeline
        // would give a way to specify otherwise.
        compareCommitId = latestToOldestRevisions[1].id;
      }
      return {
        revisions: revisions,
        commitId: commitId,
        compareCommitId: compareCommitId
      };
    }
  }, {
    key: '_getRevisionFileHistoryPromise',
    value: function _getRevisionFileHistoryPromise(revisionsState) {
      var _this3 = this;

      this._revisionsFileHistoryPromise = this._fetchRevisionsFileHistory(revisionsState).then(function (revisionsFileHistory) {
        return _this3._lastRevisionsFileHistory = revisionsFileHistory;
      }, function (error) {
        _this3._revisionsFileHistoryPromise = null;
        _this3._lastRevisionsFileHistory = null;
        throw error;
      });
      return this._revisionsFileHistoryPromise;
    }
  }, {
    key: '_getCachedRevisionFileHistoryPromise',
    value: function _getCachedRevisionFileHistoryPromise(revisionsState) {
      if (this._revisionsFileHistoryPromise != null) {
        return this._revisionsFileHistoryPromise;
      } else {
        return this._getRevisionFileHistoryPromise(revisionsState);
      }
    }
  }, {
    key: '_fetchRevisionsState',
    decorators: [(0, _nuclideAnalytics.trackTiming)('diff-view.fetch-revisions-state')],
    value: _asyncToGenerator(function* () {
      var _this4 = this;

      if (!this._isActive) {
        throw new Error('Diff View should not fetch revisions while not active');
      }
      // While rebasing, the common ancestor of `HEAD` and `BASE`
      // may be not applicable, but that's defined once the rebase is done.
      // Hence, we need to retry fetching the revision info (depending on the common ancestor)
      // because the watchman-based Mercurial updates doesn't consider or wait while rebasing.
      var revisions = yield _nuclideCommons.promises.retryLimit(function () {
        return _this4._repository.fetchRevisionInfoBetweenHeadAndBase();
      }, function (result) {
        return result != null;
      }, FETCH_REV_INFO_MAX_TRIES, FETCH_REV_INFO_RETRY_TIME_MS);
      if (revisions == null || revisions.length === 0) {
        throw new Error('Cannot fetch revision info needed!');
      }
      var commitId = revisions[revisions.length - 1].id;
      return {
        revisions: revisions,
        commitId: commitId,
        compareCommitId: null
      };
    })
  }, {
    key: '_fetchRevisionsFileHistory',
    decorators: [(0, _nuclideAnalytics.trackTiming)('diff-view.fetch-revisions-change-history')],
    value: _asyncToGenerator(function* (revisionsState) {
      var _this5 = this;

      var revisions = revisionsState.revisions;

      // Revision ids are unique and don't change, except when the revision is amended/rebased.
      // Hence, it's cached here to avoid service calls when working on a stack of commits.
      var revisionsFileHistory = yield Promise.all(revisions.map(_asyncToGenerator(function* (revision) {
        var id = revision.id;

        var changes = null;
        if (_this5._revisionIdToFileChanges.has(id)) {
          changes = _this5._revisionIdToFileChanges.get(id);
        } else {
          changes = yield _this5._repository.fetchFilesChangedAtRevision('' + id);
          if (changes == null) {
            throw new Error('Changes not available for revision: ' + id);
          }
          _this5._revisionIdToFileChanges.set(id, changes);
        }
        return { id: id, changes: changes };
      })));

      return revisionsFileHistory;
    })
  }, {
    key: '_computeCommitMergeFromHistory',
    value: function _computeCommitMergeFromHistory(revisionsState, revisionsFileHistory) {
      var commitId = revisionsState.commitId;
      var compareCommitId = revisionsState.compareCommitId;

      // The status is fetched by merging the changes right after the `compareCommitId` if specified,
      // or `HEAD` if not.
      var startCommitId = compareCommitId ? compareCommitId + 1 : commitId;
      // Get the revision changes that's newer than or is the current commit id.
      var commitRevisionsFileChanges = revisionsFileHistory.slice(1) // Exclude the BASE revision.
      .filter(function (revision) {
        return revision.id >= startCommitId;
      }).map(function (revision) {
        return revision.changes;
      });

      // The last status to merge is the dirty filesystem status.
      var mergedFileStatuses = this._mergeFileStatuses(this._dirtyFileChanges, commitRevisionsFileChanges);
      return mergedFileStatuses;
    }

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

        mergeStatusPaths(added, _constants.FileChangeStatus.ADDED);
        mergeStatusPaths(modified, _constants.FileChangeStatus.MODIFIED);
        mergeStatusPaths(deleted, _constants.FileChangeStatus.REMOVED);
      }

      return mergedStatus;
    }
  }, {
    key: 'getDirtyFileChanges',
    value: function getDirtyFileChanges() {
      return this._dirtyFileChanges;
    }
  }, {
    key: 'getCommitMergeFileChanges',
    value: function getCommitMergeFileChanges() {
      return this._commitMergeFileChanges;
    }
  }, {
    key: 'getLastCommitMergeFileChanges',
    value: function getLastCommitMergeFileChanges() {
      return this._lastCommitMergeFileChanges;
    }
  }, {
    key: 'fetchHgDiff',
    value: _asyncToGenerator(function* (filePath, diffOption) {
      var revisionsState = yield this.getCachedRevisionsStatePromise();
      var revisions = revisionsState.revisions;
      var commitId = revisionsState.commitId;

      // When `compareCommitId` is null, the `HEAD` commit contents is compared
      // to the filesystem, otherwise it compares that commit to filesystem.
      var compareCommitId = null;
      switch (diffOption) {
        case _constants.DiffOption.DIRTY:
          compareCommitId = null;
          break;
        case _constants.DiffOption.LAST_COMMIT:
          compareCommitId = revisions.length <= 1 ? null : revisions[revisions.length - 2].id;
          break;
        case _constants.DiffOption.COMPARE_COMMIT:
          compareCommitId = revisionsState.compareCommitId;
          break;
        default:
          throw new Error('Invalid Diff Option: ' + diffOption);
      }
      var committedContents = yield this._repository.fetchFileContentAtRevision(filePath, compareCommitId ? '' + compareCommitId : null)
      // If the file didn't exist on the previous revision, return empty contents.
      .then(function (contents) {
        return contents || '';
      }, function (_err) {
        return '';
      });

      var fetchedRevisionId = compareCommitId != null ? compareCommitId : commitId;

      var _revisions$filter = revisions.filter(function (revision) {
        return revision.id === fetchedRevisionId;
      });

      var _revisions$filter2 = _slicedToArray(_revisions$filter, 1);

      var revisionInfo = _revisions$filter2[0];

      (0, _assert2['default'])(revisionInfo, 'Diff Viw Fetcher: revision with id ' + fetchedRevisionId + ' not found');
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

      (0, _assert2['default'])(revisions && revisions.find(function (check) {
        return check.id === revision.id;
      }), 'Diff Viw Timeline: non-applicable selected revision');

      this._selectedCompareCommitId = revisionsState.compareCommitId = revision.id;
      this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);

      var revisionsFileHistory = yield this._getCachedRevisionFileHistoryPromise(revisionsState);
      this._commitMergeFileChanges = this._computeCommitMergeFromHistory(revisionsState, revisionsFileHistory);
      this._emitter.emit(UPDATE_COMMIT_MERGE_FILES_EVENT);
    })
  }, {
    key: 'onDidUpdateDirtyFileChanges',
    value: function onDidUpdateDirtyFileChanges(callback) {
      return this._emitter.on(UPDATE_DIRTY_FILES_EVENT, callback);
    }
  }, {
    key: 'onDidUpdateCommitMergeFileChanges',
    value: function onDidUpdateCommitMergeFileChanges(callback) {
      return this._emitter.on(UPDATE_COMMIT_MERGE_FILES_EVENT, callback);
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
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      this._dirtyFileChanges.clear();
      this._commitMergeFileChanges.clear();
      this._lastCommitMergeFileChanges.clear();
      this._revisionIdToFileChanges.reset();
    }
  }]);

  return RepositoryStack;
})();

exports['default'] = RepositoryStack;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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LEVBQ1A7QUFDYixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHdCQUF3QixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzdEOzs7V0FFZ0MsMkNBQy9CLFFBQW9CLEVBQ1A7QUFDYixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLCtCQUErQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ3BFOzs7V0FFbUIsOEJBQ2xCLFFBQWtELEVBQ3JDO0FBQ2IsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUMzRDs7O1dBRVkseUJBQXVCO0FBQ2xDLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztLQUN6Qjs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMvQixVQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDckMsVUFBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3pDLFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUN2Qzs7O1NBdmNrQixlQUFlOzs7cUJBQWYsZUFBZSIsImZpbGUiOiJSZXBvc2l0b3J5U3RhY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5Q2xpZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtGaWxlQ2hhbmdlU3RhdHVzVmFsdWUsIEhnRGlmZlN0YXRlLCBSZXZpc2lvbnNTdGF0ZSwgRGlmZk9wdGlvblR5cGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge1xuICBSZXZpc2lvbkZpbGVDaGFuZ2VzLFxuICBSZXZpc2lvbkluZm8sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge0hnU3RhdHVzVG9GaWxlQ2hhbmdlU3RhdHVzLCBGaWxlQ2hhbmdlU3RhdHVzLCBEaWZmT3B0aW9ufSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2FycmF5LCBwcm9taXNlcywgZGVib3VuY2V9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge25vdGlmeUludGVybmFsRXJyb3J9IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgTFJVIGZyb20gJ2xydS1jYWNoZSc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5jb25zdCB7c2VyaWFsaXplQXN5bmNDYWxsfSA9IHByb21pc2VzO1xuY29uc3QgVVBEQVRFX0NPTU1JVF9NRVJHRV9GSUxFU19FVkVOVCA9ICd1cGRhdGUtY29tbWl0LW1lcmdlLWZpbGVzJztcbmNvbnN0IFVQREFURV9ESVJUWV9GSUxFU19FVkVOVCA9ICd1cGRhdGUtZGlydHktZmlsZXMnO1xuY29uc3QgQ0hBTkdFX1JFVklTSU9OU19FVkVOVCA9ICdkaWQtY2hhbmdlLXJldmlzaW9ucyc7XG5jb25zdCBVUERBVEVfU1RBVFVTX0RFQk9VTkNFX01TID0gMjAwMDtcblxuY29uc3QgRkVUQ0hfUkVWX0lORk9fUkVUUllfVElNRV9NUyA9IDEwMDA7XG5jb25zdCBGRVRDSF9SRVZfSU5GT19NQVhfVFJJRVMgPSA1O1xuXG50eXBlIFJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gQXJyYXk8e1xuICBpZDogbnVtYmVyO1xuICBjaGFuZ2VzOiBSZXZpc2lvbkZpbGVDaGFuZ2VzO1xufT47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlcG9zaXRvcnlTdGFjayB7XG5cbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZGlydHlGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIF9jb21taXRNZXJnZUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgX2xhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgX3JlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudDtcbiAgX2xhc3RSZXZpc2lvbnNTdGF0ZTogP1JldmlzaW9uc1N0YXRlO1xuICBfcmV2aXNpb25zU3RhdGVQcm9taXNlOiA/UHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT47XG4gIF9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2U6ID9Qcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PjtcbiAgX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeTogP1JldmlzaW9uc0ZpbGVIaXN0b3J5O1xuICBfc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQ6ID9udW1iZXI7XG4gIF9pc0FjdGl2ZTogYm9vbGVhbjtcbiAgX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXM6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIF9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlczogTFJVPG51bWJlciwgUmV2aXNpb25GaWxlQ2hhbmdlcz47XG5cbiAgY29uc3RydWN0b3IocmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50KSB7XG4gICAgdGhpcy5fcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9sYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMgPSBuZXcgTFJVKHttYXg6IDEwMH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNTdGF0ZSA9IG51bGw7XG4gICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZVN0YXR1cyA9IHNlcmlhbGl6ZUFzeW5jQ2FsbCgoKSA9PiB0aGlzLl91cGRhdGVDaGFuZ2VkU3RhdHVzKCkpO1xuICAgIGNvbnN0IGRlYm91bmNlZFNlcmlhbGl6ZWRVcGRhdGVTdGF0dXMgPSBkZWJvdW5jZShcbiAgICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXMsXG4gICAgICBVUERBVEVfU1RBVFVTX0RFQk9VTkNFX01TLFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgICBkZWJvdW5jZWRTZXJpYWxpemVkVXBkYXRlU3RhdHVzKCk7XG4gICAgLy8gR2V0IHRoZSBpbml0aWFsIHByb2plY3Qgc3RhdHVzLCBpZiBpdCdzIG5vdCBhbHJlYWR5IHRoZXJlLFxuICAgIC8vIHRyaWdnZXJlZCBieSBhbm90aGVyIGludGVncmF0aW9uLCBsaWtlIHRoZSBmaWxlIHRyZWUuXG4gICAgcmVwb3NpdG9yeS5nZXRTdGF0dXNlcyhbcmVwb3NpdG9yeS5nZXRQcm9qZWN0RGlyZWN0b3J5KCldKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHJlcG9zaXRvcnkub25EaWRDaGFuZ2VTdGF0dXNlcyhkZWJvdW5jZWRTZXJpYWxpemVkVXBkYXRlU3RhdHVzKSxcbiAgICApO1xuICB9XG5cbiAgYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2lzQWN0aXZlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2lzQWN0aXZlID0gdHJ1ZTtcbiAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlU3RhdHVzKCk7XG4gIH1cblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy51cGRhdGUtY2hhbmdlLXN0YXR1cycpXG4gIGFzeW5jIF91cGRhdGVDaGFuZ2VkU3RhdHVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl91cGRhdGVEaXJ0eUZpbGVDaGFuZ2VzKCk7XG4gICAgICBhd2FpdCB0aGlzLl91cGRhdGVDb21taXRNZXJnZUZpbGVDaGFuZ2VzKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5vdGlmeUludGVybmFsRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVEaXJ0eUZpbGVDaGFuZ2VzKCk6IHZvaWQge1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMgPSB0aGlzLl9nZXREaXJ0eUNoYW5nZWRTdGF0dXMoKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoVVBEQVRFX0RJUlRZX0ZJTEVTX0VWRU5UKTtcbiAgfVxuXG4gIF9nZXREaXJ0eUNoYW5nZWRTdGF0dXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIGNvbnN0IGRpcnR5RmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgY29uc3Qgc3RhdHVzZXMgPSB0aGlzLl9yZXBvc2l0b3J5LmdldEFsbFBhdGhTdGF0dXNlcygpO1xuICAgIGZvciAoY29uc3QgZmlsZVBhdGggaW4gc3RhdHVzZXMpIHtcbiAgICAgIGNvbnN0IGNoYW5nZVN0YXR1cyA9IEhnU3RhdHVzVG9GaWxlQ2hhbmdlU3RhdHVzW3N0YXR1c2VzW2ZpbGVQYXRoXV07XG4gICAgICBpZiAoY2hhbmdlU3RhdHVzICE9IG51bGwpIHtcbiAgICAgICAgZGlydHlGaWxlQ2hhbmdlcy5zZXQoZmlsZVBhdGgsIGNoYW5nZVN0YXR1cyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkaXJ0eUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgY29tbWl0KG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9yZXBvc2l0b3J5LmNvbW1pdChtZXNzYWdlKTtcbiAgfVxuXG4gIGFtZW5kKG1lc3NhZ2U6ID9zdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yeS5hbWVuZChtZXNzYWdlKTtcbiAgfVxuXG4gIHJldmVydChmaWxlUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcG9zaXRvcnkucmV2ZXJ0KGZpbGVQYXRocyk7XG4gIH1cblxuICBhZGQoZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9yZXBvc2l0b3J5LmFkZChmaWxlUGF0aHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgZmlsZSBjaGFuZ2Ugc3RhdGUgY29tcGFyaW5nIHRoZSBkaXJ0eSBmaWxlc3lzdGVtIHN0YXR1c1xuICAgKiB0byBhIHNlbGVjdGVkIGNvbW1pdC5cbiAgICogVGhhdCB3b3VsZCBiZSBhIG1lcmdlIG9mIGBoZyBzdGF0dXNgIHdpdGggdGhlIGRpZmYgZnJvbSBjb21taXRzLFxuICAgKiBhbmQgYGhnIGxvZyAtLXJldiAke3JldklkfWAgZm9yIGV2ZXJ5IGNvbW1pdC5cbiAgICovXG4gIGFzeW5jIF91cGRhdGVDb21taXRNZXJnZUZpbGVDaGFuZ2VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFdlIHNob3VsZCBvbmx5IHVwZGF0ZSB0aGUgcmV2aXNpb24gc3RhdGUgd2hlbiB0aGUgcmVwb3NpdG9yeSBpcyBhY3RpdmUuXG4gICAgaWYgKCF0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbGFzdFJldmlzaW9uc1N0YXRlID0gdGhpcy5fbGFzdFJldmlzaW9uc1N0YXRlO1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICAvLyBUaGUgcmV2aXNpb25zIGhhdmVuJ3QgY2hhbmdlZCBpZiB0aGUgcmV2aXNpb25zJyBpZHMgYXJlIHRoZSBzYW1lLlxuICAgIC8vIFRoYXQncyBiZWNhdXNlIGNvbW1pdCBpZHMgYXJlIHVuaXF1ZSBhbmQgaW5jcmVtZW50YWwuXG4gICAgLy8gQWxzbywgYW55IHdyaXRlIG9wZXJhdGlvbiB3aWxsIHVwZGF0ZSB0aGVtLlxuICAgIC8vIFRoYXQgd2F5LCB3ZSBndWFyYW50ZWUgd2Ugb25seSB1cGRhdGUgdGhlIHJldmlzaW9ucyBzdGF0ZSBpZiB0aGUgcmV2aXNpb25zIGFyZSBjaGFuZ2VkLlxuICAgIGlmIChcbiAgICAgIGxhc3RSZXZpc2lvbnNTdGF0ZSA9PSBudWxsIHx8XG4gICAgICAhYXJyYXkuZXF1YWwoXG4gICAgICAgIGxhc3RSZXZpc2lvbnNTdGF0ZS5yZXZpc2lvbnMsXG4gICAgICAgIHJldmlzaW9uc1N0YXRlLnJldmlzaW9ucyxcbiAgICAgICAgKHJldmlzaW9uMSwgcmV2aXNpb24yKSA9PiByZXZpc2lvbjEuaWQgPT09IHJldmlzaW9uMi5pZCxcbiAgICAgIClcbiAgICApIHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG4gICAgfVxuICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNTdGF0ZSA9IHJldmlzaW9uc1N0YXRlO1xuXG4gICAgLy8gSWYgdGhlIGNvbW1pdHMgaGF2ZW4ndCBjaGFuZ2VkIGlkcywgdGhlbiB0aGllciBkaWZmIGhhdmVuJ3QgY2hhbmdlZCBhcyB3ZWxsLlxuICAgIGxldCByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgaWYgKHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSAhPSBudWxsKSB7XG4gICAgICBjb25zdCBmaWxlSGlzdG9yeVJldmlzaW9uSWRzID0gdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5XG4gICAgICAgIC5tYXAocmV2aXNpb25DaGFuZ2VzID0+IHJldmlzaW9uQ2hhbmdlcy5pZCk7XG4gICAgICBjb25zdCByZXZpc2lvbklkcyA9IHJldmlzaW9uc1N0YXRlLnJldmlzaW9ucy5tYXAocmV2aXNpb24gPT4gcmV2aXNpb24uaWQpO1xuICAgICAgaWYgKGFycmF5LmVxdWFsKHJldmlzaW9uSWRzLCBmaWxlSGlzdG9yeVJldmlzaW9uSWRzKSkge1xuICAgICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGZXRjaCByZXZpc2lvbnMgaGlzdG9yeSBpZiByZXZpc2lvbnMgc3RhdGUgaGF2ZSBjaGFuZ2VkLlxuICAgIGlmIChyZXZpc2lvbnNGaWxlSGlzdG9yeSA9PSBudWxsKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IGF3YWl0IHRoaXMuX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKHJldmlzaW9uc1N0YXRlKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICAnQ2Fubm90IGZldGNoIHJldmlzaW9uIGhpc3Rvcnk6ICcgK1xuICAgICAgICAgICcoY291bGQgaGFwcGVuIHdpdGggcGVuZGluZyBzb3VyY2UtY29udHJvbCBoaXN0b3J5IHdyaXRpbmcgb3BlcmF0aW9ucyknLFxuICAgICAgICAgIGVycm9yLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2NvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSB0aGlzLl9jb21wdXRlQ29tbWl0TWVyZ2VGcm9tSGlzdG9yeShcbiAgICAgIHJldmlzaW9uc1N0YXRlLFxuICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnksXG4gICAgKTtcblxuICAgIGNvbnN0IGxhc3RDb21taXRGaWxlQ2hhbmdlcyA9IHJldmlzaW9uc0ZpbGVIaXN0b3J5Lmxlbmd0aCA8PSAxXG4gICAgICA/IG51bGwgOlxuICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnlbcmV2aXNpb25zRmlsZUhpc3RvcnkubGVuZ3RoIC0gMV0uY2hhbmdlcztcblxuICAgIHRoaXMuX2xhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gdGhpcy5fbWVyZ2VGaWxlU3RhdHVzZXMoXG4gICAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzLFxuICAgICAgbGFzdENvbW1pdEZpbGVDaGFuZ2VzID09IG51bGwgPyBbXSA6IFtsYXN0Q29tbWl0RmlsZUNoYW5nZXNdLFxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KFVQREFURV9DT01NSVRfTUVSR0VfRklMRVNfRVZFTlQpO1xuICB9XG5cbiAgZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk6IFByb21pc2U8UmV2aXNpb25zU3RhdGU+IHtcbiAgICB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2UgPSB0aGlzLl9mZXRjaFJldmlzaW9uc1N0YXRlKCkudGhlbihcbiAgICAgIHRoaXMuX2FtZW5kU2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQuYmluZCh0aGlzKSxcbiAgICAgIGVycm9yID0+IHtcbiAgICAgICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gbnVsbDtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9LFxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZTtcbiAgfVxuXG4gIGdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpOiBQcm9taXNlPFJldmlzaW9uc1N0YXRlPiB7XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGVQcm9taXNlID0gdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlO1xuICAgIGlmIChyZXZpc2lvbnNTdGF0ZVByb21pc2UgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJldmlzaW9uc1N0YXRlUHJvbWlzZS50aGVuKHRoaXMuX2FtZW5kU2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQuYmluZCh0aGlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbWVuZCB0aGUgcmV2aXNpb25zIHN0YXRlIHdpdGggdGhlIGxhdGVzdCBzZWxlY3RlZCB2YWxpZCBjb21wYXJlIGNvbW1pdCBpZC5cbiAgICovXG4gIF9hbWVuZFNlbGVjdGVkQ29tcGFyZUNvbW1pdElkKHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSk6IFJldmlzaW9uc1N0YXRlIHtcbiAgICBjb25zdCB7Y29tbWl0SWQsIHJldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICAvLyBQcmlvcml0aXplIHRoZSBjYWNoZWQgY29tcGFlcmVDb21taXRJZCwgaWYgaXQgZXhpc3RzLlxuICAgIC8vIFRoZSB1c2VyIGNvdWxkIGhhdmUgc2VsZWN0ZWQgdGhhdCBmcm9tIHRoZSB0aW1lbGluZSB2aWV3LlxuICAgIGxldCBjb21wYXJlQ29tbWl0SWQgPSB0aGlzLl9zZWxlY3RlZENvbXBhcmVDb21taXRJZDtcbiAgICBpZiAoIXJldmlzaW9ucy5maW5kKHJldmlzaW9uID0+IHJldmlzaW9uLmlkID09PSBjb21wYXJlQ29tbWl0SWQpKSB7XG4gICAgICAvLyBJbnZhbGlkYXRlIGlmIHRoZXJlIHRoZXJlIGlzIG5vIGxvbmdlciBhIHJldmlzaW9uIHdpdGggdGhhdCBpZC5cbiAgICAgIGNvbXBhcmVDb21taXRJZCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zID0gcmV2aXNpb25zLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIGlmIChjb21wYXJlQ29tbWl0SWQgPT0gbnVsbCAmJiBsYXRlc3RUb09sZGVzdFJldmlzaW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBJZiB0aGUgdXNlciBoYXMgYWxyZWFkeSBjb21taXR0ZWQsIG1vc3Qgb2YgdGhlIHRpbWVzLCBoZSdkIGJlIHdvcmtpbmcgb24gYW4gYW1lbmQuXG4gICAgICAvLyBTbywgdGhlIGhldXJpc3RpYyBoZXJlIGlzIHRvIGNvbXBhcmUgYWdhaW5zdCB0aGUgcHJldmlvdXMgdmVyc2lvbixcbiAgICAgIC8vIG5vdCB0aGUganVzdC1jb21taXR0ZWQgb25lLCB3aGlsZSB0aGUgcmV2aXNpb25zIHRpbWVsaW5lXG4gICAgICAvLyB3b3VsZCBnaXZlIGEgd2F5IHRvIHNwZWNpZnkgb3RoZXJ3aXNlLlxuICAgICAgY29tcGFyZUNvbW1pdElkID0gbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnNbMV0uaWQ7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXZpc2lvbnMsXG4gICAgICBjb21taXRJZCxcbiAgICAgIGNvbXBhcmVDb21taXRJZCxcbiAgICB9O1xuICB9XG5cbiAgX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgKTogUHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT4ge1xuICAgIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZSA9IHRoaXMuX2ZldGNoUmV2aXNpb25zRmlsZUhpc3RvcnkocmV2aXNpb25zU3RhdGUpXG4gICAgICAudGhlbihyZXZpc2lvbnNGaWxlSGlzdG9yeSA9PlxuICAgICAgICB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgPSByZXZpc2lvbnNGaWxlSGlzdG9yeVxuICAgICAgLCBlcnJvciA9PiB7XG4gICAgICAgIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZTtcbiAgfVxuXG4gIF9nZXRDYWNoZWRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICk6IFByb21pc2U8UmV2aXNpb25zRmlsZUhpc3Rvcnk+IHtcbiAgICBpZiAodGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShyZXZpc2lvbnNTdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmV0Y2gtcmV2aXNpb25zLXN0YXRlJylcbiAgYXN5bmMgX2ZldGNoUmV2aXNpb25zU3RhdGUoKTogUHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT4ge1xuICAgIGlmICghdGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGlmZiBWaWV3IHNob3VsZCBub3QgZmV0Y2ggcmV2aXNpb25zIHdoaWxlIG5vdCBhY3RpdmUnKTtcbiAgICB9XG4gICAgLy8gV2hpbGUgcmViYXNpbmcsIHRoZSBjb21tb24gYW5jZXN0b3Igb2YgYEhFQURgIGFuZCBgQkFTRWBcbiAgICAvLyBtYXkgYmUgbm90IGFwcGxpY2FibGUsIGJ1dCB0aGF0J3MgZGVmaW5lZCBvbmNlIHRoZSByZWJhc2UgaXMgZG9uZS5cbiAgICAvLyBIZW5jZSwgd2UgbmVlZCB0byByZXRyeSBmZXRjaGluZyB0aGUgcmV2aXNpb24gaW5mbyAoZGVwZW5kaW5nIG9uIHRoZSBjb21tb24gYW5jZXN0b3IpXG4gICAgLy8gYmVjYXVzZSB0aGUgd2F0Y2htYW4tYmFzZWQgTWVyY3VyaWFsIHVwZGF0ZXMgZG9lc24ndCBjb25zaWRlciBvciB3YWl0IHdoaWxlIHJlYmFzaW5nLlxuICAgIGNvbnN0IHJldmlzaW9ucyA9IGF3YWl0IHByb21pc2VzLnJldHJ5TGltaXQoXG4gICAgICAoKSA9PiB0aGlzLl9yZXBvc2l0b3J5LmZldGNoUmV2aXNpb25JbmZvQmV0d2VlbkhlYWRBbmRCYXNlKCksXG4gICAgICByZXN1bHQgPT4gcmVzdWx0ICE9IG51bGwsXG4gICAgICBGRVRDSF9SRVZfSU5GT19NQVhfVFJJRVMsXG4gICAgICBGRVRDSF9SRVZfSU5GT19SRVRSWV9USU1FX01TLFxuICAgICk7XG4gICAgaWYgKHJldmlzaW9ucyA9PSBudWxsIHx8IHJldmlzaW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZldGNoIHJldmlzaW9uIGluZm8gbmVlZGVkIScpO1xuICAgIH1cbiAgICBjb25zdCBjb21taXRJZCA9IHJldmlzaW9uc1tyZXZpc2lvbnMubGVuZ3RoIC0gMV0uaWQ7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJldmlzaW9ucyxcbiAgICAgIGNvbW1pdElkLFxuICAgICAgY29tcGFyZUNvbW1pdElkOiBudWxsLFxuICAgIH07XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5mZXRjaC1yZXZpc2lvbnMtY2hhbmdlLWhpc3RvcnknKVxuICBhc3luYyBfZmV0Y2hSZXZpc2lvbnNGaWxlSGlzdG9yeShyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpOiBQcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PiB7XG4gICAgY29uc3Qge3JldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcblxuICAgIC8vIFJldmlzaW9uIGlkcyBhcmUgdW5pcXVlIGFuZCBkb24ndCBjaGFuZ2UsIGV4Y2VwdCB3aGVuIHRoZSByZXZpc2lvbiBpcyBhbWVuZGVkL3JlYmFzZWQuXG4gICAgLy8gSGVuY2UsIGl0J3MgY2FjaGVkIGhlcmUgdG8gYXZvaWQgc2VydmljZSBjYWxscyB3aGVuIHdvcmtpbmcgb24gYSBzdGFjayBvZiBjb21taXRzLlxuICAgIGNvbnN0IHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gYXdhaXQgUHJvbWlzZS5hbGwocmV2aXNpb25zXG4gICAgICAubWFwKGFzeW5jIHJldmlzaW9uID0+IHtcbiAgICAgICAgY29uc3Qge2lkfSA9IHJldmlzaW9uO1xuICAgICAgICBsZXQgY2hhbmdlcyA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5oYXMoaWQpKSB7XG4gICAgICAgICAgY2hhbmdlcyA9IHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLmdldChpZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hhbmdlcyA9IGF3YWl0IHRoaXMuX3JlcG9zaXRvcnkuZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKGAke2lkfWApO1xuICAgICAgICAgIGlmIChjaGFuZ2VzID09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2hhbmdlcyBub3QgYXZhaWxhYmxlIGZvciByZXZpc2lvbjogJHtpZH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMuc2V0KGlkLCBjaGFuZ2VzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge2lkLCBjaGFuZ2VzfTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHJldHVybiByZXZpc2lvbnNGaWxlSGlzdG9yeTtcbiAgfVxuXG4gIF9jb21wdXRlQ29tbWl0TWVyZ2VGcm9tSGlzdG9yeShcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICAgcmV2aXNpb25zRmlsZUhpc3Rvcnk6IFJldmlzaW9uc0ZpbGVIaXN0b3J5LFxuICApOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG5cbiAgICBjb25zdCB7Y29tbWl0SWQsIGNvbXBhcmVDb21taXRJZH0gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICAvLyBUaGUgc3RhdHVzIGlzIGZldGNoZWQgYnkgbWVyZ2luZyB0aGUgY2hhbmdlcyByaWdodCBhZnRlciB0aGUgYGNvbXBhcmVDb21taXRJZGAgaWYgc3BlY2lmaWVkLFxuICAgIC8vIG9yIGBIRUFEYCBpZiBub3QuXG4gICAgY29uc3Qgc3RhcnRDb21taXRJZCA9IGNvbXBhcmVDb21taXRJZCA/IChjb21wYXJlQ29tbWl0SWQgKyAxKSA6IGNvbW1pdElkO1xuICAgIC8vIEdldCB0aGUgcmV2aXNpb24gY2hhbmdlcyB0aGF0J3MgbmV3ZXIgdGhhbiBvciBpcyB0aGUgY3VycmVudCBjb21taXQgaWQuXG4gICAgY29uc3QgY29tbWl0UmV2aXNpb25zRmlsZUNoYW5nZXMgPSByZXZpc2lvbnNGaWxlSGlzdG9yeVxuICAgICAgLnNsaWNlKDEpIC8vIEV4Y2x1ZGUgdGhlIEJBU0UgcmV2aXNpb24uXG4gICAgICAuZmlsdGVyKHJldmlzaW9uID0+IHJldmlzaW9uLmlkID49IHN0YXJ0Q29tbWl0SWQpXG4gICAgICAubWFwKHJldmlzaW9uID0+IHJldmlzaW9uLmNoYW5nZXMpO1xuXG4gICAgLy8gVGhlIGxhc3Qgc3RhdHVzIHRvIG1lcmdlIGlzIHRoZSBkaXJ0eSBmaWxlc3lzdGVtIHN0YXR1cy5cbiAgICBjb25zdCBtZXJnZWRGaWxlU3RhdHVzZXMgPSB0aGlzLl9tZXJnZUZpbGVTdGF0dXNlcyhcbiAgICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMsXG4gICAgICBjb21taXRSZXZpc2lvbnNGaWxlQ2hhbmdlcyxcbiAgICApO1xuICAgIHJldHVybiBtZXJnZWRGaWxlU3RhdHVzZXM7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2VzIHRoZSBmaWxlIGNoYW5nZSBzdGF0dXNlcyBvZiB0aGUgZGlydHkgZmlsZXN5c3RlbSBzdGF0ZSB3aXRoXG4gICAqIHRoZSByZXZpc2lvbiBjaGFuZ2VzLCB3aGVyZSBkaXJ0eSBjaGFuZ2VzIGFuZCBtb3JlIHJlY2VudCByZXZpc2lvbnNcbiAgICogdGFrZSBwcmlvcml0eSBpbiBkZWNpZGluZyB3aGljaCBzdGF0dXMgYSBmaWxlIGlzIGluLlxuICAgKi9cbiAgX21lcmdlRmlsZVN0YXR1c2VzKFxuICAgIGRpcnR5U3RhdHVzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPixcbiAgICByZXZpc2lvbnNGaWxlQ2hhbmdlczogQXJyYXk8UmV2aXNpb25GaWxlQ2hhbmdlcz4sXG4gICk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICBjb25zdCBtZXJnZWRTdGF0dXMgPSBuZXcgTWFwKGRpcnR5U3RhdHVzKTtcbiAgICBjb25zdCBtZXJnZWRGaWxlUGF0aHMgPSBuZXcgU2V0KG1lcmdlZFN0YXR1cy5rZXlzKCkpO1xuXG4gICAgZnVuY3Rpb24gbWVyZ2VTdGF0dXNQYXRocyhcbiAgICAgIGZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4sXG4gICAgICBjaGFuZ2VTdGF0dXNWYWx1ZTogRmlsZUNoYW5nZVN0YXR1c1ZhbHVlLFxuICAgICkge1xuICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBmaWxlUGF0aHMpIHtcbiAgICAgICAgaWYgKCFtZXJnZWRGaWxlUGF0aHMuaGFzKGZpbGVQYXRoKSkge1xuICAgICAgICAgIG1lcmdlZFN0YXR1cy5zZXQoZmlsZVBhdGgsIGNoYW5nZVN0YXR1c1ZhbHVlKTtcbiAgICAgICAgICBtZXJnZWRGaWxlUGF0aHMuYWRkKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfVxuXG4gICAgLy8gTW9yZSByZWNlbnQgcmV2aXNpb24gY2hhbmdlcyB0YWtlcyBwcmlvcml0eSBpbiBzcGVjaWZ5aW5nIGEgZmlsZXMnIHN0YXR1c2VzLlxuICAgIGNvbnN0IGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zQ2hhbmdlcyA9IHJldmlzaW9uc0ZpbGVDaGFuZ2VzLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIGZvciAoY29uc3QgcmV2aXNpb25GaWxlQ2hhbmdlcyBvZiBsYXRlc3RUb09sZGVzdFJldmlzaW9uc0NoYW5nZXMpIHtcbiAgICAgIGNvbnN0IHthZGRlZCwgbW9kaWZpZWQsIGRlbGV0ZWR9ID0gcmV2aXNpb25GaWxlQ2hhbmdlcztcblxuICAgICAgbWVyZ2VTdGF0dXNQYXRocyhhZGRlZCwgRmlsZUNoYW5nZVN0YXR1cy5BRERFRCk7XG4gICAgICBtZXJnZVN0YXR1c1BhdGhzKG1vZGlmaWVkLCBGaWxlQ2hhbmdlU3RhdHVzLk1PRElGSUVEKTtcbiAgICAgIG1lcmdlU3RhdHVzUGF0aHMoZGVsZXRlZCwgRmlsZUNoYW5nZVN0YXR1cy5SRU1PVkVEKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVyZ2VkU3RhdHVzO1xuICB9XG5cbiAgZ2V0RGlydHlGaWxlQ2hhbmdlcygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXM7XG4gIH1cblxuICBnZXRDb21taXRNZXJnZUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGdldExhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXM7XG4gIH1cblxuICBhc3luYyBmZXRjaEhnRGlmZihmaWxlUGF0aDogTnVjbGlkZVVyaSwgZGlmZk9wdGlvbjogRGlmZk9wdGlvblR5cGUpOiBQcm9taXNlPEhnRGlmZlN0YXRlPiB7XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCB0aGlzLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIGNvbnN0IHtyZXZpc2lvbnMsIGNvbW1pdElkfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIC8vIFdoZW4gYGNvbXBhcmVDb21taXRJZGAgaXMgbnVsbCwgdGhlIGBIRUFEYCBjb21taXQgY29udGVudHMgaXMgY29tcGFyZWRcbiAgICAvLyB0byB0aGUgZmlsZXN5c3RlbSwgb3RoZXJ3aXNlIGl0IGNvbXBhcmVzIHRoYXQgY29tbWl0IHRvIGZpbGVzeXN0ZW0uXG4gICAgbGV0IGNvbXBhcmVDb21taXRJZCA9IG51bGw7XG4gICAgc3dpdGNoIChkaWZmT3B0aW9uKSB7XG4gICAgICBjYXNlIERpZmZPcHRpb24uRElSVFk6XG4gICAgICAgIGNvbXBhcmVDb21taXRJZCA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaWZmT3B0aW9uLkxBU1RfQ09NTUlUOlxuICAgICAgICBjb21wYXJlQ29tbWl0SWQgPSByZXZpc2lvbnMubGVuZ3RoIDw9IDFcbiAgICAgICAgICA/IG51bGxcbiAgICAgICAgICA6IHJldmlzaW9uc1tyZXZpc2lvbnMubGVuZ3RoIC0gMl0uaWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaWZmT3B0aW9uLkNPTVBBUkVfQ09NTUlUOlxuICAgICAgICBjb21wYXJlQ29tbWl0SWQgPSByZXZpc2lvbnNTdGF0ZS5jb21wYXJlQ29tbWl0SWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIERpZmYgT3B0aW9uOiAke2RpZmZPcHRpb259YCk7XG4gICAgfVxuICAgIGNvbnN0IGNvbW1pdHRlZENvbnRlbnRzID0gYXdhaXQgdGhpcy5fcmVwb3NpdG9yeVxuICAgICAgLmZldGNoRmlsZUNvbnRlbnRBdFJldmlzaW9uKGZpbGVQYXRoLCBjb21wYXJlQ29tbWl0SWQgPyBgJHtjb21wYXJlQ29tbWl0SWR9YCA6IG51bGwpXG4gICAgICAvLyBJZiB0aGUgZmlsZSBkaWRuJ3QgZXhpc3Qgb24gdGhlIHByZXZpb3VzIHJldmlzaW9uLCByZXR1cm4gZW1wdHkgY29udGVudHMuXG4gICAgICAudGhlbihjb250ZW50cyA9PiBjb250ZW50cyB8fCAnJywgX2VyciA9PiAnJyk7XG5cbiAgICBjb25zdCBmZXRjaGVkUmV2aXNpb25JZCA9IGNvbXBhcmVDb21taXRJZCAhPSBudWxsID8gY29tcGFyZUNvbW1pdElkIDogY29tbWl0SWQ7XG4gICAgY29uc3QgW3JldmlzaW9uSW5mb10gPSByZXZpc2lvbnMuZmlsdGVyKHJldmlzaW9uID0+IHJldmlzaW9uLmlkID09PSBmZXRjaGVkUmV2aXNpb25JZCk7XG4gICAgaW52YXJpYW50KFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgICAgYERpZmYgVml3IEZldGNoZXI6IHJldmlzaW9uIHdpdGggaWQgJHtmZXRjaGVkUmV2aXNpb25JZH0gbm90IGZvdW5kYCxcbiAgICApO1xuICAgIHJldHVybiB7XG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICB9O1xuICB9XG5cbiAgZ2V0VGVtcGxhdGVDb21taXRNZXNzYWdlKCk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9yZXBvc2l0b3J5LmdldENvbmZpZ1ZhbHVlQXN5bmMoJ2NvbW1pdHRlbXBsYXRlLmVtcHR5bXNnJyk7XG4gIH1cblxuICBhc3luYyBzZXRSZXZpc2lvbihyZXZpc2lvbjogUmV2aXNpb25JbmZvKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCB0aGlzLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIGNvbnN0IHtyZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG5cbiAgICBpbnZhcmlhbnQoXG4gICAgICByZXZpc2lvbnMgJiYgcmV2aXNpb25zLmZpbmQoY2hlY2sgPT4gY2hlY2suaWQgPT09IHJldmlzaW9uLmlkKSxcbiAgICAgICdEaWZmIFZpdyBUaW1lbGluZTogbm9uLWFwcGxpY2FibGUgc2VsZWN0ZWQgcmV2aXNpb24nLFxuICAgICk7XG5cbiAgICB0aGlzLl9zZWxlY3RlZENvbXBhcmVDb21taXRJZCA9IHJldmlzaW9uc1N0YXRlLmNvbXBhcmVDb21taXRJZCA9IHJldmlzaW9uLmlkO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG5cbiAgICBjb25zdCByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IGF3YWl0IHRoaXMuX2dldENhY2hlZFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKHJldmlzaW9uc1N0YXRlKTtcbiAgICB0aGlzLl9jb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gdGhpcy5fY29tcHV0ZUNvbW1pdE1lcmdlRnJvbUhpc3RvcnkoXG4gICAgICByZXZpc2lvbnNTdGF0ZSxcbiAgICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5LFxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KFVQREFURV9DT01NSVRfTUVSR0VfRklMRVNfRVZFTlQpO1xuICB9XG5cbiAgb25EaWRVcGRhdGVEaXJ0eUZpbGVDaGFuZ2VzKFxuICAgIGNhbGxiYWNrOiAoKSA9PiB2b2lkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihVUERBVEVfRElSVFlfRklMRVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkVXBkYXRlQ29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyhcbiAgICBjYWxsYmFjazogKCkgPT4gdm9pZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oVVBEQVRFX0NPTU1JVF9NRVJHRV9GSUxFU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VSZXZpc2lvbnMoXG4gICAgY2FsbGJhY2s6IChyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGdldFJlcG9zaXRvcnkoKTogSGdSZXBvc2l0b3J5Q2xpZW50IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yeTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcy5jbGVhcigpO1xuICAgIHRoaXMuX2NvbW1pdE1lcmdlRmlsZUNoYW5nZXMuY2xlYXIoKTtcbiAgICB0aGlzLl9sYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcy5jbGVhcigpO1xuICAgIHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLnJlc2V0KCk7XG4gIH1cbn1cbiJdfQ==