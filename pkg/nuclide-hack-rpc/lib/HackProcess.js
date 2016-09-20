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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var getHackProcess = _asyncToGenerator(function* (filePath) {
  var command = yield (0, (_hackConfig2 || _hackConfig()).getHackCommand)();
  if (command === '') {
    return null;
  }

  var configDir = yield (0, (_hackConfig2 || _hackConfig()).findHackConfigDir)(filePath);
  if (configDir == null) {
    return null;
  }

  var hackProcess = processes.get(configDir);
  if (hackProcess == null) {
    hackProcess = createHackProcess(command, configDir);
    processes.set(configDir, hackProcess);
    hackProcess.then(function (result) {
      // If we fail to connect to hack, then retry on next request.
      if (result == null) {
        processes.delete(configDir);
      }
    });
  }
  return yield hackProcess;
});

var createHackProcess = _asyncToGenerator(function* (command, configDir) {
  (_hackConfig4 || _hackConfig3()).logger.logInfo('Creating new hack connection for ' + configDir + ': ' + command);
  (_hackConfig4 || _hackConfig3()).logger.logInfo('Current PATH: ' + (0, (_commonsNodeString2 || _commonsNodeString()).maybeToString)(process.env.PATH));
  var startServerResult = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).asyncExecute)(command, ['start', configDir]);
  (_hackConfig4 || _hackConfig3()).logger.logInfo('Hack connection start server results:\n' + JSON.stringify(startServerResult, null, 2) + '\n');
  if (startServerResult.exitCode !== 0 && startServerResult.exitCode !== HACK_SERVER_ALREADY_EXISTS_EXIT_CODE) {
    return null;
  }
  var createProcess = function createProcess() {
    return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).safeSpawn)(command, ['ide', configDir]);
  };
  return new HackProcess('HackProcess-' + configDir, createProcess, configDir);
});

var getHackConnectionService = _asyncToGenerator(function* (filePath) {
  var process = yield getHackProcess(filePath);
  if (process == null) {
    return null;
  }
  return process.getConnectionService();
});

exports.getHackConnectionService = getHackConnectionService;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _commonsNodeString2;

function _commonsNodeString() {
  return _commonsNodeString2 = require('../../commons-node/string');
}

var _commonsNodeRpcProcess2;

function _commonsNodeRpcProcess() {
  return _commonsNodeRpcProcess2 = _interopRequireDefault(require('../../commons-node/RpcProcess'));
}

var _hackConfig2;

function _hackConfig() {
  return _hackConfig2 = require('./hack-config');
}

var _nuclideRpc2;

function _nuclideRpc() {
  return _nuclideRpc2 = require('../../nuclide-rpc');
}

var _nuclideMarshalersCommon2;

function _nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon2 = require('../../nuclide-marshalers-common');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

// From https://reviews.facebook.net/diffusion/HHVM/browse/master/hphp/hack/src/utils/exit_status.ml
var HACK_SERVER_ALREADY_EXISTS_EXIT_CODE = 77;

var _hackConfig4;

function _hackConfig3() {
  return _hackConfig4 = require('./hack-config');
}

var serviceRegistry = null;

function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = new (_nuclideRpc2 || _nuclideRpc()).ServiceRegistry([(_nuclideMarshalersCommon2 || _nuclideMarshalersCommon()).localNuclideUriMarshalers], (0, (_nuclideRpc2 || _nuclideRpc()).loadServicesConfig)((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(__dirname, '..')));
  }
  return serviceRegistry;
}

function logMessage(direction, message) {
  (_hackConfig4 || _hackConfig3()).logger.logInfo('Hack Connection message ' + direction + ': \'' + message + '\'');
}

var HackProcess = (function (_default) {
  _inherits(HackProcess, _default);

  function HackProcess(name, createProcess, hhconfigPath) {
    _classCallCheck(this, HackProcess);

    _get(Object.getPrototypeOf(HackProcess.prototype), 'constructor', this).call(this, name, getServiceRegistry(), createProcess, logMessage);
    this._hhconfigPath = hhconfigPath;
  }

  // Maps hack config dir to HackProcess

  _createClass(HackProcess, [{
    key: 'getRoot',
    value: function getRoot() {
      return this._hhconfigPath;
    }
  }, {
    key: 'getConnectionService',
    value: function getConnectionService() {
      (0, (_assert2 || _assert()).default)(!this.isDisposed(), 'getService called on disposed hackProcess');
      return this.getService('HackConnectionService');
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._dispose();
    }
  }, {
    key: '_dispose',
    value: _asyncToGenerator(function* () {
      processes.delete(this._hhconfigPath);
      // Atempt to send disconnect message
      try {
        (yield this.getConnectionService()).disconnect();
      } catch (e) {
        (_hackConfig4 || _hackConfig3()).logger.logError('Error disconnecting from Hack connection.');
      }
      _get(Object.getPrototypeOf(HackProcess.prototype), 'dispose', this).call(this);
    })
  }]);

  return HackProcess;
})((_commonsNodeRpcProcess2 || _commonsNodeRpcProcess()).default);

var processes = new Map();