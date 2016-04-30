'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {fsPromise} from '../../nuclide-commons';
import path from 'path';

/**
 * @param repoPath The full path to the repository directory (.hg).
 * @return A promise that resolves to the current bookmark name, if it exists,
 *   or else an empty string.
 */
async function fetchCurrentBookmark(repoPath: string): Promise<string> {
  const bookmarkFile = path.join(repoPath, 'bookmarks.current');
  let result;
  try {
    result = await fsPromise.readFile(bookmarkFile, 'utf-8');
  } catch (e) {
    if (!(e.code === 'ENOENT')) {
      // We expect an error if the bookmark file doesn't exist. Otherwise, the
      // error is unexpected, so log it.
      const logger = require('../../nuclide-logging').getLogger();
      logger.error(e);
    }
    result = '';
  }
  return result;
}

module.exports = {
  fetchCurrentBookmark,
};
