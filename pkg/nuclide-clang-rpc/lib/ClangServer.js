"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _nuclideMarshalersCommon() {
  const data = require("../../nuclide-marshalers-common");

  _nuclideMarshalersCommon = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _process2() {
  const data = require("../../../modules/nuclide-commons/process");

  _process2 = function () {
    return data;
  };

  return data;
}

function _nuclideRpc() {
  const data = require("../../nuclide-rpc");

  _nuclideRpc = function () {
    return data;
  };

  return data;
}

function _nuclideFilewatcherRpc() {
  const data = require("../../nuclide-filewatcher-rpc");

  _nuclideFilewatcherRpc = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
let serviceRegistry = null;

function getServiceRegistry() {
  if (serviceRegistry == null) {
    serviceRegistry = new (_nuclideRpc().ServiceRegistry)(_nuclideMarshalersCommon().getServerSideMarshalers, (0, _nuclideRpc().loadServicesConfig)(_nuclideUri().default.join(__dirname, '..')), 'clang_language_service');
  }

  return serviceRegistry;
}
/**
 * If the compilation flags provide an absolute Clang path, and that Clang path
 * contains an actual libclang.so, then use that first.
 */


async function getLibClangOverrideFromFlags(flagsData) {
  if (flagsData == null || flagsData.flags == null || flagsData.flags.length === 0) {
    return {};
  }

  const clangPath = flagsData.flags[0];

  if (_nuclideUri().default.isAbsolute(clangPath)) {
    const libClangPath = _nuclideUri().default.join(_nuclideUri().default.dirname(clangPath), '../lib/libclang.so');

    if (libClangPath != null && (await _fsPromise().default.exists(libClangPath))) {
      const realLibClangPath = await _fsPromise().default.realpath(libClangPath);
      return (0, _promise().asyncObjFilter)({
        libClangLibraryFile: realLibClangPath,
        pythonPathEnv: _nuclideUri().default.join(realLibClangPath, '../../../../src/llvm/tools/clang/bindings/python')
      }, _fsPromise().default.exists);
    }
  }

  return {};
}

function spawnClangProcess(src, serverArgsPromise, flagsPromise) {
  return _RxMin.Observable.fromPromise(Promise.all([serverArgsPromise, flagsPromise, flagsPromise.then(getLibClangOverrideFromFlags)])).switchMap(([serverArgs, flagsData, flagOverrides]) => {
    var _ref;

    const flags = (_ref = flagsData) != null ? _ref.flags : _ref;

    if (flags == null) {
      // We're going to reject here.
      // ClangServer will also dispose itself upon encountering this.
      throw new Error(`No flags found for ${src}`);
    }

    const {
      pythonPathEnv,
      pythonExecutable
    } = serverArgs;

    const pathToLibClangServer = _nuclideUri().default.join(__dirname, '../python/clang_server.py');

    const argsFd = 3;
    const args = [pathToLibClangServer, '--flags-from-pipe', `${argsFd}`];
    const libClangLibraryFile = flagOverrides.libClangLibraryFile != null ? flagOverrides.libClangLibraryFile : serverArgs.libClangLibraryFile;

    if (libClangLibraryFile != null) {
      args.push('--libclang-file', libClangLibraryFile);
    }

    args.push('--', src); // Note that the first flag is always the compiler path.

    const options = {
      cwd: _nuclideUri().default.dirname(pathToLibClangServer),
      stdio: [null, null, null, 'pipe'],
      // check argsFd
      detached: false,
      // When Atom is killed, clang_server.py should be killed, too.
      env: Object.assign({}, process.env, {
        PYTHONPATH: flagOverrides.pythonPathEnv != null ? flagOverrides.pythonPathEnv : pythonPathEnv
      })
    }; // Note that safeSpawn() often overrides options.env.PATH, but that only happens when
    // options.env is undefined (which is not the case here). This will only be an issue if the
    // system cannot find `pythonExecutable`.

    return (0, _process2().spawn)(pythonExecutable, args, options).do(proc => {
      proc.stdio[argsFd].write(JSON.stringify(flags.slice(1)) + '\n');
    });
  });
}

class ClangServer {
  constructor(src, contents, serverArgsPromise, flagsPromise) {
    this._usesDefaultFlags = false;
    this._pendingCompileRequests = 0;
    this._serverStatus = new _RxMin.BehaviorSubject(ClangServer.Status.FINDING_FLAGS);
    this._flagsChanged = false;
    this._flagsSubscription = _RxMin.Observable.fromPromise(flagsPromise).do(flagsData => {
      if (flagsData == null) {
        // Servers without flags will be left in the 'disposed' state forever.
        // This ensures that all language requests bounce without erroring.
        this.dispose();
        return;
      }

      this._usesDefaultFlags = flagsData.usesDefaultFlags;
    }).switchMap(flagsData => {
      if (flagsData != null && flagsData.flagsFile != null) {
        return (0, _nuclideFilewatcherRpc().watchWithNode)(flagsData.flagsFile).refCount().take(1);
      }

      return _RxMin.Observable.empty();
    }).subscribe(x => {
      this._flagsChanged = true;
    }, () => {} // ignore errors
    );
    this._rpcProcess = new (_nuclideRpc().RpcProcess)(`ClangServer-${src}`, getServiceRegistry(), spawnClangProcess(src, serverArgsPromise, flagsPromise)); // Kick off an initial compilation to provide an accurate server state.
    // This will automatically reject if any kind of disposals/errors happen.

    this.compile(contents).catch(() => {});
  }

  dispose() {
    this._serverStatus.next(ClangServer.Status.DISPOSED);

    this._serverStatus.complete();

    this._rpcProcess.dispose();

    this._flagsSubscription.unsubscribe();
  }

  getService() {
    if (this.isDisposed()) {
      throw new Error('Called getService() on a disposed ClangServer');
    }

    return this._rpcProcess.getService('ClangProcessService');
  }

  getPID() {
    const {
      _process
    } = this._rpcProcess;

    if (_process == null) {
      return null;
    }

    return _process.pid;
  }

  getFlagsChanged() {
    return this._flagsChanged;
  } // Call this instead of using the RPC layer directly.
  // This way, we can track when the server is busy compiling.


  async compile(contents) {
    const service = await this.getService();

    if (this._pendingCompileRequests++ === 0) {
      this._serverStatus.next(ClangServer.Status.COMPILING);
    }

    try {
      return await service.compile(contents).then(result => Object.assign({}, result, {
        accurateFlags: !this._usesDefaultFlags
      }));
    } finally {
      if (--this._pendingCompileRequests === 0 && !this.isDisposed()) {
        this._serverStatus.next(ClangServer.Status.READY);
      }
    }
  }

  getStatus() {
    return this._serverStatus.getValue();
  }

  isDisposed() {
    return this.getStatus() === ClangServer.Status.DISPOSED;
  }

  isReady() {
    return this.getStatus() === ClangServer.Status.READY;
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
  FINDING_FLAGS: 'finding_flags',
  COMPILING: 'compiling',
  READY: 'ready',
  DISPOSED: 'disposed'
});