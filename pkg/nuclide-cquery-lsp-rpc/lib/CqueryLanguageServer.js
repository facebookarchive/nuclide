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
import type {ClangRequestSettings} from '../../nuclide-clang-rpc/lib/rpc-types';
import type {HostServices} from '../../nuclide-language-service-rpc/lib/rpc-types';

import fs from 'nuclide-commons/fsPromise';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Observable} from 'rxjs';
import {
  MultiProjectLanguageService,
  forkHostServices,
} from '../../nuclide-language-service-rpc';
import {FileCache} from '../../nuclide-open-files-rpc';
import {Cache} from 'nuclide-commons/cache';
import {CqueryLanguageClient} from './CqueryLanguageClient';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

const COMPILATION_DATABASE_FILE = 'compile_commands.json';

type ManagedRoot = {
  files: Set<string>,
  watchFile: string,
  rootDir: string,
  compilationDatabaseDir: string,
};

export default class CqueryLanguageServer extends MultiProjectLanguageService<
  CqueryLanguageClient,
> {
  // Maps clang settings => settings metadata with same key as _processes field.
  _managedRoots: Map<string, Promise<ManagedRoot>> = new Map();

  constructor(
    languageId: string,
    command: string,
    logger: log4js$Logger,
    fileCache: FileCache,
    host: HostServices,
  ) {
    super();

    this._resources = new UniversalDisposable();

    this._logger = logger;
    const server = this; // Access class scope within closure.
    async function cqueryServiceFactory(
      managedRootKey: string,
    ): Promise<?CqueryLanguageClient> {
      const managedRoot = await server._managedRoots.get(managedRootKey);
      // Only proceed if we added the compile commands via addClangRequest
      if (!managedRoot) {
        return null;
      }
      const {rootDir, compilationDatabaseDir} = managedRoot;
      const args = ['--language-server'];
      await server.hasObservedDiagnostics();
      const initializationOptions = {
        // TODO pelmers: expose some of these in the atom config
        ...server._getInitializationOptions(),
        compilationDatabaseDirectory: compilationDatabaseDir,
        cacheDirectory: nuclideUri.join(compilationDatabaseDir, 'cquery_cache'),
        clientVersion: 3,
      };

      const lsp = new CqueryLanguageClient(
        logger,
        fileCache,
        await forkHostServices(host, logger),
        languageId,
        command,
        args,
        {}, // spawnOptions
        rootDir,
        ['.cpp', '.h', '.hpp', '.cc'],
        initializationOptions,
        5 * 60 * 1000, // 5 minutes
      );

      lsp.start(); // Kick off 'Initializing'...
      return lsp;
    }

    this._processes = new Cache(cqueryServiceFactory, value => {
      value.then(service => {
        if (service != null) {
          service.dispose();
        }
      });
    });

    this._resources.add(
      host,
      this._processes,
      () => this._closeProcesses(),
      // Remove fileCache when the remote connection shuts down
      this._observeFileSaveEvents(fileCache).subscribe(
        keys => this._invalidateManagedRootKeys(keys),
        undefined, // error
        () => {
          this._logger.info('fileCache shutting down.');
          this._closeProcesses();
        },
      ),
    );
  }

  _observeFileSaveEvents(fileCache: FileCache): Observable<Array<string>> {
    return fileCache
      .observeFileEvents()
      .filter(event => event.kind === 'save')
      .switchMap(({fileVersion: {filePath}}) =>
        Observable.fromPromise(
          Promise.all(
            Array.from(this._managedRoots.entries()).map(([key, valPromise]) =>
              valPromise.then(value => ({key, value})),
            ),
          ).then(entries =>
            // Keep only the roots that are watching the saved file.
            entries
              .filter(({value}) => value.watchFile === filePath)
              .map(({key}) => key),
          ),
        ),
      );
  }

  _invalidateManagedRootKeys(keys: Array<string>): void {
    for (const key of keys) {
      this._logger.info('Watch file saved, invalidating ' + key);
      this._processes.delete(key);
      this._managedRoots.delete(key);
    }
  }

  _getInitializationOptions(): Object {
    // Copied from the corresponding vs-code plugin
    return {
      indexWhitelist: [],
      indexBlacklist: [],
      extraClangArguments: [],
      resourceDirectory: '',
      maxWorkspaceSearchResults: 1000,
      indexerCount: 0,
      enableIndexing: true,
      enableCacheWrite: true,
      enableCacheRead: true,
      includeCompletionMaximumPathLength: 37,
      includeCompletionWhitelistLiteralEnding: ['.h', '.hpp', '.hh'],
      includeCompletionWhitelist: [],
      includeCompletionBlacklist: [],
      showDocumentLinksOnIncludes: true,
      diagnosticsOnParse: true,
      diagnosticsOnCodeCompletion: true,
      codeLensOnLocalVariables: false,
      enableSnippetInsertion: true,
    };
  }

  async _setupManagedRoot(
    dbFile: string,
    flagsFile: string,
    rootDir: string,
  ): Promise<ManagedRoot> {
    // Add the files of this database to the managed map.
    const contents = await fs.readFile(dbFile);
    // Trigger the factory to construct the server.
    this._processes.get(dbFile);
    return {
      rootDir,
      watchFile: flagsFile,
      files: new Set(JSON.parse(contents.toString()).map(entry => entry.file)),
      compilationDatabaseDir: nuclideUri.dirname(dbFile),
    };
  }

  async addClangRequest(clangRequest: ClangRequestSettings): Promise<boolean> {
    // Start new server for compile commands path and add to managed list.
    // Return whether successful.
    const database = clangRequest.compilationDatabase;
    if (database == null) {
      return false;
    }
    const {flagsFile} = database;
    const dbFile = database.file;
    if (dbFile == null || flagsFile == null) {
      return false;
    }

    if (!this._managedRoots.has(dbFile)) {
      this._managedRoots.set(
        dbFile,
        this._setupManagedRoot(
          dbFile,
          flagsFile,
          clangRequest.projectRoot != null
            ? clangRequest.projectRoot
            : nuclideUri.dirname(flagsFile),
        ),
      );
    }
    return true;
  }

  async isFileKnown(filePath: NuclideUri): Promise<boolean> {
    // TODO pelmers: header files are always false here, but we could borrow
    // ClangFlagsManager._findSourceFileForHeaderFromCompilationDatabase
    return this._getCompilationDbForFile(filePath) != null;
  }

  async _findExistingManagedRootForFile(
    filePath: NuclideUri,
  ): Promise<?ManagedRoot> {
    const absPath = nuclideUri.getPath(filePath);
    const resolvedRoots = await Promise.all(this._managedRoots.values());
    return resolvedRoots.find(managedRoot => managedRoot.files.has(absPath));
  }

  async _findClosestCompilationDb(filePath: NuclideUri): Promise<?string> {
    const dbDir = await fs.findNearestFile(
      COMPILATION_DATABASE_FILE,
      nuclideUri.dirname(filePath),
    );
    return dbDir == null
      ? null
      : nuclideUri.join(dbDir, COMPILATION_DATABASE_FILE);
  }

  _createFallbackClangRequestSettingsFromDbFile(
    dbFile: string,
    projectRoot: string,
  ): ClangRequestSettings {
    const compilationDatabase = {
      file: dbFile,
      flagsFile: dbFile,
      libclangPath: null,
    };
    return {projectRoot, compilationDatabase};
  }

  async _findAndRegisterFallbackDbFile(filePath: NuclideUri): Promise<?string> {
    const dbFile = await this._findClosestCompilationDb(filePath);
    if (dbFile != null) {
      if (
        await this.addClangRequest(
          this._createFallbackClangRequestSettingsFromDbFile(
            dbFile,
            nuclideUri.dirname(dbFile),
          ),
        )
      ) {
        return dbFile;
      }
    }
    return null;
  }

  async _getCompilationDbForFile(filePath: NuclideUri): Promise<?string> {
    const resolvedRoot = await this._findExistingManagedRootForFile(filePath);
    return resolvedRoot != null
      ? nuclideUri.join(
          resolvedRoot.compilationDatabaseDir,
          COMPILATION_DATABASE_FILE,
        )
      : this._findAndRegisterFallbackDbFile(filePath);
  }

  async getLanguageServiceForFile(
    filePath: NuclideUri,
  ): Promise<?CqueryLanguageClient> {
    // TODO(wallace): instead of using the db file, we should include the
    // request settings from the client
    const commandsPath = await this._getCompilationDbForFile(filePath);
    if (commandsPath != null) {
      this._logger.info('Found existing service for ' + filePath);
      this._logger.info('Key: ' + commandsPath);
      const result = this._processes.get(commandsPath);
      if (result == null) {
        // Delete so we retry next time.
        this._processes.delete(commandsPath);
      }
      return result;
    }
    return null;
  }
}
