/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import BridgeAdapter from './Protocol/BridgeAdapter';

/**
  * Class that dispatches Nuclide commands to debugger engine.
  * This is used to abstract away the underlying implementation for command dispatching
  * and allows us to switch between chrome IPC and new non-chrome channel.
  */
export default class CommandDispatcher {
  _webview: ?WebviewElement;
  _bridgeAdapter: BridgeAdapter;

  constructor() {
    this._bridgeAdapter = new BridgeAdapter();
  }

  setupChromeChannel(webview: WebviewElement): void {
    this._webview = webview;
  }

  setupNuclideChannel(debuggerInstance: Object): Promise<void> {
    return this._bridgeAdapter.start(debuggerInstance);
  }

  send(...args: Array<any>): void {
    this._sendViaChromeChannel(...args);
  }

  _sendViaNuclideChannel(...args: Array<any>): void {
    // TODO
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
