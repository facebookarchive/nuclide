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
  Completion,
  HackRange,
  HackCompletion,
} from './rpc-types';
import type {FileVersion} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';
import type {
  Definition,
  DefinitionQueryResult,
} from '../../nuclide-definition-service/lib/rpc-types';
import type {HackDefinition} from './Definitions';
import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';
import type {HackIdeOutline, HackIdeOutlineItem} from './OutlineView';
import type {HackTypedRegion} from './TypedRegions';
import type {CoverageResult} from '../../nuclide-type-coverage/lib/rpc-types';
import type {FindReferencesReturn} from '../../nuclide-find-references/lib/rpc-types';
import type {HackReferencesResult} from './FindReferences';
import type {
  DiagnosticProviderUpdate,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {HackDiagnosticsResult} from './Diagnostics';

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
import {
  hackRangeToAtomRange,
  atomPointOfHackRangeStart,
} from './HackHelpers';
import {outlineFromHackIdeOutline} from './OutlineView';
import {convertCoverage} from './TypedRegions';
import {convertReferences} from './FindReferences';
import {hasPrefix, findHackPrefix, convertCompletions} from './Completions';
import {convertDiagnostics} from './Diagnostics';

export type SymbolTypeValue = 0 | 1 | 2 | 3 | 4;

export type HackCompletionsResult = Array<HackCompletion>;

export type HackSearchPosition = {
  path: NuclideUri,
  line: number,
  column: number,
  name: string,
  length: number,
  scope: string,
  additionalInfo: string,
};

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
    fileVersion: FileVersion,
  ): Promise<?DiagnosticProviderUpdate> {
    const filePath = fileVersion.filePath;

    const hhResult: ?HackDiagnosticsResult = (await retryLimit(
      () => callHHClient(
        /* args */ [],
        /* errorStream */ true,
        /* processInput */ null,
        /* file */ filePath,
      ),
      result => result != null,
      HH_CLIENT_MAX_TRIES,
      HH_DIAGNOSTICS_DELAY_MS,
    ): any);
    if (!hhResult) {
      return null;
    }

    return convertDiagnostics(hhResult);
  }

  async getAutocompleteSuggestions(
    fileVersion: FileVersion,
    position: atom$Point,
    activatedManually: boolean,
  ): Promise<Array<Completion>> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    const contents = buffer.getText();
    const offset = buffer.characterIndexForPosition(position);

    const replacementPrefix = findHackPrefix(buffer, position);
    if (replacementPrefix === '' && !hasPrefix(buffer, position)) {
      return [];
    }

    if (getUseIdeConnection()) {
      const line = position.row + 1;
      const column = position.column + 1;
      logger.logTrace(`Attempting Hack Autocomplete: ${filePath}, ${position.toString()}`);
      const service = await getHackConnectionService(filePath);
      if (service == null) {
        return [];
      }

      logger.logTrace('Got Hack Service');
      // The file notifications are a placeholder until we get
      // full file synchronization implemented.
      await service.didOpenFile(filePath);
      try {
        const VERSION_PLACEHOLDER = 1;
        await service.didChangeFile(
          filePath, VERSION_PLACEHOLDER, [{text: contents}]);
        return convertCompletions(
          contents,
          offset,
          replacementPrefix,
          (await service.getCompletions(filePath, {line, column}): ?HackCompletionsResult));
      } finally {
        await service.didCloseFile(filePath);
      }
    } else {
      const markedContents = markFileForCompletion(contents, offset);
      const result: ?HackCompletionsResult = (await callHHClient(
        /* args */ ['--auto-complete'],
        /* errorStream */ false,
        /* processInput */ markedContents,
        /* file */ filePath,
      ): any);
      return convertCompletions(contents, offset, replacementPrefix, result);
    }
  }

  async getDefinition(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    const contents = buffer.getText();

    const result: ?Array<HackDefinition> = (await callHHClient(
      /* args */ ['--ide-get-definition', formatAtomLineColumn(position)],
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
  ): Promise<?Definition> {
    const definition: ?HackIdeOutlineItem = (await callHHClient(
      /* args */ ['--get-definition-by-id', id],
      /* errorStream */ false,
      /* processInput */ null,
      /* cwd */ file,
    ): any);
    if (definition == null) {
      return null;
    }

    const result = {
      path: definition.position.filename,
      position: atomPointOfHackRangeStart(definition.position),
      name: definition.name,
      language: 'php',
      // TODO: range
      projectRoot: (definition: any).hackRoot,
    };
    if (typeof definition.id === 'string') {
      return {
        ...result,
        id: definition.id,
      };
    } else {
      return result;
    }
  }

  async findReferences(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?FindReferencesReturn> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    const contents = buffer.getText();

    const result: ?HackReferencesResult = (await callHHClient(
      /* args */ ['--ide-find-refs', formatAtomLineColumn(position)],
      /* errorStream */ false,
      /* processInput */ contents,
      /* cwd */ filePath,
    ): any);
    if (result == null || result.length === 0) {
      return {type: 'error', message: 'No references found.'};
    }

    const projectRoot: NuclideUri = (result: any).hackRoot;

    return convertReferences(result, projectRoot);
  }

  /**
   * Performs a Hack symbol search in the specified directory.
   */
  async executeQuery(
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

  async getCoverage(
    filePath: NuclideUri,
  ): Promise<?CoverageResult> {
    const result: ?Array<HackTypedRegion> = (await callHHClient(
      /* args */ ['--colour', filePath],
      /* errorStream */ false,
      /* processInput */ null,
      /* file */ filePath,
    ): any);

    return convertCoverage(filePath, result);
  }

  async getOutline(
    fileVersion: FileVersion,
  ): Promise<?Outline> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    const contents = buffer.getText();

    const result: ?HackIdeOutline = (await callHHClient(
      /* args */ ['--ide-outline'],
      /* errorStream */ false,
      /* processInput */ contents,
      filePath,
    ): any);
    if (result == null) {
      return null;
    }

    return outlineFromHackIdeOutline(result);
  }

  async typeHint(fileVersion: FileVersion, position: atom$Point): Promise<?TypeHint> {
    const filePath = fileVersion.filePath;
    const buffer = await getBufferAtVersion(fileVersion);
    const contents = buffer.getText();

    const match = getIdentifierAndRange(buffer, position);
    if (match == null) {
      return null;
    }

    const result: ?HackTypeAtPosResult = (await callHHClient(
      /* args */ ['--type-at-pos', formatAtomLineColumn(position)],
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

    const result: ?HackHighlightRefsResult = (await callHHClient(
      /* args */ ['--ide-highlight-refs', formatAtomLineColumn(position)],
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

  getProjectRoot(fileUri: NuclideUri): Promise<?NuclideUri> {
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

function formatAtomLineColumn(position: atom$Point): string {
  return formatLineColumn(position.row + 1, position.column + 1);
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
