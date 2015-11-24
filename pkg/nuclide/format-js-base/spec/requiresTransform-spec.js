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

const jscodeshift = require('jscodeshift');
const printRoot = require('../lib/utils/printRoot');
const {readFile} = require('nuclide-commons').fsPromise;
const requiresTransform = require('../lib/requires/transform');

const TESTS = [
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
  'add-object-spreads',
  'add-polymorphic-type-bounds',
  'add-polymorphic-types',
  'add-react-when-using-jsx',
  'add-requires-after-jest',
  'add-requires-after-use-strict',
  'add-returns',
  'add-spread-args',
  'add-switches',
  'add-tagged-template-expressions',
  'add-template-expressions',
  'add-try-catches',
  'add-types',
  'demote-requires',
  'ignore-arbitrary-new-lines',
  'ignore-array-pattern-elements',
  'ignore-comments-with-no-requires',
  'ignore-declared-jsx',
  'ignore-function-params',
  'ignore-nested-object-patterns',
  'ignore-react-when-using-jsx',
  'ignore-requires-in-blocks',
  'ignore-rest-args',
  'keep-header-comments',
  'promote-types',
  'remove-extra-new-lines',
  'remove-nested-object-pattern',
  'remove-shadowed-requires',
  'remove-shadowed-types',
  'remove-unused-array-patterns',
  'remove-unused-requires',
  'remove-unused-types',
  'respect-declaration-kind',
  'sort-import-specifiers',
  'sort-requires',
  'sort-strange-require-expressions',
  'split-multiple-leading-comments',
];

const SOURCE_OPTIONS = {
  moduleMap: DefaultModuleMap,
};

describe('requiresTransform', () => {
  TESTS.forEach(name => {
    it(`should ${name}`, () => {
      const testPath = 'fixtures/requires/' + name + '.test';
      const expectedPath = 'fixtures/requires/' + name + '.expected';

      waitsForPromise(async () => {
        const test = await readFile(testPath, 'utf8');

        const root = jscodeshift(test);
        requiresTransform(root, SOURCE_OPTIONS);
        const actual = printRoot(root);

        const expected = await readFile(expectedPath, 'utf8');
        expect(actual).toBe(expected);
      });
    });
  });
});
