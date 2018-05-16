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

import type {ConsoleIO} from './ConsoleIO';

import readline from 'readline';
import CommandDispatcher from './CommandDispatcher';
import {Observable, Subject} from 'rxjs';

const PROMPT = 'fbdbg> ';

export default class CommandLine implements ConsoleIO {
  _dispatcher: CommandDispatcher;
  _cli: readline$Interface;
  _inputStopped = false;
  _shouldPrompt = false;
  _lastLine = '';
  _overridePrompt: ?string = null;

  _interrupts: Subject<void>;
  _lines: Subject<string>;

  _subscriptions: Array<rxjs$ISubscription> = [];

  constructor(dispatcher: CommandDispatcher) {
    this._dispatcher = dispatcher;
    this._cli = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.setPrompt();

    this._interrupts = new Subject();
    this._subscriptions.push(
      Observable.fromEvent(this._cli, 'SIGINT').subscribe(this._interrupts),
    );

    this._lines = new Subject();
    this._subscriptions.push(
      Observable.fromEvent(this._cli, 'line')
        .takeUntil(Observable.fromEvent(this._cli, 'close'))
        .subscribe(this._lines),
    );

    this._subscriptions.push(
      this._lines
        .filter(_ => !this._inputStopped)
        .switchMap(_ => {
          this._lastLine = _.trim() === '' ? this._lastLine : _.trim();
          return this._dispatcher.execute(this._lastLine);
        })
        .subscribe(_ => {
          if (_ != null) {
            this.outputLine(_.message);
          }
          if (!this._inputStopped) {
            this._cli.prompt();
          } else {
            this._shouldPrompt = true;
          }
        }),
    );

    this._shouldPrompt = true;
  }

  dispose() {
    this._subscriptions.forEach(_ => _.unsubscribe());
  }

  observeInterrupts(): Observable<void> {
    return this._interrupts;
  }

  observeLines(): Observable<string> {
    return this._lines;
  }

  setPrompt(prompt: ?string): void {
    this._overridePrompt = prompt;
    this._updatePrompt();
  }

  _updatePrompt(): void {
    if (this._inputStopped) {
      this._cli.setPrompt('');
    } else {
      this._cli.setPrompt(
        this._overridePrompt != null ? this._overridePrompt : PROMPT,
      );
    }
  }

  // $TODO handle paging long output (more) if termcap allows us to know the screen height
  output(text: string): void {
    if (!this._inputStopped) {
      if (!text.startsWith('\n')) {
        process.stdout.write('\n');
      }
      process.stdout.write(text);
      this._cli.prompt(true);
      return;
    }
    process.stdout.write(text);
  }

  outputLine(line?: string = ''): void {
    process.stdout.write(`${line}\n`);
  }

  prompt(): void {
    this._cli.prompt();
  }

  stopInput(): void {
    this._inputStopped = true;
    this._updatePrompt();
  }

  startInput(): void {
    this._inputStopped = false;
    this._updatePrompt();
    if (this._shouldPrompt) {
      this._cli.prompt();
      this._shouldPrompt = false;
    }
  }

  close(): void {
    this._cli.close();
  }
}
