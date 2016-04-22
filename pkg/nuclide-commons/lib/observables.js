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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

/**
 * Like `Rx.Observable.fromPromise`, but the resulting Observable sequence does not automatically
 * complete once the promise resolves.
 */
// $FlowIssue Rx.Observable.never should not influence merged type

function incompleteObservableFromPromise(promise) {
  return _reactivexRxjs2['default'].Observable.fromPromise(promise).merge(_reactivexRxjs2['default'].Observable.never());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9ic2VydmFibGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs2QkFXZSxpQkFBaUI7Ozs7Ozs7Ozs7QUFPekIsU0FBUywrQkFBK0IsQ0FBSSxPQUFtQixFQUFvQjtBQUN4RixTQUFPLDJCQUFHLFVBQVUsQ0FDZixXQUFXLENBQUMsT0FBTyxDQUFDLENBQ3BCLEtBQUssQ0FBQywyQkFBRyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztDQUNuQyIsImZpbGUiOiJvYnNlcnZhYmxlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBSeCBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuXG4vKipcbiAqIExpa2UgYFJ4Lk9ic2VydmFibGUuZnJvbVByb21pc2VgLCBidXQgdGhlIHJlc3VsdGluZyBPYnNlcnZhYmxlIHNlcXVlbmNlIGRvZXMgbm90IGF1dG9tYXRpY2FsbHlcbiAqIGNvbXBsZXRlIG9uY2UgdGhlIHByb21pc2UgcmVzb2x2ZXMuXG4gKi9cbi8vICRGbG93SXNzdWUgUnguT2JzZXJ2YWJsZS5uZXZlciBzaG91bGQgbm90IGluZmx1ZW5jZSBtZXJnZWQgdHlwZVxuZXhwb3J0IGZ1bmN0aW9uIGluY29tcGxldGVPYnNlcnZhYmxlRnJvbVByb21pc2U8VD4ocHJvbWlzZTogUHJvbWlzZTxUPik6IFJ4Lk9ic2VydmFibGU8VD4ge1xuICByZXR1cm4gUnguT2JzZXJ2YWJsZVxuICAgICAgLmZyb21Qcm9taXNlKHByb21pc2UpXG4gICAgICAubWVyZ2UoUnguT2JzZXJ2YWJsZS5uZXZlcigpKTtcbn1cbiJdfQ==