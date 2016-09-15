'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Store, Action} from '../types';
import type {ActionsObservable} from '../../../commons-node/redux-observable';
import type {HgRepositoryClient} from '../../../nuclide-hg-repository-client';

import * as ActionTypes from './ActionTypes';
import * as Actions from './Actions';
import invariant from 'assert';
import {Observable} from 'rxjs';
import {observableFromSubscribeFunction} from '../../../commons-node/event';

const UPDATE_STATUS_DEBOUNCE_MS = 50;

function observeStatusChanges(repository: HgRepositoryClient): Observable<void> {
  return observableFromSubscribeFunction(
    repository.onDidChangeStatuses.bind(repository),
  )
  .debounceTime(UPDATE_STATUS_DEBOUNCE_MS)
  .startWith();
}

export function addRepositoryEpic(
  actions: ActionsObservable<Action>,
  store: Store,
): Observable<Action> {
  return actions.ofType(ActionTypes.ADD_REPOSITORY).flatMap(action => {
    invariant(action.type === ActionTypes.ADD_REPOSITORY);
    const {repository} = action.payload;

    return observeStatusChanges(repository)
      .map(() => Actions.updateDirtyFiles(repository))
      .takeUntil(observableFromSubscribeFunction(repository.onDidDestroy.bind(repository)))
      .concat(Observable.of(Actions.removeRepository(repository)));
  });
}
