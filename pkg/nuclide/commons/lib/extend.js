

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _object = require('./object');

function immutableExtend() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return _object.assign.apply(undefined, [{}].concat(args));
}

module.exports = {
  immutableExtend: immutableExtend
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV4dGVuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3NCQVdxQixVQUFVOztBQUUvQixTQUFTLGVBQWUsR0FBaUM7b0NBQTdCLElBQUk7QUFBSixRQUFJOzs7QUFDOUIsU0FBTyxpQ0FBTyxFQUFFLFNBQUssSUFBSSxFQUFDLENBQUM7Q0FDNUI7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLGlCQUFlLEVBQWYsZUFBZTtDQUNoQixDQUFDIiwiZmlsZSI6ImV4dGVuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7YXNzaWdufSBmcm9tICcuL29iamVjdCc7XG5cbmZ1bmN0aW9uIGltbXV0YWJsZUV4dGVuZCguLi5hcmdzOiBBcnJheTxPYmplY3Q+KTogT2JqZWN0IHtcbiAgcmV0dXJuIGFzc2lnbih7fSwgLi4uYXJncyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpbW11dGFibGVFeHRlbmQsXG59O1xuIl19