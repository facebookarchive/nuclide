'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';

import {dirname, join} from 'path';
import {findNearestFile, array, fsPromise} from '../../commons';
import {getLogger} from '../../logging';

const TAGS_FILENAME = 'tags';

export type CtagsResult = {
  name: string,
  file: NuclideUri,
  // As specified in the tags file; defaults to 0 if not specified.
  lineNumber: number,
  // As specified in the tags file; defaults to empty if not specified.
  kind: string,
  pattern?: string,
};

export async function findTagsFile(path: NuclideUri): Promise<?NuclideUri> {
  const dir = await findNearestFile(TAGS_FILENAME, dirname(path));
  if (dir == null) {
    return dir;
  }
  return join(dir, TAGS_FILENAME);
}

export function findTags(
  path: NuclideUri,
  query: string,
  options?: {caseInsensitive?: boolean; partialMatch?: boolean, limit?: number},
): Promise<Array<CtagsResult>> {
  let ctags;
  try {
    ctags = require('ctags');
  } catch (e) {
    getLogger().error('Could not load the ctags package:', e);
    return Promise.resolve([]);
  }

  const dir = dirname(path);
  return new Promise((resolve, reject) => {
    ctags.findTags(path, query, options, async (error, tags: Array<CtagsResult>) => {
      if (error != null) {
        reject(error);
      } else {
        if (options != null) {
          const {limit} = options;
          if (limit != null && tags.length > limit) {
            tags.splice(limit, tags.length - limit);
          }
        }
        const processed = await Promise.all(tags.map(async tag => {
          // Convert relative paths to absolute ones.
          tag.file = join(dir, tag.file);
          // Tag files are often not perfectly in sync - filter out missing files.
          if (await fsPromise.exists(tag.file)) {
            return tag;
          }
          return null;
        }));
        resolve(array.compact(processed));
      }
    });
  });
}
