'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import utils from './utils';
import type {ConnectionConfig} from '../../../debugger-hhvm-proxy';
import type {DebuggerProcessInfo} from '../../atom';
import type {
  HhvmDebuggerProxyService as HhvmDebuggerProxyServiceType,
} from '../../../debugger-hhvm-proxy/lib/HhvmDebuggerProxyService';

import invariant from 'assert';
import {DebuggerInstance} from '../../atom';
import {ObservableManager} from './ObservableManager';

const {log, logInfo, logError, setLogLevel} = utils;
const featureConfig = require('../../../feature-config');
const {translateMessageFromServer, translateMessageToServer} = require('./ChromeMessageRemoting');
const remoteUri = require('../../../remote-uri');
const {Disposable} = require('atom');
const WebSocketServer = require('ws').Server;
const {stringifyError} = require('../../../commons').error;

type HhvmDebuggerConfig = {
  scriptRegex: string;
  idekeyRegex: string;
  xdebugPort: number;
  endDebugWhenNoRequests: boolean;
  logLevel: string;
};

function getConfig(): HhvmDebuggerConfig {
  return (featureConfig.get('nuclide-debugger-hhvm'): any);
}

export class HhvmDebuggerInstance extends DebuggerInstance {
  _proxy: ?HhvmDebuggerProxyServiceType;
  _server: ?WebSocketServer;
  _webSocket: ?WebSocket;
  _launchScriptPath: ?string;
  _sessionEndCallback: ?() => void;
  _observableManager: ?ObservableManager;

  constructor(processInfo: DebuggerProcessInfo, launchScriptPath: ?string) {
    super(processInfo);
    this._launchScriptPath = launchScriptPath;
    this._proxy = null;
    this._server = null;
    this._webSocket = null;
    this._sessionEndCallback = null;
    this._observableManager = null;
    setLogLevel(getConfig().logLevel);
  }

  async getWebsocketAddress(): Promise<string> {
    logInfo('Connecting to: ' + this.getTargetUri());
    const {getServiceByNuclideUri} = require('../../../client');
    const service =
      getServiceByNuclideUri('HhvmDebuggerProxyService', this.getTargetUri());
    invariant(service);
    const proxy = new service.HhvmDebuggerProxyService();
    this._proxy = proxy;
    this._observableManager = new ObservableManager(
      proxy.getNotificationObservable(),
      proxy.getServerMessageObservable(),
      proxy.getOutputWindowObservable().map(message => {
        const serverMessage = translateMessageFromServer(
          remoteUri.getHostname(this.getTargetUri()),
          remoteUri.getPort(this.getTargetUri()),
          message,
        );
        return JSON.parse(serverMessage);
      }),
      this._sendServerMessageToChromeUi.bind(this),
      this._endSession.bind(this),
    );

    const config = getConfig();
    const connectionConfig: ConnectionConfig = {
      xdebugPort: config.xdebugPort,
      targetUri: remoteUri.getPath(this.getTargetUri()),
      logLevel: config.logLevel,
      endDebugWhenNoRequests: false,
    };
    logInfo('Connection config: ' + JSON.stringify(config));

    if (!isValidRegex(config.scriptRegex)) {
      // TODO: User facing error message?
      logError('nuclide-debugger-hhvm config scriptRegex is not a valid regular expression: '
        + config.scriptRegex);
    } else {
      connectionConfig.scriptRegex = config.scriptRegex;
    }

    if (!isValidRegex(config.idekeyRegex)) {
      // TODO: User facing error message?
      logError('nuclide-debugger-hhvm config idekeyRegex is not a valid regular expression: '
        + config.idekeyRegex);
    } else {
      connectionConfig.idekeyRegex = config.idekeyRegex;
    }

    if (this._launchScriptPath) {
      connectionConfig.endDebugWhenNoRequests = true;
    }
    const attachResult = await proxy.attach(connectionConfig);
    logInfo('Attached to process. Attach message: ' + attachResult);

    // setup web socket
    // TODO: Assign random port rather than using fixed port.
    const wsPort = 2000;
    const server = new WebSocketServer({port: wsPort});
    this._server = server;
    server.on('error', error => {
      logError('Server error: ' + error);
      this.dispose();
    });
    server.on('headers', headers => {
      log('Server headers: ' + headers);
    });
    server.on('connection', webSocket => {
      if (this._webSocket) {
        log('Already connected to web socket. Discarding new connection.');
        return;
      }

      log('Connecting to web socket client.');
      this._webSocket = webSocket;
      webSocket.on('message', this._onSocketMessage.bind(this));
      webSocket.on('error', this._onSocketError.bind(this));
      webSocket.on('close', this._onSocketClose.bind(this));

      if (this._launchScriptPath) {
        logInfo('launchScript: ' + this._launchScriptPath);
        proxy.launchScript(this._launchScriptPath);
      }
    });

    const result = 'ws=localhost:' + String(wsPort) + '/';
    log('Listening for connection at: ' + result);
    return result;
  }

  onSessionEnd(callback: () => void): Disposable {
    this._sessionEndCallback = callback;
    return (new Disposable(() => this._sessionEndCallback = null));
  }

  _sendServerMessageToChromeUi(message: string): void {
    const webSocket = this._webSocket;
    if (webSocket != null) {
      webSocket.send(
        translateMessageFromServer(
          remoteUri.getHostname(this.getTargetUri()),
          remoteUri.getPort(this.getTargetUri()),
          message,
        ),
      );
    }
  }

  _endSession(): void {
    log('Ending Session');
    if (this._sessionEndCallback) {
      this._sessionEndCallback();
    }
    this.dispose();
  }

  _onSocketMessage(message: string): void {
    log('Recieved webSocket message: ' + message);
    const proxy = this._proxy;
    if (proxy) {
      proxy.sendCommand(translateMessageToServer(message));
    }
  }

  _onSocketError(error: Error): void {
    logError('webSocket error ' + stringifyError(error));
    this.dispose();
  }

  _onSocketClose(code: number): void {
    log('webSocket Closed ' + code);
    this.dispose();
  }

  dispose() {
    if (this._proxy != null) {
      this._proxy.dispose().then(() => {
        if (this._observableManager != null) {
          this._observableManager.dispose();
          this._observableManager = null;
        }
      });
      this._proxy = null;
    }
    const webSocket = this._webSocket;
    if (webSocket) {
      logInfo('closing webSocket');
      webSocket.close();
      this._webSocket = null;
    }
    const server = this._server;
    if (server) {
      logInfo('closing server');
      server.close();
      this._server = null;
    }
  }
}

// TODO: Move this to nuclide-commons.
function isValidRegex(value: string): boolean {
  try {
    RegExp(value);
  } catch (e) {
    return false;
  }

  return true;
}
