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

import type {IPCEvent} from './types';

import invariant from 'assert';
import {Observable} from 'rxjs';
import BridgeAdapter from './Protocol/BridgeAdapter';
import {
  isNewProtocolChannelEnabled,
} from '../../nuclide-debugger-common/lib/NewProtocolChannelChecker';

/**
  * Class that dispatches Nuclide commands to debugger engine.
  * This is used to abstract away the underlying implementation for command dispatching
  * and allows us to switch between chrome IPC and new non-chrome channel.
  */
export default class CommandDispatcher {
  _webview: ?WebviewElement;
  _bridgeAdapter: BridgeAdapter;
  _useNewChannel: boolean;

  constructor() {
    this._bridgeAdapter = new BridgeAdapter();
    this._useNewChannel = false;
  }

  setupChromeChannel(webview: WebviewElement): void {
    this._webview = webview;
  }

  async setupNuclideChannel(debuggerInstance: Object): Promise<void> {
    this._useNewChannel = await isNewProtocolChannelEnabled();
    return this._bridgeAdapter.start(debuggerInstance);
  }

  send(...args: Array<any>): void {
    if (this._useNewChannel) {
      this._sendViaNuclideChannel(...args);
    } else {
      this._sendViaChromeChannel(...args);
    }
  }

  getEventObservable(): Observable<IPCEvent> {
    invariant(this._webview != null);
    const chromeEvent$ = Observable.fromEvent(this._webview, 'ipc-message');
    return this._bridgeAdapter.getEventObservable().merge(chromeEvent$);
  }

  _sendViaNuclideChannel(...args: Array<any>): void {
    switch (args[0]) {
      case 'Continue':
        this._bridgeAdapter.resume();
        break;
      case 'Pause':
        this._bridgeAdapter.pause();
        break;
      case 'StepOver':
        this._bridgeAdapter.stepOver();
        break;
      case 'StepInto':
        this._bridgeAdapter.stepInto();
        break;
      case 'StepOut':
        this._bridgeAdapter.stepOut();
        break;
      case 'RunToLocation':
        this._bridgeAdapter.runToLocation(args[1], args[2]);
        break;
      case 'triggerDebuggerAction':
        this._triggerDebuggerAction(args[1]);
        break;
      case 'SyncBreakpoints':
        this._bridgeAdapter.setInitialBreakpoints(args[1]);
        break;
      case 'AddBreakpoint':
        this._bridgeAdapter.setFilelineBreakpoint(args[1]);
        break;
      case 'DeleteBreakpoint':
        this._bridgeAdapter.removeBreakpoint(args[1]);
        break;
      case 'UpdateBreakpoint':
        this._bridgeAdapter.updateBreakpoint(args[1]);
        break;
      case 'setSelectedCallFrameIndex':
        this._bridgeAdapter.setSelectedCallFrameIndex(args[1]);
        break;
      case 'evaluateOnSelectedCallFrame':
        this._bridgeAdapter.evaluateExpression(args[1], args[2], args[3]);
        break;
      default:
        // Forward any unimplemented commands to chrome channel.
        this._sendViaChromeChannel(...args);
        break;
    }
  }

  _triggerDebuggerAction(actionId: string): void {
    switch (actionId) {
      case 'debugger.toggle-pause':
        // TODO[jetan]: 'debugger.toggle-pause' needs to implement state management which
        // I haven't think well yet so forward to chrome for now.
        this._sendViaChromeChannel(
          'triggerDebuggerAction',
          'debugger.toggle-pause',
        );
        break;
      case 'debugger.step-over':
        this._bridgeAdapter.stepOver();
        break;
      case 'debugger.step-into':
        this._bridgeAdapter.stepInto();
        break;
      case 'debugger.step-out':
        this._bridgeAdapter.stepOut();
        break;
      case 'debugger.run-snippet':
        this._bridgeAdapter.resume();
        break;
      default:
        throw Error(
          `_triggerDebuggerAction: unrecognized actionId: ${actionId}`,
        );
    }
  }

  _sendViaChromeChannel(...args: Array<any>): void {
    const webview = this._webview;
    if (webview != null) {
      webview.send('command', ...args);
    } else {
      // TODO: log and throw error.
    }
  }
}
