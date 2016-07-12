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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _createBuckWebSocket2;

function _createBuckWebSocket() {
  return _createBuckWebSocket2 = _interopRequireDefault(require('./createBuckWebSocket'));
}

var logger = require('../../nuclide-logging').getLogger();

/**
 * As defined in com.facebook.buck.cli.Command, some of Buck's subcommands are
 * read-only. The read-only commands can be executed in parallel, but the rest
 * must be executed serially.
 *
 * TODO(mbolin): This does not account for the case where the user runs
 * `buck build` from the command line while Nuclide is also trying to build.
 */
var BLOCKING_BUCK_COMMAND_QUEUE_PREFIX = 'buck';

/**
 * Represents a Buck project on disk. All Buck commands for a project should be
 * done through an instance of this class.
 *
 * TODO(hansonw): This should be a stateless set of global functions.
 * In the meantime, don't introduce any additional state here.
 */

var BuckProject = (function () {

  /**
   * @param options.rootPath Absolute path to the directory that contains the
   *     .buckconfig file to configure the project.
   */

  function BuckProject(options) {
    _classCallCheck(this, BuckProject);

    this._rootPath = options.rootPath;
    this._serialQueueName = BLOCKING_BUCK_COMMAND_QUEUE_PREFIX + this._rootPath;
  }

  _createClass(BuckProject, [{
    key: 'dispose',
    value: function dispose() {
      // This method is required by the service framework.
    }
  }, {
    key: 'getPath',
    value: function getPath() {
      return Promise.resolve(this._rootPath);
    }

    /**
     * Given a file path, returns path to the Buck project root i.e. the directory containing
     * '.buckconfig' file.
     */
  }, {
    key: 'getBuildFile',

    /**
     * Gets the build file for the specified target.
     */
    value: _asyncToGenerator(function* (targetName) {
      try {
        var result = yield this.query('buildfile(' + targetName + ')');
        if (result.length === 0) {
          return null;
        }
        return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(this._rootPath, result[0]);
      } catch (e) {
        logger.error('No build file for target "' + targetName + '" ' + e);
        return null;
      }
    })

    /**
     * @param args Do not include 'buck' as the first argument: it will be added
     *     automatically.
     */
  }, {
    key: '_runBuckCommandFromProjectRoot',
    value: function _runBuckCommandFromProjectRoot(args, commandOptions) {
      var _getBuckCommandAndOptions2 = this._getBuckCommandAndOptions(commandOptions);

      var pathToBuck = _getBuckCommandAndOptions2.pathToBuck;
      var options = _getBuckCommandAndOptions2.buckCommandOptions;

      logger.debug('Buck command:', pathToBuck, args, options);
      return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).checkOutput)(pathToBuck, args, options);
    }

    /**
     * @return The path to buck and set of options to be used to run a `buck` command.
     */
  }, {
    key: '_getBuckCommandAndOptions',
    value: function _getBuckCommandAndOptions() {
      var commandOptions = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      // $UPFixMe: This should use nuclide-features-config
      var pathToBuck = global.atom && global.atom.config.get('nuclide.nuclide-buck.pathToBuck') || 'buck';
      var buckCommandOptions = _extends({
        cwd: this._rootPath,
        queueName: this._serialQueueName
      }, commandOptions);
      return { pathToBuck: pathToBuck, buckCommandOptions: buckCommandOptions };
    }

    /**
     * Returns an array of strings (that are build targets) by running:
     *
     *     buck audit owner <path>
     *
     * @param filePath absolute path or a local or a remote file.
     * @return Promise that resolves to an array of build targets.
     */
  }, {
    key: 'getOwner',
    value: _asyncToGenerator(function* (filePath) {
      var args = ['audit', 'owner', filePath];
      var result = yield this._runBuckCommandFromProjectRoot(args);
      var stdout = result.stdout.trim();
      if (stdout === '') {
        return [];
      }
      return stdout.split('\n');
    })

    /**
     * Reads the configuration file for the Buck project and returns the requested property.
     *
     * @param section Section in the configuration file.
     * @param property Configuration option within the section.
     *
     * @return Promise that resolves to the value, if it is set, else `null`.
     */
  }, {
    key: 'getBuckConfig',
    value: _asyncToGenerator(function* (section, property) {
      var buckConfig = this._buckConfig;
      if (!buckConfig) {
        buckConfig = this._buckConfig = yield this._loadBuckConfig();
      }
      if (!buckConfig.hasOwnProperty(section)) {
        return null;
      }
      var sectionConfig = buckConfig[section];
      if (!sectionConfig.hasOwnProperty(property)) {
        return null;
      }
      return sectionConfig[property];
    })

    /**
     * TODO(natthu): Also load .buckconfig.local. Consider loading .buckconfig from the home directory
     * and ~/.buckconfig.d/ directory.
     */
  }, {
    key: '_loadBuckConfig',
    value: _asyncToGenerator(function* () {
      var ini = require('ini');
      var header = 'scope = global\n';
      var buckConfigContent = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.readFile((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(this._rootPath, '.buckconfig'));
      return ini.parse(header + buckConfigContent);
    })

    /**
     * Runs `buck build --keep-going --build-report <tempfile>` with the specified targets. Regardless
     * whether the build is successful, this returns the parsed version of the JSON report
     * produced by the {@code --build-report} option:
     * http://facebook.github.io/buck/command/build.html.
     *
     * An error should be thrown only if the specified targets are invalid.
     * @return Promise that resolves to a build report.
     */
  }, {
    key: 'build',
    value: function build(buildTargets, options) {
      return this._build(buildTargets, options || {});
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
  }, {
    key: 'install',
    value: function install(buildTargets, simulator, runOptions) {
      return this._build(buildTargets, { install: true, simulator: simulator, runOptions: runOptions });
    }
  }, {
    key: '_build',
    value: _asyncToGenerator(function* (buildTargets, options) {
      var report = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.tempfile({ suffix: '.json' });
      var args = this._translateOptionsToBuckBuildArgs({
        baseOptions: _extends({}, options),
        pathToBuildReport: report,
        buildTargets: buildTargets
      });

      try {
        yield this._runBuckCommandFromProjectRoot(args, options.commandOptions);
      } catch (e) {
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
    })

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
  }, {
    key: 'buildWithOutput',
    value: function buildWithOutput(buildTargets, extraArguments) {
      return this._buildWithOutput(buildTargets, { extraArguments: extraArguments });
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
  }, {
    key: 'testWithOutput',
    value: function testWithOutput(buildTargets, extraArguments) {
      return this._buildWithOutput(buildTargets, { test: true, extraArguments: extraArguments });
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
  }, {
    key: 'installWithOutput',
    value: function installWithOutput(buildTargets, extraArguments, simulator, runOptions) {
      return this._buildWithOutput(buildTargets, {
        install: true,
        simulator: simulator,
        runOptions: runOptions,
        extraArguments: extraArguments
      });
    }

    /**
     * Does a build/install.
     * @return An Observable that returns output from buck, as described by the
     *   docblocks for `buildWithOutput` and `installWithOutput`.
     */
  }, {
    key: '_buildWithOutput',
    value: function _buildWithOutput(buildTargets, options) {
      var args = this._translateOptionsToBuckBuildArgs({
        baseOptions: _extends({}, options),
        buildTargets: buildTargets
      });

      var _getBuckCommandAndOptions3 = this._getBuckCommandAndOptions();

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
  }, {
    key: '_translateOptionsToBuckBuildArgs',
    value: function _translateOptionsToBuckBuildArgs(options) {
      var baseOptions = options.baseOptions;
      var pathToBuildReport = options.pathToBuildReport;
      var buildTargets = options.buildTargets;
      var install = baseOptions.install;
      var simulator = baseOptions.simulator;
      var test = baseOptions.test;
      var extraArguments = baseOptions.extraArguments;

      var runOptions = baseOptions.runOptions || { run: false };

      var args = [test ? 'test' : install ? 'install' : 'build'];
      args = args.concat(buildTargets);

      args.push('--keep-going');
      if (pathToBuildReport) {
        args = args.concat(['--build-report', pathToBuildReport]);
      }
      if (install) {
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
  }, {
    key: 'listAliases',
    value: _asyncToGenerator(function* () {
      var args = ['audit', 'alias', '--list'];
      var result = yield this._runBuckCommandFromProjectRoot(args);
      var stdout = result.stdout.trim();
      return stdout ? stdout.split('\n') : [];
    })

    /**
     * Currently, if `aliasOrTarget` contains a flavor, this will fail.
     */
  }, {
    key: 'resolveAlias',
    value: _asyncToGenerator(function* (aliasOrTarget) {
      var args = ['targets', '--resolve-alias', aliasOrTarget];
      var result = yield this._runBuckCommandFromProjectRoot(args);
      return result.stdout.trim();
    })

    /**
     * Currently, if `aliasOrTarget` contains a flavor, this will fail.
     *
     * @return Promise resolves to absolute path to output file
     */
  }, {
    key: 'outputFileFor',
    value: _asyncToGenerator(function* (aliasOrTarget) {
      var args = ['targets', '--show-output', aliasOrTarget];
      var result = yield this._runBuckCommandFromProjectRoot(args);
      var stdout = result.stdout.trim();
      if (stdout.indexOf(' ') !== -1) {
        var relativePath = stdout.split(' ')[1];
        return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.resolve(this._rootPath, relativePath);
      } else {
        return null;
      }
    })
  }, {
    key: 'buildRuleTypeFor',
    value: _asyncToGenerator(function* (aliasOrTarget) {
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
      var result = yield this._runBuckCommandFromProjectRoot(args);
      var json = JSON.parse(result.stdout);
      // If aliasOrTarget is an alias, targets[0] will be the fully qualified build target.
      var targets = Object.keys(json);
      // "target:" rules build all rules in that particular BUCK file.
      // Let's just choose the first one.
      if (!targets || !canonicalName.endsWith(':') && targets.length !== 1) {
        throw new Error('Error determining rule type of \'' + aliasOrTarget + '\'.');
      }
      return json[targets[0]]['buck.type'];
    })
  }, {
    key: 'getHTTPServerPort',
    value: _asyncToGenerator(function* () {
      var args = ['server', 'status', '--json', '--http-port'];
      var result = yield this._runBuckCommandFromProjectRoot(args);
      var json = JSON.parse(result.stdout);
      return json['http.port'];
    })

    /** Runs `buck query --json` with the specified query. */
  }, {
    key: 'query',
    value: _asyncToGenerator(function* (_query) {
      var args = ['query', '--json', _query];
      var result = yield this._runBuckCommandFromProjectRoot(args);
      var json = JSON.parse(result.stdout);
      return json;
    })

    /**
     * Runs `buck query --json` with a query that contains placeholders and therefore expects
     * arguments.
     * @param query Should contain '%s' placeholders.
     * @param args Should be a list of build targets or aliases. The query will be run for each arg.
     *   It will be substituted for '%s' when it is run.
     * @return object where each arg in args will be a key. Its corresponding value will be the list
     *   of matching build targets in its results.
     */
  }, {
    key: 'queryWithArgs',
    value: _asyncToGenerator(function* (query, args) {
      var completeArgs = ['query', '--json', query].concat(args);
      var result = yield this._runBuckCommandFromProjectRoot(completeArgs);
      var json = JSON.parse(result.stdout);

      // `buck query` does not include entries in the JSON for params that did not match anything. We
      // massage the output to ensure that every argument has an entry in the output.
      for (var arg of args) {
        if (!json.hasOwnProperty(arg)) {
          json[arg] = [];
        }
      }
      return json;
    })

    // TODO: Nuclide's RPC framework won't allow BuckWebSocketMessage here unless we cover
    // all possible message types. For now, we'll manually typecast at the callsite.
  }, {
    key: 'getWebSocketStream',
    value: function getWebSocketStream(httpPort) {
      return (0, (_createBuckWebSocket2 || _createBuckWebSocket()).default)(this, httpPort);
    }
  }], [{
    key: 'getRootForPath',
    value: function getRootForPath(file) {
      return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findNearestFile('.buckconfig', file);
    }
  }]);

  return BuckProject;
})();

exports.BuckProject = BuckProject;

// The service framework doesn't support imported types
/*AsyncExecuteOptions*/