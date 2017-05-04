/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

/**
 * Class that dispatches Nuclide commands to debugger engine.
 * This is used to abstract away the underlying implementation for command dispatching
 * and allows us to switch between chrome IPC and new non-chrome channel.
 */
export default class CommandDispatcher {
  _webview: ?WebviewElement;

  constructor() {
  }

  setWebview(webview: WebviewElement): void {
    this._webview = webview;
  }

  send(channel: string, ...args: Array<any>): void {
    const webview = this._webview;
    if (webview != null) {
      webview.send(channel, ...args);
    } else {
      // TODO: log and throw error.
    }
  }
}
