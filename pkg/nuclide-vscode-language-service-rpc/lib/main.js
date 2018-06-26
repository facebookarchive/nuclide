'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMultiLspLanguageService = createMultiLspLanguageService;
exports.processPlatform = processPlatform;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('../../../modules/nuclide-commons/which'));
}

var _resolveFrom;

function _load_resolveFrom() {
  return _resolveFrom = _interopRequireDefault(require('resolve-from'));
}

var _LspLanguageService;

function _load_LspLanguageService() {
  return _LspLanguageService = require('./LspLanguageService');
}

var _systemInfo;

function _load_systemInfo() {
  return _systemInfo = require('../../commons-node/system-info');
}

var _main;

function _load_main() {
  return _main = require('../../nuclide-open-files-rpc/lib/main');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function pickCommand(candidates, useFork, cwd) {
  const options = cwd == null ? {} : { cwd };

  return (0, (_promise || _load_promise()).asyncFind)(candidates, async candidate => {
    const command = useFork ? (0, (_resolveFrom || _load_resolveFrom()).default)((0, (_systemInfo || _load_systemInfo()).getNuclideRealDir)(), candidate) : candidate;
    const exists = useFork ? await (_fsPromise || _load_fsPromise()).default.exists(command) : (await (0, (_which || _load_which()).default)(command, options)) != null;
    return exists ? command : null;
  });
}

/**
 * Creates a language service capable of connecting to an LSP server.
 * Note that spawnOptions and initializationOptions must both be RPC-able.
 *
 * The 'command_' parameter is a list of candidate filepaths for the LSP
 * server binary; the first one to be found will be used. They can be relative
 * to the project directory so long as params.fork isn't used. If none are
 * relative and none can be found then this function will return null immediately.
 * If some are relative, then we can only determine whether one can be found at
 * the moment we're asked to spin up each individual language service, and so
 * LspLanguageService will necessarily be spun up. Therefore it's recommended
 * only to use relative paths if your language configuration uses StatusConfig,
 * so as not to spam the user with red error boxes in case of missing binary.
 */
async function createMultiLspLanguageService(languageServerName, command_, args, params) {
  const logger = (0, (_log4js || _load_log4js()).getLogger)(params.logCategory);
  logger.setLevel(params.logLevel);

  if (command_.length === 0) {
    throw new Error('Expected a command to launch LSP server');
  }
  const lastCandidate = command_.slice(-1)[0];
  const isProjectRelative = command_.some(c => c.startsWith('./'));
  let command = isProjectRelative ? null : await pickCommand(command_, params.fork, null);

  if (!isProjectRelative && command == null) {
    const message = `Command "${lastCandidate}" could not be found: ${languageServerName} language features will be disabled.`;
    logger.warn(message);
    params.host.consoleNotification(languageServerName, 'warning', message);
    return null;
  }

  const result = new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).MultiProjectLanguageService();

  const fileCache = params.fileNotifier;

  if (!(fileCache instanceof (_main || _load_main()).FileCache)) {
    throw new Error('Invariant violation: "fileCache instanceof FileCache"');
  }

  // This MultiProjectLanguageService stores LspLanguageServices, lazily
  // created upon demand, one per project root. Demand is usually "when the
  // user opens a file" or "when the user requests project-wide symbol search".

  // What state is each LspLanguageService in? ...
  // * 'Initializing' state, still spawning the LSP server and negotiating with
  //    it, or inviting the user via a dialog box to retry initialization.
  // * 'Ready' state, able to handle LanguageService requests properly.
  // * 'Stopped' state, meaning that the LspConnection died and will not be
  //   restarted, but we can still respond to those LanguageServiceRequests
  //   that don't require an LspConnection).

  const languageServiceFactory = async projectDir => {
    if (params.waitForDiagnostics !== false) {
      await result.hasObservedDiagnostics();
    }
    if (params.waitForStatus === true) {
      await result.hasObservedStatus();
    }
    // We're awaiting until AtomLanguageService has observed diagnostics (to
    // prevent race condition: see below).

    if (isProjectRelative) {
      command = await pickCommand(command_, params.fork, projectDir);
    }
    if (command == null) {
      command = lastCandidate;
    }

    const lsp = new (_LspLanguageService || _load_LspLanguageService()).LspLanguageService(logger, fileCache, (await (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).forkHostServices)(params.host, logger)), languageServerName, command, args, params.spawnOptions, params.fork, projectDir, params.fileExtensions, params.initializationOptions || {}, Number(params.additionalLogFilesRetentionPeriod), params.useOriginalEnvironment || false, params.lspPreferences);

    lsp.start(); // Kick off 'Initializing'...
    return lsp;

    // CARE! We want to avoid a race condition where LSP starts producing
    // diagnostics before AtomLanguageService has yet had a chance to observe
    // them (and we don't want to have to buffer the diagnostics indefinitely).
    // We rely on the fact that LSP won't produce them before start() has
    // returned. As soon as we ourselves return, MultiProjectLanguageService
    // will hook up observeDiagnostics into the LSP process, so it'll be ready.
  };

  result.initialize(logger, fileCache, params.host, params.projectFileNames, params.projectFileSearchStrategy, params.fileExtensions, languageServiceFactory);
  return result;
}

function processPlatform() {
  return Promise.resolve(process.platform);
}