'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addRepositoryEpic = addRepositoryEpic;
exports.updateActiveRepositoryEpic = updateActiveRepositoryEpic;
exports.setCwdApiEpic = setCwdApiEpic;
exports.uiElementsEpic = uiElementsEpic;
exports.diffFileEpic = diffFileEpic;
exports.setViewModeEpic = setViewModeEpic;
exports.commit = commit;
exports.publishDiff = publishDiff;
exports.splitRevision = splitRevision;

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

var _vcs;

function _load_vcs() {
  return _vcs = require('../../../commons-atom/vcs');
}

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

var _textBuffer;

function _load_textBuffer() {
  return _textBuffer = require('../../../commons-atom/text-buffer');
}

var _createEmptyAppState;

function _load_createEmptyAppState() {
  return _createEmptyAppState = require('./createEmptyAppState');
}

var _utils2;

function _load_utils2() {
  return _utils2 = require('../../../nuclide-arcanist-rpc/lib/utils');
}

var _nuclideHgRpc;

function _load_nuclideHgRpc() {
  return _nuclideHgRpc = require('../../../nuclide-hg-rpc');
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

var _streamProcessToConsoleMessages;

function _load_streamProcessToConsoleMessages() {
  return _streamProcessToConsoleMessages = require('../../../commons-atom/streamProcessToConsoleMessages');
}

var _nuclideTask;

function _load_nuclideTask() {
  return _nuclideTask = _interopRequireDefault(require('../../../nuclide-task'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const CHANGE_DEBOUNCE_DELAY_MS = 300; /**
                                       * Copyright (c) 2015-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the license found in the LICENSE file in
                                       * the root directory of this source tree.
                                       *
                                       * 
                                       */

const SHOW_CONSOLE_ON_PROCESS_EVENTS = ['stdout', 'stderr', 'error'];

function trackComplete(eventName, operation) {
  // Start the timer when the observable is subscribed.
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    const tracker = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).startTracking)(eventName);
    return operation.do({
      error(err) {
        tracker.onError(err);
      },
      complete() {
        tracker.onSuccess();
      }
    });
  });
}

class ConsoleClient {

  constructor(processName, progressUpdates) {
    this._processName = processName;
    this._progressUpdates = progressUpdates;
    this._consoleShown = false;
  }

  enableAndPipeProcessMessagesToConsole(processMessage) {
    (0, (_streamProcessToConsoleMessages || _load_streamProcessToConsoleMessages()).pipeProcessMessagesToConsole)(this._processName, this._progressUpdates, processMessage);
    if (!this._consoleShown && SHOW_CONSOLE_ON_PROCESS_EVENTS.includes(processMessage.kind)) {
      (0, (_streamProcessToConsoleMessages || _load_streamProcessToConsoleMessages()).dispatchConsoleToggle)(true);
      this._consoleShown = true;
    }
  }
}

function notifyCwdMismatch(newRepository, cwdApi, filePath) {
  const newDirectoryPath = newRepository.getProjectDirectory();
  const actionSubject = new _rxjsBundlesRxMinJs.Subject();
  const notification = atom.notifications.addWarning('Cannot show diff for a non-working directory\n' + 'Would you like to switch your working directory to ' + `\`${(_nuclideUri || _load_nuclideUri()).default.basename(newDirectoryPath)}\` to be able to diff that file?`, {
    buttons: [{
      text: 'Switch & Show Diff',
      className: 'icon icon-git-branch',
      onDidClick: () => {
        cwdApi.setCwd(newDirectoryPath);
        actionSubject.next((_Actions || _load_Actions()).diffFile(filePath));
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
  const { viewMode } = store.getState();

  return actions.ofType((_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE).map(a => {
    if (!(a.type === (_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE)) {
      throw new Error('Invariant violation: "a.type === ActionTypes.SET_VIEW_MODE"');
    }

    return (0, (_utils || _load_utils()).viewModeToDiffOption)(a.payload.viewMode);
  }).startWith((0, (_utils || _load_utils()).viewModeToDiffOption)(viewMode)).distinctUntilChanged();
}

function getCompareIdChanges(actions, store, repository) {
  const { repositories } = store.getState();
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

    const { repository } = action.payload;

    return (0, (_vcs || _load_vcs()).observeStatusChanges)(repository).map(dirtyFileChanges => (_Actions || _load_Actions()).updateDirtyFiles(repository, dirtyFileChanges)).takeUntil((0, (_event || _load_event()).observableFromSubscribeFunction)(repository.onDidDestroy.bind(repository))).concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).removeRepository(repository)));
  });
}

// A repository is considered activated only when the Diff View is open.
// This allows to not bother with loading revision info and changes when not needed.
function updateActiveRepositoryEpic(actions, store) {
  return _rxjsBundlesRxMinJs.Observable.merge(actions.ofType((_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY), actions.ofType((_ActionTypes || _load_ActionTypes()).UPDATE_DIFF_NAVIGATOR_VISIBILITY)).switchMap(() => {
    const { activeRepository: repository, diffNavigatorVisible } = store.getState();

    if (!diffNavigatorVisible || repository == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    const statusChanges = (0, (_vcs || _load_vcs()).observeStatusChanges)(repository);
    const revisionChanges = repository.observeRevisionChanges();
    const revisionStatusChanges = repository.observeRevisionStatusesChanges();
    const diffOptionChanges = getDiffOptionChanges(actions, store, repository);
    const compareIdChanges = getCompareIdChanges(actions, store, repository);

    const selectedFileUpdates = _rxjsBundlesRxMinJs.Observable.combineLatest(revisionChanges, diffOptionChanges, compareIdChanges, statusChanges, (revisions, diffOption, compareId) => ({ revisions, diffOption, compareId })).filter(({ revisions, compareId }) => isValidCompareRevisions(revisions, compareId)).switchMap(({ revisions, compareId, diffOption }) => {
      return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateLoadingSelectedFiles(repository, true)), (0, (_utils || _load_utils()).getSelectedFileChanges)(repository, diffOption, revisions, compareId).catch(error => {
        (0, (_notifications || _load_notifications()).notifyInternalError)(error);
        return _rxjsBundlesRxMinJs.Observable.empty();
      }).map(revisionFileChanges => (_Actions || _load_Actions()).updateSelectedFiles(repository, revisionFileChanges)), _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateLoadingSelectedFiles(repository, false)));
    });

    const compareIdInvalidations = _rxjsBundlesRxMinJs.Observable.combineLatest(revisionChanges, compareIdChanges).filter(([revisions, compareId]) => !isValidCompareId(revisions, compareId)).map(() => (_Actions || _load_Actions()).setCompareId(repository, null));

    const revisionStateUpdates = _rxjsBundlesRxMinJs.Observable.combineLatest(revisionChanges, revisionStatusChanges).filter(([revisions]) => (0, (_utils || _load_utils()).getHeadRevision)(revisions) != null).map(([revisions, revisionStatuses]) => (_Actions || _load_Actions()).updateHeadToForkBaseRevisionsState(repository, (0, (_utils || _load_utils()).getHeadToForkBaseRevisions)(revisions), revisionStatuses));

    return _rxjsBundlesRxMinJs.Observable.merge(compareIdInvalidations, selectedFileUpdates, revisionStateUpdates);
  });
}

function setCwdApiEpic(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).SET_CWD_API).switchMap(action => {
    if (!(action.type === (_ActionTypes || _load_ActionTypes()).SET_CWD_API)) {
      throw new Error('Invariant violation: "action.type === ActionTypes.SET_CWD_API"');
    }

    const { cwdApi } = action.payload;

    if (cwdApi == null) {
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateActiveRepository(null));
    }

    const cwdHgRepository = (0, (_event || _load_event()).observableFromSubscribeFunction)(cwdApi.observeCwd.bind(cwdApi)).map(directory => {
      if (directory == null) {
        return null;
      } else {
        return (0, (_vcs || _load_vcs()).repositoryForPath)(directory.getPath());
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

function uiElementsEpic(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).ADD_UI_PROVIDER).switchMap(action => {
    if (!(action.type === (_ActionTypes || _load_ActionTypes()).ADD_UI_PROVIDER)) {
      throw new Error('Invariant violation: "action.type === ActionTypes.ADD_UI_PROVIDER"');
    }

    // TODO(most): handle multiple providers, when needed.


    const { uiProvider } = action.payload;
    return uiProvider.observeUiElements().map(uiElements => {
      const { newEditorElements, oldEditorElements } = uiElements;
      return (_Actions || _load_Actions()).updateFileUiElements(newEditorElements, oldEditorElements);
    }).takeUntil(actions.filter(a => a.type === (_ActionTypes || _load_ActionTypes()).REMOVE_UI_PROVIDER && a.payload.uiProvider === uiProvider));
  });
}

function diffFileEpic(actions, store) {
  const task = new (_nuclideTask || _load_nuclideTask()).default();

  return actions.ofType((_ActionTypes || _load_ActionTypes()).DIFF_FILE).switchMap(action => {
    if (!(action.type === (_ActionTypes || _load_ActionTypes()).DIFF_FILE)) {
      throw new Error('Invariant violation: "action.type === ActionTypes.DIFF_FILE"');
    }

    const refreshUiElements = (filePath, oldContents, newContents) => _rxjsBundlesRxMinJs.Observable.defer(() => {
      store.getState().uiProviders.forEach(uiProvider => {
        uiProvider.refreshUiElements(filePath, oldContents, newContents);
      });
      return _rxjsBundlesRxMinJs.Observable.empty();
    });

    const clearActiveDiffObservable = _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateFileDiff('', '', '', null, (0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyTextDiff)())).concat(refreshUiElements('', '', ''));

    const { filePath } = action.payload;
    const repository = (0, (_vcs || _load_vcs()).repositoryForPath)(filePath);

    if (repository == null || repository.getType() !== 'hg') {
      const repositoryType = repository == null ? 'no repository' : repository.getType();
      (0, (_notifications || _load_notifications()).notifyInternalError)(new Error(`Diff View only supports Mercurial repositories - found: ${repositoryType}`));
      return clearActiveDiffObservable;
    }

    const hgRepository = repository;
    const { activeRepository } = store.getState();

    if (repository !== activeRepository) {
      const { cwdApi } = store.getState();
      if (cwdApi == null) {
        return _rxjsBundlesRxMinJs.Observable.throw('Cannot have a null CwdApi');
      }
      return clearActiveDiffObservable.concat(notifyCwdMismatch(hgRepository, cwdApi, filePath));
    }

    const revisionChanges = hgRepository.observeRevisionChanges();
    const diffOptionChanges = getDiffOptionChanges(actions, store, hgRepository);
    const compareIdChanges = getCompareIdChanges(actions, store, hgRepository);

    const deactiveRepsitory = actions.filter(a => a.type === (_ActionTypes || _load_ActionTypes()).UPDATE_ACTIVE_REPOSITORY && a.payload.hgRepository === hgRepository);

    const buffer = (0, (_textBuffer || _load_textBuffer()).bufferForUri)(filePath);
    const bufferReloads = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidReload.bind(buffer)).map(() => null).startWith(null);
    const bufferChanges = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidChange.bind(buffer)).debounceTime(CHANGE_DEBOUNCE_DELAY_MS);

    const fetchHgDiff = _rxjsBundlesRxMinJs.Observable.combineLatest(revisionChanges, diffOptionChanges, compareIdChanges, (revisions, diffOption, compareId) => ({ revisions, diffOption, compareId })).filter(({ revisions, compareId }) => isValidCompareRevisions(revisions, compareId)).switchMap(({ revisions, diffOption, compareId }) => {
      const headToForkBaseRevisions = (0, (_utils || _load_utils()).getHeadToForkBaseRevisions)(revisions);
      return _rxjsBundlesRxMinJs.Observable.of(null).concat((0, (_utils || _load_utils()).getHgDiff)(hgRepository, filePath, headToForkBaseRevisions, diffOption, compareId).catch(error => {
        (0, (_notifications || _load_notifications()).notifyInternalError)(error);
        return _rxjsBundlesRxMinJs.Observable.empty();
      }));
    }).switchMap((hgDiff
    // Load the buffer to use its contents as the new contents.
    ) => _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_textBuffer || _load_textBuffer()).loadBufferForUri)(filePath)).map(() => hgDiff));

    return _rxjsBundlesRxMinJs.Observable.combineLatest(fetchHgDiff, _rxjsBundlesRxMinJs.Observable.merge(bufferReloads, bufferChanges)).debounceTime(20).switchMap(([hgDiff]) => {
      if (hgDiff == null) {
        return _rxjsBundlesRxMinJs.Observable.of(
        // Clear Diff UI State.
        (_Actions || _load_Actions()).updateFileDiff(filePath, '', '', null, (0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyTextDiff)()), (_Actions || _load_Actions()).updateLoadingFileDiff(true));
      }

      const { committedContents, revisionInfo } = hgDiff;
      const newContents = buffer.getText();
      const oldContents = committedContents;

      return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateLoadingFileDiff(false)), _rxjsBundlesRxMinJs.Observable.fromPromise(task.invokeRemoteMethod({
        file: require.resolve('../diff-utils'),
        method: 'computeDiff',
        args: [oldContents, newContents]
      })).switchMap(textDiff => _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateFileDiff(filePath, newContents, oldContents, revisionInfo, textDiff)), refreshUiElements(filePath, oldContents, newContents))).catch(error => {
        (0, (_notifications || _load_notifications()).notifyInternalError)(error);
        return _rxjsBundlesRxMinJs.Observable.empty();
      }));
    }).takeUntil(_rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer)), deactiveRepsitory, actions.filter(a => a.type === (_ActionTypes || _load_ActionTypes()).UPDATE_DIFF_EDITORS_VISIBILITY && !a.payload.visible))).concat(clearActiveDiffObservable);
  });
}

function setViewModeEpic(actions, store) {
  return observeActiveRepository(actions, store).switchMap(activeRepository => {
    if (activeRepository == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    let commitTemplate = null;
    const loadCommitTemplate = _rxjsBundlesRxMinJs.Observable.defer(() => {
      if (commitTemplate != null) {
        return _rxjsBundlesRxMinJs.Observable.of(commitTemplate);
      }
      return _rxjsBundlesRxMinJs.Observable.fromPromise(activeRepository.getTemplateCommitMessage()).do(template => {
        commitTemplate = template;
      });
    });

    return actions.ofType((_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE).switchMap(action => {
      if (!(action.type === (_ActionTypes || _load_ActionTypes()).SET_VIEW_MODE)) {
        throw new Error('Invariant violation: "action.type === ActionTypes.SET_VIEW_MODE"');
      }

      const { viewMode } = action.payload;

      if (viewMode === (_constants || _load_constants()).DiffMode.BROWSE_MODE) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      const headRevisionChanges = observeRepositoryHeadRevision(activeRepository).filter(headRevision => headRevision != null).map(headRevision => {
        if (!(headRevision != null)) {
          throw new Error('Invariant violation: "headRevision != null"');
        }

        return headRevision;
      }).distinctUntilChanged();

      const headCommitMessageChanges = headRevisionChanges.map(headRevision => headRevision.description).distinctUntilChanged();

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
                return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateCommitState({
                  message: null,
                  mode: commitMode,
                  state: (_constants || _load_constants()).CommitModeState.LOADING_COMMIT_MESSAGE
                })), loadCommitTemplate.map(commitMessage => (_Actions || _load_Actions()).updateCommitState({
                  message: commitMessage,
                  mode: commitMode,
                  state: (_constants || _load_constants()).CommitModeState.READY
                })));
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
                (0, (_notifications || _load_notifications()).notifyInternalError)(new Error(`Invalid Commit Mode: ${commitMode}`));
                return _rxjsBundlesRxMinJs.Observable.empty();
              }
          }
        });
      }

      const { CommitPhase } = (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants;

      const isPublishReady = () => store.getState().publish.state !== (_constants || _load_constants()).PublishModeState.AWAITING_PUBLISH;

      // If the latest head has a phabricator revision in the commit message,
      // then, it's PublishMode.UPDATE mode
      // Otherwise, it's a new revision with `PublishMode.CREATE` state.
      if (viewMode === (_constants || _load_constants()).DiffMode.PUBLISH_MODE) {
        return _rxjsBundlesRxMinJs.Observable.concat(isPublishReady() ? _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updatePublishState({
          message: null,
          mode: store.getState().publish.mode,
          state: (_constants || _load_constants()).PublishModeState.LOADING_PUBLISH_MESSAGE
        })) : _rxjsBundlesRxMinJs.Observable.empty(), headRevisionChanges.switchMap(headRevision => {
          if (!isPublishReady()) {
            // An amend can come as part of publishing new revisions.
            // So, skip updating if there's an ongoing publish.
            return _rxjsBundlesRxMinJs.Observable.empty();
          } else if (headRevision.phase !== CommitPhase.DRAFT) {
            atom.notifications.addWarning('Cannot publish public commits', { detail: 'Did you forget to commit your changes?' });
            return _rxjsBundlesRxMinJs.Observable.from([(_Actions || _load_Actions()).setViewMode((_constants || _load_constants()).DiffMode.BROWSE_MODE), (_Actions || _load_Actions()).updatePublishState((0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyPublishState)())]);
          }

          const headCommitMessage = headRevision.description;
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

      (0, (_notifications || _load_notifications()).notifyInternalError)(new Error(`Invalid Diff View Mode: ${viewMode}`));
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
    const { message, repository, publishUpdates, bookmarkName } = action.payload;
    const {
      activeRepositoryState: { dirtyFiles },
      commit: { mode },
      isPrepareMode,
      lintExcuse,
      publish,
      shouldCommitInteractively,
      shouldPublishOnCommit,
      shouldRebaseOnAmend
    } = store.getState();
    const consoleClient = new ConsoleClient(mode, publishUpdates);

    // Trying to amend a commit interactively with no uncommitted changes
    // will instantly return and not allow the commit message to update
    const isInteractive = shouldCommitInteractively && dirtyFiles.size > 0;

    // If the commit/amend and publish option are chosen
    function getPublishActions() {
      let publishMode;
      let publishUpdateMessage;
      if (publish.message == null) {
        publishUpdateMessage = message;
        publishMode = (_constants || _load_constants()).PublishMode.CREATE;
      } else {
        publishUpdateMessage = publish.message;
        publishMode = (_constants || _load_constants()).PublishMode.UPDATE;
      }

      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updatePublishState(Object.assign({}, publish, {
        mode: publishMode
      })), (_Actions || _load_Actions()).publishDiff(repository, publishUpdateMessage, isPrepareMode, lintExcuse, publishUpdates));
    }

    const resetCommitAction = (_Actions || _load_Actions()).updateCommitState({
      message,
      mode,
      state: (_constants || _load_constants()).CommitModeState.READY
    });

    return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updateCommitState({
      message,
      mode,
      state: (_constants || _load_constants()).CommitModeState.AWAITING_COMMIT
    })), trackComplete('diff-view-commit', _rxjsBundlesRxMinJs.Observable.defer(() => {
      switch (mode) {
        case (_constants || _load_constants()).CommitMode.COMMIT:
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-commit-commit');
          return _rxjsBundlesRxMinJs.Observable.concat(bookmarkName != null && bookmarkName.length > 0 ? _rxjsBundlesRxMinJs.Observable.fromPromise(repository.createBookmark(bookmarkName)).ignoreElements() : _rxjsBundlesRxMinJs.Observable.empty(), repository.commit(message, isInteractive));
        case (_constants || _load_constants()).CommitMode.AMEND:
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-commit-amend');
          return repository.amend(message, (0, (_utils || _load_utils()).getAmendMode)(shouldRebaseOnAmend), isInteractive);
        default:
          return _rxjsBundlesRxMinJs.Observable.throw(new Error(`Invalid Commit Mode ${mode}`));
      }
    })).do(processMessage => consoleClient.enableAndPipeProcessMessagesToConsole(processMessage)).switchMap(processMessage => {
      if (processMessage.kind !== 'exit') {
        return _rxjsBundlesRxMinJs.Observable.empty();
      } else if (processMessage.exitCode !== 0) {
        return _rxjsBundlesRxMinJs.Observable.of(resetCommitAction);
      }
      if (shouldPublishOnCommit) {
        return getPublishActions();
      } else {
        return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).setViewMode((_constants || _load_constants()).DiffMode.BROWSE_MODE), (_Actions || _load_Actions()).updateCommitState((0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyCommitState)()));
      }
    }).catch(error => {
      atom.notifications.addError('Couldn\'t commit code', {
        detail: error
      });
      return _rxjsBundlesRxMinJs.Observable.of(resetCommitAction);
    }));
  });
}

function publishDiff(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).PUBLISH_DIFF).switchMap(action => {
    if (!(action.type === (_ActionTypes || _load_ActionTypes()).PUBLISH_DIFF)) {
      throw new Error('Invariant violation: "action.type === ActionTypes.PUBLISH_DIFF"');
    }

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-publish');
    const { message, repository, isPrepareMode, lintExcuse, publishUpdates } = action.payload;
    const { publish: { mode }, shouldRebaseOnAmend, verbatimModeEnabled } = store.getState();

    const amendCleanupMessage = mode === (_constants || _load_constants()).PublishMode.CREATE ? message : null;
    (0, (_streamProcessToConsoleMessages || _load_streamProcessToConsoleMessages()).dispatchConsoleToggle)(true);

    return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updatePublishState({
      mode,
      message,
      state: (_constants || _load_constants()).PublishModeState.AWAITING_PUBLISH
    })), _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_utils || _load_utils()).promptToCleanDirtyChanges)(repository, amendCleanupMessage, shouldRebaseOnAmend, publishUpdates)).switchMap(cleanResult => {
      if (cleanResult == null) {
        atom.notifications.addWarning('You have uncommitted changes!', {
          dismissable: true,
          nativeFriendly: true
        });
        // Keep the message, in case the user wants to apply updates.
        return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updatePublishState({
          mode,
          message,
          state: (_constants || _load_constants()).PublishModeState.READY
        }));
      }
      const { amended, allowUntracked } = cleanResult;
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
            return trackComplete('diff-view.publish-diff', (0, (_utils || _load_utils()).updatePhabricatorRevision)(repository, publishUpdates, headRevision.description, message, allowUntracked, lintExcuse, verbatimModeEnabled));
          default:
            (0, (_notifications || _load_notifications()).notifyInternalError)(new Error(`Invalid Publish Mode: ${mode}`));
            return _rxjsBundlesRxMinJs.Observable.empty();
        }
      }).ignoreElements().concat(_rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updatePublishState((0, (_createEmptyAppState || _load_createEmptyAppState()).getEmptyPublishState)()), (_Actions || _load_Actions()).setViewMode((_constants || _load_constants()).DiffMode.BROWSE_MODE)));
    }).catch(error => {
      atom.notifications.addError('Couldn\'t Publish to Phabricator', {
        detail: error.message,
        nativeFriendly: true
      });
      return _rxjsBundlesRxMinJs.Observable.of((_Actions || _load_Actions()).updatePublishState({
        mode,
        message,
        state: (_constants || _load_constants()).PublishModeState.PUBLISH_ERROR
      }));
    }));
  });
}

function splitRevision(actions, store) {
  return actions.ofType((_ActionTypes || _load_ActionTypes()).SPLIT_REVISION).switchMap(action => {
    if (!(action.type === (_ActionTypes || _load_ActionTypes()).SPLIT_REVISION)) {
      throw new Error('Invariant violation: "action.type === ActionTypes.SPLIT_REVISION"');
    }

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-split');
    const {
      publishUpdates,
      repository
    } = action.payload;
    const {
      commit: { mode }
    } = store.getState();
    const consoleClient = new ConsoleClient(mode, publishUpdates);

    return trackComplete('diff-view-split', _rxjsBundlesRxMinJs.Observable.defer(() => repository.splitRevision())).do(processMessage => consoleClient.enableAndPipeProcessMessagesToConsole(processMessage)).switchMap(processMessage => _rxjsBundlesRxMinJs.Observable.empty()).catch(error => {
      atom.notifications.addError('Couldn\'t split revision', {
        detail: error
      });
      return _rxjsBundlesRxMinJs.Observable.empty();
    });
  });
}

try {
  // $FlowFB
  Object.assign(module.exports, require('../fb/Epics'));
} catch (e) {}