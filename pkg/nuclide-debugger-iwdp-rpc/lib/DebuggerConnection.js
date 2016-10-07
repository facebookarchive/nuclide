'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import WS from 'ws';
import xfetch from '../../commons-node/xfetch';
import fsPromise from '../../commons-node/fsPromise';
import {Observable} from 'rxjs';
import {createWebSocketListener} from './createWebSocketListener';
import {logger} from './logger';

import type {IosDeviceInfo} from './types';

const {log} = logger;

export class DebuggerConnection {
  _webSocket: WS;
  _disposables: UniversalDisposable;
  // TODO implement file cache to manage this.
  _package: ?string;

  constructor(iosDeviceInfo: IosDeviceInfo, sendMessageToClient: (message: string) => void) {
    this._package = null;
    const {webSocketDebuggerUrl} = iosDeviceInfo;
    const webSocket = new WS(webSocketDebuggerUrl);
    this._webSocket = webSocket;
    const socketMessages = createWebSocketListener(webSocket);
    const translatedMessages = this._translateMessagesForClient(socketMessages);
    this._disposables = new UniversalDisposable(
      translatedMessages.subscribe(sendMessageToClient),
      () => webSocket.close(),
    );
    log(`DebuggerConnection created with device info: ${JSON.stringify(iosDeviceInfo)}`);
  }

  sendCommand(message: string): void {
    this._webSocket.send(this._translateMessageForServer(message));
  }

  _translateMessagesForClient(socketMessages: Observable<string>): Observable<string> {
    return socketMessages.mergeMap(message => {
      const obj = JSON.parse(message);
      if (obj.method === 'Debugger.scriptParsed') {
        const {params} = obj;
        if (params == null) {
          return Observable.of(message);
        }
        const {url} = params;
        if (url == null || !url.startsWith('http:')) {
          return Observable.of(message);
        }
        // The file is being served by the webserver hosted by the target, so we should download it.
        // TODO Move this logic to a File cache.
        return Observable.fromPromise((async () => {
          log(`Got url: ${url}`);
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
          const newMessage = JSON.stringify(obj);
          log(`Sending: ${newMessage.substring(0, 5000)}`);
          return newMessage;
        })());
      }
      return Observable.of(message);
    });
  }

  _translateMessageForServer(message: string): string {
    const obj = JSON.parse(message);
    if (obj.method === 'Debugger.setBreakpointByUrl') {
      obj.params.url = this._package;
      const newMessage = JSON.stringify(obj);
      log(`Sending message to proxy: ${newMessage}`);
      return newMessage;
    } else {
      return message;
    }
  }

  async dispose(): Promise<void> {
    this._disposables.dispose();
  }
}
