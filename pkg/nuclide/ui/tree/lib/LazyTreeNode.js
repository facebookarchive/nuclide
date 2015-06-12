'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Immutable from 'immutable';

class LazyTreeNode {

  // Protected
  __isContainer: boolean;
  __item: any;
  __key: ?string;
  __parent: ?LazyTreeNode;

  // Private
  _children: ?Immutable.List;
  _fetchChildren: (node: LazyTreeNode) => Promise;
  _isCacheValid: boolean;
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
    this.__item = item;
    this.__parent = parent;
    this.__isContainer = isContainer;
    this._fetchChildren = fetchChildren;
    this._children = null;
    this._isCacheValid = false;
    this._pendingFetch = null;
    this.__key = null;
  }

  isRoot(): boolean {
    return this.__parent === null;
  }

  getParent(): ?LazyTreeNode {
    return this.__parent;
  }

  getItem(): any {
    return this.__item;
  }

  getCachedChildren(): ?Immutable.List<LazyTreeNode> {
    return this._children;
  }

  fetchChildren(): Promise {
    var pendingFetch = this._pendingFetch;
    if (!pendingFetch) {
      pendingFetch = this._fetchChildren(this).then((children) => {
            // Store the children before returning them from the Promise.
            this._children = children;
            this._isCacheValid = true;
            return children;
          });
      this._pendingFetch = pendingFetch;

      // Make sure that whether the fetch succeeds or fails, the _pendingFetch
      // field is cleared.
      var clear = () => {
        this._pendingFetch = null;
      };
      pendingFetch.then(clear, clear);
    }
    return pendingFetch;
  }

  /**
   * Each node should have a key that uniquely identifies it among the
   * LazyTreeNodes that make up the tree.
   */
  getKey(): string {
    var key = this.__key;
    if (!key) {
      // TODO(mbolin): Escape slashes.
      var prefix = this.__parent ? this.__parent.getKey() : '/';
      var suffix = this.__isContainer ? '/' : '';
      key = prefix + this.getLabel() + suffix;
      this.__key = key;
    }
    return key;
  }

  /**
   * @return the string that the tree UI should display for the node
   */
  getLabel(): string {
    throw new Error('subclasses must override this method');
  }

  isContainer(): boolean {
    return this.__isContainer;
  }

  isCacheValid(): boolean {
    return this._isCacheValid;
  }

  invalidateCache(): void {
    this._isCacheValid = false;
  }

}

module.exports = LazyTreeNode;
