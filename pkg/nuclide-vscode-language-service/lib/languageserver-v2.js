/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {CategoryLogger} from '../../nuclide-logging';
import type {JsonRpcConnection} from './jsonrpc';

import * as rpc from 'vscode-jsonrpc';
import * as p from './protocol-v2';

const MAX_LOG_MESSAGE_LENGTH = 100;

export class LanguageServerV2 {
  _logger: CategoryLogger;
  connection: JsonRpcConnection;

  constructor(
    logger: CategoryLogger,
    connection: rpc.connection,
  ) {
    this._logger = logger;
    this.connection = connection;

    connection.onError((e1, e2, e3) => {
      // TODO: What is the shape of args here?
      const args = Array.prototype.slice.call(arguments);
      this._logger.logError(`LanguageServerV2 - onError ${JSON.stringify(args)}`);
    });

    connection.onClose(() => {
      this._logger.logInfo('LanguageServerV2 - onClose');
    });

    connection.onDispose(() => {
      this._logger.logInfo('LanguageServerV2 - onDispose');
    });

    connection.onUnhandledNotification((e1, e2, e3) => {
      // TODO: What is the shape of args here?
      const args = Array.prototype.slice.call(arguments);
      this._logger.logError(`LanguageServerV2 - onUnhandledNotification ${JSON.stringify(args)}`
        .substr(0, MAX_LOG_MESSAGE_LENGTH));
    });

    connection.onNotification((e1, e2, e3) => {
      // TODO: What is the shape of args here?
      const args = Array.prototype.slice.call(arguments);
      this._logger.logInfo(`LanguageServerV2 - onNotification ${JSON.stringify(args)}`
        .substr(0, MAX_LOG_MESSAGE_LENGTH));
    });
  }

  initialize(params: p.InitializeParams): Promise<p.InitializeResult> {
    return this._sendRequest('initialize', params);
  }

  shutdown(): Promise<void> {
    return this._sendRequest('shutdown');
  }

  exit(): void {
    this._sendNotification('exit');
  }

  showMessageNotification(params: p.ShowMessageParams): void {
    this._sendNotification('window/showMessage', params);
  }

  showMessageRequest(params: p.ShowMessageRequestParams): Promise<p.MessageActionItem> {
    return this._sendRequest('window/showMessageRequest', params);
  }

  logMessage(params: p.LogMessageParams): void {
    this._sendNotification('window/logMessage', params);
  }

  telemetry(params: any): void {
    this._sendNotification('telemetry/event', params);
  }

  didChangeConfiguration(params: p.DidChangeConfigurationParams): void {
    this._sendNotification('workspace/didChangeConfiguration', params);
  }

  didOpenTextDocument(params: p.DidOpenTextDocumentParams): void {
    this._sendNotification('textDocument/didOpen', params);
  }

  didChangeTextDocument(params: p.DidChangeTextDocumentParams): void {
    this._sendNotification('textDocument/didChange', params);
  }

  didCloseTextDocument(params: p.DidCloseTextDocumentParams): void {
    this._sendNotification('textDocument/didClose', params);
  }

  didSaveTextDocument(params: p.DidSaveTextDocumentParams): void {
    this._sendNotification('textDocument/didSave', params);
  }

  didChangeWatchedFiles(params: p.DidChangeWatchedFilesParams): void {
    this._sendNotification('workspace/didChangeWatchedFiles', params);
  }

  publishDiagnostics(params: p.PublishDiagnosticsParams): void {
    this._sendNotification('textDocument/publishDiagnostics', params);
  }

  completion(
    params: p.TextDocumentPositionParams,
  ): Promise<p.CompletionList | Array<p.CompletionItem>> {
    return this._sendRequest('textDocument/completion', params);
  }

  completionItemResolve(params: p.CompletionItem): Promise<p.CompletionItem> {
    return this._sendRequest('completionItem/resolve', params);
  }

  hover(params: p.TextDocumentPositionParams): Promise<p.Hover> {
    return this._sendRequest('textDocument/hover', params);
  }

  signatureHelp(params: p.TextDocumentPositionParams): Promise<p.SignatureHelp> {
    return this._sendRequest('textDocument/signatureHelp', params);
  }

  gotoDefinition(params: p.TextDocumentPositionParams): Promise<p.Location | Array<p.Location>> {
    return this._sendRequest('textDocument/definition', params);
  }

  findReferences(params: p.TextDocumentPositionParams): Promise<Array<p.Location>> {
    return this._sendRequest('textDocument/references', params);
  }

  documentHighlight(params: p.TextDocumentPositionParams): Promise<Array<p.DocumentHighlight>> {
    return this._sendRequest('textDocument/documentHighlight', params);
  }

  documentSymbol(params: p.DocumentSymbolParams): Promise<Array<p.SymbolInformation>> {
    return this._sendRequest('textDocument/documentSymbol', params);
  }

  typeCoverage(params: p.TypeCoverageParams): Promise<p.TypeCoverageResult> {
    return this._sendRequest('textDocument/typeCoverage', params);
  }

  workspaceSymbol(params: p.WorkspaceSymbolParams): Promise<Array<p.SymbolInformation>> {
    return this._sendRequest('workspace/symbol', params);
  }

  codeAction(params: p.CodeActionParams): Promise<Array<p.Command>> {
    return this._sendRequest('textDocument/codeAction', params);
  }

  codeLens(params: p.CodeLensParams): Promise<Array<p.CodeLens>> {
    return this._sendRequest('textDocument/codeLens', params);
  }

  codeLensResolve(params: p.CodeLens): Promise<p.CodeLens> {
    return this._sendRequest('codeLens/resolve', params);
  }

  documentLink(params: p.DocumentLinkParams): Promise<?Array<p.DocumentLink>> {
    return this._sendRequest('textDocument/documentLink', params);
  }

  documentLinkResolve(params: p.DocumentLink): Promise<p.DocumentLink> {
    return this._sendRequest('documentLink/resolve', params);
  }

  documentFormatting(params: p.DocumentFormattingParams): Promise<Array<p.TextEdit>> {
    return this._sendRequest('textDocument/formatting', params);
  }

  documentRangeFormattting(params: p.DocumentRangeFormattingParams): Promise<Array<p.TextEdit>> {
    return this._sendRequest('textDocument/rangeFormatting', params);
  }

  documentOnTypeFormatting(params: p.DocumentOnTypeFormattingParams): Promise<Array<p.TextEdit>> {
    return this._sendRequest('textDocument/onTypeFormatting', params);
  }

  rename(params: p.RenameParams): Promise<p.WorkspaceEdit> {
    return this._sendRequest('textDocument/rename', params);
  }

  onDiagnosticsNotification(callback: p.PublishDiagnosticsParams => void): void {
    this._onNotification(
      {method: 'textDocument/publishDiagnostics'},
      callback);
  }

  _sendNotification(method: string, args?: Object): void {
    this._logger.logInfo(
      `LanguageServerV2 - sendNotification: ${method} ${JSON.stringify(args)}`
        .substr(0, MAX_LOG_MESSAGE_LENGTH));
    this.connection.sendNotification(method, args);
  }

  async _sendRequest(method: string, args?: Object): Promise<any> {
    this._logger.logInfo(
      `LanguageServerV2 - sendMessage: ${method} ${JSON.stringify(args)}`
        .substr(0, MAX_LOG_MESSAGE_LENGTH));
    try {
      const result = await this.connection.sendRequest(method, args);
      this._logger.logInfo(`LanguageServerV2 - result ${JSON.stringify(result)}`
        .substr(0, MAX_LOG_MESSAGE_LENGTH));
      return result;
    } catch (e) {
      this._logger.logInfo(`LanguageServerV2 - request threw ${JSON.stringify(e)}`);
      throw e;
    }
  }

  _onNotification(type: {method: string}, callback: Object => void): void {
    this._logger.logInfo(
      `LanguageServerV2 - onNotification call: ${type.method}`);
    this.connection.onNotification(type, value => {
      this._logger.logInfo(
        `LanguageServerV2 - onNotification: ${type.method} ${JSON.stringify(value)}`
          .substr(0, MAX_LOG_MESSAGE_LENGTH));
      callback(value);
    });
  }
}
