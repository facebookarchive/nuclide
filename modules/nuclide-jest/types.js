/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

type ConsoleBuffer = Array<LogEntry>;

type LogMessage = string;
type LogEntry = {|
  message: LogMessage,
  origin: string,
  type: LogType,
|};

type LogType =
  | 'assert'
  | 'count'
  | 'debug'
  | 'dir'
  | 'dirxml'
  | 'error'
  | 'group'
  | 'groupCollapsed'
  | 'info'
  | 'log'
  | 'time'
  | 'warn';

type SerializableError = {|
  code?: mixed,
  message: string,
  stack: ?string,
  type?: string,
|};

type RawFileCoverage = {|
  path: string,
  s: {[statementId: number]: number},
  b: {[branchId: number]: number},
  f: {[functionId: number]: number},
  l: {[lineId: number]: number},
  fnMap: {[functionId: number]: any},
  statementMap: {[statementId: number]: any},
  branchMap: {[branchId: number]: any},
  inputSourceMap?: Object,
|};

type RawCoverage = {
  [filePath: string]: RawFileCoverage,
};

type Bytes = number;
type Milliseconds = number;

export type TestResult = {|
  console: ?ConsoleBuffer,
  coverage?: RawCoverage,
  displayName: ?string,
  failureMessage: ?string,
  leaks: boolean,
  memoryUsage?: Bytes,
  numFailingTests: number,
  numPassingTests: number,
  numPendingTests: number,
  perfStats: {|
    end: Milliseconds,
    start: Milliseconds,
  |},
  skipped: boolean,
  snapshot: {|
    added: number,
    fileDeleted: boolean,
    matched: number,
    unchecked: number,
    uncheckedKeys: Array<string>,
    unmatched: number,
    updated: number,
  |},
  sourceMaps: {[sourcePath: string]: string},
  testExecError?: SerializableError,
  testFilePath: string,
  testResults: Array<AssertionResult>,
|};

type Callsite = {|
  column: number,
  line: number,
|};

type Status = 'passed' | 'failed' | 'skipped' | 'pending';

export type AssertionResult = {|
  ancestorTitles: Array<string>,
  duration?: ?Milliseconds,
  failureMessages: Array<string>,
  fullName: string,
  location: ?Callsite,
  numPassingAsserts: number,
  status: Status,
  title: string,
|};

export type AggregatedResults = {|
  numFailedTests: number,
  numFailedTestSuites: number,
  numPassedTests: number,
  numPassedTestSuites: number,
  numPendingTests: number,
  numPendingTestSuites: number,
  numRuntimeErrorTestSuites: number,
  numTotalTests: number,
  numTotalTestSuites: number,
  snapshot: SnapshotSummary,
  startTime: number,
  success: boolean,
  testResults: Array<TestResult>,
  wasInterrupted: boolean,
|};

type SnapshotSummary = {|
  added: number,
  didUpdate: boolean,
  failure: boolean,
  filesAdded: number,
  filesRemoved: number,
  filesUnmatched: number,
  filesUpdated: number,
  matched: number,
  total: number,
  unchecked: number,
  uncheckedKeys: Array<string>,
  unmatched: number,
  updated: number,
|};
