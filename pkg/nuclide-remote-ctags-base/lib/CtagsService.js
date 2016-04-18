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

import path from 'path';
import {array, fsPromise} from '../../nuclide-commons';
import {getLogger} from '../../nuclide-logging';

const TAGS_FILENAME = 'tags';

export type CtagsResult = {
  name: string;
  file: NuclideUri;
  // As specified in the tags file; defaults to 0 if not specified.
  lineNumber: number;
  // As specified in the tags file; defaults to empty if not specified.
  kind: string;
  pattern?: string;
  fields?: Map<string, string>;
};

export class CtagsService {
  _tagsPath: NuclideUri;

  constructor(tagsPath: NuclideUri) {
    this._tagsPath = tagsPath;
  }

  async getTagsPath(): Promise<NuclideUri> {
    return this._tagsPath;
  }

  findTags(
    query: string,
    options?: {caseInsensitive?: boolean; partialMatch?: boolean; limit?: number},
  ): Promise<Array<CtagsResult>> {
    let ctags;
    try {
      ctags = require('../VendorLib/ctags-prebuilt/lib/ctags');
    } catch (e) {
      getLogger().error('Could not load the ctags package:', e);
      return Promise.resolve([]);
    }

    const dir = path.dirname(this._tagsPath);
    return new Promise((resolve, reject) => {
      ctags.findTags(this._tagsPath, query, options, async (error, tags: Array<Object>) => {
        if (error != null) {
          reject(error);
        } else {
          const processed = await Promise.all(tags.map(async tag => {
            // Convert relative paths to absolute ones.
            tag.file = path.join(dir, tag.file);
            // Tag files are often not perfectly in sync - filter out missing files.
            if (await fsPromise.exists(tag.file)) {
              if (tag.fields != null) {
                const map = new Map();
                for (const key in tag.fields) {
                  map.set(key, tag.fields[key]);
                }
                tag.fields = map;
              }
              return tag;
            }
            return null;
          }));
          resolve(array.compact(processed));
        }
      });
    });
  }

  dispose(): void {
    // nothing here
  }
}

export async function getCtagsService(uri: NuclideUri): Promise<?CtagsService> {
  const dir = await fsPromise.findNearestFile(TAGS_FILENAME, path.dirname(uri));
  if (dir == null) {
    return null;
  }
  return new CtagsService(path.join(dir, TAGS_FILENAME));
}
