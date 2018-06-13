'use strict';

var _shellQuote;

function _load_shellQuote() {
  return _shellQuote = require('../_shell-quote');
}

/**
 * The rest of shell-quote has been verified to work correctly.
 * We just need to test the comment parsing.
 */

describe('shell-quote', () => {
  describe('parse', () => {
    it('parses comments correctly', () => {
      expect((0, (_shellQuote || _load_shellQuote()).parse)('beep#boop')).toEqual(['beep#boop']);
      expect((0, (_shellQuote || _load_shellQuote()).parse)('beep #boop')).toEqual(['beep', { comment: 'boop' }]);
      expect((0, (_shellQuote || _load_shellQuote()).parse)('beep # boop')).toEqual(['beep', { comment: 'boop' }]);
      expect((0, (_shellQuote || _load_shellQuote()).parse)('beep # > boop')).toEqual(['beep', { comment: '> boop' }]);
      expect((0, (_shellQuote || _load_shellQuote()).parse)('beep # "> boop"')).toEqual(['beep', { comment: '"> boop"' }]);
      expect((0, (_shellQuote || _load_shellQuote()).parse)('beep "#"')).toEqual(['beep', '#']);
      expect((0, (_shellQuote || _load_shellQuote()).parse)('beep #"#"#')).toEqual(['beep', { comment: '"#"#' }]);
      expect((0, (_shellQuote || _load_shellQuote()).parse)('beep > boop # > foo')).toEqual(['beep', { op: '>' }, 'boop', { comment: '> foo' }]);
    });
  });

  describe('quote', () => {
    expect((0, (_shellQuote || _load_shellQuote()).quote)(['X#(){}*|][!'])).toBe('X\\#\\(\\)\\{\\}\\*\\|\\]\\[\\!');
  });
}); /**
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