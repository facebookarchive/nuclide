'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Observable} from 'rx';
import child_process from 'child_process';
import path from 'path';
import utils from './utils';
import WebSocket from 'ws';
const {log, logError} = utils;
import {ClientCallback} from './ClientCallback';
import {AttachTargetInfo} from './DebuggerRpcServiceInterface';

export async function getAttachTargetInfoList(): Promise<Array<AttachTargetInfo>> {
  const {asyncExecute} = require('../../../commons');
  // Get processes list from ps utility.
  // -e: include all processes
  // -o pid,comm: custom format the output to be two columns(pid and command name)
  const result = await asyncExecute('ps', ['-e', '-o', 'pid,comm'], {});
  return result.stdout.toString().split('\n').slice(1).map(line => {
    const words = line.trim().split(' ');
    const pid = Number(words[0]);
    const command = words.slice(1).join(' ');
    const components = command.split('/');
    const name = components[components.length - 1];
    return {
      pid,
      name,
    };
  })
  .filter(item => !item.name.startsWith('(') || !item.name.endsWith(')'));
}

export class DebuggerConnection {
  _clientCallback: ClientCallback;
  _lldbWebSocket: WebSocket;

  constructor(lldbWebSocket: WebSocket) {
    this._clientCallback = new ClientCallback();
    this._lldbWebSocket = lldbWebSocket;
    lldbWebSocket.on('message', this._handleLLDBMessage.bind(this));
  }

  getServerMessageObservable(): Observable<string> {
    return this._clientCallback.getServerMessageObservable();
  }

  _handleLLDBMessage(message: string): void {
    log(`lldb message: ${message}`);
    this._clientCallback.sendMessage(message);
  }

  async sendCommand(message: string): Promise<void> {
    const lldbWebSocket = this._lldbWebSocket;
    if (lldbWebSocket) {
      log(`forward client message to lldb: ${message}`);
      lldbWebSocket.send(message);
    } else {
      logError(`Why is not lldb socket available?`);
    }
  }

  async dispose(): Promise<void> {
    log(`DebuggerConnection disposed`);
    this._clientCallback.dispose();
  }
}

export class DebuggerRpcService {
  _lldbWebSocket: ?WebSocket;
  _lldbProcess: ?child_process$ChildProcess;

  constructor() {
    this._lldbWebSocket = null;
    this._lldbProcess = null;
  }

  async attach(pid: number): Promise<DebuggerConnection> {
    log(`attach process: ${pid}`);
    const lldbProcess = this._attachLLDBToProcess(pid);
    this._lldbProcess = lldbProcess;
    const lldbWebSocket = await this._connectWithLLDB(lldbProcess);
    return new DebuggerConnection(lldbWebSocket);
  }

  _attachLLDBToProcess(pid: number): child_process$ChildProcess {
    const lldbPath = path.join(__dirname, '../scripts/main.py');
    const args = [lldbPath, '-p', String(pid)];
    if (this._basepath) {
      args.push('--basepath', this._basepath);
    }
    log(`spawn child_process: ${lldbPath}, ${JSON.stringify(args)}`);
    return child_process.spawn('python', args);
  }

  _connectWithLLDB(lldbProcess: child_process$ChildProcess): Promise<WebSocket> {
    log(`connecting with lldb`);
    return new Promise((resolve, reject) => {
      // Async handle parsing websocket address from the stdout of the child.
      lldbProcess.stdout.on('data', chunk => {
        // stdout should hopefully be set to line-buffering, in which case the
        // string would come on one line.
        const block: string = chunk.toString();
        log(`child process(${lldbProcess.pid}) stdout: ${block}`);
        const result = /Port: (\d+)\n/.exec(block);
        if (result != null) {
          // $FlowIssue - flow has wrong typing for it(t9649946).
          lldbProcess.stdout.removeAllListeners(['data', 'error', 'exit']);
          // TODO[jeffreytan]: explicitly use ipv4 address 127.0.0.1 for now.
          // Investigate if we can use localhost and match protocol version between client/server.
          const lldbWebSocketAddress = `ws://127.0.0.1:${result[1]}/`;
          log(`Connecting lldb with address: ${lldbWebSocketAddress}`);
          const ws = new WebSocket(lldbWebSocketAddress);
          this._lldbWebSocket = ws;
          ws.on('open', () => {
            // Successfully connected with lldb python process, fulfill the promise.
            resolve(ws);
          });
        }
      });
      lldbProcess.stderr.on('data', chunk => {
        logError(`child process(${lldbProcess.pid}) stderr: ${chunk.toString()}`);
      });
      lldbProcess.on('error', () => {
        reject('lldb process error');
      });
      lldbProcess.on('exit', () => {
        reject('lldb process exit');
      });
    });
  }

  async dispose(): Promise<void> {
    log(`DebuggerRpcService disposed`);
    const lldbWebSocket = this._lldbWebSocket;
    if (lldbWebSocket) {
      lldbWebSocket.terminate();
      this._lldbWebSocket = null;
    }
    const lldbProcess = this._lldbProcess;
    if (lldbProcess) {
      lldbProcess.kill();
    }
  }
}
