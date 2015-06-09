'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');
var {ensureTrailingSeparator} = require('../lib/paths');

describe('paths.js', () => {
  describe('ensureTrailingSeparator', () => {
    it('adds a trailing separator if the path does not already have one.', () => {
      expect(ensureTrailingSeparator('')).toBe(path.sep);
      var pathWithoutSeparator = path.join('some', 'path');
      expect(ensureTrailingSeparator(pathWithoutSeparator)).toBe(pathWithoutSeparator + path.sep);
    });

    it('does not add a trailing separator if hte path already has one.', () => {
      var separator = path.sep;
      expect(ensureTrailingSeparator(separator)).toBe(separator);
      var pathWithSeparator = path.join('some', 'path', path.sep);
      expect(ensureTrailingSeparator(pathWithSeparator)).toBe(pathWithSeparator);
    });
  });
});
