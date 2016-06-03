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

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _commonsNodeRpcProcess2;

function _commonsNodeRpcProcess() {
  return _commonsNodeRpcProcess2 = _interopRequireDefault(require('../../commons-node/RpcProcess'));
}

var PYTHON_EXECUTABLE = 'python';
var LIB_PATH = (_path2 || _path()).default.join(__dirname, '../VendorLib');
var PROCESS_PATH = (_path2 || _path()).default.join(__dirname, '../python/jediserver.py');
var OPTS = {
  cwd: (_path2 || _path()).default.dirname(PROCESS_PATH),
  stdio: 'pipe',
  detached: false, // When Atom is killed, server process should be killed.
  env: { PYTHONPATH: LIB_PATH }
};

var JediServer = (function (_default) {
  _inherits(JediServer, _default);

  function JediServer(src) {
    var pythonPath = arguments.length <= 1 || arguments[1] === undefined ? PYTHON_EXECUTABLE : arguments[1];

    _classCallCheck(this, JediServer);

    // Generate a name for this server using the src file name, used to namespace logs
    var name = 'JediServer-' + (_path2 || _path()).default.basename(src);
    var createProcess = function createProcess() {
      return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).safeSpawn)(pythonPath, [PROCESS_PATH, '-s', src], OPTS);
    };
    _get(Object.getPrototypeOf(JediServer.prototype), 'constructor', this).call(this, name, createProcess);
  }

  return JediServer;
})((_commonsNodeRpcProcess2 || _commonsNodeRpcProcess()).default);

exports.default = JediServer;
module.exports = exports.default;