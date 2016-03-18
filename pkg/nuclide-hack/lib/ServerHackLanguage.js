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
import type {CompletionResult} from './HackLanguage';
import type {
  HackDiagnostic,
  HackSearchPosition,
  HackReference,
  HackOutline,
} from '../../nuclide-hack-base/lib/HackService';
import {TypeCoverageRegion} from './TypedRegions';

import {getHackService} from './utils';
import {getLogger} from '../../nuclide-logging';
import {convertTypedRegionsToCoverageRegions} from './TypedRegions';
import {
  markFileForCompletion,
  processCompletions,
  processDefinitionsForXhp,
} from './LocalHackLanguage';

/**
 * Serves language requests from HackService.
 */
export class ServerHackLanguage {

  _hhAvailable: boolean;
  _basePath: ?string;

  /**
   * `basePath` should be the directory where the .hhconfig file is located.
   */
  constructor(hhAvailable: boolean, basePath: ?string) {
    this._hhAvailable = hhAvailable;
    this._basePath = basePath;
  }

  dispose() {
  }

  async getCompletions(
    filePath: NuclideUri,
    contents: string,
    offset: number
  ): Promise<Array<CompletionResult>> {
    const markedContents = markFileForCompletion(contents, offset);
    let completions = [];
    const {getCompletions} = getHackService(filePath);
    const completionsResult = await getCompletions(filePath, markedContents);
    if (completionsResult) {
      completions = completionsResult.completions;
    }
    return processCompletions(completions);
  }

  async formatSource(
    contents: string,
    startPosition: number,
    endPosition: number,
  ): Promise<string> {
    // TBD
    return contents;
  }

  async highlightSource(
    filePath: string,
    contents: string,
    line: number,
    col: number,
  ): Promise<Array<atom$Range>> {
    // TBD
    return [];
  }

  async getDiagnostics(
    filePath: NuclideUri,
    contents: string,
  ): Promise<Array<{message: HackDiagnostic;}>> {
    const {getDiagnostics} = getHackService(filePath);
    let diagnosticResult = null;
    try {
      diagnosticResult = await getDiagnostics(filePath, contents);
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
  ): Promise<Array<TypeCoverageRegion>> {
    const {getTypedRegions} = getHackService(filePath);
    const regions = await getTypedRegions(filePath);
    return convertTypedRegionsToCoverageRegions(regions);
  }

  async getOutline(
    filePath: NuclideUri,
    contents: string,
  ): Promise<?HackOutline> {
    // TBD
    return null;
  }

  async getDefinition(
    filePath: NuclideUri,
    contents: string,
    lineNumber: number,
    column: number,
    lineText: string
  ): Promise<Array<HackSearchPosition>> {
    const {getIdentifierDefinition} = getHackService(filePath);
    const definitionResult = await getIdentifierDefinition(
      filePath, contents, lineNumber, column
    );
    const identifierResult = processDefinitionsForXhp(definitionResult, column, lineText);
    return identifierResult.length === 1 ? identifierResult : [];
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
    const {getTypeAtPos} = getHackService(filePath);
    const result = await getTypeAtPos(filePath, contents, lineNumber, column);
    return result == null ? null : result.type;
  }

  async findReferences(
    filePath: NuclideUri,
    contents: string,
    line: number,
    column: number
  ): Promise<?{baseUri: string; symbolName: string; references: Array<HackReference>}> {
    return null;
  }

  getBasePath(): ?string {
    return this._basePath;
  }

  isHackAvailable(): boolean {
    return this._hhAvailable;
  }

}
