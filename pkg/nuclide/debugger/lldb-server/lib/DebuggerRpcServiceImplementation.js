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
const {log, logError, logInfo} = utils;
import {ClientCallback} from '../../common/lib/ClientCallback';
import {AttachTargetInfo, LaunchTargetInfo} from './DebuggerRpcServiceInterface';
import {observeStream, splitStream} from '../../../commons';

type AttachInfoArgsType = {
  pid: string;
  basepath: string;
};

type LaunchInfoArgsType = {
  executable_path: string;
  launch_arguments: string;
  working_directory: string;
  basepath: string;
};

type LaunchAttachArgsType = AttachInfoArgsType | LaunchInfoArgsType;

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
  _lldbProcess: child_process$ChildProcess;
  _argumentStreamSubscription: IDisposable;
  _ipcChannelSubscription: IDisposable;

  constructor(
    lldbWebSocket: WebSocket,
    lldbProcess: child_process$ChildProcess,
    argumentStreamSubscription: IDisposable,
  ) {
    this._clientCallback = new ClientCallback();
    this._lldbWebSocket = lldbWebSocket;
    this._lldbProcess = lldbProcess;
    this._argumentStreamSubscription = argumentStreamSubscription;
    lldbWebSocket.on('message', this._handleLLDBMessage.bind(this));
    lldbProcess.on('exit', this._handleLLDBExit.bind(this));
    this._ipcChannelSubscription = this._registerIpcChannel();
  }

  _registerIpcChannel(): IDisposable {
    const IPC_CHANNEL_FD = 4;
    /* $FlowFixMe - update Flow defs for ChildProcess */
    const ipcStream = this._lldbProcess.stdio[IPC_CHANNEL_FD];
    return splitStream(observeStream(ipcStream)).subscribe(
      this._handleIpcMessage.bind(this),
      error => logError(`ipcStream error: ${JSON.stringify(error)}`),
    );
  }

  _handleIpcMessage(message: string): void {
    log(`ipc message: ${message}`);
    const messageJson = JSON.parse(message);
    if (messageJson.type === 'Nuclide.userOutput') {
      this._clientCallback.sendUserOutputMessage(JSON.stringify(messageJson.message));
    } else {
      logError(`Unknown message: ${message}`);
    }
  }

  getServerMessageObservable(): Observable<string> {
    return this._clientCallback.getServerMessageObservable();
  }

  getOutputWindowObservable(): Observable<string> {
    return this._clientCallback.getOutputWindowObservable();
  }

  _handleLLDBMessage(message: string): void {
    log(`lldb message: ${message}`);
    this._clientCallback.sendChromeMessage(message);
  }

  _handleLLDBExit(): void {
    // Fire and forget.
    this.dispose();
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
    logInfo(`DebuggerConnection disposed`);
    this._argumentStreamSubscription.dispose();
    this._ipcChannelSubscription.dispose();
    this._clientCallback.dispose();
    this._lldbWebSocket.terminate();
    this._lldbProcess.kill();
  }
}

export class DebuggerRpcService {
  constructor() {
  }

  async attach(attachInfo: AttachTargetInfo): Promise<DebuggerConnection> {
    log(`attach process: ${JSON.stringify(attachInfo)}`);
    const lldbProcess = this._spawnPythonBackend();
    const inferiorArguments = {
      pid: String(attachInfo.pid),
      basepath: attachInfo.basepath ? attachInfo.basepath : '.',
    };
    const argumentStreamSubscription = this._sendArgumentsToPythonBackend(
      lldbProcess,
      inferiorArguments
    );
    const lldbWebSocket = await this._connectWithLLDB(lldbProcess);
    return new DebuggerConnection(lldbWebSocket, lldbProcess, argumentStreamSubscription);
  }

  async launch(launchInfo: LaunchTargetInfo): Promise<DebuggerConnection> {
    log(`launch process: ${JSON.stringify(launchInfo)}`);
    const lldbProcess = this._spawnPythonBackend();
    const inferiorArguments = {
      executable_path: launchInfo.executablePath,
      launch_arguments: launchInfo.arguments,
      working_directory: launchInfo.workingDirectory,
      basepath: launchInfo.basepath ? launchInfo.basepath : '.',
    };
    const argumentStreamSubscription = this._sendArgumentsToPythonBackend(
      lldbProcess,
      inferiorArguments
    );
    const lldbWebSocket = await this._connectWithLLDB(lldbProcess);
    return new DebuggerConnection(lldbWebSocket, lldbProcess, argumentStreamSubscription);
  }

  _spawnPythonBackend(): child_process$ChildProcess {
    const lldbPythonScriptPath = path.join(__dirname, '../scripts/main.py');
    const python_args = [lldbPythonScriptPath, '--arguments_in_json'];
    const options = {
      cwd: path.dirname(lldbPythonScriptPath),
      // FD[3] is used for sending arguments JSON blob.
      // FD[4] is used as a ipc channel for output/atom notifications.
      stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
      detached: false, // When Atom is killed, clang_server.py should be killed, too.
    };
    logInfo(`spawn child_process: ${JSON.stringify(python_args)}`);
    return child_process.spawn('python', python_args, options);
  }

  _sendArgumentsToPythonBackend(
    child: child_process$ChildProcess,
    args: LaunchAttachArgsType
  ): IDisposable {
    const ARGUMENT_INPUT_FD = 3;
    /* $FlowFixMe - update Flow defs for ChildProcess */
    const argumentsStream = child.stdio[ARGUMENT_INPUT_FD];
    // Make sure the bidirectional communication channel is set up before
    // sending data.
    argumentsStream.write('init\n');
    return observeStream(argumentsStream).first().subscribe(text => {
      if (text.startsWith('ready')) {
        const args_in_json = JSON.stringify(args);
        logInfo(`Sending ${args_in_json} to child_process`);
        argumentsStream.write(`${args_in_json}\n`);
      } else {
        logError(`Get unknown initial data: ${text}.`);
        child.kill();
      }
    },
    error => logError(`argumentsStream error: ${JSON.stringify(error)}`)
    );
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
    logInfo(`DebuggerRpcService disposed`);
  }
}
