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
//# sourceMappingURL=data:application/json;base64,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QUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUMzRTs7O1dBRXFCLGdDQUNwQixRQUF1RSxFQUMxRDtBQUNiLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMseUJBQXlCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDOUQ7OztXQUV1QixrQ0FDdEIsUUFBdUUsRUFDMUQ7QUFDYixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLDJCQUEyQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ2hFOzs7V0FFbUIsOEJBQ2xCLFFBQWtELEVBQ3JDO0FBQ2IsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUMzRDs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMvQixVQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDakMsVUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3ZDOzs7U0F4WGtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6IlJlcG9zaXRvcnlTdGFjay5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtGaWxlQ2hhbmdlU3RhdHVzVmFsdWUsIEhnRGlmZlN0YXRlLCBSZXZpc2lvbnNTdGF0ZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25GaWxlQ2hhbmdlc30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtIZ1N0YXR1c1RvRmlsZUNoYW5nZVN0YXR1cywgRmlsZUNoYW5nZVN0YXR1c30gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtnZXRGaWxlU3lzdGVtQ29udGVudHN9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHthcnJheSwgcHJvbWlzZXMsIGRlYm91bmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge25vdGlmeUludGVybmFsRXJyb3J9IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgTFJVIGZyb20gJ2xydS1jYWNoZSc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuY29uc3Qge3NlcmlhbGl6ZUFzeW5jQ2FsbH0gPSBwcm9taXNlcztcbmNvbnN0IENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCA9ICdkaWQtY2hhbmdlLWNvbXBhcmUtc3RhdHVzJztcbmNvbnN0IENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQgPSAnZGlkLWNoYW5nZS1kaXJ0eS1zdGF0dXMnO1xuY29uc3QgQ0hBTkdFX1JFVklTSU9OU19FVkVOVCA9ICdkaWQtY2hhbmdlLXJldmlzaW9ucyc7XG5jb25zdCBVUERBVEVfU1RBVFVTX0RFQk9VTkNFX01TID0gMjAwMDtcblxuY29uc3QgRkVUQ0hfUkVWX0lORk9fUkVUUllfVElNRV9NUyA9IDEwMDA7XG5jb25zdCBGRVRDSF9SRVZfSU5GT19NQVhfVFJJRVMgPSA1O1xuXG50eXBlIFJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gQXJyYXk8e1xuICBpZDogbnVtYmVyO1xuICBjaGFuZ2VzOiBSZXZpc2lvbkZpbGVDaGFuZ2VzO1xufT47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlcG9zaXRvcnlTdGFjayB7XG5cbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZGlydHlGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIF9jb21wYXJlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfcmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50O1xuICBfcmV2aXNpb25zU3RhdGVQcm9taXNlOiA/UHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT47XG4gIF9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2U6ID9Qcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PjtcbiAgX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeTogP1JldmlzaW9uc0ZpbGVIaXN0b3J5O1xuICBfc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQ6ID9udW1iZXI7XG4gIF9pc0FjdGl2ZTogYm9vbGVhbjtcbiAgX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXM6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIF9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlczogTFJVPG51bWJlciwgUmV2aXNpb25GaWxlQ2hhbmdlcz47XG5cbiAgY29uc3RydWN0b3IocmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50KSB7XG4gICAgdGhpcy5fcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcyA9IG5ldyBMUlUoe21heDogMTAwfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZVN0YXR1cyA9IHNlcmlhbGl6ZUFzeW5jQ2FsbCgoKSA9PiB0aGlzLl91cGRhdGVDaGFuZ2VkU3RhdHVzKCkpO1xuICAgIGNvbnN0IGRlYm91bmNlZFNlcmlhbGl6ZWRVcGRhdGVTdGF0dXMgPSBkZWJvdW5jZShcbiAgICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXMsXG4gICAgICBVUERBVEVfU1RBVFVTX0RFQk9VTkNFX01TLFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgICBkZWJvdW5jZWRTZXJpYWxpemVkVXBkYXRlU3RhdHVzKCk7XG4gICAgLy8gR2V0IHRoZSBpbml0aWFsIHByb2plY3Qgc3RhdHVzLCBpZiBpdCdzIG5vdCBhbHJlYWR5IHRoZXJlLFxuICAgIC8vIHRyaWdnZXJlZCBieSBhbm90aGVyIGludGVncmF0aW9uLCBsaWtlIHRoZSBmaWxlIHRyZWUuXG4gICAgcmVwb3NpdG9yeS5nZXRTdGF0dXNlcyhbcmVwb3NpdG9yeS5nZXRQcm9qZWN0RGlyZWN0b3J5KCldKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHJlcG9zaXRvcnkub25EaWRDaGFuZ2VTdGF0dXNlcyhkZWJvdW5jZWRTZXJpYWxpemVkVXBkYXRlU3RhdHVzKVxuICAgICk7XG4gIH1cblxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXMoKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnVwZGF0ZS1jaGFuZ2Utc3RhdHVzJylcbiAgYXN5bmMgX3VwZGF0ZUNoYW5nZWRTdGF0dXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3VwZGF0ZURpcnR5RmlsZUNoYW5nZXMoKTtcbiAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZUNvbXBhcmVGaWxlQ2hhbmdlcygpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBub3RpZnlJbnRlcm5hbEVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlRGlydHlGaWxlQ2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gdGhpcy5fZ2V0RGlydHlDaGFuZ2VkU3RhdHVzKCk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQsIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMpO1xuICB9XG5cbiAgX2dldERpcnR5Q2hhbmdlZFN0YXR1cygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgY29uc3QgZGlydHlGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBzdGF0dXNlcyA9IHRoaXMuX3JlcG9zaXRvcnkuZ2V0QWxsUGF0aFN0YXR1c2VzKCk7XG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBpbiBzdGF0dXNlcykge1xuICAgICAgY29uc3QgY2hhbmdlU3RhdHVzID0gSGdTdGF0dXNUb0ZpbGVDaGFuZ2VTdGF0dXNbc3RhdHVzZXNbZmlsZVBhdGhdXTtcbiAgICAgIGlmIChjaGFuZ2VTdGF0dXMgIT0gbnVsbCkge1xuICAgICAgICBkaXJ0eUZpbGVDaGFuZ2VzLnNldChmaWxlUGF0aCwgY2hhbmdlU3RhdHVzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRpcnR5RmlsZUNoYW5nZXM7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBmaWxlIGNoYW5nZSBzdGF0ZSBjb21wYXJpbmcgdGhlIGRpcnR5IGZpbGVzeXN0ZW0gc3RhdHVzXG4gICAqIHRvIGEgc2VsZWN0ZWQgY29tbWl0LlxuICAgKiBUaGF0IHdvdWxkIGJlIGEgbWVyZ2Ugb2YgYGhnIHN0YXR1c2Agd2l0aCB0aGUgZGlmZiBmcm9tIGNvbW1pdHMsXG4gICAqIGFuZCBgaGcgbG9nIC0tcmV2ICR7cmV2SWR9YCBmb3IgZXZlcnkgY29tbWl0LlxuICAgKi9cbiAgYXN5bmMgX3VwZGF0ZUNvbXBhcmVGaWxlQ2hhbmdlcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBXZSBzaG91bGQgb25seSB1cGRhdGUgdGhlIHJldmlzaW9uIHN0YXRlIHdoZW4gdGhlIHJlcG9zaXRvcnkgaXMgYWN0aXZlLlxuICAgIGlmICghdGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZSA9IG51bGw7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5fZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIHJldmlzaW9uc1N0YXRlKTtcblxuICAgIC8vIElmIHRoZSBjb21taXRzIGhhdmVuJ3QgY2hhbmdlZCBpZHMsIHRoZW4gdGhpZXIgZGlmZiBoYXZlbid0IGNoYW5nZWQgYXMgd2VsbC5cbiAgICBsZXQgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBudWxsO1xuICAgIGlmICh0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgIT0gbnVsbCkge1xuICAgICAgY29uc3QgZmlsZUhpc3RvcnlSZXZpc2lvbklkcyA9IHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeVxuICAgICAgICAubWFwKHJldmlzaW9uQ2hhbmdlcyA9PiByZXZpc2lvbkNoYW5nZXMuaWQpO1xuICAgICAgY29uc3QgcmV2aXNpb25JZHMgPSByZXZpc2lvbnNTdGF0ZS5yZXZpc2lvbnMubWFwKHJldmlzaW9uID0+IHJldmlzaW9uLmlkKTtcbiAgICAgIGlmIChhcnJheS5lcXVhbChyZXZpc2lvbklkcywgZmlsZUhpc3RvcnlSZXZpc2lvbklkcykpIHtcbiAgICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3Rvcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRmV0Y2ggcmV2aXNpb25zIGhpc3RvcnkgaWYgcmV2aXNpb25zIHN0YXRlIGhhdmUgY2hhbmdlZC5cbiAgICBpZiAocmV2aXNpb25zRmlsZUhpc3RvcnkgPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBhd2FpdCB0aGlzLl9nZXRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShyZXZpc2lvbnNTdGF0ZSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgICAgJ0Nhbm5vdCBmZXRjaCByZXZpc2lvbiBoaXN0b3J5OiAnICtcbiAgICAgICAgICAnKGNvdWxkIGhhcHBlbiB3aXRoIHBlbmRpbmcgc291cmNlLWNvbnRyb2wgaGlzdG9yeSB3cml0aW5nIG9wZXJhdGlvbnMpJyxcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMgPSB0aGlzLl9jb21wdXRlQ29tcGFyZUNoYW5nZXNGcm9tSGlzdG9yeShcbiAgICAgIHJldmlzaW9uc1N0YXRlLFxuICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnksXG4gICAgKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5ULCB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMpO1xuICB9XG5cbiAgX2dldFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpOiBQcm9taXNlPFJldmlzaW9uc1N0YXRlPiB7XG4gICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gdGhpcy5fZmV0Y2hSZXZpc2lvbnNTdGF0ZSgpLnRoZW4oXG4gICAgICB0aGlzLl9hbWVuZFNlbGVjdGVkQ29tcGFyZUNvbW1pdElkLmJpbmQodGhpcyksXG4gICAgICBlcnJvciA9PiB7XG4gICAgICAgIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZSA9IG51bGw7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSxcbiAgICApO1xuICAgIHJldHVybiB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2U7XG4gIH1cblxuICBnZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTogUHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT4ge1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlUHJvbWlzZSA9IHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZTtcbiAgICBpZiAocmV2aXNpb25zU3RhdGVQcm9taXNlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiByZXZpc2lvbnNTdGF0ZVByb21pc2UudGhlbih0aGlzLl9hbWVuZFNlbGVjdGVkQ29tcGFyZUNvbW1pdElkLmJpbmQodGhpcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFtZW5kIHRoZSByZXZpc2lvbnMgc3RhdGUgd2l0aCB0aGUgbGF0ZXN0IHNlbGVjdGVkIHZhbGlkIGNvbXBhcmUgY29tbWl0IGlkLlxuICAgKi9cbiAgX2FtZW5kU2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQocmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlKTogUmV2aXNpb25zU3RhdGUge1xuICAgIGNvbnN0IHtjb21taXRJZCwgcmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIC8vIFByaW9yaXRpemUgdGhlIGNhY2hlZCBjb21wYWVyZUNvbW1pdElkLCBpZiBpdCBleGlzdHMuXG4gICAgLy8gVGhlIHVzZXIgY291bGQgaGF2ZSBzZWxlY3RlZCB0aGF0IGZyb20gdGhlIHRpbWVsaW5lIHZpZXcuXG4gICAgbGV0IGNvbXBhcmVDb21taXRJZCA9IHRoaXMuX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkO1xuICAgIGlmICghYXJyYXkuZmluZChyZXZpc2lvbnMsIHJldmlzaW9uID0+IHJldmlzaW9uLmlkID09PSBjb21wYXJlQ29tbWl0SWQpKSB7XG4gICAgICAvLyBJbnZhbGlkYXRlIGlmIHRoZXJlIHRoZXJlIGlzIG5vIGxvbmdlciBhIHJldmlzaW9uIHdpdGggdGhhdCBpZC5cbiAgICAgIGNvbXBhcmVDb21taXRJZCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zID0gcmV2aXNpb25zLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIGlmIChjb21wYXJlQ29tbWl0SWQgPT0gbnVsbCAmJiBsYXRlc3RUb09sZGVzdFJldmlzaW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBJZiB0aGUgdXNlciBoYXMgYWxyZWFkeSBjb21taXR0ZWQsIG1vc3Qgb2YgdGhlIHRpbWVzLCBoZSdkIGJlIHdvcmtpbmcgb24gYW4gYW1lbmQuXG4gICAgICAvLyBTbywgdGhlIGhldXJpc3RpYyBoZXJlIGlzIHRvIGNvbXBhcmUgYWdhaW5zdCB0aGUgcHJldmlvdXMgdmVyc2lvbixcbiAgICAgIC8vIG5vdCB0aGUganVzdC1jb21taXR0ZWQgb25lLCB3aGlsZSB0aGUgcmV2aXNpb25zIHRpbWVsaW5lXG4gICAgICAvLyB3b3VsZCBnaXZlIGEgd2F5IHRvIHNwZWNpZnkgb3RoZXJ3aXNlLlxuICAgICAgY29tcGFyZUNvbW1pdElkID0gbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnNbMV0uaWQ7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXZpc2lvbnMsXG4gICAgICBjb21taXRJZCxcbiAgICAgIGNvbXBhcmVDb21taXRJZCxcbiAgICB9O1xuICB9XG5cbiAgX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgKTogUHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT4ge1xuICAgIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZSA9IHRoaXMuX2ZldGNoUmV2aXNpb25zRmlsZUhpc3RvcnkocmV2aXNpb25zU3RhdGUpXG4gICAgICAudGhlbihyZXZpc2lvbnNGaWxlSGlzdG9yeSA9PlxuICAgICAgICB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgPSByZXZpc2lvbnNGaWxlSGlzdG9yeVxuICAgICAgLCBlcnJvciA9PiB7XG4gICAgICAgIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZTtcbiAgfVxuXG4gIF9nZXRDYWNoZWRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICk6IFByb21pc2U8UmV2aXNpb25zRmlsZUhpc3Rvcnk+IHtcbiAgICBpZiAodGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShyZXZpc2lvbnNTdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmV0Y2gtcmV2aXNpb25zLXN0YXRlJylcbiAgYXN5bmMgX2ZldGNoUmV2aXNpb25zU3RhdGUoKTogUHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT4ge1xuICAgIC8vIFdoaWxlIHJlYmFzaW5nLCB0aGUgY29tbW9uIGFuY2VzdG9yIG9mIGBIRUFEYCBhbmQgYEJBU0VgXG4gICAgLy8gbWF5IGJlIG5vdCBhcHBsaWNhYmxlLCBidXQgdGhhdCdzIGRlZmluZWQgb25jZSB0aGUgcmViYXNlIGlzIGRvbmUuXG4gICAgLy8gSGVuY2UsIHdlIG5lZWQgdG8gcmV0cnkgZmV0Y2hpbmcgdGhlIHJldmlzaW9uIGluZm8gKGRlcGVuZGluZyBvbiB0aGUgY29tbW9uIGFuY2VzdG9yKVxuICAgIC8vIGJlY2F1c2UgdGhlIHdhdGNobWFuLWJhc2VkIE1lcmN1cmlhbCB1cGRhdGVzIGRvZXNuJ3QgY29uc2lkZXIgb3Igd2FpdCB3aGlsZSByZWJhc2luZy5cbiAgICBjb25zdCByZXZpc2lvbnMgPSBhd2FpdCBwcm9taXNlcy5yZXRyeUxpbWl0KFxuICAgICAgKCkgPT4gdGhpcy5fcmVwb3NpdG9yeS5mZXRjaFJldmlzaW9uSW5mb0JldHdlZW5IZWFkQW5kQmFzZSgpLFxuICAgICAgKHJlc3VsdCkgPT4gcmVzdWx0ICE9IG51bGwsXG4gICAgICBGRVRDSF9SRVZfSU5GT19NQVhfVFJJRVMsXG4gICAgICBGRVRDSF9SRVZfSU5GT19SRVRSWV9USU1FX01TLFxuICAgICk7XG4gICAgaWYgKHJldmlzaW9ucyA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmZXRjaCByZXZpc2lvbiBpbmZvIG5lZWRlZCEnKTtcbiAgICB9XG4gICAgY29uc3QgY29tbWl0SWQgPSByZXZpc2lvbnNbcmV2aXNpb25zLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiB7XG4gICAgICByZXZpc2lvbnMsXG4gICAgICBjb21taXRJZCxcbiAgICAgIGNvbXBhcmVDb21taXRJZDogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmV0Y2gtcmV2aXNpb25zLWNoYW5nZS1oaXN0b3J5JylcbiAgYXN5bmMgX2ZldGNoUmV2aXNpb25zRmlsZUhpc3RvcnkocmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlKTogUHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT4ge1xuICAgIGNvbnN0IHtyZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG5cbiAgICAvLyBSZXZpc2lvbiBpZHMgYXJlIHVuaXF1ZSBhbmQgZG9uJ3QgY2hhbmdlLCBleGNlcHQgd2hlbiB0aGUgcmV2aXNpb24gaXMgYW1lbmRlZC9yZWJhc2VkLlxuICAgIC8vIEhlbmNlLCBpdCdzIGNhY2hlZCBoZXJlIHRvIGF2b2lkIHNlcnZpY2UgY2FsbHMgd2hlbiB3b3JraW5nIG9uIGEgc3RhY2sgb2YgY29tbWl0cy5cbiAgICBjb25zdCByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IGF3YWl0IFByb21pc2UuYWxsKHJldmlzaW9uc1xuICAgICAgLm1hcChhc3luYyAocmV2aXNpb24pID0+IHtcbiAgICAgICAgY29uc3Qge2lkfSA9IHJldmlzaW9uO1xuICAgICAgICBsZXQgY2hhbmdlcyA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5oYXMoaWQpKSB7XG4gICAgICAgICAgY2hhbmdlcyA9IHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLmdldChpZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hhbmdlcyA9IGF3YWl0IHRoaXMuX3JlcG9zaXRvcnkuZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKGAke2lkfWApO1xuICAgICAgICAgIGlmIChjaGFuZ2VzID09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2hhbmdlcyBub3QgYXZhaWxhYmxlIGZvciByZXZpc2lvbjogJHtpZH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMuc2V0KGlkLCBjaGFuZ2VzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge2lkLCBjaGFuZ2VzfTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHJldHVybiByZXZpc2lvbnNGaWxlSGlzdG9yeTtcbiAgfVxuXG4gIF9jb21wdXRlQ29tcGFyZUNoYW5nZXNGcm9tSGlzdG9yeShcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICAgcmV2aXNpb25zRmlsZUhpc3Rvcnk6IFJldmlzaW9uc0ZpbGVIaXN0b3J5LFxuICApOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG5cbiAgICBjb25zdCB7Y29tbWl0SWQsIGNvbXBhcmVDb21taXRJZH0gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICAvLyBUaGUgc3RhdHVzIGlzIGZldGNoZWQgYnkgbWVyZ2luZyB0aGUgY2hhbmdlcyByaWdodCBhZnRlciB0aGUgYGNvbXBhcmVDb21taXRJZGAgaWYgc3BlY2lmaWVkLFxuICAgIC8vIG9yIGBIRUFEYCBpZiBub3QuXG4gICAgY29uc3Qgc3RhcnRDb21taXRJZCA9IGNvbXBhcmVDb21taXRJZCA/IChjb21wYXJlQ29tbWl0SWQgKyAxKSA6IGNvbW1pdElkO1xuICAgIC8vIEdldCB0aGUgcmV2aXNpb24gY2hhbmdlcyB0aGF0J3MgbmV3ZXIgdGhhbiBvciBpcyB0aGUgY3VycmVudCBjb21taXQgaWQuXG4gICAgY29uc3QgY29tcGFyZVJldmlzaW9uc0ZpbGVDaGFuZ2VzID0gcmV2aXNpb25zRmlsZUhpc3RvcnlcbiAgICAgIC5zbGljZSgxKSAvLyBFeGNsdWRlIHRoZSBCQVNFIHJldmlzaW9uLlxuICAgICAgLmZpbHRlcihyZXZpc2lvbiA9PiByZXZpc2lvbi5pZCA+PSBzdGFydENvbW1pdElkKVxuICAgICAgLm1hcChyZXZpc2lvbiA9PiByZXZpc2lvbi5jaGFuZ2VzKTtcblxuICAgIC8vIFRoZSBsYXN0IHN0YXR1cyB0byBtZXJnZSBpcyB0aGUgZGlydHkgZmlsZXN5c3RlbSBzdGF0dXMuXG4gICAgY29uc3QgbWVyZ2VkRmlsZVN0YXR1c2VzID0gdGhpcy5fbWVyZ2VGaWxlU3RhdHVzZXMoXG4gICAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzLFxuICAgICAgY29tcGFyZVJldmlzaW9uc0ZpbGVDaGFuZ2VzLFxuICAgICk7XG4gICAgcmV0dXJuIG1lcmdlZEZpbGVTdGF0dXNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIGZpbGUgY2hhbmdlIHN0YXR1c2VzIG9mIHRoZSBkaXJ0eSBmaWxlc3lzdGVtIHN0YXRlIHdpdGhcbiAgICogdGhlIHJldmlzaW9uIGNoYW5nZXMsIHdoZXJlIGRpcnR5IGNoYW5nZXMgYW5kIG1vcmUgcmVjZW50IHJldmlzaW9uc1xuICAgKiB0YWtlIHByaW9yaXR5IGluIGRlY2lkaW5nIHdoaWNoIHN0YXR1cyBhIGZpbGUgaXMgaW4uXG4gICAqL1xuICBfbWVyZ2VGaWxlU3RhdHVzZXMoXG4gICAgZGlydHlTdGF0dXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+LFxuICAgIHJldmlzaW9uc0ZpbGVDaGFuZ2VzOiBBcnJheTxSZXZpc2lvbkZpbGVDaGFuZ2VzPixcbiAgKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIGNvbnN0IG1lcmdlZFN0YXR1cyA9IG5ldyBNYXAoZGlydHlTdGF0dXMpO1xuICAgIGNvbnN0IG1lcmdlZEZpbGVQYXRocyA9IG5ldyBTZXQobWVyZ2VkU3RhdHVzLmtleXMoKSk7XG5cbiAgICBmdW5jdGlvbiBtZXJnZVN0YXR1c1BhdGhzKFxuICAgICAgZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPixcbiAgICAgIGNoYW5nZVN0YXR1c1ZhbHVlOiBGaWxlQ2hhbmdlU3RhdHVzVmFsdWUsXG4gICAgKSB7XG4gICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVQYXRocykge1xuICAgICAgICBpZiAoIW1lcmdlZEZpbGVQYXRocy5oYXMoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgbWVyZ2VkU3RhdHVzLnNldChmaWxlUGF0aCwgY2hhbmdlU3RhdHVzVmFsdWUpO1xuICAgICAgICAgIG1lcmdlZEZpbGVQYXRocy5hZGQoZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICAvLyBNb3JlIHJlY2VudCByZXZpc2lvbiBjaGFuZ2VzIHRha2VzIHByaW9yaXR5IGluIHNwZWNpZnlpbmcgYSBmaWxlcycgc3RhdHVzZXMuXG4gICAgY29uc3QgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnNDaGFuZ2VzID0gcmV2aXNpb25zRmlsZUNoYW5nZXMuc2xpY2UoKS5yZXZlcnNlKCk7XG4gICAgZm9yIChjb25zdCByZXZpc2lvbkZpbGVDaGFuZ2VzIG9mIGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zQ2hhbmdlcykge1xuICAgICAgY29uc3Qge2FkZGVkLCBtb2RpZmllZCwgZGVsZXRlZH0gPSByZXZpc2lvbkZpbGVDaGFuZ2VzO1xuXG4gICAgICBtZXJnZVN0YXR1c1BhdGhzKGFkZGVkLCBGaWxlQ2hhbmdlU3RhdHVzLkFEREVEKTtcbiAgICAgIG1lcmdlU3RhdHVzUGF0aHMobW9kaWZpZWQsIEZpbGVDaGFuZ2VTdGF0dXMuTU9ESUZJRUQpO1xuICAgICAgbWVyZ2VTdGF0dXNQYXRocyhkZWxldGVkLCBGaWxlQ2hhbmdlU3RhdHVzLkRFTEVURUQpO1xuICAgIH1cblxuICAgIHJldHVybiBtZXJnZWRTdGF0dXM7XG4gIH1cblxuICBnZXREaXJ0eUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fZGlydHlGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGdldENvbXBhcmVGaWxlQ2hhbmdlcygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGFzeW5jIGZldGNoSGdEaWZmKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxIZ0RpZmZTdGF0ZT4ge1xuICAgIGNvbnN0IHtjb21wYXJlQ29tbWl0SWR9ID0gYXdhaXQgdGhpcy5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICBjb25zdCBjb21taXR0ZWRDb250ZW50c1Byb21pc2UgPSB0aGlzLl9yZXBvc2l0b3J5XG4gICAgICAuZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24oZmlsZVBhdGgsIGNvbXBhcmVDb21taXRJZCA/IGAke2NvbXBhcmVDb21taXRJZH1gIDogbnVsbClcbiAgICAgIC8vIElmIHRoZSBmaWxlIGRpZG4ndCBleGlzdCBvbiB0aGUgcHJldmlvdXMgcmV2aXNpb24sIHJldHVybiBlbXB0eSBjb250ZW50cy5cbiAgICAgIC50aGVuKGNvbnRlbnRzID0+IGNvbnRlbnRzIHx8ICcnLCBlcnIgPT4gJycpO1xuXG4gICAgY29uc3QgZmlsZXN5c3RlbUNvbnRlbnRzUHJvbWlzZSA9IGdldEZpbGVTeXN0ZW1Db250ZW50cyhmaWxlUGF0aCk7XG5cbiAgICBjb25zdCBbXG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICBdID0gYXdhaXQgUHJvbWlzZS5hbGwoW2NvbW1pdHRlZENvbnRlbnRzUHJvbWlzZSwgZmlsZXN5c3RlbUNvbnRlbnRzUHJvbWlzZV0pO1xuICAgIHJldHVybiB7XG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgc2V0UmV2aXNpb24ocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuXG4gICAgaW52YXJpYW50KFxuICAgICAgcmV2aXNpb25zICYmIHJldmlzaW9ucy5pbmRleE9mKHJldmlzaW9uKSAhPT0gLTEsXG4gICAgICAnRGlmZiBWaXcgVGltZWxpbmU6IG5vbi1hcHBsaWNhYmxlIHNlbGVjdGVkIHJldmlzaW9uJyxcbiAgICApO1xuXG4gICAgdGhpcy5fc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQgPSByZXZpc2lvbnNTdGF0ZS5jb21wYXJlQ29tbWl0SWQgPSByZXZpc2lvbi5pZDtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgcmV2aXNpb25zU3RhdGUpO1xuXG4gICAgY29uc3QgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBhd2FpdCB0aGlzLl9nZXRDYWNoZWRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShyZXZpc2lvbnNTdGF0ZSk7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gdGhpcy5fY29tcHV0ZUNvbXBhcmVDaGFuZ2VzRnJvbUhpc3RvcnkoXG4gICAgICByZXZpc2lvbnNTdGF0ZSxcbiAgICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5LFxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlRGlydHlTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChmaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPikgPT4gdm9pZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZVJldmlzaW9ucyhcbiAgICBjYWxsYmFjazogKHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSkgPT4gdm9pZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzLmNsZWFyKCk7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzLmNsZWFyKCk7XG4gICAgdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMucmVzZXQoKTtcbiAgfVxufVxuIl19