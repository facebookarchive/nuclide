'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const path = require('path');

import type {HgRepositoryDescription} from './main';

/**
 * This function returns HgRepositoryDescription filled with a repoPath and
 * originURL iff it finds that the given directory is within an Hg repository.
 */
function findHgRepository(directoryPath: string): HgRepositoryDescription {
  const fs = require('fs-plus');
  let workingDirectoryPath = directoryPath;
  let repoPath = null;
  let originURL = null;
  /*eslint-disable no-constant-condition */
  while (true) {
    const dirToTest = path.join(workingDirectoryPath, '.hg');
    if (fs.isDirectorySync(dirToTest) &&
        fs.isFileSync(path.join(dirToTest, 'hgrc'))) {
      const ini = require('ini');
      // I'm not quite sure why this header is required, but I copied this
      // from the npm page to make things work: https://www.npmjs.com/package/ini.
      const header = 'scope = global\n';
      const config = ini.parse(header +
          fs.readFileSync(path.join(dirToTest, 'hgrc')));
      if (typeof config.paths.default === 'string') {
        repoPath = dirToTest;
        originURL = config.paths.default;
        break;
      }
    }

    if (isRootDir(workingDirectoryPath)) {
      break;
    } else {
      workingDirectoryPath = getParentDir(workingDirectoryPath);
    }
  }
  /*eslint-enable no-constant-condition */
  return {repoPath, originURL, workingDirectoryPath};
}

function isRootDir(directoryPath: string): boolean {
  const {isRoot} = require('nuclide-commons').fsPromise;
  return isRoot(directoryPath);
}

function getParentDir(directoryPath: string): string {
  return path.resolve(directoryPath, '..');
}

module.exports = findHgRepository;
