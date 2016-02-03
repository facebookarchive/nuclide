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
import ini from 'ini';

import type {HgRepositoryDescription} from './main';

/**
 * This function returns HgRepositoryDescription filled with a repoPath and
 * originURL iff it finds that the given directory is within an Hg repository.
 */
function findHgRepository(directoryPath: string): HgRepositoryDescription {
  const fs = require('fs-plus');
  let workingDirectoryPath = directoryPath;
  let repoPath = path.join(workingDirectoryPath, '.hg');
  let originURL = null;
  /*eslint-disable no-constant-condition */
  while (true) {
    const dirToTest = path.join(workingDirectoryPath, '.hg');
    if (fs.isDirectorySync(dirToTest)) {
      repoPath = dirToTest;
      if (fs.isFileSync(path.join(dirToTest, 'hgrc'))) {
        const config = ini.parse(fs.readFileSync(path.join(dirToTest, 'hgrc'), 'utf8'));
        if (typeof config.paths === 'object' && typeof config.paths.default === 'string') {
          originURL = config.paths.default;
        }
      }
      break;
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
  const {isRoot} = require('../../commons').fsPromise;
  return isRoot(directoryPath);
}

function getParentDir(directoryPath: string): string {
  return path.resolve(directoryPath, '..');
}

module.exports = findHgRepository;
