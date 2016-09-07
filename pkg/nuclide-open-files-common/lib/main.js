'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  AtomRange,
} from './rpc-types';

// Workaround for flow
export function convertRange(range: atom$Range): AtomRange {
  return {
    start: range.start,
    end: range.end,
  };
}
