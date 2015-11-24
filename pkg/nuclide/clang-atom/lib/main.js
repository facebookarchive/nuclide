'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Point} from 'atom';

import {trackOperationTiming} from 'nuclide-analytics';

let libClangProcess = null;
let editorSubscription = null;
let jumpToRelatedFile = null;
let diagnostics = [];

// One of text our snippet is required.
type Suggestion = {
  text: ?string;
  snippet: ?string;
  replacementPrefix: ?string;
  rightLabel: ?string;
  rightLabelHTML: ?string;
  className: ?string;
}

module.exports = {
  activate() {
    // Create a process that can talk to libclang asynchronously.
    const LibClangProcess = require('./LibClangProcess');
    libClangProcess = new LibClangProcess();

    // Because a ClangLinter is created via reflection via the Linter package,
    // dependencies cannot be passed from above, so they must be set via a
    // static method.
    require('./main-shared').setSharedLibClangProcess(libClangProcess);

    const JumpToRelatedFile = require('./JumpToRelatedFile');
    const RelatedFileFinder = require('./RelatedFileFinder');
    jumpToRelatedFile = new JumpToRelatedFile(new RelatedFileFinder());
    jumpToRelatedFile.enable();
  },

  /** Provider for autocomplete service. */
  createAutocompleteProvider(): mixed {
    const {AutocompleteProvider} = require('./AutocompleteProvider');
    const autocompleteProvider = new AutocompleteProvider(libClangProcess);

    return {
      selector: '.source.objc, .source.objcpp, .source.cpp, .source.c',
      inclusionPriority: 1,

      getSuggestions(
          request: {editor: TextEditor; bufferPosition: Point; scopeDescriptor: any; prefix: string}
          ): Promise<Array<Suggestion>> {
        return trackOperationTiming('nuclide-clang-atom:getAutocompleteSuggestions',
          () => autocompleteProvider.getAutocompleteSuggestions(request));
      },
    };
  },

  deactivate() {
    // TODO(mbolin): Find a way to unregister the AutocompleteDelegate from
    // ServiceHub, or set a boolean in the AutocompleteDelegate to always return
    // empty results.

    if (editorSubscription) {
      editorSubscription.off();
      editorSubscription = null;
    }

    if (jumpToRelatedFile) {
      jumpToRelatedFile.disable();
      jumpToRelatedFile = null;
    }

    diagnostics.forEach((diagnostic) => diagnostic.dispose());
    diagnostics = [];
  },

  getHyperclickProvider() {
    return require('./HyperclickProvider');
  },

  provideLinter() {
    return require('./ClangLinter');
  },
};
