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
import type {HgRepositoryClient} from '../../../nuclide-hg-repository-client';
import type {RevisionInfo} from '../../../nuclide-hg-rpc/lib/HgService';

import * as ActionTypes from './ActionTypes';
import * as Actions from './Actions';
import invariant from 'assert';
import {Observable} from 'rxjs';
import {observableFromSubscribeFunction} from '../../../commons-node/event';
import {
  getDirtyFileChanges,
  getHeadRevision,
  getHeadToForkBaseRevisions,
  getHgDiff,
  getSelectedFileChanges,
} from '../RepositoryStack';
import {
  createPhabricatorRevision,
  formatFileDiffRevisionTitle,
  getRevisionUpdateMessage,
  viewModeToDiffOption,
  updatePhabricatorRevision,
} from '../DiffViewModel';
import {
  CommitMode,
  CommitModeState,
  DiffMode,
  PublishMode,
  PublishModeState,
} from '../constants';
import {
  getAmendMode,
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

const UPDATE_STATUS_DEBOUNCE_MS = 50;

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

// A repository is considered activated only when the Diff View is open.
// This allows to not bother with loading revision info and changes when not needed.
export function activateRepositoryEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(ActionTypes.ACTIVATE_REPOSITORY).flatMap(action => {
    invariant(action.type === ActionTypes.ACTIVATE_REPOSITORY);
    const {repository} = action.payload;

    const statusChanges = observeStatusChanges(repository);
    const revisionChanges = repository.observeRevisionChanges();
    const revisionStatusChanges = repository.observeRevisionStatusesChanges();
    const diffOptionChanges = getDiffOptionChanges(actions, store, repository);
    const compareIdChanges = getCompareIdChanges(actions, store, repository);

    const selectedFileUpdates = Observable.combineLatest(
      revisionChanges, diffOptionChanges, compareIdChanges, statusChanges,
      (revisions, diffOption, compareId) => ({revisions, diffOption, compareId}),
    ).filter(({revisions}) => getHeadRevision(revisions) != null)
    .switchMap(({revisions, compareId, diffOption}) =>
      // TODO(most): Add loading states.
      getSelectedFileChanges(
        repository,
        diffOption,
        revisions,
        compareId,
      ),
    ).map(revisionFileChanges => Actions.updateSelectedFiles(repository, revisionFileChanges));

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
    ).takeUntil(Observable.merge(
      observableFromSubscribeFunction(repository.onDidDestroy.bind(repository)),
      actions.filter(a =>
        a.type === ActionTypes.DEACTIVATE_REPOSITORY &&
          a.payload.repository === repository,
      ),
    ));
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
    return observableFromSubscribeFunction(cwdApi.observeCwd.bind(cwdApi))
      .map(directory => {
        if (directory == null) {
          return null;
        } else {
          return repositoryForPath(directory.getPath());
        }
      }).map(repository => Actions.updateActiveRepository(repository));
  });
}

export function diffFileEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(ActionTypes.DIFF_FILE).switchMap(action => {
    invariant(action.type === ActionTypes.DIFF_FILE);

    const {filePath} = action.payload;
    const repository = repositoryForPath(filePath);

    if (repository == null || repository.getType() !== 'hg') {
      const repositoryType = repository == null ? 'no repository' : repository.getType();
      return Observable.throw(
        new Error(`Diff View only supports Mercurial repositories - found: ${repositoryType}`));
    }

    const {activeRepository} = store.getState();
    if (repository !== activeRepository) {
      return Observable.throw(
        new Error('Cannot diff file from a non-working directory\n' +
          'Please switch your working directory from the file tree to be able to diff that file!'),
      );
    }

    const hgRepository = ((repository: any): HgRepositoryClient);

    const revisionChanges = hgRepository.observeRevisionChanges();
    const diffOptionChanges = getDiffOptionChanges(actions, store, hgRepository);
    const compareIdChanges = getCompareIdChanges(actions, store, hgRepository);

    const deactiveRepsitory = actions.filter(a =>
      a.type === ActionTypes.DEACTIVATE_REPOSITORY && a.payload.repository === hgRepository);
    const deselectActiveRepository = actions.filter(a =>
      a.type === ActionTypes.UPDATE_ACTIVE_REPOSITORY && a.payload.hgRepository !== hgRepository);

    const buffer = bufferForUri(filePath);
    const bufferReloads = observableFromSubscribeFunction(buffer.onDidReload.bind(buffer))
      .map(() => null)
      .startWith(null);

    const fetchHgDiff = Observable.combineLatest(
      revisionChanges,
      diffOptionChanges,
      compareIdChanges,
      (revisions, diffOption, compareId) => ({revisions, diffOption, compareId}),
    ).filter(({revisions}) => getHeadRevision(revisions) != null)
    .switchMap(({revisions, diffOption, compareId}) => {
      // TODO(most): Add loading states.
      const headToForkBaseRevisions = getHeadToForkBaseRevisions(revisions);
      return getHgDiff(hgRepository, filePath, headToForkBaseRevisions, diffOption, compareId);
    }).switchMap(hgDiff =>
      // Load the buffer to use its contents as the new contents.
      Observable.fromPromise(loadBufferForUri(filePath))
        .map(() => hgDiff),
    );

    return Observable.combineLatest(fetchHgDiff, bufferReloads)
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
        deselectActiveRepository,
      ))
      .concat(Observable.of(Actions.updateFileDiff(getEmptyFileDiffState())));
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
              return Observable.throw(new Error(`Invalid Commit Mode: ${commitMode}`));
            }
          }
        });
      }

      // If the latest head has a phabricator revision in the commit message,
      // then, it's PublishMode.UPDATE mode
      // Otherwise, it's a new revision with `PublishMode.CREATE` state.
      if (viewMode === DiffMode.PUBLISH_MODE) {
        return Observable.concat(
          Observable.of(Actions.updatePublishState({
            message: null,
            mode: store.getState().publish.mode,
            state: PublishModeState.LOADING_PUBLISH_MESSAGE,
          })),
          headCommitMessageChanges.map(headCommitMessage => {
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

            return Actions.updatePublishState({
              message: publishMessage,
              mode: publishMode,
              state: PublishModeState.READY,
            });
          }),
        );
      }

      return Observable.throw(new Error(`Invalid Diff View Mode: ${viewMode}`));
    }).takeUntil(actions.ofType(ActionTypes.DEACTIVATE_REPOSITORY));
  });
}

export function commit(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(ActionTypes.COMMIT).switchMap(action => {
    invariant(action.type === ActionTypes.COMMIT);

    const {message, repository} = action.payload;
    const {commit: {mode}, shouldRebaseOnAmend} = store.getState();

    return Observable.of(Actions.updateCommitState({
      message,
      mode,
      state: CommitModeState.AWAITING_COMMIT,
    })).switchMap(() => {
      switch (mode) {
        case CommitMode.COMMIT:
          return repository.commit(message)
            .toArray();
        case CommitMode.AMEND:
          return repository.amend(message, getAmendMode(shouldRebaseOnAmend))
            .toArray();
        default:
          return Observable.throw(new Error(`Invalid Commit Mode ${mode}`));
      }
    }).map(() => {
      const successMessage = mode === CommitMode.COMMIT ? 'created' : 'amended';
      atom.notifications.addSuccess(`Commit ${successMessage}`, {nativeFriendly: true});

      return Actions.setViewMode(DiffMode.BROWSE_MODE);
    }).catch(error => {
      atom.notifications.addError('Error creating commit', {
        detail: `Details: ${error.message}`,
        nativeFriendly: true,
      });
      return Observable.empty();
    }).concat(Observable.of(Actions.updateCommitState(getEmptyCommitState())));
  });
}

export function publishDiff(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(ActionTypes.PUBLISH_DIFF).switchMap(action => {
    invariant(action.type === ActionTypes.PUBLISH_DIFF);

    const {message, repository, lintExcuse, publishUpdates} = action.payload;
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
          atom.notifications.addError('Error clearning dirty changes', {
            dismissable: true,
            nativeFriendly: true,
          });
          return Observable.of(Actions.updatePublishState(getEmptyPublishState()));
        }
        const {amended, allowUntracked} = cleanResult;
        return observeRepositoryHeadRevision(repository)
          .filter(headRevision => headRevision != null)
          .first().switchMap(headRevision => {
            invariant(headRevision != null);

            switch (mode) {
              case PublishMode.CREATE:
                return createPhabricatorRevision(
                  repository,
                  publishUpdates,
                  headRevision.description,
                  message,
                  amended,
                  lintExcuse,
                );
              case PublishMode.UPDATE:
                return updatePhabricatorRevision(
                  repository,
                  publishUpdates,
                  headRevision.description,
                  message,
                  allowUntracked,
                  lintExcuse,
                );
              default:
                return Observable.throw(new Error(`Invalid Publish Mode: ${mode}`));
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
