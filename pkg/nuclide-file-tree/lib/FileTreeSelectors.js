'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCwdApi = exports.getNodeByIndex = exports.getRoots = exports.getOpenFilesExpanded = exports.getUncommittedChangesExpanded = exports.getFoldersExpanded = exports.getMaxComponentWidth = exports.collectDebugState = exports.getFilterFound = exports.getExtraProjectSelectionContent = exports.getFilter = exports.hasCwd = exports.getOpenFilesWorkingSet = exports.isEditedWorkingSetEmpty = exports.getEditedWorkingSet = exports.isEditingWorkingSet = exports.getRootForPath = exports.getNode = exports.getSingleTargetNode = exports.getSingleSelectedNode = exports.getTargetNodes = exports.getFocusedNodes = exports.getSelectedNodes = exports.usePrefixNav = exports.getIsCalculatingChanges = exports.getGeneratedOpenChangedFiles = exports.getFileChanges = exports.isEmpty = exports.getCwdKey = exports.getRootKeys = exports.getWorkingSetsStore = exports.getWorkingSet = exports.getRepositories = exports.getTrackedNode = exports.serialize = undefined;

var _FileTreeNode;

function _load_FileTreeNode() {
  return _FileTreeNode = require('./FileTreeNode');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

var _nuclideWorkingSetsCommon;

function _load_nuclideWorkingSetsCommon() {
  return _nuclideWorkingSetsCommon = require('../../nuclide-working-sets-common');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// $FlowFixMe(>=0.53.0) Flow suppress
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

const serialize = exports.serialize = state => {
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

const getTrackedNode = exports.getTrackedNode = state => {
  if (state._trackedRootKey == null || state._trackedNodeKey == null) {
    return null;
  }

  return getNode(state, state._trackedRootKey, state._trackedNodeKey);
};

const getRepositories = exports.getRepositories = state => {
  return state._repositories;
};

const getWorkingSet = exports.getWorkingSet = state => {
  return state._conf.workingSet;
};

const getWorkingSetsStore = exports.getWorkingSetsStore = state => {
  return state._workingSetsStore;
};

const getRootKeys = exports.getRootKeys = state => {
  return state._roots.valueSeq().toArray().map(root => root.uri);
};

const getCwdKey = exports.getCwdKey = state => {
  return state._cwdKey;
};

/**
 * Returns true if the store has no data, i.e. no roots, no children.
 */
const isEmpty = exports.isEmpty = state => {
  return state._roots.isEmpty();
};

const getFileChanges = exports.getFileChanges = state => {
  return state._fileChanges;
};

const getGeneratedOpenChangedFiles = exports.getGeneratedOpenChangedFiles = state => {
  return state._generatedOpenChangedFiles;
};

const getIsCalculatingChanges = exports.getIsCalculatingChanges = state => {
  return state._isCalculatingChanges;
};

const usePrefixNav = exports.usePrefixNav = state => {
  return state._usePrefixNav;
};

const getSelectedNodes = exports.getSelectedNodes = state => {
  return (_immutable || _load_immutable()).List(state._selectionManager.selectedNodes().values());
};

const getFocusedNodes = exports.getFocusedNodes = state => {
  return (_immutable || _load_immutable()).List(state._selectionManager.focusedNodes().values());
};

// Retrieves target node in an immutable list if it's set, or all selected
// nodes otherwise
const getTargetNodes = exports.getTargetNodes = state => {
  if (state._targetNodeKeys) {
    const targetNode = getNode(state, state._targetNodeKeys.rootKey, state._targetNodeKeys.nodeKey);
    if (targetNode) {
      return (_immutable || _load_immutable()).List([targetNode]);
    }
  }
  return getSelectedNodes(state);
};

/**
 * Returns a node if it is the only one selected, or null otherwise
 */
const getSingleSelectedNode = exports.getSingleSelectedNode = state => {
  const selectedNodes = getSelectedNodes(state);

  if (selectedNodes.isEmpty() || selectedNodes.size > 1) {
    return null;
  }

  return selectedNodes.first();
};

// Retrieves the target node, if it's set, or the first selected node otherwise
const getSingleTargetNode = exports.getSingleTargetNode = state => {
  if (state._targetNodeKeys) {
    const targetNode = getNode(state, state._targetNodeKeys.rootKey, state._targetNodeKeys.nodeKey);
    if (targetNode) {
      return targetNode;
    }
  }
  return getSingleSelectedNode(state);
};

const getNode = exports.getNode = (state, rootKey, nodeKey) => {
  const rootNode = state._roots.get(rootKey);

  if (rootNode == null) {
    return null;
  }

  return rootNode.find(nodeKey);
};

const getRootForPath = exports.getRootForPath = (state, nodeKey) => {
  const rootNode = state._roots.find(root => nodeKey.startsWith(root.uri));
  return rootNode || null;
};
const isEditingWorkingSet = exports.isEditingWorkingSet = state => {
  return state._conf.isEditingWorkingSet;
};

/**
 * Builds the edited working set from the partially-child-derived .checkedStatus property
 */
const getEditedWorkingSet = exports.getEditedWorkingSet = state => {
  return state._conf.editedWorkingSet;
};

const isEditedWorkingSetEmpty = exports.isEditedWorkingSetEmpty = state => {
  return state._roots.every(root => root.checkedStatus === 'clear');
};

const getOpenFilesWorkingSet = exports.getOpenFilesWorkingSet = state => {
  return state._conf.openFilesWorkingSet;
};

const hasCwd = exports.hasCwd = state => {
  return state._cwdKey != null;
};

const getFilter = exports.getFilter = state => {
  return state._filter;
};

const getExtraProjectSelectionContent = exports.getExtraProjectSelectionContent = state => {
  return state._extraProjectSelectionContent;
};

const getFilterFound = exports.getFilterFound = state => {
  return state._roots.some(root => root.containsFilterMatches);
};

const collectDebugState = exports.collectDebugState = state => {
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

const getMaxComponentWidth = exports.getMaxComponentWidth = state => {
  return state._maxComponentWidth;
};

const getFoldersExpanded = exports.getFoldersExpanded = state => {
  return state._foldersExpanded;
};

const getUncommittedChangesExpanded = exports.getUncommittedChangesExpanded = state => {
  return state._uncommittedChangesExpanded;
};

const getOpenFilesExpanded = exports.getOpenFilesExpanded = state => {
  return state._openFilesExpanded;
};

const getRoots = exports.getRoots = state => {
  return state._roots;
};

const getNodeByIndex = exports.getNodeByIndex = state => {
  return function (index) {
    const firstRoot = getRoots(state).find(r => r.shouldBeShown);
    if (firstRoot == null) {
      return null;
    }

    return firstRoot.findByIndex(index);
  };
};

const getCwdApi = exports.getCwdApi = state => {
  return state._cwdApi;
};