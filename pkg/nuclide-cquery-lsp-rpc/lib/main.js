"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCqueryService = createCqueryService;

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _which() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/which"));

  _which = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideLanguageServiceRpc() {
  const data = require("../../nuclide-language-service-rpc");

  _nuclideLanguageServiceRpc = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFilesRpc() {
  const data = require("../../nuclide-open-files-rpc");

  _nuclideOpenFilesRpc = function () {
    return data;
  };

  return data;
}

function _CqueryInitialization() {
  const data = require("./child/CqueryInitialization");

  _CqueryInitialization = function () {
    return data;
  };

  return data;
}

function _FlagUtils() {
  const data = require("./child/FlagUtils");

  _FlagUtils = function () {
    return data;
  };

  return data;
}

function _CqueryLanguageClient() {
  const data = require("./CqueryLanguageClient");

  _CqueryLanguageClient = function () {
    return data;
  };

  return data;
}

function _CqueryLanguageServer() {
  const data = _interopRequireDefault(require("./CqueryLanguageServer"));

  _CqueryLanguageServer = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const EXTENSIONS = ['.c', '.cpp', '.h', '.hpp', '.cc', '.tcc', '.m', 'mm'];

async function ensureCommandExists(command, logger, host, languageId) {
  if ((await (0, _which().default)(command)) == null) {
    const message = `Command "${command}" could not be found: ${languageId} language features will be disabled.`;
    logger.warn(message);
    return false;
  }

  return true;
}

function createLogger(logCategory, logLevel) {
  const logger = (0, _log4js().getLogger)(logCategory);
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

  if (!(fileCache instanceof _nuclideOpenFilesRpc().FileCache)) {
    throw new Error("Invariant violation: \"fileCache instanceof FileCache\"");
  }

  const forkedHost = await (0, _nuclideLanguageServiceRpc().forkHostServices)(params.host, logger);
  const multiLsp = new (_CqueryLanguageServer().default)(forkedHost);

  const cqueryFactory = async projectRoot => {
    const cacheDirectory = await (0, _CqueryInitialization().createCacheDir)(projectRoot);

    const logFile = _nuclideUri().default.join(cacheDirectory, '..', 'diagnostics');

    const recordFile = _nuclideUri().default.join(cacheDirectory, '..', 'record');

    const [, host] = await Promise.all([multiLsp.hasObservedDiagnostics(), (0, _nuclideLanguageServiceRpc().forkHostServices)(params.host, logger)]);
    const stderrFd = await _fsPromise().default.open(_nuclideUri().default.join(cacheDirectory, '..', 'stderr'), 'a');
    const spawnOptions = {
      stdio: ['pipe', 'pipe', stderrFd],
      env: Object.assign({}, (await (0, _process().getOriginalEnvironment)()))
    };
    const lsp = new (_CqueryLanguageClient().CqueryLanguageClient)(logger, fileCache, host, command, process.execPath, [require.resolve("./child/main-entry"), logFile, recordFile, String(params.enableLibclangLogs), String(params.memoryLimitPercent)], spawnOptions, projectRoot, EXTENSIONS, {
      extraClangArguments: params.defaultFlags,
      index: {
        threads: params.indexerThreads
      }
    }, 5 * 60 * 1000, // 5 minutes
    logFile, cacheDirectory);
    lsp.start(); // Kick off 'Initializing'...

    return lsp;
  };

  multiLsp.initialize(logger, fileCache, forkedHost, ['.buckconfig', _FlagUtils().COMPILATION_DATABASE_FILE], 'nearest', EXTENSIONS, cqueryFactory);
  return multiLsp;
}