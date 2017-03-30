'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let augmentDefaultFlags = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (src, flags) {
    if (_getDefaultFlags === undefined) {
      _getDefaultFlags = null;
      try {
        // $FlowFB
        _getDefaultFlags = require('./fb/custom-flags').getDefaultFlags;
      } catch (e) {
        // Open-source version
      }
    }
    if (_getDefaultFlags != null) {
      return flags.concat((yield _getDefaultFlags(src)));
    }
    return flags;
  });

  return function augmentDefaultFlags(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _os = _interopRequireDefault(require('os'));

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _ClangFlagsManager;

function _load_ClangFlagsManager() {
  return _ClangFlagsManager = _interopRequireDefault(require('./ClangFlagsManager'));
}

var _ClangServer;

function _load_ClangServer() {
  return _ClangServer = _interopRequireDefault(require('./ClangServer'));
}

var _findClangServerArgs;

function _load_findClangServerArgs() {
  return _findClangServerArgs = _interopRequireDefault(require('./find-clang-server-args'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Limit the number of active Clang servers.
const SERVER_LIMIT = 20;

// Limit the total memory usage of all Clang servers.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const MEMORY_LIMIT = Math.round(_os.default.totalmem() * 15 / 100);

let _getDefaultFlags;
class ClangServerManager {

  constructor() {
    this._flagsManager = new (_ClangFlagsManager || _load_ClangFlagsManager()).default();
    this._servers = new (_lruCache || _load_lruCache()).default({
      max: SERVER_LIMIT,
      dispose(_, val) {
        val.dispose();
      }
    });
    // Avoid race conditions with simultaneous _checkMemoryUsage calls.
    this._checkMemoryUsage = (0, (_promise || _load_promise()).serializeAsyncCall)(this._checkMemoryUsageImpl.bind(this));
  }

  getClangFlagsManager() {
    return this._flagsManager;
  }

  /**
   * Spawn one Clang server per translation unit (i.e. source file).
   * This allows working on multiple files at once, and simplifies per-file state handling.
   *
   * TODO(hansonw): We should ideally restart on change for all service requests.
   * However, restarting (and refetching flags) can take a very long time.
   * Currently, there's no "status" observable, so we can only provide a busy signal to the user
   * on diagnostic requests - and hence we only restart on 'compile' requests.
   */
  getClangServer(src, contents, compilationDBFile, defaultFlags, restartIfChanged) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      let server = _this._servers.get(src);
      if (server != null) {
        if (restartIfChanged && server.getFlagsChanged()) {
          _this.reset(src);
        } else {
          return server;
        }
      }
      const [serverArgs, flagsResult] = yield Promise.all([(0, (_findClangServerArgs || _load_findClangServerArgs()).default)(src), _this._getFlags(src, compilationDBFile, defaultFlags)]);
      if (flagsResult == null) {
        return null;
      }
      // Another server could have been created while we were waiting.
      server = _this._servers.get(src);
      if (server != null) {
        return server;
      }
      server = new (_ClangServer || _load_ClangServer()).default(src, serverArgs, flagsResult);
      // Seed with a compile request to ensure fast responses.
      server.compile(contents).then(function () {
        return _this._checkMemoryUsage();
      });
      _this._servers.set(src, server);
      return server;
    })();
  }

  // 1. Attempt to get flags from ClangFlagsManager.
  // 2. Otherwise, fall back to default flags.
  _getFlags(src, compilationDBFile, defaultFlags) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const flagsData = yield _this2._flagsManager.getFlagsForSrc(src, compilationDBFile).catch(function (e) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Error getting flags for ${src}:`, e);
        return null;
      });
      if (flagsData != null && flagsData.flags != null) {
        return {
          flags: flagsData.flags,
          usesDefaultFlags: false,
          flagsFile: flagsData.flagsFile
        };
      } else if (defaultFlags != null) {
        return {
          flags: yield augmentDefaultFlags(src, defaultFlags),
          usesDefaultFlags: true,
          flagsFile: flagsData != null ? flagsData.flagsFile : null
        };
      } else {
        return null;
      }
    })();
  }

  reset(src) {
    if (src != null) {
      this._servers.del(src);
    } else {
      this._servers.reset();
    }
    this._flagsManager.reset();
  }

  dispose() {
    this._servers.reset();
    this._flagsManager.reset();
  }

  _checkMemoryUsageImpl() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const usage = new Map();
      yield Promise.all(_this3._servers.values().map((() => {
        var _ref2 = (0, _asyncToGenerator.default)(function* (server) {
          const mem = yield server.getMemoryUsage();
          usage.set(server, mem);
        });

        return function (_x3) {
          return _ref2.apply(this, arguments);
        };
      })()));

      // Servers may have been deleted in the meantime, so calculate the total now.
      let total = 0;
      let count = 0;
      _this3._servers.forEach(function (server) {
        const mem = usage.get(server);
        if (mem) {
          total += mem;
          count++;
        }
      });

      // Remove servers until we're under the memory limit.
      // Make sure we allow at least one server to stay alive.
      if (count > 1 && total > MEMORY_LIMIT) {
        const toDispose = [];
        _this3._servers.rforEach(function (server, key) {
          const mem = usage.get(server);
          if (mem && count > 1 && total > MEMORY_LIMIT) {
            total -= mem;
            count--;
            toDispose.push(key);
          }
        });
        toDispose.forEach(function (key) {
          return _this3._servers.del(key);
        });
      }
    })();
  }
}
exports.default = ClangServerManager;