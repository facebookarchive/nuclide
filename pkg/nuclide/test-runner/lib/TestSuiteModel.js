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

class TestSuiteModel {

  testClasses: Map<number, TestClassSummary>;
  testRuns: Map<number, TestRunInfo>;

  constructor(testClasses: Array<TestClassSummary>) {
    this.testClasses = new Map();
    this.testRuns = new Map();
    testClasses.forEach(testClass => this.testClasses.set(testClass.id, testClass));
  }

  addTestRun(testRun: TestRunInfo): void {
    this.testRuns.set(testRun.test_id, testRun);
  }

  /**
   * @return `null` if there are no test classes to run, otherwise 0 - 100 indicating percent
   * completion of this test suite.
   */
  progressPercent(): ?number {
    if (this.testClasses.size === 0) {
      return null;
    } else {
      return this.testRuns.size / this.testClasses.size * 100;
    }
  }

}

module.exports = TestSuiteModel;
