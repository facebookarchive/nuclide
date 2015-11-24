'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const invariant = require('assert');
const {TextBuffer} = require('atom');
const handleBuckAnsiOutput = require('../lib/handleBuckAnsiOutput');

describe('handleBuckAnsiOutput', () => {
  const RESUME_WRAPPING_ESCAPE = '\u001B[?7h';
  const STOP_WRAPPING_ESCAPE = '\u001B[?7l';
  const ERASE_PREVIOUS_LINE_ESCAPE_PAIR = '\u001B[1A\u001B[2K';

  let textBuffer;
  beforeEach(() => {
    textBuffer = new TextBuffer({
      load: false,
      text: '',
    });
  });

  it('correctly translates the effect of ANSI output that contains escape characters that Buck uses.', () => {
    invariant(textBuffer);

    const line0 = `0`;
    const line1 = `1`;
    const line2 = `2`;
    const line3 = `${RESUME_WRAPPING_ESCAPE}${ERASE_PREVIOUS_LINE_ESCAPE_PAIR}${STOP_WRAPPING_ESCAPE}3`; // Erases line2.
    const line4 = `${RESUME_WRAPPING_ESCAPE}${ERASE_PREVIOUS_LINE_ESCAPE_PAIR}${ERASE_PREVIOUS_LINE_ESCAPE_PAIR}${STOP_WRAPPING_ESCAPE}4`; // Erases line3 and line1.
    const line5 = `5`;
    const line6 = `${RESUME_WRAPPING_ESCAPE}`;
    const text = [line0, line1, line2, line3, line4, line5, line6].join('\n');
    const expectedResultingText = ['0', '4', '5', ''].join('\n');

    handleBuckAnsiOutput(textBuffer, text);
    expect(textBuffer.getText()).toEqual(expectedResultingText);
  });
});
