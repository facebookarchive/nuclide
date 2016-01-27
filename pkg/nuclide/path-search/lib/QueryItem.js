Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

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
    this._filename = (0, _path.basename)(this._filepathLowercase);
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
//# sourceMappingURL=data:application/json;base64,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O1dBRVcsc0JBQUMsS0FBYSxFQUFXOztBQUVuQyxVQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3RCLGVBQU8sSUFBSSxDQUFDO09BQ2I7Ozs7QUFJRCxVQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDekMsVUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDN0MsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELFVBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksOEJBQThCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTs7QUFFOUUsZUFBTyxDQUFDLENBQUM7T0FDVixNQUFNO0FBQ0wsWUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUNqRSxZQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFOzs7Ozs7Ozs7OztBQVd0RCxpQkFBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7U0FDcEMsTUFBTTs7O0FBR0wsY0FBTSxLQUFLLEdBQUcsc0JBQXNCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM1RCxjQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNoQixtQkFBTyxLQUFLLENBQUM7V0FDZDtTQUNGO09BQ0Y7QUFDRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7U0EvRWtCLFNBQVM7OztxQkFBVCxTQUFTIiwiZmlsZSI6IlF1ZXJ5SXRlbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7YmFzZW5hbWV9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgdHlwZSB7UXVlcnlTY29yZX0gZnJvbSAnLi9RdWVyeVNjb3JlJztcblxuY29uc3QgTk9OX1VQUEVSQ0FTRV9DSEFSU19SRUdFWFAgPSAvW15hLXowLTldL2c7XG4vKipcbiAqIFJldHVybnMgdGhlIHNjb3JlIG9mIHRoZSBjb21tb24gc3Vic2VxdWVuY2UgYmV0d2VlbiBgbmVlZGxlYCBhbmQgYGhheXN0YWNrYCBvciAtMSBpZiB0aGVyZSBpc1xuICogbm8gY29tbW9uIHN1YnNlcXVlbmNlLlxuICogQSBsb3dlciBudW1iZXIgbWVhbnMgYG5lZWRsZWAgaXMgbW9yZSByZWxldmFudCB0byBgaGF5c3RhY2tgLlxuICovXG5mdW5jdGlvbiBzY29yZUNvbW1vblN1YnNlcXVlbmNlKG5lZWRsZTogc3RyaW5nLCBoYXlzdGFjazogc3RyaW5nKTogbnVtYmVyIHtcbiAgaGF5c3RhY2sgPSBoYXlzdGFjay50b0xvd2VyQ2FzZSgpO1xuICBoYXlzdGFjayA9IGhheXN0YWNrLnJlcGxhY2UoTk9OX1VQUEVSQ0FTRV9DSEFSU19SRUdFWFAsICcnKTtcbiAgaWYgKG5lZWRsZS5sZW5ndGggPT09IGhheXN0YWNrLmxlbmd0aCkge1xuICAgIHJldHVybiBuZWVkbGUgPT09IGhheXN0YWNrID8gMCA6IC0xO1xuICB9XG5cbiAgbGV0IG5lZWRsZUluZGV4OiBudW1iZXIgPSAwO1xuICBsZXQgaGF5c3RhY2tJbmRleDogbnVtYmVyID0gMDtcbiAgbGV0IHNjb3JlOiBudW1iZXIgPSAwO1xuICBsZXQgaW5HYXA6IGJvb2xlYW4gPSBmYWxzZTtcblxuICB3aGlsZSAobmVlZGxlSW5kZXggPCBuZWVkbGUubGVuZ3RoICYmIGhheXN0YWNrSW5kZXggPCBoYXlzdGFjay5sZW5ndGgpIHtcbiAgICBpZiAobmVlZGxlW25lZWRsZUluZGV4XSA9PT0gaGF5c3RhY2tbaGF5c3RhY2tJbmRleF0pIHtcbiAgICAgIG5lZWRsZUluZGV4Kys7XG4gICAgICBoYXlzdGFja0luZGV4Kys7XG4gICAgICBpbkdhcCA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBoYXlzdGFja0luZGV4Kys7XG4gICAgICBzY29yZSArPSAoaW5HYXAgPyAyIDogMjApO1xuICAgICAgaW5HYXAgPSB0cnVlO1xuICAgIH1cbiAgfVxuICBpZiAobmVlZGxlSW5kZXggPj0gbmVlZGxlLmxlbmd0aCkge1xuICAgIHJldHVybiBzY29yZSArIGhheXN0YWNrLmxlbmd0aCArIGhheXN0YWNrSW5kZXg7XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5jb25zdCBOT1RfQ0FQSVRBTF9MRVRURVJTX1JFR0VYUCA9IC9bXkEtWl0vZztcbi8qKlxuICogQ2hlY2tzIGlmIGBuZWVkbGVgIG1hdGNoZXMgZXhhY3RseSB0aGUgZmlyc3QgY2hhcmFjdGVyIGZvbGxvd2VkIGJ5IGFsbCB1cHBlcmNhc2UgbGV0dGVycyBpblxuICogYGhheXN0YWNrYC4gIEUuZy4gJ2ZiaWRlJyBtYXRjaGVzICdGYWNlQm9va0ludGVncmF0ZWREZXZlbG9wbWVudEVudmlyb25tZW50JyBhbmRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZmFjZUJvb2tJbnRlZ3JhdGVkRGV2ZWxvcG1lbnRFbnZpcm9ubWVudCcuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrSWZNYXRjaGVzQ2FtZWxDYXNlTGV0dGVycyhuZWVkbGU6IHN0cmluZywgaGF5c3RhY2s6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCB1cHBlcmNhc2UgPSBoYXlzdGFjay5zdWJzdHJpbmcoMCwgMSkgK1xuICAgIGhheXN0YWNrLnN1YnN0cmluZygxKS5yZXBsYWNlKE5PVF9DQVBJVEFMX0xFVFRFUlNfUkVHRVhQLCAnJyk7XG4gIHJldHVybiBuZWVkbGUudG9Mb3dlckNhc2UoKSA9PT0gdXBwZXJjYXNlLnRvTG93ZXJDYXNlKCk7XG59XG5cbmNvbnN0IENBUElUQUxfTEVUVEVSU19SRUdFWFAgPSAvW0EtWl0vO1xuY29uc3QgSU1QT1JUQU5UX0RFTElNSVRFUlNfUkVHRVhQID0gL1tfXFwtLl0vO1xuZnVuY3Rpb24gaXNMZXR0ZXJJbXBvcnRhbnQoaW5kZXg6IG51bWJlciwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmIChpbmRleCA8PSAxKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKENBUElUQUxfTEVUVEVSU19SRUdFWFAudGVzdChuYW1lW2luZGV4XSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBjb25zdCBwcmV2aW91c0NoYXJhY3RlciA9IG5hbWVbaW5kZXggLSAxXTtcbiAgaWYgKElNUE9SVEFOVF9ERUxJTUlURVJTX1JFR0VYUC50ZXN0KHByZXZpb3VzQ2hhcmFjdGVyKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbi8qKlxuICogRkJJREUgaW5kZXhlcyBlYWNoIGZpbGVwYXRoIGJ5IGltcG9ydGFudCBjaGFyYWN0ZXJzIGl0IGNvbnRhaW5zLlxuICogVGhpcyBpcyBhIHRlbXBvcmFyeSB3b3JrYXJvdW5kIHRoYXQgYWxsb3cgY2FsY3VsYXRpbmcgaW1wb3J0YW50IGNoYXJhY3RlcnMgb24gdGhlIGZseSByYXRoZXJcbiAqIHRoYW4gcmVseWluZyBvbiB0aGUgaW5kZXguIE9uY2UgdGhlIGluZGV4IGlzIGltcGxlbWVudGVkLCBjb25zdW1lcnMgb2YgdGhpcyBuZWVkIHRvIGJlIHVwZGF0ZWQuXG4gKi9cbi8vIFRPRE8oanhnKTogcmVwbGFjZSB3aXRoIFwiaW1wb3J0YW50IGNoYXJhY3RlcnNcIiBpbmRleC5cbmZ1bmN0aW9uIGltcG9ydGFudENoYXJhY3RlcnNGb3JTdHJpbmcoc3RyOiBzdHJpbmcpOiBTZXQ8c3RyaW5nPiB7XG4gIGNvbnN0IGltcG9ydGFudENoYXJhY3RlcnMgPSBuZXcgU2V0KCk7XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBzdHIubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgY29uc3QgY2hhciA9IHN0cltpbmRleF07XG4gICAgaWYgKFxuICAgICAgIWltcG9ydGFudENoYXJhY3RlcnMuaGFzKGNoYXIpICYmXG4gICAgICBpc0xldHRlckltcG9ydGFudChpbmRleCwgc3RyKVxuICAgICkge1xuICAgICAgaW1wb3J0YW50Q2hhcmFjdGVycy5hZGQoY2hhcik7XG4gICAgfVxuICB9XG4gIHJldHVybiBpbXBvcnRhbnRDaGFyYWN0ZXJzO1xufVxuXG5leHBvcnQgY29uc3QgX190ZXN0X18gPSB7XG4gIGNoZWNrSWZNYXRjaGVzQ2FtZWxDYXNlTGV0dGVycyxcbiAgaXNMZXR0ZXJJbXBvcnRhbnQsXG4gIGltcG9ydGFudENoYXJhY3RlcnNGb3JTdHJpbmcsXG4gIHNjb3JlQ29tbW9uU3Vic2VxdWVuY2UsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRdWVyeUl0ZW0ge1xuICBfZmlsZXBhdGg6IHN0cmluZztcbiAgX2ZpbGVwYXRoTG93ZXJjYXNlOiBzdHJpbmc7XG4gIF9maWxlbmFtZTogc3RyaW5nO1xuICBfaW1wb3J0YW50Q2hhcmFjdGVyczogU2V0PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IoZmlsZXBhdGg6IHN0cmluZykge1xuICAgIHRoaXMuX2ZpbGVwYXRoID0gZmlsZXBhdGg7XG4gICAgdGhpcy5fZmlsZXBhdGhMb3dlcmNhc2UgPSBmaWxlcGF0aC50b0xvd2VyQ2FzZSgpO1xuICAgIHRoaXMuX2ZpbGVuYW1lID0gYmFzZW5hbWUodGhpcy5fZmlsZXBhdGhMb3dlcmNhc2UpO1xuICAgIHRoaXMuX2ltcG9ydGFudENoYXJhY3RlcnMgPSBpbXBvcnRhbnRDaGFyYWN0ZXJzRm9yU3RyaW5nKHRoaXMuX2ZpbGVuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY29yZXMgdGhpcyBvYmplY3QncyBzdHJpbmcgYWdhaW5zdCB0aGUgcXVlcnkgZ2l2ZW4uXG4gICAqXG4gICAqIFRvIHNlYXJjaDpcbiAgICogYS4pIEN1dCB0aGUgZmlyc3QgbGV0dGVyIG9mZiB0aGUgcXVlcnlcbiAgICogYi4pIExvb2t1cCB0aGUgbGlzdCBvZiB0ZXJtcyB3aGljaCBjb250YWluIHRoYXQgbGV0dGVyICh3ZSBpbmRleGVkIGl0IGVhcmxpZXIpXG4gICAqIGMuKSBDb21wYXJlIG91ciBxdWVyeSBhZ2FpbnN0IGVhY2ggdGVybSBpbiB0aGF0IGxpc3RcbiAgICogZC4pIElmIG91ciBxdWVyeSBpcyBhIGNvbW1vbiBzdWJzZXF1ZW5jZSBvZiBvbmUgb2YgdGhlIHRlcm1zLCBhZGQgaXQgdG8gdGhlIHJlc3VsdHMgbGlzdFxuICAgKiBlLikgV2hpbGUgd2UgY29tcGFyZSBvdXIgcXVlcnksIHdlIGtlZXAgdHJhY2sgb2YgYSBzY29yZTpcbiAgICogICAgIGkuKSBUaGUgbW9yZSBnYXBzIHRoZXJlIGFyZSBiZXR3ZWVuIG1hdGNoaW5nIGNoYXJhY3RlcnMsIHRoZSBoaWdoZXIgdGhlIHNjb3JlXG4gICAqICAgICBpaS4pIFRoZSBtb3JlIGxldHRlcnMgd2hpY2ggYXJlIHRoZSBpbmNvcnJlY3QgY2FzZSwgdGhlIGhpZ2hlciB0aGUgc2NvcmVcbiAgICogICAgIGlpaS4pIERpcmVjdCBtYXRjaGVzIGhhdmUgYSBzY29yZSBvZiAwLlxuICAgKiAgICAgaXYuKSBUaGUgbGF0ZXIgd2UgZmluZCBvdXQgdGhhdCB3ZSd2ZSBtYXRjaGVkLCB0aGUgaGlnaGVyIHRoZSBzY29yZVxuICAgKiAgICAgdi4pIExvbmdlciB0ZXJtcyBoYXZlIGhpZ2hlciBzY29yZXNcbiAgICogICAgIC0gVGhlIG1vcmUgeW91ciBxdWVyeSBpcyBzcHJlYWRzIG91dCBhY3Jvc3MgdGhlIHJlc3VsdCxcbiAgICogICAgICAgdGhlIGxlc3MgbGlrZWx5IGl0IGlzIHdoYXQgeW91J3JlIGxvb2tpbmcgZm9yLlxuICAgKiAgICAgLSBUaGUgc2hvcnRlciB0aGUgcmVzdWx0LCB0aGUgY2xvc2VyIHRoZSBsZW5ndGggaXMgdG8gd2hhdCB5b3Ugc2VhcmNoZWQgZm9yLFxuICAgKiAgICAgICBzbyBpdCdzIG1vcmUgbGlrZWx5LlxuICAgKiAgICAgLSBUaGUgZWFybGllciB3ZSBmaW5kIHRoZSBtYXRjaCwgdGhlIG1vcmUgbGlrZWx5IGl0IGlzIHRvIGJlIHdoYXQgeW91J3JlIGxvb2tpbmcgZm9yLlxuICAgKiAgICAgLSBUaGUgbW9yZSBjYXNlcyBvZiB0aGUgY2hhcmFjdGVycyB0aGF0IG1hdGNoLCB0aGUgbW9yZSBsaWtlbHkgaXQgaXMgdG8gYmUgd2hhdCB5b3Ugd2FudC5cbiAgICogZi4pIFNvcnQgdGhlIHJlc3VsdHMgYnkgdGhlIHNjb3JlXG4gICAqL1xuICBzY29yZShxdWVyeTogc3RyaW5nKTogP1F1ZXJ5U2NvcmUge1xuICAgIGNvbnN0IHNjb3JlID0gdGhpcy5fZ2V0U2NvcmVGb3IocXVlcnkpO1xuICAgIHJldHVybiBzY29yZSA9PSBudWxsID8gbnVsbCA6IHtzY29yZSwgdmFsdWU6IHRoaXMuX2ZpbGVwYXRoLCBtYXRjaEluZGV4ZXM6IFtdfTtcbiAgfVxuXG4gIF9nZXRTY29yZUZvcihxdWVyeTogc3RyaW5nKTogP251bWJlciB7XG4gICAgLy8gUHVyZWx5IGRlZmVuc2l2ZSwgYXMgcXVlcnkgaXMgZ3VhcmFudGVlZCB0byBiZSBub24tZW1wdHkuXG4gICAgaWYgKHF1ZXJ5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIENoZWNrIGlmIHRoaXMgYSBcInBvc3NpYmxlIHJlc3VsdFwiLlxuICAgIC8vIFRPRE8gY29uc2lkZXIgYnVpbGRpbmcgYSBkaXJlY3RvcnktbGV2ZWwgaW5kZXggZnJvbSBpbXBvcnRhbnRfY2hhcmFjdGVyIC0+IFF1ZXJ5SXRlbSxcbiAgICAvLyBha2luIHRvIEZCSURFJ3MgaW1wbGVtZW50YXRpb24uXG4gICAgY29uc3QgZmlyc3RDaGFyID0gcXVlcnlbMF0udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoIXRoaXMuX2ltcG9ydGFudENoYXJhY3RlcnMuaGFzKGZpcnN0Q2hhcikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocXVlcnkubGVuZ3RoID49IDMgJiYgY2hlY2tJZk1hdGNoZXNDYW1lbENhc2VMZXR0ZXJzKHF1ZXJ5LCB0aGlzLl9maWxlbmFtZSkpIHtcbiAgICAgIC8vIElmIHdlIG1hdGNoIHRoZSB1cHBlcmNhc2UgY2hhcmFjdGVycyBvZiB0aGUgZmlsZW5hbWUsIHdlIHNob3VsZCBiZSByYW5rZWQgdGhlIGhpZ2hlc3RcbiAgICAgIHJldHVybiAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzdWIgPSB0aGlzLl9maWxlcGF0aExvd2VyY2FzZS5pbmRleE9mKHF1ZXJ5LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgaWYgKHN1YiAhPT0gLTEgJiYgcXVlcnkubGVuZ3RoIDwgdGhpcy5fZmlsZW5hbWUubGVuZ3RoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXZSBhZGQgdGhlIGxlbmd0aCBvZiB0aGUgdGVybSBzbyB3ZSBjYW4gYmUgcmFua2VkIGFsb25nc2lkZSB0aGVcbiAgICAgICAgICogc2NvcmVzIGdlbmVyYXRlZCBieSBgc2NvcmVDb21tb25TdWJzZXF1ZW5jZWAgd2hpY2ggYWxzbyBmYWN0b3JzIGluIHRoZVxuICAgICAgICAgKiBsZW5ndGguXG4gICAgICAgICAqIFRoaXMgd2F5IHdoZW4geW91IHNlYXJjaCBmb3IgYEVkaXNvbkNvbnRyb2xsZXJgLFxuICAgICAgICAgKiBFZGlzb25Db250cm9sbGVyIHNjb3JlcyAwXG4gICAgICAgICAqIEVkaXh4c29uQ29udHJvbGxlciBzY29yZXMgNDAgKGZyb20gYHNjb3JlQ29tbW9uU3Vic2VxdWVuY2VgIHNjb3JpbmcpXG4gICAgICAgICAqIFNvbWV0aGluZ0JsYWhCbGFoRWRpc29uQ29udHJvbGxlciBzY29yZXMgNTAgZnJvbSBzdWJzdHJpbmcgc2NvcmluZ1xuICAgICAgICAgKiBXZWJEZWNpc2lvbkNvbnRyb2xsZXIgc2NvcmVzIDUyIChmcm9tIGBzY29yZUNvbW1vblN1YnNlcXVlbmNlYCBzY29yaW5nKVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHN1YiArIHRoaXMuX2ZpbGVuYW1lLmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRPRE8oanhnKTogSW52ZXN0aWdhdGUgZXh0ZW5kaW5nIHNjb3JlQ29tbW9uU3Vic2VxdWVuY2UgdG8gY29uc2lkZXIgc3Vic2VxdWVuY2VzXG4gICAgICAgIC8vIGJpZGlyZWN0aW9uYWxseSwgb3IgdXNlIChzb21lIHByb3h5IGZvcikgZWRpdCBkaXN0YW5jZS5cbiAgICAgICAgY29uc3Qgc2NvcmUgPSBzY29yZUNvbW1vblN1YnNlcXVlbmNlKHF1ZXJ5LCB0aGlzLl9maWxlbmFtZSk7XG4gICAgICAgIGlmIChzY29yZSAhPT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gc2NvcmU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxufVxuIl19