'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {findNearestFile, checkOutput} from '../../commons';

const HACK_CONFIG_FILE_NAME = '.hhconfig';
export const PATH_TO_HH_CLIENT = 'hh_client';

/**
* If this returns null, then it is not safe to run hack.
*/
function findHackConfigDir(localFile: string): Promise<?string> {
  return findNearestFile(HACK_CONFIG_FILE_NAME, localFile);
}

export async function getHackExecOptions(
  localFile: string
): Promise<?{hackRoot: string, hackCommand: string}> {
  // $FlowFixMe incompatible type.
  const [hhResult, hackRoot] = await Promise.all([
    // `stdout` would be empty if there is no such command.
    checkOutput('which', [PATH_TO_HH_CLIENT]),
    findHackConfigDir(localFile),
  ]);
  const hackCommand = hhResult.stdout.trim();
  if (hackRoot && hackCommand) {
    return {hackRoot, hackCommand};
  } else {
    return null;
  }
}
