'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Dispatcher} from 'flux';

import {ActionType} from './FileTreeConstants';
import {debounce} from '../../nuclide-commons';
import {Disposable} from 'atom';
import FileTreeDispatcher from './FileTreeDispatcher';
import FileTreeHelpers from './FileTreeHelpers';
import {FileTreeStore} from './FileTreeStore';
import Immutable from 'immutable';
import semver from 'semver';
import {repositoryForPath} from '../../nuclide-hg-git-bridge';
import {hgConstants} from '../../nuclide-hg-repository-base';
import {getLogger} from '../../nuclide-logging';
import remoteUri from '../../nuclide-remote-uri';

import type {
  HgRepositoryClient,
  HgRepositoryClientAsync,
} from '../../nuclide-hg-repository-client';
import type {StatusCodeNumberValue} from '../../nuclide-hg-repository-base/lib/HgService';
import type {WorkingSet} from '../../nuclide-working-sets';
import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/WorkingSetsStore';
import type {NuclideUri} from '../../nuclide-remote-uri';


let instance: ?Object;

/**
 * Implements the Flux pattern for our file tree. All state for the file tree will be kept in
 * FileTreeStore and the only way to update the store is through methods on FileTreeActions. The
 * dispatcher is a mechanism through which FileTreeActions interfaces with FileTreeStore.
 */
class FileTreeActions {
  _dispatcher: Dispatcher;
  _store: FileTreeStore;
  _subscriptionForRepository: Immutable.Map<atom$Repository, Disposable>;

  static getInstance(): FileTreeActions {
    if (!instance) {
      instance = new FileTreeActions();
    }
    return instance;
  }

  constructor() {
    this._dispatcher = FileTreeDispatcher.getInstance();
    this._store = FileTreeStore.getInstance();
    this._subscriptionForRepository = new Immutable.Map();
  }

  setCwd(rootKey: ?string): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_CWD,
      rootKey,
    });
  }

  setRootKeys(rootKeys: Array<string>): void {
    const existingRootKeySet: Immutable.Set<string> = new Immutable.Set(this._store.getRootKeys());
    const addedRootKeys: Immutable.Set<string> =
      new Immutable.Set(rootKeys).subtract(existingRootKeySet);
    this._dispatcher.dispatch({
      actionType: ActionType.SET_ROOT_KEYS,
      rootKeys,
    });
    for (const rootKey of addedRootKeys) {
      this.expandNode(rootKey, rootKey);
    }
  }

  expandNode(rootKey: string, nodeKey: string): void {
    this._dispatcher.dispatch({
      actionType: ActionType.EXPAND_NODE,
      rootKey,
      nodeKey,
    });
  }

  expandNodeDeep(rootKey: string, nodeKey: string): void {
    this._dispatcher.dispatch({
      actionType: ActionType.EXPAND_NODE_DEEP,
      rootKey,
      nodeKey,
    });
  }

  deleteSelectedNodes(): void {
    this._dispatcher.dispatch({actionType: ActionType.DELETE_SELECTED_NODES});
  }

  // Makes sure a specific child exists for a given node. If it does not exist, temporarily
  // create it and initiate a fetch. This feature is exclusively for expanding to a node deep
  // in a tree.
  ensureChildNode(nodeKey: string): void {
    this._dispatcher.dispatch({
      actionType: ActionType.ENSURE_CHILD_NODE,
      nodeKey,
    });
  }

  collapseNode(rootKey: string, nodeKey: string): void {
    this._dispatcher.dispatch({
      actionType: ActionType.COLLAPSE_NODE,
      rootKey,
      nodeKey,
    });
  }

  collapseNodeDeep(rootKey: string, nodeKey: string): void {
    this._dispatcher.dispatch({
      actionType: ActionType.COLLAPSE_NODE_DEEP,
      rootKey,
      nodeKey,
    });
  }

  setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths: boolean): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_EXCLUDE_VCS_IGNORED_PATHS,
      excludeVcsIgnoredPaths,
    });
  }

  setHideIgnoredNames(hideIgnoredNames: boolean): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_HIDE_IGNORED_NAMES,
      hideIgnoredNames,
    });
  }

  setIgnoredNames(ignoredNames: Array<string>): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_IGNORED_NAMES,
      ignoredNames,
    });
  }

  setTrackedNode(rootKey: string, nodeKey: string): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_TRACKED_NODE,
      nodeKey,
      rootKey,
    });
  }

  setUsePreviewTabs(usePreviewTabs: boolean): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_USE_PREVIEW_TABS,
      usePreviewTabs,
    });
  }

  setUsePrefixNav(usePrefixNav: boolean): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_USE_PREFIX_NAV,
      usePrefixNav,
    });
  }

  confirmNode(rootKey: string, nodeKey: string, pending: boolean = false): void {
    const node = this._store.getNode(rootKey, nodeKey);
    if (node == null) {
      return;
    }
    if (node.isContainer) {
      const actionType = node.isExpanded ?
        ActionType.COLLAPSE_NODE :
        ActionType.EXPAND_NODE;
      this._dispatcher.dispatch({
        actionType: actionType,
        nodeKey,
        rootKey,
      });
    } else {
      let openOptions = {
        activatePane: true,
        searchAllPanes: true,
      };
      // TODO: Make the following the default once Nuclide only supports Atom v1.6.0+
      if (semver.gte(atom.getVersion(), '1.6.0')) {
        openOptions = {...openOptions, pending: true};
      }
      atom.workspace.open(FileTreeHelpers.keyToPath(nodeKey), openOptions);
    }
  }

  keepPreviewTab() {
    // TODO: Make the following the default once Nuclide only supports Atom v1.6.0+
    if (semver.gte(atom.getVersion(), '1.6.0')) {
      const activePane = atom.workspace.getActivePane();
      if (activePane != null) {
        activePane.clearPendingItem();
      }
    } else {
      const activePaneItem = atom.workspace.getActivePaneItem();
      if (activePaneItem != null) {
        atom.commands.dispatch(atom.views.getView(activePaneItem), 'tabs:keep-preview-tab');
      }
    }
  }

  openSelectedEntrySplit(
    nodeKey: string,
    orientation: atom$PaneSplitOrientation,
    side: atom$PaneSplitSide
  ): void {
    const pane = atom.workspace.getActivePane();
    atom.workspace.openURIInPane(
      FileTreeHelpers.keyToPath(nodeKey),
      pane.split(orientation, side)
    );
  }

  setVcsStatuses(rootKey: string, vcsStatuses: {[path: string]: StatusCodeNumberValue}): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_VCS_STATUSES,
      rootKey,
      vcsStatuses,
    });
  }

  /**
   * Updates the root repositories to match the provided directories.
   */
  async updateRepositories(rootDirectories: Array<atom$Directory>): Promise<void> {
    const rootKeys = rootDirectories.map(
      directory => FileTreeHelpers.dirPathToKey(directory.getPath())
    );
    const rootRepos: Array<?atom$Repository> = await Promise.all(rootDirectories.map(
      directory => repositoryForPath(directory.getPath())
    ));

    // t7114196: Given the current implementation of HgRepositoryClient, each root directory will
    // always correspond to a unique instance of HgRepositoryClient. Ideally, if multiple subfolders
    // of an Hg repo are used as project roots in Atom, only one HgRepositoryClient should be
    // created.

    // Group all of the root keys by their repository, excluding any that don't belong to a
    // repository.
    const rootKeysForRepository = Immutable.List(rootKeys)
      .groupBy((rootKey, index) => rootRepos[index])
      .filter((v, k) => k != null)
      .map(v => new Immutable.Set(v));

    const prevRepos = this._store.getRepositories();

    // Let the store know we have some new repos!
    const nextRepos: Immutable.Set<atom$Repository> =
      new Immutable.Set(rootKeysForRepository.keys());
    this._dispatcher.dispatch({
      actionType: ActionType.SET_REPOSITORIES,
      repositories: nextRepos,
    });

    const removedRepos = prevRepos.subtract(nextRepos);
    const addedRepos = nextRepos.subtract(prevRepos);


    // TODO: Rewrite `_repositoryAdded` to return the subscription instead of adding it to a map as
    //       a side effect. The map can be created here with something like
    //       `subscriptions = Immutable.Map(repos).map(this._repositoryAdded)`. Since
    //       `_repositoryAdded` will no longer be about side effects, it should then be renamed.
    //       `_repositoryRemoved` could probably be inlined here. That would leave this function as
    //       the only one doing side-effects.

    // Unsubscribe from removedRepos.
    removedRepos.forEach(repo => this._repositoryRemoved(repo, rootKeysForRepository));

    // Create subscriptions for addedRepos.
    addedRepos.forEach(repo => this._repositoryAdded(repo, rootKeysForRepository));
  }

  updateWorkingSet(workingSet: WorkingSet): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_WORKING_SET,
      workingSet,
    });
  }

  updateOpenFilesWorkingSet(openFilesWorkingSet: WorkingSet): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_OPEN_FILES_WORKING_SET,
      openFilesWorkingSet,
    });
  }

  updateWorkingSetsStore(workingSetsStore: ?WorkingSetsStore): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_WORKING_SETS_STORE,
      workingSetsStore,
    });
  }

  startEditingWorkingSet(editedWorkingSet: WorkingSet): void {
    this._dispatcher.dispatch({
      actionType: ActionType.START_EDITING_WORKING_SET,
      editedWorkingSet,
    });
  }

  finishEditingWorkingSet(): void {
    this._dispatcher.dispatch({
      actionType: ActionType.FINISH_EDITING_WORKING_SET,
    });
  }

  checkNode(rootKey: string, nodeKey: string): void {
    this._dispatcher.dispatch({
      actionType: ActionType.CHECK_NODE,
      rootKey,
      nodeKey,
    });
  }

  uncheckNode(rootKey: string, nodeKey: string): void {
    this._dispatcher.dispatch({
      actionType: ActionType.UNCHECK_NODE,
      rootKey,
      nodeKey,
    });
  }

  setSelectedNode(rootKey: string, nodeKey: string): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_SELECTED_NODE,
      rootKey,
      nodeKey,
    });
  }

  addSelectedNode(rootKey: string, nodeKey: string): void {
    this._dispatcher.dispatch({
      actionType: ActionType.ADD_SELECTED_NODE,
      rootKey,
      nodeKey,
    });
  }

  unselectNode(rootKey: string, nodeKey: string): void {
    this._dispatcher.dispatch({
      actionType: ActionType.UNSELECT_NODE,
      rootKey,
      nodeKey,
    });
  }

  moveSelectionUp(): void {
    this._dispatcher.dispatch({
      actionType: ActionType.MOVE_SELECTION_UP,
    });
  }

  moveSelectionDown(): void {
    this._dispatcher.dispatch({
      actionType: ActionType.MOVE_SELECTION_DOWN,
    });
  }

  moveSelectionToTop(): void {
    this._dispatcher.dispatch({
      actionType: ActionType.MOVE_SELECTION_TO_TOP,
    });
  }

  moveSelectionToBottom(): void {
    this._dispatcher.dispatch({
      actionType: ActionType.MOVE_SELECTION_TO_BOTTOM,
    });
  }

  async _repositoryAdded(
    repo: atom$GitRepository | HgRepositoryClient,
    rootKeysForRepository: Immutable.Map<atom$Repository, Immutable.Set<string>>,
  ): Promise<void> {
    // We support HgRepositoryClient and GitRepositoryAsync objects.
    if ((repo.getType() !== 'hg' && repo.getType() !== 'git') || repo.async == null) {
      return;
    }
    const asyncRepo: atom$GitRepositoryAsync | HgRepositoryClientAsync = (repo: any).async;
    await asyncRepo.refreshStatus();
    const statusCodeForPath = this._getCachedPathStatuses(repo);

    for (const rootKeyForRepo of rootKeysForRepository.get(repo)) {
      this.setVcsStatuses(rootKeyForRepo, statusCodeForPath);
    }
    // Now that the initial VCS statuses are set, subscribe to changes to the Repository so that the
    // VCS statuses are kept up to date.
    const subscription = asyncRepo.onDidChangeStatus(
      // t8227570: If the user is a "nervous saver," many onDidChangeStatuses will get fired in
      // succession. We should probably explore debouncing this in HgRepositoryClient itself.
      debounce(
        this._onDidChangeStatusesForRepository.bind(this, repo, rootKeysForRepository),
        /* wait */ 1000,
        /* immediate */ false,
      ),
    );

    this._subscriptionForRepository = this._subscriptionForRepository.set(repo, subscription);
  }

  /**
   * Fetches a consistent object map from absolute file paths to
   * their corresponding `StatusCodeNumber` for easy representation with the file tree.
   */
  _getCachedPathStatuses(
    repo: atom$GitRepository | HgRepositoryClient,
  ): {[filePath: NuclideUri]: StatusCodeNumberValue} {
    const asyncRepo: atom$GitRepositoryAsync | HgRepositoryClientAsync = (repo: any).async;
    const statuses = asyncRepo.getCachedPathStatuses();
    let relativeCodePaths;
    if (asyncRepo.getType() === 'hg') {
      // `hg` already comes from `HgRepositoryClient` in `StatusCodeNumber` format.
      relativeCodePaths = statuses;
    } else {
      relativeCodePaths = {};
      // Transform `git` bit numbers to `StatusCodeNumber` format.
      const {StatusCodeNumber} = hgConstants;
      for (const relativePath in statuses) {
        const gitStatusNumber = statuses[relativePath];
        let statusCode;
        if (asyncRepo.isStatusNew(gitStatusNumber)) {
          statusCode = StatusCodeNumber.UNTRACKED;
        } else if (asyncRepo.isStatusStaged(gitStatusNumber)) {
          statusCode = StatusCodeNumber.ADDED;
        } else if (asyncRepo.isStatusModified(gitStatusNumber)) {
          statusCode = StatusCodeNumber.MODIFIED;
        } else if (asyncRepo.isStatusIgnored(gitStatusNumber)) {
          statusCode = StatusCodeNumber.IGNORED;
        } else if (asyncRepo.isStatusDeleted(gitStatusNumber)) {
          statusCode = StatusCodeNumber.REMOVED;
        } else {
          getLogger().warn(`Unrecognized git status number ${gitStatusNumber}`);
          statusCode = StatusCodeNumber.MODIFIED;
        }
        relativeCodePaths[relativePath] = statusCode;
      }
    }
    const repoRoot = repo.getWorkingDirectory();
    const absoluteCodePaths = {};
    for (const relativePath in relativeCodePaths) {
      const absolutePath = remoteUri.join(repoRoot, relativePath);
      absoluteCodePaths[absolutePath] = relativeCodePaths[relativePath];
    }
    return absoluteCodePaths;
  }

  _onDidChangeStatusesForRepository(
    repo: atom$GitRepository | HgRepositoryClient,
    rootKeysForRepository: Immutable.Map<atom$Repository, Immutable.Set<string>>,
  ): void {
    for (const rootKey of rootKeysForRepository.get(repo)) {
      this.setVcsStatuses(rootKey, this._getCachedPathStatuses(repo));
    }
  }

  _repositoryRemoved(repo: atom$Repository) {
    const disposable = this._subscriptionForRepository.get(repo);
    if (!disposable) {
      // There is a small chance that the add/remove of the Repository could happen so quickly that
      // the entry for the repo in _subscriptionForRepository has not been set yet.
      // TODO: Report a soft error for this.
      return;
    }

    this._subscriptionForRepository = this._subscriptionForRepository.delete(repo);
    disposable.dispose();
  }

}

module.exports = FileTreeActions;
