'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import AbstractProvider from './AbstractProvider';
import type {HackSearchPosition} from 'nuclide-hack-base/lib/types';
import {getHackExecOptions, getSearchResults} from 'nuclide-hack-base/lib/HackHelpers';

class HackProvider extends AbstractProvider {

  async query(cwd: string, queryString: string): Promise<Array<HackSearchPosition>> {
    var searchPostfix;
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
    var searchResponse = await getSearchResults(cwd, queryString, undefined, searchPostfix);
    if (!searchResponse) {
      return [];
    } else {
      return searchResponse.result;
    }
  }

  async isAvailable(cwd: string): Promise<boolean> {
    var hackOptions = await getHackExecOptions(cwd);
    return hackOptions != null;
  }
}

module.exports = HackProvider;
