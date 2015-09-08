'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var invariant = require('assert');

var {CompositeDisposable} = require('atom');

var {JS_GRAMMARS} = require('./constants.js');
var GRAMMARS_STRING = JS_GRAMMARS.join(', ');
var diagnosticsOnFlySetting = 'nuclide-flow.diagnosticsOnFly';

function getServiceByNuclideUri(service, file?) {
  return require('nuclide-client').getServiceByNuclideUri(service, file);
}

var flowDiagnosticsProvider;

var disposables;

module.exports = {

  config: {
    pathToFlow: {
      type: 'string',
      default: 'flow',
      description: 'Absolute path to the Flow executable on your system.',
    },

    enableTypeHints: {
      type: 'boolean',
      default: true,
      description: 'Display tooltips with Flow types',
    },

    diagnosticsOnFly: {
      type: 'boolean',
      default: false,
      title: 'Diagnostics as you type',
      description: 'Report Flow errors and warnings as you type, rather than waiting for a save',
    },
  },

  activate() {
    if (!disposables) {
      disposables = new CompositeDisposable();

      var {registerGrammarForFileExtension} = require('nuclide-atom-helpers');
      disposables.add(registerGrammarForFileExtension('source.ini', '.flowconfig'));
    }
  },

  /** Provider for autocomplete service. */
  createAutocompleteProvider(): atom$AutocompleteProvider {
    var AutocompleteProvider = require('./FlowAutocompleteProvider');
    var autocompleteProvider = new AutocompleteProvider();
    var getSuggestions = autocompleteProvider.getSuggestions.bind(autocompleteProvider);
    return {
      selector: JS_GRAMMARS.map(grammar => '.' + grammar).join(', '),
      disableForSelector: '.source.js .comment',
      inclusionPriority: 1,
      // We want to get ranked higher than the snippets provider.
      suggestionPriority: 5,
      getSuggestions,
    };
  },

  getHyperclickProvider(): HyperclickProvider {
    var FlowHyperclickProvider = require('./FlowHyperclickProvider');
    var flowHyperclickProvider = new FlowHyperclickProvider();
    var getSuggestionForWord =
        flowHyperclickProvider.getSuggestionForWord.bind(flowHyperclickProvider);
    return {
      priority: 20,
      getSuggestionForWord,
    };
  },

  provideDiagnostics() {
    if (!flowDiagnosticsProvider) {
      var FlowDiagnosticsProvider = require('./FlowDiagnosticsProvider');
      var runOnTheFly = ((atom.config.get(diagnosticsOnFlySetting): any): boolean);
      flowDiagnosticsProvider = new FlowDiagnosticsProvider(runOnTheFly);
      invariant(disposables);
      disposables.add(atom.config.observe(diagnosticsOnFlySetting, newValue => {
        invariant(flowDiagnosticsProvider);
        flowDiagnosticsProvider.setRunOnTheFly(newValue);
      }));
    }
    return flowDiagnosticsProvider;
  },

  createTypeHintProvider(): Object {
    var FlowTypeHintProvider = require('./FlowTypeHintProvider');
    var flowTypeHintProvider = new FlowTypeHintProvider();
    var typeHint = flowTypeHintProvider.typeHint.bind(flowTypeHintProvider);
    return {
      selector: GRAMMARS_STRING,
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
