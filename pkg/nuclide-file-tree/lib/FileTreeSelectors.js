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

import type {GeneratedFileType} from '../../nuclide-generated-files-rpc';
import type {FileChangeStatusValue} from '../../nuclide-vcs-base';
// $FlowFixMe(>=0.53.0) Flow suppress
import type React from 'react';

import {FileTreeNode} from './FileTreeNode';
import * as Immutable from 'immutable';
import {WorkingSet} from '../../nuclide-working-sets-common';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/types';
import type {FileTreeStore, ExportStoreData} from './types';

export const serialize = (state: FileTreeStore): ExportStoreData => {
  const rootKeys = state._roots
    .valueSeq()
    .toArray()
    .map(root => root.uri);

  return {
    version: state.VERSION,
    childKeyMap: {},
    expandedKeysByRoot: {},
    rootKeys,
    selectedKeysByRoot: {},
    openFilesExpanded: state._openFilesExpanded,
    uncommittedChangesExpanded: state._uncommittedChangesExpanded,
    foldersExpanded: state._foldersExpanded,
  };
};

export const getTrackedNode = (state: FileTreeStore): ?FileTreeNode => {
  if (state._trackedRootKey == null || state._trackedNodeKey == null) {
    return null;
  }

  return getNode(state, state._trackedRootKey, state._trackedNodeKey);
};

export const getRepositories = (
  state: FileTreeStore,
): Immutable.Set<atom$Repository> => {
  return state._repositories;
};

export const getWorkingSet = (state: FileTreeStore): WorkingSet => {
  return state._conf.workingSet;
};

export const getWorkingSetsStore = (
  state: FileTreeStore,
): ?WorkingSetsStore => {
  return state._workingSetsStore;
};

export const getRootKeys = (state: FileTreeStore): Array<NuclideUri> => {
  return state._roots
    .valueSeq()
    .toArray()
    .map(root => root.uri);
};

export const getCwdKey = (state: FileTreeStore): ?NuclideUri => {
  return state._cwdKey;
};

/**
 * Returns true if the store has no data, i.e. no roots, no children.
 */
export const isEmpty = (state: FileTreeStore): boolean => {
  return state._roots.isEmpty();
};

export const getFileChanges = (
  state: FileTreeStore,
): Immutable.Map<
  NuclideUri,
  Immutable.Map<NuclideUri, FileChangeStatusValue>,
> => {
  return state._fileChanges;
};

export const getGeneratedOpenChangedFiles = (
  state: FileTreeStore,
): Immutable.Map<NuclideUri, GeneratedFileType> => {
  return state._generatedOpenChangedFiles;
};

export const getIsCalculatingChanges = (state: FileTreeStore): boolean => {
  return state._isCalculatingChanges;
};

export const usePrefixNav = (state: FileTreeStore): boolean => {
  return state._usePrefixNav;
};

export const getSelectedNodes = (
  state: FileTreeStore,
): Immutable.List<FileTreeNode> => {
  const nodes = [];
  state._selectedUris.forEach((set, rootUri) => {
    set.forEach(uri => {
      const node = getNode(state, rootUri, uri);
      if (node != null) {
        nodes.push(node);
      }
    });
  });
  return Immutable.List(nodes);
};

export const getFocusedNodes = (
  state: FileTreeStore,
): Immutable.List<FileTreeNode> => {
  const nodes = [];
  state._focusedUris.forEach((set, rootUri) => {
    set.forEach(uri => {
      const node = getNode(state, rootUri, uri);
      if (node != null) {
        nodes.push(node);
      }
    });
  });
  return Immutable.List(nodes);
};

// Retrieves target node in an immutable list if it's set, or all selected
// nodes otherwise
export const getTargetNodes = (
  state: FileTreeStore,
): Immutable.List<FileTreeNode> => {
  if (state._targetNodeKeys) {
    const targetNode = getNode(
      state,
      state._targetNodeKeys.rootKey,
      state._targetNodeKeys.nodeKey,
    );
    if (targetNode) {
      return Immutable.List([targetNode]);
    }
  }
  return getSelectedNodes(state);
};

/**
 * Returns a node if it is the only one selected, or null otherwise
 */
export const getSingleSelectedNode = (state: FileTreeStore): ?FileTreeNode => {
  const selectedNodes = getSelectedNodes(state);

  if (selectedNodes.isEmpty() || selectedNodes.size > 1) {
    return null;
  }

  return selectedNodes.first();
};

// Retrieves the target node, if it's set, or the first selected node otherwise
export const getSingleTargetNode = (state: FileTreeStore): ?FileTreeNode => {
  if (state._targetNodeKeys) {
    const targetNode = getNode(
      state,
      state._targetNodeKeys.rootKey,
      state._targetNodeKeys.nodeKey,
    );
    if (targetNode) {
      return targetNode;
    }
  }
  return getSingleSelectedNode(state);
};

export const getNode = (
  state: FileTreeStore,
  rootKey: NuclideUri,
  nodeKey: NuclideUri,
): ?FileTreeNode => {
  const rootNode = state._roots.get(rootKey);

  if (rootNode == null) {
    return null;
  }

  return rootNode.find(nodeKey);
};

export const getRootForPath = (
  state: FileTreeStore,
  nodeKey: NuclideUri,
): ?FileTreeNode => {
  const rootNode = state._roots.find(root => nodeKey.startsWith(root.uri));
  return rootNode || null;
};
export const isEditingWorkingSet = (state: FileTreeStore): boolean => {
  return state._conf.isEditingWorkingSet;
};

/**
 * Builds the edited working set from the partially-child-derived .checkedStatus property
 */
export const getEditedWorkingSet = (state: FileTreeStore): WorkingSet => {
  return state._conf.editedWorkingSet;
};

export const isEditedWorkingSetEmpty = (state: FileTreeStore): boolean => {
  return state._roots.every(root => root.checkedStatus === 'clear');
};

export const getOpenFilesWorkingSet = (state: FileTreeStore): WorkingSet => {
  return state._conf.openFilesWorkingSet;
};

export const hasCwd = (state: FileTreeStore): boolean => {
  return state._cwdKey != null;
};

export const getFilter = (state: FileTreeStore): string => {
  return state._filter;
};

export const getExtraProjectSelectionContent = (
  state: FileTreeStore,
): Immutable.List<React.Element<any>> => {
  return state._extraProjectSelectionContent;
};

export const getFilterFound = (state: FileTreeStore): boolean => {
  return state._roots.some(root => root.containsFilterMatches);
};

export const collectDebugState = (state: FileTreeStore): Object => {
  return {
    currentWorkingRoot: getCwdKey(state),
    openFilesExpanded: state._openFilesExpanded,
    uncommittedChangesExpanded: state._uncommittedChangesExpanded,
    foldersExpanded: state._foldersExpanded,
    reorderPreviewStatus: state._reorderPreviewStatus,
    _filter: state._filter,
    _selectionRange: state._selectionRange,
    _targetNodeKeys: state._targetNodeKeys,
    _trackedRootKey: state._trackedRootKey,
    _trackedNodeKey: state._trackedNodeKey,
    _isCalculatingChanges: state._isCalculatingChanges,

    roots: Array.from(state._roots.values()).map(root =>
      root.collectDebugState(),
    ),
    _conf: {
      hideIgnoredNames: state._conf.hideIgnoredNames,
      excludeVcsIgnoredPaths: state._conf.excludeVcsIgnoredPaths,
      hideVcsIgnoredPaths: state._conf.hideVcsIgnoredPaths,
      usePreviewTabs: state._conf.usePreviewTabs,
      focusEditorOnFileSelection: state._conf.focusEditorOnFileSelection,
      isEditingWorkingSet: state._conf.isEditingWorkingSet,
      vcsStatuses: state._conf.vcsStatuses.toObject(),
      workingSet: state._conf.workingSet.getUris(),
      ignoredPatterns: state._conf.ignoredPatterns
        .toArray()
        .map(ignored => ignored.pattern),
      openFilesWorkingSet: state._conf.openFilesWorkingSet.getUris(),
      editedWorkingSet: state._conf.editedWorkingSet.getUris(),
    },
    selectionManager: collectSelectionDebugState(state),
  };
};

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

export const getNodeByIndex = (state: FileTreeStore) => {
  return function(index: number) {
    const firstRoot = getRoots(state).find(r => r.shouldBeShown);
    if (firstRoot == null) {
      return null;
    }

    return firstRoot.findByIndex(index);
  };
};

export const getCwdApi = (state: FileTreeStore) => {
  return state._cwdApi;
};

export const getLoading = (state: FileTreeStore, nodeKey: NuclideUri) =>
  state._isLoadingMap.get(nodeKey);

export const getAutoExpandSingleChild = (state: FileTreeStore) =>
  state._autoExpandSingleChild;

export const getConf = (state: FileTreeStore) => state._conf;

export const getVersion = (state: FileTreeStore) => state.VERSION;

export const collectSelectionDebugState = (state: FileTreeStore) => ({
  _selectedNodes: getSelectedNodes(state)
    .toArray()
    .map(node => node.uri),
  _focusedNodes: getFocusedNodes(state)
    .toArray()
    .map(node => node.uri),
});

export const getNodeIsSelected = (state: FileTreeStore, node: FileTreeNode) =>
  state._selectedUris.get(node.rootUri, Immutable.Set()).has(node.uri);

export const getNodeIsFocused = (state: FileTreeStore, node: FileTreeNode) =>
  state._focusedUris.get(node.rootUri, Immutable.Set()).has(node.uri);
