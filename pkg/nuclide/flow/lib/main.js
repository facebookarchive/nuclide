'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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
  getSuggestions: (request: Request) => Suggestion;
}

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
  },

  activate() {},

  /** Provider for autocomplete service. */
  createAutocompleteProvider(): Autocomplete {
    var getSuggestions = request => {
      var {editor, prefix} = request;
      var file = editor.getPath();
      var contents = editor.getText();
      var cursor = editor.getLastCursor();
      var line = cursor.getBufferRow();
      var col = cursor.getBufferColumn();

      return getServiceByNuclideUri('FlowService', file)
        .getAutocompleteSuggestions(file, contents, line, col, prefix);
    };

    return {
      selector: '.source.js',
      disableForSelector: '.source.js .comment',
      inclusionPriority: 1,
      getSuggestions,
    };
  },

  getHyperclickProvider() {
    return require('./HyperclickProvider');
  },

  provideLinter() {
    return require('./FlowLinter');
  },

  createTypeHintProvider(): any {
    var TypeHintProvider = require('./TypeHintProvider');
    var typeHintProvider = new TypeHintProvider();

    return {
      selector: 'source.js',
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
  }
};
