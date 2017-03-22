'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLastCommandInfo = exports.resolveBuildTargetName = exports.queryWithArgs = exports.query = exports.getHTTPServerPort = exports.buildRuleTypeFor = exports.showOutput = exports.resolveAlias = exports.listFlavors = exports.listAliases = exports.getBuckConfig = exports.getOwners = exports.getBuildFile = exports.MULTIPLE_TARGET_RULE_TYPE = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Gets the build file for the specified target.
 */
let getBuildFile = exports.getBuildFile = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (rootPath, targetName) {
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

  return function getBuildFile(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * @param args Do not include 'buck' as the first argument: it will be added
 *     automatically.
 */


let _runBuckCommandFromProjectRoot = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (rootPath, args, commandOptions, addClientId = true, readOnly = true) {
    const { pathToBuck, buckCommandOptions: options } = yield _getBuckCommandAndOptions(rootPath, commandOptions);

    const newArgs = addClientId ? args.concat(CLIENT_ID_ARGS) : args;
    logger.debug('Buck command:', pathToBuck, newArgs, options);
    return getPool(rootPath, readOnly).submit(function () {
      return (0, (_process || _load_process()).checkOutput)(pathToBuck, newArgs, options);
    });
  });

  return function _runBuckCommandFromProjectRoot(_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * @return The path to buck and set of options to be used to run a `buck` command.
 */


let _getBuckCommandAndOptions = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (rootPath, commandOptions = {}) {
    // $UPFixMe: This should use nuclide-features-config
    const pathToBuck = global.atom && global.atom.config.get('nuclide.nuclide-buck.pathToBuck') || 'buck';
    const buckCommandOptions = Object.assign({
      cwd: rootPath,
      // Buck restarts itself if the environment changes, so try to preserve
      // the original environment that Nuclide was started in.
      env: yield (0, (_process || _load_process()).getOriginalEnvironment)()
    }, commandOptions);
    return { pathToBuck, buckCommandOptions };
  });

  return function _getBuckCommandAndOptions(_x6) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * Returns an array of strings (that are build targets) by running:
 *
 *     buck query owner(<path>)
 *
 * If `kindFilter` is provided, `kind(kindFilter, owner(..))` will be used.
 *
 * @param filePath absolute path or a local or a remote file.
 * @param kindFilter filter for specific build target kinds.
 * @return Promise that resolves to an array of build targets.
 */


let getOwners = exports.getOwners = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (rootPath, filePath, kindFilter) {
    let queryString = `owner(${(0, (_shellQuote || _load_shellQuote()).quote)([filePath])})`;
    if (kindFilter != null) {
      queryString = `kind(${JSON.stringify(kindFilter)}, ${queryString})`;
    }
    return query(rootPath, queryString);
  });

  return function getOwners(_x7, _x8, _x9) {
    return _ref4.apply(this, arguments);
  };
})();

/**
 * Reads the configuration file for the Buck project and returns the requested property.
 *
 * @param section Section in the configuration file.
 * @param property Configuration option within the section.
 *
 * @return Promise that resolves to the value, if it is set, else `null`.
 */


let getBuckConfig = exports.getBuckConfig = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (rootPath, section, property) {
    const buckConfig = yield _loadBuckConfig(rootPath);
    if (!buckConfig.hasOwnProperty(section)) {
      return null;
    }
    const sectionConfig = buckConfig[section];
    if (!sectionConfig.hasOwnProperty(property)) {
      return null;
    }
    return sectionConfig[property];
  });

  return function getBuckConfig(_x10, _x11, _x12) {
    return _ref5.apply(this, arguments);
  };
})();

/**
 * TODO(natthu): Also load .buckconfig.local. Consider loading .buckconfig from the home directory
 * and ~/.buckconfig.d/ directory.
 */


let _loadBuckConfig = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (rootPath) {
    const header = 'scope = global\n';
    const buckConfigContent = yield (_fsPromise || _load_fsPromise()).default.readFile((_nuclideUri || _load_nuclideUri()).default.join(rootPath, '.buckconfig'), 'utf8');
    return (_ini || _load_ini()).default.parse(header + buckConfigContent);
  });

  return function _loadBuckConfig(_x13) {
    return _ref6.apply(this, arguments);
  };
})();

/**
 * Runs `buck build --keep-going --build-report <tempfile>` with the specified targets. Regardless
 * whether the build is successful, this returns the parsed version of the JSON report
 * produced by the {@code --build-report} option:
 * http://facebook.github.io/buck/command/build.html.
 *
 * An error should be thrown only if the specified targets are invalid.
 * @return Promise that resolves to a build report.
 */


let _build = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (rootPath, buildTargets, options) {
    const report = yield (_fsPromise || _load_fsPromise()).default.tempfile({ suffix: '.json' });
    const args = _translateOptionsToBuckBuildArgs({
      baseOptions: Object.assign({}, options),
      pathToBuildReport: report,
      buildTargets
    });

    try {
      yield _runBuckCommandFromProjectRoot(rootPath, args, options.commandOptions, false, // Do not add the client ID, since we already do it in the build args.
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

  return function _build(_x14, _x15, _x16) {
    return _ref7.apply(this, arguments);
  };
})();

/**
 * Same as `build`, but returns additional output via an Observable.
 * @return An Observable with the following implementations:
 *   onNext: Calls the Observer with successive strings from stdout and stderr.
 *     Each update will be of the form: {stdout: string;} | {stderr: string;}
 *     TODO: Use a union to exactly match `{stdout: string;} | {stderr: string;}` when the service
 *     framework supports it. Use an object with optional keys to mimic the union.
 *   onError: If the build fails, calls the Observer with the string output
 *     from stderr.
 *   onCompleted: Only called if the build completes successfully.
 */


let listAliases = exports.listAliases = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (rootPath) {
    const args = ['audit', 'alias', '--list'];
    const result = yield _runBuckCommandFromProjectRoot(rootPath, args);
    const stdout = result.stdout.trim();
    return stdout ? stdout.split('\n') : [];
  });

  return function listAliases(_x17) {
    return _ref8.apply(this, arguments);
  };
})();

let listFlavors = exports.listFlavors = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (rootPath, targets) {
    const args = ['audit', 'flavors', '--json'].concat(targets);
    try {
      const result = yield _runBuckCommandFromProjectRoot(rootPath, args);
      return JSON.parse(result.stdout);
    } catch (e) {
      return null;
    }
  });

  return function listFlavors(_x18, _x19) {
    return _ref9.apply(this, arguments);
  };
})();

/**
 * Currently, if `aliasOrTarget` contains a flavor, this will fail.
 */


let resolveAlias = exports.resolveAlias = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (rootPath, aliasOrTarget) {
    const args = ['query', aliasOrTarget];
    const result = yield _runBuckCommandFromProjectRoot(rootPath, args);
    return result.stdout.trim();
  });

  return function resolveAlias(_x20, _x21) {
    return _ref10.apply(this, arguments);
  };
})();

/**
 * Returns the build output metadata for the given target.
 * This will contain one element if the target is unique; otherwise it will
 * contain data for all the targets (e.g. for //path/to/targets:)
 *
 * The build output path is typically contained in the 'buck.outputPath' key.
 */


let showOutput = exports.showOutput = (() => {
  var _ref11 = (0, _asyncToGenerator.default)(function* (rootPath, aliasOrTarget) {
    const args = ['targets', '--json', '--show-output', aliasOrTarget];
    const result = yield _runBuckCommandFromProjectRoot(rootPath, args);
    return JSON.parse(result.stdout.trim());
  });

  return function showOutput(_x22, _x23) {
    return _ref11.apply(this, arguments);
  };
})();

let buildRuleTypeFor = exports.buildRuleTypeFor = (() => {
  var _ref12 = (0, _asyncToGenerator.default)(function* (rootPath, aliasOrTarget) {
    const canonicalName = _normalizeNameForBuckQuery(aliasOrTarget);
    const args = ['query', canonicalName, '--json', '--output-attributes', 'buck.type'];
    const result = yield _runBuckCommandFromProjectRoot(rootPath, args);
    const json = JSON.parse(result.stdout);
    // If aliasOrTarget is an alias, targets[0] will be the fully qualified build target.
    const targets = Object.keys(json);
    if (targets.length === 0) {
      throw new Error(`Error determining rule type of '${aliasOrTarget}'.`);
    }
    // target: and target/... build a set of targets.
    // These don't have a single rule type so let's just return something.
    if (targets.length > 1) {
      return MULTIPLE_TARGET_RULE_TYPE;
    }
    return json[targets[0]]['buck.type'];
  });

  return function buildRuleTypeFor(_x24, _x25) {
    return _ref12.apply(this, arguments);
  };
})();

// Buck query doesn't allow omitting // or adding # for flavors, this needs to be fixed in buck.


let getHTTPServerPort = exports.getHTTPServerPort = (() => {
  var _ref13 = (0, _asyncToGenerator.default)(function* (rootPath) {
    const args = ['server', 'status', '--json', '--http-port'];
    const result = yield _runBuckCommandFromProjectRoot(rootPath, args);
    const json = JSON.parse(result.stdout);
    return json['http.port'];
  });

  return function getHTTPServerPort(_x26) {
    return _ref13.apply(this, arguments);
  };
})();

/** Runs `buck query --json` with the specified query. */


let query = exports.query = (() => {
  var _ref14 = (0, _asyncToGenerator.default)(function* (rootPath, queryString) {
    const args = ['query', '--json', queryString];
    const result = yield _runBuckCommandFromProjectRoot(rootPath, args);
    const json = JSON.parse(result.stdout);
    return json;
  });

  return function query(_x27, _x28) {
    return _ref14.apply(this, arguments);
  };
})();

/**
 * Runs `buck query --json` with a query that contains placeholders and therefore expects
 * arguments.
 * @param query Should contain '%s' placeholders.
 * @param args Should be a list of build targets or aliases. The query will be run for each arg.
 *   It will be substituted for '%s' when it is run.
 * @return object where each arg in args will be a key. Its corresponding value will be the list
 *   of matching build targets in its results.
 */


let queryWithArgs = exports.queryWithArgs = (() => {
  var _ref15 = (0, _asyncToGenerator.default)(function* (rootPath, queryString, args) {
    const completeArgs = ['query', '--json', queryString].concat(args);
    const result = yield _runBuckCommandFromProjectRoot(rootPath, completeArgs);
    const json = JSON.parse(result.stdout);

    // `buck query` does not include entries in the JSON for params that did not match anything. We
    // massage the output to ensure that every argument has an entry in the output.
    for (const arg of args) {
      if (!json.hasOwnProperty(arg)) {
        json[arg] = [];
      }
    }
    return json;
  });

  return function queryWithArgs(_x29, _x30, _x31) {
    return _ref15.apply(this, arguments);
  };
})();

let resolveBuildTargetName = exports.resolveBuildTargetName = (() => {
  var _ref16 = (0, _asyncToGenerator.default)(function* (buckRoot, nameOrAlias) {
    const canonicalName = _normalizeNameForBuckQuery(nameOrAlias);
    const qualifiedName = yield resolveAlias(buckRoot, canonicalName);
    let flavors;
    if (nameOrAlias.includes('#')) {
      const nameComponents = nameOrAlias.split('#');
      flavors = nameComponents.length === 2 ? nameComponents[1].split(',') : [];
    } else {
      flavors = [];
    }
    return { qualifiedName, flavors };
  });

  return function resolveBuildTargetName(_x32, _x33) {
    return _ref16.apply(this, arguments);
  };
})();

// TODO: Nuclide's RPC framework won't allow BuckWebSocketMessage here unless we cover
// all possible message types. For now, we'll manually typecast at the callsite.


let getLastCommandInfo = exports.getLastCommandInfo = (() => {
  var _ref17 = (0, _asyncToGenerator.default)(function* (rootPath) {
    const logFile = (_nuclideUri || _load_nuclideUri()).default.join(rootPath, LOG_PATH);
    if (yield (_fsPromise || _load_fsPromise()).default.exists(logFile)) {
      const result = yield (0, (_process || _load_process()).asyncExecute)('head', ['-n', '1', logFile]);
      if (result.exitCode === 0) {
        const line = result.stdout;
        const matches = line.match(LOG_REGEX);
        if (matches == null || matches.length < 2) {
          return null;
        }
        // Log lines are of the form:
        // [time][level][?][?][JavaClass] .... [args]
        // Parse this to figure out what the last command was.
        const timestamp = Number(new Date(stripBrackets(matches[0])));
        if (isNaN(timestamp)) {
          return null;
        }
        const args = stripBrackets(matches[matches.length - 1]).split(', ');
        if (args.length <= 1) {
          return null;
        }
        return { timestamp, command: args[0], args: args.slice(1) };
      }
    }
    return null;
  });

  return function getLastCommandInfo(_x34) {
    return _ref17.apply(this, arguments);
  };
})();

exports.getRootForPath = getRootForPath;
exports.build = build;
exports.install = install;
exports.buildWithOutput = buildWithOutput;
exports.testWithOutput = testWithOutput;
exports.installWithOutput = installWithOutput;
exports.runWithOutput = runWithOutput;
exports.getWebSocketStream = getWebSocketStream;

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _promiseExecutors;

function _load_promiseExecutors() {
  return _promiseExecutors = require('../../commons-node/promise-executors');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _createBuckWebSocket;

function _load_createBuckWebSocket() {
  return _createBuckWebSocket = _interopRequireDefault(require('./createBuckWebSocket'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _ini;

function _load_ini() {
  return _ini = _interopRequireDefault(require('ini'));
}

var _shellQuote;

function _load_shellQuote() {
  return _shellQuote = require('shell-quote');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

// Tag these Buck calls as coming from Nuclide for analytics purposes.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const CLIENT_ID_ARGS = ['--config', 'client.id=nuclide'];

const MULTIPLE_TARGET_RULE_TYPE = exports.MULTIPLE_TARGET_RULE_TYPE = 'multiple_targets';

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
}

/**
 * Given a file path, returns path to the Buck project root i.e. the directory containing
 * '.buckconfig' file.
 */
function getRootForPath(file) {
  return (_fsPromise || _load_fsPromise()).default.findNearestFile('.buckconfig', file);
}function build(rootPath, buildTargets, options) {
  return _build(rootPath, buildTargets, options || {});
}

/**
 * Runs `buck install --keep-going --build-report <tempfile>` with the specified targets.
 *
 * @param run If set to 'true', appends the buck invocation with '--run' to run the
 *   installed application.
 * @param debug If set to 'true', appends the buck invocation with '--wait-for-debugger'
 *   telling the launched application to stop at the loader breakpoint
 *   waiting for debugger to connect
 * @param simulator The UDID of the simulator to install the binary on.
 * @return Promise that resolves to a build report.
 */
function install(rootPath, buildTargets, simulator, run, debug) {
  return _build(rootPath, buildTargets, { install: true, simulator, run, debug });
}

function buildWithOutput(rootPath, buildTargets, extraArguments) {
  return _buildWithOutput(rootPath, buildTargets, { extraArguments }).publish();
}

/**
 * Same as `build`, but returns additional output via an Observable.
 * @return An Observable with the following implementations:
 *   onNext: Calls the Observer with successive strings from stdout and stderr.
 *     Each update will be of the form: {stdout: string;} | {stderr: string;}
 *     TODO: Use a union to exactly match `{stdout: string;} | {stderr: string;}` when the service
 *     framework supports it. Use an object with optional keys to mimic the union.
 *   onError: If the build fails, calls the Observer with the string output
 *     from stderr.
 *   onCompleted: Only called if the build completes successfully.
 */
function testWithOutput(rootPath, buildTargets, extraArguments, debug) {
  return _buildWithOutput(rootPath, buildTargets, { test: true, extraArguments, debug }).publish();
}

/**
 * Same as `install`, but returns additional output via an Observable.
 * @return An Observable with the following implementations:
 *   onNext: Calls the Observer with successive strings from stdout and stderr.
 *     Each update will be of the form: {stdout: string;} | {stderr: string;}
 *     TODO: Use a union to exactly match `{stdout: string;} | {stderr: string;}` when the service
 *     framework supports it. Use an object with optional keys to mimic the union.
 *   onError: If the install fails, calls the Observer with the string output
 *     from stderr.
 *   onCompleted: Only called if the install completes successfully.
 */
function installWithOutput(rootPath, buildTargets, extraArguments, simulator, run, debug) {
  return _buildWithOutput(rootPath, buildTargets, {
    install: true,
    simulator,
    run,
    debug,
    extraArguments
  }).publish();
}

function runWithOutput(rootPath, buildTargets, extraArguments, simulator) {
  return _buildWithOutput(rootPath, buildTargets, {
    run: true,
    simulator,
    extraArguments
  }).publish();
}

/**
 * Does a build/install.
 * @return An Observable that returns output from buck, as described by the
 *   docblocks for `buildWithOutput` and `installWithOutput`.
 */
function _buildWithOutput(rootPath, buildTargets, options) {
  const args = _translateOptionsToBuckBuildArgs({
    baseOptions: Object.assign({}, options),
    buildTargets
  });
  return _rxjsBundlesRxMinJs.Observable.fromPromise(_getBuckCommandAndOptions(rootPath)).switchMap(({ pathToBuck, buckCommandOptions }) => (0, (_process || _load_process()).observeProcess)(() => (0, (_process || _load_process()).safeSpawn)(pathToBuck, args, buckCommandOptions)).startWith({
    kind: 'stdout',
    data: `Starting "${pathToBuck} ${_getArgsStringSkipClientId(args)}"`
  }));
}

function _getArgsStringSkipClientId(args) {
  const skipped = args.findIndex(arg => arg === 'client.id=nuclide');
  return args.filter((arg, index) => index !== skipped && index !== skipped - 1).join(' ');
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
  }
  if (pathToBuildReport) {
    args = args.concat(['--build-report', pathToBuildReport]);
  }
  if (doInstall) {
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

function _normalizeNameForBuckQuery(aliasOrTarget) {
  let canonicalName = aliasOrTarget;
  // Don't prepend // for aliases (aliases will not have colons or .)
  if ((canonicalName.indexOf(':') !== -1 || canonicalName.indexOf('.') !== -1) && !canonicalName.startsWith('//')) {
    canonicalName = '//' + canonicalName;
  }
  // Strip flavor string
  const flavorIndex = canonicalName.indexOf('#');
  if (flavorIndex !== -1) {
    canonicalName = canonicalName.substr(0, flavorIndex);
  }
  return canonicalName;
}

function getWebSocketStream(rootPath, httpPort) {
  return (0, (_createBuckWebSocket || _load_createBuckWebSocket()).default)(httpPort).publish();
}

const LOG_PATH = 'buck-out/log/buck-0.log';
const LOG_REGEX = /\[([^\]]+)]/g;

function stripBrackets(str) {
  return str.substring(1, str.length - 1);
}