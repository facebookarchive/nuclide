'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {runTest} from './lib/related-files-common';

describe('Remote Related Files Integration Test', () => {
  it('is able to switch between related files', () => {
    runTest(/*remote*/ true);
  });
});
