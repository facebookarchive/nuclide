'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.addRepositoryEpic = addRepositoryEpic;
exports.updateActiveRepositoryEpic = updateActiveRepositoryEpic;
exports.setCwdApiEpic = setCwdApiEpic;
exports.diffFileEpic = diffFileEpic;
exports.setViewModeEpic = setViewModeEpic;
exports.commit = commit;
exports.publishDiff = publishDiff;

var _ActionTypes;

function _load_ActionTypes() {
  return _ActionTypes = _interopRequireWildcard(require('./ActionTypes'));
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _event;

function _load_event() {
  return _event = require('../../../commons-node/event');
}

var _collection;

function _load_collection() {
  return _collection = require('../../../commons-node/collection');
}

var _vcs;

function _load_vcs() {
  return _vcs = require('../../../commons-node/vcs');
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

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../../commons-atom/text-editor');
}

var _createEmptyAppState;

function _load_createEmptyAppState() {
  return _createEmptyAppState = require('./createEmptyAppState');
}

var _utils2;

function _load_utils2() {
  return _utils2 = require('../../../nuclide-arcanist-rpc/lib/utils');
}

var _notifications;

function _load_notifications() {
  return _notifications = require('../notifications');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../../nuclide-logging');
}

var _streamProcessToConsoleMessages;

function _load_streamProcessToConsoleMessages() {
  return _streamProcessToConsoleMessages = require('../../../commons-atom/streamProcessToConsoleMessages');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const CHANGE_DEBOUNCE_DELAY_MS = 300;
const SHOW_CONSOLE_ON_PROCESS_EVENTS = ['stdout', 'stderr', 'error'];

function trackComplete(eventName, operation) {
  // Start the timer when the observable is subscribed.
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    const tracker = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).startTracking)(eventName);
    return operation.do({
      error: function (err) {
        tracker.onError(err);
      },
      complete: function () {
        tracker.onSuccess();
      }
    });
  });
}

function notifyCwdMismatch(newRepository, cwdApi, filePath, onChangeModified) {
  const newDirectoryPath = newRepository.getProjectDirectory();
  const actionSubject = new _rxjsBundlesRxMinJs.Subject();
  const notification = atom.notifications.addWarning('Cannot show diff for a non-working directory\n' + 'Would you like to switch your working directory to ' + `\`${ (_nuclideUri || _load_nuclideUri()).default.basename(newDirectoryPath) }\` to be able to diff that file?`, {
    buttons: [{
      text: 'Switch & Show Diff',
      className: 'icon icon-git-branch',
      onDidClick: () => {
        cwdApi.setCwd(newDirectoryPath);
        actionSubject.next((_Actions || _load_Actions()).diffFile(filePath, onChangeModified));
        notification.dismiss();
      }
    }, {
      text: 'Dismiss',
      onDidClick: () => {
        notification.dismiss();
      }
    }],
    detail: 'You can always switch your working directory\n' + 'from the file tree.',
    dismissable: true
  });
  return actionSubject.asObservable().takeUntil((0, (_event || _load_event()).observableFromSubscribeFunction)(notification.onDidDismiss.bind(notification)));
}

function getDiffOptionChanges(actions, store, repository) {
  var _store$getState = store.getState();

  const viewMode = _store$getState.viewMode;


  return actions.ofType((_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE).map(a => {
    if (!(a.type === (_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE)) {
      throw new Error('Invariant violation: "a.type === ActionTypes.SET_VIEW_MODE"');
    }

    return (0, (_utils || _load_utils()).viewModeToDiffOption)(a.payload.viewMode);
  }).startWith((0, (_utils || _load_utils()).viewModeToDiffOption)(viewMode)).distinctUntilChanged();
}

function getCompareIdChanges(actions, store, repository) {
  var _store$getState2 = store.getState();

  const repositories = _store$getState2.repositories;

  const initialRepositoryState = repositories.get(repository);

  if (!(initialRepositoryState != null)) {
    throw new Error('Cannot activate repository before adding it!');
  }

  return actions.filter(a => a.type === (_ActionTypes || _load_ActionTypes()).SET_COMPARE_ID && a.payload.repository === repository).map(a => {
    if (!(a.type === (_ActionTypes || _load_ActionTypes()).SET_COMPARE_ID)) {
      throw new Error('Invariant violation: "a.type === ActionTypes.SET_COMPARE_ID"');
    }

    return a.payload.compareId;
  }).startWith(initialRepositoryState.compareRevisionId);
}

function isValidCompareRevisions(revisions, compareId) {
  return (0, (_utils || _load_utils()).getHeadRevision)(revisions) != null && isValidCompareId(revisions, compareId);
}

function isValidCompareId(revisions, compareId) {
  const headToForkBase = (0, (_utils || _load_utils()).getHeadToForkBaseRevisions)(revisions);
  return compareId == null || headToForkBase.find(revision => revision.id === compareId) != null;
}

function observeActiveRepository(actions, store) {
  return actions.filter(a => a.type === (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY).map(a => {
    if (!(a.type === (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY)) {
      throw new Error('Invariant violation: "a.type === ActionTypes.UPDATE_ACTIVE_REPOSITORY"');
    }

    return a.payload.hgRepository;
  }).startWith(store.getState().activeRepository);
}

function observeRepositoryHeadRevision(repository) {
  return repository.observeRevisionChanges().map(revisions => (0, (_utils || _load_utils()).getHeadRevision)(revisions)).distinctUntilChanged((revision1, revision2) => {
    if (revision1 === revision2) {
      return true;
    } else if (revision1 == null || revision2 == null) {
      return false;
    } else {
      if (!(revision1 != null)) {
        throw new Error('Invariant violation: "revision1 != null"');
      }

      return revision1.id === revision2.id;
    }
  });
}

// An added, but not-activated repository would continue to provide dirty file change updates,
// because they are cheap to compute, while needed in the UI.
function addRepositoryEpic(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).ADD_REPOSITORY).flatMap(action => {
    if (!(action.type === (_ActionTypes || _load_ActionTypes()).ADD_REPOSITORY)) {
      throw new Error('Invariant violation: "action.type === ActionTypes.ADD_REPOSITORY"');
    }

    const repository = action.payload.repository;


    return (0, (_vcs || _load_vcs()).observeStatusChanges)(repository).map(dirtyFileChanges => (_Actions || _load_Actions()).updateDirtyFiles(repository, dirtyFileChanges)).takeUntil((0, (_event || _load_event()).observableFromSubscribeFunction)(repository.onDidDestroy.bind(repository))).concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).removeRepository(repository)));
  });
}

// A repository is considered activated only when the Diff View is open.
// This allows to not bother with loading revision info and changes when not needed.
function updateActiveRepositoryEpic(actions, store) {
  return _rxjsBundlesRxMinJs.Observable.merge(actions.ofType((_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY), actions.ofType((_ActionTypes || _load_ActionTypes()).UPDATE_DIFF_NAVIGATOR_VISIBILITY)).switchMap(() => {
    var _store$getState3 = store.getState();

    const repository = _store$getState3.activeRepository,
          diffNavigatorVisible = _store$getState3.diffNavigatorVisible;


    if (!diffNavigatorVisible || repository == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    const statusChanges = (0, (_vcs || _load_vcs()).observeStatusChanges)(repository);
    const revisionChanges = repository.observeRevisionChanges();
    const revisionStatusChanges = repository.observeRevisionStatusesChanges();
    const diffOptionChanges = getDiffOptionChanges(actions, store, repository);
    const compareIdChanges = getCompareIdChanges(actions, store, repository);

    const selectedFileUpdates = _rxjsBundlesRxMinJs.Observable.combineLatest(revisionChanges, diffOptionChanges, compareIdChanges, statusChanges, (revisions, diffOption, compareId) => ({ revisions: revisions, diffOption: diffOption, compareId: compareId })).filter((_ref) => {
      let revisions = _ref.revisions,
          compareId = _ref.compareId;
      return isValidCompareRevisions(revisions, compareId);
    }).switchMap((_ref2) => {
      let revisions = _ref2.revisions,
          compareId = _ref2.compareId,
          diffOption = _ref2.diffOption;

      return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateLoadingSelectedFiles(repository, true)), (0, (_utils || _load_utils()).getSelectedFileChanges)(repository, diffOption, revisions, compareId).catch(error => {
        (0, (_notifications || _load_notifications()).notifyInternalError)(error);
        return _rxjsBundlesRxMinJs.Observable.empty();
      }).map(revisionFileChanges => (_Actions || _load_Actions()).updateSelectedFiles(repository, revisionFileChanges)), _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateLoadingSelectedFiles(repository, false)));
    });

    const compareIdInvalidations = _rxjsBundlesRxMinJs.Observable.combineLatest(revisionChanges, compareIdChanges).filter((_ref3) => {
      var _ref4 = _slicedToArray(_ref3, 2);

      let revisions = _ref4[0],
          compareId = _ref4[1];
      return !isValidCompareId(revisions, compareId);
    }).map(() => (_Actions || _load_Actions()).setCompareId(repository, null));

    const revisionStateUpdates = _rxjsBundlesRxMinJs.Observable.combineLatest(revisionChanges, revisionStatusChanges).filter((_ref5) => {
      var _ref6 = _slicedToArray(_ref5, 1);

      let revisions = _ref6[0];
      return (0, (_utils || _load_utils()).getHeadRevision)(revisions) != null;
    }).map((_ref7) => {
      var _ref8 = _slicedToArray(_ref7, 2);

      let revisions = _ref8[0],
          revisionStatuses = _ref8[1];
      return (_Actions || _load_Actions()).updateHeadToForkBaseRevisionsState(repository, (0, (_utils || _load_utils()).getHeadToForkBaseRevisions)(revisions), revisionStatuses);
    });

    return _rxjsBundlesRxMinJs.Observable.merge(compareIdInvalidations, selectedFileUpdates, revisionStateUpdates);
  });
}

function setCwdApiEpic(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).SET_CWD_API).switchMap(action => {
    if (!(action.type === (_ActionTypes || _load_ActionTypes()).SET_CWD_API)) {
      throw new Error('Invariant violation: "action.type === ActionTypes.SET_CWD_API"');
    }

    const cwdApi = action.payload.cwdApi;


    if (cwdApi == null) {
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateActiveRepository(null));
    }

    const cwdHgRepository = (0, (_event || _load_event()).observableFromSubscribeFunction)(cwdApi.observeCwd.bind(cwdApi)).map(directory => {
      if (directory == null) {
        return null;
      } else {
        return (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(directory.getPath());
      }
    }).map(repository => {
      if (repository == null || repository.getType() !== 'hg') {
        return null;
      } else {
        return repository;
      }
    }).distinctUntilChanged();

    return cwdHgRepository.map(repository => (_Actions || _load_Actions()).updateActiveRepository(repository));
  });
}

function diffFileEpic(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).DIFF_FILE).switchMap(action => {
    if (!(action.type === (_ActionTypes || _load_ActionTypes()).DIFF_FILE)) {
      throw new Error('Invariant violation: "action.type === ActionTypes.DIFF_FILE"');
    }

    const clearActiveDiffObservable = _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateFileDiff('', '', '', null));

    var _action$payload = action.payload;
    const filePath = _action$payload.filePath,
          onChangeModified = _action$payload.onChangeModified;

    const repository = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(filePath);

    if (repository == null || repository.getType() !== 'hg') {
      const repositoryType = repository == null ? 'no repository' : repository.getType();
      (0, (_notifications || _load_notifications()).notifyInternalError)(new Error(`Diff View only supports Mercurial repositories - found: ${ repositoryType }`));
      return clearActiveDiffObservable;
    }

    const hgRepository = repository;

    var _store$getState4 = store.getState();

    const activeRepository = _store$getState4.activeRepository;


    if (repository !== activeRepository) {
      var _store$getState5 = store.getState();

      const cwdApi = _store$getState5.cwdApi;

      if (cwdApi == null) {
        return _rxjsBundlesRxMinJs.Observable.throw('Cannot have a null CwdApi');
      }
      return clearActiveDiffObservable.concat(notifyCwdMismatch(hgRepository, cwdApi, filePath, onChangeModified));
    }

    const revisionChanges = hgRepository.observeRevisionChanges();
    const diffOptionChanges = getDiffOptionChanges(actions, store, hgRepository);
    const compareIdChanges = getCompareIdChanges(actions, store, hgRepository);

    const deactiveRepsitory = actions.filter(a => a.type === (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY && a.payload.hgRepository === hgRepository);

    const buffer = (0, (_textEditor || _load_textEditor()).bufferForUri)(filePath);
    const bufferReloads = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidReload.bind(buffer)).map(() => null).startWith(null);
    const bufferChanges = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidChange.bind(buffer)).debounceTime(CHANGE_DEBOUNCE_DELAY_MS);

    const bufferChangeModifed = _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidChangeModified.bind(buffer)), (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidStopChanging.bind(buffer))).map(onChangeModified).ignoreElements();

    const fetchHgDiff = _rxjsBundlesRxMinJs.Observable.combineLatest(revisionChanges, diffOptionChanges, compareIdChanges, (revisions, diffOption, compareId) => ({ revisions: revisions, diffOption: diffOption, compareId: compareId })).filter((_ref9) => {
      let revisions = _ref9.revisions,
          compareId = _ref9.compareId;
      return isValidCompareRevisions(revisions, compareId);
    }).switchMap((_ref10) => {
      let revisions = _ref10.revisions,
          diffOption = _ref10.diffOption,
          compareId = _ref10.compareId;

      const headToForkBaseRevisions = (0, (_utils || _load_utils()).getHeadToForkBaseRevisions)(revisions);
      return _rxjsBundlesRxMinJs.Observable.of(null).concat((0, (_utils || _load_utils()).getHgDiff)(hgRepository, filePath, headToForkBaseRevisions, diffOption, compareId).catch(error => {
        (0, (_notifications || _load_notifications()).notifyInternalError)(error);
        return _rxjsBundlesRxMinJs.Observable.empty();
      }));
    }).switchMap((hgDiff
    // Load the buffer to use its contents as the new contents.
    ) => _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_textEditor || _load_textEditor()).loadBufferForUri)(filePath)).map(() => hgDiff));

    return _rxjsBundlesRxMinJs.Observable.merge(bufferChangeModifed, _rxjsBundlesRxMinJs.Observable.combineLatest(fetchHgDiff, _rxjsBundlesRxMinJs.Observable.merge(bufferReloads, bufferChanges)).switchMap((_ref11) => {
      var _ref12 = _slicedToArray(_ref11, 1);

      let hgDiff = _ref12[0];

      if (hgDiff == null) {
        return _rxjsBundlesRxMinJs.Observable.of(
        // Clear Diff UI State.
        (_Actions || _load_Actions()).updateFileDiff(filePath, '', '', null), (_Actions || _load_Actions()).updateLoadingFileDiff(true));
      }

      const committedContents = hgDiff.committedContents,
            revisionInfo = hgDiff.revisionInfo;

      const newContents = buffer.getText();
      const oldContents = committedContents;

      return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateLoadingFileDiff(false)), _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateFileDiff(filePath, newContents, oldContents, revisionInfo)),

      // TODO(most): Add loading indicators for comments.
      // $FlowFixMe flow doesn't have a good way to express that operator.
      _rxjsBundlesRxMinJs.Observable.combineLatest(...store.getState().uiProviders.map(uiProvider => uiProvider.composeUiElements(filePath, oldContents, newContents).catch(error => {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Diff View UI Provider Error:', error);
        return _rxjsBundlesRxMinJs.Observable.empty();
      }))).switchMap(uiElementsResults => {
        const newEditorElements = (0, (_collection || _load_collection()).mapUnion)(...uiElementsResults.map(uiElements => uiElements.newEditorElements));
        const oldEditorElements = (0, (_collection || _load_collection()).mapUnion)(...uiElementsResults.map(uiElements => uiElements.oldEditorElements));
        return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateFileUiElements(newEditorElements, oldEditorElements));
      }));
    }).takeUntil(_rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer)), deactiveRepsitory, actions.filter(a => a.type === (_ActionTypes || _load_ActionTypes()).UPDATE_DIFF_EDITORS_VISIBILITY && !a.payload.visible))).concat(clearActiveDiffObservable));
  });
}

function setViewModeEpic(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE).switchMap(action => {
    if (!(action.type === (_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE)) {
      throw new Error('Invariant violation: "action.type === ActionTypes.SET_VIEW_MODE"');
    }

    const viewMode = action.payload.viewMode;


    if (viewMode === (_constants || _load_constants()).DiffMode.BROWSE_MODE) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    return observeActiveRepository(actions, store).switchMap(activeRepository => {
      if (activeRepository == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      const headCommitMessageChanges = observeRepositoryHeadRevision(activeRepository).filter(headRevision => headRevision != null).map(headRevision => {
        if (!(headRevision != null)) {
          throw new Error('Invariant violation: "headRevision != null"');
        }

        return headRevision.description;
      }).distinctUntilChanged();

      if (viewMode === (_constants || _load_constants()).DiffMode.COMMIT_MODE) {
        const commitModeChanges = _rxjsBundlesRxMinJs.Observable.of(store.getState().commit.mode).concat(actions.ofType((_ActionTypes || _load_ActionTypes()).SET_COMMIT_MODE).map(a => {
          if (!(a.type === (_ActionTypes || _load_ActionTypes()).SET_COMMIT_MODE)) {
            throw new Error('Invariant violation: "a.type === ActionTypes.SET_COMMIT_MODE"');
          }

          return a.payload.commitMode;
        }));

        return commitModeChanges.switchMap(commitMode => {
          switch (commitMode) {
            case (_constants || _load_constants()).CommitMode.COMMIT:
              {
                // TODO(asriram): t12228275 load commit template in case of `COMMIT`.
                return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateCommitState({
                  message: null,
                  mode: commitMode,
                  state: (_constants || _load_constants()).CommitModeState.READY
                }));
              }
            case (_constants || _load_constants()).CommitMode.AMEND:
              {
                return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateCommitState({
                  message: null,
                  mode: commitMode,
                  state: (_constants || _load_constants()).CommitModeState.LOADING_COMMIT_MESSAGE
                })), headCommitMessageChanges.map(headCommitMessage => (_Actions || _load_Actions()).updateCommitState({
                  message: headCommitMessage,
                  mode: commitMode,
                  state: (_constants || _load_constants()).CommitModeState.READY
                })));
              }
            default:
              {
                (0, (_notifications || _load_notifications()).notifyInternalError)(new Error(`Invalid Commit Mode: ${ commitMode }`));
                return _rxjsBundlesRxMinJs.Observable.empty();
              }
          }
        });
      }

      const isPublishReady = () => store.getState().publish.state !== (_constants || _load_constants()).PublishModeState.AWAITING_PUBLISH;

      // If the latest head has a phabricator revision in the commit message,
      // then, it's PublishMode.UPDATE mode
      // Otherwise, it's a new revision with `PublishMode.CREATE` state.
      if (viewMode === (_constants || _load_constants()).DiffMode.PUBLISH_MODE) {
        return _rxjsBundlesRxMinJs.Observable.concat(isPublishReady() ? _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updatePublishState({
          message: null,
          mode: store.getState().publish.mode,
          state: (_constants || _load_constants()).PublishModeState.LOADING_PUBLISH_MESSAGE
        })) : _rxjsBundlesRxMinJs.Observable.empty(), headCommitMessageChanges.switchMap(headCommitMessage => {
          if (!isPublishReady()) {
            // An amend can come as part of publishing new revisions.
            // So, skip updating if there's an ongoing publish.
            return _rxjsBundlesRxMinJs.Observable.empty();
          }

          const phabricatorRevision = (0, (_utils2 || _load_utils2()).getPhabricatorRevisionFromCommitMessage)(headCommitMessage);

          let publishMessage;
          let publishMode;
          const existingMessage = store.getState().publish.message;

          if (phabricatorRevision == null) {
            publishMode = (_constants || _load_constants()).PublishMode.CREATE;
            publishMessage = headCommitMessage;
          } else {
            publishMode = (_constants || _load_constants()).PublishMode.UPDATE;
            publishMessage = existingMessage || (0, (_utils || _load_utils()).getRevisionUpdateMessage)(phabricatorRevision);
          }

          return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updatePublishState({
            message: publishMessage,
            mode: publishMode,
            state: (_constants || _load_constants()).PublishModeState.READY
          }));
        }));
      }

      (0, (_notifications || _load_notifications()).notifyInternalError)(new Error(`Invalid Diff View Mode: ${ viewMode }`));
      return _rxjsBundlesRxMinJs.Observable.empty();
    });
  });
}

function commit(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).COMMIT).switchMap(action => {
    if (!(action.type === (_ActionTypes || _load_ActionTypes()).COMMIT)) {
      throw new Error('Invariant violation: "action.type === ActionTypes.COMMIT"');
    }

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-commit');
    var _action$payload2 = action.payload;
    const message = _action$payload2.message,
          repository = _action$payload2.repository,
          publishUpdates = _action$payload2.publishUpdates;

    var _store$getState6 = store.getState();

    const mode = _store$getState6.commit.mode,
          shouldRebaseOnAmend = _store$getState6.shouldRebaseOnAmend;

    let consoleShown = false;

    return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateCommitState({
      message: message,
      mode: mode,
      state: (_constants || _load_constants()).CommitModeState.AWAITING_COMMIT
    })), trackComplete('diff-view-commit', _rxjsBundlesRxMinJs.Observable.defer(() => {
      switch (mode) {
        case (_constants || _load_constants()).CommitMode.COMMIT:
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-commit-commit');
          return repository.commit(message);
        case (_constants || _load_constants()).CommitMode.AMEND:
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-commit-amend');
          return repository.amend(message, (0, (_utils || _load_utils()).getAmendMode)(shouldRebaseOnAmend)).do(processMessage => {
            if (!consoleShown && SHOW_CONSOLE_ON_PROCESS_EVENTS.includes(processMessage.kind)) {
              (0, (_streamProcessToConsoleMessages || _load_streamProcessToConsoleMessages()).dispatchConsoleToggle)(true);
              consoleShown = true;
            }
          });
        default:
          return _rxjsBundlesRxMinJs.Observable.throw(new Error(`Invalid Commit Mode ${ mode }`));
      }
    })).do((_streamProcessToConsoleMessages || _load_streamProcessToConsoleMessages()).pipeProcessMessagesToConsole.bind(null, mode, publishUpdates)).ignoreElements(), _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setViewMode((_constants || _load_constants()).DiffMode.BROWSE_MODE), (_Actions || _load_Actions()).updateCommitState((0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyCommitState)())));
  });
}

function publishDiff(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).PUBLISH_DIFF).switchMap(action => {
    if (!(action.type === (_ActionTypes || _load_ActionTypes()).PUBLISH_DIFF)) {
      throw new Error('Invariant violation: "action.type === ActionTypes.PUBLISH_DIFF"');
    }

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-publish');
    var _action$payload3 = action.payload;
    const message = _action$payload3.message,
          repository = _action$payload3.repository,
          isPrepareMode = _action$payload3.isPrepareMode,
          lintExcuse = _action$payload3.lintExcuse,
          publishUpdates = _action$payload3.publishUpdates;

    var _store$getState7 = store.getState();

    const mode = _store$getState7.publish.mode,
          shouldRebaseOnAmend = _store$getState7.shouldRebaseOnAmend;


    const amendCleanupMessage = mode === (_constants || _load_constants()).PublishMode.CREATE ? message : null;

    return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updatePublishState({
      mode: mode,
      message: message,
      state: (_constants || _load_constants()).PublishModeState.AWAITING_PUBLISH
    })), _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_utils || _load_utils()).promptToCleanDirtyChanges)(repository, amendCleanupMessage, shouldRebaseOnAmend)).switchMap(cleanResult => {
      if (cleanResult == null) {
        atom.notifications.addWarning('You have uncommitted changes!', {
          dismissable: true,
          nativeFriendly: true
        });
        // Keep the message, in case the user wants to apply updates.
        return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updatePublishState({
          mode: mode,
          message: message,
          state: (_constants || _load_constants()).PublishModeState.READY
        }));
      }
      const amended = cleanResult.amended,
            allowUntracked = cleanResult.allowUntracked;

      return observeRepositoryHeadRevision(repository).filter(headRevision => headRevision != null).first().switchMap(headRevision => {
        if (!(headRevision != null)) {
          throw new Error('Invariant violation: "headRevision != null"');
        }

        switch (mode) {
          case (_constants || _load_constants()).PublishMode.CREATE:
            (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-publish-create');
            return trackComplete('diff-view.publish-diff', (0, (_utils || _load_utils()).createPhabricatorRevision)(repository, publishUpdates, headRevision.description, message, amended, isPrepareMode, lintExcuse));
          case (_constants || _load_constants()).PublishMode.UPDATE:
            (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-publish-update');
            return trackComplete('diff-view.publish-diff', (0, (_utils || _load_utils()).updatePhabricatorRevision)(repository, publishUpdates, headRevision.description, message, allowUntracked, lintExcuse));
          default:
            (0, (_notifications || _load_notifications()).notifyInternalError)(new Error(`Invalid Publish Mode: ${ mode }`));
            return _rxjsBundlesRxMinJs.Observable.empty();
        }
      }).ignoreElements().concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updatePublishState((0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyPublishState)()), (_Actions || _load_Actions()).setViewMode((_constants || _load_constants()).DiffMode.BROWSE_MODE))).catch(error => {
        atom.notifications.addError('Couldn\'t Publish to Phabricator', {
          detail: error.message,
          nativeFriendly: true
        });
        return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updatePublishState({
          mode: mode,
          message: message,
          state: (_constants || _load_constants()).PublishModeState.PUBLISH_ERROR
        }));
      });
    }));
  });
}