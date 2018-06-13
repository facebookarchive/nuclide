/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

// Provides some extra commands on top of base Lsp.
import type {CodeAction, OutlineTree} from 'atom-ide-ui';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Subscription, ConnectableObservable} from 'rxjs';
import type {HostServices} from '../../nuclide-language-service-rpc/lib/rpc-types';
import type {FileDiagnosticMap} from '../../nuclide-language-service/lib/LanguageService';
import type {FileCache} from '../../nuclide-open-files-rpc';
import type {
  TextEdit,
  Command,
  SymbolInformation,
} from '../../nuclide-vscode-language-service-rpc/lib/protocol';
import type {RequestLocationsResult} from './types';

import {Observable} from 'rxjs';
import {
  lspUri_localPath,
  localPath_lspUri,
  lspTextEdits_atomTextEdits,
  lspRange_atomRange,
  atomPoint_lspPosition,
} from '../../nuclide-vscode-language-service-rpc/lib/convert';
import {LspLanguageService} from '../../nuclide-vscode-language-service-rpc/lib/LspLanguageService';
import {parseOutlineTree} from './outline/CqueryOutlineParser';

type CqueryProgressNotification = {
  indexRequestCount: number,
  doIdMapCount: number,
  loadPreviousIndexCount: number,
  onIdMappedCount: number,
  onIndexedCount: number,
};

type ProgressInfo = {
  label: string,
  id: string,
};

// FIXME pelmers: tracking cquery/issues/30
// https://github.com/jacobdufault/cquery/issues/30#issuecomment-345536318
function shortenByOneCharacter({newText, range}: TextEdit): TextEdit {
  return {
    newText,
    range: {
      start: range.start,
      end: {line: range.end.line, character: range.end.character - 1},
    },
  };
}

export class CqueryLanguageClient extends LspLanguageService {
  _projectKey: string;
  _progressInfo: ProgressInfo;
  _logFile: string;
  _cacheDirectory: string;
  _progressSubscription: ?Subscription;

  start(): Promise<void> {
    // Workaround for https://github.com/babel/babel/issues/3930
    return super.start().then(() => this.startCquery());
  }

  constructor(
    logger: log4js$Logger,
    fileCache: FileCache,
    host: HostServices,
    languageServerName: string,
    command: string,
    args: Array<string>,
    spawnOptions: Object = {},
    projectRoot: string,
    fileExtensions: Array<string>,
    initializationOptions: Object,
    additionalLogFilesRetentionPeriod: number,
    logFile: string,
    cacheDirectory: string,
    progressInfo: ProgressInfo,
    useOriginalEnvironment?: boolean = false,
  ) {
    super(
      logger,
      fileCache,
      host,
      languageServerName,
      command,
      args,
      spawnOptions,
      /* fork */ false,
      projectRoot,
      fileExtensions,
      initializationOptions,
      additionalLogFilesRetentionPeriod,
      useOriginalEnvironment,
    );
    this._logFile = logFile;
    this._cacheDirectory = cacheDirectory;
    this._progressInfo = progressInfo;
  }

  async startCquery(): Promise<void> {
    const progressObservable = Observable.create(subscriber => {
      this._lspConnection._jsonRpcConnection.onNotification(
        {method: '$cquery/progress'},
        (args: CqueryProgressNotification) => {
          const {
            indexRequestCount,
            doIdMapCount,
            loadPreviousIndexCount,
            onIdMappedCount,
            onIndexedCount,
          } = args;
          const total =
            indexRequestCount +
            doIdMapCount +
            loadPreviousIndexCount +
            onIdMappedCount +
            onIndexedCount;
          subscriber.next(total);
        },
      );
    }).distinctUntilChanged();
    if (this._progressInfo != null) {
      const {id, label} = this._progressInfo;
      // Because of the 'freshen' command, cquery may finish
      // (i.e. progress reaches 0) then start emitting progress events again.
      // So each time it reaches 0 create a new id by adding a monotonic number.
      let progressId = 0;
      this._progressSubscription = progressObservable.subscribe(totalJobs => {
        const taggedId = id + progressId;
        if (totalJobs === 0) {
          // label null clears the indicator.
          this._handleProgressNotification({
            id: taggedId,
            label: null,
          });
          progressId++;
        } else {
          this._handleProgressNotification({
            id: taggedId,
            label: `cquery ${label}: ${totalJobs} jobs`,
          });
        }
      });
    }
    // TODO pelmers Register handlers for other custom cquery messages.
    // TODO pelmers hook into refactorizer for renaming?
  }

  dispose(): void {
    if (this._progressSubscription != null) {
      this._progressSubscription.unsubscribe();
    }
    super.dispose();
  }

  getCacheDirectory(): string {
    return this._cacheDirectory;
  }

  _createOutlineTreeHierarchy(
    list: Array<[SymbolInformation, OutlineTree]>,
  ): OutlineTree {
    return parseOutlineTree(list);
  }

  _executeCommand(command: string, args?: Array<any>): Promise<void> {
    const cqueryEditCommands = new Set(['cquery._applyFixIt']);
    if (cqueryEditCommands.has(command) && args != null && args.length === 2) {
      return this._applyEdit(...args).then(result =>
        this._notifyOnFail(result, 'Cquery: apply edit failed'),
      );
    } else {
      return super._executeCommand(command, args);
    }
    // TODO pelmers: handle cquery._autoImplement
  }

  _convertCommands_CodeActions(commands: Array<Command>): Array<CodeAction> {
    // Find 'cquery._insertInclude' commands and deduplicate/expand them.
    // If there is one edit then the message is 'Insert #include <header>',
    // Otherwise the message is 'Pick one of $x includes' and we ask for choice.
    const outputCommands = [];
    const seenIncludes = new Set();
    for (const command of commands) {
      if (command.command !== 'cquery._insertInclude') {
        outputCommands.push(command);
      } else if (command.arguments != null && command.arguments.length === 2) {
        const file: string = command.arguments[0];
        const edits: Array<TextEdit> = command.arguments[1];
        // Split each edit into its own command.
        for (const edit of edits) {
          const includeValue = edit.newText.trim();
          if (!seenIncludes.has(includeValue)) {
            seenIncludes.add(includeValue);
            // Add a command for quote and bracket includes.
            for (const wrappedInclude of [
              `<${includeValue}>`,
              `"${includeValue}"`,
            ]) {
              outputCommands.push({
                command: 'cquery._applyFixIt',
                title: 'Insert ' + wrappedInclude,
                arguments: [
                  file,
                  [
                    {
                      ...edit,
                      newText: `#include ${wrappedInclude}\n`,
                    },
                  ],
                ],
              });
            }
          }
        }
      }
    }
    return super._convertCommands_CodeActions(outputCommands);
  }

  observeDiagnostics(): ConnectableObservable<FileDiagnosticMap> {
    // Only emit diagnostics for files in the project.
    return super
      .observeDiagnostics()
      .refCount()
      .do(diagnosticMap => {
        for (const [file] of diagnosticMap) {
          if (!this._isFileInProject(file)) {
            diagnosticMap.delete(file);
          }
        }
      })
      .publish();
  }

  async _notifyOnFail(success: boolean, falseMessage: string): Promise<void> {
    if (!success) {
      return this._host
        .dialogNotification('warning', falseMessage)
        .refCount()
        .toPromise();
    }
  }

  // TODO pelmers(T25418348): remove when cquery implements workspace/applyEdit
  // track https://github.com/jacobdufault/cquery/issues/283
  async _applyEdit(file: string, edits: Array<TextEdit>): Promise<boolean> {
    return this._host.applyTextEditsForMultipleFiles(
      new Map([
        [
          lspUri_localPath(file),
          lspTextEdits_atomTextEdits(edits.map(shortenByOneCharacter)),
        ],
      ]),
    );
  }

  async freshenIndex(): Promise<void> {
    // identical to vscode extension, https://git.io/vbUbQ
    this._lspConnection._jsonRpcConnection.sendNotification(
      '$cquery/freshenIndex',
      {},
    );
  }

  async requestLocationsCommand(
    methodName: string,
    path: NuclideUri,
    point: atom$Point,
  ): Promise<RequestLocationsResult> {
    const position = atomPoint_lspPosition(point);
    const response = await this._lspConnection._jsonRpcConnection.sendRequest(
      methodName,
      {
        textDocument: {
          uri: localPath_lspUri(path),
        },
        position,
      },
    );
    return response == null
      ? []
      : response.map(({uri, range}) => ({
          uri: lspUri_localPath(uri),
          range: lspRange_atomRange(range),
        }));
  }
}
