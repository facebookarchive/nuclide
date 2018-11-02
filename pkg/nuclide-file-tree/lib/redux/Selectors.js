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

import type {GeneratedFileType} from '../../../nuclide-generated-files-rpc';
import type {FileChangeStatusValue} from '../../../nuclide-vcs-base';
// $FlowFixMe(>=0.53.0) Flow suppress
import type React from 'react';
import type {FileTreeNode} from '../FileTreeNode';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {WorkingSetsStore} from '../../../nuclide-working-sets/lib/types';
import type {StatusCodeNumberValue} from '../../../nuclide-hg-rpc/lib/types';
import type {
  AppState,
  ExportStoreData,
  FileTreeContextMenuNode,
  NodeDebugState,
  Roots,
} from '../types';

import nuclideUri from 'nuclide-commons/nuclideUri';
import {StatusCodeNumber} from '../../../nuclide-hg-rpc/lib/hg-constants';
import * as FileTreeHelpers from '../FileTreeHelpers';
import * as Immutable from 'immutable';
import {memoize, once} from 'lodash';
import {createSelector} from 'reselect';

//
//
// Simple selectors. These just read directly from state.
//
//

export const getAutoExpandSingleChild = (state: AppState) =>
  state._autoExpandSingleChild;

export const getConf = (state: AppState) => state._conf;

export const getFoldersExpanded = (state: AppState) => {
  return state._foldersExpanded;
};

export const getUncommittedChangesExpanded = (state: AppState) => {
  return state._uncommittedChangesExpanded;
};

export const getOpenFilesExpanded = (state: AppState) => {
  return state._openFilesExpanded;
};

export const getRoots = (state: AppState) => {
  return state._roots;
};

export const getVersion = (state: AppState) => state.VERSION;

export const getFilter = (state: AppState): string => state._filter;

export const getExtraProjectSelectionContent = (
  state: AppState,
): Immutable.List<React.Element<any>> => state._extraProjectSelectionContent;

const getReorderPreviewStatus = (state: AppState) =>
  state._reorderPreviewStatus;

const getSelectionRange = (state: AppState) => state._selectionRange;

const getTrackedRootKey = (state: AppState) => state._trackedRootKey;

const getTrackedNodeKey = (state: AppState) => state._trackedNodeKey;

export const getWorkingSetsStore = (state: AppState): ?WorkingSetsStore =>
  state._workingSetsStore;

export const getRepositories = (
  state: AppState,
): Immutable.Set<atom$Repository> => state._repositories;

export const getCwdKey = (state: AppState): ?NuclideUri => state._cwdKey;

export const getFileChanges = (
  state: AppState,
): Immutable.Map<
  NuclideUri,
  Immutable.Map<NuclideUri, FileChangeStatusValue>,
> => state._fileChanges;

export const getGeneratedOpenChangedFiles = (
  state: AppState,
): Immutable.Map<NuclideUri, GeneratedFileType> =>
  state._generatedOpenChangedFiles;

export const getIsCalculatingChanges = (state: AppState): boolean =>
  state._isCalculatingChanges;

export const usePrefixNav = (state: AppState): boolean => state._usePrefixNav;

const getSelectedUris = (state: AppState) => state._selectedUris;

const getFocusedUris = (state: AppState) => state._focusedUris;

const getTargetNodeKeys = (state: AppState) => state._targetNodeKeys;

export const getCwdApi = (state: AppState) => state._cwdApi;

export const hasCwd = createSelector([getCwdKey], cwdKey => cwdKey != null);

export const getWorkingSet = (state: AppState) => state.workingSet;

export const getIsEditingWorkingSet = (state: AppState) =>
  state.isEditingWorkingSet;

const getVcsStatuses = (state: AppState) => state.vcsStatuses;

const getExcludeVcsIgnoredPaths = (state: AppState) =>
  state.excludeVcsIgnoredPaths;

const getHideVcsIgnoredPaths = (state: AppState) => state.hideVcsIgnoredPaths;

const getHideIgnoredNames = (state: AppState) => state.hideIgnoredNames;

const getIgnoredPatterns = (state: AppState) => state.ignoredPatterns;

export const getEditedWorkingSet = (state: AppState) => state.editedWorkingSet;

export const getOpenFilesWorkingSet = (state: AppState) =>
  state.openFilesWorkingSet;

const getReposByRoot = (state: AppState) => state.reposByRoot;

//
//
// Tree selectors. These tell us about the state of the directory tree.
//
//

export const getTrackedNode = (state: AppState): ?FileTreeNode => {
  if (state._trackedRootKey == null || state._trackedNodeKey == null) {
    return null;
  }

  return getNode(state, state._trackedRootKey, state._trackedNodeKey);
};

// This doesn't depend on state, so we use `once()` to make sure we don't create
// the inner function every time and invalidate dependent selectors.
export const getNodeIsContainer = once(() =>
  memoizeWithWeakMap((node: FileTreeNode) =>
    FileTreeHelpers.isDirOrArchiveKey(node.uri),
  ),
);

const getContainedInWorkingSet = createSelector(
  [getWorkingSet, getNodeIsContainer],
  (workingSet, getNodeIsContainer_) => {
    return memoizeWithWeakMap(node => {
      const splitPath = nuclideUri.split(node.uri);
      return getNodeIsContainer_(node)
        ? workingSet.containsDirBySplitPath(splitPath)
        : workingSet.containsFileBySplitPath(splitPath);
    });
  },
);

const getContainedInOpenFilesWorkingSet = createSelector(
  [getOpenFilesWorkingSet, getNodeIsContainer],
  (openFilesWorkingSet, getNodeIsContainer_) => {
    return memoizeWithWeakMap(node => {
      if (openFilesWorkingSet.isEmpty()) {
        return false;
      }
      const splitPath = nuclideUri.split(node.uri);
      return getNodeIsContainer_(node)
        ? openFilesWorkingSet.containsDirBySplitPath(splitPath)
        : openFilesWorkingSet.containsFileBySplitPath(splitPath);
    });
  },
);

export const getNodeShouldBeSoftened = createSelector(
  [
    getIsEditingWorkingSet,
    getContainedInWorkingSet,
    getContainedInOpenFilesWorkingSet,
  ],
  (
    isEditingWorkingSet,
    getContainedInWorkingSet_,
    getContainedInOpenFilesWorkingSet_,
  ) => {
    return memoizeWithWeakMap(node => {
      if (isEditingWorkingSet) {
        return false;
      }
      return (
        !getContainedInWorkingSet_(node) &&
        getContainedInOpenFilesWorkingSet_(node)
      );
    });
  },
);

export const getNodeRepo = createSelector([getReposByRoot], reposByRoot => {
  return node => reposByRoot[node.rootUri];
});

export const getNodeIsIgnored = createSelector([getNodeRepo], getNodeRepo_ => {
  return memoizeWithWeakMap(node => {
    const repo = getNodeRepo_(node);
    return (
      repo != null && repo.isProjectAtRoot() && repo.isPathIgnored(node.uri)
    );
  });
});

export const getNodeCheckedStatus = createSelector(
  [getEditedWorkingSet, getNodeIsContainer],
  (editedWorkingSet, getNodeIsContainer_) => {
    return memoizeWithWeakMap(node => {
      if (editedWorkingSet.isEmpty()) {
        return 'clear';
      }
      const splitPath = nuclideUri.split(node.uri);
      if (getNodeIsContainer_(node)) {
        if (editedWorkingSet.containsFileBySplitPath(splitPath)) {
          return 'checked';
        } else if (editedWorkingSet.containsDirBySplitPath(splitPath)) {
          return 'partial';
        }
        return 'clear';
      }
      return editedWorkingSet.containsFileBySplitPath(splitPath)
        ? 'checked'
        : 'clear';
    });
  },
);

export const getNodeShouldBeShown = createSelector(
  [
    getNodeIsIgnored,
    getExcludeVcsIgnoredPaths,
    getHideVcsIgnoredPaths,
    getHideIgnoredNames,
    getIgnoredPatterns,
    getIsEditingWorkingSet,
    getContainedInWorkingSet,
    getContainedInOpenFilesWorkingSet,
  ],
  (
    getNodeIsIgnored_,
    excludeVcsIgnoredPaths,
    hideVcsIgnoredPaths,
    hideIgnoredNames,
    ignoredPatterns,
    isEditingWorkingSet,
    getContainedInWorkingSet_,
    getContainedInOpenFilesWorkingSet_,
  ) => {
    return memoizeWithWeakMap(node => {
      if (
        getNodeIsIgnored_(node) &&
        excludeVcsIgnoredPaths &&
        hideVcsIgnoredPaths
      ) {
        return false;
      }
      if (hideIgnoredNames && ignoredPatterns.some(p => p.match(node.uri))) {
        return false;
      }
      if (isEditingWorkingSet) {
        return true;
      }
      return (
        getContainedInWorkingSet_(node) ||
        getContainedInOpenFilesWorkingSet_(node)
      );
    });
  },
);

// To reduce the number of times we have to iterate over children, we calculate all of these values
// in a single pass.
const getChildDerivedValues = createSelector(
  [getNodeShouldBeShown],
  getNodeShouldBeShown_ => {
    const inner = memoizeWithWeakMap((node: FileTreeNode) => {
      let childrenAreLoading = node.isLoading;
      let containsDragHover = node.isDragHovered;
      let containsFilterMatches = node.matchesFilter;
      let containsHidden = !getNodeShouldBeShown_(node);
      let potentiallyShownChildrenCount = 0;

      node.children.forEach(child => {
        const childValues = inner(child);

        if (childValues.childrenAreLoading) {
          childrenAreLoading = true;
        }

        if (childValues.containsDragHover) {
          containsDragHover = true;
        }

        if (childValues.containsFilterMatches) {
          containsFilterMatches = true;
        }

        if (!containsHidden && childValues.containsHidden) {
          containsHidden = true;
        }

        if (node.isExpanded) {
          potentiallyShownChildrenCount += childValues.shownChildrenCount;
        }
      });

      let shownChildrenCount;
      if (!getNodeShouldBeShown_(node)) {
        shownChildrenCount = 0; // No nodes are shown.
      } else if (node.isPendingLoad && childrenAreLoading) {
        shownChildrenCount = 1; // Only this node is shown.
      } else {
        shownChildrenCount = potentiallyShownChildrenCount + 1; // This node and its children are shown.
      }

      return {
        childrenAreLoading,
        containsDragHover,
        containsFilterMatches,
        containsHidden,
        shownChildrenCount,
      };
    });
    return inner;
  },
);

export const getNodeChildrenAreLoading = createSelector(
  [getChildDerivedValues],
  getChildDerivedValues_ => node =>
    getChildDerivedValues_(node).childrenAreLoading,
);

export const getNodeContainsDragHover = createSelector(
  [getChildDerivedValues],
  getChildDerivedValues_ => node =>
    getChildDerivedValues_(node).containsDragHover,
);

export const getNodeContainsFilterMatches = createSelector(
  [getChildDerivedValues],
  getChildDerivedValues_ => node =>
    getChildDerivedValues_(node).containsFilterMatches,
);

export const getNodeContainsHidden = createSelector(
  [getChildDerivedValues],
  getChildDerivedValues_ => node => getChildDerivedValues_(node).containsHidden,
);

export const getShownChildrenCount = createSelector(
  [getChildDerivedValues],
  getChildDerivedValues_ => node =>
    getChildDerivedValues_(node).shownChildrenCount,
);

export const countShownNodes = createSelector(
  [getRoots, getShownChildrenCount],
  (roots, getShownChildrenCount_) => {
    return roots.reduce((sum, root) => sum + getShownChildrenCount_(root), 0);
  },
);

// FIXME: This is under-memoized. We need to use createSelector and only change when the deps do.
export const getVisualIndex = (
  state: AppState,
): ((node: FileTreeNode) => number) => {
  return memoizeWithWeakMap((node: FileTreeNode) => {
    let index = getNodeShouldBeShown(state)(node) ? 1 : 0;
    let prev = findPrevShownSibling(state)(node);
    while (prev != null) {
      index += getShownChildrenCount(state)(prev);
      prev = findPrevShownSibling(state)(prev);
    }
    return (
      index + (node.parent == null ? 0 : getVisualIndex(state)(node.parent))
    );
  });
};

const getVisualIndexOfTrackedNode = createSelector(
  [getTrackedNode, getVisualIndex],
  (trackedNode, getVisualIndex_) =>
    trackedNode == null ? null : getVisualIndex_(trackedNode),
);

export const getTrackedIndex = createSelector(
  [getVisualIndexOfTrackedNode, countShownNodes],
  (visualIndexOfTrackedNode: ?number, shownNodes: number) => {
    if (visualIndexOfTrackedNode == null) {
      return null;
    }
    const inTreeTrackedNode = visualIndexOfTrackedNode - 1;
    if (inTreeTrackedNode === shownNodes - 1) {
      // The last node in tree is tracked. Let's show the footer instead
      return inTreeTrackedNode + 1;
    }
    return inTreeTrackedNode;
  },
);

export const getRootKeys = createSelector(
  [getRoots],
  (roots): Array<NuclideUri> =>
    roots
      .valueSeq()
      .toArray()
      .map(root => root.uri),
);

/**
 * Returns true if the store has no data, i.e. no roots, no children.
 */
export const isEmpty = createSelector([getRoots], roots => roots.isEmpty());

export const getSelectedNodes = createSelector(
  [getRoots, getSelectedUris],
  (roots, selectedUris): Immutable.List<FileTreeNode> => {
    const nodes = [];
    selectedUris.forEach((set, rootUri) => {
      set.forEach(uri => {
        const node = getNodeInRoots(roots, rootUri, uri);
        if (node != null) {
          nodes.push(node);
        }
      });
    });
    return Immutable.List(nodes);
  },
);

export const getNodeInRoots = (
  roots: Roots,
  rootKey: NuclideUri,
  nodeKey: NuclideUri,
): ?FileTreeNode => {
  const rootNode = roots.get(rootKey);
  if (rootNode == null) {
    return null;
  }
  return rootNode.find(nodeKey);
};

export const getFocusedNodes = createSelector(
  [getRoots, getFocusedUris],
  (roots, focusedUris) => {
    const nodes = [];
    focusedUris.forEach((set, rootUri) => {
      set.forEach(uri => {
        const node = getNodeInRoots(roots, rootUri, uri);
        if (node != null) {
          nodes.push(node);
        }
      });
    });
    return Immutable.List(nodes);
  },
);

const getTargetNode = createSelector(
  [getRoots, getTargetNodeKeys],
  (roots, targetNodeKeys) => {
    if (targetNodeKeys == null) {
      return null;
    }
    return getNodeInRoots(
      roots,
      targetNodeKeys.rootKey,
      targetNodeKeys.nodeKey,
    );
  },
);

// Retrieves target node in an immutable list if it's set, or all selected
// nodes otherwise
export const getTargetNodes = createSelector(
  [getRoots, getTargetNode, getSelectedNodes],
  (roots, targetNode, selectedNodes) => {
    if (targetNode) {
      return Immutable.List([targetNode]);
    }
    return selectedNodes;
  },
);

/**
 * Returns a node if it is the only one selected, or null otherwise
 */
export const getSingleSelectedNode = createSelector(
  [getSelectedNodes],
  selectedNodes => {
    if (selectedNodes.isEmpty() || selectedNodes.size > 1) {
      return null;
    }
    return selectedNodes.first();
  },
);

// Retrieves the target node, if it's set, or the first selected node otherwise
export const getSingleTargetNode = createSelector(
  [getTargetNode, getSingleSelectedNode],
  (targetNode, singleSelectedNode) => targetNode ?? singleSelectedNode,
);

/**
 * Returns the current node if it is shown.
 * Otherwise, returns a nearby node that is shown.
 */
function findShownNode(state: AppState, node: FileTreeNode): ?FileTreeNode {
  if (getNodeShouldBeShown(state)(node)) {
    return node;
  }

  let shown = node;
  while (shown != null) {
    const next = findNextShownSibling(state)(shown);
    if (next != null) {
      return next;
    }
    shown = shown.parent;
  }

  shown = node;
  while (shown != null) {
    const next = findPrevShownSibling(state)(shown);
    if (next != null) {
      return next;
    }
    shown = shown.parent;
  }
  return null;
}

/**
 * Returns the current node if it is shown and selected
 * Otherwise, returns a nearby selected node.
 */
export const getNearbySelectedNode = (
  state: AppState,
  node: FileTreeNode,
): ?FileTreeNode => {
  const shown = findShownNode(state, node);
  if (shown == null) {
    return shown;
  }
  if (getNodeIsSelected(state)(shown)) {
    return shown;
  }
  let selected = shown;
  while (selected != null && !getNodeIsSelected(state)(selected)) {
    selected = findNext(state)(selected);
  }
  if (selected != null) {
    return selected;
  }
  selected = shown;
  while (selected != null && !getNodeIsSelected(state)(selected)) {
    selected = findPrevious(state)(selected);
  }
  return selected;
};

export const getNode = (
  state: AppState,
  rootKey: NuclideUri,
  nodeKey: NuclideUri,
): ?FileTreeNode => getNodeInRoots(getRoots(state), rootKey, nodeKey);

export const getRootForPath = (
  state: AppState,
  nodeKey: NuclideUri,
): ?FileTreeNode => {
  const rootNode = getRoots(state).find(root => nodeKey.startsWith(root.uri));
  return rootNode || null;
};

export const getNodeForPath = (
  state: AppState,
  uri: NuclideUri,
): ?FileTreeNode => {
  const rootNode = getRootForPath(state, uri);
  return rootNode && rootNode.find(uri);
};

export const isEditedWorkingSetEmpty = createSelector(
  [getRoots, getNodeCheckedStatus],
  (roots, getNodeCheckedStatus_) =>
    roots.every(root => getNodeCheckedStatus_(root) === 'clear'),
);

export const getFilterFound = createSelector(
  [getRoots, getNodeContainsFilterMatches],
  (roots, getNodeContainsFilterMatches_) =>
    roots.some(root => getNodeContainsFilterMatches_(root)),
);

/**
 * Find the node that occurs `offset` after the provided one in the flattened list. `offset` must
 * be a non-negative integer.
 *
 * This function is intentionally implemented with a loop instead of recursion. Previously it was
 * implemented using recursion, which caused the stack size to grow with the number of siblings we
 * had to traverse. That meant we exceeded the max stack size with enough sibling files.
 */
const getFindNodeAtOffset = createSelector(
  [findNextShownSibling, getShownChildrenCount, getNodeShouldBeShown],
  (findNextShownSibling_, getShownChildrenCount_, getNodeShouldBeShown_) => {
    return function(node_: FileTreeNode, offset_: number): ?FileTreeNode {
      let offset = offset_;
      let node = node_;

      while (offset > 0) {
        if (
          offset < getShownChildrenCount_(node) // `shownChildrenCount` includes the node itself.
        ) {
          // It's a descendant of this node!
          const firstVisibleChild = node.children.find(c =>
            getNodeShouldBeShown_(c),
          );
          if (firstVisibleChild == null) {
            return null;
          }
          offset--;
          node = firstVisibleChild;
        } else {
          const nextShownSibling = findNextShownSibling_(node);
          if (nextShownSibling == null) {
            return null;
          }
          offset -= getShownChildrenCount_(node);
          node = nextShownSibling;
        }
      }

      return node;
    };
  },
);

export const getNodeByIndex = createSelector(
  [getRoots, getFindNodeAtOffset, getNodeShouldBeShown],
  (roots, findNodeAtOffset, getNodeShouldBeShown_) => {
    return memoize(index => {
      const firstRoot = roots.find(r => getNodeShouldBeShown_(r));
      return firstRoot == null ? null : findNodeAtOffset(firstRoot, index - 1);
    });
  },
);

export const getLoading = (state: AppState, nodeKey: NuclideUri) =>
  state._isLoadingMap.get(nodeKey);

export const getNodeIsSelected = createSelector(
  [getSelectedUris],
  selectedUris => {
    return memoizeWithWeakMap(node =>
      selectedUris.get(node.rootUri, Immutable.Set()).has(node.uri),
    );
  },
);

export const getNodeIsFocused = createSelector(
  [getFocusedUris],
  focusedUris => {
    return memoizeWithWeakMap(node =>
      focusedUris.get(node.rootUri, Immutable.Set()).has(node.uri),
    );
  },
);

export const getSidebarTitle = createSelector([getCwdKey], cwdKey => {
  return cwdKey == null ? 'File Tree' : nuclideUri.basename(cwdKey);
});

export const getUsePreviewTabs = (state: AppState): boolean => {
  return state.usePreviewTabs;
};

export const getFocusEditorOnFileSelection = (state: AppState): boolean => {
  return state.focusEditorOnFileSelection;
};

export const getSidebarPath = createSelector([getCwdKey], cwdKey => {
  if (cwdKey == null) {
    return 'No Current Working Directory';
  }

  const trimmed = nuclideUri.trimTrailingSeparator(cwdKey);
  const directory = nuclideUri.getPath(trimmed);
  const host = nuclideUri.getHostnameOpt(trimmed);
  if (host == null) {
    return `Current Working Directory: ${directory}`;
  }

  return `Current Working Directory: '${directory}' on '${host}'`;
});

export const getVcsStatus = createSelector(
  [getVcsStatuses],
  (
    vcsStatuses: Immutable.Map<
      NuclideUri,
      Map<NuclideUri, StatusCodeNumberValue>,
    >,
  ): ((node: FileTreeNode) => StatusCodeNumberValue) => {
    return node => {
      const statusMap = vcsStatuses.get(node.rootUri);
      return statusMap == null
        ? StatusCodeNumber.CLEAN
        : statusMap.get(node.uri) ?? StatusCodeNumber.CLEAN;
    };
  },
);

// In previous versions, we exposed the FileTreeNodes directly. This was bad as it's really just an
// implementation detail. So, when we wanted to move `vcsStatus` off of the node, we had an issue.
// We now expose a limited API instead to avoid this.
export const getFileTreeContextMenuNode = createSelector(
  [getVcsStatus, getNodeRepo, getNodeIsContainer],
  (getVcsStatusFromNode, getNodeRepo_, getNodeIsContainer_) => {
    return (node: ?FileTreeNode): ?FileTreeContextMenuNode => {
      if (node == null) {
        return null;
      }
      return {
        uri: node.uri,
        isContainer: getNodeIsContainer_(node),
        isRoot: node.isRoot,
        isCwd: node.isCwd,
        vcsStatusCode: getVcsStatusFromNode(node),
        repo: getNodeRepo_(node),
        // We don't want to expose the entire tree or allow traversal since then we'd have to
        // materialize every node. This is for supporting a legacy use case.
        parentUri: node.parent?.uri,
      };
    };
  },
);

//
//
// Serialization and debugging
//
//

export const serialize = createSelector(
  [
    getRootKeys,
    getVersion,
    getOpenFilesExpanded,
    getUncommittedChangesExpanded,
    getFoldersExpanded,
  ],
  (
    rootKeys,
    version,
    openFilesExpanded,
    uncommittedChangesExpanded,
    foldersExpanded,
  ): ExportStoreData => {
    return {
      version,
      childKeyMap: {},
      expandedKeysByRoot: {},
      rootKeys,
      selectedKeysByRoot: {},
      openFilesExpanded,
      uncommittedChangesExpanded,
      foldersExpanded,
    };
  },
);

export const collectSelectionDebugState = createSelector(
  [getSelectedNodes, getFocusedNodes],
  (selectedNodes, focusedNodes) => {
    return {
      _selectedNodes: selectedNodes.toArray().map(node => node.uri),
      _focusedNodes: focusedNodes.toArray().map(node => node.uri),
    };
  },
);

export const getCanTransferFiles = (state: AppState) =>
  Boolean(state.remoteTransferService);

const collectDebugStateForNode = (state: AppState) => (
  node: FileTreeNode,
): NodeDebugState => {
  return {
    uri: node.uri,
    rootUri: node.rootUri,
    isExpanded: node.isExpanded,
    isDragHovered: node.isDragHovered,
    isBeingReordered: node.isBeingReordered,
    isLoading: node.isLoading,
    wasFetched: node.wasFetched,
    isCwd: node.isCwd,
    connectionTitle: node.connectionTitle,
    highlightedText: node.highlightedText,
    matchesFilter: node.matchesFilter,
    isPendingLoad: node.isPendingLoad,
    generatedStatus: node.generatedStatus,
    isRoot: node.isRoot,
    name: node.name,
    relativePath: node.relativePath,
    localPath: node.localPath,
    isContainer: getNodeIsContainer(state)(node),
    shouldBeShown: getNodeShouldBeShown(state)(node),
    shouldBeSoftened: getNodeShouldBeSoftened(state)(node),
    isIgnored: getNodeIsIgnored(state)(node),
    checkedStatus: getNodeCheckedStatus(state)(node),

    children: Array.from(node.children.values()).map(child =>
      collectDebugStateForNode(state)(child),
    ),
  };
};

// Note: The Flow types for reselect's `createSelector` only support up to 16
// sub-selectors. Since this selector only gets called when the user reports a
// bug, it does not need to be optimized for multiple consecutive calls on
// similar states. Therefore, we've opted to not use createSelector for this
// selector.
export const collectDebugState = (state: AppState) => {
  return {
    currentWorkingRoot: getCwdKey(state),
    openFilesExpanded: getOpenFilesExpanded(state),
    uncommittedChangesExpanded: getUncommittedChangesExpanded(state),
    foldersExpanded: getFoldersExpanded(state),
    reorderPreviewStatus: getReorderPreviewStatus(state),
    _filter: getFilter(state),
    _selectionRange: getSelectionRange(state),
    _targetNodeKeys: getTargetNodeKeys(state),
    _trackedRootKey: getTrackedRootKey(state),
    _trackedNodeKey: getTrackedNodeKey(state),
    _isCalculatingChanges: getIsCalculatingChanges(state),
    usePreviewTabs: getUsePreviewTabs(state),
    focusEditorOnFileSelection: getFocusEditorOnFileSelection(state),
    roots: Array.from(getRoots(state).values()).map(root =>
      collectDebugStateForNode(state)(root),
    ),
    _conf: {
      hideIgnoredNames: getHideIgnoredNames(state),
      excludeVcsIgnoredPaths: getExcludeVcsIgnoredPaths(state),
      hideVcsIgnoredPaths: getHideVcsIgnoredPaths(state),
      isEditingWorkingSet: getIsEditingWorkingSet(state),
      vcsStatuses: getVcsStatuses(state).toObject(),
      workingSet: getWorkingSet(state).getUris(),
      ignoredPatterns: getIgnoredPatterns(state)
        .toArray()
        .map(ignored => ignored.pattern),
      openFilesWorkingSet: getOpenFilesWorkingSet(state).getUris(),
      editedWorkingSet: getEditedWorkingSet(state).getUris(),
    },
    selectionManager: collectSelectionDebugState(state),
  };
};

//
//
// Traversal utils
//
//

/**
 * Finds the next node in the tree in the natural order - from top to to bottom as is displayed
 * in the file-tree panel, minus the indentation. Only the nodes that should be shown are returned.
 */
export function findNext(state: AppState) {
  return (node: FileTreeNode): ?FileTreeNode => {
    if (!getNodeShouldBeShown(state)(node)) {
      if (node.parent != null) {
        return findNext(state)(node.parent);
      }

      return null;
    }

    if (getShownChildrenCount(state)(node) > 1) {
      return node.children.find(c => getNodeShouldBeShown(state)(c));
    }

    // Not really an alias, but an iterating reference
    let it = node;
    while (it != null) {
      const nextShownSibling = findNextShownSibling(state)(it);
      if (nextShownSibling != null) {
        return nextShownSibling;
      }

      it = it.parent;
    }

    return null;
  };
}

export function findNextShownSibling(state: AppState) {
  return (node: FileTreeNode): ?FileTreeNode => {
    let it = node.nextSibling;
    while (it != null && !getNodeShouldBeShown(state)(it)) {
      it = it.nextSibling;
    }

    return it;
  };
}

/**
 * Finds the previous node in the tree in the natural order - from top to to bottom as is displayed
 * in the file-tree panel, minus the indentation. Only the nodes that should be shown are returned.
 */
export function findPrevious(state: AppState) {
  return (node: FileTreeNode): ?FileTreeNode => {
    if (!getNodeShouldBeShown(state)(node)) {
      if (node.parent != null) {
        return findPrevious(state)(node.parent);
      }

      return null;
    }

    const prevShownSibling = findPrevShownSibling(state)(node);
    if (prevShownSibling != null) {
      return findLastRecursiveChild(state)(prevShownSibling);
    }

    return node.parent;
  };
}

export function findPrevShownSibling(state: AppState) {
  return (node: FileTreeNode): ?FileTreeNode => {
    let it = node.prevSibling;
    while (it != null && !getNodeShouldBeShown(state)(it)) {
      it = it.prevSibling;
    }

    return it;
  };
}

/**
 * Returns the last shown descendant according to the natural tree order as is to be displayed by
 * the file-tree panel. (Last child of the last child of the last child...)
 * Or null, if none are found
 */
export function findLastRecursiveChild(state: AppState) {
  // TODO: Convert this to use `createSelector()`
  return (node: FileTreeNode): ?FileTreeNode => {
    if (
      !getNodeIsContainer(state)(node) ||
      !node.isExpanded ||
      node.children.isEmpty()
    ) {
      return node;
    }

    let it = node.children.last();
    while (it != null && !getNodeShouldBeShown(state)(it)) {
      it = it.prevSibling;
    }

    if (it == null) {
      if (getNodeShouldBeShown(state)(node)) {
        return node;
      }
      return findPrevious(state)(node);
    } else {
      return findLastRecursiveChild(state)(it);
    }
  };
}

//
//
// Utilities
//
//

function memoizeWithWeakMap<T, U>(fn: T => U): T => U {
  const memoized = memoize(fn);
  memoized.cache = new WeakMap();
  return memoized;
}
