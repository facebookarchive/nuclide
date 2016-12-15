/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {ConnectableObservable} from 'rxjs';
import type {JavaLaunchTargetInfo} from './JavaDebuggerServiceInterface';

import invariant from 'assert';
import child_process from 'child_process';
import {DebuggerRpcWebSocketService} from '../../nuclide-debugger-common';
import {Observable} from 'rxjs';


export class JavaDebuggerService extends DebuggerRpcWebSocketService {
  constructor() {
    super('java');
  }

  launch(launchInfo: JavaLaunchTargetInfo): ConnectableObservable<void> {
    return Observable.fromPromise(this._startDebugging(launchInfo)).publish();
  }

  async _startDebugging(launchInfo: JavaLaunchTargetInfo): Promise<void> {
    const childProcess = this._startJavaDebuggerServer();
    childProcess.on('exit', this._handleDebuggerServerExit.bind(this));
    const port = await this._getWebSocketServerPort(childProcess);

    // TODO[jeffreytan]: explicitly use ipv4 address 127.0.0.1 for now.
    // Investigate if we can use localhost and match protocol version between client/server.
    const webSocketAddress = `ws://127.0.0.1:${port}/NuclideJavaDebuggerServer/WebsocketServer`;
    await this.connectToWebSocketServer(webSocketAddress);
    this.getLogger().log(`Connected with server at address: ${webSocketAddress}`);
  }

  _sendCommand(message: Object): void {
    const webSocket = this.getWebSocket();
    invariant(webSocket != null);
    webSocket.send(JSON.stringify(message));
  }

  _startJavaDebuggerServer(): child_process$ChildProcess {
    const options = {
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false, // When Atom is killed, debugger server should be killed, too.
    };
    // TODO: fill the real path of the JavaDbg.jar.
    const childProcess = child_process.spawn(
      '/usr/bin/java',
      ['-classpath', 'JavaDbg.jar', 'JavaDbg', '--nuclide'],
      options,
    );
    this.getSubscriptions().add(() => childProcess.kill());
    return childProcess;
  }

  _getWebSocketServerPort(childProcess: child_process$ChildProcess): Promise<string> {
    return new Promise((resolve, reject) => {
      // Async handle parsing websocket address from the stdout of the child.
      childProcess.stdout.on('data', chunk => {
        // stdout should hopefully be set to line-buffering, in which case the
        // string would come on one line.
        const block: string = chunk.toString();
        this.getLogger().log(`child process(${childProcess.pid}) stdout: ${block}`);
        const result = /Port: (\d+)\n/.exec(block);
        if (result != null) {
          // $FlowIssue - flow has wrong typing for it(t9649946).
          childProcess.stdout.removeAllListeners(['data', 'error', 'exit']);
          resolve(result[1]);
        }
      });
      childProcess.stderr.on('data', chunk => {
        const errorMessage = chunk.toString();
        this.getClientCallback().sendUserOutputMessage(JSON.stringify({
          level: 'error',
          text: errorMessage,
        }));
        this.getLogger().logError(`child process(${childProcess.pid}) stderr: ${errorMessage}`);
      });
      childProcess.on('error', () => {
        reject('child process error');
        this.dispose();
      });
      childProcess.on('exit', () => {
        reject('child process exit');
        this.dispose();
      });
    });
  }

  _handleDebuggerServerExit(): void {
    // Fire and forget.
    this.dispose();
  }
}
