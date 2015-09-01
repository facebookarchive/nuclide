'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = {
  config: {
    pathToMerlin: {
      type: 'string',
      default: 'ocamlmerlin',
    },
  },

  activate(): void {
  },

  getHyperclickProvider() {
    return require('./HyperclickProvider');
  },

  createAutocompleteProvider(): mixed {
    var getSuggestions = require('./AutoComplete').getAutocompleteSuggestions;
    return {
      selector: '.source.ocaml',
      inclusionPriority: 1,
      disableForSelector: '.source.ocaml .comment',
      getSuggestions,
    };
  },
};
