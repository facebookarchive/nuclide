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
    key: 'getLastCommitMergeFileChanges',
    value: function getLastCommitMergeFileChanges() {
      return this._lastCommitMergeFileChanges;
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
//# sourceMappingURL=data:application/json;base64,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Q3ZDOzs7U0E3YWtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6IlJlcG9zaXRvcnlTdGFjay5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1jbGllbnQnO1xuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSwgSGdEaWZmU3RhdGUsIFJldmlzaW9uc1N0YXRlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtcbiAgUmV2aXNpb25GaWxlQ2hhbmdlcyxcbiAgUmV2aXNpb25JbmZvLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtIZ1N0YXR1c1RvRmlsZUNoYW5nZVN0YXR1cywgRmlsZUNoYW5nZVN0YXR1c30gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHthcnJheSwgcHJvbWlzZXMsIGRlYm91bmNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHtub3RpZnlJbnRlcm5hbEVycm9yfSBmcm9tICcuL25vdGlmaWNhdGlvbnMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IExSVSBmcm9tICdscnUtY2FjaGUnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuY29uc3Qge3NlcmlhbGl6ZUFzeW5jQ2FsbH0gPSBwcm9taXNlcztcbmNvbnN0IFVQREFURV9DT01NSVRfTUVSR0VfRklMRVNfRVZFTlQgPSAndXBkYXRlLWNvbW1pdC1tZXJnZS1maWxlcyc7XG5jb25zdCBVUERBVEVfRElSVFlfRklMRVNfRVZFTlQgPSAndXBkYXRlLWRpcnR5LWZpbGVzJztcbmNvbnN0IENIQU5HRV9SRVZJU0lPTlNfRVZFTlQgPSAnZGlkLWNoYW5nZS1yZXZpc2lvbnMnO1xuY29uc3QgVVBEQVRFX1NUQVRVU19ERUJPVU5DRV9NUyA9IDIwMDA7XG5cbmNvbnN0IEZFVENIX1JFVl9JTkZPX1JFVFJZX1RJTUVfTVMgPSAxMDAwO1xuY29uc3QgRkVUQ0hfUkVWX0lORk9fTUFYX1RSSUVTID0gNTtcblxudHlwZSBSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IEFycmF5PHtcbiAgaWQ6IG51bWJlcjtcbiAgY2hhbmdlczogUmV2aXNpb25GaWxlQ2hhbmdlcztcbn0+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXBvc2l0b3J5U3RhY2sge1xuXG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2RpcnR5RmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICBfY29tbWl0TWVyZ2VGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIF9sYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIF9yZXBvc2l0b3J5OiBIZ1JlcG9zaXRvcnlDbGllbnQ7XG4gIF9sYXN0UmV2aXNpb25zU3RhdGU6ID9SZXZpc2lvbnNTdGF0ZTtcbiAgX3JldmlzaW9uc1N0YXRlUHJvbWlzZTogP1Byb21pc2U8UmV2aXNpb25zU3RhdGU+O1xuICBfcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlOiA/UHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT47XG4gIF9sYXN0UmV2aXNpb25zRmlsZUhpc3Rvcnk6ID9SZXZpc2lvbnNGaWxlSGlzdG9yeTtcbiAgX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkOiA/bnVtYmVyO1xuICBfaXNBY3RpdmU6IGJvb2xlYW47XG4gIF9zZXJpYWxpemVkVXBkYXRlU3RhdHVzOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBfcmV2aXNpb25JZFRvRmlsZUNoYW5nZXM6IExSVTxudW1iZXIsIFJldmlzaW9uRmlsZUNoYW5nZXM+O1xuXG4gIGNvbnN0cnVjdG9yKHJlcG9zaXRvcnk6IEhnUmVwb3NpdG9yeUNsaWVudCkge1xuICAgIHRoaXMuX3JlcG9zaXRvcnkgPSByZXBvc2l0b3J5O1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2NvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fbGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzID0gbmV3IExSVSh7bWF4OiAxMDB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZENvbXBhcmVDb21taXRJZCA9IG51bGw7XG4gICAgdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gbnVsbDtcbiAgICB0aGlzLl9sYXN0UmV2aXNpb25zU3RhdGUgPSBudWxsO1xuICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXMgPSBzZXJpYWxpemVBc3luY0NhbGwoKCkgPT4gdGhpcy5fdXBkYXRlQ2hhbmdlZFN0YXR1cygpKTtcbiAgICBjb25zdCBkZWJvdW5jZWRTZXJpYWxpemVkVXBkYXRlU3RhdHVzID0gZGVib3VuY2UoXG4gICAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlU3RhdHVzLFxuICAgICAgVVBEQVRFX1NUQVRVU19ERUJPVU5DRV9NUyxcbiAgICAgIGZhbHNlLFxuICAgICk7XG4gICAgZGVib3VuY2VkU2VyaWFsaXplZFVwZGF0ZVN0YXR1cygpO1xuICAgIC8vIEdldCB0aGUgaW5pdGlhbCBwcm9qZWN0IHN0YXR1cywgaWYgaXQncyBub3QgYWxyZWFkeSB0aGVyZSxcbiAgICAvLyB0cmlnZ2VyZWQgYnkgYW5vdGhlciBpbnRlZ3JhdGlvbiwgbGlrZSB0aGUgZmlsZSB0cmVlLlxuICAgIHJlcG9zaXRvcnkuZ2V0U3RhdHVzZXMoW3JlcG9zaXRvcnkuZ2V0UHJvamVjdERpcmVjdG9yeSgpXSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICByZXBvc2l0b3J5Lm9uRGlkQ2hhbmdlU3RhdHVzZXMoZGVib3VuY2VkU2VyaWFsaXplZFVwZGF0ZVN0YXR1cyksXG4gICAgKTtcbiAgfVxuXG4gIGFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XG4gICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZVN0YXR1cygpO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcudXBkYXRlLWNoYW5nZS1zdGF0dXMnKVxuICBhc3luYyBfdXBkYXRlQ2hhbmdlZFN0YXR1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fdXBkYXRlRGlydHlGaWxlQ2hhbmdlcygpO1xuICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlQ29tbWl0TWVyZ2VGaWxlQ2hhbmdlcygpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBub3RpZnlJbnRlcm5hbEVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlRGlydHlGaWxlQ2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gdGhpcy5fZ2V0RGlydHlDaGFuZ2VkU3RhdHVzKCk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KFVQREFURV9ESVJUWV9GSUxFU19FVkVOVCk7XG4gIH1cblxuICBfZ2V0RGlydHlDaGFuZ2VkU3RhdHVzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICBjb25zdCBkaXJ0eUZpbGVDaGFuZ2VzID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IHN0YXR1c2VzID0gdGhpcy5fcmVwb3NpdG9yeS5nZXRBbGxQYXRoU3RhdHVzZXMoKTtcbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIGluIHN0YXR1c2VzKSB7XG4gICAgICBjb25zdCBjaGFuZ2VTdGF0dXMgPSBIZ1N0YXR1c1RvRmlsZUNoYW5nZVN0YXR1c1tzdGF0dXNlc1tmaWxlUGF0aF1dO1xuICAgICAgaWYgKGNoYW5nZVN0YXR1cyAhPSBudWxsKSB7XG4gICAgICAgIGRpcnR5RmlsZUNoYW5nZXMuc2V0KGZpbGVQYXRoLCBjaGFuZ2VTdGF0dXMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGlydHlGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGNvbW1pdChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yeS5jb21taXQobWVzc2FnZSk7XG4gIH1cblxuICBhbWVuZChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yeS5hbWVuZChtZXNzYWdlKTtcbiAgfVxuXG4gIHJldmVydChmaWxlUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcG9zaXRvcnkucmV2ZXJ0KGZpbGVQYXRocyk7XG4gIH1cblxuICBhZGQoZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9yZXBvc2l0b3J5LmFkZChmaWxlUGF0aHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgZmlsZSBjaGFuZ2Ugc3RhdGUgY29tcGFyaW5nIHRoZSBkaXJ0eSBmaWxlc3lzdGVtIHN0YXR1c1xuICAgKiB0byBhIHNlbGVjdGVkIGNvbW1pdC5cbiAgICogVGhhdCB3b3VsZCBiZSBhIG1lcmdlIG9mIGBoZyBzdGF0dXNgIHdpdGggdGhlIGRpZmYgZnJvbSBjb21taXRzLFxuICAgKiBhbmQgYGhnIGxvZyAtLXJldiAke3JldklkfWAgZm9yIGV2ZXJ5IGNvbW1pdC5cbiAgICovXG4gIGFzeW5jIF91cGRhdGVDb21taXRNZXJnZUZpbGVDaGFuZ2VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFdlIHNob3VsZCBvbmx5IHVwZGF0ZSB0aGUgcmV2aXNpb24gc3RhdGUgd2hlbiB0aGUgcmVwb3NpdG9yeSBpcyBhY3RpdmUuXG4gICAgaWYgKCF0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbGFzdFJldmlzaW9uc1N0YXRlID0gdGhpcy5fbGFzdFJldmlzaW9uc1N0YXRlO1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICAvLyBUaGUgcmV2aXNpb25zIGhhdmVuJ3QgY2hhbmdlZCBpZiB0aGUgcmV2aXNpb25zJyBpZHMgYXJlIHRoZSBzYW1lLlxuICAgIC8vIFRoYXQncyBiZWNhdXNlIGNvbW1pdCBpZHMgYXJlIHVuaXF1ZSBhbmQgaW5jcmVtZW50YWwuXG4gICAgLy8gQWxzbywgYW55IHdyaXRlIG9wZXJhdGlvbiB3aWxsIHVwZGF0ZSB0aGVtLlxuICAgIC8vIFRoYXQgd2F5LCB3ZSBndWFyYW50ZWUgd2Ugb25seSB1cGRhdGUgdGhlIHJldmlzaW9ucyBzdGF0ZSBpZiB0aGUgcmV2aXNpb25zIGFyZSBjaGFuZ2VkLlxuICAgIGlmIChcbiAgICAgIGxhc3RSZXZpc2lvbnNTdGF0ZSA9PSBudWxsIHx8XG4gICAgICAhYXJyYXkuZXF1YWwoXG4gICAgICAgIGxhc3RSZXZpc2lvbnNTdGF0ZS5yZXZpc2lvbnMsXG4gICAgICAgIHJldmlzaW9uc1N0YXRlLnJldmlzaW9ucyxcbiAgICAgICAgKHJldmlzaW9uMSwgcmV2aXNpb24yKSA9PiByZXZpc2lvbjEuaWQgPT09IHJldmlzaW9uMi5pZCxcbiAgICAgIClcbiAgICApIHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfUkVWSVNJT05TX0VWRU5ULCByZXZpc2lvbnNTdGF0ZSk7XG4gICAgfVxuICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNTdGF0ZSA9IHJldmlzaW9uc1N0YXRlO1xuXG4gICAgLy8gSWYgdGhlIGNvbW1pdHMgaGF2ZW4ndCBjaGFuZ2VkIGlkcywgdGhlbiB0aGllciBkaWZmIGhhdmVuJ3QgY2hhbmdlZCBhcyB3ZWxsLlxuICAgIGxldCByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgaWYgKHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSAhPSBudWxsKSB7XG4gICAgICBjb25zdCBmaWxlSGlzdG9yeVJldmlzaW9uSWRzID0gdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5XG4gICAgICAgIC5tYXAocmV2aXNpb25DaGFuZ2VzID0+IHJldmlzaW9uQ2hhbmdlcy5pZCk7XG4gICAgICBjb25zdCByZXZpc2lvbklkcyA9IHJldmlzaW9uc1N0YXRlLnJldmlzaW9ucy5tYXAocmV2aXNpb24gPT4gcmV2aXNpb24uaWQpO1xuICAgICAgaWYgKGFycmF5LmVxdWFsKHJldmlzaW9uSWRzLCBmaWxlSGlzdG9yeVJldmlzaW9uSWRzKSkge1xuICAgICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGZXRjaCByZXZpc2lvbnMgaGlzdG9yeSBpZiByZXZpc2lvbnMgc3RhdGUgaGF2ZSBjaGFuZ2VkLlxuICAgIGlmIChyZXZpc2lvbnNGaWxlSGlzdG9yeSA9PSBudWxsKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IGF3YWl0IHRoaXMuX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKHJldmlzaW9uc1N0YXRlKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICAnQ2Fubm90IGZldGNoIHJldmlzaW9uIGhpc3Rvcnk6ICcgK1xuICAgICAgICAgICcoY291bGQgaGFwcGVuIHdpdGggcGVuZGluZyBzb3VyY2UtY29udHJvbCBoaXN0b3J5IHdyaXRpbmcgb3BlcmF0aW9ucyknLFxuICAgICAgICAgIGVycm9yLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2NvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSB0aGlzLl9jb21wdXRlQ29tbWl0TWVyZ2VGcm9tSGlzdG9yeShcbiAgICAgIHJldmlzaW9uc1N0YXRlLFxuICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnksXG4gICAgKTtcblxuICAgIGNvbnN0IGxhc3RDb21taXRGaWxlQ2hhbmdlcyA9IHJldmlzaW9uc0ZpbGVIaXN0b3J5Lmxlbmd0aCA8PSAxXG4gICAgICA/IG51bGwgOlxuICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnlbcmV2aXNpb25zRmlsZUhpc3RvcnkubGVuZ3RoIC0gMV0uY2hhbmdlcztcblxuICAgIHRoaXMuX2xhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzID0gdGhpcy5fbWVyZ2VGaWxlU3RhdHVzZXMoXG4gICAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzLFxuICAgICAgbGFzdENvbW1pdEZpbGVDaGFuZ2VzID09IG51bGwgPyBbXSA6IFtsYXN0Q29tbWl0RmlsZUNoYW5nZXNdLFxuICAgICk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KFVQREFURV9DT01NSVRfTUVSR0VfRklMRVNfRVZFTlQpO1xuICB9XG5cbiAgZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk6IFByb21pc2U8UmV2aXNpb25zU3RhdGU+IHtcbiAgICB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2UgPSB0aGlzLl9mZXRjaFJldmlzaW9uc1N0YXRlKCkudGhlbihcbiAgICAgIHRoaXMuX2FtZW5kU2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQuYmluZCh0aGlzKSxcbiAgICAgIGVycm9yID0+IHtcbiAgICAgICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gbnVsbDtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9LFxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZTtcbiAgfVxuXG4gIGdldENhY2hlZFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpOiBQcm9taXNlPFJldmlzaW9uc1N0YXRlPiB7XG4gICAgY29uc3QgcmV2aXNpb25zU3RhdGVQcm9taXNlID0gdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlO1xuICAgIGlmIChyZXZpc2lvbnNTdGF0ZVByb21pc2UgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJldmlzaW9uc1N0YXRlUHJvbWlzZS50aGVuKHRoaXMuX2FtZW5kU2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQuYmluZCh0aGlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbWVuZCB0aGUgcmV2aXNpb25zIHN0YXRlIHdpdGggdGhlIGxhdGVzdCBzZWxlY3RlZCB2YWxpZCBjb21wYXJlIGNvbW1pdCBpZC5cbiAgICovXG4gIF9hbWVuZFNlbGVjdGVkQ29tcGFyZUNvbW1pdElkKHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSk6IFJldmlzaW9uc1N0YXRlIHtcbiAgICBjb25zdCB7Y29tbWl0SWQsIHJldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcbiAgICAvLyBQcmlvcml0aXplIHRoZSBjYWNoZWQgY29tcGFlcmVDb21taXRJZCwgaWYgaXQgZXhpc3RzLlxuICAgIC8vIFRoZSB1c2VyIGNvdWxkIGhhdmUgc2VsZWN0ZWQgdGhhdCBmcm9tIHRoZSB0aW1lbGluZSB2aWV3LlxuICAgIGxldCBjb21wYXJlQ29tbWl0SWQgPSB0aGlzLl9zZWxlY3RlZENvbXBhcmVDb21taXRJZDtcbiAgICBpZiAoIWFycmF5LmZpbmQocmV2aXNpb25zLCByZXZpc2lvbiA9PiByZXZpc2lvbi5pZCA9PT0gY29tcGFyZUNvbW1pdElkKSkge1xuICAgICAgLy8gSW52YWxpZGF0ZSBpZiB0aGVyZSB0aGVyZSBpcyBubyBsb25nZXIgYSByZXZpc2lvbiB3aXRoIHRoYXQgaWQuXG4gICAgICBjb21wYXJlQ29tbWl0SWQgPSBudWxsO1xuICAgIH1cbiAgICBjb25zdCBsYXRlc3RUb09sZGVzdFJldmlzaW9ucyA9IHJldmlzaW9ucy5zbGljZSgpLnJldmVyc2UoKTtcbiAgICBpZiAoY29tcGFyZUNvbW1pdElkID09IG51bGwgJiYgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnMubGVuZ3RoID4gMSkge1xuICAgICAgLy8gSWYgdGhlIHVzZXIgaGFzIGFscmVhZHkgY29tbWl0dGVkLCBtb3N0IG9mIHRoZSB0aW1lcywgaGUnZCBiZSB3b3JraW5nIG9uIGFuIGFtZW5kLlxuICAgICAgLy8gU28sIHRoZSBoZXVyaXN0aWMgaGVyZSBpcyB0byBjb21wYXJlIGFnYWluc3QgdGhlIHByZXZpb3VzIHZlcnNpb24sXG4gICAgICAvLyBub3QgdGhlIGp1c3QtY29tbWl0dGVkIG9uZSwgd2hpbGUgdGhlIHJldmlzaW9ucyB0aW1lbGluZVxuICAgICAgLy8gd291bGQgZ2l2ZSBhIHdheSB0byBzcGVjaWZ5IG90aGVyd2lzZS5cbiAgICAgIGNvbXBhcmVDb21taXRJZCA9IGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zWzFdLmlkO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmV2aXNpb25zLFxuICAgICAgY29tbWl0SWQsXG4gICAgICBjb21wYXJlQ29tbWl0SWQsXG4gICAgfTtcbiAgfVxuXG4gIF9nZXRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICk6IFByb21pc2U8UmV2aXNpb25zRmlsZUhpc3Rvcnk+IHtcbiAgICB0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2UgPSB0aGlzLl9mZXRjaFJldmlzaW9uc0ZpbGVIaXN0b3J5KHJldmlzaW9uc1N0YXRlKVxuICAgICAgLnRoZW4ocmV2aXNpb25zRmlsZUhpc3RvcnkgPT5cbiAgICAgICAgdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gcmV2aXNpb25zRmlsZUhpc3RvcnlcbiAgICAgICwgZXJyb3IgPT4ge1xuICAgICAgICB0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2UgPSBudWxsO1xuICAgICAgICB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgPSBudWxsO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2U7XG4gIH1cblxuICBfZ2V0Q2FjaGVkUmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UoXG4gICAgcmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlLFxuICApOiBQcm9taXNlPFJldmlzaW9uc0ZpbGVIaXN0b3J5PiB7XG4gICAgaWYgKHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0UmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UocmV2aXNpb25zU3RhdGUpO1xuICAgIH1cbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmZldGNoLXJldmlzaW9ucy1zdGF0ZScpXG4gIGFzeW5jIF9mZXRjaFJldmlzaW9uc1N0YXRlKCk6IFByb21pc2U8UmV2aXNpb25zU3RhdGU+IHtcbiAgICAvLyBXaGlsZSByZWJhc2luZywgdGhlIGNvbW1vbiBhbmNlc3RvciBvZiBgSEVBRGAgYW5kIGBCQVNFYFxuICAgIC8vIG1heSBiZSBub3QgYXBwbGljYWJsZSwgYnV0IHRoYXQncyBkZWZpbmVkIG9uY2UgdGhlIHJlYmFzZSBpcyBkb25lLlxuICAgIC8vIEhlbmNlLCB3ZSBuZWVkIHRvIHJldHJ5IGZldGNoaW5nIHRoZSByZXZpc2lvbiBpbmZvIChkZXBlbmRpbmcgb24gdGhlIGNvbW1vbiBhbmNlc3RvcilcbiAgICAvLyBiZWNhdXNlIHRoZSB3YXRjaG1hbi1iYXNlZCBNZXJjdXJpYWwgdXBkYXRlcyBkb2Vzbid0IGNvbnNpZGVyIG9yIHdhaXQgd2hpbGUgcmViYXNpbmcuXG4gICAgY29uc3QgcmV2aXNpb25zID0gYXdhaXQgcHJvbWlzZXMucmV0cnlMaW1pdChcbiAgICAgICgpID0+IHRoaXMuX3JlcG9zaXRvcnkuZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuSGVhZEFuZEJhc2UoKSxcbiAgICAgIHJlc3VsdCA9PiByZXN1bHQgIT0gbnVsbCxcbiAgICAgIEZFVENIX1JFVl9JTkZPX01BWF9UUklFUyxcbiAgICAgIEZFVENIX1JFVl9JTkZPX1JFVFJZX1RJTUVfTVMsXG4gICAgKTtcbiAgICBpZiAocmV2aXNpb25zID09IG51bGwgfHwgcmV2aXNpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmV0Y2ggcmV2aXNpb24gaW5mbyBuZWVkZWQhJyk7XG4gICAgfVxuICAgIGNvbnN0IGNvbW1pdElkID0gcmV2aXNpb25zW3JldmlzaW9ucy5sZW5ndGggLSAxXS5pZDtcbiAgICByZXR1cm4ge1xuICAgICAgcmV2aXNpb25zLFxuICAgICAgY29tbWl0SWQsXG4gICAgICBjb21wYXJlQ29tbWl0SWQ6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LmZldGNoLXJldmlzaW9ucy1jaGFuZ2UtaGlzdG9yeScpXG4gIGFzeW5jIF9mZXRjaFJldmlzaW9uc0ZpbGVIaXN0b3J5KHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSk6IFByb21pc2U8UmV2aXNpb25zRmlsZUhpc3Rvcnk+IHtcbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuXG4gICAgLy8gUmV2aXNpb24gaWRzIGFyZSB1bmlxdWUgYW5kIGRvbid0IGNoYW5nZSwgZXhjZXB0IHdoZW4gdGhlIHJldmlzaW9uIGlzIGFtZW5kZWQvcmViYXNlZC5cbiAgICAvLyBIZW5jZSwgaXQncyBjYWNoZWQgaGVyZSB0byBhdm9pZCBzZXJ2aWNlIGNhbGxzIHdoZW4gd29ya2luZyBvbiBhIHN0YWNrIG9mIGNvbW1pdHMuXG4gICAgY29uc3QgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBhd2FpdCBQcm9taXNlLmFsbChyZXZpc2lvbnNcbiAgICAgIC5tYXAoYXN5bmMgcmV2aXNpb24gPT4ge1xuICAgICAgICBjb25zdCB7aWR9ID0gcmV2aXNpb247XG4gICAgICAgIGxldCBjaGFuZ2VzID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLmhhcyhpZCkpIHtcbiAgICAgICAgICBjaGFuZ2VzID0gdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMuZ2V0KGlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaGFuZ2VzID0gYXdhaXQgdGhpcy5fcmVwb3NpdG9yeS5mZXRjaEZpbGVzQ2hhbmdlZEF0UmV2aXNpb24oYCR7aWR9YCk7XG4gICAgICAgICAgaWYgKGNoYW5nZXMgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDaGFuZ2VzIG5vdCBhdmFpbGFibGUgZm9yIHJldmlzaW9uOiAke2lkfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5zZXQoaWQsIGNoYW5nZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7aWQsIGNoYW5nZXN9O1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgcmV0dXJuIHJldmlzaW9uc0ZpbGVIaXN0b3J5O1xuICB9XG5cbiAgX2NvbXB1dGVDb21taXRNZXJnZUZyb21IaXN0b3J5KFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgICByZXZpc2lvbnNGaWxlSGlzdG9yeTogUmV2aXNpb25zRmlsZUhpc3RvcnksXG4gICk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcblxuICAgIGNvbnN0IHtjb21taXRJZCwgY29tcGFyZUNvbW1pdElkfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIC8vIFRoZSBzdGF0dXMgaXMgZmV0Y2hlZCBieSBtZXJnaW5nIHRoZSBjaGFuZ2VzIHJpZ2h0IGFmdGVyIHRoZSBgY29tcGFyZUNvbW1pdElkYCBpZiBzcGVjaWZpZWQsXG4gICAgLy8gb3IgYEhFQURgIGlmIG5vdC5cbiAgICBjb25zdCBzdGFydENvbW1pdElkID0gY29tcGFyZUNvbW1pdElkID8gKGNvbXBhcmVDb21taXRJZCArIDEpIDogY29tbWl0SWQ7XG4gICAgLy8gR2V0IHRoZSByZXZpc2lvbiBjaGFuZ2VzIHRoYXQncyBuZXdlciB0aGFuIG9yIGlzIHRoZSBjdXJyZW50IGNvbW1pdCBpZC5cbiAgICBjb25zdCBjb21taXRSZXZpc2lvbnNGaWxlQ2hhbmdlcyA9IHJldmlzaW9uc0ZpbGVIaXN0b3J5XG4gICAgICAuc2xpY2UoMSkgLy8gRXhjbHVkZSB0aGUgQkFTRSByZXZpc2lvbi5cbiAgICAgIC5maWx0ZXIocmV2aXNpb24gPT4gcmV2aXNpb24uaWQgPj0gc3RhcnRDb21taXRJZClcbiAgICAgIC5tYXAocmV2aXNpb24gPT4gcmV2aXNpb24uY2hhbmdlcyk7XG5cbiAgICAvLyBUaGUgbGFzdCBzdGF0dXMgdG8gbWVyZ2UgaXMgdGhlIGRpcnR5IGZpbGVzeXN0ZW0gc3RhdHVzLlxuICAgIGNvbnN0IG1lcmdlZEZpbGVTdGF0dXNlcyA9IHRoaXMuX21lcmdlRmlsZVN0YXR1c2VzKFxuICAgICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyxcbiAgICAgIGNvbW1pdFJldmlzaW9uc0ZpbGVDaGFuZ2VzLFxuICAgICk7XG4gICAgcmV0dXJuIG1lcmdlZEZpbGVTdGF0dXNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIGZpbGUgY2hhbmdlIHN0YXR1c2VzIG9mIHRoZSBkaXJ0eSBmaWxlc3lzdGVtIHN0YXRlIHdpdGhcbiAgICogdGhlIHJldmlzaW9uIGNoYW5nZXMsIHdoZXJlIGRpcnR5IGNoYW5nZXMgYW5kIG1vcmUgcmVjZW50IHJldmlzaW9uc1xuICAgKiB0YWtlIHByaW9yaXR5IGluIGRlY2lkaW5nIHdoaWNoIHN0YXR1cyBhIGZpbGUgaXMgaW4uXG4gICAqL1xuICBfbWVyZ2VGaWxlU3RhdHVzZXMoXG4gICAgZGlydHlTdGF0dXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+LFxuICAgIHJldmlzaW9uc0ZpbGVDaGFuZ2VzOiBBcnJheTxSZXZpc2lvbkZpbGVDaGFuZ2VzPixcbiAgKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIGNvbnN0IG1lcmdlZFN0YXR1cyA9IG5ldyBNYXAoZGlydHlTdGF0dXMpO1xuICAgIGNvbnN0IG1lcmdlZEZpbGVQYXRocyA9IG5ldyBTZXQobWVyZ2VkU3RhdHVzLmtleXMoKSk7XG5cbiAgICBmdW5jdGlvbiBtZXJnZVN0YXR1c1BhdGhzKFxuICAgICAgZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPixcbiAgICAgIGNoYW5nZVN0YXR1c1ZhbHVlOiBGaWxlQ2hhbmdlU3RhdHVzVmFsdWUsXG4gICAgKSB7XG4gICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVQYXRocykge1xuICAgICAgICBpZiAoIW1lcmdlZEZpbGVQYXRocy5oYXMoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgbWVyZ2VkU3RhdHVzLnNldChmaWxlUGF0aCwgY2hhbmdlU3RhdHVzVmFsdWUpO1xuICAgICAgICAgIG1lcmdlZEZpbGVQYXRocy5hZGQoZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICAvLyBNb3JlIHJlY2VudCByZXZpc2lvbiBjaGFuZ2VzIHRha2VzIHByaW9yaXR5IGluIHNwZWNpZnlpbmcgYSBmaWxlcycgc3RhdHVzZXMuXG4gICAgY29uc3QgbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnNDaGFuZ2VzID0gcmV2aXNpb25zRmlsZUNoYW5nZXMuc2xpY2UoKS5yZXZlcnNlKCk7XG4gICAgZm9yIChjb25zdCByZXZpc2lvbkZpbGVDaGFuZ2VzIG9mIGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zQ2hhbmdlcykge1xuICAgICAgY29uc3Qge2FkZGVkLCBtb2RpZmllZCwgZGVsZXRlZH0gPSByZXZpc2lvbkZpbGVDaGFuZ2VzO1xuXG4gICAgICBtZXJnZVN0YXR1c1BhdGhzKGFkZGVkLCBGaWxlQ2hhbmdlU3RhdHVzLkFEREVEKTtcbiAgICAgIG1lcmdlU3RhdHVzUGF0aHMobW9kaWZpZWQsIEZpbGVDaGFuZ2VTdGF0dXMuTU9ESUZJRUQpO1xuICAgICAgbWVyZ2VTdGF0dXNQYXRocyhkZWxldGVkLCBGaWxlQ2hhbmdlU3RhdHVzLkRFTEVURUQpO1xuICAgIH1cblxuICAgIHJldHVybiBtZXJnZWRTdGF0dXM7XG4gIH1cblxuICBnZXREaXJ0eUZpbGVDaGFuZ2VzKCk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICByZXR1cm4gdGhpcy5fZGlydHlGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGdldENvbW1pdE1lcmdlRmlsZUNoYW5nZXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIHJldHVybiB0aGlzLl9jb21taXRNZXJnZUZpbGVDaGFuZ2VzO1xuICB9XG5cbiAgZ2V0TGFzdENvbW1pdE1lcmdlRmlsZUNoYW5nZXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIHJldHVybiB0aGlzLl9sYXN0Q29tbWl0TWVyZ2VGaWxlQ2hhbmdlcztcbiAgfVxuXG4gIGFzeW5jIGZldGNoSGdEaWZmKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxIZ0RpZmZTdGF0ZT4ge1xuICAgIGNvbnN0IHtyZXZpc2lvbnMsIGNvbW1pdElkLCBjb21wYXJlQ29tbWl0SWR9ID0gYXdhaXQgdGhpcy5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICBjb25zdCBjb21taXR0ZWRDb250ZW50cyA9IGF3YWl0IHRoaXMuX3JlcG9zaXRvcnlcbiAgICAgIC5mZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aCwgY29tcGFyZUNvbW1pdElkID8gYCR7Y29tcGFyZUNvbW1pdElkfWAgOiBudWxsKVxuICAgICAgLy8gSWYgdGhlIGZpbGUgZGlkbid0IGV4aXN0IG9uIHRoZSBwcmV2aW91cyByZXZpc2lvbiwgcmV0dXJuIGVtcHR5IGNvbnRlbnRzLlxuICAgICAgLnRoZW4oY29udGVudHMgPT4gY29udGVudHMgfHwgJycsIF9lcnIgPT4gJycpO1xuXG4gICAgY29uc3QgZmV0Y2hlZFJldmlzaW9uSWQgPSBjb21wYXJlQ29tbWl0SWQgIT0gbnVsbCA/IGNvbXBhcmVDb21taXRJZCA6IGNvbW1pdElkO1xuICAgIGNvbnN0IFtyZXZpc2lvbkluZm9dID0gcmV2aXNpb25zLmZpbHRlcihyZXZpc2lvbiA9PiByZXZpc2lvbi5pZCA9PT0gZmV0Y2hlZFJldmlzaW9uSWQpO1xuICAgIGludmFyaWFudChcbiAgICAgIHJldmlzaW9uSW5mbyxcbiAgICAgIGBEaWZmIFZpdyBGZXRjaGVyOiByZXZpc2lvbiB3aXRoIGlkICR7ZmV0Y2hlZFJldmlzaW9uSWR9IG5vdCBmb3VuZGAsXG4gICAgKTtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWl0dGVkQ29udGVudHMsXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgfTtcbiAgfVxuXG4gIGdldFRlbXBsYXRlQ29tbWl0TWVzc2FnZSgpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fcmVwb3NpdG9yeS5nZXRDb25maWdWYWx1ZUFzeW5jKCdjb21taXR0ZW1wbGF0ZS5lbXB0eW1zZycpO1xuICB9XG5cbiAgYXN5bmMgc2V0UmV2aXNpb24ocmV2aXNpb246IFJldmlzaW9uSW5mbyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5nZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTtcbiAgICBjb25zdCB7cmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuXG4gICAgaW52YXJpYW50KFxuICAgICAgcmV2aXNpb25zICYmIGFycmF5LmZpbmQocmV2aXNpb25zLCBjaGVjayA9PiBjaGVjay5pZCA9PT0gcmV2aXNpb24uaWQpLFxuICAgICAgJ0RpZmYgVml3IFRpbWVsaW5lOiBub24tYXBwbGljYWJsZSBzZWxlY3RlZCByZXZpc2lvbicsXG4gICAgKTtcblxuICAgIHRoaXMuX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkID0gcmV2aXNpb25zU3RhdGUuY29tcGFyZUNvbW1pdElkID0gcmV2aXNpb24uaWQ7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIHJldmlzaW9uc1N0YXRlKTtcblxuICAgIGNvbnN0IHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gYXdhaXQgdGhpcy5fZ2V0Q2FjaGVkUmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UocmV2aXNpb25zU3RhdGUpO1xuICAgIHRoaXMuX2NvbW1pdE1lcmdlRmlsZUNoYW5nZXMgPSB0aGlzLl9jb21wdXRlQ29tbWl0TWVyZ2VGcm9tSGlzdG9yeShcbiAgICAgIHJldmlzaW9uc1N0YXRlLFxuICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnksXG4gICAgKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoVVBEQVRFX0NPTU1JVF9NRVJHRV9GSUxFU19FVkVOVCk7XG4gIH1cblxuICBvbkRpZFVwZGF0ZURpcnR5RmlsZUNoYW5nZXMoXG4gICAgY2FsbGJhY2s6ICgpID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKFVQREFURV9ESVJUWV9GSUxFU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRVcGRhdGVDb21taXRNZXJnZUZpbGVDaGFuZ2VzKFxuICAgIGNhbGxiYWNrOiAoKSA9PiB2b2lkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihVUERBVEVfQ09NTUlUX01FUkdFX0ZJTEVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZVJldmlzaW9ucyhcbiAgICBjYWxsYmFjazogKHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSkgPT4gdm9pZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oQ0hBTkdFX1JFVklTSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzLmNsZWFyKCk7XG4gICAgdGhpcy5fY29tbWl0TWVyZ2VGaWxlQ2hhbmdlcy5jbGVhcigpO1xuICAgIHRoaXMuX2xhc3RDb21taXRNZXJnZUZpbGVDaGFuZ2VzLmNsZWFyKCk7XG4gICAgdGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMucmVzZXQoKTtcbiAgfVxufVxuIl19