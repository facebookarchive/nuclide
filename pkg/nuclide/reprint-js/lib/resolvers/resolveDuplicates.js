var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var buildRuns = require('../utils/buildRuns');
var markers = require('../constants/markers');

/**
 * This squashes all duplicates that should not be kept.
 */
function resolveDuplicates(lines) {
  var runs = buildRuns(lines);
  var kill = new Set();

  for (var run of runs) {
    var _run = _slicedToArray(run, 2);

    var start = _run[0];
    var end = _run[1];

    var hardBreak = 0;
    var multiHardBreak = 0;

    // Count how many of each break we have.
    for (var i = start; i < end; i++) {
      if (lines[i] === markers.hardBreak) {
        hardBreak++;
      } else if (lines[i] === markers.multiHardBreak) {
        multiHardBreak++;
      }
    }

    var hardBreaksRemaining = hardBreak;

    // Then kill the appropriate duplicates in the run.
    for (var i = start; i < end; i++) {
      if (lines[i] === markers.hardBreak) {
        if (hardBreaksRemaining > 1 || multiHardBreak > 0) {
          hardBreaksRemaining--;
          kill.add(i);
        }
      } else if (lines[i] === markers.multiHardBreak) {
        // Never remove a multiHardBreak.
      }
    }
  }

  // We always kill to empty here.
  return lines.map(function (line, i) {
    return kill.has(i) ? markers.empty : line;
  });
}

module.exports = resolveDuplicates;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc29sdmVEdXBsaWNhdGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFXQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUNoRCxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs7Ozs7QUFLaEQsU0FBUyxpQkFBaUIsQ0FBQyxLQUFpQixFQUFjO0FBQ3hELE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM5QixNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOztBQUV2QixPQUFLLElBQU0sR0FBRyxJQUFJLElBQUksRUFBRTs4QkFDRCxHQUFHOztRQUFqQixLQUFLO1FBQUUsR0FBRzs7QUFFakIsUUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksY0FBYyxHQUFHLENBQUMsQ0FBQzs7O0FBR3ZCLFNBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDaEMsVUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLFNBQVMsRUFBRTtBQUNsQyxpQkFBUyxFQUFFLENBQUM7T0FDYixNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxjQUFjLEVBQUU7QUFDOUMsc0JBQWMsRUFBRSxDQUFDO09BQ2xCO0tBQ0Y7O0FBRUQsUUFBSSxtQkFBbUIsR0FBRyxTQUFTLENBQUM7OztBQUdwQyxTQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2hDLFVBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxTQUFTLEVBQUU7QUFDbEMsWUFDRSxtQkFBbUIsR0FBRyxDQUFDLElBQ3ZCLGNBQWMsR0FBRyxDQUFDLEVBQ2xCO0FBQ0EsNkJBQW1CLEVBQUUsQ0FBQztBQUN0QixjQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2I7T0FDRixNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxjQUFjLEVBQUU7O09BRS9DO0tBQ0Y7R0FDRjs7O0FBR0QsU0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUMsSUFBSSxFQUFFLENBQUM7V0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSTtHQUFBLENBQUMsQ0FBQztDQUNuRTs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6InJlc29sdmVEdXBsaWNhdGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgYnVpbGRSdW5zID0gcmVxdWlyZSgnLi4vdXRpbHMvYnVpbGRSdW5zJyk7XG5jb25zdCBtYXJrZXJzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL21hcmtlcnMnKTtcblxuLyoqXG4gKiBUaGlzIHNxdWFzaGVzIGFsbCBkdXBsaWNhdGVzIHRoYXQgc2hvdWxkIG5vdCBiZSBrZXB0LlxuICovXG5mdW5jdGlvbiByZXNvbHZlRHVwbGljYXRlcyhsaW5lczogQXJyYXk8YW55Pik6IEFycmF5PGFueT4ge1xuICBjb25zdCBydW5zID0gYnVpbGRSdW5zKGxpbmVzKTtcbiAgY29uc3Qga2lsbCA9IG5ldyBTZXQoKTtcblxuICBmb3IgKGNvbnN0IHJ1biBvZiBydW5zKSB7XG4gICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gcnVuO1xuXG4gICAgbGV0IGhhcmRCcmVhayA9IDA7XG4gICAgbGV0IG11bHRpSGFyZEJyZWFrID0gMDtcblxuICAgIC8vIENvdW50IGhvdyBtYW55IG9mIGVhY2ggYnJlYWsgd2UgaGF2ZS5cbiAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgaWYgKGxpbmVzW2ldID09PSBtYXJrZXJzLmhhcmRCcmVhaykge1xuICAgICAgICBoYXJkQnJlYWsrKztcbiAgICAgIH0gZWxzZSBpZiAobGluZXNbaV0gPT09IG1hcmtlcnMubXVsdGlIYXJkQnJlYWspIHtcbiAgICAgICAgbXVsdGlIYXJkQnJlYWsrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgaGFyZEJyZWFrc1JlbWFpbmluZyA9IGhhcmRCcmVhaztcblxuICAgIC8vIFRoZW4ga2lsbCB0aGUgYXBwcm9wcmlhdGUgZHVwbGljYXRlcyBpbiB0aGUgcnVuLlxuICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICBpZiAobGluZXNbaV0gPT09IG1hcmtlcnMuaGFyZEJyZWFrKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBoYXJkQnJlYWtzUmVtYWluaW5nID4gMSB8fFxuICAgICAgICAgIG11bHRpSGFyZEJyZWFrID4gMFxuICAgICAgICApIHtcbiAgICAgICAgICBoYXJkQnJlYWtzUmVtYWluaW5nLS07XG4gICAgICAgICAga2lsbC5hZGQoaSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobGluZXNbaV0gPT09IG1hcmtlcnMubXVsdGlIYXJkQnJlYWspIHtcbiAgICAgICAgLy8gTmV2ZXIgcmVtb3ZlIGEgbXVsdGlIYXJkQnJlYWsuXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gV2UgYWx3YXlzIGtpbGwgdG8gZW1wdHkgaGVyZS5cbiAgcmV0dXJuIGxpbmVzLm1hcCgobGluZSwgaSkgPT4ga2lsbC5oYXMoaSkgPyBtYXJrZXJzLmVtcHR5IDogbGluZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzb2x2ZUR1cGxpY2F0ZXM7XG4iXX0=