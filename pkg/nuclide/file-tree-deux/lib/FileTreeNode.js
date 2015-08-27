'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FileTreeHelpers = require('./FileTreeHelpers');

import type FileTreeStore from './FileTreeStore';

class FileTreeNode {
  _store: FileTreeStore;
  rootKey: string;
  nodeKey: string;
  nodePath: string;
  nodeName: string;
  isRoot: boolean;
  isContainer: boolean;

  constructor(store: FileTreeStore, rootKey: string, nodeKey: string) {
    this._store = store;
    this.rootKey = rootKey;
    this.nodeKey = nodeKey;
    this.nodePath = FileTreeHelpers.keyToPath(nodeKey);
    this.nodeName = FileTreeHelpers.keyToName(nodeKey);
    this.isRoot = rootKey === nodeKey;
    this.isContainer = FileTreeHelpers.isDirKey(nodeKey);
  }

  isLoading(): boolean {
    return this._store.isLoading(this.rootKey, this.nodeKey);
  }

  isExpanded(): boolean {
    return this._store.isExpanded(this.rootKey, this.nodeKey);
  }

  isSelected(): boolean {
    return this._store.isSelected(this.rootKey, this.nodeKey);
  }

  getChildKeys(): Array<string> {
    return this._store.getChildKeys(this.rootKey, this.nodeKey);
  }

  getChildNodes(): Array<FileTreeNode> {
    var childKeys = this._store.getChildKeys(this.rootKey, this.nodeKey);
    return childKeys.map(childKey => this._store.getNode(this.rootKey, childKey));
  }

  getRelativePath(): string {
    return this.nodePath.slice(this.rootKey.length);
  }
}

module.exports = FileTreeNode;
