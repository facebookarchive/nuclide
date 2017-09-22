'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetCompilationDatabase = exports.resetCompilationDatabaseForSource = exports.getLastCommandInfo = exports.queryWithArgs = exports.getHTTPServerPort = exports._buildRuleTypeFor = exports.buildRuleTypeFor = exports.showOutput = exports.listFlavors = exports.listAliases = exports.getBuckConfig = exports.MULTIPLE_TARGET_RULE_TYPE = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Reads the configuration file for the Buck project and returns the requested property.
 *
 * @param section Section in the configuration file.
 * @param property Configuration option within the section.
 *
 * @return Promise that resolves to the value, if it is set, else `null`.
 */
let getBuckConfig = exports.getBuckConfig = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (rootPath, section, property) {
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

  return function getBuckConfig(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * TODO(natthu): Also load .buckconfig.local. Consider loading .buckconfig from the home directory
 * and ~/.buckconfig.d/ directory.
 */


let _loadBuckConfig = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (rootPath) {
    const header = 'scope = global\n';
    const buckConfigContent = yield (_fsPromise || _load_fsPromise()).default.readFile((_nuclideUri || _load_nuclideUri()).default.join(rootPath, '.buckconfig'), 'utf8');
    return (_ini || _load_ini()).default.parse(header + buckConfigContent);
  });

  return function _loadBuckConfig(_x4) {
    return _ref2.apply(this, arguments);
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


let listAliases = exports.listAliases = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (rootPath) {
    const args = ['audit', 'alias', '--list'];
    const result = yield (_BuckServiceImpl || _load_BuckServiceImpl()).runBuckCommandFromProjectRoot(rootPath, args);
    const stdout = result.trim();
    return stdout ? stdout.split('\n') : [];
  });

  return function listAliases(_x5) {
    return _ref3.apply(this, arguments);
  };
})();

let listFlavors = exports.listFlavors = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (rootPath, targets, additionalArgs = []) {
    const args = ['audit', 'flavors', '--json'].concat(targets).concat(additionalArgs);
    try {
      const result = yield (_BuckServiceImpl || _load_BuckServiceImpl()).runBuckCommandFromProjectRoot(rootPath, args);
      return JSON.parse(result);
    } catch (e) {
      return null;
    }
  });

  return function listFlavors(_x6, _x7) {
    return _ref4.apply(this, arguments);
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
  var _ref5 = (0, _asyncToGenerator.default)(function* (rootPath, aliasOrTarget, extraArguments = []) {
    const args = ['targets', '--json', '--show-output', aliasOrTarget].concat(extraArguments);
    const result = yield (_BuckServiceImpl || _load_BuckServiceImpl()).runBuckCommandFromProjectRoot(rootPath, args);
    return JSON.parse(result.trim());
  });

  return function showOutput(_x8, _x9) {
    return _ref5.apply(this, arguments);
  };
})();

let buildRuleTypeFor = exports.buildRuleTypeFor = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (rootPath, aliasesOrTargets) {
    const resolvedRuleTypes = yield Promise.all(aliasesOrTargets.trim().split(/\s+/).map(function (target) {
      return _buildRuleTypeFor(rootPath, target);
    }));

    if (resolvedRuleTypes.length === 1) {
      return resolvedRuleTypes[0];
    } else {
      return {
        buildTarget: {
          qualifiedName: aliasesOrTargets,
          flavors: []
        },
        type: MULTIPLE_TARGET_RULE_TYPE
      };
    }
  });

  return function buildRuleTypeFor(_x10, _x11) {
    return _ref6.apply(this, arguments);
  };
})();

let _buildRuleTypeFor = exports._buildRuleTypeFor = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (rootPath, aliasOrTarget) {
    let flavors;
    if (aliasOrTarget.includes('#')) {
      const nameComponents = aliasOrTarget.split('#');
      flavors = nameComponents.length === 2 ? nameComponents[1].split(',') : [];
    } else {
      flavors = [];
    }

    const canonicalName = _normalizeNameForBuckQuery(aliasOrTarget);
    const args = ['query', canonicalName, '--json', '--output-attributes', 'buck.type'];
    const result = yield (_BuckServiceImpl || _load_BuckServiceImpl()).runBuckCommandFromProjectRoot(rootPath, args);
    const json = JSON.parse(result);
    // If aliasOrTarget is an alias, targets[0] will be the fully qualified build target.
    const targets = Object.keys(json);
    if (targets.length === 0) {
      throw new Error(`Error determining rule type of '${aliasOrTarget}'.`);
    }
    let qualifiedName;
    let type;
    // target: and target/... build a set of targets.
    // These don't have a single rule type so let's just return something.
    if (targets.length > 1) {
      qualifiedName = canonicalName;
      type = MULTIPLE_TARGET_RULE_TYPE;
    } else {
      qualifiedName = targets[0];
      type = json[qualifiedName]['buck.type'];
    }
    return {
      buildTarget: {
        qualifiedName,
        flavors
      },
      type
    };
  });

  return function _buildRuleTypeFor(_x12, _x13) {
    return _ref7.apply(this, arguments);
  };
})();

// Buck query doesn't allow omitting // or adding # for flavors, this needs to be fixed in buck.


let getHTTPServerPort = exports.getHTTPServerPort = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (rootPath) {
    let port = _cachedPorts.get(rootPath);
    if (port != null) {
      if (port === -1) {
        return port;
      }
      // If there are other builds on the promise queue, wait them out.
      // This ensures that we don't return the port for another build.
      yield (_BuckServiceImpl || _load_BuckServiceImpl()).getPool(rootPath, false).submit(function () {
        return Promise.resolve();
      });
      const msg = yield getWebSocketStream(rootPath, port).refCount().take(1).toPromise().catch(function () {
        return null;
      });
      if (msg != null && msg.type === 'SocketConnected') {
        return port;
      }
    }

    const args = ['server', 'status', '--json', '--http-port'];
    const result = yield (_BuckServiceImpl || _load_BuckServiceImpl()).runBuckCommandFromProjectRoot(rootPath, args);
    const json = JSON.parse(result);
    port = json['http.port'];
    _cachedPorts.set(rootPath, port);
    return port;
  });

  return function getHTTPServerPort(_x14) {
    return _ref8.apply(this, arguments);
  };
})();

/** Runs `buck query --json` with the specified query. */


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
  var _ref9 = (0, _asyncToGenerator.default)(function* (rootPath, queryString, args) {
    const completeArgs = ['query', '--json', queryString].concat(args);
    const result = yield (_BuckServiceImpl || _load_BuckServiceImpl()).runBuckCommandFromProjectRoot(rootPath, completeArgs);
    const json = JSON.parse(result);

    // `buck query` does not include entries in the JSON for params that did not match anything. We
    // massage the output to ensure that every argument has an entry in the output.
    for (const arg of args) {
      if (!json.hasOwnProperty(arg)) {
        json[arg] = [];
      }
    }
    return json;
  });

  return function queryWithArgs(_x15, _x16, _x17) {
    return _ref9.apply(this, arguments);
  };
})();

// TODO: Nuclide's RPC framework won't allow BuckWebSocketMessage here unless we cover
// all possible message types. For now, we'll manually typecast at the callsite.


let getLastCommandInfo = exports.getLastCommandInfo = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (rootPath, maxArgs) {
    const logFile = (_nuclideUri || _load_nuclideUri()).default.join(rootPath, LOG_PATH);
    if (yield (_fsPromise || _load_fsPromise()).default.exists(logFile)) {
      let line;
      try {
        line = yield (0, (_process || _load_process()).runCommand)('head', ['-n', '1', logFile]).toPromise();
      } catch (err) {
        return null;
      }
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
      if (args.length <= 1 || maxArgs != null && args.length - 1 > maxArgs) {
        return null;
      }
      return { timestamp, command: args[0], args: args.slice(1) };
    }
    return null;
  });

  return function getLastCommandInfo(_x18, _x19) {
    return _ref10.apply(this, arguments);
  };
})();

let resetCompilationDatabaseForSource = exports.resetCompilationDatabaseForSource = (() => {
  var _ref11 = (0, _asyncToGenerator.default)(function* (src, params) {
    (0, (_BuckClangCompilationDatabase || _load_BuckClangCompilationDatabase()).getCompilationDatabaseHandler)(params).resetForSource(src);
  });

  return function resetCompilationDatabaseForSource(_x20, _x21) {
    return _ref11.apply(this, arguments);
  };
})();

let resetCompilationDatabase = exports.resetCompilationDatabase = (() => {
  var _ref12 = (0, _asyncToGenerator.default)(function* (params) {
    (0, (_BuckClangCompilationDatabase || _load_BuckClangCompilationDatabase()).getCompilationDatabaseHandler)(params).reset();
  });

  return function resetCompilationDatabase(_x22) {
    return _ref12.apply(this, arguments);
  };
})();

exports.getRootForPath = getRootForPath;
exports.getBuildFile = getBuildFile;
exports.getOwners = getOwners;
exports.build = build;
exports.install = install;
exports.buildWithOutput = buildWithOutput;
exports.testWithOutput = testWithOutput;
exports.installWithOutput = installWithOutput;
exports.runWithOutput = runWithOutput;
exports.query = query;
exports.getWebSocketStream = getWebSocketStream;
exports.getCompilationDatabase = getCompilationDatabase;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _createBuckWebSocket;

function _load_createBuckWebSocket() {
  return _createBuckWebSocket = _interopRequireDefault(require('./createBuckWebSocket'));
}

var _ini;

function _load_ini() {
  return _ini = _interopRequireDefault(require('ini'));
}

var _BuckClangCompilationDatabase;

function _load_BuckClangCompilationDatabase() {
  return _BuckClangCompilationDatabase = require('./BuckClangCompilationDatabase');
}

var _BuckServiceImpl;

function _load_BuckServiceImpl() {
  return _BuckServiceImpl = _interopRequireWildcard(require('./BuckServiceImpl'));
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

const MULTIPLE_TARGET_RULE_TYPE = exports.MULTIPLE_TARGET_RULE_TYPE = 'multiple_targets';

/**
 * Given a file path, returns path to the Buck project root i.e. the directory containing
 * '.buckconfig' file.
 */
function getRootForPath(file) {
  return (_BuckServiceImpl || _load_BuckServiceImpl()).getRootForPath(file);
}

/**
 * Gets the build file for the specified target.
 */
function getBuildFile(rootPath, targetName) {
  return (_BuckServiceImpl || _load_BuckServiceImpl()).getBuildFile(rootPath, targetName);
}

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
function getOwners(rootPath, filePath, kindFilter) {
  return (_BuckServiceImpl || _load_BuckServiceImpl()).getOwners(rootPath, filePath, kindFilter);
}function build(rootPath, buildTargets, options) {
  return (_BuckServiceImpl || _load_BuckServiceImpl()).build(rootPath, buildTargets, options);
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
  return (_BuckServiceImpl || _load_BuckServiceImpl())._build(rootPath, buildTargets, {
    install: true,
    simulator,
    run,
    debug
  });
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
function buildWithOutput(rootPath, buildTargets, extraArguments) {
  // TODO(T17463635)
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
  // TODO(T17463635)
  return _buildWithOutput(rootPath, buildTargets, {
    test: true,
    extraArguments,
    debug
  }).publish();
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
  // TODO(T17463635)
  return _buildWithOutput(rootPath, buildTargets, {
    install: true,
    simulator,
    run,
    debug,
    extraArguments
  }).publish();
}

function runWithOutput(rootPath, buildTargets, extraArguments, simulator) {
  // TODO(T17463635)
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
  // TODO(T17463635)
  const args = (_BuckServiceImpl || _load_BuckServiceImpl())._translateOptionsToBuckBuildArgs({
    baseOptions: Object.assign({}, options),
    buildTargets
  });
  return _rxjsBundlesRxMinJs.Observable.fromPromise((_BuckServiceImpl || _load_BuckServiceImpl())._getBuckCommandAndOptions(rootPath)).switchMap(({ pathToBuck, buckCommandOptions }) => (0, (_process || _load_process()).observeProcess)(pathToBuck, args, Object.assign({}, buckCommandOptions, {
    /* TODO(T17353599) */isExitError: () => false
  })).catch(error => _rxjsBundlesRxMinJs.Observable.of({ kind: 'error', error })) // TODO(T17463635)
  .startWith({
    kind: 'stdout',
    data: `Starting "${pathToBuck} ${_getArgsStringSkipClientId(args)}"`
  }));
}

function _getArgsStringSkipClientId(args) {
  const skipped = args.findIndex(arg => arg === 'client.id=nuclide');
  return args.filter((arg, index) => index !== skipped && index !== skipped - 1).join(' ');
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

const _cachedPorts = new Map();

function query(rootPath, queryString) {
  return (_BuckServiceImpl || _load_BuckServiceImpl()).query(rootPath, queryString);
}function getWebSocketStream(rootPath, httpPort) {
  return (0, (_createBuckWebSocket || _load_createBuckWebSocket()).default)(httpPort).publish();
}

const LOG_PATH = 'buck-out/log/buck-0.log';
const LOG_REGEX = /\[([^\]]+)]/g;

function stripBrackets(str) {
  return str.substring(1, str.length - 1);
}

function getCompilationDatabase(src, params) {
  return _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_BuckClangCompilationDatabase || _load_BuckClangCompilationDatabase()).getCompilationDatabaseHandler)(params).getCompilationDatabase(src)).publish();
}