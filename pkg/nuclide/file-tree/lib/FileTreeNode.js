'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type FileTreeStore from './FileTreeStore';

import FileTreeHelpers from './FileTreeHelpers';
import RemoteUri from '../../remote-uri';

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

  usePreviewTabs(): boolean {
    return this._store.usePreviewTabs();
  }

  getVcsStatusCode(): ?number {
    return this._store.getVcsStatusCode(this.rootKey, this.nodeKey);
  }

  getParentNode(): FileTreeNode {
    return this._store.getNode(this.rootKey, FileTreeHelpers.getParentKey(this.nodeKey));
  }

  getChildKeys(): Array<string> {
    return this._store.getChildKeys(this.rootKey, this.nodeKey);
  }

  getChildNodes(): Array<FileTreeNode> {
    const childKeys = this._store.getChildKeys(this.rootKey, this.nodeKey);
    return childKeys.map(childKey => this._store.getNode(this.rootKey, childKey));
  }

  getRelativePath(): string {
    return this.nodePath.slice(this.rootKey.length);
  }

  // For remote files we want the local path instead of full path.
  // i.e, "/home/dir/file" vs "nuclide://hostname:123/home/dir/file"
  getLocalPath(): string {
    const path = this.nodePath;
    if (RemoteUri.isRemote(path)) {
      return RemoteUri.parse(path).pathname;
    } else {
      return path;
    }
  }

  getCheckedStatus(): string {
    if (!this._store.isEditingWorkingSet()) {
      return '';
    }

    const editedWorkingSet = this._store.getEditedWorkingSet();

    if (editedWorkingSet.isEmpty()) {
      return 'clear';
    }

    if (this.isContainer) {
      if (editedWorkingSet.containsFile(this.nodeKey)) {
        return 'checked';
      } else if (editedWorkingSet.containsDir(this.nodeKey)) {
        return 'partial';
      }

      return 'clear';
    } else {
      if (editedWorkingSet.containsFile(this.nodeKey)) {
        return 'checked';
      }

      return 'clear';
    }
  }

  shouldBeSoftened(): boolean {
    if (this._store.isEditingWorkingSet()) {
      return false;
    }

    const workingSet = this._store.getWorkingSet();
    const openFilesWs = this._store.getOpenFilesWorkingSet();

    if (!workingSet || !openFilesWs || openFilesWs.isEmpty()) {
      return false;
    }

    if (this.isContainer) {
      if (!workingSet.containsDir(this.nodeKey) && openFilesWs.containsDir(this.nodeKey)) {
        return true;
      }

      return false;
    } else {
      if (!workingSet.containsFile(this.nodeKey) && openFilesWs.containsFile(this.nodeKey)) {
        return true;
      }

      return false;
    }
  }
}

module.exports = FileTreeNode;
