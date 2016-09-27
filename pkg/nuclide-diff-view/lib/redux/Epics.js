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

exports.addRepositoryEpic = addRepositoryEpic;
exports.activateRepositoryEpic = activateRepositoryEpic;
exports.setCwdApiEpic = setCwdApiEpic;
exports.openViewEpic = openViewEpic;
exports.diffFileEpic = diffFileEpic;
exports.setViewModeEpic = setViewModeEpic;
exports.commit = commit;
exports.publishDiff = publishDiff;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = _interopRequireWildcard(require('./ActionTypes'));
}

var _Actions2;

function _Actions() {
  return _Actions2 = _interopRequireWildcard(require('./Actions'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../../commons-node/event');
}

var _constants2;

function _constants() {
  return _constants2 = require('../constants');
}

var _utils2;

function _utils() {
  return _utils2 = require('../utils');
}

var _nuclideHgGitBridge2;

function _nuclideHgGitBridge() {
  return _nuclideHgGitBridge2 = require('../../../nuclide-hg-git-bridge');
}

var _commonsAtomTextEditor2;

function _commonsAtomTextEditor() {
  return _commonsAtomTextEditor2 = require('../../../commons-atom/text-editor');
}

var _createEmptyAppState2;

function _createEmptyAppState() {
  return _createEmptyAppState2 = require('./createEmptyAppState');
}

var _nuclideArcanistRpcLibUtils2;

function _nuclideArcanistRpcLibUtils() {
  return _nuclideArcanistRpcLibUtils2 = require('../../../nuclide-arcanist-rpc/lib/utils');
}

var _notifications2;

function _notifications() {
  return _notifications2 = require('../notifications');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../../nuclide-analytics');
}

var UPDATE_STATUS_DEBOUNCE_MS = 50;
var CHANGE_DEBOUNCE_DELAY_MS = 10;

function trackComplete(eventName, operation) {
  // Start the timer when the observable is subscribed.
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.defer(function () {
    var tracker = (0, (_nuclideAnalytics2 || _nuclideAnalytics()).startTracking)(eventName);
    return operation.do({
      error: function error(err) {
        tracker.onError(err);
      },
      complete: function complete() {
        tracker.onSuccess();
      }
    });
  });
}

function observeStatusChanges(repository) {
  return (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(repository.onDidChangeStatuses.bind(repository)).debounceTime(UPDATE_STATUS_DEBOUNCE_MS).map(function () {
    return null;
  }).startWith(null);
}

function getDiffOptionChanges(actions, store, repository) {
  var _store$getState = store.getState();

  var viewMode = _store$getState.viewMode;

  return actions.ofType((_ActionTypes2 || _ActionTypes()).SET_VIEW_MODE).map(function (a) {
    (0, (_assert2 || _assert()).default)(a.type === (_ActionTypes2 || _ActionTypes()).SET_VIEW_MODE);
    return (0, (_utils2 || _utils()).viewModeToDiffOption)(a.payload.viewMode);
  }).startWith((0, (_utils2 || _utils()).viewModeToDiffOption)(viewMode)).distinctUntilChanged();
}

function getCompareIdChanges(actions, store, repository) {
  var _store$getState2 = store.getState();

  var repositories = _store$getState2.repositories;

  var initialRepositoryState = repositories.get(repository);
  (0, (_assert2 || _assert()).default)(initialRepositoryState != null, 'Cannot activate repository before adding it!');

  return actions.filter(function (a) {
    return a.type === (_ActionTypes2 || _ActionTypes()).SET_COMPARE_ID && a.payload.repository === repository;
  }).map(function (a) {
    (0, (_assert2 || _assert()).default)(a.type === (_ActionTypes2 || _ActionTypes()).SET_COMPARE_ID);
    return a.payload.compareId;
  }).startWith(initialRepositoryState.compareRevisionId);
}

function observeActiveRepository(actions, store) {
  return actions.filter(function (a) {
    return a.type === (_ActionTypes2 || _ActionTypes()).UPDATE_ACTIVE_REPOSITORY;
  }).map(function (a) {
    (0, (_assert2 || _assert()).default)(a.type === (_ActionTypes2 || _ActionTypes()).UPDATE_ACTIVE_REPOSITORY);
    return a.payload.hgRepository;
  }).startWith(store.getState().activeRepository);
}

function observeRepositoryHeadRevision(repository) {
  return repository.observeRevisionChanges().map(function (revisions) {
    return (0, (_utils2 || _utils()).getHeadRevision)(revisions);
  }).distinctUntilChanged(function (revision1, revision2) {
    if (revision1 === revision2) {
      return true;
    } else if (revision1 == null || revision2 == null) {
      return false;
    } else {
      (0, (_assert2 || _assert()).default)(revision1 != null);
      return revision1.id === revision2.id;
    }
  });
}

// An added, but not-activated repository would continue to provide dirty file change updates,
// because they are cheap to compute, while needed in the UI.

function addRepositoryEpic(actions, store) {
  return actions.ofType((_ActionTypes2 || _ActionTypes()).ADD_REPOSITORY).flatMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_ActionTypes2 || _ActionTypes()).ADD_REPOSITORY);
    var repository = action.payload.repository;

    return observeStatusChanges(repository).map(function () {
      return (_Actions2 || _Actions()).updateDirtyFiles(repository, (0, (_utils2 || _utils()).getDirtyFileChanges)(repository));
    }).takeUntil((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(repository.onDidDestroy.bind(repository))).concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).removeRepository(repository)));
  });
}

// A repository is considered activated only when the Diff View is open.
// This allows to not bother with loading revision info and changes when not needed.

function activateRepositoryEpic(actions, store) {
  return actions.ofType((_ActionTypes2 || _ActionTypes()).ACTIVATE_REPOSITORY).flatMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_ActionTypes2 || _ActionTypes()).ACTIVATE_REPOSITORY);
    var repository = action.payload.repository;

    var statusChanges = observeStatusChanges(repository);
    var revisionChanges = repository.observeRevisionChanges();
    var revisionStatusChanges = repository.observeRevisionStatusesChanges();
    var diffOptionChanges = getDiffOptionChanges(actions, store, repository);
    var compareIdChanges = getCompareIdChanges(actions, store, repository);

    var selectedFileUpdates = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.combineLatest(revisionChanges, diffOptionChanges, compareIdChanges, statusChanges, function (revisions, diffOption, compareId) {
      return { revisions: revisions, diffOption: diffOption, compareId: compareId };
    }).filter(function (_ref) {
      var revisions = _ref.revisions;
      return (0, (_utils2 || _utils()).getHeadRevision)(revisions) != null;
    }).switchMap(function (_ref2) {
      var revisions = _ref2.revisions;
      var compareId = _ref2.compareId;
      var diffOption = _ref2.diffOption;
      return(
        // TODO(most): Add loading states.
        (0, (_utils2 || _utils()).getSelectedFileChanges)(repository, diffOption, revisions, compareId).catch(function (error) {
          (0, (_notifications2 || _notifications()).notifyInternalError)(error);
          return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
        })
      );
    }).map(function (revisionFileChanges) {
      return (_Actions2 || _Actions()).updateSelectedFiles(repository, revisionFileChanges);
    });

    var revisionStateUpdates = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.combineLatest(revisionChanges, revisionStatusChanges).filter(function (_ref3) {
      var _ref32 = _slicedToArray(_ref3, 1);

      var revisions = _ref32[0];
      return (0, (_utils2 || _utils()).getHeadRevision)(revisions) != null;
    }).map(function (_ref4) {
      var _ref42 = _slicedToArray(_ref4, 2);

      var revisions = _ref42[0];
      var revisionStatuses = _ref42[1];
      return (_Actions2 || _Actions()).updateHeadToForkBaseRevisionsState(repository, (0, (_utils2 || _utils()).getHeadToForkBaseRevisions)(revisions), revisionStatuses);
    });

    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge(selectedFileUpdates, revisionStateUpdates).takeUntil((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(repository.onDidDestroy.bind(repository)), actions.filter(function (a) {
      return a.type === (_ActionTypes2 || _ActionTypes()).DEACTIVATE_REPOSITORY && a.payload.repository === repository;
    })));
  });
}

function setCwdApiEpic(actions, store) {
  return actions.ofType((_ActionTypes2 || _ActionTypes()).SET_CWD_API).switchMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_ActionTypes2 || _ActionTypes()).SET_CWD_API);

    var cwdApi = action.payload.cwdApi;

    if (cwdApi == null) {
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).updateActiveRepository(null));
    }

    var cwdHgRepository = (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(cwdApi.observeCwd.bind(cwdApi)).map(function (directory) {
      if (directory == null) {
        return null;
      } else {
        return (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(directory.getPath());
      }
    }).map(function (repository) {
      if (repository == null || repository.getType() !== 'hg') {
        return null;
      } else {
        return repository;
      }
    }).distinctUntilChanged();

    return cwdHgRepository.map(function (repository) {
      return (_Actions2 || _Actions()).updateActiveRepository(repository);
    });
  });
}

function openViewEpic(actions, store) {
  return actions.ofType((_ActionTypes2 || _ActionTypes()).OPEN_VIEW).switchMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_ActionTypes2 || _ActionTypes()).OPEN_VIEW);

    return actions.ofType((_ActionTypes2 || _ActionTypes()).UPDATE_ACTIVE_REPOSITORY).map(function (a) {
      (0, (_assert2 || _assert()).default)(a.type === (_ActionTypes2 || _ActionTypes()).UPDATE_ACTIVE_REPOSITORY);
      return a.payload.hgRepository;
    }).startWith(null, store.getState().activeRepository)
    // $FlowFixMe(matthewwithanm): Type this.
    .pairwise().switchMap(function (_ref5) {
      var _ref52 = _slicedToArray(_ref5, 2);

      var oldRepository = _ref52[0];
      var newRepository = _ref52[1];

      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat(oldRepository != null ? (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).deactivateRepository(oldRepository)) : (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty(), newRepository != null ? (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).activateRepository(newRepository)) : (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty());
    }).takeUntil(actions.ofType((_ActionTypes2 || _ActionTypes()).CLOSE_VIEW));
  });
}

function diffFileEpic(actions, store) {
  return actions.ofType((_ActionTypes2 || _ActionTypes()).DIFF_FILE).switchMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_ActionTypes2 || _ActionTypes()).DIFF_FILE);

    var _action$payload = action.payload;
    var filePath = _action$payload.filePath;
    var onChangeModified = _action$payload.onChangeModified;

    var repository = (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(filePath);

    if (repository == null || repository.getType() !== 'hg') {
      var repositoryType = repository == null ? 'no repository' : repository.getType();
      (0, (_notifications2 || _notifications()).notifyInternalError)(new Error('Diff View only supports Mercurial repositories - found: ' + repositoryType));
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
    }

    var _store$getState3 = store.getState();

    var activeRepository = _store$getState3.activeRepository;

    if (repository !== activeRepository) {
      (0, (_notifications2 || _notifications()).notifyInternalError)(new Error('Cannot diff file from a non-working directory\n' + 'Please switch your working directory from the file tree to be able to diff that file!'));
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
    }

    var hgRepository = repository;

    var revisionChanges = hgRepository.observeRevisionChanges();
    var diffOptionChanges = getDiffOptionChanges(actions, store, hgRepository);
    var compareIdChanges = getCompareIdChanges(actions, store, hgRepository);

    var deactiveRepsitory = actions.filter(function (a) {
      return a.type === (_ActionTypes2 || _ActionTypes()).DEACTIVATE_REPOSITORY && a.payload.repository === hgRepository;
    });

    var buffer = (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).bufferForUri)(filePath);
    var bufferReloads = (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidReload.bind(buffer)).map(function () {
      return null;
    }).startWith(null);
    var bufferChanges = (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidChange.bind(buffer)).debounceTime(CHANGE_DEBOUNCE_DELAY_MS);

    var bufferChangeModifed = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidChangeModified.bind(buffer)), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidStopChanging.bind(buffer))).map(onChangeModified).ignoreElements();

    var fetchHgDiff = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.combineLatest(revisionChanges, diffOptionChanges, compareIdChanges, function (revisions, diffOption, compareId) {
      return { revisions: revisions, diffOption: diffOption, compareId: compareId };
    }).filter(function (_ref6) {
      var revisions = _ref6.revisions;
      return (0, (_utils2 || _utils()).getHeadRevision)(revisions) != null;
    }).switchMap(function (_ref7) {
      var revisions = _ref7.revisions;
      var diffOption = _ref7.diffOption;
      var compareId = _ref7.compareId;

      // TODO(most): Add loading states.
      var headToForkBaseRevisions = (0, (_utils2 || _utils()).getHeadToForkBaseRevisions)(revisions);
      return (0, (_utils2 || _utils()).getHgDiff)(hgRepository, filePath, headToForkBaseRevisions, diffOption, compareId).catch(function (error) {
        (0, (_notifications2 || _notifications()).notifyInternalError)(error);
        return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
      });
    }).switchMap(function (hgDiff) {
      return(
        // Load the buffer to use its contents as the new contents.
        (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise((0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).loadBufferForUri)(filePath)).map(function () {
          return hgDiff;
        })
      );
    });

    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge(bufferChangeModifed, (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.combineLatest(fetchHgDiff, (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge(bufferReloads, bufferChanges)).map(function (_ref8) {
      var _ref82 = _slicedToArray(_ref8, 1);

      var _ref82$0 = _ref82[0];
      var committedContents = _ref82$0.committedContents;
      var revisionInfo = _ref82$0.revisionInfo;
      return (_Actions2 || _Actions()).updateFileDiff({
        filePath: filePath,
        fromRevisionTitle: (0, (_utils2 || _utils()).formatFileDiffRevisionTitle)(revisionInfo),
        newContents: buffer.getText(),
        oldContents: committedContents,
        toRevisionTitle: 'Filesystem / Editor'
      });
    }).takeUntil((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer)), deactiveRepsitory)).concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).updateFileDiff((0, (_createEmptyAppState2 || _createEmptyAppState()).getEmptyFileDiffState)()))));
  });
}

function setViewModeEpic(actions, store) {
  return actions.ofType((_ActionTypes2 || _ActionTypes()).SET_VIEW_MODE).switchMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_ActionTypes2 || _ActionTypes()).SET_VIEW_MODE);

    var viewMode = action.payload.viewMode;

    if (viewMode === (_constants2 || _constants()).DiffMode.BROWSE_MODE) {
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
    }

    return observeActiveRepository(actions, store).switchMap(function (activeRepository) {
      if (activeRepository == null) {
        return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
      }

      var headCommitMessageChanges = observeRepositoryHeadRevision(activeRepository).filter(function (headRevision) {
        return headRevision != null;
      }).map(function (headRevision) {
        (0, (_assert2 || _assert()).default)(headRevision != null);
        return headRevision.description;
      }).distinctUntilChanged();

      if (viewMode === (_constants2 || _constants()).DiffMode.COMMIT_MODE) {
        var commitModeChanges = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(store.getState().commit.mode).concat(actions.ofType((_ActionTypes2 || _ActionTypes()).SET_COMMIT_MODE).map(function (a) {
          (0, (_assert2 || _assert()).default)(a.type === (_ActionTypes2 || _ActionTypes()).SET_COMMIT_MODE);
          return a.payload.commitMode;
        }));

        return commitModeChanges.switchMap(function (commitMode) {
          switch (commitMode) {
            case (_constants2 || _constants()).CommitMode.COMMIT:
              {
                // TODO(asriram): load commit template in case of `COMMIT`.
                return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
              }
            case (_constants2 || _constants()).CommitMode.AMEND:
              {
                return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).updateCommitState({
                  message: null,
                  mode: commitMode,
                  state: (_constants2 || _constants()).CommitModeState.LOADING_COMMIT_MESSAGE
                })), headCommitMessageChanges.map(function (headCommitMessage) {
                  return (_Actions2 || _Actions()).updateCommitState({
                    message: headCommitMessage,
                    mode: commitMode,
                    state: (_constants2 || _constants()).CommitModeState.READY
                  });
                }));
              }
            default:
              {
                (0, (_notifications2 || _notifications()).notifyInternalError)(new Error('Invalid Commit Mode: ' + commitMode));
                return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
              }
          }
        });
      }

      var isPublishReady = function isPublishReady() {
        return store.getState().publish.state !== (_constants2 || _constants()).PublishModeState.AWAITING_PUBLISH;
      };

      // If the latest head has a phabricator revision in the commit message,
      // then, it's PublishMode.UPDATE mode
      // Otherwise, it's a new revision with `PublishMode.CREATE` state.
      if (viewMode === (_constants2 || _constants()).DiffMode.PUBLISH_MODE) {
        return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat(isPublishReady() ? (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).updatePublishState({
          message: null,
          mode: store.getState().publish.mode,
          state: (_constants2 || _constants()).PublishModeState.LOADING_PUBLISH_MESSAGE
        })) : (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty(), headCommitMessageChanges.switchMap(function (headCommitMessage) {
          if (!isPublishReady()) {
            // An amend can come as part of publishing new revisions.
            // So, skip updating if there's an ongoing publish.
            return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
          }

          var phabricatorRevision = (0, (_nuclideArcanistRpcLibUtils2 || _nuclideArcanistRpcLibUtils()).getPhabricatorRevisionFromCommitMessage)(headCommitMessage);

          var publishMessage = undefined;
          var publishMode = undefined;
          var existingMessage = store.getState().publish.message;

          if (phabricatorRevision == null) {
            publishMode = (_constants2 || _constants()).PublishMode.CREATE;
            publishMessage = headCommitMessage;
          } else {
            publishMode = (_constants2 || _constants()).PublishMode.UPDATE;
            publishMessage = existingMessage || (0, (_utils2 || _utils()).getRevisionUpdateMessage)(phabricatorRevision);
          }

          return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).updatePublishState({
            message: publishMessage,
            mode: publishMode,
            state: (_constants2 || _constants()).PublishModeState.READY
          }));
        }));
      }

      (0, (_notifications2 || _notifications()).notifyInternalError)(new Error('Invalid Diff View Mode: ' + viewMode));
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
    }).takeUntil(actions.ofType((_ActionTypes2 || _ActionTypes()).CLOSE_VIEW));
  });
}

function commit(actions, store) {
  return actions.ofType((_ActionTypes2 || _ActionTypes()).COMMIT).switchMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_ActionTypes2 || _ActionTypes()).COMMIT);

    (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-commit');
    var _action$payload2 = action.payload;
    var message = _action$payload2.message;
    var repository = _action$payload2.repository;

    var _store$getState4 = store.getState();

    var mode = _store$getState4.commit.mode;
    var shouldRebaseOnAmend = _store$getState4.shouldRebaseOnAmend;

    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).updateCommitState({
      message: message,
      mode: mode,
      state: (_constants2 || _constants()).CommitModeState.AWAITING_COMMIT
    })), trackComplete('diff-view-commit', (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.defer(function () {
      switch (mode) {
        case (_constants2 || _constants()).CommitMode.COMMIT:
          (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-commit-commit');
          return repository.commit(message).toArray();
        case (_constants2 || _constants()).CommitMode.AMEND:
          (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-commit-amend');
          return repository.amend(message, (0, (_utils2 || _utils()).getAmendMode)(shouldRebaseOnAmend)).toArray();
        default:
          return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.throw(new Error('Invalid Commit Mode ' + mode));
      }
    })).switchMap(function (processMessages) {
      var successMessage = mode === (_constants2 || _constants()).CommitMode.COMMIT ? 'created' : 'amended';
      atom.notifications.addSuccess('Commit ' + successMessage, { nativeFriendly: true });

      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).setViewMode((_constants2 || _constants()).DiffMode.BROWSE_MODE), (_Actions2 || _Actions()).updateCommitState((0, (_createEmptyAppState2 || _createEmptyAppState()).getEmptyCommitState)()));
    }).catch(function (error) {
      atom.notifications.addError('Error creating commit', {
        detail: 'Details: ' + error.message,
        nativeFriendly: true
      });
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
    }));
  });
}

function publishDiff(actions, store) {
  return actions.ofType((_ActionTypes2 || _ActionTypes()).PUBLISH_DIFF).switchMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_ActionTypes2 || _ActionTypes()).PUBLISH_DIFF);

    (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-publish');
    var _action$payload3 = action.payload;
    var message = _action$payload3.message;
    var repository = _action$payload3.repository;
    var lintExcuse = _action$payload3.lintExcuse;
    var publishUpdates = _action$payload3.publishUpdates;

    var _store$getState5 = store.getState();

    var mode = _store$getState5.publish.mode;
    var shouldRebaseOnAmend = _store$getState5.shouldRebaseOnAmend;

    var amendCleanupMessage = mode === (_constants2 || _constants()).PublishMode.CREATE ? message : null;

    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).updatePublishState({
      mode: mode,
      message: message,
      state: (_constants2 || _constants()).PublishModeState.AWAITING_PUBLISH
    })), (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise((0, (_utils2 || _utils()).promptToCleanDirtyChanges)(repository, amendCleanupMessage, shouldRebaseOnAmend)).switchMap(function (cleanResult) {
      if (cleanResult == null) {
        atom.notifications.addWarning('You have uncommitted changes!', {
          dismissable: true,
          nativeFriendly: true
        });
        // Keep the message, in case the user wants to apply updates.
        return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).updatePublishState({
          mode: mode,
          message: message,
          state: (_constants2 || _constants()).PublishModeState.READY
        }));
      }
      var amended = cleanResult.amended;
      var allowUntracked = cleanResult.allowUntracked;

      return observeRepositoryHeadRevision(repository).filter(function (headRevision) {
        return headRevision != null;
      }).first().switchMap(function (headRevision) {
        (0, (_assert2 || _assert()).default)(headRevision != null);

        switch (mode) {
          case (_constants2 || _constants()).PublishMode.CREATE:
            (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-publish-create');
            return trackComplete('diff-view.publish-diff', (0, (_utils2 || _utils()).createPhabricatorRevision)(repository, publishUpdates, headRevision.description, message, amended, lintExcuse));
          case (_constants2 || _constants()).PublishMode.UPDATE:
            (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('diff-view-publish-update');
            return trackComplete('diff-view.publish-diff', (0, (_utils2 || _utils()).updatePhabricatorRevision)(repository, publishUpdates, headRevision.description, message, allowUntracked, lintExcuse));
          default:
            (0, (_notifications2 || _notifications()).notifyInternalError)(new Error('Invalid Publish Mode: ' + mode));
            return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
        }
      }).ignoreElements().concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).updatePublishState((0, (_createEmptyAppState2 || _createEmptyAppState()).getEmptyPublishState)()), (_Actions2 || _Actions()).setViewMode((_constants2 || _constants()).DiffMode.BROWSE_MODE))).catch(function (error) {
        atom.notifications.addError('Couldn\'t Publish to Phabricator', {
          detail: error.message,
          nativeFriendly: true
        });
        return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).updatePublishState({
          mode: mode,
          message: message,
          state: (_constants2 || _constants()).PublishModeState.PUBLISH_ERROR
        }));
      });
    }));
  });
}