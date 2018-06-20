'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommandServer = undefined;

var _CommandServerConnection;

function _load_CommandServerConnection() {
  return _CommandServerConnection = require('./CommandServerConnection');
}

var _RoutingAtomCommands;

function _load_RoutingAtomCommands() {
  return _RoutingAtomCommands = require('./RoutingAtomCommands');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _ConfigDirectory;

function _load_ConfigDirectory() {
  return _ConfigDirectory = require('../shared/ConfigDirectory');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

  /**
   * In general, this constructor should not be invoked directly.
   * Prefer getCommandServer() in ./command-server-singleton.js.
   */
  constructor() {
    this._connections = [];
    this._server = null;

    this._multiConnectionAtomCommands = new (_RoutingAtomCommands || _load_RoutingAtomCommands()).RoutingAtomCommands(this);
  }
  // The list of connected AtomCommands, most recent connection last.
  // We have no way of detecting a traumatic termination of an Atom
  // process, so the most recent connection is likely the healthiest
  // connection.


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

    const services = (0, (_nuclideRpc || _load_nuclideRpc()).loadServicesConfig)((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..'));
    const registry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry([(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers], services, (_ConfigDirectory || _load_ConfigDirectory()).RPC_PROTOCOL);
    const result = new (_nuclideRpc || _load_nuclideRpc()).SocketServer(registry);
    this._server = result;
    const address = await result.getAddress();
    await (0, (_ConfigDirectory || _load_ConfigDirectory()).createNewEntry)(address.port, address.family);
    return result;
  }

  async getConnectionDetails() {
    const server = this.getCurrentServer();
    return server == null ? null : (await this._ensureServer()).getAddress();
  }

  async register(fileCache, atomCommands) {
    await this._ensureServer();
    const connection = new (_CommandServerConnection || _load_CommandServerConnection()).CommandServerConnection(fileCache, atomCommands);
    this._connections.push(connection);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => this._removeConnection(connection));
  }

  _removeConnection(connection) {
    if (!this._connections.includes(connection)) {
      throw new Error('Invariant violation: "this._connections.includes(connection)"');
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
    return (0, (_collection || _load_collection()).firstOfIterable)((0, (_collection || _load_collection()).concatIterators)(this._connections.filter(connection => connection.hasOpenPath(filePath)), [this.getCurrentServer()].filter(server => server != null)));
  }

  getAtomCommandsByPath(filePath) {
    const server = this._getConnectionByPath(filePath);
    return server == null ? null : server.getAtomCommands();
  }

  getMultiConnectionAtomCommands() {
    return this._multiConnectionAtomCommands;
  }
}
exports.CommandServer = CommandServer; /**
                                        * Copyright (c) 2015-present, Facebook, Inc.
                                        * All rights reserved.
                                        *
                                        * This source code is licensed under the license found in the LICENSE file in
                                        * the root directory of this source tree.
                                        *
                                        *  strict-local
                                        * @format
                                        */