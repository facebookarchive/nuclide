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
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import {Subscription} from 'rxjs';
import {getBuckServiceByNuclideUri} from '../../nuclide-remote-connection';
import {Cache} from '../../commons-node/cache';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {
  getFileWatcherServiceByNuclideUri,
} from '../../nuclide-remote-connection';
import SharedObservableCache from '../../commons-node/SharedObservableCache';

class Provider {
  _compilationDBCache: Cache<Promise<?ClangCompilationDatabase>> = new Cache();
  _buildFileForSourceCache: Cache<string> = new Cache();
  _watchedFilesCache: Cache<Subscription> = new Cache(subscription =>
    subscription.unsubscribe(),
  );
  _watchedFilesObservablesCache: SharedObservableCache<string, *>;
  _host: NuclideUri;

  constructor(host: NuclideUri) {
    this._host = host;
    this._watchedFilesObservablesCache = this._createWatchedFilesObservablesCache();
  }

  _createWatchedFilesObservablesCache(): SharedObservableCache<string, *> {
    return new SharedObservableCache(buildFile =>
      getFileWatcherServiceByNuclideUri(this._host)
        .watchFileWithNode(buildFile)
        .refCount()
        .share()
        .take(1),
    );
  }

  watchBuildFile(buildFile: string, src: string): void {
    const watchedFile = this._buildFileForSourceCache.get(src);
    if (watchedFile != null) {
      return;
    }
    this._buildFileForSourceCache.set(src, buildFile);
    this._watchedFilesCache.set(
      src,
      this._watchedFilesObservablesCache.get(buildFile).subscribe(() => {
        try {
          this.resetForSource(src);
        } catch (_) {}
      }),
    );
  }

  getCompilationDatabase(src: string): Promise<?ClangCompilationDatabase> {
    return this._compilationDBCache.getOrCreate(src, () => {
      return getBuckServiceByNuclideUri(this._host)
        .getCompilationDatabase(src)
        .refCount()
        .do(db => {
          if (db != null && db.flagsFile != null) {
            this.watchBuildFile(db.flagsFile, src);
          }
        })
        .toPromise();
    });
  }
  resetForSource(src: string): void {
    this._compilationDBCache.delete(src);
    getBuckServiceByNuclideUri(this._host).resetCompilationDatabaseForSource(
      src,
    );
    this._buildFileForSourceCache.delete(src);
    this._watchedFilesCache.delete(src);
  }
  reset(): void {
    this._compilationDBCache.clear();
    getBuckServiceByNuclideUri(this._host).resetCompilationDatabase();
    this._buildFileForSourceCache.clear();
    this._watchedFilesCache.clear();
  }
}

const providersCache = new Cache(provider => provider.reset());

function cacheKeyForProvider(host: NuclideUri): string {
  return nuclideUri.getHostnameOpt(host) || '';
}

function getProvider(host: NuclideUri): Provider {
  return providersCache.getOrCreate(
    cacheKeyForProvider(host),
    () => new Provider(host),
  );
}

export function getClangCompilationDatabaseProvider(): ClangCompilationDatabaseProvider {
  return {
    getCompilationDatabase(src: string): Promise<?ClangCompilationDatabase> {
      return getProvider(src).getCompilationDatabase(src);
    },
    resetForSource(src: string): void {
      getProvider(src).resetForSource(src);
    },
    reset(host: string): void {
      providersCache.delete(cacheKeyForProvider(host));
    },
  };
}
