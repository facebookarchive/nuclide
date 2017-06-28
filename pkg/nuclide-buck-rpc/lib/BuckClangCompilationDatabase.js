'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCompilationDatabase = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getCompilationDatabase = exports.getCompilationDatabase = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (src) {
    return sourceCache.getOrCreate(src, function () {
      return loadCompilationDatabaseFromBuck(src).catch(function (err) {
        logger.error('Error getting flags from Buck', err);
        return null;
      });
    });
  });

  return function getCompilationDatabase(_x) {
    return _ref.apply(this, arguments);
  };
})();

let loadCompilationDatabaseFromBuck = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (src) {
    const buckRoot = yield (_BuckServiceImpl || _load_BuckServiceImpl()).getRootForPath(src);
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
        return { flagsFile: buildFile, file: null };
      }
      return null;
    }
    const target = queryTarget;

    const targetKey = buckRoot + ':' + target;
    sourceToTargetKey.set(src, targetKey);

    return targetCache.getOrCreate(targetKey, function () {
      return loadCompilationDatabaseForBuckTarget(buckRoot, target);
    });
  });

  return function loadCompilationDatabaseFromBuck(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let addMode = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (root, mode, args) {
    if (yield (_fsPromise || _load_fsPromise()).default.exists((_nuclideUri || _load_nuclideUri()).default.join(root, mode))) {
      return args.concat(['@' + mode]);
    }
    return args;
  });

  return function addMode(_x3, _x4, _x5) {
    return _ref3.apply(this, arguments);
  };
})();

// Many Android/iOS targets require custom flags to build with Buck.
// TODO: Share this code with the client-side Buck modifiers!


let customizeBuckTarget = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (root, target) {
    let args = [target];
    const projectId = yield (0, (_nuclideArcanistRpc || _load_nuclideArcanistRpc()).findArcProjectIdOfPath)(root);
    switch (projectId) {
      case 'fbobjc':
        if (process.platform === 'linux') {
          // TODO: this should probably look up the right flavor somehow.
          args = yield addMode(root, 'mode/iphonesimulator', args);
        }
        break;
      case 'facebook-fbandroid':
        if (process.platform === 'linux') {
          args = yield addMode(root, 'mode/server', args);
        }
        break;
    }
    return args;
  });

  return function customizeBuckTarget(_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
})();

let loadCompilationDatabaseForBuckTarget = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (buckProjectRoot, target) {
    // TODO(t12973165): Allow configuring a custom flavor.
    // For now, this seems to use cxx.default_platform, which tends to be correct.
    const buildTarget = target + '#compilation-database';
    const buildReport = yield (_BuckServiceImpl || _load_BuckServiceImpl()).build(buckProjectRoot, [
    // Small builds, like those used for a compilation database, can degrade overall
    // `buck build` performance by unnecessarily invalidating the Action Graph cache.
    // See https://buckbuild.com/concept/buckconfig.html#client.skip-action-graph-cache
    // for details on the importance of using skip-action-graph-cache=true.
    '--config', 'client.skip-action-graph-cache=true', ...(yield customizeBuckTarget(buckProjectRoot, buildTarget))], { commandOptions: { timeout: BUCK_TIMEOUT } });
    if (!buildReport.success) {
      const error = `Failed to build ${buildTarget}`;
      logger.error(error);
      throw error;
    }
    const firstResult = Object.keys(buildReport.results)[0];
    let pathToCompilationDatabase = buildReport.results[firstResult].output;
    pathToCompilationDatabase = (_nuclideUri || _load_nuclideUri()).default.join(buckProjectRoot, pathToCompilationDatabase);

    const buildFile = yield (_BuckServiceImpl || _load_BuckServiceImpl()).getBuildFile(buckProjectRoot, target);
    return { file: pathToCompilationDatabase, flagsFile: buildFile };
  });

  return function loadCompilationDatabaseForBuckTarget(_x8, _x9) {
    return _ref5.apply(this, arguments);
  };
})();

exports.resetForSource = resetForSource;
exports.reset = reset;

var _nuclideArcanistRpc;

function _load_nuclideArcanistRpc() {
  return _nuclideArcanistRpc = require('../../nuclide-arcanist-rpc');
}

var _BuckServiceImpl;

function _load_BuckServiceImpl() {
  return _BuckServiceImpl = _interopRequireWildcard(require('./BuckServiceImpl'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
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

const targetCache = new (_cache || _load_cache()).Cache();
const sourceCache = new (_cache || _load_cache()).Cache();

// Ensure that we can clear targetCache for a given file.
const sourceToTargetKey = new Map();

/**
 * Facebook puts all headers in a <target>:__default_headers__ build target by default.
 * This target will never produce compilation flags, so make sure to ignore it.
 */
const DEFAULT_HEADERS_TARGET = '__default_headers__';

function resetForSource(src) {
  sourceCache.delete(src);
  const targetKey = sourceToTargetKey.get(src);
  if (targetKey != null) {
    targetCache.delete(targetKey);
    sourceToTargetKey.delete(src);
  }
}

function reset() {
  sourceCache.clear();
  targetCache.clear();
  sourceToTargetKey.clear();
}