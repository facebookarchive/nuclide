'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.createMultiLspLanguageService = createMultiLspLanguageService;

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _LspLanguageService;

function _load_LspLanguageService() {
  return _LspLanguageService = require('./LspLanguageService');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createMultiLspLanguageService(logger, fileCache, host, languageId, command, args, projectFileName, fileExtensions, initializationOptions) {
  const result = new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).MultiProjectLanguageService();

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
    var _ref = (0, _asyncToGenerator.default)(function* (projectDir) {
      yield result.hasObservedDiagnostics();
      // We're awaiting until AtomLanguageService has observed diagnostics (to
      // prevent race condition: see below).

      const lsp = new (_LspLanguageService || _load_LspLanguageService()).LspLanguageService(logger, fileCache, (yield (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).forkHostServices)(host, logger)), languageId, command, args, projectDir, fileExtensions, initializationOptions);

      lsp.start(); // Kick off 'Initializing'...
      return lsp;

      // CARE! We want to avoid a race condition where LSP starts producing
      // diagnostics before AtomLanguageService has yet had a chance to observe
      // them (and we don't want to have to buffer the diagnostics indefinitely).
      // We rely on the fact that LSP won't produce them before start() has
      // returned. As soon as we ourselves return, MultiProjectLanguageService
      // will hook up observeDiagnostics into the LSP process, so it'll be ready.
    });

    return function languageServiceFactory(_x) {
      return _ref.apply(this, arguments);
    };
  })();

  result.initialize(logger, fileCache, host, projectFileName, fileExtensions, languageServiceFactory);
  return result;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */