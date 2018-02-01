/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {ClangFlags} from './rpc-types';

import {arrayEqual} from 'nuclide-commons/collection';

// Currently handles are just indices into the flag pool.
export type ClangFlagsHandle = number;

function flagsAreEqual(left: ClangFlags, right: ClangFlags): boolean {
  return (
    left.directory === right.directory &&
    left.flagsFile === right.flagsFile &&
    arrayEqual(left.flags, right.flags)
  );
}

export default class ClangFlagsPool {
  _pool: Array<ClangFlags> = [];

  getHandle(flags: ClangFlags): ClangFlagsHandle {
    const index = this._pool.findIndex(candidate =>
      flagsAreEqual(flags, candidate),
    );
    if (index !== -1) {
      return index;
    } else {
      this._pool.push(flags);
      return this._pool.length - 1;
    }
  }

  getFlags(handle: ClangFlagsHandle): ?ClangFlags {
    // Remark: out of bounds array access will return `undefined.`
    return this._pool[handle];
  }

  reset() {
    // This method of clearing the pool only works because the clang flags
    // manager also clears its Handle references at the same time.
    // Ideally we would include a version token in the Handle struct during
    // getHandle and match that against an internal version in getFlags.
    this._pool = [];
  }
}
