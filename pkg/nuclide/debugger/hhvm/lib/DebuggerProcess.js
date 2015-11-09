'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


const {log, logInfo, logError, setLogLevel} = require('./utils');
var {translateMessageFromServer, translateMessageToServer} = require('./ChromeMessageRemoting');
var remoteUri = require('nuclide-remote-uri');
var {Disposable} = require('atom');

type NotificationMessage = {
  type: 'info' | 'warning' | 'error' | 'fatalError';
  message: string;
};

class DebuggerProcess {
  _remoteDirectoryUri: NuclideUri;
  _proxy: ?HhvmDebuggerProxyService;
  _server: ?WebSocketServer;
  _webSocket: ?WebSocket;
  _disposables: atom$CompositeDisposable;
  _launchScriptPath: ?string;
  _sessionEndCallback: ?() => void;

  constructor(remoteDirectoryUri: NuclideUri, launchScriptPath: ?string) {
    this._remoteDirectoryUri = remoteDirectoryUri;
    this._launchScriptPath = launchScriptPath;
    this._proxy = null;
    this._server = null;
    this._webSocket = null;
    var {CompositeDisposable} = require('atom');
    this._disposables = new CompositeDisposable();
    this._sessionEndCallback = null;

    setLogLevel(atom.config.get('nuclide-debugger-hhvm').logLevel);
  }

  getWebsocketAddress(): Promise<string> {
    logInfo('Connecting to: ' + this._remoteDirectoryUri);
    var {HhvmDebuggerProxyService} = require('nuclide-client').
      getServiceByNuclideUri('HhvmDebuggerProxyService', this._remoteDirectoryUri);
    var proxy = new HhvmDebuggerProxyService();
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

    const config = atom.config.get('nuclide-debugger-hhvm');
    config.targetUri = remoteUri.getPath(this._remoteDirectoryUri);
    logInfo('Connection config: ' + JSON.stringify(config));

    if (!isValidRegex(config.scriptRegex)) {
      // TODO: User facing error message?
      logError('nuclide-debugger-hhvm config scriptRegex is not a valid regular expression: '
        + config.scriptRegex);
      delete config.scriptRegex;
    }

    if (!isValidRegex(config.idekeyRegex)) {
      // TODO: User facing error message?
      logError('nuclide-debugger-hhvm config idekeyRegex is not a valid regular expression: '
        + config.idekeyRegex);
      delete config.idekeyRegex;
    }

    if (this._launchScriptPath) {
      config.endDebugWhenNoRequests = true;
    }

    var attachPromise = proxy.attach(config);
    if (this._launchScriptPath) {
      logInfo('launchScript: ' + this._launchScriptPath);
      proxy.launchScript(this._launchScriptPath);
    }

    return attachPromise.then(attachResult => {

      logInfo('Attached to process. Attach message: ' + attachResult);

      // setup web socket
      // TODO: Assign random port rather than using fixed port.
      var wsPort = 2000;
      var WebSocketServer = require('ws').Server;
      this._server = new WebSocketServer({port: wsPort});
      this._server.on('error', error => {
        logError('Server error: ' + error);
        this.dispose();
      });
      this._server.on('headers', headers => {
        log('Server headers: ' + headers);
      });
      this._server.on('connection', webSocket => {
        if (this._webSocket) {
          log('Already connected to web socket. Discarding new connection.');
          return;
        }

        log('Connecting to web socket client.');
        this._webSocket = webSocket;
        this._webSocket.on('message', this._onSocketMessage.bind(this));
        this._webSocket.on('error', this._onSocketError.bind(this));
        this._webSocket.on('close', this._onSocketClose.bind(this));
      });

      var result = 'ws=localhost:' + String(wsPort) + '/';
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
    if (this._webSocket) {
      this._webSocket.send(
        translateMessageFromServer(
          remoteUri.getHostname(this._remoteDirectoryUri),
          remoteUri.getPort(this._remoteDirectoryUri),
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

  _endSession(): void {
    log('Ending Session');
    if (this._sessionEndCallback) {
      this._sessionEndCallback();
    }
    this.dispose();
  }

  _onSocketMessage(message: string): void {
    log('Recieved webSocket message: ' + message);
    if (this._proxy) {
      this._proxy.sendCommand(translateMessageToServer(message));
    }
  }

  _onSocketError(error): void {
    logError('webSocket error ' + error);
    this.dispose();
  }

  _onSocketClose(code): void {
    log('webSocket Closed ' + code);
    this.dispose();
  }

  dispose() {
    this._disposables.dispose();
    if (this._webSocket) {
      logInfo('closing webSocket');
      this._webSocket.close();
      this._webSocket = null;
    }
    if (this._server) {
      logInfo('closing server');
      this._server.close();
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

module.exports = DebuggerProcess;
