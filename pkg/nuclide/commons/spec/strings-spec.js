'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var strings = require('../lib/strings');

describe('strings::isUpperCamelCase', () => {

  it('isUpperCamelCase', () => {
      var isUpperCamelCase = strings.isUpperCamelCase;

      expect(isUpperCamelCase('')).toBe(false);
      expect(isUpperCamelCase('foo')).toBe(false);
      expect(isUpperCamelCase('fooBar')).toBe(false);

      expect(isUpperCamelCase('F')).toBe(true);
      expect(isUpperCamelCase('Foo')).toBe(true);
      expect(isUpperCamelCase('FooBar')).toBe(true);
      expect(isUpperCamelCase('FB')).toBe(true);
      expect(isUpperCamelCase('XMLHttpRequest')).toBe(true);
  });
});
