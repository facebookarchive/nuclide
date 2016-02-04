

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * O(1)-check if a given object is empty (has no properties, inherited or not)
 */
function isEmpty(obj) {
  for (var key in obj) {
    // eslint-disable-line no-unused-vars
    return false;
  }
  return true;
}

function copyProperties(src, dest) {
  for (var key in src) {
    dest[key] = src[key];
  }
}

/**
 * Modeled after Object.assign():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */
function assign(target) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  sources.forEach(function (source) {
    return copyProperties(source, target);
  });
  return target;
}

/**
 * Constructs an enumeration with keys equal to their value.
 * e.g. keyMirror({a: null, b: null}) => {a: 'a', b: 'b'}
 *
 * Based off the equivalent function in www.
 */
function keyMirror(obj) {
  var ret = {};
  Object.keys(obj).forEach(function (key) {
    ret[key] = key;
  });
  return ret;
}

module.exports = {
  assign: assign,
  isEmpty: isEmpty,
  keyMirror: keyMirror
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iamVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBY0EsU0FBUyxPQUFPLENBQUMsR0FBVyxFQUFXO0FBQ3JDLE9BQUssSUFBTSxHQUFHLElBQUksR0FBRyxFQUFFOztBQUNyQixXQUFPLEtBQUssQ0FBQztHQUNkO0FBQ0QsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFRCxTQUFTLGNBQWMsQ0FBQyxHQUFXLEVBQUUsSUFBWSxFQUFRO0FBQ3ZELE9BQUssSUFBTSxHQUFHLElBQUksR0FBRyxFQUFFO0FBQ3JCLFFBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDdEI7Q0FDRjs7Ozs7O0FBTUQsU0FBUyxNQUFNLENBQUMsTUFBYyxFQUFxQztvQ0FBaEMsT0FBTztBQUFQLFdBQU87OztBQUN4QyxTQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTtXQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO0dBQUEsQ0FBQyxDQUFDO0FBQzFELFNBQU8sTUFBTSxDQUFDO0NBQ2Y7Ozs7Ozs7O0FBUUQsU0FBUyxTQUFTLENBQUMsR0FBVyxFQUFVO0FBQ3RDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNmLFFBQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQzlCLE9BQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7R0FDaEIsQ0FBQyxDQUFDO0FBQ0gsU0FBTyxHQUFHLENBQUM7Q0FDWjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsUUFBTSxFQUFOLE1BQU07QUFDTixTQUFPLEVBQVAsT0FBTztBQUNQLFdBQVMsRUFBVCxTQUFTO0NBQ1YsQ0FBQyIsImZpbGUiOiJvYmplY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKipcbiAqIE8oMSktY2hlY2sgaWYgYSBnaXZlbiBvYmplY3QgaXMgZW1wdHkgKGhhcyBubyBwcm9wZXJ0aWVzLCBpbmhlcml0ZWQgb3Igbm90KVxuICovXG5mdW5jdGlvbiBpc0VtcHR5KG9iajogT2JqZWN0KTogYm9vbGVhbiB7XG4gIGZvciAoY29uc3Qga2V5IGluIG9iaikgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBjb3B5UHJvcGVydGllcyhzcmM6IE9iamVjdCwgZGVzdDogT2JqZWN0KTogdm9pZCB7XG4gIGZvciAoY29uc3Qga2V5IGluIHNyYykge1xuICAgIGRlc3Rba2V5XSA9IHNyY1trZXldO1xuICB9XG59XG5cbi8qKlxuICogTW9kZWxlZCBhZnRlciBPYmplY3QuYXNzaWduKCk6XG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduXG4gKi9cbmZ1bmN0aW9uIGFzc2lnbih0YXJnZXQ6IE9iamVjdCwgLi4uc291cmNlczogQXJyYXk8T2JqZWN0Pik6IE9iamVjdCB7XG4gIHNvdXJjZXMuZm9yRWFjaChzb3VyY2UgPT4gY29weVByb3BlcnRpZXMoc291cmNlLCB0YXJnZXQpKTtcbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGFuIGVudW1lcmF0aW9uIHdpdGgga2V5cyBlcXVhbCB0byB0aGVpciB2YWx1ZS5cbiAqIGUuZy4ga2V5TWlycm9yKHthOiBudWxsLCBiOiBudWxsfSkgPT4ge2E6ICdhJywgYjogJ2InfVxuICpcbiAqIEJhc2VkIG9mZiB0aGUgZXF1aXZhbGVudCBmdW5jdGlvbiBpbiB3d3cuXG4gKi9cbmZ1bmN0aW9uIGtleU1pcnJvcihvYmo6IE9iamVjdCk6IE9iamVjdCB7XG4gIGNvbnN0IHJldCA9IHt9O1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goa2V5ID0+IHtcbiAgICByZXRba2V5XSA9IGtleTtcbiAgfSk7XG4gIHJldHVybiByZXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3NpZ24sXG4gIGlzRW1wdHksXG4gIGtleU1pcnJvcixcbn07XG4iXX0=