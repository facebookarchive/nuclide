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
import type LibClangProcess from './LibClangProcess';
import type {HyperclickProvider} from '../../hyperclick-interfaces';

import invariant from 'assert';

import {trackOperationTiming} from '../../analytics';

let libClangProcess = (null : ?LibClangProcess);

module.exports = {
  activate() {
    // Create a process that can talk to libclang asynchronously.
    const LibClangProcess = require('./LibClangProcess');
    libClangProcess = new LibClangProcess();

    // Because a ClangLinter is created via reflection via the Linter package,
    // dependencies cannot be passed from above, so they must be set via a
    // static method.
    require('./main-shared').setSharedLibClangProcess(libClangProcess);
  },

  /** Provider for autocomplete service. */
  createAutocompleteProvider(): atom$AutocompleteProvider {
    const {AutocompleteProvider} = require('./AutocompleteProvider');
    invariant(libClangProcess);
    const autocompleteProvider = new AutocompleteProvider(libClangProcess);

    return {
      selector: '.source.objc, .source.objcpp, .source.cpp, .source.c',
      inclusionPriority: 1,

      getSuggestions(
        request: atom$AutocompleteRequest
      ): Promise<Array<atom$AutocompleteSuggestion>> {
        return trackOperationTiming('nuclide-clang-atom:getAutocompleteSuggestions',
          () => autocompleteProvider.getAutocompleteSuggestions(request));
      },
    };
  },

  deactivate() {
  },

  getHyperclickProvider(): HyperclickProvider {
    return require('./HyperclickProvider');
  },

  provideLinter() {
    return require('./ClangLinter');
  },
};
