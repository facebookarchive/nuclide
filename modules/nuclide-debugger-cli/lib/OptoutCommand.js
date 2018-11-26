/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {Command} from './Command';
import type {ConsoleIO} from './ConsoleIO';

import os from 'os';
import fs from 'fs';
import {Observable} from 'rxjs';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {trackImmediate} from 'nuclide-commons/analytics';

type InterruptEvent = {
  type: 'interrupt',
};

type LineEvent = {
  type: 'line',
  line: string,
};

type Event = InterruptEvent | LineEvent;

export default class OptoutCommand implements Command {
  name = 'zzz';
  helpText = 'Temporarily opt out of fbdbg.';

  _console: ConsoleIO;
  _pendingText: string = '';
  _subscription: ?rxjs$ISubscription = null;

  constructor(console: ConsoleIO) {
    this._console = console;
  }

  async execute(): Promise<void> {
    this._console.output(
      '\n' +
        'You will be temporarily opted out of fbdbg. Fbdbg will eventually replace\n' +
        'hphpd, at which time the optout will expire. Please tell us why you would\n' +
        'like to opt out so we may improve the experience. Thanks!\n\n' +
        "Enter your reason; end with a single dot '.'. Use ctrl+c to abort.\n",
    );
    this._pendingText = '';
    this._console.stopInput(true);
    this._console.setPrompt('... ');

    this._console.prompt();
    this._subscription = Observable.merge(
      this._console
        .observeInterrupts()
        .switchMap(_ => Observable.from([{type: 'interrupt'}])),
      this._console
        .observeLines()
        .switchMap(line => Observable.from([{type: 'line', line}])),
    )
      .switchMap((event: Event) => {
        switch (event.type) {
          case 'interrupt':
            this._console.outputLine(
              'Entry aborted; you will not be opted out.',
            );
            this._closeNestedInput();
            break;

          case 'line':
            if (event.line === '.') {
              return this._eval();
            }
            this._pendingText = `${this._pendingText}\n${event.line}`;
            this._console.prompt();
        }
        return Observable.empty();
      })
      .subscribe(_ => this._closeNestedInput(), _ => this._closeNestedInput());
  }

  _closeNestedInput() {
    if (this._subscription != null) {
      this._subscription.unsubscribe();
    }
    this._subscription = null;
    this._console.setPrompt();
    this._console.startInput();
  }

  async _eval(): Promise<void> {
    const reason = this._pendingText.trim();
    if (reason === '') {
      this._console.outputLine(
        'You did not give an opt-out reason and will not be opted out.\n',
      );
      return;
    }

    trackImmediate('fbdbg/optout', {
      reason,
    });

    const optout = nuclideUri.join(os.homedir(), '.fbdbg-optout');

    fs.writeFileSync(optout, 'zzz\n');

    this._console.outputLine(
      'You have been successfully opted out (for now). If you quit and restart,\nyou will enter classic hphpd.',
    );
  }
}
