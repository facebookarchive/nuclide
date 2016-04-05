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
/* eslint-disable react/prop-types */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb2dyZXNzQmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7Ozs7QUFlN0IsSUFBTSxXQUFXLEdBQUcsU0FBZCxXQUFXLENBQUksS0FBSztTQUMvQix5REFBVSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQUFBQyxFQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxBQUFDLElBQUssS0FBSyxFQUFJO0NBQzVELENBQUMiLCJmaWxlIjoiUHJvZ3Jlc3NCYXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIC8qKlxuICAgKiBUaGUgcHJvZ3Jlc3MgdmFsdWUuIElmIG5vbmUgaXMgcHJvdmlkZWQsIHRoZSBQcm9ncmVzc2JhciB3aWxsIHJlbmRlciBpbiBgaW5kZWZpbml0ZWAgbW9kZS5cbiAgICogVXNlIGBpbmRlZmluaXRlIG1vZGVgIHRvIGluZGljYXRlIGFuIGluaXRpYWxpemluZyBwZXJpb2QsXG4gICAqIFByZWZlciB1c2luZyB0aGUgYExvYWRpbmdTcGlubmVyYCBjb21wb25lbnQgZm9yIHN1cmZhY2luZyBub24tZGV0ZXJtaW5pc3RpYyBwcm9ncmVzcy5cbiAgICovXG4gIHZhbHVlPzogbnVtYmVyO1xuICAvKiogRGV0ZXJtaW5lcyB0aGUgc2NhbGluZyBvZiBgdmFsdWVgLiBgbWluYCBpcyBpbXBsaWNpdGx5IHNldCB0byBgMGAuICovXG4gIG1heD86IG51bWJlcjtcbn1cblxuLyoqIEEgUHJvZ3Jlc3NiYXIgZm9yIHNob3dpbmcgZGV0ZXJtaW5pc3RpYyBwcm9ncmVzcy4gKi9cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBjb25zdCBQcm9ncmVzc0JhciA9IChwcm9wczogUHJvcHMpID0+IChcbiAgPHByb2dyZXNzIHZhbHVlPXtwcm9wcy52YWx1ZX0gbWF4PXtwcm9wcy5tYXh9IHsuLi5wcm9wc30gLz5cbik7XG4iXX0=