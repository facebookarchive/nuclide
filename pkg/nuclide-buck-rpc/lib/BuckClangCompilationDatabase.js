'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCompilationDatabaseHandler = getCompilationDatabaseHandler;

var _SimpleCache;

function _load_SimpleCache() {
  return _SimpleCache = require('../../../modules/nuclide-commons/SimpleCache');
}

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
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-clang-rpc/lib/utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

/**
 * Facebook puts all headers in a <target>:__default_headers__ build target by default.
 * This target will never produce compilation flags, so make sure to ignore it.
 */
const DEFAULT_HEADERS_TARGET = '__default_headers__';

class BuckClangCompilationDatabaseHandler {
  // Ensure that we can clear targetCache for a given file.
  constructor(params) {
    this._targetCache = new (_SimpleCache || _load_SimpleCache()).SimpleCache();
    this._sourceCache = new (_SimpleCache || _load_SimpleCache()).SimpleCache();
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

  getCompilationDatabase(file) {
    return this._sourceCache.getOrCreate(file, async () => {
      if ((0, (_utils || _load_utils()).isHeaderFile)(file)) {
        const source = await (_nuclideClangRpc || _load_nuclideClangRpc()).getRelatedSourceOrHeader(file);
        if (source != null) {
          logger.info(`${file} is a header, thus using ${source} for getting the compilation flags.`);
          return this.getCompilationDatabase(source);
        } else {
          logger.error(`Couldn't find a corresponding source file for ${file}, thus there are no compilation flags available.`);
          return {
            file: null,
            flagsFile: await (0, (_utils || _load_utils()).guessBuildFile)(file),
            libclangPath: null,
            warnings: [`I could not find a corresponding source file for ${file}.`]
          };
        }
      } else {
        return this._getCompilationDatabase(file);
      }
    });
  }

  async _getCompilationDatabase(file) {
    const buckRoot = await (_BuckServiceImpl || _load_BuckServiceImpl()).getRootForPath(file);
    return this._loadCompilationDatabaseFromBuck(file, buckRoot).catch(err => {
      logger.error('Error getting flags from Buck for file ', file, err);
      throw err;
    }).then(db => {
      if (db != null) {
        this._cacheFilesToCompilationDB(db);
      }
      return db;
    });
  }

  async _loadCompilationDatabaseFromBuck(src, buckRoot) {
    if (buckRoot == null) {
      return null;
    }

    let queryTarget = null;
    try {
      const owners = (await (_BuckServiceImpl || _load_BuckServiceImpl()).getOwners(buckRoot, src, [], TARGET_KIND_REGEX)).filter(x => x.indexOf(DEFAULT_HEADERS_TARGET) === -1);
      // Deprioritize Android-related targets because they build with gcc and
      // require gcc intrinsics that cause libclang to throw bad diagnostics.
      owners.sort((a, b) => {
        const aAndroid = a.endsWith('Android');
        const bAndroid = b.endsWith('Android');
        if (aAndroid && !bAndroid) {
          return 1;
        } else if (!aAndroid && bAndroid) {
          return -1;
        } else {
          return 0;
        }
      });
      queryTarget = owners[0];
    } catch (err) {
      logger.error('Failed getting the target from buck', err);
    }

    if (queryTarget == null) {
      // Even if we can't get flags, return a flagsFile to watch
      const buildFile = await (0, (_utils || _load_utils()).guessBuildFile)(src);
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

    this._sourceToTargetKey.set(src, this._targetCache.keyForArgs([buckRoot, target]));

    return this._targetCache.getOrCreate([buckRoot, target], () => this._loadCompilationDatabaseForBuckTarget(buckRoot, target));
  }

  async _loadCompilationDatabaseForBuckTarget(buckProjectRoot, target) {
    const allFlavors = ['compilation-database', ...this._params.flavorsForTarget];
    if (this._params.useDefaultPlatform) {
      const platform = await (_BuckServiceImpl || _load_BuckServiceImpl()).getDefaultPlatform(buckProjectRoot, target);
      if (platform != null) {
        allFlavors.push(platform);
      }
    }
    const allArgs = this._params.args.length === 0 ? await (_BuckServiceImpl || _load_BuckServiceImpl())._getFbRepoSpecificArgs(buckProjectRoot) : this._params.args;
    const buildTarget = target + '#' + allFlavors.join(',');
    const buildReport = await (_BuckServiceImpl || _load_BuckServiceImpl()).build(buckProjectRoot, [
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

    const buildFile = await (_BuckServiceImpl || _load_BuckServiceImpl()).getBuildFile(buckProjectRoot, target);
    const compilationDB = {
      file: pathToCompilationDatabase,
      flagsFile: buildFile,
      libclangPath: null,
      warnings: []
    };
    return this._processCompilationDb(compilationDB, buckProjectRoot, allArgs);
  }

  async _processCompilationDb(db, buckRoot, args) {
    try {
      // $FlowFB
      const { createOmCompilationDb } = require('./fb/omCompilationDb');
      return await createOmCompilationDb(db, buckRoot, args);
    } catch (e) {}
    return db;
  }

  async _cacheFilesToCompilationDB(db) {
    const { file } = db;
    if (file == null) {
      return;
    }
    return new Promise((resolve, reject) => {
      (_nuclideClangRpc || _load_nuclideClangRpc()).loadFilesFromCompilationDatabaseAndCacheThem(file, db.flagsFile).refCount().subscribe(path => this._sourceCache.set(path, Promise.resolve(db)), reject, // on error
      resolve // on complete
      );
    });
  }
}

const compilationDatabaseHandlerCache = new (_SimpleCache || _load_SimpleCache()).SimpleCache({
  keyFactory: params => JSON.stringify(params)
});

function getCompilationDatabaseHandler(params) {
  return compilationDatabaseHandlerCache.getOrCreate(params, () => new BuckClangCompilationDatabaseHandler(params));
}