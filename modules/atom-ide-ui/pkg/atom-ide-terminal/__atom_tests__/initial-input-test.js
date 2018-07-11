"use strict";

function _terminalView() {
  const data = require("../lib/terminal-view");

  _terminalView = function () {
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
 *  strict-local
 * @format
 */
describe('initial input sanitizer', () => {
  it('accepts inputs with valid characters', () => {
    const goodInput = 'echo hello my dear world i am a good string!! "\'yolo\'"';
    expect((0, _terminalView().getSafeInitialInput)(goodInput)).toBe(goodInput);
  });
  it('rejects inputs with potentially malicious characters', () => {
    expect((0, _terminalView().getSafeInitialInput)('echo goodbye world mwahaha' + String.fromCharCode(10))).toBe('');
    expect((0, _terminalView().getSafeInitialInput)('echo goodbye world mwahaha' + String.fromCharCode(13))).toBe('');
    expect((0, _terminalView().getSafeInitialInput)('echo goodbye world mwahaha' + String.fromCharCode(127))).toBe('');
    expect((0, _terminalView().getSafeInitialInput)('echo goodbye world mwahaha' + String.fromCharCode(180))).toBe('');
  });
  it('works for empty strings', () => {
    expect((0, _terminalView().getSafeInitialInput)('')).toBe('');
  });
});