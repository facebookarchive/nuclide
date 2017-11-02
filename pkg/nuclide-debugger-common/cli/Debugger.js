/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {VSAdapterExecutableInfo} from '../lib/types';
import type {Capabilities, LaunchRequestArguments} from 'vscode-debugprotocol';
import type {DebuggerInterface} from './DebuggerInterface';

import CommandDispatcher from './CommandDispatcher';
import type {ConsoleOutput} from './ConsoleOutput';
import ThreadsCommand from './ThreadsCommand';

import invariant from 'assert';
import VsDebugSession from '../lib/VsDebugSession';

export default class Debugger implements DebuggerInterface {
  _capabilities: ?Capabilities;
  _console: ConsoleOutput;
  _debugSession: ?VsDebugSession;
  _logger: log4js$Logger;
  _activeThread: ?number;
  _threads: Map<number, string> = new Map();

  constructor(logger: log4js$Logger, con: ConsoleOutput) {
    this._logger = logger;
    this._console = con;
  }

  registerCommands(dispatcher: CommandDispatcher): void {
    dispatcher.registerCommand(new ThreadsCommand(this._console, this));
  }

  getThreads(): Map<number, string> {
    this._ensureTarget();
    return this._threads;
  }

  getActiveThread(): ?number {
    this._ensureTarget();
    return this._activeThread;
  }

  async openSession(
    adapterInfo: VSAdapterExecutableInfo,
    launchArgs: LaunchRequestArguments,
  ): Promise<void> {
    this._debugSession = new VsDebugSession(
      process.pid.toString(),
      this._logger,
      adapterInfo,
    );

    const session = this._debugSession;

    this._capabilities = await session.initialize({
      adapterID: 'fbdb',
      pathFormat: 'path',
    });

    await session.launch(launchArgs);
    await this._cacheThreads();
  }

  async closeSession(): Promise<void> {
    if (this._debugSession == null) {
      return;
    }

    await this._debugSession.disconnect();
    this._threads = new Map();
  }

  async _cacheThreads(): Promise<void> {
    invariant(
      this._debugSession != null,
      '_cacheThreads called without session',
    );

    const {body: {threads}} = await this._debugSession.threads();
    this._threads = new Map(threads.map(thd => [thd.id, thd.name]));

    this._activeThread = null;
    if (threads.length > 0) {
      this._activeThread = threads[0].id;
    }
  }

  _ensureTarget(): ?VsDebugSession {
    if (this._debugSession == null) {
      throw new Error('There is no active debugging session.');
    }
  }
}
