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

import type {
  ClangCompilationDatabase,
} from '../../nuclide-clang-rpc/lib/rpc-types';
import type {
  ClangCompilationDatabaseProvider,
} from '../../nuclide-clang/lib/types';

import {getBuckServiceByNuclideUri} from '../../nuclide-remote-connection';
import {Cache} from '../../commons-node/cache';
import nuclideUri from 'nuclide-commons/nuclideUri';

const compilationDBCache = new Cache();

function getCompilationDBCache(
  host: string,
): Cache<Promise<?ClangCompilationDatabase>> {
  return compilationDBCache.getOrCreate(
    nuclideUri.getHostnameOpt(host) || '',
    () => new Cache(),
  );
}

export function getClangCompilationDatabaseProvider(): ClangCompilationDatabaseProvider {
  return {
    getCompilationDatabase(src: string): Promise<?ClangCompilationDatabase> {
      return getCompilationDBCache(src).getOrCreate(src, () =>
        getBuckServiceByNuclideUri(src)
          .getCompilationDatabase(src)
          .refCount()
          .toPromise(),
      );
    },
    resetForSource(src: string): void {
      getCompilationDBCache(src).delete(src);
      getBuckServiceByNuclideUri(src).resetCompilationDatabaseForSource(src);
    },
    reset(host: string): void {
      getCompilationDBCache(host).clear();
      getBuckServiceByNuclideUri(host).resetCompilationDatabase();
    },
  };
}
