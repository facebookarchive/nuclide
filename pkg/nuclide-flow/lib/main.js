/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import typeof * as FlowService from '../../nuclide-flow-rpc';
import type {FlowLanguageServiceType} from '../../nuclide-flow-rpc';
import type {ServerConnection} from '../../nuclide-remote-connection';
import type {
  AtomLanguageServiceConfig,
} from '../../nuclide-language-service/lib/AtomLanguageService';
import type {FlowSettings} from '../../nuclide-flow-rpc/lib/FlowService';

import invariant from 'assert';

import featureConfig from '../../commons-atom/featureConfig';
import registerGrammar from '../../commons-atom/register-grammar';
import {getNotifierByConnection} from '../../nuclide-open-files';
import {AtomLanguageService} from '../../nuclide-language-service';
import {filterResultsByPrefix, shouldFilter} from '../../nuclide-flow-common';
import {ConnectionCache, getServiceByConnection} from '../../nuclide-remote-connection';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

import {FlowServiceWatcher} from './FlowServiceWatcher';

import {JS_GRAMMARS} from './constants';

let disposables;
let connectionCache: ?ConnectionCache<FlowLanguageServiceType> = null;

function getConnectionCache(): ConnectionCache<FlowLanguageServiceType> {
  invariant(connectionCache != null);
  return connectionCache;
}

export function activate() {
  if (!disposables) {
    connectionCache = new ConnectionCache(connectionToFlowService);

    const flowLanguageService = new AtomLanguageService(
      connection => getConnectionCache().get(connection),
      getLanguageServiceConfig(),
    );
    flowLanguageService.activate();

    disposables = new UniversalDisposable(
      connectionCache,
      () => { connectionCache = null; },
      new FlowServiceWatcher(connectionCache),
      atom.commands.add(
        'atom-workspace',
        'nuclide-flow:restart-flow-server',
        allowFlowServerRestart,
      ),
      flowLanguageService,
    );

    registerGrammar('source.ini', ['.flowconfig']);
  }
}

async function connectionToFlowService(
  connection: ?ServerConnection,
): Promise<FlowLanguageServiceType> {
  const flowService: FlowService = getServiceByConnection('FlowService', connection);
  const fileNotifier = await getNotifierByConnection(connection);
  const config: FlowSettings = {
    functionSnippetShouldIncludeArguments: Boolean(
      featureConfig.get('nuclide-flow.functionSnippetShouldIncludeArguments'),
    ),
    stopFlowOnExit: Boolean(featureConfig.get('nuclide-flow.stopFlowOnExit')),
  };
  const languageService = await flowService.initialize(fileNotifier, config);

  return languageService;
}

export function deactivate() {
  if (disposables != null) {
    disposables.dispose();
    disposables = null;
  }
}

async function allowFlowServerRestart(): Promise<void> {
  const services = await Promise.all(getConnectionCache().values());
  for (const service of services) {
    service.allowServerRestart();
  }
}

function getLanguageServiceConfig(): AtomLanguageServiceConfig {
  const enableHighlight = featureConfig.get('nuclide-flow.enableReferencesHighlight');
  const excludeLowerPriority = Boolean(featureConfig.get('nuclide-flow.excludeOtherAutocomplete'));
  const flowResultsFirst = Boolean(featureConfig.get('nuclide-flow.flowAutocompleteResultsFirst'));
  const enableTypeHints = Boolean(featureConfig.get('nuclide-flow.enableTypeHints'));
  const enablePushDiagnostics = Boolean(featureConfig.get('nuclide-flow.enablePushDiagnostics'));
  return {
    name: 'Flow',
    grammars: JS_GRAMMARS,
    highlight: enableHighlight ? {
      version: '0.0.0',
      priority: 1,
      analyticsEventName: 'flow.codehighlight',
    } : undefined,
    outline: {
      version: '0.0.0',
      priority: 1,
      analyticsEventName: 'flow.outline',
    },
    coverage: {
      version: '0.0.0',
      priority: 10,
      analyticsEventName: 'flow.coverage',
    },
    definition: {
      version: '0.0.0',
      priority: 20,
      definitionEventName: 'flow.get-definition',
      definitionByIdEventName: 'flow.get-definition-by-id',
    },
    autocomplete: {
      version: '2.0.0',
      disableForSelector: '.source.js .comment',
      excludeLowerPriority,
      // We want to get ranked higher than the snippets provider by default,
      // but it's configurable
      suggestionPriority: flowResultsFirst ? 5 : 1,
      inclusionPriority: 1,
      analyticsEventName: 'flow.autocomplete',
      autocompleteCacherConfig: {
        updateResults: (request, results) => filterResultsByPrefix(request.prefix, results),
        shouldFilter,
      },
      onDidInsertSuggestionAnalyticsEventName: 'nuclide-flow.autocomplete-chosen',
    },
    diagnostics: enablePushDiagnostics ? {
      version: '0.2.0',
      analyticsEventName: 'flow.receive-push-diagnostics',
    } : {
      version: '0.1.0',
      shouldRunOnTheFly: false,
      analyticsEventName: 'flow.run-diagnostics',
    },
    typeHint: enableTypeHints ?
    {
      version: '0.0.0',
      priority: 1,
      analyticsEventName: 'nuclide-flow.typeHint',
    } : undefined,
    evaluationExpression: {
      version: '0.0.0',
      analyticsEventName: 'flow.evaluationExpression',
    },
  };
}
