/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {LogLevel} from '../../nuclide-logging/lib/rpc-types';
import type {HackRange} from './rpc-types';
import type {
  HackLanguageService,
  HackSearchPosition,
} from './HackService-types';
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
  FileDiagnosticUpdate,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {FileNotifier} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {Completion} from '../../nuclide-language-service/lib/LanguageService';
import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';
import type {HackDiagnosticsMessage} from './HackConnectionService';

import {Observable} from 'rxjs';
import {wordAtPositionFromBuffer} from '../../commons-node/range';
import {arrayFlatten} from '../../commons-node/collection';
import invariant from 'assert';
import {
  callHHClient,
} from './HackHelpers';
import {
  findHackConfigDir,
  setHackCommand,
  getHackCommand,
  logger,
  HACK_FILE_EXTENSIONS,
} from './hack-config';
import {
  getHackProcess,
  getHackProcesses,
  observeConnections,
  ensureProcesses,
  closeProcesses,
} from './HackProcess';
import {convertDefinitions} from './Definitions';
import {
  hackRangeToAtomRange,
  atomPointOfHackRangeStart,
} from './HackHelpers';
import {outlineFromHackIdeOutline} from './OutlineView';
import {convertCoverage} from './TypedRegions';
import {convertReferences} from './FindReferences';
import {hackMessageToDiagnosticMessage} from './Diagnostics';
import {executeQuery} from './SymbolSearch';
import {FileCache, ConfigObserver} from '../../nuclide-open-files-rpc';
import {getEvaluationExpression} from './EvaluationExpression';
import {ServerLanguageService, ensureInvalidations} from '../../nuclide-language-service-rpc';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {HACK_WORD_REGEX} from '../../nuclide-hack-common';

export type SymbolTypeValue = 0 | 1 | 2 | 3 | 4;

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

export async function initialize(
  hackCommand: string,
  logLevel: LogLevel,
  fileNotifier: FileNotifier,
): Promise<HackLanguageService> {
  setHackCommand(hackCommand);
  logger.setLogLevel(logLevel);
  await getHackCommand();
  return new HackLanguageServiceImpl(fileNotifier);
}

class HackLanguageServiceImpl extends ServerLanguageService {
  _resources: UniversalDisposable;

  constructor(fileNotifier: FileNotifier) {
    invariant(fileNotifier instanceof FileCache);
    super(fileNotifier, new HackSingleFileLanguageService(fileNotifier));
    this._resources = new UniversalDisposable();
    const configObserver = new ConfigObserver(
      fileNotifier,
      HACK_FILE_EXTENSIONS,
      findHackConfigDir,
    );
    this._resources.add(
      configObserver,
      configObserver.observeConfigs().subscribe(configs => {
        ensureProcesses(fileNotifier, configs);
      }));
    this._resources.add(() => {
      closeProcesses(fileNotifier);
    });
  }

  async getAutocompleteSuggestions(
    fileVersion: FileVersion,
    position: atom$Point,
    activatedManually: boolean,
    prefix: string,
  ): Promise<?Array<Completion>> {
    try {
      const process = await getHackProcess(this._fileCache, fileVersion.filePath);
      return process.getAutocompleteSuggestions(fileVersion, position, activatedManually);
    } catch (e) {
      return null;
    }
  }

  /**
   * Performs a Hack symbol search over all hack processes we manage
   */
  async executeQuery(
    queryString: string,
  ): Promise<Array<HackSearchPosition>> {
    const processes = await getHackProcesses(this._fileCache);
    const results = await Promise.all(processes.map(process =>
      executeQuery(process.getRoot(), queryString)),
    );
    return arrayFlatten(results);
  }

  dispose(): void {
    logger.logInfo('Disposing HackLanguageServiceImpl');

    this._resources.dispose();
    super.dispose();
  }
}

class HackSingleFileLanguageService {
  _fileCache: FileCache;

  constructor(fileNotifier: FileNotifier) {
    invariant(fileNotifier instanceof FileCache);
    this._fileCache = fileNotifier;
  }

  async getDiagnostics(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
  ): Promise<?DiagnosticProviderUpdate> {
    throw new Error('replaced by observeDiagnstics');
  }

  observeDiagnostics(): Observable<FileDiagnosticUpdate> {
    logger.log('observeDiagnostics');
    return observeConnections(this._fileCache)
      .mergeMap(connection => {
        logger.log('notifyDiagnostics');
        return ensureInvalidations(
            logger,
            connection.notifyDiagnostics()
            .refCount()
            .catch(error => {
              logger.logError(`Error: notifyDiagnostics ${error}`);
              return Observable.empty();
            })
            .filter((hackDiagnostics: HackDiagnosticsMessage) => {
              // This is passed over RPC as NuclideUri, which is not allowed
              // to be an empty string. It's better to silently skip a
              // (most likely) useless error, than crash the entire connection.
              // TODO: figure out a better way to display those errors
              return hackDiagnostics.filename !== '';
            })
            .map((hackDiagnostics: HackDiagnosticsMessage) => {
              logger.log(`Got hack error in ${hackDiagnostics.filename}`);
              return ({
                filePath: hackDiagnostics.filename,
                messages: hackDiagnostics.errors.map(diagnostic =>
                  hackMessageToDiagnosticMessage(diagnostic.message)),
              });
            }));
      }).catch(error => {
        logger.logError(`Error: observeDiagnostics ${error}`);
        throw error;
      });
  }

  async getAutocompleteSuggestions(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
    activatedManually: boolean,
  ): Promise<?Array<Completion>> {
    throw new Error('replaced by persistent connection');
  }

  async getDefinition(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
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
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?FindReferencesReturn> {
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
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
  ): Promise<?Outline> {
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

  async typeHint(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?TypeHint> {
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
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?Array<atom$Range>> {
    const contents = buffer.getText();

    const id = getIdentifierAtPosition(buffer, position);
    if (id == null) {
      return null;
    }

    const result: ?HackHighlightRefsResult = (await callHHClient(
      /* args */ ['--ide-highlight-refs', formatAtomLineColumn(position)],
      /* errorStream */ false,
      /* processInput */ contents,
      /* file */ filePath,
    ): any);
    return result == null
      ? null
      : result.map(hackRangeToAtomRange);
  }

  async formatSource(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    range: atom$Range,
  ): Promise<?string> {
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
    } else if (response.internal_error) {
      throw new Error('Internal error formatting hack source.');
    } else if (response.error_message !== '') {
      throw new Error(`Error formatting hack source: ${response.error_message}`);
    }
    return response.result;
  }

  formatEntireFile(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    range: atom$Range,
  ): Promise<?{
    newCursor?: number,
    formatted: string,
  }> {
    throw new Error('Not implemented');
  }

  async getEvaluationExpression(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    return getEvaluationExpression(filePath, buffer, position);
  }

  getProjectRoot(fileUri: NuclideUri): Promise<?NuclideUri> {
    return findHackConfigDir(fileUri);
  }

  /**
   * @param fileUri a file path.  It cannot be a directory.
   * @return whether the file represented by fileUri is inside of a Hack project.
   */
  async isFileInProject(fileUri: NuclideUri): Promise<boolean> {
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

function getIdentifierAndRange(
  buffer: simpleTextBuffer$TextBuffer,
  position: atom$PointObject,
): ?{id: string, range: atom$Range} {
  const matchData = wordAtPositionFromBuffer(buffer, position, HACK_WORD_REGEX);
  return (matchData == null || matchData.wordMatch.length === 0) ? null
      : {id: matchData.wordMatch[0], range: matchData.range};
}

function getIdentifierAtPosition(
  buffer: simpleTextBuffer$TextBuffer,
  position: atom$PointObject,
): ?string {
  const result = getIdentifierAndRange(buffer, position);
  return result == null ? null : result.id;
}
