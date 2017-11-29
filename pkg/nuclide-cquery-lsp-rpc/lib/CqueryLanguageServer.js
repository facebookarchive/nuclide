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

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {
  MultiProjectLanguageService,
  forkHostServices,
} from '../../nuclide-language-service-rpc';
import {FileCache} from '../../nuclide-open-files-rpc';
import {Cache} from 'nuclide-commons/cache';
import {getInitializationOptions} from './CqueryInitialization';
import {CqueryInvalidator} from './CqueryInvalidator';
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
    this._logger = logger;

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
      new CqueryInvalidator(
        this._fileCache,
        this._projectManager,
        this._logger,
        this._processes,
      ).subscribe(),
      () => this._closeProcesses(),
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
    if (project == null) {
      return null;
    }

    const initalizationOptions = await getInitializationOptions(project);
    if (initalizationOptions == null) {
      return null;
    }
    this._logger.info(
      `Using cache dir: ${initalizationOptions.cacheDirectory}`,
    );

    const [, host] = await Promise.all([
      this.hasObservedDiagnostics(),
      forkHostServices(this._host, this._logger),
    ]);

    const lsp = new CqueryLanguageClient(
      this._logger,
      this._fileCache,
      host,
      this._languageId,
      this._command,
      ['--language-server'], // args
      {}, // spawnOptions
      project.projectRoot,
      ['.cpp', '.h', '.hpp', '.cc'],
      initalizationOptions,
      5 * 60 * 1000, // 5 minutes
    );

    lsp.start(); // Kick off 'Initializing'...
    return lsp;
  }

  async freshenIndexForFile(file: NuclideUri): Promise<void> {
    const cqueryProcess = await this.getLanguageServiceForFile(file);
    if (cqueryProcess) {
      cqueryProcess.freshenIndex();
    } else {
      this._host.consoleNotification(
        this._languageId,
        'warning',
        'Could not freshen: no cquery index found for ' + file,
      );
    }
  }

  async associateFileWithProject(
    file: NuclideUri,
    project: CqueryProject,
  ): Promise<void> {
    this._projectManager.associateFileWithProject(file, project);
    this._processes.get(this._projectManager.getProjectKey(project));
  }

  async getLanguageServiceForFile(
    file: string,
  ): Promise<?CqueryLanguageClient> {
    const project = await this._projectManager.getProjectForFile(file);
    return project == null ? null : this._getLanguageServiceForProject(project);
  }

  async _getLanguageServiceForProject(
    project: CqueryProject,
  ): Promise<?CqueryLanguageClient> {
    const key = this._projectManager.getProjectKey(project);
    const client = this._processes.get(key);
    if (client == null) {
      this._logger.warn("Didn't find language service for ", project);
      return null;
    }
    if ((await client) == null) {
      this._logger.warn('Found invalid language service for ', project);
      this._processes.delete(key); // Delete so we retry next time.
      return null;
    } else {
      this._logger.info('Found existing language service for ', project);
      return client;
    }
  }
}
