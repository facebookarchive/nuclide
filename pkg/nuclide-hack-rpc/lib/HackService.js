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
import type {LogLevel} from '../../nuclide-logging/lib/rpc-types';
import type {
  HackRange,
  HackCompletion,
} from './rpc-types';
import type {FileVersion} from '../../nuclide-open-files-common/lib/rpc-types';
import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';
import type {
  DefinitionQueryResult,
} from '../../nuclide-definition-service/lib/rpc-types';
import type {HackDefinition} from './Definitions';

import {wordAtPositionFromBuffer} from '../../commons-node/range';
import invariant from 'assert';
import {retryLimit} from '../../commons-node/promise';
import {
  callHHClient,
  getSearchResults,
} from './HackHelpers';
import {
  findHackConfigDir,
  setHackCommand,
  setUseIdeConnection,
  getHackCommand,
} from './hack-config';
import {getUseIdeConnection, logger} from './hack-config';
import {getHackConnectionService} from './HackProcess';
import {getBufferAtVersion} from '../../nuclide-open-files-rpc';
import {convertDefinitions} from './Definitions';
import {hackRangeToAtomRange} from './HackHelpers';

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
  projectRoot: NuclideUri,
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
  id?: ?string,
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

const HH_DIAGNOSTICS_DELAY_MS = 600;
const HH_CLIENT_MAX_TRIES = 10;

export async function initialize(
  hackCommand: string,
  useIdeConnection: boolean,
  logLevel: LogLevel,
): Promise<HackLanguageService> {
  setHackCommand(hackCommand);
  setUseIdeConnection(useIdeConnection);
  logger.setLogLevel(logLevel);
  await getHackCommand();
  return new HackLanguageService();
}

export class HackLanguageService {
  async getDiagnostics(
    file: NuclideUri,
    currentContents?: string,
  ): Promise<?HackDiagnosticsResult> {
    const hhResult = await retryLimit(
      () => callHHClient(
        /* args */ [],
        /* errorStream */ true,
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

  async getCompletions(
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
        /* processInput */ markedContents,
        /* file */ file,
      );
      return result;
    }
  }

  async getDefinition(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    const contents = buffer.getText();

    const line = position.row + 1;
    const column = position.column + 1;

    const result: ?Array<HackDefinition> = (await callHHClient(
      /* args */ ['--ide-get-definition', formatLineColumn(line, column)],
      /* errorStream */ false,
      /* processInput */ contents,
      /* cwd */ filePath,
    ): any);
    if (result == null) {
      return null;
    }
    const projectRoot = (result: any).hackRoot;
    invariant(typeof projectRoot === 'string');

    const hackDefinitions = Array.isArray(result) ? result : [result];
    return convertDefinitions(hackDefinitions, filePath, projectRoot);
  }

  async getDefinitionById(
    file: NuclideUri,
    id: string,
  ): Promise<?HackIdeOutlineItem> {
    const result: any = await callHHClient(
      /* args */ ['--get-definition-by-id', id],
      /* errorStream */ false,
      /* processInput */ null,
      /* cwd */ file,
    );
    return result;
  }

  async findReferences(
    file: NuclideUri,
    contents: string,
    line: number,
    column: number,
  ): Promise<?HackReferencesResult> {
    const result: ?HackReferencesResult = (await callHHClient(
      /* args */ ['--ide-find-refs', formatLineColumn(line, column)],
      /* errorStream */ false,
      /* processInput */ contents,
      /* cwd */ file,
    ): any);
    if (result != null) {
      const projectRoot: NuclideUri = (result: any).hackRoot;
      result.forEach(reference => { reference.projectRoot = projectRoot; });
    }
    return result;
  }

  /**
   * Performs a Hack symbol search in the specified directory.
   */
  async queryHack(
    rootDirectory: NuclideUri,
    queryString_: string,
  ): Promise<Array<HackSearchPosition>> {
    let queryString = queryString_;
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

  async getTypedRegions(
    filePath: NuclideUri,
  ): Promise<?Array<HackTypedRegion>> {
    const result = await callHHClient(
      /* args */ ['--colour', filePath],
      /* errorStream */ false,
      /* processInput */ null,
      /* file */ filePath,
    );
    return (result: any);
  }

  async getIdeOutline(
    filePath: NuclideUri,
    contents: string,
  ): Promise<?HackIdeOutline> {
    const result = await callHHClient(
      /* args */ ['--ide-outline'],
      /* errorStream */ false,
      /* processInput */ contents,
      filePath,
    );
    return (result: any);
  }

  async typeHint(fileVersion: FileVersion, position: atom$Point): Promise<?TypeHint> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    const contents = buffer.getText();

    const match = getIdentifierAndRange(buffer, position);
    if (match == null) {
      return null;
    }

    const line = position.row + 1;
    const column = position.column + 1;

    const result: ?HackTypeAtPosResult = (await callHHClient(
      /* args */ ['--type-at-pos', formatLineColumn(line, column)],
      /* errorStream */ false,
      /* processInput */ contents,
      /* file */ filePath,
    ): any);

    if (result == null || result.type == null || result.type === '_') {
      return null;
    } else {
      return {
        hint: result.type,
        // TODO: Use hack range for type hints, not nuclide range.
        range: match.range,
      };
    }
  }

  async highlight(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<Array<atom$Range>> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    const contents = buffer.getText();

    const id = getIdentifierAtPosition(buffer, position);
    if (id == null) {
      return [];
    }
    const line = position.row + 1;
    const column = position.column;

    const result: ?HackHighlightRefsResult = (await callHHClient(
      /* args */ ['--ide-highlight-refs', formatLineColumn(line, column)],
      /* errorStream */ false,
      /* processInput */ contents,
      /* file */ filePath,
    ): any);
    return result == null
      ? []
      : result.map(hackRangeToAtomRange);
  }

  async formatSource(
    fileVersion: FileVersion,
    range: atom$Range,
  ): Promise<string> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    const contents = buffer.getText();
    const startOffset = buffer.characterIndexForPosition(range.start) + 1;
    const endOffset = buffer.characterIndexForPosition(range.end) + 1;

    const response: ?HackFormatSourceResult = (await callHHClient(
      /* args */ ['--format', startOffset, endOffset],
      /* errorStream */ false,
      /* processInput */ contents,
      /* file */ filePath,
    ): any);

    if (response == null) {
      throw new Error('Error formatting hack source.');
    } else if (response.error_message !== '') {
      throw new Error(`Error formatting hack source: ${response.error_message}`);
    }
    return response.result;
  }

  async getProjectRoot(fileUri: NuclideUri): Promise<?NuclideUri> {
    return findHackConfigDir(fileUri);
  }

  /**
   * @param fileUri a file path.  It cannot be a directory.
   * @return whether the file represented by fileUri is inside of a Hack project.
   */
  async isFileInHackProject(fileUri: NuclideUri): Promise<boolean> {
    const hhconfigPath = await findHackConfigDir(fileUri);
    return hhconfigPath != null;
  }

  dispose(): void {
  }
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

const HACK_WORD_REGEX = /[a-zA-Z0-9_$]+/g;

function getIdentifierAndRange(
  buffer: atom$TextBuffer,
  position: atom$PointObject,
): ?{id: string, range: atom$Range} {
  const matchData = wordAtPositionFromBuffer(buffer, position, HACK_WORD_REGEX);
  return (matchData == null || matchData.wordMatch.length === 0) ? null
      : {id: matchData.wordMatch[0], range: matchData.range};
}

function getIdentifierAtPosition(
  buffer: atom$TextBuffer,
  position: atom$PointObject,
): ?string {
  const result = getIdentifierAndRange(buffer, position);
  return result == null ? null : result.id;
}
