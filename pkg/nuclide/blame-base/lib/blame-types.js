'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type BlameUpdate = {
  // Maps a buffer line number to a unixname. The unixname should be a plain
  // string, not HTML.
  changed: Map<number, string>;
  // A set of buffer line numbers that have been removed.
  deleted: Set<number>;
};

export type BlameProvider = {
  observeBlame: (callback: (b: BlameUpdate) => mixed) => atom$IDisposable;
};
