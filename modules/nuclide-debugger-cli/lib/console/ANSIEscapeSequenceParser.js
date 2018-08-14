"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseEscapeSequences;

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

/*
 * Code to find the displayable length of a string that has embedded ANSI
 * escape sequences, and optionally return a version of the string with
 * escape sequences selectively filtered out.
 *
 * This code assumes that the given string can be linearly displayed on
 * the screen. If control characters or sequences that manipulate the
 * cursor are left in the string, then writing the string to the console
 * will obviously not have the effect of just advancing the cursor forward
 * by the display character count.
 *
 * If the string only contains sequences that change display attributes,
 * such as color or font, then displaying the string will work as intended.
 *
 * This code does not (yet) deal with Unicode surrogate pairs.
 */
const ParseState = Object.freeze({
  START: 0,
  ESC: 1,
  CSI: 2,
  CSI_PARAM: 3,
  CSI_INTERMEDIATE: 4,
  ESC_STRING: 5,
  ESC_STRING_END: 6
});
const ParseAction = Object.freeze({
  NONE: 0,
  ESC: 1,
  TEXT: 2,
  CONTROL: 3,
  STRING_PREFIX: 4,
  CSI: 5,
  CSI_PARAM: 6,
  CSI_INTERMEDIATE: 7,
  CSI_FINAL: 8,
  ESC_STRING: 9,
  ESC_STRING_END: 9
});

function charRangeSet(low, high) {
  const s = [];

  for (let i = low; i <= high; i++) {
    s.push(String.fromCodePoint(i));
  }

  return new Set(s);
}

const ESC = '\x1b';
const CSI = '['; // control characters are 0/0 - 1/15 (0x00-0x1f)

const SET_CONTROL = charRangeSet(0x00, 0x1f); // Per ECMA spec, param chars are in the range 3/0-3/15 (0x30-0x3F)

const CSI_SET_PARAM = charRangeSet(0x30, 0x3f); // Intermediate bytes qualify the final byte as to what function to perform.
// They are spec'ed in the range 2/0-2/15 (0x20-0x2F)

const CSI_SET_INTERMEDIATE = charRangeSet(0x20, 0x2f); // Final bytes (terminated a sequence) are in the range 4/0-7/14 (0x40-0x7E)

const CSI_SET_FINAL = charRangeSet(0x40, 0x7e); // These non-CSI sequences are defined to take a string parameter terminated
// by ESC-backslash

const ESC_SET_STRING = new Set(['P', ']', 'X', '^', '_']);
// Defines the FSM for parsing escape sequences
const escapeSequenceParser = new Map([// Nothing recognized yet
[ParseState.START, [{
  match: new Set(ESC),
  action: ParseAction.ESC,
  next: ParseState.ESC
}, {
  match: SET_CONTROL,
  action: ParseAction.CONTROL,
  next: ParseState.START
}, {
  match: null,
  action: ParseAction.TEXT,
  next: ParseState.START
}]], [ParseState.ESC, [{
  match: new Set(CSI),
  action: ParseAction.CSI,
  next: ParseState.CSI
}, {
  match: ESC_SET_STRING,
  action: ParseAction.STRING_PREFIX,
  next: ParseState.ESC_STRING
}, {
  match: null,
  action: ParseAction.NONE,
  next: ParseState.START
}]], [ParseState.CSI, [{
  match: CSI_SET_PARAM,
  action: ParseAction.CSI_PARAM,
  next: ParseState.CSI_PARAM
}, {
  match: CSI_SET_FINAL,
  action: ParseAction.CSI_FINAL,
  next: ParseState.START
}]], [ParseState.CSI_PARAM, [{
  match: CSI_SET_PARAM,
  action: ParseAction.CSI_PARAM,
  next: ParseState.CSI_PARAM
}, {
  match: CSI_SET_INTERMEDIATE,
  action: ParseAction.CSI_INTERMEDIATE,
  next: ParseState.CSI_INTERMEDIATE
}, {
  match: CSI_SET_FINAL,
  action: ParseAction.CSI_FINAL,
  next: ParseState.START
}]], [ParseState.CSI_INTERMEDIATE, [{
  match: CSI_SET_INTERMEDIATE,
  action: ParseAction.CSI_INTERMEDIATE,
  next: ParseState.CSI_INTERMEDIATE
}, {
  match: CSI_SET_FINAL,
  action: ParseAction.CSI_FINAL,
  next: ParseState.START
}]], [ParseState.ESC_STRING, [{
  match: new Set(ESC),
  action: ParseAction.ESC_STRING,
  next: ParseState.ESC_STRING_END
}, {
  match: null,
  action: ParseAction.ESC_STRING,
  next: ParseState.ESC_STRING
}]], [ParseState.ESC_STRING_END, [{
  match: new Set('\\'),
  action: ParseAction.ESC_STRING_END,
  next: ParseState.START
}, {
  match: null,
  action: ParseAction.ESC_STRING,
  next: ParseState.ESC_STRING
}]]]);
const actionHandlers = new Map([[ParseAction.NONE, actionNone], [ParseAction.ESC, actionESC], [ParseAction.TEXT, actionText], [ParseAction.CONTROL, actionControl], [ParseAction.STRING_PREFIX, actionStringPrefix], [ParseAction.CSI, actionCSI], [ParseAction.CSI_PARAM, actionCSIParam], [ParseAction.CSI_INTERMEDIATE, actionCSIIntermediate], [ParseAction.CSI_FINAL, actionCSIFinal], [ParseAction.ESC_STRING, actionESCString], [ParseAction.ESC_STRING_END, actionESCStringEnd]]);

function parseEscapeSequences(s, keepSequence) {
  const state = {
    state: ParseState.START,
    result: {
      filteredText: '',
      displayLength: 0
    },
    escapeSequence: {
      buffer: ''
    },
    keepSequence
  };

  function next(node, ch) {
    for (const edge of node) {
      if (edge.match == null || edge.match.has(ch)) {
        const action = actionHandlers.get(edge.action);

        if (!(action != null)) {
          throw new Error("Invariant violation: \"action != null\"");
        }

        action(state, ch);
        state.state = edge.next;
        return true;
      }
    }

    return false;
  }

  for (const ch of s) {
    let node = escapeSequenceParser.get(state.state);

    if (!(node != null)) {
      throw new Error("Invariant violation: \"node != null\"");
    }

    if (!next(node, ch)) {
      // throw out any malformed sequences
      resetToStartState(state); // NB the start state matches anything

      node = escapeSequenceParser.get(state.state);

      if (!(node != null)) {
        throw new Error("Invariant violation: \"node != null\"");
      }

      next(node, ch);
    }
  }

  return state.result;
} //------------------------------------------------------------------------------
//
// Parser action handlers
//


function actionNone(state, s) {} // The parser has encountered an ESC; save it as the start of a sequence.


function actionESC(state, s) {
  state.escapeSequence.buffer += s;
} // The parser has encountered non-control character text outside an escape
// sequence (i.e. normal displayable text). Save it and adjust the length.


function actionText(state, s) {
  state.result.filteredText += s;
  state.result.displayLength += s.length;
} // The parser has encountered a control character. Save it if it is not
// filtered out (but assume it will not take a display character cell).


function actionControl(state, s) {
  state.escapeSequence.buffer += s;
  endEscapeSequence(state);
} // The parser has encountered the start of a sequence that takes a string
// parameter. Save the prefix.


function actionStringPrefix(state, s) {
  if (state.escapeSequence.prefix == null) {
    state.escapeSequence.prefix = '';
    state.escapeSequence.stringParameter = '';
  }

  state.escapeSequence.buffer += s;
  state.escapeSequence.prefix += s;
} // The parser has recognized a CSI sequence. Set up to parse the rest
// of the seqeuence.


function actionCSI(state, s) {
  state.escapeSequence.buffer += s;
  state.escapeSequence.parameters = '';
  state.escapeSequence.intermediate = '';
  state.escapeSequence.final = '';
} // The parser has encountered a CSI parameter character. Save it.


function actionCSIParam(state, s) {
  state.escapeSequence.buffer += s;

  if (!(state.escapeSequence.parameters != null)) {
    throw new Error("Invariant violation: \"state.escapeSequence.parameters != null\"");
  }

  state.escapeSequence.parameters += s;
} // The parser has encountered a CSI intermediate character. Save it.


function actionCSIIntermediate(state, s) {
  state.escapeSequence.buffer += s;

  if (!(state.escapeSequence.intermediate != null)) {
    throw new Error("Invariant violation: \"state.escapeSequence.intermediate != null\"");
  }

  state.escapeSequence.intermediate += s;
} // The parser has encountered a CSI final character. Save it, and
// selecively keep the sequence in the final string.


function actionCSIFinal(state, s) {
  state.escapeSequence.buffer += s;
  state.escapeSequence.final = s;
  endEscapeSequence(state);
} // The parser has encountered text inside a string parameter. Save it.


function actionESCString(state, s) {
  state.escapeSequence.buffer += s;

  if (!(state.escapeSequence.stringParameter != null)) {
    throw new Error("Invariant violation: \"state.escapeSequence.stringParameter != null\"");
  }

  state.escapeSequence.stringParameter += s;
} // The parser has encountered the end of a string parameter. Save it,
// and selectively keep the sequence in the final string.


function actionESCStringEnd(state, s) {
  state.escapeSequence.buffer += s;

  if (!(state.escapeSequence.stringParameter != null)) {
    throw new Error("Invariant violation: \"state.escapeSequence.stringParameter != null\"");
  }

  state.escapeSequence.stringParameter += s;
  endEscapeSequence(state);
} //------------------------------------------------------------------------------
//
// Utilities
//


function endEscapeSequence(state) {
  if (state.keepSequence == null || state.keepSequence(state.escapeSequence)) {
    state.result.filteredText += state.escapeSequence.buffer;
  }

  state.escapeSequence = {
    buffer: ''
  };
}

function resetToStartState(state) {
  state.state = ParseState.START;
  state.escapeSequence = {
    buffer: ''
  };
}