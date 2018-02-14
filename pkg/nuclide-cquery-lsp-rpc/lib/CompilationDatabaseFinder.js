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

import nuclideUri from 'nuclide-commons/nuclideUri';
import fs from 'nuclide-commons/fsPromise';
import {COMPILATION_DATABASE_FILE} from './CqueryProjectManager';

export async function findNearestCompilationDbDir(
  source: NuclideUri,
): Promise<?NuclideUri> {
  return fs.findNearestFile(
    COMPILATION_DATABASE_FILE,
    nuclideUri.dirname(source),
  );
}
