'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var DefaultModuleMap = require('../lib/state/DefaultModuleMap');

var jscs = require('jscodeshift');
var printRoot = require('../lib/utils/printRoot');
var {readFile} = require('nuclide-commons').fsPromise;
var requiresTransform = require('../lib/requires/transform');

describe('options', () => {
  it('should respect blacklist options', () => {
    var testPath = 'fixtures/options/respect-blacklist.test';
    var expectedPath = 'fixtures/options/respect-blacklist.expected';
    waitsForPromise(async () => {
      var test = await readFile(testPath, 'utf8');

      var root = jscs(test);
      requiresTransform(root, {
        moduleMap: DefaultModuleMap,
        blacklist: new Set(['requires.removeUnusedRequires']),
      });
      var actual = printRoot(root);

      var expected = await readFile(expectedPath, 'utf8');
      expect(actual).toBe(expected);
    });
  });
});
