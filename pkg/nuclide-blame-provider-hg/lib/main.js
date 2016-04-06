'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BlameProvider} from '../../nuclide-blame-base';

let blameProvider;

export function activate(state: ?Object): void {
}

export function provideHgBlameProvider(): BlameProvider {
  if (!blameProvider) {
    blameProvider = require('./HgBlameProvider');
  }
  return blameProvider;
}
