var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var buildRuns = require('../utils/buildRuns');
var buildScopes = require('../utils/buildScopes');
var invariant = require('assert');
var isScopeBreakMarker = require('../utils/isScopeBreakMarker');
var isScopeMarker = require('../utils/isScopeMarker');
var markers = require('../constants/markers');
var translateScopeMarker = require('../utils/translateScopeMarker');

/**
 * Sometimes a scope break may be adjacent to a hard break. If that's the case
 * go ahead and break the scope.
 *
 * This assumes noBreaks have already been removed and will not be encountered.
 */
function resolveForcedScopeBreaks(lines) {
  var scopes = buildScopes(lines);
  var runs = buildRuns(lines);
  var toBreak = new Set();

  for (var run of runs) {
    var _run = _slicedToArray(run, 2);

    var start = _run[0];
    var end = _run[1];

    var broken = false;
    for (var i = start; i < end; i++) {
      if (lines[i] === markers.hardBreak || lines[i] === markers.multiHardBreak) {
        broken = true;
        break;
      }
    }

    if (!broken) {
      continue;
    }

    for (var i = start; i < end; i++) {
      if (isScopeBreakMarker(lines[i])) {
        invariant(scopes[i] != null, 'Scope markers must have a scope.');
        toBreak.add(scopes[i]);
      }
    }
  }

  return lines.map(function (line, i) {
    if (isScopeMarker(line) && scopes[i] != null && toBreak.has(scopes[i])) {
      return translateScopeMarker(line, true);
    }
    return line;
  });
}

module.exports = resolveForcedScopeBreaks;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc29sdmVGb3JjZWRTY29wZUJyZWFrcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBV0EsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDaEQsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDcEQsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3BDLElBQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDbEUsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDeEQsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDaEQsSUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsK0JBQStCLENBQUMsQ0FBQzs7Ozs7Ozs7QUFRdEUsU0FBUyx3QkFBd0IsQ0FBQyxLQUFpQixFQUFjO0FBQy9ELE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsQyxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7QUFFMUIsT0FBSyxJQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7OEJBQ0QsR0FBRzs7UUFBakIsS0FBSztRQUFFLEdBQUc7O0FBQ2pCLFFBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNuQixTQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2hDLFVBQ0UsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxTQUFTLElBQzlCLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLENBQUMsY0FBYyxFQUNuQztBQUNBLGNBQU0sR0FBRyxJQUFJLENBQUM7QUFDZCxjQUFNO09BQ1A7S0FDRjs7QUFFRCxRQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsZUFBUztLQUNWOztBQUVELFNBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDaEMsVUFBSSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNoQyxpQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztBQUNqRSxlQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3hCO0tBQ0Y7R0FDRjs7QUFFRCxTQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFLO0FBQzVCLFFBQ0UsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUNuQixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN0QjtBQUNBLGFBQU8sb0JBQW9CLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3pDO0FBQ0QsV0FBTyxJQUFJLENBQUM7R0FDYixDQUFDLENBQUM7Q0FDSjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLHdCQUF3QixDQUFDIiwiZmlsZSI6InJlc29sdmVGb3JjZWRTY29wZUJyZWFrcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IGJ1aWxkUnVucyA9IHJlcXVpcmUoJy4uL3V0aWxzL2J1aWxkUnVucycpO1xuY29uc3QgYnVpbGRTY29wZXMgPSByZXF1aXJlKCcuLi91dGlscy9idWlsZFNjb3BlcycpO1xuY29uc3QgaW52YXJpYW50ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5jb25zdCBpc1Njb3BlQnJlYWtNYXJrZXIgPSByZXF1aXJlKCcuLi91dGlscy9pc1Njb3BlQnJlYWtNYXJrZXInKTtcbmNvbnN0IGlzU2NvcGVNYXJrZXIgPSByZXF1aXJlKCcuLi91dGlscy9pc1Njb3BlTWFya2VyJyk7XG5jb25zdCBtYXJrZXJzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL21hcmtlcnMnKTtcbmNvbnN0IHRyYW5zbGF0ZVNjb3BlTWFya2VyID0gcmVxdWlyZSgnLi4vdXRpbHMvdHJhbnNsYXRlU2NvcGVNYXJrZXInKTtcblxuLyoqXG4gKiBTb21ldGltZXMgYSBzY29wZSBicmVhayBtYXkgYmUgYWRqYWNlbnQgdG8gYSBoYXJkIGJyZWFrLiBJZiB0aGF0J3MgdGhlIGNhc2VcbiAqIGdvIGFoZWFkIGFuZCBicmVhayB0aGUgc2NvcGUuXG4gKlxuICogVGhpcyBhc3N1bWVzIG5vQnJlYWtzIGhhdmUgYWxyZWFkeSBiZWVuIHJlbW92ZWQgYW5kIHdpbGwgbm90IGJlIGVuY291bnRlcmVkLlxuICovXG5mdW5jdGlvbiByZXNvbHZlRm9yY2VkU2NvcGVCcmVha3MobGluZXM6IEFycmF5PGFueT4pOiBBcnJheTxhbnk+IHtcbiAgY29uc3Qgc2NvcGVzID0gYnVpbGRTY29wZXMobGluZXMpO1xuICBjb25zdCBydW5zID0gYnVpbGRSdW5zKGxpbmVzKTtcbiAgY29uc3QgdG9CcmVhayA9IG5ldyBTZXQoKTtcblxuICBmb3IgKGNvbnN0IHJ1biBvZiBydW5zKSB7XG4gICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gcnVuO1xuICAgIGxldCBicm9rZW4gPSBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgaWYgKFxuICAgICAgICBsaW5lc1tpXSA9PT0gbWFya2Vycy5oYXJkQnJlYWsgfHxcbiAgICAgICAgbGluZXNbaV0gPT09IG1hcmtlcnMubXVsdGlIYXJkQnJlYWtcbiAgICAgICkge1xuICAgICAgICBicm9rZW4gPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWJyb2tlbikge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIGlmIChpc1Njb3BlQnJlYWtNYXJrZXIobGluZXNbaV0pKSB7XG4gICAgICAgIGludmFyaWFudChzY29wZXNbaV0gIT0gbnVsbCwgJ1Njb3BlIG1hcmtlcnMgbXVzdCBoYXZlIGEgc2NvcGUuJyk7XG4gICAgICAgIHRvQnJlYWsuYWRkKHNjb3Blc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGxpbmVzLm1hcCgobGluZSwgaSkgPT4ge1xuICAgIGlmIChcbiAgICAgIGlzU2NvcGVNYXJrZXIobGluZSkgJiZcbiAgICAgIHNjb3Blc1tpXSAhPSBudWxsICYmXG4gICAgICB0b0JyZWFrLmhhcyhzY29wZXNbaV0pXG4gICAgKSB7XG4gICAgICByZXR1cm4gdHJhbnNsYXRlU2NvcGVNYXJrZXIobGluZSwgdHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBsaW5lO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZXNvbHZlRm9yY2VkU2NvcGVCcmVha3M7XG4iXX0=