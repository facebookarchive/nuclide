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

import BridgeAdapter from './Protocol/BridgeAdapter';
import passesGK from '../../commons-node/passesGK';

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
    this._useNewChannel = await passesGK(
      'nuclide_new_debugger_protocol_channel',
      10 * 1000,
    );
    if (!this._useNewChannel) {
      // Do not bother enable the new channel if not enabled.
      return;
    }
    return this._bridgeAdapter.start(debuggerInstance);
  }

  send(...args: Array<any>): void {
    if (this._useNewChannel) {
      this._sendViaNuclideChannel(...args);
    } else {
      this._sendViaChromeChannel(...args);
    }
  }

  _sendViaNuclideChannel(...args: Array<any>): void {
    switch (args[0]) {
      case 'Continue':
        this._bridgeAdapter.resume();
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
      case 'triggerDebuggerAction':
        this._triggerDebuggerAction(args[1]);
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
