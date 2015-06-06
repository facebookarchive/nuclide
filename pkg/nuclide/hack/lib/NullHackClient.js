'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class NullHackClient {

  getHackDiagnostics(): Promise<Array<any>> {
    return Promise.resolve({errors: []});
  }

  getHackCompletions(query: string): Promise<Array<any>> {
    return Promise.resolve([]);
  }

  getHackDefinition(query: string, symbolType: SymbolType): Promise<Array<any>> {
    return Promise.resolve([]);
  }

  getHackDependencies(dependenciesInfo: Array<{name: string; type: string}>): Promise<any> {
    return Promise.resolve({});
  }

  getHackSearchResults(
      search: string,
      filterTypes: ?Array<SearchResultType>,
      searchPostfix: ?string
    ): Promise<Array<any>> {
    return Promise.resolve([]);
  }

}

module.exports = NullHackClient;
