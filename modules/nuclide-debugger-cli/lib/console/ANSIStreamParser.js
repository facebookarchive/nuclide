"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ANSIStreamParser = exports.SpecialKey = void 0;

var _events = _interopRequireDefault(require("events"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */
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
  O_NARG: 9
});
const ParseAction = Object.freeze({
  START_TIMEOUT: 0,
  PREFIX: 1,
  ARG: 2,
  NEXT_ARG: 3,
  SUFFIX: 4
});
const SpecialKey = Object.freeze({
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
  DEL: 'DEL'
});
exports.SpecialKey = SpecialKey;
const AK_SET_UPCASE_ALPHA = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']);
const AK_SET_UPCASE_ALPHA_PUNC = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '~', '^', '$', '@']);
const AK_SET_DIGITS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']); // ANSI key parsing table. This describes a FSM to recognize the various parts
// of ANSI key sequences.

const ANSIKeyParser = new Map([// Nothing recognized yet
[ParseState.START, [{
  match: new Set(ESC),
  action: ParseAction.START_TIMEOUT,
  next: ParseState.ESC
}]], // leading ESCAPE seen
[ParseState.ESC, [{
  match: new Set(['[']),
  action: ParseAction.PREFIX,
  next: ParseState.BRACK1
}, {
  match: new Set(['O']),
  action: ParseAction.PREFIX,
  next: ParseState.PREFIX_O
}]], // ESC [ seen
[ParseState.BRACK1, [{
  match: new Set(['[']),
  action: ParseAction.PREFIX,
  next: ParseState.BRACK2
}, {
  match: AK_SET_DIGITS,
  action: ParseAction.ARG,
  next: ParseState.BRACK_ARG
}, {
  match: AK_SET_UPCASE_ALPHA_PUNC,
  action: ParseAction.SUFFIX,
  next: ParseState.END
}]], // ESC [[ seen
[ParseState.BRACK2, [{
  match: AK_SET_UPCASE_ALPHA,
  action: ParseAction.SUFFIX,
  next: ParseState.END
}]], // ESC [ (#+;)* #+ seen
[ParseState.BRACK_ARG, [{
  match: AK_SET_DIGITS,
  action: ParseAction.ARG,
  next: ParseState.BRACK_ARG
}, {
  match: new Set([';']),
  action: ParseAction.NEXT_ARG,
  next: ParseState.BRACK_NARG
}, {
  match: AK_SET_UPCASE_ALPHA_PUNC,
  action: ParseAction.SUFFIX,
  next: ParseState.END
}]], // ESC [ (#+;)* #+ ; seen
[ParseState.BRACK_NARG, [{
  match: AK_SET_DIGITS,
  action: ParseAction.ARG,
  next: ParseState.BRACK_ARG
}]], // ESC O seen
[ParseState.PREFIX_O, [{
  match: AK_SET_UPCASE_ALPHA,
  action: ParseAction.SUFFIX,
  next: ParseState.END
}, {
  match: AK_SET_DIGITS,
  action: ParseAction.ARG,
  next: ParseState.O_ARG
}]], // ESC O (#+;)* #+ seen
[ParseState.O_ARG, [{
  match: AK_SET_DIGITS,
  action: ParseAction.ARG,
  next: ParseState.O_ARG
}, {
  match: new Set([';']),
  action: ParseAction.NEXT_ARG,
  next: ParseState.O_NARG
}, {
  match: AK_SET_UPCASE_ALPHA_PUNC,
  action: ParseAction.SUFFIX,
  next: ParseState.END
}]], // ESC O (#+;)* #+ ; seen
[ParseState.O_NARG, [{
  match: AK_SET_DIGITS,
  action: ParseAction.ARG,
  next: ParseState.O_ARG
}]]]); // Parsing escape sequences from special keys is messy, especially the function
// keys. There are multiple standards (ANSI, VT100, xterm, etc.) all of which
// are similar but not exactly the same. Common terminal emulators implement
// the mappings slightly differently as well.
//
// This list is for the most part empirically derived from the most common
// terminal programs, and the parser is defined from that.
//

const ANSIKeyMappings = new Map([// iTerm
['\x1bOP', {
  key: SpecialKey.F1,
  shift: false,
  ctrl: false
}], ['\x1bOQ', {
  key: SpecialKey.F2,
  shift: false,
  ctrl: false
}], ['\x1bOR', {
  key: SpecialKey.F3,
  shift: false,
  ctrl: false
}], ['\x1bOS', {
  key: SpecialKey.F4,
  shift: false,
  ctrl: false
}], ['\x1b[15~', {
  key: SpecialKey.F5,
  shift: false,
  ctrl: false
}], ['\x1b[17~', {
  key: SpecialKey.F6,
  shift: false,
  ctrl: false
}], ['\x1b[18~', {
  key: SpecialKey.F7,
  shift: false,
  ctrl: false
}], ['\x1b[19~', {
  key: SpecialKey.F8,
  shift: false,
  ctrl: false
}], ['\x1b[20~', {
  key: SpecialKey.F9,
  shift: false,
  ctrl: false
}], ['\x1b[21~', {
  key: SpecialKey.F10,
  shift: false,
  ctrl: false
}], ['\x1b[23~', {
  key: SpecialKey.F11,
  shift: false,
  ctrl: false
}], ['\x1b[24~', {
  key: SpecialKey.F12,
  shift: false,
  ctrl: false
}], ['\x1b[A', {
  key: SpecialKey.UP,
  shift: false,
  ctrl: false
}], ['\x1b[B', {
  key: SpecialKey.DOWN,
  shift: false,
  ctrl: false
}], ['\x1b[D', {
  key: SpecialKey.LEFT,
  shift: false,
  ctrl: false
}], ['\x1b[C', {
  key: SpecialKey.RIGHT,
  shift: false,
  ctrl: false
}], ['\x1bOA', {
  key: SpecialKey.UP,
  shift: false,
  ctrl: false
}], ['\x1bOB', {
  key: SpecialKey.DOWN,
  shift: false,
  ctrl: false
}], ['\x1bOD', {
  key: SpecialKey.LEFT,
  shift: false,
  ctrl: false
}], ['\x1bOC', {
  key: SpecialKey.RIGHT,
  shift: false,
  ctrl: false
}], ['\x1b[5~', {
  key: SpecialKey.PAGEUP,
  shift: false,
  ctrl: false
}], ['\x1b[6~', {
  key: SpecialKey.PAGEDOWN,
  shift: false,
  ctrl: false
}], ['\x1bOH', {
  key: SpecialKey.HOME,
  shift: false,
  ctrl: false
}], ['\x1bOF', {
  key: SpecialKey.END,
  shift: false,
  ctrl: false
}], ['\x1b[3~', {
  key: SpecialKey.DEL,
  shift: false,
  ctrl: false
}], ['\x1b[1;2P', {
  key: SpecialKey.F1,
  shift: true,
  ctrl: false
}], ['\x1b[1;2Q', {
  key: SpecialKey.F2,
  shift: true,
  ctrl: false
}], ['\x1b[1;2R', {
  key: SpecialKey.F3,
  shift: true,
  ctrl: false
}], ['\x1b[1;2S', {
  key: SpecialKey.F4,
  shift: true,
  ctrl: false
}], ['\x1b[15;2~', {
  key: SpecialKey.F5,
  shift: true,
  ctrl: false
}], ['\x1b[17;2~', {
  key: SpecialKey.F6,
  shift: true,
  ctrl: false
}], ['\x1b[18;2~', {
  key: SpecialKey.F7,
  shift: true,
  ctrl: false
}], ['\x1b[19;2~', {
  key: SpecialKey.F8,
  shift: true,
  ctrl: false
}], ['\x1b[20;2~', {
  key: SpecialKey.F9,
  shift: true,
  ctrl: false
}], ['\x1b[21;2~', {
  key: SpecialKey.F10,
  shift: true,
  ctrl: false
}], ['\x1b[23;2~', {
  key: SpecialKey.F11,
  shift: true,
  ctrl: false
}], ['\x1b[24;2~', {
  key: SpecialKey.F12,
  shift: true,
  ctrl: false
}], ['\x1b[1;2A', {
  key: SpecialKey.UP,
  shift: true,
  ctrl: false
}], ['\x1b[1;2B', {
  key: SpecialKey.DOWN,
  shift: true,
  ctrl: false
}], ['\x1b[1;2D', {
  key: SpecialKey.LEFT,
  shift: true,
  ctrl: false
}], ['\x1b[1;2C', {
  key: SpecialKey.RIGHT,
  shift: true,
  ctrl: false
}], ['\x1b[1;2H', {
  key: SpecialKey.HOME,
  shift: true,
  ctrl: false
}], ['\x1b[1;2F', {
  key: SpecialKey.END,
  shift: true,
  ctrl: false
}], // macOS terminal
['\x1b[25~', {
  key: SpecialKey.F5,
  shift: true,
  ctrl: false
}], ['\x1b[26~', {
  key: SpecialKey.F6,
  shift: true,
  ctrl: false
}], ['\x1b[28~', {
  key: SpecialKey.F7,
  shift: true,
  ctrl: false
}], ['\x1b[29~', {
  key: SpecialKey.F8,
  shift: true,
  ctrl: false
}], ['\x1b[31~', {
  key: SpecialKey.F9,
  shift: true,
  ctrl: false
}], ['\x1b[32~', {
  key: SpecialKey.F10,
  shift: true,
  ctrl: false
}], ['\x1b[33~', {
  key: SpecialKey.F11,
  shift: true,
  ctrl: false
}], ['\x1b[34~', {
  key: SpecialKey.F12,
  shift: true,
  ctrl: false
}], ['\x1b[3;2~', {
  key: SpecialKey.DEL,
  shift: true,
  ctrl: false
}], // NOTE that these are actually shifted, but it's because macOS uses HOME and
// END itself, and uses SHIFT+HOME and SHIFT+END to send them to the running
// program.
['\x1b[H', {
  key: SpecialKey.HOME,
  shift: false,
  ctrl: false
}], ['\x1b[F', {
  key: SpecialKey.END,
  shift: false,
  ctrl: false
}]]);

class ANSIStreamParser extends _events.default {
  constructor() {
    super();
    this._state = ParseState.START;
    this._buffer = '';
    this._prefix = '';
    this._narg = 0;
    this._args = [];
    this._suffix = '';
    this._tmo = null;
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

  next(s) {
    Array.from(s).forEach(c => {
      this._buffer += c;
      const st = ANSIKeyParser.get(this._state);

      if (!(st != null)) {
        throw new Error("Invariant violation: \"st != null\"");
      }

      for (const edge of st) {
        if (edge.match.has(c)) {
          this._performAction(edge.action, c);

          this._moveTo(edge.next);

          return;
        }
      }

      this._emitTextAndReset(true);
    });
  }

  _performAction(act, c) {
    switch (act) {
      case ParseAction.START_TIMEOUT:
        // the entire key sequence should be sent at once. if we
        // don't see it all in 100 ms, assume it's a partial prefix
        // match and just send back the characters
        this._tmo = setTimeout(() => this._emitTextAndReset(false), 100);
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

  _moveTo(state) {
    this._state = state;

    if (this._state === ParseState.END) {
      this._emitEvent();

      this.init();
    }
  }

  _emitTextAndReset(requeueEscape) {
    const last = this._buffer.charAt(this._buffer.length - 1);

    if (requeueEscape) {
      if (last === ESC) {
        this._buffer = this._buffer.substr(0, this._buffer.length - 1);
      }
    }

    let piece = 0;

    for (let i = 0; i < this._buffer.length; i++) {
      const cp = this._buffer.codePointAt(i);

      if (cp < 32 || cp === 127) {
        // the key is a control key; translate it. first, emit
        // any plain text
        if (piece < i) {
          this.emit('text', this._buffer.substr(piece, i - piece));
        } // convert ctrl code to upper-case character equivalent
        // $FlowFixMe flow doesn't understand that this will always be A..Z


        let ch = String.fromCodePoint(0x40 + cp);
        let ctrl = true; // there are some special cases

        switch (cp) {
          case 0x0d:
            // ctrl+M == ENTER
            ch = 'ENTER';
            ctrl = false;
            break;

          case 0x08: // CTRL+H == backspace

          case 0x7f:
            // 127 == DEL
            // oddly, the BACKSPACE key gets mapped to 127 (ASCII DEL) not
            // ctrl+h (ASCII BS), and the DEL key has its own special escape
            // sequence
            ch = 'BACKSPACE';
            ctrl = false;
            break;

          case 0x1b:
            // 0x1B == ESC
            ch = 'ESCAPE';
            ctrl = false;
            break;
        }

        const ev = {
          data: this._buffer.substr(i, 1),
          prefix: this._buffer.substr(i, 1),
          args: [],
          suffix: '',
          key: ch,
          shift: false,
          ctrl
        };
        this.emit('key', ev);
        piece = i + 1;
        continue;
      }
    }

    if (piece < this._buffer.length) {
      this.emit('text', this._buffer.substr(piece));
    }

    this.init();

    if (requeueEscape && last === ESC) {
      this.next(last);
    }
  }

  _appendArg(c) {
    if (this._args[this._narg] == null) {
      this._args[this._narg] = 0;
    }

    this._args[this._narg] = this._args[this._narg] * 10 + parseInt(c, 10);
  }

  _emitEvent() {
    const event = {
      data: this._buffer,
      prefix: this._prefix,
      args: this._args,
      suffix: this._suffix
    };
    const key = ANSIKeyMappings.get(event.data);

    if (key != null) {
      const keyEvent = Object.assign({}, event, key);
      this.emit('key', keyEvent);
      return;
    } // ESC [row;colR is ANSI RCP (report cursor position)


    if (event.prefix === '[' && event.args.length === 2 && event.suffix === 'R') {
      const cursorEvent = Object.assign({}, event, {
        row: event.args[0],
        column: event.args[1]
      });
      this.emit('cursor', cursorEvent);
      return;
    } // escape sequence we don't recognize


    this.emit('sequence', event);
  }

}

exports.ANSIStreamParser = ANSIStreamParser;