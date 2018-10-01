"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCommands = getCommands;

function _ConfigDirectory() {
  const data = require("../shared/ConfigDirectory");

  _ConfigDirectory = function () {
    return data;
  };

  return data;
}

var _net = _interopRequireDefault(require("net"));

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

function _nuclideMarshalersCommon() {
  const data = require("../../nuclide-marshalers-common");

  _nuclideMarshalersCommon = function () {
    return data;
  };

  return data;
}

function _errors() {
  const data = require("./errors");

  _errors = function () {
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

async function getCommands(argv, rejectIfZeroConnections) {
  const commands = argv.port != null && argv.family != null ? await startCommands(argv.port, argv.family) : await findExistingCommands();

  if ((await commands.getConnectionCount()) === 0 && rejectIfZeroConnections) {
    throw new (_errors().FailedConnectionError)('Nuclide server is running but no Atom process with Nuclide is connected.');
  }

  return commands;
}

async function findExistingCommands() {
  // Get the RPC connection info for the filesystem.
  const serverInfo = await (0, _ConfigDirectory().getServer)();

  if (serverInfo == null) {
    throw new (_errors().FailedConnectionError)('Could not find a nuclide-server with a connected Atom');
  }

  if (!(serverInfo != null)) {
    throw new Error("Invariant violation: \"serverInfo != null\"");
  }

  const {
    commandPort,
    family
  } = serverInfo;
  return startCommands(commandPort, family);
}

async function startCommands(commandPort, family) {
  // Setup the RPC connection to the NuclideServer process.
  const services = (0, _nuclideRpc().loadServicesConfig)(_nuclideUri().default.join(__dirname, '..'));

  const socket = _net.default.connect({
    port: commandPort,
    family: convertStringFamilyToNumberFamily(family)
  });

  const transport = new (_nuclideRpc().SocketTransport)(socket);

  try {
    await transport.onConnected();
  } catch (e) {
    // This is usually ECONNREFUSED ...
    // ... indicating that there was a nuclide-server but it is now shutdown.
    throw new (_errors().FailedConnectionError)('Could not find a nuclide-server with a connected Atom ' + '("Nuclide/Kill Nuclide Server and Restart" will likely help)');
  }

  const connection = _nuclideRpc().RpcConnection.createLocal(transport, [_nuclideMarshalersCommon().localNuclideUriMarshalers], services, _ConfigDirectory().RPC_PROTOCOL); // Get the command interface


  const service = connection.getService('CommandService');
  return service.getAtomCommands();
}