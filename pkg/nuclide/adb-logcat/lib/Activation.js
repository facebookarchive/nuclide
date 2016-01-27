'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type OutputService from '../../output/lib/OutputService';

import {track} from '../../analytics';
import {observeProcess} from '../../commons';
import createMessageStream from './createMessageStream';
import {CompositeDisposable} from 'atom';
import {spawn} from 'child_process';
import Rx from 'rx';

class Activation {
  _disposables: CompositeDisposable;
  _process: ?child_process$ChildProcess;
  _processDisposables: ?IDisposable;
  _message$: Rx.Subject;
  _processKilledByUser: boolean;

  constructor(state: ?Object) {
    this._message$ = new Rx.Subject();
    this._disposables = new CompositeDisposable(
      atom.commands.add('atom-workspace', {
        'nuclide-adb-logcat:start': () => this._start(),
        'nuclide-adb-logcat:stop': () => this._stop(),
        'nuclide-adb-logcat:restart': () => this._restart(),
      }),
    );
  }

  _restart(): void {
    track('adb-logcat:restart');
    this._stop(false);
    this._start(false);
  }

  _start(trackCall: ?boolean): void {
    if (trackCall !== false) {
      track('adb-logcat:start');
    }

    this._processKilledByUser = false;
    if (this._processDisposables) {
      this._processDisposables.dispose();
    }

    const output$ = observeProcess(spawnAdbLogcat)
      .map(event => {
        if (event.kind === 'exit' && !this._processKilledByUser) {
          throw new Error('adb logcat exited unexpectedly');
        }
        return event;
      })

      // Only get the text from stdout.
      .filter(event => event.kind === 'stdout')
      .map(event => event.data && event.data.replace(/\r?\n$/, ''))

      // Skip the single historical log. Adb requires us to have at least one (`-T`) but (for now at
      // least) we only want to show live logs. Also, since we're automatically retrying, displaying
      // it would mean users would get an inexplicable old entry.
      .skip(1)

      .retry(3)
      .tapOnError(() => {
        if (this._processDisposables) {
          this._processDisposables.dispose();
        }

        atom.notifications.addError(
          'adb logcat has crashed 3 times.'
          + ' You can manually restart it using the "Nuclide Adb Logcat: Start" command.'
        );

        track('adb-logcat:crash');
      });

    this._processDisposables = new CompositeDisposable(
      createMessageStream(output$).subscribe(this._message$),
    );
    this._disposables.add(this._processDisposables);
  }

  _stop(trackCall: ?boolean): void {
    if (trackCall !== false) {
      track('adb-logcat:stop');
    }

    this._processKilledByUser = true;
    if (this._processDisposables != null) {
      this._processDisposables.dispose();
    }
  }

  consumeOutputService(api: OutputService): IDisposable {
    return api.registerOutputProvider({
      source: 'adb logcat',
      messages: this._message$.asObservable(),
    });
  }

  dispose() {
    this._disposables.dispose();
  }
}

function spawnAdbLogcat(): child_process$ChildProcess {
  // TODO(matthewwithanm): Move the adb path to a setting.
  return spawn('/usr/local/bin/adb', ['logcat', '-v', 'long', '-T', '1']);
}

module.exports = Activation;
