"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetGraphQLLanguageService = resetGraphQLLanguageService;
exports.graphqlLanguageService = void 0;

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
async function connectionToGraphQLService(connection) {
  const [fileNotifier, host] = await Promise.all([(0, _nuclideOpenFiles().getNotifierByConnection)(connection), (0, _nuclideLanguageService().getHostServices)()]);
  const graphqlCommand = 'graphql-language-service/bin/graphql.js';
  const lspService = await (0, _nuclideRemoteConnection().getVSCodeLanguageServiceByConnection)(connection).createMultiLspLanguageService('graphql', graphqlCommand, ['server', '--method', 'stream'], {
    fileNotifier,
    host,
    projectFileNames: ['.graphqlconfig'],
    fileExtensions: ['.js', '.graphql'],
    logCategory: 'nuclide-graphql',
    logLevel: 'INFO',
    fork: true,
    additionalLogFilesRetentionPeriod: 5 * 60 * 1000 // 5 minutes

  });
  return lspService || new (_nuclideLanguageServiceRpc().NullLanguageService)();
}

async function createLanguageService() {
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
    inclusionPriority: 1,
    suggestionPriority: 3,
    excludeLowerPriority: false,
    analytics: {
      eventName: 'nuclide-graphql',
      shouldLogInsertedSuggestion: false
    },
    disableForSelector: null,
    autocompleteCacherConfig: null,
    supportsResolve: false
  };
  const atomConfig = {
    name: 'GraphQL',
    grammars: ['source.graphql', 'source.js.jsx', 'source.js'],
    diagnostics: diagnosticsConfig,
    definition: definitionConfig,
    autocomplete: autocompleteConfig
  };
  return new (_nuclideLanguageService().AtomLanguageService)(connectionToGraphQLService, atomConfig);
}

let graphqlLanguageService = createLanguageService();
exports.graphqlLanguageService = graphqlLanguageService;

function resetGraphQLLanguageService() {
  graphqlLanguageService.then(value => value.dispose());
  exports.graphqlLanguageService = graphqlLanguageService = createLanguageService();
}