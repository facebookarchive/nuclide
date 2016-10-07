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
import {Observable} from 'rxjs';
import {createWebSocketListener} from './createWebSocketListener';
import {logger} from './logger';
import {FileCache} from './FileCache';

import type {IosDeviceInfo} from './types';

const {log} = logger;

export class DebuggerConnection {
  _webSocket: WS;
  _disposables: UniversalDisposable;
  _fileCache: FileCache;

  constructor(iosDeviceInfo: IosDeviceInfo, sendMessageToClient: (message: string) => void) {
    this._fileCache = new FileCache();
    const {webSocketDebuggerUrl} = iosDeviceInfo;
    const webSocket = new WS(webSocketDebuggerUrl);
    this._webSocket = webSocket;
    const socketMessages = createWebSocketListener(webSocket);
    const translatedMessages = this._translateMessagesForClient(socketMessages);
    this._disposables = new UniversalDisposable(
      translatedMessages.subscribe(sendMessageToClient),
      () => webSocket.close(),
      this._fileCache,
    );
    log(`DebuggerConnection created with device info: ${JSON.stringify(iosDeviceInfo)}`);
  }

  sendCommand(message: string): void {
    this._webSocket.send(this._translateMessageForServer(message));
  }

  _translateMessagesForClient(socketMessages: Observable<string>): Observable<string> {
    return socketMessages
      .map(JSON.parse)
      .mergeMap((message: {method: string}) => {
        if (message.method === 'Debugger.scriptParsed') {
          return Observable.fromPromise(this._fileCache.handleScriptParsed(message));
        } else {
          return Observable.of(message);
        }
      })
      .map(obj => {
        const message = JSON.stringify(obj);
        log(`Sending to client: ${message.substring(0, 5000)}`);
        return message;
      });
  }

  _translateMessageForServer(message: string): string {
    const obj = JSON.parse(message);
    if (obj.method === 'Debugger.setBreakpointByUrl') {
      const updatedObj = this._fileCache.handleSetBreakpointByUrl(obj);
      const updatedMessage = JSON.stringify(updatedObj);
      log(`Sending message to proxy: ${updatedMessage}`);
      return updatedMessage;
    } else {
      return message;
    }
  }

  async dispose(): Promise<void> {
    this._disposables.dispose();
  }
}
