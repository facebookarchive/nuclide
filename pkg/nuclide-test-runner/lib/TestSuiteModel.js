'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class TestSuiteModel {

  constructor(testClasses) {
    this.testClasses = new Map();
    this.testRuns = new Map();
    testClasses.forEach(testClass => this.testClasses.set(testClass.id, testClass));
  }

  addTestRun(testRun) {
    if (testRun.hasOwnProperty('test_json')) {
      // $FlowFixMe(rossallen)
      this.testRuns.set(testRun.test_json.id, testRun);
    }
  }

  /**
   * @return `null` if there are no test classes to run, otherwise 0 - 100 indicating percent
   * completion of this test suite.
   */
  progressPercent() {
    if (this.testClasses.size === 0) {
      return null;
    } else {
      return this.testRuns.size / this.testClasses.size * 100;
    }
  }
}
exports.default = TestSuiteModel; /**
                                   * Copyright (c) 2015-present, Facebook, Inc.
                                   * All rights reserved.
                                   *
                                   * This source code is licensed under the license found in the LICENSE file in
                                   * the root directory of this source tree.
                                   *
                                   * 
                                   * @format
                                   */