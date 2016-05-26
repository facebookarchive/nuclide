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

import * as ActionType from './ActionType';
import {applyActionMiddleware} from './applyActionMiddleware';
import {bindObservableAsProps} from '../../nuclide-ui/lib/bindObservableAsProps';
import Commands from './Commands';
import {CompositeDisposable, Disposable} from 'atom';
import {DisposableSubscription} from '../../commons-node/stream';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import Rx from 'rxjs';
import SideBarComponent from './SideBarComponent';

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
let disposables: CompositeDisposable;
let states: Rx.BehaviorSubject<AppState>;

export function activate(rawState: Object): void {
  const initialState = getInitialState();
  const actions = new Rx.Subject();
  states = createStateStream(
    applyActionMiddleware(actions, () => states.getValue()),
    initialState
  );

  const dispatch = action => { actions.next(action); };
  commands = new Commands(dispatch, () => states.getValue());

  const subscription = observableFromSubscribeFunction(
      atom.project.onDidChangePaths.bind(atom.project)
    )
    .startWith(null) // Start with a fake event to fetch initial directories.
    .subscribe(() => {
      commands.fetchProjectDirectories();
    });

  disposables = new CompositeDisposable(
    new DisposableSubscription(states),
    new DisposableSubscription(subscription)
  );
}

export function consumeNuclideSideBar(sideBar: NuclideSideBarService): void {
  sideBar.registerView({
    getComponent() {
      const props = states.map(state => ({
        createBookmark: commands.createBookmark,
        deleteBookmark: commands.deleteBookmark,
        projectBookmarks: state.projectBookmarks,
        projectDirectories: state.projectDirectories,
        projectRepositories: state.projectRepositories,
        updateToBookmark: commands.updateToBookmark,
      }));

      return bindObservableAsProps(props, SideBarComponent);
    },
    onDidShow() {},
    title: 'Source Control',
    toggleCommand: 'nuclide-source-control-side-bar:toggle',
    viewId: 'nuclide-source-control-side-bar',
  });

  disposables.add(new Disposable(() => {
    sideBar.destroyView('nuclide-source-control-side-bar');
  }));
}

function accumulateState(state: AppState, action: Action): AppState {
  switch (action.type) {
    case ActionType.SET_DIRECTORY_REPOSITORY:
      return {
        ...state,
        projectRepositories: state.projectRepositories.set(
          action.payload.directory.getPath(),
          action.payload.repository
        ),
      };
    case ActionType.SET_PROJECT_DIRECTORIES:
      // This event is the state of the world coming from Atom. If directories no longer exist,
      // their other stored states should be wiped out to prevent holding references to old data.
      // Copy only the repositories and bookmarks for directories in the next state.
      const nextProjectBookmarks = new Map();
      const nextProjectRepositories = new Map();
      action.payload.projectDirectories.forEach(directory => {
        const directoryPath = directory.getPath();
        const repository = state.projectRepositories.get(directoryPath);
        if (repository != null) {
          const repositoryPath = repository.getPath();
          nextProjectRepositories.set(directoryPath, repository);

          const bookmarks = state.projectBookmarks.get(repositoryPath);
          if (bookmarks != null) {
            nextProjectBookmarks.set(repositoryPath, bookmarks);
          }
        }
      });

      return {
        projectBookmarks: nextProjectBookmarks,
        projectDirectories: action.payload.projectDirectories,
        projectRepositories: nextProjectRepositories,
      };
    case ActionType.SET_REPOSITORY_BOOKMARKS:
      return {
        ...state,
        projectBookmarks: state.projectBookmarks.set(
          action.payload.repository.getPath(),
          action.payload.bookmarks
        ),
      };
    case ActionType.SET_PENDING_BOOKMARK:
      return state;
  }

  throw new Error(`Unrecognized action type: ${action.type}`);
}

export function deactivate(): void {
  disposables.dispose();
}
