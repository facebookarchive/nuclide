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
    const now = new Date().getTime();

    expect(relativeDate(0)).toEqual(Math.round(now / YEAR) + ' years ago');
    expect(relativeDate(reference * SECOND, reference)).toEqual('just now');
    expect(relativeDate(reference - 41 * SECOND, reference)).toEqual('just now');
    expect(relativeDate(reference - 42 * SECOND, reference)).toEqual('a minute ago');
    expect(relativeDate(reference - MINUTE, reference)).toEqual('a minute ago');
    expect(relativeDate(reference - MINUTE * 1.5, reference)).toEqual('2 minutes ago');
    expect(relativeDate(reference - MINUTE * 59, reference)).toEqual('59 minutes ago');
    expect(relativeDate(reference - HOUR, reference)).toEqual('an hour ago');
    expect(relativeDate(reference - HOUR * 1.5, reference)).toEqual('2 hours ago');
    expect(relativeDate(reference - HOUR * 16, reference)).toEqual('16 hours ago');
    expect(relativeDate(reference - HOUR * 23, reference)).toEqual('23 hours ago');
    expect(relativeDate(reference - DAY * 1.8, reference)).toEqual('yesterday');
    expect(relativeDate(reference - DAY * 3, reference)).toEqual('3 days ago');
    expect(relativeDate(reference - DAY * 6, reference)).toEqual('6 days ago');
    expect(relativeDate(reference - WEEK, reference)).toEqual('a week ago');
    expect(relativeDate(reference - WEEK * 2, reference)).toEqual('2 weeks ago');
    expect(relativeDate(reference - WEEK * 4, reference)).toEqual('4 weeks ago');
    expect(relativeDate(reference - MONTH * 1.2, reference)).toEqual('a month ago');
    expect(relativeDate(reference - YEAR + HOUR, reference)).toEqual('12 months ago');
    expect(relativeDate(reference - YEAR, reference)).toEqual('a year ago');
    expect(relativeDate(reference - YEAR * 2, reference)).toEqual('2 years ago');
    expect(relativeDate(0, reference)).toEqual('5 years ago');
  });
});
