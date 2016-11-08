'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.arrayRemove = arrayRemove;
exports.arrayEqual = arrayEqual;
exports.arrayCompact = arrayCompact;
exports.arrayFindLastIndex = arrayFindLastIndex;
exports.mapUnion = mapUnion;
exports.mapFilter = mapFilter;
exports.mapEqual = mapEqual;
exports.areSetsEqual = areSetsEqual;
exports.every = every;
exports.setIntersect = setIntersect;
exports.setDifference = setDifference;
exports.isEmpty = isEmpty;
exports.keyMirror = keyMirror;
exports.collect = collect;
exports.objectEntries = objectEntries;
exports.objectFromMap = objectFromMap;
exports.concatIterators = concatIterators;

function arrayRemove(array, element) {
  const index = array.indexOf(element);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

function arrayEqual(array1, array2, equalComparator) {
  if (array1.length !== array2.length) {
    return false;
  }
  const equalFunction = equalComparator || ((a, b) => a === b);
  return array1.every((item1, i) => equalFunction(item1, array2[i]));
}

/**
 * Returns a copy of the input Array with all `null` and `undefined` values filtered out.
 * Allows Flow to typecheck the common `filter(x => x != null)` pattern.
 */
function arrayCompact(array) {
  const result = [];
  for (const elem of array) {
    if (elem != null) {
      result.push(elem);
    }
  }
  return result;
}

/**
 * Returns the last index in the input array that matches the predicate.
 * Returns -1 if no match is found.
 */
function arrayFindLastIndex(array, predicate, thisArg) {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate.call(thisArg, array[i], i, array)) {
      return i;
    }
  }
  return -1;
}

/**
 * Merges a given arguments of maps into one Map, with the latest maps
 * overriding the values of the prior maps.
 */
function mapUnion() {
  const unionMap = new Map();

  for (var _len = arguments.length, maps = Array(_len), _key = 0; _key < _len; _key++) {
    maps[_key] = arguments[_key];
  }

  for (const map of maps) {
    for (const _ref of map) {
      var _ref2 = _slicedToArray(_ref, 2);

      const key = _ref2[0];
      const value = _ref2[1];

      unionMap.set(key, value);
    }
  }
  return unionMap;
}

function mapFilter(map, selector) {
  const selected = new Map();
  for (const _ref3 of map) {
    var _ref4 = _slicedToArray(_ref3, 2);

    const key = _ref4[0];
    const value = _ref4[1];

    if (selector(key, value)) {
      selected.set(key, value);
    }
  }
  return selected;
}

function mapEqual(map1, map2) {
  if (map1.size !== map2.size) {
    return false;
  }
  for (const _ref5 of map1) {
    var _ref6 = _slicedToArray(_ref5, 2);

    const key1 = _ref6[0];
    const value1 = _ref6[1];

    if (map2.get(key1) !== value1) {
      return false;
    }
  }
  return true;
}

function areSetsEqual(a, b) {
  return a.size === b.size && every(a, element => b.has(element));
}

// Array.every but for any iterable.
function every(values, predicate) {
  for (const element of values) {
    if (!predicate(element)) {
      return false;
    }
  }
  return true;
}

function setIntersect(a, b) {
  return new Set(Array.from(a).filter(e => b.has(e)));
}

function setDifference(a, b, hash_) {
  if (a.size === 0) {
    return new Set();
  } else if (b.size === 0) {
    return new Set(a);
  }
  const result = new Set();
  const hash = hash_ || (x => x);
  const bHashes = hash_ == null ? b : new Set(Array.from(b.values()).map(hash));
  a.forEach(value => {
    if (!bHashes.has(hash(value))) {
      result.add(value);
    }
  });
  return result;
}

/**
 * O(1)-check if a given object is empty (has no properties, inherited or not)
 */
function isEmpty(obj) {
  for (const key in obj) {
    return false;
  }
  return true;
}

/**
 * Constructs an enumeration with keys equal to their value.
 * e.g. keyMirror({a: null, b: null}) => {a: 'a', b: 'b'}
 *
 * Based off the equivalent function in www.
 */
function keyMirror(obj) {
  const ret = {};
  Object.keys(obj).forEach(key => {
    ret[key] = key;
  });
  return ret;
}

/**
 * Given an array of [key, value] pairs, construct a map where the values for
 * each key are collected into an array of values, in order.
 */
function collect(pairs) {
  const result = new Map();
  for (const pair of pairs) {
    var _pair = _slicedToArray(pair, 2);

    const k = _pair[0],
          v = _pair[1];

    let list = result.get(k);
    if (list == null) {
      list = [];
      result.set(k, list);
    }
    list.push(v);
  }
  return result;
}

let MultiMap = exports.MultiMap = class MultiMap {
  // Invariant: no empty sets. They should be removed instead.
  constructor() {
    this._map = new Map();
    this.size = 0;
  }

  /*
   * Returns the set of values associated with the given key. Do not mutate the given set. Copy it
   * if you need to store it past the next operation on this MultiMap.
   */


  // TODO may be worth defining a getter but no setter, to mimic Map. But please just behave and
  // don't mutate this from outside this class.
  //
  // Invariant: equal to the sum of the sizes of all the sets contained in this._map
  /* The total number of key-value bindings contained */
  get(key) {
    const set = this._map.get(key);
    if (set == null) {
      return new Set();
    }
    return set;
  }

  /*
   * Mimics the Map.prototype.set interface. Deliberately did not choose "set" as the name since the
   * implication is that it removes the previous binding.
   */
  add(key, value) {
    let set = this._map.get(key);
    if (set == null) {
      set = new Set();
      this._map.set(key, set);
    }
    if (!set.has(value)) {
      set.add(value);
      this.size++;
    }
    return this;
  }

  /*
   * Mimics the Map.prototype.set interface. Replaces the previous binding with new values.
   */
  set(key, values) {
    this.deleteAll(key);
    const newSet = new Set(values);
    if (newSet.size !== 0) {
      this._map.set(key, newSet);
      this.size += newSet.size;
    }
  }

  /*
   * Deletes a single binding. Returns true iff the binding existed.
   */
  delete(key, value) {
    const set = this.get(key);
    const didRemove = set.delete(value);
    if (set.size === 0) {
      this._map.delete(key);
    }
    if (didRemove) {
      this.size--;
    }
    return didRemove;
  }

  /*
   * Deletes all bindings associated with the given key. Returns true iff any bindings were deleted.
   */
  deleteAll(key) {
    const set = this.get(key);
    this.size -= set.size;
    return this._map.delete(key);
  }

  clear() {
    this._map.clear();
    this.size = 0;
  }

  has(key, value) {
    return this.get(key).has(value);
  }

  hasAny(key) {
    return this._map.has(key);
  }

  *values() {
    for (const set of this._map.values()) {
      yield* set;
    }
  }

  forEach(callback) {
    this._map.forEach((values, key) => values.forEach(value => callback(value, key, this)));
  }
};
function objectEntries(obj) {
  if (obj == null) {
    throw new TypeError();
  }
  const entries = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && Object.prototype.propertyIsEnumerable.call(obj, key)) {
      entries.push([key, obj[key]]);
    }
  }
  return entries;
}

function objectFromMap(map) {
  const obj = {};
  map.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
}

function* concatIterators() {
  for (var _len2 = arguments.length, iterators = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    iterators[_key2] = arguments[_key2];
  }

  for (const iterator of iterators) {
    for (const element of iterator) {
      yield element;
    }
  }
}