/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {
  FindReferencesReturn,
  DefinitionQueryResult,
  Outline,
  CodeAction,
  SignatureHelp,
} from 'atom-ide-ui';
import type {TextEdit} from 'nuclide-commons-atom/text-edit';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {DeadlineRequest} from 'nuclide-commons/promise';
import type {ConnectableObservable} from 'rxjs';
import type {
  LanguageService,
  FileDiagnosticMap,
  AutocompleteRequest,
  AutocompleteResult,
  FormatOptions,
  FileDiagnosticMessage,
  StatusData,
} from '../../nuclide-language-service/lib/LanguageService';
import type {AdditionalLogFile} from '../../nuclide-logging/lib/rpc-types';
import type {FileVersion} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {SymbolResult} from '../../nuclide-quick-open/lib/types';
import type {CoverageResult} from '../../nuclide-type-coverage/lib/rpc-types';
import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';

import type {HostServices} from '../../nuclide-language-service-rpc/lib/rpc-types';
import type {LogLevel} from '../../nuclide-logging/lib/rpc-types';
import type {FileNotifier} from '../../nuclide-open-files-rpc/lib/rpc-types';

import invariant from 'assert';
import fsPromise from 'nuclide-commons/fsPromise';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {getOriginalEnvironment} from 'nuclide-commons/process';
import which from 'nuclide-commons/which';
import {getLogger} from 'log4js';
import {forkHostServices} from '../../nuclide-language-service-rpc';
import {FileCache} from '../../nuclide-open-files-rpc';
import {createCacheDir} from './child/CqueryInitialization';
import {COMPILATION_DATABASE_FILE} from './child/FlagUtils';
import {CqueryLanguageClient} from './CqueryLanguageClient';
import CqueryLanguageServer from './CqueryLanguageServer';

const EXTENSIONS = ['.c', '.cpp', '.h', '.hpp', '.cc', '.tcc', '.m', 'mm'];

export interface CqueryLanguageService extends LanguageService {
  restartProcessForFile(file: NuclideUri): Promise<void>;
  // Below copied from LanguageService
  // TODO pelmers: why doesn't service-parser handle extends?
  getDiagnostics(fileVersion: FileVersion): Promise<?FileDiagnosticMap>;

  observeDiagnostics(): ConnectableObservable<FileDiagnosticMap>;

  observeStatus(fileVersion: FileVersion): ConnectableObservable<StatusData>;

  clickStatus(
    fileVersion: FileVersion,
    id: string,
    button: string,
  ): Promise<void>;

  getAutocompleteSuggestions(
    fileVersion: FileVersion,
    position: atom$Point,
    request: AutocompleteRequest,
  ): Promise<?AutocompleteResult>;

  getDefinition(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult>;

  findReferences(
    fileVersion: FileVersion,
    position: atom$Point,
  ): ConnectableObservable<?FindReferencesReturn>;

  rename(
    fileVersion: FileVersion,
    position: atom$Point,
    newName: string,
  ): Promise<?Map<NuclideUri, Array<TextEdit>>>;

  getCoverage(filePath: NuclideUri): Promise<?CoverageResult>;

  onToggleCoverage(set: boolean): Promise<void>;

  getOutline(fileVersion: FileVersion): Promise<?Outline>;

  getCodeActions(
    fileVersion: FileVersion,
    range: atom$Range,
    diagnostics: Array<FileDiagnosticMessage>,
  ): Promise<Array<CodeAction>>;

  typeHint(fileVersion: FileVersion, position: atom$Point): Promise<?TypeHint>;

  signatureHelp(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?SignatureHelp>;

  highlight(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?Array<atom$Range>>;

  formatSource(
    fileVersion: FileVersion,
    range: atom$Range,
    options: FormatOptions,
  ): Promise<?Array<TextEdit>>;

  formatEntireFile(
    fileVersion: FileVersion,
    range: atom$Range,
    options: FormatOptions,
  ): Promise<?{
    newCursor?: number,
    formatted: string,
  }>;

  formatAtPosition(
    fileVersion: FileVersion,
    position: atom$Point,
    triggerCharacter: string,
    options: FormatOptions,
  ): Promise<?Array<TextEdit>>;

  getAdditionalLogFiles(
    deadline: DeadlineRequest,
  ): Promise<Array<AdditionalLogFile>>;

  supportsSymbolSearch(directories: Array<NuclideUri>): Promise<boolean>;

  symbolSearch(
    query: string,
    directories: Array<NuclideUri>,
  ): Promise<?Array<SymbolResult>>;

  getProjectRoot(fileUri: NuclideUri): Promise<?NuclideUri>;

  isFileInProject(fileUri: NuclideUri): Promise<boolean>;

  getExpandedSelectionRange(
    fileVersion: FileVersion,
    currentSelection: atom$Range,
  ): Promise<?atom$Range>;

  getCollapsedSelectionRange(
    fileVersion: FileVersion,
    currentSelection: atom$Range,
    originalCursorPosition: atom$Point,
  ): Promise<?atom$Range>;

  sendLspRequest(
    filePath: NuclideUri,
    method: string,
    params: mixed,
  ): Promise<mixed>;

  sendLspNotification(
    filePath: NuclideUri,
    method: string,
    params: mixed,
  ): Promise<void>;

  observeLspNotifications(
    notificationMethod: string,
  ): ConnectableObservable<mixed>;

  dispose(): void;
}

async function ensureCommandExists(
  command: string,
  logger: log4js$Logger,
  host: HostServices,
  languageId: string,
): Promise<boolean> {
  if ((await which(command)) == null) {
    const message = `Command "${command}" could not be found: ${languageId} language features will be disabled.`;
    logger.warn(message);
    return false;
  }
  return true;
}

function createLogger(logCategory: string, logLevel: LogLevel): log4js$Logger {
  const logger = getLogger(logCategory);
  logger.setLevel(logLevel);
  return logger;
}

/**
 * Creates a language service capable of connecting to an LSP server.
 *
 * TODO: Document all of the fields below.
 */
export async function createCqueryService(params: {|
  fileNotifier: FileNotifier,
  host: HostServices,
  logCategory: string,
  logLevel: LogLevel,
  enableLibclangLogs: boolean,
  indexerThreads: number,
  defaultFlags: Array<string>,
|}): Promise<?CqueryLanguageService> {
  const command = 'cquery';
  const languageId = 'cquery';
  const logger = createLogger(params.logCategory, params.logLevel);

  if (!(await ensureCommandExists(command, logger, params.host, languageId))) {
    return null;
  }

  const fileCache = params.fileNotifier;
  invariant(fileCache instanceof FileCache);

  const forkedHost = await forkHostServices(params.host, logger);
  const multiLsp = new CqueryLanguageServer(forkedHost);
  const cqueryFactory = async (projectRoot: string) => {
    const cacheDirectory = await createCacheDir(projectRoot);
    const logFile = nuclideUri.join(cacheDirectory, '..', 'diagnostics');
    const recordFile = nuclideUri.join(cacheDirectory, '..', 'record');
    const [, host] = await Promise.all([
      multiLsp.hasObservedDiagnostics(),
      forkHostServices(params.host, logger),
    ]);
    const stderrFd = await fsPromise.open(
      nuclideUri.join(cacheDirectory, '..', 'stderr'),
      'a',
    );
    const spawnOptions = {
      stdio: ['pipe', 'pipe', stderrFd],
      env: {...(await getOriginalEnvironment())},
    };

    const lsp = new CqueryLanguageClient(
      logger,
      fileCache,
      host,
      command,
      process.execPath,
      [
        require.resolve('./child/main-entry'),
        nuclideUri.ensureTrailingSeparator(projectRoot),
        logFile,
        recordFile,
        String(params.enableLibclangLogs),
      ],
      spawnOptions,
      projectRoot,
      EXTENSIONS,
      {
        extraClangArguments: params.defaultFlags,
        index: {threads: params.indexerThreads},
      },
      5 * 60 * 1000, // 5 minutes
      logFile,
      cacheDirectory,
    );
    lsp.start(); // Kick off 'Initializing'...
    return lsp;
  };
  multiLsp.initialize(
    logger,
    fileCache,
    forkedHost,
    ['.buckconfig', COMPILATION_DATABASE_FILE],
    'nearest',
    EXTENSIONS,
    cqueryFactory,
  );
  return (multiLsp: CqueryLanguageService);
}
