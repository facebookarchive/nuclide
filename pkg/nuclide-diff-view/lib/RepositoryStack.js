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
      if (!_nuclideCommons.array.find(revisions, function (revision) {
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

      (0, _assert2['default'])(revisions && _nuclideCommons.array.find(revisions, function (check) {
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
//# sourceMappingURL=data:application/json;base64,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S0FDN0Q7OztXQUVnQywyQ0FDL0IsUUFBb0IsRUFDUDtBQUNiLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsK0JBQStCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDcEU7OztXQUVtQiw4QkFDbEIsUUFBa0QsRUFDckM7QUFDYixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzNEOzs7V0FFWSx5QkFBdUI7QUFDbEMsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0tBQ3pCOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsVUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQy9CLFVBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyQyxVQUFJLENBQUMsMkJBQTJCLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDekMsVUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3ZDOzs7U0FwY2tCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6IlJlcG9zaXRvcnlTdGFjay5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1jbGllbnQnO1xuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSwgSGdEaWZmU3RhdGUsIFJldmlzaW9uc1N0YXRlLCBEaWZmT3B0aW9uVHlwZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7XG4gIFJldmlzaW9uRmlsZUNoYW5nZXMsXG4gIFJldmlzaW9uSW5mbyxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWJhc2UvbGliL0hnU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7SGdTdGF0dXNUb0ZpbGVDaGFuZ2VTdGF0dXMsIEZpbGVDaGFuZ2VTdGF0dXMsIERpZmZPcHRpb259IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7YXJyYXksIHByb21pc2VzLCBkZWJvdW5jZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7bm90aWZ5SW50ZXJuYWxFcnJvcn0gZnJvbSAnLi9ub3RpZmljYXRpb25zJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBMUlUgZnJvbSAnbHJ1LWNhY2hlJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcbmNvbnN0IHtzZXJpYWxpemVBc3luY0NhbGx9ID0gcHJvbWlzZXM7XG5jb25zdCBVUERBVEVfQ09NTUlUX01FUkdFX0ZJTEVTX0VWRU5UID0gJ3VwZGF0ZS1jb21taXQtbWVyZ2UtZmlsZXMnO1xuY29uc3QgVVBEQVRFX0RJUlRZX0ZJTEVTX0VWRU5UID0gJ3VwZGF0ZS1kaXJ0eS1maWxlcyc7XG5jb25zdCBDSEFOR0VfUkVWSVNJT05TX0VWRU5UID0gJ2RpZC1jaGFuZ2UtcmV2aXNpb25zJztcbmNvbnN0IFVQREFURV9TVEFUVVNfREVCT1VOQ0VfTVMgPSAyMDAwO1xuXG5jb25zdCBGRVRDSF9SRVZfSU5GT19SRVRSWV9USU1FX01TID0gMTAwMDtcbmNvbnN0IEZFVENIX1JFVl9JTkZPX01BWF9UUklFUyA9IDU7XG5cbnR5cGUgUmV2aXNpb25zRmlsZUhpc3RvcnkgPSBBcnJheTx7XG4gIGlkOiBudW1iZXI7XG4gIGNoYW5nZXM6IFJldmlzaW9uRmlsZUNoYW5nZXM7XG59PjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwb3NpdG9yeVN0YWNrIHtcblxuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9kaXJ0eUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgX2NvbW1pdE1lcmdlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfcmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50O1xuICBfbGFzdFJldmlzaW9uc1N0YXRlOiA/UmV2aXNpb25zU3RhdGU7XG4gIF9yZXZpc2lvbnNTdGF0ZVByb21pc2U6ID9Qcm9taXNlPFJldmlzaW9uc1N0YXRlPjtcbiAgX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZTogP1Byb21pc2U8UmV2aXNpb25zRmlsZUhpc3Rvcnk+O1xuICBfbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5OiA/UmV2aXNpb25zRmlsZUhpc3Rvcnk7XG4gIF9zZWxlY3RlZENvbXBhcmVDb21taXRJZDogP251bWJlcjtcbiAgX2lzQWN0aXZlOiBib29sZWFuO1xuICBfc2VyaWFsaXplZFVwZGF0ZVN0YXR1czogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzOiBMUlU8bnVtYmVyLCBSZXZpc2lvbkZpbGVDaGFuZ2VzPjtcblxuICBjb25zdHJ1Y3RvcihyZXBvc2l0b3J5OiBIZ1JlcG9zaXRvcnlDbGllbnQpIHtcbiAgICB0aGlzLl9yZXBvc2l0b3J5ID0gcmVwb3NpdG9yeTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9jb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2xhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcyA9IG5ldyBMUlUoe21heDogMTAwfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgdGhpcy5fbGFzdFJldmlzaW9uc1N0YXRlID0gbnVsbDtcbiAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlU3RhdHVzID0gc2VyaWFsaXplQXN5bmNDYWxsKCgpID0+IHRoaXMuX3VwZGF0ZUNoYW5nZWRTdGF0dXMoKSk7XG4gICAgY29uc3QgZGVib3VuY2VkU2VyaWFsaXplZFVwZGF0ZVN0YXR1cyA9IGRlYm91bmNlKFxuICAgICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZVN0YXR1cyxcbiAgICAgIFVQREFURV9TVEFUVVNfREVCT1VOQ0VfTVMsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIGRlYm91bmNlZFNlcmlhbGl6ZWRVcGRhdGVTdGF0dXMoKTtcbiAgICAvLyBHZXQgdGhlIGluaXRpYWwgcHJvamVjdCBzdGF0dXMsIGlmIGl0J3Mgbm90IGFscmVhZHkgdGhlcmUsXG4gICAgLy8gdHJpZ2dlcmVkIGJ5IGFub3RoZXIgaW50ZWdyYXRpb24sIGxpa2UgdGhlIGZpbGUgdHJlZS5cbiAgICByZXBvc2l0b3J5LmdldFN0YXR1c2VzKFtyZXBvc2l0b3J5LmdldFByb2plY3REaXJlY3RvcnkoKV0pO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgcmVwb3NpdG9yeS5vbkRpZENoYW5nZVN0YXR1c2VzKGRlYm91bmNlZFNlcmlhbGl6ZWRVcGRhdGVTdGF0dXMpLFxuICAgICk7XG4gIH1cblxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXMoKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnVwZGF0ZS1jaGFuZ2Utc3RhdHVzJylcbiAgYXN5bmMgX3VwZGF0ZUNoYW5nZWRTdGF0dXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3VwZGF0ZURpcnR5RmlsZUNoYW5nZXMoKTtcbiAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZUNvbW1pdE1lcmdlRmlsZUNoYW5nZXMoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbm90aWZ5SW50ZXJuYWxFcnJvcihlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZURpcnR5RmlsZUNoYW5nZXMoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyA9IHRoaXMuX2dldERpcnR5Q2hhbmdlZFN0YXR1cygpO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChVUERBVEVfRElSVFlfRklMRVNfRVZFTlQpO1xuICB9XG5cbiAgX2dldERpcnR5Q2hhbmdlZFN0YXR1cygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgY29uc3QgZGlydHlGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBzdGF0dXNlcyA9IHRoaXMuX3JlcG9zaXRvcnkuZ2V0QWxsUGF0aFN0YXR1c2VzKCk7XG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBpbiBzdGF0dXNlcykge1xuICAgICAgY29uc3QgY2hhbmdlU3RhdHVzID0gSGdTdGF0dXNUb0ZpbGVDaGFuZ2VTdGF0dXNbc3RhdHVzZXNbZmlsZVBhdGhdXTtcbiAgICAgIGlmIChjaGFuZ2VTdGF0dXMgIT0gbnVsbCkge1xuICAgICAgICBkaXJ0eUZpbGVDaGFuZ2VzLnNldChmaWxlUGF0aCwgY2hhbmdlU3RhdHVzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRpcnR5RmlsZUNoYW5nZXM7XG4gIH1cblxuICBjb21taXQobWVzc2FnZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcG9zaXRvcnkuY29tbWl0KG1lc3NhZ2UpO1xuICB9XG5cbiAgYW1lbmQobWVzc2FnZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcG9zaXRvcnkuYW1lbmQobWVzc2FnZSk7XG4gIH1cblxuICByZXZlcnQoZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9yZXBvc2l0b3J5LnJldmVydChmaWxlUGF0aHMpO1xuICB9XG5cbiAgYWRkKGZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yeS5hZGQoZmlsZVBhdGhzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGZpbGUgY2hhbmdlIHN0YXRlIGNvbXBhcmluZyB0aGUgZGlydHkgZmlsZXN5c3RlbSBzdGF0dXNcbiAgICogdG8gYSBzZWxlY3RlZCBjb21taXQuXG4gICAqIFRoYXQgd291bGQgYmUgYSBtZXJnZSBvZiBgaGcgc3RhdHVzYCB3aXRoIHRoZSBkaWZmIGZyb20gY29tbWl0cyxcbiAgICogYW5kIGBoZyBsb2cgLS1yZXYgJHtyZXZJZH1gIGZvciBldmVyeSBjb21taXQuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlQ29tbWl0TWVyZ2VGaWxlQ2hhbmdlcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBXZSBzaG91bGQgb25seSB1cGRhdGUgdGhlIHJldmlzaW9uIHN0YXRlIHdoZW4gdGhlIHJlcG9zaXRvcnkgaXMgYWN0aXZlLlxuICAgIGlmICghdGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZSA9IG51bGw7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGxhc3RSZXZpc2lvbnNTdGF0ZSA9IHRoaXMuX2xhc3RSZXZpc2lvbnNTdGF0ZTtcbiAgICBjb25zdCByZXZpc2lvbnNTdGF0ZSA9IGF3YWl0IHRoaXMuZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgLy8gVGhlIHJldmlzaW9ucyBoYXZlbid0IGNoYW5nZWQgaWYgdGhlIHJldmlzaW9ucycgaWRzIGFyZSB0aGUgc2FtZS5cbiAgICAvLyBUaGF0J3MgYmVjYXVzZSBjb21taXQgaWRzIGFyZSB1bmlxdWUgYW5kIGluY3JlbWVudGFsLlxuICAgIC8vIEFsc28sIGFueSB3cml0ZSBvcGVyYXRpb24gd2lsbCB1cGRhdGUgdGhlbS5cbiAgICAvLyBUaGF0IHdheSwgd2UgZ3VhcmFudGVlIHdlIG9ubHkgdXBkYXRlIHRoZSByZXZpc2lvbnMgc3RhdGUgaWYgdGhlIHJldmlzaW9ucyBhcmUgY2hhbmdlZC5cbiAgICBpZiAoXG4gICAgICBsYXN0UmV2aXNpb25zU3RhdGUgPT0gbnVsbCB8fFxuICAgICAgIWFycmF5LmVxdWFsKFxuICAgICAgICBsYXN0UmV2aXNpb25zU3RhdGUucmV2aXNpb25zLFxuICAgICAgICByZXZpc2lvbnNTdGF0ZS5yZXZpc2lvbnMsXG4gICAgICAgIChyZXZpc2lvbjEsIHJldmlzaW9uMikgPT4gcmV2aXNpb24xLmlkID09PSByZXZpc2lvbjIuaWQsXG4gICAgICApXG4gICAgKSB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgcmV2aXNpb25zU3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLl9sYXN0UmV2aXNpb25zU3RhdGUgPSByZXZpc2lvbnNTdGF0ZTtcblxuICAgIC8vIElmIHRoZSBjb21taXRzIGhhdmVuJ3QgY2hhbmdlZCBpZHMsIHRoZW4gdGhpZXIgZGlmZiBoYXZlbid0IGNoYW5nZWQgYXMgd2VsbC5cbiAgICBsZXQgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBudWxsO1xuICAgIGlmICh0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgIT0gbnVsbCkge1xuICAgICAgY29uc3QgZmlsZUhpc3RvcnlSZXZpc2lvbklkcyA9IHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeVxuICAgICAgICAubWFwKHJldmlzaW9uQ2hhbmdlcyA9PiByZXZpc2lvbkNoYW5nZXMuaWQpO1xuICAgICAgY29uc3QgcmV2aXNpb25JZHMgPSByZXZpc2lvbnNTdGF0ZS5yZXZpc2lvbnMubWFwKHJldmlzaW9uID0+IHJldmlzaW9uLmlkKTtcbiAgICAgIGlmIChhcnJheS5lcXVhbChyZXZpc2lvbklkcywgZmlsZUhpc3RvcnlSZXZpc2lvbklkcykpIHtcbiAgICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3Rvcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRmV0Y2ggcmV2aXNpb25zIGhpc3RvcnkgaWYgcmV2aXNpb25zIHN0YXRlIGhhdmUgY2hhbmdlZC5cbiAgICBpZiAocmV2aXNpb25zRmlsZUhpc3RvcnkgPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBhd2FpdCB0aGlzLl9nZXRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShyZXZpc2lvbnNTdGF0ZSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgICAgJ0Nhbm5vdCBmZXRjaCByZXZpc2lvbiBoaXN0b3J5OiAnICtcbiAgICAgICAgICAnKGNvdWxkIGhhcHBlbiB3aXRoIHBlbmRpbmcgc291cmNlLWNvbnRyb2wgaGlzdG9yeSB3cml0aW5nIG9wZXJhdGlvbnMpJyxcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9jb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gdGhpcy5fY29tcHV0ZUNvbW1pdE1lcmdlRnJvbUhpc3RvcnkoXG4gICAgICByZXZpc2lvbnNTdGF0ZSxcbiAgICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5LFxuICAgICk7XG5cbiAgICBjb25zdCBsYXN0Q29tbWl0RmlsZUNoYW5nZXMgPSByZXZpc2lvbnNGaWxlSGlzdG9yeS5sZW5ndGggPD0gMVxuICAgICAgPyBudWxsIDpcbiAgICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5W3JldmlzaW9uc0ZpbGVIaXN0b3J5Lmxlbmd0aCAtIDFdLmNoYW5nZXM7XG5cbiAgICB0aGlzLl9sYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyA9IHRoaXMuX21lcmdlRmlsZVN0YXR1c2VzKFxuICAgICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyxcbiAgICAgIGxhc3RDb21taXRGaWxlQ2hhbmdlcyA9PSBudWxsID8gW10gOiBbbGFzdENvbW1pdEZpbGVDaGFuZ2VzXSxcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChVUERBVEVfQ09NTUlUX01FUkdFX0ZJTEVTX0VWRU5UKTtcbiAgfVxuXG4gIGdldFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpOiBQcm9taXNlPFJldmlzaW9uc1N0YXRlPiB7XG4gICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gdGhpcy5fZmV0Y2hSZXZpc2lvbnNTdGF0ZSgpLnRoZW4oXG4gICAgICB0aGlzLl9hbWVuZFNlbGVjdGVkQ29tcGFyZUNvbW1pdElkLmJpbmQodGhpcyksXG4gICAgICBlcnJvciA9PiB7XG4gICAgICAgIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZSA9IG51bGw7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSxcbiAgICApO1xuICAgIHJldHVybiB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2U7XG4gIH1cblxuICBnZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTogUHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT4ge1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlUHJvbWlzZSA9IHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZTtcbiAgICBpZiAocmV2aXNpb25zU3RhdGVQcm9taXNlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiByZXZpc2lvbnNTdGF0ZVByb21pc2UudGhlbih0aGlzLl9hbWVuZFNlbGVjdGVkQ29tcGFyZUNvbW1pdElkLmJpbmQodGhpcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW1lbmQgdGhlIHJldmlzaW9ucyBzdGF0ZSB3aXRoIHRoZSBsYXRlc3Qgc2VsZWN0ZWQgdmFsaWQgY29tcGFyZSBjb21taXQgaWQuXG4gICAqL1xuICBfYW1lbmRTZWxlY3RlZENvbXBhcmVDb21taXRJZChyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpOiBSZXZpc2lvbnNTdGF0ZSB7XG4gICAgY29uc3Qge2NvbW1pdElkLCByZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG4gICAgLy8gUHJpb3JpdGl6ZSB0aGUgY2FjaGVkIGNvbXBhZXJlQ29tbWl0SWQsIGlmIGl0IGV4aXN0cy5cbiAgICAvLyBUaGUgdXNlciBjb3VsZCBoYXZlIHNlbGVjdGVkIHRoYXQgZnJvbSB0aGUgdGltZWxpbmUgdmlldy5cbiAgICBsZXQgY29tcGFyZUNvbW1pdElkID0gdGhpcy5fc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQ7XG4gICAgaWYgKCFhcnJheS5maW5kKHJldmlzaW9ucywgcmV2aXNpb24gPT4gcmV2aXNpb24uaWQgPT09IGNvbXBhcmVDb21taXRJZCkpIHtcbiAgICAgIC8vIEludmFsaWRhdGUgaWYgdGhlcmUgdGhlcmUgaXMgbm8gbG9uZ2VyIGEgcmV2aXNpb24gd2l0aCB0aGF0IGlkLlxuICAgICAgY29tcGFyZUNvbW1pdElkID0gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMgPSByZXZpc2lvbnMuc2xpY2UoKS5yZXZlcnNlKCk7XG4gICAgaWYgKGNvbXBhcmVDb21taXRJZCA9PSBudWxsICYmIGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgIC8vIElmIHRoZSB1c2VyIGhhcyBhbHJlYWR5IGNvbW1pdHRlZCwgbW9zdCBvZiB0aGUgdGltZXMsIGhlJ2QgYmUgd29ya2luZyBvbiBhbiBhbWVuZC5cbiAgICAgIC8vIFNvLCB0aGUgaGV1cmlzdGljIGhlcmUgaXMgdG8gY29tcGFyZSBhZ2FpbnN0IHRoZSBwcmV2aW91cyB2ZXJzaW9uLFxuICAgICAgLy8gbm90IHRoZSBqdXN0LWNvbW1pdHRlZCBvbmUsIHdoaWxlIHRoZSByZXZpc2lvbnMgdGltZWxpbmVcbiAgICAgIC8vIHdvdWxkIGdpdmUgYSB3YXkgdG8gc3BlY2lmeSBvdGhlcndpc2UuXG4gICAgICBjb21wYXJlQ29tbWl0SWQgPSBsYXRlc3RUb09sZGVzdFJldmlzaW9uc1sxXS5pZDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJldmlzaW9ucyxcbiAgICAgIGNvbW1pdElkLFxuICAgICAgY29tcGFyZUNvbW1pdElkLFxuICAgIH07XG4gIH1cblxuICBfZ2V0UmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UoXG4gICAgcmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlLFxuICApOiBQcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PiB7XG4gICAgdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlID0gdGhpcy5fZmV0Y2hSZXZpc2lvbnNGaWxlSGlzdG9yeShyZXZpc2lvbnNTdGF0ZSlcbiAgICAgIC50aGVuKHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0+XG4gICAgICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IHJldmlzaW9uc0ZpbGVIaXN0b3J5XG4gICAgICAsIGVycm9yID0+IHtcbiAgICAgICAgdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gbnVsbDtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlO1xuICB9XG5cbiAgX2dldENhY2hlZFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgKTogUHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT4ge1xuICAgIGlmICh0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2UgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKHJldmlzaW9uc1N0YXRlKTtcbiAgICB9XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5mZXRjaC1yZXZpc2lvbnMtc3RhdGUnKVxuICBhc3luYyBfZmV0Y2hSZXZpc2lvbnNTdGF0ZSgpOiBQcm9taXNlPFJldmlzaW9uc1N0YXRlPiB7XG4gICAgLy8gV2hpbGUgcmViYXNpbmcsIHRoZSBjb21tb24gYW5jZXN0b3Igb2YgYEhFQURgIGFuZCBgQkFTRWBcbiAgICAvLyBtYXkgYmUgbm90IGFwcGxpY2FibGUsIGJ1dCB0aGF0J3MgZGVmaW5lZCBvbmNlIHRoZSByZWJhc2UgaXMgZG9uZS5cbiAgICAvLyBIZW5jZSwgd2UgbmVlZCB0byByZXRyeSBmZXRjaGluZyB0aGUgcmV2aXNpb24gaW5mbyAoZGVwZW5kaW5nIG9uIHRoZSBjb21tb24gYW5jZXN0b3IpXG4gICAgLy8gYmVjYXVzZSB0aGUgd2F0Y2htYW4tYmFzZWQgTWVyY3VyaWFsIHVwZGF0ZXMgZG9lc24ndCBjb25zaWRlciBvciB3YWl0IHdoaWxlIHJlYmFzaW5nLlxuICAgIGNvbnN0IHJldmlzaW9ucyA9IGF3YWl0IHByb21pc2VzLnJldHJ5TGltaXQoXG4gICAgICAoKSA9PiB0aGlzLl9yZXBvc2l0b3J5LmZldGNoUmV2aXNpb25JbmZvQmV0d2VlbkhlYWRBbmRCYXNlKCksXG4gICAgICByZXN1bHQgPT4gcmVzdWx0ICE9IG51bGwsXG4gICAgICBGRVRDSF9SRVZfSU5GT19NQVhfVFJJRVMsXG4gICAgICBGRVRDSF9SRVZfSU5GT19SRVRSWV9USU1FX01TLFxuICAgICk7XG4gICAgaWYgKHJldmlzaW9ucyA9PSBudWxsIHx8IHJldmlzaW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZldGNoIHJldmlzaW9uIGluZm8gbmVlZGVkIScpO1xuICAgIH1cbiAgICBjb25zdCBjb21taXRJZCA9IHJldmlzaW9uc1tyZXZpc2lvbnMubGVuZ3RoIC0gMV0uaWQ7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJldmlzaW9ucyxcbiAgICAgIGNvbW1pdElkLFxuICAgICAgY29tcGFyZUNvbW1pdElkOiBudWxsLFxuICAgIH07XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5mZXRjaC1yZXZpc2lvbnMtY2hhbmdlLWhpc3RvcnknKVxuICBhc3luYyBfZmV0Y2hSZXZpc2lvbnNGaWxlSGlzdG9yeShyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpOiBQcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PiB7XG4gICAgY29uc3Qge3JldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcblxuICAgIC8vIFJldmlzaW9uIGlkcyBhcmUgdW5pcXVlIGFuZCBkb24ndCBjaGFuZ2UsIGV4Y2VwdCB3aGVuIHRoZSByZXZpc2lvbiBpcyBhbWVuZGVkL3JlYmFzZWQuXG4gICAgLy8gSGVuY2UsIGl0J3MgY2FjaGVkIGhlcmUgdG8gYXZvaWQgc2VydmljZSBjYWxscyB3aGVuIHdvcmtpbmcgb24gYSBzdGFjayBvZiBjb21taXRzLlxuICAgIGNvbnN0IHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gYXdhaXQgUHJvbWlzZS5hbGwocmV2aXNpb25zXG4gICAgICAubWFwKGFzeW5jIHJldmlzaW9uID0+IHtcbiAgICAgICAgY29uc3Qge2lkfSA9IHJldmlzaW9uO1xuICAgICAgICBsZXQgY2hhbmdlcyA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5oYXMoaWQpKSB7XG4gICAgICAgICAgY2hhbmdlcyA9IHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLmdldChpZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hhbmdlcyA9IGF3YWl0IHRoaXMuX3JlcG9zaXRvcnkuZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKGAke2lkfWApO1xuICAgICAgICAgIGlmIChjaGFuZ2VzID09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2hhbmdlcyBub3QgYXZhaWxhYmxlIGZvciByZXZpc2lvbjogJHtpZH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMuc2V0KGlkLCBjaGFuZ2VzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge2lkLCBjaGFuZ2VzfTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHJldHVybiByZXZpc2lvbnNGaWxlSGlzdG9yeTtcbiAgfVxuXG4gIF9jb21wdXRlQ29tbWl0TWVyZ2VGcm9tSGlzdG9yeShcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICAgcmV2aXNpb25zRmlsZUhpc3Rvcnk6IFJldmlzaW9uc0ZpbGVIaXN0b3J5LFxuICApOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG5cbiAgICBjb25zdCB7Y29tbWl0SWQsIGNvbXBhcmVDb21taXRJZH0gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICAvLyBUaGUgc3RhdHVzIGlzIGZldGNoZWQgYnkgbWVyZ2luZyB0aGUgY2hhbmdlcyByaWdodCBhZnRlciB0aGUgYGNvbXBhcmVDb21taXRJZGAgaWYgc3BlY2lmaWVkLFxuICAgIC8vIG9yIGBIRUFEYCBpZiBub3QuXG4gICAgY29uc3Qgc3RhcnRDb21taXRJZCA9IGNvbXBhcmVDb21taXRJZCA/IChjb21wYXJlQ29tbWl0SWQgKyAxKSA6IGNvbW1pdElkO1xuICAgIC8vIEdldCB0aGUgcmV2aXNpb24gY2hhbmdlcyB0aGF0J3MgbmV3ZXIgdGhhbiBvciBpcyB0aGUgY3VycmVudCBjb21taXQgaWQuXG4gICAgY29uc3QgY29tbWl0UmV2aXNpb25zRmlsZUNoYW5nZXMgPSByZXZpc2lvbnNGaWxlSGlzdG9yeVxuICAgICAgLnNsaWNlKDEpIC8vIEV4Y2x1ZGUgdGhlIEJBU0UgcmV2aXNpb24uXG4gICAgICAuZmlsdGVyKHJldmlzaW9uID0+IHJldmlzaW9uLmlkID49IHN0YXJ0Q29tbWl0SWQpXG4gICAgICAubWFwKHJldmlzaW9uID0+IHJldmlzaW9uLmNoYW5nZXMpO1xuXG4gICAgLy8gVGhlIGxhc3Qgc3RhdHVzIHRvIG1lcmdlIGlzIHRoZSBkaXJ0eSBmaWxlc3lzdGVtIHN0YXR1cy5cbiAgICBjb25zdCBtZXJnZWRGaWxlU3RhdHVzZXMgPSB0aGlzLl9tZXJnZUZpbGVTdGF0dXNlcyhcbiAgICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMsXG4gICAgICBjb21taXRSZXZpc2lvbnNGaWxlQ2hhbmdlcyxcbiAgICApO1xuICAgIHJldHVybiBtZXJnZWRGaWxlU3RhdHVzZXM7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2VzIHRoZSBmaWxlIGNoYW5nZSBzdGF0dXNlcyBvZiB0aGUgZGlydHkgZmlsZXN5c3RlbSBzdGF0ZSB3aXRoXG4gICAqIHRoZSByZXZpc2lvbiBjaGFuZ2VzLCB3aGVyZSBkaXJ0eSBjaGFuZ2VzIGFuZCBtb3JlIHJlY2VudCByZXZpc2lvbnNcbiAgICogdGFrZSBwcmlvcml0eSBpbiBkZWNpZGluZyB3aGljaCBzdGF0dXMgYSBmaWxlIGlzIGluLlxuICAgKi9cbiAgX21lcmdlRmlsZVN0YXR1c2VzKFxuICAgIGRpcnR5U3RhdHVzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPixcbiAgICByZXZpc2lvbnNGaWxlQ2hhbmdlczogQXJyYXk8UmV2aXNpb25GaWxlQ2hhbmdlcz4sXG4gICk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICBjb25zdCBtZXJnZWRTdGF0dXMgPSBuZXcgTWFwKGRpcnR5U3RhdHVzKTtcbiAgICBjb25zdCBtZXJnZWRGaWxlUGF0aHMgPSBuZXcgU2V0KG1lcmdlZFN0YXR1cy5rZXlzKCkpO1xuXG4gICAgZnVuY3Rpb24gbWVyZ2VTdGF0dXNQYXRocyhcbiAgICAgIGZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4sXG4gICAgICBjaGFuZ2VTdGF0dXNWYWx1ZTogRmlsZUNoYW5nZVN0YXR1c1ZhbHVlLFxuICAgICkge1xuICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBmaWxlUGF0aHMpIHtcbiAgICAgICAgaWYgKCFtZXJnZWRGaWxlUGF0aHMuaGFzKGZpbGVQYXRoKSkge1xuICAgICAgICAgIG1lcmdlZFN0YXR1cy5zZXQoZmlsZVBhdGgsIGNoYW5nZVN0YXR1c1ZhbHVlKTtcbiAgICAgICAgICBtZXJnZWRGaWxlUGF0aHMuYWRkKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfVxuXG4gICAgLy8gTW9yZSByZWNlbnQgcmV2aXNpb24gY2hhbmdlcyB0YWtlcyBwcmlvcml0eSBpbiBzcGVjaWZ5aW5nIGEgZmlsZXMnIHN0YXR1c2VzLlxuICAgIGNvbnN0IGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zQ2hhbmdlcyA9IHJldmlzaW9uc0ZpbGVDaGFuZ2VzLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIGZvciAoY29uc3QgcmV2aXNpb25GaWxlQ2hhbmdlcyBvZiBsYXRlc3RUb09sZGVzdFJldmlzaW9uc0NoYW5nZXMpIHtcbiAgICAgIGNvbnN0IHthZGRlZCwgbW9kaWZpZWQsIGRlbGV0ZWR9ID0gcmV2aXNpb25GaWxlQ2hhbmdlcztcblxuICAgICAgbWVyZ2VTdGF0dXNQYXRocyhhZGRlZCwgRmlsZUNoYW5nZVN0YXR1cy5BRERFRCk7XG4gICAgICBtZXJnZVN0YXR1c1BhdGhzKG1vZGlmaWVkLCBGaWxlQ2hhbmdlU3RhdHVzLk1PRElGSUVEKTtcbiAgICAgIG1lcmdlU3RhdHVzUGF0aHMoZGVsZXRlZCwgRmlsZUNoYW5nZVN0YXR1cy5SRU1PVkVEKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVyZ2VkU3RhdHVzO1xuICB9XG5cbiAgZ2V0RGlydHlGaWxlQ2hhbmdlcygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXM7XG4gIH1cblxuICBnZXRDb21taXRNZXJnZUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGdldExhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXM7XG4gIH1cblxuICBhc3luYyBmZXRjaEhnRGlmZihmaWxlUGF0aDogTnVjbGlkZVVyaSwgZGlmZk9wdGlvbjogRGlmZk9wdGlvblR5cGUpOiBQcm9taXNlPEhnRGlmZlN0YXRlPiB7XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCB0aGlzLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIGNvbnN0IHtyZXZpc2lvbnMsIGNvbW1pdElkfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIC8vIFdoZW4gYGNvbXBhcmVDb21taXRJZGAgaXMgbnVsbCwgdGhlIGBIRUFEYCBjb21taXQgY29udGVudHMgaXMgY29tcGFyZWRcbiAgICAvLyB0byB0aGUgZmlsZXN5c3RlbSwgb3RoZXJ3aXNlIGl0IGNvbXBhcmVzIHRoYXQgY29tbWl0IHRvIGZpbGVzeXN0ZW0uXG4gICAgbGV0IGNvbXBhcmVDb21taXRJZCA9IG51bGw7XG4gICAgc3dpdGNoIChkaWZmT3B0aW9uKSB7XG4gICAgICBjYXNlIERpZmZPcHRpb24uRElSVFk6XG4gICAgICAgIGNvbXBhcmVDb21taXRJZCA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaWZmT3B0aW9uLkxBU1RfQ09NTUlUOlxuICAgICAgICBjb21wYXJlQ29tbWl0SWQgPSByZXZpc2lvbnMubGVuZ3RoIDw9IDFcbiAgICAgICAgICA/IG51bGxcbiAgICAgICAgICA6IHJldmlzaW9uc1tyZXZpc2lvbnMubGVuZ3RoIC0gMl0uaWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBEaWZmT3B0aW9uLkNPTVBBUkVfQ09NTUlUOlxuICAgICAgICBjb21wYXJlQ29tbWl0SWQgPSByZXZpc2lvbnNTdGF0ZS5jb21wYXJlQ29tbWl0SWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIERpZmYgT3B0aW9uOiAke2RpZmZPcHRpb259YCk7XG4gICAgfVxuICAgIGNvbnN0IGNvbW1pdHRlZENvbnRlbnRzID0gYXdhaXQgdGhpcy5fcmVwb3NpdG9yeVxuICAgICAgLmZldGNoRmlsZUNvbnRlbnRBdFJldmlzaW9uKGZpbGVQYXRoLCBjb21wYXJlQ29tbWl0SWQgPyBgJHtjb21wYXJlQ29tbWl0SWR9YCA6IG51bGwpXG4gICAgICAvLyBJZiB0aGUgZmlsZSBkaWRuJ3QgZXhpc3Qgb24gdGhlIHByZXZpb3VzIHJldmlzaW9uLCByZXR1cm4gZW1wdHkgY29udGVudHMuXG4gICAgICAudGhlbihjb250ZW50cyA9PiBjb250ZW50cyB8fCAnJywgX2VyciA9PiAnJyk7XG5cbiAgICBjb25zdCBmZXRjaGVkUmV2aXNpb25JZCA9IGNvbXBhcmVDb21taXRJZCAhPSBudWxsID8gY29tcGFyZUNvbW1pdElkIDogY29tbWl0SWQ7XG4gICAgY29uc3QgW3JldmlzaW9uSW5mb10gPSByZXZpc2lvbnMuZmlsdGVyKHJldmlzaW9uID0+IHJldmlzaW9uLmlkID09PSBmZXRjaGVkUmV2aXNpb25JZCk7XG4gICAgaW52YXJpYW50KFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgICAgYERpZmYgVml3IEZldGNoZXI6IHJldmlzaW9uIHdpdGggaWQgJHtmZXRjaGVkUmV2aXNpb25JZH0gbm90IGZvdW5kYCxcbiAgICApO1xuICAgIHJldHVybiB7XG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICB9O1xuICB9XG5cbiAgZ2V0VGVtcGxhdGVDb21taXRNZXNzYWdlKCk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9yZXBvc2l0b3J5LmdldENvbmZpZ1ZhbHVlQXN5bmMoJ2NvbW1pdHRlbXBsYXRlLmVtcHR5bXNnJyk7XG4gIH1cblxuICBhc3luYyBzZXRSZXZpc2lvbihyZXZpc2lvbjogUmV2aXNpb25JbmZvKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCB0aGlzLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIGNvbnN0IHtyZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG5cbiAgICBpbnZhcmlhbnQoXG4gICAgICByZXZpc2lvbnMgJiYgYXJyYXkuZmluZChyZXZpc2lvbnMsIGNoZWNrID0+IGNoZWNrLmlkID09PSByZXZpc2lvbi5pZCksXG4gICAgICAnRGlmZiBWaXcgVGltZWxpbmU6IG5vbi1hcHBsaWNhYmxlIHNlbGVjdGVkIHJldmlzaW9uJyxcbiAgICApO1xuXG4gICAgdGhpcy5fc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQgPSByZXZpc2lvbnNTdGF0ZS5jb21wYXJlQ29tbWl0SWQgPSByZXZpc2lvbi5pZDtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgcmV2aXNpb25zU3RhdGUpO1xuXG4gICAgY29uc3QgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBhd2FpdCB0aGlzLl9nZXRDYWNoZWRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShyZXZpc2lvbnNTdGF0ZSk7XG4gICAgdGhpcy5fY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyA9IHRoaXMuX2NvbXB1dGVDb21taXRNZXJnZUZyb21IaXN0b3J5KFxuICAgICAgcmV2aXNpb25zU3RhdGUsXG4gICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSxcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChVUERBVEVfQ09NTUlUX01FUkdFX0ZJTEVTX0VWRU5UKTtcbiAgfVxuXG4gIG9uRGlkVXBkYXRlRGlydHlGaWxlQ2hhbmdlcyhcbiAgICBjYWxsYmFjazogKCkgPT4gdm9pZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oVVBEQVRFX0RJUlRZX0ZJTEVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZFVwZGF0ZUNvbW1pdE1lcmdlRmlsZUNoYW5nZXMoXG4gICAgY2FsbGJhY2s6ICgpID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKFVQREFURV9DT01NSVRfTUVSR0VfRklMRVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlUmV2aXNpb25zKFxuICAgIGNhbGxiYWNrOiAocmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlKSA9PiB2b2lkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBnZXRSZXBvc2l0b3J5KCk6IEhnUmVwb3NpdG9yeUNsaWVudCB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcG9zaXRvcnk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMuY2xlYXIoKTtcbiAgICB0aGlzLl9jb21taXRNZXJnZUZpbGVDaGFuZ2VzLmNsZWFyKCk7XG4gICAgdGhpcy5fbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMuY2xlYXIoKTtcbiAgICB0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5yZXNldCgpO1xuICB9XG59XG4iXX0=