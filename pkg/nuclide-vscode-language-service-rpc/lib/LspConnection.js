"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LspConnection = void 0;

function p() {
  const data = _interopRequireWildcard(require("./protocol"));

  p = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
// This is a strongly typed encapsulation over an underlying MessageConnection
// transport, which exposes only the LSP methods.
class LspConnection {
  constructor(jsonRpcConnection) {
    this._jsonRpcConnection = jsonRpcConnection;
  }

  dispose() {
    this._jsonRpcConnection.dispose();
  }

  onDispose(callback) {
    this._jsonRpcConnection.onDispose(callback);
  }

  initialize(params) {
    return this._jsonRpcConnection.sendRequest('initialize', params);
  }

  shutdown() {
    return this._jsonRpcConnection.sendRequest('shutdown');
  }

  exit() {
    this._jsonRpcConnection.sendNotification('exit');
  }

  rage() {
    return this._jsonRpcConnection.sendRequest('telemetry/rage');
  }

  showMessageNotification(params) {
    this._jsonRpcConnection.sendNotification('window/showMessage', params);
  }

  showMessageRequest(params) {
    return this._jsonRpcConnection.sendRequest('window/showMessageRequest', params);
  }

  logMessage(params) {
    this._jsonRpcConnection.sendNotification('window/logMessage', params);
  }

  didChangeConfiguration(params) {
    this._jsonRpcConnection.sendNotification('workspace/didChangeConfiguration', params);
  }

  didOpenTextDocument(params) {
    this._jsonRpcConnection.sendNotification('textDocument/didOpen', params);
  }

  didChangeTextDocument(params) {
    this._jsonRpcConnection.sendNotification('textDocument/didChange', params);
  }

  didCloseTextDocument(params) {
    this._jsonRpcConnection.sendNotification('textDocument/didClose', params);
  }

  didSaveTextDocument(params) {
    this._jsonRpcConnection.sendNotification('textDocument/didSave', params);
  }

  willSaveWaitUntilTextDocument(params, token) {
    return this._jsonRpcConnection.sendRequest('textDocument/willSaveWaitUntil', params, token);
  }

  didChangeWatchedFiles(params) {
    this._jsonRpcConnection.sendNotification('workspace/didChangeWatchedFiles', params);
  }

  publishDiagnostics(params) {
    this._jsonRpcConnection.sendNotification('textDocument/publishDiagnostics', params);
  }

  completion(params, token) {
    return this._jsonRpcConnection.sendRequest('textDocument/completion', params, token);
  }

  completionItemResolve(params) {
    return this._jsonRpcConnection.sendRequest('completionItem/resolve', params);
  }

  hover(params, token) {
    return this._jsonRpcConnection.sendRequest('textDocument/hover', params, token);
  }

  signatureHelp(params) {
    return this._jsonRpcConnection.sendRequest('textDocument/signatureHelp', params);
  }

  gotoDefinition(params, token) {
    return this._jsonRpcConnection.sendRequest('textDocument/definition', params, token);
  }

  findReferences(params) {
    return this._jsonRpcConnection.sendRequest('textDocument/references', params);
  }

  documentHighlight(params, token) {
    return this._jsonRpcConnection.sendRequest('textDocument/documentHighlight', params, token);
  }

  documentSymbol(params, token) {
    return this._jsonRpcConnection.sendRequest('textDocument/documentSymbol', params, token);
  }

  typeCoverage(params) {
    return this._jsonRpcConnection.sendRequest('textDocument/typeCoverage', params);
  }

  toggleTypeCoverage(params) {
    this._jsonRpcConnection.sendRequest('workspace/toggleTypeCoverage', params);
  }

  workspaceSymbol(params) {
    return this._jsonRpcConnection.sendRequest('workspace/symbol', params);
  }

  executeCommand(params) {
    return this._jsonRpcConnection.sendRequest('workspace/executeCommand', params);
  }

  codeAction(params) {
    return this._jsonRpcConnection.sendRequest('textDocument/codeAction', params);
  }

  codeLens(params) {
    return this._jsonRpcConnection.sendRequest('textDocument/codeLens', params);
  }

  codeLensResolve(params) {
    return this._jsonRpcConnection.sendRequest('codeLens/resolve', params);
  }

  documentLink(params) {
    return this._jsonRpcConnection.sendRequest('textDocument/documentLink', params);
  }

  documentLinkResolve(params) {
    return this._jsonRpcConnection.sendRequest('documentLink/resolve', params);
  }

  documentFormatting(params) {
    return this._jsonRpcConnection.sendRequest('textDocument/formatting', params);
  }

  documentRangeFormatting(params) {
    return this._jsonRpcConnection.sendRequest('textDocument/rangeFormatting', params);
  }

  documentOnTypeFormatting(params) {
    return this._jsonRpcConnection.sendRequest('textDocument/onTypeFormatting', params);
  }

  rename(params) {
    return this._jsonRpcConnection.sendRequest('textDocument/rename', params);
  }

  onDiagnosticsNotification(callback) {
    this._jsonRpcConnection.onNotification({
      method: 'textDocument/publishDiagnostics'
    }, callback);
  }

  onTelemetryNotification(callback) {
    this._jsonRpcConnection.onNotification({
      method: 'telemetry/event'
    }, callback);
  }

  onLogMessageNotification(callback) {
    this._jsonRpcConnection.onNotification({
      method: 'window/logMessage'
    }, callback);
  }

  onShowMessageNotification(callback) {
    this._jsonRpcConnection.onNotification({
      method: 'window/showMessage'
    }, callback);
  }

  onShowMessageRequest(callback) {
    this._jsonRpcConnection.onRequest({
      method: 'window/showMessageRequest'
    }, callback);
  }

  onShowStatusRequest(callback) {
    this._jsonRpcConnection.onRequest({
      method: 'window/showStatus'
    }, callback);
  }

  onApplyEditRequest(callback) {
    this._jsonRpcConnection.onRequest({
      method: 'workspace/applyEdit'
    }, callback);
  }

  onRegisterCapabilityRequest(callback) {
    this._jsonRpcConnection.onRequest({
      method: 'client/registerCapability'
    }, callback);
  }

  onUnregisterCapabilityRequest(callback) {
    this._jsonRpcConnection.onRequest({
      method: 'client/unregisterCapability'
    }, callback);
  }

  onProgressNotification(callback) {
    this._jsonRpcConnection.onNotification({
      method: 'window/progress'
    }, callback);
  }

  onActionRequiredNotification(callback) {
    this._jsonRpcConnection.onNotification({
      method: 'window/actionRequired'
    }, callback);
  }

}

exports.LspConnection = LspConnection;