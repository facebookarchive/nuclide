'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

const {asyncExecute, scriptSafeSpawnAndObserveOutput} = require('../../nuclide-commons');
const {fsPromise} = require('../../nuclide-commons');
const logger = require('../../nuclide-logging').getLogger();
const path = require('path');

export type dontRunOptions = {
  run: false;
};

export type doRunOptions = {
  run: true;
  debug: boolean;
  appArgs: Array<string>;
};

export type BuckRunOptions = dontRunOptions | doRunOptions;

type BuckConfig = Object;
type BaseBuckBuildOptions = {
  install?: boolean;
  test?: boolean;
  simulator?: ?string;
  runOptions?: ?BuckRunOptions;
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
import type {Observable} from 'rxjs';

/**
 * As defined in com.facebook.buck.cli.Command, some of Buck's subcommands are
 * read-only. The read-only commands can be executed in parallel, but the rest
 * must be executed serially.
 *
 * TODO(mbolin): This does not account for the case where the user runs
 * `buck build` from the command line while Nuclide is also trying to build.
 */
const BLOCKING_BUCK_COMMAND_QUEUE_PREFIX = 'buck';

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

  dispose(): void {
    // This method is required by the service framework.
  }

  getPath(): Promise<NuclideUri> {
    return Promise.resolve(this._rootPath);
  }

  /**
   * Gets the build file for the specified target.
   */
  async getBuildFile(targetName: string): Promise<?string> {
    try {
      const result = await this.query(`buildfile(${targetName})`);
      if (result.length === 0) {
        return null;
      }
      return path.join(this._rootPath, result[0]);
    } catch (e) {
      logger.error(`No build file for target ${targetName}`, e);
      return null;
    }
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
    const {pathToBuck, buckCommandOptions: options} = this._getBuckCommandAndOptions();
    logger.debug('Buck command:', pathToBuck, args, options);
    return asyncExecute(pathToBuck, args, options);
  }

  /**
   * @return The path to buck and set of options to be used to run a `buck` command.
   */
  _getBuckCommandAndOptions(): BuckCommandAndOptions {
    // $UPFixMe: This should use nuclide-features-config
    const pathToBuck =
      global.atom && global.atom.config.get('nuclide.nuclide-buck-files.pathToBuck') || 'buck';
    const buckCommandOptions = {
      cwd: this._rootPath,
      queueName: this._serialQueueName,
    };
    return {pathToBuck, buckCommandOptions};
  }

  /**
   * Returns an array of strings (that are build targets) by running:
   *
   *     buck audit owner <path>
   *
   * @param filePath absolute path or a local or a remote file.
   * @return Promise that resolves to an array of build targets.
   */
  async getOwner(filePath: NuclideUri): Promise<Array<string>> {
    const args = ['audit', 'owner', filePath];
    const result = await this._runBuckCommandFromProjectRoot(args);
    const stdout = result.stdout.trim();
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
  async getBuckConfig(section: string, property: string): Promise<?string> {
    let buckConfig = this._buckConfig;
    if (!buckConfig) {
      buckConfig = this._buckConfig = await this._loadBuckConfig();
    }
    if (!buckConfig.hasOwnProperty(section)) {
      return null;
    }
    const sectionConfig = buckConfig[section];
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
    const ini = require('ini');
    const header = 'scope = global\n';
    const buckConfigContent = await fsPromise.readFile(path.join(this._rootPath, '.buckconfig'));
    return ini.parse(header + buckConfigContent);
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
  build(buildTargets: Array<string>): Promise<any> {
    return this._build(buildTargets, {});
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
   * @param appArgs If 'run' is set to 'true', these are passed as the command line arguments to
   *   the application being run.
   * @return Promise that resolves to a build report.
   */
  install(
    buildTargets: Array<string>,
    simulator: ?string,
    runOptions: ?BuckRunOptions
  ): Promise<any> {
    return this._build(buildTargets, {install: true, simulator, runOptions});
  }

  async _build(buildTargets: Array<string>, options: BaseBuckBuildOptions): Promise<any> {
    const report = await fsPromise.tempfile({suffix: '.json'});
    const args = this._translateOptionsToBuckBuildArgs({
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
      const fileWasWritten = await fsPromise.exists(report);
      if (!fileWasWritten) {
        throw e;
      }
    }

    try {
      const json: string = await fsPromise.readFile(report, {encoding: 'UTF-8'});
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
  buildWithOutput(
    buildTargets: Array<string>
  ): Observable<{stderr?: string; stdout?: string;}> {
    return this._buildWithOutput(buildTargets, {});
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
  testWithOutput(
    buildTargets: Array<string>
  ): Observable<{stderr?: string; stdout?: string;}> {
    return this._buildWithOutput(buildTargets, {test: true});
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
  installWithOutput(
    buildTargets: Array<string>,
    simulator: ?string,
    runOptions: ?BuckRunOptions,
  ): Observable<{stderr?: string; stdout?: string;}> {
    return this._buildWithOutput(buildTargets, {install: true, simulator, runOptions});
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
    const args = this._translateOptionsToBuckBuildArgs({
      baseOptions: {...options},
      buildTargets,
    });
    const {pathToBuck, buckCommandOptions} = this._getBuckCommandAndOptions();

    return scriptSafeSpawnAndObserveOutput(pathToBuck, args, buckCommandOptions);
  }

  /**
   * @param options An object describing the desired buck build operation.
   * @return An array of strings that can be passed as `args` to spawn a
   *   process to run the `buck` command.
   */
  _translateOptionsToBuckBuildArgs(options: FullBuckBuildOptions): Array<string> {
    const {
      baseOptions,
      pathToBuildReport,
      buildTargets,
    } = options;
    const {
      install,
      simulator,
      test,
    } = baseOptions;
    const runOptions = baseOptions.runOptions || {run: false};

    let args = [test ? 'test' : (install ? 'install' : 'build')];
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
        if (runOptions.appArgs) {
          args.push('--');
          args = args.concat(runOptions.appArgs);
        }
      }
    }
    return args;
  }

  async listAliases(): Promise<Array<string>> {
    const args = ['audit', 'alias', '--list'];
    const result = await this._runBuckCommandFromProjectRoot(args);
    const stdout = result.stdout.trim();
    return stdout ? stdout.split('\n') : [];
  }

  /**
   * Currently, if `aliasOrTarget` contains a flavor, this will fail.
   */
  async resolveAlias(aliasOrTarget: string): Promise<string> {
    const args = ['targets', '--resolve-alias', aliasOrTarget];
    const result = await this._runBuckCommandFromProjectRoot(args);
    return result.stdout.trim();
  }

  /**
   * Currently, if `aliasOrTarget` contains a flavor, this will fail.
   *
   * @return Promise resolves to absolute path to output file
   */
  async outputFileFor(aliasOrTarget: string): Promise<?string> {
    const args = ['targets', '--show-output', aliasOrTarget];
    const result = await this._runBuckCommandFromProjectRoot(args);
    const stdout = result.stdout.trim();
    if (stdout.indexOf(' ') !== -1) {
      const relativePath = stdout.split(' ')[1];
      return path.resolve(this._rootPath, relativePath);
    } else {
      return null;
    }
  }

  /**
   * Currently, if `aliasOrTarget` contains a flavor, this will fail.
   */
  async buildRuleTypeFor(aliasOrTarget: string): Promise<string> {
    const args = ['query', aliasOrTarget, '--json', '--output-attributes', 'buck.type'];
    const result = await this._runBuckCommandFromProjectRoot(args);
    const json: {[target: string]: Object} = JSON.parse(result.stdout);
    // If aliasOrTarget is an alias, targets[0] will be the fully qualified build target.
    const targets = Object.keys(json);
    if (!targets || targets.length !== 1) {
      throw new Error(`Error determining rule type of '${aliasOrTarget}'.`);
    }
    return json[targets[0]]['buck.type'];
  }

  async getServerPort(): Promise<number> {
    const args = ['server', 'status', '--json', '--http-port'];
    const result = await this._runBuckCommandFromProjectRoot(args);
    const json: Object = JSON.parse(result.stdout);
    return json['http.port'];
  }

  /** Runs `buck query --json` with the specified query. */
  async query(query: string): Promise<Array<string>> {
    const args = ['query', '--json', query];
    const result = await this._runBuckCommandFromProjectRoot(args);
    const json: Array<string> = JSON.parse(result.stdout);
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
  async queryWithArgs(
    query: string,
    args: Array<string>,
  ): Promise<{[aliasOrTarget: string]: Array<string>}> {
    const completeArgs = ['query', '--json', query].concat(args);
    const result = await this._runBuckCommandFromProjectRoot(completeArgs);
    const json: {[aliasOrTarget: string]: Array<string>} = JSON.parse(result.stdout);

    // `buck query` does not include entries in the JSON for params that did not match anything. We
    // massage the output to ensure that every argument has an entry in the output.
    for (const arg of args) {
      if (!json.hasOwnProperty(arg)) {
        json[arg] = [];
      }
    }
    return json;
  }
}
