'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var invariant = require('assert');
var {TextBuffer} = require('atom');
var handleBuckAnsiOutput = require('../lib/handleBuckAnsiOutput');

describe('handleBuckAnsiOutput', () => {
  var RESUME_WRAPPING_ESCAPE = '\u001B[?7h';
  var STOP_WRAPPING_ESCAPE = '\u001B[?7l';
  var ERASE_PREVIOUS_LINE_ESCAPE_PAIR = '\u001B[1A\u001B[2K';

  var textBuffer;
  beforeEach(() => {
    textBuffer = new TextBuffer({
      load: false,
      text: '',
    });
  });

  it('correctly translates the effect of ANSI output that contains escape characters that Buck uses.', () => {
    invariant(textBuffer);

    var line0 = `0`;
    var line1 = `1`;
    var line2 = `2`;
    var line3 = `${RESUME_WRAPPING_ESCAPE}${ERASE_PREVIOUS_LINE_ESCAPE_PAIR}${STOP_WRAPPING_ESCAPE}3`; // Erases line2.
    var line4 = `${RESUME_WRAPPING_ESCAPE}${ERASE_PREVIOUS_LINE_ESCAPE_PAIR}${ERASE_PREVIOUS_LINE_ESCAPE_PAIR}${STOP_WRAPPING_ESCAPE}4`; // Erases line3 and line1.
    var line5 = `5`;
    var line6 = `${RESUME_WRAPPING_ESCAPE}`;
    var text = [line0, line1, line2, line3, line4, line5, line6].join('\n');
    var expectedResultingText = ['0', '4', '5', ''].join('\n');

    handleBuckAnsiOutput(textBuffer, text);
    expect(textBuffer.getText()).toEqual(expectedResultingText);
  });
});
