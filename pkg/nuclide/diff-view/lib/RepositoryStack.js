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
        yield this._updateCommitMergeFileChanges();
      } catch (error) {
        (0, _notifications.notifyInternalError)(error);
      }
    })
  }, {
    key: '_updateDirtyFileChanges',
    value: function _updateDirtyFileChanges() {
      this._dirtyFileChanges = this._getDirtyChangedStatus();
      this._emitter.emit(UPDATE_DIRTY_FILES_EVENT, this._dirtyFileChanges);
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
      var revisionsState = yield this.getRevisionsStatePromise();
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
      this._commitMergeFileChanges = this._computeCommitMergeFromHistory(revisionsState, revisionsFileHistory);
      this._emitter.emit(UPDATE_COMMIT_MERGE_FILES_EVENT, this._commitMergeFileChanges);
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
    key: 'getCommitMergeFileChanges',
    value: function getCommitMergeFileChanges() {
      return this._commitMergeFileChanges;
    }
  }, {
    key: 'fetchHgDiff',
    value: _asyncToGenerator(function* (filePath) {
      var _ref = yield this.getCachedRevisionsStatePromise();

      var revisions = _ref.revisions;
      var commitId = _ref.commitId;
      var compareCommitId = _ref.compareCommitId;

      var committedContents = yield this._repository.fetchFileContentAtRevision(filePath, compareCommitId ? '' + compareCommitId : null)
      // If the file didn't exist on the previous revision, return empty contents.
      .then(function (contents) {
        return contents || '';
      }, function (_err) {
        return '';
      });

      // Intentionally fetch the filesystem contents after getting the committed contents
      // to make sure we have the latest filesystem version.
      var filesystemContents = yield (0, _utils.getFileSystemContents)(filePath);

      var fetchedRevisionId = compareCommitId != null ? compareCommitId : commitId;

      var _revisions$filter = revisions.filter(function (revision) {
        return revision.id === fetchedRevisionId;
      });

      var _revisions$filter2 = _slicedToArray(_revisions$filter, 1);

      var revisionInfo = _revisions$filter2[0];

      (0, _assert2['default'])(revisionInfo, 'Diff Viw Fetcher: revision with id ' + fetchedRevisionId + ' not found');
      return {
        committedContents: committedContents,
        filesystemContents: filesystemContents,
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

      (0, _assert2['default'])(revisions && revisions.indexOf(revision) !== -1, 'Diff Viw Timeline: non-applicable selected revision');

      this._selectedCompareCommitId = revisionsState.compareCommitId = revision.id;
      this._emitter.emit(CHANGE_REVISIONS_EVENT, revisionsState);

      var revisionsFileHistory = yield this._getCachedRevisionFileHistoryPromise(revisionsState);
      this._commitMergeFileChanges = this._computeCommitMergeFromHistory(revisionsState, revisionsFileHistory);
      this._emitter.emit(UPDATE_COMMIT_MERGE_FILES_EVENT, this._commitMergeFileChanges);
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
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      this._dirtyFileChanges.clear();
      this._commitMergeFileChanges.clear();
      this._revisionIdToFileChanges.reset();
    }
  }]);

  return RepositoryStack;
})();

exports['default'] = RepositoryStack;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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VUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQy9CLFVBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyQyxVQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDdkM7OztTQXpZa0IsZUFBZTs7O3FCQUFmLGVBQWUiLCJmaWxlIjoiUmVwb3NpdG9yeVN0YWNrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeUNsaWVudH0gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1jbGllbnQnO1xuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSwgSGdEaWZmU3RhdGUsIFJldmlzaW9uc1N0YXRlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkZpbGVDaGFuZ2VzLCBSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7SGdTdGF0dXNUb0ZpbGVDaGFuZ2VTdGF0dXMsIEZpbGVDaGFuZ2VTdGF0dXN9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Z2V0RmlsZVN5c3RlbUNvbnRlbnRzfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7YXJyYXksIHByb21pc2VzLCBkZWJvdW5jZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtub3RpZnlJbnRlcm5hbEVycm9yfSBmcm9tICcuL25vdGlmaWNhdGlvbnMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IExSVSBmcm9tICdscnUtY2FjaGUnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcbmNvbnN0IHtzZXJpYWxpemVBc3luY0NhbGx9ID0gcHJvbWlzZXM7XG5jb25zdCBVUERBVEVfQ09NTUlUX01FUkdFX0ZJTEVTX0VWRU5UID0gJ3VwZGF0ZS1jb21taXQtbWVyZ2UtZmlsZXMnO1xuY29uc3QgVVBEQVRFX0RJUlRZX0ZJTEVTX0VWRU5UID0gJ3VwZGF0ZS1kaXJ0eS1maWxlcyc7XG5jb25zdCBDSEFOR0VfUkVWSVNJT05TX0VWRU5UID0gJ2RpZC1jaGFuZ2UtcmV2aXNpb25zJztcbmNvbnN0IFVQREFURV9TVEFUVVNfREVCT1VOQ0VfTVMgPSAyMDAwO1xuXG5jb25zdCBGRVRDSF9SRVZfSU5GT19SRVRSWV9USU1FX01TID0gMTAwMDtcbmNvbnN0IEZFVENIX1JFVl9JTkZPX01BWF9UUklFUyA9IDU7XG5cbnR5cGUgUmV2aXNpb25zRmlsZUhpc3RvcnkgPSBBcnJheTx7XG4gIGlkOiBudW1iZXI7XG4gIGNoYW5nZXM6IFJldmlzaW9uRmlsZUNoYW5nZXM7XG59PjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwb3NpdG9yeVN0YWNrIHtcblxuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9kaXJ0eUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgX2NvbW1pdE1lcmdlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfcmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50O1xuICBfcmV2aXNpb25zU3RhdGVQcm9taXNlOiA/UHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT47XG4gIF9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2U6ID9Qcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PjtcbiAgX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeTogP1JldmlzaW9uc0ZpbGVIaXN0b3J5O1xuICBfc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQ6ID9udW1iZXI7XG4gIF9pc0FjdGl2ZTogYm9vbGVhbjtcbiAgX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXM6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIF9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlczogTFJVPG51bWJlciwgUmV2aXNpb25GaWxlQ2hhbmdlcz47XG5cbiAgY29uc3RydWN0b3IocmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50KSB7XG4gICAgdGhpcy5fcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMgPSBuZXcgTFJVKHttYXg6IDEwMH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgPSBudWxsO1xuICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXMgPSBzZXJpYWxpemVBc3luY0NhbGwoKCkgPT4gdGhpcy5fdXBkYXRlQ2hhbmdlZFN0YXR1cygpKTtcbiAgICBjb25zdCBkZWJvdW5jZWRTZXJpYWxpemVkVXBkYXRlU3RhdHVzID0gZGVib3VuY2UoXG4gICAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlU3RhdHVzLFxuICAgICAgVVBEQVRFX1NUQVRVU19ERUJPVU5DRV9NUyxcbiAgICAgIGZhbHNlLFxuICAgICk7XG4gICAgZGVib3VuY2VkU2VyaWFsaXplZFVwZGF0ZVN0YXR1cygpO1xuICAgIC8vIEdldCB0aGUgaW5pdGlhbCBwcm9qZWN0IHN0YXR1cywgaWYgaXQncyBub3QgYWxyZWFkeSB0aGVyZSxcbiAgICAvLyB0cmlnZ2VyZWQgYnkgYW5vdGhlciBpbnRlZ3JhdGlvbiwgbGlrZSB0aGUgZmlsZSB0cmVlLlxuICAgIHJlcG9zaXRvcnkuZ2V0U3RhdHVzZXMoW3JlcG9zaXRvcnkuZ2V0UHJvamVjdERpcmVjdG9yeSgpXSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICByZXBvc2l0b3J5Lm9uRGlkQ2hhbmdlU3RhdHVzZXMoZGVib3VuY2VkU2VyaWFsaXplZFVwZGF0ZVN0YXR1cyksXG4gICAgKTtcbiAgfVxuXG4gIGFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XG4gICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZVN0YXR1cygpO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcudXBkYXRlLWNoYW5nZS1zdGF0dXMnKVxuICBhc3luYyBfdXBkYXRlQ2hhbmdlZFN0YXR1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fdXBkYXRlRGlydHlGaWxlQ2hhbmdlcygpO1xuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlQ29tbWl0TWVyZ2VGaWxlQ2hhbmdlcygpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBub3RpZnlJbnRlcm5hbEVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlRGlydHlGaWxlQ2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gdGhpcy5fZ2V0RGlydHlDaGFuZ2VkU3RhdHVzKCk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KFVQREFURV9ESVJUWV9GSUxFU19FVkVOVCwgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBfZ2V0RGlydHlDaGFuZ2VkU3RhdHVzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICBjb25zdCBkaXJ0eUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IHN0YXR1c2VzID0gdGhpcy5fcmVwb3NpdG9yeS5nZXRBbGxQYXRoU3RhdHVzZXMoKTtcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIGluIHN0YXR1c2VzKSB7XG4gICAgICBjb25zdCBjaGFuZ2VTdGF0dXMgPSBIZ1N0YXR1c1RvRmlsZUNoYW5nZVN0YXR1c1tzdGF0dXNlc1tmaWxlUGF0aF1dO1xuICAgICAgaWYgKGNoYW5nZVN0YXR1cyAhPSBudWxsKSB7XG4gICAgICAgIGRpcnR5RmlsZUNoYW5nZXMuc2V0KGZpbGVQYXRoLCBjaGFuZ2VTdGF0dXMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGlydHlGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGNvbW1pdChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yeS5jb21taXQobWVzc2FnZSk7XG4gIH1cblxuICBhbWVuZChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yeS5hbWVuZChtZXNzYWdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGZpbGUgY2hhbmdlIHN0YXRlIGNvbXBhcmluZyB0aGUgZGlydHkgZmlsZXN5c3RlbSBzdGF0dXNcbiAgICogdG8gYSBzZWxlY3RlZCBjb21taXQuXG4gICAqIFRoYXQgd291bGQgYmUgYSBtZXJnZSBvZiBgaGcgc3RhdHVzYCB3aXRoIHRoZSBkaWZmIGZyb20gY29tbWl0cyxcbiAgICogYW5kIGBoZyBsb2cgLS1yZXYgJHtyZXZJZH1gIGZvciBldmVyeSBjb21taXQuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlQ29tbWl0TWVyZ2VGaWxlQ2hhbmdlcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBXZSBzaG91bGQgb25seSB1cGRhdGUgdGhlIHJldmlzaW9uIHN0YXRlIHdoZW4gdGhlIHJlcG9zaXRvcnkgaXMgYWN0aXZlLlxuICAgIGlmICghdGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZSA9IG51bGw7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgcmV2aXNpb25zU3RhdGUpO1xuXG4gICAgLy8gSWYgdGhlIGNvbW1pdHMgaGF2ZW4ndCBjaGFuZ2VkIGlkcywgdGhlbiB0aGllciBkaWZmIGhhdmVuJ3QgY2hhbmdlZCBhcyB3ZWxsLlxuICAgIGxldCByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgaWYgKHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSAhPSBudWxsKSB7XG4gICAgICBjb25zdCBmaWxlSGlzdG9yeVJldmlzaW9uSWRzID0gdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5XG4gICAgICAgIC5tYXAocmV2aXNpb25DaGFuZ2VzID0+IHJldmlzaW9uQ2hhbmdlcy5pZCk7XG4gICAgICBjb25zdCByZXZpc2lvbklkcyA9IHJldmlzaW9uc1N0YXRlLnJldmlzaW9ucy5tYXAocmV2aXNpb24gPT4gcmV2aXNpb24uaWQpO1xuICAgICAgaWYgKGFycmF5LmVxdWFsKHJldmlzaW9uSWRzLCBmaWxlSGlzdG9yeVJldmlzaW9uSWRzKSkge1xuICAgICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGZXRjaCByZXZpc2lvbnMgaGlzdG9yeSBpZiByZXZpc2lvbnMgc3RhdGUgaGF2ZSBjaGFuZ2VkLlxuICAgIGlmIChyZXZpc2lvbnNGaWxlSGlzdG9yeSA9PSBudWxsKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IGF3YWl0IHRoaXMuX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKHJldmlzaW9uc1N0YXRlKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICAnQ2Fubm90IGZldGNoIHJldmlzaW9uIGhpc3Rvcnk6ICcgK1xuICAgICAgICAgICcoY291bGQgaGFwcGVuIHdpdGggcGVuZGluZyBzb3VyY2UtY29udHJvbCBoaXN0b3J5IHdyaXRpbmcgb3BlcmF0aW9ucyknLFxuICAgICAgICAgIGVycm9yLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2NvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSB0aGlzLl9jb21wdXRlQ29tbWl0TWVyZ2VGcm9tSGlzdG9yeShcbiAgICAgIHJldmlzaW9uc1N0YXRlLFxuICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnksXG4gICAgKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoVVBEQVRFX0NPTU1JVF9NRVJHRV9GSUxFU19FVkVOVCwgdGhpcy5fY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBnZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTogUHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT4ge1xuICAgIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZSA9IHRoaXMuX2ZldGNoUmV2aXNpb25zU3RhdGUoKS50aGVuKFxuICAgICAgdGhpcy5fYW1lbmRTZWxlY3RlZENvbXBhcmVDb21taXRJZC5iaW5kKHRoaXMpLFxuICAgICAgZXJyb3IgPT4ge1xuICAgICAgICB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2UgPSBudWxsO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH0sXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlO1xuICB9XG5cbiAgZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk6IFByb21pc2U8UmV2aXNpb25zU3RhdGU+IHtcbiAgICBjb25zdCByZXZpc2lvbnNTdGF0ZVByb21pc2UgPSB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2U7XG4gICAgaWYgKHJldmlzaW9uc1N0YXRlUHJvbWlzZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gcmV2aXNpb25zU3RhdGVQcm9taXNlLnRoZW4odGhpcy5fYW1lbmRTZWxlY3RlZENvbXBhcmVDb21taXRJZC5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFtZW5kIHRoZSByZXZpc2lvbnMgc3RhdGUgd2l0aCB0aGUgbGF0ZXN0IHNlbGVjdGVkIHZhbGlkIGNvbXBhcmUgY29tbWl0IGlkLlxuICAgKi9cbiAgX2FtZW5kU2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQocmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlKTogUmV2aXNpb25zU3RhdGUge1xuICAgIGNvbnN0IHtjb21taXRJZCwgcmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIC8vIFByaW9yaXRpemUgdGhlIGNhY2hlZCBjb21wYWVyZUNvbW1pdElkLCBpZiBpdCBleGlzdHMuXG4gICAgLy8gVGhlIHVzZXIgY291bGQgaGF2ZSBzZWxlY3RlZCB0aGF0IGZyb20gdGhlIHRpbWVsaW5lIHZpZXcuXG4gICAgbGV0IGNvbXBhcmVDb21taXRJZCA9IHRoaXMuX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkO1xuICAgIGlmICghYXJyYXkuZmluZChyZXZpc2lvbnMsIHJldmlzaW9uID0+IHJldmlzaW9uLmlkID09PSBjb21wYXJlQ29tbWl0SWQpKSB7XG4gICAgICAvLyBJbnZhbGlkYXRlIGlmIHRoZXJlIHRoZXJlIGlzIG5vIGxvbmdlciBhIHJldmlzaW9uIHdpdGggdGhhdCBpZC5cbiAgICAgIGNvbXBhcmVDb21taXRJZCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zID0gcmV2aXNpb25zLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIGlmIChjb21wYXJlQ29tbWl0SWQgPT0gbnVsbCAmJiBsYXRlc3RUb09sZGVzdFJldmlzaW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBJZiB0aGUgdXNlciBoYXMgYWxyZWFkeSBjb21taXR0ZWQsIG1vc3Qgb2YgdGhlIHRpbWVzLCBoZSdkIGJlIHdvcmtpbmcgb24gYW4gYW1lbmQuXG4gICAgICAvLyBTbywgdGhlIGhldXJpc3RpYyBoZXJlIGlzIHRvIGNvbXBhcmUgYWdhaW5zdCB0aGUgcHJldmlvdXMgdmVyc2lvbixcbiAgICAgIC8vIG5vdCB0aGUganVzdC1jb21taXR0ZWQgb25lLCB3aGlsZSB0aGUgcmV2aXNpb25zIHRpbWVsaW5lXG4gICAgICAvLyB3b3VsZCBnaXZlIGEgd2F5IHRvIHNwZWNpZnkgb3RoZXJ3aXNlLlxuICAgICAgY29tcGFyZUNvbW1pdElkID0gbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnNbMV0uaWQ7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXZpc2lvbnMsXG4gICAgICBjb21taXRJZCxcbiAgICAgIGNvbXBhcmVDb21taXRJZCxcbiAgICB9O1xuICB9XG5cbiAgX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgKTogUHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT4ge1xuICAgIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZSA9IHRoaXMuX2ZldGNoUmV2aXNpb25zRmlsZUhpc3RvcnkocmV2aXNpb25zU3RhdGUpXG4gICAgICAudGhlbihyZXZpc2lvbnNGaWxlSGlzdG9yeSA9PlxuICAgICAgICB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgPSByZXZpc2lvbnNGaWxlSGlzdG9yeVxuICAgICAgLCBlcnJvciA9PiB7XG4gICAgICAgIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZTtcbiAgfVxuXG4gIF9nZXRDYWNoZWRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICk6IFByb21pc2U8UmV2aXNpb25zRmlsZUhpc3Rvcnk+IHtcbiAgICBpZiAodGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShyZXZpc2lvbnNTdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmV0Y2gtcmV2aXNpb25zLXN0YXRlJylcbiAgYXN5bmMgX2ZldGNoUmV2aXNpb25zU3RhdGUoKTogUHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT4ge1xuICAgIC8vIFdoaWxlIHJlYmFzaW5nLCB0aGUgY29tbW9uIGFuY2VzdG9yIG9mIGBIRUFEYCBhbmQgYEJBU0VgXG4gICAgLy8gbWF5IGJlIG5vdCBhcHBsaWNhYmxlLCBidXQgdGhhdCdzIGRlZmluZWQgb25jZSB0aGUgcmViYXNlIGlzIGRvbmUuXG4gICAgLy8gSGVuY2UsIHdlIG5lZWQgdG8gcmV0cnkgZmV0Y2hpbmcgdGhlIHJldmlzaW9uIGluZm8gKGRlcGVuZGluZyBvbiB0aGUgY29tbW9uIGFuY2VzdG9yKVxuICAgIC8vIGJlY2F1c2UgdGhlIHdhdGNobWFuLWJhc2VkIE1lcmN1cmlhbCB1cGRhdGVzIGRvZXNuJ3QgY29uc2lkZXIgb3Igd2FpdCB3aGlsZSByZWJhc2luZy5cbiAgICBjb25zdCByZXZpc2lvbnMgPSBhd2FpdCBwcm9taXNlcy5yZXRyeUxpbWl0KFxuICAgICAgKCkgPT4gdGhpcy5fcmVwb3NpdG9yeS5mZXRjaFJldmlzaW9uSW5mb0JldHdlZW5IZWFkQW5kQmFzZSgpLFxuICAgICAgcmVzdWx0ID0+IHJlc3VsdCAhPSBudWxsLFxuICAgICAgRkVUQ0hfUkVWX0lORk9fTUFYX1RSSUVTLFxuICAgICAgRkVUQ0hfUkVWX0lORk9fUkVUUllfVElNRV9NUyxcbiAgICApO1xuICAgIGlmIChyZXZpc2lvbnMgPT0gbnVsbCB8fCByZXZpc2lvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmZXRjaCByZXZpc2lvbiBpbmZvIG5lZWRlZCEnKTtcbiAgICB9XG4gICAgY29uc3QgY29tbWl0SWQgPSByZXZpc2lvbnNbcmV2aXNpb25zLmxlbmd0aCAtIDFdLmlkO1xuICAgIHJldHVybiB7XG4gICAgICByZXZpc2lvbnMsXG4gICAgICBjb21taXRJZCxcbiAgICAgIGNvbXBhcmVDb21taXRJZDogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmV0Y2gtcmV2aXNpb25zLWNoYW5nZS1oaXN0b3J5JylcbiAgYXN5bmMgX2ZldGNoUmV2aXNpb25zRmlsZUhpc3RvcnkocmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlKTogUHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT4ge1xuICAgIGNvbnN0IHtyZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG5cbiAgICAvLyBSZXZpc2lvbiBpZHMgYXJlIHVuaXF1ZSBhbmQgZG9uJ3QgY2hhbmdlLCBleGNlcHQgd2hlbiB0aGUgcmV2aXNpb24gaXMgYW1lbmRlZC9yZWJhc2VkLlxuICAgIC8vIEhlbmNlLCBpdCdzIGNhY2hlZCBoZXJlIHRvIGF2b2lkIHNlcnZpY2UgY2FsbHMgd2hlbiB3b3JraW5nIG9uIGEgc3RhY2sgb2YgY29tbWl0cy5cbiAgICBjb25zdCByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IGF3YWl0IFByb21pc2UuYWxsKHJldmlzaW9uc1xuICAgICAgLm1hcChhc3luYyByZXZpc2lvbiA9PiB7XG4gICAgICAgIGNvbnN0IHtpZH0gPSByZXZpc2lvbjtcbiAgICAgICAgbGV0IGNoYW5nZXMgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMuaGFzKGlkKSkge1xuICAgICAgICAgIGNoYW5nZXMgPSB0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5nZXQoaWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNoYW5nZXMgPSBhd2FpdCB0aGlzLl9yZXBvc2l0b3J5LmZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbihgJHtpZH1gKTtcbiAgICAgICAgICBpZiAoY2hhbmdlcyA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENoYW5nZXMgbm90IGF2YWlsYWJsZSBmb3IgcmV2aXNpb246ICR7aWR9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLnNldChpZCwgY2hhbmdlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtpZCwgY2hhbmdlc307XG4gICAgICB9KVxuICAgICk7XG5cbiAgICByZXR1cm4gcmV2aXNpb25zRmlsZUhpc3Rvcnk7XG4gIH1cblxuICBfY29tcHV0ZUNvbW1pdE1lcmdlRnJvbUhpc3RvcnkoXG4gICAgcmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlLFxuICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5OiBSZXZpc2lvbnNGaWxlSGlzdG9yeSxcbiAgKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuXG4gICAgY29uc3Qge2NvbW1pdElkLCBjb21wYXJlQ29tbWl0SWR9ID0gcmV2aXNpb25zU3RhdGU7XG4gICAgLy8gVGhlIHN0YXR1cyBpcyBmZXRjaGVkIGJ5IG1lcmdpbmcgdGhlIGNoYW5nZXMgcmlnaHQgYWZ0ZXIgdGhlIGBjb21wYXJlQ29tbWl0SWRgIGlmIHNwZWNpZmllZCxcbiAgICAvLyBvciBgSEVBRGAgaWYgbm90LlxuICAgIGNvbnN0IHN0YXJ0Q29tbWl0SWQgPSBjb21wYXJlQ29tbWl0SWQgPyAoY29tcGFyZUNvbW1pdElkICsgMSkgOiBjb21taXRJZDtcbiAgICAvLyBHZXQgdGhlIHJldmlzaW9uIGNoYW5nZXMgdGhhdCdzIG5ld2VyIHRoYW4gb3IgaXMgdGhlIGN1cnJlbnQgY29tbWl0IGlkLlxuICAgIGNvbnN0IGNvbW1pdFJldmlzaW9uc0ZpbGVDaGFuZ2VzID0gcmV2aXNpb25zRmlsZUhpc3RvcnlcbiAgICAgIC5zbGljZSgxKSAvLyBFeGNsdWRlIHRoZSBCQVNFIHJldmlzaW9uLlxuICAgICAgLmZpbHRlcihyZXZpc2lvbiA9PiByZXZpc2lvbi5pZCA+PSBzdGFydENvbW1pdElkKVxuICAgICAgLm1hcChyZXZpc2lvbiA9PiByZXZpc2lvbi5jaGFuZ2VzKTtcblxuICAgIC8vIFRoZSBsYXN0IHN0YXR1cyB0byBtZXJnZSBpcyB0aGUgZGlydHkgZmlsZXN5c3RlbSBzdGF0dXMuXG4gICAgY29uc3QgbWVyZ2VkRmlsZVN0YXR1c2VzID0gdGhpcy5fbWVyZ2VGaWxlU3RhdHVzZXMoXG4gICAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzLFxuICAgICAgY29tbWl0UmV2aXNpb25zRmlsZUNoYW5nZXMsXG4gICAgKTtcbiAgICByZXR1cm4gbWVyZ2VkRmlsZVN0YXR1c2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlcyB0aGUgZmlsZSBjaGFuZ2Ugc3RhdHVzZXMgb2YgdGhlIGRpcnR5IGZpbGVzeXN0ZW0gc3RhdGUgd2l0aFxuICAgKiB0aGUgcmV2aXNpb24gY2hhbmdlcywgd2hlcmUgZGlydHkgY2hhbmdlcyBhbmQgbW9yZSByZWNlbnQgcmV2aXNpb25zXG4gICAqIHRha2UgcHJpb3JpdHkgaW4gZGVjaWRpbmcgd2hpY2ggc3RhdHVzIGEgZmlsZSBpcyBpbi5cbiAgICovXG4gIF9tZXJnZUZpbGVTdGF0dXNlcyhcbiAgICBkaXJ0eVN0YXR1czogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4sXG4gICAgcmV2aXNpb25zRmlsZUNoYW5nZXM6IEFycmF5PFJldmlzaW9uRmlsZUNoYW5nZXM+LFxuICApOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgY29uc3QgbWVyZ2VkU3RhdHVzID0gbmV3IE1hcChkaXJ0eVN0YXR1cyk7XG4gICAgY29uc3QgbWVyZ2VkRmlsZVBhdGhzID0gbmV3IFNldChtZXJnZWRTdGF0dXMua2V5cygpKTtcblxuICAgIGZ1bmN0aW9uIG1lcmdlU3RhdHVzUGF0aHMoXG4gICAgICBmaWxlUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+LFxuICAgICAgY2hhbmdlU3RhdHVzVmFsdWU6IEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSxcbiAgICApIHtcbiAgICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgZmlsZVBhdGhzKSB7XG4gICAgICAgIGlmICghbWVyZ2VkRmlsZVBhdGhzLmhhcyhmaWxlUGF0aCkpIHtcbiAgICAgICAgICBtZXJnZWRTdGF0dXMuc2V0KGZpbGVQYXRoLCBjaGFuZ2VTdGF0dXNWYWx1ZSk7XG4gICAgICAgICAgbWVyZ2VkRmlsZVBhdGhzLmFkZChmaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH1cblxuICAgIC8vIE1vcmUgcmVjZW50IHJldmlzaW9uIGNoYW5nZXMgdGFrZXMgcHJpb3JpdHkgaW4gc3BlY2lmeWluZyBhIGZpbGVzJyBzdGF0dXNlcy5cbiAgICBjb25zdCBsYXRlc3RUb09sZGVzdFJldmlzaW9uc0NoYW5nZXMgPSByZXZpc2lvbnNGaWxlQ2hhbmdlcy5zbGljZSgpLnJldmVyc2UoKTtcbiAgICBmb3IgKGNvbnN0IHJldmlzaW9uRmlsZUNoYW5nZXMgb2YgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnNDaGFuZ2VzKSB7XG4gICAgICBjb25zdCB7YWRkZWQsIG1vZGlmaWVkLCBkZWxldGVkfSA9IHJldmlzaW9uRmlsZUNoYW5nZXM7XG5cbiAgICAgIG1lcmdlU3RhdHVzUGF0aHMoYWRkZWQsIEZpbGVDaGFuZ2VTdGF0dXMuQURERUQpO1xuICAgICAgbWVyZ2VTdGF0dXNQYXRocyhtb2RpZmllZCwgRmlsZUNoYW5nZVN0YXR1cy5NT0RJRklFRCk7XG4gICAgICBtZXJnZVN0YXR1c1BhdGhzKGRlbGV0ZWQsIEZpbGVDaGFuZ2VTdGF0dXMuREVMRVRFRCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lcmdlZFN0YXR1cztcbiAgfVxuXG4gIGdldERpcnR5RmlsZUNoYW5nZXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIHJldHVybiB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgZ2V0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbW1pdE1lcmdlRmlsZUNoYW5nZXM7XG4gIH1cblxuICBhc3luYyBmZXRjaEhnRGlmZihmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8SGdEaWZmU3RhdGU+IHtcbiAgICBjb25zdCB7cmV2aXNpb25zLCBjb21taXRJZCwgY29tcGFyZUNvbW1pdElkfSA9IGF3YWl0IHRoaXMuZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgY29uc3QgY29tbWl0dGVkQ29udGVudHMgPSBhd2FpdCB0aGlzLl9yZXBvc2l0b3J5XG4gICAgICAuZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24oZmlsZVBhdGgsIGNvbXBhcmVDb21taXRJZCA/IGAke2NvbXBhcmVDb21taXRJZH1gIDogbnVsbClcbiAgICAgIC8vIElmIHRoZSBmaWxlIGRpZG4ndCBleGlzdCBvbiB0aGUgcHJldmlvdXMgcmV2aXNpb24sIHJldHVybiBlbXB0eSBjb250ZW50cy5cbiAgICAgIC50aGVuKGNvbnRlbnRzID0+IGNvbnRlbnRzIHx8ICcnLCBfZXJyID0+ICcnKTtcblxuICAgIC8vIEludGVudGlvbmFsbHkgZmV0Y2ggdGhlIGZpbGVzeXN0ZW0gY29udGVudHMgYWZ0ZXIgZ2V0dGluZyB0aGUgY29tbWl0dGVkIGNvbnRlbnRzXG4gICAgLy8gdG8gbWFrZSBzdXJlIHdlIGhhdmUgdGhlIGxhdGVzdCBmaWxlc3lzdGVtIHZlcnNpb24uXG4gICAgY29uc3QgZmlsZXN5c3RlbUNvbnRlbnRzID0gYXdhaXQgZ2V0RmlsZVN5c3RlbUNvbnRlbnRzKGZpbGVQYXRoKTtcblxuICAgIGNvbnN0IGZldGNoZWRSZXZpc2lvbklkID0gY29tcGFyZUNvbW1pdElkICE9IG51bGwgPyBjb21wYXJlQ29tbWl0SWQgOiBjb21taXRJZDtcbiAgICBjb25zdCBbcmV2aXNpb25JbmZvXSA9IHJldmlzaW9ucy5maWx0ZXIocmV2aXNpb24gPT4gcmV2aXNpb24uaWQgPT09IGZldGNoZWRSZXZpc2lvbklkKTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgICBgRGlmZiBWaXcgRmV0Y2hlcjogcmV2aXNpb24gd2l0aCBpZCAke2ZldGNoZWRSZXZpc2lvbklkfSBub3QgZm91bmRgLFxuICAgICk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgIH07XG4gIH1cblxuICBnZXRUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcG9zaXRvcnkuZ2V0Q29uZmlnVmFsdWVBc3luYygnY29tbWl0dGVtcGxhdGUuZW1wdHltc2cnKTtcbiAgfVxuXG4gIGFzeW5jIHNldFJldmlzaW9uKHJldmlzaW9uOiBSZXZpc2lvbkluZm8pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCByZXZpc2lvbnNTdGF0ZSA9IGF3YWl0IHRoaXMuZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgY29uc3Qge3JldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcblxuICAgIGludmFyaWFudChcbiAgICAgIHJldmlzaW9ucyAmJiByZXZpc2lvbnMuaW5kZXhPZihyZXZpc2lvbikgIT09IC0xLFxuICAgICAgJ0RpZmYgVml3IFRpbWVsaW5lOiBub24tYXBwbGljYWJsZSBzZWxlY3RlZCByZXZpc2lvbicsXG4gICAgKTtcblxuICAgIHRoaXMuX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkID0gcmV2aXNpb25zU3RhdGUuY29tcGFyZUNvbW1pdElkID0gcmV2aXNpb24uaWQ7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIHJldmlzaW9uc1N0YXRlKTtcblxuICAgIGNvbnN0IHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gYXdhaXQgdGhpcy5fZ2V0Q2FjaGVkUmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UocmV2aXNpb25zU3RhdGUpO1xuICAgIHRoaXMuX2NvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSB0aGlzLl9jb21wdXRlQ29tbWl0TWVyZ2VGcm9tSGlzdG9yeShcbiAgICAgIHJldmlzaW9uc1N0YXRlLFxuICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnksXG4gICAgKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoVVBEQVRFX0NPTU1JVF9NRVJHRV9GSUxFU19FVkVOVCwgdGhpcy5fY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBvbkRpZFVwZGF0ZURpcnR5RmlsZUNoYW5nZXMoXG4gICAgY2FsbGJhY2s6IChmaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKFVQREFURV9ESVJUWV9GSUxFU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRVcGRhdGVDb21taXRNZXJnZUZpbGVDaGFuZ2VzKFxuICAgIGNhbGxiYWNrOiAoZmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+KSA9PiB2b2lkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihVUERBVEVfQ09NTUlUX01FUkdFX0ZJTEVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZVJldmlzaW9ucyhcbiAgICBjYWxsYmFjazogKHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSkgPT4gdm9pZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzLmNsZWFyKCk7XG4gICAgdGhpcy5fY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcy5jbGVhcigpO1xuICAgIHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLnJlc2V0KCk7XG4gIH1cbn1cbiJdfQ==