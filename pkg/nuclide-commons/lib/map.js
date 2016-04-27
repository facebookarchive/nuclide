Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.union = union;
exports.filter = filter;

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

      var _key2 = _ref2[0];
      var _value = _ref2[1];

      unionMap.set(_key2, _value);
    }
  }
  return unionMap;
}

function filter(map, selector) {
  var selected = new Map();
  for (var _ref43 of map) {
    var _ref42 = _slicedToArray(_ref43, 2);

    var _key3 = _ref42[0];
    var _value2 = _ref42[1];

    if (selector(_key3, _value2)) {
      selected.set(_key3, _value2);
    }
  }
  return selected;
}