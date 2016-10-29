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
  _sendMessageToClient: (message: string) => void;

  constructor(iosDeviceInfo: IosDeviceInfo, sendMessageToClient: (message: string) => void) {
    this._sendMessageToClient = sendMessageToClient;
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
      .map(JSON.stringify);
  }

  _translateMessageForServer(message: string): string {
    const obj = JSON.parse(message);
    switch (obj.method) {
      case 'Debugger.setBreakpointByUrl': {
        const updatedObj = this._fileCache.handleSetBreakpointByUrl(obj);
        const updatedMessage = JSON.stringify(updatedObj);
        log(`Sending message to proxy: ${updatedMessage}`);
        return updatedMessage;
      }
      case 'Debugger.enable': {
        this._sendSetBreakpointsActive();
        // Nuclide's debugger will auto-resume the first pause event, so we send a dummy pause
        // when the debugger initially attaches.
        this._sendFakeLoaderBreakpointPause();
        return message;
      }
      default: {
        return message;
      }
    }
  }

  _sendSetBreakpointsActive(): void {
    const debuggerMessage = {
      id: 100000,
      method: 'Debugger.setBreakpointsActive',
      params: {
        active: true,
      },
    };
    this.sendCommand(JSON.stringify(debuggerMessage));
  }

  _sendFakeLoaderBreakpointPause(): void {
    const debuggerPausedMessage = {
      method: 'Debugger.paused',
      params: {
        callFrames: [],
        reason: 'breakpoint',
        data: {},
      },
    };
    this._sendMessageToClient(JSON.stringify(debuggerPausedMessage));
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
