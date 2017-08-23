'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class LazyTreeNode {

  /**
   * @param fetchChildren returns a Promise that resolves to an Immutable.List
   *     of LazyTreeNode objects.
   */


  // Private

  // Protected
  constructor(item, parent, isContainer, fetchChildren) {
    this.__item = item;
    this.__parent = parent;
    this.__isContainer = isContainer;
    this._fetchChildren = fetchChildren;
    this._children = null;
    this._isCacheValid = false;
    this._pendingFetch = null;
    this.__key = null;
  }

  isRoot() {
    return this.__parent === null;
  }

  getParent() {
    return this.__parent;
  }

  getItem() {
    return this.__item;
  }

  getCachedChildren() {
    return this._children;
  }

  fetchChildren() {
    let pendingFetch = this._pendingFetch;
    if (!pendingFetch) {
      pendingFetch = this._fetchChildren(this).then(children => {
        // Store the children before returning them from the Promise.
        this._children = children;
        this._isCacheValid = true;
        return children;
      });
      this._pendingFetch = pendingFetch;

      // Make sure that whether the fetch succeeds or fails, the _pendingFetch
      // field is cleared.
      const clear = () => {
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
  getKey() {
    let key = this.__key;
    // flowlint-next-line sketchy-null-string:off
    if (!key) {
      // TODO(mbolin): Escape slashes.
      const prefix = this.__parent ? this.__parent.getKey() : '/';
      const suffix = this.__isContainer ? '/' : '';
      key = prefix + this.getLabel() + suffix;
      this.__key = key;
    }
    return key;
  }

  /**
   * @return the string that the tree UI should display for the node
   */
  getLabel() {
    throw new Error('subclasses must override this method');
  }

  /**
   * This can return a richer element for a node and will be used instead of the label if present.
   */
  getLabelElement() {
    return null;
  }

  isContainer() {
    return this.__isContainer;
  }

  isCacheValid() {
    return this._isCacheValid;
  }

  invalidateCache() {
    this._isCacheValid = false;
  }
}
exports.LazyTreeNode = LazyTreeNode; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */

// flowlint-next-line untyped-type-import:off