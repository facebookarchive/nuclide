'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class TestRunModel {

  id: number;
  startTime: ?number;
  endTime: ?number;
  testRunner: Object;

  constructor(id: number, testRunner: Object) {
    this.id = id;
    this.testRunner = testRunner;
  }

  getDuration(): ?number {
    if (this.startTime && this.endTime) {
      return this.endTime - this.startTime;
    }
  }

  start(): void {
    this.startTime = Date.now();
  }

  stop(): void {
    this.endTime = Date.now();
  }

}

module.exports = TestRunModel;
