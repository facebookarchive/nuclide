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
import type DebuggerDispatcher, {DebuggerAction} from './DebuggerDispatcher';

import nuclideUri from '../../commons-node/nuclideUri';

import {
  Disposable,
  CompositeDisposable,
} from 'atom';
import {ActionTypes} from './DebuggerDispatcher';

export default class DebuggerActionsStore {
  _bridge: Bridge;
  _disposables: IDisposable;

  constructor(dispatcher: DebuggerDispatcher, bridge: Bridge) {
    this._bridge = bridge;
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new CompositeDisposable(
      new Disposable(() => {
        dispatcher.unregister(dispatcherToken);
      }),
    );
  }

  _handlePayload(payload: DebuggerAction) {
    switch (payload.actionType) {
      case ActionTypes.SET_PROCESS_SOCKET:
        const {data} = payload;
        if (data == null) {
          this._bridge.cleanup();
        } else {
          const url = `${nuclideUri.join(__dirname, '../scripts/inspector.html')}?${data}`;
          this._bridge.renderChromeWebview(url);
        }
        break;
      case ActionTypes.TRIGGER_DEBUGGER_ACTION:
        this._triggerAction(payload.data.actionId);
        break;
      case ActionTypes.OPEN_DEV_TOOLS:
        this._bridge.openDevTools();
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
