'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const getPosition = require('../lib/getPosition');
const invariant = require('assert');
const updateCursor = require('../lib/updateCursor');

describe('updateCursor', () => {
  it('should work for a simple test case', () => {
    test(
      `simple|test`,
      `extra-simple|test`,
    );
  });

  it('should handle splitting function parameters', () => {
    test(
      `foo(a,| b)`,
      `foo(
        a,|
        b
      )`,
    );
  });

  it('should handle splitting function parameters with a comma added', () => {
    test(
      `foo(a, b, c|)`,
      `foo(
        a,
        b,
        c|,
      )`,
    );
  });

  it('should handle condensing function parameters', () => {
    test(
      `foo(
        a,
        b|
      )`,
      `foo(a, b|)`,
    );
  });

  it('should handle condensing function parameters with comma removed', () => {
    test(
      `foo(
        a,
        b,|
      )`,
      `foo(a, b|)`,
    );
  });

  it('should return original position if it has no clue what to do', () => {
    test(
      `abc|def`,
      `hij|klm`,
    );
  });

  it('should handle removing extra parenthesis', () => {
    test(
      `((1 + 2) + 3)|`,
      `1 + 2 + 3|`,
    );
  });

  it('should handle array accesses', () => {
    test(
      `foo[1]|`,
      `blah-foo[1]|`,
    );
  });

  it('should handle blocks', () => {
    test(
      `if (a && b|) {
        console.log('true');
      }`,
      `if (
        a &&
        b|
      ) {
        console.log('true');
      }`,
    );
  });

  it('should not move when long identifiers stay still (1)', () => {
    test(
      `
      var ReallyReallyLongIdentifier = require('ReallyReallyLongIdentifier');
      somethingThatUses(ReallyReallyLongIdentifier|
      `,
      `
      var ReallyReallyLongIdentifier = require('ReallyReallyLongIdentifier');
      somethingThatUses(ReallyReallyLongIdentifier|
      `,
    );
  });

  it('should not move when long identifiers stay still (2)', () => {
    test(
      `
      somethingThatUses(ReallyReallyLongIdentifier|
      var ReallyReallyLongIdentifier = require('ReallyReallyLongIdentifier');
      `,
      `
      somethingThatUses(ReallyReallyLongIdentifier|
      var ReallyReallyLongIdentifier = require('ReallyReallyLongIdentifier');
      `,
    );
  });

  it('should move when long identifiers change places (1)', () => {
    test(
      `
      var ReallyReallyLongIdentifier = require('ReallyReallyLongIdentifier');
      somethingThatUses(ReallyReallyLongIdentifier|
      `,
      `
      somethingThatUses(ReallyReallyLongIdentifier|
      var ReallyReallyLongIdentifier = require('ReallyReallyLongIdentifier');
      `,
    );
  });

  it('should move when long identifiers change places (2)', () => {
    test(
      `
      somethingThatUses(ReallyReallyLongIdentifier|
      var ReallyReallyLongIdentifier = require('ReallyReallyLongIdentifier');
      `,
      `
      var ReallyReallyLongIdentifier = require('ReallyReallyLongIdentifier');
      somethingThatUses(ReallyReallyLongIdentifier|
      `,
    );
  });
});

/**
 * Helper function that will look for a "|" character and treat it as the
 * cursor. This will make tests way more readable.
 */
function test(input, output) {
  invariant(
    input.indexOf('|') >= 0 &&
    input.indexOf('|') === input.lastIndexOf('|') &&
    output.indexOf('|') >= 0 &&
    output.indexOf('|') === output.lastIndexOf('|'),
    'Invalid test cases. Both input and output must have exactly one | in ' +
    'each test case.'
  );

  const startSource = input.replace('|', '');
  const startPosition = getPosition(startSource, input.indexOf('|'));
  const endSource = output.replace('|', '');
  const endPosition = getPosition(endSource, output.indexOf('|'));

  const actual = updateCursor(startSource, startPosition, endSource);
  const expected = endPosition;

  expect(actual).toEqual(expected);
}
