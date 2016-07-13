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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _commonsNodeRpcProcess2;

function _commonsNodeRpcProcess() {
  return _commonsNodeRpcProcess2 = _interopRequireDefault(require('../../commons-node/RpcProcess'));
}

var _nuclideRpc2;

function _nuclideRpc() {
  return _nuclideRpc2 = require('../../nuclide-rpc');
}

var PYTHON_EXECUTABLE = 'python';
var LIB_PATH = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, '../VendorLib');
var PROCESS_PATH = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, '../python/jediserver.py');
var OPTS = {
  cwd: (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(PROCESS_PATH),
  stdio: 'pipe',
  detached: false, // When Atom is killed, server process should be killed.
  env: { PYTHONPATH: LIB_PATH }
};

var serviceRegistry = null;

function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = (_nuclideRpc2 || _nuclideRpc()).ServiceRegistry.createLocal((0, (_nuclideRpc2 || _nuclideRpc()).loadServicesConfig)((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, '..')));
  }
  return serviceRegistry;
}

var JediServer = (function () {
  function JediServer(src) {
    var pythonPath = arguments.length <= 1 || arguments[1] === undefined ? PYTHON_EXECUTABLE : arguments[1];
    var paths = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    _classCallCheck(this, JediServer);

    // Generate a name for this server using the src file name, used to namespace logs
    var name = 'JediServer-' + (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(src);
    var args = [PROCESS_PATH, '-s', src];
    if (paths.length > 0) {
      args.push('-p');
      args = args.concat(paths);
    }
    var createProcess = function createProcess() {
      return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).safeSpawn)(pythonPath, args, OPTS);
    };
    this._process = new (_commonsNodeRpcProcess2 || _commonsNodeRpcProcess()).default(name, getServiceRegistry(), createProcess);
    this._isDisposed = false;
  }

  _createClass(JediServer, [{
    key: 'getService',
    value: function getService() {
      (0, (_assert2 || _assert()).default)(!this._isDisposed, 'getService called on disposed JediServer');
      return this._process.getService('JediService');
    }
  }, {
    key: 'isDisposed',
    value: function isDisposed() {
      return this._isDisposed;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._isDisposed = true;
      this._process.dispose();
    }
  }]);

  return JediServer;
})();

exports.default = JediServer;
module.exports = exports.default;