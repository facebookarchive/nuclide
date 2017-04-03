/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  Action,
  SetBookmarkIsLoading,
  UnsetBookmarkIsLoading,
  UpdateUncommittedChanges,
} from './types';
import type {BookmarkInfo} from '../../nuclide-hg-rpc/lib/HgService';
import type {Observable} from 'rxjs';
import type {FileChangeStatusValue} from '../../commons-atom/vcs';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {WorkspaceViewsService} from '../../nuclide-workspace-views/lib/types';

import invariant from 'assert';
import * as ActionType from './ActionType';
import {applyActionMiddleware} from './applyActionMiddleware';
import {bindObservableAsProps} from '../../nuclide-ui/bindObservableAsProps';
import bookmarkIsEqual from './bookmarkIsEqual';
import Commands from './Commands';
import {renderReactRoot} from '../../commons-atom/renderReactRoot';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {BehaviorSubject, Subject} from 'rxjs';
import SideBarComponent from './SideBarComponent';
import {track} from '../../nuclide-analytics';
import {getDirtyFileChanges} from '../../commons-atom/vcs';
import React from 'react';

export type AppState = {
  uncommittedChanges: Map<NuclideUri, Map<NuclideUri, FileChangeStatusValue>>,
  projectBookmarks: Map<string, Array<BookmarkInfo>>,
  projectDirectories: Array<atom$Directory>,
  projectRepositories: Map<string, atom$Repository>,
  repositoryBookmarksIsLoading: WeakMap<atom$Repository, Array<BookmarkInfo>>,
};

function createStateStream(
  actions: Observable<Action>,
  initialState: AppState,
): BehaviorSubject<AppState> {
  const states = new BehaviorSubject(initialState);
  actions.scan(accumulateState, initialState).subscribe(states);
  return states;
}

function getInitialState() {
  return {
    uncommittedChanges: new Map(),
    projectBookmarks: new Map(),
    projectDirectories: [],
    projectRepositories: new Map(),
    repositoryBookmarksIsLoading: new WeakMap(),
  };
}

let commands: Commands;
let disposables: UniversalDisposable;
let states: BehaviorSubject<AppState>;
let activated = false;
let restored;

const WORKSPACE_VIEW_URI = 'atom://nuclide/source-control';

const DESERIALIZER_VERSION = atom.workspace.getLeftDock == null ? 1 : 2;

export function initialize(rawState: Object): void {
  activated = true;
  const serializedVersionMatches = (rawState && rawState.version || 1) === DESERIALIZER_VERSION;
  restored = rawState != null && serializedVersionMatches && rawState.restored === true;
  const initialState = getInitialState();
  const actions = new Subject();
  states = createStateStream(
    applyActionMiddleware(actions, () => states.getValue()),
    initialState,
  );

  const dispatch = action => { actions.next(action); };
  commands = new Commands(dispatch, () => states.getValue());

  disposables = new UniversalDisposable(
    () => { activated = false; },
    observableFromSubscribeFunction(
      atom.project.onDidChangePaths.bind(atom.project),
    )
      .startWith(null) // Start with a fake event to fetch initial directories.
      .subscribe(() => {
        commands.fetchProjectDirectories();
      }),
  );
}

class SourceControlSideBar {
  constructor() {
    track('scsidebar-show');
  }

  getElement(): HTMLElement {
    const props = states.map(state => ({
      createBookmark: commands.createBookmark,
      deleteBookmark: commands.deleteBookmark,
      projectBookmarks: state.projectBookmarks,
      projectDirectories: state.projectDirectories,
      projectRepositories: state.projectRepositories,
      renameBookmark: commands.renameBookmark,
      repositoryBookmarksIsLoading: state.repositoryBookmarksIsLoading,
      updateToBookmark: commands.updateToBookmark,
      uncommittedChanges: state.uncommittedChanges,
    }));
    const BoundSideBarComponent = bindObservableAsProps(props, SideBarComponent);
    return renderReactRoot(<BoundSideBarComponent />);
  }

  getDefaultLocation(): string {
    return 'left';
  }

  getTitle(): string {
    return 'Source Control';
  }

  getURI(): string {
    return WORKSPACE_VIEW_URI;
  }

  serialize(): Object {
    return {
      deserializer: 'nuclide.SourceControlSideBar',
    };
  }
}

export function deserializeSourceControlSideBar(state: mixed): ?SourceControlSideBar {
  // It's possible for this method to be called before the package has been activated (if this was
  // serialized as part of the workspace instead of nuclide-workspace-views).
  // TODO: Once atom/atom#13358 makes it into stable, we can switch from using 'activate()' to
  // `initialize()` and avoid that.
  if (!activated) {
    return;
  }
  return new SourceControlSideBar();
}

export function consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
  disposables.add(
    api.addOpener(uri => {
      if (uri === WORKSPACE_VIEW_URI) {
        return new SourceControlSideBar();
      }
    }),
    () => api.destroyWhere(item => item instanceof SourceControlSideBar),
    atom.commands.add(
      'atom-workspace',
      'nuclide-source-control-side-bar:toggle',
      event => { api.toggle(WORKSPACE_VIEW_URI, (event: any).detail); },
    ),
  );
  // If this is the first time we're opening this workspace, open the source control side bar.
  if (!restored) {
    api.open(WORKSPACE_VIEW_URI, {searchAllPanes: true, activatePane: false, activateItem: false});
  }
}

function accumulateSetBookmarkIsLoading(state: AppState, action: SetBookmarkIsLoading): AppState {
  const {
    bookmark,
    repository,
  } = action.payload;
  let repositoryBookmarksIsLoading;
  if (state.repositoryBookmarksIsLoading.has(repository)) {
    repositoryBookmarksIsLoading = state.repositoryBookmarksIsLoading.get(repository);
    invariant(repositoryBookmarksIsLoading != null);
  } else {
    repositoryBookmarksIsLoading = [];
  }

  const bookmarkIndex = repositoryBookmarksIsLoading.findIndex(
    loadingBookmark => bookmarkIsEqual(loadingBookmark, bookmark));
  if (bookmarkIndex === -1) {
    repositoryBookmarksIsLoading.push(bookmark);
  }

  return {
    ...state,
    repositoryBookmarksIsLoading:
      state.repositoryBookmarksIsLoading.set(repository, repositoryBookmarksIsLoading),
  };
}

function accumulateRepositoriesUncommittedChanges(
  state: AppState,
  action: UpdateUncommittedChanges,
): AppState {
  const {
    directory,
    repository,
  } = action.payload;

  if (repository.getType() === 'hg') {
    const uncommittedChanges = getDirtyFileChanges(repository);
    const filteredUncommitedChangesMap = new Map();
    // The get dirty file changes gets changes for the whole repository and
    // for most part only a directory in the repository is imported. This filter
    // will show only the related files under each directory.
    for (const [filePath, fileStatus] of uncommittedChanges.entries()) {
      if (filePath.startsWith(directory.getPath())) {
        filteredUncommitedChangesMap.set(filePath, fileStatus);
      }
    }
    return {
      ...state,
      uncommittedChanges:
        new Map(state.uncommittedChanges).set(
          directory.getPath(),
          filteredUncommitedChangesMap,
        ),
    };
  }

  return state;
}

function accumulateUnsetBookmarkIsLoading(
  state: AppState,
  action: UnsetBookmarkIsLoading,
): AppState {
  const {
    bookmark,
    repository,
  } = action.payload;
  const repositoryBookmarksIsLoading = state.repositoryBookmarksIsLoading.get(repository);
  if (repositoryBookmarksIsLoading == null) {
    // TODO: Can this happen?
    return state;
  }

  const bookmarkIndex = repositoryBookmarksIsLoading.findIndex(
    loadingBookmark => bookmarkIsEqual(loadingBookmark, bookmark));
  if (bookmarkIndex >= 0) {
    repositoryBookmarksIsLoading.splice(bookmarkIndex, 1);
  }

  return state;
}

function accumulateState(state: AppState, action: Action): AppState {
  switch (action.type) {
    case ActionType.UPDATE_UNCOMMITTED_CHANGES:
      return accumulateRepositoriesUncommittedChanges(state, action);
    case ActionType.SET_BOOKMARK_IS_LOADING:
      return accumulateSetBookmarkIsLoading(state, action);
    case ActionType.UNSET_BOOKMARK_IS_LOADING:
      return accumulateUnsetBookmarkIsLoading(state, action);
    case ActionType.SET_DIRECTORY_REPOSITORY:
      return {
        ...state,
        projectRepositories: state.projectRepositories.set(
          action.payload.directory.getPath(),
          action.payload.repository,
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
        ...state,
        projectBookmarks: nextProjectBookmarks,
        projectDirectories: action.payload.projectDirectories,
        projectRepositories: nextProjectRepositories,
      };
    case ActionType.SET_REPOSITORY_BOOKMARKS:
      const {
        bookmarks,
        repository,
      } = action.payload;

      let nextBookmarksIsLoading;
      const bookmarksIsLoading = state.repositoryBookmarksIsLoading.get(repository);
      if (bookmarksIsLoading == null) {
        nextBookmarksIsLoading = [];
      } else {
        // Transfer only the loading state of bookmarks that are in the next list of bookmarks.
        // Other loading states should be wiped out.
        nextBookmarksIsLoading = bookmarksIsLoading.filter(loadingBookmark => {
          return bookmarks.some(bookmark => bookmarkIsEqual(bookmark, loadingBookmark));
        });
      }

      return {
        ...state,
        projectBookmarks: state.projectBookmarks.set(
          repository.getPath(),
          bookmarks,
        ),
        repositoryBookmarksIsLoading: state.repositoryBookmarksIsLoading.set(
          repository,
          nextBookmarksIsLoading,
        ),
      };
  }

  throw new Error(`Unrecognized action type: ${action.type}`);
}

export function deactivate(): void {
  disposables.dispose();
}

export function serialize(): Object {
  return {
    restored: true,
    // Scrap our serialization when docks become available.
    // TODO(matthewwithanm): After docks have been in Atom stable for a while, we can just change
    //   this to "2"
    version: atom.workspace.getLeftDock == null ? 1 : 2,
  };
}
