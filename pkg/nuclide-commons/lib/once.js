Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.once = once;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function once(fn) {
  var ret = undefined;
  return function () {
    // The type gymnastics here are so `fn` can be
    // garbage collected once we've used it.
    if (!fn) {
      return ret;
    } else {
      ret = fn.apply(this, arguments);
      fn = null;
      return ret;
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9uY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQVdPLFNBQVMsSUFBSSxDQUFJLEVBQVcsRUFBVztBQUM1QyxNQUFJLEdBQUcsWUFBQSxDQUFDO0FBQ1IsU0FBTyxZQUFjOzs7QUFHbkIsUUFBSSxDQUFDLEVBQUUsRUFBRTtBQUNQLGFBQVEsR0FBRyxDQUFPO0tBQ25CLE1BQU07QUFDTCxTQUFHLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDaEMsUUFBRSxHQUFJLElBQUksQUFBTSxDQUFDO0FBQ2pCLGFBQU8sR0FBRyxDQUFDO0tBQ1o7R0FDRixDQUFDO0NBQ0giLCJmaWxlIjoib25jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBvbmNlPFQ+KGZuOiAoKSA9PiBUKTogKCkgPT4gVCB7XG4gIGxldCByZXQ7XG4gIHJldHVybiBmdW5jdGlvbigpOiBUIHtcbiAgICAvLyBUaGUgdHlwZSBneW1uYXN0aWNzIGhlcmUgYXJlIHNvIGBmbmAgY2FuIGJlXG4gICAgLy8gZ2FyYmFnZSBjb2xsZWN0ZWQgb25jZSB3ZSd2ZSB1c2VkIGl0LlxuICAgIGlmICghZm4pIHtcbiAgICAgIHJldHVybiAocmV0OiBhbnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXQgPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgZm4gPSAobnVsbDogYW55KTtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICB9O1xufVxuIl19