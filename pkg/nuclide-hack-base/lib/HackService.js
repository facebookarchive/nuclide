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
import type {LogLevel} from '../../nuclide-logging/lib/rpc-types';
import type {
  HackRange,
  HackCompletion,
} from './rpc-types';

import {retryLimit} from '../../commons-node/promise';
import {
  callHHClient,
  getSearchResults,
} from './HackHelpers';
import {
  findHackConfigDir,
  setHackCommand,
  setUseIdeConnection,
  getHackExecOptions,
} from './hack-config';
import {getUseIdeConnection, logger} from './hack-config';
import {getHackConnectionService} from './HackProcess';

export type SymbolTypeValue = 0 | 1 | 2 | 3 | 4;

export type HackDiagnosticsResult = Array<{message: HackDiagnostic}>;

/**
 * Each error or warning can consist of any number of different messages from
 * Flow to help explain the problem and point to different locations that may be
 * of interest.
 */
export type HackDiagnostic = Array<SingleHackMessage>;

export type SingleHackMessage = {
  path: ?NuclideUri,
  descr: string,
  code: number,
  line: number,
  start: number,
  end: number,
};

// Note that all line/column values are 1-based.
export type HackSpan = {
  filename: NuclideUri,
  line_start: number,
  char_start: number,
  line_end: number,
  char_end: number,
};


export type HackCompletionsResult = Array<HackCompletion>;

export type HackReferencesResult = Array<HackReference>;

export type HackSearchPosition = {
  path: NuclideUri,
  line: number,
  column: number,
  name: string,
  length: number,
  scope: string,
  additionalInfo: string,
};

export type HackReference = {
  name: string,
  filename: NuclideUri,
  line: number,
  char_start: number,
  char_end: number,
};

export type HackTypedRegion = {
  color: 'default' | 'checked' | 'partial' | 'unchecked',
  text: string,
};

export type HackIdeOutlineItem = {
  kind: 'function' | 'class' | 'property' | 'method' | 'const'
    | 'enum' | 'typeconst' | 'param' | 'trait' | 'interface',
  name: string,
  position: HackRange,
  span: HackSpan,
  modifiers: ?Array<string>,
  children?: Array<HackIdeOutlineItem>,
  params?: Array<HackIdeOutlineItem>,
  docblock?: string,
};

export type HackIdeOutline = Array<HackIdeOutlineItem>;

export type HackTypeAtPosResult = {
  type: ?string,
  pos: ?HackRange,
};

export type HackHighlightRefsResult = Array<HackRange>;

export type HackFormatSourceResult = {
  error_message: string,
  result: string,
  internal_error: boolean,
};

export type HackDefinition = {
  definition_pos: ?HackRange,
  name: string,
  pos: HackRange,
};

const HH_DIAGNOSTICS_DELAY_MS = 600;
const HH_CLIENT_MAX_TRIES = 10;

export async function getDiagnostics(
  file: NuclideUri,
  currentContents?: string,
): Promise<?HackDiagnosticsResult> {
  const hhResult = await retryLimit(
    () => callHHClient(
      /* args */ [],
      /* errorStream */ true,
      /* outputJson */ true,
      /* processInput */ null,
      /* file */ file,
    ),
    result => result != null,
    HH_CLIENT_MAX_TRIES,
    HH_DIAGNOSTICS_DELAY_MS,
  );
  if (!hhResult) {
    return null;
  }

  const messages = (
    (hhResult: any): {errors: Array<{message: HackDiagnostic}>}
  ).errors;

  // Use a consistent null 'falsy' value for the empty string, undefined, etc.
  messages.forEach(error => {
    error.message.forEach(component => {
      component.path = component.path || null;
    });
  });

  return messages;
}

export async function getCompletions(
  file: NuclideUri,
  contents: string,
  offset: number,
  line: number,
  column: number,
): Promise<?HackCompletionsResult> {
  if (getUseIdeConnection()) {
    logger.logTrace(`Attempting Hack Autocomplete: ${file}, ${line}, ${column}`);
    const service = await getHackConnectionService(file);
    if (service == null) {
      return null;
    }

    logger.logTrace('Got Hack Service');
    // The file notifications are a placeholder until we get
    // full file synchronization implemented.
    await service.didOpenFile(file);
    try {
      const VERSION_PLACEHOLDER = 1;
      await service.didChangeFile(
        file, VERSION_PLACEHOLDER, [{text: contents}]);
      return await service.getCompletions(file, {line, column});
    } finally {
      await service.didCloseFile(file);
    }
  } else {
    const markedContents = markFileForCompletion(contents, offset);
    const result: any = await callHHClient(
      /* args */ ['--auto-complete'],
      /* errorStream */ false,
      /* outputJson */ true,
      /* processInput */ markedContents,
      /* file */ file,
    );
    return result;
  }
}

export async function getDefinition(
  file: NuclideUri,
  contents: string,
  line: number,
  column: number,
): Promise<Array<HackDefinition>> {
  const result: any = await callHHClient(
    /* args */ ['--ide-get-definition', formatLineColumn(line, column)],
    /* errorStream */ false,
    /* outputJson */ true,
    /* processInput */ contents,
    /* cwd */ file,
  );
  if (result == null) {
    return [];
  }

  function fixupDefinition(definition: HackDefinition): void {
    if (definition.definition_pos != null && definition.definition_pos.filename === '') {
      definition.definition_pos.filename = file;
    }
    if (definition.pos.filename === '') {
      definition.pos.filename = file;
    }
  }
  if (Array.isArray(result)) {
    result.forEach(fixupDefinition);
    return result;
  } else {
    fixupDefinition(result);
    return [result];
  }
}

export async function findReferences(
  file: NuclideUri,
  contents: string,
  line: number,
  column: number,
): Promise<?HackReferencesResult> {
  const result: any = await callHHClient(
    /* args */ ['--ide-find-refs', formatLineColumn(line, column)],
    /* errorStream */ false,
    /* outputJson */ true,
    /* processInput */ contents,
    /* cwd */ file,
  );
  return result;
}

export function getHackEnvironmentDetails(
  localFile: NuclideUri,
  hackCommand: string,
  useIdeConnection: boolean,
  logLevel: LogLevel,
): Promise<?{hackRoot: NuclideUri, hackCommand: string}> {
  setHackCommand(hackCommand);
  setUseIdeConnection(useIdeConnection);
  logger.setLogLevel(logLevel);
  return getHackExecOptions(localFile);
}

/**
 * Performs a Hack symbol search in the specified directory.
 */
export async function queryHack(
  rootDirectory: NuclideUri,
  queryString: string,
): Promise<Array<HackSearchPosition>> {
  let searchPostfix;
  switch (queryString[0]) {
    case '@':
      searchPostfix = '-function';
      queryString = queryString.substring(1);
      break;
    case '#':
      searchPostfix = '-class';
      queryString = queryString.substring(1);
      break;
    case '%':
      searchPostfix = '-constant';
      queryString = queryString.substring(1);
      break;
  }
  const searchResponse = await getSearchResults(
    rootDirectory,
    queryString,
    /* filterTypes */ null,
    searchPostfix);
  if (searchResponse == null) {
    return [];
  } else {
    return searchResponse.result;
  }
}

export async function getTypedRegions(filePath: NuclideUri):
    Promise<?Array<HackTypedRegion>> {
  const result = await callHHClient(
    /* args */ ['--colour', filePath],
    /* errorStream */ false,
    /* outputJson */ true,
    /* processInput */ null,
    /* file */ filePath,
  );
  return (result: any);
}

export async function getIdeOutline(
  filePath: NuclideUri,
  contents: string,
): Promise<?HackIdeOutline> {
  const result = await callHHClient(
    /* args */ ['--ide-outline'],
    /* errorStream */ false,
    /* outputJson */ true,
    /* processInput */ contents,
    filePath,
  );
  return (result: any);
}

export async function getTypeAtPos(
  filePath: NuclideUri,
  contents: string,
  line: number,
  column: number,
): Promise<?HackTypeAtPosResult> {
  const result = await callHHClient(
    /* args */ ['--type-at-pos', formatLineColumn(line, column)],
    /* errorStream */ false,
    /* outputJson */ true,
    /* processInput */ contents,
    /* file */ filePath,
  );
  return (result: any);
}

export async function getSourceHighlights(
  filePath: NuclideUri,
  contents: string,
  line: number,
  column: number,
): Promise<?HackHighlightRefsResult> {
  const result = await callHHClient(
    /* args */ ['--ide-highlight-refs', formatLineColumn(line, column)],
    /* errorStream */ false,
    /* outputJson */ true,
    /* processInput */ contents,
    /* file */ filePath,
  );
  return (result: any);
}

export async function formatSource(
  filePath: NuclideUri,
  contents: string,
  startOffset: number,
  endOffset: number,
): Promise<?HackFormatSourceResult> {
  const result = await callHHClient(
    /* args */ ['--format', startOffset, endOffset],
    /* errorStream */ false,
    /* outputJson */ true,
    /* processInput */ contents,
    /* file */ filePath,
  );
  return (result: any);
}

/**
 * @return whether this service can perform Hack symbol queries on the
 *   specified directory. Not all directories on a host correspond to
 *   repositories that contain Hack code.
 */
export async function isAvailableForDirectoryHack(rootDirectory: NuclideUri): Promise<boolean> {
  const hackOptions = await getHackExecOptions(rootDirectory);
  return hackOptions != null;
}

/**
 * @param fileUri a file path.  It cannot be a directory.
 * @return whether the file represented by fileUri is inside of a Hack project.
 */
export async function isFileInHackProject(fileUri: NuclideUri): Promise<boolean> {
  const hhconfigPath = await findHackConfigDir(fileUri);
  return hhconfigPath != null;
}

function formatLineColumn(line: number, column: number): string {
  return `${line}:${column}`;
}

// Calculate the offset of the cursor from the beginning of the file.
// Then insert AUTO332 in at this offset. (Hack uses this as a marker.)
function markFileForCompletion(contents: string, offset: number): string {
  return contents.substring(0, offset) +
      'AUTO332' + contents.substring(offset, contents.length);
}
