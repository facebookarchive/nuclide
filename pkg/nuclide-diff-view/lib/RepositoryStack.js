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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.getHeadRevision = getHeadRevision;
exports.getHeadToForkBaseRevisions = getHeadToForkBaseRevisions;
exports.getDirtyFileChanges = getDirtyFileChanges;
exports.getSelectedFileChanges = getSelectedFileChanges;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _notifications2;

function _notifications() {
  return _notifications2 = require('./notifications');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideHgRpc2;

function _nuclideHgRpc() {
  return _nuclideHgRpc2 = require('../../nuclide-hg-rpc');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var UPDATE_SELECTED_FILE_CHANGES_EVENT = 'update-selected-file-changes';
var UPDATE_DIRTY_FILES_EVENT = 'update-dirty-files';
var CHANGE_REVISIONS_STATE_EVENT = 'did-change-state-revisions';
var UPDATE_STATUS_DEBOUNCE_MS = 50;
var REVISION_STATE_TIMEOUT_MS = 50 * 1000;

function getHeadRevision(revisions) {
  var HEAD_COMMIT_TAG = (_nuclideHgRpc2 || _nuclideHgRpc()).hgConstants.HEAD_COMMIT_TAG;

  return revisions.find(function (revision) {
    return revision.tags.includes(HEAD_COMMIT_TAG);
  });
}

/**
 * Merges the file change statuses of the dirty filesystem state with
 * the revision changes, where dirty changes and more recent revisions
 * take priority in deciding which status a file is in.
 */
function mergeFileStatuses(dirtyStatus, revisionsFileChanges) {
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

    mergeStatusPaths(added, (_constants2 || _constants()).FileChangeStatus.ADDED);
    mergeStatusPaths(modified, (_constants2 || _constants()).FileChangeStatus.MODIFIED);
    mergeStatusPaths(deleted, (_constants2 || _constants()).FileChangeStatus.REMOVED);
  }

  return mergedStatus;
}

function getHeadToForkBaseRevisions(revisions) {
  // `headToForkBaseRevisions` should have the public commit at the fork base as the first.
  // and the rest of the current `HEAD` stack in order with the `HEAD` being last.
  var headRevision = getHeadRevision(revisions);
  if (headRevision == null) {
    return [];
  }

  var CommitPhase = (_nuclideHgRpc2 || _nuclideHgRpc()).hgConstants.CommitPhase;

  var hashToRevisionInfo = new Map(revisions.map(function (revision) {
    return [revision.hash, revision];
  }));
  var headToForkBaseRevisions = [];
  var parentRevision = headRevision;
  while (parentRevision != null && parentRevision.phase !== CommitPhase.PUBLIC) {
    headToForkBaseRevisions.unshift(parentRevision);
    parentRevision = hashToRevisionInfo.get(parentRevision.parents[0]);
  }
  if (parentRevision != null) {
    headToForkBaseRevisions.unshift(parentRevision);
  }
  return headToForkBaseRevisions;
}

function getDirtyFileChanges(repository) {
  var dirtyFileChanges = new Map();
  var statuses = repository.getAllPathStatuses();
  for (var filePath in statuses) {
    var changeStatus = (_constants2 || _constants()).HgStatusToFileChangeStatus[statuses[filePath]];
    if (changeStatus != null) {
      dirtyFileChanges.set(filePath, changeStatus);
    }
  }
  return dirtyFileChanges;
}

function fetchFileChangesForRevisions(repository, revisions) {
  var _Observable;

  if (revisions.length === 0) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of([]);
  }
  // Revision ids are unique and don't change, except when the revision is amended/rebased.
  // Hence, it's cached here to avoid service calls when working on a stack of commits.
  // $FlowFixMe(matthewwithanm) Type this.
  return (_Observable = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable).forkJoin.apply(_Observable, _toConsumableArray(revisions.map(function (revision) {
    return repository.fetchFilesChangedAtRevision('' + revision.id);
  })));
}

function getSelectedFileChanges(repository, diffOption, revisions, compareCommitId) {
  var dirtyFileChanges = getDirtyFileChanges(repository);

  if (diffOption === (_constants2 || _constants()).DiffOption.DIRTY || diffOption === (_constants2 || _constants()).DiffOption.COMPARE_COMMIT && compareCommitId == null) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(dirtyFileChanges);
  }
  var headToForkBaseRevisions = getHeadToForkBaseRevisions(revisions);
  if (headToForkBaseRevisions.length <= 1) {
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(dirtyFileChanges);
  }

  var beforeCommitId = diffOption === (_constants2 || _constants()).DiffOption.LAST_COMMIT ? headToForkBaseRevisions[headToForkBaseRevisions.length - 2].id : compareCommitId;

  (0, (_assert2 || _assert()).default)(beforeCommitId != null, 'compareCommitId cannot be null!');
  return getSelectedFileChangesToCommit(repository, headToForkBaseRevisions, beforeCommitId, dirtyFileChanges);
}

function getSelectedFileChangesToCommit(repository, headToForkBaseRevisions, beforeCommitId, dirtyFileChanges) {
  var latestToOldesRevisions = headToForkBaseRevisions.slice().reverse();
  return fetchFileChangesForRevisions(repository, latestToOldesRevisions.filter(function (revision) {
    return revision.id > beforeCommitId;
  })).map(function (revisionChanges) {
    return mergeFileStatuses(dirtyFileChanges, revisionChanges);
  });
}

var RepositoryStack = (function () {
  function RepositoryStack(repository, diffOption) {
    var _this = this;

    _classCallCheck(this, RepositoryStack);

    this._repository = repository;
    this._emitter = new (_atom2 || _atom()).Emitter();
    this._dirtyFileChanges = new Map();
    this._selectedFileChanges = new Map();
    this._selectedCompareCommitId = null;
    this._diffOption = diffOption;

    this._serializedUpdateSelectedFileChanges = (0, (_commonsNodePromise2 || _commonsNodePromise()).serializeAsyncCall)(function () {
      return _this._updateSelectedFileChanges();
    });
    // Get the initial project status, if it's not already there,
    // triggered by another integration, like the file tree.
    repository.getStatuses([repository.getProjectDirectory()]);
    this._subscriptions = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(
    // Do the lightweight dirty cache update to reflect the changes,
    // While only commit merge changes consumers wait for its results.
    repository.onDidChangeStatuses(this._updateDirtyFileChanges.bind(this)));
  }

  _createClass(RepositoryStack, [{
    key: 'setDiffOption',
    value: function setDiffOption(diffOption) {
      if (this._diffOption === diffOption) {
        return;
      }
      this._diffOption = diffOption;
      this._serializedUpdateSelectedFileChanges().catch((_notifications2 || _notifications()).notifyInternalError);
    }
  }, {
    key: 'activate',
    value: function activate() {
      var _this2 = this;

      if (this._activeSubscriptions != null) {
        return;
      }
      var revisionChanges = this._repository.observeRevisionChanges();
      var revisionStatusChanges = this._repository.observeRevisionStatusesChanges();
      var statusChanges = (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(this._repository.onDidChangeStatuses.bind(this._repository)).debounceTime(UPDATE_STATUS_DEBOUNCE_MS).startWith(null);

      var updateSelectedFiles = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge(revisionChanges, statusChanges).switchMap(function () {
        return(
          // Ideally, Observables should have no side effects,
          // but here, that helps manage async code flows till migration complete to Observables.
          (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise(_this2._serializedUpdateSelectedFileChanges())
        );
      }).catch(function (error) {
        (0, (_notifications2 || _notifications()).notifyInternalError)(error);
        return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
      }).subscribe();

      var updateRevisionsStateSubscription = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge(revisionChanges, revisionStatusChanges).subscribe(function () {
        _this2._emitter.emit(CHANGE_REVISIONS_STATE_EVENT);
      });

      this._activeSubscriptions = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(updateSelectedFiles, updateRevisionsStateSubscription);
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      if (this._activeSubscriptions != null) {
        this._activeSubscriptions.dispose();
        this._activeSubscriptions = null;
      }
    }
  }, {
    key: '_updateDirtyFileChanges',
    value: function _updateDirtyFileChanges() {
      this._dirtyFileChanges = getDirtyFileChanges(this._repository);
      this._emitter.emit(UPDATE_DIRTY_FILES_EVENT);
    }
  }, {
    key: '_waitForValidRevisionsState',
    value: function _waitForValidRevisionsState() {
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(this._repository.getCachedRevisions()).concat(this._repository.observeRevisionChanges()).filter(function (revisions) {
        return getHeadRevision(revisions) != null;
      }).take(1).timeout(REVISION_STATE_TIMEOUT_MS, new Error('Timed out waiting for a valid revisions state')).ignoreElements().toPromise();
    }

    /**
     * Update the file change state comparing the dirty filesystem status
     * to a selected commit.
     * That would be a merge of `hg status` with the diff from commits,
     * and `hg log --rev ${revId}` for every commit.
     */
  }, {
    key: '_updateSelectedFileChanges',
    value: _asyncToGenerator(function* () {
      var revisionsState = this.getCachedRevisionsState();
      if (revisionsState == null) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().warn('Cannot update selected file changes for null revisions state');
        return;
      }
      this._selectedFileChanges = yield getSelectedFileChanges(this._repository, this._diffOption, revisionsState.revisions, revisionsState.compareCommitId).toPromise();
      this._emitter.emit(UPDATE_SELECTED_FILE_CHANGES_EVENT);
    })
  }, {
    key: 'refreshRevisionsState',
    value: function refreshRevisionsState() {
      this._repository.refreshRevisions();
    }
  }, {
    key: 'getCachedRevisionsState',
    value: function getCachedRevisionsState() {
      return this._createRevisionsState(this._repository.getCachedRevisions());
    }

    /**
     * Amend the revisions state with the latest selected valid compare commit id.
     */
  }, {
    key: '_createRevisionsState',
    value: function _createRevisionsState(revisions) {
      var headRevision = getHeadRevision(revisions);
      if (headRevision == null) {
        return null;
      }
      // Prioritize the cached compaereCommitId, if it exists.
      // The user could have selected that from the timeline view.
      var compareCommitId = this._selectedCompareCommitId;
      if (!revisions.find(function (revision) {
        return revision.id === compareCommitId;
      })) {
        // Invalidate if there there is no longer a revision with that id.
        compareCommitId = null;
      }
      var revisionStatuses = this._repository.getCachedRevisionStatuses();

      return {
        headCommitId: headRevision.id,
        compareCommitId: compareCommitId,
        revisionStatuses: revisionStatuses,
        headToForkBaseRevisions: getHeadToForkBaseRevisions(revisions),
        revisions: revisions
      };
    }
  }, {
    key: 'getDirtyFileChanges',
    value: function getDirtyFileChanges() {
      return this._dirtyFileChanges;
    }
  }, {
    key: 'getSelectedFileChanges',
    value: function getSelectedFileChanges() {
      return this._selectedFileChanges;
    }
  }, {
    key: 'fetchHgDiff',
    value: _asyncToGenerator(function* (filePath) {
      // During a initialization, rebase or histedit,
      // the loaded revisions may not have a head revision to be able to diff against.
      yield this._waitForValidRevisionsState();

      var revisionsState = this.getCachedRevisionsState();
      if (revisionsState == null) {
        throw new Error('Cannot fetch hg diff while revisions not yet fetched!');
      }
      var headToForkBaseRevisions = revisionsState.headToForkBaseRevisions;
      var headCommitId = revisionsState.headCommitId;

      // When `compareCommitId` is null, the `HEAD` commit contents is compared
      // to the filesystem, otherwise it compares that commit to filesystem.
      var compareCommitId = undefined;
      switch (this._diffOption) {
        case (_constants2 || _constants()).DiffOption.DIRTY:
          compareCommitId = headCommitId;
          break;
        case (_constants2 || _constants()).DiffOption.LAST_COMMIT:
          compareCommitId = headToForkBaseRevisions.length > 1 ? headToForkBaseRevisions[headToForkBaseRevisions.length - 2].id : headCommitId;
          break;
        case (_constants2 || _constants()).DiffOption.COMPARE_COMMIT:
          compareCommitId = revisionsState.compareCommitId || headCommitId;
          break;
        default:
          throw new Error('Invalid Diff Option: ' + this._diffOption);
      }

      var revisionInfo = headToForkBaseRevisions.find(function (revision) {
        return revision.id === compareCommitId;
      });
      (0, (_assert2 || _assert()).default)(revisionInfo, 'Diff Viw Fetcher: revision with id ' + compareCommitId + ' not found');

      var committedContents = yield this._repository.fetchFileContentAtRevision(filePath, '' + compareCommitId).toPromise()
      // If the file didn't exist on the previous revision,
      // Return the no such file at revision message.
      .catch(function (error) {
        return error.message || '';
      });

      return {
        committedContents: committedContents,
        revisionInfo: revisionInfo
      };
    })
  }, {
    key: 'setCompareRevision',
    value: _asyncToGenerator(function* (revision) {
      var revisionsState = this.getCachedRevisionsState();
      if (revisionsState == null) {
        throw new Error('Cannot set compare revision on a null revisions state');
      }
      var headToForkBaseRevisions = revisionsState.headToForkBaseRevisions;

      (0, (_assert2 || _assert()).default)(headToForkBaseRevisions && headToForkBaseRevisions.find(function (check) {
        return check.id === revision.id;
      }), 'Diff Viw Timeline: non-applicable selected revision');

      this._selectedCompareCommitId = revision.id;
      this._emitter.emit(CHANGE_REVISIONS_STATE_EVENT);

      (0, (_assert2 || _assert()).default)(this._diffOption === (_constants2 || _constants()).DiffOption.COMPARE_COMMIT, 'Invalid Diff Option at setRevision time!');
      yield this._serializedUpdateSelectedFileChanges().catch((_notifications2 || _notifications()).notifyInternalError);
    })
  }, {
    key: 'onDidUpdateDirtyFileChanges',
    value: function onDidUpdateDirtyFileChanges(callback) {
      return this._emitter.on(UPDATE_DIRTY_FILES_EVENT, callback);
    }
  }, {
    key: 'onDidUpdateSelectedFileChanges',
    value: function onDidUpdateSelectedFileChanges(callback) {
      return this._emitter.on(UPDATE_SELECTED_FILE_CHANGES_EVENT, callback);
    }
  }, {
    key: 'onDidChangeRevisionsState',
    value: function onDidChangeRevisionsState(callback) {
      return this._emitter.on(CHANGE_REVISIONS_STATE_EVENT, callback);
    }
  }, {
    key: 'getRepository',
    value: function getRepository() {
      return this._repository;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.deactivate();
      this._subscriptions.dispose();
      this._dirtyFileChanges.clear();
      this._selectedFileChanges.clear();
    }
  }]);

  return RepositoryStack;
})();

exports.default = RepositoryStack;