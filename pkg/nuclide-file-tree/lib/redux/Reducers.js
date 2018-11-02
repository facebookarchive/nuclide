"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.DEFAULT_CONF = void 0;

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

function _FileTreeNode() {
  const data = require("../FileTreeNode");

  _FileTreeNode = function () {
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

function _nuclideVcsBase() {
  const data = require("../../../nuclide-vcs-base");

  _nuclideVcsBase = function () {
    return data;
  };

  return data;
}

function _FileTreeFilterHelper() {
  const data = require("../FileTreeFilterHelper");

  _FileTreeFilterHelper = function () {
    return data;
  };

  return data;
}

function _minimatch() {
  const data = require("minimatch");

  _minimatch = function () {
    return data;
  };

  return data;
}

function _hgConstants() {
  const data = require("../../../nuclide-hg-rpc/lib/hg-constants");

  _hgConstants = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideWorkingSetsCommon() {
  const data = require("../../../nuclide-working-sets-common");

  _nuclideWorkingSetsCommon = function () {
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

function _FileTreeSelectionRange() {
  const data = require("../FileTreeSelectionRange");

  _FileTreeSelectionRange = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("../redux/Actions"));

  Actions = function () {
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
// $FlowFixMe(>=0.53.0) Flow suppress
const DEFAULT_CONF = {
  workingSet: new (_nuclideWorkingSetsCommon().WorkingSet)(),
  editedWorkingSet: new (_nuclideWorkingSetsCommon().WorkingSet)(),
  hideIgnoredNames: true,
  excludeVcsIgnoredPaths: true,
  hideVcsIgnoredPaths: true,
  ignoredPatterns: Immutable().Set(),
  isEditingWorkingSet: false,
  openFilesWorkingSet: new (_nuclideWorkingSetsCommon().WorkingSet)(),
  reposByRoot: {}
};
exports.DEFAULT_CONF = DEFAULT_CONF;
const actionTrackers = new Map(); // TODO: Don't `export default` an object.

const {
  updateNodeAtRoot,
  updateNodeAtAllRoots
} = FileTreeHelpers();
const logger = (0, _log4js().getLogger)('nuclide-file-tree');
const DEFAULT_STATE = {
  // Used to ensure the version we serialized is the same version we are deserializing.
  VERSION: 1,
  _roots: Immutable().OrderedMap(),
  _fileChanges: Immutable().Map(),
  _generatedOpenChangedFiles: Immutable().Map(),
  _reorderPreviewStatus: null,
  _usePrefixNav: false,
  _autoExpandSingleChild: true,
  _isLoadingMap: Immutable().Map(),
  _repositories: Immutable().Set(),
  _conf: Object.assign({}, DEFAULT_CONF),
  _workingSetsStore: null,
  _filter: '',
  _extraProjectSelectionContent: Immutable().List(),
  _foldersExpanded: true,
  _openFilesExpanded: true,
  _uncommittedChangesExpanded: true,
  _selectionRange: null,
  _targetNodeKeys: null,
  _isCalculatingChanges: false,
  _maxComponentWidth: -1,
  _selectedUris: new (Immutable().Map)(),
  _focusedUris: new (Immutable().Map)(),
  _cwdApi: null,
  _cwdKey: null,
  _trackedRootKey: null,
  _trackedNodeKey: null,
  remoteTransferService: null,
  vcsStatuses: Immutable().Map(),
  usePreviewTabs: false,
  focusEditorOnFileSelection: true
};

function reduceState(state_, action) {
  const state = state_ || DEFAULT_STATE;

  switch (action.type) {
    case Actions().SET_INITIAL_DATA:
      return setInitialData(state, action.data);

    case Actions().CLEAR_SELECTION_RANGE:
      return clearSelectionRange(state);

    case Actions().CLEAR_DRAG_HOVER:
      return clearDragHover(state);

    case Actions().CLEAR_SELECTION:
      return clearSelection(state);

    case Actions().SET_CWD:
      return setCwdKey(state, action.rootKey);

    case Actions().SET_CWD_API:
      return setCwdApi(state, action.cwdApi);

    case Actions().SET_TRACKED_NODE:
      return setTrackedNode(state, action.rootKey, action.nodeKey);

    case Actions().CLEAR_TRACKED_NODE:
      return clearTrackedNode(state);

    case Actions().CLEAR_TRACKED_NODE_IF_NOT_LOADING:
      return clearTrackedNodeIfNotLoading(state);

    case Actions().START_REORDER_DRAG:
      return startReorderDrag(state, action.draggedRootKey);

    case Actions().END_REORDER_DRAG:
      return endReorderDrag(state);

    case Actions().REORDER_DRAG_INTO:
      return reorderDragInto(state, action.dragTargetNodeKey);

    case Actions().COLLAPSE_NODE:
      return collapseNode(state, action.rootKey, action.nodeKey);

    case Actions().SET_EXCLUDE_VCS_IGNORED_PATHS:
      return setExcludeVcsIgnoredPaths(state, action.excludeVcsIgnoredPaths);

    case Actions().SET_HIDE_VCS_IGNORED_PATHS:
      return setHideVcsIgnoredPaths(state, action.hideVcsIgnoredPaths);

    case Actions().SET_USE_PREVIEW_TABS:
      return setUsePreviewTabs(state, action.usePreviewTabs);

    case Actions().SET_FOCUS_EDITOR_ON_FILE_SELECTION:
      return setFocusEditorOnFileSelection(state, action.focusEditorOnFileSelection);

    case Actions().SET_USE_PREFIX_NAV:
      return setUsePrefixNav(state, action.usePrefixNav);

    case Actions().SET_AUTO_EXPAND_SINGLE_CHILD:
      return setAutoExpandSingleChild(state, action.autoExpandSingleChild);

    case Actions().COLLAPSE_NODE_DEEP:
      return collapseNodeDeep(state, action.rootKey, action.nodeKey);

    case Actions().SET_HIDE_IGNORED_NAMES:
      return setHideIgnoredNames(state, action.hideIgnoredNames);

    case Actions().SET_IS_CALCULATING_CHANGES:
      return setIsCalculatingChanges(state, action.isCalculatingChanges);

    case Actions().SET_IGNORED_NAMES:
      return setIgnoredNames(state, action.ignoredNames);

    case Actions().SET_VCS_STATUSES:
      return setVcsStatuses(state, action.rootKey, action.vcsStatuses);

    case Actions().SET_REPOSITORIES:
      return setRepositories(state, action.repositories);

    case Actions().SET_WORKING_SET:
      return setWorkingSet(state, action.workingSet);

    case Actions().SET_OPEN_FILES_WORKING_SET:
      return setOpenFilesWorkingSet(state, action.openFilesWorkingSet);

    case Actions().SET_WORKING_SETS_STORE:
      return setWorkingSetsStore(state, action.workingSetsStore);

    case Actions().START_EDITING_WORKING_SET:
      return startEditingWorkingSet(state, action.editedWorkingSet);

    case Actions().FINISH_EDITING_WORKING_SET:
      return finishEditingWorkingSet(state);

    case Actions().CHECK_NODE:
      return checkNode(state, action.rootKey, action.nodeKey);

    case Actions().UNCHECK_NODE:
      return uncheckNode(state, action.rootKey, action.nodeKey);

    case Actions().SET_DRAG_HOVERED_NODE:
      return setDragHoveredNode(state, action.rootKey, action.nodeKey);

    case Actions().UNHOVER_NODE:
      return unhoverNode(state, action.rootKey, action.nodeKey);

    case Actions().SET_SELECTED_NODE:
      return setSelectedNode(state, action.rootKey, action.nodeKey);

    case Actions().SET_FOCUSED_NODE:
      return setFocusedNode(state, action.rootKey, action.nodeKey);

    case Actions().ADD_SELECTED_NODE:
      return addSelectedNode(state, action.rootKey, action.nodeKey);

    case Actions().UNSELECT_NODE:
      return unselectNode(state, action.rootKey, action.nodeKey);

    case Actions().MOVE_SELECTION_UP:
      return moveSelectionUp(state);

    case Actions().RANGE_SELECT_TO_NODE:
      return rangeSelectToNode(state, action.rootKey, action.nodeKey);

    case Actions().RANGE_SELECT_UP:
      return rangeSelectMove(state, 'up');

    case Actions().RANGE_SELECT_DOWN:
      return rangeSelectMove(state, 'down');

    case Actions().MOVE_SELECTION_DOWN:
      return moveSelectionDown(state);

    case Actions().MOVE_SELECTION_TO_TOP:
      return moveSelectionToTop(state);

    case Actions().MOVE_SELECTION_TO_BOTTOM:
      return moveSelectionToBottom(state);

    case Actions().CLEAR_FILTER:
      return clearFilter(state);

    case Actions().ADD_EXTRA_PROJECT_SELECTION_CONTENT:
      return addExtraProjectSelectionContent(state, action.content);

    case Actions().REMOVE_EXTRA_PROJECT_SELECTION_CONTENT:
      return removeExtraProjectSelectionContent(state, action.content);

    case Actions().SET_OPEN_FILES_EXPANDED:
      return setOpenFilesExpanded(state, action.openFilesExpanded);

    case Actions().SET_UNCOMMITTED_CHANGES_EXPANDED:
      return setUncommittedChangesExpanded(state, action.uncommittedChangesExpanded);

    case Actions().SET_FOLDERS_EXPANDED:
      return setFoldersExpanded(state, action.foldersExpanded);

    case Actions().INVALIDATE_REMOVED_FOLDER:
      return invalidateRemovedFolder(state);

    case Actions().SET_TARGET_NODE:
      return setTargetNode(state, action.rootKey, action.nodeKey);

    case Actions().UPDATE_GENERATED_STATUSES:
      const {
        generatedFileTypes
      } = action;
      return Object.assign({}, state, {
        _generatedOpenChangedFiles: state._generatedOpenChangedFiles.merge(generatedFileTypes) // just drop any non-generated files from the map
        .filter(value => value !== 'manual')
      });

    case Actions().ADD_FILTER_LETTER:
      return addFilterLetter(state, action.letter);

    case Actions().REMOVE_FILTER_LETTER:
      return removeFilterLetter(state);

    case Actions().SET_ROOTS:
      return setRoots(state, action.roots);

    case Actions().CLEAR_LOADING:
      return Object.assign({}, state, {
        _isLoadingMap: state._isLoadingMap.delete(action.nodeKey)
      });

    case Actions().SET_LOADING:
      return Object.assign({}, state, {
        _isLoadingMap: state._isLoadingMap.set(action.nodeKey, action.promise)
      });

    case Actions().GOT_REMOTE_TRANSFER_SERVICE:
      return Object.assign({}, state, {
        remoteTransferService: action.remoteTransferService
      });

    case Actions().SELECT:
      return Object.assign({}, state, {
        _selectedUris: addNodes(state._selectedUris, [action.node])
      });

    case Actions().UNSELECT:
      return Object.assign({}, state, {
        _selectedUris: deleteNodes(state._selectedUris, [action.node])
      });

    case Actions().CLEAR_SELECTED:
      return clearSelected(state);

    case Actions().FOCUS:
      return Object.assign({}, state, {
        _focusedUris: addNodes(state._focusedUris, [action.node])
      });

    case Actions().UNFOCUS:
      return Object.assign({}, state, {
        _focusedUris: deleteNodes(state._focusedUris, [action.node])
      });

    case Actions().CLEAR_FOCUSED:
      return clearFocused(state);

    default:
      break;
  }

  return state;
}

function _default(state, action) {
  const {
    performance
  } = global;
  const start = performance.now();
  const nextState = reduceState(state, action);
  const end = performance.now();
  let tracker = actionTrackers.get(action.type);

  if (tracker == null) {
    tracker = new (_nuclideAnalytics().HistogramTracker)(`file-tree-action:${action.type}`, 1000, 10);
    actionTrackers.set(action.type, tracker);
  }

  tracker.track(end - start);
  return nextState;
}

function setInitialData(state, data) {
  const nextState = Object.assign({}, state);

  if (data.openFilesExpanded != null) {
    nextState._openFilesExpanded = data.openFilesExpanded;
  }

  if (data.uncommittedChangesExpanded != null) {
    nextState._uncommittedChangesExpanded = data.uncommittedChangesExpanded;
  }

  if (data.foldersExpanded != null) {
    nextState._foldersExpanded = data.foldersExpanded;
  }

  return setRoots(nextState, data.roots);
}
/**
 * Updates the roots, maintains their sibling relationships and fires the change event.
 */


function setRoots(state, roots) {
  // Explicitly test for the empty case, otherwise configuration changes with an empty
  // tree will not emit changes.
  const changed = !Immutable().is(roots, state._roots) || roots.isEmpty();

  if (!changed) {
    return state;
  }

  const nextState = Object.assign({}, state);
  nextState._roots = roots;
  let prevRoot = null;
  roots.forEach(r => {
    r.prevSibling = prevRoot;

    if (prevRoot != null) {
      prevRoot.nextSibling = r;
    }

    prevRoot = r;
  });

  if (prevRoot != null) {
    prevRoot.nextSibling = null;
  }

  return nextState;
}

function clearSelectionRange(state) {
  return Object.assign({}, state, {
    _selectionRange: null,
    _targetNodeKeys: null
  });
}

function clearDragHover(state) {
  const getNodeContainsDragHover = Selectors().getNodeContainsDragHover(state);
  return updateRoots(state, root => {
    return root.setRecursive(node => getNodeContainsDragHover(node) ? null : node, node => node.setIsDragHovered(false));
  });
}
/**
 * Use the update function to update one or more of the roots in the file tree
 */


function updateRoots(state, update) {
  return setRoots(state, state._roots.map(update));
} // Clear selections and focuses on all nodes except an optionally specified
// current node.


function clearSelection(state) {
  return clearSelected(clearFocused(clearSelectionRange(state)));
}

function clearSelected(state) {
  return Object.assign({}, state, {
    _selectedUris: Immutable().Map()
  });
}

function clearFocused(state) {
  return Object.assign({}, state, {
    _focusedUris: Immutable().Map()
  });
}

function setCwdKey(state, cwdKey) {
  let nextState = Object.assign({}, state);
  const currentCwdKey = state._cwdKey;

  if (currentCwdKey != null) {
    nextState = setRoots(nextState, updateNodeAtAllRoots(nextState._roots, currentCwdKey, node => node.setIsCwd(false)));
  }

  nextState._cwdKey = cwdKey;

  if (cwdKey != null) {
    nextState = setRoots(nextState, updateNodeAtAllRoots(nextState._roots, cwdKey, node => node.setIsCwd(true)));
  }

  return nextState;
}

function setCwdApi(state, cwdApi) {
  return Object.assign({}, state, {
    _cwdApi: cwdApi
  });
}

function setTrackedNode(state, rootKey, nodeKey) {
  if (state._trackedRootKey !== rootKey || state._trackedNodeKey !== nodeKey) {
    return Object.assign({}, state, {
      _trackedRootKey: rootKey,
      _trackedNodeKey: nodeKey
    });
  }

  return state;
}

function clearTrackedNode(state) {
  if (state._trackedRootKey != null || state._trackedNodeKey != null) {
    return Object.assign({}, state, {
      _trackedRootKey: null,
      _trackedNodeKey: null
    });
  }

  return state;
}
/**
 * Resets the node to be kept in view if no more data is being awaited. Safe to call many times
 * because it only changes state if a node is being tracked.
 */


function clearTrackedNodeIfNotLoading(state) {
  if (
  /*
     * The loading map being empty is a heuristic for when loading has completed. It is inexact
     * because the loading might be unrelated to the tracked node, however it is cheap and false
     * positives will only last until loading is complete or until the user clicks another node in
     * the tree.
     */
  state._isLoadingMap.isEmpty()) {
    // Loading has completed. Allow scrolling to proceed as usual.
    return clearTrackedNode(state);
  }

  return state;
}

function startReorderDrag(state, draggedRootKey) {
  const rootIdx = Selectors().getRootKeys(state).indexOf(draggedRootKey);

  if (rootIdx === -1) {
    return state;
  }

  const nextState = setRoots(state, updateNodeAtRoot(state._roots, draggedRootKey, draggedRootKey, node => node.setIsBeingReordered(true)));
  return Object.assign({}, nextState, {
    _reorderPreviewStatus: {
      source: draggedRootKey,
      sourceIdx: rootIdx
    }
  });
}

function endReorderDrag(state) {
  if (state._reorderPreviewStatus == null) {
    return state;
  }

  const sourceRootKey = state._reorderPreviewStatus.source;
  const nextState = setRoots(state, updateNodeAtRoot(state._roots, sourceRootKey, sourceRootKey, node => node.setIsBeingReordered(false)));
  return Object.assign({}, nextState, {
    _reorderPreviewStatus: null
  });
}

function reorderDragInto(state, targetRootKey) {
  const reorderPreviewStatus = state._reorderPreviewStatus;
  const targetIdx = Selectors().getRootKeys(state).indexOf(targetRootKey);
  const targetRootNode = Selectors().getNode(state, targetRootKey, targetRootKey);

  if (reorderPreviewStatus == null || targetIdx === -1 || targetRootNode == null) {
    return state;
  }

  let targetNode;

  if (targetIdx <= reorderPreviewStatus.sourceIdx) {
    targetNode = targetRootNode;
  } else {
    targetNode = Selectors().findLastRecursiveChild(state)(targetRootNode);
  }

  return Object.assign({}, state, {
    _reorderPreviewStatus: Object.assign({}, state._reorderPreviewStatus, {
      target: targetNode == null ? undefined : targetNode.uri,
      targetIdx
    })
  });
}

function collapseNode(state, rootKey, nodeKey) {
  const nodesToUnselect = new Set();
  const nextState = setRoots(state, updateNodeAtRoot(state._roots, rootKey, nodeKey, node => {
    // Clear all selected nodes under the node being collapsed and dispose their subscriptions
    return node.setRecursive(childNode => {
      if (childNode.isExpanded) {
        return null;
      }

      return childNode;
    }, childNode => {
      if (childNode.subscription != null) {
        childNode.subscription.dispose();
      }

      if (childNode.uri === node.uri) {
        return childNode.set({
          isExpanded: false,
          subscription: null
        });
      } else {
        nodesToUnselect.add(childNode);
        return childNode.set({
          subscription: null
        });
      }
    });
  }));
  let nextSelectedUris = nextState._selectedUris;
  nodesToUnselect.forEach(node => {
    nextSelectedUris = deleteNodes(nextSelectedUris, [node]);
  });
  return Object.assign({}, nextState, {
    _selectedUris: nextSelectedUris
  });
}

function setExcludeVcsIgnoredPaths(state, excludeVcsIgnoredPaths) {
  return updateConf(state, conf => {
    conf.excludeVcsIgnoredPaths = excludeVcsIgnoredPaths;
  });
}
/**
 * Update the configuration for the file-tree. The direct writing to the this._conf should be
 * avoided.
 */


function updateConf(state, mutator) {
  const getNodeContainsHidden = Selectors().getNodeContainsHidden(state);
  const nextConf = Object.assign({}, state._conf);
  mutator(nextConf);
  const nodesToUnselect = new Set();
  const nextState = updateRoots(state, root => {
    // TODO: We're no longer changing anything here so we should be using an iteration helper
    // instead of `setRecursive()`
    return root.updateConf(nextConf).setRecursive( // Remove selection from hidden nodes under this root
    node => getNodeContainsHidden(node) ? null : node, node => {
      if (node.shouldBeShown) {
        return node;
      } // The node is hidden - unselect all nodes under it if there are any


      return node.setRecursive(subNode => null, subNode => {
        nodesToUnselect.add(subNode);
        return subNode;
      });
    });
  });
  return Object.assign({}, nextState, {
    _conf: nextConf,
    _selectedUris: deleteNodes(state._selectedUris, nodesToUnselect)
  });
}

function setHideVcsIgnoredPaths(state, hideVcsIgnoredPaths) {
  return updateConf(state, conf => {
    conf.hideVcsIgnoredPaths = hideVcsIgnoredPaths;
  });
}

function setUsePreviewTabs(state, usePreviewTabs) {
  return Object.assign({}, state, {
    usePreviewTabs
  });
}

function setFocusEditorOnFileSelection(state, focusEditorOnFileSelection) {
  return Object.assign({}, state, {
    focusEditorOnFileSelection
  });
}

function setUsePrefixNav(state, usePrefixNav) {
  return Object.assign({}, state, {
    _usePrefixNav: usePrefixNav
  });
}

function setAutoExpandSingleChild(state, autoExpandSingleChild) {
  return Object.assign({}, state, {
    _autoExpandSingleChild: autoExpandSingleChild
  });
}

function collapseNodeDeep(state, rootKey, nodeKey) {
  const nodesToUnselect = new Set();
  const nextState = setRoots(state, updateNodeAtRoot(state._roots, rootKey, nodeKey, node => {
    return node.setRecursive(
    /* prePredicate */
    null, childNode => {
      if (childNode.subscription != null) {
        childNode.subscription.dispose();
      }

      if (childNode.uri !== node.uri) {
        nodesToUnselect.add(childNode);
        return childNode.set({
          isExpanded: false,
          subscription: null
        });
      } else {
        return childNode.set({
          isExpanded: false,
          subscription: null
        });
      }
    });
  }));
  return Object.assign({}, nextState, {
    _selectedUris: deleteNodes(nextState._selectedUris, nodesToUnselect)
  });
}

function setHideIgnoredNames(state, hideIgnoredNames) {
  return updateConf(state, conf => {
    conf.hideIgnoredNames = hideIgnoredNames;
  });
}

function setIsCalculatingChanges(state, isCalculatingChanges) {
  return Object.assign({}, state, {
    _isCalculatingChanges: isCalculatingChanges
  });
}
/**
 * Given a list of names to ignore, compile them into minimatch patterns and
 * update the store with them.
 */


function setIgnoredNames(state, ignoredNames) {
  const ignoredPatterns = Immutable().Set(ignoredNames).map(ignoredName => {
    if (ignoredName === '') {
      return null;
    }

    try {
      return new (_minimatch().Minimatch)(ignoredName, {
        matchBase: true,
        dot: true
      });
    } catch (error) {
      atom.notifications.addWarning(`Error parsing pattern '${ignoredName}' from "Settings" > "Ignored Names"`, {
        detail: error.message
      });
      return null;
    }
  }).filter(pattern => pattern != null);
  return updateConf(state, conf => {
    conf.ignoredPatterns = ignoredPatterns;
  });
}

function setVcsStatuses(state, rootKey, vcsStatuses) {
  // We use file changes for populating the uncommitted list, this is different as compared
  // to what is computed in the vcsStatuses in that it does not need the exact path but just
  // the root folder present in atom and the file name and its status. Another difference is
  // in the terms used for status change, while uncommitted changes needs the HgStatusChange
  // codes the file tree doesn't.
  const nextState = setFileChanges(state, rootKey, vcsStatuses); // We can't build on the child-derived properties to maintain vcs statuses in the entire
  // tree, since the reported VCS status may be for a node that is not yet present in the
  // fetched tree, and so it it can't affect its parents statuses. To have the roots colored
  // consistently we manually add all parents of all of the modified nodes up till the root

  const enrichedVcsStatuses = new Map(vcsStatuses);

  const ensurePresentParents = uri => {
    if (uri === rootKey) {
      return;
    }

    let current = uri;

    while (current !== rootKey) {
      current = FileTreeHelpers().getParentKey(current);

      if (enrichedVcsStatuses.has(current)) {
        return;
      }

      enrichedVcsStatuses.set(current, _hgConstants().StatusCodeNumber.MODIFIED);
    }
  };

  vcsStatuses.forEach((status, uri) => {
    if (status === _hgConstants().StatusCodeNumber.MODIFIED || status === _hgConstants().StatusCodeNumber.ADDED || status === _hgConstants().StatusCodeNumber.REMOVED) {
      try {
        // An invalid URI might cause an exception to be thrown
        ensurePresentParents(uri);
      } catch (e) {
        logger.error(`Error enriching the VCS statuses for ${uri}`, e);
      }
    }
  });
  return Object.assign({}, nextState, {
    vcsStatuses: nextState.vcsStatuses.set(rootKey, enrichedVcsStatuses)
  });
}

function setFileChanges(state, rootKey, vcsStatuses) {
  let fileChanges = Immutable().Map();
  vcsStatuses.forEach((statusCode, filePath) => {
    fileChanges = fileChanges.set(filePath, _nuclideVcsBase().HgStatusToFileChangeStatus[statusCode]);
  });
  return Object.assign({}, state, {
    _fileChanges: state._fileChanges.set(rootKey, fileChanges)
  });
}

function setRepositories(state, repositories) {
  const nextState = Object.assign({}, state, {
    _repositories: repositories
  });
  return updateConf(nextState, conf => {
    const reposByRoot = {};

    state._roots.forEach(root => {
      reposByRoot[root.uri] = (0, _nuclideVcsBase().repositoryForPath)(root.uri);
    });

    conf.reposByRoot = reposByRoot;
  });
}

function setWorkingSet(state, workingSet) {
  return updateConf(state, conf => {
    conf.workingSet = workingSet;
  });
}

function setOpenFilesWorkingSet(state, openFilesWorkingSet) {
  // Optimization: with an empty working set, we don't need a full tree refresh.
  if (state._conf.workingSet.isEmpty()) {
    return Object.assign({}, state, {
      _conf: Object.assign({}, state._conf, {
        openFilesWorkingSet
      })
    });
  }

  return updateConf(state, conf => {
    conf.openFilesWorkingSet = openFilesWorkingSet;
  });
}

function setWorkingSetsStore(state, workingSetsStore) {
  return Object.assign({}, state, {
    _workingSetsStore: workingSetsStore
  });
}

function startEditingWorkingSet(state, editedWorkingSet) {
  return updateConf(state, conf => {
    conf.editedWorkingSet = editedWorkingSet;
    conf.isEditingWorkingSet = true;
  });
}

function finishEditingWorkingSet(state) {
  return updateConf(state, conf => {
    conf.isEditingWorkingSet = false;
    conf.editedWorkingSet = new (_nuclideWorkingSetsCommon().WorkingSet)();
  });
}

function checkNode(state, rootKey, nodeKey) {
  if (!state._conf.isEditingWorkingSet) {
    return state;
  }

  let node = Selectors().getNode(state, rootKey, nodeKey);

  if (node == null) {
    return state;
  }

  let uriToAppend = nodeKey; // Workaround flow's (over)aggressive nullability detection

  const allChecked = nodeParent => {
    return nodeParent.children.every(c => {
      return !c.shouldBeShown || c.checkedStatus === 'checked' || c === node;
    });
  };

  while (node.parent != null && allChecked(node.parent)) {
    node = node.parent;
    uriToAppend = node.uri;
  }

  return updateConf(state, conf => {
    conf.editedWorkingSet = conf.editedWorkingSet.append(uriToAppend);
  });
}

function uncheckNode(state, rootKey, nodeKey) {
  if (!state._conf.isEditingWorkingSet) {
    return state;
  }

  let node = Selectors().getNode(state, rootKey, nodeKey);

  if (node == null) {
    return state;
  }

  const nodesToAppend = [];
  let uriToRemove = nodeKey;

  while (node.parent != null && node.parent.checkedStatus === 'checked') {
    const parent = node.parent; // Workaround flow's (over)aggressive nullability detection

    parent.children.forEach(c => {
      if (c !== node) {
        nodesToAppend.push(c);
      }
    });
    node = parent;
    uriToRemove = node.uri;
  }

  return updateConf(state, conf => {
    const urisToAppend = nodesToAppend.map(n => n.uri);
    conf.editedWorkingSet = conf.editedWorkingSet.remove(uriToRemove).append(...urisToAppend);
  });
}

function setDragHoveredNode(state, rootKey, nodeKey) {
  const nextState = clearDragHover(state);
  return setRoots(nextState, updateNodeAtRoot(state._roots, rootKey, nodeKey, node => node.setIsDragHovered(true)));
}

function unhoverNode(state, rootKey, nodeKey) {
  return setRoots(state, updateNodeAtRoot(state._roots, rootKey, nodeKey, node => node.setIsDragHovered(false)));
}
/**
 * Selects a single node and tracks it.
 */


function setSelectedNode(state, rootKey, nodeKey) {
  let nextState = clearSelection(state);
  nextState = setTrackedNode(nextState, rootKey, nodeKey);
  return addSelectedNode(nextState, rootKey, nodeKey);
}

function setSelectionRange(state, selectionRange) {
  return Object.assign({}, state, {
    _selectionRange: selectionRange,
    _targetNodeKeys: null
  });
}
/**
 * Mark a node that has been focused, similar to selected, but only true after mouseup.
 */


function setFocusedNode(state, rootKey, nodeKey) {
  const node = Selectors().getNode(state, rootKey, nodeKey);

  if (node == null) {
    return state;
  }

  return Object.assign({}, state, {
    _focusedUris: addNodes(state._focusedUris, [node])
  });
}

function addSelectedNode(state, rootKey, nodeKey) {
  const node = Selectors().getNode(state, rootKey, nodeKey);

  if (node == null) {
    return state;
  }

  const nextState = Object.assign({}, state, {
    _selectedUris: addNodes(state._selectedUris, [node])
  });
  return setSelectionRange(nextState, _FileTreeSelectionRange().SelectionRange.ofSingleItem(new (_FileTreeSelectionRange().RangeKey)(rootKey, nodeKey)));
}

function unselectNode(state, rootKey, nodeKey) {
  const node = Selectors().getNode(state, rootKey, nodeKey);

  if (node == null) {
    return state;
  }

  return Object.assign({}, state, {
    _selectedUris: deleteNodes(state._selectedUris, [node]),
    _focusedUris: deleteNodes(state._focusedUris, [node])
  });
}
/**
 * Moves the selection one node up. In case several nodes were selected, the topmost (first in
 * the natural visual order) is considered to be the reference point for the move.
 */


function moveSelectionUp(state) {
  if (state._roots.isEmpty()) {
    return state;
  }

  const selectedNodes = Selectors().getSelectedNodes(state);
  let nodeToSelect;

  if (selectedNodes.isEmpty()) {
    nodeToSelect = Selectors().findLastRecursiveChild(state)((0, _nullthrows().default)(state._roots.last()));
  } else {
    const selectedNode = (0, _nullthrows().default)(selectedNodes.first());
    nodeToSelect = Selectors().findPrevious(state)(selectedNode);
  }

  while (nodeToSelect != null && !nodeToSelect.matchesFilter) {
    nodeToSelect = Selectors().findPrevious(state)(nodeToSelect);
  }

  if (nodeToSelect == null) {
    return state;
  }

  return setSelectedAndFocusedNode(state, nodeToSelect.rootUri, nodeToSelect.uri);
}
/**
 * Selects and focuses a node in one pass.
 */


function setSelectedAndFocusedNode(state, rootKey, nodeKey) {
  const node = Selectors().getNode(state, rootKey, nodeKey);
  let nextState = clearSelection(state);

  if (node != null) {
    nextState = Object.assign({}, nextState, {
      _selectedUris: addNodes(nextState._selectedUris, [node]),
      _focusedUris: addNodes(nextState._focusedUris, [node])
    });
  }

  nextState = setTrackedNode(nextState, rootKey, nodeKey);
  return setSelectionRange(nextState, _FileTreeSelectionRange().SelectionRange.ofSingleItem(new (_FileTreeSelectionRange().RangeKey)(rootKey, nodeKey)));
}
/**
 * Bulk selection based on the range.
 */


function rangeSelectToNode(state, rootKey, nodeKey) {
  const getShownChildrenCount = Selectors().getShownChildrenCount(state);
  const {
    updatedState,
    data
  } = refreshSelectionRange(state);
  let nextState = updatedState;

  if (data == null) {
    return nextState;
  }

  const {
    selectionRange,
    anchorIndex,
    rangeIndex
  } = data;
  let nextRangeNode = Selectors().getNode(nextState, rootKey, nodeKey);

  if (nextRangeNode == null) {
    return nextState;
  }

  const nextRangeIndex = Selectors().getVisualIndex(state)(nextRangeNode);

  if (nextRangeIndex === rangeIndex) {
    return nextState;
  }

  const modMinIndex = Math.min(anchorIndex, rangeIndex, nextRangeIndex);
  const modMaxIndex = Math.max(anchorIndex, rangeIndex, nextRangeIndex);
  let beginIndex = 1;
  const nodesToUnselect = new Set();
  const nodesToSelect = new Set(); // Traverse the tree, determining which nodes to select/focus and unselect/unfocus.
  // TODO: We're no longer actually setting anything in the tree here, just walking it. So don't
  // use `setRecursive()`

  nextState._roots.forEach(rootNode => rootNode.setRecursive( // keep traversing the sub-tree,
  // - if the node is shown, has children, and in the applicable range.
  node => {
    if (!node.shouldBeShown) {
      return node;
    }

    if (getShownChildrenCount(node) === 1) {
      beginIndex++;
      return node;
    }

    const endIndex = beginIndex + getShownChildrenCount(node) - 1;

    if (beginIndex <= modMaxIndex && modMinIndex <= endIndex) {
      beginIndex++;
      return null;
    }

    beginIndex += getShownChildrenCount(node);
    return node;
  }, // flip the isSelected flag accordingly, based on previous and current range.
  node => {
    if (!node.shouldBeShown) {
      return node;
    }

    const curIndex = beginIndex - getShownChildrenCount(node);
    const inOldRange = Math.sign(curIndex - anchorIndex) * Math.sign(curIndex - rangeIndex) !== 1;
    const inNewRange = Math.sign(curIndex - anchorIndex) * Math.sign(curIndex - nextRangeIndex) !== 1;

    if (inOldRange && inNewRange || !inOldRange && !inNewRange) {
      return node;
    } else if (inOldRange && !inNewRange) {
      nodesToUnselect.add(node);
    } else {
      nodesToSelect.add(node);
    }

    return node;
  }));

  nextState = Object.assign({}, nextState, {
    _selectedUris: deleteNodes(addNodes(nextState._selectedUris, nodesToSelect), nodesToUnselect),
    _focusedUris: deleteNodes(addNodes(nextState._focusedUris, nodesToSelect), nodesToUnselect)
  }); // expand the range to merge existing selected nodes.

  const getNextNode = cur => nextRangeIndex < rangeIndex ? Selectors().findPrevious(state)(cur) : Selectors().findNext(state)(cur);

  let probe = getNextNode(nextRangeNode);

  while (probe != null && Selectors().getNodeIsSelected(nextState, probe)) {
    nextRangeNode = probe;
    probe = getNextNode(nextRangeNode);
  }

  return setSelectionRange(nextState, selectionRange.withNewRange(_FileTreeSelectionRange().RangeKey.of(nextRangeNode)));
}

/**
 * Refresh the selection range data.
 * invalidate the data
 * - if anchor node or range node is deleted.
 * - if these two nodes are not selected, and there is no nearby node to fall back to.
 * When this function returns, the selection range always contains valid data.
 */
function refreshSelectionRange(state) {
  const invalidate = () => ({
    updatedState: clearSelectionRange(state),
    data: null
  });

  let selectionRange = state._selectionRange;

  if (selectionRange == null) {
    return invalidate();
  }

  const anchor = selectionRange.anchor();
  const range = selectionRange.range();
  let anchorNode = Selectors().getNode(state, anchor.rootKey(), anchor.nodeKey());
  let rangeNode = Selectors().getNode(state, range.rootKey(), range.nodeKey());

  if (anchorNode == null || rangeNode == null) {
    return invalidate();
  }

  anchorNode = Selectors().getNearbySelectedNode(state, anchorNode);
  rangeNode = Selectors().getNearbySelectedNode(state, rangeNode);

  if (anchorNode == null || rangeNode == null) {
    return invalidate();
  }

  const anchorIndex = Selectors().getVisualIndex(state)(anchorNode);
  const rangeIndex = Selectors().getVisualIndex(state)(rangeNode);
  const direction = rangeIndex > anchorIndex ? 'down' : rangeIndex === anchorIndex ? 'none' : 'up';
  selectionRange = new (_FileTreeSelectionRange().SelectionRange)(_FileTreeSelectionRange().RangeKey.of(anchorNode), _FileTreeSelectionRange().RangeKey.of(rangeNode));
  return {
    updatedState: setSelectionRange(state, selectionRange),
    data: {
      selectionRange,
      anchorNode,
      rangeNode,
      anchorIndex,
      rangeIndex,
      direction
    }
  };
}
/**
 * Move the range of selections by one step.
 */


function rangeSelectMove(state, move) {
  const refreshSelectionRangeResult = refreshSelectionRange(state);
  const {
    data
  } = refreshSelectionRangeResult;
  let nextState = refreshSelectionRangeResult.updatedState;

  if (data == null) {
    return nextState;
  }

  const {
    selectionRange,
    anchorNode,
    rangeNode,
    direction
  } = data;

  const getNextNode = cur => move === 'up' ? Selectors().findPrevious(state)(cur) : Selectors().findNext(state)(cur);

  const isExpanding = direction === move || direction === 'none';

  if (isExpanding) {
    let nextNode = getNextNode(rangeNode);

    while (nextNode != null && Selectors().getNodeIsSelected(state, nextNode)) {
      nextNode = getNextNode(nextNode);
    }

    if (nextNode == null) {
      return nextState;
    }

    nextState = Object.assign({}, nextState, {
      _selectedUris: addNodes(nextState._selectedUris, [nextNode]),
      _focusedUris: addNodes(nextState._focusedUris, [nextNode])
    });
    let probe = getNextNode(nextNode);

    while (probe != null && Selectors().getNodeIsSelected(nextState, probe)) {
      nextNode = probe;
      probe = getNextNode(nextNode);
    }

    nextState = setSelectionRange(nextState, selectionRange.withNewRange(_FileTreeSelectionRange().RangeKey.of(nextNode)));
    nextState = setTrackedNode(nextState, nextNode.rootUri, nextNode.uri);
  } else {
    let nextNode = rangeNode;

    while (nextNode != null && nextNode !== anchorNode && Selectors().getNodeIsSelected(nextState, nextNode) === false) {
      nextNode = getNextNode(nextNode);
    }

    if (nextNode == null) {
      return nextState;
    }

    if (nextNode === anchorNode) {
      nextState = setSelectionRange(nextState, selectionRange.withNewRange(_FileTreeSelectionRange().RangeKey.of(nextNode)));
      return nextState;
    }

    nextState = Object.assign({}, nextState, {
      _selectedUris: deleteNodes(nextState._selectedUris, [nextNode]),
      _focusedUris: deleteNodes(nextState._focusedUris, [nextNode])
    });
    nextState = setSelectionRange(nextState, selectionRange.withNewRange(_FileTreeSelectionRange().RangeKey.of(nextNode)));
    nextState = setTrackedNode(nextState, nextNode.rootUri, nextNode.uri);
  }

  return nextState;
}
/**
 * Moves the selection one node down. In case several nodes were selected, the topmost (first in
 * the natural visual order) is considered to be the reference point for the move.
 */


function moveSelectionDown(state) {
  if (state._roots.isEmpty()) {
    return state;
  }

  const selectedNodes = Selectors().getSelectedNodes(state);
  let nodeToSelect;

  if (selectedNodes.isEmpty()) {
    nodeToSelect = state._roots.first();
  } else {
    const selectedNode = (0, _nullthrows().default)(selectedNodes.first());
    nodeToSelect = Selectors().findNext(state)(selectedNode);
  }

  while (nodeToSelect != null && !nodeToSelect.matchesFilter) {
    nodeToSelect = Selectors().findNext(state)(nodeToSelect);
  }

  if (nodeToSelect == null) {
    return state;
  }

  return setSelectedAndFocusedNode(state, nodeToSelect.rootUri, nodeToSelect.uri);
}

function moveSelectionToTop(state) {
  if (state._roots.isEmpty()) {
    return state;
  }

  let nodeToSelect = state._roots.first();

  if (nodeToSelect != null && !nodeToSelect.shouldBeShown) {
    nodeToSelect = Selectors().findNext(state)(nodeToSelect);
  }

  if (nodeToSelect == null) {
    return state;
  }

  return setSelectedAndFocusedNode(state, nodeToSelect.uri, nodeToSelect.uri);
}

function moveSelectionToBottom(state) {
  if (state._roots.isEmpty()) {
    return state;
  }

  const lastRoot = state._roots.last();

  if (!(lastRoot != null)) {
    throw new Error("Invariant violation: \"lastRoot != null\"");
  }

  const lastChild = Selectors().findLastRecursiveChild(state)(lastRoot);

  if (!(lastChild != null)) {
    throw new Error("Invariant violation: \"lastChild != null\"");
  }

  return setSelectedAndFocusedNode(state, lastChild.rootUri, lastChild.uri);
}

function clearFilter(state) {
  const nextState = Object.assign({}, state, {
    _filter: ''
  });
  return updateRoots(nextState, root => {
    return root.setRecursive(node => null, node => node.set({
      highlightedText: '',
      matchesFilter: true
    }));
  });
}

function addExtraProjectSelectionContent(state, content) {
  return Object.assign({}, state, {
    _extraProjectSelectionContent: state._extraProjectSelectionContent.push(content)
  });
}

function removeExtraProjectSelectionContent(state, content) {
  const index = state._extraProjectSelectionContent.indexOf(content);

  if (index === -1) {
    return state;
  }

  return Object.assign({}, state, {
    _extraProjectSelectionContent: state._extraProjectSelectionContent.remove(index)
  });
}

function setOpenFilesExpanded(state, openFilesExpanded) {
  return Object.assign({}, state, {
    _openFilesExpanded: openFilesExpanded
  });
}

function setUncommittedChangesExpanded(state, uncommittedChangesExpanded) {
  return Object.assign({}, state, {
    _uncommittedChangesExpanded: uncommittedChangesExpanded
  });
}

function setFoldersExpanded(state, foldersExpanded) {
  return Object.assign({}, state, {
    _foldersExpanded: foldersExpanded
  });
}

function invalidateRemovedFolder(state) {
  const updatedFileChanges = new Map();
  atom.project.getPaths().forEach(projectPath => {
    const standardizedPath = _nuclideUri().default.ensureTrailingSeparator(projectPath); // Atom sometimes tells you a repo exists briefly even after it has been removed
    // This causes the map to first flush out the repo and then again try to add the
    // repo but the files now don't exist causing an undefined value to be added.
    // Adding check to prevent this from happening.


    const fileChangesForPath = state._fileChanges.get(standardizedPath);

    if (fileChangesForPath != null) {
      updatedFileChanges.set(standardizedPath, fileChangesForPath);
    }
  });
  return Object.assign({}, state, {
    _fileChanges: Immutable().Map(updatedFileChanges)
  });
}
/*
 * Manually sets a target node used for context menu actions. The value can be
 * retrieved by calling `getTargetNodes` or `getSingleTargetNode` both of
 * which will retrieve the target node if it exists and default to selected
 * nodes otherwise.
 * This value gets cleared everytime a selection is set
 */


function setTargetNode(state, rootKey, nodeKey) {
  return Object.assign({}, state, {
    _targetNodeKeys: {
      rootKey,
      nodeKey
    }
  });
}

function addFilterLetter(state, letter) {
  const getNodeContainsFilterMatches = Selectors().getNodeContainsFilterMatches(state);
  let nextState = Object.assign({}, state);
  nextState._filter = state._filter + letter;
  nextState = updateRoots(nextState, root => {
    return root.setRecursive(node => getNodeContainsFilterMatches(node) ? null : node, node => {
      return (0, _FileTreeFilterHelper().matchesFilter)(node.name, nextState._filter) ? node.set({
        highlightedText: nextState._filter,
        matchesFilter: true
      }) : node.set({
        highlightedText: '',
        matchesFilter: false
      });
    });
  });
  nextState = selectFirstFilter(nextState);
  return nextState;
}

function selectFirstFilter(state) {
  let node = Selectors().getSingleSelectedNode(state); // if the current node matches the filter do nothing

  if (node != null && node.matchesFilter) {
    return state;
  }

  let nextState = moveSelectionDown(state);
  node = Selectors().getSingleSelectedNode(nextState); // if the selection does not find anything up go down

  if (node != null && !node.matchesFilter) {
    nextState = moveSelectionUp(nextState);
  }

  return nextState;
}

function removeFilterLetter(state) {
  const oldLength = state._filter.length;
  let nextState = Object.assign({}, state);
  nextState._filter = nextState._filter.substr(0, nextState._filter.length - 1);

  if (oldLength > 1) {
    nextState = updateRoots(nextState, root => {
      return root.setRecursive(node => null, node => {
        return (0, _FileTreeFilterHelper().matchesFilter)(node.name, nextState._filter) ? node.set({
          highlightedText: nextState._filter,
          matchesFilter: true
        }) : node.set({
          highlightedText: '',
          matchesFilter: false
        });
      });
    });
  } else if (oldLength === 1) {
    nextState = clearFilter(nextState);
  }

  return nextState;
}

function addNodes(map_, nodes) {
  let map = map_;

  for (const node of nodes) {
    map = map.updateIn([node.rootUri], (set = Immutable().Set()) => set.add(node.uri));
  }

  return map;
}

function deleteNodes(map_, nodes) {
  let map = map_;

  for (const node of nodes) {
    map = map.updateIn([node.rootUri], (set = Immutable().Set()) => set.delete(node.uri));
    const set = map.get(node.rootUri);

    if (set != null && set.size === 0) {
      map = map.delete(node.rootUri);
    }
  }

  return map;
}