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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _config2;

function _config() {
  return _config2 = require('./config');
}

var VALID_EMPTY_SUFFIX = /(\.|\()$/;
var TRIGGER_COMPLETION_REGEX = /([\. ]|[a-zA-Z_][a-zA-Z0-9_]*)$/;

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
  var includeOptionalArgs = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
  var createPlaceholders = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  if (completion.params) {
    var params = includeOptionalArgs ? completion.params : completion.params.filter(function (param) {
      return param.indexOf('=') < 0 && param.indexOf('*') < 0;
    });

    var paramTexts = params.map(function (param, index) {
      return createPlaceholders ? '${' + (index + 1) + ':' + param + '}' : param;
    });
    return completion.text + '(' + paramTexts.join(', ') + ')';
  }

  return completion.text;
}

var AutocompleteHelpers = (function () {
  function AutocompleteHelpers() {
    _classCallCheck(this, AutocompleteHelpers);
  }

  _createDecoratedClass(AutocompleteHelpers, null, [{
    key: 'getAutocompleteSuggestions',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('nuclide-python:getAutocompleteSuggestions')],
    value: _asyncToGenerator(function* (request) {
      var editor = request.editor;
      var activatedManually = request.activatedManually;
      var prefix = request.prefix;

      if (!TRIGGER_COMPLETION_REGEX.test(prefix)) {
        return [];
      }

      if (!activatedManually && prefix === '') {
        var wordPrefix = editor.getLastCursor().getCurrentWordPrefix();
        if (!VALID_EMPTY_SUFFIX.test(wordPrefix)) {
          return [];
        }
      }

      var src = editor.getPath();
      if (!src) {
        return [];
      }

      var cursor = editor.getLastCursor();
      var line = cursor.getBufferRow();
      var column = cursor.getBufferColumn();

      var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);
      (0, (_assert2 || _assert()).default)(service);

      var results = yield service.getCompletions(src, editor.getText(), line, column);

      if (!results) {
        return [];
      }

      return results.map(function (completion) {
        // Always display optional arguments in the UI.
        var displayText = getText(completion);
        // Only autocomplete arguments if the include optional arguments setting is on.
        var snippet = (0, (_config2 || _config()).getAutocompleteArguments)() ? getText(completion, (0, (_config2 || _config()).getIncludeOptionalArguments)(), true /* createPlaceholders */) : completion.text;
        return {
          displayText: displayText,
          snippet: snippet,
          type: (_constants2 || _constants()).TYPES[completion.type],
          description: completion.description
        };
      });
    })
  }]);

  return AutocompleteHelpers;
})();

exports.default = AutocompleteHelpers;
module.exports = exports.default;