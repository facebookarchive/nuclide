'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let connectToJSImportsService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection) {
    const jsService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)(JS_IMPORTS_SERVICE_NAME, connection);

    const [fileNotifier, host] = yield Promise.all([(0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection), (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)()]);

    return jsService.initializeLsp(['.flowconfig'], ['.js'], 'INFO', fileNotifier, host, getAutoImportSettings());
  });

  return function connectToJSImportsService(_x) {
    return _ref.apply(this, arguments);
  };
})();

let createLanguageService = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
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
      analyticsEventName: 'jsimports.codeAction'
    };

    const atomConfig = {
      name: 'JSAutoImports',
      grammars: ['source.js.jsx', 'source.js'],
      diagnostics: diagnosticsConfig,
      autocomplete: autocompleteConfig,
      codeAction: codeActionConfig
    };
    return new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectToJSImportsService, atomConfig);
  });

  return function createLanguageService() {
    return _ref2.apply(this, arguments);
  };
})();

exports.activate = activate;

var _nuclideLanguageService;

function _load_nuclideLanguageService() {
  return _nuclideLanguageService = require('../../nuclide-language-service');
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

function activate() {
  const jsImportLanguageService = createLanguageService();
  jsImportLanguageService.then(value => value.activate());
}

function getAutoImportSettings() {
  // Currently, we will get the settings when the package is initialized. This
  // means that the user would need to restart Nuclide for a change in their
  // settings to take effect. In the future, we would most likely want to observe
  // their settings and send DidChangeConfiguration requests to the server.
  // TODO: Observe settings changes + send to the server.
  return {
    diagnosticsWhitelist: (_featureConfig || _load_featureConfig()).default.get('nuclide-js-imports-client.diagnosticsWhitelist'),
    autocompleteWhitelist: (_featureConfig || _load_featureConfig()).default.get('nuclide-js-imports-client.autocompleteWhitelist')
  };
}