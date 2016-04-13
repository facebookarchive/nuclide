'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';
import fs from 'fs';

/**
 * Returns if the `rootPath` directory contains the `checkPath` which could be:
 *  - A file or directory path that's a direct child of the root path.
 *  - A file or directory path that's a deep child of the root path.
 *  - The exact `rootPath` in an exact or symlinked form.
 *  - May end in a trailing slash if it's a directory path.
 * Follows symlinks to figure out if the real paths of the root and check paths matches.
 */
function containsPathSync(rootPath: string, checkPath: string): boolean {
  let realRootPath = null;
  let realCheckPath = null;
  try {
    realRootPath = fs.realpathSync(rootPath);
    realCheckPath = fs.realpathSync(checkPath);
  } catch (e) {
    realRootPath = rootPath;
    realCheckPath = checkPath;
  }

  const normalizedRootPath = path.normalize(realRootPath);
  const normalizedCheckPath = path.normalize(realCheckPath);

  const rootPathNumberOfParts = normalizedRootPath.split(path.sep).length;
  // Extract the matching piece of the normalized path to compare with the root path.
  const rootPathMatch = normalizedCheckPath.split(path.sep)
    .slice(0, rootPathNumberOfParts).join(path.sep);
  return rootPathMatch === normalizedRootPath;
}

module.exports = {
  containsPathSync,
};
