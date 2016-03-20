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
  HackDiagnostic,
  HackSearchPosition,
  HackReference,
  HackOutline,
} from '../../nuclide-hack-base/lib/HackService';
import type {TypeCoverageRegion} from './TypedRegions';

import {LocalHackLanguage} from './LocalHackLanguage';
import {ServerHackLanguage} from './ServerHackLanguage';

export type CompletionResult = {
  matchSnippet: string;
  matchText: string;
  matchType: string;
};

/**
 * The HackLanguage is the controller that servers language requests by trying to get worker results
 * and/or results from HackService (which would be executing hh_client on a supporting server)
 * and combining and/or selecting the results to give back to the requester.
 */
export type HackLanguage  = {

  dispose(): void;

  getCompletions(
    filePath: NuclideUri,
    contents: string,
    offset: number
  ): Promise<Array<CompletionResult>>;

  formatSource(
    contents: string,
    startPosition: number,
    endPosition: number,
  ): Promise<string>;

  highlightSource(
    path: NuclideUri,
    contents: string,
    line: number,
    col: number,
  ): Promise<Array<atom$Range>>;

  getDiagnostics(
    path: NuclideUri,
    contents: string,
  ): Promise<Array<{message: HackDiagnostic;}>>;

  getTypeCoverage(
    filePath: NuclideUri,
  ): Promise<Array<TypeCoverageRegion>>;

  getDefinition(
      filePath: NuclideUri,
      contents: string,
      lineNumber: number,
      column: number,
      lineText: string
    ): Promise<Array<HackSearchPosition>>;

  getType(
    filePath: NuclideUri,
    contents: string,
    expression: string,
    lineNumber: number,
    column: number,
  ): Promise<?string>;

  findReferences(
    filePath: NuclideUri,
    contents: string,
    line: number,
    column: number
  ): Promise<?{baseUri: string; symbolName: string; references: Array<HackReference>}>;

  getOutline(
    filePath: NuclideUri,
    contents: string,
  ): Promise<?HackOutline>;

  getBasePath(): ?string;

  isHackAvailable(): boolean;

}

export function createHackLanguage(
    hhAvailable: boolean,
    basePath: ?string,
    initialFileUri: NuclideUri,
    useIdeConnection: boolean,
): HackLanguage {
  return useIdeConnection
    ? new ServerHackLanguage(hhAvailable, basePath)
    : new LocalHackLanguage(hhAvailable, basePath, initialFileUri);
}
