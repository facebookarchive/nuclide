'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommandServer = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _class, _temp;

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
let CommandServer = exports.CommandServer = (_temp = _class = class CommandServer {

  static getConnectionDetails() {
    return (0, _asyncToGenerator.default)(function* () {
      return CommandServer._server == null ? null : yield CommandServer._server._server.getAddress();
    })();
  }

  constructor(nuclidePort, atomCommands) {
    this._nuclidePort = nuclidePort;
    this._atomCommands = atomCommands;
    const services = (0, (_nuclideRpc || _load_nuclideRpc()).loadServicesConfig)((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..'));
    const registry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry([(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers], services);
    this._server = new (_nuclideRpc || _load_nuclideRpc()).SocketServer(registry);
  }

  _initialize() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const address = yield _this._server.getAddress();

      yield (0, (_ConfigDirectory || _load_ConfigDirectory()).createNewEntry)(_this._nuclidePort, address.port, address.family);
    })();
  }

  dispose() {
    if (!(CommandServer._server === this)) {
      throw new Error('Invariant violation: "CommandServer._server === this"');
    }

    CommandServer._server = null;
    this._server.dispose();
  }

  static create(port, atomCommands) {
    return (0, _asyncToGenerator.default)(function* () {
      if (CommandServer._server != null) {
        CommandServer._server.dispose();
      }

      if (!(CommandServer._server == null)) {
        throw new Error('Invariant violation: "CommandServer._server == null"');
      }

      const server = new CommandServer(port, atomCommands);
      yield server._initialize();
      CommandServer._server = server;
      return server;
    })();
  }

  static getAtomCommands() {
    if (CommandServer._server == null) {
      return null;
    }
    return CommandServer._server._atomCommands;
  }
}, _class._server = null, _temp);