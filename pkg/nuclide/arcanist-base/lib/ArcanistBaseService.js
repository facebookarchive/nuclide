'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


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
}

module.exports = ArcanistBaseService;
