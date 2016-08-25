'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Message, OutputService} from '../../nuclide-console/lib/types';

import formatEnoentNotification from '../../commons-atom/format-enoent-notification';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {LogTailer} from '../../nuclide-console/lib/LogTailer';
import {createMessageStream} from './createMessageStream';
import {createProcessStream} from './createProcessStream';
import {CompositeDisposable, Disposable} from 'atom';
import {Observable} from 'rxjs';

class Activation {
  _disposables: CompositeDisposable;
  _iosLogTailer: LogTailer;
  _rnLogTailer: LogTailer;

  constructor(state: ?Object) {
    const allMessages = Observable.defer(() => createMessageStream(createProcessStream())).share();
    const rnMessages = allMessages.filter(isRnMessage);
    const otherMessages = allMessages.filter(message => !isRnMessage(message));

    this._iosLogTailer = new LogTailer({
      name: 'iOS Simulator Logs',
      messages: otherMessages
        .catch(err => {
          if (err.code === 'ENOENT') {
            const {message, meta} = formatEnoentNotification({
              feature: 'iOS Syslog tailing',
              toolName: 'syslog',
              pathSetting: 'nuclide-ios-simulator-logs.pathToSyslog',
            });
            atom.notifications.addError(message, meta);
            return Observable.empty();
          }
          throw err;
        }),
      trackingEvents: {
        start: 'ios-simulator-logs:start',
        stop: 'ios-simulator-logs:stop',
        restart: 'ios-simulator-logs:restart',
      },
    });

    this._rnLogTailer = new LogTailer({
      name: 'React Native iOS Logs',
      messages: rnMessages
        .catch(err => {
          if (err.code === 'ENOENT') {
            const {message, meta} = formatEnoentNotification({
              feature: 'React Native iOS Syslog tailing',
              toolName: 'syslog',
              pathSetting: 'nuclide-ios-simulator-logs.pathToSyslog',
            });
            atom.notifications.addError(message, meta);
            return Observable.empty();
          }
          throw err;
        }),
      trackingEvents: {
        start: 'react-native-ios-logs:start',
        stop: 'react-native-ios-logs:stop',
        restart: 'react-native-ios-logs:restart',
      },
    });

    this._disposables = new CompositeDisposable(
      new Disposable(() => { this._iosLogTailer.stop(); }),
      new Disposable(() => { this._rnLogTailer.stop(); }),
      atom.commands.add('atom-workspace', {
        'nuclide-ios-simulator-logs:start': () => this._iosLogTailer.start(),
        'nuclide-ios-simulator-logs:stop': () => this._iosLogTailer.stop(),
        'nuclide-ios-simulator-logs:restart': () => this._iosLogTailer.restart(),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-react-native-ios-logs:start': () => this._rnLogTailer.start(),
        'nuclide-react-native-ios-logs:stop': () => this._rnLogTailer.stop(),
        'nuclide-react-native-ios-logs:restart': () => this._rnLogTailer.restart(),
      }),
    );
  }

  consumeOutputService(api: OutputService): void {
    this._disposables.add(
      api.registerOutputProvider({
        id: 'iOS Simulator Logs',
        messages: this._iosLogTailer.getMessages(),
        observeStatus: cb => this._iosLogTailer.observeStatus(cb),
        start: () => { this._iosLogTailer.start(); },
        stop: () => { this._iosLogTailer.stop(); },
      }),
      api.registerOutputProvider({
        id: 'React Native iOS Logs',
        messages: this._rnLogTailer.getMessages(),
        observeStatus: cb => this._rnLogTailer.observeStatus(cb),
        start: () => { this._rnLogTailer.start(); },
        stop: () => { this._rnLogTailer.stop(); },
      }),
    );
  }

  dispose() {
    this._disposables.dispose();
  }
}

function isRnMessage(message: Message): boolean {
  return message.tags != null
   && message.tags.some(tag => tag === 'core.react' || tag === 'tid:com.facebook.react.JavaScript');
}

module.exports = Activation;
