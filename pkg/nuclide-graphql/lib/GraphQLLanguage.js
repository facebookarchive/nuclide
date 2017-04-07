/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  ServerConnection,
} from '../../nuclide-remote-connection';
import type {
  AtomLanguageServiceConfig,
} from '../../nuclide-language-service/lib/AtomLanguageService';
import type {LanguageService} from '../../nuclide-language-service/lib/LanguageService';
import typeof * as GraphQLService from '../../nuclide-graphql-rpc/lib/GraphQLService';

import {AtomLanguageService} from '../../nuclide-language-service';
import {getNotifierByConnection} from '../../nuclide-open-files';
import {getServiceByConnection} from '../../nuclide-remote-connection';

const GRAPHQL_SERVICE_NAME = 'GraphQLService';

async function connectionToGraphQLService(
  connection: ?ServerConnection,
): Promise<LanguageService> {
  const graphqlService: GraphQLService = getServiceByConnection(
    GRAPHQL_SERVICE_NAME,
    connection,
  );
  const fileNotifier = await getNotifierByConnection(connection);

  return graphqlService.initialize(
    fileNotifier,
  );
}

const diagnosticsConfig = {
  version: '0.1.0',
  shouldRunOnTheFly: false,
  analyticsEventName: 'graphql.run-diagnostics',
};

const definitionConfig = {
  version: '0.0.0',
  priority: 1,
  definitionEventName: 'graphql.definition',
  definitionByIdEventName: 'graphql.definition-by-id',
};

const outlineViewConfig = {
  version: '0.0.0',
  priority: 1,
  analyticsEventName: 'graphql.outline',
};

const autocompleteConfig = {
  version: '2.0.0',
  inclusionPriority: 1,
  suggestionPriority: 3,
  excludeLowerPriority: false,
  analyticsEventName: 'graphql.getAutocompleteSuggestions',
  disableForSelector: null,
  autocompleteCacherConfig: null,
  onDidInsertSuggestionAnalyticsEventName: 'graphql.autocomplete-chosen',
};

const atomConfig: AtomLanguageServiceConfig = {
  name: 'GraphQL',
  grammars: ['source.graphql'],
  diagnostics: diagnosticsConfig,
  definition: definitionConfig,
  outline: outlineViewConfig,
  autocomplete: autocompleteConfig,
};

export const graphqlLanguageService: AtomLanguageService<LanguageService>
 = new AtomLanguageService(connectionToGraphQLService, atomConfig);

export function resetGraphQLLanguageService(): void {
  graphqlLanguageService.dispose();
}
