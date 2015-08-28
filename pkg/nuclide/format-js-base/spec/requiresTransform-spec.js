'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var jscodeshift = require('jscodeshift');
var {readFile} = require('nuclide-commons').fsPromise;

var printRoot = require('../lib/utils/printRoot');
var requiresTransform = require('../lib/requires/transform');

var TESTS = [
  'add-array-expressions',
  'add-assignments',
  'add-classes',
  'add-common-aliases',
  'add-constructor-arguments',
  'add-expressions',
  'add-function-calls',
  'add-if-elses',
  'add-jsx-elements',
  'add-loops',
  'add-object-properties',
  'add-polymorphic-types',
  'add-returns',
  'add-switches',
  'add-try-catches',
  'add-types',
  'demote-requires',
  'ignore-declared-jsx',
  'ignore-function-params',
  'promote-types',
  'remove-unused-requires',
  'remove-unused-types',
  'sort-requires',
];

describe('requiresTransform', () => {
  TESTS.forEach(name => {
    it(`should ${name}`, () => {
      var testPath = 'fixtures/requires/' + name + '.test';
      var expectedPath = 'fixtures/requires/' + name + '.expected';

      waitsForPromise(async () => {
        var test = await readFile(testPath, 'utf8');

        var root = jscodeshift(test);
        requiresTransform(root, '/test-path.js');
        var actual = printRoot(root);

        var expected = await readFile(expectedPath, 'utf8');
        expect(actual).toEqual(expected);
      });
    });
  });
});
