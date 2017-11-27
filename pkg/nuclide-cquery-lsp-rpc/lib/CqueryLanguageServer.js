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
import type {HostServices} from '../../nuclide-language-service-rpc/lib/rpc-types';
import type {CqueryProject, CqueryProjectKey} from './types';

import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable} from 'rxjs';
import {
  MultiProjectLanguageService,
  forkHostServices,
} from '../../nuclide-language-service-rpc';
import {FileCache} from '../../nuclide-open-files-rpc';
import {Cache} from 'nuclide-commons/cache';
import {CqueryLanguageClient} from './CqueryLanguageClient';
import {CqueryProjectManager} from './CqueryProjectManager';
import type {CqueryLanguageService} from '..';

export const COMPILATION_DATABASE_FILE = 'compile_commands.json';

export default class CqueryLanguageServer extends MultiProjectLanguageService<
  CqueryLanguageClient,
> implements CqueryLanguageService {
  // Maps clang settings => settings metadata with same key as _processes field.
  _projectManager: CqueryProjectManager = new CqueryProjectManager();
  _fileCache: FileCache;
  _command: string;
  _host: HostServices;
  _languageId: string;
  _disposables = new UniversalDisposable();
  __logger: log4js$Logger;

  constructor(
    languageId: string,
    command: string,
    logger: log4js$Logger,
    fileCache: FileCache,
    host: HostServices,
  ) {
    super();

    this._fileCache = fileCache;
    this._command = command;
    this._host = host;
    this._languageId = languageId;
    this.__logger = logger;

    this._processes = new Cache(
      (projectKey: CqueryProjectKey) =>
        this._createCqueryLanguageClient(projectKey),
      value => {
        value.then(service => {
          if (service != null) {
            service.dispose();
          }
        });
      },
    );

    this._registerDisposables();
  }

  _registerDisposables(): void {
    this._disposables.add(
      this._host,
      this._processes,
      () => this._closeProcesses(),
      // Remove fileCache when the remote connection shuts down
      this._observeFileSaveEvents(this._fileCache).subscribe(
        projects => this._invalidateProjects(projects),
        undefined, // error
        () => {
          this.__logger.info('fileCache shutting down.');
          this._closeProcesses();
        },
      ),
    );
  }

  dispose(): void {
    this._disposables.dispose();
    super.dispose();
  }

  async _createCqueryLanguageClient(
    projectKey: CqueryProjectKey,
  ): Promise<?CqueryLanguageClient> {
    const project = await this._projectManager.getProjectFromKey(projectKey);
    if (project == null || !project.hasCompilationDb) {
      return null;
    }
    const {projectRoot, compilationDbDir} = project;
    await this.hasObservedDiagnostics();
    const initializationOptions = {
      ...this._getInitializationOptions(),
      compilationDatabaseDirectory: compilationDbDir,
      cacheDirectory: nuclideUri.join(compilationDbDir, 'cquery_cache'),
    };

    const lsp = new CqueryLanguageClient(
      this.__logger,
      this._fileCache,
      await forkHostServices(this._host, this.__logger),
      this._languageId,
      this._command,
      ['--language-server'], // args
      {}, // spawnOptions
      projectRoot,
      ['.cpp', '.h', '.hpp', '.cc'],
      initializationOptions,
      5 * 60 * 1000, // 5 minutes
    );

    lsp.start(); // Kick off 'Initializing'...
    return lsp;
  }

  _observeFileSaveEvents(
    fileCache: FileCache,
  ): Observable<Array<CqueryProject>> {
    return fileCache
      .observeFileEvents()
      .filter(event => event.kind === 'save')
      .map(({fileVersion: {filePath}}) =>
        this._projectManager
          .getAllProjects()
          .filter(
            project =>
              project.hasCompilationDb && project.flagsFile === filePath,
          ),
      );
  }

  _invalidateProjects(projects: Array<CqueryProject>): void {
    for (const project of projects) {
      this.__logger.info('Watch file saved, invalidating: ', project);
      this._processes.delete(this._projectManager.getProjectKey(project));
      this._projectManager.delete(project);
    }
  }

  // TODO pelmers: expose some of these in the atom config
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
      clientVersion: 3,
    };
  }

  async registerFile(file: NuclideUri, project: CqueryProject): Promise<void> {
    this._projectManager.registerFile(file, project);
    this._processes.get(this._projectManager.getProjectKey(project));
  }

  async getLanguageServiceForFile(
    file: string,
  ): Promise<?CqueryLanguageClient> {
    const project = await this._projectManager.getProjectForFile(file);
    if (project != null) {
      const key = this._projectManager.getProjectKey(project);
      this.__logger.info('Found existing service for ', project);
      const result = this._processes.get(key);
      if (result != null) {
        if ((await result) == null) {
          // Delete so we retry next time.
          this._processes.delete(key);
        } else {
          return result;
        }
      }
    }
    return null;
  }
}
