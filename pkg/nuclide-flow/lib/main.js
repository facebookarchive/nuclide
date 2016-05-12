'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HyperclickProvider} from '../../hyperclick/lib/types';
import type {
  BusySignalProviderBase as BusySignalProviderBaseType,
} from '../../nuclide-busy-signal';
import type {CoverageProvider} from '../../nuclide-type-coverage/lib/types';
import type {OutlineProvider} from '../../nuclide-outline-view';
import type {NuclideEvaluationExpressionProvider} from '../../nuclide-debugger-interfaces/service';

import invariant from 'assert';
import {CompositeDisposable} from 'atom';

import featureConfig from '../../nuclide-feature-config';
import {getServiceByNuclideUri} from '../../nuclide-client';
import {track} from '../../nuclide-analytics';

import {getCoverage} from './FlowCoverageProvider';

import {JS_GRAMMARS, JAVASCRIPT_WORD_REGEX} from './constants';
const GRAMMARS_STRING = JS_GRAMMARS.join(', ');
const diagnosticsOnFlySetting = 'nuclide-flow.diagnosticsOnFly';

const PACKAGE_NAME = 'nuclide-flow';

let busySignalProvider;

let flowDiagnosticsProvider;

let disposables;

export function activate() {
  if (!disposables) {
    disposables = new CompositeDisposable();

    const {FlowServiceWatcher} = require('./FlowServiceWatcher');
    const watcher = new FlowServiceWatcher();
    disposables.add(watcher);

    disposables.add(atom.commands.add(
      atom.views.getView(atom.workspace),
      'nuclide-flow:restart-flow-server',
      allowFlowServerRestart,
    ));

    const {registerGrammarForFileExtension} = require('../../nuclide-atom-helpers');
    registerGrammarForFileExtension('source.ini', '.flowconfig');
  }
}

/** Provider for autocomplete service. */
export function createAutocompleteProvider(): atom$AutocompleteProvider {
  const AutocompleteProvider = require('./FlowAutocompleteProvider');
  const autocompleteProvider = new AutocompleteProvider();
  const getSuggestions = autocompleteProvider.getSuggestions.bind(autocompleteProvider);

  const excludeLowerPriority = Boolean(featureConfig.get('nuclide-flow.excludeOtherAutocomplete'));

  return {
    selector: JS_GRAMMARS.map(grammar => '.' + grammar).join(', '),
    disableForSelector: '.source.js .comment',
    inclusionPriority: 1,
    // We want to get ranked higher than the snippets provider.
    suggestionPriority: 5,
    onDidInsertSuggestion: () => {
      track('nuclide-flow.autocomplete-chosen');
    },
    excludeLowerPriority,
    getSuggestions,
  };
}

export function getHyperclickProvider(): HyperclickProvider {
  const FlowHyperclickProvider = require('./FlowHyperclickProvider');
  const flowHyperclickProvider = new FlowHyperclickProvider();
  const getSuggestionForWord =
      flowHyperclickProvider.getSuggestionForWord.bind(flowHyperclickProvider);
  return {
    wordRegExp: JAVASCRIPT_WORD_REGEX,
    priority: 20,
    providerName: PACKAGE_NAME,
    getSuggestionForWord,
  };
}

export function provideBusySignal(): BusySignalProviderBaseType {
  if (!busySignalProvider) {
    const {DedupedBusySignalProviderBase} = require('../../nuclide-busy-signal');
    busySignalProvider = new DedupedBusySignalProviderBase();
  }
  return busySignalProvider;
}

export function provideDiagnostics() {
  if (!flowDiagnosticsProvider) {
    const busyProvider = this.provideBusySignal();
    const FlowDiagnosticsProvider = require('./FlowDiagnosticsProvider');
    const runOnTheFly = ((featureConfig.get(diagnosticsOnFlySetting): any): boolean);
    flowDiagnosticsProvider = new FlowDiagnosticsProvider(runOnTheFly, busyProvider);
    invariant(disposables);
    const {projects} = require('../../nuclide-atom-helpers');
    disposables.add(projects.onDidRemoveProjectPath(projectPath => {
      invariant(flowDiagnosticsProvider);
      flowDiagnosticsProvider.invalidateProjectPath(projectPath);
    }));
  }
  return flowDiagnosticsProvider;
}

export function provideOutlines(): OutlineProvider {
  const {FlowOutlineProvider} = require('./FlowOutlineProvider');
  const provider = new FlowOutlineProvider();
  return {
    grammarScopes: JS_GRAMMARS,
    priority: 1,
    name: 'Flow',
    getOutline: provider.getOutline.bind(provider),
  };
}

export function createTypeHintProvider(): Object {
  const {FlowTypeHintProvider} = require('./FlowTypeHintProvider');
  const flowTypeHintProvider = new FlowTypeHintProvider();
  const typeHint = flowTypeHintProvider.typeHint.bind(flowTypeHintProvider);
  return {
    selector: GRAMMARS_STRING,
    providerName: PACKAGE_NAME,
    inclusionPriority: 1,
    typeHint,
  };
}

export function createCoverageProvider(): CoverageProvider {
  return {
    displayName: 'Flow',
    priority: 10,
    grammarScopes: JS_GRAMMARS,
    getCoverage(path) {
      return getCoverage(path);
    },
  };
}

export function createEvaluationExpressionProvider(): NuclideEvaluationExpressionProvider {
  const {FlowEvaluationExpressionProvider} = require('./FlowEvaluationExpressionProvider');
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
  const service = getServiceByNuclideUri('FlowService');
  invariant(service);
  service.dispose();
  if (disposables) {
    disposables.dispose();
    disposables = null;
  }
  if (flowDiagnosticsProvider) {
    flowDiagnosticsProvider.dispose();
    flowDiagnosticsProvider = null;
  }
}

function allowFlowServerRestart(): void {
  const {getCurrentServiceInstances} = require('./FlowServiceFactory');
  for (const service of getCurrentServiceInstances()) {
    service.allowServerRestart();
  }
}
