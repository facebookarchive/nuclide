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
  // $FlowIssue https://github.com/facebook/flow/issues/620
  config: require('../package.json').nuclide.config,

  activate(): void {
  },

  getHyperclickProvider() {
    return require('./HyperclickProvider');
  },

  createAutocompleteProvider(): mixed {
    const {trackOperationTiming} = require('nuclide-analytics');
    const getSuggestions = request => {
      return trackOperationTiming(
        'nuclide-ocaml:getAutocompleteSuggestions',
        () => require('./AutoComplete').getAutocompleteSuggestions(request));
    };
    return {
      selector: '.source.ocaml',
      inclusionPriority: 1,
      disableForSelector: '.source.ocaml .comment',
      getSuggestions,
    };
  },
};
