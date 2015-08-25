'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {getClient} = require('nuclide-client');

class FuzzyFileNameProvider {

  getProviderType(): string {
    return 'DIRECTORY';
  }

  getDebounceDelay(): number {
    return 0;
  }

  getAction(): string {
    return 'nuclide-fuzzy-filename-provider:toggle-provider';
  }

  getPromptText(): string {
    return 'Fuzzy File Name Search';
  }

  getTabTitle(): string {
    return 'Filenames';
  }

  isEligibleForDirectory(directory: atom$Directory): boolean {
    return true;
  }

  async executeQuery(query: string, directory: atom$Directory): Promise<Array<Object>> {
    if (query.length === 0) {
      return [];
    }
    var directoryPath = directory.getPath();
    var client = getClient(directoryPath);
    return client.searchDirectory(directoryPath, query);
  }
}

module.exports = new FuzzyFileNameProvider();
