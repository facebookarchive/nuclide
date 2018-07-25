"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPool = getPool;
exports._getBuckCommandAndOptions = _getBuckCommandAndOptions;
exports._translateOptionsToBuckBuildArgs = _translateOptionsToBuckBuildArgs;
exports._build = _build;
exports.build = build;
exports.getDefaultPlatform = getDefaultPlatform;
exports.getOwners = getOwners;
exports.getRootForPath = getRootForPath;
exports.runBuckCommandFromProjectRoot = runBuckCommandFromProjectRoot;
exports.query = query;
exports._getFbRepoSpecificArgs = _getFbRepoSpecificArgs;
exports.getBuildFile = getBuildFile;

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _promiseExecutors() {
  const data = require("../../commons-node/promise-executors");

  _promiseExecutors = function () {
    return data;
  };

  return data;
}

var os = _interopRequireWildcard(require("os"));

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
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

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const logger = (0, _log4js().getLogger)('nuclide-buck-rpc'); // Tag these Buck calls as coming from Nuclide for analytics purposes.

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
const MAX_CONCURRENT_READ_ONLY = 1; // Math.max(1, os.cpus() ? os.cpus().length - 1 : 1);

const pools = new Map();

function getPool(path, readOnly) {
  const key = (readOnly ? 'ro:' : '') + path;
  let pool = pools.get(key);

  if (pool != null) {
    return pool;
  }

  pool = new (_promiseExecutors().PromisePool)(readOnly ? MAX_CONCURRENT_READ_ONLY : 1);
  pools.set(key, pool);
  return pool;
}
/**
 * @return The path to buck and set of options to be used to run a `buck` command.
 */


async function _getBuckCommandAndOptions(rootPath, commandOptions = {}) {
  // $UPFixMe: This should use nuclide-features-config
  let pathToBuck = global.atom && global.atom.config.get('nuclide.nuclide-buck.pathToBuck') || 'buck';

  if (pathToBuck === 'buck' && os.platform() === 'win32') {
    pathToBuck = 'buck.exe';
  }

  let env = await (0, _process().getOriginalEnvironment)();

  try {
    // $FlowFB
    const {
      getRealUsername
    } = require("./fb/realUsername");

    const username = await getRealUsername(env.USER);

    if (username != null) {
      env = Object.assign({}, env, {
        USER: username
      });
    }
  } catch (_) {}

  const buckCommandOptions = Object.assign({
    cwd: rootPath,
    // Buck restarts itself if the environment changes, so try to preserve
    // the original environment that Nuclide was started in.
    env
  }, commandOptions);
  return {
    pathToBuck,
    buckCommandOptions
  };
}
/**
 * @param options An object describing the desired buck build operation.
 * @return An array of strings that can be passed as `args` to spawn a
 *   process to run the `buck` command.
 */


function _translateOptionsToBuckBuildArgs(options) {
  const {
    baseOptions,
    pathToBuildReport,
    buildTargets
  } = options;
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
  } // flowlint-next-line sketchy-null-string:off


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

async function _build(rootPath, buildTargets, options) {
  const report = await _fsPromise().default.tempfile({
    suffix: '.json'
  });

  const args = _translateOptionsToBuckBuildArgs({
    baseOptions: Object.assign({}, options),
    pathToBuildReport: report,
    buildTargets
  });

  try {
    await runBuckCommandFromProjectRoot(rootPath, args, options.commandOptions, false, // Do not add the client ID, since we already do it in the build args.
    true // Build commands are blocking.
    );
  } catch (e) {
    // The build failed. However, because --keep-going was specified, the
    // build report should have still been written unless any of the target
    // args were invalid. We check the contents of the report file to be sure.
    const stat = await _fsPromise().default.stat(report).catch(() => null);

    if (stat == null || stat.size === 0) {
      throw e;
    }
  }

  try {
    const json = await _fsPromise().default.readFile(report, {
      encoding: 'UTF-8'
    });

    try {
      return JSON.parse(json);
    } catch (e) {
      throw new Error(`Failed to parse:\n${json}`);
    }
  } finally {
    _fsPromise().default.unlink(report);
  }
}

function build(rootPath, buildTargets, options) {
  return _build(rootPath, buildTargets, options || {});
}

async function getDefaultPlatform(rootPath, target) {
  const result = await query(rootPath, target, ['--output-attributes', 'defaults']);

  if (result[target] != null && result[target].defaults != null && result[target].defaults.platform != null) {
    return result[target].defaults.platform;
  }

  return null;
}

async function getOwners(rootPath, filePath, extraArguments, kindFilter) {
  let queryString = `owner("${(0, _string().shellQuote)([filePath])}")`;

  if (kindFilter != null) {
    queryString = `kind(${JSON.stringify(kindFilter)}, ${queryString})`;
  }

  return query(rootPath, queryString, extraArguments);
}

function getRootForPath(file) {
  return _fsPromise().default.findNearestFile('.buckconfig', file);
}
/**
 * @param args Do not include 'buck' as the first argument: it will be added
 *     automatically.
 */


async function runBuckCommandFromProjectRoot(rootPath, args, commandOptions, addClientId = true, readOnly = true) {
  const {
    pathToBuck,
    buckCommandOptions: options
  } = await _getBuckCommandAndOptions(rootPath, commandOptions); // Create an event name from the first arg, e.g. 'buck.query' or 'buck.build'.

  const analyticsEvent = `buck.${args.length > 0 ? args[0] : ''}`;
  const newArgs = addClientId ? args.concat(CLIENT_ID_ARGS) : args;
  return getPool(rootPath, readOnly).submit(() => {
    logger.debug(`Running \`${pathToBuck} ${(0, _string().shellQuote)(args)}\``);
    return (0, _nuclideAnalytics().trackTiming)(analyticsEvent, () => (0, _process().runCommand)(pathToBuck, newArgs, options).toPromise(), {
      args
    });
  });
}
/** Runs `buck query --json` with the specified query. */


async function query(rootPath, queryString, extraArguments) {
  const fbRepoSpecificArgs = await _getFbRepoSpecificArgs(rootPath);
  const args = ['query', ...extraArguments, '--json', queryString, ...fbRepoSpecificArgs];
  const result = await runBuckCommandFromProjectRoot(rootPath, args);
  return JSON.parse(result);
}

async function _getFbRepoSpecificArgs(buckRoot) {
  try {
    // $FlowFB
    const {
      getFbRepoSpecificArgs
    } = require("./fb/repoSpecificArgs");

    return await getFbRepoSpecificArgs(buckRoot);
  } catch (e) {
    return [];
  }
}

async function getBuildFile(rootPath, targetName) {
  try {
    const result = await query(rootPath, `buildfile(${targetName})`, []);

    if (result.length === 0) {
      return null;
    }

    return _nuclideUri().default.join(rootPath, result[0]);
  } catch (e) {
    logger.error(`No build file for target "${targetName}" ${e}`);
    return null;
  }
}