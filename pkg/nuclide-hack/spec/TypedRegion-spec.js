'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

import {convertTypedRegionsToCoverageResult} from '../lib/TypedRegions';

function runTest(regions, ...expected) {
  const result = convertTypedRegionsToCoverageResult(regions);
  invariant(result != null);
  expect(result.uncoveredRegions)
    .toEqual(expected);
}

function toError(expected) {
  return {
    ...expected,
    type: 'unchecked',
  };
}

function toWarning(expected) {
  return {
    ...expected,
    type: 'partial',
  };
}

function runTestError(regions, ...expected) {
  runTest(regions, ... expected.map(toError));
}

function runTestWarning(regions, ...expected) {
  runTest(regions, ... expected.map(toWarning));
}

describe('convertTypedRegionsToCoverageRegions', () => {
  it('null', () => {
    expect(convertTypedRegionsToCoverageResult(null)).toBeNull();
  });

  it('empty array', () => {
    runTest([]);
  });

  it('empty string', () => {
    runTest([{
      color: 'unchecked',
      text: '',
    }]);
  });

  it('simple error', () => {
    runTestError(
      [
        {
          color: 'unchecked',
          text: 'blah',
        },
      ],
      {
        line: 1,
        start: 1,
        end: 4,
      });
  });

  it('simple warning', () => {
    runTestWarning(
      [
        {
          color: 'partial',
          text: 'blah',
        },
      ],
      {
        line: 1,
        start: 1,
        end: 4,
      });
  });

  it('simple message w/ offset', () => {
    runTestError(
      [
        {
          color: 'checked',
          text: 'blahs',
        },
        {
          color: 'unchecked',
          text: 'blah',
        },
      ],
      {
        line: 1,
        start: 6,
        end: 9,
      });
  });

  it('simple message w/ multi-line offset', () => {
    runTestError(
      [
        {
          color: 'checked',
          text: '1stline\nsecond-line\n\nstartofthird',
        },
        {
          color: 'unchecked',
          text: 'blah',
        },
      ],
      {
        line: 4,
        start: 13,
        end: 16,
      });
  });

  it('simple message w/ multi-line offset endling in newline', () => {
    runTestError(
      [
        {
          color: 'checked',
          text: '1stline\nsecond-line\n',
        },
        {
          color: 'unchecked',
          text: 'blah',
        },
      ],
      {
        line: 3,
        start: 1,
        end: 4,
      });
  });

  it('multi-line error', () => {
    runTestError(
      [
        {
          color: 'unchecked',
          text: 'blah\nmoarerrors',
        },
      ],
      {
        line: 1,
        start: 1,
        end: 4,
      },
      {
        line: 2,
        start: 1,
        end: 10,
      });
  });

  it('blank-lines error', () => {
    runTestError(
      [
        {
          color: 'unchecked',
          text: 'blah\n\nmoarerrors\n',
        },
      ],
      {
        line: 1,
        start: 1,
        end: 4,
      },
      {
        line: 3,
        start: 1,
        end: 10,
      });
  });

  it('contiguous errors are merged', () => {
    runTestError(
      [
        {
          color: 'unchecked',
          text: 'blah',
        },
        {
          color: 'unchecked',
          text: 'blech',
        },
      ],
      {
        line: 1,
        start: 1,
        end: 9,
      });
  });

});
