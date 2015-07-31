'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from 'nuclide-remote-uri';

class ArcanistBaseService {
  findArcConfigDirectory(fileName: NuclideUri): Promise<?NuclideUri> {
    throw new Error('abstract');
  }

  readArcConfig(fileName: NuclideUri): Promise<?Object> {
    throw new Error('abstract');
  }

  findArcProjectIdOfPath(fileName: NuclideUri): Promise<?string> {
    throw new Error('abstract');
  }

  getProjectRelativePath(fileName: NuclideUri): Promise<?string> {
    throw new Error('abstract');
  }

  findDiagnostics(fileName: NuclideUri): Promise<Array<{
        type: string,
        text: string,
        filePath: NuclideUri,
        row: number,
        col: number,
      }>> {
    throw new Error('abstract');
  }
}

module.exports = ArcanistBaseService;
