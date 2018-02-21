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
import type {
  CqueryProject,
  CqueryProjectKey,
  RequestLocationsResult,
} from './types';
import type {CqueryLanguageService} from '..';

import fsPromise from 'nuclide-commons/fsPromise';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {getOriginalEnvironment} from 'nuclide-commons/process';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {isHeaderFile} from '../../nuclide-clang-rpc/lib/utils';
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

export default class CqueryLanguageServer extends MultiProjectLanguageService<
  CqueryLanguageClient,
> implements CqueryLanguageService {
  // Maps clang settings => settings metadata with same key as _processes field.
  _projectManager: CqueryProjectManager;
  _projectInvalidator: CqueryInvalidator;
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
    enableLibclangLogs: boolean,
  ) {
    super();
    // Invalidator disposes a project which then disposes the process.
    const disposeProject = project => this._projectManager.delete(project);
    const disposeProcess = projectKey => {
      this._processes.delete(projectKey);
    };
    this._fileCache = fileCache;
    this._command = command;
    this._host = host;
    this._languageId = languageId;
    this._logger = logger;
    this._projectManager = new CqueryProjectManager(logger, disposeProcess);
    this._projectInvalidator = new CqueryInvalidator(
      fileCache,
      logger,
      disposeProject,
      () => this._projectManager.getMRUProjects(),
      async project => {
        const key = CqueryProjectManager.getProjectKey(project);
        if (this._processes.has(key)) {
          const lsp = await this._processes.get(key);
          return lsp != null ? lsp._childPid : null;
        }
      },
    );

    this._processes = new Cache(
      (projectKey: CqueryProjectKey) =>
        this._createCqueryLanguageClient(projectKey, enableLibclangLogs),
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
      this._projectInvalidator.subscribeFileEvents(),
      this._projectInvalidator.subscribeResourceUsage(),
      this._processes,
    );
  }

  dispose(): void {
    this._disposables.dispose();
    super.dispose();
  }

  async _createCqueryLanguageClient(
    projectKey: CqueryProjectKey,
    enableLibclangLogs: boolean,
  ): Promise<?CqueryLanguageClient> {
    const project = this._projectManager.getProjectFromKey(projectKey);
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

    const stderrFd = await fsPromise.open(
      nuclideUri.join(initalizationOptions.cacheDirectory, '..', 'stderr'),
      'a',
    );
    const spawnOptions = {
      stdio: ['pipe', 'pipe', stderrFd],
      env: {...(await getOriginalEnvironment())},
    };
    if (enableLibclangLogs) {
      spawnOptions.env.LIBCLANG_LOGGING = 1;
    }
    const lsp = new CqueryLanguageClient(
      this._logger,
      this._fileCache,
      host,
      this._languageId,
      this._command,
      [
        '--language-server',
        '--log-file',
        nuclideUri.join(
          initalizationOptions.cacheDirectory,
          '..',
          'diagnostics',
        ),
      ],
      spawnOptions,
      project.hasCompilationDb
        ? nuclideUri.dirname(project.flagsFile)
        : project.projectRoot,
      ['.cpp', '.h', '.hpp', '.cc', '.m', 'mm'],
      initalizationOptions,
      5 * 60 * 1000, // 5 minutes
    );

    lsp.setProjectChecker(file => {
      const checkProject = this._projectManager.getProjectForFile(file);
      return checkProject != null
        ? CqueryProjectManager.getProjectKey(checkProject) === projectKey
        : // TODO pelmers: header files aren't in the map because they do not
          // appear in compile_commands.json, but they should be cached!
          isHeaderFile(file);
    });
    lsp.setProgressInfo({id: projectKey, label: lsp._projectRoot});
    lsp.start(); // Kick off 'Initializing'...
    return lsp;
  }

  async requestLocationsCommand(
    methodName: string,
    path: NuclideUri,
    point: atom$Point,
  ): Promise<RequestLocationsResult> {
    const cqueryProcess = await this.getLanguageServiceForFile(path);
    if (cqueryProcess) {
      return cqueryProcess.requestLocationsCommand(methodName, path, point);
    } else {
      this._host.consoleNotification(
        this._languageId,
        'warning',
        'Could not freshen: no cquery index found for ' + path,
      );
      return [];
    }
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
    await this._projectManager.associateFileWithProject(file, project);
    this._processes.get(CqueryProjectManager.getProjectKey(project)); // spawn the process ahead of time
  }

  async getLanguageServiceForFile(
    file: string,
  ): Promise<?CqueryLanguageClient> {
    const project = this._projectManager.getProjectForFile(file);
    return project == null ? null : this._getLanguageServiceForProject(project);
  }

  async _getLanguageServiceForProject(
    project: CqueryProject,
  ): Promise<?CqueryLanguageClient> {
    const key = CqueryProjectManager.getProjectKey(project);
    const client = this._processes.get(key);
    if ((await client) == null) {
      this._logger.warn("Didn't find language service for ", project);
      return null;
    } else {
      this._logger.info('Found existing language service for ', project);
      return client;
    }
  }
}
