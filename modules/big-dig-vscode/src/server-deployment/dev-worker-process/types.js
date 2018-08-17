/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

export type DevForkErrors =
  | 'result-error'
  | 'deltaPkgData-error'
  | 'fullPkgData-error'
  | 'packageVersion-error';

// log4js uses `any`, but we don't need to inspect these messages directly.
export type LoggerMessage = {};

export type DevForkProtocol =
  | {|
      tag: DevForkErrors,
      error: string,
    |}
  | {|
      tag: 'result',
      baseVersion?: string,
      version: string,
      fullPkgFilename: string,
      deltaPkgData: boolean, // false if null
    |}
  | {|
      tag: 'deltaPkgData',
      deltaPkgData: string,
    |}
  | {|
      tag: 'fullPkgData',
      fullPkgData: string,
    |}
  | {|
      tag: 'packageVersion',
      version: string,
    |}
  | {|
      tag: 'log',
      category: string,
      level: string,
      data: LoggerMessage[],
    |};
