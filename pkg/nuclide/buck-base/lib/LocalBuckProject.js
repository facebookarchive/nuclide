'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {asyncExecute} = require('nuclide-commons');
var {fsPromise} = require('nuclide-commons');
var logger = require('nuclide-logging').getLogger();
var path = require('path');
var BuckProject = require('./BuckProject');

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
class LocalBuckProject extends BuckProject {

  /**
   * @param options.rootPath Absolute path to the directory that contains the
   *     .buckconfig file to configure the project.
   */
  constructor(options: {rootPath: string}) {
    super();
    this._rootPath = options.rootPath;
    this._serialQueueName = BLOCKING_BUCK_COMMAND_QUEUE_PREFIX + this._rootPath;
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
  async _runBuckCommandFromProjectRoot(args: array<string>
      ): Promise<{stdout: string; stderr: string; exitCode: number}> {
    if (global.atom) {
      var pathToBuck = atom.config.get('buck.pathToBuck');
    } else {
      var pathToBuck = 'buck';
    }
    var options = {
      cwd: this._rootPath,
      queueName: this._serialQueueName,
    };
    logger.debug('Buck command:', pathToBuck, args, options);
    return asyncExecute(pathToBuck, args, options);
  }

  async getOwner(filePath: string): Promise<Array<string>> {
    var args = ['audit', 'owner', filePath];
    var result = await this._runBuckCommandFromProjectRoot(args);
    var stdout = result.stdout;
    var targets = stdout.trim().split('\n');
    return targets;
  }

  async build(buildTargets: Array<string> | string): Promise<any> {
    if (typeof buildTargets === 'string') {
      buildTargets = [buildTargets];
    }

    var report = await fsPromise.tempfile({suffix: '.json'});
    var args = ['build', '--keep-going', '--build-report', report];
    buildTargets.forEach(target => args.push(target));

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

      var buildReport;
      try {
        buildReport = JSON.parse(json);
      } catch (e) {
        throw Error(`Failed to parse:\n${json}`);
      }

      // Until a top-level "success" property is added to Buck build reports by
      // default, we will add our own for convenience.
      buildReport['success'] = require('./utils').isBuildSuccessful(buildReport);
      return buildReport;
    } finally {
      fsPromise.unlink(report);
    }
  }

  /**
   * @param filePath absolute path.
   */
  async findTargetsWithReferencedFile(filePath: string, options: any): Promise {
    var args = ['targets', '--referenced_file', filePath];

    var type = options['type'];
    if (type) {
      args.push('--type');
      type.forEach((buildRuleType) => args.push(buildRuleType));
    }

    args.push('--json');

    var result = await this._runBuckCommandFromProjectRoot(args);

    result.json = JSON.parse(result.stdout || '[]');
    // TODO(mbolin): The target should be a field in the JSON.
    result.targets = result.json.map((targetData) => {
      return '//' + targetData['buck.base_path'] + ':' + targetData['name'];
    });

    return result;
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
    var args = ['targets', '--json', aliasOrTarget];
    var result = await this._runBuckCommandFromProjectRoot(args);
    var json: Array<Object> = JSON.parse(result.stdout.trim());
    return json[0]['buck.type'];
  }

  async getServerPort(): Promise<number> {
    var args = ['server', 'status', '--json', '--http-port'];
    var result = await this._runBuckCommandFromProjectRoot(args);
    var json: Object = JSON.parse(result.stdout);
    return json['http.port'];
  }
}

module.exports = LocalBuckProject
