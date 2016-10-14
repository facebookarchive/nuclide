'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LogLevel} from '../../nuclide-logging/lib/rpc-types';
import type {ConnectableObservable} from 'rxjs';

import child_process from 'child_process';
import invariant from 'assert';
import nuclideUri from '../../commons-node/nuclideUri';
import utils from './utils';
import WS from 'ws';
const {log, logTrace, logError, logInfo, setLogLevel} = utils;
import {ClientCallback} from '../../nuclide-debugger-common';
import {observeStream} from '../../commons-node/stream';
import {splitStream} from '../../commons-node/observable';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {checkOutput} from '../../commons-node/process';

export type AttachTargetInfo = {
  pid: number,
  name: string,
  commandName: string,
  basepath?: string,
};

export type LaunchTargetInfo = {
  executablePath: string,
  arguments: Array<string>,
  environmentVariables: Array<string>,
  workingDirectory: string,
  stdinFilePath?: string,
  basepath?: string
};

export type DebuggerConfig = {
  logLevel: LogLevel,
  pythonBinaryPath: string,
  buckConfigRootFile: string,
};

type AttachInfoArgsType = {
  pid: string,
  basepath: string,
};

type LaunchInfoArgsType = {
  executable_path: string,
  launch_arguments: Array<string>,
  launch_environment_variables: Array<string>,
  working_directory: string,
  stdin_filepath: string,
  basepath: string,
};

type LaunchAttachArgsType = AttachInfoArgsType | LaunchInfoArgsType;

export async function getAttachTargetInfoList(
  targetPid: ?number,
): Promise<Array<AttachTargetInfo>> {
  // Get processes list from ps utility.
  // -e: include all processes, does not require -ww argument since truncation of process names is
  //     done by the OS, not the ps utility
  // -o pid,comm: custom format the output to be two columns(pid and process name)
  const pidToName: Map<number, string> = new Map();
  const processes = await checkOutput('ps', ['-e', '-o', 'pid,comm'], {});
  processes.stdout.toString().split('\n').slice(1).forEach(line => {
    const words = line.trim().split(' ');
    const pid = Number(words[0]);
    const command = words.slice(1).join(' ');
    const components = command.split('/');
    const name = components[components.length - 1];
    pidToName.set(pid, name);
  });
  // Get processes list from ps utility.
  // -e: include all processes
  // -ww: provides unlimited width for output and prevents the truncating of command names by ps.
  // -o pid,args: custom format the output to be two columns(pid and command name)
  const pidToCommand: Map<number, string> = new Map();
  const commands = await checkOutput('ps', ['-eww', '-o', 'pid,args'], {});
  commands.stdout.toString().split('\n').slice(1).forEach(line => {
    const words = line.trim().split(' ');
    const pid = Number(words[0]);
    const command = words.slice(1).join(' ');
    pidToCommand.set(pid, command);
  });
  // Filter out processes that have died in between ps calls and zombiue processes.
  // Place pid, process, and command info into AttachTargetInfo objects and return in an array.
  return Array.from(pidToName.entries()).filter((arr => {
    const [pid, name] = arr;
    if (targetPid != null) {
      return pid === targetPid;
    }
    return (
      pidToCommand.has(pid) &&
      !(name.startsWith('(') && name.endsWith(')')) &&
      (name.length < 9 || name.slice(-9) !== '<defunct>')
    );
  }))
  .map(arr => {
    const [pid, name] = arr;
    const commandName = pidToCommand.get(pid);
    invariant(commandName != null);
    return {
      pid,
      name,
      commandName,
    };
  });
}

export class NativeDebuggerService {
  _clientCallback: ClientCallback;
  _lldbWebSocket: ?WS;
  _config: DebuggerConfig;
  _subscriptions: UniversalDisposable;

  constructor(config: DebuggerConfig) {
    this._clientCallback = new ClientCallback();
    this._config = config;
    setLogLevel(config.logLevel);
    this._subscriptions = new UniversalDisposable(this._clientCallback);
  }

  getOutputWindowObservable(): ConnectableObservable<string> {
    return this._clientCallback.getOutputWindowObservable().publish();
  }

  getServerMessageObservable(): ConnectableObservable<string> {
    return this._clientCallback.getServerMessageObservable().publish();
  }

  async attach(attachInfo: AttachTargetInfo): Promise<void> {
    log(`attach process: ${JSON.stringify(attachInfo)}`);
    const inferiorArguments = {
      pid: String(attachInfo.pid),
      basepath: attachInfo.basepath ? attachInfo.basepath : this._config.buckConfigRootFile,
    };
    await this._startDebugging(inferiorArguments);
  }

  async launch(launchInfo: LaunchTargetInfo): Promise<void> {
    log(`launch process: ${JSON.stringify(launchInfo)}`);
    const inferiorArguments = {
      executable_path: launchInfo.executablePath,
      launch_arguments: launchInfo.arguments,
      launch_environment_variables: launchInfo.environmentVariables,
      working_directory: launchInfo.workingDirectory,
      stdin_filepath: launchInfo.stdinFilePath ? launchInfo.stdinFilePath : '',
      basepath: launchInfo.basepath ? launchInfo.basepath : this._config.buckConfigRootFile,
    };
    await this._startDebugging(inferiorArguments);
  }

  async _startDebugging(
    inferiorArguments: LaunchAttachArgsType,
  ): Promise<void> {
    const lldbProcess = this._spawnPythonBackend();
    lldbProcess.on('exit', this._handleLLDBExit.bind(this));
    this._registerIpcChannel(lldbProcess);
    this._sendArgumentsToPythonBackend(lldbProcess, inferiorArguments);
    const lldbWebSocket = await this._connectWithLLDB(lldbProcess);
    this._lldbWebSocket = lldbWebSocket;
    this._subscriptions.add(() => lldbWebSocket.terminate());
    lldbWebSocket.on('message', this._handleLLDBMessage.bind(this));
  }

  _registerIpcChannel(lldbProcess: child_process$ChildProcess): void {
    const IPC_CHANNEL_FD = 4;
    /* $FlowFixMe - update Flow defs for ChildProcess */
    const ipcStream = lldbProcess.stdio[IPC_CHANNEL_FD];
    this._subscriptions.add(
      splitStream(observeStream(ipcStream)).subscribe(
        this._handleIpcMessage.bind(this, ipcStream),
        error => logError(`ipcStream error: ${JSON.stringify(error)}`),
      ),
    );
  }

  _handleIpcMessage(ipcStream: Object, message: string): void {
    logTrace(`ipc message: ${message}`);
    const messageJson = JSON.parse(message);
    if (messageJson.type === 'Nuclide.userOutput') {
      // Write response message to ipc for sync message.
      if (messageJson.isSync) {
        ipcStream.write(JSON.stringify({
          message_id: messageJson.id,
        }) + '\n');
      }
      this._clientCallback.sendUserOutputMessage(JSON.stringify(messageJson.message));
    } else {
      logError(`Unknown message: ${message}`);
    }
  }

  _spawnPythonBackend(): child_process$ChildProcess {
    const lldbPythonScriptPath = nuclideUri.join(__dirname, '../scripts/main.py');
    const python_args = [lldbPythonScriptPath, '--arguments_in_json'];
    const options = {
      cwd: nuclideUri.dirname(lldbPythonScriptPath),
      // FD[3] is used for sending arguments JSON blob.
      // FD[4] is used as a ipc channel for output/atom notifications.
      stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
      detached: false, // When Atom is killed, clang_server.py should be killed, too.
    };
    logInfo(`spawn child_process: ${JSON.stringify(python_args)}`);
    const lldbProcess = child_process.spawn(
      this._config.pythonBinaryPath,
      python_args,
      options,
    );
    this._subscriptions.add(() => lldbProcess.kill());
    return lldbProcess;
  }

  _sendArgumentsToPythonBackend(
    child: child_process$ChildProcess,
    args: LaunchAttachArgsType,
  ): void {
    const ARGUMENT_INPUT_FD = 3;
    /* $FlowFixMe - update Flow defs for ChildProcess */
    const argumentsStream = child.stdio[ARGUMENT_INPUT_FD];
    // Make sure the bidirectional communication channel is set up before
    // sending data.
    argumentsStream.write('init\n');
    this._subscriptions.add(
      observeStream(argumentsStream).first().subscribe(
        text => {
          if (text.startsWith('ready')) {
            const args_in_json = JSON.stringify(args);
            logInfo(`Sending ${args_in_json} to child_process`);
            argumentsStream.write(`${args_in_json}\n`);
          } else {
            logError(`Get unknown initial data: ${text}.`);
            child.kill();
          }
        },
        error => logError(`argumentsStream error: ${JSON.stringify(error)}`),
      ),
    );
  }

  _connectWithLLDB(lldbProcess: child_process$ChildProcess): Promise<WS> {
    log('connecting with lldb');
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
          const ws = new WS(lldbWebSocketAddress);
          ws.on('open', () => {
            // Successfully connected with lldb python process, fulfill the promise.
            resolve(ws);
          });
        }
      });
      lldbProcess.stderr.on('data', chunk => {
        const errorMessage = chunk.toString();
        this._clientCallback.sendUserOutputMessage(JSON.stringify({
          level: 'error',
          text: errorMessage,
        }));
        logError(`child process(${lldbProcess.pid}) stderr: ${errorMessage}`);
      });
      lldbProcess.on('error', () => {
        reject('lldb process error');
      });
      lldbProcess.on('exit', () => {
        reject('lldb process exit');
      });
    });
  }

  _handleLLDBMessage(message: string): void {
    logTrace(`lldb message: ${message}`);
    this._clientCallback.sendChromeMessage(message);
  }

  _handleLLDBExit(): void {
    // Fire and forget.
    this.dispose();
  }

  sendCommand(message: string): Promise<void> {
    const lldbWebSocket = this._lldbWebSocket;
    if (lldbWebSocket != null) {
      logTrace(`forward client message to lldb: ${message}`);
      lldbWebSocket.send(message);
    } else {
      logInfo(`Nuclide sent message to LLDB after socket closed: ${message}`);
    }
    return Promise.resolve();
  }

  dispose(): Promise<void> {
    logInfo('NativeDebuggerService disposed');
    this._subscriptions.dispose();
    return Promise.resolve();
  }
}
