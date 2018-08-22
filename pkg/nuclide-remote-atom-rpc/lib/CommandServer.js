"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommandServer = void 0;

function _CommandServerConnection() {
  const data = require("./CommandServerConnection");

  _CommandServerConnection = function () {
    return data;
  };

  return data;
}

function _RoutingAtomCommands() {
  const data = require("./RoutingAtomCommands");

  _RoutingAtomCommands = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideRpc() {
  const data = require("../../nuclide-rpc");

  _nuclideRpc = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _ConfigDirectory() {
  const data = require("../shared/ConfigDirectory");

  _ConfigDirectory = function () {
    return data;
  };

  return data;
}

function _nuclideMarshalersCommon() {
  const data = require("../../nuclide-marshalers-common");

  _nuclideMarshalersCommon = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

/**
 * A singleton instance of this class should exist in a Nuclide server.
 *
 * A client that connects to the Nuclide server can register a proxy to
 * its implementation of CommandServerConnection via the CommandServer.
 * The Nuclide server can then use the AtomCommands of a
 * CommandServerConnection to make calls into a client.
 *
 * When the Nuclide server needs to take action on a specific client,
 * it can check the hasOpenPath() for each CommandServerConnection until
 * it finds the appropriate connection, if any.
 */
class CommandServer {
  // The list of connected AtomCommands, most recent connection last.
  // We have no way of detecting a traumatic termination of an Atom
  // process, so the most recent connection is likely the healthiest
  // connection.

  /**
   * In general, this constructor should not be invoked directly.
   * Prefer getCommandServer() in ./command-server-singleton.js.
   */
  constructor() {
    this._connections = [];
    this._server = null;
    this._multiConnectionAtomCommands = new (_RoutingAtomCommands().RoutingAtomCommands)(this);
  }

  getConnectionCount() {
    return this._connections.length;
  }

  getConnections() {
    return this._connections;
  }

  async _ensureServer() {
    if (this._server != null) {
      return this._server;
    }

    const services = (0, _nuclideRpc().loadServicesConfig)(_nuclideUri().default.join(__dirname, '..'));
    const registry = new (_nuclideRpc().ServiceRegistry)([_nuclideMarshalersCommon().localNuclideUriMarshalers], services, _ConfigDirectory().RPC_PROTOCOL);
    const result = new (_nuclideRpc().SocketServer)(registry);
    this._server = result;
    const address = await result.getAddress();
    await (0, _ConfigDirectory().createNewEntry)(address.port, address.family);
    return result;
  }

  async getConnectionDetails() {
    const server = this.getCurrentServer();
    return server == null ? null : (await this._ensureServer()).getAddress();
  }

  async register(fileCache, atomCommands) {
    await this._ensureServer();
    const connection = new (_CommandServerConnection().CommandServerConnection)(fileCache, atomCommands);

    this._connections.push(connection);

    return new (_UniversalDisposable().default)(() => this._removeConnection(connection));
  }

  _removeConnection(connection) {
    if (!this._connections.includes(connection)) {
      throw new Error("Invariant violation: \"this._connections.includes(connection)\"");
    }

    this._connections.splice(this._connections.indexOf(connection), 1);
  }

  getCurrentServer() {
    if (this._connections.length === 0) {
      return null;
    }

    return this._connections[this._connections.length - 1];
  }

  getDefaultAtomCommands() {
    const server = this.getCurrentServer();
    return server == null ? null : server.getAtomCommands();
  }

  _getConnectionByPath(filePath) {
    return (0, _collection().firstOfIterable)((0, _collection().concatIterators)(this._connections.filter(connection => connection.hasOpenPath(filePath)), [this.getCurrentServer()].filter(server => server != null)));
  }

  getAtomCommandsByPath(filePath) {
    const server = this._getConnectionByPath(filePath);

    return server == null ? null : server.getAtomCommands();
  }

  getMultiConnectionAtomCommands() {
    return this._multiConnectionAtomCommands;
  }

}

exports.CommandServer = CommandServer;