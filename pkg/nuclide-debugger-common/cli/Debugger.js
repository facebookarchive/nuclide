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

import invariant from 'assert';
import VsDebugSession from '../lib/VsDebugSession';

export default class Debugger {
  _capabilities: ?Capabilities;
  _debugSession: ?VsDebugSession;
  _logger: log4js$Logger;
  _activeThread: ?number;
  _threads: Map<number, string> = new Map();

  constructor(logger: log4js$Logger) {
    this._logger = logger;
  }

  async openSession(
    adapterInfo: VSAdapterExecutableInfo,
    launchArgs: LaunchRequestArguments,
  ) {
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

  async closeSession() {
    if (this._debugSession == null) {
      return;
    }

    await this._debugSession.disconnect();
    this._threads = new Map();
  }

  async _cacheThreads() {
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
}
