Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.union = union;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Merges a given arguments of maps into one Map, with the latest maps
 * overriding the values of the prior maps.
 */

function union() {
  var unionMap = new Map();

  for (var _len = arguments.length, maps = Array(_len), _key = 0; _key < _len; _key++) {
    maps[_key] = arguments[_key];
  }

  for (var map of maps) {
    for (var _ref3 of map) {
      var _ref2 = _slicedToArray(_ref3, 2);

      var key = _ref2[0];
      var value = _ref2[1];

      unionMap.set(key, value);
    }
  }
  return unionMap;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlTyxTQUFTLEtBQUssR0FBNkM7QUFDaEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7b0NBREUsSUFBSTtBQUFKLFFBQUk7OztBQUVqQyxPQUFLLElBQU0sR0FBRyxJQUFJLElBQUksRUFBRTtBQUN0QixzQkFBMkIsR0FBRyxFQUFFOzs7VUFBcEIsR0FBRztVQUFFLEtBQUs7O0FBQ3BCLGNBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzFCO0dBQ0Y7QUFDRCxTQUFPLFFBQVEsQ0FBQztDQUNqQiIsImZpbGUiOiJtYXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKipcbiAqIE1lcmdlcyBhIGdpdmVuIGFyZ3VtZW50cyBvZiBtYXBzIGludG8gb25lIE1hcCwgd2l0aCB0aGUgbGF0ZXN0IG1hcHNcbiAqIG92ZXJyaWRpbmcgdGhlIHZhbHVlcyBvZiB0aGUgcHJpb3IgbWFwcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuaW9uPFQsIFg+KC4uLm1hcHM6IEFycmF5PE1hcDxULCBYPj4pOiBNYXA8VCwgWD4ge1xuICBjb25zdCB1bmlvbk1hcCA9IG5ldyBNYXAoKTtcbiAgZm9yIChjb25zdCBtYXAgb2YgbWFwcykge1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIG1hcCkge1xuICAgICAgdW5pb25NYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdW5pb25NYXA7XG59XG4iXX0=