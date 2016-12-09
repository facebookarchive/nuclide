/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

export type TextEdit = {
  oldRange: atom$Range,
  newText: string,
  // If included, this will be used to verify that the edit still applies cleanly.
  oldText?: string,
};
