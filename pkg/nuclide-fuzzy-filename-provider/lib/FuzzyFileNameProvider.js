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
  Provider,
  ProviderType,
} from '../../nuclide-quick-open/lib/types';
import type {
  FileResult,
} from '../../nuclide-quick-open/lib/rpc-types';

import {
  RemoteDirectory,
  getFuzzyFileSearchServiceByNuclideUri,
} from '../../nuclide-remote-connection';

import {getIgnoredNames} from './utils';

export default ({
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
        + ' called without a directory argument.',
      );
    }

    const directoryPath = directory.getPath();
    const service = getFuzzyFileSearchServiceByNuclideUri(directoryPath);
    const results = await service.queryFuzzyFile(directoryPath, query, getIgnoredNames());

    // Take the `nuclide://<host>` prefix into account for matchIndexes of remote files.
    if (RemoteDirectory.isRemoteDirectory(directory)) {
      const remoteDir: RemoteDirectory = (directory: any);
      const indexOffset = directoryPath.length - remoteDir.getLocalPath().length;
      for (let i = 0; i < results.length; i++) {
        for (let j = 0; j < results[i].matchIndexes.length; j++) {
          results[i].matchIndexes[j] += indexOffset;
        }
      }
    }

    return ((results: any): Array<FileResult>);
  },
}: Provider);
