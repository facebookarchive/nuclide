'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findNearestCompilationDbDir = findNearestCompilationDbDir;
exports.createCqueryService = createCqueryService;

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('../../../modules/nuclide-commons/which'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _CompilationDatabaseFinder;

function _load_CompilationDatabaseFinder() {
  return _CompilationDatabaseFinder = require('./CompilationDatabaseFinder');
}

var _CqueryLanguageServer;

function _load_CqueryLanguageServer() {
  return _CqueryLanguageServer = _interopRequireDefault(require('./CqueryLanguageServer'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function findNearestCompilationDbDir(source) {
  return (0, (_CompilationDatabaseFinder || _load_CompilationDatabaseFinder()).findNearestCompilationDbDir)(source);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */

async function ensureCommandExists(command, logger, host, languageId) {
  if ((await (0, (_which || _load_which()).default)(command)) == null) {
    const message = `Command "${command}" could not be found: ${languageId} language features will be disabled.`;
    logger.warn(message);
    return false;
  }
  return true;
}

function createLogger(logCategory, logLevel) {
  const logger = (0, (_log4js || _load_log4js()).getLogger)(logCategory);
  logger.setLevel(logLevel);
  return logger;
}

/**
 * Creates a language service capable of connecting to an LSP server.
 *
 * TODO: Document all of the fields below.
 */
async function createCqueryService(params) {
  const command = 'cquery';
  const languageId = 'cquery';
  const logger = createLogger(params.logCategory, params.logLevel);

  if (!(await ensureCommandExists(command, logger, params.host, languageId))) {
    return null;
  }

  const fileCache = params.fileNotifier;

  if (!(fileCache instanceof (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileCache)) {
    throw new Error('Invariant violation: "fileCache instanceof FileCache"');
  }

  return new (_CqueryLanguageServer || _load_CqueryLanguageServer()).default(languageId, // id
  command, // command
  logger, fileCache, params.host, params.enableLibclangLogs);
}