'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {LazyTreeNode} from '../../nuclide-ui/lib/LazyTreeNode';
import {basename} from '../../nuclide-remote-uri';
import {FileChangeStatusToPrefix} from './constants';

import type {FileChange} from './types';

export default class DiffViewTreeNode extends LazyTreeNode {

  constructor(
    entry: FileChange,
    parent: ?LazyTreeNode,
    isContainer: boolean,
    fetchChildren: (node: LazyTreeNode) => Promise<any>,
  ) {
    super(entry, parent, isContainer, fetchChildren);
  }

  getLabel(): string {
    const item: FileChange = this.getItem();
    const fileName = basename(item.filePath);
    return (this.isContainer() || !item.statusCode)
      ? fileName
      : ((FileChangeStatusToPrefix[item.statusCode] || '') + fileName);
  }

  getKey(): string {
    return this.getItem().filePath;
  }

}
