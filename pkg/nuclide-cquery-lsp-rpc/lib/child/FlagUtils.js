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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import fs from 'nuclide-commons/fsPromise';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {getCompilationDatabaseHandler} from '../../../nuclide-buck-rpc/lib/BuckClangCompilationDatabase';

export type FlagsInfo = {flagsFile: string, databaseDirectory: string};
const compilationDbHandler = getCompilationDatabaseHandler({
  flavorsForTarget: [],
  args: [],
  useDefaultPlatform: true,
});

export const COMPILATION_DATABASE_FILE = 'compile_commands.json';

async function findNearestCompilationDbDir(
  source: NuclideUri,
): Promise<?NuclideUri> {
  return fs.findNearestFile(
    COMPILATION_DATABASE_FILE,
    nuclideUri.dirname(source),
  );
}

// First find a compile commands.json nearby, otherwise get it from buck.
export async function flagsInfoForPath(path: string): Promise<?FlagsInfo> {
  const flagsInfo = await flagsInfoFromJson(path);
  if (flagsInfo != null) {
    return flagsInfo;
  }
  return flagsInfoFromBuck(path);
}

async function flagsInfoFromJson(source: string): Promise<?FlagsInfo> {
  const databaseDirectory = await findNearestCompilationDbDir(source);
  if (databaseDirectory != null) {
    return {
      databaseDirectory,
      flagsFile: nuclideUri.join(databaseDirectory, 'compile_commands.json'),
    };
  }
}

async function flagsInfoFromBuck(source: string): Promise<?FlagsInfo> {
  const buckDatabase = await compilationDbHandler.getCompilationDatabase(
    source,
  );
  if (buckDatabase != null) {
    const {file, flagsFile} = buckDatabase;
    if (file != null && flagsFile != null) {
      return {databaseDirectory: nuclideUri.dirname(file), flagsFile};
    }
  }
}
