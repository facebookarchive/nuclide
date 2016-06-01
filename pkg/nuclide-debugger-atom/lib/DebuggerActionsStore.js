'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Bridge from './Bridge';
import type {Dispatcher} from 'flux';

import {
  Disposable,
  CompositeDisposable,
} from 'atom';
import Constants from './Constants';

export default class DebuggerActionsStore {
  _bridge: Bridge;
  _disposables: IDisposable;

  constructor(dispatcher: Dispatcher, bridge: Bridge) {
    this._bridge = bridge;
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new CompositeDisposable(
      new Disposable(() => {
        dispatcher.unregister(dispatcherToken);
      })
    );
  }

  _handlePayload(payload: Object) {
    switch (payload.actionType) {
      case Constants.Actions.TRIGGER_DEBUGGER_ACTION:
        this._triggerAction(payload.data.actionId);
        break;
      default:
        return;
    }
  }

  _triggerAction(actionId: string): void {
    this._bridge.triggerAction(actionId);
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
