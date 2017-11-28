'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let connectToJSImportsService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection) {
    const jsService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)(JS_IMPORTS_SERVICE_NAME, connection);

    const [fileNotifier, host] = yield Promise.all([(0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection), (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)()]);

    const lspService = yield jsService.initializeLsp(['.flowconfig'], ['.js'], (_featureConfig || _load_featureConfig()).default.get('nuclide-js-imports-client.logLevel'), fileNotifier, host, getAutoImportSettings());
    return lspService || new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).NullLanguageService();
  });

  return function connectToJSImportsService(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _nuclideLanguageService;

function _load_nuclideLanguageService() {
  return _nuclideLanguageService = require('../../nuclide-language-service');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _QuickOpenProvider;

function _load_QuickOpenProvider() {
  return _QuickOpenProvider = _interopRequireDefault(require('./QuickOpenProvider'));
}

var _JSSymbolSearchProvider;

function _load_JSSymbolSearchProvider() {
  return _JSSymbolSearchProvider = _interopRequireDefault(require('./JSSymbolSearchProvider'));
}

var _Omni2ProjectSymbolProvider;

function _load_Omni2ProjectSymbolProvider() {
  return _Omni2ProjectSymbolProvider = _interopRequireDefault(require('./Omni2ProjectSymbolProvider'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const JS_IMPORTS_SERVICE_NAME = 'JSAutoImportsService'; /**
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


function createLanguageService() {
  const diagnosticsConfig = {
    version: '0.2.0',
    analyticsEventName: 'jsimports.observe-diagnostics'
  };

  const autocompleteConfig = {
    version: '2.0.0',
    inclusionPriority: 1,
    suggestionPriority: 3,
    excludeLowerPriority: false,
    analyticsEventName: 'jsimports.getAutocompleteSuggestions',
    disableForSelector: null,
    autocompleteCacherConfig: null,
    onDidInsertSuggestionAnalyticsEventName: 'jsimports.autocomplete-chosen'
  };

  const codeActionConfig = {
    version: '0.1.0',
    priority: 0,
    analyticsEventName: 'jsimports.codeAction',
    applyAnalyticsEventName: 'jsimports.applyCodeAction'
  };

  const atomConfig = {
    name: 'JSAutoImports',
    grammars: ['source.js.jsx', 'source.js'],
    diagnostics: diagnosticsConfig,
    autocomplete: autocompleteConfig,
    codeAction: codeActionConfig
  };
  return new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectToJSImportsService, atomConfig);
}

function getAutoImportSettings() {
  // Currently, we will get the settings when the package is initialized. This
  // means that the user would need to restart Nuclide for a change in their
  // settings to take effect. In the future, we would most likely want to observe
  // their settings and send DidChangeConfiguration requests to the server.
  // TODO: Observe settings changes + send to the server.
  return {
    diagnosticsWhitelist: (_featureConfig || _load_featureConfig()).default.get('nuclide-js-imports-client.diagnosticsWhitelist'),
    requiresWhitelist: (_featureConfig || _load_featureConfig()).default.get('nuclide-js-imports-client.requiresWhitelist')
  };
}

class Activation {

  constructor() {
    this._languageService = createLanguageService();
    this._languageService.activate();
    this._quickOpenProvider = new (_QuickOpenProvider || _load_QuickOpenProvider()).default(this._languageService);
  }

  provideProjectSymbolSearch() {
    return new (_Omni2ProjectSymbolProvider || _load_Omni2ProjectSymbolProvider()).default(this._languageService);
  }

  provideJSSymbolSearchService() {
    return new (_JSSymbolSearchProvider || _load_JSSymbolSearchProvider()).default(this._languageService);
  }

  dispose() {
    this._languageService.dispose();
  }

  registerQuickOpenProvider() {
    return this._quickOpenProvider;
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);