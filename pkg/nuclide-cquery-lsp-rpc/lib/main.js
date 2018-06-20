'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findNearestCompilationDbDir = findNearestCompilationDbDir;
exports.createCqueryService = createCqueryService;

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('../../../modules/nuclide-commons/which'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _CompilationDatabaseFinder;

function _load_CompilationDatabaseFinder() {
  return _CompilationDatabaseFinder = require('./CompilationDatabaseFinder');
}

var _CqueryInitialization;

function _load_CqueryInitialization() {
  return _CqueryInitialization = require('./CqueryInitialization');
}

var _CqueryLanguageClient;

function _load_CqueryLanguageClient() {
  return _CqueryLanguageClient = require('./CqueryLanguageClient');
}

var _CqueryLanguageServer;

function _load_CqueryLanguageServer() {
  return _CqueryLanguageServer = _interopRequireDefault(require('./CqueryLanguageServer'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const EXTENSIONS = ['.c', '.cpp', '.h', '.hpp', '.cc', '.tcc', '.m', 'mm']; /**
                                                                             * Copyright (c) 2015-present, Facebook, Inc.
                                                                             * All rights reserved.
                                                                             *
                                                                             * This source code is licensed under the license found in the LICENSE file in
                                                                             * the root directory of this source tree.
                                                                             *
                                                                             *  strict-local
                                                                             * @format
                                                                             */

function findNearestCompilationDbDir(source) {
  return (0, (_CompilationDatabaseFinder || _load_CompilationDatabaseFinder()).findNearestCompilationDbDir)(source);
}

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

  const forkedHost = await (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).forkHostServices)(params.host, logger);
  const multiLsp = new (_CqueryLanguageServer || _load_CqueryLanguageServer()).default(forkedHost);
  const cqueryFactory = async projectRoot => {
    const cacheDirectory = await (0, (_CqueryInitialization || _load_CqueryInitialization()).createCacheDir)(projectRoot);
    const initializationOptions = (0, (_CqueryInitialization || _load_CqueryInitialization()).getInitializationOptions)(cacheDirectory, projectRoot, params.defaultFlags);
    const logFile = (_nuclideUri || _load_nuclideUri()).default.join(cacheDirectory, '..', 'diagnostics');
    const recordFile = (_nuclideUri || _load_nuclideUri()).default.join(cacheDirectory, '..', 'record');
    const [, host] = await Promise.all([multiLsp.hasObservedDiagnostics(), (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).forkHostServices)(params.host, logger)]);
    const stderrFd = await (_fsPromise || _load_fsPromise()).default.open((_nuclideUri || _load_nuclideUri()).default.join(cacheDirectory, '..', 'stderr'), 'a');
    const spawnOptions = {
      stdio: ['pipe', 'pipe', stderrFd],
      env: Object.assign({}, (await (0, (_process || _load_process()).getOriginalEnvironment)()))
    };

    const lsp = new (_CqueryLanguageClient || _load_CqueryLanguageClient()).CqueryLanguageClient(logger, fileCache, host, command, process.execPath, [require.resolve('./child/main-entry'), logFile, recordFile, String(params.enableLibclangLogs)], spawnOptions, projectRoot, EXTENSIONS, initializationOptions, 5 * 60 * 1000, // 5 minutes
    logFile, cacheDirectory, { id: projectRoot, label: projectRoot });
    lsp.start(); // Kick off 'Initializing'...
    return lsp;
  };
  multiLsp.initialize(logger, fileCache, forkedHost, ['.buckconfig', (_CompilationDatabaseFinder || _load_CompilationDatabaseFinder()).COMPILATION_DATABASE_FILE], 'nearest', EXTENSIONS, cqueryFactory);
  return multiLsp;
}