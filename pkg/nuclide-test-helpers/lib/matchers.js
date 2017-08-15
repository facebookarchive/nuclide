'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.diffJson = diffJson;
exports.diffLines = diffLines;
exports.addMatchers = addMatchers;

var _chalk;

function _load_chalk() {
  return _chalk = _interopRequireDefault(require('chalk'));
}

var _diff;

function _load_diff() {
  return _diff = _interopRequireWildcard(require('diff'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

/*
 * This file contains a set of custom matchers for jasmine testing, which can be used
 * to get more detailed / useful diffs on various reults. These can be used in a test by doing:
 *
 * import {addMatchers} from 'nuclide-test-helpers';
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
const invariant = condition => {};

/**
 * Do a recursive diff of two JSON objects. This function should not be called
 * directly, but rather added as a Jasmine custom matcher.
 * @param The expected result from the test.
 * @this A JasmineMatcher object.
 * @returns True if the objects are identical.
 */
function diffJson(expected) {
  const parts = (_diff || _load_diff()).diffJson(expected, this.actual);
  const { message, changes } = formatMessage(parts);
  invariant(this instanceof jasmine.Matchers);
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
function diffLines(expected) {
  const parts = (_diff || _load_diff()).diffLines(expected, this.actual);
  const { message, changes } = formatMessage(parts);
  invariant(this instanceof jasmine.Matchers);
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
function formatMessage(parts) {
  let changes = 0;
  let message = '';
  for (const part of parts) {
    let color = 'gray';
    if (part.added || part.removed) {
      ++changes;
      color = part.added ? 'green' : 'red';
    }
    message += (_chalk || _load_chalk()).default[color](part.value);
  }
  return { changes, message };
}

function addMatchers(spec) {
  const matchersPrototype = {
    diffJson,
    diffLines
  };
  spec.addMatchers(matchersPrototype);
}