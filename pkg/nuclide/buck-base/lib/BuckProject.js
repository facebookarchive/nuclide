'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class BuckProject {

  getPath(): Promise<NuclideUri> {
    return Promise.reject('Not implemented');
  }

  /**
   * Returns an array of strings (that are build targets) by running:
   *
   *     buck audit owner <path>
   *
   * @param filePath absolute path or a local or a remote file.
   * @return Promise that resolves to an array of build targets.
   */
  getOwner(filePath: NuclideUri): Promise<Array<string>> {
    return Promise.reject('Not implemented');
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
  build(buildTargets: Array<string> | string): Promise<any> {
    return Promise.reject('Not implemented');
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
  install(buildTargets: Array<string> | string, run: boolean, debug: boolean, simulator: ?string): Promise<any> {
    return Promise.reject('Not implemented');
  }

  findTargetsWithReferencedFile(filePath: NuclideUri, options: any): Promise<{json: any; targets: Array<any>}> {
    return Promise.reject('Not implemented');
  }

  listAliases(): Promise<Array<string>> {
    return Promise.reject('Not implemented');
  }

  resolveAlias(aliasOrTarget: string): Promise<string> {
    return Promise.reject('Not implemented');
  }

  outputFileFor(aliasOrTarget: string): Promise<?string> {
    return Promise.reject('Not implemented');
  }

  buildRuleTypeFor(aliasOrTarget: string): Promise<string> {
    return Promise.reject('Not implemented');
  }

  getServerPort(): Promise<number> {
    return Promise.reject('Not implemented');
  }
}

module.exports = BuckProject;
