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
import FileTreeDispatcher from './FileTreeDispatcher';
import FileTreeHelpers from './FileTreeHelpers';
import FileTreeStore from './FileTreeStore';
import Immutable from 'immutable';

let instance: ?Object;

/**
 * Implements the Flux pattern for our file tree. All state for the file tree will be kept in
 * FileTreeStore and the only way to update the store is through methods on FileTreeActions. The
 * dispatcher is a mechanism through which FileTreeActions interfaces with FileTreeStore.
 */
class FileTreeActions {
  _dispatcher: Dispatcher;
  _store: FileTreeStore;

  static getInstance(): FileTreeActions {
    if (!instance) {
      instance = new FileTreeActions();
    }
    return instance;
  }

  constructor() {
    this._dispatcher = FileTreeDispatcher.getInstance();
    this._store = FileTreeStore.getInstance();
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
  ensureChildNode(rootKey: string, nodeKey: string, childKey: string): void {
    if (this._store.getChildKeys(rootKey, nodeKey).indexOf(childKey) !== -1) {
      return;
    }
    this._dispatcher.dispatch({
      actionType: ActionType.CREATE_CHILD,
      rootKey,
      nodeKey,
      childKey,
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

  toggleSelectNode(rootKey: string, nodeKey: string): void {
    let nodeKeys = this._store.getSelectedKeys(rootKey);
    if (nodeKeys.has(nodeKey)) {
      nodeKeys = nodeKeys.delete(nodeKey);
    } else {
      nodeKeys = nodeKeys.add(nodeKey);
    }
    this._dispatcher.dispatch({
      actionType: ActionType.SET_SELECTED_NODES_FOR_ROOT,
      rootKey,
      nodeKeys,
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

  selectSingleNode(rootKey: string, nodeKey: string): void {
    const selectedKeysByRoot = {};
    selectedKeysByRoot[rootKey] = new Immutable.Set([nodeKey]);
    this._dispatcher.dispatch({
      actionType: ActionType.SET_SELECTED_NODES_FOR_TREE,
      selectedKeysByRoot,
    });
  }

  confirmNode(rootKey: string, nodeKey: string): void {
    const isDirectory = FileTreeHelpers.isDirKey(nodeKey);
    if (isDirectory) {
      const actionType = this._store.isExpanded(rootKey, nodeKey) ?
        ActionType.COLLAPSE_NODE :
        ActionType.EXPAND_NODE;
      this._dispatcher.dispatch({
        actionType: actionType,
        nodeKey,
        rootKey,
      });
    } else {
      atom.workspace.open(
        FileTreeHelpers.keyToPath(nodeKey),
        {
          activatePane: true,
          searchAllPanes: true,
        }
      );
    }
  }

  openSelectedEntrySplit(nodeKey: string, orientation: string, side: string): void {
    const pane = atom.workspace.getActivePane();
    atom.workspace.openURIInPane(
      FileTreeHelpers.keyToPath(nodeKey),
      pane.split(orientation, side)
    );
  }

  setVcsStatuses(rootKey: string, vcsStatuses: {[path: string]: number}): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_VCS_STATUSES,
      rootKey,
      vcsStatuses,
    });
  }
}

module.exports = FileTreeActions;
