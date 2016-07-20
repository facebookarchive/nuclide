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

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var spawnClangProcess = _asyncToGenerator(function* (src, flags) {
  var _ref = yield (0, (_findClangServerArgs2 || _findClangServerArgs()).default)();

  var libClangLibraryFile = _ref.libClangLibraryFile;
  var pythonPathEnv = _ref.pythonPathEnv;
  var pythonExecutable = _ref.pythonExecutable;

  var pathToLibClangServer = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, '../python/clang_server.py');
  var args = [pathToLibClangServer];
  if (libClangLibraryFile != null) {
    args.push('--libclang-file', libClangLibraryFile);
  }
  args.push('--', src);
  args.push.apply(args, flags);
  var options = {
    cwd: (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(pathToLibClangServer),
    stdio: 'pipe',
    detached: false, // When Atom is killed, clang_server.py should be killed, too.
    env: {
      PYTHONPATH: pythonPathEnv
    }
  };

  // Note that safeSpawn() often overrides options.env.PATH, but that only happens when
  // options.env is undefined (which is not the case here). This will only be an issue if the
  // system cannot find `pythonExecutable`.
  return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).safeSpawn)(pythonExecutable, args, options);
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _commonsNodeRpcProcess2;

function _commonsNodeRpcProcess() {
  return _commonsNodeRpcProcess2 = _interopRequireDefault(require('../../commons-node/RpcProcess'));
}

var _findClangServerArgs2;

function _findClangServerArgs() {
  return _findClangServerArgs2 = _interopRequireDefault(require('./find-clang-server-args'));
}

var _nuclideRpc2;

function _nuclideRpc() {
  return _nuclideRpc2 = require('../../nuclide-rpc');
}

var serviceRegistry = null;

function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = (_nuclideRpc2 || _nuclideRpc()).ServiceRegistry.createLocal((0, (_nuclideRpc2 || _nuclideRpc()).loadServicesConfig)((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, '..')));
  }
  return serviceRegistry;
}

var ClangServer = (function (_default) {
  _inherits(ClangServer, _default);

  _createClass(ClangServer, null, [{
    key: 'Status',
    value: Object.freeze({
      READY: 'ready',
      COMPILING: 'compiling'
    }),
    enumerable: true
  }]);

  function ClangServer(src, flags) {
    var usesDefaultFlags = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    _classCallCheck(this, ClangServer);

    _get(Object.getPrototypeOf(ClangServer.prototype), 'constructor', this).call(this, 'ClangServer-' + src, getServiceRegistry(), function () {
      return spawnClangProcess(src, flags);
    });
    this._usesDefaultFlags = usesDefaultFlags;
    this._pendingCompileRequests = 0;
    this._serverStatus = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).BehaviorSubject(ClangServer.Status.READY);
  }

  _createClass(ClangServer, [{
    key: 'dispose',
    value: function dispose() {
      _get(Object.getPrototypeOf(ClangServer.prototype), 'dispose', this).call(this);
      this._serverStatus.complete();
    }
  }, {
    key: 'getService',
    value: function getService() {
      return _get(Object.getPrototypeOf(ClangServer.prototype), 'getService', this).call(this, 'ClangProcessService');
    }

    /**
     * Returns RSS of the child process in bytes.
     * Works on Unix and Mac OS X.
     */
  }, {
    key: 'getMemoryUsage',
    value: _asyncToGenerator(function* () {
      if (this._process == null) {
        return 0;
      }

      var _ref2 = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).asyncExecute)('ps', ['-p', this._process.pid.toString(), '-o', 'rss=']);

      var exitCode = _ref2.exitCode;
      var stdout = _ref2.stdout;

      if (exitCode !== 0) {
        return 0;
      }
      return parseInt(stdout, 10) * 1024; // ps returns KB
    })
  }, {
    key: 'usesDefaultFlags',
    value: function usesDefaultFlags() {
      return this._usesDefaultFlags;
    }

    // Call this instead of using the RPC layer directly.
    // This way, we can track when the server is busy compiling.
  }, {
    key: 'compile',
    value: _asyncToGenerator(function* (contents) {
      if (this._pendingCompileRequests++ === 0) {
        this._serverStatus.next(ClangServer.Status.COMPILING);
      }
      try {
        var service = yield this.getService();
        return yield service.compile(contents);
      } finally {
        if (--this._pendingCompileRequests === 0) {
          this._serverStatus.next(ClangServer.Status.READY);
        }
      }
    })
  }, {
    key: 'getStatus',
    value: function getStatus() {
      return this._serverStatus.getValue();
    }
  }, {
    key: 'waitForReady',
    value: function waitForReady() {
      if (this.getStatus() === ClangServer.Status.READY) {
        return Promise.resolve();
      }
      return this._serverStatus.takeWhile(function (x) {
        return x !== ClangServer.Status.READY;
      }).toPromise();
    }
  }]);

  return ClangServer;
})((_commonsNodeRpcProcess2 || _commonsNodeRpcProcess()).default);

exports.default = ClangServer;
module.exports = exports.default;