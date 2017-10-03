'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.graphqlLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let connectionToGraphQLService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection) {
    const graphqlService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)(GRAPHQL_SERVICE_NAME, connection);
    const [fileNotifier, host] = yield Promise.all([(0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection), (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)()]);
    const graphqlCommand = 'graphql-language-service/bin/graphql.js';
    const options = {
      env: Object.assign({}, process.env, { ELECTRON_RUN_AS_NODE: '1' })
    };

    return graphqlService.initializeLsp(graphqlCommand, ['server', '--method', 'stream'], options, ['.graphqlconfig'], ['.js', '.graphql'], 'INFO', fileNotifier, host);
  });

  return function connectionToGraphQLService(_x) {
    return _ref.apply(this, arguments);
  };
})();

let createLanguageService = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    const diagnosticsConfig = {
      version: '0.2.0',
      analyticsEventName: 'graphql.observe-diagnostics'
    };

    const definitionConfig = {
      version: '0.1.0',
      priority: 1,
      definitionEventName: 'graphql.definition'
    };

    const autocompleteConfig = {
      version: '2.0.0',
      inclusionPriority: 1,
      suggestionPriority: 3,
      excludeLowerPriority: false,
      analyticsEventName: 'graphql.getAutocompleteSuggestions',
      disableForSelector: null,
      autocompleteCacherConfig: null,
      onDidInsertSuggestionAnalyticsEventName: 'graphql.autocomplete-chosen'
    };

    const atomConfig = {
      name: 'GraphQL',
      grammars: ['source.graphql', 'source.js.jsx', 'source.js'],
      diagnostics: diagnosticsConfig,
      definition: definitionConfig,
      autocomplete: autocompleteConfig
    };
    return new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectionToGraphQLService, atomConfig);
  });

  return function createLanguageService() {
    return _ref2.apply(this, arguments);
  };
})();

exports.resetGraphQLLanguageService = resetGraphQLLanguageService;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GRAPHQL_SERVICE_NAME = 'GraphQLService'; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */

let graphqlLanguageService = exports.graphqlLanguageService = createLanguageService();

function resetGraphQLLanguageService() {
  graphqlLanguageService.then(value => value.dispose());
  exports.graphqlLanguageService = graphqlLanguageService = createLanguageService();
}