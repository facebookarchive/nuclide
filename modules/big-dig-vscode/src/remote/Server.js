"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Server = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _vscode() {
  const data = require("vscode");

  _vscode = function () {
    return data;
  };

  return data;
}

function _ConnectionWrapper() {
  const data = require("../ConnectionWrapper");

  _ConnectionWrapper = function () {
    return data;
  };

  return data;
}

function _RemoteConnect() {
  const data = require("../RemoteConnect");

  _RemoteConnect = function () {
    return data;
  };

  return data;
}

function _onEachObservedClosable() {
  const data = _interopRequireDefault(require("../util/onEachObservedClosable"));

  _onEachObservedClosable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('remote');

class Server {
  // Invariant: Only one of _conn and _readyConn can be non-null.
  constructor(profile) {
    this._conn = null;
    this._readyConn = null;
    this._onConnection = new _RxMin.Subject();
    this._disposed = false;
    this._profile = profile;
  }
  /**
   * Returns the current connection, or else creates a new one if one is not
   * open.
   */


  connect() {
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

  _getReadyConn() {
    if (!!this._disposed) {
      throw new Error("Invariant violation: \"!this._disposed\"");
    }

    if (this._readyConn != null) {
      return this._readyConn;
    }

    (0, _log4js().getLogger)().info(`Connecting to ${this.getAddress()}...`);
    this._readyConn = (0, _RemoteConnect().makeConnection)(this._profile).then(conn => {
      this._readyConn = null;
      this._conn = conn;
      (0, _log4js().getLogger)().info(`Connected to ${this.getAddress()}`);

      this._onConnection.next(conn);

      return conn;
    }, error => {
      this._readyConn = null;
      return Promise.reject(error);
    });
    return this._readyConn;
  }

  getAddress() {
    return this._profile.address || this._profile.hostname;
  }

  getProfile() {
    return this._profile;
  }
  /** Returns the current connection, or else `null` if not connected. */


  getCurrentConnection() {
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


  onConnection(emitCurrent = false) {
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


  onEachConnection(handler, options = {}) {
    const emitCurrent = !options.ignoreCurrent;
    const disposeHandlersOnUnsubscribe = !options.stayAliveOnUnsubscribe;
    return _vscode().Disposable.from((0, _onEachObservedClosable().default)(this.onConnection(emitCurrent), handler, (conn, listener) => conn.onClose(listener), {
      disposeHandlersOnUnsubscribe,
      disposeHandlerOnNext: true
    }));
  }

}

exports.Server = Server;