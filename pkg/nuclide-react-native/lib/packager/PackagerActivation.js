'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Message, OutputService} from '../../../nuclide-console/lib/types';

import {LogTailer} from '../../../nuclide-console/lib/LogTailer';
import {observeProcess, safeSpawn} from '../../../commons-node/process';
import {getCommandInfo} from './getCommandInfo';
import {parseMessages} from './parseMessages';
import {CompositeDisposable, Disposable} from 'atom';
import {Observable} from 'rxjs';

/**
 * Runs the server in the appropriate place. This class encapsulates all the state of the packager
 * so as to keep the Activation class (which brings together various RN features) clean.
 */
export class PackagerActivation {
  _logTailer: LogTailer;
  _disposables: CompositeDisposable;

  constructor() {
    this._logTailer = new LogTailer(Observable.defer(getPackagerObservable), {
      start: 'react-native-packager:start',
      stop: 'react-native-packager:stop',
      restart: 'react-native-packager:restart',
      error: 'react-native-packager:crash',
    });

    this._disposables = new CompositeDisposable(
      new Disposable(() => { this._logTailer.stop(); }),
      atom.commands.add('atom-workspace', {
        'nuclide-react-native:start-packager': () => this._logTailer.start(),
        'nuclide-react-native:stop-packager': () => this._logTailer.stop(),
        'nuclide-react-native:restart-packager': () => this._logTailer.restart(),
      }),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  consumeOutputService(api: OutputService): void {
    this._disposables.add(
      api.registerOutputProvider({
        id: 'React Native Packager',
        messages: this._logTailer.getMessages(),
        observeStatus: cb => this._logTailer.observeStatus(cb),
        start: () => { this._logTailer.start(); },
        stop: () => { this._logTailer.stop(); },
      })
    );
  }

}

class NoReactNativeProjectError extends Error {
  constructor() {
    super('No React Native Project found');
    this.name = 'NoReactNativeProjectError';
  }
}

/**
 * Create an observable that runs the packager and and collects its output.
 */
function getPackagerObservable(): Observable<Message> {
  const stdout = Observable.fromPromise(getCommandInfo())
    .switchMap(commandInfo => (
      commandInfo == null
        ? Observable.throw(new NoReactNativeProjectError())
        : Observable.of(commandInfo)
    ))
    .switchMap(commandInfo => {
      const {command, cwd, args} = commandInfo;
      return observeProcess(() => safeSpawn(command, args, {cwd}));
    })
    .switchMap(event => {
      switch (event.kind) {
        case 'error':
          return Observable.throw(event.error);
        case 'stdout':
          return Observable.of(event.data);
        case 'exit':
        case 'stderr':
        default:
          // We just ignore these.
          return Observable.empty();
      }
    })
    .catch(err => {
      // If a React Native project hasn't been found, notify the user and complete normally.
      if (err.name === 'NoReactNativeProjectError') {
        atom.notifications.addError("Couldn't find a React Native project", {
          dismissable: true,
          description:
            'Make sure that one of the folders in your Atom project (or its ancestor)' +
            ' contains a "node_modules" directory with react-native installed, or a' +
            ' .buckconfig file with a "[react-native]" section that has a "server" key.',
        });
        return Observable.empty();
      }
      throw err;
    });

  return parseMessages(stdout);
}
