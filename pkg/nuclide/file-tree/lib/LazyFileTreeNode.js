'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {LazyTreeNode} = require('nuclide-ui-tree');

class LazyFileTreeNode extends LazyTreeNode {

  constructor(
      file: atom$File | atom$Directory,
      parent: ?LazyFileTreeNode,
      fetchChildren: (node: LazyTreeNode) => Promise) {
    super(file, parent, file.isDirectory(), fetchChildren);
  }

  getKey(): string {
    if (!this.__key) {
      var label = this.__parent ? this.__parent.getKey() + this.getLabel() : this.getItem().getPath();
      var suffix = this.__isContainer && !label.endsWith('/') ? '/' : '';
      this.__key = label + suffix;
    }
    return this.__key;
  }

  getLabel(): string {
    return this.getItem().getBaseName();
  }

  isSymlink(): boolean {
    // The `symlink` property is assigned in the atom$Directory and atom$File
    // constructors with the `@symlink` class property syntax in its argument
    // list.
    return this.getItem().symlink;
  }

}

module.exports = LazyFileTreeNode;
