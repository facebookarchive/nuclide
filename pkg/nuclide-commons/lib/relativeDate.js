'use babel';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Originally adapted https://github.com/azer/relative-date
// We're including it because of https://github.com/npm/npm/issues/12012

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const YEAR = DAY * 365;
const MONTH = YEAR / 12;

const formats = [
  [ 0.7 * MINUTE, 'just now' ],
  [ 1.5 * MINUTE, 'a minute ago' ],
  [ 60 * MINUTE, 'minutes ago', MINUTE ],
  [ 1.5 * HOUR, 'an hour ago' ],
  [ DAY, 'hours ago', HOUR ],
  [ 2 * DAY, 'yesterday' ],
  [ 7 * DAY, 'days ago', DAY ],
  [ 1.5 * WEEK, 'a week ago'],
  [ MONTH, 'weeks ago', WEEK ],
  [ 1.5 * MONTH, 'a month ago' ],
  [ YEAR, 'months ago', MONTH ],
  [ 1.5 * YEAR, 'a year ago' ],
  [ Number.MAX_VALUE, 'years ago', YEAR ],
];

export function relativeDate(input, reference) {
  if (!reference) {
    reference = new Date().getTime();
  }
  if (reference instanceof Date) {
    reference = reference.getTime();
  }
  if (input instanceof Date) {
    input = input.getTime();
  }

  const delta = reference - input;
  let format;

  for (let i = -1, len = formats.length; ++i < len; ) {
    format = formats[i];
    if (delta < format[0]) {
      if (format[2] === undefined) {
        return format[1];
      } else {
        return Math.round(delta / format[2]) + ' ' + format[1];
      }
    }
  }
}
