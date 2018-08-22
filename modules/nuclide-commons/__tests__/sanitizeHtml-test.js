"use strict";

function _sanitizeHtml() {
  const data = _interopRequireDefault(require("../sanitizeHtml"));

  _sanitizeHtml = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
it('removes html', () => {
  expect((0, _sanitizeHtml().default)('<h4>a lowly h4</h4>')).toBe('a lowly h4');
});
it('removes leading and trailing whitespace', () => {
  expect((0, _sanitizeHtml().default)('    a\nb    ', {
    condenseWhitespaces: false
  })).toBe('a\nb');
});
it('compresses whitespace with option', () => {
  expect((0, _sanitizeHtml().default)('    a\n     \n       b    ', {
    condenseWhitespaces: true
  })).toBe('a\nb');
  expect((0, _sanitizeHtml().default)('    a\n     \n       b    ', {
    condenseWhitespaces: false
  })).toBe('a\n     \n       b');
});
it('adds line breaks for <p> and <br /> tags', () => {
  expect((0, _sanitizeHtml().default)('a<br />b<p>c</p><p>d</p>')).toBe('a\nb\nc\nd');
  expect((0, _sanitizeHtml().default)('a<br/>b')).toBe('a\nb');
  expect((0, _sanitizeHtml().default)('a<br>b')).toBe('a\nb');
  expect((0, _sanitizeHtml().default)('a<br >b')).toBe('a\nb');
});