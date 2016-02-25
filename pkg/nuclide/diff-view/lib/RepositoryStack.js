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

    // TODO(most): Convert to a service using: `hg config committemplate.emptymsg`
  }, {
    key: 'getTemplateCommitMessage',
    value: _asyncToGenerator(function* () {
      return '\nSummary:\n\nTest Plan:\n\nReviewers:\n\nReviewed By:\n\nSubscribers:\n';
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
//# sourceMappingURL=data:application/json;base64,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bi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5Q2xpZW50fSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWNsaWVudCc7XG5pbXBvcnQgdHlwZSB7RmlsZUNoYW5nZVN0YXR1c1ZhbHVlLCBIZ0RpZmZTdGF0ZSwgUmV2aXNpb25zU3RhdGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge1JldmlzaW9uRmlsZUNoYW5nZXN9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkluZm99IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7SGdTdGF0dXNUb0ZpbGVDaGFuZ2VTdGF0dXMsIEZpbGVDaGFuZ2VTdGF0dXN9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Z2V0RmlsZVN5c3RlbUNvbnRlbnRzfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7YXJyYXksIHByb21pc2VzLCBkZWJvdW5jZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtub3RpZnlJbnRlcm5hbEVycm9yfSBmcm9tICcuL25vdGlmaWNhdGlvbnMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IExSVSBmcm9tICdscnUtY2FjaGUnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcbmNvbnN0IHtzZXJpYWxpemVBc3luY0NhbGx9ID0gcHJvbWlzZXM7XG5jb25zdCBDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQgPSAnZGlkLWNoYW5nZS1jb21wYXJlLXN0YXR1cyc7XG5jb25zdCBDSEFOR0VfRElSVFlfU1RBVFVTX0VWRU5UID0gJ2RpZC1jaGFuZ2UtZGlydHktc3RhdHVzJztcbmNvbnN0IENIQU5HRV9SRVZJU0lPTlNfRVZFTlQgPSAnZGlkLWNoYW5nZS1yZXZpc2lvbnMnO1xuY29uc3QgVVBEQVRFX1NUQVRVU19ERUJPVU5DRV9NUyA9IDIwMDA7XG5cbmNvbnN0IEZFVENIX1JFVl9JTkZPX1JFVFJZX1RJTUVfTVMgPSAxMDAwO1xuY29uc3QgRkVUQ0hfUkVWX0lORk9fTUFYX1RSSUVTID0gNTtcblxudHlwZSBSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IEFycmF5PHtcbiAgaWQ6IG51bWJlcjtcbiAgY2hhbmdlczogUmV2aXNpb25GaWxlQ2hhbmdlcztcbn0+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXBvc2l0b3J5U3RhY2sge1xuXG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2RpcnR5RmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfY29tcGFyZUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgX3JlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudDtcbiAgX3JldmlzaW9uc1N0YXRlUHJvbWlzZTogP1Byb21pc2U8UmV2aXNpb25zU3RhdGU+O1xuICBfcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlOiA/UHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT47XG4gIF9sYXN0UmV2aXNpb25zRmlsZUhpc3Rvcnk6ID9SZXZpc2lvbnNGaWxlSGlzdG9yeTtcbiAgX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkOiA/bnVtYmVyO1xuICBfaXNBY3RpdmU6IGJvb2xlYW47XG4gIF9zZXJpYWxpemVkVXBkYXRlU3RhdHVzOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBfcmV2aXNpb25JZFRvRmlsZUNoYW5nZXM6IExSVTxudW1iZXIsIFJldmlzaW9uRmlsZUNoYW5nZXM+O1xuXG4gIGNvbnN0cnVjdG9yKHJlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudCkge1xuICAgIHRoaXMuX3JlcG9zaXRvcnkgPSByZXBvc2l0b3J5O1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMgPSBuZXcgTFJVKHttYXg6IDEwMH0pO1xuICAgIHRoaXMuX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgPSBudWxsO1xuICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXMgPSBzZXJpYWxpemVBc3luY0NhbGwoKCkgPT4gdGhpcy5fdXBkYXRlQ2hhbmdlZFN0YXR1cygpKTtcbiAgICBjb25zdCBkZWJvdW5jZWRTZXJpYWxpemVkVXBkYXRlU3RhdHVzID0gZGVib3VuY2UoXG4gICAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlU3RhdHVzLFxuICAgICAgVVBEQVRFX1NUQVRVU19ERUJPVU5DRV9NUyxcbiAgICAgIGZhbHNlLFxuICAgICk7XG4gICAgZGVib3VuY2VkU2VyaWFsaXplZFVwZGF0ZVN0YXR1cygpO1xuICAgIC8vIEdldCB0aGUgaW5pdGlhbCBwcm9qZWN0IHN0YXR1cywgaWYgaXQncyBub3QgYWxyZWFkeSB0aGVyZSxcbiAgICAvLyB0cmlnZ2VyZWQgYnkgYW5vdGhlciBpbnRlZ3JhdGlvbiwgbGlrZSB0aGUgZmlsZSB0cmVlLlxuICAgIHJlcG9zaXRvcnkuZ2V0U3RhdHVzZXMoW3JlcG9zaXRvcnkuZ2V0UHJvamVjdERpcmVjdG9yeSgpXSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICByZXBvc2l0b3J5Lm9uRGlkQ2hhbmdlU3RhdHVzZXMoZGVib3VuY2VkU2VyaWFsaXplZFVwZGF0ZVN0YXR1cylcbiAgICApO1xuICB9XG5cbiAgYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2lzQWN0aXZlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2lzQWN0aXZlID0gdHJ1ZTtcbiAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlU3RhdHVzKCk7XG4gIH1cblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy51cGRhdGUtY2hhbmdlLXN0YXR1cycpXG4gIGFzeW5jIF91cGRhdGVDaGFuZ2VkU3RhdHVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl91cGRhdGVEaXJ0eUZpbGVDaGFuZ2VzKCk7XG4gICAgICBhd2FpdCB0aGlzLl91cGRhdGVDb21wYXJlRmlsZUNoYW5nZXMoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbm90aWZ5SW50ZXJuYWxFcnJvcihlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZURpcnR5RmlsZUNoYW5nZXMoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyA9IHRoaXMuX2dldERpcnR5Q2hhbmdlZFN0YXR1cygpO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfRElSVFlfU1RBVFVTX0VWRU5ULCB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIF9nZXREaXJ0eUNoYW5nZWRTdGF0dXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIGNvbnN0IGRpcnR5RmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgY29uc3Qgc3RhdHVzZXMgPSB0aGlzLl9yZXBvc2l0b3J5LmdldEFsbFBhdGhTdGF0dXNlcygpO1xuICAgIGZvciAoY29uc3QgZmlsZVBhdGggaW4gc3RhdHVzZXMpIHtcbiAgICAgIGNvbnN0IGNoYW5nZVN0YXR1cyA9IEhnU3RhdHVzVG9GaWxlQ2hhbmdlU3RhdHVzW3N0YXR1c2VzW2ZpbGVQYXRoXV07XG4gICAgICBpZiAoY2hhbmdlU3RhdHVzICE9IG51bGwpIHtcbiAgICAgICAgZGlydHlGaWxlQ2hhbmdlcy5zZXQoZmlsZVBhdGgsIGNoYW5nZVN0YXR1cyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkaXJ0eUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgZmlsZSBjaGFuZ2Ugc3RhdGUgY29tcGFyaW5nIHRoZSBkaXJ0eSBmaWxlc3lzdGVtIHN0YXR1c1xuICAgKiB0byBhIHNlbGVjdGVkIGNvbW1pdC5cbiAgICogVGhhdCB3b3VsZCBiZSBhIG1lcmdlIG9mIGBoZyBzdGF0dXNgIHdpdGggdGhlIGRpZmYgZnJvbSBjb21taXRzLFxuICAgKiBhbmQgYGhnIGxvZyAtLXJldiAke3JldklkfWAgZm9yIGV2ZXJ5IGNvbW1pdC5cbiAgICovXG4gIGFzeW5jIF91cGRhdGVDb21wYXJlRmlsZUNoYW5nZXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gV2Ugc2hvdWxkIG9ubHkgdXBkYXRlIHRoZSByZXZpc2lvbiBzdGF0ZSB3aGVuIHRoZSByZXBvc2l0b3J5IGlzIGFjdGl2ZS5cbiAgICBpZiAoIXRoaXMuX2lzQWN0aXZlKSB7XG4gICAgICB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2UgPSBudWxsO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZXZpc2lvbnNTdGF0ZSA9IGF3YWl0IHRoaXMuX2dldFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG5cbiAgICAvLyBJZiB0aGUgY29tbWl0cyBoYXZlbid0IGNoYW5nZWQgaWRzLCB0aGVuIHRoaWVyIGRpZmYgaGF2ZW4ndCBjaGFuZ2VkIGFzIHdlbGwuXG4gICAgbGV0IHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gbnVsbDtcbiAgICBpZiAodGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5ICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGZpbGVIaXN0b3J5UmV2aXNpb25JZHMgPSB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnlcbiAgICAgICAgLm1hcChyZXZpc2lvbkNoYW5nZXMgPT4gcmV2aXNpb25DaGFuZ2VzLmlkKTtcbiAgICAgIGNvbnN0IHJldmlzaW9uSWRzID0gcmV2aXNpb25zU3RhdGUucmV2aXNpb25zLm1hcChyZXZpc2lvbiA9PiByZXZpc2lvbi5pZCk7XG4gICAgICBpZiAoYXJyYXkuZXF1YWwocmV2aXNpb25JZHMsIGZpbGVIaXN0b3J5UmV2aXNpb25JZHMpKSB7XG4gICAgICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZldGNoIHJldmlzaW9ucyBoaXN0b3J5IGlmIHJldmlzaW9ucyBzdGF0ZSBoYXZlIGNoYW5nZWQuXG4gICAgaWYgKHJldmlzaW9uc0ZpbGVIaXN0b3J5ID09IG51bGwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gYXdhaXQgdGhpcy5fZ2V0UmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UocmV2aXNpb25zU3RhdGUpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICAgICdDYW5ub3QgZmV0Y2ggcmV2aXNpb24gaGlzdG9yeTogJyArXG4gICAgICAgICAgJyhjb3VsZCBoYXBwZW4gd2l0aCBwZW5kaW5nIHNvdXJjZS1jb250cm9sIGhpc3Rvcnkgd3JpdGluZyBvcGVyYXRpb25zKScsXG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzID0gdGhpcy5fY29tcHV0ZUNvbXBhcmVDaGFuZ2VzRnJvbUhpc3RvcnkoXG4gICAgICByZXZpc2lvbnNTdGF0ZSxcbiAgICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5LFxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgdGhpcy5fY29tcGFyZUZpbGVDaGFuZ2VzKTtcbiAgfVxuXG4gIF9nZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTogUHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT4ge1xuICAgIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZSA9IHRoaXMuX2ZldGNoUmV2aXNpb25zU3RhdGUoKS50aGVuKFxuICAgICAgdGhpcy5fYW1lbmRTZWxlY3RlZENvbXBhcmVDb21taXRJZC5iaW5kKHRoaXMpLFxuICAgICAgZXJyb3IgPT4ge1xuICAgICAgICB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2UgPSBudWxsO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH0sXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlO1xuICB9XG5cbiAgZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk6IFByb21pc2U8UmV2aXNpb25zU3RhdGU+IHtcbiAgICBjb25zdCByZXZpc2lvbnNTdGF0ZVByb21pc2UgPSB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2U7XG4gICAgaWYgKHJldmlzaW9uc1N0YXRlUHJvbWlzZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gcmV2aXNpb25zU3RhdGVQcm9taXNlLnRoZW4odGhpcy5fYW1lbmRTZWxlY3RlZENvbXBhcmVDb21taXRJZC5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbWVuZCB0aGUgcmV2aXNpb25zIHN0YXRlIHdpdGggdGhlIGxhdGVzdCBzZWxlY3RlZCB2YWxpZCBjb21wYXJlIGNvbW1pdCBpZC5cbiAgICovXG4gIF9hbWVuZFNlbGVjdGVkQ29tcGFyZUNvbW1pdElkKHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSk6IFJldmlzaW9uc1N0YXRlIHtcbiAgICBjb25zdCB7Y29tbWl0SWQsIHJldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICAvLyBQcmlvcml0aXplIHRoZSBjYWNoZWQgY29tcGFlcmVDb21taXRJZCwgaWYgaXQgZXhpc3RzLlxuICAgIC8vIFRoZSB1c2VyIGNvdWxkIGhhdmUgc2VsZWN0ZWQgdGhhdCBmcm9tIHRoZSB0aW1lbGluZSB2aWV3LlxuICAgIGxldCBjb21wYXJlQ29tbWl0SWQgPSB0aGlzLl9zZWxlY3RlZENvbXBhcmVDb21taXRJZDtcbiAgICBpZiAoIWFycmF5LmZpbmQocmV2aXNpb25zLCByZXZpc2lvbiA9PiByZXZpc2lvbi5pZCA9PT0gY29tcGFyZUNvbW1pdElkKSkge1xuICAgICAgLy8gSW52YWxpZGF0ZSBpZiB0aGVyZSB0aGVyZSBpcyBubyBsb25nZXIgYSByZXZpc2lvbiB3aXRoIHRoYXQgaWQuXG4gICAgICBjb21wYXJlQ29tbWl0SWQgPSBudWxsO1xuICAgIH1cbiAgICBjb25zdCBsYXRlc3RUb09sZGVzdFJldmlzaW9ucyA9IHJldmlzaW9ucy5zbGljZSgpLnJldmVyc2UoKTtcbiAgICBpZiAoY29tcGFyZUNvbW1pdElkID09IG51bGwgJiYgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMubGVuZ3RoID4gMSkge1xuICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIGFscmVhZHkgY29tbWl0dGVkLCBtb3N0IG9mIHRoZSB0aW1lcywgaGUnZCBiZSB3b3JraW5nIG9uIGFuIGFtZW5kLlxuICAgICAgLy8gU28sIHRoZSBoZXVyaXN0aWMgaGVyZSBpcyB0byBjb21wYXJlIGFnYWluc3QgdGhlIHByZXZpb3VzIHZlcnNpb24sXG4gICAgICAvLyBub3QgdGhlIGp1c3QtY29tbWl0dGVkIG9uZSwgd2hpbGUgdGhlIHJldmlzaW9ucyB0aW1lbGluZVxuICAgICAgLy8gd291bGQgZ2l2ZSBhIHdheSB0byBzcGVjaWZ5IG90aGVyd2lzZS5cbiAgICAgIGNvbXBhcmVDb21taXRJZCA9IGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zWzFdLmlkO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmV2aXNpb25zLFxuICAgICAgY29tbWl0SWQsXG4gICAgICBjb21wYXJlQ29tbWl0SWQsXG4gICAgfTtcbiAgfVxuXG4gIF9nZXRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICk6IFByb21pc2U8UmV2aXNpb25zRmlsZUhpc3Rvcnk+IHtcbiAgICB0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2UgPSB0aGlzLl9mZXRjaFJldmlzaW9uc0ZpbGVIaXN0b3J5KHJldmlzaW9uc1N0YXRlKVxuICAgICAgLnRoZW4ocmV2aXNpb25zRmlsZUhpc3RvcnkgPT5cbiAgICAgICAgdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gcmV2aXNpb25zRmlsZUhpc3RvcnlcbiAgICAgICwgZXJyb3IgPT4ge1xuICAgICAgICB0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2UgPSBudWxsO1xuICAgICAgICB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgPSBudWxsO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2U7XG4gIH1cblxuICBfZ2V0Q2FjaGVkUmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UoXG4gICAgcmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlLFxuICApOiBQcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PiB7XG4gICAgaWYgKHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0UmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UocmV2aXNpb25zU3RhdGUpO1xuICAgIH1cbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmZldGNoLXJldmlzaW9ucy1zdGF0ZScpXG4gIGFzeW5jIF9mZXRjaFJldmlzaW9uc1N0YXRlKCk6IFByb21pc2U8UmV2aXNpb25zU3RhdGU+IHtcbiAgICAvLyBXaGlsZSByZWJhc2luZywgdGhlIGNvbW1vbiBhbmNlc3RvciBvZiBgSEVBRGAgYW5kIGBCQVNFYFxuICAgIC8vIG1heSBiZSBub3QgYXBwbGljYWJsZSwgYnV0IHRoYXQncyBkZWZpbmVkIG9uY2UgdGhlIHJlYmFzZSBpcyBkb25lLlxuICAgIC8vIEhlbmNlLCB3ZSBuZWVkIHRvIHJldHJ5IGZldGNoaW5nIHRoZSByZXZpc2lvbiBpbmZvIChkZXBlbmRpbmcgb24gdGhlIGNvbW1vbiBhbmNlc3RvcilcbiAgICAvLyBiZWNhdXNlIHRoZSB3YXRjaG1hbi1iYXNlZCBNZXJjdXJpYWwgdXBkYXRlcyBkb2Vzbid0IGNvbnNpZGVyIG9yIHdhaXQgd2hpbGUgcmViYXNpbmcuXG4gICAgY29uc3QgcmV2aXNpb25zOiA/QXJyYXk8UmV2aXNpb25JbmZvPiA9IGF3YWl0IHByb21pc2VzLnJldHJ5TGltaXQoXG4gICAgICAoKSA9PiB0aGlzLl9yZXBvc2l0b3J5LmZldGNoUmV2aXNpb25JbmZvQmV0d2VlbkhlYWRBbmRCYXNlKCksXG4gICAgICByZXN1bHQgPT4gcmVzdWx0ICE9IG51bGwsXG4gICAgICBGRVRDSF9SRVZfSU5GT19NQVhfVFJJRVMsXG4gICAgICBGRVRDSF9SRVZfSU5GT19SRVRSWV9USU1FX01TLFxuICAgICk7XG4gICAgaWYgKHJldmlzaW9ucyA9PSBudWxsIHx8IHJldmlzaW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZldGNoIHJldmlzaW9uIGluZm8gbmVlZGVkIScpO1xuICAgIH1cbiAgICBjb25zdCBjb21taXRJZCA9IHJldmlzaW9uc1tyZXZpc2lvbnMubGVuZ3RoIC0gMV0uaWQ7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJldmlzaW9ucyxcbiAgICAgIGNvbW1pdElkLFxuICAgICAgY29tcGFyZUNvbW1pdElkOiBudWxsLFxuICAgIH07XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2RpZmYtdmlldy5mZXRjaC1yZXZpc2lvbnMtY2hhbmdlLWhpc3RvcnknKVxuICBhc3luYyBfZmV0Y2hSZXZpc2lvbnNGaWxlSGlzdG9yeShyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpOiBQcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PiB7XG4gICAgY29uc3Qge3JldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcblxuICAgIC8vIFJldmlzaW9uIGlkcyBhcmUgdW5pcXVlIGFuZCBkb24ndCBjaGFuZ2UsIGV4Y2VwdCB3aGVuIHRoZSByZXZpc2lvbiBpcyBhbWVuZGVkL3JlYmFzZWQuXG4gICAgLy8gSGVuY2UsIGl0J3MgY2FjaGVkIGhlcmUgdG8gYXZvaWQgc2VydmljZSBjYWxscyB3aGVuIHdvcmtpbmcgb24gYSBzdGFjayBvZiBjb21taXRzLlxuICAgIGNvbnN0IHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gYXdhaXQgUHJvbWlzZS5hbGwocmV2aXNpb25zXG4gICAgICAubWFwKGFzeW5jIHJldmlzaW9uID0+IHtcbiAgICAgICAgY29uc3Qge2lkfSA9IHJldmlzaW9uO1xuICAgICAgICBsZXQgY2hhbmdlcyA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5oYXMoaWQpKSB7XG4gICAgICAgICAgY2hhbmdlcyA9IHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLmdldChpZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hhbmdlcyA9IGF3YWl0IHRoaXMuX3JlcG9zaXRvcnkuZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKGAke2lkfWApO1xuICAgICAgICAgIGlmIChjaGFuZ2VzID09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2hhbmdlcyBub3QgYXZhaWxhYmxlIGZvciByZXZpc2lvbjogJHtpZH1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMuc2V0KGlkLCBjaGFuZ2VzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge2lkLCBjaGFuZ2VzfTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHJldHVybiByZXZpc2lvbnNGaWxlSGlzdG9yeTtcbiAgfVxuXG4gIF9jb21wdXRlQ29tcGFyZUNoYW5nZXNGcm9tSGlzdG9yeShcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICAgcmV2aXNpb25zRmlsZUhpc3Rvcnk6IFJldmlzaW9uc0ZpbGVIaXN0b3J5LFxuICApOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG5cbiAgICBjb25zdCB7Y29tbWl0SWQsIGNvbXBhcmVDb21taXRJZH0gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICAvLyBUaGUgc3RhdHVzIGlzIGZldGNoZWQgYnkgbWVyZ2luZyB0aGUgY2hhbmdlcyByaWdodCBhZnRlciB0aGUgYGNvbXBhcmVDb21taXRJZGAgaWYgc3BlY2lmaWVkLFxuICAgIC8vIG9yIGBIRUFEYCBpZiBub3QuXG4gICAgY29uc3Qgc3RhcnRDb21taXRJZCA9IGNvbXBhcmVDb21taXRJZCA/IChjb21wYXJlQ29tbWl0SWQgKyAxKSA6IGNvbW1pdElkO1xuICAgIC8vIEdldCB0aGUgcmV2aXNpb24gY2hhbmdlcyB0aGF0J3MgbmV3ZXIgdGhhbiBvciBpcyB0aGUgY3VycmVudCBjb21taXQgaWQuXG4gICAgY29uc3QgY29tcGFyZVJldmlzaW9uc0ZpbGVDaGFuZ2VzID0gcmV2aXNpb25zRmlsZUhpc3RvcnlcbiAgICAgIC5zbGljZSgxKSAvLyBFeGNsdWRlIHRoZSBCQVNFIHJldmlzaW9uLlxuICAgICAgLmZpbHRlcihyZXZpc2lvbiA9PiByZXZpc2lvbi5pZCA+PSBzdGFydENvbW1pdElkKVxuICAgICAgLm1hcChyZXZpc2lvbiA9PiByZXZpc2lvbi5jaGFuZ2VzKTtcblxuICAgIC8vIFRoZSBsYXN0IHN0YXR1cyB0byBtZXJnZSBpcyB0aGUgZGlydHkgZmlsZXN5c3RlbSBzdGF0dXMuXG4gICAgY29uc3QgbWVyZ2VkRmlsZVN0YXR1c2VzID0gdGhpcy5fbWVyZ2VGaWxlU3RhdHVzZXMoXG4gICAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzLFxuICAgICAgY29tcGFyZVJldmlzaW9uc0ZpbGVDaGFuZ2VzLFxuICAgICk7XG4gICAgcmV0dXJuIG1lcmdlZEZpbGVTdGF0dXNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIGZpbGUgY2hhbmdlIHN0YXR1c2VzIG9mIHRoZSBkaXJ0eSBmaWxlc3lzdGVtIHN0YXRlIHdpdGhcbiAgICogdGhlIHJldmlzaW9uIGNoYW5nZXMsIHdoZXJlIGRpcnR5IGNoYW5nZXMgYW5kIG1vcmUgcmVjZW50IHJldmlzaW9uc1xuICAgKiB0YWtlIHByaW9yaXR5IGluIGRlY2lkaW5nIHdoaWNoIHN0YXR1cyBhIGZpbGUgaXMgaW4uXG4gICAqL1xuICBfbWVyZ2VGaWxlU3RhdHVzZXMoXG4gICAgZGlydHlTdGF0dXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+LFxuICAgIHJldmlzaW9uc0ZpbGVDaGFuZ2VzOiBBcnJheTxSZXZpc2lvbkZpbGVDaGFuZ2VzPixcbiAgKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIGNvbnN0IG1lcmdlZFN0YXR1cyA9IG5ldyBNYXAoZGlydHlTdGF0dXMpO1xuICAgIGNvbnN0IG1lcmdlZEZpbGVQYXRocyA9IG5ldyBTZXQobWVyZ2VkU3RhdHVzLmtleXMoKSk7XG5cbiAgICBmdW5jdGlvbiBtZXJnZVN0YXR1c1BhdGhzKFxuICAgICAgZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPixcbiAgICAgIGNoYW5nZVN0YXR1c1ZhbHVlOiBGaWxlQ2hhbmdlU3RhdHVzVmFsdWUsXG4gICAgKSB7XG4gICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVQYXRocykge1xuICAgICAgICBpZiAoIW1lcmdlZEZpbGVQYXRocy5oYXMoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgbWVyZ2VkU3RhdHVzLnNldChmaWxlUGF0aCwgY2hhbmdlU3RhdHVzVmFsdWUpO1xuICAgICAgICAgIG1lcmdlZEZpbGVQYXRocy5hZGQoZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICAvLyBNb3JlIHJlY2VudCByZXZpc2lvbiBjaGFuZ2VzIHRha2VzIHByaW9yaXR5IGluIHNwZWNpZnlpbmcgYSBmaWxlcycgc3RhdHVzZXMuXG4gICAgY29uc3QgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnNDaGFuZ2VzID0gcmV2aXNpb25zRmlsZUNoYW5nZXMuc2xpY2UoKS5yZXZlcnNlKCk7XG4gICAgZm9yIChjb25zdCByZXZpc2lvbkZpbGVDaGFuZ2VzIG9mIGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zQ2hhbmdlcykge1xuICAgICAgY29uc3Qge2FkZGVkLCBtb2RpZmllZCwgZGVsZXRlZH0gPSByZXZpc2lvbkZpbGVDaGFuZ2VzO1xuXG4gICAgICBtZXJnZVN0YXR1c1BhdGhzKGFkZGVkLCBGaWxlQ2hhbmdlU3RhdHVzLkFEREVEKTtcbiAgICAgIG1lcmdlU3RhdHVzUGF0aHMobW9kaWZpZWQsIEZpbGVDaGFuZ2VTdGF0dXMuTU9ESUZJRUQpO1xuICAgICAgbWVyZ2VTdGF0dXNQYXRocyhkZWxldGVkLCBGaWxlQ2hhbmdlU3RhdHVzLkRFTEVURUQpO1xuICAgIH1cblxuICAgIHJldHVybiBtZXJnZWRTdGF0dXM7XG4gIH1cblxuICBnZXREaXJ0eUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fZGlydHlGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGdldENvbXBhcmVGaWxlQ2hhbmdlcygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGFzeW5jIGZldGNoSGdEaWZmKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxIZ0RpZmZTdGF0ZT4ge1xuICAgIGNvbnN0IHtyZXZpc2lvbnMsIGNvbW1pdElkLCBjb21wYXJlQ29tbWl0SWR9ID0gYXdhaXQgdGhpcy5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICBjb25zdCBjb21taXR0ZWRDb250ZW50cyA9IGF3YWl0IHRoaXMuX3JlcG9zaXRvcnlcbiAgICAgIC5mZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aCwgY29tcGFyZUNvbW1pdElkID8gYCR7Y29tcGFyZUNvbW1pdElkfWAgOiBudWxsKVxuICAgICAgLy8gSWYgdGhlIGZpbGUgZGlkbid0IGV4aXN0IG9uIHRoZSBwcmV2aW91cyByZXZpc2lvbiwgcmV0dXJuIGVtcHR5IGNvbnRlbnRzLlxuICAgICAgLnRoZW4oY29udGVudHMgPT4gY29udGVudHMgfHwgJycsIGVyciA9PiAnJyk7XG5cbiAgICAvLyBJbnRlbnRpb25hbGx5IGZldGNoIHRoZSBmaWxlc3lzdGVtIGNvbnRlbnRzIGFmdGVyIGdldHRpbmcgdGhlIGNvbW1pdHRlZCBjb250ZW50c1xuICAgIC8vIHRvIG1ha2Ugc3VyZSB3ZSBoYXZlIHRoZSBsYXRlc3QgZmlsZXN5c3RlbSB2ZXJzaW9uLlxuICAgIGNvbnN0IGZpbGVzeXN0ZW1Db250ZW50cyA9IGF3YWl0IGdldEZpbGVTeXN0ZW1Db250ZW50cyhmaWxlUGF0aCk7XG5cbiAgICBjb25zdCBmZXRjaGVkUmV2aXNpb25JZCA9IGNvbXBhcmVDb21taXRJZCAhPSBudWxsID8gY29tcGFyZUNvbW1pdElkIDogY29tbWl0SWQ7XG4gICAgY29uc3QgW3JldmlzaW9uSW5mb10gPSByZXZpc2lvbnMuZmlsdGVyKHJldmlzaW9uID0+IHJldmlzaW9uLmlkID09PSBmZXRjaGVkUmV2aXNpb25JZCk7XG4gICAgaW52YXJpYW50KFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgICAgYERpZmYgVml3IEZldGNoZXI6IHJldmlzaW9uIHdpdGggaWQgJHtmZXRjaGVkUmV2aXNpb25JZH0gbm90IGZvdW5kYCxcbiAgICApO1xuICAgIHJldHVybiB7XG4gICAgICBjb21taXR0ZWRDb250ZW50cyxcbiAgICAgIGZpbGVzeXN0ZW1Db250ZW50cyxcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICB9O1xuICB9XG5cbiAgLy8gVE9ETyhtb3N0KTogQ29udmVydCB0byBhIHNlcnZpY2UgdXNpbmc6IGBoZyBjb25maWcgY29tbWl0dGVtcGxhdGUuZW1wdHltc2dgXG4gIGFzeW5jIGdldFRlbXBsYXRlQ29tbWl0TWVzc2FnZSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBgXG5TdW1tYXJ5OlxuXG5UZXN0IFBsYW46XG5cblJldmlld2VyczpcblxuUmV2aWV3ZWQgQnk6XG5cblN1YnNjcmliZXJzOlxuYDtcbiAgfVxuXG4gIGFzeW5jIHNldFJldmlzaW9uKHJldmlzaW9uOiBSZXZpc2lvbkluZm8pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCByZXZpc2lvbnNTdGF0ZSA9IGF3YWl0IHRoaXMuZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgY29uc3Qge3JldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcblxuICAgIGludmFyaWFudChcbiAgICAgIHJldmlzaW9ucyAmJiByZXZpc2lvbnMuaW5kZXhPZihyZXZpc2lvbikgIT09IC0xLFxuICAgICAgJ0RpZmYgVml3IFRpbWVsaW5lOiBub24tYXBwbGljYWJsZSBzZWxlY3RlZCByZXZpc2lvbicsXG4gICAgKTtcblxuICAgIHRoaXMuX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkID0gcmV2aXNpb25zU3RhdGUuY29tcGFyZUNvbW1pdElkID0gcmV2aXNpb24uaWQ7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIHJldmlzaW9uc1N0YXRlKTtcblxuICAgIGNvbnN0IHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gYXdhaXQgdGhpcy5fZ2V0Q2FjaGVkUmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UocmV2aXNpb25zU3RhdGUpO1xuICAgIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyA9IHRoaXMuX2NvbXB1dGVDb21wYXJlQ2hhbmdlc0Zyb21IaXN0b3J5KFxuICAgICAgcmV2aXNpb25zU3RhdGUsXG4gICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSxcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQsIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBvbkRpZENoYW5nZURpcnR5U3RhdHVzKFxuICAgIGNhbGxiYWNrOiAoZmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+KSA9PiB2b2lkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihDSEFOR0VfRElSVFlfU1RBVFVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZUNvbXBhcmVTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChmaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VSZXZpc2lvbnMoXG4gICAgY2FsbGJhY2s6IChyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcy5jbGVhcigpO1xuICAgIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcy5jbGVhcigpO1xuICAgIHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLnJlc2V0KCk7XG4gIH1cbn1cbiJdfQ==