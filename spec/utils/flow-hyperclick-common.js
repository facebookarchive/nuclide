'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TestContext} from './remotable-tests';

import {setup} from './flow-common';
import {waitsForHyperclickResult} from './hyperclick-common';

export function runTest(context: TestContext) {
  it('tests flow hyperclick example', () => {
    setup(context);

    waitsForHyperclickResult(
      [14, 13],
      'Foo.js',
      [11, 2],
    );
  });
}
