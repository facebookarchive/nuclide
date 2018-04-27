/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {ConsoleIO} from './ConsoleIO';

import readline from 'readline';
import CommandDispatcher from './CommandDispatcher';
import {Observable, Subject} from 'rxjs';

export default class CommandLine implements ConsoleIO {
  _dispatcher: CommandDispatcher;
  _cli: readline$Interface;
  _inputStopped = false;
  _shouldPrompt = false;
  _lastLine = '';

  _onSIGINT: Subject<void> = new Subject();

  constructor(dispatcher: CommandDispatcher) {
    this._dispatcher = dispatcher;
    this._cli = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this._cli.setPrompt('fbdbg> ');
  }

  observerSIGINT(): Observable<void> {
    return this._onSIGINT.asObservable();
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

  stopInput(): void {
    this._inputStopped = true;
  }

  startInput(): void {
    this._inputStopped = false;
    if (this._shouldPrompt) {
      this._cli.prompt();
      this._shouldPrompt = false;
    }
  }

  run(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._inputStopped) {
        this._cli.prompt();
      } else {
        this._shouldPrompt = true;
      }
      this._cli
        .on('line', this._executeCommand.bind(this))
        .on('SIGINT', _ => this._onSIGINT.next())
        .on('close', resolve);
    });
  }

  close(): void {
    this._cli.close();
  }

  async _executeCommand(line: string): Promise<void> {
    if (line !== '') {
      this._lastLine = line;
    }
    try {
      await this._dispatcher.execute(this._lastLine);
    } catch (x) {
      this.outputLine(x.message);
    } finally {
      if (!this._inputStopped) {
        this._cli.prompt();
      } else {
        this._shouldPrompt = true;
      }
    }
  }
}
