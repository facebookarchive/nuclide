"use strict";

function _shellQuote() {
  const data = require("../_shell-quote");

  _shellQuote = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/**
 * The rest of shell-quote has been verified to work correctly.
 * We just need to test the comment parsing.
 */
describe('shell-quote', () => {
  describe('parse', () => {
    it('parses comments correctly', () => {
      expect((0, _shellQuote().parse)('beep#boop')).toEqual(['beep#boop']);
      expect((0, _shellQuote().parse)('beep #boop')).toEqual(['beep', {
        comment: 'boop'
      }]);
      expect((0, _shellQuote().parse)('beep # boop')).toEqual(['beep', {
        comment: 'boop'
      }]);
      expect((0, _shellQuote().parse)('beep # > boop')).toEqual(['beep', {
        comment: '> boop'
      }]);
      expect((0, _shellQuote().parse)('beep # "> boop"')).toEqual(['beep', {
        comment: '"> boop"'
      }]);
      expect((0, _shellQuote().parse)('beep "#"')).toEqual(['beep', '#']);
      expect((0, _shellQuote().parse)('beep #"#"#')).toEqual(['beep', {
        comment: '"#"#'
      }]);
      expect((0, _shellQuote().parse)('beep > boop # > foo')).toEqual(['beep', {
        op: '>'
      }, 'boop', {
        comment: '> foo'
      }]);
    });
  });
  describe('quote', () => {
    expect((0, _shellQuote().quote)(['X#(){}*|][!'])).toBe('X\\#\\(\\)\\{\\}\\*\\|\\]\\[\\!');
  });
});