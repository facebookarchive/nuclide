/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {FlowIDEConnection} from './FlowIDEConnection';

import {getLogger} from '../../nuclide-logging';

const defaultIDEConnectionFactory = proc => new FlowIDEConnection(proc);

// For the lifetime of this class instance, keep a FlowIDEConnection alive, assuming we do not have
// too many failures in a row.
export class FlowIDEConnectionWatcher {
  _processFactory: () => Promise<?child_process$ChildProcess>;
  _ideConnectionCallback: FlowIDEConnection => mixed;
  _ideConnectionFactory: child_process$ChildProcess => FlowIDEConnection;

  _currentIDEConnection: ?FlowIDEConnection;
  _currentIDEConnectionSubscription: ?IDisposable;

  _isStarted: boolean;
  _isDisposed: boolean;

  constructor(
    processFactory: () => Promise<?child_process$ChildProcess>,
    ideConnectionCallback: FlowIDEConnection => mixed,
    // Can be injected for testing purposes
    ideConnectionFactory: child_process$ChildProcess => FlowIDEConnection =
        defaultIDEConnectionFactory,
  ) {
    this._processFactory = processFactory;
    this._ideConnectionFactory = ideConnectionFactory;
    this._currentIDEConnection = null;
    this._ideConnectionCallback = ideConnectionCallback;
    this._isDisposed = false;
    this._isStarted = false;
  }

  // Returns a promise which resolves when the first connection has been established, or we give up.
  start(): Promise<void> {
    if (!this._isStarted) {
      this._isStarted = true;
      return this._makeIDEConnection();
    } else {
      return Promise.resolve();
    }
  }

  async _makeIDEConnection(): Promise<void> {
    const proc = await this._processFactory();
    if (proc == null) {
      // TODO retry
      getLogger().error('Failed to start IDE connection');
      return;
    }
    // dispose() could have been called while we were waiting for the above promise to resolve.
    if (this._isDisposed) {
      proc.kill();
      return;
    }
    const ideConnection = this._ideConnectionFactory(proc);
    this._ideConnectionCallback(ideConnection);
    this._currentIDEConnectionSubscription = ideConnection.onWillDispose(
      () => this._makeIDEConnection(),
    );

    this._currentIDEConnection = ideConnection;
  }

  dispose(): void {
    if (!this._isDisposed) {
      this._isDisposed = true;
      if (this._currentIDEConnectionSubscription != null) {
        this._currentIDEConnectionSubscription.dispose();
      }
      if (this._currentIDEConnection != null) {
        this._currentIDEConnection.dispose();
      }
    }
  }
}
