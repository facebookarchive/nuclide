Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.incompleteObservableFromPromise = incompleteObservableFromPromise;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

/**
 * Like `Rx.Observable.fromPromise`, but the resulting Observable sequence does not automatically
 * complete once the promise resolves.
 */
// $FlowIssue Rx.Observable.never should not influence merged type

function incompleteObservableFromPromise(promise) {
  return _rx2['default'].Observable.fromPromise(promise).merge(_rx2['default'].Observable.never());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9ic2VydmFibGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztrQkFXZSxJQUFJOzs7Ozs7Ozs7O0FBT1osU0FBUywrQkFBK0IsQ0FBSSxPQUFtQixFQUFvQjtBQUN4RixTQUFPLGdCQUFHLFVBQVUsQ0FDZixXQUFXLENBQUMsT0FBTyxDQUFDLENBQ3BCLEtBQUssQ0FBQyxnQkFBRyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztDQUNuQyIsImZpbGUiOiJvYnNlcnZhYmxlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbi8qKlxuICogTGlrZSBgUnguT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZWAsIGJ1dCB0aGUgcmVzdWx0aW5nIE9ic2VydmFibGUgc2VxdWVuY2UgZG9lcyBub3QgYXV0b21hdGljYWxseVxuICogY29tcGxldGUgb25jZSB0aGUgcHJvbWlzZSByZXNvbHZlcy5cbiAqL1xuLy8gJEZsb3dJc3N1ZSBSeC5PYnNlcnZhYmxlLm5ldmVyIHNob3VsZCBub3QgaW5mbHVlbmNlIG1lcmdlZCB0eXBlXG5leHBvcnQgZnVuY3Rpb24gaW5jb21wbGV0ZU9ic2VydmFibGVGcm9tUHJvbWlzZTxUPihwcm9taXNlOiBQcm9taXNlPFQ+KTogUnguT2JzZXJ2YWJsZTxUPiB7XG4gIHJldHVybiBSeC5PYnNlcnZhYmxlXG4gICAgICAuZnJvbVByb21pc2UocHJvbWlzZSlcbiAgICAgIC5tZXJnZShSeC5PYnNlcnZhYmxlLm5ldmVyKCkpO1xufVxuIl19