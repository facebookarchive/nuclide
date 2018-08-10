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
import type {FileTreeStore, ExportStoreData, Roots} from '../types';

import {WorkingSet} from '../../../nuclide-working-sets-common';
import * as Immutable from 'immutable';
import {memoize} from 'lodash';
import {createSelector} from 'reselect';

//
//
// Simple selectors. These just read directly from state.
//
//

export const getAutoExpandSingleChild = (state: FileTreeStore) =>
  state._autoExpandSingleChild;

export const getConf = (state: FileTreeStore) => state._conf;

export const getFoldersExpanded = (state: FileTreeStore) => {
  return state._foldersExpanded;
};

export const getUncommittedChangesExpanded = (state: FileTreeStore) => {
  return state._uncommittedChangesExpanded;
};

export const getOpenFilesExpanded = (state: FileTreeStore) => {
  return state._openFilesExpanded;
};

export const getRoots = (state: FileTreeStore) => {
  return state._roots;
};

export const getVersion = (state: FileTreeStore) => state.VERSION;

export const getFilter = (state: FileTreeStore): string => state._filter;

export const getExtraProjectSelectionContent = (
  state: FileTreeStore,
): Immutable.List<React.Element<any>> => state._extraProjectSelectionContent;

const getReorderPreviewStatus = (state: FileTreeStore) =>
  state._reorderPreviewStatus;

const getSelectionRange = (state: FileTreeStore) => state._selectionRange;

const getTrackedRootKey = (state: FileTreeStore) => state._trackedRootKey;

const getTrackedNodeKey = (state: FileTreeStore) => state._trackedNodeKey;

export const getWorkingSetsStore = (state: FileTreeStore): ?WorkingSetsStore =>
  state._workingSetsStore;

export const getRepositories = (
  state: FileTreeStore,
): Immutable.Set<atom$Repository> => state._repositories;

export const getCwdKey = (state: FileTreeStore): ?NuclideUri => state._cwdKey;

export const getFileChanges = (
  state: FileTreeStore,
): Immutable.Map<
  NuclideUri,
  Immutable.Map<NuclideUri, FileChangeStatusValue>,
> => state._fileChanges;

export const getGeneratedOpenChangedFiles = (
  state: FileTreeStore,
): Immutable.Map<NuclideUri, GeneratedFileType> =>
  state._generatedOpenChangedFiles;

export const getIsCalculatingChanges = (state: FileTreeStore): boolean =>
  state._isCalculatingChanges;

export const usePrefixNav = (state: FileTreeStore): boolean =>
  state._usePrefixNav;

const getSelectedUris = (state: FileTreeStore) => state._selectedUris;

const getFocusedUris = (state: FileTreeStore) => state._focusedUris;

const getTargetNodeKeys = (state: FileTreeStore) => state._targetNodeKeys;

export const getCwdApi = (state: FileTreeStore) => state._cwdApi;

export const hasCwd = createSelector([getCwdKey], cwdKey => cwdKey != null);

//
//
// Conf selectors
//
//

export const getWorkingSet = createSelector(
  [getConf],
  (conf): WorkingSet => conf.workingSet,
);

export const isEditingWorkingSet = createSelector(
  [getConf],
  conf => conf.isEditingWorkingSet,
);

/**
 * Builds the edited working set from the partially-child-derived .checkedStatus property
 */
export const getEditedWorkingSet = createSelector(
  [getConf],
  conf => conf.editedWorkingSet,
);

export const getOpenFilesWorkingSet = createSelector(
  [getConf],
  conf => conf.openFilesWorkingSet,
);

//
//
// Tree selectors. These tell us about the state of the directory tree.
//
//

export const getTrackedNode = (state: FileTreeStore): ?FileTreeNode => {
  if (state._trackedRootKey == null || state._trackedNodeKey == null) {
    return null;
  }

  return getNode(state, state._trackedRootKey, state._trackedNodeKey);
};

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
function findShownNode(node: FileTreeNode): ?FileTreeNode {
  if (node.shouldBeShown) {
    return node;
  }

  let shown = node;
  while (shown != null) {
    const next = shown.findNextShownSibling();
    if (next != null) {
      return next;
    }
    shown = shown.parent;
  }

  shown = node;
  while (shown != null) {
    const next = shown.findPrevShownSibling();
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
  state: FileTreeStore,
  node: FileTreeNode,
): ?FileTreeNode => {
  const shown = findShownNode(node);
  if (shown == null) {
    return shown;
  }
  if (getNodeIsSelected(state, shown)) {
    return shown;
  }
  let selected = shown;
  while (selected != null && !getNodeIsSelected(state, selected)) {
    selected = selected.findNext();
  }
  if (selected != null) {
    return selected;
  }
  selected = shown;
  while (selected != null && !getNodeIsSelected(state, selected)) {
    selected = selected.findPrevious();
  }
  return selected;
};

export const getNode = (
  state: FileTreeStore,
  rootKey: NuclideUri,
  nodeKey: NuclideUri,
): ?FileTreeNode => getNodeInRoots(getRoots(state), rootKey, nodeKey);

export const getRootForPath = (
  state: FileTreeStore,
  nodeKey: NuclideUri,
): ?FileTreeNode => {
  const rootNode = getRoots(state).find(root => nodeKey.startsWith(root.uri));
  return rootNode || null;
};

export const isEditedWorkingSetEmpty = createSelector([getRoots], roots =>
  roots.every(root => root.checkedStatus === 'clear'),
);

export const getFilterFound = createSelector([getRoots], roots =>
  roots.some(root => root.containsFilterMatches),
);

export const getNodeByIndex = createSelector(getRoots, roots => {
  return memoize(index => {
    const firstRoot = roots.find(r => r.shouldBeShown);
    return firstRoot == null ? null : firstRoot.findByIndex(index);
  });
});

export const getLoading = (state: FileTreeStore, nodeKey: NuclideUri) =>
  state._isLoadingMap.get(nodeKey);

export const getNodeIsSelected = (state: FileTreeStore, node: FileTreeNode) =>
  getSelectedUris(state)
    .get(node.rootUri, Immutable.Set())
    .has(node.uri);

export const getNodeIsFocused = (state: FileTreeStore, node: FileTreeNode) =>
  getFocusedUris(state)
    .get(node.rootUri, Immutable.Set())
    .has(node.uri);

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

export const collectDebugState = createSelector(
  [
    getCwdKey,
    getOpenFilesExpanded,
    getUncommittedChangesExpanded,
    getFoldersExpanded,
    getReorderPreviewStatus,
    getFilter,
    getSelectionRange,
    getTargetNodeKeys,
    getTrackedRootKey,
    getTrackedNodeKey,
    getIsCalculatingChanges,
    getRoots,
    getConf,
    collectSelectionDebugState,
  ],
  (
    currentWorkingRoot,
    openFilesExpanded,
    uncommittedChangesExpanded,
    foldersExpanded,
    reorderPreviewStatus,
    _filter,
    _selectionRange,
    _targetNodeKeys,
    _trackedRootKey,
    _trackedNodeKey,
    _isCalculatingChanges,
    roots,
    conf,
    selectionManager,
  ) => {
    return {
      currentWorkingRoot,
      openFilesExpanded,
      uncommittedChangesExpanded,
      foldersExpanded,
      reorderPreviewStatus,
      _filter,
      _selectionRange,
      _targetNodeKeys,
      _trackedRootKey,
      _trackedNodeKey,
      _isCalculatingChanges,

      roots: Array.from(roots.values()).map(root => root.collectDebugState()),
      _conf: {
        hideIgnoredNames: conf.hideIgnoredNames,
        excludeVcsIgnoredPaths: conf.excludeVcsIgnoredPaths,
        hideVcsIgnoredPaths: conf.hideVcsIgnoredPaths,
        usePreviewTabs: conf.usePreviewTabs,
        focusEditorOnFileSelection: conf.focusEditorOnFileSelection,
        isEditingWorkingSet: conf.isEditingWorkingSet,
        vcsStatuses: conf.vcsStatuses.toObject(),
        workingSet: conf.workingSet.getUris(),
        ignoredPatterns: conf.ignoredPatterns
          .toArray()
          .map(ignored => ignored.pattern),
        openFilesWorkingSet: conf.openFilesWorkingSet.getUris(),
        editedWorkingSet: conf.editedWorkingSet.getUris(),
      },
      selectionManager,
    };
  },
);
