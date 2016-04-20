Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

/** A Progressbar for showing deterministic progress. */
var ProgressBar = function ProgressBar(props) {
  return _reactForAtom.React.createElement('progress', _extends({ value: props.value, max: props.max }, props));
};
exports.ProgressBar = ProgressBar;

/**
 * The progress value. If none is provided, the Progressbar will render in `indefinite` mode.
 * Use `indefinite mode` to indicate an initializing period,
 * Prefer using the `LoadingSpinner` component for surfacing non-deterministic progress.
 */

/** Determines the scaling of `value`. `min` is implicitly set to `0`. */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb2dyZXNzQmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7OztBQWM3QixJQUFNLFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBSSxLQUFLO1NBQy9CLHlEQUFVLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxBQUFDLEVBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEFBQUMsSUFBSyxLQUFLLEVBQUk7Q0FDNUQsQ0FBQyIsImZpbGUiOiJQcm9ncmVzc0Jhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBQcm9wcyA9IHtcbiAgLyoqXG4gICAqIFRoZSBwcm9ncmVzcyB2YWx1ZS4gSWYgbm9uZSBpcyBwcm92aWRlZCwgdGhlIFByb2dyZXNzYmFyIHdpbGwgcmVuZGVyIGluIGBpbmRlZmluaXRlYCBtb2RlLlxuICAgKiBVc2UgYGluZGVmaW5pdGUgbW9kZWAgdG8gaW5kaWNhdGUgYW4gaW5pdGlhbGl6aW5nIHBlcmlvZCxcbiAgICogUHJlZmVyIHVzaW5nIHRoZSBgTG9hZGluZ1NwaW5uZXJgIGNvbXBvbmVudCBmb3Igc3VyZmFjaW5nIG5vbi1kZXRlcm1pbmlzdGljIHByb2dyZXNzLlxuICAgKi9cbiAgdmFsdWU/OiBudW1iZXI7XG4gIC8qKiBEZXRlcm1pbmVzIHRoZSBzY2FsaW5nIG9mIGB2YWx1ZWAuIGBtaW5gIGlzIGltcGxpY2l0bHkgc2V0IHRvIGAwYC4gKi9cbiAgbWF4PzogbnVtYmVyO1xufTtcblxuLyoqIEEgUHJvZ3Jlc3NiYXIgZm9yIHNob3dpbmcgZGV0ZXJtaW5pc3RpYyBwcm9ncmVzcy4gKi9cbmV4cG9ydCBjb25zdCBQcm9ncmVzc0JhciA9IChwcm9wczogUHJvcHMpID0+IChcbiAgPHByb2dyZXNzIHZhbHVlPXtwcm9wcy52YWx1ZX0gbWF4PXtwcm9wcy5tYXh9IHsuLi5wcm9wc30gLz5cbik7XG4iXX0=