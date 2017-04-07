'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LanguageServerV2 = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeJsonrpc;

function _load_vscodeJsonrpc() {
  return _vscodeJsonrpc = _interopRequireWildcard(require('vscode-jsonrpc'));
}

var _protocolV;

function _load_protocolV() {
  return _protocolV = _interopRequireWildcard(require('./protocol-v2'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const MAX_LOG_MESSAGE_LENGTH = 100;

class LanguageServerV2 {

  constructor(logger, connection) {
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
      this._logger.logError(`LanguageServerV2 - onUnhandledNotification ${JSON.stringify(args)}`.substr(0, MAX_LOG_MESSAGE_LENGTH));
    });

    connection.onNotification((e1, e2, e3) => {
      // TODO: What is the shape of args here?
      const args = Array.prototype.slice.call(arguments);
      this._logger.logInfo(`LanguageServerV2 - onNotification ${JSON.stringify(args)}`.substr(0, MAX_LOG_MESSAGE_LENGTH));
    });
  }

  initialize(params) {
    return this._sendRequest('initialize', params);
  }

  shutdown() {
    return this._sendRequest('shutdown');
  }

  exit() {
    this._sendNotification('exit');
  }

  showMessageNotification(params) {
    this._sendNotification('window/showMessage', params);
  }

  showMessageRequest(params) {
    return this._sendRequest('window/showMessageRequest', params);
  }

  logMessage(params) {
    this._sendNotification('window/logMessage', params);
  }

  telemetry(params) {
    this._sendNotification('telemetry/event', params);
  }

  didChangeConfiguration(params) {
    this._sendNotification('workspace/didChangeConfiguration', params);
  }

  didOpenTextDocument(params) {
    this._sendNotification('textDocument/didOpen', params);
  }

  didChangeTextDocument(params) {
    this._sendNotification('textDocument/didChange', params);
  }

  didCloseTextDocument(params) {
    this._sendNotification('textDocument/didClose', params);
  }

  didSaveTextDocument(params) {
    this._sendNotification('textDocument/didSave', params);
  }

  didChangeWatchedFiles(params) {
    this._sendNotification('workspace/didChangeWatchedFiles', params);
  }

  publishDiagnostics(params) {
    this._sendNotification('textDocument/publishDiagnostics', params);
  }

  completion(params) {
    return this._sendRequest('textDocument/completion', params);
  }

  completionItemResolve(params) {
    return this._sendRequest('completionItem/resolve', params);
  }

  hover(params) {
    return this._sendRequest('textDocument/hover', params);
  }

  signatureHelp(params) {
    return this._sendRequest('textDocument/signatureHelp', params);
  }

  gotoDefinition(params) {
    return this._sendRequest('textDocument/definition', params);
  }

  findReferences(params) {
    return this._sendRequest('textDocument/references', params);
  }

  documentHighlight(params) {
    return this._sendRequest('textDocument/documentHighlight', params);
  }

  documentSymbol(params) {
    return this._sendRequest('textDocument/documentSymbol', params);
  }

  workspaceSymbol(params) {
    return this._sendRequest('workspace/symbol', params);
  }

  codeAction(params) {
    return this._sendRequest('textDocument/codeAction', params);
  }

  codeLens(params) {
    return this._sendRequest('textDocument/codeLens', params);
  }

  codeLensResolve(params) {
    return this._sendRequest('codeLens/resolve', params);
  }

  documentLink(params) {
    return this._sendRequest('textDocument/documentLink', params);
  }

  documentLinkResolve(params) {
    return this._sendRequest('documentLink/resolve', params);
  }

  documentFormatting(params) {
    return this._sendRequest('textDocument/formatting', params);
  }

  documentRangeFormattting(params) {
    return this._sendRequest('textDocument/rangeFormatting', params);
  }

  documentOnTypeFormatting(params) {
    return this._sendRequest('textDocument/onTypeFormatting', params);
  }

  rename(params) {
    return this._sendRequest('textDocument/rename', params);
  }

  onDiagnosticsNotification(callback) {
    this._onNotification({ method: 'textDocument/publishDiagnostics' }, callback);
  }

  _sendNotification(method, args) {
    this._logger.logInfo(`LanguageServerV2 - sendNotification: ${method} ${JSON.stringify(args)}`.substr(0, MAX_LOG_MESSAGE_LENGTH));
    this.connection.sendNotification(method, args);
  }

  _sendRequest(method, args) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._logger.logInfo(`LanguageServerV2 - sendMessage: ${method} ${JSON.stringify(args)}`.substr(0, MAX_LOG_MESSAGE_LENGTH));
      try {
        const result = yield _this.connection.sendRequest(method, args);
        _this._logger.logInfo(`LanguageServerV2 - result ${JSON.stringify(result)}`.substr(0, MAX_LOG_MESSAGE_LENGTH));
        return result;
      } catch (e) {
        _this._logger.logInfo(`LanguageServerV2 - request threw ${JSON.stringify(e)}`);
        throw e;
      }
    })();
  }

  _onNotification(type, callback) {
    this._logger.logInfo(`LanguageServerV2 - onNotification call: ${type.method}`);
    this.connection.onNotification(type, value => {
      this._logger.logInfo(`LanguageServerV2 - onNotification: ${type.method} ${JSON.stringify(value)}`.substr(0, MAX_LOG_MESSAGE_LENGTH));
      callback(value);
    });
  }
}
exports.LanguageServerV2 = LanguageServerV2;