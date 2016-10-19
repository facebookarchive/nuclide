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

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _commonsNodeProcess;

function _load_commonsNodeProcess() {
  return _commonsNodeProcess = require('../../commons-node/process');
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _nuclideRpc2;

function _load_nuclideRpc2() {
  return _nuclideRpc2 = require('../../nuclide-rpc');
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var PYTHON_EXECUTABLE = 'python';
var LIB_PATH = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(__dirname, '../VendorLib');
var PROCESS_PATH = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(__dirname, '../python/jediserver.py');
var OPTS = {
  cwd: (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(PROCESS_PATH),
  stdio: 'pipe',
  detached: false, // When Atom is killed, server process should be killed.
  env: { PYTHONPATH: LIB_PATH }
};

var serviceRegistry = null;

function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = new (_nuclideRpc2 || _load_nuclideRpc2()).ServiceRegistry([(_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).localNuclideUriMarshalers], (0, (_nuclideRpc2 || _load_nuclideRpc2()).loadServicesConfig)((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(__dirname, '..')));
  }
  return serviceRegistry;
}

var JediServer = (function () {
  function JediServer(src) {
    var pythonPath = arguments.length <= 1 || arguments[1] === undefined ? PYTHON_EXECUTABLE : arguments[1];
    var paths = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    _classCallCheck(this, JediServer);

    // Generate a name for this server using the src file name, used to namespace logs
    var name = 'JediServer-' + (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(src);
    var args = [PROCESS_PATH, '-s', src];
    if (paths.length > 0) {
      args.push('-p');
      args = args.concat(paths);
    }
    var createProcess = function createProcess() {
      return (0, (_commonsNodeProcess || _load_commonsNodeProcess()).safeSpawn)(pythonPath, args, OPTS);
    };
    this._process = new (_nuclideRpc || _load_nuclideRpc()).RpcProcess(name, getServiceRegistry(), createProcess);
    this._isDisposed = false;
  }

  _createClass(JediServer, [{
    key: 'getService',
    value: function getService() {
      (0, (_assert || _load_assert()).default)(!this._isDisposed, 'getService called on disposed JediServer');
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