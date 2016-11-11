'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TaskId} from './types';

export function taskIdsAreEqual(a: ?TaskId, b: ?TaskId): boolean {
  if (a == null || b == null) { return false; }
  return a.type === b.type && a.taskRunnerId === b.taskRunnerId;
}
