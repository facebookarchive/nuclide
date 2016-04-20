Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.registerProvider = registerProvider;
exports.activate = activate;

var providerInstance = undefined;
function getProviderInstance() {
  if (providerInstance == null) {
    var _require = require('./HackSymbolProvider');

    var HackSymbolProvider = _require.HackSymbolProvider;

    providerInstance = _extends({}, HackSymbolProvider);
  }
  return providerInstance;
}

function registerProvider() {
  return getProviderInstance();
}

function activate(state) {}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFhQSxJQUFJLGdCQUEyQixZQUFBLENBQUM7QUFDaEMsU0FBUyxtQkFBbUIsR0FBYTtBQUN2QyxNQUFJLGdCQUFnQixJQUFJLElBQUksRUFBRTttQkFDQyxPQUFPLENBQUMsc0JBQXNCLENBQUM7O1FBQXJELGtCQUFrQixZQUFsQixrQkFBa0I7O0FBQ3pCLG9CQUFnQixnQkFBTyxrQkFBa0IsQ0FBQyxDQUFDO0dBQzVDO0FBQ0QsU0FBTyxnQkFBZ0IsQ0FBQztDQUN6Qjs7QUFFTSxTQUFTLGdCQUFnQixHQUFhO0FBQzNDLFNBQU8sbUJBQW1CLEVBQUUsQ0FBQztDQUM5Qjs7QUFFTSxTQUFTLFFBQVEsQ0FBQyxLQUFjLEVBQUUsRUFDeEMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtQcm92aWRlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1xdWljay1vcGVuLWludGVyZmFjZXMnO1xuXG5sZXQgcHJvdmlkZXJJbnN0YW5jZTogP1Byb3ZpZGVyO1xuZnVuY3Rpb24gZ2V0UHJvdmlkZXJJbnN0YW5jZSgpOiBQcm92aWRlciB7XG4gIGlmIChwcm92aWRlckluc3RhbmNlID09IG51bGwpIHtcbiAgICBjb25zdCB7SGFja1N5bWJvbFByb3ZpZGVyfSA9IHJlcXVpcmUoJy4vSGFja1N5bWJvbFByb3ZpZGVyJyk7XG4gICAgcHJvdmlkZXJJbnN0YW5jZSA9IHsuLi5IYWNrU3ltYm9sUHJvdmlkZXJ9O1xuICB9XG4gIHJldHVybiBwcm92aWRlckluc3RhbmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJQcm92aWRlcigpOiBQcm92aWRlciB7XG4gIHJldHVybiBnZXRQcm92aWRlckluc3RhbmNlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCkge1xufVxuIl19