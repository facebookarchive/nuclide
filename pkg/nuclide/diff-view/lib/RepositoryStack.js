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
    key: '_updateCompareFileChanges',
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
      this._compareFileChanges = this._computeCompareChangesFromHistory(revisionsState, revisionsFileHistory);
      this._emitter.emit(CHANGE_COMPARE_STATUS_EVENT, this._compareFileChanges);
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
//# sourceMappingURL=data:application/json;base64,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VUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQy9CLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNqQyxVQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDdkM7OztTQXpZa0IsZUFBZTs7O3FCQUFmLGVBQWUiLCJmaWxlIjoiUmVwb3NpdG9yeVN0YWNrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeUNsaWVudH0gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1jbGllbnQnO1xuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSwgSGdEaWZmU3RhdGUsIFJldmlzaW9uc1N0YXRlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkZpbGVDaGFuZ2VzLCBSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7SGdTdGF0dXNUb0ZpbGVDaGFuZ2VTdGF0dXMsIEZpbGVDaGFuZ2VTdGF0dXN9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Z2V0RmlsZVN5c3RlbUNvbnRlbnRzfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7YXJyYXksIHByb21pc2VzLCBkZWJvdW5jZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtub3RpZnlJbnRlcm5hbEVycm9yfSBmcm9tICcuL25vdGlmaWNhdGlvbnMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IExSVSBmcm9tICdscnUtY2FjaGUnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcbmNvbnN0IHtzZXJpYWxpemVBc3luY0NhbGx9ID0gcHJvbWlzZXM7XG5jb25zdCBDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQgPSAnZGlkLWNoYW5nZS1jb21wYXJlLXN0YXR1cyc7XG5jb25zdCBDSEFOR0VfRElSVFlfU1RBVFVTX0VWRU5UID0gJ2RpZC1jaGFuZ2UtZGlydHktc3RhdHVzJztcbmNvbnN0IENIQU5HRV9SRVZJU0lPTlNfRVZFTlQgPSAnZGlkLWNoYW5nZS1yZXZpc2lvbnMnO1xuY29uc3QgVVBEQVRFX1NUQVRVU19ERUJPVU5DRV9NUyA9IDIwMDA7XG5cbmNvbnN0IEZFVENIX1JFVl9JTkZPX1JFVFJZX1RJTUVfTVMgPSAxMDAwO1xuY29uc3QgRkVUQ0hfUkVWX0lORk9fTUFYX1RSSUVTID0gNTtcblxudHlwZSBSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IEFycmF5PHtcbiAgaWQ6IG51bWJlcjtcbiAgY2hhbmdlczogUmV2aXNpb25GaWxlQ2hhbmdlcztcbn0+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXBvc2l0b3J5U3RhY2sge1xuXG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2RpcnR5RmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfY29tcGFyZUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgX3JlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudDtcbiAgX3JldmlzaW9uc1N0YXRlUHJvbWlzZTogP1Byb21pc2U8UmV2aXNpb25zU3RhdGU+O1xuICBfcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlOiA/UHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT47XG4gIF9sYXN0UmV2aXNpb25zRmlsZUhpc3Rvcnk6ID9SZXZpc2lvbnNGaWxlSGlzdG9yeTtcbiAgX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkOiA/bnVtYmVyO1xuICBfaXNBY3RpdmU6IGJvb2xlYW47XG4gIF9zZXJpYWxpemVkVXBkYXRlU3RhdHVzOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBfcmV2aXNpb25JZFRvRmlsZUNoYW5nZXM6IExSVTxudW1iZXIsIFJldmlzaW9uRmlsZUNoYW5nZXM+O1xuXG4gIGNvbnN0cnVjdG9yKHJlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudCkge1xuICAgIHRoaXMuX3JlcG9zaXRvcnkgPSByZXBvc2l0b3J5O1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMgPSBuZXcgTFJVKHttYXg6IDEwMH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgPSBudWxsO1xuICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXMgPSBzZXJpYWxpemVBc3luY0NhbGwoKCkgPT4gdGhpcy5fdXBkYXRlQ2hhbmdlZFN0YXR1cygpKTtcbiAgICBjb25zdCBkZWJvdW5jZWRTZXJpYWxpemVkVXBkYXRlU3RhdHVzID0gZGVib3VuY2UoXG4gICAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlU3RhdHVzLFxuICAgICAgVVBEQVRFX1NUQVRVU19ERUJPVU5DRV9NUyxcbiAgICAgIGZhbHNlLFxuICAgICk7XG4gICAgZGVib3VuY2VkU2VyaWFsaXplZFVwZGF0ZVN0YXR1cygpO1xuICAgIC8vIEdldCB0aGUgaW5pdGlhbCBwcm9qZWN0IHN0YXR1cywgaWYgaXQncyBub3QgYWxyZWFkeSB0aGVyZSxcbiAgICAvLyB0cmlnZ2VyZWQgYnkgYW5vdGhlciBpbnRlZ3JhdGlvbiwgbGlrZSB0aGUgZmlsZSB0cmVlLlxuICAgIHJlcG9zaXRvcnkuZ2V0U3RhdHVzZXMoW3JlcG9zaXRvcnkuZ2V0UHJvamVjdERpcmVjdG9yeSgpXSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICByZXBvc2l0b3J5Lm9uRGlkQ2hhbmdlU3RhdHVzZXMoZGVib3VuY2VkU2VyaWFsaXplZFVwZGF0ZVN0YXR1cyksXG4gICAgKTtcbiAgfVxuXG4gIGFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XG4gICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZVN0YXR1cygpO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcudXBkYXRlLWNoYW5nZS1zdGF0dXMnKVxuICBhc3luYyBfdXBkYXRlQ2hhbmdlZFN0YXR1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fdXBkYXRlRGlydHlGaWxlQ2hhbmdlcygpO1xuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlQ29tcGFyZUZpbGVDaGFuZ2VzKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5vdGlmeUludGVybmFsRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVEaXJ0eUZpbGVDaGFuZ2VzKCk6IHZvaWQge1xuICAgIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMgPSB0aGlzLl9nZXREaXJ0eUNoYW5nZWRTdGF0dXMoKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX0RJUlRZX1NUQVRVU19FVkVOVCwgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBfZ2V0RGlydHlDaGFuZ2VkU3RhdHVzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICBjb25zdCBkaXJ0eUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IHN0YXR1c2VzID0gdGhpcy5fcmVwb3NpdG9yeS5nZXRBbGxQYXRoU3RhdHVzZXMoKTtcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIGluIHN0YXR1c2VzKSB7XG4gICAgICBjb25zdCBjaGFuZ2VTdGF0dXMgPSBIZ1N0YXR1c1RvRmlsZUNoYW5nZVN0YXR1c1tzdGF0dXNlc1tmaWxlUGF0aF1dO1xuICAgICAgaWYgKGNoYW5nZVN0YXR1cyAhPSBudWxsKSB7XG4gICAgICAgIGRpcnR5RmlsZUNoYW5nZXMuc2V0KGZpbGVQYXRoLCBjaGFuZ2VTdGF0dXMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGlydHlGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGNvbW1pdChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yeS5jb21taXQobWVzc2FnZSk7XG4gIH1cblxuICBhbWVuZChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yeS5hbWVuZChtZXNzYWdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGZpbGUgY2hhbmdlIHN0YXRlIGNvbXBhcmluZyB0aGUgZGlydHkgZmlsZXN5c3RlbSBzdGF0dXNcbiAgICogdG8gYSBzZWxlY3RlZCBjb21taXQuXG4gICAqIFRoYXQgd291bGQgYmUgYSBtZXJnZSBvZiBgaGcgc3RhdHVzYCB3aXRoIHRoZSBkaWZmIGZyb20gY29tbWl0cyxcbiAgICogYW5kIGBoZyBsb2cgLS1yZXYgJHtyZXZJZH1gIGZvciBldmVyeSBjb21taXQuXG4gICAqL1xuICBhc3luYyBfdXBkYXRlQ29tcGFyZUZpbGVDaGFuZ2VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFdlIHNob3VsZCBvbmx5IHVwZGF0ZSB0aGUgcmV2aXNpb24gc3RhdGUgd2hlbiB0aGUgcmVwb3NpdG9yeSBpcyBhY3RpdmUuXG4gICAgaWYgKCF0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGUgPSBhd2FpdCB0aGlzLmdldFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG5cbiAgICAvLyBJZiB0aGUgY29tbWl0cyBoYXZlbid0IGNoYW5nZWQgaWRzLCB0aGVuIHRoaWVyIGRpZmYgaGF2ZW4ndCBjaGFuZ2VkIGFzIHdlbGwuXG4gICAgbGV0IHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gbnVsbDtcbiAgICBpZiAodGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5ICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGZpbGVIaXN0b3J5UmV2aXNpb25JZHMgPSB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnlcbiAgICAgICAgLm1hcChyZXZpc2lvbkNoYW5nZXMgPT4gcmV2aXNpb25DaGFuZ2VzLmlkKTtcbiAgICAgIGNvbnN0IHJldmlzaW9uSWRzID0gcmV2aXNpb25zU3RhdGUucmV2aXNpb25zLm1hcChyZXZpc2lvbiA9PiByZXZpc2lvbi5pZCk7XG4gICAgICBpZiAoYXJyYXkuZXF1YWwocmV2aXNpb25JZHMsIGZpbGVIaXN0b3J5UmV2aXNpb25JZHMpKSB7XG4gICAgICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZldGNoIHJldmlzaW9ucyBoaXN0b3J5IGlmIHJldmlzaW9ucyBzdGF0ZSBoYXZlIGNoYW5nZWQuXG4gICAgaWYgKHJldmlzaW9uc0ZpbGVIaXN0b3J5ID09IG51bGwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gYXdhaXQgdGhpcy5fZ2V0UmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UocmV2aXNpb25zU3RhdGUpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICAgICdDYW5ub3QgZmV0Y2ggcmV2aXNpb24gaGlzdG9yeTogJyArXG4gICAgICAgICAgJyhjb3VsZCBoYXBwZW4gd2l0aCBwZW5kaW5nIHNvdXJjZS1jb250cm9sIGhpc3Rvcnkgd3JpdGluZyBvcGVyYXRpb25zKScsXG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gdGhpcy5fY29tcHV0ZUNvbXBhcmVDaGFuZ2VzRnJvbUhpc3RvcnkoXG4gICAgICByZXZpc2lvbnNTdGF0ZSxcbiAgICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5LFxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIGdldFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpOiBQcm9taXNlPFJldmlzaW9uc1N0YXRlPiB7XG4gICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gdGhpcy5fZmV0Y2hSZXZpc2lvbnNTdGF0ZSgpLnRoZW4oXG4gICAgICB0aGlzLl9hbWVuZFNlbGVjdGVkQ29tcGFyZUNvbW1pdElkLmJpbmQodGhpcyksXG4gICAgICBlcnJvciA9PiB7XG4gICAgICAgIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZSA9IG51bGw7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSxcbiAgICApO1xuICAgIHJldHVybiB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2U7XG4gIH1cblxuICBnZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTogUHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT4ge1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlUHJvbWlzZSA9IHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZTtcbiAgICBpZiAocmV2aXNpb25zU3RhdGVQcm9taXNlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiByZXZpc2lvbnNTdGF0ZVByb21pc2UudGhlbih0aGlzLl9hbWVuZFNlbGVjdGVkQ29tcGFyZUNvbW1pdElkLmJpbmQodGhpcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW1lbmQgdGhlIHJldmlzaW9ucyBzdGF0ZSB3aXRoIHRoZSBsYXRlc3Qgc2VsZWN0ZWQgdmFsaWQgY29tcGFyZSBjb21taXQgaWQuXG4gICAqL1xuICBfYW1lbmRTZWxlY3RlZENvbXBhcmVDb21taXRJZChyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpOiBSZXZpc2lvbnNTdGF0ZSB7XG4gICAgY29uc3Qge2NvbW1pdElkLCByZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG4gICAgLy8gUHJpb3JpdGl6ZSB0aGUgY2FjaGVkIGNvbXBhZXJlQ29tbWl0SWQsIGlmIGl0IGV4aXN0cy5cbiAgICAvLyBUaGUgdXNlciBjb3VsZCBoYXZlIHNlbGVjdGVkIHRoYXQgZnJvbSB0aGUgdGltZWxpbmUgdmlldy5cbiAgICBsZXQgY29tcGFyZUNvbW1pdElkID0gdGhpcy5fc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQ7XG4gICAgaWYgKCFhcnJheS5maW5kKHJldmlzaW9ucywgcmV2aXNpb24gPT4gcmV2aXNpb24uaWQgPT09IGNvbXBhcmVDb21taXRJZCkpIHtcbiAgICAgIC8vIEludmFsaWRhdGUgaWYgdGhlcmUgdGhlcmUgaXMgbm8gbG9uZ2VyIGEgcmV2aXNpb24gd2l0aCB0aGF0IGlkLlxuICAgICAgY29tcGFyZUNvbW1pdElkID0gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMgPSByZXZpc2lvbnMuc2xpY2UoKS5yZXZlcnNlKCk7XG4gICAgaWYgKGNvbXBhcmVDb21taXRJZCA9PSBudWxsICYmIGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgIC8vIElmIHRoZSB1c2VyIGhhcyBhbHJlYWR5IGNvbW1pdHRlZCwgbW9zdCBvZiB0aGUgdGltZXMsIGhlJ2QgYmUgd29ya2luZyBvbiBhbiBhbWVuZC5cbiAgICAgIC8vIFNvLCB0aGUgaGV1cmlzdGljIGhlcmUgaXMgdG8gY29tcGFyZSBhZ2FpbnN0IHRoZSBwcmV2aW91cyB2ZXJzaW9uLFxuICAgICAgLy8gbm90IHRoZSBqdXN0LWNvbW1pdHRlZCBvbmUsIHdoaWxlIHRoZSByZXZpc2lvbnMgdGltZWxpbmVcbiAgICAgIC8vIHdvdWxkIGdpdmUgYSB3YXkgdG8gc3BlY2lmeSBvdGhlcndpc2UuXG4gICAgICBjb21wYXJlQ29tbWl0SWQgPSBsYXRlc3RUb09sZGVzdFJldmlzaW9uc1sxXS5pZDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHJldmlzaW9ucyxcbiAgICAgIGNvbW1pdElkLFxuICAgICAgY29tcGFyZUNvbW1pdElkLFxuICAgIH07XG4gIH1cblxuICBfZ2V0UmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UoXG4gICAgcmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlLFxuICApOiBQcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PiB7XG4gICAgdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlID0gdGhpcy5fZmV0Y2hSZXZpc2lvbnNGaWxlSGlzdG9yeShyZXZpc2lvbnNTdGF0ZSlcbiAgICAgIC50aGVuKHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0+XG4gICAgICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IHJldmlzaW9uc0ZpbGVIaXN0b3J5XG4gICAgICAsIGVycm9yID0+IHtcbiAgICAgICAgdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gbnVsbDtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlO1xuICB9XG5cbiAgX2dldENhY2hlZFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgKTogUHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT4ge1xuICAgIGlmICh0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2UgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKHJldmlzaW9uc1N0YXRlKTtcbiAgICB9XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5mZXRjaC1yZXZpc2lvbnMtc3RhdGUnKVxuICBhc3luYyBfZmV0Y2hSZXZpc2lvbnNTdGF0ZSgpOiBQcm9taXNlPFJldmlzaW9uc1N0YXRlPiB7XG4gICAgLy8gV2hpbGUgcmViYXNpbmcsIHRoZSBjb21tb24gYW5jZXN0b3Igb2YgYEhFQURgIGFuZCBgQkFTRWBcbiAgICAvLyBtYXkgYmUgbm90IGFwcGxpY2FibGUsIGJ1dCB0aGF0J3MgZGVmaW5lZCBvbmNlIHRoZSByZWJhc2UgaXMgZG9uZS5cbiAgICAvLyBIZW5jZSwgd2UgbmVlZCB0byByZXRyeSBmZXRjaGluZyB0aGUgcmV2aXNpb24gaW5mbyAoZGVwZW5kaW5nIG9uIHRoZSBjb21tb24gYW5jZXN0b3IpXG4gICAgLy8gYmVjYXVzZSB0aGUgd2F0Y2htYW4tYmFzZWQgTWVyY3VyaWFsIHVwZGF0ZXMgZG9lc24ndCBjb25zaWRlciBvciB3YWl0IHdoaWxlIHJlYmFzaW5nLlxuICAgIGNvbnN0IHJldmlzaW9ucyA9IGF3YWl0IHByb21pc2VzLnJldHJ5TGltaXQoXG4gICAgICAoKSA9PiB0aGlzLl9yZXBvc2l0b3J5LmZldGNoUmV2aXNpb25JbmZvQmV0d2VlbkhlYWRBbmRCYXNlKCksXG4gICAgICByZXN1bHQgPT4gcmVzdWx0ICE9IG51bGwsXG4gICAgICBGRVRDSF9SRVZfSU5GT19NQVhfVFJJRVMsXG4gICAgICBGRVRDSF9SRVZfSU5GT19SRVRSWV9USU1FX01TLFxuICAgICk7XG4gICAgaWYgKHJldmlzaW9ucyA9PSBudWxsIHx8IHJldmlzaW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZldGNoIHJldmlzaW9uIGluZm8gbmVlZGVkIScpO1xuICAgIH1cbiAgICBjb25zdCBjb21taXRJZCA9IHJldmlzaW9uc1tyZXZpc2lvbnMubGVuZ3RoIC0gMV0uaWQ7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJldmlzaW9ucyxcbiAgICAgIGNvbW1pdElkLFxuICAgICAgY29tcGFyZUNvbW1pdElkOiBudWxsLFxuICAgIH07XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5mZXRjaC1yZXZpc2lvbnMtY2hhbmdlLWhpc3RvcnknKVxuICBhc3luYyBfZmV0Y2hSZXZpc2lvbnNGaWxlSGlzdG9yeShyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpOiBQcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PiB7XG4gICAgY29uc3Qge3JldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcblxuICAgIC8vIFJldmlzaW9uIGlkcyBhcmUgdW5pcXVlIGFuZCBkb24ndCBjaGFuZ2UsIGV4Y2VwdCB3aGVuIHRoZSByZXZpc2lvbiBpcyBhbWVuZGVkL3JlYmFzZWQuXG4gICAgLy8gSGVuY2UsIGl0J3MgY2FjaGVkIGhlcmUgdG8gYXZvaWQgc2VydmljZSBjYWxscyB3aGVuIHdvcmtpbmcgb24gYSBzdGFjayBvZiBjb21taXRzLlxuICAgIGNvbnN0IHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gYXdhaXQgUHJvbWlzZS5hbGwocmV2aXNpb25zXG4gICAgICAubWFwKGFzeW5jIHJldmlzaW9uID0+IHtcbiAgICAgICAgY29uc3Qge2lkfSA9IHJldmlzaW9uO1xuICAgICAgICBsZXQgY2hhbmdlcyA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5oYXMoaWQpKSB7XG4gICAgICAgICAgY2hhbmdlcyA9IHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLmdldChpZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hhbmdlcyA9IGF3YWl0IHRoaXMuX3JlcG9zaXRvcnkuZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKGAke2lkfWApO1xuICAgICAgICAgIGlmIChjaGFuZ2VzID09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2hhbmdlcyBub3QgYXZhaWxhYmxlIGZvciByZXZpc2lvbjogJHtpZH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMuc2V0KGlkLCBjaGFuZ2VzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge2lkLCBjaGFuZ2VzfTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHJldHVybiByZXZpc2lvbnNGaWxlSGlzdG9yeTtcbiAgfVxuXG4gIF9jb21wdXRlQ29tcGFyZUNoYW5nZXNGcm9tSGlzdG9yeShcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICAgcmV2aXNpb25zRmlsZUhpc3Rvcnk6IFJldmlzaW9uc0ZpbGVIaXN0b3J5LFxuICApOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG5cbiAgICBjb25zdCB7Y29tbWl0SWQsIGNvbXBhcmVDb21taXRJZH0gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICAvLyBUaGUgc3RhdHVzIGlzIGZldGNoZWQgYnkgbWVyZ2luZyB0aGUgY2hhbmdlcyByaWdodCBhZnRlciB0aGUgYGNvbXBhcmVDb21taXRJZGAgaWYgc3BlY2lmaWVkLFxuICAgIC8vIG9yIGBIRUFEYCBpZiBub3QuXG4gICAgY29uc3Qgc3RhcnRDb21taXRJZCA9IGNvbXBhcmVDb21taXRJZCA/IChjb21wYXJlQ29tbWl0SWQgKyAxKSA6IGNvbW1pdElkO1xuICAgIC8vIEdldCB0aGUgcmV2aXNpb24gY2hhbmdlcyB0aGF0J3MgbmV3ZXIgdGhhbiBvciBpcyB0aGUgY3VycmVudCBjb21taXQgaWQuXG4gICAgY29uc3QgY29tcGFyZVJldmlzaW9uc0ZpbGVDaGFuZ2VzID0gcmV2aXNpb25zRmlsZUhpc3RvcnlcbiAgICAgIC5zbGljZSgxKSAvLyBFeGNsdWRlIHRoZSBCQVNFIHJldmlzaW9uLlxuICAgICAgLmZpbHRlcihyZXZpc2lvbiA9PiByZXZpc2lvbi5pZCA+PSBzdGFydENvbW1pdElkKVxuICAgICAgLm1hcChyZXZpc2lvbiA9PiByZXZpc2lvbi5jaGFuZ2VzKTtcblxuICAgIC8vIFRoZSBsYXN0IHN0YXR1cyB0byBtZXJnZSBpcyB0aGUgZGlydHkgZmlsZXN5c3RlbSBzdGF0dXMuXG4gICAgY29uc3QgbWVyZ2VkRmlsZVN0YXR1c2VzID0gdGhpcy5fbWVyZ2VGaWxlU3RhdHVzZXMoXG4gICAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzLFxuICAgICAgY29tcGFyZVJldmlzaW9uc0ZpbGVDaGFuZ2VzLFxuICAgICk7XG4gICAgcmV0dXJuIG1lcmdlZEZpbGVTdGF0dXNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIGZpbGUgY2hhbmdlIHN0YXR1c2VzIG9mIHRoZSBkaXJ0eSBmaWxlc3lzdGVtIHN0YXRlIHdpdGhcbiAgICogdGhlIHJldmlzaW9uIGNoYW5nZXMsIHdoZXJlIGRpcnR5IGNoYW5nZXMgYW5kIG1vcmUgcmVjZW50IHJldmlzaW9uc1xuICAgKiB0YWtlIHByaW9yaXR5IGluIGRlY2lkaW5nIHdoaWNoIHN0YXR1cyBhIGZpbGUgaXMgaW4uXG4gICAqL1xuICBfbWVyZ2VGaWxlU3RhdHVzZXMoXG4gICAgZGlydHlTdGF0dXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+LFxuICAgIHJldmlzaW9uc0ZpbGVDaGFuZ2VzOiBBcnJheTxSZXZpc2lvbkZpbGVDaGFuZ2VzPixcbiAgKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIGNvbnN0IG1lcmdlZFN0YXR1cyA9IG5ldyBNYXAoZGlydHlTdGF0dXMpO1xuICAgIGNvbnN0IG1lcmdlZEZpbGVQYXRocyA9IG5ldyBTZXQobWVyZ2VkU3RhdHVzLmtleXMoKSk7XG5cbiAgICBmdW5jdGlvbiBtZXJnZVN0YXR1c1BhdGhzKFxuICAgICAgZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPixcbiAgICAgIGNoYW5nZVN0YXR1c1ZhbHVlOiBGaWxlQ2hhbmdlU3RhdHVzVmFsdWUsXG4gICAgKSB7XG4gICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVQYXRocykge1xuICAgICAgICBpZiAoIW1lcmdlZEZpbGVQYXRocy5oYXMoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgbWVyZ2VkU3RhdHVzLnNldChmaWxlUGF0aCwgY2hhbmdlU3RhdHVzVmFsdWUpO1xuICAgICAgICAgIG1lcmdlZEZpbGVQYXRocy5hZGQoZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICAvLyBNb3JlIHJlY2VudCByZXZpc2lvbiBjaGFuZ2VzIHRha2VzIHByaW9yaXR5IGluIHNwZWNpZnlpbmcgYSBmaWxlcycgc3RhdHVzZXMuXG4gICAgY29uc3QgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnNDaGFuZ2VzID0gcmV2aXNpb25zRmlsZUNoYW5nZXMuc2xpY2UoKS5yZXZlcnNlKCk7XG4gICAgZm9yIChjb25zdCByZXZpc2lvbkZpbGVDaGFuZ2VzIG9mIGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zQ2hhbmdlcykge1xuICAgICAgY29uc3Qge2FkZGVkLCBtb2RpZmllZCwgZGVsZXRlZH0gPSByZXZpc2lvbkZpbGVDaGFuZ2VzO1xuXG4gICAgICBtZXJnZVN0YXR1c1BhdGhzKGFkZGVkLCBGaWxlQ2hhbmdlU3RhdHVzLkFEREVEKTtcbiAgICAgIG1lcmdlU3RhdHVzUGF0aHMobW9kaWZpZWQsIEZpbGVDaGFuZ2VTdGF0dXMuTU9ESUZJRUQpO1xuICAgICAgbWVyZ2VTdGF0dXNQYXRocyhkZWxldGVkLCBGaWxlQ2hhbmdlU3RhdHVzLkRFTEVURUQpO1xuICAgIH1cblxuICAgIHJldHVybiBtZXJnZWRTdGF0dXM7XG4gIH1cblxuICBnZXREaXJ0eUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fZGlydHlGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGdldENvbXBhcmVGaWxlQ2hhbmdlcygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGFzeW5jIGZldGNoSGdEaWZmKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxIZ0RpZmZTdGF0ZT4ge1xuICAgIGNvbnN0IHtyZXZpc2lvbnMsIGNvbW1pdElkLCBjb21wYXJlQ29tbWl0SWR9ID0gYXdhaXQgdGhpcy5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICBjb25zdCBjb21taXR0ZWRDb250ZW50cyA9IGF3YWl0IHRoaXMuX3JlcG9zaXRvcnlcbiAgICAgIC5mZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aCwgY29tcGFyZUNvbW1pdElkID8gYCR7Y29tcGFyZUNvbW1pdElkfWAgOiBudWxsKVxuICAgICAgLy8gSWYgdGhlIGZpbGUgZGlkbid0IGV4aXN0IG9uIHRoZSBwcmV2aW91cyByZXZpc2lvbiwgcmV0dXJuIGVtcHR5IGNvbnRlbnRzLlxuICAgICAgLnRoZW4oY29udGVudHMgPT4gY29udGVudHMgfHwgJycsIF9lcnIgPT4gJycpO1xuXG4gICAgLy8gSW50ZW50aW9uYWxseSBmZXRjaCB0aGUgZmlsZXN5c3RlbSBjb250ZW50cyBhZnRlciBnZXR0aW5nIHRoZSBjb21taXR0ZWQgY29udGVudHNcbiAgICAvLyB0byBtYWtlIHN1cmUgd2UgaGF2ZSB0aGUgbGF0ZXN0IGZpbGVzeXN0ZW0gdmVyc2lvbi5cbiAgICBjb25zdCBmaWxlc3lzdGVtQ29udGVudHMgPSBhd2FpdCBnZXRGaWxlU3lzdGVtQ29udGVudHMoZmlsZVBhdGgpO1xuXG4gICAgY29uc3QgZmV0Y2hlZFJldmlzaW9uSWQgPSBjb21wYXJlQ29tbWl0SWQgIT0gbnVsbCA/IGNvbXBhcmVDb21taXRJZCA6IGNvbW1pdElkO1xuICAgIGNvbnN0IFtyZXZpc2lvbkluZm9dID0gcmV2aXNpb25zLmZpbHRlcihyZXZpc2lvbiA9PiByZXZpc2lvbi5pZCA9PT0gZmV0Y2hlZFJldmlzaW9uSWQpO1xuICAgIGludmFyaWFudChcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICAgIGBEaWZmIFZpdyBGZXRjaGVyOiByZXZpc2lvbiB3aXRoIGlkICR7ZmV0Y2hlZFJldmlzaW9uSWR9IG5vdCBmb3VuZGAsXG4gICAgKTtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICBmaWxlc3lzdGVtQ29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgfTtcbiAgfVxuXG4gIGdldFRlbXBsYXRlQ29tbWl0TWVzc2FnZSgpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yeS5nZXRDb25maWdWYWx1ZUFzeW5jKCdjb21taXR0ZW1wbGF0ZS5lbXB0eW1zZycpO1xuICB9XG5cbiAgYXN5bmMgc2V0UmV2aXNpb24ocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuXG4gICAgaW52YXJpYW50KFxuICAgICAgcmV2aXNpb25zICYmIHJldmlzaW9ucy5pbmRleE9mKHJldmlzaW9uKSAhPT0gLTEsXG4gICAgICAnRGlmZiBWaXcgVGltZWxpbmU6IG5vbi1hcHBsaWNhYmxlIHNlbGVjdGVkIHJldmlzaW9uJyxcbiAgICApO1xuXG4gICAgdGhpcy5fc2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQgPSByZXZpc2lvbnNTdGF0ZS5jb21wYXJlQ29tbWl0SWQgPSByZXZpc2lvbi5pZDtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgcmV2aXNpb25zU3RhdGUpO1xuXG4gICAgY29uc3QgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBhd2FpdCB0aGlzLl9nZXRDYWNoZWRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShyZXZpc2lvbnNTdGF0ZSk7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gdGhpcy5fY29tcHV0ZUNvbXBhcmVDaGFuZ2VzRnJvbUhpc3RvcnkoXG4gICAgICByZXZpc2lvbnNTdGF0ZSxcbiAgICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5LFxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlRGlydHlTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChmaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPikgPT4gdm9pZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZVJldmlzaW9ucyhcbiAgICBjYWxsYmFjazogKHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSkgPT4gdm9pZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzLmNsZWFyKCk7XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzLmNsZWFyKCk7XG4gICAgdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMucmVzZXQoKTtcbiAgfVxufVxuIl19