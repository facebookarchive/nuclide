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

import {Subscription} from 'rxjs';
import {getBuckServiceByNuclideUri} from '../../nuclide-remote-connection';
import {Cache} from '../../commons-node/cache';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {
  getFileWatcherServiceByNuclideUri,
} from '../../nuclide-remote-connection';
import SharedObservableCache from '../../commons-node/SharedObservableCache';

const compilationDBCache = new Cache();
function getCompilationDBCache(
  host: string,
): Cache<Promise<?ClangCompilationDatabase>> {
  return compilationDBCache.getOrCreate(
    nuclideUri.getHostnameOpt(host) || '',
    () => new Cache(),
  );
}

const _buildFileForSource = new Cache();
const _watchedFiles = new Cache();
const _watchedFilesObservables = new Cache();

function getWatchedFilesObservablesCache(
  host: string,
): SharedObservableCache<string, *> {
  return _watchedFilesObservables.getOrCreate(
    host,
    () =>
      new SharedObservableCache(buildFile =>
        getFileWatcherServiceByNuclideUri(host)
          .watchFileWithNode(buildFile)
          .refCount()
          .share()
          .take(1),
      ),
  );
}

function getBuildFilesForSourceCache(host: string): Cache<string> {
  return _buildFileForSource.getOrCreate(
    nuclideUri.getHostnameOpt(host) || '',
    () =>
      new Cache(buildFile =>
        getWatchedFilesForSourceCache(host).delete(buildFile),
      ),
  );
}

function getWatchedFilesForSourceCache(host: string): Cache<Subscription> {
  return _watchedFiles.getOrCreate(
    nuclideUri.getHostnameOpt(host) || '',
    () => new Cache(subscription => subscription.unsubscribe()),
  );
}

export function getClangCompilationDatabaseProvider(): ClangCompilationDatabaseProvider {
  return {
    watchBuildFile(buildFile: string, src: string): void {
      const host = src;
      const buildFilesCache = getBuildFilesForSourceCache(host);
      const watchedFile = buildFilesCache.get(src);
      if (watchedFile != null) {
        return;
      }
      buildFilesCache.set(src, buildFile);
      getWatchedFilesForSourceCache(host).set(
        buildFile,
        getWatchedFilesObservablesCache(host).get(buildFile).subscribe(() => {
          try {
            this.resetForSource(src);
          } catch (_) {}
        }),
      );
    },
    getCompilationDatabase(src: string): Promise<?ClangCompilationDatabase> {
      return getCompilationDBCache(src).getOrCreate(src, () => {
        return getBuckServiceByNuclideUri(src)
          .getCompilationDatabase(src)
          .refCount()
          .do(db => {
            if (db != null && db.flagsFile != null) {
              this.watchBuildFile(db.flagsFile, src);
            }
          })
          .toPromise();
      });
    },
    resetForSource(src: string): void {
      const host = src;
      getCompilationDBCache(host).delete(src);
      getBuckServiceByNuclideUri(host).resetCompilationDatabaseForSource(src);
      getBuildFilesForSourceCache(host).delete(src);
    },
    reset(host: string): void {
      getCompilationDBCache(host).clear();
      getBuckServiceByNuclideUri(host).resetCompilationDatabase();
      getBuildFilesForSourceCache(host).clear();
      getWatchedFilesForSourceCache(host).clear();
    },
  };
}
