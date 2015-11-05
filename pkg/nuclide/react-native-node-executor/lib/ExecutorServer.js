'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import {Server as WebSocketServer} from 'ws';
import http from 'http';
import ChildManager from './ChildManager';

import type {WebSocket} from 'ws';

const REACT_NATIVE_LAUNCH_DEVTOOLS_URL = '/launch-chrome-devtools';
const REACT_NATIVE_DEBUGGER_PROXY_URL = '/debugger-proxy';

export default class ExecutorServer {

  _webServer: http.Server;
  _webSocketServer: WebSocketServer;
  _children: Map<WebSocket, ChildManager>;

  constructor(port: number) {
    this._initWebServer(port);
    this._initWebSocketServer();
    this._children = new Map();
  }

  _initWebServer(port: number) {
    this._webServer = http.createServer((req, res) => {
      if (req.url === REACT_NATIVE_LAUNCH_DEVTOOLS_URL) {
        res.end('OK');
      }
    });
    this._webServer.listen(port);
  }

  _initWebSocketServer() {
    this._webSocketServer = new WebSocketServer({
      server: this._webServer,
      path: REACT_NATIVE_DEBUGGER_PROXY_URL,
    });
    this._webSocketServer.on('connection', ws => {
      let onReply = (replyID, result) => {
        ws.send(JSON.stringify({replyID, result}));
      };
      let childManager = new ChildManager(onReply);
      this._children.set(ws, childManager);

      const cleanup = () => {
        if (childManager) {
          childManager.killChild();
          this._children.delete(ws);
          childManager = null;
          onReply = null;
        }
      };

      ws.on('message', message => {
        const messageObj = JSON.parse(message);
        if (messageObj.$close) {
          return cleanup();
        }

        invariant(childManager);
        childManager.handleMessage(messageObj);
      });

      ws.on('close', () => {
        cleanup();
      });
    });
  }

  close() {
    for (const cm of this._children.values()) {
      cm.killChild();
    }
    this._webSocketServer.close();
    this._webServer.close();
  }
}
