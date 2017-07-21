'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startCommands = exports.getCommands = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getCommands = exports.getCommands = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    // Get the RPC connection info for the filesystem.
    const serverInfo = yield (0, (_ConfigDirectory || _load_ConfigDirectory()).getServer)();
    if (serverInfo == null) {
      (0, (_errors || _load_errors()).reportConnectionErrorAndExit)('Could not find a nuclide-server with a connected Atom');
    }

    if (!(serverInfo != null)) {
      throw new Error('Invariant violation: "serverInfo != null"');
    }

    const { commandPort, family } = serverInfo;
    return startCommands(commandPort, family);
  });

  return function getCommands() {
    return _ref.apply(this, arguments);
  };
})();

let startCommands = exports.startCommands = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (commandPort, family) {
    // Setup the RPC connection to the NuclideServer process.
    const services = (0, (_nuclideRpc || _load_nuclideRpc()).loadServicesConfig)((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..'));
    const socket = _net.default.connect({
      port: commandPort,
      family: convertStringFamilyToNumberFamily(family)
    });
    const transport = new (_nuclideRpc || _load_nuclideRpc()).SocketTransport(socket);
    try {
      yield transport.onConnected();
    } catch (e) {
      // This is usually ECONNREFUSED ...
      // ... indicating that there was a nuclide-server but it is now shutdown.
      (0, (_errors || _load_errors()).reportConnectionErrorAndExit)('Could not find a nuclide-server with a connected Atom ("Nuclide/Kill Nuclide Server and Restart" will likely help)');
    }
    const connection = (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createLocal(transport, [(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers], services, (_ConfigDirectory || _load_ConfigDirectory()).RPC_PROTOCOL);

    // Get the command interface
    const service = connection.getService('CommandService');
    const commands = yield service.getAtomCommands();
    if (commands == null) {
      (0, (_errors || _load_errors()).reportConnectionErrorAndExit)('Nuclide server is running but no Atom process with Nuclide is connected.');
    }

    if (!(commands != null)) {
      throw new Error('Invariant violation: "commands != null"');
    }

    return commands;
  });

  return function startCommands(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
})();

var _ConfigDirectory;

function _load_ConfigDirectory() {
  return _ConfigDirectory = require('../shared/ConfigDirectory');
}

var _net = _interopRequireDefault(require('net'));

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var _errors;

function _load_errors() {
  return _errors = require('./errors');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function convertStringFamilyToNumberFamily(family) {
  switch (family) {
    case 'IPv4':
      return 4;
    case 'IPv6':
      return 6;
    default:
      throw new Error(`Unrecognized network address family ${family}`);
  }
}