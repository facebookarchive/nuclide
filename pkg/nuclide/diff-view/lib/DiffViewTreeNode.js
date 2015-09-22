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
var {basename} = require('nuclide-remote-uri');
var {FileChangeStatusToPrefix} = require('./constants');

import type {FileChange} from './types';

class DiffViewTreeNode extends LazyTreeNode {

  constructor(
    entry: FileChange,
    parent: ?DiffViewTreeNode,
    isContainer: boolean,
    fetchChildren: (node: DiffViewTreeNode) => Promise
  ) {
    super(entry, parent, isContainer, fetchChildren);
  }

  getLabel(): string {
    var item: FileChange = this.getItem();
    var fileName = basename(item.filePath);
    return (this.isContainer() || !item.statusCode)
      ? fileName
      : ((FileChangeStatusToPrefix[item.statusCode] || '') + fileName);
  }

  getKey(): string {
    return this.getItem().filePath;
  }

}

module.exports = DiffViewTreeNode;
