'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This file is transpiled by Atom - not by nuclide-node-transpiler.

import temp from 'temp';
temp.track();

// http://flight-manual.atom.io/hacking-atom/sections/writing-specs/#customizing-your-test-runner
type TestRunnerParams = {
  testPaths: Array<string>;
  buildAtomEnvironment: (params: BuildAtomEnvironmentParams) => AtomGlobal;
  buildDefaultApplicationDelegate: () => Object;
  logFile: ?string;
  headless: boolean;
  legacyTestRunner: (params: LegacyTestRunnerParams) => Promise<number>;
};

// https://github.com/atom/atom/blob/v1.6.2/spec/jasmine-test-runner.coffee
type LegacyTestRunnerParams = {
  logFile: ?string;
  headless: boolean;
  testPaths: Array<string>;
  buildAtomEnvironment: (params: BuildAtomEnvironmentParams) => AtomGlobal;
};

type BuildAtomEnvironmentParams = {
  applicationDelegate: Object;
  window: Object;
  document: Object;
  configDirPath?: string;
  enablePersistence?: boolean;
};

export default async function(params: TestRunnerParams): Promise<number> {
  const statusCode = await params.legacyTestRunner({
    logFile: params.logFile,
    headless: params.headless,
    testPaths: params.testPaths,
    buildAtomEnvironment(buildEnvParams) {
      // TODO(asuarez): Investigate if this is still needed.
      buildEnvParams.configDirPath = temp.mkdirSync('atom_home');
      const atomGlobal = params.buildAtomEnvironment(buildEnvParams);

      jasmine.getEnv().beforeEach(() => {
        // Ensure 3rd-party packages are not installed via the
        // 'atom-package-deps' package when the 'nuclide' package is activated.
        // They are assumed to be already in ~/.atom/packages. js_test_runner.py
        // handles installing them during automated testing.
        atomGlobal.config.set('nuclide.installRecommendedPackages', false);
      });

      return atomGlobal;
    },
  });

  // Atom intercepts "process.exit" so we have to do our own manual cleanup.
  temp.cleanupSync();

  return statusCode;
}
