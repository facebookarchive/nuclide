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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZU8sU0FBUyxLQUFLLEdBQTZDO0FBQ2hFLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7O29DQURFLElBQUk7QUFBSixRQUFJOzs7QUFFakMsT0FBSyxJQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDdEIsc0JBQTJCLEdBQUcsRUFBRTs7O1VBQXBCLEtBQUc7VUFBRSxNQUFLOztBQUNwQixjQUFRLENBQUMsR0FBRyxDQUFDLEtBQUcsRUFBRSxNQUFLLENBQUMsQ0FBQztLQUMxQjtHQUNGO0FBQ0QsU0FBTyxRQUFRLENBQUM7Q0FDakI7O0FBRU0sU0FBUyxNQUFNLENBQ3BCLEdBQWMsRUFDZCxRQUF1QyxFQUM1QjtBQUNYLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDM0IscUJBQTJCLEdBQUcsRUFBRTs7O1FBQXBCLEtBQUc7UUFBRSxPQUFLOztBQUNwQixRQUFJLFFBQVEsQ0FBQyxLQUFHLEVBQUUsT0FBSyxDQUFDLEVBQUU7QUFDeEIsY0FBUSxDQUFDLEdBQUcsQ0FBQyxLQUFHLEVBQUUsT0FBSyxDQUFDLENBQUM7S0FDMUI7R0FDRjtBQUNELFNBQU8sUUFBUSxDQUFDO0NBQ2pCIiwiZmlsZSI6Im1hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qKlxuICogTWVyZ2VzIGEgZ2l2ZW4gYXJndW1lbnRzIG9mIG1hcHMgaW50byBvbmUgTWFwLCB3aXRoIHRoZSBsYXRlc3QgbWFwc1xuICogb3ZlcnJpZGluZyB0aGUgdmFsdWVzIG9mIHRoZSBwcmlvciBtYXBzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5pb248VCwgWD4oLi4ubWFwczogQXJyYXk8TWFwPFQsIFg+Pik6IE1hcDxULCBYPiB7XG4gIGNvbnN0IHVuaW9uTWFwID0gbmV3IE1hcCgpO1xuICBmb3IgKGNvbnN0IG1hcCBvZiBtYXBzKSB7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgbWFwKSB7XG4gICAgICB1bmlvbk1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB1bmlvbk1hcDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlcjxULCBYPihcbiAgbWFwOiBNYXA8VCwgWD4sXG4gIHNlbGVjdG9yOiAoa2V5OiBULCB2YWx1ZTogWCkgPT4gYm9vbGVhbixcbik6IE1hcDxULCBYPiB7XG4gIGNvbnN0IHNlbGVjdGVkID0gbmV3IE1hcCgpO1xuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBtYXApIHtcbiAgICBpZiAoc2VsZWN0b3Ioa2V5LCB2YWx1ZSkpIHtcbiAgICAgIHNlbGVjdGVkLnNldChrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHNlbGVjdGVkO1xufVxuIl19