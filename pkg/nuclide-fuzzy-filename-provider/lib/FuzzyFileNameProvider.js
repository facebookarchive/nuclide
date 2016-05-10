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
} from '../../nuclide-quick-open/lib/types';

import {getFuzzyFileSearchService} from './utils';
import {
  RemoteDirectory,
} from '../../nuclide-remote-connection';

const FuzzyFileNameProvider: Provider = {

  // Give preference to filename results in OmniSearch.
  getPriority: () => 1,

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
    return directory.exists();
  },

  async executeQuery(query: string, directory?: atom$Directory): Promise<Array<FileResult>> {
    if (query.length === 0) {
      return [];
    }

    if (directory == null) {
      throw new Error(
        'FuzzyFileNameProvider is a directory-specific provider but its executeQuery method was'
        + ' called without a directory argument.'
      );
    }

    const service = await getFuzzyFileSearchService(directory);
    if (service == null) {
      return [];
    }

    const directoryPath = directory.getPath();
    const result = await service.queryFuzzyFile(directoryPath, query);
    // Take the `nuclide://<host><port>` prefix into account for matchIndexes of remote files.
    if (RemoteDirectory.isRemoteDirectory(directory)) {
      const remoteDir: RemoteDirectory = (directory: any);
      const indexOffset = directoryPath.length - remoteDir.getLocalPath().length;
      result.forEach(res => {
        res.matchIndexes = res.matchIndexes.map(index => index + indexOffset);
      });
    }
    return ((result: any): Array<FileResult>);
  },
};

module.exports = FuzzyFileNameProvider;
