Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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
    this._filename = _path2['default'].basename(this._filepathLowercase);
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

exports['default'] = QueryItem;
//# sourceMappingURL=data:application/json;base64,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QyxDQUFDO0tBQ2hGOzs7V0FFVyxzQkFBQyxLQUFhLEVBQVc7O0FBRW5DLFVBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDdEIsZUFBTyxJQUFJLENBQUM7T0FDYjs7OztBQUlELFVBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN6QyxVQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUM3QyxlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsVUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSw4QkFBOEIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFOztBQUU5RSxlQUFPLENBQUMsQ0FBQztPQUNWLE1BQU07QUFDTCxZQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQ2pFLFlBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7Ozs7Ozs7Ozs7O0FBV3RELGlCQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztTQUNwQyxNQUFNOzs7QUFHTCxjQUFNLEtBQUssR0FBRyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzVELGNBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ2hCLG1CQUFPLEtBQUssQ0FBQztXQUNkO1NBQ0Y7T0FDRjtBQUNELGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztTQS9Fa0IsU0FBUzs7O3FCQUFULFNBQVMiLCJmaWxlIjoiUXVlcnlJdGVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB0eXBlIHtRdWVyeVNjb3JlfSBmcm9tICcuL1F1ZXJ5U2NvcmUnO1xuXG5jb25zdCBOT05fVVBQRVJDQVNFX0NIQVJTX1JFR0VYUCA9IC9bXmEtejAtOV0vZztcbi8qKlxuICogUmV0dXJucyB0aGUgc2NvcmUgb2YgdGhlIGNvbW1vbiBzdWJzZXF1ZW5jZSBiZXR3ZWVuIGBuZWVkbGVgIGFuZCBgaGF5c3RhY2tgIG9yIC0xIGlmIHRoZXJlIGlzXG4gKiBubyBjb21tb24gc3Vic2VxdWVuY2UuXG4gKiBBIGxvd2VyIG51bWJlciBtZWFucyBgbmVlZGxlYCBpcyBtb3JlIHJlbGV2YW50IHRvIGBoYXlzdGFja2AuXG4gKi9cbmZ1bmN0aW9uIHNjb3JlQ29tbW9uU3Vic2VxdWVuY2UobmVlZGxlOiBzdHJpbmcsIGhheXN0YWNrOiBzdHJpbmcpOiBudW1iZXIge1xuICBoYXlzdGFjayA9IGhheXN0YWNrLnRvTG93ZXJDYXNlKCk7XG4gIGhheXN0YWNrID0gaGF5c3RhY2sucmVwbGFjZShOT05fVVBQRVJDQVNFX0NIQVJTX1JFR0VYUCwgJycpO1xuICBpZiAobmVlZGxlLmxlbmd0aCA9PT0gaGF5c3RhY2subGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5lZWRsZSA9PT0gaGF5c3RhY2sgPyAwIDogLTE7XG4gIH1cblxuICBsZXQgbmVlZGxlSW5kZXg6IG51bWJlciA9IDA7XG4gIGxldCBoYXlzdGFja0luZGV4OiBudW1iZXIgPSAwO1xuICBsZXQgc2NvcmU6IG51bWJlciA9IDA7XG4gIGxldCBpbkdhcDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHdoaWxlIChuZWVkbGVJbmRleCA8IG5lZWRsZS5sZW5ndGggJiYgaGF5c3RhY2tJbmRleCA8IGhheXN0YWNrLmxlbmd0aCkge1xuICAgIGlmIChuZWVkbGVbbmVlZGxlSW5kZXhdID09PSBoYXlzdGFja1toYXlzdGFja0luZGV4XSkge1xuICAgICAgbmVlZGxlSW5kZXgrKztcbiAgICAgIGhheXN0YWNrSW5kZXgrKztcbiAgICAgIGluR2FwID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhheXN0YWNrSW5kZXgrKztcbiAgICAgIHNjb3JlICs9IChpbkdhcCA/IDIgOiAyMCk7XG4gICAgICBpbkdhcCA9IHRydWU7XG4gICAgfVxuICB9XG4gIGlmIChuZWVkbGVJbmRleCA+PSBuZWVkbGUubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHNjb3JlICsgaGF5c3RhY2subGVuZ3RoICsgaGF5c3RhY2tJbmRleDtcbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbmNvbnN0IE5PVF9DQVBJVEFMX0xFVFRFUlNfUkVHRVhQID0gL1teQS1aXS9nO1xuLyoqXG4gKiBDaGVja3MgaWYgYG5lZWRsZWAgbWF0Y2hlcyBleGFjdGx5IHRoZSBmaXJzdCBjaGFyYWN0ZXIgZm9sbG93ZWQgYnkgYWxsIHVwcGVyY2FzZSBsZXR0ZXJzIGluXG4gKiBgaGF5c3RhY2tgLiAgRS5nLiAnZmJpZGUnIG1hdGNoZXMgJ0ZhY2VCb29rSW50ZWdyYXRlZERldmVsb3BtZW50RW52aXJvbm1lbnQnIGFuZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmYWNlQm9va0ludGVncmF0ZWREZXZlbG9wbWVudEVudmlyb25tZW50Jy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tJZk1hdGNoZXNDYW1lbENhc2VMZXR0ZXJzKG5lZWRsZTogc3RyaW5nLCBoYXlzdGFjazogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IHVwcGVyY2FzZSA9IGhheXN0YWNrLnN1YnN0cmluZygwLCAxKSArXG4gICAgaGF5c3RhY2suc3Vic3RyaW5nKDEpLnJlcGxhY2UoTk9UX0NBUElUQUxfTEVUVEVSU19SRUdFWFAsICcnKTtcbiAgcmV0dXJuIG5lZWRsZS50b0xvd2VyQ2FzZSgpID09PSB1cHBlcmNhc2UudG9Mb3dlckNhc2UoKTtcbn1cblxuY29uc3QgQ0FQSVRBTF9MRVRURVJTX1JFR0VYUCA9IC9bQS1aXS87XG5jb25zdCBJTVBPUlRBTlRfREVMSU1JVEVSU19SRUdFWFAgPSAvW19cXC0uXS87XG5mdW5jdGlvbiBpc0xldHRlckltcG9ydGFudChpbmRleDogbnVtYmVyLCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKGluZGV4IDw9IDEpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoQ0FQSVRBTF9MRVRURVJTX1JFR0VYUC50ZXN0KG5hbWVbaW5kZXhdKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGNvbnN0IHByZXZpb3VzQ2hhcmFjdGVyID0gbmFtZVtpbmRleCAtIDFdO1xuICBpZiAoSU1QT1JUQU5UX0RFTElNSVRFUlNfUkVHRVhQLnRlc3QocHJldmlvdXNDaGFyYWN0ZXIpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuLyoqXG4gKiBGQklERSBpbmRleGVzIGVhY2ggZmlsZXBhdGggYnkgaW1wb3J0YW50IGNoYXJhY3RlcnMgaXQgY29udGFpbnMuXG4gKiBUaGlzIGlzIGEgdGVtcG9yYXJ5IHdvcmthcm91bmQgdGhhdCBhbGxvdyBjYWxjdWxhdGluZyBpbXBvcnRhbnQgY2hhcmFjdGVycyBvbiB0aGUgZmx5IHJhdGhlclxuICogdGhhbiByZWx5aW5nIG9uIHRoZSBpbmRleC4gT25jZSB0aGUgaW5kZXggaXMgaW1wbGVtZW50ZWQsIGNvbnN1bWVycyBvZiB0aGlzIG5lZWQgdG8gYmUgdXBkYXRlZC5cbiAqL1xuLy8gVE9ETyhqeGcpOiByZXBsYWNlIHdpdGggXCJpbXBvcnRhbnQgY2hhcmFjdGVyc1wiIGluZGV4LlxuZnVuY3Rpb24gaW1wb3J0YW50Q2hhcmFjdGVyc0ZvclN0cmluZyhzdHI6IHN0cmluZyk6IFNldDxzdHJpbmc+IHtcbiAgY29uc3QgaW1wb3J0YW50Q2hhcmFjdGVycyA9IG5ldyBTZXQoKTtcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHN0ci5sZW5ndGg7IGluZGV4KyspIHtcbiAgICBjb25zdCBjaGFyID0gc3RyW2luZGV4XTtcbiAgICBpZiAoXG4gICAgICAhaW1wb3J0YW50Q2hhcmFjdGVycy5oYXMoY2hhcikgJiZcbiAgICAgIGlzTGV0dGVySW1wb3J0YW50KGluZGV4LCBzdHIpXG4gICAgKSB7XG4gICAgICBpbXBvcnRhbnRDaGFyYWN0ZXJzLmFkZChjaGFyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGltcG9ydGFudENoYXJhY3RlcnM7XG59XG5cbmV4cG9ydCBjb25zdCBfX3Rlc3RfXyA9IHtcbiAgY2hlY2tJZk1hdGNoZXNDYW1lbENhc2VMZXR0ZXJzLFxuICBpc0xldHRlckltcG9ydGFudCxcbiAgaW1wb3J0YW50Q2hhcmFjdGVyc0ZvclN0cmluZyxcbiAgc2NvcmVDb21tb25TdWJzZXF1ZW5jZSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1ZXJ5SXRlbSB7XG4gIF9maWxlcGF0aDogc3RyaW5nO1xuICBfZmlsZXBhdGhMb3dlcmNhc2U6IHN0cmluZztcbiAgX2ZpbGVuYW1lOiBzdHJpbmc7XG4gIF9pbXBvcnRhbnRDaGFyYWN0ZXJzOiBTZXQ8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihmaWxlcGF0aDogc3RyaW5nKSB7XG4gICAgdGhpcy5fZmlsZXBhdGggPSBmaWxlcGF0aDtcbiAgICB0aGlzLl9maWxlcGF0aExvd2VyY2FzZSA9IGZpbGVwYXRoLnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5fZmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKHRoaXMuX2ZpbGVwYXRoTG93ZXJjYXNlKTtcbiAgICB0aGlzLl9pbXBvcnRhbnRDaGFyYWN0ZXJzID0gaW1wb3J0YW50Q2hhcmFjdGVyc0ZvclN0cmluZyh0aGlzLl9maWxlbmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogU2NvcmVzIHRoaXMgb2JqZWN0J3Mgc3RyaW5nIGFnYWluc3QgdGhlIHF1ZXJ5IGdpdmVuLlxuICAgKlxuICAgKiBUbyBzZWFyY2g6XG4gICAqIGEuKSBDdXQgdGhlIGZpcnN0IGxldHRlciBvZmYgdGhlIHF1ZXJ5XG4gICAqIGIuKSBMb29rdXAgdGhlIGxpc3Qgb2YgdGVybXMgd2hpY2ggY29udGFpbiB0aGF0IGxldHRlciAod2UgaW5kZXhlZCBpdCBlYXJsaWVyKVxuICAgKiBjLikgQ29tcGFyZSBvdXIgcXVlcnkgYWdhaW5zdCBlYWNoIHRlcm0gaW4gdGhhdCBsaXN0XG4gICAqIGQuKSBJZiBvdXIgcXVlcnkgaXMgYSBjb21tb24gc3Vic2VxdWVuY2Ugb2Ygb25lIG9mIHRoZSB0ZXJtcywgYWRkIGl0IHRvIHRoZSByZXN1bHRzIGxpc3RcbiAgICogZS4pIFdoaWxlIHdlIGNvbXBhcmUgb3VyIHF1ZXJ5LCB3ZSBrZWVwIHRyYWNrIG9mIGEgc2NvcmU6XG4gICAqICAgICBpLikgVGhlIG1vcmUgZ2FwcyB0aGVyZSBhcmUgYmV0d2VlbiBtYXRjaGluZyBjaGFyYWN0ZXJzLCB0aGUgaGlnaGVyIHRoZSBzY29yZVxuICAgKiAgICAgaWkuKSBUaGUgbW9yZSBsZXR0ZXJzIHdoaWNoIGFyZSB0aGUgaW5jb3JyZWN0IGNhc2UsIHRoZSBoaWdoZXIgdGhlIHNjb3JlXG4gICAqICAgICBpaWkuKSBEaXJlY3QgbWF0Y2hlcyBoYXZlIGEgc2NvcmUgb2YgMC5cbiAgICogICAgIGl2LikgVGhlIGxhdGVyIHdlIGZpbmQgb3V0IHRoYXQgd2UndmUgbWF0Y2hlZCwgdGhlIGhpZ2hlciB0aGUgc2NvcmVcbiAgICogICAgIHYuKSBMb25nZXIgdGVybXMgaGF2ZSBoaWdoZXIgc2NvcmVzXG4gICAqICAgICAtIFRoZSBtb3JlIHlvdXIgcXVlcnkgaXMgc3ByZWFkcyBvdXQgYWNyb3NzIHRoZSByZXN1bHQsXG4gICAqICAgICAgIHRoZSBsZXNzIGxpa2VseSBpdCBpcyB3aGF0IHlvdSdyZSBsb29raW5nIGZvci5cbiAgICogICAgIC0gVGhlIHNob3J0ZXIgdGhlIHJlc3VsdCwgdGhlIGNsb3NlciB0aGUgbGVuZ3RoIGlzIHRvIHdoYXQgeW91IHNlYXJjaGVkIGZvcixcbiAgICogICAgICAgc28gaXQncyBtb3JlIGxpa2VseS5cbiAgICogICAgIC0gVGhlIGVhcmxpZXIgd2UgZmluZCB0aGUgbWF0Y2gsIHRoZSBtb3JlIGxpa2VseSBpdCBpcyB0byBiZSB3aGF0IHlvdSdyZSBsb29raW5nIGZvci5cbiAgICogICAgIC0gVGhlIG1vcmUgY2FzZXMgb2YgdGhlIGNoYXJhY3RlcnMgdGhhdCBtYXRjaCwgdGhlIG1vcmUgbGlrZWx5IGl0IGlzIHRvIGJlIHdoYXQgeW91IHdhbnQuXG4gICAqIGYuKSBTb3J0IHRoZSByZXN1bHRzIGJ5IHRoZSBzY29yZVxuICAgKi9cbiAgc2NvcmUocXVlcnk6IHN0cmluZyk6ID9RdWVyeVNjb3JlIHtcbiAgICBjb25zdCBzY29yZSA9IHRoaXMuX2dldFNjb3JlRm9yKHF1ZXJ5KTtcbiAgICByZXR1cm4gc2NvcmUgPT0gbnVsbCA/IG51bGwgOiB7c2NvcmUsIHZhbHVlOiB0aGlzLl9maWxlcGF0aCwgbWF0Y2hJbmRleGVzOiBbXX07XG4gIH1cblxuICBfZ2V0U2NvcmVGb3IocXVlcnk6IHN0cmluZyk6ID9udW1iZXIge1xuICAgIC8vIFB1cmVseSBkZWZlbnNpdmUsIGFzIHF1ZXJ5IGlzIGd1YXJhbnRlZWQgdG8gYmUgbm9uLWVtcHR5LlxuICAgIGlmIChxdWVyeS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyBDaGVjayBpZiB0aGlzIGEgXCJwb3NzaWJsZSByZXN1bHRcIi5cbiAgICAvLyBUT0RPIGNvbnNpZGVyIGJ1aWxkaW5nIGEgZGlyZWN0b3J5LWxldmVsIGluZGV4IGZyb20gaW1wb3J0YW50X2NoYXJhY3RlciAtPiBRdWVyeUl0ZW0sXG4gICAgLy8gYWtpbiB0byBGQklERSdzIGltcGxlbWVudGF0aW9uLlxuICAgIGNvbnN0IGZpcnN0Q2hhciA9IHF1ZXJ5WzBdLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKCF0aGlzLl9pbXBvcnRhbnRDaGFyYWN0ZXJzLmhhcyhmaXJzdENoYXIpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHF1ZXJ5Lmxlbmd0aCA+PSAzICYmIGNoZWNrSWZNYXRjaGVzQ2FtZWxDYXNlTGV0dGVycyhxdWVyeSwgdGhpcy5fZmlsZW5hbWUpKSB7XG4gICAgICAvLyBJZiB3ZSBtYXRjaCB0aGUgdXBwZXJjYXNlIGNoYXJhY3RlcnMgb2YgdGhlIGZpbGVuYW1lLCB3ZSBzaG91bGQgYmUgcmFua2VkIHRoZSBoaWdoZXN0XG4gICAgICByZXR1cm4gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc3ViID0gdGhpcy5fZmlsZXBhdGhMb3dlcmNhc2UuaW5kZXhPZihxdWVyeS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgIGlmIChzdWIgIT09IC0xICYmIHF1ZXJ5Lmxlbmd0aCA8IHRoaXMuX2ZpbGVuYW1lLmxlbmd0aCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogV2UgYWRkIHRoZSBsZW5ndGggb2YgdGhlIHRlcm0gc28gd2UgY2FuIGJlIHJhbmtlZCBhbG9uZ3NpZGUgdGhlXG4gICAgICAgICAqIHNjb3JlcyBnZW5lcmF0ZWQgYnkgYHNjb3JlQ29tbW9uU3Vic2VxdWVuY2VgIHdoaWNoIGFsc28gZmFjdG9ycyBpbiB0aGVcbiAgICAgICAgICogbGVuZ3RoLlxuICAgICAgICAgKiBUaGlzIHdheSB3aGVuIHlvdSBzZWFyY2ggZm9yIGBFZGlzb25Db250cm9sbGVyYCxcbiAgICAgICAgICogRWRpc29uQ29udHJvbGxlciBzY29yZXMgMFxuICAgICAgICAgKiBFZGl4eHNvbkNvbnRyb2xsZXIgc2NvcmVzIDQwIChmcm9tIGBzY29yZUNvbW1vblN1YnNlcXVlbmNlYCBzY29yaW5nKVxuICAgICAgICAgKiBTb21ldGhpbmdCbGFoQmxhaEVkaXNvbkNvbnRyb2xsZXIgc2NvcmVzIDUwIGZyb20gc3Vic3RyaW5nIHNjb3JpbmdcbiAgICAgICAgICogV2ViRGVjaXNpb25Db250cm9sbGVyIHNjb3JlcyA1MiAoZnJvbSBgc2NvcmVDb21tb25TdWJzZXF1ZW5jZWAgc2NvcmluZylcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiBzdWIgKyB0aGlzLl9maWxlbmFtZS5sZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUT0RPKGp4Zyk6IEludmVzdGlnYXRlIGV4dGVuZGluZyBzY29yZUNvbW1vblN1YnNlcXVlbmNlIHRvIGNvbnNpZGVyIHN1YnNlcXVlbmNlc1xuICAgICAgICAvLyBiaWRpcmVjdGlvbmFsbHksIG9yIHVzZSAoc29tZSBwcm94eSBmb3IpIGVkaXQgZGlzdGFuY2UuXG4gICAgICAgIGNvbnN0IHNjb3JlID0gc2NvcmVDb21tb25TdWJzZXF1ZW5jZShxdWVyeSwgdGhpcy5fZmlsZW5hbWUpO1xuICAgICAgICBpZiAoc2NvcmUgIT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIHNjb3JlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbn1cbiJdfQ==