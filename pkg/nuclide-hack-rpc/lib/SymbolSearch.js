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
import type {HackSearchPosition} from './HackService';
import type {HackSearchResult, HHSearchPosition} from './types';
import type {SearchResultTypeValue} from '../../nuclide-hack-common';

import {SearchResultType} from '../../nuclide-hack-common';
import {findHackConfigDir} from './hack-config';

import {
  callHHClient,
} from './HackHelpers';

const pendingSearchPromises: Map<string, Promise<any>> = new Map();

export async function executeQuery(
  rootDirectory: NuclideUri,
  queryString_: string,
): Promise<Array<HackSearchPosition>> {
  let queryString = queryString_;
  let searchPostfix;
  switch (queryString[0]) {
    case '@':
      searchPostfix = '-function';
      queryString = queryString.substring(1);
      break;
    case '#':
      searchPostfix = '-class';
      queryString = queryString.substring(1);
      break;
    case '%':
      searchPostfix = '-constant';
      queryString = queryString.substring(1);
      break;
  }
  const searchResponse = await getSearchResults(
    rootDirectory,
    queryString,
    /* filterTypes */ null,
    searchPostfix);
  if (searchResponse == null) {
    return [];
  } else {
    return searchResponse.result;
  }
}

export async function getSearchResults(
    filePath: string,
    search: string,
    filterTypes?: ?Array<SearchResultTypeValue>,
    searchPostfix?: string,
  ): Promise<?HackSearchResult> {
  if (search == null) {
    return null;
  }
  const hackRoot = await findHackConfigDir(filePath);
  if (hackRoot == null) {
    return null;
  }

  // `pendingSearchPromises` is used to temporally cache search result promises.
  // So, when a matching search query is done in parallel, it will wait and resolve
  // with the original search call.
  let searchPromise = pendingSearchPromises.get(search);
  if (!searchPromise) {
    searchPromise = callHHClient(
        /* args */ ['--search' + (searchPostfix || ''), search],
        /* errorStream */ false,
        /* processInput */ null,
        /* file */ filePath,
    );
    pendingSearchPromises.set(search, searchPromise);
  }

  let searchResponse: ?Array<HHSearchPosition> = null;
  try {
    searchResponse = (
      ((await searchPromise): any): ?Array<HHSearchPosition>
    );
  } finally {
    pendingSearchPromises.delete(search);
  }

  if (searchResponse == null) {
    return null;
  }

  const searchResult = searchResponse;
  let result: Array<HackSearchPosition> = [];
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

  if (filterTypes) {
    result = filterSearchResults(result, filterTypes);
  }
  return {hackRoot, result};
}

// Eventually this will happen on the hack side, but for now, this will do.
function filterSearchResults(
  results: Array<HackSearchPosition>,
  filter: Array<SearchResultTypeValue>,
): Array<HackSearchPosition> {
  return results.filter(result => {
    const info = result.additionalInfo;
    const searchType = getSearchType(info);
    return filter.indexOf(searchType) !== -1;
  });
}

function getSearchType(info: string): SearchResultTypeValue {
  switch (info) {
    case 'typedef':
      return SearchResultType.TYPEDEF;
    case 'function':
      return SearchResultType.FUNCTION;
    case 'constant':
      return SearchResultType.CONSTANT;
    case 'trait':
      return SearchResultType.TRAIT;
    case 'interface':
      return SearchResultType.INTERFACE;
    case 'abstract class':
      return SearchResultType.ABSTRACT_CLASS;
    default: {
      if (info.startsWith('method') || info.startsWith('static method')) {
        return SearchResultType.METHOD;
      }
      if (info.startsWith('class var') || info.startsWith('static class var')) {
        return SearchResultType.CLASS_VAR;
      }
      return SearchResultType.CLASS;
    }
  }
}
