'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {getServiceByNuclideUri} = require('nuclide-client');

// One of text or snippet is required.
type Suggestion = {
  text: ?string;
  snippet: ?string;
  replacementPrefix: ?string;
  rightLabel: ?string;
  rightLabelHTML: ?string;
  className: ?string;
}

module.exports = {

  config: {
    pathToFlow: {
      type: 'string',
      default: 'flow',
      description: 'Absolute path to the Flow executable on your system.',
    },
  },

  activate() {},

  /** Provider for autocomplete service. */
  createAutocompleteProvider() {
    var getSuggestions = (
      request: {editor: TextEditor; bufferPosition: Point; scopeDescriptor: any; prefix: string}
    ) => {
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

  createClickToSymbolDelegate() {
    // Set up click-to-symbol.
    var ClickToSymbolDelegate = require('./ClickToSymbolDelegate');
    return new ClickToSymbolDelegate();
  },

  deactivate() {
    // TODO(mbolin): Find a way to unregister the autocomplete provider from
    // ServiceHub, or set a boolean in the autocomplete provider to always return
    // empty results.
  }
};
