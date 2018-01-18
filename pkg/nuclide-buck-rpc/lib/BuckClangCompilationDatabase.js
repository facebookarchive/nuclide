'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.getCompilationDatabaseHandler = getCompilationDatabaseHandler;

var _nuclideClangRpc;

function _load_nuclideClangRpc() {
  return _nuclideClangRpc = _interopRequireWildcard(require('../../nuclide-clang-rpc'));
}

var _BuckServiceImpl;

function _load_BuckServiceImpl() {
  return _BuckServiceImpl = _interopRequireWildcard(require('./BuckServiceImpl'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _cache;

function _load_cache() {
  return _cache = require('../../commons-node/cache');
}

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-clang-rpc/lib/utils');
}

var _types;

function _load_types() {
  return _types = require('./types');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-buck');
const BUCK_TIMEOUT = 10 * 60 * 1000;
const TARGET_KIND_REGEX = ['apple_binary', 'apple_library', 'apple_test', 'cxx_binary', 'cxx_library', 'cxx_test'].join('|');
const MAX_DB_SIZE_IN_BYTES_FOR_CACHING = 100000000; // 100 MB

/**
 * Facebook puts all headers in a <target>:__default_headers__ build target by default.
 * This target will never produce compilation flags, so make sure to ignore it.
 */
const DEFAULT_HEADERS_TARGET = '__default_headers__';

class BuckClangCompilationDatabaseHandler {
  // Ensure that we can clear targetCache for a given file.
  constructor(params) {
    this._targetCache = new (_cache || _load_cache()).Cache();
    this._sourceCache = new (_cache || _load_cache()).Cache();
    this._sourceToTargetKey = new Map();

    this._params = params;
  }

  resetForSource(src) {
    this._sourceCache.delete(src);
    const targetKey = this._sourceToTargetKey.get(src);
    if (targetKey != null) {
      this._targetCache.delete(targetKey);
      this._sourceToTargetKey.delete(src);
    }
  }

  reset() {
    this._sourceCache.clear();
    this._targetCache.clear();
    this._sourceToTargetKey.clear();
  }

  getCompilationDatabase(src) {
    var _this = this;

    return this._sourceCache.getOrCreate(src, (0, _asyncToGenerator.default)(function* () {
      const buckRoot = yield (_BuckServiceImpl || _load_BuckServiceImpl()).getRootForPath(src);
      return _this._loadCompilationDatabaseFromBuck(src, buckRoot).catch(function (err) {
        logger.error('Error getting flags from Buck', err);
        throw err;
      }).then(function (db) {
        if (db != null) {
          _this._cacheFilesToCompilationDB(db, buckRoot, src);
        }
        return db;
      });
    }));
  }

  _loadCompilationDatabaseFromBuck(src, buckRoot) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (buckRoot == null) {
        return null;
      }

      let queryTarget = null;
      try {
        queryTarget = (yield (_BuckServiceImpl || _load_BuckServiceImpl()).getOwners(buckRoot, src, TARGET_KIND_REGEX)).find(function (x) {
          return x.indexOf(DEFAULT_HEADERS_TARGET) === -1;
        });
      } catch (err) {
        logger.error('Failed getting the target from buck', err);
      }

      if (queryTarget == null) {
        // Even if we can't get flags, return a flagsFile to watch
        const buildFile = yield (0, (_utils || _load_utils()).guessBuildFile)(src);
        if (buildFile != null) {
          return {
            flagsFile: buildFile,
            file: null,
            libclangPath: null,
            warnings: [`I could not find owner target of ${src}`, `Is there an error in ${buildFile}?`]
          };
        }
        return null;
      }
      const target = queryTarget;

      _this2._sourceToTargetKey.set(src, _this2._targetCache.keyForArgs([buckRoot, target]));

      return _this2._targetCache.getOrCreate([buckRoot, target], function () {
        return _this2._loadCompilationDatabaseForBuckTarget(buckRoot, target);
      });
    })();
  }

  _getExtraArguments(buckRoot, target) {
    return (0, _asyncToGenerator.default)(function* () {
      try {
        // $FlowFB
        const { getExtraArguments } = require('./fb/getExtraArguments');
        return yield getExtraArguments(buckRoot, target);
      } catch (e) {
        return [];
      }
    })();
  }

  _loadCompilationDatabaseForBuckTarget(buckProjectRoot, target) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // TODO(t12973165): Allow configuring a custom flavor.
      // For now, this seems to use cxx.default_platform, which tends to be correct.
      const allFlavors = ['compilation-database', ..._this3._params.flavorsForTarget];
      const allArgs = _this3._params.args.length === 0 ? yield _this3._getExtraArguments(buckProjectRoot, target) : _this3._params.args;
      const buildTarget = target + '#' + allFlavors.join(',');
      const buildReport = yield (_BuckServiceImpl || _load_BuckServiceImpl()).build(buckProjectRoot, [
      // Small builds, like those used for a compilation database, can degrade overall
      // `buck build` performance by unnecessarily invalidating the Action Graph cache.
      // See https://buckbuild.com/concept/buckconfig.html#client.skip-action-graph-cache
      // for details on the importance of using skip-action-graph-cache=true.
      '--config', 'client.skip-action-graph-cache=true', buildTarget, ...allArgs], { commandOptions: { timeout: BUCK_TIMEOUT } });
      if (!buildReport.success) {
        const error = new Error(`Failed to build ${buildTarget}`);
        logger.error(error);
        throw error;
      }
      const firstResult = Object.keys(buildReport.results)[0];
      let pathToCompilationDatabase = buildReport.results[firstResult].output;
      pathToCompilationDatabase = (_nuclideUri || _load_nuclideUri()).default.join(buckProjectRoot, pathToCompilationDatabase);

      const buildFile = yield (_BuckServiceImpl || _load_BuckServiceImpl()).getBuildFile(buckProjectRoot, target);
      const compilationDB = {
        file: pathToCompilationDatabase,
        flagsFile: buildFile,
        libclangPath: null,
        warnings: []
      };
      return _this3._processCompilationDb(compilationDB, buckProjectRoot, allArgs);
    })();
  }

  _processCompilationDb(db, buckRoot, args) {
    return (0, _asyncToGenerator.default)(function* () {
      try {
        // $FlowFB
        const { createOmCompilationDb } = require('./fb/omCompilationDb');
        return yield createOmCompilationDb(db, buckRoot, args);
      } catch (e) {}
      return db;
    })();
  }

  _cacheFilesToCompilationDB(db, buckRoot, src) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (yield _this4._isDbTooBigForFullCaching(db)) {
        return;
      }
      const pathToFlags = yield (_nuclideClangRpc || _load_nuclideClangRpc()).loadFlagsFromCompilationDatabaseAndCacheThem({
        compilationDatabase: (0, (_types || _load_types()).convertBuckClangCompilationDatabase)(db),
        projectRoot: buckRoot
      });
      pathToFlags.forEach(function (fullFlags, path) {
        _this4._sourceCache.set(path, Promise.resolve(db));
      });
    })();
  }

  _isDbTooBigForFullCaching(db) {
    return (0, _asyncToGenerator.default)(function* () {
      return db.file == null ? false : (yield (_fsPromise || _load_fsPromise()).default.stat(db.file)).size > MAX_DB_SIZE_IN_BYTES_FOR_CACHING;
    })();
  }
}

const compilationDatabaseHandlerCache = new (_cache || _load_cache()).Cache({
  keyFactory: params => JSON.stringify(params)
});

function getCompilationDatabaseHandler(params) {
  return compilationDatabaseHandlerCache.getOrCreate(params, () => new BuckClangCompilationDatabaseHandler(params));
}