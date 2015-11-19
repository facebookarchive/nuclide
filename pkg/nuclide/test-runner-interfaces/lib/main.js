'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type TestClassSummary = {
  className: string;
  fileName: string;
  id: number;
  name: string;
};

export type TestRunInfo = {
  details?: string;
  durationSecs: number;
  endedTime?: number;
  name: string;
  numAssertions: number;
  numFailures: number;
  numMethods: number;
  numSkipped: number;
  status: number;
  summary?: string;
  test_json?: TestClassSummary;
};
