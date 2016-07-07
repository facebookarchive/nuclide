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
import type {CompletionResult, Definition} from './HackLanguage';
import type {
  HackParameterDetails,
  HackCompletion,
  HackDiagnostic,
  HackRange,
  HackReference,
  HackIdeOutline,
  HackDefinition,
} from '../../nuclide-hack-base/lib/HackService';
import typeof * as HackService from '../../nuclide-hack-base/lib/HackService';
import type {HackCoverageResult} from './TypedRegions';

import {Range} from 'atom';
import {getLogger} from '../../nuclide-logging';
import {convertTypedRegionsToCoverageResult} from './TypedRegions';
import invariant from 'assert';

/**
 * Serves language requests from HackService.
 * Note that all line/column values are 1 based.
 */
export class ServerHackLanguage {

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
  ): Promise<Array<CompletionResult>> {
    const markedContents = markFileForCompletion(contents, offset);
    let completions = [];
    const completionsResult = await this._hackService.getCompletions(filePath, markedContents);
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
): Array<CompletionResult> {
  const contentsLine = contents.substring(
    contents.lastIndexOf('\n', offset - 1) + 1,
    offset).toLowerCase();
  return completionsResponse.map((completion: HackCompletion) => {
    const {name, type, func_details} = completion;
    return {
      matchSnippet: matchSnippet(name, func_details && func_details.params),
      matchText: name,
      matchType: matchTypeOfType(type),
      prefix: contents.substring(
        offset - matchLength(contentsLine, name.toLowerCase()),
        offset),
    };
  });
}

// Calculate the offset of the cursor from the beginning of the file.
// Then insert AUTO332 in at this offset. (Hack uses this as a marker.)
function markFileForCompletion(contents: string, offset: number): string {
  return contents.substring(0, offset) +
      'AUTO332' + contents.substring(offset, contents.length);
}
