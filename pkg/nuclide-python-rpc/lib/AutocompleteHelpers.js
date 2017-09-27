'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCompletions = exports.getAutocompleteSuggestions = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getAutocompleteSuggestions = exports.getAutocompleteSuggestions = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (serverManager, filePath, buffer, position, activatedManually, autocompleteArguments, includeOptionalArguments) {
    if (!activatedManually && (0, (_range || _load_range()).matchRegexEndingAt)(buffer, position, TRIGGER_REGEX) == null) {
      return { isIncomplete: false, items: [] };
    }

    const results = yield getCompletions(serverManager, filePath, buffer.getText(), position.row, position.column);
    if (results == null) {
      return { isIncomplete: false, items: [] };
    }

    const items = results.map(function (completion) {
      // Always display optional arguments in the UI.
      const displayText = getText(completion);
      // Only autocomplete arguments if the include optional arguments setting is on.
      const snippet = autocompleteArguments ? getText(completion, includeOptionalArguments, true /* createPlaceholders */
      ) : completion.text;
      return {
        displayText,
        snippet,
        type: TYPES[completion.type],
        description: completion.description
      };
    });
    return {
      isIncomplete: false,
      items
    };
  });

  return function getAutocompleteSuggestions(_x, _x2, _x3, _x4, _x5, _x6, _x7) {
    return _ref.apply(this, arguments);
  };
})();

let getCompletions = exports.getCompletions = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (serverManager, src, contents, line, column) {
    const service = yield serverManager.getJediService(src);
    return service.get_completions(src, contents, line, column);
  });

  return function getCompletions(_x8, _x9, _x10, _x11, _x12) {
    return _ref2.apply(this, arguments);
  };
})();

var _range;

function _load_range() {
  return _range = require('nuclide-commons/range');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Type mappings between Jedi types and autocomplete-plus types used for styling.
const TYPES = {
  module: 'import',
  class: 'class',
  instance: 'variable',
  function: 'function',
  generator: 'generator',
  statement: 'variable',
  import: 'import',
  param: 'variable',
  property: 'property'
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

const TRIGGER_REGEX = /(\.|[a-zA-Z_][a-zA-Z0-9_]*)$/;

/**
 * Generate a function-signature line string if completion is a function.
 * Otherwise just return the completion text.
 * @param  completion           The completion object to get text of.
 * @param  includeOptionalArgs  Whether or not to skip optional python arguments,
 *   including keyword args with default values, and star args (*, *args, **kwargs)
 * @param  createPlaceholders   Create snippet placeholders for the arguments
 *   instead of plain text.
 * @return string               Textual representation of the completion.
 */
function getText(completion, includeOptionalArgs = true, createPlaceholders = false) {
  if (completion.params) {
    const params = includeOptionalArgs ? completion.params : completion.params.filter(param => param.indexOf('=') < 0 && param.indexOf('*') < 0);

    const paramTexts = params.map((param, index) => {
      return createPlaceholders ? `\${${index + 1}:${param}}` : param;
    });
    return `${completion.text}(${paramTexts.join(', ')})`;
  }

  return completion.text;
}