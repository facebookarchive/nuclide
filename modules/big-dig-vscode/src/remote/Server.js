/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {AnyTeardown} from '../util/onEachObservedClosable';
import type {IConnectionProfile} from '../configuration';

import {Observable, Subject} from 'rxjs';
import {getLogger} from 'log4js';
import {Disposable} from 'vscode';
import invariant from 'assert';
import {ConnectionWrapper} from '../ConnectionWrapper';
import {makeConnection} from '../RemoteConnect';
import onEachObservedClosable from '../util/onEachObservedClosable';

export type OnConnection = {|connection: ConnectionWrapper|} | {|error: any|};

const logger = getLogger('remote');

export class Server {
  // Invariant: Only one of _conn and _readyConn can be non-null.
  _conn: ?ConnectionWrapper = null;
  _readyConn: ?Promise<ConnectionWrapper> = null;
  _onConnection: Subject<ConnectionWrapper> = new Subject();
  _profile: IConnectionProfile;
  _disposed = false;

  constructor(profile: IConnectionProfile) {
    this._profile = profile;
  }

  /**
   * Returns the current connection, or else creates a new one if one is not
   * open.
   */
  connect(): Promise<ConnectionWrapper> {
    if (this._disposed) {
      throw new Error('Cannot connect after this server has been disposed');
    } else if (this._conn != null) {
      const conn = this._conn;
      if (conn.isClosed()) {
        logger.info(`Connection to ${this.getAddress()} was closed`);
        conn.dispose();
        this._conn = null;
      } else {
        return Promise.resolve(conn);
      }
    }

    return this._getReadyConn();
  }

  _getReadyConn(): Promise<ConnectionWrapper> {
    invariant(!this._disposed);
    if (this._readyConn != null) {
      return this._readyConn;
    }

    getLogger().info(`Connecting to ${this.getAddress()}...`);
    this._readyConn = makeConnection(this._profile).then(
      conn => {
        this._readyConn = null;
        this._conn = conn;
        getLogger().info(`Connected to ${this.getAddress()}`);
        this._onConnection.next(conn);
        return conn;
      },
      error => {
        this._readyConn = null;
        return Promise.reject(error);
      },
    );

    return this._readyConn;
  }

  getAddress(): string {
    return this._profile.address || this._profile.hostname;
  }

  getProfile(): IConnectionProfile {
    return this._profile;
  }

  /** Returns the current connection, or else `null` if not connected. */
  getCurrentConnection(): ?ConnectionWrapper {
    if (this._conn != null && this._conn.isClosed()) {
      this._conn.dispose();
      this._conn = null;
    }
    return this._conn;
  }

  /** Closes the current connection. */
  disconnect() {
    if (this._conn != null) {
      this._conn.dispose();
      this._conn = null;
    }
  }

  dispose() {
    if (this._disposed) {
      return;
    }

    this._disposed = true;
    this._onConnection.complete();

    if (this._readyConn != null) {
      // TODO(siegebell) be able to cancel a connection attempt
      const onSettled = () => this.disconnect();
      this._readyConn.then(onSettled, onSettled);
    } else {
      this.disconnect();
    }
  }

  /**
   * Observe every successful connection.
   * @param emitCurrent Immediately pass the subscriber the current connection. Otherwise, the
   * subscriber will only see *new* connections.
   */
  onConnection(emitCurrent: boolean = false): Observable<ConnectionWrapper> {
    const obs = this._onConnection.asObservable();
    const current = this.getCurrentConnection();
    if (emitCurrent && current != null) {
      return obs.startWith(current);
    }
    return obs;
  }

  /**
   * Listens for remote connections. The given `handler` will be called on
   * each connection, and the returned function/Disposable will be called when
   * the connection is closed or a new connection is made (whichever happens
   * first). The result of a handler -- if it is not a `Promise` -- is
   * guaranteed to be disposed before the handler is called again.
   *
   * @return a disposable that will unsubscribe from listening for new
   * connections. If `disposeOnUnsubscribe` is `true`, then the current handler
   * will also be disposed.
   *
   * Options:
   *   ignoreCurrent - Do not call the handler on any current connections; only
   *    future connections. Default: `false`.
   *   stayAliveOnUnsubscribe - If false, then immediatelty dispose all handlers
   *    when unsubscribed. Otherwise, let them continue until closed.
   *    Default: `false`.
   */
  onEachConnection(
    handler: ConnectionWrapper => AnyTeardown,
    options: {
      ignoreCurrent?: boolean,
      stayAliveOnUnsubscribe?: boolean,
    } = {},
  ): Disposable {
    const emitCurrent = !options.ignoreCurrent;
    const disposeHandlersOnUnsubscribe = !options.stayAliveOnUnsubscribe;

    return Disposable.from(
      onEachObservedClosable(
        this.onConnection(emitCurrent),
        handler,
        (conn, listener) => conn.onClose(listener),
        {
          disposeHandlersOnUnsubscribe,
          disposeHandlerOnNext: true,
        },
      ),
    );
  }
}
