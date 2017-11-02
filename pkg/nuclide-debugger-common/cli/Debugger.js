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
import * as DebugProtocol from 'vscode-debugprotocol';

import CommandDispatcher from './CommandDispatcher';
import type {ConsoleIO} from './ConsoleIO';
import StepCommand from './StepCommand';
import ThreadsCommand from './ThreadsCommand';

import invariant from 'assert';
import VsDebugSession from '../lib/VsDebugSession';

export default class Debugger implements DebuggerInterface {
  _capabilities: ?Capabilities;
  _console: ConsoleIO;
  _debugSession: ?VsDebugSession;
  _logger: log4js$Logger;
  _activeThread: ?number;
  _threads: Map<number, string> = new Map();

  constructor(logger: log4js$Logger, con: ConsoleIO) {
    this._logger = logger;
    this._console = con;
  }

  registerCommands(dispatcher: CommandDispatcher): void {
    dispatcher.registerCommand(new ThreadsCommand(this._console, this));
    dispatcher.registerCommand(new StepCommand(this));
  }

  getThreads(): Map<number, string> {
    this._ensureDebugSession();
    return this._threads;
  }

  getActiveThread(): ?number {
    this._ensureDebugSession();
    return this._activeThread;
  }

  async stepIn(): Promise<void> {
    const activeThread = this._activeThread;
    if (activeThread == null || activeThread === undefined) {
      throw new Error('There is no active thread to step into.');
    }

    await this._ensureDebugSession().stepIn({threadId: activeThread});
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

    session
      .observeOutputEvents()
      .subscribe(x => this._console.output(x.body.output));

    session.observeContinuedEvents().subscribe(this._onContinued.bind(this));

    session.observeStopEvents().subscribe(this._onStopped.bind(this));

    session
      .observeExitedDebugeeEvents()
      .subscribe(this._onExitedDebugee.bind(this));

    session
      .observeTerminateDebugeeEvents()
      .subscribe(this._onTerminatedDebugee.bind(this));

    await session.launch(launchArgs);
    await this._cacheThreads();
  }

  async closeSession(): Promise<void> {
    if (this._debugSession == null) {
      return;
    }

    await this._debugSession.disconnect();
    this._threads = new Map();
    this._debugSession = null;
    this._activeThread = null;
  }

  _onContinued(event: DebugProtocol.ContinuedEvent) {
    // if the thread we're actively debugging starts running,
    // stop interactivity until the target stops again
    if (event.body.threadId === this._activeThread) {
      this._console.stopInput();
    }
  }

  _onStopped(event: DebugProtocol.StoppedEvent) {
    if (event.body.threadId === this._activeThread) {
      this._console.startInput();
    }
  }

  _onExitedDebugee(event: DebugProtocol.ExitedEvent) {
    this._console.outputLine(
      `Target exited with status ${event.body.exitCode}`,
    );
    this.closeSession();
  }

  _onTerminatedDebugee(event: DebugProtocol.TerminatedEvent) {
    // Some adapters will send multiple terminated events.
    if (this._debugSession == null) {
      return;
    }
    this._console.outputLine('The target has exited.');
    this.closeSession();
    this._console.startInput();
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

  _ensureDebugSession(): VsDebugSession {
    if (this._debugSession == null) {
      throw new Error('There is no active debugging session.');
    }
    return this._debugSession;
  }
}
