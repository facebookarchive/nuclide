'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Range} from 'atom';

import {getPackageUrlForRange} from '../lib/NPMHyperclickProvider';

const sampleJSON =
`{
  "someProperty": {
    "thing": 5
  },
  "dependencies": {
    "npm-package": {
      "what-is-this": "0.0.0"
    }
  }
}`;

describe('getPackageUrlForRange', () => {
  it('should provide an npm URL for a dependency', () => {
    expect(
      getPackageUrlForRange(
        sampleJSON,
        '"npm-package"',
        new Range([5, 4], [5, 17])
      )
    ).toEqual('https://www.npmjs.com/package/npm-package/');
  });

  it('should not provide a URL for a nested property in a dependency', () => {
    expect(
      getPackageUrlForRange(
        sampleJSON,
        '"what-is-this"',
        new Range([6, 6], [6, 20])
      )
    ).toBeNull();
  });

  it('should not provide a URL for the "dependencies" string itself', () => {
    expect(
      getPackageUrlForRange(
        sampleJSON,
        '"dependencies"',
        new Range([4, 2], [4, 16])
      )
    ).toBeNull();
  });

  it('should not provide a URL for non-dependencies', () => {
    expect(
      getPackageUrlForRange(
        sampleJSON,
        '"thing"',
        new Range([2, 4], [2, 11])
      )
    ).toBeNull();
  });
});
