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
exports.default = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _dec, _desc, _value, _class;

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

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

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
function getText(completion) {
  let includeOptionalArgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  let createPlaceholders = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (completion.params) {
    const params = includeOptionalArgs ? completion.params : completion.params.filter(param => param.indexOf('=') < 0 && param.indexOf('*') < 0);

    const paramTexts = params.map((param, index) => {
      return createPlaceholders ? `\${${ index + 1 }:${ param }}` : param;
    });
    return `${ completion.text }(${ paramTexts.join(', ') })`;
  }

  return completion.text;
}

let AutocompleteHelpers = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-python:getAutocompleteSuggestions'), (_class = class AutocompleteHelpers {
  static getAutocompleteSuggestions(request) {
    return (0, _asyncToGenerator.default)(function* () {
      const editor = request.editor,
            activatedManually = request.activatedManually,
            prefix = request.prefix;


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
          displayText: displayText,
          snippet: snippet,
          type: (_constants || _load_constants()).TYPES[completion.type],
          description: completion.description
        };
      });
    })();
  }

}, (_applyDecoratedDescriptor(_class, 'getAutocompleteSuggestions', [_dec], Object.getOwnPropertyDescriptor(_class, 'getAutocompleteSuggestions'), _class)), _class));
exports.default = AutocompleteHelpers;
module.exports = exports['default'];