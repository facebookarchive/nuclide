'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.











ensureArray = ensureArray;exports.



arrayRemove = arrayRemove;exports.






arrayEqual = arrayEqual;exports.


















arrayCompact = arrayCompact;exports.












arrayFlatten = arrayFlatten;exports.












arrayUnique = arrayUnique;exports.







arrayFindLastIndex = arrayFindLastIndex;exports.
















mapUnion = mapUnion;exports.









mapCompact = mapCompact;exports.









mapFilter = mapFilter;exports.












mapTransform = mapTransform;exports.










mapEqual = mapEqual;exports.
















mapGetWithDefault = mapGetWithDefault;exports.














areSetsEqual = areSetsEqual;exports.




every = every;exports.











setIntersect = setIntersect;exports.













setUnion = setUnion;exports.











setDifference = setDifference;exports.




















setFilter = setFilter;exports.
















isEmpty = isEmpty;exports.












keyMirror = keyMirror;exports.











collect = collect;exports.













objectFromPairs = objectFromPairs;exports.









objectMapValues = objectMapValues;exports.





















































































































objectValues = objectValues;exports.



objectEntries = objectEntries;exports.















objectFromMap = objectFromMap;exports.







concatIterators = concatIterators;exports.









someOfIterable = someOfIterable;exports.











findInIterable = findInIterable;exports.











filterIterable = filterIterable;exports.










mapIterable = mapIterable;exports.








takeIterable = takeIterable;exports.













range = range;exports.









firstOfIterable = firstOfIterable;exports.



iterableIsEmpty = iterableIsEmpty;exports.







iterableContains = iterableContains;exports.





count = count;exports.








isIterable = isIterable;exports.




insideOut = insideOut;exports.

























mapFromObject = mapFromObject;exports.



lastFromArray = lastFromArray;exports.



distinct = distinct; /**
                      * Copyright (c) 2017-present, Facebook, Inc.
                      * All rights reserved.
                      *
                      * This source code is licensed under the BSD-style license found in the
                      * LICENSE file in the root directory of this source tree. An additional grant
                      * of patent rights can be found in the PATENTS file in the same directory.
                      *
                      * 
                      * @format
                      */function ensureArray(x) {return Array.isArray(x) ? x : [x];}function arrayRemove(array, element) {const index = array.indexOf(element);if (index >= 0) {array.splice(index, 1);}}function arrayEqual(array1, array2, equalComparator) {if (array1 === array2) {return true;}if (array1.length !== array2.length) {return false;}const equalFunction = equalComparator || ((a, b) => a === b);return array1.every((item1, i) => equalFunction(item1, array2[i]));} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Returns a copy of the input Array with all `null` and `undefined` values filtered out.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Allows Flow to typecheck the common `filter(x => x != null)` pattern.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */function arrayCompact(array) {const result = [];for (const elem of array) {if (elem != null) {result.push(elem);}}return result;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Flattens an Array<Array<T>> into just an Array<T>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */function arrayFlatten(array) {const result = [];for (const subArray of array) {result.push(...subArray);}return result;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Removes duplicates from Array<T>.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Uses SameValueZero for equality purposes, which is like '===' except it deems
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * two NaNs equal. http://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */function arrayUnique(array) {return Array.from(new Set(array));} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Returns the last index in the input array that matches the predicate.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Returns -1 if no match is found.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */function arrayFindLastIndex(array, predicate, thisArg) {for (let i = array.length - 1; i >= 0; i--) {if (predicate.call(thisArg, array[i], i, array)) {return i;}}return -1;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Merges a given arguments of maps into one Map, with the latest maps
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * overriding the values of the prior maps.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */function mapUnion(...maps) {const unionMap = new Map();for (const map of maps) {for (const [key, value] of map) {unionMap.set(key, value);}}return unionMap;}function mapCompact(map) {const selected = new Map();for (const [key, value] of map) {if (value != null) {selected.set(key, value);}}return selected;}function mapFilter(map, selector) {const selected = new Map();for (const [key, value] of map) {if (selector(key, value)) {selected.set(key, value);}}return selected;}function mapTransform(src, transform) {const result = new Map();for (const [key, value] of src) {result.set(key, transform(value, key));}return result;}function mapEqual(map1, map2, equalComparator) {if (map1.size !== map2.size) {return false;}const equalFunction = equalComparator || ((a, b) => a === b);for (const [key1, value1] of map1) {if (!map2.has(key1) || !equalFunction(value1, map2.get(key1))) {return false;}}return true;}function mapGetWithDefault(map, key, default_) {if (map.has(key)) {// Cast through `any` since map.get's return is a maybe type. We can't just get the value and
    // check it against `null`, since null/undefined may inhabit V. We know this is safe since we
    // just checked that the map has the key.
    return map.get(key);} else {return default_;}}function areSetsEqual(a, b) {return a.size === b.size && every(a, element => b.has(element));} // Array.every but for any iterable.
function every(values, predicate) {for (const element of values) {if (!predicate(element)) {return false;}}return true;}function setIntersect(a, b) {return setFilter(a, e => b.has(e));}function setUnionTwo(a, b) {// Avoids the extra Array allocations that `new Set([...a, ...b])` would incur. Some quick tests
  // indicate it would be about 60% slower.
  const result = new Set(a);b.forEach(x => {result.add(x);});return result;}function setUnion(...sets) {if (sets.length < 1) {return new Set();}const setReducer = (accumulator, current) => {return setUnionTwo(accumulator, current);};return sets.reduce(setReducer);}function setDifference(a, b, hash_) {if (a.size === 0) {return new Set();} else if (b.size === 0) {return new Set(a);}const result = new Set();const hash = hash_ || (x => x);const bHashes = hash_ == null ? b : new Set(Array.from(b.values()).map(hash));a.forEach(value => {if (!bHashes.has(hash(value))) {result.add(value);}});return result;}function setFilter(set, predicate) {const out = new Set();for (const item of set) {if (predicate(item)) {out.add(item);}}return out;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * O(1)-check if a given object is empty (has no properties, inherited or not)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */function isEmpty(obj) {for (const key in obj) {return false;}return true;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * Constructs an enumeration with keys equal to their value.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * e.g. keyMirror({a: null, b: null}) => {a: 'a', b: 'b'}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * Based off the equivalent function in www.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   */function keyMirror(obj) {const ret = {};Object.keys(obj).forEach(key => {ret[key] = key;});return ret;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Given an array of [key, value] pairs, construct a map where the values for
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * each key are collected into an array of values, in order.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */function collect(pairs) {const result = new Map();for (const pair of pairs) {const [k, v] = pair;let list = result.get(k);if (list == null) {list = [];result.set(k, list);}list.push(v);}return result;}function objectFromPairs(iterable) {const result = {};for (const [key, value] of iterable) {result[key] = value;}return result;}function objectMapValues(object, project) {const result = {};Object.keys(object).forEach(key => {result[key] = project(object[key], key);});return result;}class MultiMap {// Invariant: no empty sets. They should be removed instead.
  constructor() {this._map = new Map();this.size = 0;} /*
                                                        * Returns the set of values associated with the given key. Do not mutate the given set. Copy it
                                                        * if you need to store it past the next operation on this MultiMap.
                                                        */ // TODO may be worth defining a getter but no setter, to mimic Map. But please just behave and
  // don't mutate this from outside this class.
  //
  // Invariant: equal to the sum of the sizes of all the sets contained in this._map
  /* The total number of key-value bindings contained */get(key) {const set = this._map.get(key);if (set == null) {return new Set();}return set;} /*
                                                                                                                                                   * Mimics the Map.prototype.set interface. Deliberately did not choose "set" as the name since the
                                                                                                                                                   * implication is that it removes the previous binding.
                                                                                                                                                   */add(key, value) {let set = this._map.get(key);if (set == null) {set = new Set();this._map.set(key, set);}if (!set.has(value)) {set.add(value);this.size++;}return this;} /*
                                                                                                                                                                                                                                                                                                                               * Mimics the Map.prototype.set interface. Replaces the previous binding with new values.
                                                                                                                                                                                                                                                                                                                               */set(key, values) {this.deleteAll(key);const newSet = new Set(values);if (newSet.size !== 0) {this._map.set(key, newSet);this.size += newSet.size;}} /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Deletes a single binding. Returns true iff the binding existed.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */delete(key, value) {const set = this.get(key);const didRemove = set.delete(value);if (set.size === 0) {this._map.delete(key);}if (didRemove) {this.size--;}return didRemove;} /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * Deletes all bindings associated with the given key. Returns true iff any bindings were deleted.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       */deleteAll(key) {const set = this.get(key);this.size -= set.size;return this._map.delete(key);}clear() {this._map.clear();this.size = 0;}has(key, value) {return this.get(key).has(value);}hasAny(key) {return this._map.has(key);}*values() {for (const set of this._map.values()) {yield* set;}}forEach(callback) {this._map.forEach((values, key) => values.forEach(value => callback(value, key, this)));}}exports.MultiMap = MultiMap;function objectValues(obj) {return Object.keys(obj).map(key => obj[key]);}function objectEntries(obj) {if (obj == null) {throw new TypeError();}const entries = [];for (const key in obj) {if (obj.hasOwnProperty(key) && Object.prototype.propertyIsEnumerable.call(obj, key)) {entries.push([key, obj[key]]);}}return entries;}function objectFromMap(map) {const obj = {};map.forEach((v, k) => {obj[k] = v;});return obj;}function* concatIterators(...iterators) {for (const iterator of iterators) {for (const element of iterator) {yield element;}}}function someOfIterable(iterable, predicate) {for (const element of iterable) {if (predicate(element)) {return true;}}return false;}function findInIterable(iterable, predicate) {for (const element of iterable) {if (predicate(element)) {return element;}}return null;}function* filterIterable(iterable, predicate) {for (const element of iterable) {if (predicate(element)) {yield element;}}}function* mapIterable(iterable, projectorFn) {for (const element of iterable) {yield projectorFn(element);}}function* takeIterable(iterable, limit) {let i = 0;for (const element of iterable) {if (++i > limit) {break;}yield element;}} // Return an iterable of the numbers start (inclusive) through stop (exclusive)
function* range(start, stop, step = 1) {for (let i = start; i < stop; i += step) {yield i;}}function firstOfIterable(iterable) {return findInIterable(iterable, () => true);}function iterableIsEmpty(iterable) {// eslint-disable-next-line no-unused-vars
  for (const element of iterable) {return false;}return true;}function iterableContains(iterable, value) {return !iterableIsEmpty(filterIterable(iterable, element => element === value));}function count(iterable) {let size = 0; // eslint-disable-next-line no-unused-vars
  for (const element of iterable) {size++;}return size;}function isIterable(obj) {return typeof obj[Symbol.iterator] === 'function';} // Traverse an array from the inside out, starting at the specified index.
function* insideOut(arr, startingIndex) {if (arr.length === 0) {return;}let i = startingIndex == null ? Math.floor(arr.length / 2) : Math.min(arr.length, Math.max(0, startingIndex));let j = i - 1;while (i < arr.length || j >= 0) {if (i < arr.length) {yield [arr[i], i];i++;}if (j >= 0) {yield [arr[j], j];j--;}}}function mapFromObject(obj) {return new Map(objectEntries(obj));}function lastFromArray(arr) {return arr[arr.length - 1];}function distinct(array, keyFn) {if (keyFn == null) {return Array.from(new Set(array));}const seenKeys = new Set();return array.filter(elem => {const key = keyFn(elem);if (seenKeys.has(key)) {return false;}seenKeys.add(key);return true;});}class DefaultMap extends Map {constructor(factory, iterable) {super(iterable);this._factory = factory;}get(key) {if (!this.has(key)) {const value = this._factory();this.set(key, value);return value;} // If the key is present we must have a value of type V.
    return super.get(key);}}exports.DefaultMap = DefaultMap;