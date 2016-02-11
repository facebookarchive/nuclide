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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _constants = require('./constants');

var _utils = require('./utils');

var _commons = require('../../commons');

var _analytics = require('../../analytics');

var _notifications = require('./notifications');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _logging = require('../../logging');

var logger = (0, _logging.getLogger)();
var serializeAsyncCall = _commons.promises.serializeAsyncCall;

var CHANGE_COMPARE_STATUS_EVENT = 'did-change-compare-status';
var CHANGE_DIRTY_STATUS_EVENT = 'did-change-dirty-status';
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
    this._compareFileChanges = new Map();
    this._dirtyFileChanges = new Map();
    this._isActive = false;
    this._revisionIdToFileChanges = new _lruCache2['default']({ max: 100 });
    this._selectedCompareCommitId = null;
    this._lastRevisionsFileHistory = null;
    this._serializedUpdateStatus = serializeAsyncCall(function () {
      return _this._updateChangedStatus();
    });
    var debouncedSerializedUpdateStatus = (0, _commons.debounce)(this._serializedUpdateStatus, UPDATE_STATUS_DEBOUNCE_MS, false);
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
    decorators: [(0, _analytics.trackTiming)('diff-view.update-change-status')],
    value: _asyncToGenerator(function* () {
      try {
        this._updateDirtyFileChanges();
        yield this._updateCompareFileChanges();
      } catch (error) {
        (0, _notifications.notifyInternalError)(error);
      }
    })
  }, {
    key: '_updateDirtyFileChanges',
    value: function _updateDirtyFileChanges() {
      this._dirtyFileChanges = this._getDirtyChangedStatus();
      this._emitter.emit(CHANGE_DIRTY_STATUS_EVENT, this._dirtyFileChanges);
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

    /**
     * Update the file change state comparing the dirty filesystem status
     * to a selected commit.
     * That would be a merge of `hg status` with the diff from commits,
     * and `hg log --rev ${revId}` for every commit.
     */
  }, {
    key: '_updateCompareFileChanges',
    value: _asyncToGenerator(function* () {
      // We should only update the revision state when the repository is active.
      if (!this._isActive) {
        this._revisionsStatePromise = null;
        return;
      }
      var revisionsState = yield this._getRevisionsStatePromise();
      this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);

      // If the commits haven't changed ids, then thier diff haven't changed as well.
      var revisionsFileHistory = null;
      if (this._lastRevisionsFileHistory != null) {
        var fileHistoryRevisionIds = this._lastRevisionsFileHistory.map(function (revisionChanges) {
          return revisionChanges.id;
        });
        var revisionIds = revisionsState.revisions.map(function (revision) {
          return revision.id;
        });
        if (_commons.array.equal(revisionIds, fileHistoryRevisionIds)) {
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
      this._compareFileChanges = this._computeCompareChangesFromHistory(revisionsState, revisionsFileHistory);
      this._emitter.emit(CHANGE_COMPARE_STATUS_EVENT, this._compareFileChanges);
    })
  }, {
    key: '_getRevisionsStatePromise',
    value: function _getRevisionsStatePromise() {
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
        return this._getRevisionsStatePromise();
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
      if (!_commons.array.find(revisions, function (revision) {
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
    decorators: [(0, _analytics.trackTiming)('diff-view.fetch-revisions-state')],
    value: _asyncToGenerator(function* () {
      var _this4 = this;

      // While rebasing, the common ancestor of `HEAD` and `BASE`
      // may be not applicable, but that's defined once the rebase is done.
      // Hence, we need to retry fetching the revision info (depending on the common ancestor)
      // because the watchman-based Mercurial updates doesn't consider or wait while rebasing.
      var revisions = yield _commons.promises.retryLimit(function () {
        return _this4._repository.fetchRevisionInfoBetweenHeadAndBase();
      }, function (result) {
        return result != null;
      }, FETCH_REV_INFO_MAX_TRIES, FETCH_REV_INFO_RETRY_TIME_MS);
      if (revisions == null) {
        throw new Error('Cannot fetch revision info needed!');
      }
      var commitId = revisions[revisions.length - 1];
      return {
        revisions: revisions,
        commitId: commitId,
        compareCommitId: null
      };
    })
  }, {
    key: '_fetchRevisionsFileHistory',
    decorators: [(0, _analytics.trackTiming)('diff-view.fetch-revisions-change-history')],
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
    key: '_computeCompareChangesFromHistory',
    value: function _computeCompareChangesFromHistory(revisionsState, revisionsFileHistory) {
      var commitId = revisionsState.commitId;
      var compareCommitId = revisionsState.compareCommitId;

      // The status is fetched by merging the changes right after the `compareCommitId` if specified,
      // or `HEAD` if not.
      var startCommitId = compareCommitId ? compareCommitId + 1 : commitId;
      // Get the revision changes that's newer than or is the current commit id.
      var compareRevisionsFileChanges = revisionsFileHistory.slice(1) // Exclude the BASE revision.
      .filter(function (revision) {
        return revision.id >= startCommitId;
      }).map(function (revision) {
        return revision.changes;
      });

      // The last status to merge is the dirty filesystem status.
      var mergedFileStatuses = this._mergeFileStatuses(this._dirtyFileChanges, compareRevisionsFileChanges);
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
        mergeStatusPaths(deleted, _constants.FileChangeStatus.DELETED);
      }

      return mergedStatus;
    }
  }, {
    key: 'getDirtyFileChanges',
    value: function getDirtyFileChanges() {
      return this._dirtyFileChanges;
    }
  }, {
    key: 'getCompareFileChanges',
    value: function getCompareFileChanges() {
      return this._compareFileChanges;
    }
  }, {
    key: 'fetchHgDiff',
    value: _asyncToGenerator(function* (filePath) {
      var _ref = yield this.getCachedRevisionsStatePromise();

      var compareCommitId = _ref.compareCommitId;

      var committedContents = yield this._repository.fetchFileContentAtRevision(filePath, compareCommitId ? '' + compareCommitId : null)
      // If the file didn't exist on the previous revision, return empty contents.
      .then(function (contents) {
        return contents || '';
      }, function (err) {
        return '';
      });

      // Intentionally fetch the filesystem contents after getting the committed contents
      // to make sure we have the latest filesystem version.
      var filesystemContents = yield (0, _utils.getFileSystemContents)(filePath);
      return {
        committedContents: committedContents,
        filesystemContents: filesystemContents
      };
    })
  }, {
    key: 'setRevision',
    value: _asyncToGenerator(function* (revision) {
      var revisionsState = yield this.getCachedRevisionsStatePromise();
      var revisions = revisionsState.revisions;

      (0, _assert2['default'])(revisions && revisions.indexOf(revision) !== -1, 'Diff Viw Timeline: non-applicable selected revision');

      this._selectedCompareCommitId = revisionsState.compareCommitId = revision.id;
      this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);

      var revisionsFileHistory = yield this._getCachedRevisionFileHistoryPromise(revisionsState);
      this._compareFileChanges = this._computeCompareChangesFromHistory(revisionsState, revisionsFileHistory);
      this._emitter.emit(CHANGE_COMPARE_STATUS_EVENT, this._compareFileChanges);
    })
  }, {
    key: 'onDidChangeDirtyStatus',
    value: function onDidChangeDirtyStatus(callback) {
      return this._emitter.on(CHANGE_DIRTY_STATUS_EVENT, callback);
    }
  }, {
    key: 'onDidChangeCompareStatus',
    value: function onDidChangeCompareStatus(callback) {
      return this._emitter.on(CHANGE_COMPARE_STATUS_EVENT, callback);
    }
  }, {
    key: 'onDidChangeRevisions',
    value: function onDidChangeRevisions(callback) {
      return this._emitter.on(CHANGE_REVISIONS_EVENT, callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      this._dirtyFileChanges.clear();
      this._compareFileChanges.clear();
      this._revisionIdToFileChanges.reset();
    }
  }]);

  return RepositoryStack;
})();

exports['default'] = RepositoryStack;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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LFFBQXVFLEVBQzFEO0FBQ2IsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUM5RDs7O1dBRXVCLGtDQUN0QixRQUF1RSxFQUMxRDtBQUNiLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsMkJBQTJCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDaEU7OztXQUVtQiw4QkFDbEIsUUFBa0QsRUFDckM7QUFDYixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzNEOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsVUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQy9CLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNqQyxVQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDdkM7OztTQXJYa0IsZUFBZTs7O3FCQUFmLGVBQWUiLCJmaWxlIjoiUmVwb3NpdG9yeVN0YWNrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeUNsaWVudH0gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1jbGllbnQnO1xuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSwgSGdEaWZmU3RhdGUsIFJldmlzaW9uc1N0YXRlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkZpbGVDaGFuZ2VzfSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL2hnLWNvbnN0YW50cyc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL2hnLWNvbnN0YW50cyc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge0hnU3RhdHVzVG9GaWxlQ2hhbmdlU3RhdHVzLCBGaWxlQ2hhbmdlU3RhdHVzfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2dldEZpbGVTeXN0ZW1Db250ZW50c30gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2FycmF5LCBwcm9taXNlcywgZGVib3VuY2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7bm90aWZ5SW50ZXJuYWxFcnJvcn0gZnJvbSAnLi9ub3RpZmljYXRpb25zJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBMUlUgZnJvbSAnbHJ1LWNhY2hlJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5jb25zdCB7c2VyaWFsaXplQXN5bmNDYWxsfSA9IHByb21pc2VzO1xuY29uc3QgQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5UID0gJ2RpZC1jaGFuZ2UtY29tcGFyZS1zdGF0dXMnO1xuY29uc3QgQ0hBTkdFX0RJUlRZX1NUQVRVU19FVkVOVCA9ICdkaWQtY2hhbmdlLWRpcnR5LXN0YXR1cyc7XG5jb25zdCBDSEFOR0VfUkVWSVNJT05TX0VWRU5UID0gJ2RpZC1jaGFuZ2UtcmV2aXNpb25zJztcbmNvbnN0IFVQREFURV9TVEFUVVNfREVCT1VOQ0VfTVMgPSAyMDAwO1xuXG5jb25zdCBGRVRDSF9SRVZfSU5GT19SRVRSWV9USU1FX01TID0gMTAwMDtcbmNvbnN0IEZFVENIX1JFVl9JTkZPX01BWF9UUklFUyA9IDU7XG5cbnR5cGUgUmV2aXNpb25zRmlsZUhpc3RvcnkgPSBBcnJheTx7XG4gIGlkOiBudW1iZXI7XG4gIGNoYW5nZXM6IFJldmlzaW9uRmlsZUNoYW5nZXM7XG59PjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwb3NpdG9yeVN0YWNrIHtcblxuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9kaXJ0eUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgX2NvbXBhcmVGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIF9yZXBvc2l0b3J5OiBIZ1JlcG9zaXRvcnlDbGllbnQ7XG4gIF9yZXZpc2lvbnNTdGF0ZVByb21pc2U6ID9Qcm9taXNlPFJldmlzaW9uc1N0YXRlPjtcbiAgX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZTogP1Byb21pc2U8UmV2aXNpb25zRmlsZUhpc3Rvcnk+O1xuICBfbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5OiA/UmV2aXNpb25zRmlsZUhpc3Rvcnk7XG4gIF9zZWxlY3RlZENvbXBhcmVDb21taXRJZDogP251bWJlcjtcbiAgX2lzQWN0aXZlOiBib29sZWFuO1xuICBfc2VyaWFsaXplZFVwZGF0ZVN0YXR1czogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzOiBMUlU8bnVtYmVyLCBSZXZpc2lvbkZpbGVDaGFuZ2VzPjtcblxuICBjb25zdHJ1Y3RvcihyZXBvc2l0b3J5OiBIZ1JlcG9zaXRvcnlDbGllbnQpIHtcbiAgICB0aGlzLl9yZXBvc2l0b3J5ID0gcmVwb3NpdG9yeTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzID0gbmV3IExSVSh7bWF4OiAxMDB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZENvbXBhcmVDb21taXRJZCA9IG51bGw7XG4gICAgdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gbnVsbDtcbiAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlU3RhdHVzID0gc2VyaWFsaXplQXN5bmNDYWxsKCgpID0+IHRoaXMuX3VwZGF0ZUNoYW5nZWRTdGF0dXMoKSk7XG4gICAgY29uc3QgZGVib3VuY2VkU2VyaWFsaXplZFVwZGF0ZVN0YXR1cyA9IGRlYm91bmNlKFxuICAgICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZVN0YXR1cyxcbiAgICAgIFVQREFURV9TVEFUVVNfREVCT1VOQ0VfTVMsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIGRlYm91bmNlZFNlcmlhbGl6ZWRVcGRhdGVTdGF0dXMoKTtcbiAgICAvLyBHZXQgdGhlIGluaXRpYWwgcHJvamVjdCBzdGF0dXMsIGlmIGl0J3Mgbm90IGFscmVhZHkgdGhlcmUsXG4gICAgLy8gdHJpZ2dlcmVkIGJ5IGFub3RoZXIgaW50ZWdyYXRpb24sIGxpa2UgdGhlIGZpbGUgdHJlZS5cbiAgICByZXBvc2l0b3J5LmdldFN0YXR1c2VzKFtyZXBvc2l0b3J5LmdldFByb2plY3REaXJlY3RvcnkoKV0pO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgcmVwb3NpdG9yeS5vbkRpZENoYW5nZVN0YXR1c2VzKGRlYm91bmNlZFNlcmlhbGl6ZWRVcGRhdGVTdGF0dXMpXG4gICAgKTtcbiAgfVxuXG4gIGFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XG4gICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZVN0YXR1cygpO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcudXBkYXRlLWNoYW5nZS1zdGF0dXMnKVxuICBhc3luYyBfdXBkYXRlQ2hhbmdlZFN0YXR1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fdXBkYXRlRGlydHlGaWxlQ2hhbmdlcygpO1xuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlQ29tcGFyZUZpbGVDaGFuZ2VzKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5vdGlmeUludGVybmFsRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVEaXJ0eUZpbGVDaGFuZ2VzKCk6IHZvaWQge1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMgPSB0aGlzLl9nZXREaXJ0eUNoYW5nZWRTdGF0dXMoKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX0RJUlRZX1NUQVRVU19FVkVOVCwgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBfZ2V0RGlydHlDaGFuZ2VkU3RhdHVzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICBjb25zdCBkaXJ0eUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IHN0YXR1c2VzID0gdGhpcy5fcmVwb3NpdG9yeS5nZXRBbGxQYXRoU3RhdHVzZXMoKTtcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIGluIHN0YXR1c2VzKSB7XG4gICAgICBjb25zdCBjaGFuZ2VTdGF0dXMgPSBIZ1N0YXR1c1RvRmlsZUNoYW5nZVN0YXR1c1tzdGF0dXNlc1tmaWxlUGF0aF1dO1xuICAgICAgaWYgKGNoYW5nZVN0YXR1cyAhPSBudWxsKSB7XG4gICAgICAgIGRpcnR5RmlsZUNoYW5nZXMuc2V0KGZpbGVQYXRoLCBjaGFuZ2VTdGF0dXMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGlydHlGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGZpbGUgY2hhbmdlIHN0YXRlIGNvbXBhcmluZyB0aGUgZGlydHkgZmlsZXN5c3RlbSBzdGF0dXNcbiAgICogdG8gYSBzZWxlY3RlZCBjb21taXQuXG4gICAqIFRoYXQgd291bGQgYmUgYSBtZXJnZSBvZiBgaGcgc3RhdHVzYCB3aXRoIHRoZSBkaWZmIGZyb20gY29tbWl0cyxcbiAgICogYW5kIGBoZyBsb2cgLS1yZXYgJHtyZXZJZH1gIGZvciBldmVyeSBjb21taXQuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlQ29tcGFyZUZpbGVDaGFuZ2VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFdlIHNob3VsZCBvbmx5IHVwZGF0ZSB0aGUgcmV2aXNpb24gc3RhdGUgd2hlbiB0aGUgcmVwb3NpdG9yeSBpcyBhY3RpdmUuXG4gICAgaWYgKCF0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCB0aGlzLl9nZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgcmV2aXNpb25zU3RhdGUpO1xuXG4gICAgLy8gSWYgdGhlIGNvbW1pdHMgaGF2ZW4ndCBjaGFuZ2VkIGlkcywgdGhlbiB0aGllciBkaWZmIGhhdmVuJ3QgY2hhbmdlZCBhcyB3ZWxsLlxuICAgIGxldCByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgaWYgKHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSAhPSBudWxsKSB7XG4gICAgICBjb25zdCBmaWxlSGlzdG9yeVJldmlzaW9uSWRzID0gdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5XG4gICAgICAgIC5tYXAocmV2aXNpb25DaGFuZ2VzID0+IHJldmlzaW9uQ2hhbmdlcy5pZCk7XG4gICAgICBjb25zdCByZXZpc2lvbklkcyA9IHJldmlzaW9uc1N0YXRlLnJldmlzaW9ucy5tYXAocmV2aXNpb24gPT4gcmV2aXNpb24uaWQpO1xuICAgICAgaWYgKGFycmF5LmVxdWFsKHJldmlzaW9uSWRzLCBmaWxlSGlzdG9yeVJldmlzaW9uSWRzKSkge1xuICAgICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGZXRjaCByZXZpc2lvbnMgaGlzdG9yeSBpZiByZXZpc2lvbnMgc3RhdGUgaGF2ZSBjaGFuZ2VkLlxuICAgIGlmIChyZXZpc2lvbnNGaWxlSGlzdG9yeSA9PSBudWxsKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IGF3YWl0IHRoaXMuX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKHJldmlzaW9uc1N0YXRlKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICAnQ2Fubm90IGZldGNoIHJldmlzaW9uIGhpc3Rvcnk6ICcgK1xuICAgICAgICAgICcoY291bGQgaGFwcGVuIHdpdGggcGVuZGluZyBzb3VyY2UtY29udHJvbCBoaXN0b3J5IHdyaXRpbmcgb3BlcmF0aW9ucyknLFxuICAgICAgICAgIGVycm9yLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyA9IHRoaXMuX2NvbXB1dGVDb21wYXJlQ2hhbmdlc0Zyb21IaXN0b3J5KFxuICAgICAgcmV2aXNpb25zU3RhdGUsXG4gICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSxcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQsIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBfZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk6IFByb21pc2U8UmV2aXNpb25zU3RhdGU+IHtcbiAgICB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2UgPSB0aGlzLl9mZXRjaFJldmlzaW9uc1N0YXRlKCkudGhlbihcbiAgICAgIHRoaXMuX2FtZW5kU2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQuYmluZCh0aGlzKSxcbiAgICAgIGVycm9yID0+IHtcbiAgICAgICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gbnVsbDtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9LFxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZTtcbiAgfVxuXG4gIGdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpOiBQcm9taXNlPFJldmlzaW9uc1N0YXRlPiB7XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGVQcm9taXNlID0gdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlO1xuICAgIGlmIChyZXZpc2lvbnNTdGF0ZVByb21pc2UgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJldmlzaW9uc1N0YXRlUHJvbWlzZS50aGVuKHRoaXMuX2FtZW5kU2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQuYmluZCh0aGlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW1lbmQgdGhlIHJldmlzaW9ucyBzdGF0ZSB3aXRoIHRoZSBsYXRlc3Qgc2VsZWN0ZWQgdmFsaWQgY29tcGFyZSBjb21taXQgaWQuXG4gICAqL1xuICBfYW1lbmRTZWxlY3RlZENvbXBhcmVDb21taXRJZChyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpOiBSZXZpc2lvbnNTdGF0ZSB7XG4gICAgY29uc3Qge2NvbW1pdElkLCByZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG4gICAgLy8gUHJpb3JpdGl6ZSB0aGUgY2FjaGVkIGNvbXBhZXJlQ29tbWl0SWQsIGlmIGl0IGV4aXN0cy5cbiAgICAvLyBUaGUgdXNlciBjb3VsZCBoYXZlIHNlbGVjdGVkIHRoYXQgZnJvbSB0aGUgdGltZWxpbmUgdmlldy5cbiAgICBsZXQgY29tcGFyZUNvbW1pdElkID0gdGhpcy5fc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQ7XG4gICAgaWYgKCFhcnJheS5maW5kKHJldmlzaW9ucywgcmV2aXNpb24gPT4gcmV2aXNpb24uaWQgPT09IGNvbXBhcmVDb21taXRJZCkpIHtcbiAgICAgIC8vIEludmFsaWRhdGUgaWYgdGhlcmUgdGhlcmUgaXMgbm8gbG9uZ2VyIGEgcmV2aXNpb24gd2l0aCB0aGF0IGlkLlxuICAgICAgY29tcGFyZUNvbW1pdElkID0gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMgPSByZXZpc2lvbnMuc2xpY2UoKS5yZXZlcnNlKCk7XG4gICAgaWYgKGNvbXBhcmVDb21taXRJZCA9PSBudWxsICYmIGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgIC8vIElmIHRoZSB1c2VyIGhhcyBhbHJlYWR5IGNvbW1pdHRlZCwgbW9zdCBvZiB0aGUgdGltZXMsIGhlJ2QgYmUgd29ya2luZyBvbiBhbiBhbWVuZC5cbiAgICAgIC8vIFNvLCB0aGUgaGV1cmlzdGljIGhlcmUgaXMgdG8gY29tcGFyZSBhZ2FpbnN0IHRoZSBwcmV2aW91cyB2ZXJzaW9uLFxuICAgICAgLy8gbm90IHRoZSBqdXN0LWNvbW1pdHRlZCBvbmUsIHdoaWxlIHRoZSByZXZpc2lvbnMgdGltZWxpbmVcbiAgICAgIC8vIHdvdWxkIGdpdmUgYSB3YXkgdG8gc3BlY2lmeSBvdGhlcndpc2UuXG4gICAgICBjb21wYXJlQ29tbWl0SWQgPSBsYXRlc3RUb09sZGVzdFJldmlzaW9uc1sxXS5pZDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJldmlzaW9ucyxcbiAgICAgIGNvbW1pdElkLFxuICAgICAgY29tcGFyZUNvbW1pdElkLFxuICAgIH07XG4gIH1cblxuICBfZ2V0UmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UoXG4gICAgcmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlLFxuICApOiBQcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PiB7XG4gICAgdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlID0gdGhpcy5fZmV0Y2hSZXZpc2lvbnNGaWxlSGlzdG9yeShyZXZpc2lvbnNTdGF0ZSlcbiAgICAgIC50aGVuKHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0+XG4gICAgICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IHJldmlzaW9uc0ZpbGVIaXN0b3J5XG4gICAgICAsIGVycm9yID0+IHtcbiAgICAgICAgdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gbnVsbDtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlO1xuICB9XG5cbiAgX2dldENhY2hlZFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgKTogUHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT4ge1xuICAgIGlmICh0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2UgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKHJldmlzaW9uc1N0YXRlKTtcbiAgICB9XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5mZXRjaC1yZXZpc2lvbnMtc3RhdGUnKVxuICBhc3luYyBfZmV0Y2hSZXZpc2lvbnNTdGF0ZSgpOiBQcm9taXNlPFJldmlzaW9uc1N0YXRlPiB7XG4gICAgLy8gV2hpbGUgcmViYXNpbmcsIHRoZSBjb21tb24gYW5jZXN0b3Igb2YgYEhFQURgIGFuZCBgQkFTRWBcbiAgICAvLyBtYXkgYmUgbm90IGFwcGxpY2FibGUsIGJ1dCB0aGF0J3MgZGVmaW5lZCBvbmNlIHRoZSByZWJhc2UgaXMgZG9uZS5cbiAgICAvLyBIZW5jZSwgd2UgbmVlZCB0byByZXRyeSBmZXRjaGluZyB0aGUgcmV2aXNpb24gaW5mbyAoZGVwZW5kaW5nIG9uIHRoZSBjb21tb24gYW5jZXN0b3IpXG4gICAgLy8gYmVjYXVzZSB0aGUgd2F0Y2htYW4tYmFzZWQgTWVyY3VyaWFsIHVwZGF0ZXMgZG9lc24ndCBjb25zaWRlciBvciB3YWl0IHdoaWxlIHJlYmFzaW5nLlxuICAgIGNvbnN0IHJldmlzaW9ucyA9IGF3YWl0IHByb21pc2VzLnJldHJ5TGltaXQoXG4gICAgICAoKSA9PiB0aGlzLl9yZXBvc2l0b3J5LmZldGNoUmV2aXNpb25JbmZvQmV0d2VlbkhlYWRBbmRCYXNlKCksXG4gICAgICByZXN1bHQgPT4gcmVzdWx0ICE9IG51bGwsXG4gICAgICBGRVRDSF9SRVZfSU5GT19NQVhfVFJJRVMsXG4gICAgICBGRVRDSF9SRVZfSU5GT19SRVRSWV9USU1FX01TLFxuICAgICk7XG4gICAgaWYgKHJldmlzaW9ucyA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmZXRjaCByZXZpc2lvbiBpbmZvIG5lZWRlZCEnKTtcbiAgICB9XG4gICAgY29uc3QgY29tbWl0SWQgPSByZXZpc2lvbnNbcmV2aXNpb25zLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiB7XG4gICAgICByZXZpc2lvbnMsXG4gICAgICBjb21taXRJZCxcbiAgICAgIGNvbXBhcmVDb21taXRJZDogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmV0Y2gtcmV2aXNpb25zLWNoYW5nZS1oaXN0b3J5JylcbiAgYXN5bmMgX2ZldGNoUmV2aXNpb25zRmlsZUhpc3RvcnkocmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlKTogUHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT4ge1xuICAgIGNvbnN0IHtyZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG5cbiAgICAvLyBSZXZpc2lvbiBpZHMgYXJlIHVuaXF1ZSBhbmQgZG9uJ3QgY2hhbmdlLCBleGNlcHQgd2hlbiB0aGUgcmV2aXNpb24gaXMgYW1lbmRlZC9yZWJhc2VkLlxuICAgIC8vIEhlbmNlLCBpdCdzIGNhY2hlZCBoZXJlIHRvIGF2b2lkIHNlcnZpY2UgY2FsbHMgd2hlbiB3b3JraW5nIG9uIGEgc3RhY2sgb2YgY29tbWl0cy5cbiAgICBjb25zdCByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IGF3YWl0IFByb21pc2UuYWxsKHJldmlzaW9uc1xuICAgICAgLm1hcChhc3luYyByZXZpc2lvbiA9PiB7XG4gICAgICAgIGNvbnN0IHtpZH0gPSByZXZpc2lvbjtcbiAgICAgICAgbGV0IGNoYW5nZXMgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMuaGFzKGlkKSkge1xuICAgICAgICAgIGNoYW5nZXMgPSB0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5nZXQoaWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNoYW5nZXMgPSBhd2FpdCB0aGlzLl9yZXBvc2l0b3J5LmZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbihgJHtpZH1gKTtcbiAgICAgICAgICBpZiAoY2hhbmdlcyA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENoYW5nZXMgbm90IGF2YWlsYWJsZSBmb3IgcmV2aXNpb246ICR7aWR9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLnNldChpZCwgY2hhbmdlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtpZCwgY2hhbmdlc307XG4gICAgICB9KVxuICAgICk7XG5cbiAgICByZXR1cm4gcmV2aXNpb25zRmlsZUhpc3Rvcnk7XG4gIH1cblxuICBfY29tcHV0ZUNvbXBhcmVDaGFuZ2VzRnJvbUhpc3RvcnkoXG4gICAgcmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlLFxuICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5OiBSZXZpc2lvbnNGaWxlSGlzdG9yeSxcbiAgKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuXG4gICAgY29uc3Qge2NvbW1pdElkLCBjb21wYXJlQ29tbWl0SWR9ID0gcmV2aXNpb25zU3RhdGU7XG4gICAgLy8gVGhlIHN0YXR1cyBpcyBmZXRjaGVkIGJ5IG1lcmdpbmcgdGhlIGNoYW5nZXMgcmlnaHQgYWZ0ZXIgdGhlIGBjb21wYXJlQ29tbWl0SWRgIGlmIHNwZWNpZmllZCxcbiAgICAvLyBvciBgSEVBRGAgaWYgbm90LlxuICAgIGNvbnN0IHN0YXJ0Q29tbWl0SWQgPSBjb21wYXJlQ29tbWl0SWQgPyAoY29tcGFyZUNvbW1pdElkICsgMSkgOiBjb21taXRJZDtcbiAgICAvLyBHZXQgdGhlIHJldmlzaW9uIGNoYW5nZXMgdGhhdCdzIG5ld2VyIHRoYW4gb3IgaXMgdGhlIGN1cnJlbnQgY29tbWl0IGlkLlxuICAgIGNvbnN0IGNvbXBhcmVSZXZpc2lvbnNGaWxlQ2hhbmdlcyA9IHJldmlzaW9uc0ZpbGVIaXN0b3J5XG4gICAgICAuc2xpY2UoMSkgLy8gRXhjbHVkZSB0aGUgQkFTRSByZXZpc2lvbi5cbiAgICAgIC5maWx0ZXIocmV2aXNpb24gPT4gcmV2aXNpb24uaWQgPj0gc3RhcnRDb21taXRJZClcbiAgICAgIC5tYXAocmV2aXNpb24gPT4gcmV2aXNpb24uY2hhbmdlcyk7XG5cbiAgICAvLyBUaGUgbGFzdCBzdGF0dXMgdG8gbWVyZ2UgaXMgdGhlIGRpcnR5IGZpbGVzeXN0ZW0gc3RhdHVzLlxuICAgIGNvbnN0IG1lcmdlZEZpbGVTdGF0dXNlcyA9IHRoaXMuX21lcmdlRmlsZVN0YXR1c2VzKFxuICAgICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyxcbiAgICAgIGNvbXBhcmVSZXZpc2lvbnNGaWxlQ2hhbmdlcyxcbiAgICApO1xuICAgIHJldHVybiBtZXJnZWRGaWxlU3RhdHVzZXM7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2VzIHRoZSBmaWxlIGNoYW5nZSBzdGF0dXNlcyBvZiB0aGUgZGlydHkgZmlsZXN5c3RlbSBzdGF0ZSB3aXRoXG4gICAqIHRoZSByZXZpc2lvbiBjaGFuZ2VzLCB3aGVyZSBkaXJ0eSBjaGFuZ2VzIGFuZCBtb3JlIHJlY2VudCByZXZpc2lvbnNcbiAgICogdGFrZSBwcmlvcml0eSBpbiBkZWNpZGluZyB3aGljaCBzdGF0dXMgYSBmaWxlIGlzIGluLlxuICAgKi9cbiAgX21lcmdlRmlsZVN0YXR1c2VzKFxuICAgIGRpcnR5U3RhdHVzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPixcbiAgICByZXZpc2lvbnNGaWxlQ2hhbmdlczogQXJyYXk8UmV2aXNpb25GaWxlQ2hhbmdlcz4sXG4gICk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICBjb25zdCBtZXJnZWRTdGF0dXMgPSBuZXcgTWFwKGRpcnR5U3RhdHVzKTtcbiAgICBjb25zdCBtZXJnZWRGaWxlUGF0aHMgPSBuZXcgU2V0KG1lcmdlZFN0YXR1cy5rZXlzKCkpO1xuXG4gICAgZnVuY3Rpb24gbWVyZ2VTdGF0dXNQYXRocyhcbiAgICAgIGZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4sXG4gICAgICBjaGFuZ2VTdGF0dXNWYWx1ZTogRmlsZUNoYW5nZVN0YXR1c1ZhbHVlLFxuICAgICkge1xuICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBmaWxlUGF0aHMpIHtcbiAgICAgICAgaWYgKCFtZXJnZWRGaWxlUGF0aHMuaGFzKGZpbGVQYXRoKSkge1xuICAgICAgICAgIG1lcmdlZFN0YXR1cy5zZXQoZmlsZVBhdGgsIGNoYW5nZVN0YXR1c1ZhbHVlKTtcbiAgICAgICAgICBtZXJnZWRGaWxlUGF0aHMuYWRkKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfVxuXG4gICAgLy8gTW9yZSByZWNlbnQgcmV2aXNpb24gY2hhbmdlcyB0YWtlcyBwcmlvcml0eSBpbiBzcGVjaWZ5aW5nIGEgZmlsZXMnIHN0YXR1c2VzLlxuICAgIGNvbnN0IGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zQ2hhbmdlcyA9IHJldmlzaW9uc0ZpbGVDaGFuZ2VzLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIGZvciAoY29uc3QgcmV2aXNpb25GaWxlQ2hhbmdlcyBvZiBsYXRlc3RUb09sZGVzdFJldmlzaW9uc0NoYW5nZXMpIHtcbiAgICAgIGNvbnN0IHthZGRlZCwgbW9kaWZpZWQsIGRlbGV0ZWR9ID0gcmV2aXNpb25GaWxlQ2hhbmdlcztcblxuICAgICAgbWVyZ2VTdGF0dXNQYXRocyhhZGRlZCwgRmlsZUNoYW5nZVN0YXR1cy5BRERFRCk7XG4gICAgICBtZXJnZVN0YXR1c1BhdGhzKG1vZGlmaWVkLCBGaWxlQ2hhbmdlU3RhdHVzLk1PRElGSUVEKTtcbiAgICAgIG1lcmdlU3RhdHVzUGF0aHMoZGVsZXRlZCwgRmlsZUNoYW5nZVN0YXR1cy5ERUxFVEVEKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVyZ2VkU3RhdHVzO1xuICB9XG5cbiAgZ2V0RGlydHlGaWxlQ2hhbmdlcygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXM7XG4gIH1cblxuICBnZXRDb21wYXJlRmlsZUNoYW5nZXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIHJldHVybiB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXM7XG4gIH1cblxuICBhc3luYyBmZXRjaEhnRGlmZihmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8SGdEaWZmU3RhdGU+IHtcbiAgICBjb25zdCB7Y29tcGFyZUNvbW1pdElkfSA9IGF3YWl0IHRoaXMuZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgY29uc3QgY29tbWl0dGVkQ29udGVudHMgPSBhd2FpdCB0aGlzLl9yZXBvc2l0b3J5XG4gICAgICAuZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24oZmlsZVBhdGgsIGNvbXBhcmVDb21taXRJZCA/IGAke2NvbXBhcmVDb21taXRJZH1gIDogbnVsbClcbiAgICAgIC8vIElmIHRoZSBmaWxlIGRpZG4ndCBleGlzdCBvbiB0aGUgcHJldmlvdXMgcmV2aXNpb24sIHJldHVybiBlbXB0eSBjb250ZW50cy5cbiAgICAgIC50aGVuKGNvbnRlbnRzID0+IGNvbnRlbnRzIHx8ICcnLCBlcnIgPT4gJycpO1xuXG4gICAgLy8gSW50ZW50aW9uYWxseSBmZXRjaCB0aGUgZmlsZXN5c3RlbSBjb250ZW50cyBhZnRlciBnZXR0aW5nIHRoZSBjb21taXR0ZWQgY29udGVudHNcbiAgICAvLyB0byBtYWtlIHN1cmUgd2UgaGF2ZSB0aGUgbGF0ZXN0IGZpbGVzeXN0ZW0gdmVyc2lvbi5cbiAgICBjb25zdCBmaWxlc3lzdGVtQ29udGVudHMgPSBhd2FpdCBnZXRGaWxlU3lzdGVtQ29udGVudHMoZmlsZVBhdGgpO1xuICAgIHJldHVybiB7XG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgc2V0UmV2aXNpb24ocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuXG4gICAgaW52YXJpYW50KFxuICAgICAgcmV2aXNpb25zICYmIHJldmlzaW9ucy5pbmRleE9mKHJldmlzaW9uKSAhPT0gLTEsXG4gICAgICAnRGlmZiBWaXcgVGltZWxpbmU6IG5vbi1hcHBsaWNhYmxlIHNlbGVjdGVkIHJldmlzaW9uJyxcbiAgICApO1xuXG4gICAgdGhpcy5fc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQgPSByZXZpc2lvbnNTdGF0ZS5jb21wYXJlQ29tbWl0SWQgPSByZXZpc2lvbi5pZDtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgcmV2aXNpb25zU3RhdGUpO1xuXG4gICAgY29uc3QgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBhd2FpdCB0aGlzLl9nZXRDYWNoZWRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShyZXZpc2lvbnNTdGF0ZSk7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gdGhpcy5fY29tcHV0ZUNvbXBhcmVDaGFuZ2VzRnJvbUhpc3RvcnkoXG4gICAgICByZXZpc2lvbnNTdGF0ZSxcbiAgICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5LFxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlRGlydHlTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChmaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPikgPT4gdm9pZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZVJldmlzaW9ucyhcbiAgICBjYWxsYmFjazogKHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSkgPT4gdm9pZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzLmNsZWFyKCk7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzLmNsZWFyKCk7XG4gICAgdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMucmVzZXQoKTtcbiAgfVxufVxuIl19