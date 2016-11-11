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
  HackCompletionsResult,
  HackDiagnosticsResult,
} from './rpc-types';
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

import {Observable} from 'rxjs';
import {wordAtPositionFromBuffer} from '../../commons-node/range';
import invariant from 'assert';
import {retryLimit} from '../../commons-node/promise';
import {
  callHHClient,
  HACK_WORD_REGEX,
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
  observeConnections,
  ensureProcesses,
} from './HackProcess';
import {convertDefinitions} from './Definitions';
import {
  hackRangeToAtomRange,
  atomPointOfHackRangeStart,
} from './HackHelpers';
import {outlineFromHackIdeOutline} from './OutlineView';
import {convertCoverage} from './TypedRegions';
import {convertReferences} from './FindReferences';
import {hasPrefix, findHackPrefix, convertCompletions} from './Completions';
import {
  hackMessageToDiagnosticMessage,
  convertDiagnostics,
} from './Diagnostics';
import {executeQuery} from './SymbolSearch';
import {FileCache, ConfigObserver} from '../../nuclide-open-files-rpc';
import {getEvaluationExpression} from './EvaluationExpression';
import {ServerLanguageService} from '../../nuclide-language-service-rpc';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

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

const HH_DIAGNOSTICS_DELAY_MS = 600;
const HH_CLIENT_MAX_TRIES = 10;

export async function initialize(
  hackCommand: string,
  useIdeConnection: boolean,
  logLevel: LogLevel,
  fileNotifier: FileNotifier,
): Promise<HackLanguageService> {
  setHackCommand(hackCommand);
  logger.setLogLevel(logLevel);
  await getHackCommand();
  return new HackLanguageServiceImpl(useIdeConnection, fileNotifier);
}

class HackLanguageServiceImpl extends ServerLanguageService {
  _useIdeConnection: boolean;
  _resources: UniversalDisposable;

  constructor(useIdeConnection: boolean, fileNotifier: FileNotifier) {
    super(fileNotifier, new HackSingleFileLanguageService(useIdeConnection, fileNotifier));
    this._useIdeConnection = useIdeConnection;
    this._resources = new UniversalDisposable();
    if (useIdeConnection) {
      invariant(fileNotifier instanceof FileCache);
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
    }
  }

  async getAutocompleteSuggestions(
    fileVersion: FileVersion,
    position: atom$Point,
    activatedManually: boolean,
  ): Promise<Array<Completion>> {
    if (this._useIdeConnection) {
      const process = await getHackProcess(this._fileCache, fileVersion.filePath);
      if (process == null) {
        return [];
      } else {
        return process.getAutocompleteSuggestions(fileVersion, position, activatedManually);
      }
    } else {
      // Babel workaround: w/o the es2015-classes transform, async functions can't call `super`.
      // https://github.com/babel/babel/issues/3930
      return ServerLanguageService.prototype.getAutocompleteSuggestions
        .call(this, fileVersion, position, activatedManually);
    }
  }

  /**
   * Performs a Hack symbol search in the specified directory.
   */
  executeQuery(
    rootDirectory: NuclideUri,
    queryString: string,
  ): Promise<Array<HackSearchPosition>> {
    return executeQuery(rootDirectory, queryString);
  }

  dispose(): void {
    this._resources.dispose();
    super.dispose();
  }
}

class HackSingleFileLanguageService {
  _useIdeConnection: boolean;
  _fileCache: FileCache;

  constructor(useIdeConnection: boolean, fileNotifier: FileNotifier) {
    this._useIdeConnection = useIdeConnection;
    invariant(fileNotifier instanceof FileCache);
    this._fileCache = fileNotifier;
  }

  async getDiagnostics(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
  ): Promise<?DiagnosticProviderUpdate> {
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

  observeDiagnostics(): Observable<FileDiagnosticUpdate> {
    logger.logTrace('observeDiagnostics');
    invariant(this._useIdeConnection);
    return observeConnections(this._fileCache)
      .mergeMap(connection => {
        logger.logTrace('notifyDiagnostics');
        const filesWithErrors = new Set();
        const diagnostics: Observable<FileDiagnosticUpdate> = connection.notifyDiagnostics()
          .refCount()
          .catch(error => {
            logger.logError(`Error: notifyDiagnostics ${error}`);
            return Observable.empty();
          })
          .map(hackDiagnostics => {
            logger.logTrace(`Got hack error in ${hackDiagnostics.filename}`);
            return ({
              filePath: hackDiagnostics.filename,
              messages: hackDiagnostics.errors.map(diagnostic =>
                hackMessageToDiagnosticMessage(diagnostic.message)),
            });
          })
          .do(diagnostic => {
            const filePath = diagnostic.filePath;
            if (diagnostic.messages.length === 0) {
              logger.logTrace(`Removing ${filePath} from files with errors`);
              filesWithErrors.delete(filePath);
            } else {
              logger.logTrace(`Adding ${filePath} to files with errors`);
              filesWithErrors.add(filePath);
            }
          });

        const fileInvalidations: Observable<FileDiagnosticUpdate> =
          Observable.defer(() => Observable.from(Array.from(filesWithErrors).map(file => ({
            filePath: file,
            messages: [],
          }))));

        return diagnostics.concat(fileInvalidations);
      });
  }

  async getAutocompleteSuggestions(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
    activatedManually: boolean,
  ): Promise<Array<Completion>> {
    const contents = buffer.getText();
    const offset = buffer.characterIndexForPosition(position);

    const replacementPrefix = findHackPrefix(buffer, position);
    if (replacementPrefix === '' && !hasPrefix(buffer, position)) {
      return [];
    }

    const markedContents = markFileForCompletion(contents, offset);
    const result: ?HackCompletionsResult = (await callHHClient(
      /* args */ ['--auto-complete'],
      /* errorStream */ false,
      /* processInput */ markedContents,
      /* file */ filePath,
    ): any);
    return convertCompletions(contents, offset, replacementPrefix, result);
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
  ): Promise<Array<atom$Range>> {
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

// Calculate the offset of the cursor from the beginning of the file.
// Then insert AUTO332 in at this offset. (Hack uses this as a marker.)
function markFileForCompletion(contents: string, offset: number): string {
  return contents.substring(0, offset) +
      'AUTO332' + contents.substring(offset, contents.length);
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
