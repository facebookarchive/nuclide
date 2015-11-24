'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  FileResult,
  Provider,
  ProviderType,
} from 'nuclide-quick-open-interfaces';

const {getClient} = require('nuclide-client');

const FuzzyFileNameProvider: Provider = {

  getName(): string {
    return 'FuzzyFileNameProvider';
  },

  getProviderType(): ProviderType {
    return 'DIRECTORY';
  },

  isRenderable(): boolean {
    return true;
  },

  getDebounceDelay(): number {
    return 0;
  },

  getAction(): string {
    return 'nuclide-fuzzy-filename-provider:toggle-provider';
  },

  getPromptText(): string {
    return 'Fuzzy File Name Search';
  },

  getTabTitle(): string {
    return 'Filenames';
  },

  isEligibleForDirectory(directory: atom$Directory): Promise<boolean> {
    return Promise.resolve(true);
  },

  async executeQuery(query: string, directory: atom$Directory): Promise<Array<FileResult>> {
    if (query.length === 0) {
      return [];
    }
    const directoryPath = directory.getPath();
    const client = getClient(directoryPath);
    if (client == null) {
      return [];
    }
    return client.searchDirectory(directoryPath, query);
  },
};

module.exports = FuzzyFileNameProvider;
