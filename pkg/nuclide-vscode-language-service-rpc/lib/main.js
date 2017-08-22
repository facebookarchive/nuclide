'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMultiLspLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Creates a language service capable of connecting to an LSP server.
 * Note that spawnOptions and initializationOptions must both be RPC-able.
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

let createMultiLspLanguageService = exports.createMultiLspLanguageService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (languageId, command, args, params) {
    const result = new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).MultiProjectLanguageService();
    const logger = (0, (_log4js || _load_log4js()).getLogger)(params.logCategory);
    logger.setLevel(params.logLevel);

    const fileCache = params.fileNotifier;

    if (!(fileCache instanceof (_main || _load_main()).FileCache)) {
      throw new Error('Invariant violation: "fileCache instanceof FileCache"');
    }

    // This MultiProjectLanguageService stores LspLanguageServices, lazily
    // created upon demand, one per project root. Demand is usually "when the
    // user opens a file" or "when the user requests project-wide symbol search".

    // What state is the each LspLanguageService in? ...
    // * 'Initializing' state, still spawning the LSP server and negotiating with
    //    it, or inviting the user via a dialog box to retry initialization.
    // * 'Ready' state, able to handle LanguageService requests properly.
    // * 'Stopped' state, meaning that the LspConnection died and will not be
    //   restarted, but we can still respond to those LanguageServiceRequests
    //   that don't require an LspConnection).

    const languageServiceFactory = (() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (projectDir) {
        yield result.hasObservedDiagnostics();
        // We're awaiting until AtomLanguageService has observed diagnostics (to
        // prevent race condition: see below).

        const lsp = new (_LspLanguageService || _load_LspLanguageService()).LspLanguageService(logger, fileCache, (yield (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).forkHostServices)(params.host, logger)), languageId, command, args, params.spawnOptions, projectDir, params.fileExtensions, params.initializationOptions || {});

        lsp.start(); // Kick off 'Initializing'...
        return lsp;

        // CARE! We want to avoid a race condition where LSP starts producing
        // diagnostics before AtomLanguageService has yet had a chance to observe
        // them (and we don't want to have to buffer the diagnostics indefinitely).
        // We rely on the fact that LSP won't produce them before start() has
        // returned. As soon as we ourselves return, MultiProjectLanguageService
        // will hook up observeDiagnostics into the LSP process, so it'll be ready.
      });

      return function languageServiceFactory(_x5) {
        return _ref2.apply(this, arguments);
      };
    })();

    result.initialize(logger, fileCache, params.host, params.projectFileNames, params.fileExtensions, languageServiceFactory);
    return result;
  });

  return function createMultiLspLanguageService(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _LspLanguageService;

function _load_LspLanguageService() {
  return _LspLanguageService = require('./LspLanguageService');
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