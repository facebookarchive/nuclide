'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import type {
  HackParameterDetails,
  HackCompletion,
  HackRange,
} from '../../nuclide-hack-base/lib/rpc-types';
import type {
  HackDiagnostic,
  HackReference,
  HackIdeOutline,
  HackDefinition,
} from '../../nuclide-hack-base/lib/HackService';
import typeof * as HackService from '../../nuclide-hack-base/lib/HackService';
import type {HackCoverageResult} from './TypedRegions';

import {RemoteConnection} from '../../nuclide-remote-connection';
import nuclideUri from '../../nuclide-remote-uri';
import {getHackEnvironmentDetails} from './utils';
import {Range} from 'atom';
import {getLogger} from '../../nuclide-logging';
import {convertTypedRegionsToCoverageResult} from './TypedRegions';
import invariant from 'assert';

export type DefinitionResult = {
  path: NuclideUri;
  line: number;
  column: number;
  name: string;
  length: number;
  scope: string;
  additionalInfo: string;
  searchStartColumn?: number;
  searchEndColumn?: number;
};

export type Definition = {
  name: string;
  path: NuclideUri;
  line: number;
  column: number;
  // Range in the input where the symbol reference occurs.
  queryRange: atom$Range;
};

/**
 * Serves language requests from HackService.
 * Note that all line/column values are 1 based.
 */
export class HackLanguage {

  _hackService: HackService;
  _hhAvailable: boolean;
  _basePath: ?string;

  /**
   * `basePath` should be the directory where the .hhconfig file is located.
   */
  constructor(hackService: HackService, hhAvailable: boolean, basePath: ?string) {
    this._hackService = hackService;
    this._hhAvailable = hhAvailable;
    this._basePath = basePath;
  }

  dispose() {
  }

  async getCompletions(
    filePath: NuclideUri,
    contents: string,
    offset: number,
    line: number,
    column: number,
  ): Promise<Array<atom$AutocompleteSuggestion>> {
    let completions = [];
    const completionsResult = await this._hackService.getCompletions(
      filePath, contents, offset, line, column);
    if (completionsResult) {
      completions = completionsResult.completions;
    }
    return processCompletions(completions, contents, offset);
  }

  async formatSource(
    contents: string,
    startPosition: number,
    endPosition: number,
  ): Promise<string> {
    const path = this._basePath;
    if (path == null) {
      throw new Error('No Hack provider for this file.');
    }
    const response =
      await this._hackService.formatSource(path, contents, startPosition, endPosition);
    if (response == null) {
      throw new Error('Error formatting hack source.');
    } else if (response.error_message !== '') {
      throw new Error(`Error formatting hack source: ${response.error_message}`);
    }
    return response.result;
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
  ): Promise<Array<{message: HackDiagnostic;}>> {
    let diagnosticResult = null;
    try {
      diagnosticResult = await this._hackService.getDiagnostics(filePath, contents);
    } catch (err) {
      getLogger().error(err);
      return [];
    }
    if (!diagnosticResult) {
      getLogger().error('hh_client could not be reached');
      return [];
    }
    const hackDiagnostics = diagnosticResult;
    return hackDiagnostics.messages;
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
        line: def.definition_pos.line,
        column: def.definition_pos.char_start,
        queryRange: hackRangeToAtomRange(def.pos),
      };
    }
    return definitions.filter(definition => definition.definition_pos != null)
      .map(convertDefinition);
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
  ): Promise<?{baseUri: string; symbolName: string; references: Array<HackReference>}> {
    const referencesResult =
      await this._hackService.findReferences(filePath, contents, line, column);
    if (!referencesResult) {
      return null;
    }
    const {hackRoot, references} = referencesResult;
    if (references == null || references.length === 0) {
      return null;
    }
    return {baseUri: hackRoot, symbolName: references[0].name, references};
  }

  getBasePath(): ?string {
    return this._basePath;
  }

  isHackAvailable(): boolean {
    return this._hhAvailable;
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


/**
 * This is responsible for managing (creating/disposing) multiple HackLanguage instances,
 * creating the designated HackService instances with the NuclideClient it needs per remote project.
 * Also, it deelegates the language feature request to the correct HackLanguage instance.
 */
const uriToHackLanguage: Map<string, HackLanguage> = new Map();

// dummy key into uriToHackLanguage for local projects.
// Any non-remote NuclideUri will do.
// TODO: I suspect we should key the local service off of the presence of a .hhconfig file
// rather than having a single HackLanguage for all local requests. Regardless, we haven't tested
// local hack services so save that for another day.
const LOCAL_URI_KEY = 'local-hack-key';

function createHackLanguage(
    hackService: HackService,
    hhAvailable: boolean,
    basePath: ?string,
): HackLanguage {
  return new HackLanguage(hackService, hhAvailable, basePath);
}

// Returns null if we can't get the key at this time because the RemoteConnection is initializing.
// This can happen on startup when reloading remote files.
function getKeyOfUri(uri: NuclideUri): ?string {
  const remoteConnection = RemoteConnection.getForUri(uri);
  return remoteConnection == null ?
    (nuclideUri.isRemote(uri) ? null : LOCAL_URI_KEY) :
    remoteConnection.getUriForInitialWorkingDirectory();
}

export function getCachedHackLanguageForUri(uri: NuclideUri): ?HackLanguage {
  const key = getKeyOfUri(uri);
  return key == null ? null : uriToHackLanguage.get(uri);
}

export async function getHackLanguageForUri(uri: ?NuclideUri): Promise<?HackLanguage> {
  if (uri == null || uri.length === 0) {
    return null;
  }
  const key = getKeyOfUri(uri);
  if (key == null) {
    return null;
  }
  return await createHackLanguageIfNotExisting(key, uri);
}

async function createHackLanguageIfNotExisting(
  key: string,
  fileUri: NuclideUri,
): Promise<HackLanguage> {
  if (!uriToHackLanguage.has(key)) {
    const hackEnvironment = await getHackEnvironmentDetails(fileUri);

    // If multiple calls were done asynchronously, then return the single-created HackLanguage.
    if (!uriToHackLanguage.has(key)) {
      uriToHackLanguage.set(key,
        createHackLanguage(
          hackEnvironment.hackService,
          hackEnvironment.isAvailable,
          hackEnvironment.hackRoot));
    }
  }
  return uriToHackLanguage.get(key);
}

// Must clear the cache when servers go away.
// TODO: Could be more precise about this and only clear those entries
// for the closed connection.
export function clearHackLanguageCache() {
  uriToHackLanguage.clear();
}
