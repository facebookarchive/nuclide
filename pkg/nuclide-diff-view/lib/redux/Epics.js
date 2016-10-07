'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action, DiffOptionType, Store} from '../types';
import type {ActionsObservable} from '../../../commons-node/redux-observable';
import type {CwdApi} from '../../../nuclide-current-working-directory/lib/CwdApi';
import type {HgRepositoryClient} from '../../../nuclide-hg-repository-client';
import type {RevisionInfo} from '../../../nuclide-hg-rpc/lib/HgService';
import type {NuclideUri} from '../../../commons-node/nuclideUri';

import * as ActionTypes from './ActionTypes';
import * as Actions from './Actions';
import invariant from 'assert';
import {Observable, Subject} from 'rxjs';
import {observableFromSubscribeFunction} from '../../../commons-node/event';
import {
  CommitMode,
  CommitModeState,
  DiffMode,
  PublishMode,
  PublishModeState,
} from '../constants';
import {
  createPhabricatorRevision,
  formatFileDiffRevisionTitle,
  getAmendMode,
  getDirtyFileChanges,
  getHeadRevision,
  getHeadToForkBaseRevisions,
  getHgDiff,
  getRevisionUpdateMessage,
  getSelectedFileChanges,
  updatePhabricatorRevision,
  viewModeToDiffOption,
  promptToCleanDirtyChanges,
} from '../utils';
import {repositoryForPath} from '../../../nuclide-hg-git-bridge';
import {bufferForUri, loadBufferForUri} from '../../../commons-atom/text-editor';
import {
  getEmptyCommitState,
  getEmptyFileDiffState,
  getEmptyPublishState,
} from './createEmptyAppState';
import {getPhabricatorRevisionFromCommitMessage} from '../../../nuclide-arcanist-rpc/lib/utils';
import {notifyInternalError} from '../notifications';
import {startTracking, track} from '../../../nuclide-analytics';
import nuclideUri from '../../../commons-node/nuclideUri';

const UPDATE_STATUS_DEBOUNCE_MS = 50;
const CHANGE_DEBOUNCE_DELAY_MS = 10;

function trackComplete<T>(eventName: string, operation: Observable<T>): Observable<T> {
  // Start the timer when the observable is subscribed.
  return Observable.defer(() => {
    const tracker = startTracking(eventName);
    return operation
      .do({
        error(err) { tracker.onError(err); },
        complete() { tracker.onSuccess(); },
      });
  });
}

function notifyCwdMismatch(
  newRepository: HgRepositoryClient,
  cwdApi: CwdApi,
  filePath: NuclideUri,
  onChangeModified: () => mixed,
): Observable<Action> {
  const newDirectoryPath = newRepository.getProjectDirectory();
  const actionSubject = new Subject();
  const notification = atom.notifications.addWarning(
    'Cannot show diff for a non-working directory\n'
      + 'Would you like to switch your working directory to '
      + `\`${nuclideUri.basename(newDirectoryPath)}\` to be able to diff that file?`,
    {
      buttons: [{
        text: 'Switch & Show Diff',
        className: 'icon icon-git-branch',
        onDidClick: () => {
          cwdApi.setCwd(newDirectoryPath);
          actionSubject.next(Actions.diffFile(filePath, onChangeModified));
          notification.dismiss();
        },
      }, {
        text: 'Dismiss',
        onDidClick: () => {
          notification.dismiss();
        },
      }],
      detail: 'You can always switch your working directory\n'
        + 'from the file tree.',
      dismissable: true,
    },
  );
  return actionSubject.asObservable().takeUntil(
    observableFromSubscribeFunction(notification.onDidDismiss.bind(notification)),
  );
}

function observeStatusChanges(repository: HgRepositoryClient): Observable<null> {
  return observableFromSubscribeFunction(
    repository.onDidChangeStatuses.bind(repository),
  )
  .debounceTime(UPDATE_STATUS_DEBOUNCE_MS)
  .map(() => null)
  .startWith(null);
}

function getDiffOptionChanges(
  actions: ActionsObservable<Action>,
  store: Store,
  repository: HgRepositoryClient,
): Observable<DiffOptionType> {
  const {viewMode} = store.getState();

  return actions.ofType(ActionTypes.SET_VIEW_MODE).map(a => {
    invariant(a.type === ActionTypes.SET_VIEW_MODE);
    return viewModeToDiffOption(a.payload.viewMode);
  }).startWith(viewModeToDiffOption(viewMode))
  .distinctUntilChanged();
}

function getCompareIdChanges(
  actions: ActionsObservable<Action>,
  store: Store,
  repository: HgRepositoryClient,
): Observable<?number> {
  const {repositories} = store.getState();
  const initialRepositoryState = repositories.get(repository);
  invariant(initialRepositoryState != null, 'Cannot activate repository before adding it!');

  return actions.filter(a =>
    a.type === ActionTypes.SET_COMPARE_ID &&
      a.payload.repository === repository,
  ).map(a => {
    invariant(a.type === ActionTypes.SET_COMPARE_ID);
    return a.payload.compareId;
  }).startWith(initialRepositoryState.compareRevisionId);
}

function observeActiveRepository(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<?HgRepositoryClient> {
  return actions.filter(a => a.type === ActionTypes.UPDATE_ACTIVE_REPOSITORY)
    .map(a => {
      invariant(a.type === ActionTypes.UPDATE_ACTIVE_REPOSITORY);
      return a.payload.hgRepository;
    })
    .startWith(store.getState().activeRepository);
}

function observeRepositoryHeadRevision(
  repository: HgRepositoryClient,
): Observable<?RevisionInfo> {
  return repository.observeRevisionChanges()
    .map(revisions => getHeadRevision(revisions))
    .distinctUntilChanged((revision1, revision2) => {
      if (revision1 === revision2) {
        return true;
      } else if (revision1 == null || revision2 == null) {
        return false;
      } else {
        invariant(revision1 != null);
        return revision1.id === revision2.id;
      }
    });
}

// An added, but not-activated repository would continue to provide dirty file change updates,
// because they are cheap to compute, while needed in the UI.
export function addRepositoryEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(ActionTypes.ADD_REPOSITORY).flatMap(action => {
    invariant(action.type === ActionTypes.ADD_REPOSITORY);
    const {repository} = action.payload;

    return observeStatusChanges(repository)
      .map(() => Actions.updateDirtyFiles(repository, getDirtyFileChanges(repository)))
      .takeUntil(observableFromSubscribeFunction(repository.onDidDestroy.bind(repository)))
      .concat(Observable.of(Actions.removeRepository(repository)));
  });
}

function observeViewOpen(
  actions: ActionsObservable<Action>,
): Observable<boolean> {
  return Observable.merge(
    actions.ofType(ActionTypes.OPEN_VIEW).map(() => true),
    actions.ofType(ActionTypes.CLOSE_VIEW).map(() => false),
  ).startWith(false).cache(1);
}

// A repository is considered activated only when the Diff View is open.
// This allows to not bother with loading revision info and changes when not needed.
export function updateActiveRepositoryEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return Observable.combineLatest(
    actions.ofType(ActionTypes.UPDATE_ACTIVE_REPOSITORY),
    observeViewOpen(actions),
  ).switchMap(([action, isViewOpen]) => {
    invariant(action.type === ActionTypes.UPDATE_ACTIVE_REPOSITORY);
    const {hgRepository: repository} = action.payload;

    if (!isViewOpen || repository == null) {
      return Observable.empty();
    }

    const statusChanges = observeStatusChanges(repository);
    const revisionChanges = repository.observeRevisionChanges();
    const revisionStatusChanges = repository.observeRevisionStatusesChanges();
    const diffOptionChanges = getDiffOptionChanges(actions, store, repository);
    const compareIdChanges = getCompareIdChanges(actions, store, repository);

    const selectedFileUpdates = Observable.combineLatest(
      revisionChanges, diffOptionChanges, compareIdChanges, statusChanges,
      (revisions, diffOption, compareId) => ({revisions, diffOption, compareId}),
    ).filter(({revisions}) => getHeadRevision(revisions) != null)
    .switchMap(({revisions, compareId, diffOption}) => {
      // TODO(most): Add loading states.
      return Observable.concat(
        compareId != null && revisions.find(rev => rev.id === compareId) == null
          ? Observable.of(Actions.setCompareId(repository, null))
          : Observable.empty(),

        getSelectedFileChanges(
          repository,
          diffOption,
          revisions,
          compareId,
        ).catch(error => {
          notifyInternalError(error);
          return Observable.empty();
        }).map(revisionFileChanges =>
          Actions.updateSelectedFiles(repository, revisionFileChanges),
        ),
      );
    });

    const revisionStateUpdates = Observable.combineLatest(revisionChanges, revisionStatusChanges)
      .filter(([revisions]) => getHeadRevision(revisions) != null)
      .map(([revisions, revisionStatuses]) =>
        Actions.updateHeadToForkBaseRevisionsState(
          repository,
          getHeadToForkBaseRevisions(revisions),
          revisionStatuses,
        ),
      );

    return Observable.merge(
      selectedFileUpdates,
      revisionStateUpdates,
    );
  });
}

export function setCwdApiEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(ActionTypes.SET_CWD_API).switchMap(action => {
    invariant(action.type === ActionTypes.SET_CWD_API);

    const {cwdApi} = action.payload;

    if (cwdApi == null) {
      return Observable.of(Actions.updateActiveRepository(null));
    }

    const cwdHgRepository = observableFromSubscribeFunction(cwdApi.observeCwd.bind(cwdApi))
      .map(directory => {
        if (directory == null) {
          return null;
        } else {
          return repositoryForPath(directory.getPath());
        }
      }).map(repository => {
        if (repository == null || repository.getType() !== 'hg') {
          return null;
        } else {
          return ((repository: any): HgRepositoryClient);
        }
      }).distinctUntilChanged();

    return cwdHgRepository.map(repository => Actions.updateActiveRepository(repository));
  });
}

export function diffFileEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(ActionTypes.DIFF_FILE).switchMap(action => {
    invariant(action.type === ActionTypes.DIFF_FILE);

    const clearActiveDiffObservable =
      Observable.of(Actions.updateFileDiff(getEmptyFileDiffState()));

    const {filePath, onChangeModified} = action.payload;
    const repository = repositoryForPath(filePath);

    if (repository == null || repository.getType() !== 'hg') {
      const repositoryType = repository == null ? 'no repository' : repository.getType();
      notifyInternalError(
        new Error(`Diff View only supports Mercurial repositories - found: ${repositoryType}`),
      );
      return clearActiveDiffObservable;
    }

    const hgRepository = ((repository: any): HgRepositoryClient);
    const {activeRepository} = store.getState();

    if (repository !== activeRepository) {
      const {cwdApi} = store.getState();
      if (cwdApi == null) {
        return Observable.throw('Cannot have a null CwdApi');
      }
      return clearActiveDiffObservable.concat(notifyCwdMismatch(
        hgRepository,
        cwdApi,
        filePath,
        onChangeModified,
      ));
    }

    const revisionChanges = hgRepository.observeRevisionChanges();
    const diffOptionChanges = getDiffOptionChanges(actions, store, hgRepository);
    const compareIdChanges = getCompareIdChanges(actions, store, hgRepository);

    const deactiveRepsitory = actions.filter(a =>
      a.type === ActionTypes.UPDATE_ACTIVE_REPOSITORY && a.payload.hgRepository === hgRepository);

    const buffer = bufferForUri(filePath);
    const bufferReloads = observableFromSubscribeFunction(buffer.onDidReload.bind(buffer))
      .map(() => null)
      .startWith(null);
    const bufferChanges = observableFromSubscribeFunction(buffer.onDidChange.bind(buffer))
      .debounceTime(CHANGE_DEBOUNCE_DELAY_MS);

    const bufferChangeModifed = Observable.merge(
      observableFromSubscribeFunction(buffer.onDidChangeModified.bind(buffer)),
      observableFromSubscribeFunction(buffer.onDidStopChanging.bind(buffer)),
    ).map(onChangeModified)
    .ignoreElements();

    const fetchHgDiff = Observable.combineLatest(
      revisionChanges,
      diffOptionChanges,
      compareIdChanges,
      (revisions, diffOption, compareId) => ({revisions, diffOption, compareId}),
    ).filter(({revisions}) => getHeadRevision(revisions) != null)
    .switchMap(({revisions, diffOption, compareId}) => {
      // TODO(most): Add loading states.
      const headToForkBaseRevisions = getHeadToForkBaseRevisions(revisions);
      return getHgDiff(hgRepository, filePath, headToForkBaseRevisions, diffOption, compareId)
        .catch(error => {
          notifyInternalError(error);
          return Observable.empty();
        });
    }).switchMap(hgDiff =>
      // Load the buffer to use its contents as the new contents.
      Observable.fromPromise(loadBufferForUri(filePath))
        .map(() => hgDiff),
      );

    return Observable.merge(
      bufferChangeModifed,

      Observable.combineLatest(fetchHgDiff, Observable.merge(bufferReloads, bufferChanges))
        .map(([{committedContents, revisionInfo}]) => Actions.updateFileDiff({
          filePath,
          fromRevisionTitle: formatFileDiffRevisionTitle(revisionInfo),
          newContents: buffer.getText(),
          oldContents: committedContents,
          toRevisionTitle: 'Filesystem / Editor',
        }))
        .takeUntil(Observable.merge(
          observableFromSubscribeFunction(buffer.onDidDestroy.bind(buffer)),
          deactiveRepsitory,
        ))
        .concat(clearActiveDiffObservable),
    );
  });
}

export function setViewModeEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(ActionTypes.SET_VIEW_MODE).switchMap(action => {
    invariant(action.type === ActionTypes.SET_VIEW_MODE);

    const {viewMode} = action.payload;

    if (viewMode === DiffMode.BROWSE_MODE) {
      return Observable.empty();
    }

    return observeActiveRepository(actions, store).switchMap(activeRepository => {
      if (activeRepository == null) {
        return Observable.empty();
      }

      const headCommitMessageChanges = observeRepositoryHeadRevision(activeRepository)
        .filter(headRevision => headRevision != null)
        .map(headRevision => {
          invariant(headRevision != null);
          return headRevision.description;
        }).distinctUntilChanged();

      if (viewMode === DiffMode.COMMIT_MODE) {
        const commitModeChanges = Observable.of(store.getState().commit.mode)
          .concat(actions.ofType(ActionTypes.SET_COMMIT_MODE).map(a => {
            invariant(a.type === ActionTypes.SET_COMMIT_MODE);
            return a.payload.commitMode;
          }));

        return commitModeChanges.switchMap(commitMode => {
          switch (commitMode) {
            case CommitMode.COMMIT: {
              // TODO(asriram): load commit template in case of `COMMIT`.
              return Observable.empty();
            }
            case CommitMode.AMEND: {
              return Observable.concat(
                Observable.of(Actions.updateCommitState({
                  message: null,
                  mode: commitMode,
                  state: CommitModeState.LOADING_COMMIT_MESSAGE,
                })),
                headCommitMessageChanges.map(headCommitMessage => Actions.updateCommitState({
                  message: headCommitMessage,
                  mode: commitMode,
                  state: CommitModeState.READY,
                })),
              );
            }
            default: {
              notifyInternalError(new Error(`Invalid Commit Mode: ${commitMode}`));
              return Observable.empty();
            }
          }
        });
      }

      const isPublishReady = () =>
        store.getState().publish.state !== PublishModeState.AWAITING_PUBLISH;

      // If the latest head has a phabricator revision in the commit message,
      // then, it's PublishMode.UPDATE mode
      // Otherwise, it's a new revision with `PublishMode.CREATE` state.
      if (viewMode === DiffMode.PUBLISH_MODE) {
        return Observable.concat(
          isPublishReady()
            ? Observable.of(Actions.updatePublishState({
              message: null,
              mode: store.getState().publish.mode,
              state: PublishModeState.LOADING_PUBLISH_MESSAGE,
            }))
            : Observable.empty(),

          headCommitMessageChanges.switchMap(headCommitMessage => {
            if (!isPublishReady()) {
              // An amend can come as part of publishing new revisions.
              // So, skip updating if there's an ongoing publish.
              return Observable.empty();
            }

            const phabricatorRevision = getPhabricatorRevisionFromCommitMessage(headCommitMessage);

            let publishMessage;
            let publishMode;
            const existingMessage = store.getState().publish.message;

            if (phabricatorRevision == null) {
              publishMode = PublishMode.CREATE;
              publishMessage = headCommitMessage;
            } else {
              publishMode = PublishMode.UPDATE;
              publishMessage = existingMessage || getRevisionUpdateMessage(phabricatorRevision);
            }

            return Observable.of(Actions.updatePublishState({
              message: publishMessage,
              mode: publishMode,
              state: PublishModeState.READY,
            }));
          }),
        );
      }

      notifyInternalError(new Error(`Invalid Diff View Mode: ${viewMode}`));
      return Observable.empty();
    }).takeUntil(actions.ofType(ActionTypes.CLOSE_VIEW));
  });
}

export function commit(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(ActionTypes.COMMIT).switchMap(action => {
    invariant(action.type === ActionTypes.COMMIT);

    track('diff-view-commit');
    const {message, repository} = action.payload;
    const {commit: {mode}, shouldRebaseOnAmend} = store.getState();

    return Observable.concat(
      Observable.of(Actions.updateCommitState({
        message,
        mode,
        state: CommitModeState.AWAITING_COMMIT,
      })),

      trackComplete('diff-view-commit', Observable.defer(() => {
        switch (mode) {
          case CommitMode.COMMIT:
            track('diff-view-commit-commit');
            return repository.commit(message)
              .toArray();
          case CommitMode.AMEND:
            track('diff-view-commit-amend');
            return repository.amend(message, getAmendMode(shouldRebaseOnAmend))
              .toArray();
          default:
            return Observable.throw(new Error(`Invalid Commit Mode ${mode}`));
        }
      }))
      .switchMap(processMessages => {
        const successMessage = mode === CommitMode.COMMIT ? 'created' : 'amended';
        atom.notifications.addSuccess(`Commit ${successMessage}`, {nativeFriendly: true});

        return Observable.of(
          Actions.setViewMode(DiffMode.BROWSE_MODE),
          Actions.updateCommitState(getEmptyCommitState()),
        );
      })
      .catch(error => {
        atom.notifications.addError('Error creating commit', {
          detail: `Details: ${error.message}`,
          nativeFriendly: true,
        });
        return Observable.empty();
      }),
    );
  });
}

export function publishDiff(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(ActionTypes.PUBLISH_DIFF).switchMap(action => {
    invariant(action.type === ActionTypes.PUBLISH_DIFF);

    track('diff-view-publish');
    const {message, repository, isPrepareMode, lintExcuse, publishUpdates} = action.payload;
    const {publish: {mode}, shouldRebaseOnAmend} = store.getState();

    const amendCleanupMessage = mode === PublishMode.CREATE ? message : null;

    return Observable.concat(
      Observable.of(Actions.updatePublishState({
        mode,
        message,
        state: PublishModeState.AWAITING_PUBLISH,
      })),
      Observable.fromPromise(promptToCleanDirtyChanges(
        repository,
        amendCleanupMessage,
        shouldRebaseOnAmend,
      )).switchMap(cleanResult => {
        if (cleanResult == null) {
          atom.notifications.addWarning('You have uncommitted changes!', {
            dismissable: true,
            nativeFriendly: true,
          });
          // Keep the message, in case the user wants to apply updates.
          return Observable.of(Actions.updatePublishState({
            mode,
            message,
            state: PublishModeState.READY,
          }));
        }
        const {amended, allowUntracked} = cleanResult;
        return observeRepositoryHeadRevision(repository)
          .filter(headRevision => headRevision != null)
          .first().switchMap(headRevision => {
            invariant(headRevision != null);

            switch (mode) {
              case PublishMode.CREATE:
                track('diff-view-publish-create');
                return trackComplete('diff-view.publish-diff', createPhabricatorRevision(
                  repository,
                  publishUpdates,
                  headRevision.description,
                  message,
                  amended,
                  isPrepareMode,
                  lintExcuse,
                ));
              case PublishMode.UPDATE:
                track('diff-view-publish-update');
                return trackComplete('diff-view.publish-diff', updatePhabricatorRevision(
                  repository,
                  publishUpdates,
                  headRevision.description,
                  message,
                  allowUntracked,
                  lintExcuse,
                ));
              default:
                notifyInternalError(new Error(`Invalid Publish Mode: ${mode}`));
                return Observable.empty();
            }
          }).ignoreElements()
          .concat(Observable.of(
            Actions.updatePublishState(getEmptyPublishState()),
            Actions.setViewMode(DiffMode.BROWSE_MODE),
          )).catch(error => {
            atom.notifications.addError('Couldn\'t Publish to Phabricator', {
              detail: error.message,
              nativeFriendly: true,
            });
            return Observable.of(Actions.updatePublishState({
              mode,
              message,
              state: PublishModeState.PUBLISH_ERROR,
            }));
          });
      }),
    );
  });
}
