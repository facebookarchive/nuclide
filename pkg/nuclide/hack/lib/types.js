'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type HackError = {
  descr: string;
  path: string;
  line: number;
  start: number;
  end: number;
};

export type HackDiagnosticItem = {
  message: Array<HackError>;
};
