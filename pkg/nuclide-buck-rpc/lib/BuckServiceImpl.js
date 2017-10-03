'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBuildFile = exports.query = exports.runBuckCommandFromProjectRoot = exports.getOwners = exports._build = exports._getBuckCommandAndOptions = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * @return The path to buck and set of options to be used to run a `buck` command.
 */
let _getBuckCommandAndOptions = exports._getBuckCommandAndOptions = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (rootPath, commandOptions = {}) {
    // $UPFixMe: This should use nuclide-features-config
    let pathToBuck = global.atom && global.atom.config.get('nuclide.nuclide-buck.pathToBuck') || 'buck';
    if (pathToBuck === 'buck' && _os.platform() === 'win32') {
      pathToBuck = 'buck.bat';
    }
    const buckCommandOptions = Object.assign({
      cwd: rootPath,
      // Buck restarts itself if the environment changes, so try to preserve
      // the original environment that Nuclide was started in.
      env: yield (0, (_process || _load_process()).getOriginalEnvironment)()
    }, commandOptions);
    return { pathToBuck, buckCommandOptions };
  });

  return function _getBuckCommandAndOptions(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * @param options An object describing the desired buck build operation.
 * @return An array of strings that can be passed as `args` to spawn a
 *   process to run the `buck` command.
 */


let _build = exports._build = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (rootPath, buildTargets, options) {
    const report = yield (_fsPromise || _load_fsPromise()).default.tempfile({ suffix: '.json' });
    const args = _translateOptionsToBuckBuildArgs({
      baseOptions: Object.assign({}, options),
      pathToBuildReport: report,
      buildTargets
    });

    try {
      yield runBuckCommandFromProjectRoot(rootPath, args, options.commandOptions, false, // Do not add the client ID, since we already do it in the build args.
      true);
    } catch (e) {
      // The build failed. However, because --keep-going was specified, the
      // build report should have still been written unless any of the target
      // args were invalid. We check the contents of the report file to be sure.
      const stat = yield (_fsPromise || _load_fsPromise()).default.stat(report).catch(function () {
        return null;
      });
      if (stat == null || stat.size === 0) {
        throw e;
      }
    }

    try {
      const json = yield (_fsPromise || _load_fsPromise()).default.readFile(report, { encoding: 'UTF-8' });
      try {
        return JSON.parse(json);
      } catch (e) {
        throw Error(`Failed to parse:\n${json}`);
      }
    } finally {
      (_fsPromise || _load_fsPromise()).default.unlink(report);
    }
  });

  return function _build(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

let getOwners = exports.getOwners = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (rootPath, filePath, kindFilter) {
    let queryString = `owner("${(0, (_string || _load_string()).shellQuote)([filePath])}")`;
    if (kindFilter != null) {
      queryString = `kind(${JSON.stringify(kindFilter)}, ${queryString})`;
    }
    return query(rootPath, queryString);
  });

  return function getOwners(_x5, _x6, _x7) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * @param args Do not include 'buck' as the first argument: it will be added
 *     automatically.
 */
let runBuckCommandFromProjectRoot = exports.runBuckCommandFromProjectRoot = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (rootPath, args, commandOptions, addClientId = true, readOnly = true) {
    const {
      pathToBuck,
      buckCommandOptions: options
    } = yield _getBuckCommandAndOptions(rootPath, commandOptions);

    const newArgs = addClientId ? args.concat(CLIENT_ID_ARGS) : args;
    return getPool(rootPath, readOnly).submit(function () {
      logger.debug(`Running \`${pathToBuck} ${(0, (_string || _load_string()).shellQuote)(args)}\``);
      return (0, (_process || _load_process()).runCommand)(pathToBuck, newArgs, options).toPromise();
    });
  });

  return function runBuckCommandFromProjectRoot(_x8, _x9, _x10) {
    return _ref4.apply(this, arguments);
  };
})();

/** Runs `buck query --json` with the specified query. */


let query = exports.query = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (rootPath, queryString) {
    const args = ['query', '--json', queryString];
    const result = yield runBuckCommandFromProjectRoot(rootPath, args);
    const json = JSON.parse(result);
    return json;
  });

  return function query(_x11, _x12) {
    return _ref5.apply(this, arguments);
  };
})();

let getBuildFile = exports.getBuildFile = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (rootPath, targetName) {
    try {
      const result = yield query(rootPath, `buildfile(${targetName})`);
      if (result.length === 0) {
        return null;
      }
      return (_nuclideUri || _load_nuclideUri()).default.join(rootPath, result[0]);
    } catch (e) {
      logger.error(`No build file for target "${targetName}" ${e}`);
      return null;
    }
  });

  return function getBuildFile(_x13, _x14) {
    return _ref6.apply(this, arguments);
  };
})();

exports.getPool = getPool;
exports._translateOptionsToBuckBuildArgs = _translateOptionsToBuckBuildArgs;
exports.build = build;
exports.getRootForPath = getRootForPath;

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _promiseExecutors;

function _load_promiseExecutors() {
  return _promiseExecutors = require('../../commons-node/promise-executors');
}

var _os = _interopRequireWildcard(require('os'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-buck-rpc');

// Tag these Buck calls as coming from Nuclide for analytics purposes.
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

const CLIENT_ID_ARGS = ['--config', 'client.id=nuclide'];

/**
 * As defined in com.facebook.buck.cli.Command, some of Buck's subcommands are
 * read-only. The read-only commands can be executed in parallel, but the rest
 * must be executed serially.
 *
 * Still, we try to make sure we don't slow down the user's computer.
 *
 * TODO(hansonw): Buck seems to have some race conditions that prevent us
 * from running things in parallel :(
 */
const MAX_CONCURRENT_READ_ONLY = 1; // Math.max(1, os.cpus().length - 1);
const pools = new Map();

function getPool(path, readOnly) {
  const key = (readOnly ? 'ro:' : '') + path;
  let pool = pools.get(key);
  if (pool != null) {
    return pool;
  }
  pool = new (_promiseExecutors || _load_promiseExecutors()).PromisePool(readOnly ? MAX_CONCURRENT_READ_ONLY : 1);
  pools.set(key, pool);
  return pool;
}function _translateOptionsToBuckBuildArgs(options) {
  const { baseOptions, pathToBuildReport, buildTargets } = options;
  const {
    install: doInstall,
    run,
    simulator,
    test,
    debug,
    extraArguments
  } = baseOptions;

  let args = [test ? 'test' : doInstall ? 'install' : run ? 'run' : 'build'];
  args = args.concat(buildTargets, CLIENT_ID_ARGS);

  if (!run) {
    args.push('--keep-going');
  }
  // flowlint-next-line sketchy-null-string:off
  if (pathToBuildReport) {
    args = args.concat(['--build-report', pathToBuildReport]);
  }
  if (doInstall) {
    // flowlint-next-line sketchy-null-string:off
    if (simulator) {
      args.push('--udid');
      args.push(simulator);
    }

    if (run) {
      args.push('--run');
      if (debug) {
        args.push('--wait-for-debugger');
      }
    }
  } else if (test) {
    if (debug) {
      args.push('--debug');
    }
  }
  if (extraArguments != null) {
    args = args.concat(extraArguments);
  }
  return args;
}

function build(rootPath, buildTargets, options) {
  return _build(rootPath, buildTargets, options || {});
}

function getRootForPath(file) {
  return (_fsPromise || _load_fsPromise()).default.findNearestFile('.buckconfig', file);
}