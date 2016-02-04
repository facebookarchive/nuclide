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

/**
 * This squashes all no break markers and any nearby breaks.
 */
function resolveNoBreaks(lines) {
  var scopes = buildScopes(lines);
  var runs = buildRuns(lines);

  var kill = new Set();
  var killScopes = new Set();

  for (var run of runs) {
    var _run = _slicedToArray(run, 2);

    var start = _run[0];
    var end = _run[1];

    var hasNoBreak = false;

    // Check for the noBreak.
    for (var i = start; i < end; i++) {
      if (lines[i] === markers.noBreak) {
        hasNoBreak = true;
        break;
      }
    }

    if (!hasNoBreak) {
      continue;
    }

    // Then test what we need to kill.
    for (var i = start; i < end; i++) {
      if (isScopeBreakMarker(lines[i])) {
        invariant(scopes[i] != null, 'Scope markers must have a scope.');
        killScopes.add(scopes[i]);
      } else if (lines[i] === markers.noBreak || lines[i] === markers.hardBreak || lines[i] === markers.multiHardBreak) {
        kill.add(i);
      }
    }
  }

  // Kill the appropriate scope markers.
  for (var i = 0; i < lines.length; i++) {
    if (isScopeMarker(lines[i]) && killScopes.has(scopes[i])) {
      kill.add(i);
    }
  }

  // Now do the killing.
  return lines.map(function (line, i) {
    if (kill.has(i)) {
      if (line === markers.hardBreak) {
        return markers.empty;
      } else if (line === markers.multiHardBreak) {
        return markers.empty;
      } else if (line === markers.noBreak) {
        return markers.empty;
      } else if (line === markers.openScope) {
        return markers.empty;
      } else if (line === markers.scopeIndent) {
        return markers.empty;
      } else if (line === markers.scopeBreak) {
        return markers.empty;
      } else if (line === markers.scopeSpaceBreak) {
        return markers.space;
      } else if (line === markers.scopeComma) {
        return markers.empty;
      } else if (line === markers.scopeDedent) {
        return markers.empty;
      } else if (line === markers.closeScope) {
        return markers.empty;
      }
    }
    return line;
  });
}

module.exports = resolveNoBreaks;
//# sourceMappingURL=data:application/json;base64,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LGNBQWMsRUFBRTtBQUMxQyxlQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUM7T0FDdEIsTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsT0FBTyxFQUFFO0FBQ25DLGVBQU8sT0FBTyxDQUFDLEtBQUssQ0FBQztPQUN0QixNQUFNLElBQUksSUFBSSxLQUFLLE9BQU8sQ0FBQyxTQUFTLEVBQUU7QUFDckMsZUFBTyxPQUFPLENBQUMsS0FBSyxDQUFDO09BQ3RCLE1BQU0sSUFBSSxJQUFJLEtBQUssT0FBTyxDQUFDLFdBQVcsRUFBRTtBQUN2QyxlQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUM7T0FDdEIsTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsVUFBVSxFQUFFO0FBQ3RDLGVBQU8sT0FBTyxDQUFDLEtBQUssQ0FBQztPQUN0QixNQUFNLElBQUksSUFBSSxLQUFLLE9BQU8sQ0FBQyxlQUFlLEVBQUU7QUFDM0MsZUFBTyxPQUFPLENBQUMsS0FBSyxDQUFDO09BQ3RCLE1BQU0sSUFBSSxJQUFJLEtBQUssT0FBTyxDQUFDLFVBQVUsRUFBRTtBQUN0QyxlQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUM7T0FDdEIsTUFBTSxJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsV0FBVyxFQUFFO0FBQ3ZDLGVBQU8sT0FBTyxDQUFDLEtBQUssQ0FBQztPQUN0QixNQUFNLElBQUksSUFBSSxLQUFLLE9BQU8sQ0FBQyxVQUFVLEVBQUU7QUFDdEMsZUFBTyxPQUFPLENBQUMsS0FBSyxDQUFDO09BQ3RCO0tBQ0Y7QUFDRCxXQUFPLElBQUksQ0FBQztHQUNiLENBQUMsQ0FBQztDQUNKOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6InJlc29sdmVOb0JyZWFrcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IGJ1aWxkUnVucyA9IHJlcXVpcmUoJy4uL3V0aWxzL2J1aWxkUnVucycpO1xuY29uc3QgYnVpbGRTY29wZXMgPSByZXF1aXJlKCcuLi91dGlscy9idWlsZFNjb3BlcycpO1xuY29uc3QgaW52YXJpYW50ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5jb25zdCBpc1Njb3BlQnJlYWtNYXJrZXIgPSByZXF1aXJlKCcuLi91dGlscy9pc1Njb3BlQnJlYWtNYXJrZXInKTtcbmNvbnN0IGlzU2NvcGVNYXJrZXIgPSByZXF1aXJlKCcuLi91dGlscy9pc1Njb3BlTWFya2VyJyk7XG5jb25zdCBtYXJrZXJzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL21hcmtlcnMnKTtcblxuLyoqXG4gKiBUaGlzIHNxdWFzaGVzIGFsbCBubyBicmVhayBtYXJrZXJzIGFuZCBhbnkgbmVhcmJ5IGJyZWFrcy5cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZU5vQnJlYWtzKGxpbmVzOiBBcnJheTxhbnk+KTogQXJyYXk8YW55PiB7XG4gIGNvbnN0IHNjb3BlcyA9IGJ1aWxkU2NvcGVzKGxpbmVzKTtcbiAgY29uc3QgcnVucyA9IGJ1aWxkUnVucyhsaW5lcyk7XG5cbiAgY29uc3Qga2lsbCA9IG5ldyBTZXQoKTtcbiAgY29uc3Qga2lsbFNjb3BlcyA9IG5ldyBTZXQoKTtcblxuICBmb3IgKGNvbnN0IHJ1biBvZiBydW5zKSB7XG4gICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gcnVuO1xuICAgIGxldCBoYXNOb0JyZWFrID0gZmFsc2U7XG5cbiAgICAvLyBDaGVjayBmb3IgdGhlIG5vQnJlYWsuXG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIGlmIChsaW5lc1tpXSA9PT0gbWFya2Vycy5ub0JyZWFrKSB7XG4gICAgICAgIGhhc05vQnJlYWsgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWhhc05vQnJlYWspIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIFRoZW4gdGVzdCB3aGF0IHdlIG5lZWQgdG8ga2lsbC5cbiAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgaWYgKGlzU2NvcGVCcmVha01hcmtlcihsaW5lc1tpXSkpIHtcbiAgICAgICAgaW52YXJpYW50KHNjb3Blc1tpXSAhPSBudWxsLCAnU2NvcGUgbWFya2VycyBtdXN0IGhhdmUgYSBzY29wZS4nKTtcbiAgICAgICAga2lsbFNjb3Blcy5hZGQoc2NvcGVzW2ldKTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGxpbmVzW2ldID09PSBtYXJrZXJzLm5vQnJlYWsgfHxcbiAgICAgICAgbGluZXNbaV0gPT09IG1hcmtlcnMuaGFyZEJyZWFrIHx8XG4gICAgICAgIGxpbmVzW2ldID09PSBtYXJrZXJzLm11bHRpSGFyZEJyZWFrXG4gICAgICApIHtcbiAgICAgICAga2lsbC5hZGQoaSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gS2lsbCB0aGUgYXBwcm9wcmlhdGUgc2NvcGUgbWFya2Vycy5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChpc1Njb3BlTWFya2VyKGxpbmVzW2ldKSAmJiBraWxsU2NvcGVzLmhhcyhzY29wZXNbaV0pKSB7XG4gICAgICBraWxsLmFkZChpKTtcbiAgICB9XG4gIH1cblxuICAvLyBOb3cgZG8gdGhlIGtpbGxpbmcuXG4gIHJldHVybiBsaW5lcy5tYXAoKGxpbmUsIGkpID0+IHtcbiAgICBpZiAoa2lsbC5oYXMoaSkpIHtcbiAgICAgIGlmIChsaW5lID09PSBtYXJrZXJzLmhhcmRCcmVhaykge1xuICAgICAgICByZXR1cm4gbWFya2Vycy5lbXB0eTtcbiAgICAgIH0gZWxzZSBpZiAobGluZSA9PT0gbWFya2Vycy5tdWx0aUhhcmRCcmVhaykge1xuICAgICAgICByZXR1cm4gbWFya2Vycy5lbXB0eTtcbiAgICAgIH0gZWxzZSBpZiAobGluZSA9PT0gbWFya2Vycy5ub0JyZWFrKSB7XG4gICAgICAgIHJldHVybiBtYXJrZXJzLmVtcHR5O1xuICAgICAgfSBlbHNlIGlmIChsaW5lID09PSBtYXJrZXJzLm9wZW5TY29wZSkge1xuICAgICAgICByZXR1cm4gbWFya2Vycy5lbXB0eTtcbiAgICAgIH0gZWxzZSBpZiAobGluZSA9PT0gbWFya2Vycy5zY29wZUluZGVudCkge1xuICAgICAgICByZXR1cm4gbWFya2Vycy5lbXB0eTtcbiAgICAgIH0gZWxzZSBpZiAobGluZSA9PT0gbWFya2Vycy5zY29wZUJyZWFrKSB7XG4gICAgICAgIHJldHVybiBtYXJrZXJzLmVtcHR5O1xuICAgICAgfSBlbHNlIGlmIChsaW5lID09PSBtYXJrZXJzLnNjb3BlU3BhY2VCcmVhaykge1xuICAgICAgICByZXR1cm4gbWFya2Vycy5zcGFjZTtcbiAgICAgIH0gZWxzZSBpZiAobGluZSA9PT0gbWFya2Vycy5zY29wZUNvbW1hKSB7XG4gICAgICAgIHJldHVybiBtYXJrZXJzLmVtcHR5O1xuICAgICAgfSBlbHNlIGlmIChsaW5lID09PSBtYXJrZXJzLnNjb3BlRGVkZW50KSB7XG4gICAgICAgIHJldHVybiBtYXJrZXJzLmVtcHR5O1xuICAgICAgfSBlbHNlIGlmIChsaW5lID09PSBtYXJrZXJzLmNsb3NlU2NvcGUpIHtcbiAgICAgICAgcmV0dXJuIG1hcmtlcnMuZW1wdHk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsaW5lO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZXNvbHZlTm9CcmVha3M7XG4iXX0=