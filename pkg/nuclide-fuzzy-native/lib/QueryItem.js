Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var NON_UPPERCASE_CHARS_REGEXP = /[^a-z0-9]/g;
/**
 * Returns the score of the common subsequence between `needle` and `haystack` or -1 if there is
 * no common subsequence.
 * A lower number means `needle` is more relevant to `haystack`.
 */
function scoreCommonSubsequence(needle, haystack) {
  haystack = haystack.toLowerCase();
  haystack = haystack.replace(NON_UPPERCASE_CHARS_REGEXP, '');
  if (needle.length === haystack.length) {
    return needle === haystack ? 0 : -1;
  }

  var needleIndex = 0;
  var haystackIndex = 0;
  var score = 0;
  var inGap = false;

  while (needleIndex < needle.length && haystackIndex < haystack.length) {
    if (needle[needleIndex] === haystack[haystackIndex]) {
      needleIndex++;
      haystackIndex++;
      inGap = false;
    } else {
      haystackIndex++;
      score += inGap ? 2 : 20;
      inGap = true;
    }
  }
  if (needleIndex >= needle.length) {
    return score + haystack.length + haystackIndex;
  }
  return -1;
}

var NOT_CAPITAL_LETTERS_REGEXP = /[^A-Z]/g;
/**
 * Checks if `needle` matches exactly the first character followed by all uppercase letters in
 * `haystack`.  E.g. 'fbide' matches 'FaceBookIntegratedDevelopmentEnvironment' and
 *                                   'faceBookIntegratedDevelopmentEnvironment'.
 */
function checkIfMatchesCamelCaseLetters(needle, haystack) {
  var uppercase = haystack.substring(0, 1) + haystack.substring(1).replace(NOT_CAPITAL_LETTERS_REGEXP, '');
  return needle.toLowerCase() === uppercase.toLowerCase();
}

var CAPITAL_LETTERS_REGEXP = /[A-Z]/;
var IMPORTANT_DELIMITERS_REGEXP = /[_\-.]/;
function isLetterImportant(index, name) {
  if (index <= 1) {
    return true;
  }
  if (CAPITAL_LETTERS_REGEXP.test(name[index])) {
    return true;
  }
  var previousCharacter = name[index - 1];
  if (IMPORTANT_DELIMITERS_REGEXP.test(previousCharacter)) {
    return true;
  }
  return false;
}
/**
 * FBIDE indexes each filepath by important characters it contains.
 * This is a temporary workaround that allow calculating important characters on the fly rather
 * than relying on the index. Once the index is implemented, consumers of this need to be updated.
 */
// TODO(jxg): replace with "important characters" index.
function importantCharactersForString(str) {
  var importantCharacters = new Set();
  for (var index = 0; index < str.length; index++) {
    var char = str[index];
    if (!importantCharacters.has(char) && isLetterImportant(index, str)) {
      importantCharacters.add(char);
    }
  }
  return importantCharacters;
}

var __test__ = {
  checkIfMatchesCamelCaseLetters: checkIfMatchesCamelCaseLetters,
  isLetterImportant: isLetterImportant,
  importantCharactersForString: importantCharactersForString,
  scoreCommonSubsequence: scoreCommonSubsequence
};

exports.__test__ = __test__;

var QueryItem = (function () {
  function QueryItem(filepath) {
    _classCallCheck(this, QueryItem);

    this._filepath = filepath;
    this._filepathLowercase = filepath.toLowerCase();
    this._filename = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(this._filepathLowercase);
    this._importantCharacters = importantCharactersForString(this._filename);
  }

  /**
   * Scores this object's string against the query given.
   *
   * To search:
   * a.) Cut the first letter off the query
   * b.) Lookup the list of terms which contain that letter (we indexed it earlier)
   * c.) Compare our query against each term in that list
   * d.) If our query is a common subsequence of one of the terms, add it to the results list
   * e.) While we compare our query, we keep track of a score:
   *     i.) The more gaps there are between matching characters, the higher the score
   *     ii.) The more letters which are the incorrect case, the higher the score
   *     iii.) Direct matches have a score of 0.
   *     iv.) The later we find out that we've matched, the higher the score
   *     v.) Longer terms have higher scores
   *     - The more your query is spreads out across the result,
   *       the less likely it is what you're looking for.
   *     - The shorter the result, the closer the length is to what you searched for,
   *       so it's more likely.
   *     - The earlier we find the match, the more likely it is to be what you're looking for.
   *     - The more cases of the characters that match, the more likely it is to be what you want.
   * f.) Sort the results by the score
   */

  _createClass(QueryItem, [{
    key: 'score',
    value: function score(query) {
      var score = this._getScoreFor(query);
      return score == null ? null : { score: score, value: this._filepath, matchIndexes: [] };
    }
  }, {
    key: '_getScoreFor',
    value: function _getScoreFor(query) {
      // Purely defensive, as query is guaranteed to be non-empty.
      if (query.length === 0) {
        return null;
      }
      // Check if this a "possible result".
      // TODO consider building a directory-level index from important_character -> QueryItem,
      // akin to FBIDE's implementation.
      var firstChar = query[0].toLowerCase();
      if (!this._importantCharacters.has(firstChar)) {
        return null;
      }
      if (query.length >= 3 && checkIfMatchesCamelCaseLetters(query, this._filename)) {
        // If we match the uppercase characters of the filename, we should be ranked the highest
        return 0;
      } else {
        var sub = this._filepathLowercase.indexOf(query.toLowerCase());
        if (sub !== -1 && query.length < this._filename.length) {
          /**
           * We add the length of the term so we can be ranked alongside the
           * scores generated by `scoreCommonSubsequence` which also factors in the
           * length.
           * This way when you search for `EdisonController`,
           * EdisonController scores 0
           * EdixxsonController scores 40 (from `scoreCommonSubsequence` scoring)
           * SomethingBlahBlahEdisonController scores 50 from substring scoring
           * WebDecisionController scores 52 (from `scoreCommonSubsequence` scoring)
           */
          return sub + this._filename.length;
        } else {
          // TODO(jxg): Investigate extending scoreCommonSubsequence to consider subsequences
          // bidirectionally, or use (some proxy for) edit distance.
          var score = scoreCommonSubsequence(query, this._filename);
          if (score !== -1) {
            return score;
          }
        }
      }
      return null;
    }
  }]);

  return QueryItem;
})();

exports.default = QueryItem;