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

import type {Observable} from 'rxjs';
import type {RevisionTree, RevisionPreview} from './revisionTree/RevisionTree';

export type TreePreviewApplierFunction = (
  tree: RevisionTree,
  previewType: ?RevisionPreview,
) => [Array<RevisionTree>, ?RevisionPreview];

/**
 * This interface defines an operation to be run by hg. This includes arguments,
 * human-readable command information, how to preview this operation, and when
 * this operation will be marked as "completed".
 *
 * These objects are instantiated by the user and sent to the hg service to be run.
 */
export interface HgOperation {
  // Human-readable name of this operation
  name: string;

  // return the arguments passed to hg to run this command
  getArgs(): Array<string>;

  // Human-readable equivalent
  getEquivalentCommand(): string;

  // How to traverse and modify the commit tree to preview this operation before actually running it
  +makePreviewApplier?: (
    baseTree: Array<RevisionTree>,
  ) => TreePreviewApplierFunction;

  // While an operation is running or when waiting for smartlog to refresh after running,
  // we want to show optimistic state. This optimistic preview applier might change
  // over the course of an operation's execution, so the functions to apply are observed.
  // This function is used by the hg service and the results are passed back for consumption via HgOperationProgress.
  +makeOptimisticStateApplier?: (
    treeObservable: Observable<Array<RevisionTree>>,
  ) => Observable<?TreePreviewApplierFunction>;
}
