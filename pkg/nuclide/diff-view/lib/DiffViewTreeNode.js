'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {LazyTreeNode} from '../../ui/tree';
import {basename} from '../../remote-uri';
import {FileChangeStatusToPrefix} from './constants';

import type {FileChange} from './types';

export default class DiffViewTreeNode extends LazyTreeNode {

  constructor(
    entry: FileChange,
    parent: ?DiffViewTreeNode,
    isContainer: boolean,
    fetchChildren: (node: DiffViewTreeNode) => Promise
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
