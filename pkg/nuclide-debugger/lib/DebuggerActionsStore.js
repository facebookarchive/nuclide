/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type Bridge from './Bridge';
import type DebuggerDispatcher, {DebuggerAction} from './DebuggerDispatcher';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {ActionTypes} from './DebuggerDispatcher';

export default class DebuggerActionsStore {
  _bridge: Bridge;
  _disposables: IDisposable;

  constructor(dispatcher: DebuggerDispatcher, bridge: Bridge) {
    this._bridge = bridge;
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new UniversalDisposable(() => {
      dispatcher.unregister(dispatcherToken);
    });
  }

  _handlePayload(payload: DebuggerAction) {
    switch (payload.actionType) {
      case ActionTypes.SET_PROCESS_SOCKET:
        const {data} = payload;
        if (data == null) {
          this._bridge.leaveDebugMode();
        } else {
          this._bridge.enterDebugMode();
          this._bridge.setupChromeChannel();
          this._bridge.enableEventsListening();
        }
        break;
      case ActionTypes.TRIGGER_DEBUGGER_ACTION:
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
