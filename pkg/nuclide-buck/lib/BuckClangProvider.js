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

import type {BuckClangCompilationDatabase} from '../../nuclide-buck-rpc/lib/types';
import type {ClangRequestSettings} from '../../nuclide-clang-rpc/lib/rpc-types';
import type {ClangConfigurationProvider} from '../../nuclide-clang/lib/types';
import type {BusySignalService} from 'atom-ide-ui';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {CompilationDatabaseParams, ConsolePrinter} from './types';

import {convertBuckClangCompilationDatabase} from '../../nuclide-buck-rpc/lib/types';
import {track} from '../../nuclide-analytics';
import {getBuckServiceByNuclideUri} from '../../nuclide-remote-connection';
import {Cache} from '../../commons-node/cache';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {BuckTaskRunner, CONSOLE_VIEW_URI} from './BuckTaskRunner';
import {ClangFlagsFileWatcher} from '../../nuclide-clang-base/lib/ClangFlagsFileWatcher';

const WARNING_HINT =
  'Hint: Try **Nuclide > Clang > Clean and Rebuild** once fixed.';

// Strip off remote error, which is JSON object on last line of error message.
function cleanupErrorMessage(message: string): string {
  const trimmed = message.trim();
  const lastNewline = trimmed.lastIndexOf('\n');
  if (lastNewline !== -1) {
    return trimmed.substring(0, lastNewline);
  }
  return trimmed;
}

function constructNotificationOptions(
  clickCallback?: () => void,
): atom$NotificationOptions {
  const buttons = [
    {
      text: 'Show in console',
      onDidClick: () => {
        // eslint-disable-next-line rulesdir/atom-apis
        atom.workspace.open(CONSOLE_VIEW_URI, {searchAllPanes: true});
        if (clickCallback) {
          clickCallback();
        }
      },
    },
  ];
  return {dismissable: true, buttons};
}

function emitCompilationDbWarnings(
  db: BuckClangCompilationDatabase,
  consolePrinter: ?ConsolePrinter,
): void {
  if (db.warnings.length > 0) {
    if (consolePrinter) {
      db.warnings.forEach(text => consolePrinter({text, level: 'warning'}));
    }
    const notification = atom.notifications.addWarning(
      [
        'Buck: warnings detected while fetching compile commands,',
        'some language services may not work properly.',
        WARNING_HINT,
      ].join(' '),
      constructNotificationOptions(() =>
        // Notification doesn't dismiss itself on click.
        notification.dismiss(),
      ),
    );
  }
}

function emitCompilationDbError(
  errorMessage: string,
  consolePrinter: ?ConsolePrinter,
): void {
  if (consolePrinter) {
    consolePrinter({text: cleanupErrorMessage(errorMessage), level: 'error'});
  }
  const notification = atom.notifications.addError(
    [
      'Buck error: build failed while fetching compile commands.',
      WARNING_HINT,
    ].join(' '),
    constructNotificationOptions(() => notification.dismiss()),
  );
}

class Provider {
  _projectRootCache: Cache<string, Promise<?string>> = new Cache();
  _compilationDBCache: Cache<
    string,
    Promise<?BuckClangCompilationDatabase>,
  > = new Cache();

  _host: NuclideUri;
  _params: CompilationDatabaseParams;
  _flagsFileWatcher: ClangFlagsFileWatcher;

  constructor(host: NuclideUri, params: CompilationDatabaseParams) {
    this._host = host;
    this._flagsFileWatcher = new ClangFlagsFileWatcher(host);
    this._params = params;
  }

  _reportCompilationDBBusySignalWhile(
    src: string,
    getBusySignalService: () => ?BusySignalService,
    dbPromise: Promise<?BuckClangCompilationDatabase>,
  ): Promise<?BuckClangCompilationDatabase> {
    const busySignal = getBusySignalService();
    return busySignal == null
      ? dbPromise
      : busySignal.reportBusyWhile(
          'Generating Buck compilation database for "' +
            nuclideUri.basename(src) +
            '"',
          () => dbPromise,
        );
  }

  getCompilationDatabase(
    src: string,
    getBusySignalService: () => ?BusySignalService,
    getConsolePrinter: () => ?ConsolePrinter,
  ): Promise<?BuckClangCompilationDatabase> {
    const consolePrinter = getConsolePrinter();
    return this._compilationDBCache.getOrCreate(src, () => {
      return this._reportCompilationDBBusySignalWhile(
        src,
        getBusySignalService,
        getBuckServiceByNuclideUri(this._host)
          .getCompilationDatabase(src, this._params)
          .refCount()
          .do(db => {
            if (db != null && db.flagsFile != null) {
              this._flagsFileWatcher.watch(db.flagsFile, src, () =>
                this.resetForSource(src),
              );
            }
            if (db != null) {
              emitCompilationDbWarnings(db, consolePrinter);
            }
            track('buck-clang.getSettings', {
              src,
              db,
              warningsLength: db != null ? db.warnings.length : 0,
            });
          })
          .toPromise()
          .catch(error => {
            emitCompilationDbError(error.message, consolePrinter);
          }),
      );
    });
  }

  getProjectRoot(src: string): Promise<?string> {
    return this._projectRootCache.getOrCreate(src, () =>
      getBuckServiceByNuclideUri(this._host).getRootForPath(src),
    );
  }

  resetForSource(src: string): void {
    this._compilationDBCache.delete(src);
    getBuckServiceByNuclideUri(this._host).resetCompilationDatabaseForSource(
      src,
      this._params,
    );
    this._flagsFileWatcher.resetForSource(src);
  }

  reset(): void {
    this._compilationDBCache.clear();
    getBuckServiceByNuclideUri(this._host).resetCompilationDatabase(
      this._params,
    );
    this._flagsFileWatcher.reset();
  }
}

const providersCache = new Cache({
  keyFactory: ([host, params: CompilationDatabaseParams]) =>
    JSON.stringify([nuclideUri.getHostnameOpt(host) || '', params]),
  dispose: provider => provider.reset(),
});

function getProvider(
  host: NuclideUri,
  params: CompilationDatabaseParams,
): Provider {
  return providersCache.getOrCreate(
    [host, params],
    () => new Provider(host, params),
  );
}

const supportsSourceCache: Cache<string, Promise<boolean>> = new Cache();

export function getClangProvider(
  taskRunner: BuckTaskRunner,
  getBusySignalService: () => ?BusySignalService,
  getConsolePrinter: () => ?ConsolePrinter,
): ClangConfigurationProvider {
  return {
    async supportsSource(src: string): Promise<boolean> {
      return supportsSourceCache.getOrCreate(
        src,
        async () =>
          (await getBuckServiceByNuclideUri(src).getRootForPath(src)) != null,
      );
    },
    async getSettings(src: string): Promise<?ClangRequestSettings> {
      const params = taskRunner.getCompilationDatabaseParamsForCurrentContext();
      const provider = getProvider(src, params);
      const [buckCompilationDatabase, projectRoot] = await Promise.all([
        provider.getCompilationDatabase(
          src,
          getBusySignalService,
          getConsolePrinter,
        ),
        provider.getProjectRoot(src),
      ]);
      if (projectRoot == null) {
        return null;
      }
      return {
        projectRoot,
        compilationDatabase: convertBuckClangCompilationDatabase(
          buckCompilationDatabase,
        ),
      };
    },
    resetForSource(src: string): void {
      const params = taskRunner.getCompilationDatabaseParamsForCurrentContext();
      getProvider(src, params).resetForSource(src);
      supportsSourceCache.delete(src);
    },
    reset(src: string): void {
      const params = taskRunner.getCompilationDatabaseParamsForCurrentContext();
      providersCache.delete([src, params]);
      supportsSourceCache.clear();
    },
    priority: 100,
  };
}
