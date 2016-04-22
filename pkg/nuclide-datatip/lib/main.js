Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.provideDatatipService = provideDatatipService;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _DatatipManager = require('./DatatipManager');

var datatipManager = null;

function activate(state) {
  if (datatipManager == null) {
    datatipManager = new _DatatipManager.DatatipManager();
  }
}

function provideDatatipService() {
  (0, _assert2['default'])(datatipManager);
  return datatipManager;
}

function deactivate() {
  if (datatipManager != null) {
    datatipManager.dispose();
    datatipManager = null;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBWXNCLFFBQVE7Ozs7OEJBRUQsa0JBQWtCOztBQUUvQyxJQUFJLGNBQStCLEdBQUcsSUFBSSxDQUFDOztBQUVwQyxTQUFTLFFBQVEsQ0FBQyxLQUFXLEVBQVE7QUFDMUMsTUFBSSxjQUFjLElBQUksSUFBSSxFQUFFO0FBQzFCLGtCQUFjLEdBQUcsb0NBQW9CLENBQUM7R0FDdkM7Q0FDRjs7QUFFTSxTQUFTLHFCQUFxQixHQUFtQjtBQUN0RCwyQkFBVSxjQUFjLENBQUMsQ0FBQztBQUMxQixTQUFPLGNBQWMsQ0FBQztDQUN2Qjs7QUFFTSxTQUFTLFVBQVUsR0FBRztBQUMzQixNQUFJLGNBQWMsSUFBSSxJQUFJLEVBQUU7QUFDMUIsa0JBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN6QixrQkFBYyxHQUFHLElBQUksQ0FBQztHQUN2QjtDQUNGIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHtEYXRhdGlwTWFuYWdlcn0gZnJvbSAnLi9EYXRhdGlwTWFuYWdlcic7XG5cbmxldCBkYXRhdGlwTWFuYWdlcjogP0RhdGF0aXBNYW5hZ2VyID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKHN0YXRlOiA/YW55KTogdm9pZCB7XG4gIGlmIChkYXRhdGlwTWFuYWdlciA9PSBudWxsKSB7XG4gICAgZGF0YXRpcE1hbmFnZXIgPSBuZXcgRGF0YXRpcE1hbmFnZXIoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZURhdGF0aXBTZXJ2aWNlKCk6IERhdGF0aXBNYW5hZ2VyIHtcbiAgaW52YXJpYW50KGRhdGF0aXBNYW5hZ2VyKTtcbiAgcmV0dXJuIGRhdGF0aXBNYW5hZ2VyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgaWYgKGRhdGF0aXBNYW5hZ2VyICE9IG51bGwpIHtcbiAgICBkYXRhdGlwTWFuYWdlci5kaXNwb3NlKCk7XG4gICAgZGF0YXRpcE1hbmFnZXIgPSBudWxsO1xuICB9XG59XG4iXX0=