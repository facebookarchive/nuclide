'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createClangdService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Creates a language service capable of connecting to an LSP server.
 *
 * TODO: Document all of the fields below.
 */
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

let createClangdService = exports.createClangdService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (params) {
    const command = 'clangd';
    const languageId = 'clangd';
    const logger = (0, (_log4js || _load_log4js()).getLogger)(params.logCategory);
    logger.setLevel(params.logLevel);

    if ((yield (0, (_which || _load_which()).default)(command)) == null) {
      const message = `Command "${command}" could not be found: ${languageId} language features will be disabled.`;
      logger.warn(message);
      params.host.consoleNotification(languageId, 'warning', message);
      return null;
    }

    const fileCache = params.fileNotifier;

    if (!(fileCache instanceof (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileCache)) {
      throw new Error('Invariant violation: "fileCache instanceof FileCache"');
    }

    return new (_ClangdLanguageServer || _load_ClangdLanguageServer()).default('clangd', // id
    'clangd', // command
    logger, fileCache, params.host);
  });

  return function createClangdService(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('nuclide-commons/which'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _ClangdLanguageServer;

function _load_ClangdLanguageServer() {
  return _ClangdLanguageServer = _interopRequireDefault(require('./ClangdLanguageServer'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }