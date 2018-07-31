/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

import EventEmitter from 'events';
import invariant from 'assert';

export type ParsedANSISequence = {
  data: string,
  prefix: string,
  args: number[],
  suffix: string,
};

export type SpecialKeyName =
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4'
  | 'F5'
  | 'F6'
  | 'F7'
  | 'F8'
  | 'F9'
  | 'F10'
  | 'F11'
  | 'F12'
  | 'UP'
  | 'DOWN'
  | 'LEFT'
  | 'RIGHT'
  | 'PAGEUP'
  | 'PAGEDOWN'
  | 'HOME'
  | 'END'
  | 'DEL';

export type ParsedANSISpecialKey = ParsedANSISequence & {
  key: SpecialKeyName,
  shift: boolean,
};

export type ParsedANSICursorPosition = ParsedANSISequence & {
  row: number,
  column: number,
};

const ESC = '\x1b';

const ParseState = Object.freeze({
  END: 0,
  START: 1,
  ESC: 2,
  BRACK1: 3,
  PREFIX_O: 4,
  BRACK2: 5,
  BRACK_ARG: 6,
  BRACK_NARG: 7,
  O_ARG: 8,
  O_NARG: 9,
});

const ParseAction = Object.freeze({
  START_TIMEOUT: 0,
  PREFIX: 1,
  ARG: 2,
  NEXT_ARG: 3,
  SUFFIX: 4,
});

export const SpecialKey = Object.freeze({
  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12',
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  PAGEUP: 'PAGEUP',
  PAGEDOWN: 'PAGEDOWN',
  HOME: 'HOME',
  END: 'END',
  DEL: 'DEL',
});

const AK_SET_UPCASE_ALPHA = new Set([
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
]);

const AK_SET_UPCASE_ALPHA_PUNC = new Set([
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '~',
  '^',
  '$',
  '@',
]);

const AK_SET_DIGITS = new Set([
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
]);

// ANSI key parsing table. This describes a FSM to recognize the various parts
// of ANSI key sequences.
const ANSIKeyParser = new Map([
  // Nothing recognized yet
  [
    ParseState.START,
    [
      {
        match: new Set(ESC),
        action: ParseAction.START_TIMEOUT,
        next: ParseState.ESC,
      },
    ],
  ],
  // leading ESCAPE seen
  [
    ParseState.ESC,
    [
      {
        match: new Set(['[']),
        action: ParseAction.PREFIX,
        next: ParseState.BRACK1,
      },
      {
        match: new Set(['O']),
        action: ParseAction.PREFIX,
        next: ParseState.PREFIX_O,
      },
    ],
  ],
  // ESC [ seen
  [
    ParseState.BRACK1,
    [
      {
        match: new Set(['[']),
        action: ParseAction.PREFIX,
        next: ParseState.BRACK2,
      },
      {
        match: AK_SET_DIGITS,
        action: ParseAction.ARG,
        next: ParseState.BRACK_ARG,
      },
      {
        match: AK_SET_UPCASE_ALPHA_PUNC,
        action: ParseAction.SUFFIX,
        next: ParseState.END,
      },
    ],
  ],
  // ESC [[ seen
  [
    ParseState.BRACK2,
    [
      {
        match: AK_SET_UPCASE_ALPHA,
        action: ParseAction.SUFFIX,
        next: ParseState.END,
      },
    ],
  ],
  // ESC [ (#+;)* #+ seen
  [
    ParseState.BRACK_ARG,
    [
      {
        match: AK_SET_DIGITS,
        action: ParseAction.ARG,
        next: ParseState.BRACK_ARG,
      },
      {
        match: new Set([';']),
        action: ParseAction.NEXT_ARG,
        next: ParseState.BRACK_NARG,
      },
      {
        match: AK_SET_UPCASE_ALPHA_PUNC,
        action: ParseAction.SUFFIX,
        next: ParseState.END,
      },
    ],
  ],
  // ESC [ (#+;)* #+ ; seen
  [
    ParseState.BRACK_NARG,
    [
      {
        match: AK_SET_DIGITS,
        action: ParseAction.ARG,
        next: ParseState.BRACK_ARG,
      },
    ],
  ],
  // ESC O seen
  [
    ParseState.PREFIX_O,
    [
      {
        match: AK_SET_UPCASE_ALPHA,
        action: ParseAction.SUFFIX,
        next: ParseState.END,
      },
      {match: AK_SET_DIGITS, action: ParseAction.ARG, next: ParseState.O_ARG},
    ],
  ],
  // ESC O (#+;)* #+ seen
  [
    ParseState.O_ARG,
    [
      {match: AK_SET_DIGITS, action: ParseAction.ARG, next: ParseState.O_ARG},
      {
        match: new Set([';']),
        action: ParseAction.NEXT_ARG,
        next: ParseState.O_NARG,
      },
      {
        match: AK_SET_UPCASE_ALPHA_PUNC,
        action: ParseAction.SUFFIX,
        next: ParseState.END,
      },
    ],
  ],
  // ESC O (#+;)* #+ ; seen
  [
    ParseState.O_NARG,
    [{match: AK_SET_DIGITS, action: ParseAction.ARG, next: ParseState.O_ARG}],
  ],
]);

// Parsing escape sequences from special keys is messy, especially the function
// keys. There are multiple standards (ANSI, VT100, xterm, etc.) all of which
// are similar but not exactly the same. Common terminal emulators implement
// the mappings slightly differently as well.
//
// This list is for the most part empirically derived from the most common
// terminal programs, and the parser is defined from that.
//
const ANSIKeyMappings = new Map([
  // iTerm
  ['\x1bOP', {key: SpecialKey.F1, shift: false}],
  ['\x1bOQ', {key: SpecialKey.F2, shift: false}],
  ['\x1bOR', {key: SpecialKey.F3, shift: false}],
  ['\x1bOS', {key: SpecialKey.F4, shift: false}],
  ['\x1b[15~', {key: SpecialKey.F5, shift: false}],
  ['\x1b[17~', {key: SpecialKey.F6, shift: false}],
  ['\x1b[18~', {key: SpecialKey.F7, shift: false}],
  ['\x1b[19~', {key: SpecialKey.F8, shift: false}],
  ['\x1b[20~', {key: SpecialKey.F9, shift: false}],
  ['\x1b[21~', {key: SpecialKey.F10, shift: false}],
  ['\x1b[23~', {key: SpecialKey.F11, shift: false}],
  ['\x1b[24~', {key: SpecialKey.F12, shift: false}],
  ['\x1b[A', {key: SpecialKey.UP, shift: false}],
  ['\x1b[B', {key: SpecialKey.DOWN, shift: false}],
  ['\x1b[D', {key: SpecialKey.LEFT, shift: false}],
  ['\x1b[C', {key: SpecialKey.RIGHT, shift: false}],
  ['\x1bOA', {key: SpecialKey.UP, shift: false}],
  ['\x1bOB', {key: SpecialKey.DOWN, shift: false}],
  ['\x1bOD', {key: SpecialKey.LEFT, shift: false}],
  ['\x1bOC', {key: SpecialKey.RIGHT, shift: false}],
  ['\x1b[5~', {key: SpecialKey.PAGEUP, shift: false}],
  ['\x1b[6~', {key: SpecialKey.PAGEDOWN, shift: false}],
  ['\x1bOH', {key: SpecialKey.HOME, shift: false}],
  ['\x1bOF', {key: SpecialKey.END, shift: false}],
  ['\x1b[3~', {key: SpecialKey.DEL, shift: false}],
  ['\x1b[1;2P', {key: SpecialKey.F1, shift: true}],
  ['\x1b[1;2Q', {key: SpecialKey.F2, shift: true}],
  ['\x1b[1;2R', {key: SpecialKey.F3, shift: true}],
  ['\x1b[1;2S', {key: SpecialKey.F4, shift: true}],
  ['\x1b[15;2~', {key: SpecialKey.F5, shift: true}],
  ['\x1b[17;2~', {key: SpecialKey.F6, shift: true}],
  ['\x1b[18;2~', {key: SpecialKey.F7, shift: true}],
  ['\x1b[19;2~', {key: SpecialKey.F8, shift: true}],
  ['\x1b[20;2~', {key: SpecialKey.F9, shift: true}],
  ['\x1b[21;2~', {key: SpecialKey.F10, shift: true}],
  ['\x1b[23;2~', {key: SpecialKey.F11, shift: true}],
  ['\x1b[24;2~', {key: SpecialKey.F12, shift: true}],
  ['\x1b[1;2A', {key: SpecialKey.UP, shift: true}],
  ['\x1b[1;2B', {key: SpecialKey.DOWN, shift: true}],
  ['\x1b[1;2D', {key: SpecialKey.LEFT, shift: true}],
  ['\x1b[1;2C', {key: SpecialKey.RIGHT, shift: true}],
  ['\x1b[1;2H', {key: SpecialKey.HOME, shift: true}],
  ['\x1b[1;2F', {key: SpecialKey.END, shift: true}],

  // macOS terminal
  ['\x1b[25~', {key: SpecialKey.F5, shift: true}],
  ['\x1b[26~', {key: SpecialKey.F6, shift: true}],
  ['\x1b[28~', {key: SpecialKey.F7, shift: true}],
  ['\x1b[29~', {key: SpecialKey.F8, shift: true}],
  ['\x1b[31~', {key: SpecialKey.F9, shift: true}],
  ['\x1b[32~', {key: SpecialKey.F10, shift: true}],
  ['\x1b[33~', {key: SpecialKey.F11, shift: true}],
  ['\x1b[34~', {key: SpecialKey.F12, shift: true}],
  ['\x1b[3;2~', {key: SpecialKey.DEL, shift: true}],
  // NOTE that these are actually shifted, but it's because macOS uses HOME and
  // END itself, and uses SHIFT+HOME and SHIFT+END to send them to the running
  // program.
  ['\x1b[H', {key: SpecialKey.HOME, shift: false}],
  ['\x1b[F', {key: SpecialKey.END, shift: false}],
]);

export class AnsiStreamParser extends EventEmitter {
  _state: number = ParseState.START;
  _buffer: string = '';
  _prefix: string = '';
  _narg: number = 0;
  _args: number[] = [];
  _suffix: string = '';
  _tmo: ?TimeoutID = null;

  constructor() {
    super();
    this.init();
  }

  init() {
    this._state = ParseState.START;
    this._buffer = '';
    this._prefix = '';
    this._narg = 0;
    this._args = [];
    this._suffix = '';
    if (this._tmo != null) {
      clearTimeout(this._tmo);
    }
    this._tmo = null;
  }

  next(c: string) {
    this._buffer += c;
    const st = ANSIKeyParser.get(this._state);
    invariant(st != null);

    for (const edge of st) {
      if (edge.match.has(c)) {
        this._performAction(edge.action, c);
        this._moveTo(edge.next);
        return;
      }
    }

    this._noMatch();
  }

  _performAction(act: number, c: string) {
    switch (act) {
      case ParseAction.START_TIMEOUT:
        // the entire key sequence should be sent at once. if we
        // don't see it all in 100 ms, assume it's a partial prefix
        // match and just send back the characters
        this._tmo = setTimeout(() => this._reset(), 100);
        break;

      case ParseAction.PREFIX:
        this._prefix += c;
        break;

      case ParseAction.ARG:
        this._appendArg(c);
        break;

      case ParseAction.NEXT_ARG:
        this._narg++;
        break;

      case ParseAction.SUFFIX:
        this._suffix += c;
        break;
    }
  }

  _moveTo(state: number): void {
    this._state = state;
    if (this._state === ParseState.END) {
      this._emitEvent();
      this.init();
    }
  }

  _noMatch(): void {
    const last = this._buffer.charAt(this._buffer.length - 1);
    if (last === ESC) {
      this._buffer = this._buffer.substr(0, this._buffer.length - 1);
    }
    this.emit('text', this._buffer);
    this.init();
    if (last === ESC) {
      this.next(last);
    }
  }

  _appendArg(c: string): void {
    if (this._args[this._narg] == null) {
      this._args[this._narg] = 0;
    }
    this._args[this._narg] = this._args[this._narg] * 10 + parseInt(c, 10);
  }

  _reset(): void {
    this.emit('text', this._buffer);
    this.init();
  }

  _emitEvent() {
    const event: ParsedANSISequence = {
      data: this._buffer,
      prefix: this._prefix,
      args: this._args,
      suffix: this._suffix,
    };

    const key = ANSIKeyMappings.get(event.data);
    if (key != null) {
      const keyEvent: ParsedANSISpecialKey = {
        ...event,
        ...key,
      };
      this.emit('key', keyEvent);
      return;
    }

    // ESC [row;colR is ANSI RCP (report cursor position)
    if (
      event.prefix === '[' &&
      event.args.length === 2 &&
      event.suffix === 'R'
    ) {
      const cursorEvent: ParsedANSICursorPosition = {
        ...event,
        row: event.args[0],
        column: event.args[1],
      };
      this.emit('cursor', cursorEvent);
      return;
    }

    // escape sequence we don't recognize
    this.emit('sequence', event);
  }
}
