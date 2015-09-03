/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * {@link http://electron.atom.io/docs/v0.31.0/api/shell/}
 */
declare module 'shell' {
  declare function moveItemToTrash(fullPath: string): boolean;
}
