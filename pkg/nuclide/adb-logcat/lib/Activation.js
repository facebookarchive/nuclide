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

import {createProcessStream} from './createProcessStream';
import createMessageStream from './createMessageStream';
import {LogTailer} from '../../output/lib/LogTailer';
import {CompositeDisposable, Disposable} from 'atom';
import Rx from 'rx';

class Activation {
  _disposables: CompositeDisposable;
  _logTailer: LogTailer;

  constructor(state: ?Object) {
    const message$ = Rx.Observable.defer(() =>
      createMessageStream(
        createProcessStream()
          .retry(3)
          .tapOnError(() => {
            atom.notifications.addError(
              'adb logcat has crashed 3 times.'
              + ' You can manually restart it using the "Nuclide Adb Logcat: Start" command.'
            );
          })
      )
    );

    this._logTailer = new LogTailer(message$, {
      start: 'adb-logcat:start',
      stop: 'adb-logcat:stop',
      restart: 'adb-logcat:restart',
      error: 'adb-logcat:crash',
    });

    this._disposables = new CompositeDisposable(
      new Disposable(() => { this._logTailer.stop(); }),
      atom.commands.add('atom-workspace', {
        'nuclide-adb-logcat:start': () => this._logTailer.start(),
        'nuclide-adb-logcat:stop': () => this._logTailer.stop(),
        'nuclide-adb-logcat:restart': () => this._logTailer.restart(),
      }),
    );
  }

  consumeOutputService(api: OutputService): IDisposable {
    return api.registerOutputProvider({
      source: 'adb logcat',
      messages: this._logTailer.getMessages(),
    });
  }

  dispose() {
    this._disposables.dispose();
  }
}

module.exports = Activation;
