'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AutocompleteProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.updateAutocompleteResults = updateAutocompleteResults;
exports.updateAutocompleteFirstResults = updateAutocompleteFirstResults;

var _fuzzaldrinPlus;

function _load_fuzzaldrinPlus() {
  return _fuzzaldrinPlus = _interopRequireDefault(require('fuzzaldrin-plus'));
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _range;

function _load_range() {
  return _range = require('nuclide-commons-atom/range');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _AutocompleteCacher;

function _load_AutocompleteCacher() {
  return _AutocompleteCacher = _interopRequireDefault(require('../../commons-atom/AutocompleteCacher'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AutocompleteProvider {

  constructor(name, selector, inclusionPriority, suggestionPriority, disableForSelector, excludeLowerPriority, analyticsEventName, onDidInsertSuggestion, onDidInsertSuggestionAnalyticsEventName, autocompleteCacherConfig, connectionToLanguageService) {
    this.name = name;
    this.selector = selector;
    this.inclusionPriority = inclusionPriority;
    this.suggestionPriority = suggestionPriority;
    this.disableForSelector = disableForSelector;
    this.excludeLowerPriority = excludeLowerPriority;
    this._analyticsEventName = analyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;

    if (autocompleteCacherConfig != null) {
      this._autocompleteCacher = new (_AutocompleteCacher || _load_AutocompleteCacher()).default(request => this._getSuggestionsFromLanguageService(request), autocompleteCacherConfig);
    }

    this._onDidInsertSuggestion = onDidInsertSuggestion;

    this.onDidInsertSuggestion = arg => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)(onDidInsertSuggestionAnalyticsEventName);
      if (this._onDidInsertSuggestion != null) {
        this._onDidInsertSuggestion(arg);
      }
    };
  }

  static register(name, grammars, config, onDidInsertSuggestion, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('autocomplete.provider', config.version, new AutocompleteProvider(name, grammars.map(grammar => '.' + grammar).join(', '), config.inclusionPriority, config.suggestionPriority, config.disableForSelector, config.excludeLowerPriority, config.analyticsEventName, onDidInsertSuggestion, config.onDidInsertSuggestionAnalyticsEventName, config.autocompleteCacherConfig, connectionToLanguageService));
  }

  getSuggestions(request) {
    var _this = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._analyticsEventName, (0, _asyncToGenerator.default)(function* () {
      let result;
      if (_this._autocompleteCacher != null) {
        result = yield _this._autocompleteCacher.getSuggestions(request);
      } else {
        result = yield _this._getSuggestionsFromLanguageService(request);
      }
      return result != null ? result.items : null;
    }));
  }

  _getSuggestionsFromLanguageService(request) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { editor, activatedManually, prefix } = request;
      // TODO(ljw): the following line uses the position of the cursor --
      // shouldn't it be using request.bufferPosition instead?
      const position = editor.getLastCursor().getBufferPosition();

      // In case of automatic requests, we'd like to know what character triggered
      // the autocomplete request. That information isn't provided to us, so the
      // best we can do is find the character to the left of the position.
      let triggerCharacter;
      if (activatedManually != null && activatedManually) {
        triggerCharacter = null;
      } else if (position.column === 0) {
        triggerCharacter = '\n';
      } else {
        const range = new (_simpleTextBuffer || _load_simpleTextBuffer()).Range([position.row, position.column - 1], position);
        triggerCharacter = editor.getTextInBufferRange(range);
      }

      // 'prefix' has to do with what's replaced when the user accepts an
      // autocomplete suggestion. It's based on the current word. For instance,
      //  '$c|'      => suggestion '$compare'  => hopefully replace '$c'
      //  'Vec\com|' => suggestion 'compare'   => hopefully replace 'com'
      // The way autocomplete works is: the language service might say what prefix
      // its suggestion will replace; and if it doesn't, then autocomplete will
      // replace whatever prefix was part of the 'request' object.
      //
      // Atom has its own way of computing the current word (to support gestures
      // like cursor-past-word). It bases this on 'editor.nonWordCharacters', by
      // default roughly [a-zA-Z0-9_]. But language packages can and do override
      // this -- e.g. PHP allows '$' in identifiers.
      //
      // Autocomplete doesn't use Atom's technique (I suspect because the html and
      // css and xml packages never bothered overriding it). Instead autocomplete
      // has its own regex, roughly the same but allowing '-' as well. It uses
      // this to populate 'prefix'.
      //
      // Autocomplete's suggestion is wrong for languages like PHP which have
      // their own regex, is right for languages like HTML which should but don't,
      // and is wrong for languages like Java which don't provide their own
      // regex and which don't allow hyphens.
      //
      // What we'll do is work around this mess right here as best we can:
      // if the language-package provides its own regex which gives a different
      // prefix from Autocomplete's, then we'll suggest that to the language
      // service, and we'll patch the output of the language service to reflect
      // this.

      let langSpecificPrefix = prefix;
      const defaultWordRules = editor.getNonWordCharacters();
      const scope = editor.scopeDescriptorForBufferPosition(position);
      const langWordRules = editor.getNonWordCharacters(scope); // {scope} ?
      if (defaultWordRules !== langWordRules) {
        langSpecificPrefix = findAtomWordPrefix(editor, position);
      }

      const path = editor.getPath();
      const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);

      const languageService = _this2._connectionToLanguageService.getForUri(path);
      if (languageService == null || fileVersion == null) {
        return { isIncomplete: false, items: [] };
      }

      const results = yield (yield languageService).getAutocompleteSuggestions(fileVersion, position, {
        activatedManually: activatedManually == null ? false : activatedManually,
        triggerCharacter,
        prefix: langSpecificPrefix
      });

      // Here's where we patch up the prefix in the results, if necessary
      if (langSpecificPrefix !== prefix && results != null) {
        results.items = results.items.map(function (c) {
          return c.replacementPrefix == null ? Object.assign({ replacementPrefix: langSpecificPrefix }, c) : c;
        });
      }
      return results;
    })();
  }
}

exports.AutocompleteProvider = AutocompleteProvider; /**
                                                      * Copyright (c) 2015-present, Facebook, Inc.
                                                      * All rights reserved.
                                                      *
                                                      * This source code is licensed under the license found in the LICENSE file in
                                                      * the root directory of this source tree.
                                                      *
                                                      * 
                                                      * @format
                                                      */

function findAtomWordPrefix(editor, position) {
  const positionOneCharBefore = new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(position.row, Math.max(0, position.column - 1));
  const match = (0, (_range || _load_range()).wordAtPosition)(editor, positionOneCharBefore, {
    includeNonWordCharacters: false
  });
  if (match == null) {
    return '';
  } else {
    return editor.getTextInBufferRange(new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(match.range.start, position));
  }
}

function padEnd(s, targetLength, padString) {
  const padLength = Math.max(targetLength - s.length, 0);
  return s + padString.repeat(padLength);
}

function updateAutocompleteResults(request, firstResult) {
  if (firstResult.isIncomplete) {
    return null;
  }
  return updateAutocompleteFirstResults(request, firstResult);
}

function updateAutocompleteFirstResults(request, firstResult) {
  // This function is sometimes called because the user invoked autocomplete
  // manually, e.g. pressing ctrl+space at "x.|" or "x.f|". Or it's invoked
  // from updateAutocompleteResults because there was it had previously
  // been invoked, and then the user typed more characters. In both cases
  // the behavior is the same...

  // Our objective is to provide a filtered list of results which [1] are
  // filtered to only those results whose 'filterText' matches the user's
  // typeahead (i.e. 'prefix'), [2] sorted according to a score of how
  // well their 'filterText' matches the user's typeahead, and [3] within groups
  // of equivalently-scored suggestions, sorted according to 'sortText'.
  const prefix = findAtomWordPrefix(request.editor, request.bufferPosition);

  // Step [1]: filter based on the user's typeahead. Users love typing just a
  // few characters and having it match camelHumps or similar. SublimeText and
  // VSCode and the other major IDEs do this too. It's a gnarly dynamic-
  // programming problem so we're happy to leave it to the third-party library
  // fuzzaldrinPlus. Except: fuzzaldrinPlus by default sorts shorter suggestions
  // ahead of longer ones, e.g. for typeahead 'g' it scores 'genZoo' higher than
  // 'genAlpha'. Our only way to defeat that is by artificially padding out the
  // filter text to 40 characters. (That's an arbitrary hack, but good enough,
  // and cheaper than doing one pass to for max-length and another to pad).
  //
  // While we're here, for sake of AutocompletePlus, each item also needs its
  // 'replacementPrefix' updated, because that's what AutcompletePlus uses to
  // to decide which characters to replace in the editor buffer.
  //
  // This 'reduce' takes ~25ms for 1000 items, largely in the scoring. The rest
  // of the function takes negligible time.

  const items = [];
  for (const item of firstResult.items) {
    // flowlint-next-line sketchy-null-string:off
    const text = item.displayText || item.snippet || item.text || '';
    // flowlint-next-line sketchy-null-string:off
    const filterText = padEnd(item.filterText || text, 40, ' ');
    // If no prefix, then include all items and avoid doing work to score.
    const filterScore = prefix === '' ? 1 : (_fuzzaldrinPlus || _load_fuzzaldrinPlus()).default.score(filterText, prefix);
    // Score of 0 means the item fails the filter.
    if (filterScore === 0) {
      continue;
    }
    const completion = Object.assign({}, item, {
      replacementPrefix: prefix,
      // flowlint-next-line sketchy-null-string:off
      sortText: item.sortText || text
    });
    items.push({ filterScore, completion });
  }

  // Step [2+3]: sort by filterScore, and within that by sortText. We do a sort
  // that's basically alphabetical/ascii except that (like VisualStudio) we sort
  // underscore at the end rather than the start, to reflect the common cross-
  // language idiom that underscore functions are "lesser".
  items.sort((itemA, itemB) => {
    if (itemA.filterScore < itemB.filterScore) {
      return 1;
    } else if (itemA.filterScore > itemB.filterScore) {
      return -1;
    } else {
      const a = itemA.completion.sortText;
      const b = itemB.completion.sortText;

      if (!(a != null && b != null)) {
        throw new Error('Invariant violation: "a != null && b != null"');
      }

      if (a.startsWith('_') === b.startsWith('_')) {
        return a.localeCompare(b);
      } else if (a.startsWith('_')) {
        return 1;
      } else {
        return -1;
      }
    }
  });

  return Object.assign({}, firstResult, { items: items.map(item => item.completion) });
}