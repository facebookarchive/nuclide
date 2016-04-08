'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {instrumentConsole} from './console';

type TestRunnerParams = {
  /** Absolute paths to tests to run. Could be paths to files or directories. */
  testPaths: Array<string>;

  /** A boolean indicating whether or not the tests are running headless. */
  headless: boolean;

  /** Creates the `atom` global object. */
  buildAtomEnvironment: (params: BuildAtomEnvironmentParams) => AtomGlobal;

  /** Currently undocumnted, but seemingly necessary to use buildAtomEnvironment(). */
  buildDefaultApplicationDelegate: () => Object;

  /** An optional path to a log file to which test output should be logged. */
  logFile: ?string;

  /** Unclear what the contract of this is, but we will not be using it. */
  legacyTestRunner: () => void;
};

type BuildAtomEnvironmentParams = {
  applicationDelegate: Object;
  window: Object;
  document: Object;
  configDirPath?: string;
  enablePersistence?: boolean;
};

export type ExitCode = number;

/* eslint-disable no-console */
export default async function runTest(params: TestRunnerParams): Promise<ExitCode> {
  // Verify that a --log-file argument has been specified.
  const {logFile} = params;
  if (logFile == null) {
    console.error('Must specify arguments via --log-file.');
    return 1;
  }

  // Parse the args passed as JSON.
  let args;
  try {
    args = JSON.parse(logFile);
  } catch (e) {
    console.error(`Failed to parse --log-file argument: ${logFile}`);
    return 1;
  }

  // Set global.atom before running any more code.
  const applicationDelegate = params.buildDefaultApplicationDelegate();
  const atomEnvParams = {
    applicationDelegate,
    window,
    document,
  };
  global.atom = params.buildAtomEnvironment(atomEnvParams);

  // Set up the console before running any user code.
  instrumentConsole(args['stdout']);

  const pathArg = args['path'];
  if (typeof pathArg !== 'string') {
    console.error('Must specify a path in the --log-file JSON');
    return 1;
  }

  const entryPoint = args['path'];
  // $FlowFixMe: entryPoint is determined dynamically rather than a string literal.
  const handler = require(entryPoint);

  try {
    return await handler(args['args']);
  } catch (e) {
    console.error(e);
    return 1;
  }
}
/* eslint-enable no-console */
