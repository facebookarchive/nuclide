'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* This file contains a set of custom matchers for jasmine testing, which can be used
 * to get more detailed / useful diffs on various reults.
 */

var chalk = require('chalk');
var diff = require('diff');

type Change = {
  value: string;
  removed?: boolean;
  added?: boolean;
};

/**
 * Do a recursive diff of two JSON objects. This function should not be called
 * directly, but rather added as a Jasmine custom matcher.
 * @param The expected result from the test.
 * @this A JasmineMatcher object.
 * @returns True if the objects are identical.
 */
function diffJson(expected: Object): boolean {
  var parts = diff.diffJson(expected, this.actual);
  var {message, changes} = formatMessage(parts);
  this.message = () => message;
  return changes === 0;
}

/**
 * Do a line by line diff of two strings. This function should not be called
 * directly, but rather added as a Jasmine custom matcher.
 * @param The expected result from the test.
 * @this A JasmineMatcher object.
 * @returns True if the strings are identical.
 */
function diffLines(expected: Object): boolean {
  var parts = diff.diffLines(expected, this.actual);
  var {message, changes} = formatMessage(parts);
  this.message = () => message;
  return changes === 0;
}

/**
 * Helper function that counts changes in the output from JsDiff, as well as
 * generates a colored message that shows diff output.
 * @param The output from JsDiff.
 * @returns On object containing the number of changes (added or removed parts),
 *   and a string containing the colored diff output.
 */
function formatMessage(parts: Array<Change>): {changes: number, message: string} {
  var changes = 0, message = '';
  for (var part of parts) {
    var color = 'gray';
    if (part.added || part.removed) {
      ++changes;
      color = part.added ? 'green' : 'red';
    }
    message += chalk[color](part.value);
  }
  return {changes, message};
}

module.exports = {diffJson, diffLines};
