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

function _nuclideAnalytics() {
  const data = require("../../../modules/nuclide-analytics");

  _nuclideAnalytics = function () {
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
const LSP_SAMPLE_RATE = 100; // This is a strongly typed encapsulation over an underlying MessageConnection
// transport, which exposes only the LSP methods.

class LspConnection {
  constructor(jsonRpcConnection, lspLanguageServerName) {
    this._totalNumberOfPendingRequests = 0;
    this._numberOfPendingRequestsPerRequestType = new Map();
    this._jsonRpcConnection = jsonRpcConnection;
    this._lspLanguageServerName = lspLanguageServerName;
  }

  dispose() {
    this._jsonRpcConnection.dispose();
  }

  onDispose(callback) {
    this._jsonRpcConnection.onDispose(callback);
  }

  incrementPendingRequests(requestName) {
    return this._updateNumberOfPendingRequests(requestName, true);
  }

  decrementPendingRequests(requestName) {
    return this._updateNumberOfPendingRequests(requestName, false);
  }

  _updateNumberOfPendingRequests(requestName, isIncrease) {
    const changedNumber = isIncrease ? 1 : -1;
    this._totalNumberOfPendingRequests += changedNumber;
    let numberOfPendingRequest = 0;

    if (this._numberOfPendingRequestsPerRequestType.has(requestName)) {
      numberOfPendingRequest = this._numberOfPendingRequestsPerRequestType.get(requestName);
    } else if (!isIncrease) {
      return 0;
    }

    numberOfPendingRequest += changedNumber;

    this._numberOfPendingRequestsPerRequestType.set(requestName, numberOfPendingRequest);

    return numberOfPendingRequest;
  }

  sendAndTrackRequest(requestName, params, token) {
    const numberOfPendingRequest = this.incrementPendingRequests(requestName);
    (0, _nuclideAnalytics().trackSampled)('lsp-rpc-connection-send-request', LSP_SAMPLE_RATE, {
      languageServerName: this._lspLanguageServerName,
      totalNumOfPendingRequests: this._totalNumberOfPendingRequests,
      requestName,
      numberOfPendingRequest
    });
    const args = [requestName];

    if (params !== undefined) {
      args.push(params);

      if (token !== undefined) {
        args.push(token);
      }
    }

    return this._jsonRpcConnection.sendRequest(...args).then(result => {
      this.decrementPendingRequests(requestName);
      return result;
    });
  }

  initialize(params) {
    return this.sendAndTrackRequest('initialize', params);
  }

  shutdown() {
    return this.sendAndTrackRequest('shutdown');
  }

  exit() {
    this._jsonRpcConnection.sendNotification('exit');
  }

  rage() {
    return this.sendAndTrackRequest('telemetry/rage');
  }

  showMessageNotification(params) {
    this._jsonRpcConnection.sendNotification('window/showMessage', params);
  }

  showMessageRequest(params) {
    return this.sendAndTrackRequest('window/showMessageRequest', params);
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
    return this.sendAndTrackRequest('textDocument/willSaveWaitUntil', params, token);
  }

  didChangeWatchedFiles(params) {
    this._jsonRpcConnection.sendNotification('workspace/didChangeWatchedFiles', params);
  }

  publishDiagnostics(params) {
    this._jsonRpcConnection.sendNotification('textDocument/publishDiagnostics', params);
  }

  completion(params, token) {
    return this.sendAndTrackRequest('textDocument/completion', params, token);
  }

  completionItemResolve(params) {
    return this.sendAndTrackRequest('completionItem/resolve', params);
  }

  hover(params, token) {
    return this.sendAndTrackRequest('textDocument/hover', params, token);
  }

  signatureHelp(params) {
    return this.sendAndTrackRequest('textDocument/signatureHelp', params);
  }

  gotoDefinition(params, token) {
    return this.sendAndTrackRequest('textDocument/definition', params, token);
  }

  findReferences(params) {
    return this.sendAndTrackRequest('textDocument/references', params);
  }

  documentHighlight(params, token) {
    return this.sendAndTrackRequest('textDocument/documentHighlight', params, token);
  }

  documentSymbol(params, token) {
    return this.sendAndTrackRequest('textDocument/documentSymbol', params, token);
  }

  typeCoverage(params) {
    return this.sendAndTrackRequest('textDocument/typeCoverage', params);
  }

  toggleTypeCoverage(params) {
    this.sendAndTrackRequest('workspace/toggleTypeCoverage', params);
  }

  workspaceSymbol(params) {
    return this.sendAndTrackRequest('workspace/symbol', params);
  }

  executeCommand(params) {
    return this.sendAndTrackRequest('workspace/executeCommand', params);
  }

  codeAction(params) {
    return this.sendAndTrackRequest('textDocument/codeAction', params);
  }

  codeLens(params) {
    return this.sendAndTrackRequest('textDocument/codeLens', params);
  }

  codeLensResolve(params) {
    return this.sendAndTrackRequest('codeLens/resolve', params);
  }

  documentLink(params) {
    return this.sendAndTrackRequest('textDocument/documentLink', params);
  }

  documentLinkResolve(params) {
    return this.sendAndTrackRequest('documentLink/resolve', params);
  }

  documentFormatting(params) {
    return this.sendAndTrackRequest('textDocument/formatting', params);
  }

  documentRangeFormatting(params) {
    return this.sendAndTrackRequest('textDocument/rangeFormatting', params);
  }

  documentOnTypeFormatting(params) {
    return this.sendAndTrackRequest('textDocument/onTypeFormatting', params);
  }

  rename(params) {
    return this.sendAndTrackRequest('textDocument/rename', params);
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