Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.intersect = intersect;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _array = require('./array');

function intersect(a, b) {

  return new Set((0, _array.from)(a).filter(function (e) {
    return b.has(e);
  }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O3FCQVdtQixTQUFTOztBQUNyQixTQUFTLFNBQVMsQ0FBSSxDQUFTLEVBQUUsQ0FBUyxFQUFVOztBQUV6RCxTQUFPLElBQUksR0FBRyxDQUFDLGlCQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7V0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUFBLENBQUMsQ0FBQyxDQUFDO0NBQy9DIiwiZmlsZSI6InNldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7ZnJvbX0gZnJvbSAnLi9hcnJheSc7XG5leHBvcnQgZnVuY3Rpb24gaW50ZXJzZWN0PFQ+KGE6IFNldDxUPiwgYjogU2V0PFQ+KTogU2V0PFQ+IHtcblxuICByZXR1cm4gbmV3IFNldChmcm9tKGEpLmZpbHRlcihlID0+IGIuaGFzKGUpKSk7XG59XG4iXX0=