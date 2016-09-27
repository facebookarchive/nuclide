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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRpc2;

function _nuclideRpc() {
  return _nuclideRpc2 = require('../../nuclide-rpc');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _sharedConfigDirectory2;

function _sharedConfigDirectory() {
  return _sharedConfigDirectory2 = require('../shared/ConfigDirectory');
}

var _nuclideMarshalersCommon2;

function _nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon2 = require('../../nuclide-marshalers-common');
}

// Ties the AtomCommands registered via RemoteCommandService to
// the server side CommandService.

var CommandServer = (function () {
  _createClass(CommandServer, null, [{
    key: '_server',
    value: null,
    enumerable: true
  }]);

  function CommandServer(nuclidePort, atomCommands) {
    _classCallCheck(this, CommandServer);

    this._nuclidePort = nuclidePort;
    this._atomCommands = atomCommands;
    var services = (0, (_nuclideRpc2 || _nuclideRpc()).loadServicesConfig)((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(__dirname, '..'));
    var registry = new (_nuclideRpc2 || _nuclideRpc()).ServiceRegistry([(_nuclideMarshalersCommon2 || _nuclideMarshalersCommon()).localNuclideUriMarshalers], services);
    this._server = new (_nuclideRpc2 || _nuclideRpc()).SocketServer(registry);
  }

  _createClass(CommandServer, [{
    key: '_initialize',
    value: _asyncToGenerator(function* () {
      var address = yield this._server.getAddress();

      yield (0, (_sharedConfigDirectory2 || _sharedConfigDirectory()).createNewEntry)(this._nuclidePort, address.port, address.family);
    })
  }, {
    key: 'dispose',
    value: function dispose() {
      (0, (_assert2 || _assert()).default)(CommandServer._server === this);
      CommandServer._server = null;
      this._server.dispose();
    }
  }], [{
    key: 'create',
    value: _asyncToGenerator(function* (port, atomCommands) {
      if (CommandServer._server != null) {
        CommandServer._server.dispose();
      }
      (0, (_assert2 || _assert()).default)(CommandServer._server == null);

      var server = new CommandServer(port, atomCommands);
      yield server._initialize();
      CommandServer._server = server;
      return server;
    })
  }, {
    key: 'getAtomCommands',
    value: function getAtomCommands() {
      if (CommandServer._server == null) {
        return null;
      }
      return CommandServer._server._atomCommands;
    }
  }]);

  return CommandServer;
})();

exports.CommandServer = CommandServer;