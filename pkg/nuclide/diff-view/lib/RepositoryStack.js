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

      var committedContentsPromise = this._repository.fetchFileContentAtRevision(filePath, compareCommitId ? '' + compareCommitId : null)
      // If the file didn't exist on the previous revision, return empty contents.
      .then(function (contents) {
        return contents || '';
      }, function (err) {
        return '';
      });

      var filesystemContentsPromise = (0, _utils.getFileSystemContents)(filePath);

      var _ref2 = yield Promise.all([committedContentsPromise, filesystemContentsPromise]);

      var _ref22 = _slicedToArray(_ref2, 2);

      var committedContents = _ref22[0];
      var filesystemContents = _ref22[1];

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
//# sourceMappingURL=data:application/json;base64,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QUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUMzRTs7O1dBRXFCLGdDQUNwQixRQUF1RSxFQUN0RDtBQUNqQixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzlEOzs7V0FFdUIsa0NBQ3RCLFFBQXVFLEVBQ3REO0FBQ2pCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsMkJBQTJCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDaEU7OztXQUVtQiw4QkFDbEIsUUFBa0QsRUFDakM7QUFDakIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUMzRDs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMvQixVQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDakMsVUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3ZDOzs7U0F4WGtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6IlJlcG9zaXRvcnlTdGFjay5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtGaWxlQ2hhbmdlU3RhdHVzVmFsdWUsIEhnRGlmZlN0YXRlLCBSZXZpc2lvbnNTdGF0ZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25GaWxlQ2hhbmdlc30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtIZ1N0YXR1c1RvRmlsZUNoYW5nZVN0YXR1cywgRmlsZUNoYW5nZVN0YXR1c30gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtnZXRGaWxlU3lzdGVtQ29udGVudHN9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHthcnJheSwgcHJvbWlzZXMsIGRlYm91bmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge25vdGlmeUludGVybmFsRXJyb3J9IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgTFJVIGZyb20gJ2xydS1jYWNoZSc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuY29uc3Qge3NlcmlhbGl6ZUFzeW5jQ2FsbH0gPSBwcm9taXNlcztcbmNvbnN0IENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCA9ICdkaWQtY2hhbmdlLWNvbXBhcmUtc3RhdHVzJztcbmNvbnN0IENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQgPSAnZGlkLWNoYW5nZS1kaXJ0eS1zdGF0dXMnO1xuY29uc3QgQ0hBTkdFX1JFVklTSU9OU19FVkVOVCA9ICdkaWQtY2hhbmdlLXJldmlzaW9ucyc7XG5jb25zdCBVUERBVEVfU1RBVFVTX0RFQk9VTkNFX01TID0gMjAwMDtcblxuY29uc3QgRkVUQ0hfUkVWX0lORk9fUkVUUllfVElNRV9NUyA9IDEwMDA7XG5jb25zdCBGRVRDSF9SRVZfSU5GT19NQVhfVFJJRVMgPSA1O1xuXG50eXBlIFJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gQXJyYXk8e1xuICBpZDogbnVtYmVyO1xuICBjaGFuZ2VzOiBSZXZpc2lvbkZpbGVDaGFuZ2VzO1xufT47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlcG9zaXRvcnlTdGFjayB7XG5cbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZGlydHlGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIF9jb21wYXJlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfcmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50O1xuICBfcmV2aXNpb25zU3RhdGVQcm9taXNlOiA/UHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT47XG4gIF9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2U6ID9Qcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PjtcbiAgX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeTogP1JldmlzaW9uc0ZpbGVIaXN0b3J5O1xuICBfc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQ6ID9udW1iZXI7XG4gIF9pc0FjdGl2ZTogYm9vbGVhbjtcbiAgX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXM6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIF9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlczogTFJVPG51bWJlciwgUmV2aXNpb25GaWxlQ2hhbmdlcz47XG5cbiAgY29uc3RydWN0b3IocmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50KSB7XG4gICAgdGhpcy5fcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcyA9IG5ldyBMUlUoe21heDogMTAwfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZVN0YXR1cyA9IHNlcmlhbGl6ZUFzeW5jQ2FsbCgoKSA9PiB0aGlzLl91cGRhdGVDaGFuZ2VkU3RhdHVzKCkpO1xuICAgIGNvbnN0IGRlYm91bmNlZFNlcmlhbGl6ZWRVcGRhdGVTdGF0dXMgPSBkZWJvdW5jZShcbiAgICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXMsXG4gICAgICBVUERBVEVfU1RBVFVTX0RFQk9VTkNFX01TLFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgICBkZWJvdW5jZWRTZXJpYWxpemVkVXBkYXRlU3RhdHVzKCk7XG4gICAgLy8gR2V0IHRoZSBpbml0aWFsIHByb2plY3Qgc3RhdHVzLCBpZiBpdCdzIG5vdCBhbHJlYWR5IHRoZXJlLFxuICAgIC8vIHRyaWdnZXJlZCBieSBhbm90aGVyIGludGVncmF0aW9uLCBsaWtlIHRoZSBmaWxlIHRyZWUuXG4gICAgcmVwb3NpdG9yeS5nZXRTdGF0dXNlcyhbcmVwb3NpdG9yeS5nZXRQcm9qZWN0RGlyZWN0b3J5KCldKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHJlcG9zaXRvcnkub25EaWRDaGFuZ2VTdGF0dXNlcyhkZWJvdW5jZWRTZXJpYWxpemVkVXBkYXRlU3RhdHVzKVxuICAgICk7XG4gIH1cblxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXMoKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnVwZGF0ZS1jaGFuZ2Utc3RhdHVzJylcbiAgYXN5bmMgX3VwZGF0ZUNoYW5nZWRTdGF0dXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3VwZGF0ZURpcnR5RmlsZUNoYW5nZXMoKTtcbiAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZUNvbXBhcmVGaWxlQ2hhbmdlcygpO1xuICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgIG5vdGlmeUludGVybmFsRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVEaXJ0eUZpbGVDaGFuZ2VzKCk6IHZvaWQge1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMgPSB0aGlzLl9nZXREaXJ0eUNoYW5nZWRTdGF0dXMoKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX0RJUlRZX1NUQVRVU19FVkVOVCwgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBfZ2V0RGlydHlDaGFuZ2VkU3RhdHVzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICBjb25zdCBkaXJ0eUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IHN0YXR1c2VzID0gdGhpcy5fcmVwb3NpdG9yeS5nZXRBbGxQYXRoU3RhdHVzZXMoKTtcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIGluIHN0YXR1c2VzKSB7XG4gICAgICBjb25zdCBjaGFuZ2VTdGF0dXMgPSBIZ1N0YXR1c1RvRmlsZUNoYW5nZVN0YXR1c1tzdGF0dXNlc1tmaWxlUGF0aF1dO1xuICAgICAgaWYgKGNoYW5nZVN0YXR1cyAhPSBudWxsKSB7XG4gICAgICAgIGRpcnR5RmlsZUNoYW5nZXMuc2V0KGZpbGVQYXRoLCBjaGFuZ2VTdGF0dXMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGlydHlGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGZpbGUgY2hhbmdlIHN0YXRlIGNvbXBhcmluZyB0aGUgZGlydHkgZmlsZXN5c3RlbSBzdGF0dXNcbiAgICogdG8gYSBzZWxlY3RlZCBjb21taXQuXG4gICAqIFRoYXQgd291bGQgYmUgYSBtZXJnZSBvZiBgaGcgc3RhdHVzYCB3aXRoIHRoZSBkaWZmIGZyb20gY29tbWl0cyxcbiAgICogYW5kIGBoZyBsb2cgLS1yZXYgJHtyZXZJZH1gIGZvciBldmVyeSBjb21taXQuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlQ29tcGFyZUZpbGVDaGFuZ2VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFdlIHNob3VsZCBvbmx5IHVwZGF0ZSB0aGUgcmV2aXNpb24gc3RhdGUgd2hlbiB0aGUgcmVwb3NpdG9yeSBpcyBhY3RpdmUuXG4gICAgaWYgKCF0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCB0aGlzLl9nZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgcmV2aXNpb25zU3RhdGUpO1xuXG4gICAgLy8gSWYgdGhlIGNvbW1pdHMgaGF2ZW4ndCBjaGFuZ2VkIGlkcywgdGhlbiB0aGllciBkaWZmIGhhdmVuJ3QgY2hhbmdlZCBhcyB3ZWxsLlxuICAgIGxldCByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgaWYgKHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSAhPSBudWxsKSB7XG4gICAgICBjb25zdCBmaWxlSGlzdG9yeVJldmlzaW9uSWRzID0gdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5XG4gICAgICAgIC5tYXAocmV2aXNpb25DaGFuZ2VzID0+IHJldmlzaW9uQ2hhbmdlcy5pZCk7XG4gICAgICBjb25zdCByZXZpc2lvbklkcyA9IHJldmlzaW9uc1N0YXRlLnJldmlzaW9ucy5tYXAocmV2aXNpb24gPT4gcmV2aXNpb24uaWQpO1xuICAgICAgaWYgKGFycmF5LmVxdWFsKHJldmlzaW9uSWRzLCBmaWxlSGlzdG9yeVJldmlzaW9uSWRzKSkge1xuICAgICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGZXRjaCByZXZpc2lvbnMgaGlzdG9yeSBpZiByZXZpc2lvbnMgc3RhdGUgaGF2ZSBjaGFuZ2VkLlxuICAgIGlmIChyZXZpc2lvbnNGaWxlSGlzdG9yeSA9PSBudWxsKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IGF3YWl0IHRoaXMuX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKHJldmlzaW9uc1N0YXRlKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICAnQ2Fubm90IGZldGNoIHJldmlzaW9uIGhpc3Rvcnk6ICcgK1xuICAgICAgICAgICcoY291bGQgaGFwcGVuIHdpdGggcGVuZGluZyBzb3VyY2UtY29udHJvbCBoaXN0b3J5IHdyaXRpbmcgb3BlcmF0aW9ucyknLFxuICAgICAgICAgIGVycm9yLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyA9IHRoaXMuX2NvbXB1dGVDb21wYXJlQ2hhbmdlc0Zyb21IaXN0b3J5KFxuICAgICAgcmV2aXNpb25zU3RhdGUsXG4gICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSxcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQsIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBfZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk6IFByb21pc2U8UmV2aXNpb25zU3RhdGU+IHtcbiAgICB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2UgPSB0aGlzLl9mZXRjaFJldmlzaW9uc1N0YXRlKCkudGhlbihcbiAgICAgIHRoaXMuX2FtZW5kU2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQuYmluZCh0aGlzKSxcbiAgICAgIGVycm9yID0+IHtcbiAgICAgICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gbnVsbDtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9LFxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZTtcbiAgfVxuXG4gIGdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpOiBQcm9taXNlPFJldmlzaW9uc1N0YXRlPiB7XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGVQcm9taXNlID0gdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlO1xuICAgIGlmIChyZXZpc2lvbnNTdGF0ZVByb21pc2UgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJldmlzaW9uc1N0YXRlUHJvbWlzZS50aGVuKHRoaXMuX2FtZW5kU2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQuYmluZCh0aGlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW1lbmQgdGhlIHJldmlzaW9ucyBzdGF0ZSB3aXRoIHRoZSBsYXRlc3Qgc2VsZWN0ZWQgdmFsaWQgY29tcGFyZSBjb21taXQgaWQuXG4gICAqL1xuICBfYW1lbmRTZWxlY3RlZENvbXBhcmVDb21taXRJZChyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpOiBSZXZpc2lvbnNTdGF0ZSB7XG4gICAgY29uc3Qge2NvbW1pdElkLCByZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG4gICAgLy8gUHJpb3JpdGl6ZSB0aGUgY2FjaGVkIGNvbXBhZXJlQ29tbWl0SWQsIGlmIGl0IGV4aXN0cy5cbiAgICAvLyBUaGUgdXNlciBjb3VsZCBoYXZlIHNlbGVjdGVkIHRoYXQgZnJvbSB0aGUgdGltZWxpbmUgdmlldy5cbiAgICBsZXQgY29tcGFyZUNvbW1pdElkID0gdGhpcy5fc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQ7XG4gICAgaWYgKCFhcnJheS5maW5kKHJldmlzaW9ucywgcmV2aXNpb24gPT4gcmV2aXNpb24uaWQgPT09IGNvbXBhcmVDb21taXRJZCkpIHtcbiAgICAgIC8vIEludmFsaWRhdGUgaWYgdGhlcmUgdGhlcmUgaXMgbm8gbG9uZ2VyIGEgcmV2aXNpb24gd2l0aCB0aGF0IGlkLlxuICAgICAgY29tcGFyZUNvbW1pdElkID0gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMgPSByZXZpc2lvbnMuc2xpY2UoKS5yZXZlcnNlKCk7XG4gICAgaWYgKGNvbXBhcmVDb21taXRJZCA9PSBudWxsICYmIGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgIC8vIElmIHRoZSB1c2VyIGhhcyBhbHJlYWR5IGNvbW1pdHRlZCwgbW9zdCBvZiB0aGUgdGltZXMsIGhlJ2QgYmUgd29ya2luZyBvbiBhbiBhbWVuZC5cbiAgICAgIC8vIFNvLCB0aGUgaGV1cmlzdGljIGhlcmUgaXMgdG8gY29tcGFyZSBhZ2FpbnN0IHRoZSBwcmV2aW91cyB2ZXJzaW9uLFxuICAgICAgLy8gbm90IHRoZSBqdXN0LWNvbW1pdHRlZCBvbmUsIHdoaWxlIHRoZSByZXZpc2lvbnMgdGltZWxpbmVcbiAgICAgIC8vIHdvdWxkIGdpdmUgYSB3YXkgdG8gc3BlY2lmeSBvdGhlcndpc2UuXG4gICAgICBjb21wYXJlQ29tbWl0SWQgPSBsYXRlc3RUb09sZGVzdFJldmlzaW9uc1sxXS5pZDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJldmlzaW9ucyxcbiAgICAgIGNvbW1pdElkLFxuICAgICAgY29tcGFyZUNvbW1pdElkLFxuICAgIH07XG4gIH1cblxuICBfZ2V0UmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UoXG4gICAgcmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlLFxuICApOiBQcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PiB7XG4gICAgdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlID0gdGhpcy5fZmV0Y2hSZXZpc2lvbnNGaWxlSGlzdG9yeShyZXZpc2lvbnNTdGF0ZSlcbiAgICAgIC50aGVuKHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0+XG4gICAgICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IHJldmlzaW9uc0ZpbGVIaXN0b3J5XG4gICAgICAsIGVycm9yID0+IHtcbiAgICAgICAgdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gbnVsbDtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlO1xuICB9XG5cbiAgX2dldENhY2hlZFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgKTogUHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT4ge1xuICAgIGlmICh0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2UgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKHJldmlzaW9uc1N0YXRlKTtcbiAgICB9XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5mZXRjaC1yZXZpc2lvbnMtc3RhdGUnKVxuICBhc3luYyBfZmV0Y2hSZXZpc2lvbnNTdGF0ZSgpOiBQcm9taXNlPFJldmlzaW9uc1N0YXRlPiB7XG4gICAgLy8gV2hpbGUgcmViYXNpbmcsIHRoZSBjb21tb24gYW5jZXN0b3Igb2YgYEhFQURgIGFuZCBgQkFTRWBcbiAgICAvLyBtYXkgYmUgbm90IGFwcGxpY2FibGUsIGJ1dCB0aGF0J3MgZGVmaW5lZCBvbmNlIHRoZSByZWJhc2UgaXMgZG9uZS5cbiAgICAvLyBIZW5jZSwgd2UgbmVlZCB0byByZXRyeSBmZXRjaGluZyB0aGUgcmV2aXNpb24gaW5mbyAoZGVwZW5kaW5nIG9uIHRoZSBjb21tb24gYW5jZXN0b3IpXG4gICAgLy8gYmVjYXVzZSB0aGUgd2F0Y2htYW4tYmFzZWQgTWVyY3VyaWFsIHVwZGF0ZXMgZG9lc24ndCBjb25zaWRlciBvciB3YWl0IHdoaWxlIHJlYmFzaW5nLlxuICAgIGNvbnN0IHJldmlzaW9ucyA9IGF3YWl0IHByb21pc2VzLnJldHJ5TGltaXQoXG4gICAgICAoKSA9PiB0aGlzLl9yZXBvc2l0b3J5LmZldGNoUmV2aXNpb25JbmZvQmV0d2VlbkhlYWRBbmRCYXNlKCksXG4gICAgICAocmVzdWx0KSA9PiByZXN1bHQgIT0gbnVsbCxcbiAgICAgIEZFVENIX1JFVl9JTkZPX01BWF9UUklFUyxcbiAgICAgIEZFVENIX1JFVl9JTkZPX1JFVFJZX1RJTUVfTVMsXG4gICAgKTtcbiAgICBpZiAocmV2aXNpb25zID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZldGNoIHJldmlzaW9uIGluZm8gbmVlZGVkIScpO1xuICAgIH1cbiAgICBjb25zdCBjb21taXRJZCA9IHJldmlzaW9uc1tyZXZpc2lvbnMubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIHtcbiAgICAgIHJldmlzaW9ucyxcbiAgICAgIGNvbW1pdElkLFxuICAgICAgY29tcGFyZUNvbW1pdElkOiBudWxsLFxuICAgIH07XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5mZXRjaC1yZXZpc2lvbnMtY2hhbmdlLWhpc3RvcnknKVxuICBhc3luYyBfZmV0Y2hSZXZpc2lvbnNGaWxlSGlzdG9yeShyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpOiBQcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PiB7XG4gICAgY29uc3Qge3JldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcblxuICAgIC8vIFJldmlzaW9uIGlkcyBhcmUgdW5pcXVlIGFuZCBkb24ndCBjaGFuZ2UsIGV4Y2VwdCB3aGVuIHRoZSByZXZpc2lvbiBpcyBhbWVuZGVkL3JlYmFzZWQuXG4gICAgLy8gSGVuY2UsIGl0J3MgY2FjaGVkIGhlcmUgdG8gYXZvaWQgc2VydmljZSBjYWxscyB3aGVuIHdvcmtpbmcgb24gYSBzdGFjayBvZiBjb21taXRzLlxuICAgIGNvbnN0IHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gYXdhaXQgUHJvbWlzZS5hbGwocmV2aXNpb25zXG4gICAgICAubWFwKGFzeW5jIChyZXZpc2lvbikgPT4ge1xuICAgICAgICBjb25zdCB7aWR9ID0gcmV2aXNpb247XG4gICAgICAgIGxldCBjaGFuZ2VzID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLmhhcyhpZCkpIHtcbiAgICAgICAgICBjaGFuZ2VzID0gdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMuZ2V0KGlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaGFuZ2VzID0gYXdhaXQgdGhpcy5fcmVwb3NpdG9yeS5mZXRjaEZpbGVzQ2hhbmdlZEF0UmV2aXNpb24oYCR7aWR9YCk7XG4gICAgICAgICAgaWYgKGNoYW5nZXMgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDaGFuZ2VzIG5vdCBhdmFpbGFibGUgZm9yIHJldmlzaW9uOiAke2lkfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5zZXQoaWQsIGNoYW5nZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7aWQsIGNoYW5nZXN9O1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgcmV0dXJuIHJldmlzaW9uc0ZpbGVIaXN0b3J5O1xuICB9XG5cbiAgX2NvbXB1dGVDb21wYXJlQ2hhbmdlc0Zyb21IaXN0b3J5KFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgICByZXZpc2lvbnNGaWxlSGlzdG9yeTogUmV2aXNpb25zRmlsZUhpc3RvcnksXG4gICk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcblxuICAgIGNvbnN0IHtjb21taXRJZCwgY29tcGFyZUNvbW1pdElkfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIC8vIFRoZSBzdGF0dXMgaXMgZmV0Y2hlZCBieSBtZXJnaW5nIHRoZSBjaGFuZ2VzIHJpZ2h0IGFmdGVyIHRoZSBgY29tcGFyZUNvbW1pdElkYCBpZiBzcGVjaWZpZWQsXG4gICAgLy8gb3IgYEhFQURgIGlmIG5vdC5cbiAgICBjb25zdCBzdGFydENvbW1pdElkID0gY29tcGFyZUNvbW1pdElkID8gKGNvbXBhcmVDb21taXRJZCArIDEpIDogY29tbWl0SWQ7XG4gICAgLy8gR2V0IHRoZSByZXZpc2lvbiBjaGFuZ2VzIHRoYXQncyBuZXdlciB0aGFuIG9yIGlzIHRoZSBjdXJyZW50IGNvbW1pdCBpZC5cbiAgICBjb25zdCBjb21wYXJlUmV2aXNpb25zRmlsZUNoYW5nZXMgPSByZXZpc2lvbnNGaWxlSGlzdG9yeVxuICAgICAgLnNsaWNlKDEpIC8vIEV4Y2x1ZGUgdGhlIEJBU0UgcmV2aXNpb24uXG4gICAgICAuZmlsdGVyKHJldmlzaW9uID0+IHJldmlzaW9uLmlkID49IHN0YXJ0Q29tbWl0SWQpXG4gICAgICAubWFwKHJldmlzaW9uID0+IHJldmlzaW9uLmNoYW5nZXMpO1xuXG4gICAgLy8gVGhlIGxhc3Qgc3RhdHVzIHRvIG1lcmdlIGlzIHRoZSBkaXJ0eSBmaWxlc3lzdGVtIHN0YXR1cy5cbiAgICBjb25zdCBtZXJnZWRGaWxlU3RhdHVzZXMgPSB0aGlzLl9tZXJnZUZpbGVTdGF0dXNlcyhcbiAgICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMsXG4gICAgICBjb21wYXJlUmV2aXNpb25zRmlsZUNoYW5nZXMsXG4gICAgKTtcbiAgICByZXR1cm4gbWVyZ2VkRmlsZVN0YXR1c2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlcyB0aGUgZmlsZSBjaGFuZ2Ugc3RhdHVzZXMgb2YgdGhlIGRpcnR5IGZpbGVzeXN0ZW0gc3RhdGUgd2l0aFxuICAgKiB0aGUgcmV2aXNpb24gY2hhbmdlcywgd2hlcmUgZGlydHkgY2hhbmdlcyBhbmQgbW9yZSByZWNlbnQgcmV2aXNpb25zXG4gICAqIHRha2UgcHJpb3JpdHkgaW4gZGVjaWRpbmcgd2hpY2ggc3RhdHVzIGEgZmlsZSBpcyBpbi5cbiAgICovXG4gIF9tZXJnZUZpbGVTdGF0dXNlcyhcbiAgICBkaXJ0eVN0YXR1czogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4sXG4gICAgcmV2aXNpb25zRmlsZUNoYW5nZXM6IEFycmF5PFJldmlzaW9uRmlsZUNoYW5nZXM+LFxuICApOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgY29uc3QgbWVyZ2VkU3RhdHVzID0gbmV3IE1hcChkaXJ0eVN0YXR1cyk7XG4gICAgY29uc3QgbWVyZ2VkRmlsZVBhdGhzID0gbmV3IFNldChtZXJnZWRTdGF0dXMua2V5cygpKTtcblxuICAgIGZ1bmN0aW9uIG1lcmdlU3RhdHVzUGF0aHMoXG4gICAgICBmaWxlUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+LFxuICAgICAgY2hhbmdlU3RhdHVzVmFsdWU6IEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSxcbiAgICApIHtcbiAgICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgZmlsZVBhdGhzKSB7XG4gICAgICAgIGlmICghbWVyZ2VkRmlsZVBhdGhzLmhhcyhmaWxlUGF0aCkpIHtcbiAgICAgICAgICBtZXJnZWRTdGF0dXMuc2V0KGZpbGVQYXRoLCBjaGFuZ2VTdGF0dXNWYWx1ZSk7XG4gICAgICAgICAgbWVyZ2VkRmlsZVBhdGhzLmFkZChmaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH1cblxuICAgIC8vIE1vcmUgcmVjZW50IHJldmlzaW9uIGNoYW5nZXMgdGFrZXMgcHJpb3JpdHkgaW4gc3BlY2lmeWluZyBhIGZpbGVzJyBzdGF0dXNlcy5cbiAgICBjb25zdCBsYXRlc3RUb09sZGVzdFJldmlzaW9uc0NoYW5nZXMgPSByZXZpc2lvbnNGaWxlQ2hhbmdlcy5zbGljZSgpLnJldmVyc2UoKTtcbiAgICBmb3IgKGNvbnN0IHJldmlzaW9uRmlsZUNoYW5nZXMgb2YgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnNDaGFuZ2VzKSB7XG4gICAgICBjb25zdCB7YWRkZWQsIG1vZGlmaWVkLCBkZWxldGVkfSA9IHJldmlzaW9uRmlsZUNoYW5nZXM7XG5cbiAgICAgIG1lcmdlU3RhdHVzUGF0aHMoYWRkZWQsIEZpbGVDaGFuZ2VTdGF0dXMuQURERUQpO1xuICAgICAgbWVyZ2VTdGF0dXNQYXRocyhtb2RpZmllZCwgRmlsZUNoYW5nZVN0YXR1cy5NT0RJRklFRCk7XG4gICAgICBtZXJnZVN0YXR1c1BhdGhzKGRlbGV0ZWQsIEZpbGVDaGFuZ2VTdGF0dXMuREVMRVRFRCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lcmdlZFN0YXR1cztcbiAgfVxuXG4gIGdldERpcnR5RmlsZUNoYW5nZXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIHJldHVybiB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgZ2V0Q29tcGFyZUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgYXN5bmMgZmV0Y2hIZ0RpZmYoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPEhnRGlmZlN0YXRlPiB7XG4gICAgY29uc3Qge2NvbXBhcmVDb21taXRJZH0gPSBhd2FpdCB0aGlzLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIGNvbnN0IGNvbW1pdHRlZENvbnRlbnRzUHJvbWlzZSA9IHRoaXMuX3JlcG9zaXRvcnlcbiAgICAgIC5mZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aCwgY29tcGFyZUNvbW1pdElkID8gYCR7Y29tcGFyZUNvbW1pdElkfWAgOiBudWxsKVxuICAgICAgLy8gSWYgdGhlIGZpbGUgZGlkbid0IGV4aXN0IG9uIHRoZSBwcmV2aW91cyByZXZpc2lvbiwgcmV0dXJuIGVtcHR5IGNvbnRlbnRzLlxuICAgICAgLnRoZW4oY29udGVudHMgPT4gY29udGVudHMgfHwgJycsIGVyciA9PiAnJyk7XG5cbiAgICBjb25zdCBmaWxlc3lzdGVtQ29udGVudHNQcm9taXNlID0gZ2V0RmlsZVN5c3RlbUNvbnRlbnRzKGZpbGVQYXRoKTtcblxuICAgIGNvbnN0IFtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgIF0gPSBhd2FpdCBQcm9taXNlLmFsbChbY29tbWl0dGVkQ29udGVudHNQcm9taXNlLCBmaWxlc3lzdGVtQ29udGVudHNQcm9taXNlXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBzZXRSZXZpc2lvbihyZXZpc2lvbjogUmV2aXNpb25JbmZvKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCB0aGlzLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIGNvbnN0IHtyZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG5cbiAgICBpbnZhcmlhbnQoXG4gICAgICByZXZpc2lvbnMgJiYgcmV2aXNpb25zLmluZGV4T2YocmV2aXNpb24pICE9PSAtMSxcbiAgICAgICdEaWZmIFZpdyBUaW1lbGluZTogbm9uLWFwcGxpY2FibGUgc2VsZWN0ZWQgcmV2aXNpb24nLFxuICAgICk7XG5cbiAgICB0aGlzLl9zZWxlY3RlZENvbXBhcmVDb21taXRJZCA9IHJldmlzaW9uc1N0YXRlLmNvbXBhcmVDb21taXRJZCA9IHJldmlzaW9uLmlkO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG5cbiAgICBjb25zdCByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IGF3YWl0IHRoaXMuX2dldENhY2hlZFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKHJldmlzaW9uc1N0YXRlKTtcbiAgICB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMgPSB0aGlzLl9jb21wdXRlQ29tcGFyZUNoYW5nZXNGcm9tSGlzdG9yeShcbiAgICAgIHJldmlzaW9uc1N0YXRlLFxuICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnksXG4gICAgKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5ULCB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMpO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VEaXJ0eVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPikgPT4gdm9pZFxuICApOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPikgPT4gdm9pZFxuICApOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VSZXZpc2lvbnMoXG4gICAgY2FsbGJhY2s6IChyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpID0+IHZvaWRcbiAgKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMuY2xlYXIoKTtcbiAgICB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMuY2xlYXIoKTtcbiAgICB0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5yZXNldCgpO1xuICB9XG59XG4iXX0=