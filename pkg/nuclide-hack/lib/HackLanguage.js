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
import typeof * as HackService from '../../nuclide-hack-base/lib/HackService';
import type {
  HackDiagnostic,
  HackSearchPosition,
  HackReference,
  HackOutline,
} from '../../nuclide-hack-base/lib/HackService';
import type {TypeCoverageRegion} from './TypedRegions';

import {LocalHackLanguage} from './LocalHackLanguage';
import {ServerHackLanguage} from './ServerHackLanguage';
import {RemoteConnection} from '../../nuclide-remote-connection';
import {isRemote} from '../../nuclide-remote-uri';
import {getHackEnvironmentDetails} from './utils';

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
    initialFileUri: NuclideUri,
    useServerOnly: boolean,
): HackLanguage {
  return useServerOnly
    ? new ServerHackLanguage(hackService, hhAvailable, basePath)
    : new LocalHackLanguage(hackService, hhAvailable, basePath, initialFileUri);
}

// Returns null if we can't get the key at this time because the RemoteConnection is initializing.
// This can happen on startup when reloading remote files.
function getKeyOfUri(uri: NuclideUri): ?string {
  const remoteConnection = RemoteConnection.getForUri(uri);
  return remoteConnection == null ?
    (isRemote(uri) ? null : LOCAL_URI_KEY) :
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
          hackEnvironment.hackRoot,
          fileUri,
          hackEnvironment.useServerOnly || hackEnvironment.useIdeConnection));
    }
  }
  return uriToHackLanguage.get(key);
}
