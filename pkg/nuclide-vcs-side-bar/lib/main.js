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
import type {BookmarkInfo} from '../../nuclide-hg-repository-base/lib/HgService';
import type {NuclideSideBarService} from '../../nuclide-side-bar';

import {applyActionMiddleware} from './applyActionMiddleware';
import Commands from './Commands';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import Rx from 'rxjs';

export type AppState = {
  projectBookmarks: Map<string, Array<BookmarkInfo>>;
  projectDirectories: Array<atom$Directory>;
  projectRepositories: Map<string, atom$Repository>;
};

function createStateStream(
  actions: Rx.Observable<Action>,
  initialState: AppState,
): Rx.BehaviorSubject<AppState> {
  const states = new Rx.BehaviorSubject(initialState);
  actions.scan(accumulateState, initialState).subscribe(states);
  return states;
}

function getInitialState() {
  return {
    projectBookmarks: new Map(),
    projectDirectories: [],
    projectRepositories: new Map(),
  };
}

let commands: Commands;
let states: Rx.BehaviorSubject<AppState>;
let subscription: Rx.Subscription;

export function activate(rawState: Object): void {
  const initialState = getInitialState();
  const actions = new Rx.Subject();
  states = createStateStream(
    applyActionMiddleware(actions, () => states.getValue()),
    initialState
  );

  const dispatch = action => { actions.next(action); };
  commands = new Commands(dispatch, () => states.getValue());

  subscription = observableFromSubscribeFunction(
      atom.project.onDidChangePaths.bind(atom.project)
    )
    .startWith(null) // Start with a fake event to fetch initial directories.
    .subscribe(() => {
      commands.fetchProjectDirectories();
    });
}

export function consumeNuclideSideBar(sideBar: NuclideSideBarService): void {
}

function accumulateState(state: AppState, action: Action): AppState {
  switch (action.type) {
    default:
      break;
  }

  throw new Error(`Unrecognized action type: ${action.type}`);
}

export function deactivate(): void {
  states.unsubscribe();
  subscription.unsubscribe();
}
