Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isEmpty = isEmpty;
exports.assign = assign;
exports.keyMirror = keyMirror;

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
  if (src == null) {
    return;
  }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iamVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBY08sU0FBUyxPQUFPLENBQUMsR0FBVyxFQUFXO0FBQzVDLE9BQUssSUFBTSxHQUFHLElBQUksR0FBRyxFQUFFOztBQUNyQixXQUFPLEtBQUssQ0FBQztHQUNkO0FBQ0QsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFRCxTQUFTLGNBQWMsQ0FBQyxHQUFZLEVBQUUsSUFBWSxFQUFRO0FBQ3hELE1BQUksR0FBRyxJQUFJLElBQUksRUFBRTtBQUNmLFdBQU87R0FDUjtBQUNELE9BQUssSUFBTSxHQUFHLElBQUksR0FBRyxFQUFFO0FBQ3JCLFFBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDdEI7Q0FDRjs7Ozs7OztBQU1NLFNBQVMsTUFBTSxDQUFDLE1BQWMsRUFBc0M7b0NBQWpDLE9BQU87QUFBUCxXQUFPOzs7QUFDL0MsU0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU07V0FBSSxjQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztHQUFBLENBQUMsQ0FBQztBQUMxRCxTQUFPLE1BQU0sQ0FBQztDQUNmOzs7Ozs7Ozs7QUFRTSxTQUFTLFNBQVMsQ0FBQyxHQUFXLEVBQVU7QUFDN0MsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2YsUUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDOUIsT0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztHQUNoQixDQUFDLENBQUM7QUFDSCxTQUFPLEdBQUcsQ0FBQztDQUNaIiwiZmlsZSI6Im9iamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qKlxuICogTygxKS1jaGVjayBpZiBhIGdpdmVuIG9iamVjdCBpcyBlbXB0eSAoaGFzIG5vIHByb3BlcnRpZXMsIGluaGVyaXRlZCBvciBub3QpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5KG9iajogT2JqZWN0KTogYm9vbGVhbiB7XG4gIGZvciAoY29uc3Qga2V5IGluIG9iaikgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBjb3B5UHJvcGVydGllcyhzcmM6ID9PYmplY3QsIGRlc3Q6IE9iamVjdCk6IHZvaWQge1xuICBpZiAoc3JjID09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgaW4gc3JjKSB7XG4gICAgZGVzdFtrZXldID0gc3JjW2tleV07XG4gIH1cbn1cblxuLyoqXG4gKiBNb2RlbGVkIGFmdGVyIE9iamVjdC5hc3NpZ24oKTpcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQ6IE9iamVjdCwgLi4uc291cmNlczogQXJyYXk8P09iamVjdD4pOiBPYmplY3Qge1xuICBzb3VyY2VzLmZvckVhY2goc291cmNlID0+IGNvcHlQcm9wZXJ0aWVzKHNvdXJjZSwgdGFyZ2V0KSk7XG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhbiBlbnVtZXJhdGlvbiB3aXRoIGtleXMgZXF1YWwgdG8gdGhlaXIgdmFsdWUuXG4gKiBlLmcuIGtleU1pcnJvcih7YTogbnVsbCwgYjogbnVsbH0pID0+IHthOiAnYScsIGI6ICdiJ31cbiAqXG4gKiBCYXNlZCBvZmYgdGhlIGVxdWl2YWxlbnQgZnVuY3Rpb24gaW4gd3d3LlxuICovXG5leHBvcnQgZnVuY3Rpb24ga2V5TWlycm9yKG9iajogT2JqZWN0KTogT2JqZWN0IHtcbiAgY29uc3QgcmV0ID0ge307XG4gIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChrZXkgPT4ge1xuICAgIHJldFtrZXldID0ga2V5O1xuICB9KTtcbiAgcmV0dXJuIHJldDtcbn1cbiJdfQ==