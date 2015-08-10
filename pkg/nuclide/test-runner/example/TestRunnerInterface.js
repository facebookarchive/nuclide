'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type TestClassSummary = {
  className: string;
  fileName: string;
  id: number;
  name: string;
};

type TestRunInfo = {
  children: Array<TestRunInfo>;
  details: string;
  durationSecs: number;
  endedTime: number;
  name: string;
  numAssertions: number;
  numFailures: number;
  numMethods: number;
  numSkipped: number;
  status: number;
  summary: string;
  test_id: number;
  test_json: TestClassSummary;
};

/**
 * Objects returned from `getByUri` should implement the functions outlined in this interface. The
 * runner is reponsible for handling request/run IDs.
 */
class TestRunnerInterface {

  /**
   * Calls `callback` when testing process is successfully spawned.
   *
   * @returns a `Disposable` on which `dispose` can be called to stop listening to this event.
   */
  onDidStart(callback: (runId: number) => mixed): atom$IDisposable {
    throw new Error('`onDidStart` not implemented');
  }

  /**
   * Calls `callback` when stdout output from the testing process is parseable as a summary of the
   * test classes that will be run. If available, this will trigger before any test classes are run.
   * This fires at most 1 time for a given test run.
   *
   * @returns a `Disposable` on which `dispose` can be called to stop listening to this event.
   */
  onDidRunSummary(
    callback: (info: {runId: number; summaryInfo: Array<TestClassSummary>;}) => mixed
  ): atom$IDisposable {
    throw new Error('`onDidRunSummary` not implemented');
  }

  /**
   * Calls `callback` when stdout output from the testing process is parseable as a run of a single
   * test class.
   *
   * @returns a `Disposable` on which `dispose` can be called to stop listening to this event.
   */
  onDidRunTest(callback: (info: {runId: number; testInfo: TestRunInfo;}) => mixed): atom$IDisposable {
    throw new Error('`onDidRunTest` not implemented');
  }

  /**
   * Calls `callback` when data is written to stderr by the testing process.
   *
   * @returns a `Disposable` on which `dispose` can be called to stop listening to this event.
   */
  onStderrData(callback: (info: {runId: number; data: string;}) => mixed): atom$IDisposable {
    throw new Error('`onStderrData` not implemented');
  }

  /**
   * Calls `callback` when data is written to stdout by the testing process that is not otherwise
   * parseable as a `TestClassSummary` or a `TestRunInfo`. Only one of `onStdoutData`,
   * `onDidRunSummary`, and `onDidRunTest` should be called for a given line of output.
   *
   * @returns a `Disposable` on which `dispose` can be called to stop listening to this event.
   */
  onStdoutData(callback: (info: {runId: number; data: string;}) => mixed): atom$IDisposable {
    throw new Error('`onStdoutData` not implemented');
  }

  /**
   * Calls `callback` when an unhandled error occurs with the testing process. Further output from
   * the testing process is ignored after an error event.
   *
   * @returns a `Disposable` on which `dispose` can be called to stop listening to this event.
   */
  onError(callback: (info: {error: Object; runId: number;}) => mixed): atom$IDisposable {
    throw new Error('`onError` not implemented');
  }

  /**
   * Calls `callback` when the testing ends. This can occur if the testing process runs to
   * completion, or `kill` is called on the process.
   *
   * @returns a `Disposable` on which `dispose` can be called to stop listening to this event.
   */
  onDidEnd(callback: (runId: number) => mixed): atom$IDisposable {
    throw new Error('`onDidEnd` not implemented');
  }

  /**
   * Runs tests for `path`.
   *
   * Resolves to the ID assigned to this test run that will be returned in all events that
   * originate from this test run to enable the client to associate events with runs.
   */
  run(path: string): Promise<number> {
    throw new Error('`run` not implemented');
  }

  /**
   * Stops the test run with `runId`.
   *
   * Resolves to `true` if the given test run ID was found and signalled to stop, otherwise `false`.
   */
  stop(runId: number): Promise<boolean> {
    throw new Error('`stop` not implemented');
  }

}

module.exports = TestRunnerInterface;
