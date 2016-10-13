'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {HackSearchPosition} from './HackService-types';
import type {HHSearchPosition} from './types';

import {findHackConfigDir} from './hack-config';

import {
  callHHClient,
} from './HackHelpers';

const pendingSearchPromises: Map<string, Promise<any>> = new Map();

export function parseQueryString(
  queryString_: string,
): {searchPostfix: ?string, queryString: string} {
  let queryString;
  let searchPostfix;
  switch (queryString_[0]) {
    case '@':
      searchPostfix = '-function';
      queryString = queryString_.substring(1);
      break;
    case '#':
      searchPostfix = '-class';
      queryString = queryString_.substring(1);
      break;
    case '%':
      searchPostfix = '-constant';
      queryString = queryString_.substring(1);
      break;
    default:
      searchPostfix = null;
      queryString = queryString_;
      break;
  }
  return {
    searchPostfix,
    queryString,
  };
}

export async function executeQuery(
  filePath: NuclideUri,
  queryString_: string,
): Promise<Array<HackSearchPosition>> {
  const hackRoot = await findHackConfigDir(filePath);
  if (hackRoot == null) {
    return [];
  }

  const {queryString, searchPostfix} = parseQueryString(queryString_);
  if (queryString === '') {
    return [];
  }

  // `pendingSearchPromises` is used to temporally cache search result promises.
  // So, when a matching search query is done in parallel, it will wait and resolve
  // with the original search call.
  let searchPromise = pendingSearchPromises.get(queryString);
  if (!searchPromise) {
    searchPromise = callHHClient(
        /* args */ ['--search' + (searchPostfix || ''), queryString],
        /* errorStream */ false,
        /* processInput */ null,
        /* file */ filePath,
    );
    pendingSearchPromises.set(queryString, searchPromise);
  }

  let searchResponse: ?Array<HHSearchPosition> = null;
  try {
    searchResponse = ((await searchPromise): any);
  } finally {
    pendingSearchPromises.delete(queryString);
  }

  return convertSearchResults(hackRoot, searchResponse);
}

export function convertSearchResults(
  hackRoot: NuclideUri,
  searchResponse: ?Array<HHSearchPosition>,
): Array<HackSearchPosition> {
  if (searchResponse == null) {
    return [];
  }

  const searchResult = searchResponse;
  const result: Array<HackSearchPosition> = [];
  for (const entry of searchResult) {
    const resultFile = entry.filename;
    if (!resultFile.startsWith(hackRoot)) {
      // Filter out files out of repo results, e.g. hh internal files.
      continue;
    }
    result.push({
      line: entry.line - 1,
      column: entry.char_start - 1,
      name: entry.name,
      path: resultFile,
      length: entry.char_end - entry.char_start + 1,
      scope: entry.scope,
      additionalInfo: entry.desc,
    });
  }

  return result;
}
