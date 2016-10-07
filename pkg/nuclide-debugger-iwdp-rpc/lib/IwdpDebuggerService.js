'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'event-kit';
import {logger} from './logger';
import WS from 'ws';
import xfetch from '../../commons-node/xfetch';
import fsPromise from '../../commons-node/fsPromise';

import type {ConnectableObservable} from 'rxjs';

const {log} = logger;

let lastServiceObjectDispose = null;

import {ClientCallback} from '../../nuclide-debugger-common/lib/main';

export class IwdpDebuggerService {
  _state: string;
  _clientCallback: ClientCallback;
  _disposables: CompositeDisposable;
  _webSocket: ?WS;
  _package: ?string;

  constructor() {
    if (lastServiceObjectDispose != null) {
      lastServiceObjectDispose();
    }
    lastServiceObjectDispose = this.dispose.bind(this);
    this._disposables = new CompositeDisposable();
    this._clientCallback = new ClientCallback();
    this._disposables.add(this._clientCallback);
  }

  getServerMessageObservable(): ConnectableObservable<string> {
    return this._clientCallback.getServerMessageObservable().publish();
  }

  async debug(): Promise<string> {
    // TODO
    // 1. start ios-webkit-debug-proxy
    // 2. see what devices there are
    // 3. send request to json endpoint to get web socket data
    // 4. set up websocket to iwdp server.

    const webSocket = new WS('ws://localhost:9222/devtools/page/1');
    this._webSocket = webSocket;
    webSocket.on(
      'message',
      async message => {
        const obj = JSON.parse(message);
        if (obj.method !== 'Debugger.scriptParsed') {
          this._clientCallback.sendChromeMessage(message);
        } else if (
          obj.params == null || obj.params.url == null || !obj.params.url.startsWith('http:')
        ) {
          this._clientCallback.sendChromeMessage(message);
        } else {
          // It's a bundle being served by the webserver hosted by the target, so we should
          // download it.
          const {url} = obj.params;
          this._package = url;
          const response = await xfetch(url, {});
          const text = await response.text();
          const tempPath = await fsPromise.tempfile({prefix: 'jsfile', suffix: '.js'});
          await fsPromise.writeFile(tempPath, text);
          obj.params.url = `file://${tempPath}`;


          // Also source maps
          const SOURCE_MAP_REGEX = /\/\/# sourceMappingURL=(.+)$/;
          const matches = SOURCE_MAP_REGEX.exec(text);
          const sourceMapUrl = `http://localhost:8081${matches[1]}`;

          const response2 = await xfetch(sourceMapUrl, {});
          const text2 = await response2.text();
          const base64Text = new Buffer(text2).toString('base64');
          obj.params.sourceMapURL = `data:application/json;base64,${base64Text}`;

          this._clientCallback.sendChromeMessage(JSON.stringify(obj));
        }
      },
    );

    log('IWDP Connected');
    return 'IWDP connected';
  }

  async sendCommand(message: string): Promise<void> {
    if (this._webSocket == null) {
      return;
    }
    const webSocket = this._webSocket;
    const obj = JSON.parse(message);
    if (obj.method === 'Debugger.setBreakpointByUrl') {
      obj.params.url = this._package;
      webSocket.send(JSON.stringify(obj));
    } else {
      webSocket.send(message);
    }
  }

  async dispose(): Promise<void> {
    this._disposables.dispose();
  }
}
