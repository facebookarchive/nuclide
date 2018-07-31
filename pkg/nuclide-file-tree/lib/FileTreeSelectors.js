"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCwdApi = exports.getNodeByIndex = exports.getRoots = exports.getOpenFilesExpanded = exports.getUncommittedChangesExpanded = exports.getFoldersExpanded = exports.collectDebugState = exports.getFilterFound = exports.getExtraProjectSelectionContent = exports.getFilter = exports.hasCwd = exports.getOpenFilesWorkingSet = exports.isEditedWorkingSetEmpty = exports.getEditedWorkingSet = exports.isEditingWorkingSet = exports.getRootForPath = exports.getNode = exports.getSingleTargetNode = exports.getSingleSelectedNode = exports.getTargetNodes = exports.getFocusedNodes = exports.getSelectedNodes = exports.usePrefixNav = exports.getIsCalculatingChanges = exports.getGeneratedOpenChangedFiles = exports.getFileChanges = exports.isEmpty = exports.getCwdKey = exports.getRootKeys = exports.getWorkingSetsStore = exports.getWorkingSet = exports.getRepositories = exports.getTrackedNode = exports.serialize = void 0;

function _FileTreeNode() {
  const data = require("./FileTreeNode");

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

function _nuclideWorkingSetsCommon() {
  const data = require("../../nuclide-working-sets-common");

  _nuclideWorkingSetsCommon = function () {
    return data;
  };

  return data;
}

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
const serialize = state => {
  const rootKeys = state._roots.valueSeq().toArray().map(root => root.uri);

  return {
    version: state.VERSION,
    childKeyMap: {},
    expandedKeysByRoot: {},
    rootKeys,
    selectedKeysByRoot: {},
    openFilesExpanded: state._openFilesExpanded,
    uncommittedChangesExpanded: state._uncommittedChangesExpanded,
    foldersExpanded: state._foldersExpanded
  };
};

exports.serialize = serialize;

const getTrackedNode = state => {
  if (state._trackedRootKey == null || state._trackedNodeKey == null) {
    return null;
  }

  return getNode(state, state._trackedRootKey, state._trackedNodeKey);
};

exports.getTrackedNode = getTrackedNode;

const getRepositories = state => {
  return state._repositories;
};

exports.getRepositories = getRepositories;

const getWorkingSet = state => {
  return state._conf.workingSet;
};

exports.getWorkingSet = getWorkingSet;

const getWorkingSetsStore = state => {
  return state._workingSetsStore;
};

exports.getWorkingSetsStore = getWorkingSetsStore;

const getRootKeys = state => {
  return state._roots.valueSeq().toArray().map(root => root.uri);
};

exports.getRootKeys = getRootKeys;

const getCwdKey = state => {
  return state._cwdKey;
};
/**
 * Returns true if the store has no data, i.e. no roots, no children.
 */


exports.getCwdKey = getCwdKey;

const isEmpty = state => {
  return state._roots.isEmpty();
};

exports.isEmpty = isEmpty;

const getFileChanges = state => {
  return state._fileChanges;
};

exports.getFileChanges = getFileChanges;

const getGeneratedOpenChangedFiles = state => {
  return state._generatedOpenChangedFiles;
};

exports.getGeneratedOpenChangedFiles = getGeneratedOpenChangedFiles;

const getIsCalculatingChanges = state => {
  return state._isCalculatingChanges;
};

exports.getIsCalculatingChanges = getIsCalculatingChanges;

const usePrefixNav = state => {
  return state._usePrefixNav;
};

exports.usePrefixNav = usePrefixNav;

const getSelectedNodes = state => {
  return Immutable().List(state._selectionManager.selectedNodes().values());
};

exports.getSelectedNodes = getSelectedNodes;

const getFocusedNodes = state => {
  return Immutable().List(state._selectionManager.focusedNodes().values());
}; // Retrieves target node in an immutable list if it's set, or all selected
// nodes otherwise


exports.getFocusedNodes = getFocusedNodes;

const getTargetNodes = state => {
  if (state._targetNodeKeys) {
    const targetNode = getNode(state, state._targetNodeKeys.rootKey, state._targetNodeKeys.nodeKey);

    if (targetNode) {
      return Immutable().List([targetNode]);
    }
  }

  return getSelectedNodes(state);
};
/**
 * Returns a node if it is the only one selected, or null otherwise
 */


exports.getTargetNodes = getTargetNodes;

const getSingleSelectedNode = state => {
  const selectedNodes = getSelectedNodes(state);

  if (selectedNodes.isEmpty() || selectedNodes.size > 1) {
    return null;
  }

  return selectedNodes.first();
}; // Retrieves the target node, if it's set, or the first selected node otherwise


exports.getSingleSelectedNode = getSingleSelectedNode;

const getSingleTargetNode = state => {
  if (state._targetNodeKeys) {
    const targetNode = getNode(state, state._targetNodeKeys.rootKey, state._targetNodeKeys.nodeKey);

    if (targetNode) {
      return targetNode;
    }
  }

  return getSingleSelectedNode(state);
};

exports.getSingleTargetNode = getSingleTargetNode;

const getNode = (state, rootKey, nodeKey) => {
  const rootNode = state._roots.get(rootKey);

  if (rootNode == null) {
    return null;
  }

  return rootNode.find(nodeKey);
};

exports.getNode = getNode;

const getRootForPath = (state, nodeKey) => {
  const rootNode = state._roots.find(root => nodeKey.startsWith(root.uri));

  return rootNode || null;
};

exports.getRootForPath = getRootForPath;

const isEditingWorkingSet = state => {
  return state._conf.isEditingWorkingSet;
};
/**
 * Builds the edited working set from the partially-child-derived .checkedStatus property
 */


exports.isEditingWorkingSet = isEditingWorkingSet;

const getEditedWorkingSet = state => {
  return state._conf.editedWorkingSet;
};

exports.getEditedWorkingSet = getEditedWorkingSet;

const isEditedWorkingSetEmpty = state => {
  return state._roots.every(root => root.checkedStatus === 'clear');
};

exports.isEditedWorkingSetEmpty = isEditedWorkingSetEmpty;

const getOpenFilesWorkingSet = state => {
  return state._conf.openFilesWorkingSet;
};

exports.getOpenFilesWorkingSet = getOpenFilesWorkingSet;

const hasCwd = state => {
  return state._cwdKey != null;
};

exports.hasCwd = hasCwd;

const getFilter = state => {
  return state._filter;
};

exports.getFilter = getFilter;

const getExtraProjectSelectionContent = state => {
  return state._extraProjectSelectionContent;
};

exports.getExtraProjectSelectionContent = getExtraProjectSelectionContent;

const getFilterFound = state => {
  return state._roots.some(root => root.containsFilterMatches);
};

exports.getFilterFound = getFilterFound;

const collectDebugState = state => {
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
    roots: Array.from(state._roots.values()).map(root => root.collectDebugState()),
    _conf: state._confCollectDebugState(),
    selectionManager: state._selectionManager.collectDebugState()
  };
};

exports.collectDebugState = collectDebugState;

const getFoldersExpanded = state => {
  return state._foldersExpanded;
};

exports.getFoldersExpanded = getFoldersExpanded;

const getUncommittedChangesExpanded = state => {
  return state._uncommittedChangesExpanded;
};

exports.getUncommittedChangesExpanded = getUncommittedChangesExpanded;

const getOpenFilesExpanded = state => {
  return state._openFilesExpanded;
};

exports.getOpenFilesExpanded = getOpenFilesExpanded;

const getRoots = state => {
  return state._roots;
};

exports.getRoots = getRoots;

const getNodeByIndex = state => {
  return function (index) {
    const firstRoot = getRoots(state).find(r => r.shouldBeShown);

    if (firstRoot == null) {
      return null;
    }

    return firstRoot.findByIndex(index);
  };
};

exports.getNodeByIndex = getNodeByIndex;

const getCwdApi = state => {
  return state._cwdApi;
};

exports.getCwdApi = getCwdApi;