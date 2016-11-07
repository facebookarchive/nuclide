'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getPathToLogFile} from '../../pkg/nuclide-logging';
import {asyncExecute} from '../../pkg/commons-node/process';

/**
 * Greps a logfile for occurences of a search string.
 *
 * @returns A promise that resolves to the number of lines that match the search token.
 */
export async function getNumberOfMatches(searchToken: string): Promise<number> {
  const logFilePath = getPathToLogFile();
  const args = ['--count', searchToken, logFilePath];
  try {
    const result = (await asyncExecute('grep', args)).stdout.trim();
    return Number(result);
  } catch (e) {
    return 0;
  }
}

/**
 * Modifies the logfile by removing lines matching the provided searchToken.
 */
export async function deleteLogLinesMatching(searchToken: string): Promise<void> {
  const logFilePath = getPathToLogFile();
  const args = ['-i', '', `/${searchToken}/d`, logFilePath];
  try {
    await asyncExecute('sed', args);
  } catch (e) {}
}
