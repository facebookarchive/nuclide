Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var HACK_GRAMMARS = ['text.html.hack', 'text.html.php'];

/**
 * Constants here represent enums with the same values got from hh_client and the Hack web worker.
 */
module.exports = {

  CompletionType: Object.freeze({
    ID: 0,
    NEW: 1,
    TYPE: 2,
    CLASS_GET: 3,
    VAR: 4,
    NONE: 5
  }),

  SymbolType: Object.freeze({
    CLASS: 0,
    FUNCTION: 1,
    METHOD: 2,
    LOCAL: 3,
    UNKNOWN: 4
  }),

  SearchResultType: Object.freeze({
    CLASS: 0,
    TYPEDEF: 1,
    METHOD: 2,
    CLASS_VAR: 3,
    FUNCTION: 4,
    CONSTANT: 5,
    INTERFACE: 6,
    ABSTRACT_CLASS: 7,
    TRAIT: 8
  }),

  HACK_GRAMMARS: HACK_GRAMMARS,
  HACK_GRAMMARS_SET: new Set(HACK_GRAMMARS)
};