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
  BusySignalProviderBase as BusySignalProviderBaseType,
} from '../../nuclide-busy-signal';
import type {NuclideEvaluationExpressionProvider} from '../../nuclide-debugger-interfaces/service';
import typeof * as FlowService from '../../nuclide-flow-rpc';
import type {ServerConnection} from '../../nuclide-remote-connection';
import type {
  AtomLanguageServiceConfig,
} from '../../nuclide-language-service/lib/AtomLanguageService';
import type {LanguageService} from '../../nuclide-language-service/lib/LanguageService';

import invariant from 'assert';
import {CompositeDisposable} from 'atom';

import featureConfig from '../../commons-atom/featureConfig';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import registerGrammar from '../../commons-atom/register-grammar';
import {getNotifierByConnection} from '../../nuclide-open-files';
import {AtomLanguageService} from '../../nuclide-language-service';
import {filterResultsByPrefix, shouldFilter} from '../../nuclide-flow-common';

import {FlowServiceWatcher} from './FlowServiceWatcher';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {DedupedBusySignalProviderBase} from '../../nuclide-busy-signal';
import {FlowEvaluationExpressionProvider} from './FlowEvaluationExpressionProvider';
import {getCurrentServiceInstances, getFlowServiceByConnection} from './FlowServiceFactory';

import {JS_GRAMMARS} from './constants';
const GRAMMARS_STRING = JS_GRAMMARS.join(', ');

const PACKAGE_NAME = 'nuclide-flow';

let busySignalProvider;

let disposables;

let flowLanguageService: ?AtomLanguageService<LanguageService> = null;

export function activate() {
  if (!disposables) {
    disposables = new CompositeDisposable();

    flowLanguageService = new AtomLanguageService(
      connectionToFlowService,
      getLanguageServiceConfig(),
    );
    flowLanguageService.activate();

    disposables.add(
      new FlowServiceWatcher(),
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
): Promise<LanguageService> {
  const flowService: FlowService = getFlowServiceByConnection(connection);
  const fileNotifier = await getNotifierByConnection(connection);
  const languageService = await flowService.initialize(fileNotifier);

  return languageService;
}

export function provideBusySignal(): BusySignalProviderBaseType {
  if (!busySignalProvider) {
    busySignalProvider = new DedupedBusySignalProviderBase();
  }
  return busySignalProvider;
}

export function createEvaluationExpressionProvider(): NuclideEvaluationExpressionProvider {
  const evaluationExpressionProvider = new FlowEvaluationExpressionProvider();
  const getEvaluationExpression =
    evaluationExpressionProvider.getEvaluationExpression.bind(evaluationExpressionProvider);
  return {
    selector: GRAMMARS_STRING,
    name: PACKAGE_NAME,
    getEvaluationExpression,
  };
}

export function deactivate() {
  // TODO(mbolin): Find a way to unregister the autocomplete provider from
  // ServiceHub, or set a boolean in the autocomplete provider to always return
  // empty results.
  const service: ?FlowService = getServiceByNuclideUri('FlowService');
  invariant(service);
  service.dispose();
  if (disposables) {
    disposables.dispose();
    disposables = null;
  }
}

function allowFlowServerRestart(): void {
  for (const service of getCurrentServiceInstances()) {
    service.allowServerRestart();
  }
}

function getLanguageServiceConfig(): AtomLanguageServiceConfig {
  const enableHighlight = featureConfig.get('nuclide-flow.enableReferencesHighlight');
  const excludeLowerPriority = Boolean(featureConfig.get('nuclide-flow.excludeOtherAutocomplete'));
  const flowResultsFirst = Boolean(featureConfig.get('nuclide-flow.flowAutocompleteResultsFirst'));
  const enableTypeHints = Boolean(featureConfig.get('nuclide-flow.enableTypeHints'));
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
    diagnostics: {
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
  };
}
