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

      var revisions = _ref.revisions;
      var commitId = _ref.commitId;
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
// because the watchman-based Mercurial updates doesn't consider or wait while rebasing.
//# sourceMappingURL=data:application/json;base64,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QztBQUM3RSxVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxjQUFjLENBQUMsQ0FBQzs7QUFFM0QsVUFBTSxvQkFBb0IsR0FBRyxNQUFNLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM3RixVQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGlDQUFpQyxDQUMvRCxjQUFjLEVBQ2Qsb0JBQW9CLENBQ3JCLENBQUM7QUFDRixVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUMzRTs7O1dBRXFCLGdDQUNwQixRQUF1RSxFQUMxRDtBQUNiLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMseUJBQXlCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDOUQ7OztXQUV1QixrQ0FDdEIsUUFBdUUsRUFDMUQ7QUFDYixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLDJCQUEyQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ2hFOzs7V0FFbUIsOEJBQ2xCLFFBQWtELEVBQ3JDO0FBQ2IsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUMzRDs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMvQixVQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDakMsVUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3ZDOzs7U0E3WGtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6IlJlcG9zaXRvcnlTdGFjay5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtGaWxlQ2hhbmdlU3RhdHVzVmFsdWUsIEhnRGlmZlN0YXRlLCBSZXZpc2lvbnNTdGF0ZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25GaWxlQ2hhbmdlc30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uSW5mb30gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtIZ1N0YXR1c1RvRmlsZUNoYW5nZVN0YXR1cywgRmlsZUNoYW5nZVN0YXR1c30gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtnZXRGaWxlU3lzdGVtQ29udGVudHN9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHthcnJheSwgcHJvbWlzZXMsIGRlYm91bmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge25vdGlmeUludGVybmFsRXJyb3J9IGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgTFJVIGZyb20gJ2xydS1jYWNoZSc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuY29uc3Qge3NlcmlhbGl6ZUFzeW5jQ2FsbH0gPSBwcm9taXNlcztcbmNvbnN0IENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCA9ICdkaWQtY2hhbmdlLWNvbXBhcmUtc3RhdHVzJztcbmNvbnN0IENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQgPSAnZGlkLWNoYW5nZS1kaXJ0eS1zdGF0dXMnO1xuY29uc3QgQ0hBTkdFX1JFVklTSU9OU19FVkVOVCA9ICdkaWQtY2hhbmdlLXJldmlzaW9ucyc7XG5jb25zdCBVUERBVEVfU1RBVFVTX0RFQk9VTkNFX01TID0gMjAwMDtcblxuY29uc3QgRkVUQ0hfUkVWX0lORk9fUkVUUllfVElNRV9NUyA9IDEwMDA7XG5jb25zdCBGRVRDSF9SRVZfSU5GT19NQVhfVFJJRVMgPSA1O1xuXG50eXBlIFJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gQXJyYXk8e1xuICBpZDogbnVtYmVyLFxuICBjaGFuZ2VzOiBSZXZpc2lvbkZpbGVDaGFuZ2VzLFxufT47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlcG9zaXRvcnlTdGFjayB7XG5cbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZGlydHlGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIF9jb21wYXJlRmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfcmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50O1xuICBfcmV2aXNpb25zU3RhdGVQcm9taXNlOiA/UHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT47XG4gIF9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2U6ID9Qcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PjtcbiAgX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeTogP1JldmlzaW9uc0ZpbGVIaXN0b3J5O1xuICBfc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQ6ID9udW1iZXI7XG4gIF9pc0FjdGl2ZTogYm9vbGVhbjtcbiAgX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXM6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIF9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlczogTFJVPG51bWJlciwgUmV2aXNpb25GaWxlQ2hhbmdlcz47XG5cbiAgY29uc3RydWN0b3IocmVwb3NpdG9yeTogSGdSZXBvc2l0b3J5Q2xpZW50KSB7XG4gICAgdGhpcy5fcmVwb3NpdG9yeSA9IHJlcG9zaXRvcnk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcyA9IG5ldyBMUlUoe21heDogMTAwfSk7XG4gICAgdGhpcy5fc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZVN0YXR1cyA9IHNlcmlhbGl6ZUFzeW5jQ2FsbCgoKSA9PiB0aGlzLl91cGRhdGVDaGFuZ2VkU3RhdHVzKCkpO1xuICAgIGNvbnN0IGRlYm91bmNlZFNlcmlhbGl6ZWRVcGRhdGVTdGF0dXMgPSBkZWJvdW5jZShcbiAgICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXMsXG4gICAgICBVUERBVEVfU1RBVFVTX0RFQk9VTkNFX01TLFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgICBkZWJvdW5jZWRTZXJpYWxpemVkVXBkYXRlU3RhdHVzKCk7XG4gICAgLy8gR2V0IHRoZSBpbml0aWFsIHByb2plY3Qgc3RhdHVzLCBpZiBpdCdzIG5vdCBhbHJlYWR5IHRoZXJlLFxuICAgIC8vIHRyaWdnZXJlZCBieSBhbm90aGVyIGludGVncmF0aW9uLCBsaWtlIHRoZSBmaWxlIHRyZWUuXG4gICAgcmVwb3NpdG9yeS5nZXRTdGF0dXNlcyhbcmVwb3NpdG9yeS5nZXRQcm9qZWN0RGlyZWN0b3J5KCldKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHJlcG9zaXRvcnkub25EaWRDaGFuZ2VTdGF0dXNlcyhkZWJvdW5jZWRTZXJpYWxpemVkVXBkYXRlU3RhdHVzKVxuICAgICk7XG4gIH1cblxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXMoKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnVwZGF0ZS1jaGFuZ2Utc3RhdHVzJylcbiAgYXN5bmMgX3VwZGF0ZUNoYW5nZWRTdGF0dXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3VwZGF0ZURpcnR5RmlsZUNoYW5nZXMoKTtcbiAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZUNvbXBhcmVGaWxlQ2hhbmdlcygpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBub3RpZnlJbnRlcm5hbEVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlRGlydHlGaWxlQ2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gdGhpcy5fZ2V0RGlydHlDaGFuZ2VkU3RhdHVzKCk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQsIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMpO1xuICB9XG5cbiAgX2dldERpcnR5Q2hhbmdlZFN0YXR1cygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgY29uc3QgZGlydHlGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBzdGF0dXNlcyA9IHRoaXMuX3JlcG9zaXRvcnkuZ2V0QWxsUGF0aFN0YXR1c2VzKCk7XG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBpbiBzdGF0dXNlcykge1xuICAgICAgY29uc3QgY2hhbmdlU3RhdHVzID0gSGdTdGF0dXNUb0ZpbGVDaGFuZ2VTdGF0dXNbc3RhdHVzZXNbZmlsZVBhdGhdXTtcbiAgICAgIGlmIChjaGFuZ2VTdGF0dXMgIT0gbnVsbCkge1xuICAgICAgICBkaXJ0eUZpbGVDaGFuZ2VzLnNldChmaWxlUGF0aCwgY2hhbmdlU3RhdHVzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRpcnR5RmlsZUNoYW5nZXM7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBmaWxlIGNoYW5nZSBzdGF0ZSBjb21wYXJpbmcgdGhlIGRpcnR5IGZpbGVzeXN0ZW0gc3RhdHVzXG4gICAqIHRvIGEgc2VsZWN0ZWQgY29tbWl0LlxuICAgKiBUaGF0IHdvdWxkIGJlIGEgbWVyZ2Ugb2YgYGhnIHN0YXR1c2Agd2l0aCB0aGUgZGlmZiBmcm9tIGNvbW1pdHMsXG4gICAqIGFuZCBgaGcgbG9nIC0tcmV2ICR7cmV2SWR9YCBmb3IgZXZlcnkgY29tbWl0LlxuICAgKi9cbiAgYXN5bmMgX3VwZGF0ZUNvbXBhcmVGaWxlQ2hhbmdlcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBXZSBzaG91bGQgb25seSB1cGRhdGUgdGhlIHJldmlzaW9uIHN0YXRlIHdoZW4gdGhlIHJlcG9zaXRvcnkgaXMgYWN0aXZlLlxuICAgIGlmICghdGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZSA9IG51bGw7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5fZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIHJldmlzaW9uc1N0YXRlKTtcblxuICAgIC8vIElmIHRoZSBjb21taXRzIGhhdmVuJ3QgY2hhbmdlZCBpZHMsIHRoZW4gdGhpZXIgZGlmZiBoYXZlbid0IGNoYW5nZWQgYXMgd2VsbC5cbiAgICBsZXQgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBudWxsO1xuICAgIGlmICh0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgIT0gbnVsbCkge1xuICAgICAgY29uc3QgZmlsZUhpc3RvcnlSZXZpc2lvbklkcyA9IHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeVxuICAgICAgICAubWFwKHJldmlzaW9uQ2hhbmdlcyA9PiByZXZpc2lvbkNoYW5nZXMuaWQpO1xuICAgICAgY29uc3QgcmV2aXNpb25JZHMgPSByZXZpc2lvbnNTdGF0ZS5yZXZpc2lvbnMubWFwKHJldmlzaW9uID0+IHJldmlzaW9uLmlkKTtcbiAgICAgIGlmIChhcnJheS5lcXVhbChyZXZpc2lvbklkcywgZmlsZUhpc3RvcnlSZXZpc2lvbklkcykpIHtcbiAgICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3Rvcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRmV0Y2ggcmV2aXNpb25zIGhpc3RvcnkgaWYgcmV2aXNpb25zIHN0YXRlIGhhdmUgY2hhbmdlZC5cbiAgICBpZiAocmV2aXNpb25zRmlsZUhpc3RvcnkgPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBhd2FpdCB0aGlzLl9nZXRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShyZXZpc2lvbnNTdGF0ZSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgICAgJ0Nhbm5vdCBmZXRjaCByZXZpc2lvbiBoaXN0b3J5OiAnICtcbiAgICAgICAgICAnKGNvdWxkIGhhcHBlbiB3aXRoIHBlbmRpbmcgc291cmNlLWNvbnRyb2wgaGlzdG9yeSB3cml0aW5nIG9wZXJhdGlvbnMpJyxcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMgPSB0aGlzLl9jb21wdXRlQ29tcGFyZUNoYW5nZXNGcm9tSGlzdG9yeShcbiAgICAgIHJldmlzaW9uc1N0YXRlLFxuICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnksXG4gICAgKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5ULCB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMpO1xuICB9XG5cbiAgX2dldFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpOiBQcm9taXNlPFJldmlzaW9uc1N0YXRlPiB7XG4gICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gdGhpcy5fZmV0Y2hSZXZpc2lvbnNTdGF0ZSgpLnRoZW4oXG4gICAgICB0aGlzLl9hbWVuZFNlbGVjdGVkQ29tcGFyZUNvbW1pdElkLmJpbmQodGhpcyksXG4gICAgICBlcnJvciA9PiB7XG4gICAgICAgIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZSA9IG51bGw7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSxcbiAgICApO1xuICAgIHJldHVybiB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2U7XG4gIH1cblxuICBnZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTogUHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT4ge1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlUHJvbWlzZSA9IHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZTtcbiAgICBpZiAocmV2aXNpb25zU3RhdGVQcm9taXNlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiByZXZpc2lvbnNTdGF0ZVByb21pc2UudGhlbih0aGlzLl9hbWVuZFNlbGVjdGVkQ29tcGFyZUNvbW1pdElkLmJpbmQodGhpcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFtZW5kIHRoZSByZXZpc2lvbnMgc3RhdGUgd2l0aCB0aGUgbGF0ZXN0IHNlbGVjdGVkIHZhbGlkIGNvbXBhcmUgY29tbWl0IGlkLlxuICAgKi9cbiAgX2FtZW5kU2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQocmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlKTogUmV2aXNpb25zU3RhdGUge1xuICAgIGNvbnN0IHtjb21taXRJZCwgcmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIC8vIFByaW9yaXRpemUgdGhlIGNhY2hlZCBjb21wYWVyZUNvbW1pdElkLCBpZiBpdCBleGlzdHMuXG4gICAgLy8gVGhlIHVzZXIgY291bGQgaGF2ZSBzZWxlY3RlZCB0aGF0IGZyb20gdGhlIHRpbWVsaW5lIHZpZXcuXG4gICAgbGV0IGNvbXBhcmVDb21taXRJZCA9IHRoaXMuX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkO1xuICAgIGlmICghYXJyYXkuZmluZChyZXZpc2lvbnMsIHJldmlzaW9uID0+IHJldmlzaW9uLmlkID09PSBjb21wYXJlQ29tbWl0SWQpKSB7XG4gICAgICAvLyBJbnZhbGlkYXRlIGlmIHRoZXJlIHRoZXJlIGlzIG5vIGxvbmdlciBhIHJldmlzaW9uIHdpdGggdGhhdCBpZC5cbiAgICAgIGNvbXBhcmVDb21taXRJZCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zID0gcmV2aXNpb25zLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIGlmIChjb21wYXJlQ29tbWl0SWQgPT0gbnVsbCAmJiBsYXRlc3RUb09sZGVzdFJldmlzaW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBJZiB0aGUgdXNlciBoYXMgYWxyZWFkeSBjb21taXR0ZWQsIG1vc3Qgb2YgdGhlIHRpbWVzLCBoZSdkIGJlIHdvcmtpbmcgb24gYW4gYW1lbmQuXG4gICAgICAvLyBTbywgdGhlIGhldXJpc3RpYyBoZXJlIGlzIHRvIGNvbXBhcmUgYWdhaW5zdCB0aGUgcHJldmlvdXMgdmVyc2lvbixcbiAgICAgIC8vIG5vdCB0aGUganVzdC1jb21taXR0ZWQgb25lLCB3aGlsZSB0aGUgcmV2aXNpb25zIHRpbWVsaW5lXG4gICAgICAvLyB3b3VsZCBnaXZlIGEgd2F5IHRvIHNwZWNpZnkgb3RoZXJ3aXNlLlxuICAgICAgY29tcGFyZUNvbW1pdElkID0gbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnNbMV0uaWQ7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXZpc2lvbnMsXG4gICAgICBjb21taXRJZCxcbiAgICAgIGNvbXBhcmVDb21taXRJZCxcbiAgICB9O1xuICB9XG5cbiAgX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgKTogUHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT4ge1xuICAgIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZSA9IHRoaXMuX2ZldGNoUmV2aXNpb25zRmlsZUhpc3RvcnkocmV2aXNpb25zU3RhdGUpXG4gICAgICAudGhlbihyZXZpc2lvbnNGaWxlSGlzdG9yeSA9PlxuICAgICAgICB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgPSByZXZpc2lvbnNGaWxlSGlzdG9yeVxuICAgICAgLCBlcnJvciA9PiB7XG4gICAgICAgIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZTtcbiAgfVxuXG4gIF9nZXRDYWNoZWRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICk6IFByb21pc2U8UmV2aXNpb25zRmlsZUhpc3Rvcnk+IHtcbiAgICBpZiAodGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShyZXZpc2lvbnNTdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmV0Y2gtcmV2aXNpb25zLXN0YXRlJylcbiAgYXN5bmMgX2ZldGNoUmV2aXNpb25zU3RhdGUoKTogUHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT4ge1xuICAgIC8vIFdoaWxlIHJlYmFzaW5nLCB0aGUgY29tbW9uIGFuY2VzdG9yIG9mIGBIRUFEYCBhbmQgYEJBU0VgXG4gICAgLy8gbWF5IGJlIG5vdCBhcHBsaWNhYmxlLCBidXQgdGhhdCdzIGRlZmluZWQgb25jZSB0aGUgcmViYXNlIGlzIGRvbmUuXG4gICAgLy8gSGVuY2UsIHdlIG5lZWQgdG8gcmV0cnkgZmV0Y2hpbmcgdGhlIHJldmlzaW9uIGluZm8gKGRlcGVuZGluZyBvbiB0aGUgY29tbW9uIGFuY2VzdG9yKVxuICAgIC8vIGJlY2F1c2UgdGhlIHdhdGNobWFuLWJhc2VkIE1lcmN1cmlhbCB1cGRhdGVzIGRvZXNuJ3QgY29uc2lkZXIgb3Igd2FpdCB3aGlsZSByZWJhc2luZy5cbiAgICBjb25zdCByZXZpc2lvbnM6ID9BcnJheTxSZXZpc2lvbkluZm8+ID0gYXdhaXQgcHJvbWlzZXMucmV0cnlMaW1pdChcbiAgICAgICgpID0+IHRoaXMuX3JlcG9zaXRvcnkuZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuSGVhZEFuZEJhc2UoKSxcbiAgICAgIHJlc3VsdCA9PiByZXN1bHQgIT0gbnVsbCxcbiAgICAgIEZFVENIX1JFVl9JTkZPX01BWF9UUklFUyxcbiAgICAgIEZFVENIX1JFVl9JTkZPX1JFVFJZX1RJTUVfTVMsXG4gICAgKTtcbiAgICBpZiAocmV2aXNpb25zID09IG51bGwgfHwgcmV2aXNpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmV0Y2ggcmV2aXNpb24gaW5mbyBuZWVkZWQhJyk7XG4gICAgfVxuICAgIGNvbnN0IGNvbW1pdElkID0gcmV2aXNpb25zW3JldmlzaW9ucy5sZW5ndGggLSAxXS5pZDtcbiAgICByZXR1cm4ge1xuICAgICAgcmV2aXNpb25zLFxuICAgICAgY29tbWl0SWQsXG4gICAgICBjb21wYXJlQ29tbWl0SWQ6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmZldGNoLXJldmlzaW9ucy1jaGFuZ2UtaGlzdG9yeScpXG4gIGFzeW5jIF9mZXRjaFJldmlzaW9uc0ZpbGVIaXN0b3J5KHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSk6IFByb21pc2U8UmV2aXNpb25zRmlsZUhpc3Rvcnk+IHtcbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuXG4gICAgLy8gUmV2aXNpb24gaWRzIGFyZSB1bmlxdWUgYW5kIGRvbid0IGNoYW5nZSwgZXhjZXB0IHdoZW4gdGhlIHJldmlzaW9uIGlzIGFtZW5kZWQvcmViYXNlZC5cbiAgICAvLyBIZW5jZSwgaXQncyBjYWNoZWQgaGVyZSB0byBhdm9pZCBzZXJ2aWNlIGNhbGxzIHdoZW4gd29ya2luZyBvbiBhIHN0YWNrIG9mIGNvbW1pdHMuXG4gICAgY29uc3QgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBhd2FpdCBQcm9taXNlLmFsbChyZXZpc2lvbnNcbiAgICAgIC5tYXAoYXN5bmMgcmV2aXNpb24gPT4ge1xuICAgICAgICBjb25zdCB7aWR9ID0gcmV2aXNpb247XG4gICAgICAgIGxldCBjaGFuZ2VzID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLmhhcyhpZCkpIHtcbiAgICAgICAgICBjaGFuZ2VzID0gdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMuZ2V0KGlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaGFuZ2VzID0gYXdhaXQgdGhpcy5fcmVwb3NpdG9yeS5mZXRjaEZpbGVzQ2hhbmdlZEF0UmV2aXNpb24oYCR7aWR9YCk7XG4gICAgICAgICAgaWYgKGNoYW5nZXMgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDaGFuZ2VzIG5vdCBhdmFpbGFibGUgZm9yIHJldmlzaW9uOiAke2lkfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5zZXQoaWQsIGNoYW5nZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7aWQsIGNoYW5nZXN9O1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgcmV0dXJuIHJldmlzaW9uc0ZpbGVIaXN0b3J5O1xuICB9XG5cbiAgX2NvbXB1dGVDb21wYXJlQ2hhbmdlc0Zyb21IaXN0b3J5KFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgICByZXZpc2lvbnNGaWxlSGlzdG9yeTogUmV2aXNpb25zRmlsZUhpc3RvcnksXG4gICk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcblxuICAgIGNvbnN0IHtjb21taXRJZCwgY29tcGFyZUNvbW1pdElkfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIC8vIFRoZSBzdGF0dXMgaXMgZmV0Y2hlZCBieSBtZXJnaW5nIHRoZSBjaGFuZ2VzIHJpZ2h0IGFmdGVyIHRoZSBgY29tcGFyZUNvbW1pdElkYCBpZiBzcGVjaWZpZWQsXG4gICAgLy8gb3IgYEhFQURgIGlmIG5vdC5cbiAgICBjb25zdCBzdGFydENvbW1pdElkID0gY29tcGFyZUNvbW1pdElkID8gKGNvbXBhcmVDb21taXRJZCArIDEpIDogY29tbWl0SWQ7XG4gICAgLy8gR2V0IHRoZSByZXZpc2lvbiBjaGFuZ2VzIHRoYXQncyBuZXdlciB0aGFuIG9yIGlzIHRoZSBjdXJyZW50IGNvbW1pdCBpZC5cbiAgICBjb25zdCBjb21wYXJlUmV2aXNpb25zRmlsZUNoYW5nZXMgPSByZXZpc2lvbnNGaWxlSGlzdG9yeVxuICAgICAgLnNsaWNlKDEpIC8vIEV4Y2x1ZGUgdGhlIEJBU0UgcmV2aXNpb24uXG4gICAgICAuZmlsdGVyKHJldmlzaW9uID0+IHJldmlzaW9uLmlkID49IHN0YXJ0Q29tbWl0SWQpXG4gICAgICAubWFwKHJldmlzaW9uID0+IHJldmlzaW9uLmNoYW5nZXMpO1xuXG4gICAgLy8gVGhlIGxhc3Qgc3RhdHVzIHRvIG1lcmdlIGlzIHRoZSBkaXJ0eSBmaWxlc3lzdGVtIHN0YXR1cy5cbiAgICBjb25zdCBtZXJnZWRGaWxlU3RhdHVzZXMgPSB0aGlzLl9tZXJnZUZpbGVTdGF0dXNlcyhcbiAgICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMsXG4gICAgICBjb21wYXJlUmV2aXNpb25zRmlsZUNoYW5nZXMsXG4gICAgKTtcbiAgICByZXR1cm4gbWVyZ2VkRmlsZVN0YXR1c2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlcyB0aGUgZmlsZSBjaGFuZ2Ugc3RhdHVzZXMgb2YgdGhlIGRpcnR5IGZpbGVzeXN0ZW0gc3RhdGUgd2l0aFxuICAgKiB0aGUgcmV2aXNpb24gY2hhbmdlcywgd2hlcmUgZGlydHkgY2hhbmdlcyBhbmQgbW9yZSByZWNlbnQgcmV2aXNpb25zXG4gICAqIHRha2UgcHJpb3JpdHkgaW4gZGVjaWRpbmcgd2hpY2ggc3RhdHVzIGEgZmlsZSBpcyBpbi5cbiAgICovXG4gIF9tZXJnZUZpbGVTdGF0dXNlcyhcbiAgICBkaXJ0eVN0YXR1czogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4sXG4gICAgcmV2aXNpb25zRmlsZUNoYW5nZXM6IEFycmF5PFJldmlzaW9uRmlsZUNoYW5nZXM+LFxuICApOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgY29uc3QgbWVyZ2VkU3RhdHVzID0gbmV3IE1hcChkaXJ0eVN0YXR1cyk7XG4gICAgY29uc3QgbWVyZ2VkRmlsZVBhdGhzID0gbmV3IFNldChtZXJnZWRTdGF0dXMua2V5cygpKTtcblxuICAgIGZ1bmN0aW9uIG1lcmdlU3RhdHVzUGF0aHMoXG4gICAgICBmaWxlUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+LFxuICAgICAgY2hhbmdlU3RhdHVzVmFsdWU6IEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSxcbiAgICApIHtcbiAgICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgZmlsZVBhdGhzKSB7XG4gICAgICAgIGlmICghbWVyZ2VkRmlsZVBhdGhzLmhhcyhmaWxlUGF0aCkpIHtcbiAgICAgICAgICBtZXJnZWRTdGF0dXMuc2V0KGZpbGVQYXRoLCBjaGFuZ2VTdGF0dXNWYWx1ZSk7XG4gICAgICAgICAgbWVyZ2VkRmlsZVBhdGhzLmFkZChmaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH1cblxuICAgIC8vIE1vcmUgcmVjZW50IHJldmlzaW9uIGNoYW5nZXMgdGFrZXMgcHJpb3JpdHkgaW4gc3BlY2lmeWluZyBhIGZpbGVzJyBzdGF0dXNlcy5cbiAgICBjb25zdCBsYXRlc3RUb09sZGVzdFJldmlzaW9uc0NoYW5nZXMgPSByZXZpc2lvbnNGaWxlQ2hhbmdlcy5zbGljZSgpLnJldmVyc2UoKTtcbiAgICBmb3IgKGNvbnN0IHJldmlzaW9uRmlsZUNoYW5nZXMgb2YgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnNDaGFuZ2VzKSB7XG4gICAgICBjb25zdCB7YWRkZWQsIG1vZGlmaWVkLCBkZWxldGVkfSA9IHJldmlzaW9uRmlsZUNoYW5nZXM7XG5cbiAgICAgIG1lcmdlU3RhdHVzUGF0aHMoYWRkZWQsIEZpbGVDaGFuZ2VTdGF0dXMuQURERUQpO1xuICAgICAgbWVyZ2VTdGF0dXNQYXRocyhtb2RpZmllZCwgRmlsZUNoYW5nZVN0YXR1cy5NT0RJRklFRCk7XG4gICAgICBtZXJnZVN0YXR1c1BhdGhzKGRlbGV0ZWQsIEZpbGVDaGFuZ2VTdGF0dXMuREVMRVRFRCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lcmdlZFN0YXR1cztcbiAgfVxuXG4gIGdldERpcnR5RmlsZUNoYW5nZXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIHJldHVybiB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgZ2V0Q29tcGFyZUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgYXN5bmMgZmV0Y2hIZ0RpZmYoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPEhnRGlmZlN0YXRlPiB7XG4gICAgY29uc3Qge3JldmlzaW9ucywgY29tbWl0SWQsIGNvbXBhcmVDb21taXRJZH0gPSBhd2FpdCB0aGlzLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIGNvbnN0IGNvbW1pdHRlZENvbnRlbnRzID0gYXdhaXQgdGhpcy5fcmVwb3NpdG9yeVxuICAgICAgLmZldGNoRmlsZUNvbnRlbnRBdFJldmlzaW9uKGZpbGVQYXRoLCBjb21wYXJlQ29tbWl0SWQgPyBgJHtjb21wYXJlQ29tbWl0SWR9YCA6IG51bGwpXG4gICAgICAvLyBJZiB0aGUgZmlsZSBkaWRuJ3QgZXhpc3Qgb24gdGhlIHByZXZpb3VzIHJldmlzaW9uLCByZXR1cm4gZW1wdHkgY29udGVudHMuXG4gICAgICAudGhlbihjb250ZW50cyA9PiBjb250ZW50cyB8fCAnJywgZXJyID0+ICcnKTtcblxuICAgIC8vIEludGVudGlvbmFsbHkgZmV0Y2ggdGhlIGZpbGVzeXN0ZW0gY29udGVudHMgYWZ0ZXIgZ2V0dGluZyB0aGUgY29tbWl0dGVkIGNvbnRlbnRzXG4gICAgLy8gdG8gbWFrZSBzdXJlIHdlIGhhdmUgdGhlIGxhdGVzdCBmaWxlc3lzdGVtIHZlcnNpb24uXG4gICAgY29uc3QgZmlsZXN5c3RlbUNvbnRlbnRzID0gYXdhaXQgZ2V0RmlsZVN5c3RlbUNvbnRlbnRzKGZpbGVQYXRoKTtcblxuICAgIGNvbnN0IGZldGNoZWRSZXZpc2lvbklkID0gY29tcGFyZUNvbW1pdElkICE9IG51bGwgPyBjb21wYXJlQ29tbWl0SWQgOiBjb21taXRJZDtcbiAgICBjb25zdCBbcmV2aXNpb25JbmZvXSA9IHJldmlzaW9ucy5maWx0ZXIocmV2aXNpb24gPT4gcmV2aXNpb24uaWQgPT09IGZldGNoZWRSZXZpc2lvbklkKTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgICBgRGlmZiBWaXcgRmV0Y2hlcjogcmV2aXNpb24gd2l0aCBpZCAke2ZldGNoZWRSZXZpc2lvbklkfSBub3QgZm91bmRgLFxuICAgICk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgIH07XG4gIH1cblxuICBhc3luYyBzZXRSZXZpc2lvbihyZXZpc2lvbjogUmV2aXNpb25JbmZvKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCB0aGlzLmdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIGNvbnN0IHtyZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG5cbiAgICBpbnZhcmlhbnQoXG4gICAgICByZXZpc2lvbnMgJiYgcmV2aXNpb25zLmluZGV4T2YocmV2aXNpb24pICE9PSAtMSxcbiAgICAgICdEaWZmIFZpdyBUaW1lbGluZTogbm9uLWFwcGxpY2FibGUgc2VsZWN0ZWQgcmV2aXNpb24nLFxuICAgICk7XG5cbiAgICB0aGlzLl9zZWxlY3RlZENvbXBhcmVDb21taXRJZCA9IHJldmlzaW9uc1N0YXRlLmNvbXBhcmVDb21taXRJZCA9IHJldmlzaW9uLmlkO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG5cbiAgICBjb25zdCByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IGF3YWl0IHRoaXMuX2dldENhY2hlZFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKHJldmlzaW9uc1N0YXRlKTtcbiAgICB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMgPSB0aGlzLl9jb21wdXRlQ29tcGFyZUNoYW5nZXNGcm9tSGlzdG9yeShcbiAgICAgIHJldmlzaW9uc1N0YXRlLFxuICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnksXG4gICAgKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5ULCB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMpO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VEaXJ0eVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPikgPT4gdm9pZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX0RJUlRZX1NUQVRVU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VDb21wYXJlU3RhdHVzKFxuICAgIGNhbGxiYWNrOiAoZmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+KSA9PiB2b2lkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlUmV2aXNpb25zKFxuICAgIGNhbGxiYWNrOiAocmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlKSA9PiB2b2lkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMuY2xlYXIoKTtcbiAgICB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMuY2xlYXIoKTtcbiAgICB0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5yZXNldCgpO1xuICB9XG59XG4iXX0=