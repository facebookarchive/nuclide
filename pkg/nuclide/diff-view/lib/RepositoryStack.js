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
//# sourceMappingURL=data:application/json;base64,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dG9yeVN0YWNrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeUNsaWVudH0gZnJvbSAnLi4vLi4vaGctcmVwb3NpdG9yeS1jbGllbnQnO1xuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2VTdGF0dXNWYWx1ZSwgSGdEaWZmU3RhdGUsIFJldmlzaW9uc1N0YXRlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtSZXZpc2lvbkZpbGVDaGFuZ2VzfSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL2hnLWNvbnN0YW50cyc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7UmV2aXNpb25JbmZvfSBmcm9tICcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UvbGliL2hnLWNvbnN0YW50cyc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge0hnU3RhdHVzVG9GaWxlQ2hhbmdlU3RhdHVzLCBGaWxlQ2hhbmdlU3RhdHVzfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2dldEZpbGVTeXN0ZW1Db250ZW50c30gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2FycmF5LCBwcm9taXNlcywgZGVib3VuY2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7bm90aWZ5SW50ZXJuYWxFcnJvcn0gZnJvbSAnLi9ub3RpZmljYXRpb25zJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBMUlUgZnJvbSAnbHJ1LWNhY2hlJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5jb25zdCB7c2VyaWFsaXplQXN5bmNDYWxsfSA9IHByb21pc2VzO1xuY29uc3QgQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5UID0gJ2RpZC1jaGFuZ2UtY29tcGFyZS1zdGF0dXMnO1xuY29uc3QgQ0hBTkdFX0RJUlRZX1NUQVRVU19FVkVOVCA9ICdkaWQtY2hhbmdlLWRpcnR5LXN0YXR1cyc7XG5jb25zdCBDSEFOR0VfUkVWSVNJT05TX0VWRU5UID0gJ2RpZC1jaGFuZ2UtcmV2aXNpb25zJztcbmNvbnN0IFVQREFURV9TVEFUVVNfREVCT1VOQ0VfTVMgPSAyMDAwO1xuXG5jb25zdCBGRVRDSF9SRVZfSU5GT19SRVRSWV9USU1FX01TID0gMTAwMDtcbmNvbnN0IEZFVENIX1JFVl9JTkZPX01BWF9UUklFUyA9IDU7XG5cbnR5cGUgUmV2aXNpb25zRmlsZUhpc3RvcnkgPSBBcnJheTx7XG4gIGlkOiBudW1iZXI7XG4gIGNoYW5nZXM6IFJldmlzaW9uRmlsZUNoYW5nZXM7XG59PjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwb3NpdG9yeVN0YWNrIHtcblxuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9kaXJ0eUZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgX2NvbXBhcmVGaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIF9yZXBvc2l0b3J5OiBIZ1JlcG9zaXRvcnlDbGllbnQ7XG4gIF9yZXZpc2lvbnNTdGF0ZVByb21pc2U6ID9Qcm9taXNlPFJldmlzaW9uc1N0YXRlPjtcbiAgX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZTogP1Byb21pc2U8UmV2aXNpb25zRmlsZUhpc3Rvcnk+O1xuICBfbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5OiA/UmV2aXNpb25zRmlsZUhpc3Rvcnk7XG4gIF9zZWxlY3RlZENvbXBhcmVDb21taXRJZDogP251bWJlcjtcbiAgX2lzQWN0aXZlOiBib29sZWFuO1xuICBfc2VyaWFsaXplZFVwZGF0ZVN0YXR1czogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzOiBMUlU8bnVtYmVyLCBSZXZpc2lvbkZpbGVDaGFuZ2VzPjtcblxuICBjb25zdHJ1Y3RvcihyZXBvc2l0b3J5OiBIZ1JlcG9zaXRvcnlDbGllbnQpIHtcbiAgICB0aGlzLl9yZXBvc2l0b3J5ID0gcmVwb3NpdG9yeTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzID0gbmV3IExSVSh7bWF4OiAxMDB9KTtcbiAgICB0aGlzLl9zZWxlY3RlZENvbXBhcmVDb21taXRJZCA9IG51bGw7XG4gICAgdGhpcy5fbGFzdFJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gbnVsbDtcbiAgICB0aGlzLl9zZXJpYWxpemVkVXBkYXRlU3RhdHVzID0gc2VyaWFsaXplQXN5bmNDYWxsKCgpID0+IHRoaXMuX3VwZGF0ZUNoYW5nZWRTdGF0dXMoKSk7XG4gICAgY29uc3QgZGVib3VuY2VkU2VyaWFsaXplZFVwZGF0ZVN0YXR1cyA9IGRlYm91bmNlKFxuICAgICAgdGhpcy5fc2VyaWFsaXplZFVwZGF0ZVN0YXR1cyxcbiAgICAgIFVQREFURV9TVEFUVVNfREVCT1VOQ0VfTVMsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIGRlYm91bmNlZFNlcmlhbGl6ZWRVcGRhdGVTdGF0dXMoKTtcbiAgICAvLyBHZXQgdGhlIGluaXRpYWwgcHJvamVjdCBzdGF0dXMsIGlmIGl0J3Mgbm90IGFscmVhZHkgdGhlcmUsXG4gICAgLy8gdHJpZ2dlcmVkIGJ5IGFub3RoZXIgaW50ZWdyYXRpb24sIGxpa2UgdGhlIGZpbGUgdHJlZS5cbiAgICByZXBvc2l0b3J5LmdldFN0YXR1c2VzKFtyZXBvc2l0b3J5LmdldFByb2plY3REaXJlY3RvcnkoKV0pO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgcmVwb3NpdG9yeS5vbkRpZENoYW5nZVN0YXR1c2VzKGRlYm91bmNlZFNlcmlhbGl6ZWRVcGRhdGVTdGF0dXMpLFxuICAgICk7XG4gIH1cblxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgIHRoaXMuX3NlcmlhbGl6ZWRVcGRhdGVTdGF0dXMoKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZGlmZi12aWV3LnVwZGF0ZS1jaGFuZ2Utc3RhdHVzJylcbiAgYXN5bmMgX3VwZGF0ZUNoYW5nZWRTdGF0dXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3VwZGF0ZURpcnR5RmlsZUNoYW5nZXMoKTtcbiAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZUNvbXBhcmVGaWxlQ2hhbmdlcygpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBub3RpZnlJbnRlcm5hbEVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlRGlydHlGaWxlQ2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXJ0eUZpbGVDaGFuZ2VzID0gdGhpcy5fZ2V0RGlydHlDaGFuZ2VkU3RhdHVzKCk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9ESVJUWV9TVEFUVVNfRVZFTlQsIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXMpO1xuICB9XG5cbiAgX2dldERpcnR5Q2hhbmdlZFN0YXR1cygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgY29uc3QgZGlydHlGaWxlQ2hhbmdlcyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBzdGF0dXNlcyA9IHRoaXMuX3JlcG9zaXRvcnkuZ2V0QWxsUGF0aFN0YXR1c2VzKCk7XG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBpbiBzdGF0dXNlcykge1xuICAgICAgY29uc3QgY2hhbmdlU3RhdHVzID0gSGdTdGF0dXNUb0ZpbGVDaGFuZ2VTdGF0dXNbc3RhdHVzZXNbZmlsZVBhdGhdXTtcbiAgICAgIGlmIChjaGFuZ2VTdGF0dXMgIT0gbnVsbCkge1xuICAgICAgICBkaXJ0eUZpbGVDaGFuZ2VzLnNldChmaWxlUGF0aCwgY2hhbmdlU3RhdHVzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRpcnR5RmlsZUNoYW5nZXM7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBmaWxlIGNoYW5nZSBzdGF0ZSBjb21wYXJpbmcgdGhlIGRpcnR5IGZpbGVzeXN0ZW0gc3RhdHVzXG4gICAqIHRvIGEgc2VsZWN0ZWQgY29tbWl0LlxuICAgKiBUaGF0IHdvdWxkIGJlIGEgbWVyZ2Ugb2YgYGhnIHN0YXR1c2Agd2l0aCB0aGUgZGlmZiBmcm9tIGNvbW1pdHMsXG4gICAqIGFuZCBgaGcgbG9nIC0tcmV2ICR7cmV2SWR9YCBmb3IgZXZlcnkgY29tbWl0LlxuICAgKi9cbiAgYXN5bmMgX3VwZGF0ZUNvbXBhcmVGaWxlQ2hhbmdlcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBXZSBzaG91bGQgb25seSB1cGRhdGUgdGhlIHJldmlzaW9uIHN0YXRlIHdoZW4gdGhlIHJlcG9zaXRvcnkgaXMgYWN0aXZlLlxuICAgIGlmICghdGhpcy5faXNBY3RpdmUpIHtcbiAgICAgIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZSA9IG51bGw7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlID0gYXdhaXQgdGhpcy5fZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIHJldmlzaW9uc1N0YXRlKTtcblxuICAgIC8vIElmIHRoZSBjb21taXRzIGhhdmVuJ3QgY2hhbmdlZCBpZHMsIHRoZW4gdGhpZXIgZGlmZiBoYXZlbid0IGNoYW5nZWQgYXMgd2VsbC5cbiAgICBsZXQgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBudWxsO1xuICAgIGlmICh0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgIT0gbnVsbCkge1xuICAgICAgY29uc3QgZmlsZUhpc3RvcnlSZXZpc2lvbklkcyA9IHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeVxuICAgICAgICAubWFwKHJldmlzaW9uQ2hhbmdlcyA9PiByZXZpc2lvbkNoYW5nZXMuaWQpO1xuICAgICAgY29uc3QgcmV2aXNpb25JZHMgPSByZXZpc2lvbnNTdGF0ZS5yZXZpc2lvbnMubWFwKHJldmlzaW9uID0+IHJldmlzaW9uLmlkKTtcbiAgICAgIGlmIChhcnJheS5lcXVhbChyZXZpc2lvbklkcywgZmlsZUhpc3RvcnlSZXZpc2lvbklkcykpIHtcbiAgICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3Rvcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRmV0Y2ggcmV2aXNpb25zIGhpc3RvcnkgaWYgcmV2aXNpb25zIHN0YXRlIGhhdmUgY2hhbmdlZC5cbiAgICBpZiAocmV2aXNpb25zRmlsZUhpc3RvcnkgPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnkgPSBhd2FpdCB0aGlzLl9nZXRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShyZXZpc2lvbnNTdGF0ZSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgICAgJ0Nhbm5vdCBmZXRjaCByZXZpc2lvbiBoaXN0b3J5OiAnICtcbiAgICAgICAgICAnKGNvdWxkIGhhcHBlbiB3aXRoIHBlbmRpbmcgc291cmNlLWNvbnRyb2wgaGlzdG9yeSB3cml0aW5nIG9wZXJhdGlvbnMpJyxcbiAgICAgICAgICBlcnJvcixcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMgPSB0aGlzLl9jb21wdXRlQ29tcGFyZUNoYW5nZXNGcm9tSGlzdG9yeShcbiAgICAgIHJldmlzaW9uc1N0YXRlLFxuICAgICAgcmV2aXNpb25zRmlsZUhpc3RvcnksXG4gICAgKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoQ0hBTkdFX0NPTVBBUkVfU1RBVFVTX0VWRU5ULCB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXMpO1xuICB9XG5cbiAgX2dldFJldmlzaW9uc1N0YXRlUHJvbWlzZSgpOiBQcm9taXNlPFJldmlzaW9uc1N0YXRlPiB7XG4gICAgdGhpcy5fcmV2aXNpb25zU3RhdGVQcm9taXNlID0gdGhpcy5fZmV0Y2hSZXZpc2lvbnNTdGF0ZSgpLnRoZW4oXG4gICAgICB0aGlzLl9hbWVuZFNlbGVjdGVkQ29tcGFyZUNvbW1pdElkLmJpbmQodGhpcyksXG4gICAgICBlcnJvciA9PiB7XG4gICAgICAgIHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZSA9IG51bGw7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSxcbiAgICApO1xuICAgIHJldHVybiB0aGlzLl9yZXZpc2lvbnNTdGF0ZVByb21pc2U7XG4gIH1cblxuICBnZXRDYWNoZWRSZXZpc2lvbnNTdGF0ZVByb21pc2UoKTogUHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT4ge1xuICAgIGNvbnN0IHJldmlzaW9uc1N0YXRlUHJvbWlzZSA9IHRoaXMuX3JldmlzaW9uc1N0YXRlUHJvbWlzZTtcbiAgICBpZiAocmV2aXNpb25zU3RhdGVQcm9taXNlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiByZXZpc2lvbnNTdGF0ZVByb21pc2UudGhlbih0aGlzLl9hbWVuZFNlbGVjdGVkQ29tcGFyZUNvbW1pdElkLmJpbmQodGhpcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0UmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFtZW5kIHRoZSByZXZpc2lvbnMgc3RhdGUgd2l0aCB0aGUgbGF0ZXN0IHNlbGVjdGVkIHZhbGlkIGNvbXBhcmUgY29tbWl0IGlkLlxuICAgKi9cbiAgX2FtZW5kU2VsZWN0ZWRDb21wYXJlQ29tbWl0SWQocmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlKTogUmV2aXNpb25zU3RhdGUge1xuICAgIGNvbnN0IHtjb21taXRJZCwgcmV2aXNpb25zfSA9IHJldmlzaW9uc1N0YXRlO1xuICAgIC8vIFByaW9yaXRpemUgdGhlIGNhY2hlZCBjb21wYWVyZUNvbW1pdElkLCBpZiBpdCBleGlzdHMuXG4gICAgLy8gVGhlIHVzZXIgY291bGQgaGF2ZSBzZWxlY3RlZCB0aGF0IGZyb20gdGhlIHRpbWVsaW5lIHZpZXcuXG4gICAgbGV0IGNvbXBhcmVDb21taXRJZCA9IHRoaXMuX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkO1xuICAgIGlmICghYXJyYXkuZmluZChyZXZpc2lvbnMsIHJldmlzaW9uID0+IHJldmlzaW9uLmlkID09PSBjb21wYXJlQ29tbWl0SWQpKSB7XG4gICAgICAvLyBJbnZhbGlkYXRlIGlmIHRoZXJlIHRoZXJlIGlzIG5vIGxvbmdlciBhIHJldmlzaW9uIHdpdGggdGhhdCBpZC5cbiAgICAgIGNvbXBhcmVDb21taXRJZCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zID0gcmV2aXNpb25zLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIGlmIChjb21wYXJlQ29tbWl0SWQgPT0gbnVsbCAmJiBsYXRlc3RUb09sZGVzdFJldmlzaW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBJZiB0aGUgdXNlciBoYXMgYWxyZWFkeSBjb21taXR0ZWQsIG1vc3Qgb2YgdGhlIHRpbWVzLCBoZSdkIGJlIHdvcmtpbmcgb24gYW4gYW1lbmQuXG4gICAgICAvLyBTbywgdGhlIGhldXJpc3RpYyBoZXJlIGlzIHRvIGNvbXBhcmUgYWdhaW5zdCB0aGUgcHJldmlvdXMgdmVyc2lvbixcbiAgICAgIC8vIG5vdCB0aGUganVzdC1jb21taXR0ZWQgb25lLCB3aGlsZSB0aGUgcmV2aXNpb25zIHRpbWVsaW5lXG4gICAgICAvLyB3b3VsZCBnaXZlIGEgd2F5IHRvIHNwZWNpZnkgb3RoZXJ3aXNlLlxuICAgICAgY29tcGFyZUNvbW1pdElkID0gbGF0ZXN0VG9PbGRlc3RSZXZpc2lvbnNbMV0uaWQ7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXZpc2lvbnMsXG4gICAgICBjb21taXRJZCxcbiAgICAgIGNvbXBhcmVDb21taXRJZCxcbiAgICB9O1xuICB9XG5cbiAgX2dldFJldmlzaW9uRmlsZUhpc3RvcnlQcm9taXNlKFxuICAgIHJldmlzaW9uc1N0YXRlOiBSZXZpc2lvbnNTdGF0ZSxcbiAgKTogUHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT4ge1xuICAgIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZSA9IHRoaXMuX2ZldGNoUmV2aXNpb25zRmlsZUhpc3RvcnkocmV2aXNpb25zU3RhdGUpXG4gICAgICAudGhlbihyZXZpc2lvbnNGaWxlSGlzdG9yeSA9PlxuICAgICAgICB0aGlzLl9sYXN0UmV2aXNpb25zRmlsZUhpc3RvcnkgPSByZXZpc2lvbnNGaWxlSGlzdG9yeVxuICAgICAgLCBlcnJvciA9PiB7XG4gICAgICAgIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX2xhc3RSZXZpc2lvbnNGaWxlSGlzdG9yeSA9IG51bGw7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX3JldmlzaW9uc0ZpbGVIaXN0b3J5UHJvbWlzZTtcbiAgfVxuXG4gIF9nZXRDYWNoZWRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShcbiAgICByZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUsXG4gICk6IFByb21pc2U8UmV2aXNpb25zRmlsZUhpc3Rvcnk+IHtcbiAgICBpZiAodGhpcy5fcmV2aXNpb25zRmlsZUhpc3RvcnlQcm9taXNlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXZpc2lvbnNGaWxlSGlzdG9yeVByb21pc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRSZXZpc2lvbkZpbGVIaXN0b3J5UHJvbWlzZShyZXZpc2lvbnNTdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmV0Y2gtcmV2aXNpb25zLXN0YXRlJylcbiAgYXN5bmMgX2ZldGNoUmV2aXNpb25zU3RhdGUoKTogUHJvbWlzZTxSZXZpc2lvbnNTdGF0ZT4ge1xuICAgIC8vIFdoaWxlIHJlYmFzaW5nLCB0aGUgY29tbW9uIGFuY2VzdG9yIG9mIGBIRUFEYCBhbmQgYEJBU0VgXG4gICAgLy8gbWF5IGJlIG5vdCBhcHBsaWNhYmxlLCBidXQgdGhhdCdzIGRlZmluZWQgb25jZSB0aGUgcmViYXNlIGlzIGRvbmUuXG4gICAgLy8gSGVuY2UsIHdlIG5lZWQgdG8gcmV0cnkgZmV0Y2hpbmcgdGhlIHJldmlzaW9uIGluZm8gKGRlcGVuZGluZyBvbiB0aGUgY29tbW9uIGFuY2VzdG9yKVxuICAgIC8vIGJlY2F1c2UgdGhlIHdhdGNobWFuLWJhc2VkIE1lcmN1cmlhbCB1cGRhdGVzIGRvZXNuJ3QgY29uc2lkZXIgb3Igd2FpdCB3aGlsZSByZWJhc2luZy5cbiAgICBjb25zdCByZXZpc2lvbnMgPSBhd2FpdCBwcm9taXNlcy5yZXRyeUxpbWl0KFxuICAgICAgKCkgPT4gdGhpcy5fcmVwb3NpdG9yeS5mZXRjaFJldmlzaW9uSW5mb0JldHdlZW5IZWFkQW5kQmFzZSgpLFxuICAgICAgcmVzdWx0ID0+IHJlc3VsdCAhPSBudWxsLFxuICAgICAgRkVUQ0hfUkVWX0lORk9fTUFYX1RSSUVTLFxuICAgICAgRkVUQ0hfUkVWX0lORk9fUkVUUllfVElNRV9NUyxcbiAgICApO1xuICAgIGlmIChyZXZpc2lvbnMgPT0gbnVsbCB8fCByZXZpc2lvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmZXRjaCByZXZpc2lvbiBpbmZvIG5lZWRlZCEnKTtcbiAgICB9XG4gICAgY29uc3QgY29tbWl0SWQgPSByZXZpc2lvbnNbcmV2aXNpb25zLmxlbmd0aCAtIDFdLmlkO1xuICAgIHJldHVybiB7XG4gICAgICByZXZpc2lvbnMsXG4gICAgICBjb21taXRJZCxcbiAgICAgIGNvbXBhcmVDb21taXRJZDogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdkaWZmLXZpZXcuZmV0Y2gtcmV2aXNpb25zLWNoYW5nZS1oaXN0b3J5JylcbiAgYXN5bmMgX2ZldGNoUmV2aXNpb25zRmlsZUhpc3RvcnkocmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlKTogUHJvbWlzZTxSZXZpc2lvbnNGaWxlSGlzdG9yeT4ge1xuICAgIGNvbnN0IHtyZXZpc2lvbnN9ID0gcmV2aXNpb25zU3RhdGU7XG5cbiAgICAvLyBSZXZpc2lvbiBpZHMgYXJlIHVuaXF1ZSBhbmQgZG9uJ3QgY2hhbmdlLCBleGNlcHQgd2hlbiB0aGUgcmV2aXNpb24gaXMgYW1lbmRlZC9yZWJhc2VkLlxuICAgIC8vIEhlbmNlLCBpdCdzIGNhY2hlZCBoZXJlIHRvIGF2b2lkIHNlcnZpY2UgY2FsbHMgd2hlbiB3b3JraW5nIG9uIGEgc3RhY2sgb2YgY29tbWl0cy5cbiAgICBjb25zdCByZXZpc2lvbnNGaWxlSGlzdG9yeSA9IGF3YWl0IFByb21pc2UuYWxsKHJldmlzaW9uc1xuICAgICAgLm1hcChhc3luYyByZXZpc2lvbiA9PiB7XG4gICAgICAgIGNvbnN0IHtpZH0gPSByZXZpc2lvbjtcbiAgICAgICAgbGV0IGNoYW5nZXMgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5fcmV2aXNpb25JZFRvRmlsZUNoYW5nZXMuaGFzKGlkKSkge1xuICAgICAgICAgIGNoYW5nZXMgPSB0aGlzLl9yZXZpc2lvbklkVG9GaWxlQ2hhbmdlcy5nZXQoaWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNoYW5nZXMgPSBhd2FpdCB0aGlzLl9yZXBvc2l0b3J5LmZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbihgJHtpZH1gKTtcbiAgICAgICAgICBpZiAoY2hhbmdlcyA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENoYW5nZXMgbm90IGF2YWlsYWJsZSBmb3IgcmV2aXNpb246ICR7aWR9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLnNldChpZCwgY2hhbmdlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtpZCwgY2hhbmdlc307XG4gICAgICB9KVxuICAgICk7XG5cbiAgICByZXR1cm4gcmV2aXNpb25zRmlsZUhpc3Rvcnk7XG4gIH1cblxuICBfY29tcHV0ZUNvbXBhcmVDaGFuZ2VzRnJvbUhpc3RvcnkoXG4gICAgcmV2aXNpb25zU3RhdGU6IFJldmlzaW9uc1N0YXRlLFxuICAgIHJldmlzaW9uc0ZpbGVIaXN0b3J5OiBSZXZpc2lvbnNGaWxlSGlzdG9yeSxcbiAgKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuXG4gICAgY29uc3Qge2NvbW1pdElkLCBjb21wYXJlQ29tbWl0SWR9ID0gcmV2aXNpb25zU3RhdGU7XG4gICAgLy8gVGhlIHN0YXR1cyBpcyBmZXRjaGVkIGJ5IG1lcmdpbmcgdGhlIGNoYW5nZXMgcmlnaHQgYWZ0ZXIgdGhlIGBjb21wYXJlQ29tbWl0SWRgIGlmIHNwZWNpZmllZCxcbiAgICAvLyBvciBgSEVBRGAgaWYgbm90LlxuICAgIGNvbnN0IHN0YXJ0Q29tbWl0SWQgPSBjb21wYXJlQ29tbWl0SWQgPyAoY29tcGFyZUNvbW1pdElkICsgMSkgOiBjb21taXRJZDtcbiAgICAvLyBHZXQgdGhlIHJldmlzaW9uIGNoYW5nZXMgdGhhdCdzIG5ld2VyIHRoYW4gb3IgaXMgdGhlIGN1cnJlbnQgY29tbWl0IGlkLlxuICAgIGNvbnN0IGNvbXBhcmVSZXZpc2lvbnNGaWxlQ2hhbmdlcyA9IHJldmlzaW9uc0ZpbGVIaXN0b3J5XG4gICAgICAuc2xpY2UoMSkgLy8gRXhjbHVkZSB0aGUgQkFTRSByZXZpc2lvbi5cbiAgICAgIC5maWx0ZXIocmV2aXNpb24gPT4gcmV2aXNpb24uaWQgPj0gc3RhcnRDb21taXRJZClcbiAgICAgIC5tYXAocmV2aXNpb24gPT4gcmV2aXNpb24uY2hhbmdlcyk7XG5cbiAgICAvLyBUaGUgbGFzdCBzdGF0dXMgdG8gbWVyZ2UgaXMgdGhlIGRpcnR5IGZpbGVzeXN0ZW0gc3RhdHVzLlxuICAgIGNvbnN0IG1lcmdlZEZpbGVTdGF0dXNlcyA9IHRoaXMuX21lcmdlRmlsZVN0YXR1c2VzKFxuICAgICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcyxcbiAgICAgIGNvbXBhcmVSZXZpc2lvbnNGaWxlQ2hhbmdlcyxcbiAgICApO1xuICAgIHJldHVybiBtZXJnZWRGaWxlU3RhdHVzZXM7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2VzIHRoZSBmaWxlIGNoYW5nZSBzdGF0dXNlcyBvZiB0aGUgZGlydHkgZmlsZXN5c3RlbSBzdGF0ZSB3aXRoXG4gICAqIHRoZSByZXZpc2lvbiBjaGFuZ2VzLCB3aGVyZSBkaXJ0eSBjaGFuZ2VzIGFuZCBtb3JlIHJlY2VudCByZXZpc2lvbnNcbiAgICogdGFrZSBwcmlvcml0eSBpbiBkZWNpZGluZyB3aGljaCBzdGF0dXMgYSBmaWxlIGlzIGluLlxuICAgKi9cbiAgX21lcmdlRmlsZVN0YXR1c2VzKFxuICAgIGRpcnR5U3RhdHVzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPixcbiAgICByZXZpc2lvbnNGaWxlQ2hhbmdlczogQXJyYXk8UmV2aXNpb25GaWxlQ2hhbmdlcz4sXG4gICk6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+IHtcbiAgICBjb25zdCBtZXJnZWRTdGF0dXMgPSBuZXcgTWFwKGRpcnR5U3RhdHVzKTtcbiAgICBjb25zdCBtZXJnZWRGaWxlUGF0aHMgPSBuZXcgU2V0KG1lcmdlZFN0YXR1cy5rZXlzKCkpO1xuXG4gICAgZnVuY3Rpb24gbWVyZ2VTdGF0dXNQYXRocyhcbiAgICAgIGZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4sXG4gICAgICBjaGFuZ2VTdGF0dXNWYWx1ZTogRmlsZUNoYW5nZVN0YXR1c1ZhbHVlLFxuICAgICkge1xuICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBmaWxlUGF0aHMpIHtcbiAgICAgICAgaWYgKCFtZXJnZWRGaWxlUGF0aHMuaGFzKGZpbGVQYXRoKSkge1xuICAgICAgICAgIG1lcmdlZFN0YXR1cy5zZXQoZmlsZVBhdGgsIGNoYW5nZVN0YXR1c1ZhbHVlKTtcbiAgICAgICAgICBtZXJnZWRGaWxlUGF0aHMuYWRkKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfVxuXG4gICAgLy8gTW9yZSByZWNlbnQgcmV2aXNpb24gY2hhbmdlcyB0YWtlcyBwcmlvcml0eSBpbiBzcGVjaWZ5aW5nIGEgZmlsZXMnIHN0YXR1c2VzLlxuICAgIGNvbnN0IGxhdGVzdFRvT2xkZXN0UmV2aXNpb25zQ2hhbmdlcyA9IHJldmlzaW9uc0ZpbGVDaGFuZ2VzLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIGZvciAoY29uc3QgcmV2aXNpb25GaWxlQ2hhbmdlcyBvZiBsYXRlc3RUb09sZGVzdFJldmlzaW9uc0NoYW5nZXMpIHtcbiAgICAgIGNvbnN0IHthZGRlZCwgbW9kaWZpZWQsIGRlbGV0ZWR9ID0gcmV2aXNpb25GaWxlQ2hhbmdlcztcblxuICAgICAgbWVyZ2VTdGF0dXNQYXRocyhhZGRlZCwgRmlsZUNoYW5nZVN0YXR1cy5BRERFRCk7XG4gICAgICBtZXJnZVN0YXR1c1BhdGhzKG1vZGlmaWVkLCBGaWxlQ2hhbmdlU3RhdHVzLk1PRElGSUVEKTtcbiAgICAgIG1lcmdlU3RhdHVzUGF0aHMoZGVsZXRlZCwgRmlsZUNoYW5nZVN0YXR1cy5ERUxFVEVEKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVyZ2VkU3RhdHVzO1xuICB9XG5cbiAgZ2V0RGlydHlGaWxlQ2hhbmdlcygpOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RpcnR5RmlsZUNoYW5nZXM7XG4gIH1cblxuICBnZXRDb21wYXJlRmlsZUNoYW5nZXMoKTogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4ge1xuICAgIHJldHVybiB0aGlzLl9jb21wYXJlRmlsZUNoYW5nZXM7XG4gIH1cblxuICBhc3luYyBmZXRjaEhnRGlmZihmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8SGdEaWZmU3RhdGU+IHtcbiAgICBjb25zdCB7cmV2aXNpb25zLCBjb21taXRJZCwgY29tcGFyZUNvbW1pdElkfSA9IGF3YWl0IHRoaXMuZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgY29uc3QgY29tbWl0dGVkQ29udGVudHMgPSBhd2FpdCB0aGlzLl9yZXBvc2l0b3J5XG4gICAgICAuZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24oZmlsZVBhdGgsIGNvbXBhcmVDb21taXRJZCA/IGAke2NvbXBhcmVDb21taXRJZH1gIDogbnVsbClcbiAgICAgIC8vIElmIHRoZSBmaWxlIGRpZG4ndCBleGlzdCBvbiB0aGUgcHJldmlvdXMgcmV2aXNpb24sIHJldHVybiBlbXB0eSBjb250ZW50cy5cbiAgICAgIC50aGVuKGNvbnRlbnRzID0+IGNvbnRlbnRzIHx8ICcnLCBfZXJyID0+ICcnKTtcblxuICAgIC8vIEludGVudGlvbmFsbHkgZmV0Y2ggdGhlIGZpbGVzeXN0ZW0gY29udGVudHMgYWZ0ZXIgZ2V0dGluZyB0aGUgY29tbWl0dGVkIGNvbnRlbnRzXG4gICAgLy8gdG8gbWFrZSBzdXJlIHdlIGhhdmUgdGhlIGxhdGVzdCBmaWxlc3lzdGVtIHZlcnNpb24uXG4gICAgY29uc3QgZmlsZXN5c3RlbUNvbnRlbnRzID0gYXdhaXQgZ2V0RmlsZVN5c3RlbUNvbnRlbnRzKGZpbGVQYXRoKTtcblxuICAgIGNvbnN0IGZldGNoZWRSZXZpc2lvbklkID0gY29tcGFyZUNvbW1pdElkICE9IG51bGwgPyBjb21wYXJlQ29tbWl0SWQgOiBjb21taXRJZDtcbiAgICBjb25zdCBbcmV2aXNpb25JbmZvXSA9IHJldmlzaW9ucy5maWx0ZXIocmV2aXNpb24gPT4gcmV2aXNpb24uaWQgPT09IGZldGNoZWRSZXZpc2lvbklkKTtcbiAgICBpbnZhcmlhbnQoXG4gICAgICByZXZpc2lvbkluZm8sXG4gICAgICBgRGlmZiBWaXcgRmV0Y2hlcjogcmV2aXNpb24gd2l0aCBpZCAke2ZldGNoZWRSZXZpc2lvbklkfSBub3QgZm91bmRgLFxuICAgICk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbW1pdHRlZENvbnRlbnRzLFxuICAgICAgZmlsZXN5c3RlbUNvbnRlbnRzLFxuICAgICAgcmV2aXNpb25JbmZvLFxuICAgIH07XG4gIH1cblxuICBnZXRUZW1wbGF0ZUNvbW1pdE1lc3NhZ2UoKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcG9zaXRvcnkuZ2V0Q29uZmlnVmFsdWVBc3luYygnY29tbWl0dGVtcGxhdGUuZW1wdHltc2cnKTtcbiAgfVxuXG4gIGFzeW5jIHNldFJldmlzaW9uKHJldmlzaW9uOiBSZXZpc2lvbkluZm8pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCByZXZpc2lvbnNTdGF0ZSA9IGF3YWl0IHRoaXMuZ2V0Q2FjaGVkUmV2aXNpb25zU3RhdGVQcm9taXNlKCk7XG4gICAgY29uc3Qge3JldmlzaW9uc30gPSByZXZpc2lvbnNTdGF0ZTtcblxuICAgIGludmFyaWFudChcbiAgICAgIHJldmlzaW9ucyAmJiByZXZpc2lvbnMuaW5kZXhPZihyZXZpc2lvbikgIT09IC0xLFxuICAgICAgJ0RpZmYgVml3IFRpbWVsaW5lOiBub24tYXBwbGljYWJsZSBzZWxlY3RlZCByZXZpc2lvbicsXG4gICAgKTtcblxuICAgIHRoaXMuX3NlbGVjdGVkQ29tcGFyZUNvbW1pdElkID0gcmV2aXNpb25zU3RhdGUuY29tcGFyZUNvbW1pdElkID0gcmV2aXNpb24uaWQ7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIHJldmlzaW9uc1N0YXRlKTtcblxuICAgIGNvbnN0IHJldmlzaW9uc0ZpbGVIaXN0b3J5ID0gYXdhaXQgdGhpcy5fZ2V0Q2FjaGVkUmV2aXNpb25GaWxlSGlzdG9yeVByb21pc2UocmV2aXNpb25zU3RhdGUpO1xuICAgIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyA9IHRoaXMuX2NvbXB1dGVDb21wYXJlQ2hhbmdlc0Zyb21IaXN0b3J5KFxuICAgICAgcmV2aXNpb25zU3RhdGUsXG4gICAgICByZXZpc2lvbnNGaWxlSGlzdG9yeSxcbiAgICApO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChDSEFOR0VfQ09NUEFSRV9TVEFUVVNfRVZFTlQsIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcyk7XG4gIH1cblxuICBvbkRpZENoYW5nZURpcnR5U3RhdHVzKFxuICAgIGNhbGxiYWNrOiAoZmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+KSA9PiB2b2lkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihDSEFOR0VfRElSVFlfU1RBVFVTX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRpZENoYW5nZUNvbXBhcmVTdGF0dXMoXG4gICAgY2FsbGJhY2s6IChmaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT4pID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9DT01QQVJFX1NUQVRVU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VSZXZpc2lvbnMoXG4gICAgY2FsbGJhY2s6IChyZXZpc2lvbnNTdGF0ZTogUmV2aXNpb25zU3RhdGUpID0+IHZvaWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKENIQU5HRV9SRVZJU0lPTlNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgdGhpcy5fZGlydHlGaWxlQ2hhbmdlcy5jbGVhcigpO1xuICAgIHRoaXMuX2NvbXBhcmVGaWxlQ2hhbmdlcy5jbGVhcigpO1xuICAgIHRoaXMuX3JldmlzaW9uSWRUb0ZpbGVDaGFuZ2VzLnJlc2V0KCk7XG4gIH1cbn1cbiJdfQ==