'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {PhpDebuggerSessionConfig} from '../../nuclide-debugger-php-rpc';
import type {DebuggerProcessInfo} from '../../nuclide-debugger-base';
import type {
  PhpDebuggerService as PhpDebuggerServiceType,
} from '../../nuclide-debugger-php-rpc/lib/PhpDebuggerService';
import typeof * as PhpDebuggerService
  from '../../nuclide-debugger-php-rpc/lib/PhpDebuggerService';
import utils from './utils';
import invariant from 'assert';
import {DebuggerInstance} from '../../nuclide-debugger-base';
import {ObservableManager} from './ObservableManager';
import {CompositeDisposable} from 'atom';
import featureConfig from '../../commons-atom/featureConfig';
import {translateMessageFromServer, translateMessageToServer} from './ChromeMessageRemoting';
import nuclideUri from '../../commons-node/nuclideUri';
import {Disposable} from 'atom';
import WS from 'ws';
import {stringifyError} from '../../commons-node/string';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';

const {log, logInfo, logError, setLogLevel} = utils;

function getConfig(): PhpDebuggerSessionConfig {
  return (featureConfig.get('nuclide-debugger-php'): any);
}

export class PhpDebuggerInstance extends DebuggerInstance {
  _proxy: ?PhpDebuggerServiceType;
  _server: ?WS.Server;
  _webSocket: ?WebSocket;
  _launchScriptPath: ?string;
  _sessionEndCallback: ?() => void;
  _observableManager: ?ObservableManager;
  _disposables: CompositeDisposable;

  constructor(processInfo: DebuggerProcessInfo, launchScriptPath: ?string) {
    super(processInfo);
    this._launchScriptPath = launchScriptPath;
    this._proxy = null;
    this._server = null;
    this._webSocket = null;
    this._sessionEndCallback = null;
    this._observableManager = null;
    this._disposables = new CompositeDisposable();
    setLogLevel(getConfig().logLevel);
  }

  async getWebsocketAddress(): Promise<string> {
    logInfo('Connecting to: ' + this.getTargetUri());
    const service: ?PhpDebuggerService =
      getServiceByNuclideUri('PhpDebuggerService', this.getTargetUri());
    invariant(service);
    const proxy = new service.PhpDebuggerService();
    this._disposables.add(proxy);
    this._proxy = proxy;
    this._observableManager = new ObservableManager(
      proxy.getNotificationObservable(),
      proxy.getServerMessageObservable(),
      proxy.getOutputWindowObservable().map(message => {
        const serverMessage = translateMessageFromServer(
          nuclideUri.getHostname(this.getTargetUri()),
          message,
        );
        return JSON.parse(serverMessage);
      }),
      this._sendServerMessageToChromeUi.bind(this),
      this._endSession.bind(this),
    );
    this._disposables.add(this._observableManager);

    const config = getConfig();
    const sessionConfig: PhpDebuggerSessionConfig = {
      xdebugAttachPort: config.xdebugAttachPort,
      xdebugLaunchingPort: config.xdebugLaunchingPort,
      targetUri: nuclideUri.getPath(this.getTargetUri()),
      logLevel: config.logLevel,
      endDebugWhenNoRequests: false,
      phpRuntimePath: config.phpRuntimePath,
      dummyRequestFilePath: 'php_only_xdebug_request.php',
    };
    logInfo('Connection config: ' + JSON.stringify(config));

    if (!isValidRegex(config.scriptRegex)) {
      // TODO: User facing error message?
      invariant(config.scriptRegex != null);
      logError('nuclide-debugger-php config scriptRegex is not a valid regular expression: '
        + config.scriptRegex);
    } else {
      sessionConfig.scriptRegex = config.scriptRegex;
    }

    if (!isValidRegex(config.idekeyRegex)) {
      // TODO: User facing error message?
      invariant(config.idekeyRegex != null);
      logError('nuclide-debugger-php config idekeyRegex is not a valid regular expression: '
        + config.idekeyRegex);
    } else {
      sessionConfig.idekeyRegex = config.idekeyRegex;
    }

    // Set config related to script launching.
    if (this._launchScriptPath != null) {
      invariant(config.xdebugLaunchingPort != null);
      sessionConfig.xdebugAttachPort = config.xdebugLaunchingPort;
      sessionConfig.endDebugWhenNoRequests = true;
      sessionConfig.launchScriptPath = this._launchScriptPath;
    }

    const attachResult = await proxy.debug(sessionConfig);
    logInfo('Attached to process. Attach message: ' + attachResult);

    // setup web socket
    // TODO: Assign random port rather than using fixed port.
    const wsPort = 2000;
    const server = new WS.Server({port: wsPort});
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
    this._disposables.add(new Disposable(() => this._disposeServer()));
    this._disposables.add(new Disposable(() => this._disposeWebSocket()));

    const result = 'ws=localhost:' + String(wsPort) + '/';
    log('Listening for connection at: ' + result);
    return result;
  }

  onSessionEnd(callback: () => void): Disposable {
    this._sessionEndCallback = callback;
    return new Disposable(() => { this._sessionEndCallback = null; });
  }

  _sendServerMessageToChromeUi(message: string): void {
    const webSocket = this._webSocket;
    if (webSocket != null) {
      webSocket.send(
        translateMessageFromServer(
          nuclideUri.getHostname(this.getTargetUri()),
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
  }

  _disposeWebSocket(): void {
    const webSocket = this._webSocket;
    if (webSocket) {
      this._webSocket = null;
      logInfo('closing webSocket');
      webSocket.close();
    }
  }

  _disposeServer(): void {
    const server = this._server;
    if (server) {
      this._server = null;
      logInfo('closing server');
      server.close();
    }
  }

  dispose(): void {
    this._disposables.dispose();
  }
}

// TODO: Move this to nuclide-commons.
function isValidRegex(value: ?string): boolean {
  if (value == null) {
    return false;
  }
  try {
    RegExp(value);
  } catch (e) {
    return false;
  }

  return true;
}
