

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

module.exports = once;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9uY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQVdBLFNBQVMsSUFBSSxDQUFJLEVBQVcsRUFBVztBQUNyQyxNQUFJLEdBQUcsWUFBQSxDQUFDO0FBQ1IsU0FBTyxZQUFjOzs7QUFHbkIsUUFBSSxDQUFDLEVBQUUsRUFBRTtBQUNQLGFBQVEsR0FBRyxDQUFPO0tBQ25CLE1BQU07QUFDTCxTQUFHLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDaEMsUUFBRSxHQUFJLElBQUksQUFBTSxDQUFDO0FBQ2pCLGFBQU8sR0FBRyxDQUFDO0tBQ1o7R0FDRixDQUFDO0NBQ0g7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMiLCJmaWxlIjoib25jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmZ1bmN0aW9uIG9uY2U8VD4oZm46ICgpID0+IFQpOiAoKSA9PiBUIHtcbiAgbGV0IHJldDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCk6IFQge1xuICAgIC8vIFRoZSB0eXBlIGd5bW5hc3RpY3MgaGVyZSBhcmUgc28gYGZuYCBjYW4gYmVcbiAgICAvLyBnYXJiYWdlIGNvbGxlY3RlZCBvbmNlIHdlJ3ZlIHVzZWQgaXQuXG4gICAgaWYgKCFmbikge1xuICAgICAgcmV0dXJuIChyZXQ6IGFueSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldCA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBmbiA9IChudWxsOiBhbnkpO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb25jZTtcbiJdfQ==