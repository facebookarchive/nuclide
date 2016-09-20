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
import type {
  HackParameterDetails,
  HackCompletion,
} from '../../nuclide-hack-rpc/lib/rpc-types';
import type {HackDiagnostic} from '../../nuclide-hack-rpc/lib/HackService';
import type {DefinitionQueryResult} from '../../nuclide-definition-service/lib/rpc-types';
import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';
import typeof * as HackService from '../../nuclide-hack-rpc/lib/HackService';
import type {HackLanguageService} from '../../nuclide-hack-rpc/lib/HackService';
import type {FileVersion} from '../../nuclide-open-files-common/lib/rpc-types';
import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';
import type {Definition} from '../../nuclide-definition-service/lib/rpc-types';
import type {CoverageResult} from '../../nuclide-type-coverage/lib/rpc-types';
import type {FindReferencesReturn} from '../../nuclide-find-references/lib/rpc-types';

import {ConnectionCache, getServiceByConnection} from '../../nuclide-remote-connection';
import {getLogger} from '../../nuclide-logging';
import {getConfig} from './config';

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

  async getCompletions(
    filePath: NuclideUri,
    contents: string,
    offset: number,
    line: number,
    column: number,
  ): Promise<Array<atom$AutocompleteSuggestion>> {
    const completions = await this._hackService.getCompletions(
      filePath, contents, offset, line, column);
    if (completions == null) {
      return [];
    }
    return processCompletions(completions, contents, offset);
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
    filePath: NuclideUri,
    contents: string,
  ): Promise<Array<{message: HackDiagnostic}>> {
    try {
      const result = await this._hackService.getDiagnostics(filePath, contents);
      if (result == null) {
        getLogger().error('hh_client could not be reached');
        return [];
      }
      return result;
    } catch (err) {
      getLogger().error(err);
      return [];
    }
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

function matchTypeOfType(type: string): string {
  // strip parens if present
  if (type[0] === '(' && type[type.length - 1] === ')') {
    return type.substring(1, type.length - 1);
  }
  return type;
}

function escapeName(name: string): string {
  return name.replace(/\\/g, '\\\\');
}

function paramSignature(params: Array<HackParameterDetails>): ?string {
  const paramStrings = params.map(param => `${param.type} ${param.name}`);
  return `(${paramStrings.join(', ')})`;
}

function matchSnippet(name: string, params: ?Array<HackParameterDetails>): string {
  const escapedName = escapeName(name);
  if (params != null) {
    // Construct the snippet: e.g. myFunction(${1:$arg1}, ${2:$arg2});
    const paramsString = params.map(
      (param, index) => `\${${index + 1}:${param.name}}`).join(', ');
    return `${escapedName}(${paramsString})`;
  } else {
    return escapedName;
  }
}

// Returns the length of the largest match between a suffix of contents
// and a prefix of match.
function matchLength(contents: string, match: string): number {
  for (let i = match.length; i > 0; i--) {
    const toMatch = match.substring(0, i);
    if (contents.endsWith(toMatch)) {
      return i;
    }
  }
  return 0;
}

function processCompletions(
  completionsResponse: Array<HackCompletion>,
  contents: string,
  offset: number,
): Array<atom$AutocompleteSuggestion> {
  const contentsLine = contents.substring(
    contents.lastIndexOf('\n', offset - 1) + 1,
    offset).toLowerCase();
  return completionsResponse.map((completion: HackCompletion) => {
    const {name, type, func_details} = completion;
    const commonResult = {
      displayText: name,
      replacementPrefix: contents.substring(
        offset - matchLength(contentsLine, name.toLowerCase()),
        offset),
      description: matchTypeOfType(type),
    };
    if (func_details != null) {
      return {
        ...commonResult,
        snippet: matchSnippet(name, func_details.params),
        leftLabel: func_details.return_type,
        rightLabel: paramSignature(func_details.params),
        type: 'function',
      };
    } else {
      return {
        ...commonResult,
        snippet: matchSnippet(name),
        rightLabel: matchTypeOfType(type),
      };
    }
  });
}

const HACK_SERVICE_NAME = 'HackService';

const connectionToHackLanguage: ConnectionCache<HackLanguage>
  = new ConnectionCache(async connection => {
    const hackService: HackService = getServiceByConnection(HACK_SERVICE_NAME, connection);
    const config = getConfig();
    const useIdeConnection = config.useIdeConnection;
    // TODO:     || (await passesGK('nuclide_hack_use_persistent_connection'));
    const languageService = await hackService.initialize(
      config.hhClientPath,
      useIdeConnection,
      config.logLevel);

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
