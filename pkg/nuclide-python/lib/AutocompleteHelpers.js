'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const VALID_EMPTY_SUFFIX = /(\.|\()$/;
const TRIGGER_COMPLETION_REGEX = /([. ]|[a-zA-Z_][a-zA-Z0-9_]*)$/;

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
      return createPlaceholders ? `\${${ index + 1 }:${ param }}` : param;
    });
    return `${ completion.text }(${ paramTexts.join(', ') })`;
  }

  return completion.text;
}

class AutocompleteHelpers {

  static getAutocompleteSuggestions(request) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('nuclide-python:getAutocompleteSuggestions', () => AutocompleteHelpers._getAutocompleteSuggestions(request));
  }

  static _getAutocompleteSuggestions(request) {
    return (0, _asyncToGenerator.default)(function* () {
      const { editor, activatedManually, prefix } = request;

      if (!TRIGGER_COMPLETION_REGEX.test(prefix)) {
        return [];
      }

      if (!activatedManually && prefix === '') {
        const wordPrefix = editor.getLastCursor().getCurrentWordPrefix();
        if (!VALID_EMPTY_SUFFIX.test(wordPrefix)) {
          return [];
        }
      }

      const src = editor.getPath();
      if (!src) {
        return [];
      }

      const cursor = editor.getLastCursor();
      const line = cursor.getBufferRow();
      const column = cursor.getBufferColumn();

      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);

      if (!service) {
        throw new Error('Invariant violation: "service"');
      }

      const results = yield service.getCompletions(src, editor.getText(), line, column);

      if (!results) {
        return [];
      }

      return results.map(function (completion) {
        // Always display optional arguments in the UI.
        const displayText = getText(completion);
        // Only autocomplete arguments if the include optional arguments setting is on.
        const snippet = (0, (_config || _load_config()).getAutocompleteArguments)() ? getText(completion, (0, (_config || _load_config()).getIncludeOptionalArguments)(), true /* createPlaceholders */) : completion.text;
        return {
          displayText,
          snippet,
          type: (_constants || _load_constants()).TYPES[completion.type],
          description: completion.description
        };
      });
    })();
  }

}
exports.default = AutocompleteHelpers;
module.exports = exports['default'];