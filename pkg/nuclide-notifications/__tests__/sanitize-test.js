/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import sanitize from '../lib/sanitize';

it('removes html', () => {
  expect(sanitize('<h4>a lowly h4</h4>')).toBe('a lowly h4');
});

it('removes leading and trailing whitespace', () => {
  expect(sanitize('    a\nb    ')).toBe('a\nb');
});

it('compresses whitespace', () => {
  expect(sanitize('    a\n     \n       b    ')).toBe('a\nb');
});

it('adds line breaks for <p> and <br /> tags', () => {
  expect(sanitize('a<br />b<p>c</p><p>d</p>')).toBe('a\nb\nc\nd');
  expect(sanitize('a<br/>b')).toBe('a\nb');
  expect(sanitize('a<br>b')).toBe('a\nb');
  expect(sanitize('a<br >b')).toBe('a\nb');
});
