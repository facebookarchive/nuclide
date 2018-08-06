/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {isGkEnabled} from '../../commons-node/passesGK';
import {ActionTypes} from './FileTreeDispatcher';
import FileTreeHelpers from './FileTreeHelpers';
import FileTreeStore from './FileTreeStore';
import * as Immutable from 'immutable';
import {track} from '../../nuclide-analytics';
import {repositoryForPath} from '../../nuclide-vcs-base';
import {hgConstants} from '../../nuclide-hg-rpc';
import {getLogger} from 'log4js';
import nullthrows from 'nullthrows';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {Observable} from 'rxjs';
import {mapEqual, setDifference} from 'nuclide-commons/collection';
import {fastDebounce} from 'nuclide-commons/observable';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as Selectors from './FileTreeSelectors';
import {WORKSPACE_VIEW_URI} from './Constants';
import removeProjectPath from '../../commons-atom/removeProjectPath';
import {isRunningInWindows} from '../../commons-node/system-info';
import os from 'os';
import invariant from 'assert';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import {openDialog, closeDialog} from '../../nuclide-ui/FileActionModal';
import FileTreeHgHelpers from './FileTreeHgHelpers';
import * as React from 'react';
import {File} from 'atom';
import {getFileSystemServiceByNuclideUri} from '../../nuclide-remote-connection';

import type {FileTreeNode} from './FileTreeNode';
import type {Directory} from './FileTreeHelpers';
import type CwdApi from '../../nuclide-current-working-directory/lib/CwdApi';
import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';
import type {StatusCodeNumberValue} from '../../nuclide-hg-rpc/lib/HgService';
import type {RemoteProjectsService} from '../../nuclide-remote-projects';
import type {WorkingSet} from '../../nuclide-working-sets-common';
import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {RemoteFile} from '../../nuclide-remote-connection';

const logger = getLogger('nuclide-file-tree');

type CopyPath = {
  old: NuclideUri,
  new: NuclideUri,
};

/**
 * Implements the Flux pattern for our file tree. All state for the file tree will be kept in
 * FileTreeStore and the only way to update the store is through methods on FileTreeActions.
 */
export default class FileTreeActions {
  _store: FileTreeStore;
  _disposableForRepository: Immutable.Map<atom$Repository, IDisposable>;
  _disposables: UniversalDisposable;
  _cwdApiSubscription: ?IDisposable;

  constructor(store: FileTreeStore) {
    this._store = store;
    this._disposableForRepository = Immutable.Map();
    this._disposables = new UniversalDisposable(() => {
      if (this._cwdApiSubscription != null) {
        this._cwdApiSubscription.dispose();
      }
    });
  }

  setCwd(rootKey: ?string): void {
    this._store.dispatch({
      type: ActionTypes.SET_CWD,
      rootKey,
    });
  }

  setRootKeys(rootKeys: Array<string>): void {
    this._store.dispatch({
      type: ActionTypes.SET_ROOT_KEYS,
      rootKeys,
    });
  }

  clearFilter(): void {
    this._store.dispatch({
      type: ActionTypes.CLEAR_FILTER,
    });
  }

  addExtraProjectSelectionContent(content: React.Element<any>): void {
    this._store.dispatch({
      type: ActionTypes.ADD_EXTRA_PROJECT_SELECTION_CONTENT,
      content,
    });
  }

  removeExtraProjectSelectionContent(content: React.Element<any>): void {
    this._store.dispatch({
      type: ActionTypes.REMOVE_EXTRA_PROJECT_SELECTION_CONTENT,
      content,
    });
  }

  expandNode(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.EXPAND_NODE,
      rootKey,
      nodeKey,
    });
  }

  expandNodeDeep(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.EXPAND_NODE_DEEP,
      rootKey,
      nodeKey,
    });
  }

  deleteSelectedNodes(): void {
    this._store.dispatch({type: ActionTypes.DELETE_SELECTED_NODES});
  }

  // Makes sure a specific child exists for a given node. If it does not exist, temporarily
  // create it and initiate a fetch. This feature is exclusively for expanding to a node deep
  // in a tree.
  ensureChildNode(nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.ENSURE_CHILD_NODE,
      nodeKey,
    });
  }

  collapseNode(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.COLLAPSE_NODE,
      rootKey,
      nodeKey,
    });
  }

  collapseNodeDeep(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.COLLAPSE_NODE_DEEP,
      rootKey,
      nodeKey,
    });
  }

  setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths: boolean): void {
    this._store.dispatch({
      type: ActionTypes.SET_EXCLUDE_VCS_IGNORED_PATHS,
      excludeVcsIgnoredPaths,
    });
  }

  setHideVcsIgnoredPaths(hideVcsIgnoredPaths: boolean): void {
    this._store.dispatch({
      type: ActionTypes.SET_HIDE_VCS_IGNORED_PATHS,
      hideVcsIgnoredPaths,
    });
  }

  setHideIgnoredNames(hideIgnoredNames: boolean): void {
    this._store.dispatch({
      type: ActionTypes.SET_HIDE_IGNORED_NAMES,
      hideIgnoredNames,
    });
  }

  setIsCalculatingChanges(isCalculatingChanges: boolean): void {
    this._store.dispatch({
      type: ActionTypes.SET_IS_CALCULATING_CHANGES,
      isCalculatingChanges,
    });
  }

  setIgnoredNames(ignoredNames: Array<string>): void {
    this._store.dispatch({
      type: ActionTypes.SET_IGNORED_NAMES,
      ignoredNames,
    });
  }

  setTrackedNode(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.SET_TRACKED_NODE,
      nodeKey,
      rootKey,
    });
  }

  clearTrackedNode(): void {
    this._store.dispatch({
      type: ActionTypes.CLEAR_TRACKED_NODE,
    });
  }

  clearTrackedNodeIfNotLoading(): void {
    this._store.dispatch({
      type: ActionTypes.CLEAR_TRACKED_NODE_IF_NOT_LOADING,
    });
  }

  startReorderDrag(draggedRootKey: string): void {
    this._store.dispatch({
      type: ActionTypes.START_REORDER_DRAG,
      draggedRootKey,
    });
  }

  endReorderDrag(): void {
    this._store.dispatch({
      type: ActionTypes.END_REORDER_DRAG,
    });
  }

  reorderDragInto(dragTargetNodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.REORDER_DRAG_INTO,
      dragTargetNodeKey,
    });
  }

  reorderRoots(): void {
    this._store.dispatch({
      type: ActionTypes.REORDER_ROOTS,
    });
  }

  moveToNode(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.MOVE_TO_NODE,
      nodeKey,
      rootKey,
    });
  }

  setUsePreviewTabs(usePreviewTabs: boolean): void {
    this._store.dispatch({
      type: ActionTypes.SET_USE_PREVIEW_TABS,
      usePreviewTabs,
    });
  }

  setFocusEditorOnFileSelection(focusEditorOnFileSelection: boolean): void {
    this._store.dispatch({
      type: ActionTypes.SET_FOCUS_EDITOR_ON_FILE_SELECTION,
      focusEditorOnFileSelection,
    });
  }

  setUsePrefixNav(usePrefixNav: boolean): void {
    this._store.dispatch({
      type: ActionTypes.SET_USE_PREFIX_NAV,
      usePrefixNav,
    });
  }

  setAutoExpandSingleChild(autoExpandSingleChild: boolean): void {
    this._store.dispatch({
      type: ActionTypes.SET_AUTO_EXPAND_SINGLE_CHILD,
      autoExpandSingleChild,
    });
  }

  confirmNode(
    rootKey: string,
    nodeKey: string,
    pending: boolean = false,
  ): void {
    const node = Selectors.getNode(this._store, rootKey, nodeKey);
    if (node == null) {
      return;
    }
    if (node.isContainer) {
      if (node.isExpanded) {
        this._store.dispatch({
          type: ActionTypes.COLLAPSE_NODE,
          nodeKey,
          rootKey,
        });
      } else {
        this._store.dispatch({
          type: ActionTypes.EXPAND_NODE,
          nodeKey,
          rootKey,
        });
      }
    } else {
      track('file-tree-open-file', {uri: nodeKey});
      // goToLocation doesn't support pending panes
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open(FileTreeHelpers.keyToPath(nodeKey), {
        activatePane:
          (pending && node.conf.focusEditorOnFileSelection) || !pending,
        searchAllPanes: true,
        pending,
      });
    }
  }

  keepPreviewTab() {
    const activePane = atom.workspace.getActivePane();
    if (activePane != null) {
      activePane.clearPendingItem();
    }
  }

  openSelectedEntrySplit(
    nodeKey: string,
    orientation: atom$PaneSplitOrientation,
    side: atom$PaneSplitSide,
  ): void {
    const pane = atom.workspace.getCenter().getActivePane();
    atom.workspace.openURIInPane(
      FileTreeHelpers.keyToPath(nodeKey),
      pane.split(orientation, side),
    );
  }

  setVcsStatuses(
    rootKey: string,
    vcsStatuses: Map<NuclideUri, StatusCodeNumberValue>,
  ): void {
    this._store.dispatch({
      type: ActionTypes.SET_VCS_STATUSES,
      rootKey,
      vcsStatuses,
    });
  }

  invalidateRemovedFolder(): void {
    this._store.dispatch({
      type: ActionTypes.INVALIDATE_REMOVED_FOLDER,
    });
  }

  /**
   * Updates the root repositories to match the provided directories.
   */
  async updateRepositories(
    rootDirectories: Array<atom$Directory>,
  ): Promise<void> {
    const rootKeys = rootDirectories.map(directory =>
      FileTreeHelpers.dirPathToKey(directory.getPath()),
    );
    // $FlowFixMe
    const rootRepos: Array<?atom$Repository> = await Promise.all(
      rootDirectories.map(directory => repositoryForPath(directory.getPath())),
    );

    // t7114196: Given the current implementation of HgRepositoryClient, each root directory will
    // always correspond to a unique instance of HgRepositoryClient. Ideally, if multiple subfolders
    // of an Hg repo are used as project roots in Atom, only one HgRepositoryClient should be
    // created.

    // Group all of the root keys by their repository, excluding any that don't belong to a
    // repository.
    const rootKeysForRepository = Immutable.Map(
      omitNullKeys(
        Immutable.List(rootKeys).groupBy((rootKey, index) => rootRepos[index]),
      ).map(v => Immutable.Set(v)),
    );

    const prevRepos = Selectors.getRepositories(this._store);

    // Let the store know we have some new repos!
    const nextRepos: Immutable.Set<atom$Repository> = Immutable.Set(
      rootKeysForRepository.keys(),
    );
    this._store.dispatch({
      type: ActionTypes.SET_REPOSITORIES,
      repositories: nextRepos,
    });

    const removedRepos = prevRepos.subtract(nextRepos);
    const addedRepos = nextRepos.subtract(prevRepos);

    // TODO: Rewrite `_repositoryAdded` to return the subscription instead of adding it to a map as
    //       a side effect. The map can be created here with something like
    //       `subscriptions = Immutable.Map(repos).map(this._repositoryAdded)`. Since
    //       `_repositoryAdded` will no longer be about side effects, it should then be renamed.

    // Unsubscribe from removedRepos.
    removedRepos.forEach(repo => {
      const disposable = this._disposableForRepository.get(repo);
      if (disposable == null) {
        // There is a small chance that the add/remove of the Repository could happen so quickly that
        // the entry for the repo in _disposableForRepository has not been set yet.
        // TODO: Report a soft error for this.
        return;
      }

      this._disposableForRepository = this._disposableForRepository.delete(
        repo,
      );
      this.invalidateRemovedFolder();
      disposable.dispose();
    });

    // Create subscriptions for addedRepos.
    addedRepos.forEach(repo => {
      this._repositoryAdded(repo, rootKeysForRepository);
    });
  }

  updateWorkingSet(workingSet: WorkingSet): void {
    // TODO (T30814717): Make this the default behavior after some research.
    if (isGkEnabled('nuclide_projects') === true) {
      const prevWorkingSet = Selectors.getWorkingSet(this._store);
      const prevUris = new Set(prevWorkingSet.getUris());
      const nextUris = new Set(workingSet.getUris());
      const addedUris = setDifference(nextUris, prevUris);
      // Reveal all of the added paths. This is a little gross. The WorkingSetStore API will return
      // absolute paths (`/a/b/c`) for remote directories instead of `nuclide://` URIs. In other
      // words, we don't have enough information to know what paths to reveal. So we'll just try to
      // reveal the path in every root.
      addedUris.forEach(uri => {
        Selectors.getRootKeys(this._store).forEach(rootUri => {
          const filePath = nuclideUri.resolve(rootUri, uri);
          const nodeKey = FileTreeHelpers.dirPathToKey(filePath);
          this.revealFilePath(nodeKey, false);
          if (nextUris.size === 1) {
            // There's only a single URI in the working set, expand it.
            this.expandNode(rootUri, nodeKey);
          }
        });
      });
    }
    this._store.dispatch({
      type: ActionTypes.SET_WORKING_SET,
      workingSet,
    });
  }

  updateOpenFilesWorkingSet(openFilesWorkingSet: WorkingSet): void {
    this._store.dispatch({
      type: ActionTypes.SET_OPEN_FILES_WORKING_SET,
      openFilesWorkingSet,
    });
  }

  updateWorkingSetsStore(workingSetsStore: ?WorkingSetsStore): void {
    this._store.dispatch({
      type: ActionTypes.SET_WORKING_SETS_STORE,
      workingSetsStore,
    });
  }

  startEditingWorkingSet(editedWorkingSet: WorkingSet): void {
    this._store.dispatch({
      type: ActionTypes.START_EDITING_WORKING_SET,
      editedWorkingSet,
    });
  }

  finishEditingWorkingSet(): void {
    this._store.dispatch({
      type: ActionTypes.FINISH_EDITING_WORKING_SET,
    });
  }

  checkNode(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.CHECK_NODE,
      rootKey,
      nodeKey,
    });
  }

  uncheckNode(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.UNCHECK_NODE,
      rootKey,
      nodeKey,
    });
  }

  setDragHoveredNode(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.SET_DRAG_HOVERED_NODE,
      rootKey,
      nodeKey,
    });
  }

  setSelectedNode(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.SET_SELECTED_NODE,
      rootKey,
      nodeKey,
    });
  }

  setFocusedNode(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.SET_FOCUSED_NODE,
      rootKey,
      nodeKey,
    });
  }

  addSelectedNode(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.ADD_SELECTED_NODE,
      rootKey,
      nodeKey,
    });
  }

  unselectNode(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.UNSELECT_NODE,
      rootKey,
      nodeKey,
    });
  }

  rangeSelectToNode(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.RANGE_SELECT_TO_NODE,
      rootKey,
      nodeKey,
    });
  }

  rangeSelectUp(): void {
    this._store.dispatch({
      type: ActionTypes.RANGE_SELECT_UP,
    });
  }

  rangeSelectDown(): void {
    this._store.dispatch({
      type: ActionTypes.RANGE_SELECT_DOWN,
    });
  }

  unhoverNode(rootKey: string, nodeKey: string): void {
    this._store.dispatch({
      type: ActionTypes.UNHOVER_NODE,
      rootKey,
      nodeKey,
    });
  }

  moveSelectionUp(): void {
    this._store.dispatch({
      type: ActionTypes.MOVE_SELECTION_UP,
    });
  }

  moveSelectionDown(): void {
    this._store.dispatch({
      type: ActionTypes.MOVE_SELECTION_DOWN,
    });
  }

  moveSelectionToTop(): void {
    this._store.dispatch({
      type: ActionTypes.MOVE_SELECTION_TO_TOP,
    });
  }

  moveSelectionToBottom(): void {
    this._store.dispatch({
      type: ActionTypes.MOVE_SELECTION_TO_BOTTOM,
    });
  }

  setOpenFilesExpanded(openFilesExpanded: boolean): void {
    this._store.dispatch({
      type: ActionTypes.SET_OPEN_FILES_EXPANDED,
      openFilesExpanded,
    });
  }

  setUncommittedChangesExpanded(uncommittedChangesExpanded: boolean): void {
    this._store.dispatch({
      type: ActionTypes.SET_UNCOMMITTED_CHANGES_EXPANDED,
      uncommittedChangesExpanded,
    });
  }

  setFoldersExpanded(foldersExpanded: boolean): void {
    this._store.dispatch({
      type: ActionTypes.SET_FOLDERS_EXPANDED,
      foldersExpanded,
    });
  }

  setTargetNode(rootKey: NuclideUri, nodeKey: NuclideUri): void {
    this._store.dispatch({
      type: ActionTypes.SET_TARGET_NODE,
      rootKey,
      nodeKey,
    });
  }

  updateGeneratedStatus(filesToCheck: Iterable<NuclideUri>): void {
    this._store.dispatch({
      type: ActionTypes.UPDATE_GENERATED_STATUS,
      filesToCheck,
    });
  }

  addFilterLetter(letter: string): void {
    this._store.dispatch({
      type: ActionTypes.ADD_FILTER_LETTER,
      letter,
    });
  }

  removeFilterLetter(): mixed {
    this._store.dispatch({
      type: ActionTypes.REMOVE_FILTER_LETTER,
    });
  }

  reset(): mixed {
    this._store.dispatch({
      type: ActionTypes.RESET,
    });
  }

  _repositoryAdded(
    repo: atom$Repository,
    rootKeysForRepository: Immutable.Map<
      atom$Repository,
      Immutable.Set<string>,
    >,
  ): void {
    // We support HgRepositoryClient and GitRepositoryAsync objects.

    // Observe the repository so that the VCS statuses are kept up to date.
    // This observer should fire off an initial value after we subscribe to it,
    // and subsequent values after any changes to the repository.
    let vcsChanges: Observable<
      Map<NuclideUri, StatusCodeNumberValue>,
    > = Observable.empty();
    let vcsCalculating: Observable<boolean> = Observable.of(false);

    if (repo.isDestroyed()) {
      // Don't observe anything on a destroyed repo.
    } else if (repo.getType() === 'git') {
      // Different repo types emit different events at individual and refresh updates.
      // Hence, the need to debounce and listen to both change types.
      vcsChanges = Observable.merge(
        observableFromSubscribeFunction(repo.onDidChangeStatus.bind(repo)),
        observableFromSubscribeFunction(repo.onDidChangeStatuses.bind(repo)),
      )
        .let(fastDebounce(1000))
        .startWith(null)
        .map(() =>
          this._getCachedPathStatusesForGitRepo(
            ((repo: any): atom$GitRepository),
          ),
        );
    } else if (repo.getType() === 'hg') {
      // We special-case the HgRepository because it offers up the
      // required observable directly, and because it actually allows us to pick
      // between two different observables.
      const hgRepo: HgRepositoryClient = (repo: any);

      const hgChanges = FileTreeHelpers.observeUncommittedChangesKindConfigKey()
        .map(kind => {
          switch (kind) {
            case 'Uncommitted changes':
              return hgRepo.observeUncommittedStatusChanges();
            case 'Head changes':
              return hgRepo.observeHeadStatusChanges();
            case 'Stack changes':
              return hgRepo.observeStackStatusChanges();
            default:
              (kind: empty);
              const error = Observable.throw(
                new Error('Unrecognized ShowUncommittedChangesKind config'),
              );
              return {statusChanges: error, isCalculatingChanges: error};
          }
        })
        .share();

      vcsChanges = hgChanges
        .switchMap(c => c.statusChanges)
        .distinctUntilChanged(mapEqual);
      vcsCalculating = hgChanges.switchMap(c => c.isCalculatingChanges);
    }

    const subscription = vcsChanges.subscribe(statusCodeForPath => {
      for (const rootKeyForRepo of nullthrows(
        rootKeysForRepository.get(repo),
      )) {
        this.setVcsStatuses(rootKeyForRepo, statusCodeForPath);
      }
    });

    const subscriptionCalculating = vcsCalculating.subscribe(
      isCalculatingChanges => {
        this.setIsCalculatingChanges(isCalculatingChanges);
      },
    );

    this._disposableForRepository = this._disposableForRepository.set(
      repo,
      new UniversalDisposable(subscription, subscriptionCalculating),
    );
  }

  /**
   * Fetches a consistent object map from absolute file paths to
   * their corresponding `StatusCodeNumber` for easy representation with the file tree.
   */
  _getCachedPathStatusesForGitRepo(
    repo: atom$GitRepository,
  ): Map<NuclideUri, StatusCodeNumberValue> {
    const gitRepo: atom$GitRepository = (repo: any);
    const {statuses} = gitRepo;
    const internalGitRepo = gitRepo.getRepo();
    const codePathStatuses = new Map();
    const repoRoot = repo.getWorkingDirectory();
    // Transform `git` bit numbers to `StatusCodeNumber` format.
    const {StatusCodeNumber} = hgConstants;
    for (const relativePath in statuses) {
      const gitStatusNumber = statuses[relativePath];
      let statusCode;
      if (internalGitRepo.isStatusNew(gitStatusNumber)) {
        statusCode = StatusCodeNumber.UNTRACKED;
      } else if (internalGitRepo.isStatusStaged(gitStatusNumber)) {
        statusCode = StatusCodeNumber.ADDED;
      } else if (internalGitRepo.isStatusModified(gitStatusNumber)) {
        statusCode = StatusCodeNumber.MODIFIED;
      } else if (internalGitRepo.isStatusIgnored(gitStatusNumber)) {
        statusCode = StatusCodeNumber.IGNORED;
      } else if (internalGitRepo.isStatusDeleted(gitStatusNumber)) {
        statusCode = StatusCodeNumber.REMOVED;
      } else {
        getLogger('nuclide-file-tree').warn(
          `Unrecognized git status number ${gitStatusNumber}`,
        );
        statusCode = StatusCodeNumber.MODIFIED;
      }
      codePathStatuses.set(nuclideUri.join(repoRoot, relativePath), statusCode);
    }

    return codePathStatuses;
  }

  revealNodeKey(nodeKey: ?string): void {
    if (nodeKey == null) {
      return;
    }

    this.ensureChildNode(nodeKey);
  }

  revealFilePath(filePath: ?string, showIfHidden?: boolean = true): void {
    if (showIfHidden) {
      // Ensure the file tree is visible before trying to reveal a file in it. Even if the currently
      // active pane is not an ordinary editor, we still at least want to show the tree.
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open(WORKSPACE_VIEW_URI, {searchAllPanes: true});
      this.setFoldersExpanded(true);
    }

    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return;
    }

    this.revealNodeKey(filePath);
  }

  openAndRevealFilePath(filePath: ?string): void {
    if (filePath != null) {
      goToLocation(filePath);
      this.revealNodeKey(filePath);
    }
  }

  openAndRevealFilePaths(filePaths: Array<string>): void {
    for (let i = 0; i < filePaths.length; i++) {
      goToLocation(filePaths[i]);
    }
    if (filePaths.length !== 0) {
      this.revealNodeKey(filePaths[filePaths.length - 1]);
    }
  }

  openAndRevealDirectoryPath(path: ?string): void {
    if (path != null) {
      this.revealNodeKey(FileTreeHelpers.dirPathToKey(path));
    }
  }

  updateRootDirectories(): void {
    // If the remote-projects package hasn't loaded yet remote directories will be instantiated as
    // local directories but with invalid paths. We need to exclude those.
    const rootDirectories = atom.project
      .getDirectories()
      .filter(directory => FileTreeHelpers.isValidDirectory(directory));
    const rootKeys = rootDirectories.map(directory =>
      FileTreeHelpers.dirPathToKey(directory.getPath()),
    );
    this.setRootKeys(rootKeys);
    this.updateRepositories(rootDirectories);
  }

  setCwdToSelection(): void {
    const node = Selectors.getSingleSelectedNode(this._store);
    if (node == null) {
      return;
    }
    const path = FileTreeHelpers.keyToPath(node.uri);
    const cwdApi = Selectors.getCwdApi(this._store);
    if (cwdApi != null) {
      cwdApi.setCwd(path);
    }
  }

  setCwdApi(cwdApi: ?CwdApi): void {
    if (cwdApi == null) {
      this.setCwd(null);
      this._cwdApiSubscription = null;
    } else {
      invariant(this._cwdApiSubscription == null);
      this._cwdApiSubscription = cwdApi.observeCwd(directory => {
        // flowlint-next-line sketchy-null-string:off
        const rootKey = directory && FileTreeHelpers.dirPathToKey(directory);
        this.setCwd(rootKey);
      });
    }

    this._store.dispatch({
      type: ActionTypes.SET_CWD_API,
      cwdApi,
    });
  }

  setRemoteProjectsService(service: ?RemoteProjectsService): void {
    if (service != null) {
      // This is to workaround the initialization order problem between the
      // nuclide-remote-projects and nuclide-file-tree packages.
      // The file-tree starts up and restores its state, which can have a (remote) project root.
      // But at this point it's not a real directory. It is not present in
      // atom.project.getDirectories() and essentially it's a fake, but a useful one, as it has
      // the state (open folders, selection etc.) serialized in it. So we don't want to discard
      // it. In most cases, after a successful reconnect the real directory instance will be
      // added to the atom.project.directories and the previously fake root would become real.
      // The problem happens when the connection fails, or is canceled.
      // The fake root just stays in the file tree.
      // After remote projects have been reloaded, force a refresh to clear out the fake roots.
      this._disposables.add(
        service.waitForRemoteProjectReload(() => {
          this.updateRootDirectories();
        }),
      );
    }
  }

  /**
   * Collapses all selected directory nodes. If the selection is a single file or a single collapsed
   * directory, the selection is set to the directory's parent.
   */
  collapseSelection(deep: boolean = false): void {
    const selectedNodes = Selectors.getSelectedNodes(this._store);
    const firstSelectedNode = nullthrows(selectedNodes.first());
    if (
      selectedNodes.size === 1 &&
      !firstSelectedNode.isRoot &&
      !(firstSelectedNode.isContainer && firstSelectedNode.isExpanded)
    ) {
      /*
         * Select the parent of the selection if the following criteria are met:
         *   * Only 1 node is selected
         *   * The node is not a root
         *   * The node is not an expanded directory
        */

      const parent = nullthrows(firstSelectedNode.parent);
      this._selectAndTrackNode(parent);
    } else {
      selectedNodes.forEach(node => {
        // Only directories can be expanded. Skip non-directory nodes.
        if (!node.isContainer) {
          return;
        }

        if (deep) {
          this.collapseNodeDeep(node.rootUri, node.uri);
        } else {
          this.collapseNode(node.rootUri, node.uri);
        }
      });
    }
  }

  _selectAndTrackNode(node: FileTreeNode): void {
    this.setSelectedNode(node.rootUri, node.uri);
  }

  collapseAll(): void {
    const roots = this._store._roots;
    roots.forEach(root => this.collapseNodeDeep(root.uri, root.uri));
  }

  deleteSelection(): void {
    const nodes = Selectors.getTargetNodes(this._store);
    if (nodes.size === 0) {
      return;
    }

    const rootPaths = nodes.filter(node => node.isRoot);
    if (rootPaths.size === 0) {
      const selectedPaths = nodes.map(node => {
        const nodePath = FileTreeHelpers.keyToPath(node.uri);
        const parentOfRoot = nuclideUri.dirname(node.rootUri);

        // Fix Windows paths to avoid end of filename truncation
        return isRunningInWindows()
          ? nuclideUri.relative(parentOfRoot, nodePath).replace(/\//g, '\\')
          : nuclideUri.relative(parentOfRoot, nodePath);
      });
      const message =
        'Are you sure you want to delete the following ' +
        (nodes.size > 1 ? 'items?' : 'item?');
      atom.confirm({
        buttons: {
          Delete: () => {
            this.deleteSelectedNodes();
          },
          Cancel: () => {},
        },
        detailedMessage: `You are deleting:${os.EOL}${selectedPaths.join(
          os.EOL,
        )}`,
        message,
      });
    } else {
      let message;
      if (rootPaths.size === 1) {
        message = `The root directory '${
          nullthrows(rootPaths.first()).name
        }' can't be removed.`;
      } else {
        const rootPathNames = rootPaths
          .map(node => `'${node.name}'`)
          .join(', ');
        message = `The root directories ${rootPathNames} can't be removed.`;
      }

      atom.confirm({
        buttons: ['OK'],
        message,
      });
    }
  }

  /**
   * Expands all selected directory nodes.
   */
  expandSelection(deep: boolean): void {
    this.clearFilter();

    Selectors.getSelectedNodes(this._store).forEach(node => {
      // Only directories can be expanded. Skip non-directory nodes.
      if (!node.isContainer) {
        return;
      }

      if (deep) {
        this.expandNodeDeep(node.rootUri, node.uri);
        this.setTrackedNode(node.rootUri, node.uri);
      } else {
        if (node.isExpanded) {
          // Node is already expanded; move the selection to the first child.
          let firstChild = node.children.first();
          if (firstChild != null && !firstChild.shouldBeShown) {
            firstChild = firstChild.findNextShownSibling();
          }

          if (firstChild != null) {
            this._selectAndTrackNode(firstChild);
          }
        } else {
          this.expandNode(node.rootUri, node.uri);
          this.setTrackedNode(node.rootUri, node.uri);
        }
      }
    });
  }

  openSelectedEntry(): void {
    this.clearFilter();
    const singleSelectedNode = Selectors.getSingleSelectedNode(this._store);
    // Only perform the default action if a single node is selected.
    if (singleSelectedNode != null) {
      this.confirmNode(singleSelectedNode.rootUri, singleSelectedNode.uri);
    }
  }

  _openSelectedEntrySplit(
    orientation: atom$PaneSplitOrientation,
    side: atom$PaneSplitSide,
  ): void {
    const singleSelectedNode = Selectors.getSingleTargetNode(this._store);
    // Only perform the default action if a single node is selected.
    if (singleSelectedNode != null && !singleSelectedNode.isContainer) {
      // for: is this feature used enough to justify uncollapsing?
      track('filetree-split-file', {
        orientation,
        side,
      });
      this.openSelectedEntrySplit(singleSelectedNode.uri, orientation, side);
    }
  }

  openSelectedEntrySplitUp(): void {
    this._openSelectedEntrySplit('vertical', 'before');
  }

  openSelectedEntrySplitDown(): void {
    this._openSelectedEntrySplit('vertical', 'after');
  }

  openSelectedEntrySplitLeft(): void {
    this._openSelectedEntrySplit('horizontal', 'before');
  }

  openSelectedEntrySplitRight(): void {
    this._openSelectedEntrySplit('horizontal', 'after');
  }

  async removeRootFolderSelection(): Promise<void> {
    const rootNode = Selectors.getSingleSelectedNode(this._store);
    if (rootNode != null && rootNode.isRoot) {
      logger.info('Removing project path via file tree', rootNode);
      await removeProjectPath(rootNode.uri);
    }
  }

  copyFilenamesWithDir(): void {
    const nodes = Selectors.getSelectedNodes(this._store);
    const dirs = [];
    const files = [];
    for (const node of nodes) {
      const file = FileTreeHelpers.getFileByKey(node.uri);
      if (file != null) {
        files.push(file);
      }
      const dir = FileTreeHelpers.getDirectoryByKey(node.uri);
      if (dir != null) {
        dirs.push(dir);
      }
    }
    const entries = dirs.concat(files);
    if (entries.length === 0) {
      // no valid files or directories found
      return;
    }
    const dirPath = entries[0].getParent().getPath();
    if (!entries.every(e => e.getParent().getPath() === dirPath)) {
      // only copy if all selected files are in the same directory
      return;
    }

    // copy this text in case user pastes into a text area
    const copyNames = entries
      .map(e => encodeURIComponent(e.getBaseName()))
      .join();

    atom.clipboard.write(copyNames, {
      directory: FileTreeHelpers.dirPathToKey(dirPath),
      filenames: files.map(f => f.getBaseName()),
      dirnames: dirs.map(f => f.getBaseName()),
    });
  }

  openAddFolderDialog(onDidConfirm: (filePath: ?string) => mixed): void {
    const node = getSelectedContainerNode(this._store);
    if (!node) {
      return;
    }
    openAddDialog(
      'folder',
      node.localPath + '/',
      async (filePath: string, options: Object) => {
        // Prevent submission of a blank field from creating a directory.
        if (filePath === '') {
          return;
        }

        // TODO: check if filePath is in rootKey and if not, find the rootKey it belongs to.
        const directory = FileTreeHelpers.getDirectoryByKey(node.uri);
        if (directory == null) {
          return;
        }

        const {path} = nuclideUri.parse(filePath);
        const basename = nuclideUri.basename(path);
        const newDirectory = directory.getSubdirectory(basename);
        let created;
        try {
          created = await newDirectory.create();
        } catch (e) {
          atom.notifications.addError(
            `Could not create directory '${basename}': ${e.toString()}`,
          );
          onDidConfirm(null);
          return;
        }
        if (!created) {
          atom.notifications.addError(`'${basename}' already exists.`);
          onDidConfirm(null);
        } else {
          onDidConfirm(newDirectory.getPath());
        }
      },
    );
  }

  openAddFileDialog(onDidConfirm: (filePath: ?string) => mixed): void {
    const node = getSelectedContainerNode(this._store);
    if (!node) {
      return;
    }

    return openAddFileDialogImpl(node, node.localPath, node.uri, onDidConfirm);
  }

  openAddFileDialogRelative(onDidConfirm: (filePath: ?string) => mixed): void {
    const editor = atom.workspace.getActiveTextEditor();
    const filePath = editor != null ? editor.getPath() : null;
    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return;
    }

    const dirPath = FileTreeHelpers.getParentKey(filePath);
    const rootNode = Selectors.getRootForPath(this._store, dirPath);

    if (rootNode) {
      const localPath = nuclideUri.isRemote(dirPath)
        ? nuclideUri.parse(dirPath).path
        : dirPath;

      return openAddFileDialogImpl(
        rootNode,
        FileTreeHelpers.keyToPath(localPath),
        dirPath,
        onDidConfirm,
      );
    }
  }

  openRenameDialog(): void {
    const targetNodes = Selectors.getTargetNodes(this._store);
    if (targetNodes.size !== 1) {
      // Can only rename one entry at a time.
      return;
    }

    const node = targetNodes.first();
    invariant(node != null);
    const nodePath = node.localPath;
    openDialog({
      iconClassName: 'icon-arrow-right',
      initialValue: nuclideUri.basename(nodePath),
      message: node.isContainer ? (
        <span>Enter the new path for the directory.</span>
      ) : (
        <span>Enter the new path for the file.</span>
      ),
      onConfirm: (newBasename: string, options: Object) => {
        renameNode(node, nodePath, newBasename).catch(error => {
          atom.notifications.addError(
            `Rename to ${newBasename} failed: ${error.message}`,
          );
        });
      },
      onClose: closeDialog,
      selectBasename: true,
    });
  }

  openDuplicateDialog(onDidConfirm: (filePaths: Array<string>) => mixed): void {
    const targetNodes = Selectors.getTargetNodes(this._store);
    this.openNextDuplicateDialog(targetNodes, onDidConfirm);
  }

  openNextDuplicateDialog(
    nodes: Immutable.List<FileTreeNode>,
    onDidConfirm: (filePaths: Array<string>) => mixed,
  ): void {
    const node = nodes.first();
    invariant(node != null);
    const nodePath = nullthrows(node).localPath;
    let initialValue = nuclideUri.basename(nodePath);
    const ext = nuclideUri.extname(nodePath);
    initialValue =
      initialValue.substr(0, initialValue.length - ext.length) + '-copy' + ext;
    const hgRepository = FileTreeHgHelpers.getHgRepositoryForNode(node);
    const additionalOptions = {};
    // eslint-disable-next-line eqeqeq
    if (hgRepository !== null) {
      additionalOptions.addToVCS = 'Add the new file to version control.';
    }

    const dialogProps = {
      iconClassName: 'icon-arrow-right',
      initialValue,
      message: <span>Enter the new path for the duplicate.</span>,
      onConfirm: (newBasename: string, options: {addToVCS?: boolean}) => {
        const file = FileTreeHelpers.getFileByKey(node.uri);
        if (file == null) {
          // TODO: Connection could have been lost for remote file.
          return;
        }
        duplicate(
          file,
          newBasename.trim(),
          Boolean(options.addToVCS),
          onDidConfirm,
        ).catch(error => {
          atom.notifications.addError(
            `Failed to duplicate '${file.getPath()}'`,
          );
        });
      },
      onClose: () => {
        if (nodes.rest().count() > 0) {
          this.openNextDuplicateDialog(nodes.rest(), onDidConfirm);
        } else {
          closeDialog();
        }
      },
      selectBasename: true,
      additionalOptions,
    };
    openDialog(dialogProps);
  }

  openPasteDialog(): void {
    const node = Selectors.getSingleSelectedNode(this._store);
    if (node == null) {
      // don't paste if unselected
      return;
    }

    let newPath = FileTreeHelpers.getDirectoryByKey(node.uri);
    if (newPath == null) {
      // maybe it's a file?
      const file = FileTreeHelpers.getFileByKey(node.uri);
      if (file == null) {
        // nope! do nothing if we can't find an entry
        return;
      }
      newPath = file.getParent();
    }

    const additionalOptions = {};
    // eslint-disable-next-line eqeqeq
    if (FileTreeHgHelpers.getHgRepositoryForNode(node) !== null) {
      additionalOptions.addToVCS = 'Add the new file(s) to version control.';
    }
    openDialog({
      iconClassName: 'icon-arrow-right',
      ...getPasteDialogProps(newPath),
      onConfirm: (pasteDirPath: string, options: {addToVCS?: boolean}) => {
        paste(pasteDirPath.trim(), Boolean(options.addToVCS)).catch(error => {
          atom.notifications.addError(
            `Failed to paste into '${pasteDirPath}': ${error}`,
          );
        });
      },
      onClose: closeDialog,
      additionalOptions,
    });
  }

  // This is really weird. Eventually (when we switch to redux-observable) this won't be necessary
  // because subscriptions will be handled by the epics.
  dispose(): void {
    this._disposables.dispose();
  }
}

/**
 * A flow-friendly way of filtering out null keys.
 */
function omitNullKeys<T, U>(
  map: Immutable.KeyedSeq<?T, U>,
): Immutable.KeyedCollection<T, U> {
  return (map.filter((v, k) => k != null): any);
}

async function renameNode(
  node: FileTreeNode,
  nodePath: string,
  newBasename: string,
): Promise<void> {
  /*
   * Use `resolve` to strip trailing slashes because renaming a file to a name with a
   * trailing slash is an error.
   */
  let newPath = nuclideUri.resolve(
    // Trim leading and trailing whitespace to prevent bad filenames.
    nuclideUri.join(nuclideUri.dirname(nodePath), newBasename.trim()),
  );

  // Create a remote nuclide uri when the node being moved is remote.
  if (nuclideUri.isRemote(node.uri)) {
    newPath = nuclideUri.createRemoteUri(
      nuclideUri.getHostname(node.uri),
      newPath,
    );
  }

  await FileTreeHgHelpers.renameNode(node, newPath);
}

async function duplicate(
  file: File | RemoteFile,
  newBasename: string,
  addToVCS: boolean,
  onDidConfirm: (filePaths: Array<string>) => mixed,
): Promise<void> {
  const directory = file.getParent();
  const newFile = directory.getFile(newBasename);
  return copy(
    [{old: file.getPath(), new: newFile.getPath()}],
    addToVCS,
    onDidConfirm,
  );
}

async function copy(
  copyPaths: Array<CopyPath>,
  addToVCS: boolean,
  onDidConfirm: (filePaths: Array<string>) => mixed,
): Promise<void> {
  const copiedPaths = await Promise.all(
    copyPaths
      .filter(
        ({old: oldPath, new: newPath}) =>
          nuclideUri.getHostnameOpt(oldPath) ===
          nuclideUri.getHostnameOpt(newPath),
      )
      .map(async ({old: oldPath, new: newPath}) => {
        const service = getFileSystemServiceByNuclideUri(newPath);
        const isFile = (await service.stat(oldPath)).isFile();
        const exists = isFile
          ? !(await service.copy(oldPath, newPath))
          : !(await service.copyDir(oldPath, newPath));
        if (exists) {
          atom.notifications.addError(`'${newPath}' already exists.`);
          return [];
        } else {
          return [newPath];
        }
      }),
  );

  const successfulPaths = [].concat(...copiedPaths);
  onDidConfirm(successfulPaths);

  if (successfulPaths.length !== 0) {
    const hgRepository = getHgRepositoryForPath(successfulPaths[0]);
    if (hgRepository != null && addToVCS) {
      try {
        // We are not recording the copy in mercurial on purpose, because most of the time
        // it's either templates or files that have greatly changed since duplicating.
        await hgRepository.addAll(successfulPaths);
      } catch (e) {
        const message =
          'Paths were duplicated, but there was an error adding them to ' +
          'version control.  Error: ' +
          e.toString();
        atom.notifications.addError(message);
        return;
      }
    }
  }
}

function getHgRepositoryForPath(filePath: string): ?HgRepositoryClient {
  const repository = repositoryForPath(filePath);
  if (repository != null && repository.getType() === 'hg') {
    return ((repository: any): HgRepositoryClient);
  }
  return null;
}

async function paste(
  newPath: string,
  addToVCS: boolean,
  onDidConfirm: (filePath: Array<string>) => mixed = () => {},
): Promise<void> {
  const copyPaths = [];
  const cb = atom.clipboard.readWithMetadata();
  const oldDir = getDirectoryFromMetadata(cb.metadata);
  if (oldDir == null) {
    // bad source
    return;
  }

  const filenames = cb.text.split(',');
  const newFile = FileTreeHelpers.getFileByKey(newPath);
  const newDir = FileTreeHelpers.getDirectoryByKey(newPath);

  if (newFile == null && newDir == null) {
    // newPath doesn't resolve to a file or path
    atom.notifications.addError('Invalid target');
    return;
  } else if (filenames.length === 1) {
    const origFilePath = oldDir.getFile(cb.text).getPath();
    if (newFile != null) {
      // single file on clibboard; Path resolves to a file.
      // => copy old file into new file
      const destFilePath = newFile.getPath();
      copyPaths.push({old: origFilePath, new: destFilePath});
    } else if (newDir != null) {
      // single file on clibboard; Path resolves to a folder.
      // => copy old file into new newDir folder
      const destFilePath = newDir.getFile(cb.text).getPath();
      copyPaths.push({old: origFilePath, new: destFilePath});
    }
  } else {
    // multiple files in cb
    if (newDir == null) {
      atom.notifications.addError('Cannot rename when pasting multiple files');
      return;
    }

    filenames.forEach(encodedFilename => {
      const filename = decodeURIComponent(encodedFilename);
      const origFilePath = oldDir.getFile(filename).getPath();
      const destFilePath = newDir.getFile(filename).getPath();
      copyPaths.push({old: origFilePath, new: destFilePath});
    });
  }

  await copy(copyPaths, addToVCS, onDidConfirm);
}

function getDirectoryFromMetadata(cbMeta: ?mixed): ?Directory {
  if (
    cbMeta == null ||
    typeof cbMeta !== 'object' ||
    cbMeta.directory == null ||
    typeof cbMeta.directory !== 'string'
  ) {
    return null;
  }
  return FileTreeHelpers.getDirectoryByKey(cbMeta.directory);
}

function openAddDialog(
  entryType: string,
  path: string,
  onConfirm: (filePath: string, options: Object) => mixed,
  additionalOptions?: Object = {},
) {
  openDialog({
    iconClassName: 'icon-file-add',
    message: (
      <span>
        Enter the path for the new {entryType} in the root:<br />
        {path}
      </span>
    ),
    onConfirm,
    onClose: closeDialog,
    additionalOptions,
  });
}

function openAddFileDialogImpl(
  rootNode: FileTreeNode,
  localPath: NuclideUri,
  filePath: NuclideUri,
  onDidConfirm: (filePath: ?string) => mixed,
): void {
  const hgRepository = FileTreeHgHelpers.getHgRepositoryForNode(rootNode);
  const additionalOptions = {};
  if (hgRepository != null) {
    additionalOptions.addToVCS = 'Add the new file to version control.';
  }
  openAddDialog(
    'file',
    nuclideUri.ensureTrailingSeparator(localPath),
    async (pathToCreate: string, options: {addToVCS?: boolean}) => {
      // Prevent submission of a blank field from creating a file.
      if (pathToCreate === '') {
        return;
      }

      // TODO: check if pathToCreate is in rootKey and if not, find the rootKey it belongs to.
      const directory = FileTreeHelpers.getDirectoryByKey(filePath);
      if (directory == null) {
        return;
      }

      const newFile = directory.getFile(pathToCreate);
      let created;
      try {
        created = await newFile.create();
      } catch (e) {
        atom.notifications.addError(
          `Could not create file '${newFile.getPath()}': ${e.toString()}`,
        );
        onDidConfirm(null);
        return;
      }
      if (!created) {
        atom.notifications.addError(`'${pathToCreate}' already exists.`);
        onDidConfirm(null);
        return;
      }

      const newFilePath = newFile.getPath();
      // Open a new text editor while VCS actions complete in the background.
      onDidConfirm(newFilePath);
      if (hgRepository != null && options.addToVCS === true) {
        try {
          await hgRepository.addAll([newFilePath]);
        } catch (e) {
          atom.notifications.addError(
            `Failed to add '${newFilePath}' to version control. Error: ${e.toString()}`,
          );
        }
      }
    },
    additionalOptions,
  );
}

// provide appropriate UI feedback depending on whether user
// has single or multiple files in the clipboard
function getPasteDialogProps(
  path: Directory,
): {initialValue: string, message: React.Element<string>} {
  const cb = atom.clipboard.readWithMetadata();
  const filenames = cb.text.split(',');
  if (filenames.length === 1) {
    return {
      initialValue: path.getFile(cb.text).getPath(),
      message: <span>Paste file from clipboard into</span>,
    };
  } else {
    return {
      initialValue: FileTreeHelpers.dirPathToKey(path.getPath()),
      message: (
        <span>Paste files from clipboard into the following folder</span>
      ),
    };
  }
}

function getSelectedContainerNode(store: FileTreeStore): ?FileTreeNode {
  /*
   * TODO: Choosing the last selected key is inexact when there is more than 1 root. The Set of
   * selected keys should be maintained as a flat list across all roots to maintain insertion
   * order.
   */
  const node = Selectors.getSelectedNodes(store).first();
  if (node) {
    return node.isContainer ? node : node.parent;
  }

  return null;
}
