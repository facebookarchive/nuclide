'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommandServer = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _ConfigDirectory;

function _load_ConfigDirectory() {
  return _ConfigDirectory = require('../shared/ConfigDirectory');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Ties the AtomCommands registered via RemoteCommandService to
// the server side CommandService.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class CommandServer {
  // The list of connected AtomCommands, most recent connection last.
  // We have no way of detecting a traumatic termination of an Atom
  // process, so the most recent connection is likely the healthiest
  // connection.
  static _ensureServer() {
    return (0, _asyncToGenerator.default)(function* () {
      if (CommandServer._server != null) {
        return CommandServer._server;
      }
      const services = (0, (_nuclideRpc || _load_nuclideRpc()).loadServicesConfig)((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..'));
      const registry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry([(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers], services, (_ConfigDirectory || _load_ConfigDirectory()).RPC_PROTOCOL);
      const result = new (_nuclideRpc || _load_nuclideRpc()).SocketServer(registry);
      CommandServer._server = result;
      const address = yield result.getAddress();
      yield (0, (_ConfigDirectory || _load_ConfigDirectory()).createNewEntry)(address.port, address.family);
      return result;
    })();
  }

  static getConnectionDetails() {
    return (0, _asyncToGenerator.default)(function* () {
      const server = CommandServer.getCurrentServer();
      return server == null ? null : yield (yield CommandServer._ensureServer()).getAddress();
    })();
  }

  constructor(atomCommands) {
    this._atomCommands = atomCommands;
    CommandServer._ensureServer();
  }

  dispose() {
    if (!CommandServer._connections.includes(this)) {
      throw new Error('Invariant violation: "CommandServer._connections.includes(this)"');
    }

    CommandServer._connections.splice(CommandServer._connections.indexOf(this), 1);
  }

  static register(atomCommands) {
    return (0, _asyncToGenerator.default)(function* () {
      const server = new CommandServer(atomCommands);
      CommandServer._connections.push(server);
      return server;
    })();
  }

  static getCurrentServer() {
    if (CommandServer._connections.length === 0) {
      return null;
    }
    return CommandServer._connections[CommandServer._connections.length - 1];
  }

  static getAtomCommands() {
    const server = CommandServer.getCurrentServer();
    return server == null ? null : server._atomCommands;
  }
}
exports.CommandServer = CommandServer;
CommandServer._connections = [];
CommandServer._server = null;