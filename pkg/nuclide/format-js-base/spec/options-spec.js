'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const DefaultModuleMap = require('../lib/state/DefaultModuleMap');

const jscs = require('jscodeshift');
const printRoot = require('../lib/utils/printRoot');
const {readFile} = require('nuclide-commons').fsPromise;
const requiresTransform = require('../lib/requires/transform');

describe('options', () => {
  it('should respect blacklist options', () => {
    const testPath = 'fixtures/options/respect-blacklist.test';
    const expectedPath = 'fixtures/options/respect-blacklist.expected';
    waitsForPromise(async () => {
      const test = await readFile(testPath, 'utf8');

      const root = jscs(test);
      requiresTransform(root, {
        moduleMap: DefaultModuleMap,
        blacklist: new Set(['requires.removeUnusedRequires']),
      });
      const actual = printRoot(root);

      const expected = await readFile(expectedPath, 'utf8');
      expect(actual).toBe(expected);
    });
  });
});
