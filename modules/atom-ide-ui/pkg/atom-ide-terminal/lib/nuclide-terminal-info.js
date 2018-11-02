"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TERMINAL_DEFAULT_INFO = exports.TERMINAL_DEFAULT_ICON = exports.TERMINAL_DEFAULT_LOCATION = exports.TERMINAL_URI = void 0;

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
// The external interface TerminalInfo leaves everything optional.
// When we open a terminal we will instantiate missing fields with defaults.
const TERMINAL_URI = 'atom://nuclide-terminal-view';
exports.TERMINAL_URI = TERMINAL_URI;
const TERMINAL_DEFAULT_LOCATION = 'bottom';
exports.TERMINAL_DEFAULT_LOCATION = TERMINAL_DEFAULT_LOCATION;
const TERMINAL_DEFAULT_ICON = 'terminal';
exports.TERMINAL_DEFAULT_ICON = TERMINAL_DEFAULT_ICON;
const TERMINAL_DEFAULT_INFO = {
  remainOnCleanExit: false,
  defaultLocation: TERMINAL_DEFAULT_LOCATION,
  icon: TERMINAL_DEFAULT_ICON,
  initialInput: '',
  title: '',
  cwd: '',
  preservedCommands: []
};
exports.TERMINAL_DEFAULT_INFO = TERMINAL_DEFAULT_INFO;