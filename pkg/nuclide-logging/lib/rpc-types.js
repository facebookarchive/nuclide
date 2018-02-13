/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {DeadlineRequest} from 'nuclide-commons/promise';

export type LogLevel =
  | 'ALL'
  | 'TRACE'
  | 'DEBUG'
  | 'INFO'
  | 'WARN'
  | 'ERROR'
  | 'FATAL'
  | 'OFF';

export type AdditionalLogFilesProvider = {|
  id: string,
  getAdditionalLogFiles(
    deadline: DeadlineRequest,
  ): Promise<Array<AdditionalLogFile>>,
|};

export type AdditionalLogFile = {
  title: string, // usually a filepath
  data: string,
};

export function parseLogLevel(s: mixed, _default: LogLevel): LogLevel {
  if (
    s === 'ALL' ||
    s === 'TRACE' ||
    s === 'DEBUG' ||
    s === 'INFO' ||
    s === 'WARN' ||
    s === 'ERROR' ||
    s === 'FATAL' ||
    s === 'OFF'
  ) {
    return s;
  }
  return _default;
}
