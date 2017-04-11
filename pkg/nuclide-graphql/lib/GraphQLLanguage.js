'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.graphqlLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let connectionToGraphQLService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection) {
    const graphqlService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)(GRAPHQL_SERVICE_NAME, connection);
    const fileNotifier = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection);

    return graphqlService.initialize(fileNotifier);
  });

  return function connectionToGraphQLService(_x) {
    return _ref.apply(this, arguments);
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
                                                */

const diagnosticsConfig = {
  version: '0.1.0',
  shouldRunOnTheFly: false,
  analyticsEventName: 'graphql.run-diagnostics'
};

const definitionConfig = {
  version: '0.0.0',
  priority: 1,
  definitionEventName: 'graphql.definition',
  definitionByIdEventName: 'graphql.definition-by-id'
};

const outlineViewConfig = {
  version: '0.0.0',
  priority: 1,
  analyticsEventName: 'graphql.outline'
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
  grammars: ['source.graphql'],
  diagnostics: diagnosticsConfig,
  definition: definitionConfig,
  outline: outlineViewConfig,
  autocomplete: autocompleteConfig
};

const graphqlLanguageService = exports.graphqlLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectionToGraphQLService, atomConfig);

function resetGraphQLLanguageService() {
  graphqlLanguageService.dispose();
}