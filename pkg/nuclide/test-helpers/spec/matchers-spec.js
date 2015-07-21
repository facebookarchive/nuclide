'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var chalk = require('chalk');
var matchers = require('../lib/matchers.js');

describe('matchers', () => {
  beforeEach(function () {
    this.addMatchers(matchers);
  });

  describe('matchers.diffJson', () => {
    it('accepts two identical objects.', () => {
      var actual = {a: 2, b: {c: 3}};
      var expected = {b: {c: 3}, a: 2};
      expect(actual).diffJson(expected);
    });

    it('rejects two different objects.', () => {
      var actual = {a: 1, b: 2};
      var expected = {b: 2, c: 3};
      expect(actual).not.diffJson(expected);
    });

    it('colors diff output.', () => {
      var match = {actual : {a: 1, b: 2}};
      var isMatch = matchers.diffJson.bind(match)({b: 2, c: 3});

      var expected = chalk.gray('{\n')
          + chalk.green('  "a": 1,\n')
          + chalk.gray('  "b": 2,\n')
          + chalk.red('  "c": 3\n')
          + chalk.gray('}');

      expect(isMatch).toBe(false);
      expect(match.message()).toEqual(expected);
    });
  });

  describe('matchers.diffLines', () => {
    it('accepts two identical strings.', () => {
      var actual = 'line1\nline2\nline3';
      var expected = 'line1\nline2\nline3';
      expect(actual).diffLines(expected);
    });

    it('rejects two different strings.', () => {
      var actual = 'line1\nline2\nline3';
      var expected = 'line1\nline3';
      expect(actual).not.diffLines(expected);
    });

    it('colors diff output.', () => {
      var match = { actual: 'line1\nline2\nline3' };
      var isMatch = matchers.diffJson.bind(match)('line1\nline3');

      var expected = chalk.gray('line1\n')
          + chalk.green('line2\n')
          + chalk.gray('line3');

      expect(isMatch).toBe(false);
      expect(match.message()).toEqual(expected);
    });
  });
});
