"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.confirmNodeEpic = confirmNodeEpic;
exports.keepPreviewTabEpic = keepPreviewTabEpic;
exports.openEntrySplitEpic = openEntrySplitEpic;
exports.updateRepositoriesEpic = updateRepositoriesEpic;
exports.revealNodeKeyEpic = revealNodeKeyEpic;
exports.revealFilePathEpic = revealFilePathEpic;
exports.openAndRevealFilePathEpic = openAndRevealFilePathEpic;
exports.openAndRevealFilePathsEpic = openAndRevealFilePathsEpic;
exports.openAndRevealDirectoryPathEpic = openAndRevealDirectoryPathEpic;
exports.updateRootDirectoriesEpic = updateRootDirectoriesEpic;
exports.setCwdToSelectionEpic = setCwdToSelectionEpic;
exports.setCwdApiEpic = setCwdApiEpic;
exports.setRemoteProjectsServiceEpic = setRemoteProjectsServiceEpic;
exports.collapseSelectionEpic = collapseSelectionEpic;
exports.collapseAllEpic = collapseAllEpic;
exports.deleteSelectionEpic = deleteSelectionEpic;
exports.expandSelectionEpic = expandSelectionEpic;
exports.openSelectedEntryEpic = openSelectedEntryEpic;
exports.openSelectedEntrySplitEpic = openSelectedEntrySplitEpic;
exports.removeRootFolderSelection = removeRootFolderSelection;
exports.copyFilenamesWithDir = copyFilenamesWithDir;
exports.openAddFolderDialogEpic = openAddFolderDialogEpic;
exports.openAddFileDialogEpic = openAddFileDialogEpic;
exports.openAddFileDialogRelativeEpic = openAddFileDialogRelativeEpic;
exports.openRenameDialogEpic = openRenameDialogEpic;
exports.openDuplicateDialogEpic = openDuplicateDialogEpic;
exports.openNextDuplicateDialogEpic = openNextDuplicateDialogEpic;
exports.openPasteDialogEpic = openPasteDialogEpic;
exports.updateWorkingSetEpic = updateWorkingSetEpic;
exports.deleteSelectedNodesEpic = deleteSelectedNodesEpic;
exports.moveToNodeEpic = moveToNodeEpic;
exports.movePathToNodeEpic = movePathToNodeEpic;
exports.expandNodeEpic = expandNodeEpic;
exports.expandNodeDeepEpic = expandNodeDeepEpic;
exports.reorderRootsEpic = reorderRootsEpic;
exports.loadDataEpic = loadDataEpic;
exports.updateGeneratedStatusEpic = updateGeneratedStatusEpic;
exports.uploadDroppedFilesEpic = uploadDroppedFilesEpic;

function _passesGK() {
  const data = require("../../../../modules/nuclide-commons/passesGK");

  _passesGK = function () {
    return data;
  };

  return data;
}

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _Constants() {
  const data = require("../Constants");

  _Constants = function () {
    return data;
  };

  return data;
}

function FileTreeHgHelpers() {
  const data = _interopRequireWildcard(require("../FileTreeHgHelpers"));

  FileTreeHgHelpers = function () {
    return data;
  };

  return data;
}

function _FileTreeNode() {
  const data = require("../FileTreeNode");

  _FileTreeNode = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _nuclideVcsBase() {
  const data = require("../../../nuclide-vcs-base");

  _nuclideVcsBase = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../../../modules/nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function FileTreeHelpers() {
  const data = _interopRequireWildcard(require("../FileTreeHelpers"));

  FileTreeHelpers = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("../redux/Selectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function _nuclideHgRpc() {
  const data = require("../../../nuclide-hg-rpc");

  _nuclideHgRpc = function () {
    return data;
  };

  return data;
}

function _systemInfo() {
  const data = require("../../../../modules/nuclide-commons/system-info");

  _systemInfo = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _removeProjectPath() {
  const data = _interopRequireDefault(require("../../../commons-atom/removeProjectPath"));

  _removeProjectPath = function () {
    return data;
  };

  return data;
}

function _FileActionModal() {
  const data = require("../../../nuclide-ui/FileActionModal");

  _FileActionModal = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function EpicHelpers() {
  const data = _interopRequireWildcard(require("./EpicHelpers"));

  EpicHelpers = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
// eslint-disable-next-line nuclide-internal/import-type-style
const logger = (0, _log4js().getLogger)('nuclide-file-tree');

function confirmNodeEpic(actions, store) {
  return actions.ofType(Actions().CONFIRM_NODE).do(action => {
    if (!(action.type === Actions().CONFIRM_NODE)) {
      throw new Error("Invariant violation: \"action.type === Actions.CONFIRM_NODE\"");
    }

    const {
      rootKey,
      nodeKey,
      pending
    } = action;
    const node = Selectors().getNode(store.getState(), rootKey, nodeKey);

    if (node == null) {
      return;
    }

    if (node.isContainer) {
      if (node.isExpanded) {
        store.dispatch({
          type: Actions().COLLAPSE_NODE,
          nodeKey,
          rootKey
        });
      } else {
        store.dispatch({
          type: Actions().EXPAND_NODE,
          nodeKey,
          rootKey
        });
      }
    } else {
      (0, _nuclideAnalytics().track)('file-tree-open-file', {
        uri: nodeKey
      }); // goToLocation doesn't support pending panes
      // eslint-disable-next-line nuclide-internal/atom-apis

      atom.workspace.open(FileTreeHelpers().keyToPath(nodeKey), {
        activatePane: pending && Selectors().getFocusEditorOnFileSelection(store.getState()) || !pending,
        searchAllPanes: true,
        pending
      });
    }
  }).ignoreElements();
}

function keepPreviewTabEpic(actions) {
  return actions.ofType(Actions().KEEP_PREVIEW_TAB).do(() => {
    const activePane = atom.workspace.getActivePane();

    if (activePane != null) {
      activePane.clearPendingItem();
    }
  }).ignoreElements();
}

function openEntrySplitEpic(actions) {
  return actions.ofType(Actions().OPEN_ENTRY_SPLIT).do(action => {
    if (!(action.type === Actions().OPEN_ENTRY_SPLIT)) {
      throw new Error("Invariant violation: \"action.type === Actions.OPEN_ENTRY_SPLIT\"");
    }

    const {
      nodeKey,
      orientation,
      side
    } = action;
    const pane = atom.workspace.getCenter().getActivePane();
    atom.workspace.openURIInPane(FileTreeHelpers().keyToPath(nodeKey), pane.split(orientation, side));
  }).ignoreElements();
}
/**
 * Updates the root repositories to match the provided directories.
 */


function updateRepositoriesEpic(actions, store) {
  // TODO: This isn't really the best way to manage these. Instead we should use something like
  // `reconcileSetDiffs()`. It's only done this way because this was refactored from a giant class
  let disposableForRepository = new (Immutable().Map)();
  return actions.ofType(Actions().UPDATE_REPOSITORIES).switchMap(async action => {
    if (!(action.type === Actions().UPDATE_REPOSITORIES)) {
      throw new Error("Invariant violation: \"action.type === Actions.UPDATE_REPOSITORIES\"");
    }

    const {
      rootDirectories
    } = action;
    const rootKeys = rootDirectories.map(directory => FileTreeHelpers().dirPathToKey(directory.getPath())); // $FlowFixMe

    const rootRepos = await Promise.all(rootDirectories.map(directory => (0, _nuclideVcsBase().repositoryForPath)(directory.getPath()))); // t7114196: Given the current implementation of HgRepositoryClient, each root directory will
    // always correspond to a unique instance of HgRepositoryClient. Ideally, if multiple subfolders
    // of an Hg repo are used as project roots in Atom, only one HgRepositoryClient should be
    // created.
    // Group all of the root keys by their repository, excluding any that don't belong to a
    // repository.

    const rootKeysForRepository = Immutable().Map(omitNullKeys(Immutable().List(rootKeys).groupBy((rootKey, index) => rootRepos[index])).map(v => Immutable().Set(v)));
    return rootKeysForRepository;
  }).do(rootKeysForRepository => {
    const prevRepos = Selectors().getRepositories(store.getState()); // Let the store know we have some new repos!

    const nextRepos = Immutable().Set(rootKeysForRepository.keys());
    store.dispatch({
      type: Actions().SET_REPOSITORIES,
      repositories: nextRepos
    });
    const removedRepos = prevRepos.subtract(nextRepos);
    const addedRepos = nextRepos.subtract(prevRepos); // Unsubscribe from removedRepos.

    removedRepos.forEach(repo => {
      const disposable = disposableForRepository.get(repo);

      if (disposable == null) {
        // There is a small chance that the add/remove of the Repository could happen so quickly that
        // the entry for the repo in _disposableForRepository has not been set yet.
        // TODO: Report a soft error for this.
        return;
      }

      disposableForRepository = disposableForRepository.delete(repo);
      store.dispatch(Actions().invalidateRemovedFolder());
      disposable.dispose();
    }); // Create subscriptions for addedRepos.

    addedRepos.forEach(repo => {
      // We support HgRepositoryClient and GitRepositoryAsync objects.
      // Observe the repository so that the VCS statuses are kept up to date.
      // This observer should fire off an initial value after we subscribe to it,
      let vcsChanges = _rxjsCompatUmdMin.Observable.empty();

      let vcsCalculating = _rxjsCompatUmdMin.Observable.of(false);

      if (repo.isDestroyed()) {// Don't observe anything on a destroyed repo.
      } else if (repo.getType() === 'git') {
        // Different repo types emit different events at individual and refresh updates.
        // Hence, the need to debounce and listen to both change types.
        vcsChanges = _rxjsCompatUmdMin.Observable.merge((0, _event().observableFromSubscribeFunction)(repo.onDidChangeStatus.bind(repo)), (0, _event().observableFromSubscribeFunction)(repo.onDidChangeStatuses.bind(repo))).let((0, _observable().fastDebounce)(1000)).startWith(null).map(() => getCachedPathStatusesForGitRepo(repo));
      } else if (repo.getType() === 'hg') {
        // We special-case the HgRepository because it offers up the
        // required observable directly, and because it actually allows us to pick
        const hgRepo = repo;
        const hgChanges = FileTreeHelpers().observeUncommittedChangesKindConfigKey().map(kind => {
          switch (kind) {
            case 'Uncommitted changes':
              return hgRepo.observeUncommittedStatusChanges();

            case 'Head changes':
              return hgRepo.observeHeadStatusChanges();

            case 'Stack changes':
              return hgRepo.observeStackStatusChanges();

            default:
              kind;

              const error = _rxjsCompatUmdMin.Observable.throw(new Error('Unrecognized ShowUncommittedChangesKind config'));

              return {
                statusChanges: error,
                isCalculatingChanges: error
              };
          }
        }).share();
        vcsChanges = hgChanges.switchMap(c => c.statusChanges).distinctUntilChanged(_collection().mapEqual);
        vcsCalculating = hgChanges.switchMap(c => c.isCalculatingChanges);
      }

      const subscription = vcsChanges.subscribe(statusCodeForPath => {
        for (const rootKeyForRepo of (0, _nullthrows().default)(rootKeysForRepository.get(repo))) {
          store.dispatch(Actions().setVcsStatuses(rootKeyForRepo, statusCodeForPath));
        }
      });
      const subscriptionCalculating = vcsCalculating.subscribe(isCalculatingChanges => {
        store.dispatch(Actions().setIsCalculatingChanges(isCalculatingChanges));
      });
      disposableForRepository = disposableForRepository.set(repo, new (_UniversalDisposable().default)(subscription, subscriptionCalculating));
    });
  }).finally(() => {
    disposableForRepository.forEach(disposable => {
      disposable.dispose();
    });
  }).ignoreElements();
}

function revealNodeKeyEpic(actions, store) {
  return actions.ofType(Actions().REVEAL_NODE_KEY).do(action => {
    if (!(action.type === Actions().REVEAL_NODE_KEY)) {
      throw new Error("Invariant violation: \"action.type === Actions.REVEAL_NODE_KEY\"");
    }

    const {
      nodeKey
    } = action;

    if (nodeKey == null) {
      return;
    }

    EpicHelpers().ensureChildNode(store, nodeKey);
  }).ignoreElements();
}

function revealFilePathEpic(actions, store) {
  return actions.ofType(Actions().REVEAL_FILE_PATH).switchMap(action => {
    if (!(action.type === Actions().REVEAL_FILE_PATH)) {
      throw new Error("Invariant violation: \"action.type === Actions.REVEAL_FILE_PATH\"");
    }

    const {
      filePath,
      showIfHidden
    } = action;
    const resultActions = [];

    if (showIfHidden) {
      // Ensure the file tree is visible before trying to reveal a file in it. Even if the currently
      // active pane is not an ordinary editor, we still at least want to show the tree.
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open(_Constants().WORKSPACE_VIEW_URI, {
        searchAllPanes: true
      });
      resultActions.push(Actions().setFoldersExpanded(true));
    } // flowlint-next-line sketchy-null-string:off


    if (filePath) {
      resultActions.push(Actions().revealNodeKey(filePath));
    }

    return _rxjsCompatUmdMin.Observable.from(resultActions);
  });
}

function openAndRevealFilePathEpic(actions) {
  return actions.map(action => action.type === Actions().OPEN_AND_REVEAL_FILE_PATH ? action : null).filter(Boolean).filter(action => action.filePath != null).do(({
    filePath
  }) => {
    if (!(filePath != null)) {
      throw new Error("Invariant violation: \"filePath != null\"");
    }

    (0, _goToLocation().goToLocation)(filePath);
  }).map(({
    filePath
  }) => Actions().revealNodeKey(filePath));
}

function openAndRevealFilePathsEpic(actions) {
  return actions.map(action => action.type === Actions().OPEN_AND_REVEAL_FILE_PATHS ? action : null).filter(Boolean).do(({
    filePaths
  }) => {
    filePaths.forEach(path => {
      (0, _goToLocation().goToLocation)(path);
    });
  }).map(({
    filePaths
  }) => filePaths.length === 0 ? null : Actions().revealNodeKey(filePaths[filePaths.length - 1])).filter(Boolean);
}

function openAndRevealDirectoryPathEpic(actions) {
  return actions.ofType(Actions().OPEN_AND_REVEAL_DIRECTORY_PATH).map(action => {
    if (!(action.type === Actions().OPEN_AND_REVEAL_DIRECTORY_PATH)) {
      throw new Error("Invariant violation: \"action.type === Actions.OPEN_AND_REVEAL_DIRECTORY_PATH\"");
    }

    return action.path == null ? null : Actions().revealNodeKey(FileTreeHelpers().dirPathToKey(action.path));
  }).filter(Boolean);
}

function updateRootDirectoriesEpic(actions, store) {
  return actions.ofType(Actions().UPDATE_ROOT_DIRECTORIES).do(() => {
    // If the remote-projects package hasn't loaded yet remote directories will be instantiated as
    // local directories but with invalid paths. We need to exclude those.
    const rootDirectories = atom.project.getDirectories().filter(directory => FileTreeHelpers().isValidDirectory(directory));
    const rootKeys = rootDirectories.map(directory => FileTreeHelpers().dirPathToKey(directory.getPath()));
    EpicHelpers().setRootKeys(store, rootKeys);
    store.dispatch(Actions().updateRepositories(rootDirectories));
  }).ignoreElements();
}

function setCwdToSelectionEpic(actions, store) {
  return actions.ofType(Actions().SET_CWD_TO_SELECTION).do(() => {
    const node = Selectors().getSingleSelectedNode(store.getState());

    if (node == null) {
      return;
    }

    const path = FileTreeHelpers().keyToPath(node.uri);
    const cwdApi = Selectors().getCwdApi(store.getState());

    if (cwdApi != null) {
      cwdApi.setCwd(path);
    }
  }).ignoreElements();
}

function setCwdApiEpic(actions) {
  return actions.ofType(Actions().SET_CWD_API).switchMap(action => {
    if (!(action.type === Actions().SET_CWD_API)) {
      throw new Error("Invariant violation: \"action.type === Actions.SET_CWD_API\"");
    }

    const {
      cwdApi
    } = action;
    return cwdApi == null ? _rxjsCompatUmdMin.Observable.of(null) : (0, _event().observableFromSubscribeFunction)(cb => cwdApi.observeCwd(cb));
  }).map(directory => {
    // flowlint-next-line sketchy-null-string:off
    const rootKey = directory && FileTreeHelpers().dirPathToKey(directory);
    return Actions().setCwd(rootKey);
  });
}

function setRemoteProjectsServiceEpic(actions) {
  return actions.ofType(Actions().SET_REMOTE_PROJECTS_SERVICE).switchMap(action => {
    if (!(action.type === Actions().SET_REMOTE_PROJECTS_SERVICE)) {
      throw new Error("Invariant violation: \"action.type === Actions.SET_REMOTE_PROJECTS_SERVICE\"");
    }

    const {
      service
    } = action; // This is to workaround the initialization order problem between the
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

    return service == null ? _rxjsCompatUmdMin.Observable.empty() : (0, _event().observableFromSubscribeFunction)(cb => service.waitForRemoteProjectReload(cb));
  }).map(() => Actions().updateRootDirectories());
}
/**
 * Collapses all selected directory nodes. If the selection is a single file or a single collapsed
 * directory, the selection is set to the directory's parent.
 */


function collapseSelectionEpic(actions, store) {
  return actions.ofType(Actions().COLLAPSE_SELECTION).switchMap(action => {
    if (!(action.type === Actions().COLLAPSE_SELECTION)) {
      throw new Error("Invariant violation: \"action.type === Actions.COLLAPSE_SELECTION\"");
    }

    const {
      deep
    } = action;
    const selectedNodes = Selectors().getSelectedNodes(store.getState());
    const firstSelectedNode = (0, _nullthrows().default)(selectedNodes.first());

    if (selectedNodes.size === 1 && !firstSelectedNode.isRoot && !(firstSelectedNode.isContainer && firstSelectedNode.isExpanded)) {
      /*
        * Select the parent of the selection if the following criteria are met:
        *   * Only 1 node is selected
        *   * The node is not a root
        *   * The node is not an expanded directory
        */
      const parent = (0, _nullthrows().default)(firstSelectedNode.parent);
      return _rxjsCompatUmdMin.Observable.of(Actions().selectAndTrackNode(parent));
    }

    const collapseActions = selectedNodes.map(node => {
      // Only directories can be expanded. Skip non-directory nodes.
      if (!node.isContainer) {
        return null;
      }

      if (deep) {
        return Actions().collapseNodeDeep(node.rootUri, node.uri);
      } else {
        return Actions().collapseNode(node.rootUri, node.uri);
      }
    }).filter(Boolean);
    return _rxjsCompatUmdMin.Observable.from(collapseActions);
  });
}

function collapseAllEpic(actions, store) {
  return actions.ofType(Actions().COLLAPSE_ALL).switchMap(() => {
    const roots = store.getState()._roots;

    return _rxjsCompatUmdMin.Observable.from([...roots.values()].map(root => Actions().collapseNodeDeep(root.uri, root.uri)));
  });
}

function deleteSelectionEpic(actions, store) {
  return actions.ofType(Actions().DELETE_SELECTION).do(() => {
    const nodes = Selectors().getTargetNodes(store.getState());

    if (nodes.size === 0) {
      return;
    }

    const rootPaths = nodes.filter(node => node.isRoot);

    if (rootPaths.size === 0) {
      const selectedPaths = nodes.map(node => {
        const nodePath = FileTreeHelpers().keyToPath(node.uri);

        const parentOfRoot = _nuclideUri().default.dirname(node.rootUri); // Fix Windows paths to avoid end of filename truncation


        return (0, _systemInfo().isRunningInWindows)() ? _nuclideUri().default.relative(parentOfRoot, nodePath).replace(/\//g, '\\') : _nuclideUri().default.relative(parentOfRoot, nodePath);
      });
      const message = 'Are you sure you want to delete the following ' + (nodes.size > 1 ? 'items?' : 'item?');
      atom.confirm({
        buttons: {
          Delete: () => {
            store.dispatch(Actions().deleteSelectedNodes());
          },
          Cancel: () => {}
        },
        detailedMessage: `You are deleting:${_os.default.EOL}${selectedPaths.join(_os.default.EOL)}`,
        message
      });
    } else {
      let message;

      if (rootPaths.size === 1) {
        message = `The root directory '${(0, _nullthrows().default)(rootPaths.first()).name}' can't be removed.`;
      } else {
        const rootPathNames = rootPaths.map(node => `'${node.name}'`).join(', ');
        message = `The root directories ${rootPathNames} can't be removed.`;
      }

      atom.confirm({
        buttons: ['OK'],
        message
      });
    }
  }).ignoreElements();
}
/**
 * Expands all selected directory nodes.
 */


function expandSelectionEpic(actions, store) {
  return actions.ofType(Actions().EXPAND_SELECTION).switchMap(action => {
    if (!(action.type === Actions().EXPAND_SELECTION)) {
      throw new Error("Invariant violation: \"action.type === Actions.EXPAND_SELECTION\"");
    }

    const {
      deep
    } = action;
    const resultActions = [Actions().clearFilter()];
    const state = store.getState();
    Selectors().getSelectedNodes(state).forEach(node => {
      // Only directories can be expanded. Skip non-directory nodes.
      if (!node.isContainer) {
        return;
      }

      if (deep) {
        resultActions.push(Actions().expandNodeDeep(node.rootUri, node.uri), Actions().setTrackedNode(node.rootUri, node.uri));
      } else {
        if (node.isExpanded) {
          // Node is already expanded; move the selection to the first child.
          let firstChild = node.children.first();

          if (firstChild != null && !firstChild.shouldBeShown) {
            firstChild = Selectors().findNextShownSibling(state)(firstChild);
          }

          if (firstChild != null) {
            resultActions.push(Actions().selectAndTrackNode(firstChild));
          }
        } else {
          resultActions.push(Actions().expandNode(node.rootUri, node.uri), Actions().setTrackedNode(node.rootUri, node.uri));
        }
      }
    });
    return _rxjsCompatUmdMin.Observable.from(resultActions);
  });
}

function openSelectedEntryEpic(actions, store) {
  return actions.ofType(Actions().OPEN_SELECTED_ENTRY).switchMap(() => {
    const resultActions = [Actions().clearFilter()];
    const singleSelectedNode = Selectors().getSingleSelectedNode(store.getState()); // Only perform the default action if a single node is selected.

    if (singleSelectedNode != null) {
      resultActions.push(Actions().confirmNode(singleSelectedNode.rootUri, singleSelectedNode.uri));
    }

    return _rxjsCompatUmdMin.Observable.from(resultActions);
  });
}

function openSelectedEntrySplitEpic(actions, store) {
  return actions.ofType(Actions().OPEN_SELECTED_ENTRY_SPLIT).map(action => {
    if (!(action.type === Actions().OPEN_SELECTED_ENTRY_SPLIT)) {
      throw new Error("Invariant violation: \"action.type === Actions.OPEN_SELECTED_ENTRY_SPLIT\"");
    }

    const {
      orientation,
      side
    } = action;
    const singleSelectedNode = Selectors().getSingleTargetNode(store.getState()); // Only perform the default action if a single node is selected.

    if (singleSelectedNode != null && !singleSelectedNode.isContainer) {
      // for: is this feature used enough to justify uncollapsing?
      (0, _nuclideAnalytics().track)('filetree-split-file', {
        orientation,
        side
      });
      return Actions().openEntrySplit(singleSelectedNode.uri, orientation, side);
    }
  }).filter(Boolean);
}

function removeRootFolderSelection(actions, store) {
  return actions.ofType(Actions().REMOVE_ROOT_FOLDER_SELECTION).do(() => {
    const rootNode = Selectors().getSingleSelectedNode(store.getState());

    if (rootNode != null && rootNode.isRoot) {
      logger.info('Removing project path via file tree', rootNode);
      (0, _removeProjectPath().default)(rootNode.uri);
    }
  }).ignoreElements();
}

function copyFilenamesWithDir(actions, store) {
  return actions.ofType(Actions().COPY_FILENAMES_WITH_DIR).do(() => {
    const nodes = Selectors().getSelectedNodes(store.getState());
    const dirs = [];
    const files = [];

    for (const node of nodes) {
      const file = FileTreeHelpers().getFileByKey(node.uri);

      if (file != null) {
        files.push(file);
      }

      const dir = FileTreeHelpers().getDirectoryByKey(node.uri);

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
    } // copy this text in case user pastes into a text area


    const copyNames = entries.map(e => encodeURIComponent(e.getBaseName())).join();
    atom.clipboard.write(copyNames, {
      directory: FileTreeHelpers().dirPathToKey(dirPath),
      filenames: files.map(f => f.getBaseName()),
      dirnames: dirs.map(f => f.getBaseName())
    });
  }).ignoreElements();
}

function openAddFolderDialogEpic(actions, store) {
  return actions.ofType(Actions().OPEN_ADD_FOLDER_DIALOG).do(action => {
    if (!(action.type === Actions().OPEN_ADD_FOLDER_DIALOG)) {
      throw new Error("Invariant violation: \"action.type === Actions.OPEN_ADD_FOLDER_DIALOG\"");
    }

    const {
      onDidConfirm
    } = action;
    const node = getSelectedContainerNode(store.getState());

    if (!node) {
      return;
    }

    openAddDialog('folder', node.localPath + '/', async (filePath, options) => {
      // Prevent submission of a blank field from creating a directory.
      if (filePath === '') {
        return;
      } // TODO: check if filePath is in rootKey and if not, find the rootKey it belongs to.


      const directory = FileTreeHelpers().getDirectoryByKey(node.uri);

      if (directory == null) {
        return;
      }

      const {
        path
      } = _nuclideUri().default.parse(filePath);

      const basename = _nuclideUri().default.basename(path);

      const newDirectory = directory.getSubdirectory(basename);
      let created;

      try {
        created = await newDirectory.create();
      } catch (e) {
        atom.notifications.addError(`Could not create directory '${basename}': ${e.toString()}`);
        onDidConfirm(null);
        return;
      }

      if (!created) {
        atom.notifications.addError(`'${basename}' already exists.`);
        onDidConfirm(null);
      } else {
        onDidConfirm(newDirectory.getPath());
      }
    });
  }).ignoreElements();
}

function openAddFileDialogEpic(actions, store) {
  return actions.ofType(Actions().OPEN_ADD_FILE_DIALOG).do(action => {
    if (!(action.type === Actions().OPEN_ADD_FILE_DIALOG)) {
      throw new Error("Invariant violation: \"action.type === Actions.OPEN_ADD_FILE_DIALOG\"");
    }

    const {
      onDidConfirm
    } = action;
    const node = getSelectedContainerNode(store.getState());

    if (!node) {
      return;
    }

    openAddFileDialogImpl(node, node.localPath, node.uri, onDidConfirm);
  }).ignoreElements();
}

function openAddFileDialogRelativeEpic(actions, store) {
  return actions.ofType(Actions().OPEN_ADD_FILE_DIALOG_RELATIVE).do(action => {
    if (!(action.type === Actions().OPEN_ADD_FILE_DIALOG_RELATIVE)) {
      throw new Error("Invariant violation: \"action.type === Actions.OPEN_ADD_FILE_DIALOG_RELATIVE\"");
    }

    const {
      onDidConfirm
    } = action;
    const editor = atom.workspace.getActiveTextEditor();
    const filePath = editor != null ? editor.getPath() : null; // flowlint-next-line sketchy-null-string:off

    if (!filePath) {
      return;
    }

    const dirPath = FileTreeHelpers().getParentKey(filePath);
    const rootNode = Selectors().getRootForPath(store.getState(), dirPath);

    if (rootNode) {
      const localPath = _nuclideUri().default.isRemote(dirPath) ? _nuclideUri().default.parse(dirPath).path : dirPath;
      openAddFileDialogImpl(rootNode, FileTreeHelpers().keyToPath(localPath), dirPath, onDidConfirm);
    }
  }).ignoreElements();
}

function openRenameDialogEpic(actions, store) {
  return actions.ofType(Actions().OPEN_RENAME_DIALOG).do(() => {
    const targetNodes = Selectors().getTargetNodes(store.getState());

    if (targetNodes.size !== 1) {
      // Can only rename one entry at a time.
      return;
    }

    const node = targetNodes.first();

    if (!(node != null)) {
      throw new Error("Invariant violation: \"node != null\"");
    }

    const nodePath = node.localPath;
    (0, _FileActionModal().openDialog)({
      iconClassName: 'icon-arrow-right',
      initialValue: nodePath,
      message: node.isContainer ? React.createElement("span", null, "Enter the new path for the directory.") : React.createElement("span", null, "Enter the new path for the file."),
      onConfirm: (newPath, options) => {
        renameNode(node, nodePath, newPath).catch(error => {
          atom.notifications.addError(`Rename to ${newPath} failed: ${error.message}`);
        });
      },
      onClose: _FileActionModal().closeDialog,
      selectBasename: true
    });
  }).ignoreElements();
}

function openDuplicateDialogEpic(actions, store) {
  return actions.ofType(Actions().OPEN_DUPLICATE_DIALOG).map(action => {
    if (!(action.type === Actions().OPEN_DUPLICATE_DIALOG)) {
      throw new Error("Invariant violation: \"action.type === Actions.OPEN_DUPLICATE_DIALOG\"");
    }

    const {
      onDidConfirm
    } = action;
    const targetNodes = Selectors().getTargetNodes(store.getState());
    return Actions().openNextDuplicateDialog(targetNodes, onDidConfirm);
  });
}

function openNextDuplicateDialogEpic(actions, store) {
  return actions.ofType(Actions().OPEN_NEXT_DUPLICATE_DIALOG).do(action => {
    if (!(action.type === Actions().OPEN_NEXT_DUPLICATE_DIALOG)) {
      throw new Error("Invariant violation: \"action.type === Actions.OPEN_NEXT_DUPLICATE_DIALOG\"");
    }

    const {
      nodes,
      onDidConfirm
    } = action;
    const node = nodes.first();

    if (!(node != null)) {
      throw new Error("Invariant violation: \"node != null\"");
    }

    const nodePath = (0, _nullthrows().default)(node).localPath;

    let initialValue = _nuclideUri().default.basename(nodePath);

    const ext = _nuclideUri().default.extname(nodePath);

    initialValue = initialValue.substr(0, initialValue.length - ext.length) + '-copy' + ext;
    const hgRepository = FileTreeHgHelpers().getHgRepositoryForNode(node);
    const additionalOptions = {}; // eslint-disable-next-line eqeqeq

    if (hgRepository !== null) {
      additionalOptions.addToVCS = 'Add the new file to version control.';
    }

    const dialogProps = {
      iconClassName: 'icon-arrow-right',
      initialValue,
      message: React.createElement("span", null, "Enter the new path for the duplicate."),
      onConfirm: (newBasename, options) => {
        const file = FileTreeHelpers().getFileByKey(node.uri);

        if (file == null) {
          // TODO: Connection could have been lost for remote file.
          return;
        }

        duplicate(file, newBasename.trim(), Boolean(options.addToVCS), onDidConfirm).catch(error => {
          atom.notifications.addError(`Failed to duplicate '${file.getPath()}'`);
        });
      },
      onClose: () => {
        if (nodes.rest().count() > 0) {
          store.dispatch(Actions().openNextDuplicateDialog(nodes.rest(), onDidConfirm));
        } else {
          (0, _FileActionModal().closeDialog)();
        }
      },
      selectBasename: true,
      additionalOptions
    };
    (0, _FileActionModal().openDialog)(dialogProps);
  }).ignoreElements();
}

function openPasteDialogEpic(actions, store) {
  return actions.ofType(Actions().OPEN_PASTE_DIALOG).do(() => {
    const node = Selectors().getSingleSelectedNode(store.getState());

    if (node == null) {
      // don't paste if unselected
      return;
    }

    let newPath = FileTreeHelpers().getDirectoryByKey(node.uri);

    if (newPath == null) {
      // maybe it's a file?
      const file = FileTreeHelpers().getFileByKey(node.uri);

      if (file == null) {
        // nope! do nothing if we can't find an entry
        return;
      }

      newPath = file.getParent();
    }

    const additionalOptions = {}; // eslint-disable-next-line eqeqeq

    if (FileTreeHgHelpers().getHgRepositoryForNode(node) !== null) {
      additionalOptions.addToVCS = 'Add the new file(s) to version control.';
    }

    (0, _FileActionModal().openDialog)(Object.assign({
      iconClassName: 'icon-arrow-right'
    }, getPasteDialogProps(newPath), {
      onConfirm: (pasteDirPath, options) => {
        paste(pasteDirPath.trim(), Boolean(options.addToVCS)).catch(error => {
          atom.notifications.addError(`Failed to paste into '${pasteDirPath}': ${error}`);
        });
      },
      onClose: _FileActionModal().closeDialog,
      additionalOptions
    }));
  }).ignoreElements();
}

function updateWorkingSetEpic(actions, store) {
  return actions.ofType(Actions().WORKING_SET_CHANGE_REQUESTED).do(action => {
    if (!(action.type === Actions().WORKING_SET_CHANGE_REQUESTED)) {
      throw new Error("Invariant violation: \"action.type === Actions.WORKING_SET_CHANGE_REQUESTED\"");
    }

    const {
      workingSet
    } = action; // TODO (T30814717): Make this the default behavior after some research.

    if ((0, _passesGK().isGkEnabled)('nuclide_projects') === true) {
      const prevWorkingSet = Selectors().getWorkingSet(store.getState());
      const prevUris = new Set(prevWorkingSet.getUris());
      const nextUris = new Set(workingSet.getUris());
      const addedUris = (0, _collection().setDifference)(nextUris, prevUris); // Reveal all of the added paths. This is a little gross. The WorkingSetStore API will return
      // absolute paths (`/a/b/c`) for remote directories instead of `nuclide://` URIs. In other
      // words, we don't have enough information to know what paths to reveal. So we'll just try to
      // reveal the path in every root.

      addedUris.forEach(uri => {
        Selectors().getRootKeys(store.getState()).forEach(rootUri => {
          const filePath = _nuclideUri().default.resolve(rootUri, uri);

          const nodeKey = FileTreeHelpers().dirPathToKey(filePath);
          store.dispatch(Actions().revealFilePath(nodeKey, false));

          if (nextUris.size === 1) {
            // There's only a single URI in the working set, expand it.
            store.dispatch(Actions().expandNode(rootUri, nodeKey));
          }
        });
      });
    }

    store.dispatch(Actions().setWorkingSet(workingSet));
  }).ignoreElements();
}

function deleteSelectedNodesEpic(actions, store) {
  return actions.ofType(Actions().DELETE_SELECTED_NODES).mergeMap(async action => {
    if (!(action.type === Actions().DELETE_SELECTED_NODES)) {
      throw new Error("Invariant violation: \"action.type === Actions.DELETE_SELECTED_NODES\"");
    }

    const selectedNodes = Selectors().getSelectedNodes(store.getState());

    try {
      await FileTreeHgHelpers().deleteNodes(selectedNodes.toArray());
      return Actions().clearSelectionRange();
    } catch (e) {
      atom.notifications.addError('Failed to delete entries: ' + e.message);
    }

    return null;
  }).filter(Boolean);
}

function moveToNodeEpic(actions, store) {
  return actions.ofType(Actions().MOVE_TO_NODE).mergeMap(action => {
    if (!(action.type === Actions().MOVE_TO_NODE)) {
      throw new Error("Invariant violation: \"action.type === Actions.MOVE_TO_NODE\"");
    }

    const {
      rootKey,
      nodeKey
    } = action;
    const targetNode = Selectors().getNode(store.getState(), rootKey, nodeKey);

    if (targetNode == null || !targetNode.isContainer) {
      return _rxjsCompatUmdMin.Observable.empty();
    }

    const selectedNodes = Selectors().getSelectedNodes(store.getState()); // This is async but we don't care.

    FileTreeHgHelpers().moveNodes(selectedNodes.toArray(), targetNode.uri);
    return _rxjsCompatUmdMin.Observable.of(Actions().clearDragHover(), Actions().clearSelection());
  });
}

function movePathToNodeEpic(actions, store) {
  return actions.ofType(Actions().MOVE_PATH_TO_NODE).mergeMap(action => {
    if (!(action.type === Actions().MOVE_PATH_TO_NODE)) {
      throw new Error("Invariant violation: \"action.type === Actions.MOVE_PATH_TO_NODE\"");
    }

    const {
      uri,
      destination
    } = action;
    (0, _nuclideAnalytics().track)('file-tree-move-dropped-external-file:started', {
      source: uri,
      destination: destination.uri
    });

    if (!destination.isContainer) {
      (0, _nuclideAnalytics().track)('file-tree-move-dropped-external-file:failed', {
        reason: 'Destination is not a container'
      });
      return _rxjsCompatUmdMin.Observable.empty();
    }

    if (!FileTreeHgHelpers().isValidRename(uri, destination.uri)) {
      const detail = `Unable to move \`${uri}\` to \`${destination.uri}\`.`;
      (0, _nuclideAnalytics().track)('file-tree-move-dropped-external-file:failed', {
        reason: detail
      });
      atom.notifications.addError('File move failed', {
        detail
      });
      return _rxjsCompatUmdMin.Observable.empty();
    }

    const newPath = _nuclideUri().default.join(destination.uri, _nuclideUri().default.basename(uri));

    FileTreeHgHelpers().movePaths([uri], destination.uri).then(() => {
      // Note: While the move is "complete" FileTreeHgHelpers will silently skip
      // files that it does not think it can move, and will noop if another move
      // is already in progress.
      (0, _nuclideAnalytics().track)('file-tree-move-dropped-external-file:completed', {
        source: uri,
        destination: destination.uri
      });
      EpicHelpers().ensureChildNode(store, newPath);
    });
    return _rxjsCompatUmdMin.Observable.of(Actions().clearDragHover(), Actions().clearSelection());
  });
}

function expandNodeEpic(actions, store) {
  return actions.ofType(Actions().EXPAND_NODE).do(action => {
    if (!(action.type === Actions().EXPAND_NODE)) {
      throw new Error("Invariant violation: \"action.type === Actions.EXPAND_NODE\"");
    }

    const {
      rootKey,
      nodeKey
    } = action;
    EpicHelpers().expandNode(store, rootKey, nodeKey);
  }).ignoreElements();
}

function expandNodeDeepEpic(actions, store) {
  return actions.ofType(Actions().EXPAND_NODE_DEEP).do(action => {
    if (!(action.type === Actions().EXPAND_NODE_DEEP)) {
      throw new Error("Invariant violation: \"action.type === Actions.EXPAND_NODE_DEEP\"");
    }

    const {
      rootKey,
      nodeKey
    } = action;
    EpicHelpers().expandNodeDeep(store, rootKey, nodeKey);
  }).ignoreElements();
}

function reorderRootsEpic(actions, store) {
  return actions.ofType(Actions().REORDER_ROOTS).do(action => {
    if (!(action.type === Actions().REORDER_ROOTS)) {
      throw new Error("Invariant violation: \"action.type === Actions.REORDER_ROOTS\"");
    }

    const rootKeys = Selectors().getRootKeys(store.getState());
    const rps = this._reorderPreviewStatus;

    if (rps == null) {
      return;
    }

    const sourceIdx = rps.sourceIdx;
    const targetIdx = rps.targetIdx;

    if (targetIdx == null || sourceIdx === targetIdx) {
      return;
    }

    rootKeys.splice(sourceIdx, 1);
    rootKeys.splice(targetIdx, 0, rps.source);
    EpicHelpers().setRootKeys(store, rootKeys);
  }).ignoreElements();
} // FIXME: Most of this is just synchronous stuff that should be moved into the initial store state.
// The only sticking point is the async call to `fetchChildKeys`, but that can probably be done in
// a second pass after loading?


function loadDataEpic(actions, store) {
  return actions.ofType(Actions().LOAD_DATA).map(action => {
    if (!(action.type === Actions().LOAD_DATA)) {
      throw new Error("Invariant violation: \"action.type === Actions.LOAD_DATA\"");
    }

    const {
      data
    } = action; // Ensure we are not trying to load data from an earlier version of this package.

    if (data.version !== Selectors().getVersion(store.getState())) {
      return null;
    }

    const buildRootNode = rootUri => {
      EpicHelpers().fetchChildKeys(store, rootUri);
      return new (_FileTreeNode().FileTreeNode)({
        uri: rootUri,
        rootUri,
        isExpanded: true,
        isLoading: true,
        children: Immutable().OrderedMap(),
        isCwd: false,
        connectionTitle: FileTreeHelpers().getDisplayTitle(rootUri) || ''
      }, Selectors().getConf(store.getState()));
    };

    const normalizedAtomPaths = atom.project.getPaths().map(_nuclideUri().default.ensureTrailingSeparator);
    const normalizedDataPaths = data.rootKeys.map(_nuclideUri().default.ensureTrailingSeparator).filter(rootUri => _nuclideUri().default.isRemote(rootUri) || normalizedAtomPaths.indexOf(rootUri) >= 0);
    const pathsMissingInData = normalizedAtomPaths.filter(rootUri => normalizedDataPaths.indexOf(rootUri) === -1);
    const combinedPaths = normalizedDataPaths.concat(pathsMissingInData);
    const roots = Immutable().OrderedMap(combinedPaths.map(rootUri => [rootUri, buildRootNode(rootUri)]));
    return Actions().setInitialData({
      roots,
      openFilesExpanded: data.openFilesExpanded,
      uncommittedChangesExpanded: data.uncommittedChangesExpanded,
      foldersExpanded: data.foldersExpanded
    });
  }).filter(Boolean);
}

function updateGeneratedStatusEpic(actions, store) {
  return _rxjsCompatUmdMin.Observable.merge(actions.ofType(Actions().SET_OPEN_FILES_WORKING_SET).map(action => {
    if (!(action.type === Actions().SET_OPEN_FILES_WORKING_SET)) {
      throw new Error("Invariant violation: \"action.type === Actions.SET_OPEN_FILES_WORKING_SET\"");
    }

    return action.openFilesWorkingSet.getAbsoluteUris();
  }), actions.ofType(Actions().SET_VCS_STATUSES).map(action => {
    if (!(action.type === Actions().SET_VCS_STATUSES)) {
      throw new Error("Invariant violation: \"action.type === Actions.SET_VCS_STATUSES\"");
    }

    return [...action.vcsStatuses.keys()];
  })).mergeMap(async filesToCheck => {
    const generatedPromises = new Map();

    for (const file of filesToCheck) {
      if (!generatedPromises.has(file)) {
        const promise = (0, _nuclideRemoteConnection().awaitGeneratedFileServiceByNuclideUri)(file).then(gfs => gfs.getGeneratedFileType(file)).then(type => [file, type]);
        generatedPromises.set(file, promise);
      }
    }

    const generatedFileTypes = await Promise.all(Array.from(generatedPromises.values()));
    return Actions().updateGeneratedStatuses(new Map(generatedFileTypes));
  });
}

function uploadDroppedFilesEpic(actions, store) {
  return actions.ofType(Actions().UPLOAD_DROPPED_FILES).mergeMap(action => {
    if (!(action.type === 'UPLOAD_DROPPED_FILES')) {
      throw new Error("Invariant violation: \"action.type === 'UPLOAD_DROPPED_FILES'\"");
    }

    const {
      destination
    } = action;
    const {
      remoteTransferService
    } = store.getState();

    if (remoteTransferService == null || !destination.isContainer) {
      return _rxjsCompatUmdMin.Observable.empty();
    } // > Electron has added a path attribute to the File interface which exposes
    // > the file's real path on filesystem.
    // -- https://electronjs.org/docs/api/file-object
    // $FlowFixMe


    const files = Array.from(action.files).map(file => file.path);
    (0, _nuclideAnalytics().track)('file-tree-upload-dropped-files', {
      count: files.length
    });
    return _rxjsCompatUmdMin.Observable.concat(_rxjsCompatUmdMin.Observable.of(Actions().clearDragHover(), Actions().clearSelection()), _rxjsCompatUmdMin.Observable.fromPromise(remoteTransferService.uploadFiles(files, destination.uri)).mapTo(Actions().expandNode(destination.rootUri, destination.uri)));
  });
} //
// Helper functions
//

/**
 * A flow-friendly way of filtering out null keys.
 */


function omitNullKeys(map) {
  return map.filter((v, k) => k != null);
}
/**
 * Fetches a consistent object map from absolute file paths to
 * their corresponding `StatusCodeNumber` for easy representation with the file tree.
 */


function getCachedPathStatusesForGitRepo(repo) {
  const gitRepo = repo;
  const {
    statuses
  } = gitRepo;
  const internalGitRepo = gitRepo.getRepo();
  const codePathStatuses = new Map();
  const repoRoot = repo.getWorkingDirectory(); // Transform `git` bit numbers to `StatusCodeNumber` format.

  const {
    StatusCodeNumber
  } = _nuclideHgRpc().hgConstants;

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
      (0, _log4js().getLogger)('nuclide-file-tree').warn(`Unrecognized git status number ${gitStatusNumber}`);
      statusCode = StatusCodeNumber.MODIFIED;
    }

    codePathStatuses.set(_nuclideUri().default.join(repoRoot, relativePath), statusCode);
  }

  return codePathStatuses;
}

function getSelectedContainerNode(state) {
  /*
   * TODO: Choosing the last selected key is inexact when there is more than 1 root. The Set of
   * selected keys should be maintained as a flat list across all roots to maintain insertion
   * order.
   */
  const node = Selectors().getSelectedNodes(state).first();

  if (node) {
    return node.isContainer ? node : node.parent;
  }

  return null;
}

function openAddDialog(entryType, path, onConfirm, additionalOptions = {}) {
  (0, _FileActionModal().openDialog)({
    iconClassName: 'icon-file-add',
    message: React.createElement("span", null, "Enter the path for the new ", entryType, " in the root:", React.createElement("br", null), path),
    onConfirm,
    onClose: _FileActionModal().closeDialog,
    additionalOptions
  });
}

function openAddFileDialogImpl(rootNode, localPath, filePath, onDidConfirm) {
  const hgRepository = FileTreeHgHelpers().getHgRepositoryForNode(rootNode);
  const additionalOptions = {};

  if (hgRepository != null) {
    additionalOptions.addToVCS = 'Add the new file to version control.';
  }

  openAddDialog('file', _nuclideUri().default.ensureTrailingSeparator(localPath), async (pathToCreate, options) => {
    // Prevent submission of a blank field from creating a file.
    if (pathToCreate === '') {
      return;
    } // TODO: check if pathToCreate is in rootKey and if not, find the rootKey it belongs to.


    const directory = FileTreeHelpers().getDirectoryByKey(filePath);

    if (directory == null) {
      return;
    }

    const newFile = directory.getFile(pathToCreate);
    let created;

    try {
      created = await newFile.create();
    } catch (e) {
      atom.notifications.addError(`Could not create file '${newFile.getPath()}': ${e.toString()}`);
      onDidConfirm(null);
      return;
    }

    if (!created) {
      atom.notifications.addError(`'${pathToCreate}' already exists.`);
      onDidConfirm(null);
      return;
    }

    const newFilePath = newFile.getPath(); // Open a new text editor while VCS actions complete in the background.

    onDidConfirm(newFilePath);

    if (hgRepository != null && options.addToVCS === true) {
      try {
        await hgRepository.addAll([newFilePath]);
      } catch (e) {
        atom.notifications.addError(`Failed to add '${newFilePath}' to version control. Error: ${e.toString()}`);
      }
    }
  }, additionalOptions);
}

async function renameNode(node, nodePath, destPath) {
  /*
   * Use `resolve` to strip trailing slashes because renaming a file to a name with a
   * trailing slash is an error.
   */
  let newPath = _nuclideUri().default.resolve(destPath.trim()); // Create a remote nuclide uri when the node being moved is remote.


  if (_nuclideUri().default.isRemote(node.uri)) {
    newPath = _nuclideUri().default.createRemoteUri(_nuclideUri().default.getHostname(node.uri), newPath);
  }

  await FileTreeHgHelpers().renameNode(node, newPath);
}

async function duplicate(file, newBasename, addToVCS, onDidConfirm) {
  const directory = file.getParent();
  const newFile = directory.getFile(newBasename);
  return copy([{
    old: file.getPath(),
    new: newFile.getPath()
  }], addToVCS, onDidConfirm);
}

async function copy(copyPaths, addToVCS, onDidConfirm) {
  const copiedPaths = await Promise.all(copyPaths.filter(({
    old: oldPath,
    new: newPath
  }) => _nuclideUri().default.getHostnameOpt(oldPath) === _nuclideUri().default.getHostnameOpt(newPath)).map(async ({
    old: oldPath,
    new: newPath
  }) => {
    const service = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(newPath);
    const isFile = (await service.stat(oldPath)).isFile();
    const exists = isFile ? !(await service.copy(oldPath, newPath)) : !(await service.copyDir(oldPath, newPath));

    if (exists) {
      atom.notifications.addError(`'${newPath}' already exists.`);
      return [];
    } else {
      return [newPath];
    }
  }));
  const successfulPaths = [].concat(...copiedPaths);
  onDidConfirm(successfulPaths);

  if (successfulPaths.length !== 0) {
    const hgRepository = FileTreeHgHelpers().getHgRepositoryForPath(successfulPaths[0]);

    if (hgRepository != null && addToVCS) {
      try {
        // We are not recording the copy in mercurial on purpose, because most of the time
        // it's either templates or files that have greatly changed since duplicating.
        await hgRepository.addAll(successfulPaths);
      } catch (e) {
        const message = 'Paths were duplicated, but there was an error adding them to ' + 'version control.  Error: ' + e.toString();
        atom.notifications.addError(message);
        return;
      }
    }
  }
}

async function paste(newPath, addToVCS, onDidConfirm = () => {}) {
  const copyPaths = [];
  const cb = atom.clipboard.readWithMetadata();
  const oldDir = getDirectoryFromMetadata(cb.metadata);

  if (oldDir == null) {
    // bad source
    return;
  }

  const filenames = cb.text.split(',');
  const newFile = FileTreeHelpers().getFileByKey(newPath);
  const newDir = FileTreeHelpers().getDirectoryByKey(newPath);

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
      copyPaths.push({
        old: origFilePath,
        new: destFilePath
      });
    } else if (newDir != null) {
      // single file on clibboard; Path resolves to a folder.
      // => copy old file into new newDir folder
      const destFilePath = newDir.getFile(cb.text).getPath();
      copyPaths.push({
        old: origFilePath,
        new: destFilePath
      });
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
      copyPaths.push({
        old: origFilePath,
        new: destFilePath
      });
    });
  }

  await copy(copyPaths, addToVCS, onDidConfirm);
}

function getDirectoryFromMetadata(cbMeta) {
  if (cbMeta == null || typeof cbMeta !== 'object' || cbMeta.directory == null || typeof cbMeta.directory !== 'string') {
    return null;
  }

  return FileTreeHelpers().getDirectoryByKey(cbMeta.directory);
} // provide appropriate UI feedback depending on whether user
// has single or multiple files in the clipboard


function getPasteDialogProps(path) {
  const cb = atom.clipboard.readWithMetadata();
  const filenames = cb.text.split(',');

  if (filenames.length === 1) {
    return {
      initialValue: path.getFile(cb.text).getPath(),
      message: React.createElement("span", null, "Paste file from clipboard into")
    };
  } else {
    return {
      initialValue: FileTreeHelpers().dirPathToKey(path.getPath()),
      message: React.createElement("span", null, "Paste files from clipboard into the following folder")
    };
  }
}