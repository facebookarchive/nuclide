/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {FileVersion} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';
import type {
  Definition,
  DefinitionQueryResult,
} from '../../nuclide-definition-service/lib/rpc-types';
import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';
import type {CoverageResult} from '../../nuclide-type-coverage/lib/rpc-types';
import type {FindReferencesReturn} from '../../nuclide-find-references/lib/rpc-types';
import type {
  DiagnosticProviderUpdate,
  FileDiagnosticUpdate,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {Completion, LanguageService} from '../../nuclide-language-service/lib/LanguageService';
import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';
import type {ConnectableObservable} from 'rxjs';
import type {CategoryLogger} from '../../nuclide-logging';

import {
  FileCache,
  ConfigObserver,
} from '../../nuclide-open-files-rpc';
import {Cache} from '../../commons-node/cache';
import {Observable} from 'rxjs';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {compact} from '../../commons-node/observable';
import {ConfigCache} from '../../commons-node/ConfigCache';
import {LanguageServerProtocolProcess} from './process';
import {NullLanguageService} from '../../nuclide-language-service-rpc/lib/NullLanguageService';
import {safeSpawn} from '../../commons-node/process';
import {ensureInvalidations} from '../../nuclide-language-service-rpc';

export class PerConnectionLanguageService {
  // Maps project dir => LanguageServerProtocolProcess
  _processes: Cache<NuclideUri, Promise<?LanguageServerProtocolProcess>>;
  _resources: UniversalDisposable;
  _fileCache: FileCache;
  _configCache: ConfigCache;
  _logger: CategoryLogger;
  _fileExtensions: Array<NuclideUri>;

  constructor(
    logger: CategoryLogger,
    fileCache: FileCache,
    command: string,
    projectFileName: string,
    fileExtensions: Array<NuclideUri>,
  ) {
    this._logger = logger;
    this._fileCache = fileCache;
    this._resources = new UniversalDisposable();
    this._configCache = new ConfigCache(projectFileName);
    this._fileExtensions = fileExtensions;

    this._processes = new Cache(
          projectDir => this._createLanguageServerProtocolProcess(
            projectDir, command),
          value => {
            value.then(process => {
              if (process != null) {
                process.dispose();
              }
            });
          });

    this._resources.add(this._processes);

    // Observe projects as they are opened
    const configObserver = new ConfigObserver(
      fileCache,
      fileExtensions,
      filePath => this._configCache.getConfigDir(filePath),
    );
    this._resources.add(
      configObserver,
      configObserver.observeConfigs().subscribe(configs => {
        this._ensureProcesses(configs);
      }));
    this._resources.add(() => {
      this._closeProcesses();
    });


    // Remove fileCache when the remote connection shuts down
    this._resources.add(
      fileCache.observeFileEvents().ignoreElements().subscribe(
        undefined, // next
        undefined, // error
        () => {
          this._logger.logInfo('fileCache shutting down.');
          this._closeProcesses();
        }));
  }

  findProjectDir(filePath: NuclideUri): Promise<?NuclideUri> {
    return this._configCache.getConfigDir(filePath);
  }

  async _getLanguageServerProtocolProcess(
    filePath: string,
  ): Promise<LanguageService> {
    const projectDir = await this.findProjectDir(filePath);
    if (projectDir == null) {
      return new NullLanguageService();
    }

    const process = this._processes.get(projectDir);
    process.then(result => {
      // If we fail to connect, then retry on next request.
      if (result == null) {
        this._processes.delete(projectDir);
      }
    });
    const result = await process;
    if (result == null) {
      return new NullLanguageService();
    } else {
      return result;
    }
  }

  // Ensures that the only attached LanguageServerProtocolProcesses are those
  // for the given configPaths.
  // Closes all LanguageServerProtocolProcesses not in configPaths, and starts
  // new LanguageServerProtocolProcesses for any paths in configPaths.
  _ensureProcesses(configPaths: Set<NuclideUri>): void {
    this._logger.logInfo(
      `PerConnectionLanguageService ensureProcesses. ${Array.from(configPaths).join(', ')}`);
    this._processes.setKeys(configPaths);
  }

  // Closes all LanguageServerProtocolProcesses for this fileCache.
  _closeProcesses(): void {
    this._logger.logInfo(
      'Shutting down LanguageServerProtocolProcesses ' +
      `${Array.from(this._processes.keys()).join(',')}`);
    this._processes.clear();
  }

  _createLanguageServerProtocolProcess(
    projectDir: string,
    command: string,
  ): Promise<?LanguageServerProtocolProcess> {
    return LanguageServerProtocolProcess.create(
      this._logger,
      this._fileCache,
      () => safeSpawn(command), // TODO: current dir, options?
      projectDir,
      this._fileExtensions,
    );
  }

  _observeProcesses(): Observable<LanguageServerProtocolProcess> {
    this._logger.logInfo('observing connections');
    return compact(this._processes.observeValues()
      .switchMap(process => Observable.fromPromise(process)));
  }

  async getDiagnostics(
    fileVersion: FileVersion,
  ): Promise<?DiagnosticProviderUpdate> {
    return (await this._getLanguageServerProtocolProcess(fileVersion.filePath))
      .getDiagnostics(fileVersion);
  }

  observeDiagnostics(): ConnectableObservable<FileDiagnosticUpdate> {
    return this._observeProcesses()
      .mergeMap((process: LanguageServerProtocolProcess) => {
        this._logger.logTrace('observeDiagnostics');
        return ensureInvalidations(
            this._logger,
            process.observeDiagnostics()
            .refCount()
            .catch(error => {
              this._logger.logError(`Error: observeDiagnostics ${error}`);
              return Observable.empty();
            }));
      }).publish();
  }

  async getAutocompleteSuggestions(
    fileVersion: FileVersion,
    position: atom$Point,
    activatedManually: boolean,
    prefix: string,
  ): Promise<?Array<Completion>> {
    return (await this._getLanguageServerProtocolProcess(fileVersion.filePath))
      .getAutocompleteSuggestions(fileVersion, position, activatedManually, prefix);
  }

  async getDefinition(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    return (await this._getLanguageServerProtocolProcess(fileVersion.filePath))
      .getDefinition(fileVersion, position);
  }

  async getDefinitionById(
    file: NuclideUri,
    id: string,
  ): Promise<?Definition> {
    return (await this._getLanguageServerProtocolProcess(file))
      .getDefinitionById(file, id);
  }

  async findReferences(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?FindReferencesReturn> {
    return (await this._getLanguageServerProtocolProcess(fileVersion.filePath))
      .findReferences(fileVersion, position);
  }

  async getCoverage(
    filePath: NuclideUri,
  ): Promise<?CoverageResult> {
    return (await this._getLanguageServerProtocolProcess(filePath))
      .getCoverage(filePath);
  }

  async getOutline(
    fileVersion: FileVersion,
  ): Promise<?Outline> {
    return (await this._getLanguageServerProtocolProcess(fileVersion.filePath))
      .getOutline(fileVersion);
  }

  async typeHint(fileVersion: FileVersion, position: atom$Point): Promise<?TypeHint> {
    return (await this._getLanguageServerProtocolProcess(fileVersion.filePath))
      .typeHint(fileVersion, position);
  }

  async highlight(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?Array<atom$Range>> {
    return (await this._getLanguageServerProtocolProcess(fileVersion.filePath))
      .highlight(fileVersion, position);
  }

  async formatSource(
    fileVersion: FileVersion,
    range: atom$Range,
  ): Promise<?string> {
    return (await this._getLanguageServerProtocolProcess(fileVersion.filePath))
      .formatSource(fileVersion, range);
  }

  async formatEntireFile(fileVersion: FileVersion, range: atom$Range): Promise<?{
    newCursor?: number,
    formatted: string,
  }> {
    return (await this._getLanguageServerProtocolProcess(fileVersion.filePath))
      .formatEntireFile(fileVersion, range);
  }

  async getEvaluationExpression(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    return (await this._getLanguageServerProtocolProcess(fileVersion.filePath))
      .getEvaluationExpression(fileVersion, position);
  }

  async getProjectRoot(filePath: NuclideUri): Promise<?NuclideUri> {
    return (await this._getLanguageServerProtocolProcess(filePath))
      .getProjectRoot(filePath);
  }

  async isFileInProject(filePath: NuclideUri): Promise<boolean> {
    return (await this._getLanguageServerProtocolProcess(filePath))
      .isFileInProject(filePath);
  }

  dispose(): void {
    this._resources.dispose();
  }
}
