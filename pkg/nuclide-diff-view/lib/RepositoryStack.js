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
      if (!revisions.find(function (revision) {
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

      if (!this._isActive) {
        throw new Error('Diff View should not fetch revisions while not active');
      }
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

      (0, _assert2['default'])(revisions && revisions.find(function (check) {
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