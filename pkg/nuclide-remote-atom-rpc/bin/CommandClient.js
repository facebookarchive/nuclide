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
  var serverInfo = yield (0, (_sharedConfigDirectory2 || _sharedConfigDirectory()).getServer)();
  if (serverInfo == null) {
    throw new Error('Could not find a nuclide-server with a connected Atom');
  }
  var commandPort = serverInfo.commandPort;
  var family = serverInfo.family;

  // Setup the RPC connection to the NuclideServer process.
  var services = (0, (_nuclideRpc2 || _nuclideRpc()).loadServicesConfig)((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(__dirname, '..'));
  var socket = (_net2 || _net()).default.connect({
    port: commandPort,
    family: convertStringFamilyToNumberFamily(family)
  });
  var transport = new (_nuclideRpc2 || _nuclideRpc()).SocketTransport(socket);
  yield transport.onConnected();
  var connection = (_nuclideRpc2 || _nuclideRpc()).RpcConnection.createLocal(transport, [(_nuclideMarshalersCommon2 || _nuclideMarshalersCommon()).localNuclideUriMarshalers], services);

  // Get the command interface
  var service = connection.getService('CommandService');
  var commands = yield service.getAtomCommands();
  if (commands == null) {
    throw new Error('Nuclide server is running but no Atom process with Nuclide is connected.');
  }
  return commands;
}

// Connects to the local NuclideServer process, opens the file in the connected
// Atom process.
);

exports.openFile = openFile;

var addProject = _asyncToGenerator(function* (projectPath) {
  var commands = yield getCommands();
  yield commands.addProject(projectPath);
});

exports.addProject = addProject;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _sharedConfigDirectory2;

function _sharedConfigDirectory() {
  return _sharedConfigDirectory2 = require('../shared/ConfigDirectory');
}

var _net2;

function _net() {
  return _net2 = _interopRequireDefault(require('net'));
}

var _nuclideRpc2;

function _nuclideRpc() {
  return _nuclideRpc2 = require('../../nuclide-rpc');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideMarshalersCommon2;

function _nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon2 = require('../../nuclide-marshalers-common');
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

function openFile(filePath, line, column) {
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise(getCommands()).flatMap(function (commands) {
    return commands.openFile(filePath, line, column).refCount();
  });
}