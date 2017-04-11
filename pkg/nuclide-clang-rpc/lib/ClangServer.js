'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideMarshalersCommon;

function _load_nuclideMarshalersCommon() {
  return _nuclideMarshalersCommon = require('../../nuclide-marshalers-common');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _nuclideRpc;

function _load_nuclideRpc() {
  return _nuclideRpc = require('../../nuclide-rpc');
}

var _nuclideFilewatcherRpc;

function _load_nuclideFilewatcherRpc() {
  return _nuclideFilewatcherRpc = require('../../nuclide-filewatcher-rpc');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let serviceRegistry = null; /**
                             * Copyright (c) 2015-present, Facebook, Inc.
                             * All rights reserved.
                             *
                             * This source code is licensed under the license found in the LICENSE file in
                             * the root directory of this source tree.
                             *
                             * 
                             */

function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = new (_nuclideRpc || _load_nuclideRpc()).ServiceRegistry((_nuclideMarshalersCommon || _load_nuclideMarshalersCommon()).getServerSideMarshalers, (0, (_nuclideRpc || _load_nuclideRpc()).loadServicesConfig)((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..')), 'clang_language_service');
  }
  return serviceRegistry;
}

function spawnClangProcess(src, serverArgs, flags) {
  const { libClangLibraryFile, pythonPathEnv, pythonExecutable } = serverArgs;
  const pathToLibClangServer = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../python/clang_server.py');
  const args = [pathToLibClangServer];
  if (libClangLibraryFile != null) {
    args.push('--libclang-file', libClangLibraryFile);
  }
  args.push('--', src);
  args.push(...flags);
  const options = {
    cwd: (_nuclideUri || _load_nuclideUri()).default.dirname(pathToLibClangServer),
    stdio: 'pipe',
    detached: false, // When Atom is killed, clang_server.py should be killed, too.
    env: {
      PYTHONPATH: pythonPathEnv
    }
  };

  // Note that safeSpawn() often overrides options.env.PATH, but that only happens when
  // options.env is undefined (which is not the case here). This will only be an issue if the
  // system cannot find `pythonExecutable`.
  return (0, (_process || _load_process()).createProcessStream)(pythonExecutable, args, options);
}

class ClangServer extends (_nuclideRpc || _load_nuclideRpc()).RpcProcess {

  constructor(src, serverArgs, flagsData) {
    super(`ClangServer-${src}`, getServiceRegistry(), spawnClangProcess(src, serverArgs, flagsData.flags));
    this._usesDefaultFlags = flagsData.usesDefaultFlags;
    this._pendingCompileRequests = 0;
    this._serverStatus = new _rxjsBundlesRxMinJs.BehaviorSubject(ClangServer.Status.READY);
    this._flagsChanged = false;
    if (flagsData.flagsFile != null) {
      this._flagsSubscription = (0, (_nuclideFilewatcherRpc || _load_nuclideFilewatcherRpc()).watchFile)(flagsData.flagsFile).refCount().take(1).subscribe(x => {
        this._flagsChanged = true;
      }, () => {});
    }
  }

  dispose() {
    super.dispose();
    this._serverStatus.complete();
    if (this._flagsSubscription != null) {
      this._flagsSubscription.unsubscribe();
    }
  }

  getService() {
    return super.getService('ClangProcessService');
  }

  /**
   * Returns RSS of the child process in bytes.
   * Works on Unix and Mac OS X.
   */
  getMemoryUsage() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this._process == null) {
        return 0;
      }
      const { exitCode, stdout } = yield (0, (_process || _load_process()).asyncExecute)('ps', ['-p', _this._process.pid.toString(), '-o', 'rss=']);
      if (exitCode !== 0) {
        return 0;
      }
      return parseInt(stdout, 10) * 1024; // ps returns KB
    })();
  }

  getFlagsChanged() {
    return this._flagsChanged;
  }

  // Call this instead of using the RPC layer directly.
  // This way, we can track when the server is busy compiling.
  compile(contents) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this2._pendingCompileRequests++ === 0) {
        _this2._serverStatus.next(ClangServer.Status.COMPILING);
      }
      try {
        const service = yield _this2.getService();
        return yield service.compile(contents).then(function (result) {
          return Object.assign({}, result, {
            accurateFlags: !_this2._usesDefaultFlags
          });
        });
      } finally {
        if (--_this2._pendingCompileRequests === 0) {
          _this2._serverStatus.next(ClangServer.Status.READY);
        }
      }
    })();
  }

  getStatus() {
    return this._serverStatus.getValue();
  }

  waitForReady() {
    if (this.getStatus() === ClangServer.Status.READY) {
      return Promise.resolve();
    }
    return this._serverStatus.takeWhile(x => x !== ClangServer.Status.READY).toPromise();
  }
}
exports.default = ClangServer;
ClangServer.Status = Object.freeze({
  READY: 'ready',
  COMPILING: 'compiling'
});