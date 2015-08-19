'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {ActionType} = require('./FileTreeConstants');
var FileTreeDispatcher = require('./FileTreeDispatcher');
var FileTreeHelpers = require('./FileTreeHelpers');
var FileTreeStore = require('./FileTreeStore');

import type {Dispatcher} from 'flux';

var instance: FileTreeActions;

/*
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
    var existingRootKeySet: Set<string> = new Set(this._store.getRootKeys());
    var addedRootKeys: Array<string> = rootKeys.filter(
      key => !existingRootKeySet.has(key)
    );
    this._dispatcher.dispatch({
      actionType: ActionType.SET_ROOT_KEYS,
      rootKeys,
    });
    for (var rootKey: string of addedRootKeys) {
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

  collapseNode(rootKey: string, nodeKey: string): void {
    this._dispatcher.dispatch({
      actionType: ActionType.COLLAPSE_NODE,
      rootKey,
      nodeKey,
    });
  }

  confirmNode(rootKey: string, nodeKey: string): void {
    var isDirectory = FileTreeHelpers.isDirKey(nodeKey);
    if (isDirectory) {
      var actionType = this._store.isExpanded(rootKey, nodeKey) ?
        ActionType.COLLAPSE_NODE :
        ActionType.EXPAND_NODE;
      this._dispatcher.dispatch({
        actionType: actionType,
        rootKey,
        nodeKey,
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
}

module.exports = FileTreeActions;
