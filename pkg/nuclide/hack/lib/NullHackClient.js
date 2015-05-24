'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

class NullHackClient {

  getHackDiagnostics(): Promise<Array<mixed>> {
    return Promise.resolve({errors: []});
  }

  getHackCompletions(query: string): Promise<Array<mixed>> {
    return Promise.resolve([]);
  }

  getHackDefinition(query: string, symbolType: SymbolType): Promise<Array<mixed>> {
    return Promise.resolve([]);
  }

  getHackDependencies(dependenciesInfo: Array<{name: string; type: string}>): Promise<mixed> {
    return Promise.resolve({});
  }

  getHackSearchResults(
      search: string,
      filterTypes: ?Array<SearchResultType>,
      searchPostfix: ?string
    ): Promise<Array<mixed>> {
    return Promise.resolve([]);
  }

}

module.exports = NullHackClient;
