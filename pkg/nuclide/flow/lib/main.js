'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HyperclickProvider} from 'hyperclick-interfaces';
import type {
  BusySignalProviderBase as BusySignalProviderBaseT,
} from 'nuclide-busy-signal-provider-base';

const invariant = require('assert');
const {CompositeDisposable} = require('atom');

import featureConfig from 'nuclide-feature-config';
import {track} from 'nuclide-analytics';

import {JS_GRAMMARS, JAVASCRIPT_WORD_REGEX} from './constants.js';
const GRAMMARS_STRING = JS_GRAMMARS.join(', ');
const diagnosticsOnFlySetting = 'nuclide-flow.diagnosticsOnFly';

const PACKAGE_NAME = 'nuclide-flow';

function getServiceByNuclideUri(service, file?) {
  return require('nuclide-client').getServiceByNuclideUri(service, file);
}

let busySignalProvider;

let flowDiagnosticsProvider;

let disposables;

module.exports = {

  // $FlowIssue https://github.com/facebook/flow/issues/620
  config: require('../package.json').nuclide.config,

  activate() {
    if (!disposables) {
      disposables = new CompositeDisposable();

      const {registerGrammarForFileExtension} = require('nuclide-atom-helpers');
      disposables.add(registerGrammarForFileExtension('source.ini', '.flowconfig'));
    }
  },

  /** Provider for autocomplete service. */
  createAutocompleteProvider(): atom$AutocompleteProvider {
    const AutocompleteProvider = require('./FlowAutocompleteProvider');
    const autocompleteProvider = new AutocompleteProvider();
    const getSuggestions = autocompleteProvider.getSuggestions.bind(autocompleteProvider);
    return {
      selector: JS_GRAMMARS.map(grammar => '.' + grammar).join(', '),
      disableForSelector: '.source.js .comment',
      inclusionPriority: 1,
      // We want to get ranked higher than the snippets provider.
      suggestionPriority: 5,
      onDidInsertSuggestion: () => {
        track('nuclide-flow.autocomplete-chosen');
      },
      getSuggestions,
    };
  },

  getHyperclickProvider(): HyperclickProvider {
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
  },

  provideBusySignal(): BusySignalProviderBaseT {
    if (!busySignalProvider) {
      const {BusySignalProviderBase} = require('nuclide-busy-signal-provider-base');
      busySignalProvider = new BusySignalProviderBase();
    }
    return busySignalProvider;
  },

  provideDiagnostics() {
    if (!flowDiagnosticsProvider) {
      const busyProvider = this.provideBusySignal();
      const FlowDiagnosticsProvider = require('./FlowDiagnosticsProvider');
      const runOnTheFly = ((featureConfig.get(diagnosticsOnFlySetting): any): boolean);
      flowDiagnosticsProvider = new FlowDiagnosticsProvider(runOnTheFly, busyProvider);
      invariant(disposables);
      disposables.add(featureConfig.observe(diagnosticsOnFlySetting, newValue => {
        invariant(flowDiagnosticsProvider);
        flowDiagnosticsProvider.setRunOnTheFly(newValue);
      }));
      const {projects} = require('nuclide-atom-helpers');
      disposables.add(projects.onDidRemoveProjectPath(projectPath => {
        invariant(flowDiagnosticsProvider);
        flowDiagnosticsProvider.invalidateProjectPath(projectPath);
      }));
    }
    return flowDiagnosticsProvider;
  },

  createTypeHintProvider(): Object {
    const {FlowTypeHintProvider} = require('./FlowTypeHintProvider');
    const flowTypeHintProvider = new FlowTypeHintProvider();
    const typeHint = flowTypeHintProvider.typeHint.bind(flowTypeHintProvider);
    return {
      selector: GRAMMARS_STRING,
      providerName: PACKAGE_NAME,
      inclusionPriority: 1,
      typeHint,
    };
  },

  deactivate() {
    // TODO(mbolin): Find a way to unregister the autocomplete provider from
    // ServiceHub, or set a boolean in the autocomplete provider to always return
    // empty results.
    getServiceByNuclideUri('FlowService').dispose();
    if (disposables) {
      disposables.dispose();
      disposables = null;
    }
    if (flowDiagnosticsProvider) {
      flowDiagnosticsProvider.dispose();
      flowDiagnosticsProvider = null;
    }
  },
};
