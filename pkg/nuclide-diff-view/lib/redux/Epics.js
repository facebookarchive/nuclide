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
exports.updateActiveRepositoryEpic = updateActiveRepositoryEpic;
exports.setCwdApiEpic = setCwdApiEpic;
exports.diffFileEpic = diffFileEpic;
exports.setViewModeEpic = setViewModeEpic;
exports.commit = commit;
exports.publishDiff = publishDiff;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionTypes;

function _load_ActionTypes() {
  return _ActionTypes = _interopRequireWildcard(require('./ActionTypes'));
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../../commons-node/event');
}

var _commonsNodeVcs;

function _load_commonsNodeVcs() {
  return _commonsNodeVcs = require('../../../commons-node/vcs');
}

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../../../nuclide-hg-git-bridge');
}

var _commonsAtomTextEditor;

function _load_commonsAtomTextEditor() {
  return _commonsAtomTextEditor = require('../../../commons-atom/text-editor');
}

var _createEmptyAppState;

function _load_createEmptyAppState() {
  return _createEmptyAppState = require('./createEmptyAppState');
}

var _nuclideArcanistRpcLibUtils;

function _load_nuclideArcanistRpcLibUtils() {
  return _nuclideArcanistRpcLibUtils = require('../../../nuclide-arcanist-rpc/lib/utils');
}

var _notifications;

function _load_notifications() {
  return _notifications = require('../notifications');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../../nuclide-logging');
}

var CHANGE_DEBOUNCE_DELAY_MS = 10;
var FILESYSTEM_REVISION_TITLE = 'Filesystem / Editor';

function trackComplete(eventName, operation) {
  // Start the timer when the observable is subscribed.
  return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.defer(function () {
    var tracker = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).startTracking)(eventName);
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

function notifyCwdMismatch(newRepository, cwdApi, filePath, onChangeModified) {
  var newDirectoryPath = newRepository.getProjectDirectory();
  var actionSubject = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
  var notification = atom.notifications.addWarning('Cannot show diff for a non-working directory\n' + 'Would you like to switch your working directory to ' + ('`' + (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(newDirectoryPath) + '` to be able to diff that file?'), {
    buttons: [{
      text: 'Switch & Show Diff',
      className: 'icon icon-git-branch',
      onDidClick: function onDidClick() {
        cwdApi.setCwd(newDirectoryPath);
        actionSubject.next((_Actions || _load_Actions()).diffFile(filePath, onChangeModified));
        notification.dismiss();
      }
    }, {
      text: 'Dismiss',
      onDidClick: function onDidClick() {
        notification.dismiss();
      }
    }],
    detail: 'You can always switch your working directory\n' + 'from the file tree.',
    dismissable: true
  });
  return actionSubject.asObservable().takeUntil((0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(notification.onDidDismiss.bind(notification)));
}

function getDiffOptionChanges(actions, store, repository) {
  var _store$getState = store.getState();

  var viewMode = _store$getState.viewMode;

  return actions.ofType((_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE).map(function (a) {
    (0, (_assert || _load_assert()).default)(a.type === (_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE);
    return (0, (_utils || _load_utils()).viewModeToDiffOption)(a.payload.viewMode);
  }).startWith((0, (_utils || _load_utils()).viewModeToDiffOption)(viewMode)).distinctUntilChanged();
}

function getCompareIdChanges(actions, store, repository) {
  var _store$getState2 = store.getState();

  var repositories = _store$getState2.repositories;

  var initialRepositoryState = repositories.get(repository);
  (0, (_assert || _load_assert()).default)(initialRepositoryState != null, 'Cannot activate repository before adding it!');

  return actions.filter(function (a) {
    return a.type === (_ActionTypes || _load_ActionTypes()).SET_COMPARE_ID && a.payload.repository === repository;
  }).map(function (a) {
    (0, (_assert || _load_assert()).default)(a.type === (_ActionTypes || _load_ActionTypes()).SET_COMPARE_ID);
    return a.payload.compareId;
  }).startWith(initialRepositoryState.compareRevisionId);
}

function isValidCompareRevisions(revisions, compareId) {
  return (0, (_utils || _load_utils()).getHeadRevision)(revisions) != null && isValidCompareId(revisions, compareId);
}

function isValidCompareId(revisions, compareId) {
  var headToForkBase = (0, (_utils || _load_utils()).getHeadToForkBaseRevisions)(revisions);
  return compareId == null || headToForkBase.find(function (revision) {
    return revision.id === compareId;
  }) != null;
}

function observeActiveRepository(actions, store) {
  return actions.filter(function (a) {
    return a.type === (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY;
  }).map(function (a) {
    (0, (_assert || _load_assert()).default)(a.type === (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY);
    return a.payload.hgRepository;
  }).startWith(store.getState().activeRepository);
}

function observeRepositoryHeadRevision(repository) {
  return repository.observeRevisionChanges().map(function (revisions) {
    return (0, (_utils || _load_utils()).getHeadRevision)(revisions);
  }).distinctUntilChanged(function (revision1, revision2) {
    if (revision1 === revision2) {
      return true;
    } else if (revision1 == null || revision2 == null) {
      return false;
    } else {
      (0, (_assert || _load_assert()).default)(revision1 != null);
      return revision1.id === revision2.id;
    }
  });
}

// An added, but not-activated repository would continue to provide dirty file change updates,
// because they are cheap to compute, while needed in the UI.

function addRepositoryEpic(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).ADD_REPOSITORY).flatMap(function (action) {
    (0, (_assert || _load_assert()).default)(action.type === (_ActionTypes || _load_ActionTypes()).ADD_REPOSITORY);
    var repository = action.payload.repository;

    return (0, (_commonsNodeVcs || _load_commonsNodeVcs()).observeStatusChanges)(repository).map(function (dirtyFileChanges) {
      return (_Actions || _load_Actions()).updateDirtyFiles(repository, dirtyFileChanges);
    }).takeUntil((0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(repository.onDidDestroy.bind(repository))).concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).removeRepository(repository)));
  });
}

function observeViewOpen(actions) {
  return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge(actions.ofType((_ActionTypes || _load_ActionTypes()).OPEN_VIEW).map(function () {
    return true;
  }), actions.ofType((_ActionTypes || _load_ActionTypes()).CLOSE_VIEW).map(function () {
    return false;
  })).startWith(false).cache(1);
}

// A repository is considered activated only when the Diff View is open.
// This allows to not bother with loading revision info and changes when not needed.

function updateActiveRepositoryEpic(actions, store) {
  return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.combineLatest(actions.ofType((_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY), observeViewOpen(actions)).switchMap(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var action = _ref2[0];
    var isViewOpen = _ref2[1];

    (0, (_assert || _load_assert()).default)(action.type === (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY);
    var repository = action.payload.hgRepository;

    if (!isViewOpen || repository == null) {
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
    }

    var statusChanges = (0, (_commonsNodeVcs || _load_commonsNodeVcs()).observeStatusChanges)(repository);
    var revisionChanges = repository.observeRevisionChanges();
    var revisionStatusChanges = repository.observeRevisionStatusesChanges();
    var diffOptionChanges = getDiffOptionChanges(actions, store, repository);
    var compareIdChanges = getCompareIdChanges(actions, store, repository);

    var selectedFileUpdates = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.combineLatest(revisionChanges, diffOptionChanges, compareIdChanges, statusChanges, function (revisions, diffOption, compareId) {
      return { revisions: revisions, diffOption: diffOption, compareId: compareId };
    }).filter(function (_ref3) {
      var revisions = _ref3.revisions;
      var compareId = _ref3.compareId;
      return isValidCompareRevisions(revisions, compareId);
    }).switchMap(function (_ref4) {
      var revisions = _ref4.revisions;
      var compareId = _ref4.compareId;
      var diffOption = _ref4.diffOption;

      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updateLoadingSelectedFiles(repository, true)), (0, (_utils || _load_utils()).getSelectedFileChanges)(repository, diffOption, revisions, compareId).catch(function (error) {
        (0, (_notifications || _load_notifications()).notifyInternalError)(error);
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
      }).map(function (revisionFileChanges) {
        return (_Actions || _load_Actions()).updateSelectedFiles(repository, revisionFileChanges);
      }), (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updateLoadingSelectedFiles(repository, false)));
    });

    var compareIdInvalidations = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.combineLatest(revisionChanges, compareIdChanges).filter(function (_ref5) {
      var _ref52 = _slicedToArray(_ref5, 2);

      var revisions = _ref52[0];
      var compareId = _ref52[1];
      return !isValidCompareId(revisions, compareId);
    }).map(function () {
      return (_Actions || _load_Actions()).setCompareId(repository, null);
    });

    var revisionStateUpdates = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.combineLatest(revisionChanges, revisionStatusChanges).filter(function (_ref6) {
      var _ref62 = _slicedToArray(_ref6, 1);

      var revisions = _ref62[0];
      return (0, (_utils || _load_utils()).getHeadRevision)(revisions) != null;
    }).map(function (_ref7) {
      var _ref72 = _slicedToArray(_ref7, 2);

      var revisions = _ref72[0];
      var revisionStatuses = _ref72[1];
      return (_Actions || _load_Actions()).updateHeadToForkBaseRevisionsState(repository, (0, (_utils || _load_utils()).getHeadToForkBaseRevisions)(revisions), revisionStatuses);
    });

    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge(compareIdInvalidations, selectedFileUpdates, revisionStateUpdates);
  });
}

function setCwdApiEpic(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).SET_CWD_API).switchMap(function (action) {
    (0, (_assert || _load_assert()).default)(action.type === (_ActionTypes || _load_ActionTypes()).SET_CWD_API);

    var cwdApi = action.payload.cwdApi;

    if (cwdApi == null) {
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updateActiveRepository(null));
    }

    var cwdHgRepository = (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(cwdApi.observeCwd.bind(cwdApi)).map(function (directory) {
      if (directory == null) {
        return null;
      } else {
        return (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(directory.getPath());
      }
    }).map(function (repository) {
      if (repository == null || repository.getType() !== 'hg') {
        return null;
      } else {
        return repository;
      }
    }).distinctUntilChanged();

    return cwdHgRepository.map(function (repository) {
      return (_Actions || _load_Actions()).updateActiveRepository(repository);
    });
  });
}

function diffFileEpic(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).DIFF_FILE).switchMap(function (action) {
    (0, (_assert || _load_assert()).default)(action.type === (_ActionTypes || _load_ActionTypes()).DIFF_FILE);

    var clearActiveDiffObservable = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updateFileDiff((0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyFileDiffState)()));

    var _action$payload = action.payload;
    var filePath = _action$payload.filePath;
    var onChangeModified = _action$payload.onChangeModified;

    var repository = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(filePath);

    if (repository == null || repository.getType() !== 'hg') {
      var repositoryType = repository == null ? 'no repository' : repository.getType();
      (0, (_notifications || _load_notifications()).notifyInternalError)(new Error('Diff View only supports Mercurial repositories - found: ' + repositoryType));
      return clearActiveDiffObservable;
    }

    var hgRepository = repository;

    var _store$getState3 = store.getState();

    var activeRepository = _store$getState3.activeRepository;

    if (repository !== activeRepository) {
      var _store$getState4 = store.getState();

      var cwdApi = _store$getState4.cwdApi;

      if (cwdApi == null) {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw('Cannot have a null CwdApi');
      }
      return clearActiveDiffObservable.concat(notifyCwdMismatch(hgRepository, cwdApi, filePath, onChangeModified));
    }

    var revisionChanges = hgRepository.observeRevisionChanges();
    var diffOptionChanges = getDiffOptionChanges(actions, store, hgRepository);
    var compareIdChanges = getCompareIdChanges(actions, store, hgRepository);

    var deactiveRepsitory = actions.filter(function (a) {
      return a.type === (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY && a.payload.hgRepository === hgRepository;
    });

    var buffer = (0, (_commonsAtomTextEditor || _load_commonsAtomTextEditor()).bufferForUri)(filePath);
    var bufferReloads = (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidReload.bind(buffer)).map(function () {
      return null;
    }).startWith(null);
    var bufferChanges = (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidChange.bind(buffer)).debounceTime(CHANGE_DEBOUNCE_DELAY_MS);

    var bufferChangeModifed = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidChangeModified.bind(buffer)), (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidStopChanging.bind(buffer))).map(onChangeModified).ignoreElements();

    var fetchHgDiff = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.combineLatest(revisionChanges, diffOptionChanges, compareIdChanges, function (revisions, diffOption, compareId) {
      return { revisions: revisions, diffOption: diffOption, compareId: compareId };
    }).filter(function (_ref8) {
      var revisions = _ref8.revisions;
      var compareId = _ref8.compareId;
      return isValidCompareRevisions(revisions, compareId);
    }).switchMap(function (_ref9) {
      var revisions = _ref9.revisions;
      var diffOption = _ref9.diffOption;
      var compareId = _ref9.compareId;

      var headToForkBaseRevisions = (0, (_utils || _load_utils()).getHeadToForkBaseRevisions)(revisions);
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(null).concat((0, (_utils || _load_utils()).getHgDiff)(hgRepository, filePath, headToForkBaseRevisions, diffOption, compareId).catch(function (error) {
        (0, (_notifications || _load_notifications()).notifyInternalError)(error);
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
      }));
    }).switchMap(function (hgDiff) {
      return(
        // Load the buffer to use its contents as the new contents.
        (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise((0, (_commonsAtomTextEditor || _load_commonsAtomTextEditor()).loadBufferForUri)(filePath)).map(function () {
          return hgDiff;
        })
      );
    });

    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge(bufferChangeModifed, (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.combineLatest(fetchHgDiff, (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge(bufferReloads, bufferChanges)).switchMap(function (_ref10) {
      var _Observable;

      var _ref102 = _slicedToArray(_ref10, 1);

      var hgDiff = _ref102[0];

      if (hgDiff == null) {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updateLoadingFileDiff(true),
        // Clear Diff UI State.
        (_Actions || _load_Actions()).updateFileDiff({
          filePath: filePath,
          fromRevisionTitle: '...',
          toRevisionTitle: FILESYSTEM_REVISION_TITLE,
          newContents: '',
          oldContents: '',
          uiElements: []
        }));
      }

      var committedContents = hgDiff.committedContents;
      var revisionInfo = hgDiff.revisionInfo;

      var newContents = buffer.getText();
      var oldContents = committedContents;

      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updateLoadingFileDiff(false)), (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updateFileDiff({
        filePath: filePath,
        fromRevisionTitle: (0, (_utils || _load_utils()).formatFileDiffRevisionTitle)(revisionInfo),
        newContents: newContents,
        oldContents: oldContents,
        toRevisionTitle: FILESYSTEM_REVISION_TITLE
      })),

      // TODO(most): Add loading indicators for comments.
      // $FlowFixMe flow doesn't have a good way to express that operator.
      (_Observable = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable).combineLatest.apply(_Observable, _toConsumableArray(store.getState().uiProviders.map(function (uiProvider) {
        return uiProvider.composeUiElements(filePath, oldContents, newContents).catch(function (error) {
          (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Diff View UI Provider Error:', error);
          return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
        });
      }))).switchMap(function (uiElementsArrays) {
        var _ref11;

        var flattenedUiElements = (_ref11 = []).concat.apply(_ref11, uiElementsArrays);
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updateFileUiElements(filePath, flattenedUiElements));
      }));
    }).takeUntil((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer)), deactiveRepsitory, actions.ofType((_ActionTypes || _load_ActionTypes()).CLOSE_VIEW))).concat(clearActiveDiffObservable));
  });
}

function setViewModeEpic(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE).switchMap(function (action) {
    (0, (_assert || _load_assert()).default)(action.type === (_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE);

    var viewMode = action.payload.viewMode;

    if (viewMode === (_constants || _load_constants()).DiffMode.BROWSE_MODE) {
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
    }

    return observeActiveRepository(actions, store).switchMap(function (activeRepository) {
      if (activeRepository == null) {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
      }

      var headCommitMessageChanges = observeRepositoryHeadRevision(activeRepository).filter(function (headRevision) {
        return headRevision != null;
      }).map(function (headRevision) {
        (0, (_assert || _load_assert()).default)(headRevision != null);
        return headRevision.description;
      }).distinctUntilChanged();

      if (viewMode === (_constants || _load_constants()).DiffMode.COMMIT_MODE) {
        var commitModeChanges = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(store.getState().commit.mode).concat(actions.ofType((_ActionTypes || _load_ActionTypes()).SET_COMMIT_MODE).map(function (a) {
          (0, (_assert || _load_assert()).default)(a.type === (_ActionTypes || _load_ActionTypes()).SET_COMMIT_MODE);
          return a.payload.commitMode;
        }));

        return commitModeChanges.switchMap(function (commitMode) {
          switch (commitMode) {
            case (_constants || _load_constants()).CommitMode.COMMIT:
              {
                // TODO(asriram): load commit template in case of `COMMIT`.
                return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
              }
            case (_constants || _load_constants()).CommitMode.AMEND:
              {
                return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updateCommitState({
                  message: null,
                  mode: commitMode,
                  state: (_constants || _load_constants()).CommitModeState.LOADING_COMMIT_MESSAGE
                })), headCommitMessageChanges.map(function (headCommitMessage) {
                  return (_Actions || _load_Actions()).updateCommitState({
                    message: headCommitMessage,
                    mode: commitMode,
                    state: (_constants || _load_constants()).CommitModeState.READY
                  });
                }));
              }
            default:
              {
                (0, (_notifications || _load_notifications()).notifyInternalError)(new Error('Invalid Commit Mode: ' + commitMode));
                return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
              }
          }
        });
      }

      var isPublishReady = function isPublishReady() {
        return store.getState().publish.state !== (_constants || _load_constants()).PublishModeState.AWAITING_PUBLISH;
      };

      // If the latest head has a phabricator revision in the commit message,
      // then, it's PublishMode.UPDATE mode
      // Otherwise, it's a new revision with `PublishMode.CREATE` state.
      if (viewMode === (_constants || _load_constants()).DiffMode.PUBLISH_MODE) {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat(isPublishReady() ? (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updatePublishState({
          message: null,
          mode: store.getState().publish.mode,
          state: (_constants || _load_constants()).PublishModeState.LOADING_PUBLISH_MESSAGE
        })) : (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty(), headCommitMessageChanges.switchMap(function (headCommitMessage) {
          if (!isPublishReady()) {
            // An amend can come as part of publishing new revisions.
            // So, skip updating if there's an ongoing publish.
            return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
          }

          var phabricatorRevision = (0, (_nuclideArcanistRpcLibUtils || _load_nuclideArcanistRpcLibUtils()).getPhabricatorRevisionFromCommitMessage)(headCommitMessage);

          var publishMessage = undefined;
          var publishMode = undefined;
          var existingMessage = store.getState().publish.message;

          if (phabricatorRevision == null) {
            publishMode = (_constants || _load_constants()).PublishMode.CREATE;
            publishMessage = headCommitMessage;
          } else {
            publishMode = (_constants || _load_constants()).PublishMode.UPDATE;
            publishMessage = existingMessage || (0, (_utils || _load_utils()).getRevisionUpdateMessage)(phabricatorRevision);
          }

          return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updatePublishState({
            message: publishMessage,
            mode: publishMode,
            state: (_constants || _load_constants()).PublishModeState.READY
          }));
        }));
      }

      (0, (_notifications || _load_notifications()).notifyInternalError)(new Error('Invalid Diff View Mode: ' + viewMode));
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
    }).takeUntil(actions.ofType((_ActionTypes || _load_ActionTypes()).CLOSE_VIEW));
  });
}

function commit(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).COMMIT).switchMap(function (action) {
    (0, (_assert || _load_assert()).default)(action.type === (_ActionTypes || _load_ActionTypes()).COMMIT);

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-commit');
    var _action$payload2 = action.payload;
    var message = _action$payload2.message;
    var repository = _action$payload2.repository;

    var _store$getState5 = store.getState();

    var mode = _store$getState5.commit.mode;
    var shouldRebaseOnAmend = _store$getState5.shouldRebaseOnAmend;

    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updateCommitState({
      message: message,
      mode: mode,
      state: (_constants || _load_constants()).CommitModeState.AWAITING_COMMIT
    })), trackComplete('diff-view-commit', (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.defer(function () {
      switch (mode) {
        case (_constants || _load_constants()).CommitMode.COMMIT:
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-commit-commit');
          return repository.commit(message).toArray();
        case (_constants || _load_constants()).CommitMode.AMEND:
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-commit-amend');
          return repository.amend(message, (0, (_utils || _load_utils()).getAmendMode)(shouldRebaseOnAmend)).toArray();
        default:
          return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw(new Error('Invalid Commit Mode ' + mode));
      }
    })).switchMap(function (processMessages) {
      var successMessage = mode === (_constants || _load_constants()).CommitMode.COMMIT ? 'created' : 'amended';
      atom.notifications.addSuccess('Commit ' + successMessage, { nativeFriendly: true });

      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).setViewMode((_constants || _load_constants()).DiffMode.BROWSE_MODE), (_Actions || _load_Actions()).updateCommitState((0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyCommitState)()));
    }).catch(function (error) {
      atom.notifications.addError('Error creating commit', {
        detail: 'Details: ' + error.message,
        nativeFriendly: true
      });
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
    }));
  });
}

function publishDiff(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).PUBLISH_DIFF).switchMap(function (action) {
    (0, (_assert || _load_assert()).default)(action.type === (_ActionTypes || _load_ActionTypes()).PUBLISH_DIFF);

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-publish');
    var _action$payload3 = action.payload;
    var message = _action$payload3.message;
    var repository = _action$payload3.repository;
    var isPrepareMode = _action$payload3.isPrepareMode;
    var lintExcuse = _action$payload3.lintExcuse;
    var publishUpdates = _action$payload3.publishUpdates;

    var _store$getState6 = store.getState();

    var mode = _store$getState6.publish.mode;
    var shouldRebaseOnAmend = _store$getState6.shouldRebaseOnAmend;

    var amendCleanupMessage = mode === (_constants || _load_constants()).PublishMode.CREATE ? message : null;

    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updatePublishState({
      mode: mode,
      message: message,
      state: (_constants || _load_constants()).PublishModeState.AWAITING_PUBLISH
    })), (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise((0, (_utils || _load_utils()).promptToCleanDirtyChanges)(repository, amendCleanupMessage, shouldRebaseOnAmend)).switchMap(function (cleanResult) {
      if (cleanResult == null) {
        atom.notifications.addWarning('You have uncommitted changes!', {
          dismissable: true,
          nativeFriendly: true
        });
        // Keep the message, in case the user wants to apply updates.
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updatePublishState({
          mode: mode,
          message: message,
          state: (_constants || _load_constants()).PublishModeState.READY
        }));
      }
      var amended = cleanResult.amended;
      var allowUntracked = cleanResult.allowUntracked;

      return observeRepositoryHeadRevision(repository).filter(function (headRevision) {
        return headRevision != null;
      }).first().switchMap(function (headRevision) {
        (0, (_assert || _load_assert()).default)(headRevision != null);

        switch (mode) {
          case (_constants || _load_constants()).PublishMode.CREATE:
            (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-publish-create');
            return trackComplete('diff-view.publish-diff', (0, (_utils || _load_utils()).createPhabricatorRevision)(repository, publishUpdates, headRevision.description, message, amended, isPrepareMode, lintExcuse));
          case (_constants || _load_constants()).PublishMode.UPDATE:
            (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-publish-update');
            return trackComplete('diff-view.publish-diff', (0, (_utils || _load_utils()).updatePhabricatorRevision)(repository, publishUpdates, headRevision.description, message, allowUntracked, lintExcuse));
          default:
            (0, (_notifications || _load_notifications()).notifyInternalError)(new Error('Invalid Publish Mode: ' + mode));
            return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
        }
      }).ignoreElements().concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updatePublishState((0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyPublishState)()), (_Actions || _load_Actions()).setViewMode((_constants || _load_constants()).DiffMode.BROWSE_MODE))).catch(function (error) {
        atom.notifications.addError('Couldn\'t Publish to Phabricator', {
          detail: error.message,
          nativeFriendly: true
        });
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of((_Actions || _load_Actions()).updatePublishState({
          mode: mode,
          message: message,
          state: (_constants || _load_constants()).PublishModeState.PUBLISH_ERROR
        }));
      });
    }));
  });
}