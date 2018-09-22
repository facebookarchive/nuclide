/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {ServerConnection} from '../../nuclide-remote-connection';
import type {AtomLanguageServiceConfig} from '../../nuclide-language-service/lib/AtomLanguageService';
import type {LanguageService} from '../../nuclide-language-service/lib/LanguageService';

import {
  AtomLanguageService,
  getHostServices,
} from '../../nuclide-language-service';
import {NullLanguageService} from '../../nuclide-language-service-rpc';
import {getNotifierByConnection} from '../../nuclide-open-files';
import {getVSCodeLanguageServiceByConnection} from '../../nuclide-remote-connection';

async function connectionToGraphQLService(
  connection: ?ServerConnection,
): Promise<LanguageService> {
  const [fileNotifier, host] = await Promise.all([
    getNotifierByConnection(connection),
    getHostServices(),
  ]);
  const graphqlCommand = 'graphql-language-service/bin/graphql.js';
  const lspService = await getVSCodeLanguageServiceByConnection(
    connection,
  ).createMultiLspLanguageService(
    'graphql',
    graphqlCommand,
    ['server', '--method', 'stream'],
    {
      fileNotifier,
      host,
      projectFileNames: ['.graphqlconfig'],
      fileExtensions: ['.js', '.graphql'],
      logCategory: 'nuclide-graphql',
      logLevel: 'INFO',
      fork: true,
      additionalLogFilesRetentionPeriod: 5 * 60 * 1000, // 5 minutes
    },
  );
  return lspService || new NullLanguageService();
}

function createLanguageService(): AtomLanguageService<LanguageService> {
  const diagnosticsConfig = {
    version: '0.2.0',
    analyticsEventName: 'graphql.observe-diagnostics',
  };

  const definitionConfig = {
    version: '0.1.0',
    priority: 1,
    definitionEventName: 'graphql.definition',
  };

  const autocompleteConfig = {
    inclusionPriority: 1,
    suggestionPriority: 3,
    excludeLowerPriority: false,
    analytics: {
      eventName: 'nuclide-graphql',
      shouldLogInsertedSuggestion: false,
    },
    disableForSelector: null,
    autocompleteCacherConfig: null,
    supportsResolve: false,
  };

  const atomConfig: AtomLanguageServiceConfig = {
    name: 'GraphQL',
    grammars: ['source.graphql', 'source.js.jsx', 'source.js', 'source.flow'],
    diagnostics: diagnosticsConfig,
    definition: definitionConfig,
    autocomplete: autocompleteConfig,
  };
  return new AtomLanguageService(connectionToGraphQLService, atomConfig);
}

export let graphqlLanguageService: AtomLanguageService<
  LanguageService,
> = createLanguageService();

export function resetGraphQLLanguageService(): void {
  graphqlLanguageService.dispose();
  graphqlLanguageService = createLanguageService();
}
