'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Breakpoint, Message} from './types';
import type {Observable} from 'rxjs';

import {Subject} from 'rxjs';

/**
 * DebuggerCommander is used to take debugger commands from the user and stream them to a debugger.
 * The debugger can consume the commands by calling `commander.asObservable().subscribe()`.
 *
 * Exposing the DebuggerCommander as an Observable makes it easier to use with Nuclide's RPC
 * framework.
 */
export class DebuggerCommander {
  _subject: Subject<Message>;

  constructor() {
    this._subject = new Subject();
  }

  // Ideally, we would just expose subscribe(), but this is easier with our RPC framework.
  asObservable(): Observable<Message> {
    return this._subject.asObservable();
  }

  addBreakpoint(breakpoint: Breakpoint): void {
    this._subject.next({method: 'add_breakpoint', breakpoint});
  }

  clearBreakpoint(breakpoint: Breakpoint): void {
    this._subject.next({method: 'clear_breakpoint', breakpoint});
  }

  continue(): void {
    this._subject.next({method: 'continue'});
  }

  jump(line: number): void {
    this._subject.next({method: 'jump', line});
  }

  next(): void {
    this._subject.next({method: 'next'});
  }

  quit(): void {
    this._subject.next({method: 'quit'});
  }

  return(): void {
    this._subject.next({method: 'return'});
  }

  step(): void {
    this._subject.next({method: 'step'});
  }
}
