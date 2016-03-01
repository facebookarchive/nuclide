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

import type {HhvmDebuggerProxyService as HhvmDebuggerProxyServiceType,}
    from '../../../debugger-hhvm-proxy/lib/HhvmDebuggerProxyService';

import invariant from 'assert';
import {DebuggerInstance} from '../../atom';
import {getOutputService} from './OutputServiceManager';

const {log, logInfo, logError, setLogLevel} = utils;
const featureConfig = require('../../../feature-config');
const {translateMessageFromServer, translateMessageToServer} = require('./ChromeMessageRemoting');
const remoteUri = require('../../../remote-uri');
const {Disposable} = require('atom');
const WebSocketServer = require('ws').Server;
const {stringifyError} = require('../../../commons').error;

type NotificationMessage = {
  type: 'info' | 'warning' | 'error' | 'fatalError';
  message: string;
};

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
  _disposables: atom$CompositeDisposable;
  _launchScriptPath: ?string;
  _sessionEndCallback: ?() => void;

  constructor(processInfo: DebuggerProcessInfo, launchScriptPath: ?string) {
    super(processInfo);
    this._launchScriptPath = launchScriptPath;
    this._proxy = null;
    this._server = null;
    this._webSocket = null;
    const {CompositeDisposable} = require('atom');
    this._disposables = new CompositeDisposable();
    this._sessionEndCallback = null;

    setLogLevel(getConfig().logLevel);
  }

  getWebsocketAddress(): Promise<string> {
    logInfo('Connecting to: ' + this.getTargetUri());
    const {getServiceByNuclideUri} = require('../../../client');
    const service =
      getServiceByNuclideUri('HhvmDebuggerProxyService', this.getTargetUri());
    invariant(service);
    const proxy = new service.HhvmDebuggerProxyService();
    this._proxy = proxy;
    this._disposables.add(proxy);
    this._disposables.add(proxy.getNotificationObservable().subscribe(
      this._handleNotificationMessage.bind(this),
      this._handleNotificationError.bind(this),
      this._handleNotificationEnd.bind(this),
    ));
    this._disposables.add(proxy.getServerMessageObservable().subscribe(
      this._handleServerMessage.bind(this),
      this._handleServerError.bind(this),
      this._handleServerEnd.bind(this)
    ));
    this._registerOutputWindowLogging(proxy);

    const config = getConfig();
    const connectionConfig: ConnectionConfig = {
      xdebugPort: config.xdebugPort,
      targetUri: remoteUri.getPath(this.getTargetUri()),
      logLevel: config.logLevel,
      endDebugWhenNoRequests: config.endDebugWhenNoRequests,
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

    const attachPromise = proxy.attach(connectionConfig);
    if (this._launchScriptPath) {
      logInfo('launchScript: ' + this._launchScriptPath);
      proxy.launchScript(this._launchScriptPath);
    }

    return attachPromise.then(attachResult => {

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
      });

      const result = 'ws=localhost:' + String(wsPort) + '/';
      log('Listening for connection at: ' + result);
      return result;
    });
  }

  onSessionEnd(callback: () => void): Disposable {
    this._sessionEndCallback = callback;
    return (new Disposable(() => this._sessionEndCallback = null));
  }

  _handleServerMessage(message: string): void {
    log('Recieved server message: ' + message);
    const webSocket = this._webSocket;
    if (webSocket != null) {
      webSocket.send(
        translateMessageFromServer(
          remoteUri.getHostname(this.getTargetUri()),
          remoteUri.getPort(this.getTargetUri()),
          message));
    }
  }

  _handleServerError(error: string): void {
    logError('Received server error: ' + error);
  }

  _handleServerEnd(): void {
    log('Server observerable ends.');
  }

  _handleNotificationMessage(message: NotificationMessage): void {
    switch (message.type) {
      case 'info':
        log('Notification observerable info: ' + message.message);
        atom.notifications.addInfo(message.message);
        break;

      case 'warning':
        log('Notification observerable warning: ' + message.message);
        atom.notifications.addWarning(message.message);
        break;

      case 'error':
        logError('Notification observerable error: ' + message.message);
        atom.notifications.addError(message.message);
        break;

      case 'fatalError':
        logError('Notification observerable fatal error: ' + message.message);
        atom.notifications.addFatalError(message.message);
        break;

      default:
        logError('Unknown message: ' + JSON.stringify(message));
        break;
    }
  }

  _handleNotificationError(error: string): void {
    logError('Notification observerable error: ' + error);
  }

  /**
   * _endSession() must be called from _handleNotificationEnd()
   * so that we can guarantee all notifications have been processed.
   */
  _handleNotificationEnd(): void {
    log('Notification observerable ends.');
    this._endSession();
  }

  _registerOutputWindowLogging(proxy: HhvmDebuggerProxyServiceType): void {
    const api = getOutputService();
    if (api != null) {
      const outputWindowMessage$ = proxy.getOutputWindowObservable()
        .map(message => {
          const serverMessage = translateMessageFromServer(
            remoteUri.getHostname(this.getTargetUri()),
            remoteUri.getPort(this.getTargetUri()),
            message,
          );
          return JSON.parse(serverMessage);
        })
        .filter(messageObj => messageObj.method === 'Console.messageAdded')
        .map(messageObj => {
          return {
            level: messageObj.params.message.level,
            text: messageObj.params.message.text,
          };
        });
      this._disposables.add(api.registerOutputProvider({
        source: 'hhvm debugger',
        messages: outputWindowMessage$,
      }));
    } else {
      logError('Cannot get output window service.');
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
    this._disposables.dispose();
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
