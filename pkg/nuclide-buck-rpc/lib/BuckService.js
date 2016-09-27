Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getRootForPath = getRootForPath;

/**
 * Gets the build file for the specified target.
 */

var getBuildFile = _asyncToGenerator(function* (rootPath, targetName) {
  try {
    var result = yield query(rootPath, 'buildfile(' + targetName + ')');
    if (result.length === 0) {
      return null;
    }
    return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(rootPath, result[0]);
  } catch (e) {
    logger.error('No build file for target "' + targetName + '" ' + e);
    return null;
  }
}

/**
 * @param args Do not include 'buck' as the first argument: it will be added
 *     automatically.
 */
);

exports.getBuildFile = getBuildFile;

/**
 * Returns an array of strings (that are build targets) by running:
 *
 *     buck audit owner <path>
 *
 * @param filePath absolute path or a local or a remote file.
 * @return Promise that resolves to an array of build targets.
 */

var getOwner = _asyncToGenerator(function* (rootPath, filePath) {
  var args = ['audit', 'owner', filePath];
  var result = yield _runBuckCommandFromProjectRoot(rootPath, args);
  var stdout = result.stdout.trim();
  if (stdout === '') {
    return [];
  }
  return stdout.split('\n');
}

/**
 * Reads the configuration file for the Buck project and returns the requested property.
 *
 * @param section Section in the configuration file.
 * @param property Configuration option within the section.
 *
 * @return Promise that resolves to the value, if it is set, else `null`.
 */
);

exports.getOwner = getOwner;

var getBuckConfig = _asyncToGenerator(function* (rootPath, section, property) {
  var buckConfig = yield _loadBuckConfig(rootPath);
  if (!buckConfig.hasOwnProperty(section)) {
    return null;
  }
  var sectionConfig = buckConfig[section];
  if (!sectionConfig.hasOwnProperty(property)) {
    return null;
  }
  return sectionConfig[property];
}

/**
 * TODO(natthu): Also load .buckconfig.local. Consider loading .buckconfig from the home directory
 * and ~/.buckconfig.d/ directory.
 */
);

exports.getBuckConfig = getBuckConfig;

var _loadBuckConfig = _asyncToGenerator(function* (rootPath) {
  var header = 'scope = global\n';
  var buckConfigContent = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.readFile((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(rootPath, '.buckconfig'));
  return (_ini2 || _ini()).default.parse(header + buckConfigContent);
}

/**
 * Runs `buck build --keep-going --build-report <tempfile>` with the specified targets. Regardless
 * whether the build is successful, this returns the parsed version of the JSON report
 * produced by the {@code --build-report} option:
 * http://facebook.github.io/buck/command/build.html.
 *
 * An error should be thrown only if the specified targets are invalid.
 * @return Promise that resolves to a build report.
 */
);

exports.build = build;
exports.install = install;

var _build = _asyncToGenerator(function* (rootPath, buildTargets, options) {
  var report = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.tempfile({ suffix: '.json' });
  var args = _translateOptionsToBuckBuildArgs({
    baseOptions: _extends({}, options),
    pathToBuildReport: report,
    buildTargets: buildTargets
  });

  try {
    yield _runBuckCommandFromProjectRoot(rootPath, args, options.commandOptions, false, // Do not add the client ID, since we already do it in the build args.
    true);
  } // Build commands are blocking.
  catch (e) {
    // The build failed. However, because --keep-going was specified, the
    // build report should have still been written unless any of the target
    // args were invalid. We check the contents of the report file to be sure.
    var stat = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.stat(report).catch(function () {
      return null;
    });
    if (stat == null || stat.size === 0) {
      throw e;
    }
  }

  try {
    var json = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.readFile(report, { encoding: 'UTF-8' });
    try {
      return JSON.parse(json);
    } catch (e) {
      throw Error('Failed to parse:\n' + json);
    }
  } finally {
    (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.unlink(report);
  }
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
);

exports.buildWithOutput = buildWithOutput;
exports.testWithOutput = testWithOutput;
exports.installWithOutput = installWithOutput;

var listAliases = _asyncToGenerator(function* (rootPath) {
  var args = ['audit', 'alias', '--list'];
  var result = yield _runBuckCommandFromProjectRoot(rootPath, args);
  var stdout = result.stdout.trim();
  return stdout ? stdout.split('\n') : [];
}

/**
 * Currently, if `aliasOrTarget` contains a flavor, this will fail.
 */
);

exports.listAliases = listAliases;

var resolveAlias = _asyncToGenerator(function* (rootPath, aliasOrTarget) {
  var args = ['targets', '--resolve-alias', aliasOrTarget];
  var result = yield _runBuckCommandFromProjectRoot(rootPath, args);
  return result.stdout.trim();
}

/**
 * Returns the build output metadata for the given target.
 * This will contain one element if the target is unique; otherwise it will
 * contain data for all the targets (e.g. for //path/to/targets:)
 *
 * The build output path is typically contained in the 'buck.outputPath' key.
 */
);

exports.resolveAlias = resolveAlias;

var showOutput = _asyncToGenerator(function* (rootPath, aliasOrTarget) {
  var args = ['targets', '--json', '--show-output', aliasOrTarget];
  var result = yield _runBuckCommandFromProjectRoot(rootPath, args);
  return JSON.parse(result.stdout.trim());
});

exports.showOutput = showOutput;

var buildRuleTypeFor = _asyncToGenerator(function* (rootPath, aliasOrTarget) {
  var canonicalName = aliasOrTarget;
  // The leading "//" can be omitted for build/test/etc, but not for query.
  // Don't prepend this for aliases though (aliases will not have colons)
  if (canonicalName.indexOf(':') !== -1 && !canonicalName.startsWith('//')) {
    canonicalName = '//' + canonicalName;
  }
  // Buck query does not support flavors.
  var flavorIndex = canonicalName.indexOf('#');
  if (flavorIndex !== -1) {
    canonicalName = canonicalName.substr(0, flavorIndex);
  }
  var args = ['query', canonicalName, '--json', '--output-attributes', 'buck.type'];
  var result = yield _runBuckCommandFromProjectRoot(rootPath, args);
  var json = JSON.parse(result.stdout);
  // If aliasOrTarget is an alias, targets[0] will be the fully qualified build target.
  var targets = Object.keys(json);
  // "target:" rules build all rules in that particular BUCK file.
  // Let's just choose the first one.
  if (!targets || !canonicalName.endsWith(':') && targets.length !== 1) {
    throw new Error('Error determining rule type of \'' + aliasOrTarget + '\'.');
  }
  return json[targets[0]]['buck.type'];
});

exports.buildRuleTypeFor = buildRuleTypeFor;

var getHTTPServerPort = _asyncToGenerator(function* (rootPath) {
  var args = ['server', 'status', '--json', '--http-port'];
  var result = yield _runBuckCommandFromProjectRoot(rootPath, args);
  var json = JSON.parse(result.stdout);
  return json['http.port'];
}

/** Runs `buck query --json` with the specified query. */
);

exports.getHTTPServerPort = getHTTPServerPort;

var query = _asyncToGenerator(function* (rootPath, queryString) {
  var args = ['query', '--json', queryString];
  var result = yield _runBuckCommandFromProjectRoot(rootPath, args);
  var json = JSON.parse(result.stdout);
  return json;
}

/**
 * Runs `buck query --json` with a query that contains placeholders and therefore expects
 * arguments.
 * @param query Should contain '%s' placeholders.
 * @param args Should be a list of build targets or aliases. The query will be run for each arg.
 *   It will be substituted for '%s' when it is run.
 * @return object where each arg in args will be a key. Its corresponding value will be the list
 *   of matching build targets in its results.
 */
);

exports.query = query;

var queryWithArgs = _asyncToGenerator(function* (rootPath, queryString, args) {
  var completeArgs = ['query', '--json', queryString].concat(args);
  var result = yield _runBuckCommandFromProjectRoot(rootPath, completeArgs);
  var json = JSON.parse(result.stdout);

  // `buck query` does not include entries in the JSON for params that did not match anything. We
  // massage the output to ensure that every argument has an entry in the output.
  for (var arg of args) {
    if (!json.hasOwnProperty(arg)) {
      json[arg] = [];
    }
  }
  return json;
}

// TODO: Nuclide's RPC framework won't allow BuckWebSocketMessage here unless we cover
// all possible message types. For now, we'll manually typecast at the callsite.
);

exports.queryWithArgs = queryWithArgs;
exports.getWebSocketStream = getWebSocketStream;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _commonsNodePromiseExecutors2;

function _commonsNodePromiseExecutors() {
  return _commonsNodePromiseExecutors2 = require('../../commons-node/promise-executors');
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _createBuckWebSocket2;

function _createBuckWebSocket() {
  return _createBuckWebSocket2 = _interopRequireDefault(require('./createBuckWebSocket'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _ini2;

function _ini() {
  return _ini2 = _interopRequireDefault(require('ini'));
}

var _os2;

function _os() {
  return _os2 = _interopRequireDefault(require('os'));
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

// Tag these Buck calls as coming from Nuclide for analytics purposes.
var CLIENT_ID_ARGS = ['--config', 'client.id=nuclide'];

/**
 * As defined in com.facebook.buck.cli.Command, some of Buck's subcommands are
 * read-only. The read-only commands can be executed in parallel, but the rest
 * must be executed serially.
 *
 * Still, we try to make sure we don't slow down the user's computer.
 */
var MAX_CONCURRENT_READ_ONLY = Math.max(1, (_os2 || _os()).default.cpus().length - 1);
var pools = new Map();

function getPool(path, readOnly) {
  var key = (readOnly ? 'ro:' : '') + path;
  var pool = pools.get(key);
  if (pool != null) {
    return pool;
  }
  // Buck seems to have a classic exists/create race condition when NO_BUCKD is enabled.
  // TODO(hansonw): Remove this if/when the issue is fixed in Buck.
  pool = new (_commonsNodePromiseExecutors2 || _commonsNodePromiseExecutors()).PromisePool(readOnly && process.env.NO_BUCKD !== '1' ? MAX_CONCURRENT_READ_ONLY : 1);
  pools.set(key, pool);
  return pool;
}

/**
 * Given a file path, returns path to the Buck project root i.e. the directory containing
 * '.buckconfig' file.
 */

function getRootForPath(file) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findNearestFile('.buckconfig', file);
}

function _runBuckCommandFromProjectRoot(rootPath, args, commandOptions) {
  var addClientId = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];
  var readOnly = arguments.length <= 4 || arguments[4] === undefined ? true : arguments[4];

  var _getBuckCommandAndOptions2 = _getBuckCommandAndOptions(rootPath, commandOptions);

  var pathToBuck = _getBuckCommandAndOptions2.pathToBuck;
  var options = _getBuckCommandAndOptions2.buckCommandOptions;

  var newArgs = addClientId ? args.concat(CLIENT_ID_ARGS) : args;
  logger.debug('Buck command:', pathToBuck, newArgs, options);
  return getPool(rootPath, readOnly).submitFunction(function () {
    return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).checkOutput)(pathToBuck, newArgs, options);
  });
}

/**
 * @return The path to buck and set of options to be used to run a `buck` command.
 */
function _getBuckCommandAndOptions(rootPath) {
  var commandOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  // $UPFixMe: This should use nuclide-features-config
  var pathToBuck = global.atom && global.atom.config.get('nuclide.nuclide-buck.pathToBuck') || 'buck';
  var buckCommandOptions = _extends({
    cwd: rootPath,
    // Buck restarts itself if the environment changes, so try to preserve
    // the original environment that Nuclide was started in.
    env: (0, (_commonsNodeProcess2 || _commonsNodeProcess()).getOriginalEnvironment)()
  }, commandOptions);
  return { pathToBuck: pathToBuck, buckCommandOptions: buckCommandOptions };
}
function build(rootPath, buildTargets, options) {
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
  var args = _translateOptionsToBuckBuildArgs({
    baseOptions: _extends({}, options),
    buildTargets: buildTargets
  });

  var _getBuckCommandAndOptions3 = _getBuckCommandAndOptions(rootPath);

  var pathToBuck = _getBuckCommandAndOptions3.pathToBuck;
  var buckCommandOptions = _getBuckCommandAndOptions3.buckCommandOptions;

  return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).observeProcess)(function () {
    return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).safeSpawn)(pathToBuck, args, buckCommandOptions);
  });
}

/**
 * @param options An object describing the desired buck build operation.
 * @return An array of strings that can be passed as `args` to spawn a
 *   process to run the `buck` command.
 */
function _translateOptionsToBuckBuildArgs(options) {
  var baseOptions = options.baseOptions;
  var pathToBuildReport = options.pathToBuildReport;
  var buildTargets = options.buildTargets;
  var doInstall = baseOptions.install;
  var simulator = baseOptions.simulator;
  var test = baseOptions.test;
  var extraArguments = baseOptions.extraArguments;

  var runOptions = baseOptions.runOptions || { run: false };

  var args = [test ? 'test' : doInstall ? 'install' : 'build'];
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
  return (0, (_createBuckWebSocket2 || _createBuckWebSocket()).default)(httpPort).publish();
}

// Not actually from Buck - this is to let the receiver know that the socket is connected.

// The service framework doesn't support imported types
/* AsyncExecuteOptions */