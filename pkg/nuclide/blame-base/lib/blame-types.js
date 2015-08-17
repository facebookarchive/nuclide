'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Map of line number (0-indexed) to the name that line blames to.
export type BlameForEditor = Map<number, string>;

export type BlameProvider = {
  canProvideBlameForEditor: (editor: TextEditor) => boolean;
  getBlameForEditor: (editor: TextEditor) => Promise<BlameForEditor>;
};
