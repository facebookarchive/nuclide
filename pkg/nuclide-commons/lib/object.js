Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isEmpty = isEmpty;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iamVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFjTyxTQUFTLE9BQU8sQ0FBQyxHQUFXLEVBQVc7QUFDNUMsT0FBSyxJQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUU7O0FBQ3JCLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7QUFDRCxTQUFPLElBQUksQ0FBQztDQUNiOzs7Ozs7Ozs7QUFRTSxTQUFTLFNBQVMsQ0FBQyxHQUFXLEVBQVU7QUFDN0MsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2YsUUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDOUIsT0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztHQUNoQixDQUFDLENBQUM7QUFDSCxTQUFPLEdBQUcsQ0FBQztDQUNaIiwiZmlsZSI6Im9iamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qKlxuICogTygxKS1jaGVjayBpZiBhIGdpdmVuIG9iamVjdCBpcyBlbXB0eSAoaGFzIG5vIHByb3BlcnRpZXMsIGluaGVyaXRlZCBvciBub3QpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VtcHR5KG9iajogT2JqZWN0KTogYm9vbGVhbiB7XG4gIGZvciAoY29uc3Qga2V5IGluIG9iaikgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYW4gZW51bWVyYXRpb24gd2l0aCBrZXlzIGVxdWFsIHRvIHRoZWlyIHZhbHVlLlxuICogZS5nLiBrZXlNaXJyb3Ioe2E6IG51bGwsIGI6IG51bGx9KSA9PiB7YTogJ2EnLCBiOiAnYid9XG4gKlxuICogQmFzZWQgb2ZmIHRoZSBlcXVpdmFsZW50IGZ1bmN0aW9uIGluIHd3dy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtleU1pcnJvcihvYmo6IE9iamVjdCk6IE9iamVjdCB7XG4gIGNvbnN0IHJldCA9IHt9O1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goa2V5ID0+IHtcbiAgICByZXRba2V5XSA9IGtleTtcbiAgfSk7XG4gIHJldHVybiByZXQ7XG59XG4iXX0=