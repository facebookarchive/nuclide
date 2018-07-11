"use strict";

function _sanitize() {
  const data = _interopRequireDefault(require("../lib/sanitize"));

  _sanitize = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
it('removes html', () => {
  expect((0, _sanitize().default)('<h4>a lowly h4</h4>')).toBe('a lowly h4');
});
it('removes leading and trailing whitespace', () => {
  expect((0, _sanitize().default)('    a\nb    ')).toBe('a\nb');
});
it('compresses whitespace', () => {
  expect((0, _sanitize().default)('    a\n     \n       b    ')).toBe('a\nb');
});
it('adds line breaks for <p> and <br /> tags', () => {
  expect((0, _sanitize().default)('a<br />b<p>c</p><p>d</p>')).toBe('a\nb\nc\nd');
  expect((0, _sanitize().default)('a<br/>b')).toBe('a\nb');
  expect((0, _sanitize().default)('a<br>b')).toBe('a\nb');
  expect((0, _sanitize().default)('a<br >b')).toBe('a\nb');
});