'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {DefinitionQueryResult} from '../../nuclide-definition-service/lib/rpc-types';
import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';
import typeof * as HackService from '../../nuclide-hack-rpc/lib/HackService';
import type {HackLanguageService} from '../../nuclide-hack-rpc/lib/HackService';
import type {FileVersion} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';
import type {Definition} from '../../nuclide-definition-service/lib/rpc-types';
import type {CoverageResult} from '../../nuclide-type-coverage/lib/rpc-types';
import type {FindReferencesReturn} from '../../nuclide-find-references/lib/rpc-types';
import type {
  DiagnosticProviderUpdate,
  FileDiagnosticUpdate,
} from '../../nuclide-diagnostics-common/lib/rpc-types';

import {ConnectionCache, getServiceByConnection} from '../../nuclide-remote-connection';
import {getConfig} from './config';
import {getNotifierByConnection} from '../../nuclide-open-files';
import {Observable} from 'rxjs';

/**
 * Serves language requests from HackService.
 * Note that all line/column values are 1 based.
 */
export class HackLanguage {

  _hackService: HackLanguageService;

  /**
   * `basePath` should be the directory where the .hhconfig file is located.
   */
  constructor(hackService: HackLanguageService) {
    this._hackService = hackService;
  }

  dispose() {
  }

  getLanguageService(): HackLanguageService {
    return this._hackService;
  }

  getProjectRoot(filePath: NuclideUri): Promise<?NuclideUri> {
    return this._hackService.getProjectRoot(filePath);
  }

  isFileInHackProject(fileUri: NuclideUri): Promise<boolean> {
    return this._hackService.isFileInHackProject(fileUri);
  }

  getAutocompleteSuggestions(
    fileVersion: FileVersion,
    position: atom$Point,
    activatedManually: boolean,
  ): Promise<Array<atom$AutocompleteSuggestion>> {
    return this._hackService.getAutocompleteSuggestions(fileVersion, position, activatedManually);
  }

  async formatSource(
    fileVersion: FileVersion,
    range: atom$Range,
  ): Promise<string> {
    return this._hackService.formatSource(fileVersion, range);
  }

  async highlight(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<Array<atom$Range>> {
    return this._hackService.highlight(fileVersion, position);
  }

  async getDiagnostics(
    fileVersion: FileVersion,
  ): Promise<?DiagnosticProviderUpdate> {
    return this._hackService.getDiagnostics(fileVersion);
  }

  observeDiagnostics(): Observable<FileDiagnosticUpdate> {
    return this._hackService.observeDiagnostics().refCount();
  }

  async getCoverage(
    filePath: NuclideUri,
  ): Promise<?CoverageResult> {
    return await this._hackService.getCoverage(filePath);
  }

  getOutline(fileVersion: FileVersion): Promise<?Outline> {
    return this._hackService.getOutline(fileVersion);
  }

  getDefinition(fileVersion: FileVersion, position: atom$Point): Promise<?DefinitionQueryResult> {
    return this._hackService.getDefinition(fileVersion, position);
  }

  getDefinitionById(filePath: NuclideUri, id: string): Promise<?Definition> {
    return this._hackService.getDefinitionById(filePath, id);
  }

  typeHint(fileVersion: FileVersion, position: atom$Point): Promise<?TypeHint> {
    return this._hackService.typeHint(fileVersion, position);
  }

  findReferences(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?FindReferencesReturn> {
    return this._hackService.findReferences(fileVersion, position);
  }
}

const HACK_SERVICE_NAME = 'HackService';

const connectionToHackLanguage: ConnectionCache<HackLanguage>
  = new ConnectionCache(async connection => {
    const hackService: HackService = getServiceByConnection(HACK_SERVICE_NAME, connection);
    const config = getConfig();
    const useIdeConnection = config.useIdeConnection;
    // TODO:     || (await passesGK('nuclide_hack_use_persistent_connection'));
    const fileNotifier = await getNotifierByConnection(connection);
    const languageService = await hackService.initialize(
      config.hhClientPath,
      useIdeConnection,
      config.logLevel,
      fileNotifier);

    return new HackLanguage(languageService);
  });

export async function getHackLanguageForUri(uri: ?NuclideUri): Promise<?HackLanguage> {
  return await connectionToHackLanguage.getForUri(uri);
}

export function clearHackLanguageCache(): void {
  connectionToHackLanguage.dispose();
}

export async function getHackServiceByNuclideUri(
  fileUri: NuclideUri,
): Promise<?HackLanguageService> {
  const language = await getHackLanguageForUri(fileUri);
  if (language == null) {
    return null;
  }
  return language.getLanguageService();
}

export async function isFileInHackProject(fileUri: NuclideUri): Promise<bool> {
  const language = await getHackLanguageForUri(fileUri);
  if (language == null) {
    return false;
  }
  return await language.isFileInHackProject(fileUri);
}

/**
 * @return HackService for the specified directory if it is part of a Hack project.
 */
export async function getHackServiceForProject(
  directory: atom$Directory,
): Promise<?HackLanguageService> {
  const directoryPath = directory.getPath();
  return (await isFileInHackProject(directoryPath))
    ? (await getHackServiceByNuclideUri(directoryPath)) : null;
}

export function observeHackLanguages(): Observable<HackLanguage> {
  return connectionToHackLanguage.observeValues()
    .switchMap(hackLanguage => {
      return Observable.fromPromise(hackLanguage);
    });
}
