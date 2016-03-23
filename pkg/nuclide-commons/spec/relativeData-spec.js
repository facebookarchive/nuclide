'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {relativeDate} from '../lib/relativeDate';

describe('relativeDate', () => {
  it('works', () => {
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    const YEAR = DAY * 365;
    const MONTH = YEAR / 12;

    const reference = 157765000000; // 01.01.1975 00:00

    const spans = [
      ['just now', reference * SECOND],
      ['just now', reference - 41 * SECOND],
      ['a minute ago', reference - 42 * SECOND],
      ['a minute ago', reference - MINUTE],
      ['2 minutes ago', reference - MINUTE * 1.5],
      ['59 minutes ago', reference - MINUTE * 59],
      ['an hour ago', reference - HOUR],
      ['2 hours ago', reference - HOUR * 1.5],
      ['16 hours ago', reference - HOUR * 16],
      ['23 hours ago', reference - HOUR * 23],
      ['yesterday', reference - DAY * 1.8],
      ['3 days ago', reference - DAY * 3],
      ['6 days ago', reference - DAY * 6],
      ['a week ago', reference - WEEK],
      ['2 weeks ago', reference - WEEK * 2],
      ['4 weeks ago', reference - WEEK * 4],
      ['a month ago', reference - MONTH * 1.2],
      ['12 months ago', reference - YEAR + HOUR],
      ['a year ago', reference - YEAR],
      ['2 years ago', reference - YEAR * 2],
      ['5 years ago', 0],
    ];

    const now = new Date().getTime();

    expect(relativeDate(0)).toEqual(Math.round(now / YEAR) + ' years ago');

    for (let i = -1, len = spans.length; ++i < len; ) {
      const el = spans[i];
      expect(relativeDate(el[1], reference)).toEqual(el[0]);
    }
  });
});
