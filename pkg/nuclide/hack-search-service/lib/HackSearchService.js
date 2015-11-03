'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HackSearchPosition} from 'nuclide-hack-base/lib/types';
import type {NuclideUri} from 'nuclide-remote-uri';

import {getHackExecOptions, getSearchResults} from 'nuclide-hack-base/lib/HackHelpers';

/**
 * Performs a Hack symbol search in the specified directory.
 */
export async function query(
  rootDirectory: NuclideUri,
  queryString: string
): Promise<Array<HackSearchPosition>> {
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

/**
 * @return whether this service can perform Hack symbol queries on the
 *   specified directory. Not all directories on a host correspond to
 *   repositories that contain Hack code.
 */
export async function isAvailableForDirectory(rootDirectory: NuclideUri): Promise<boolean> {
  const hackOptions = await getHackExecOptions(rootDirectory);
  return hackOptions != null;
}
