'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Action} from './types';
import type {AppState} from '..';

import * as ActionType from './ActionType';
import {HgRepositoryClientAsync} from '../../nuclide-hg-repository-client';
import invariant from 'assert';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {repositoryForPath} from '../../nuclide-hg-git-bridge';
import Rx from 'rxjs';

const HANDLED_ACTION_TYPES = [
  ActionType.FETCH_PROJECT_REPOSITORIES,
];

export function applyActionMiddleware(
  actions: Rx.Observable<Action>,
  getState: () => AppState,
): Rx.Observable<Action> {
  const output = Rx.Observable.merge(
    // Skip unhandled ActionTypes.
    actions.filter(action => HANDLED_ACTION_TYPES.indexOf(action.type) === -1),

    // Fetch and subscribe to repositories and their bookmarks.
    actions.filter(action => action.type === ActionType.FETCH_PROJECT_REPOSITORIES)
      .switchMap(action => {
        const {projectDirectories} = getState();

        return Rx.Observable.from(projectDirectories).flatMap(directory => {
          const repository = repositoryForPath(directory.getPath());
          if (repository == null || repository.getType() !== 'hg') {
            return Rx.Observable.empty();
          }

          const repositoryAsync = repository.async;

          // Type was checked with `getType`. Downcast to safely access members with Flow.
          invariant(repositoryAsync instanceof HgRepositoryClientAsync);

          return Rx.Observable.of({
            payload: {
              directory,
              repository,
            },
            type: ActionType.SET_DIRECTORY_REPOSITORY,
          }).concat(
            Rx.Observable.merge(
              observableFromSubscribeFunction(
                // Re-fetch when the list of bookmarks changes.
                repositoryAsync.onDidChangeBookmarks.bind(repositoryAsync)
              ),
              observableFromSubscribeFunction(
                // Re-fetch when the active bookmark changes (called "short head" to match
                // Atom's Git API).
                repositoryAsync.onDidChangeShortHead.bind(repositoryAsync)
              )
            )
            .startWith(null) // Kick it off the first time
            .switchMap(() => {
              return Rx.Observable.fromPromise(repositoryAsync.getBookmarks());
            })
            .map(bookmarks => ({
              payload: {
                bookmarks,
                repository,
              },
              type: ActionType.SET_REPOSITORY_BOOKMARKS,
            }))
          );
        });
      }),
  );
  return output.share();
}
