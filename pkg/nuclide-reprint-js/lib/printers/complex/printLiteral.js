

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var escapeStringLiteral = require('../../utils/escapeStringLiteral');
var flatten = require('../../utils/flatten');
var invariant = require('assert');
var markers = require('../../constants/markers');

function printLiteral(print, node, context) {
  var last = context.path.last();

  // JSXAttributes should always use double quotes.
  if (last && last.type === 'JSXAttribute') {
    invariant(typeof node.value === 'string', 'Literals within a JSXAttribute should always be a string');
    return [escapeStringLiteral(node.value, { quotes: 'double' })];
  }

  // JSXElements don't need quotes, so we need special handling.
  if (last && last.type === 'JSXElement') {
    var _ret = (function () {
      invariant(typeof node.value === 'string', 'Literals within a JSXElement should always be a string');
      var lines = node.value.split('\n');
      var spaceNeeded = true;
      return {
        v: flatten(lines.map(function (line, i) {
          // Note: Scope is already opened in the JSXElement.
          // We have to check in order to avoid consecutive spaces when the scope
          // is not broken.
          var breakMarker = spaceNeeded ? markers.scopeSpaceBreak : markers.scopeBreak;
          if (/^\s*$/.test(line)) {
            spaceNeeded = false;
          } else {
            spaceNeeded = true;
          }
          return [i > 0 ? breakMarker : markers.empty, line];
        }))
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
  }

  return [literalToString(node)];
}

function literalToString(node) {
  if (typeof node.value === 'string') {
    return escapeStringLiteral(node.value, { quotes: 'single' });
  }
  // It's not safe to use value for number literals that would lose precision.
  if (node.raw != null) {
    return node.raw;
  }
  return markers.empty;
}

module.exports = printLiteral;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaW50TGl0ZXJhbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBY0EsSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQztBQUN2RSxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUMvQyxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEMsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7O0FBRW5ELFNBQVMsWUFBWSxDQUFDLEtBQVksRUFBRSxJQUFhLEVBQUUsT0FBZ0IsRUFBUztBQUMxRSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOzs7QUFHakMsTUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxjQUFjLEVBQUU7QUFDeEMsYUFBUyxDQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQzlCLDBEQUEwRCxDQUMzRCxDQUFDO0FBQ0YsV0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQyxDQUFDO0dBQzlEOzs7QUFHRCxNQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFlBQVksRUFBRTs7QUFDdEMsZUFBUyxDQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQzlCLHdEQUF3RCxDQUN6RCxDQUFDO0FBQ0YsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsVUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCO1dBQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFLOzs7O0FBSXBDLGNBQU0sV0FBVyxHQUFHLFdBQVcsR0FDM0IsT0FBTyxDQUFDLGVBQWUsR0FDdkIsT0FBTyxDQUFDLFVBQVUsQ0FBQztBQUN2QixjQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDdEIsdUJBQVcsR0FBRyxLQUFLLENBQUM7V0FDckIsTUFBTTtBQUNMLHVCQUFXLEdBQUcsSUFBSSxDQUFDO1dBQ3BCO0FBQ0QsaUJBQU8sQ0FDTCxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUNuQyxJQUFJLENBQ0wsQ0FBQztTQUNILENBQUMsQ0FBQztRQUFDOzs7O0dBQ0w7O0FBRUQsU0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ2hDOztBQUVELFNBQVMsZUFBZSxDQUFDLElBQWEsRUFBVTtBQUM5QyxNQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7QUFDbEMsV0FBTyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7R0FDNUQ7O0FBRUQsTUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRTtBQUNwQixXQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7R0FDakI7QUFDRCxTQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUM7Q0FDdEI7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMiLCJmaWxlIjoicHJpbnRMaXRlcmFsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0NvbnRleHQsIExpbmVzLCBQcmludH0gZnJvbSAnLi4vLi4vdHlwZXMvY29tbW9uJztcbmltcG9ydCB0eXBlIHtMaXRlcmFsfSBmcm9tICdhc3QtdHlwZXMtZmxvdyc7XG5cbmNvbnN0IGVzY2FwZVN0cmluZ0xpdGVyYWwgPSByZXF1aXJlKCcuLi8uLi91dGlscy9lc2NhcGVTdHJpbmdMaXRlcmFsJyk7XG5jb25zdCBmbGF0dGVuID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvZmxhdHRlbicpO1xuY29uc3QgaW52YXJpYW50ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5jb25zdCBtYXJrZXJzID0gcmVxdWlyZSgnLi4vLi4vY29uc3RhbnRzL21hcmtlcnMnKTtcblxuZnVuY3Rpb24gcHJpbnRMaXRlcmFsKHByaW50OiBQcmludCwgbm9kZTogTGl0ZXJhbCwgY29udGV4dDogQ29udGV4dCk6IExpbmVzIHtcbiAgY29uc3QgbGFzdCA9IGNvbnRleHQucGF0aC5sYXN0KCk7XG5cbiAgLy8gSlNYQXR0cmlidXRlcyBzaG91bGQgYWx3YXlzIHVzZSBkb3VibGUgcXVvdGVzLlxuICBpZiAobGFzdCAmJiBsYXN0LnR5cGUgPT09ICdKU1hBdHRyaWJ1dGUnKSB7XG4gICAgaW52YXJpYW50KFxuICAgICAgdHlwZW9mIG5vZGUudmFsdWUgPT09ICdzdHJpbmcnLFxuICAgICAgJ0xpdGVyYWxzIHdpdGhpbiBhIEpTWEF0dHJpYnV0ZSBzaG91bGQgYWx3YXlzIGJlIGEgc3RyaW5nJyxcbiAgICApO1xuICAgIHJldHVybiBbZXNjYXBlU3RyaW5nTGl0ZXJhbChub2RlLnZhbHVlLCB7cXVvdGVzOiAnZG91YmxlJ30pXTtcbiAgfVxuXG4gIC8vIEpTWEVsZW1lbnRzIGRvbid0IG5lZWQgcXVvdGVzLCBzbyB3ZSBuZWVkIHNwZWNpYWwgaGFuZGxpbmcuXG4gIGlmIChsYXN0ICYmIGxhc3QudHlwZSA9PT0gJ0pTWEVsZW1lbnQnKSB7XG4gICAgaW52YXJpYW50KFxuICAgICAgdHlwZW9mIG5vZGUudmFsdWUgPT09ICdzdHJpbmcnLFxuICAgICAgJ0xpdGVyYWxzIHdpdGhpbiBhIEpTWEVsZW1lbnQgc2hvdWxkIGFsd2F5cyBiZSBhIHN0cmluZycsXG4gICAgKTtcbiAgICBjb25zdCBsaW5lcyA9IG5vZGUudmFsdWUuc3BsaXQoJ1xcbicpO1xuICAgIGxldCBzcGFjZU5lZWRlZCA9IHRydWU7XG4gICAgcmV0dXJuIGZsYXR0ZW4obGluZXMubWFwKChsaW5lLCBpKSA9PiB7XG4gICAgICAvLyBOb3RlOiBTY29wZSBpcyBhbHJlYWR5IG9wZW5lZCBpbiB0aGUgSlNYRWxlbWVudC5cbiAgICAgIC8vIFdlIGhhdmUgdG8gY2hlY2sgaW4gb3JkZXIgdG8gYXZvaWQgY29uc2VjdXRpdmUgc3BhY2VzIHdoZW4gdGhlIHNjb3BlXG4gICAgICAvLyBpcyBub3QgYnJva2VuLlxuICAgICAgY29uc3QgYnJlYWtNYXJrZXIgPSBzcGFjZU5lZWRlZFxuICAgICAgICA/IG1hcmtlcnMuc2NvcGVTcGFjZUJyZWFrXG4gICAgICAgIDogbWFya2Vycy5zY29wZUJyZWFrO1xuICAgICAgaWYgKC9eXFxzKiQvLnRlc3QobGluZSkpIHtcbiAgICAgICAgc3BhY2VOZWVkZWQgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwYWNlTmVlZGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXG4gICAgICAgIGkgPiAwID8gYnJlYWtNYXJrZXIgOiBtYXJrZXJzLmVtcHR5LFxuICAgICAgICBsaW5lLFxuICAgICAgXTtcbiAgICB9KSk7XG4gIH1cblxuICByZXR1cm4gW2xpdGVyYWxUb1N0cmluZyhub2RlKV07XG59XG5cbmZ1bmN0aW9uIGxpdGVyYWxUb1N0cmluZyhub2RlOiBMaXRlcmFsKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiBub2RlLnZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBlc2NhcGVTdHJpbmdMaXRlcmFsKG5vZGUudmFsdWUsIHtxdW90ZXM6ICdzaW5nbGUnfSk7XG4gIH1cbiAgLy8gSXQncyBub3Qgc2FmZSB0byB1c2UgdmFsdWUgZm9yIG51bWJlciBsaXRlcmFscyB0aGF0IHdvdWxkIGxvc2UgcHJlY2lzaW9uLlxuICBpZiAobm9kZS5yYXcgIT0gbnVsbCkge1xuICAgIHJldHVybiBub2RlLnJhdztcbiAgfVxuICByZXR1cm4gbWFya2Vycy5lbXB0eTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwcmludExpdGVyYWw7XG4iXX0=