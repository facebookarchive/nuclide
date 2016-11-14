'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryWithArgs = exports.query = exports.getHTTPServerPort = exports.buildRuleTypeFor = exports.showOutput = exports.resolveAlias = exports.listAliases = exports.getBuckConfig = exports.getOwners = exports.getBuildFile = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Gets the build file for the specified target.
 */
let getBuildFile = exports.getBuildFile = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (rootPath, targetName) {
    try {
      const result = yield query(rootPath, `buildfile(${ targetName })`);
      if (result.length === 0) {
        return null;
      }
      return (_nuclideUri || _load_nuclideUri()).default.join(rootPath, result[0]);
    } catch (e) {
      logger.error(`No build file for target "${ targetName }" ${ e }`);
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
  var _ref2 = (0, _asyncToGenerator.default)(function* (rootPath, filePath, kindFilter) {
    let queryString = `owner(${ (0, (_shellQuote || _load_shellQuote()).quote)([filePath]) })`;
    if (kindFilter != null) {
      queryString = `kind(${ JSON.stringify(kindFilter) }, ${ queryString })`;
    }
    return query(rootPath, queryString);
  });

  return function getOwners(_x6, _x7, _x8) {
    return _ref2.apply(this, arguments);
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
  var _ref3 = (0, _asyncToGenerator.default)(function* (rootPath, section, property) {
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

  return function getBuckConfig(_x9, _x10, _x11) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * TODO(natthu): Also load .buckconfig.local. Consider loading .buckconfig from the home directory
 * and ~/.buckconfig.d/ directory.
 */


let _loadBuckConfig = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (rootPath) {
    const header = 'scope = global\n';
    const buckConfigContent = yield (_fsPromise || _load_fsPromise()).default.readFile((_nuclideUri || _load_nuclideUri()).default.join(rootPath, '.buckconfig'), 'utf8');
    return (_ini || _load_ini()).default.parse(header + buckConfigContent);
  });

  return function _loadBuckConfig(_x12) {
    return _ref4.apply(this, arguments);
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
  var _ref5 = (0, _asyncToGenerator.default)(function* (rootPath, buildTargets, options) {
    const report = yield (_fsPromise || _load_fsPromise()).default.tempfile({ suffix: '.json' });
    const args = _translateOptionsToBuckBuildArgs({
      baseOptions: Object.assign({}, options),
      pathToBuildReport: report,
      buildTargets: buildTargets
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
        throw Error(`Failed to parse:\n${ json }`);
      }
    } finally {
      (_fsPromise || _load_fsPromise()).default.unlink(report);
    }
  });

  return function _build(_x13, _x14, _x15) {
    return _ref5.apply(this, arguments);
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
  var _ref6 = (0, _asyncToGenerator.default)(function* (rootPath) {
    const args = ['audit', 'alias', '--list'];
    const result = yield _runBuckCommandFromProjectRoot(rootPath, args);
    const stdout = result.stdout.trim();
    return stdout ? stdout.split('\n') : [];
  });

  return function listAliases(_x16) {
    return _ref6.apply(this, arguments);
  };
})();

/**
 * Currently, if `aliasOrTarget` contains a flavor, this will fail.
 */


let resolveAlias = exports.resolveAlias = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (rootPath, aliasOrTarget) {
    const args = ['targets', '--resolve-alias', aliasOrTarget];
    const result = yield _runBuckCommandFromProjectRoot(rootPath, args);
    return result.stdout.trim();
  });

  return function resolveAlias(_x17, _x18) {
    return _ref7.apply(this, arguments);
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
  var _ref8 = (0, _asyncToGenerator.default)(function* (rootPath, aliasOrTarget) {
    const args = ['targets', '--json', '--show-output', aliasOrTarget];
    const result = yield _runBuckCommandFromProjectRoot(rootPath, args);
    return JSON.parse(result.stdout.trim());
  });

  return function showOutput(_x19, _x20) {
    return _ref8.apply(this, arguments);
  };
})();

let buildRuleTypeFor = exports.buildRuleTypeFor = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (rootPath, aliasOrTarget) {
    let canonicalName = aliasOrTarget;
    // The leading "//" can be omitted for build/test/etc, but not for query.
    // Don't prepend this for aliases though (aliases will not have colons)
    if (canonicalName.indexOf(':') !== -1 && !canonicalName.startsWith('//')) {
      canonicalName = '//' + canonicalName;
    }
    // Buck query does not support flavors.
    const flavorIndex = canonicalName.indexOf('#');
    if (flavorIndex !== -1) {
      canonicalName = canonicalName.substr(0, flavorIndex);
    }
    const args = ['query', canonicalName, '--json', '--output-attributes', 'buck.type'];
    const result = yield _runBuckCommandFromProjectRoot(rootPath, args);
    const json = JSON.parse(result.stdout);
    // If aliasOrTarget is an alias, targets[0] will be the fully qualified build target.
    const targets = Object.keys(json);
    // "target:" rules build all rules in that particular BUCK file.
    // Let's just choose the first one.
    if (!targets || !canonicalName.endsWith(':') && targets.length !== 1) {
      throw new Error(`Error determining rule type of '${ aliasOrTarget }'.`);
    }
    return json[targets[0]]['buck.type'];
  });

  return function buildRuleTypeFor(_x21, _x22) {
    return _ref9.apply(this, arguments);
  };
})();

let getHTTPServerPort = exports.getHTTPServerPort = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (rootPath) {
    const args = ['server', 'status', '--json', '--http-port'];
    const result = yield _runBuckCommandFromProjectRoot(rootPath, args);
    const json = JSON.parse(result.stdout);
    return json['http.port'];
  });

  return function getHTTPServerPort(_x23) {
    return _ref10.apply(this, arguments);
  };
})();

/** Runs `buck query --json` with the specified query. */


let query = exports.query = (() => {
  var _ref11 = (0, _asyncToGenerator.default)(function* (rootPath, queryString) {
    const args = ['query', '--json', queryString];
    const result = yield _runBuckCommandFromProjectRoot(rootPath, args);
    const json = JSON.parse(result.stdout);
    return json;
  });

  return function query(_x24, _x25) {
    return _ref11.apply(this, arguments);
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
  var _ref12 = (0, _asyncToGenerator.default)(function* (rootPath, queryString, args) {
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

  return function queryWithArgs(_x26, _x27, _x28) {
    return _ref12.apply(this, arguments);
  };
})();

// TODO: Nuclide's RPC framework won't allow BuckWebSocketMessage here unless we cover
// all possible message types. For now, we'll manually typecast at the callsite.


exports.getRootForPath = getRootForPath;
exports.build = build;
exports.install = install;
exports.buildWithOutput = buildWithOutput;
exports.testWithOutput = testWithOutput;
exports.installWithOutput = installWithOutput;
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
}

/**
 * Given a file path, returns path to the Buck project root i.e. the directory containing
 * '.buckconfig' file.
 */
function getRootForPath(file) {
  return (_fsPromise || _load_fsPromise()).default.findNearestFile('.buckconfig', file);
}function _runBuckCommandFromProjectRoot(rootPath, args, commandOptions) {
  let addClientId = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  let readOnly = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

  var _getBuckCommandAndOpt = _getBuckCommandAndOptions(rootPath, commandOptions);

  const pathToBuck = _getBuckCommandAndOpt.pathToBuck,
        options = _getBuckCommandAndOpt.buckCommandOptions;


  const newArgs = addClientId ? args.concat(CLIENT_ID_ARGS) : args;
  logger.debug('Buck command:', pathToBuck, newArgs, options);
  return getPool(rootPath, readOnly).submit(() => (0, (_process || _load_process()).checkOutput)(pathToBuck, newArgs, options));
}

/**
 * @return The path to buck and set of options to be used to run a `buck` command.
 */
function _getBuckCommandAndOptions(rootPath) {
  let commandOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  // $UPFixMe: This should use nuclide-features-config
  const pathToBuck = global.atom && global.atom.config.get('nuclide.nuclide-buck.pathToBuck') || 'buck';
  const buckCommandOptions = Object.assign({
    cwd: rootPath,
    // Buck restarts itself if the environment changes, so try to preserve
    // the original environment that Nuclide was started in.
    env: (0, (_process || _load_process()).getOriginalEnvironment)()
  }, commandOptions);
  return { pathToBuck: pathToBuck, buckCommandOptions: buckCommandOptions };
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
function install(rootPath, buildTargets, simulator, runOptions) {
  return _build(rootPath, buildTargets, { install: true, simulator: simulator, runOptions: runOptions });
}

function buildWithOutput(rootPath, buildTargets, extraArguments) {
  return _buildWithOutput(rootPath, buildTargets, { extraArguments: extraArguments }).publish();
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
function testWithOutput(rootPath, buildTargets, extraArguments) {
  return _buildWithOutput(rootPath, buildTargets, { test: true, extraArguments: extraArguments }).publish();
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
function installWithOutput(rootPath, buildTargets, extraArguments, simulator, runOptions) {
  return _buildWithOutput(rootPath, buildTargets, {
    install: true,
    simulator: simulator,
    runOptions: runOptions,
    extraArguments: extraArguments
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
    buildTargets: buildTargets
  });

  var _getBuckCommandAndOpt2 = _getBuckCommandAndOptions(rootPath);

  const pathToBuck = _getBuckCommandAndOpt2.pathToBuck,
        buckCommandOptions = _getBuckCommandAndOpt2.buckCommandOptions;


  return (0, (_process || _load_process()).observeProcess)(() => (0, (_process || _load_process()).safeSpawn)(pathToBuck, args, buckCommandOptions));
}

/**
 * @param options An object describing the desired buck build operation.
 * @return An array of strings that can be passed as `args` to spawn a
 *   process to run the `buck` command.
 */
function _translateOptionsToBuckBuildArgs(options) {
  const baseOptions = options.baseOptions,
        pathToBuildReport = options.pathToBuildReport,
        buildTargets = options.buildTargets;
  const doInstall = baseOptions.install,
        simulator = baseOptions.simulator,
        test = baseOptions.test,
        extraArguments = baseOptions.extraArguments;

  const runOptions = baseOptions.runOptions || { run: false };

  let args = [test ? 'test' : doInstall ? 'install' : 'build'];
  args = args.concat(buildTargets, CLIENT_ID_ARGS);

  args.push('--keep-going');
  if (pathToBuildReport) {
    args = args.concat(['--build-report', pathToBuildReport]);
  }
  if (doInstall) {
    if (simulator) {
      args.push('--udid');
      args.push(simulator);
    }

    if (runOptions.run) {
      args.push('--run');
      if (runOptions.debug) {
        args.push('--wait-for-debugger');
      }
    }
  }
  if (extraArguments != null) {
    args = args.concat(extraArguments);
  }
  return args;
}

function getWebSocketStream(rootPath, httpPort) {
  return (0, (_createBuckWebSocket || _load_createBuckWebSocket()).default)(httpPort).publish();
}