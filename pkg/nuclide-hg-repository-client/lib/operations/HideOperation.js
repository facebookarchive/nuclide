/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {Hash} from 'fb-vcs-common';
import type {HgOperation, TreePreviewApplierFunction} from '../HgOperation';
import type {RevisionTree, RevisionPreview} from '../revisionTree/RevisionTree';
import {ButtonTypes} from 'nuclide-commons-ui/Button';
import {
  RevisionPreviews,
  getRevisionTreeMapFromTree,
} from '../revisionTree/RevisionTree';

import {Observable} from 'rxjs';

export class HgHideOperation implements HgOperation {
  _hash: Hash;
  constructor(hash: Hash) {
    this._hash = hash;
  }

  name = 'hide';

  getArgs() {
    return ['hide', this._hash];
  }

  getEquivalentCommand() {
    return `hg hide ${this._hash}`;
  }

  getCommandDocumentation() {
    // TODO: Pass RevisionTree into constructor so we can determine how many
    // children will be affected and surface that here
    return {
      naturalLanguageDescription:
        'Removes the commit and all of its descendants',
      confirmationMessage: 'Are you sure you want to hide these commits?',
      confirmationButtonType: ButtonTypes.ERROR,
      confirmationButtonText: 'Hide commits',
    };
  }

  makePreviewApplier(
    baseTree: Array<RevisionTree>,
  ): TreePreviewApplierFunction {
    const hash = this._hash;
    const func: TreePreviewApplierFunction = (
      tree: RevisionTree,
      nodePreviewType: ?RevisionPreview,
    ) => {
      if (tree.info.hash === hash) {
        return [tree.children, RevisionPreviews.STRIP_ROOT];
      }
      return [tree.children, nodePreviewType];
    };
    return func;
  }

  makeOptimisticStateApplier(
    treeObservable: Observable<Array<RevisionTree>>,
  ): Observable<?TreePreviewApplierFunction> {
    const hash = this._hash;
    const func: TreePreviewApplierFunction = (
      tree: RevisionTree,
      nodePreviewType: ?RevisionPreview,
    ) => {
      if (tree.info.hash === hash) {
        // hide this subtree entirely
        return [[], RevisionPreviews.HIDDEN];
      }
      return [tree.children, nodePreviewType];
    };

    return treeObservable
      .takeWhile(trees => {
        const treeMap = getRevisionTreeMapFromTree(trees);
        // only apply optimistic state while the original commit is visible
        return treeMap.get(hash) != null;
      })
      .mapTo(func);
  }
}
