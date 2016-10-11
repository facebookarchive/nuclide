Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var getCommands = _asyncToGenerator(function* () {
  // Get the RPC connection info for the filesystem.
  var serverInfo = yield (0, (_sharedConfigDirectory || _load_sharedConfigDirectory()).getServer)();
  if (serverInfo == null) {
    (0, (_errors || _load_errors()).reportConnectionErrorAndExit)('Could not find a nuclide-server with a connected Atom');
  }
  (0, (_assert || _load_assert()).default)(serverInfo != null);
  var commandPort = serverInfo.commandPort;
  var family = serverInfo.family;

  return startCommands(commandPort, family);
});

exports.getCommands = getCommands;

var startCommands = _asyncToGenerator(function* (commandPort, family) {
  // Setup the RPC connection to the NuclideServer process.
  var services = (0, (_nuclideRpc || _load_nuclideRpc()).loadServicesConfig)((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(__dirname, '..'));
  var socket = (_net || _load_net()).default.connect({
    port: commandPort,
    family: convertStringFamilyToNumberFamily(family)
  });
  var transport = new (_nuclideRpc || _load_nuclideRpc()).SocketTransport(socket);
  try {
    yield transport.onConnected();
  } catch (e) {
    // This is usually ECONNREFUSED ...
    // ... indicating that there was a nuclide-server but it is now shutdown.
    (0, (_errors || _load_errors()).reportConnectionErrorAndExit)('Could not find a nuclide-server with a connected Atom');
  }
  var connection = (_nuclideRpc || _load_nuclideRpc()).RpcConnection.createLocal(transport, [(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers], services);

  // Get the command interface
  var service = connection.getService('CommandService');
  var commands = yield service.getAtomCommands();
  if (commands == null) {
    (0, (_errors || _load_errors()).reportConnectionErrorAndExit)('Nuclide server is running but no Atom process with Nuclide is connected.');
  }
  (0, (_assert || _load_assert()).default)(commands != null);
  return commands;
});

exports.startCommands = startCommands;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _sharedConfigDirectory;

function _load_sharedConfigDirectory() {
  return _sharedConfigDirectory = require('../shared/ConfigDirectory');
}

var _net;

function _load_net() {
  return _net = _interopRequireDefault(require('net'));
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var _errors;

function _load_errors() {
  return _errors = require('./errors');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

function convertStringFamilyToNumberFamily(family) {
  switch (family) {
    case 'IPv4':
      return 4;
    case 'IPv6':
      return 6;
    default:
      throw new Error('Unrecognized network address family ' + family);
  }
}