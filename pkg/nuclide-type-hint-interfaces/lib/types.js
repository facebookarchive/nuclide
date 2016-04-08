'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type HintTree = {
  value: string;
  children?: Array<HintTree>;
};

export type TypeHint = {
  /**
   * A type hint string to display. One of hint and hintTree must be provided.
   */
  hint?: string;
  /**
   * A hint tree to display. If specified, overrides hint. The top-level value will be displayed,
   * and it can be expanded to reveal its children.
   */
  hintTree?: HintTree;
  range: atom$Range;
};

export type TypeHintProvider = {
  typeHint(editor: atom$TextEditor, bufferPosition: atom$Point): Promise<?TypeHint>;
  inclusionPriority: number;
  selector: string;
  // A unique name for the provider to be used for analytics. It is recommended that it be the name
  // of the provider's package.
  providerName: string;
};
