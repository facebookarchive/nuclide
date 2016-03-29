Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.relativeDate = relativeDate;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Originally adapted from https://github.com/azer/relative-date.
// We're including it because of https://github.com/npm/npm/issues/12012

var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;
var WEEK = 7 * DAY;
var YEAR = DAY * 365;
var MONTH = YEAR / 12;

var formats = [[0.7 * MINUTE, 'just now'], [1.5 * MINUTE, 'a minute ago'], [60 * MINUTE, 'minutes ago', MINUTE], [1.5 * HOUR, 'an hour ago'], [DAY, 'hours ago', HOUR], [2 * DAY, 'yesterday'], [7 * DAY, 'days ago', DAY], [1.5 * WEEK, 'a week ago'], [MONTH, 'weeks ago', WEEK], [1.5 * MONTH, 'a month ago'], [YEAR, 'months ago', MONTH], [1.5 * YEAR, 'a year ago'], [Number.MAX_VALUE, 'years ago', YEAR]];

function relativeDate(input, reference) {
  if (input instanceof Date) {
    input = input.getTime();
  }
  if (!reference) {
    reference = new Date().getTime();
  }
  if (reference instanceof Date) {
    reference = reference.getTime();
  }

  var delta = reference - input;

  for (var _ref3 of formats) {
    var _ref2 = _slicedToArray(_ref3, 3);

    var limit = _ref2[0];
    var relativeFormat = _ref2[1];
    var remainder = _ref2[2];

    if (delta < limit) {
      if (typeof remainder === 'number') {
        return Math.round(delta / remainder) + ' ' + relativeFormat;
      } else {
        return relativeFormat;
      }
    }
  }

  throw new Error('This should never be reached.');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbGF0aXZlRGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBY0EsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLElBQU0sTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFDM0IsSUFBTSxJQUFJLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQztBQUN6QixJQUFNLEdBQUcsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLElBQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDckIsSUFBTSxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUN2QixJQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOztBQUV4QixJQUFNLE9BQU8sR0FBRyxDQUNkLENBQUUsR0FBRyxHQUFHLE1BQU0sRUFBRSxVQUFVLENBQUUsRUFDNUIsQ0FBRSxHQUFHLEdBQUcsTUFBTSxFQUFFLGNBQWMsQ0FBRSxFQUNoQyxDQUFFLEVBQUUsR0FBRyxNQUFNLEVBQUUsYUFBYSxFQUFFLE1BQU0sQ0FBRSxFQUN0QyxDQUFFLEdBQUcsR0FBRyxJQUFJLEVBQUUsYUFBYSxDQUFFLEVBQzdCLENBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUUsRUFDMUIsQ0FBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLFdBQVcsQ0FBRSxFQUN4QixDQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBRSxFQUM1QixDQUFFLEdBQUcsR0FBRyxJQUFJLEVBQUUsWUFBWSxDQUFDLEVBQzNCLENBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUUsRUFDNUIsQ0FBRSxHQUFHLEdBQUcsS0FBSyxFQUFFLGFBQWEsQ0FBRSxFQUM5QixDQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFFLEVBQzdCLENBQUUsR0FBRyxHQUFHLElBQUksRUFBRSxZQUFZLENBQUUsRUFDNUIsQ0FBRSxNQUFNLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUUsQ0FDeEMsQ0FBQzs7QUFFSyxTQUFTLFlBQVksQ0FDMUIsS0FBb0IsRUFDcEIsU0FBeUIsRUFDakI7QUFDUixNQUFJLEtBQUssWUFBWSxJQUFJLEVBQUU7QUFDekIsU0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUN6QjtBQUNELE1BQUksQ0FBQyxTQUFTLEVBQUU7QUFDZCxhQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUNsQztBQUNELE1BQUksU0FBUyxZQUFZLElBQUksRUFBRTtBQUM3QixhQUFTLEdBQUcsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ2pDOztBQUVELE1BQU0sS0FBSyxHQUFHLFNBQVMsR0FBRyxLQUFLLENBQUM7O0FBRWhDLG9CQUFpRCxPQUFPLEVBQUU7OztRQUE5QyxLQUFLO1FBQUUsY0FBYztRQUFFLFNBQVM7O0FBQzFDLFFBQUksS0FBSyxHQUFHLEtBQUssRUFBRTtBQUNqQixVQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsRUFBRTtBQUNqQyxlQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxjQUFjLENBQUM7T0FDN0QsTUFBTTtBQUNMLGVBQU8sY0FBYyxDQUFDO09BQ3ZCO0tBQ0Y7R0FDRjs7QUFFRCxRQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7Q0FDbEQiLCJmaWxlIjoicmVsYXRpdmVEYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gT3JpZ2luYWxseSBhZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2F6ZXIvcmVsYXRpdmUtZGF0ZS5cbi8vIFdlJ3JlIGluY2x1ZGluZyBpdCBiZWNhdXNlIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9ucG0vbnBtL2lzc3Vlcy8xMjAxMlxuXG5jb25zdCBTRUNPTkQgPSAxMDAwO1xuY29uc3QgTUlOVVRFID0gNjAgKiBTRUNPTkQ7XG5jb25zdCBIT1VSID0gNjAgKiBNSU5VVEU7XG5jb25zdCBEQVkgPSAyNCAqIEhPVVI7XG5jb25zdCBXRUVLID0gNyAqIERBWTtcbmNvbnN0IFlFQVIgPSBEQVkgKiAzNjU7XG5jb25zdCBNT05USCA9IFlFQVIgLyAxMjtcblxuY29uc3QgZm9ybWF0cyA9IFtcbiAgWyAwLjcgKiBNSU5VVEUsICdqdXN0IG5vdycgXSxcbiAgWyAxLjUgKiBNSU5VVEUsICdhIG1pbnV0ZSBhZ28nIF0sXG4gIFsgNjAgKiBNSU5VVEUsICdtaW51dGVzIGFnbycsIE1JTlVURSBdLFxuICBbIDEuNSAqIEhPVVIsICdhbiBob3VyIGFnbycgXSxcbiAgWyBEQVksICdob3VycyBhZ28nLCBIT1VSIF0sXG4gIFsgMiAqIERBWSwgJ3llc3RlcmRheScgXSxcbiAgWyA3ICogREFZLCAnZGF5cyBhZ28nLCBEQVkgXSxcbiAgWyAxLjUgKiBXRUVLLCAnYSB3ZWVrIGFnbyddLFxuICBbIE1PTlRILCAnd2Vla3MgYWdvJywgV0VFSyBdLFxuICBbIDEuNSAqIE1PTlRILCAnYSBtb250aCBhZ28nIF0sXG4gIFsgWUVBUiwgJ21vbnRocyBhZ28nLCBNT05USCBdLFxuICBbIDEuNSAqIFlFQVIsICdhIHllYXIgYWdvJyBdLFxuICBbIE51bWJlci5NQVhfVkFMVUUsICd5ZWFycyBhZ28nLCBZRUFSIF0sXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVsYXRpdmVEYXRlKFxuICBpbnB1dDogbnVtYmVyIHwgRGF0ZSxcbiAgcmVmZXJlbmNlPzogbnVtYmVyIHwgRGF0ZVxuKTogc3RyaW5nIHtcbiAgaWYgKGlucHV0IGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIGlucHV0ID0gaW5wdXQuZ2V0VGltZSgpO1xuICB9XG4gIGlmICghcmVmZXJlbmNlKSB7XG4gICAgcmVmZXJlbmNlID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH1cbiAgaWYgKHJlZmVyZW5jZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICByZWZlcmVuY2UgPSByZWZlcmVuY2UuZ2V0VGltZSgpO1xuICB9XG5cbiAgY29uc3QgZGVsdGEgPSByZWZlcmVuY2UgLSBpbnB1dDtcblxuICBmb3IgKGNvbnN0IFtsaW1pdCwgcmVsYXRpdmVGb3JtYXQsIHJlbWFpbmRlcl0gb2YgZm9ybWF0cykge1xuICAgIGlmIChkZWx0YSA8IGxpbWl0KSB7XG4gICAgICBpZiAodHlwZW9mIHJlbWFpbmRlciA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoZGVsdGEgLyByZW1haW5kZXIpICsgJyAnICsgcmVsYXRpdmVGb3JtYXQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVsYXRpdmVGb3JtYXQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHNob3VsZCBuZXZlciBiZSByZWFjaGVkLicpO1xufVxuIl19