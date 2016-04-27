

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*
 * This file contains a set of custom matchers for jasmine testing, which can be used
 * to get more detailed / useful diffs on various reults. These can be used in a test by doing:
 *
 * var {addMatchers} = require('nuclide-test-helpers');
 *
 * And then in a `beforeEach()`:
 *
 * ```
 * beforeEach(() => {
 *   addMatchers(this);
 * }
 * ```
 */

// We have to create an invariant function that is a lie because using invariant() with an
// instanceof check is the only way to convince Flow of the type of an unbound `this`.
var invariant = function invariant(condition) {};

var chalk = require('chalk');
var diff = require('diff');

/**
 * Do a recursive diff of two JSON objects. This function should not be called
 * directly, but rather added as a Jasmine custom matcher.
 * @param The expected result from the test.
 * @this A JasmineMatcher object.
 * @returns True if the objects are identical.
 */
function diffJson(expected) {
  var parts = diff.diffJson(expected, this.actual);

  var _formatMessage = formatMessage(parts);

  var message = _formatMessage.message;
  var changes = _formatMessage.changes;

  invariant(this instanceof jasmine.Matchers);
  this.message = function () {
    return message;
  };
  return changes === 0;
}

/**
 * Do a line by line diff of two strings. This function should not be called
 * directly, but rather added as a Jasmine custom matcher.
 * @param The expected result from the test.
 * @this A JasmineMatcher object.
 * @returns True if the strings are identical.
 */
function diffLines(expected) {
  var parts = diff.diffLines(expected, this.actual);

  var _formatMessage2 = formatMessage(parts);

  var message = _formatMessage2.message;
  var changes = _formatMessage2.changes;

  invariant(this instanceof jasmine.Matchers);
  this.message = function () {
    return message;
  };
  return changes === 0;
}

/**
 * Helper function that counts changes in the output from JsDiff, as well as
 * generates a colored message that shows diff output.
 * @param The output from JsDiff.
 * @returns On object containing the number of changes (added or removed parts),
 *   and a string containing the colored diff output.
 */
function formatMessage(parts) {
  var changes = 0,
      message = '';
  for (var part of parts) {
    var color = 'gray';
    if (part.added || part.removed) {
      ++changes;
      color = part.added ? 'green' : 'red';
    }
    message += chalk[color](part.value);
  }
  return { changes: changes, message: message };
}

function addMatchers(spec) {
  var matchersPrototype = {
    diffJson: diffJson,
    diffLines: diffLines
  };
  spec.addMatchers(matchersPrototype);
}

module.exports = {
  addMatchers: addMatchers,
  diffJson: diffJson,
  diffLines: diffLines
};