var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fetchCompletionsForEditor = _asyncToGenerator(function* (editor, prefix) {
  var hackLanguage = yield (0, (_HackLanguage2 || _HackLanguage()).getHackLanguageForUri)(editor.getPath());
  var filePath = editor.getPath();
  if (!hackLanguage || !filePath) {
    return [];
  }

  (0, (_assert2 || _assert()).default)(filePath);
  var contents = editor.getText();
  var cursor = editor.getLastCursor();
  var offset = editor.getBuffer().characterIndexForPosition(cursor.getBufferPosition());
  // The returned completions may have unrelated results, even though the offset is set on the end
  // of the prefix.
  var completions = yield hackLanguage.getCompletions(filePath, contents, offset);
  // Filter out the completions that do not contain the prefix as a token in the match text case
  // insentively.
  var tokenLowerCase = prefix.toLowerCase();

  var hackCompletionsCompartor = (0, (_utils2 || _utils()).compareHackCompletions)(prefix);
  return completions.filter(function (completion) {
    return completion.matchText.toLowerCase().indexOf(tokenLowerCase) >= 0;
  })
  // Sort the auto-completions based on a scoring function considering:
  // case sensitivity, position in the completion, private functions and alphabetical order.
  .sort(function (completion1, completion2) {
    return hackCompletionsCompartor(completion1.matchText, completion2.matchText);
  });
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _HackLanguage2;

function _HackLanguage() {
  return _HackLanguage2 = require('./HackLanguage');
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var FIELD_ACCESSORS = ['->', '::'];
var PREFIX_LOOKBACK = Math.max.apply(null, FIELD_ACCESSORS.map(function (prefix) {
  return prefix.length;
}));

var AutocompleteProvider = (function () {
  function AutocompleteProvider() {
    _classCallCheck(this, AutocompleteProvider);
  }

  /**
   * Returns true if `bufferPosition` is prefixed with any of the passed `checkPrefixes`.
   */

  _createDecoratedClass(AutocompleteProvider, [{
    key: 'getAutocompleteSuggestions',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('hack.getAutocompleteSuggestions')],
    value: _asyncToGenerator(function* (request) {
      var editor = request.editor;
      var bufferPosition = request.bufferPosition;

      var replacementPrefix = findHackPrefix(editor);

      if (!replacementPrefix && !hasPrefix(editor, bufferPosition, FIELD_ACCESSORS, PREFIX_LOOKBACK)) {
        return [];
      }

      var completions = yield fetchCompletionsForEditor(editor, replacementPrefix);

      return completions.map(function (completion) {
        return {
          snippet: completion.matchSnippet,
          replacementPrefix: replacementPrefix,
          rightLabel: completion.matchType
        };
      });
    })
  }]);

  return AutocompleteProvider;
})();

function hasPrefix(editor, bufferPosition, checkPrefixes, prefixLookback) {
  var priorChars = editor.getTextInBufferRange(new (_atom2 || _atom()).Range(new (_atom2 || _atom()).Point(bufferPosition.row, bufferPosition.column - prefixLookback), bufferPosition));
  return checkPrefixes.some(function (prefix) {
    return priorChars.endsWith(prefix);
  });
}

function findHackPrefix(editor) {
  var cursor = editor.getLastCursor();
  // We use custom wordRegex to adopt php variables starting with $.
  var currentRange = cursor.getCurrentWordBufferRange({ wordRegex: /(\$\w*)|\w+/ });
  // Current word might go beyond the cursor, so we cut it.
  var range = new (_atom2 || _atom()).Range(currentRange.start, new (_atom2 || _atom()).Point(cursor.getBufferRow(), cursor.getBufferColumn()));
  var prefix = editor.getTextInBufferRange(range).trim();
  // Prefix could just be $ or ends with string literal.
  if (prefix === '$' || !/[\W]$/.test(prefix)) {
    return prefix;
  } else {
    return '';
  }
}

module.exports = AutocompleteProvider;