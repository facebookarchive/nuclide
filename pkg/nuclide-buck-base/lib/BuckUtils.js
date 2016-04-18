'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import {fsPromise} from '../../nuclide-commons';
import invariant from 'assert';

const buckProjectDirectoryByPath: {[filePath: NuclideUri]: NuclideUri} = {};

export class BuckUtils {

  /**
   * Given a file path, returns path to the Buck project root i.e. the directory containing
   * '.buckconfig' file.
   */
  async getBuckProjectRoot(filePath: NuclideUri): Promise<?NuclideUri> {
    let directory = buckProjectDirectoryByPath[filePath];
    if (!directory) {
      directory = await fsPromise.findNearestFile('.buckconfig', filePath);
      if (directory === null) {
        return null;
      } else {
        invariant(directory);
        buckProjectDirectoryByPath[filePath] = directory;
      }
    }
    return directory;
  }

  dispose(): void {
  }
}
