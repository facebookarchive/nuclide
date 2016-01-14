Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.from = from;
exports.find = find;
exports.findIndex = findIndex;
exports.remove = remove;
exports.equal = equal;
exports.compact = compact;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Static method as defined by
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from.
 * @param arrayLike An array-like or iterable object to convert to an array.
 * @param mapFn Map function to call on every element of the array.
 * @param thisArg Value to use as `this` when executing `mapFn`.
 */
// $FlowIssue

function from(_x, _x2, _x3) {
  var _again = true;

  _function: while (_again) {
    var arrayLike = _x,
        mapFn = _x2,
        thisArg = _x3;
    _again = false;

    if (mapFn === undefined) {
      mapFn = function (arg) {
        return arg;
      };
    }

    // Note that Symbol is not defined when running on Node 0.10.x.
    if (typeof Symbol !== 'undefined' && typeof arrayLike === 'object' && typeof arrayLike[Symbol.iterator] === 'function') {
      var array = [];
      // $FlowIssue: property @@iterator not found
      for (var value of arrayLike) {
        array.push(mapFn.call(thisArg, value));
      }
      return array;
    } else if (typeof arrayLike.next === 'function') {
      var array = [];
      // $FlowIssue: property @@iterator not found
      for (var value of arrayLike) {
        array.push(mapFn.call(thisArg, value));
      }
      return array;
    } else if ('length' in arrayLike) {
      return Array.prototype.map.call(arrayLike, mapFn, thisArg);
    } else if (arrayLike instanceof Set) {
      // Backup logic to handle the es6-collections case.
      _x = arrayLike.values();
      _x2 = mapFn;
      _x3 = thisArg;
      _again = true;
      array = value = array = value = undefined;
      continue _function;
    } else if (arrayLike instanceof Map) {
      // Backup logic to handle the es6-collections case.
      _x = arrayLike.entries();
      _x2 = mapFn;
      _x3 = thisArg;
      _again = true;
      array = value = array = value = undefined;
      continue _function;
    } else {
      throw Error(arrayLike + ' must be an array-like or iterable object to convert to an array.');
    }
  }
}

/**
 * Instance method of Array as defined by
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find.
 * Because we do not want to add elements to Array.prototype, we make this a
 * static method that takes the Array (which would be the receiver if it were an
 * instance method) as the first argument.
 * @param array The array to search.
 * @param Function to execute on each value in the array.
 * @param Object to use as `this` when executing `callback`.
 */

function find(array, callback, thisArg) {
  var resultIndex = findIndex(array, callback, thisArg);
  return resultIndex >= 0 ? array[resultIndex] : undefined;
}

/**
 * Instance method of Array as defined by
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex.
 * Because we do not want to add elements to Array.prototype, we make this a
 * static method that takes the Array (which would be the receiver if it were an
 * instance method) as the first argument.
 * @param array The array to search.
 * @param Function to execute on each value in the array.
 * @param Object to use as `this` when executing `callback`.
 */

function findIndex(array, callback, thisArg) {
  var result = -1;
  array.some(function (element, index, arr) {
    if (callback.call(thisArg, element, index, arr)) {
      result = index;
      return true;
    } else {
      return false;
    }
  });
  return result;
}

function remove(array, element) {
  var index = array.indexOf(element);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

function equal(array1, array2, equalComparator) {
  if (array1.length !== array2.length) {
    return false;
  }
  var equalFunction = equalComparator || function (a, b) {
    return a === b;
  };
  return array1.every(function (item1, i) {
    return equalFunction(item1, array2[i]);
  });
}

/**
 * Returns a copy of the input Array with all `null` and `undefined` values filtered out.
 * Allows Flow to typecheck the common `filter(x => x != null)` pattern.
 */

function compact(array) {
  var result = [];
  for (var elem of array) {
    if (elem != null) {
      result.push(elem);
    }
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,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S0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDckMsTUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO0FBQ2QsU0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7R0FDeEI7Q0FDRjs7QUFFTSxTQUFTLEtBQUssQ0FDbkIsTUFBZ0IsRUFDaEIsTUFBZ0IsRUFDaEIsZUFBeUMsRUFDaEM7QUFDVCxNQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLE1BQU0sRUFBRTtBQUNuQyxXQUFPLEtBQUssQ0FBQztHQUNkO0FBQ0QsTUFBTSxhQUFhLEdBQUcsZUFBZSxJQUFLLFVBQUMsQ0FBQyxFQUFNLENBQUM7V0FBUSxDQUFDLEtBQUssQ0FBQztHQUFBLEFBQUMsQ0FBQztBQUNwRSxTQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBQyxLQUFLLEVBQUUsQ0FBQztXQUFLLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQUEsQ0FBQyxDQUFDO0NBQ3BFOzs7Ozs7O0FBTU0sU0FBUyxPQUFPLENBQUksS0FBZ0IsRUFBWTtBQUNyRCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDbEIsT0FBSyxJQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7QUFDeEIsUUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2hCLFlBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbkI7R0FDRjtBQUNELFNBQU8sTUFBTSxDQUFDO0NBQ2YiLCJmaWxlIjoiYXJyYXkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKipcbiAqIFN0YXRpYyBtZXRob2QgYXMgZGVmaW5lZCBieVxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvZnJvbS5cbiAqIEBwYXJhbSBhcnJheUxpa2UgQW4gYXJyYXktbGlrZSBvciBpdGVyYWJsZSBvYmplY3QgdG8gY29udmVydCB0byBhbiBhcnJheS5cbiAqIEBwYXJhbSBtYXBGbiBNYXAgZnVuY3Rpb24gdG8gY2FsbCBvbiBldmVyeSBlbGVtZW50IG9mIHRoZSBhcnJheS5cbiAqIEBwYXJhbSB0aGlzQXJnIFZhbHVlIHRvIHVzZSBhcyBgdGhpc2Agd2hlbiBleGVjdXRpbmcgYG1hcEZuYC5cbiAqL1xuLy8gJEZsb3dJc3N1ZVxuZXhwb3J0IGZ1bmN0aW9uIGZyb208VCwgVT4oXG4gIGFycmF5TGlrZTogSXRlcmFibGUgfCB7bGVuZ3RoOiBudW1iZXJ9LFxuICBtYXBGbj86IChvcmlnaW5hbDogVCkgPT4gVSxcbiAgdGhpc0FyZz86IG1peGVkXG4pIDogQXJyYXk8VT4ge1xuICBpZiAobWFwRm4gPT09IHVuZGVmaW5lZCkge1xuICAgIG1hcEZuID0gZnVuY3Rpb24oYXJnKSB7IHJldHVybiBhcmc7IH07XG4gIH1cblxuICAvLyBOb3RlIHRoYXQgU3ltYm9sIGlzIG5vdCBkZWZpbmVkIHdoZW4gcnVubmluZyBvbiBOb2RlIDAuMTAueC5cbiAgaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgYXJyYXlMaWtlID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIGFycmF5TGlrZVtTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3QgYXJyYXkgPSBbXTtcbiAgICAvLyAkRmxvd0lzc3VlOiBwcm9wZXJ0eSBAQGl0ZXJhdG9yIG5vdCBmb3VuZFxuICAgIGZvciAoY29uc3QgdmFsdWUgb2YgYXJyYXlMaWtlKSB7XG4gICAgICBhcnJheS5wdXNoKG1hcEZuLmNhbGwodGhpc0FyZywgdmFsdWUpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xuICB9IGVsc2UgaWYgKHR5cGVvZiBhcnJheUxpa2UubmV4dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnN0IGFycmF5ID0gW107XG4gICAgLy8gJEZsb3dJc3N1ZTogcHJvcGVydHkgQEBpdGVyYXRvciBub3QgZm91bmRcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIGFycmF5TGlrZSkge1xuICAgICAgYXJyYXkucHVzaChtYXBGbi5jYWxsKHRoaXNBcmcsIHZhbHVlKSk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfSBlbHNlIGlmICgnbGVuZ3RoJyBpbiBhcnJheUxpa2UpIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGFycmF5TGlrZSwgbWFwRm4sIHRoaXNBcmcpO1xuICB9IGVsc2UgaWYgKGFycmF5TGlrZSBpbnN0YW5jZW9mIFNldCkge1xuICAgIC8vIEJhY2t1cCBsb2dpYyB0byBoYW5kbGUgdGhlIGVzNi1jb2xsZWN0aW9ucyBjYXNlLlxuICAgIHJldHVybiBmcm9tKGFycmF5TGlrZS52YWx1ZXMoKSwgbWFwRm4sIHRoaXNBcmcpO1xuICB9IGVsc2UgaWYgKGFycmF5TGlrZSBpbnN0YW5jZW9mIE1hcCkge1xuICAgIC8vIEJhY2t1cCBsb2dpYyB0byBoYW5kbGUgdGhlIGVzNi1jb2xsZWN0aW9ucyBjYXNlLlxuICAgIHJldHVybiBmcm9tKGFycmF5TGlrZS5lbnRyaWVzKCksIG1hcEZuLCB0aGlzQXJnKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBFcnJvcihgJHthcnJheUxpa2V9IG11c3QgYmUgYW4gYXJyYXktbGlrZSBvciBpdGVyYWJsZSBvYmplY3QgdG8gY29udmVydCB0byBhbiBhcnJheS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIEluc3RhbmNlIG1ldGhvZCBvZiBBcnJheSBhcyBkZWZpbmVkIGJ5XG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9maW5kLlxuICogQmVjYXVzZSB3ZSBkbyBub3Qgd2FudCB0byBhZGQgZWxlbWVudHMgdG8gQXJyYXkucHJvdG90eXBlLCB3ZSBtYWtlIHRoaXMgYVxuICogc3RhdGljIG1ldGhvZCB0aGF0IHRha2VzIHRoZSBBcnJheSAod2hpY2ggd291bGQgYmUgdGhlIHJlY2VpdmVyIGlmIGl0IHdlcmUgYW5cbiAqIGluc3RhbmNlIG1ldGhvZCkgYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuICogQHBhcmFtIGFycmF5IFRoZSBhcnJheSB0byBzZWFyY2guXG4gKiBAcGFyYW0gRnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBlYWNoIHZhbHVlIGluIHRoZSBhcnJheS5cbiAqIEBwYXJhbSBPYmplY3QgdG8gdXNlIGFzIGB0aGlzYCB3aGVuIGV4ZWN1dGluZyBgY2FsbGJhY2tgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZDxUPihcbiAgICBhcnJheTogQXJyYXk8VD4sXG4gICAgY2FsbGJhY2s6IChlbGVtZW50OiBULCBpbmRleDogbnVtYmVyLCBhcnJheTogQXJyYXk8VD4pID0+IG1peGVkLFxuICAgIHRoaXNBcmc/OiBtaXhlZCk6ID9UIHtcbiAgY29uc3QgcmVzdWx0SW5kZXggPSBmaW5kSW5kZXgoYXJyYXksIGNhbGxiYWNrLCB0aGlzQXJnKTtcbiAgcmV0dXJuIHJlc3VsdEluZGV4ID49IDAgPyBhcnJheVtyZXN1bHRJbmRleF0gOiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogSW5zdGFuY2UgbWV0aG9kIG9mIEFycmF5IGFzIGRlZmluZWQgYnlcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2ZpbmRJbmRleC5cbiAqIEJlY2F1c2Ugd2UgZG8gbm90IHdhbnQgdG8gYWRkIGVsZW1lbnRzIHRvIEFycmF5LnByb3RvdHlwZSwgd2UgbWFrZSB0aGlzIGFcbiAqIHN0YXRpYyBtZXRob2QgdGhhdCB0YWtlcyB0aGUgQXJyYXkgKHdoaWNoIHdvdWxkIGJlIHRoZSByZWNlaXZlciBpZiBpdCB3ZXJlIGFuXG4gKiBpbnN0YW5jZSBtZXRob2QpIGFzIHRoZSBmaXJzdCBhcmd1bWVudC5cbiAqIEBwYXJhbSBhcnJheSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICogQHBhcmFtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gZWFjaCB2YWx1ZSBpbiB0aGUgYXJyYXkuXG4gKiBAcGFyYW0gT2JqZWN0IHRvIHVzZSBhcyBgdGhpc2Agd2hlbiBleGVjdXRpbmcgYGNhbGxiYWNrYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbmRleDxUPihcbiAgICBhcnJheTogQXJyYXk8VD4sXG4gICAgY2FsbGJhY2s6IChlbGVtZW50OiBULCBpbmRleDogbnVtYmVyLCBhcnJheTogQXJyYXk8VD4pID0+IG1peGVkLFxuICAgIHRoaXNBcmc/OiBtaXhlZCk6IG51bWJlciB7XG4gIGxldCByZXN1bHQgPSAtMTtcbiAgYXJyYXkuc29tZShmdW5jdGlvbihlbGVtZW50OiBULCBpbmRleDogbnVtYmVyLCBhcnI6IEFycmF5PFQ+KSB7XG4gICAgaWYgKGNhbGxiYWNrLmNhbGwodGhpc0FyZywgZWxlbWVudCwgaW5kZXgsIGFycikpIHtcbiAgICAgIHJlc3VsdCA9IGluZGV4O1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlPFQ+KGFycmF5OiBBcnJheTxUPiwgZWxlbWVudDogVCk6IHZvaWQge1xuICBjb25zdCBpbmRleCA9IGFycmF5LmluZGV4T2YoZWxlbWVudCk7XG4gIGlmIChpbmRleCA+PSAwKSB7XG4gICAgYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWw8VD4oXG4gIGFycmF5MTogQXJyYXk8VD4sXG4gIGFycmF5MjogQXJyYXk8VD4sXG4gIGVxdWFsQ29tcGFyYXRvcj86IChhOiBULCBiOiBUKSA9PiBib29sZWFuLFxuKTogYm9vbGVhbiB7XG4gIGlmIChhcnJheTEubGVuZ3RoICE9PSBhcnJheTIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IGVxdWFsRnVuY3Rpb24gPSBlcXVhbENvbXBhcmF0b3IgfHwgKChhOiBULCAgYjogVCkgPT4gYSA9PT0gYik7XG4gIHJldHVybiBhcnJheTEuZXZlcnkoKGl0ZW0xLCBpKSA9PiBlcXVhbEZ1bmN0aW9uKGl0ZW0xLCBhcnJheTJbaV0pKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgY29weSBvZiB0aGUgaW5wdXQgQXJyYXkgd2l0aCBhbGwgYG51bGxgIGFuZCBgdW5kZWZpbmVkYCB2YWx1ZXMgZmlsdGVyZWQgb3V0LlxuICogQWxsb3dzIEZsb3cgdG8gdHlwZWNoZWNrIHRoZSBjb21tb24gYGZpbHRlcih4ID0+IHggIT0gbnVsbClgIHBhdHRlcm4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wYWN0PFQ+KGFycmF5OiBBcnJheTw/VD4pOiBBcnJheTxUPiB7XG4gIGNvbnN0IHJlc3VsdCA9IFtdO1xuICBmb3IgKGNvbnN0IGVsZW0gb2YgYXJyYXkpIHtcbiAgICBpZiAoZWxlbSAhPSBudWxsKSB7XG4gICAgICByZXN1bHQucHVzaChlbGVtKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==