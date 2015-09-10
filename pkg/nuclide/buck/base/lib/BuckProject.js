'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {asyncExecute, scriptSafeSpawn} = require('nuclide-commons');
var {fsPromise} = require('nuclide-commons');
var logger = require('nuclide-logging').getLogger();
var path = require('path');
var {Observable} = require('rx');

type BuckConfig = Object;
type BaseBuckBuildOptions = {
  install: boolean;
  run: boolean;
  debug: boolean;
  simulator?: ?string;
};
type FullBuckBuildOptions = {
  baseOptions: BaseBuckBuildOptions;
  pathToBuildReport?: string;
  buildTargets: Array<string>;
};
type BuckCommandAndOptions = {
  pathToBuck: string;
  buckCommandOptions: {
    cwd: string;
    queueName: string;
  };
};
import type {Observer} from 'rx';

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
 */
export class BuckProject {

  _rootPath: string;
  _serialQueueName: string;
  _buckConfig: ?BuckConfig;

  /**
   * @param options.rootPath Absolute path to the directory that contains the
   *     .buckconfig file to configure the project.
   */
  constructor(options: {rootPath: string}) {
    this._rootPath = options.rootPath;
    this._serialQueueName = BLOCKING_BUCK_COMMAND_QUEUE_PREFIX + this._rootPath;
  }

  dispose() {
    // This method is required by the service framework.
  }

  getPath() {
    return Promise.resolve(this._rootPath);
  }

  /**
   * This syntax is not supported yet, but the return type is:
   * Promise<{stdout: string; stderr: string; exitCode: number}>
   *
   * @param args Do not include 'buck' as the first argument: it will be added
   *     automatically.
   */
  _runBuckCommandFromProjectRoot(args: Array<string>
      ): Promise<{stdout: string; stderr: string; exitCode: number}> {
    var {pathToBuck, buckCommandOptions: options} = this._getBuckCommandAndOptions();
    logger.debug('Buck command:', pathToBuck, args, options);
    return asyncExecute(pathToBuck, args, options);
  }

  /**
   * @return The path to buck and set of options to be used to run a `buck` command.
   */
  _getBuckCommandAndOptions(): BuckCommandAndOptions {
    var pathToBuck;
    if (global.atom) {
      pathToBuck = global.atom.config.get('nuclide-buck-files.pathToBuck');
    } else {
      pathToBuck = 'buck';
    }
    var buckCommandOptions = {
      cwd: this._rootPath,
      queueName: this._serialQueueName,
    };
    return {pathToBuck, buckCommandOptions};
  }

  async getOwner(filePath: string): Promise<Array<string>> {
    var args = ['audit', 'owner', filePath];
    var result = await this._runBuckCommandFromProjectRoot(args);
    var stdout = result.stdout;
    var targets = stdout.trim().split('\n');
    return targets;
  }

  async getBuckConfig(section: string, property: string): Promise<?string> {
    var buckConfig = this._buckConfig;
    if (!buckConfig) {
      buckConfig = this._buckConfig = await this._loadBuckConfig();
    }
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
  async _loadBuckConfig(): Promise<BuckConfig> {
    var ini = require('ini');
    var header = 'scope = global\n';
    var buckConfigContent = await fsPromise.readFile(path.join(this._rootPath, '.buckconfig'));
    return ini.parse(header + buckConfigContent);
  }

  build(buildTargets: Array<string>): Promise<any> {
    return this._build(buildTargets, {install: false, run: false, debug: false});
  }

  install(buildTargets: Array<string>, run: boolean, debug: boolean, simulator: ?string): Promise<any> {
    return this._build(buildTargets, {install: true, run, debug, simulator});
  }

  async _build(buildTargets: Array<string>, options: BaseBuckBuildOptions): Promise<any> {
    var report = await fsPromise.tempfile({suffix: '.json'});
    var args = this._translateOptionsToBuckBuildArgs({
      baseOptions: {...options},
      pathToBuildReport: report,
      buildTargets,
    });

    try {
      await this._runBuckCommandFromProjectRoot(args);
    } catch (e) {
      // The build failed. However, because --keep-going was specified, the
      // build report should have still been written unless any of the target
      // args were invalid. We check the existence of the report file to be sure.
      var fileWasWritten = await fsPromise.exists(report);
      if (!fileWasWritten) {
        throw e;
      }
    }

    try {
      var json: string = await fsPromise.readFile(report, {encoding: 'UTF-8'});
      if (!json) {
        throw Error(`Report file ${report} for ${buildTargets} was opened, ` +
            `but nothing was written.`);
      }

      try {
        return JSON.parse(json);
      } catch (e) {
        throw Error(`Failed to parse:\n${json}`);
      }
    } finally {
      fsPromise.unlink(report);
    }
  }

  buildWithOutput(
    buildTargets: Array<string>
  ): Observable<{stderr?: string; stdout?: string;}> {
    return this._buildWithOutput(buildTargets, {install: false, run: false, debug: false});
  }

  installWithOutput(
    buildTargets: Array<string>,
    run: boolean,
    debug: boolean,
    simulator: ?string,
  ): Observable<{stderr?: string; stdout?: string;}> {
    return this._buildWithOutput(buildTargets, {install: true, run, debug, simulator});
  }

  /**
   * Does a build/install.
   * @return An Observable that returns output from buck, as described by the
   *   docblocks for `buildWithOutput` and `installWithOutput`.
   */
  _buildWithOutput(
    buildTargets: Array<string>,
    options: BaseBuckBuildOptions,
  ): Observable<{stderr?: string; stdout?: string;}> {
    var args = this._translateOptionsToBuckBuildArgs({
      baseOptions: {...options},
      buildTargets,
    });
    var {pathToBuck, buckCommandOptions: options} = this._getBuckCommandAndOptions();

    var observable = Observable.create((observer: Observer) => {
      var childProcess;
      scriptSafeSpawn(pathToBuck, args, options).then(proc => {
        childProcess = proc;

        childProcess.stdout.on('data', (data) => {
          observer.onNext({stdout: data.toString()});
        });

        var stderr = '';
        childProcess.stderr.on('data', (data) => {
          stderr += data;
          observer.onNext({stderr: data.toString()});
        });

        childProcess.on('exit', (exitCode: number) => {
          if (exitCode !== 0) {
            observer.onError(stderr);
          } else {
            observer.onCompleted();
          }
          childProcess = null;
        });
      });

      return () => {
        if (childProcess) {
          childProcess.kill();
        }
      };
    });

    return observable;
  }

  /**
   * @param options An object describing the desired buck build operation.
   * @return An array of strings that can be passed as `args` to spawn a
   *   process to run the `buck` command.
   */
  _translateOptionsToBuckBuildArgs(options: FullBuckBuildOptions): Array<string> {
    var {
      baseOptions,
      pathToBuildReport,
      buildTargets,
    } = options;
    var {
      install,
      run,
      debug,
      simulator,
    } = baseOptions;

    var args = install ? ['install'] : ['build'];
    args.push('--keep-going');
    if (pathToBuildReport) {
      args = args.concat(['--build-report', pathToBuildReport]);
    }
    if (install) {
      if (run) {
        args.push('--run');
      }
      if (debug) {
        args.push('--wait-for-debugger');
      }
      if (simulator) {
        args.push('--udid');
        args.push(simulator);
      }
    }
    args = args.concat(buildTargets);
    return args;
  }

  async listAliases(): Promise<Array<string>> {
    var args = ['audit', 'alias', '--list'];
    var result = await this._runBuckCommandFromProjectRoot(args);
    var stdout = result.stdout.trim();
    return stdout ? stdout.split('\n') : [];
  }

  /**
   * Currently, if `aliasOrTarget` contains a flavor, this will fail.
   */
  async resolveAlias(aliasOrTarget: string): Promise<string> {
    var args = ['targets', '--resolve-alias', aliasOrTarget];
    var result = await this._runBuckCommandFromProjectRoot(args);
    return result.stdout.trim();
  }

  /**
   * Currently, if `aliasOrTarget` contains a flavor, this will fail.
   *
   * @return Promise resolves to absolute path to output file
   */
  async outputFileFor(aliasOrTarget: string): Promise<?string> {
    var args = ['targets', '--show-output', aliasOrTarget];
    var result = await this._runBuckCommandFromProjectRoot(args);
    var stdout = result.stdout.trim();
    if (stdout.indexOf(' ') !== -1) {
      var relativePath = stdout.split(' ')[1];
      return path.resolve(this._rootPath, relativePath);
    } else {
      return null;
    }
  }

  /**
   * Currently, if `aliasOrTarget` contains a flavor, this will fail.
   */
  async buildRuleTypeFor(aliasOrTarget: string): Promise<string> {
    var args = ['query', aliasOrTarget, '--json', '--output-attributes', 'buck.type'];
    var result = await this._runBuckCommandFromProjectRoot(args);
    var json: {[target: string]: Object} = JSON.parse(result.stdout);
    // If aliasOrTarget is an alias, targets[0] will be the fully qualified build target.
    var targets = Object.keys(json);
    if (!targets || targets.length !== 1) {
      throw new Error(`Error determining rule type of '${aliasOrTarget}'.`);
    }
    return json[targets[0]]['buck.type'];
  }

  async getServerPort(): Promise<number> {
    var args = ['server', 'status', '--json', '--http-port'];
    var result = await this._runBuckCommandFromProjectRoot(args);
    var json: Object = JSON.parse(result.stdout);
    return json['http.port'];
  }

  async query(query: string): Promise<Array<string>> {
    var args = ['query', '--json', query];
    var result = await this._runBuckCommandFromProjectRoot(args);
    var json: Array<string> = JSON.parse(result.stdout);
    return json;
  }

  async queryWithArgs(query: string, args: Array<string>): Promise<{[aliasOrTarget: string]: Array<string>}> {
    var completeArgs = ['query', '--json', query].concat(args);
    var result = await this._runBuckCommandFromProjectRoot(completeArgs);
    var json: {[aliasOrTarget: string]: Array<string>} = JSON.parse(result.stdout);

    // `buck query` does not include entries in the JSON for params that did not match anything. We
    // massage the output to ensure that every argument has an entry in the output.
    for (var arg of args) {
      if (!json.hasOwnProperty(arg)) {
        json[arg] = [];
      }
    }
    return json;
  }
}
