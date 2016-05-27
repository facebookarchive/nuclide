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
// `require` is used here to avoid `import` hoisting load other issues.
// Patch Atom's transpiler to ensure that our transforms are applied to tests:
require('./internal/atom-babel-compiler-patcher');

import type {TestRunnerParams, ExitCode} from './types';

const path = require('path');
const temp = require('temp');
temp.track();

const integrationTestsDir = path.join(__dirname, '../spec');

export default async function(params: TestRunnerParams): Promise<ExitCode> {
  const isIntegrationTest = params.testPaths
    .some(testPath => testPath.startsWith(integrationTestsDir));

  const statusCode = await params.legacyTestRunner({
    logFile: params.logFile,
    headless: params.headless,
    testPaths: params.testPaths,
    buildAtomEnvironment(buildEnvParams) {
      const atomGlobal = params.buildAtomEnvironment(buildEnvParams);

      if (isIntegrationTest) {
        jasmine.getEnv().beforeEach(() => {
          // Ensure 3rd-party packages are not installed via the
          // 'atom-package-deps' package when the 'nuclide' package is activated.
          // They are assumed to be already in ~/.atom/packages. js_test_runner.py
          // handles installing them during automated testing.
          atomGlobal.config.set('nuclide.installRecommendedPackages', false);
        });
      }

      return atomGlobal;
    },
  });

  // Atom intercepts "process.exit" so we have to do our own manual cleanup.
  temp.cleanupSync();

  return statusCode;
}
