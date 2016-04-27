Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var getHackConnection = _asyncToGenerator(function* (filePath) {
  var command = yield (0, _hackConfig.getHackCommand)();
  if (command === '') {
    return null;
  }

  var configDir = yield (0, _hackConfig.findHackConfigDir)(filePath);
  if (configDir == null) {
    return null;
  }

  var connection = connections.get(configDir);
  if (connection == null) {
    connection = createConnection(command, configDir);
    connections.set(configDir, connection);
    connection.then(function (result) {
      // If we fail to connect to hack, then retry on next request.
      if (result == null) {
        connections['delete'](configDir);
      }
    });
  }
  return connection;
});

var createConnection = _asyncToGenerator(function* (command, configDir) {
  logger.info('Creating new hack connection for ' + configDir + ': ' + command);
  logger.info('Current PATH: ' + process.env.PATH);
  var startServerResult = yield (0, _nuclideCommons.checkOutput)(command, ['start', configDir]);
  logger.info('Hack connection start server results:\n' + JSON.stringify(startServerResult, null, 2) + '\n');
  if (startServerResult.exitCode !== 0 && startServerResult.exitCode !== HACK_SERVER_ALREADY_EXISTS_EXIT_CODE) {
    return null;
  }
  var childProcess = yield (0, _nuclideCommons.safeSpawn)(command, ['ide', configDir]);
  (0, _nuclideCommons.observeStream)(childProcess.stdout).subscribe(function (text) {
    logger.info('Hack ide stdout: ' + text);
  });
  (0, _nuclideCommons.observeStream)(childProcess.stderr).subscribe(function (text) {
    logger.info('Hack ide stderr: ' + text);
  });
  return new HackConnection(configDir, childProcess);
}

/**
 * Executes hh_client with proper arguments returning the result string or json object.
 */
);

var callHHClientUsingConnection = _asyncToGenerator(function* (args, processInput, filePath) {

  var connection = yield getHackConnection(filePath);
  if (connection == null) {
    return null;
  }

  if (processInput != null) {
    args.push(processInput);
  }
  var result = yield connection.call(args);
  return {
    hackRoot: connection.getRoot(),
    result: result
  };
});

exports.callHHClientUsingConnection = callHHClientUsingConnection;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideCommons = require('../../nuclide-commons');

var _hackConfig = require('./hack-config');

var _HackRpc = require('./HackRpc');

// From https://reviews.facebook.net/diffusion/HHVM/browse/master/hphp/hack/src/utils/exit_status.ml
var HACK_SERVER_ALREADY_EXISTS_EXIT_CODE = 77;

var logger = require('../../nuclide-logging').getLogger();

var HackConnection = (function () {
  function HackConnection(hhconfigPath, process) {
    var _this = this;

    _classCallCheck(this, HackConnection);

    this._hhconfigPath = hhconfigPath;
    this._process = process;
    this._rpc = new _HackRpc.HackRpc(new _HackRpc.StreamTransport(process.stdin, process.stdout));

    process.on('exit', function (code, signal) {
      logger.info('Hack ide process exited with ' + code + ', ' + signal);
      _this._process = null;
      _this.dispose();
    });
  }

  // Maps hack config dir to HackConnection

  _createClass(HackConnection, [{
    key: 'call',
    value: function call(args) {
      if (this._rpc == null) {
        throw new Error('Attempting to call on disposed hack connection.');
      }
      return this._rpc.call(args);
    }
  }, {
    key: 'getRoot',
    value: function getRoot() {
      return this._hhconfigPath;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      logger.info('Disposing hack connection ' + this._hhconfigPath);
      if (this._rpc != null) {
        this._rpc.dispose();
        connections['delete'](this._hhconfigPath);
        if (this._process != null) {
          this._process.kill();
          this._process = null;
        }
      }
    }
  }, {
    key: 'isDisposed',
    value: function isDisposed() {
      return this._rpc == null;
    }
  }]);

  return HackConnection;
})();

var connections = new Map();