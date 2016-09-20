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
  formatFileDiffRevisionTitle,
} from '../DiffViewModel';
import {repositoryForPath} from '../../../nuclide-hg-git-bridge';
import {bufferForUri, loadBufferForUri} from '../../../commons-atom/text-editor';
import {getEmptyFileDiffState} from './createEmptyAppState';

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
  const {repositories} = store.getState();
  const initialRepositoryState = repositories.get(repository);
  invariant(initialRepositoryState != null, 'Cannot activate repository before adding it!');

  return actions.filter(a =>
    a.type === ActionTypes.SET_DIFF_OPTION &&
      a.payload.repository === repository,
  ).map(a => {
    invariant(a.type === ActionTypes.SET_DIFF_OPTION);
    return a.payload.diffOption;
  }).startWith(initialRepositoryState.diffOption);
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
