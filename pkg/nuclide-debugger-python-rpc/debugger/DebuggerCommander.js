'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerCommander = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * DebuggerCommander is used to take debugger commands from the user and stream them to a debugger.
 * The debugger can consume the commands by calling `commander.asObservable().subscribe()`.
 *
 * Exposing the DebuggerCommander as an Observable makes it easier to use with Nuclide's RPC
 * framework.
 */
class DebuggerCommander {

  constructor() {
    this._subject = new _rxjsBundlesRxMinJs.Subject();
  }

  // Ideally, we would just expose subscribe(), but this is easier with our RPC framework.
  asObservable() {
    return this._subject.asObservable();
  }

  addBreakpoint(breakpoint) {
    this._subject.next({ method: 'add_breakpoint', breakpoint });
  }

  clearBreakpoint(breakpoint) {
    this._subject.next({ method: 'clear_breakpoint', breakpoint });
  }

  continue() {
    this._subject.next({ method: 'continue' });
  }

  jump(line) {
    this._subject.next({ method: 'jump', line });
  }

  next() {
    this._subject.next({ method: 'next' });
  }

  quit() {
    this._subject.next({ method: 'quit' });
  }

  return() {
    this._subject.next({ method: 'return' });
  }

  step() {
    this._subject.next({ method: 'step' });
  }
}
exports.DebuggerCommander = DebuggerCommander; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                */