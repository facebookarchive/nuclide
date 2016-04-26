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

import invariant from 'assert';
import {getFileSystemServiceByNuclideUri} from '../../nuclide-client';

/**
 * Reads the file contents and returns empty string if the file doesn't exist
 * which means it was removed in the HEAD dirty repository status.
 *
 * If another error is encontered, it's thrown to be handled up the stack.
 */
export function getFileSystemContents(filePath: NuclideUri): Promise<string> {
  const fileSystemService = getFileSystemServiceByNuclideUri(filePath);
  invariant(fileSystemService);
  const localFilePath = require('../../nuclide-remote-uri').getPath(filePath);
  return fileSystemService.readFile(localFilePath)
    .then(
      contents => contents.toString('utf8'),
      error => {
        if (error.code === 'ENOENT') {
          // The file is deleted in the current dirty status.
          return '';
        }
        throw error;
      }
    );
}
