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
  HackRange,
} from '../../nuclide-hack-rpc/lib/rpc-types';
import type {
  HackDiagnostic,
  HackReference,
  HackIdeOutlineItem,
  HackIdeOutline,
  HackDefinition,
} from '../../nuclide-hack-rpc/lib/HackService';
import typeof * as HackService from '../../nuclide-hack-rpc/lib/HackService';
import type {HackLanguageService} from '../../nuclide-hack-rpc/lib/HackService';
import type {HackCoverageResult} from './TypedRegions';
import type {FileVersion} from '../../nuclide-open-files-common/lib/rpc-types';

import {ConnectionCache, getServiceByConnection} from '../../nuclide-remote-connection';
import {Range} from 'atom';
import {getLogger} from '../../nuclide-logging';
import {convertTypedRegionsToCoverageResult} from './TypedRegions';
import invariant from 'assert';
import {getConfig} from './config';

export type DefinitionResult = {
  path: NuclideUri,
  line: number,
  column: number,
  name: string,
  length: number,
  scope: string,
  additionalInfo: string,
  searchStartColumn?: number,
  searchEndColumn?: number,
};

export type Definition = {
  name: string,
  path: NuclideUri,
  projectRoot: NuclideUri,
  line: number,
  column: number,
  // Range in the input where the symbol reference occurs.
  queryRange: atom$Range,
};

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

  async highlightSource(
    filePath: NuclideUri,
    contents: string,
    line: number,
    col: number,
  ): Promise<Array<atom$Range>> {
    const response = await this._hackService.getSourceHighlights(filePath, contents, line, col);
    if (response == null) {
      return [];
    }
    return response.map(hackRangeToAtomRange);
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

  async getTypeCoverage(
    filePath: NuclideUri,
  ): Promise<?HackCoverageResult> {
    const regions = await this._hackService.getTypedRegions(filePath);
    return convertTypedRegionsToCoverageResult(regions);
  }

  getIdeOutline(
    filePath: NuclideUri,
    contents: string,
  ): Promise<?HackIdeOutline> {
    return this._hackService.getIdeOutline(filePath, contents);
  }

  async getIdeDefinition(
    filePath: NuclideUri,
    contents: string,
    lineNumber: number,
    column: number,
  ): Promise<Array<Definition>> {
    const definitions =
      await this._hackService.getDefinition(filePath, contents, lineNumber, column);
    if (definitions == null) {
      return [];
    }
    function convertDefinition(def: HackDefinition): Definition {
      invariant(def.definition_pos != null);
      return {
        name: def.name,
        path: def.definition_pos.filename,
        projectRoot: def.projectRoot,
        line: def.definition_pos.line,
        column: def.definition_pos.char_start,
        queryRange: hackRangeToAtomRange(def.pos),
      };
    }
    return definitions.filter(definition => definition.definition_pos != null)
      .map(convertDefinition);
  }

  getDefinitionById(filePath: NuclideUri, id: string): Promise<?HackIdeOutlineItem> {
    return this._hackService.getDefinitionById(filePath, id);
  }

  async getType(
    filePath: NuclideUri,
    contents: string,
    expression: string,
    lineNumber: number,
    column: number,
  ): Promise<?string> {
    if (!expression.startsWith('$')) {
      return null;
    }
    const result = await this._hackService.getTypeAtPos(filePath, contents, lineNumber, column);
    return result == null ? null : result.type;
  }

  async findReferences(
    filePath: NuclideUri,
    contents: string,
    line: number,
    column: number,
  ): Promise<?{baseUri: string, symbolName: string, references: Array<HackReference>}> {
    const references =
      await this._hackService.findReferences(filePath, contents, line, column);
    if (references == null || references.length === 0) {
      return null;
    }
    return {baseUri: references[0].projectRoot, symbolName: references[0].name, references};
  }
}

function hackRangeToAtomRange(position: HackRange): atom$Range {
  return new Range(
        [position.line - 1, position.char_start - 1],
        [position.line - 1, position.char_end],
      );
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
