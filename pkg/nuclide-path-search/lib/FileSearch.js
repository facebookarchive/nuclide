'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import urlJoin from 'url-join';
import path from 'path';

import {parse} from '../../nuclide-remote-uri';
import {fsPromise} from '../../nuclide-commons';
import {getLogger} from '../../nuclide-logging';

import {PathSet} from './PathSet';
import {getPaths} from './PathSetFactory';
import PathSetUpdater from './PathSetUpdater';

const logger = getLogger();

export type FileSearchResult = {
  score: number;
  path: string;
  matchIndexes: Array<number>;
};

class FileSearch {
  _originalUri: string;
  _pathSet: PathSet;

  constructor(fullUri: string, pathSet: PathSet) {
    this._originalUri = fullUri;
    this._pathSet = pathSet;
  }

  async query(query: string): Promise<Array<FileSearchResult>> {
    // Attempt to relativize paths that people might e.g. copy + paste.
    let relQuery = query;
    // If a full path is pasted, make the path relative.
    if (relQuery.startsWith(this._originalUri + path.sep)) {
      relQuery = relQuery.substr(this._originalUri.length + 1);
    } else {
      // Also try to relativize queries that start with the dirname alone.
      const dirname = path.dirname(this._originalUri);
      if (relQuery.startsWith(dirname + path.sep)) {
        relQuery = relQuery.substr(dirname.length + 1);
      }
    }

    const results = this._pathSet.match(relQuery).map(result => {
      let {matchIndexes} = result;
      if (matchIndexes != null) {
        matchIndexes = matchIndexes.map(idx => idx + this._originalUri.length + 1);
      }
      return {
        score: result.score,
        path: urlJoin(this._originalUri, '/', result.value),
        matchIndexes: matchIndexes || [],
      };
    });
    return results;
  }
}

const fileSearchForDirectoryUri = {};

export async function fileSearchForDirectory(
  directoryUri: string,
  pathSetUpdater: ?PathSetUpdater,
): Promise<FileSearch> {
  let fileSearch = fileSearchForDirectoryUri[directoryUri];
  if (fileSearch) {
    return fileSearch;
  }

  const realpath = await fsPromise.realpath(parse(directoryUri).path);
  const paths = await getPaths(realpath);
  const pathSet = new PathSet(paths);

  const thisPathSetUpdater = pathSetUpdater || getPathSetUpdater();
  try {
    await thisPathSetUpdater.startUpdatingPathSet(pathSet, realpath);
  } catch (e) {
    logger.warn(`Could not update path sets for ${realpath}. Searches may be stale`, e);
    // TODO(hansonw): Fall back to manual refresh or node watches
  }

  // TODO: Stop updating the pathSet when the fileSearch is torn down. But
  // currently the fileSearch is never torn down.

  fileSearch = new FileSearch(directoryUri, pathSet);
  fileSearchForDirectoryUri[directoryUri] = fileSearch;
  return fileSearch;
}

let pathSetUpdater;

function getPathSetUpdater() {
  if (!pathSetUpdater) {
    pathSetUpdater = new PathSetUpdater();
  }
  return pathSetUpdater;
}

// The return values of the following functions must be JSON-serializable so they
// can be sent across a process boundary.

export async function initFileSearchForDirectory(directoryUri: string): Promise<void> {
  await fileSearchForDirectory(directoryUri);
}

export async function doSearch(
  directoryUri: string,
  query: string,
): Promise<Array<FileSearchResult>> {
  const fileSearch = await fileSearchForDirectory(directoryUri);
  return fileSearch.query(query);
}
