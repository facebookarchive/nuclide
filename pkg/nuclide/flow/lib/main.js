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

// One of text or snippet is required.
type Suggestion = {
  text: ?string;
  snippet: ?string;
  replacementPrefix: ?string;
  rightLabel: ?string;
  rightLabelHTML: ?string;
  className: ?string;
}

type Request = {
  editor: TextEditor;
  prefix: string;
}

type Autocomplete = {
  selector: string;
  disableForSelector: string;
  inclusionPriority: number;
  getSuggestions: (request: Request) => Promise<Array<Suggestion>>;
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

    enableAutocomplete: {
      type: 'boolean',
      default: false,
      description: 'Currently does not work well, enable it if you would like to try it anyway',
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
    }
  },

  /** Provider for autocomplete service. */
  createAutocompleteProvider(): Autocomplete {
    var getSuggestions = request => {
      var {editor, prefix} = request;
      var file = editor.getPath();
      var contents = editor.getText();
      var cursor = editor.getLastCursor();
      var line = cursor.getBufferRow();
      var col = cursor.getBufferColumn();

      var enabled = atom.config.get('nuclide-flow.enableAutocomplete');
      if (enabled) {
        return getServiceByNuclideUri('FlowService', file)
          .getAutocompleteSuggestions(file, contents, line, col, prefix);
      } else {
        return Promise.resolve([]);
      }
    };

    return {
      selector: JS_GRAMMARS.map(grammar => '.' + grammar).join(', '),
      disableForSelector: '.source.js .comment',
      inclusionPriority: 1,
      getSuggestions,
    };
  },

  getHyperclickProvider() {
    return require('./HyperclickProvider');
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

  createTypeHintProvider(): any {
    var TypeHintProvider = require('./TypeHintProvider');
    var typeHintProvider = new TypeHintProvider();

    return {
      selector: GRAMMARS_STRING,
      inclusionPriority: 1,
      typeHint(editor: TextEditor, position: Point): Promise<any> {
        return typeHintProvider.typeHint(editor, position);
      },
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
