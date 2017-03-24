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
import type {FileVersion} from '../../nuclide-open-files-rpc/lib/rpc-types';
import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';
import type {
  Definition,
  DefinitionQueryResult,
} from '../../nuclide-definition-service/lib/rpc-types';
import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';
import type {CoverageResult} from '../../nuclide-type-coverage/lib/rpc-types';
import type {FindReferencesReturn} from '../../nuclide-find-references/lib/rpc-types';
import type {
  DiagnosticProviderUpdate,
  FileDiagnosticMessage,
  FileDiagnosticUpdate,
  MessageType,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {
  Completion,
  SymbolResult,
} from '../../nuclide-language-service/lib/LanguageService';
import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';
import type {ConnectableObservable} from 'rxjs';
import type {
  InitializeParams,
  ServerCapabilities,
  TextDocumentIdentifier,
  Position,
  Range,
  Location,
  PublishDiagnosticsParams,
  Diagnostic,
  CompletionItem,
  TextDocumentPositionParams,
} from './protocol-v2';
import type {CategoryLogger} from '../../nuclide-logging';
import type {JsonRpcConnection} from './jsonrpc';

import nuclideUri from '../../commons-node/nuclideUri';
import {
  FileCache,
  FileVersionNotifier,
  FileEventKind,
} from '../../nuclide-open-files-rpc';
import {getBufferAtVersion} from '../../nuclide-open-files-rpc';
import * as rpc from 'vscode-jsonrpc';
import {Observable} from 'rxjs';
import {Point, Range as atom$Range} from 'simple-text-buffer';
import {LanguageServerV2} from './languageserver-v2';
import {
  DiagnosticSeverity,
} from './protocol-v2';

// Marshals messages from Nuclide's LanguageService
// to VS Code's Language Server Protocol
export class LanguageServerProtocolProcess {
  _projectRoot: string;
  _fileCache: FileCache;
  _fileSubscription: rxjs$ISubscription;
  _fileVersionNotifier: FileVersionNotifier;
  _createProcess: () => child_process$ChildProcess;
  _process: LspProcess;
  _fileExtensions: Array<string>;
  _logger: CategoryLogger;

  constructor(
    logger: CategoryLogger,
    fileCache: FileCache,
    createProcess: () => child_process$ChildProcess,
    projectRoot: string,
    fileExtensions: Array<string>,
  ) {
    this._logger = logger;
    this._fileCache = fileCache;
    this._fileVersionNotifier = new FileVersionNotifier();
    this._projectRoot = projectRoot;
    this._createProcess = createProcess;
    this._fileExtensions = fileExtensions;
  }

  static async create(
    logger: CategoryLogger,
    fileCache: FileCache,
    createProcess: () => child_process$ChildProcess,
    projectRoot: string,
    fileExtensions: Array<string>,
  ): Promise<LanguageServerProtocolProcess> {
    const result = new LanguageServerProtocolProcess(
      logger, fileCache, createProcess, projectRoot, fileExtensions);
    await result._ensureProcess();
    return result;
  }

  _subscribeToFileEvents(): void {
    this._fileSubscription = this._fileCache.observeFileEvents()
      // TODO: Filter on projectRoot
      .filter(fileEvent => {
        const fileExtension = nuclideUri.extname(fileEvent.fileVersion.filePath);
        return this._fileExtensions.indexOf(fileExtension) !== -1;
      })
      .subscribe(fileEvent => {
        const filePath = fileEvent.fileVersion.filePath;
        const version = fileEvent.fileVersion.version;
        switch (fileEvent.kind) {
          case FileEventKind.OPEN:
            this._process._connection.didOpenTextDocument({
              textDocument: {
                uri: filePath,
                languageId: 'python', // TODO
                version,
                text: fileEvent.contents,
              },
            });
            break;
          case FileEventKind.CLOSE:
            this._process._connection.didCloseTextDocument({
              textDocument: toTextDocumentIdentifier(filePath),
            });
            break;
          case FileEventKind.EDIT:
            this._fileCache.getBufferAtVersion(fileEvent.fileVersion)
              .then(buffer => {
                if (buffer == null) {
                  // TODO: stale ... send full contents from current buffer version
                  return;
                }
                this._process._connection.didChangeTextDocument({
                  textDocument: {
                    uri: filePath,
                    version,
                  },
                  // Send full contents
                  // TODO: If the provider handles incremental diffs
                  // Then send them instead
                  contentChanges: [{
                    text: buffer.getText(),
                  }],
                });
              });
            break;
          default:
            throw new Error(`Unexpected FileEvent kind: ${JSON.stringify(fileEvent)}`);
        }
        this._fileVersionNotifier.onEvent(fileEvent);
      });
  }

  // TODO: Handle the process termination/restart.
  async _ensureProcess(): Promise<void> {
    try {
      this._process = await LspProcess.create(
        this._logger, this._createProcess(), this._projectRoot);
      this._subscribeToFileEvents();
    } catch (e) {
      this._logger.logError('LanguageServerProtocolProcess - error spawning child process: ' + e);
      throw e;
    }
  }

  _onNotification(message: Object): void {
    this._logger.logError(
      `LanguageServerProtocolProcess - onNotification: ${JSON.stringify(message)}`);
    // TODO: Handle incoming messages
  }

  getRoot(): string {
    return this._projectRoot;
  }

  async getBufferAtVersion(fileVersion: FileVersion): Promise<?simpleTextBuffer$TextBuffer> {
    const buffer = await getBufferAtVersion(fileVersion);
    // Must also wait for edits to be sent to the LSP process
    if (!(await this._fileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
      return null;
    }
    return buffer != null && buffer.changeCount === fileVersion.version ? buffer : null;
  }

  getDiagnostics(
    fileVersion: FileVersion,
  ): Promise<?DiagnosticProviderUpdate> {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  observeDiagnostics(): ConnectableObservable<FileDiagnosticUpdate> {
    const con = this._process._connection;
    return (Observable.fromEventPattern(
        con.onDiagnosticsNotification.bind(con),
        () => undefined,
      ): Observable<PublishDiagnosticsParams>)
      .map(convertDiagnostics)
      .publish();
  }

  async getAutocompleteSuggestions(
    fileVersion: FileVersion,
    position: atom$Point,
    activatedManually: boolean,
    prefix: string,
  ): Promise<?Array<Completion>> {
    const result = await this._process._connection.completion(
      await this.createTextDocumentPositionParams(fileVersion, position));
    return Array.isArray(result)
      ? result.map(convertCompletion)
      : result.items.map(convertCompletion);
  }

  async getDefinition(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    const result = await this._process._connection.gotoDefinition(
        await this.createTextDocumentPositionParams(fileVersion, position));
    return {
      // TODO: use wordAtPos to determine queryrange
      queryRange: [new atom$Range(position, position)],
      definitions: this.locationsDefinitions(result),
    };
  }

  getDefinitionById(
    file: NuclideUri,
    id: string,
  ): Promise<?Definition> {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  findReferences(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?FindReferencesReturn> {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  getCoverage(
    filePath: NuclideUri,
  ): Promise<?CoverageResult> {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  getOutline(
    fileVersion: FileVersion,
  ): Promise<?Outline> {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  async typeHint(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?TypeHint> {
    const request =
      await this.createTextDocumentPositionParams(fileVersion, position);
    const response = await this._process._connection.hover(request);

    let hint = response.contents;
    if (Array.isArray(hint)) {
      hint = (hint.length > 0 ? hint[0] : '');
      // TODO: render multiple hints at once with a thin divider between them
    }
    if (typeof hint === 'string') {
      // TODO: convert markdown to text
    } else {
      hint = hint.value;
      // TODO: colorize code if possible. (is hard without knowing its context)
    }

    let range = new atom$Range(position, position);
    if (response.range) {
      range = rangeToAtomRange(response.range);
    }

    return (hint) ? {hint, range} : null;
  }

  highlight(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?Array<atom$Range>> {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  formatSource(
    fileVersion: FileVersion,
    range: atom$Range,
  ): Promise<?string> {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  formatEntireFile(fileVersion: FileVersion, range: atom$Range): Promise<?{
    newCursor?: number,
    formatted: string,
  }> {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  getEvaluationExpression(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  supportsSymbolSearch(
    directories: Array<NuclideUri>,
  ): Promise<boolean> {
    this._logger.logError('NYI');
    return Promise.resolve(false);
  }

  symbolSearch(
    query: string,
    directories: Array<NuclideUri>,
  ): Promise<?Array<SymbolResult>> {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  getProjectRoot(fileUri: NuclideUri): Promise<?NuclideUri> {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  isFileInProject(fileUri: NuclideUri): Promise<boolean> {
    this._logger.logError('NYI');
    return Promise.resolve(false);
  }

  dispose(): void {
    this._process.dispose();
    /* TODO
    if (!this.isDisposed()) {
      // Atempt to send disconnect message before shutting down connection
      try {
        this._logger.logTrace(
          'Attempting to disconnect cleanly from LanguageServerProtocolProcess');
        this.getConnectionService().disconnect();
      } catch (e) {
        // Failing to send the shutdown is not fatal...
        // ... continue with shutdown.
        this._logger.logError('Hack Process died before disconnect() could be sent.');
      }
      super.dispose();
      this._fileVersionNotifier.dispose();
      this._fileSubscription.unsubscribe();
      if (processes.has(this._fileCache)) {
        processes.get(this._fileCache).delete(this._projectRoot);
      }
    } else {
      this._logger.logInfo(
        `LanguageServerProtocolProcess attempt to shut down already disposed ${this.getRoot()}.`);
    }
    */
  }

  locationToDefinition(location: Location): Definition {
    return {
      path: location.uri,
      position: positionToPoint(location.range.start),
      language: 'Python', // TODO
      projectRoot: this._projectRoot,
    };
  }

  locationsDefinitions(locations: Location | Location[]): Array<Definition> {
    if (Array.isArray(locations)) {
      return locations.map(this.locationToDefinition.bind(this));
    } else {
      return [this.locationToDefinition(locations)];
    }
  }

  async createTextDocumentPositionParams(
    fileVersion: FileVersion,
    position: atom$Point,
  ): Promise<TextDocumentPositionParams> {
    await this.getBufferAtVersion(fileVersion);
    return createTextDocumentPositionParams(fileVersion, position);
  }
}

// Encapsulates an LSP process
class LspProcess {
  _logger: CategoryLogger;
  _process: child_process$ChildProcess;
  _connection: LanguageServerV2;
  _capabilities: ServerCapabilities;
  _projectRoot: NuclideUri;

  constructor(
    logger: CategoryLogger,
    process: child_process$ChildProcess,
    projectRoot: NuclideUri,
    isIpc: boolean,
  ) {
    this._logger = logger;
    this._process = process;
    this._projectRoot = projectRoot;

    this._logger.logInfo(
      'LanguageServerProtocolProcess - created child process with PID: ' + process.pid);

    process.stdin.on('error', error => {
      this._logger.logError('LanguageServerProtocolProcess - error writing data: ' + error);
    });

    let reader;
    let writer;
    if (isIpc) {
      reader = new rpc.IPCMessageReader(process);
      writer = new rpc.IPCMessageWriter(process);
    } else {
      reader = new rpc.StreamMessageReader(process.stdout);
      writer = new rpc.StreamMessageWriter(process.stdin);
    }

    const rpc_logger = {
      error(message) { logger.logError('JsonRpc ' + message); },
      warn(message) { logger.logInfo('JsonRpc ' + message); },
      info(message) { logger.logInfo('JsonRpc ' + message); },
      log(message) { logger.logInfo('JsonRpc ' + message); },
    };

    const connection: JsonRpcConnection = rpc.createMessageConnection(
      reader,
      writer,
      rpc_logger);

    connection.listen();
    // TODO: connection.onNotification(this._onNotification.bind(this));

    this._connection = new LanguageServerV2(this._logger, connection);
  }

  // Creates the connection and initializes capabilities
  static async create(
    logger: CategoryLogger,
    process: child_process$ChildProcess,
    projectRoot: NuclideUri,
  ): Promise<LspProcess> {
    const result = new LspProcess(logger, process, projectRoot, false);

    const init: InitializeParams = {
      // TODO:
      initializationOptions: {},
      processId: process.pid,
      rootPath: projectRoot,
      capabilities: {},
      // TODO: capabilities
      /*
      capabilities: {
        workspace: {},
        textDocument: {
          definition: {
            dynamicRegistration: true,
          },
        },
        experimental: {},
      },
      */
    };
    result._capabilities = (await
      result._connection.initialize(init)).capabilities;

    return result;
  }

  _onNotification(message: Object): void {
    this._logger.logError(
      `LanguageServerProtocolProcess - onNotification: ${JSON.stringify(message)}`);
    // TODO: Handle incoming messages
  }

  dispose(): void {
    // TODO
  }
}

export function toTextDocumentIdentifier(filePath: NuclideUri): TextDocumentIdentifier {
  return {
    uri: filePath,
  };
}

export function pointToPosition(position: atom$Point): Position {
  return {
    line: position.row,
    character: position.column,
  };
}

export function positionToPoint(position: Position): atom$Point {
  return new Point(position.line, position.character);
}

export function rangeToAtomRange(range: Range): atom$Range {
  return new atom$Range(
    positionToPoint(range.start), positionToPoint(range.end));
}

export function convertDiagnostics(
  params: PublishDiagnosticsParams,
): FileDiagnosticUpdate {
  return {
    filePath: params.uri,
    messages: params.diagnostics.map(
      diagnostic => convertDiagnostic(params.uri, diagnostic)),
  };
}

export function convertDiagnostic(
  filePath: NuclideUri,
  diagnostic: Diagnostic,
): FileDiagnosticMessage {
  return {
    // TODO: diagnostic.code
    scope: 'file',
    providerName: diagnostic.source || 'TODO: VSCode LSP',
    type: convertSeverity(diagnostic.severity),
    filePath,
    text: diagnostic.message,
    range: rangeToAtomRange(diagnostic.range),
  };
}

export function convertSeverity(severity?: number): MessageType {
  switch (severity) {
    case null:
    case undefined:
    case DiagnosticSeverity.Error:
    default:
      return 'Error';
    case DiagnosticSeverity.Warning:
    case DiagnosticSeverity.Information:
    case DiagnosticSeverity.Hint:
      return 'Warning';
  }
}

export function createTextDocumentPositionParams(
  fileVersion: FileVersion,
  position: atom$Point,
): TextDocumentPositionParams {
  return {
    textDocument: toTextDocumentIdentifier(fileVersion.filePath),
    position: pointToPosition(position),
  };
}

export function convertCompletion(item: CompletionItem): Completion {
  return {
    text: item.insertText || item.label,
    displayText: item.label,
    type: item.detail,
    description: item.documentation,
  };
}
