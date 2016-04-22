

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var markers = require('../constants/markers');

/**
 * Given an array of lines this will parse the scopes and return a mapping of
 * line number to unique scope ids. This mapping is returned in the form of an
 * array where arr[lineNumber] is the scopeID.
 */
function buildScopes(lines) {
  var scopes = [];
  var id = 0;
  var stack = [];
  for (var i = 0; i < lines.length; i++) {
    if (lines[i] === markers.openScope) {
      stack.push(id++);
    }
    if (stack.length > 0) {
      scopes.push(stack[stack.length - 1]);
    } else {
      scopes.push(null);
    }
    // Make sure to do this after saving in the scope map. The closeScope is
    // part of it's own scope, we don't want to pop too soon.
    if (lines[i] === markers.closeScope) {
      stack.pop();
    }
  }
  return scopes;
}

module.exports = buildScopes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1aWxkU2NvcGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFXQSxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs7Ozs7OztBQU9oRCxTQUFTLFdBQVcsQ0FBQyxLQUFpQixFQUFrQjtBQUN0RCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDbEIsTUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3JDLFFBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxTQUFTLEVBQUU7QUFDbEMsV0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ2xCO0FBQ0QsUUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUNwQixZQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdEMsTUFBTTtBQUNMLFlBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbkI7OztBQUdELFFBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxVQUFVLEVBQUU7QUFDbkMsV0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO0tBQ2I7R0FDRjtBQUNELFNBQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMiLCJmaWxlIjoiYnVpbGRTY29wZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBtYXJrZXJzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL21hcmtlcnMnKTtcblxuLyoqXG4gKiBHaXZlbiBhbiBhcnJheSBvZiBsaW5lcyB0aGlzIHdpbGwgcGFyc2UgdGhlIHNjb3BlcyBhbmQgcmV0dXJuIGEgbWFwcGluZyBvZlxuICogbGluZSBudW1iZXIgdG8gdW5pcXVlIHNjb3BlIGlkcy4gVGhpcyBtYXBwaW5nIGlzIHJldHVybmVkIGluIHRoZSBmb3JtIG9mIGFuXG4gKiBhcnJheSB3aGVyZSBhcnJbbGluZU51bWJlcl0gaXMgdGhlIHNjb3BlSUQuXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkU2NvcGVzKGxpbmVzOiBBcnJheTxhbnk+KTogQXJyYXk8P251bWJlcj4ge1xuICBjb25zdCBzY29wZXMgPSBbXTtcbiAgbGV0IGlkID0gMDtcbiAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChsaW5lc1tpXSA9PT0gbWFya2Vycy5vcGVuU2NvcGUpIHtcbiAgICAgIHN0YWNrLnB1c2goaWQrKyk7XG4gICAgfVxuICAgIGlmIChzdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICBzY29wZXMucHVzaChzdGFja1tzdGFjay5sZW5ndGggLSAxXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNjb3Blcy5wdXNoKG51bGwpO1xuICAgIH1cbiAgICAvLyBNYWtlIHN1cmUgdG8gZG8gdGhpcyBhZnRlciBzYXZpbmcgaW4gdGhlIHNjb3BlIG1hcC4gVGhlIGNsb3NlU2NvcGUgaXNcbiAgICAvLyBwYXJ0IG9mIGl0J3Mgb3duIHNjb3BlLCB3ZSBkb24ndCB3YW50IHRvIHBvcCB0b28gc29vbi5cbiAgICBpZiAobGluZXNbaV0gPT09IG1hcmtlcnMuY2xvc2VTY29wZSkge1xuICAgICAgc3RhY2sucG9wKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzY29wZXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYnVpbGRTY29wZXM7XG4iXX0=