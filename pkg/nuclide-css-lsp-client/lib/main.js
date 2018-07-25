"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _nuclideLanguageService() {
  const data = require("../../nuclide-language-service");

  _nuclideLanguageService = function () {
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

function _nuclideOpenFiles() {
  const data = require("../../nuclide-open-files");

  _nuclideOpenFiles = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _DashProjectSymbolProvider() {
  const data = _interopRequireDefault(require("./DashProjectSymbolProvider"));

  _DashProjectSymbolProvider = function () {
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
 * 
 * @format
 */
// $FlowFB
async function connectToService(connection) {
  const [fileNotifier, host] = await Promise.all([(0, _nuclideOpenFiles().getNotifierByConnection)(connection), (0, _nuclideLanguageService().getHostServices)()]);
  const lspService = await (0, _nuclideRemoteConnection().getVSCodeLanguageServiceByConnection)(connection).createMultiLspLanguageService('css', 'vscode-css-languageserver-bin/cssServerMain', ['--stdio'], {
    fileNotifier,
    host,
    projectFileNames: ['.arcconfig', '.flowconfig', '.hg', '.git'],
    fileExtensions: ['.css', '.less', '.scss'],
    logCategory: 'nuclide-css-lsp',
    logLevel: _featureConfig().default.get('nuclide-css-lsp-client.logLevel'),
    fork: true,
    waitForDiagnostics: false
  });
  return lspService || new (_nuclideLanguageServiceRpc().NullLanguageService)();
}

function createLanguageService() {
  return new (_nuclideLanguageService().AtomLanguageService)(connectToService, {
    name: 'CSSLSPService',
    grammars: ['source.css', 'source.css.less', 'source.css.scss'],
    autocomplete: {
      inclusionPriority: 1,
      // Suggestions from the server are more relevant than snippets.
      suggestionPriority: 3,
      disableForSelector: null,
      excludeLowerPriority: false,
      autocompleteCacherConfig: {
        updateResults: _nuclideLanguageService().updateAutocompleteResults,
        updateFirstResults: _nuclideLanguageService().updateAutocompleteFirstResults
      },
      analytics: {
        eventName: 'cssLSP.autocomplete',
        shouldLogInsertedSuggestion: true
      },
      supportsResolve: false
    },
    codeAction: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'cssLSP.codeAction',
      applyAnalyticsEventName: 'cssLSP.applyCodeAction'
    },
    definition: {
      version: '0.1.0',
      priority: 20,
      definitionEventName: 'cssLSP.get-definition'
    },
    findReferences: {
      version: '0.1.0',
      analyticsEventName: 'cssLSP.findReferences'
    },
    highlight: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'cssLSP.codehighlight'
    },
    outline: {
      version: '0.1.0',
      priority: 1,
      analyticsEventName: 'cssLSP.outline'
    }
  });
}

class Activation {
  constructor() {
    this._languageService = createLanguageService();

    this._languageService.activate();
  }

  provideProjectSymbolSearch() {
    return new (_DashProjectSymbolProvider().default)(this._languageService);
  }

  dispose() {
    this._languageService.dispose();
  }

}

(0, _createPackage().default)(module.exports, Activation);