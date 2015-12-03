'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import type {
  nuclide_debugger$DebuggerProcessInfo,
} from 'nuclide-debugger-interfaces/service';

import {DebuggerProcessInfo} from 'nuclide-debugger-utils';
import {Emitter} from 'atom';
import {getLogger} from 'nuclide-logging';

import child_process from 'child_process';
import invariant from 'assert';
import path from 'path';

const logger = getLogger();

class DebuggerProcess {
  _emitter: Emitter;
  _proc: child_process$ChildProcess;
  _websocketAddress: Promise<string>;

  /**
   * @param proc  a process running the debugger/lldb script.
   */
  constructor(proc: child_process$ChildProcess) {
    this._emitter = new Emitter();
    this._proc = proc;

    this._websocketAddress = new Promise((resolve, reject) => {
      // Async handle parsing websocket address from the stdout of the child.
      proc.stdout.on('data', chunk => {
        // stdout should hopefully be set to line-buffering, in which case the
        // string would come on one line.
        const block: string = chunk.toString();
        logger.debug(`child process(${proc.pid}) stdout: ${block}`);
        const result = /Port: (\d+)\n/.exec(block);
        if (result != null) {
          // $FlowFixMe
          proc.stdout.removeAllListeners(['data', 'error', 'exit']);
          resolve('ws=localhost:' + result[1] + '/');
        }
      });
      proc.stderr.on('data', chunk => {
        logger.error(`child process(${proc.pid}) stderr: ${chunk.toString()}`);
      });
      proc.on('error', () => {
        reject('child_process error');
      });
      proc.on('exit', () => {
        reject('child_process exit');
      });
    });
  }

  onSessionEnd(callback: () => void): atom$IDisposable {
    // TODO(jeffreytan): Figure out if/when this event should be dispatched.
    return this._emitter.on('session-end', callback);
  }

  dispose() {
    this._emitter.dispose();
    this._proc.kill();
  }

  getWebsocketAddress(): Promise<string> {
    return this._websocketAddress;
  }
}


class ProcessInfo extends DebuggerProcessInfo {
  _pid: number;
  _name: string;
  _command: string;

  // Execution parameter.
  _basepath: ?string;

  constructor(pid: number, command: string, name: string) {
    super('lldb');

    this._pid = pid;
    this._name = name;
    this._command = command;
  }

  get pid(): number {
    return this._pid;
  }

  set basepath(basepath: string): void {
    this._basepath = basepath;
  }

  attach(): DebuggerProcess {
    const packagePath = atom.packages.resolvePackagePath('nuclide-debugger-lldb');
    invariant(packagePath);

    const lldbPath = path.join(packagePath, 'scripts/main.py');
    const args = [lldbPath, '-p', String(this._pid)];
    if (this._basepath) {
      args.push('--basepath', this._basepath);
    }
    const proc = child_process.spawn('python', args);
    return new DebuggerProcess(proc);
  }

  compareDetails(other: nuclide_debugger$DebuggerProcessInfo): number {
    invariant(other instanceof ProcessInfo);
    return this._name === other._name
      ? (this._pid - other._pid)
      : (this._name < other._name) ? -1 : 1;
  }

  displayString(): string {
    return this._name + '(' + this._pid + ')';
  }
}

async function getProcessInfoList(): Promise<Array<nuclide_debugger$DebuggerProcessInfo>> {
  const {asyncExecute} = require('nuclide-commons');
  const result = await asyncExecute('ps', ['-e', '-o', 'pid,comm'], {});
  // $FlowFixMe: cryptic error about Promises
  return result.stdout.toString().split('\n').slice(1).map(line => {
    const words = line.trim().split(' ');
    const pid = Number(words[0]);
    const command = words.slice(1).join(' ');
    const components = command.split('/');
    const name = components[components.length - 1];
    return new ProcessInfo(pid, command, name);
  })
  .filter(item => !item.displayString().startsWith('(') || !item.displayString().endsWith(')'));
}

module.exports = {
  name: 'lldb',
  getProcessInfoList,
};
