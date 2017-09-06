/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {LRUCache} from 'lru-cache';

import nuclideUri from 'nuclide-commons/nuclideUri';
import LRU from 'lru-cache';
import {runCommand} from 'nuclide-commons/process';
import {config} from './config';

export type GeneratedFileType = 'manual' | 'partial' | 'generated';

export async function getGeneratedFileType(
  filePath: NuclideUri,
  forceUpdate: boolean = false,
): Promise<GeneratedFileType> {
  if (!forceUpdate) {
    const cachedType = cache.get(filePath);

    if (cachedType != null) {
      return cachedType;
    }
  }

  if (matchesGeneratedPaths(filePath)) {
    cache.set(filePath, 'generated');
    return 'generated';
  }

  const [generated, partiallyGenerated] = await Promise.all([
    tagged(filePath, config.generatedTag),
    tagged(filePath, config.partialGeneratedTag),
  ]);

  if (generated) {
    cache.set(filePath, 'generated');
    return 'generated';
  }

  if (partiallyGenerated) {
    cache.set(filePath, 'partial');
    return 'partial';
  }

  cache.set(filePath, 'manual');
  return 'manual';
}

// 1000 entries should allow for a good number of open directories
const cache: LRUCache<NuclideUri, GeneratedFileType> = new LRU({max: 1000});

function tagged(filePath: NuclideUri, tag: ?string): Promise<boolean> {
  if (tag == null) {
    return Promise.resolve(false);
  }
  const command = 'grep';
  const args = [tag, nuclideUri.basename(filePath)];
  const options = {
    cwd: nuclideUri.dirname(filePath),
    // Grep returns exitCode 1 for empty results,
    // so we need to say that's not an error
    isExitError: ({exitCode, signal}) => {
      return signal != null && (exitCode == null || exitCode > 1);
    },
  };
  return runCommand(command, args, options)
    .map(stdout => stdout.length > 0)
    .toPromise();
}

function matchesGeneratedPaths(filePath: NuclideUri): boolean {
  return config.generatedPathRegexes.some(regexp => regexp.test(filePath));
}
