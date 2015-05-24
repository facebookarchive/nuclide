'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

class LazyTreeNode {
  _children: ?Immutable.List;
  _pendingFetch: ?Promise;

  /**
   * @param fetchChildren returns a Promise that resolves to an Immutable.List
   *     of LazyTreeNode objects.
   */
  constructor(
      item: any,
      parent: ?LazyTreeNode,
      isContainer: boolean,
      fetchChildren: (node: LazyTreeNode) => Promise) {
    this._item = item;
    this._parent = parent;
    this._isContainer = isContainer;
    this._fetchChildren = fetchChildren;
    this._children = null;
    this._isCacheValid = false;
    this._pendingFetch = null;
    this._key = null;
  }

  isRoot(): boolean {
    return this._parent === null;
  }

  getParent(): ?LazyTreeNode {
    return this._parent;
  }

  getItem(): any {
    return this._item;
  }

  getCachedChildren(): ?Immutable.List<LazyTreeNode> {
    return this._children;
  }

  fetchChildren(): Promise {
    if (!this._pendingFetch) {
      this._pendingFetch = this._fetchChildren(this)
          .then((children) => {
            // Store the children before returning them from the Promise.
            this._children = children;
            this._isCacheValid = true;
            return children;
          });

      // Make sure that whether the fetch succeeds or fails, the _pendingFetch
      // field is cleared.
      var clear = () => { this._pendingFetch = null; };
      this._pendingFetch.then(clear, clear);
    }
    return this._pendingFetch;
  }

  /**
   * Each node should have a key that uniquely identifies it among the
   * LazyTreeNodes that make up the tree.
   */
  getKey(): string {
    if (!this._key) {
      // TODO(mbolin): Escape slashes.
      var prefix = this._parent ? this._parent.getKey() : '/';
      var suffix = this._isContainer ? '/' : '';
      this._key = prefix + this.getLabel() + suffix;
    }
    return this._key;
  }

  /**
   * @return the string that the tree UI should display for the node
   */
  getLabel(): string {
    throw new Error('subclasses must override this method');
  }

  isContainer(): boolean {
    return this._isContainer;
  }

  isCacheValid(): boolean {
    return this._isCacheValid;
  }

  invalidateCache(): void {
    this._isCacheValid = false;
  }
}

module.exports = LazyTreeNode;
